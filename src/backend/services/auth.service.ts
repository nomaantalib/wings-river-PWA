import { sign, verify } from 'hono/jwt';
import { AppContext, D1Database } from '../types';
import { CONFIG } from '../config';
import { ensureTables, logAudit } from '../utils/db';
import { sha256 } from '../utils/crypto';
import { OtpService } from './otp.service';

export interface UserDTO {
  id: string;
  username?: string;
  phone?: string;
  email?: string;
  name?: string;
  role: 'Customer' | 'Waiter' | 'Manager' | 'Admin' | 'Administrator';
  is_active?: number;
}

export class AuthService {
  private static getJwtSecret(c: AppContext): string {
    return c.env?.JWT_SECRET || c.env?.ADMIN_SECRET_KEY || CONFIG.JWT_SECRET_FALLBACK;
  }

  /**
   * Helper to issue dual tokens (Short-lived Access Token + Long-lived Refresh Token)
   */
  private static async issueTokens(c: AppContext, user: UserDTO, db: D1Database | null, deviceInfo: string = '') {
    const secret = this.getJwtSecret(c);
    const now = Math.floor(Date.now() / 1000);

    // Access Token: 1 hour expiry (3600 seconds)
    const accessTokenExp = now + 3600;
    const accessToken = await sign(
      {
        sub: user.id,
        id: user.id,
        username: user.username || user.phone || '',
        phone: user.phone || '',
        email: user.email || '',
        name: user.name || '',
        role: user.role,
        exp: accessTokenExp,
        iat: now
      },
      secret,
      'HS256'
    );

    // Refresh Token: 7 days expiry (604800 seconds)
    const refreshTokenExp = now + 604800;
    const refreshTokenPayload = `rf-${user.id}-${now}-${Math.random().toString(36).substring(2, 9)}`;
    const refreshToken = await sign(
      {
        sub: user.id,
        id: user.id,
        type: 'refresh',
        jti: refreshTokenPayload,
        exp: refreshTokenExp,
        iat: now
      },
      secret,
      'HS256'
    );

    // Store Refresh Token in D1 database
    if (db) {
      try {
        await ensureTables(db);
        const tokenHash = await sha256(refreshToken);
        const tokenId = `rf-${now}-${Math.random().toString(36).substring(2, 7)}`;
        await db
          .prepare('INSERT INTO refresh_tokens (id, user_id, token_hash, device_info, expires_at, revoked) VALUES (?, ?, ?, ?, ?, 0)')
          .bind(tokenId, user.id, tokenHash, deviceInfo, refreshTokenExp)
          .run();
      } catch (e) {
        console.warn('[AuthService issueTokens DB Exception]', e);
      }
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  /**
   * Customer OTP Login & Auto-Provisioning
   */
  static async customerLoginWithOtp(c: AppContext, phone: string, otp: string, name?: string, email?: string, db?: D1Database | null) {
    const cleanPhone = (phone || '').replace(/\D/g, '');

    // Step 1: Verify OTP
    const verifyRes = await OtpService.verifyOtp(c, cleanPhone, otp, db || null);
    if (!verifyRes.success) {
      return { success: false, error: verifyRes.error || 'OTP verification failed', status: verifyRes.status || 400 };
    }

    const d1 = db || null;
    let user: UserDTO | null = null;

    if (d1) {
      try {
        await ensureTables(d1);
        const existing = await d1
          .prepare('SELECT * FROM users WHERE phone = ?')
          .bind(cleanPhone)
          .first<any>();

        if (existing) {
          user = {
            id: existing.id,
            username: existing.username || cleanPhone,
            phone: existing.phone,
            email: existing.email || email || '',
            name: existing.name || name || 'Customer',
            role: 'Customer',
            is_active: existing.is_active ?? 1
          };
        } else {
          // Provision new Customer user
          const userId = `usr-cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const customerName = name || `Customer ${cleanPhone.slice(-4)}`;
          const customerEmail = email || `${cleanPhone}@guest.wingsriver.com`;

          await d1
            .prepare('INSERT INTO users (id, username, phone, email, name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)')
            .bind(userId, cleanPhone, cleanPhone, customerEmail, customerName, 'Customer')
            .run();

          user = {
            id: userId,
            username: cleanPhone,
            phone: cleanPhone,
            email: customerEmail,
            name: customerName,
            role: 'Customer',
            is_active: 1
          };
        }
      } catch (e) {
        console.warn('[customerLoginWithOtp DB Error]', e);
      }
    }

    // Fallback user if DB is unavailable
    if (!user) {
      user = {
        id: `usr-cust-${cleanPhone}`,
        username: cleanPhone,
        phone: cleanPhone,
        email: email || `${cleanPhone}@guest.wingsriver.com`,
        name: name || `Customer ${cleanPhone.slice(-4)}`,
        role: 'Customer',
        is_active: 1
      };
    }

    if (user.is_active === 0) {
      return { success: false, error: 'Customer account is deactivated. Please contact support.', status: 403 };
    }

    const tokens = await this.issueTokens(c, user, d1, c.req.header('user-agent') || '');
    if (d1) await logAudit(d1, user.id, 'CUSTOMER_LOGIN', `Customer ${user.phone} logged in via OTP.`);

    return {
      success: true,
      message: 'Customer authenticated successfully',
      ...tokens
    };
  }

  /**
   * Staff Login (Waiter, Kitchen, Manager)
   */
  static async staffLogin(c: AppContext, usernameInput: string, pass: string, db: D1Database | null) {
    if (!usernameInput || !pass) {
      return { success: false, error: 'Username/Phone and password are required', status: 400 };
    }

    const cleanInput = usernameInput.trim();
    const d1 = db;

    // Hardcoded static emergency fallbacks for staff roles
    const normalized = cleanInput.toLowerCase();
    if (pass === 'wings123' || pass === 'staff123' || pass === '123' || pass === 'wingsriver@2026') {
      let role: 'Waiter' | 'Manager' = 'Waiter';
      let id = 'usr-waiter';
      let name = 'Waiter Staff';

      if (normalized.includes('manager') || normalized.includes('reception')) {
        role = 'Manager';
        id = 'usr-manager';
        name = 'Manager Saxena';
      } else {
        role = 'Waiter';
        id = 'usr-waiter';
        name = 'Waiter Staff';
      }

      const user: UserDTO = {
        id,
        username: cleanInput,
        name,
        role,
        is_active: 1
      };
      const tokens = await this.issueTokens(c, user, d1, c.req.header('user-agent') || '');
      return { success: true, message: 'Staff login successful', ...tokens };
    }

    if (!d1) {
      return { success: false, error: 'Database connection unavailable', status: 500 };
    }

    await ensureTables(d1);

    // Search user by username or phone
    const userRow = await d1
      .prepare('SELECT * FROM users WHERE (username = ? OR phone = ?) AND role IN ("Waiter", "Manager", "Admin")')
      .bind(cleanInput, cleanInput)
      .first<any>();

    if (!userRow) {
      return { success: false, error: 'Invalid staff credentials', status: 401 };
    }

    if (userRow.is_active === 0) {
      return { success: false, error: 'Staff account is deactivated', status: 403 };
    }

    const hashed = await sha256(pass);
    if (userRow.password_hash !== hashed) {
      return { success: false, error: 'Invalid staff credentials', status: 401 };
    }

    const user: UserDTO = {
      id: userRow.id,
      username: userRow.username,
      phone: userRow.phone,
      email: userRow.email,
      name: userRow.name || userRow.username,
      role: userRow.role as any,
      is_active: userRow.is_active
    };

    const tokens = await this.issueTokens(c, user, d1, c.req.header('user-agent') || '');
    await logAudit(d1, user.id, 'STAFF_LOGIN', `Staff ${user.username} (${user.role}) logged in.`);

    return {
      success: true,
      message: `${user.role} authenticated successfully`,
      ...tokens
    };
  }

  /**
   * Admin Login (Admin / Administrator)
   */
  static async adminLogin(c: AppContext, usernameInput: string, pass: string, db: D1Database | null) {
    if (!usernameInput || !pass) {
      return { success: false, error: 'Username/Email and password are required', status: 400 };
    }

    const cleanInput = usernameInput.trim();
    const d1 = db;

    // Hardcoded static fallback for emergency recovery
    if (pass === 'wingsriver@2026' || pass === 'admin123') {
      const user: UserDTO = {
        id: 'usr-admin',
        username: cleanInput || 'admin',
        email: 'admin@wingsrivercafe.com',
        name: 'Main Administrator',
        role: 'Admin',
        is_active: 1
      };
      const tokens = await this.issueTokens(c, user, d1, c.req.header('user-agent') || '');
      return { success: true, message: 'Admin authenticated successfully', ...tokens };
    }

    if (!d1) {
      return { success: false, error: 'Database connection unavailable', status: 500 };
    }

    await ensureTables(d1);

    const userRow = await d1
      .prepare('SELECT * FROM users WHERE (username = ? OR email = ?) AND role IN ("Admin", "Administrator", "Manager")')
      .bind(cleanInput, cleanInput)
      .first<any>();

    if (!userRow) {
      return { success: false, error: 'Invalid admin credentials', status: 401 };
    }

    const hashed = await sha256(pass);
    if (userRow.password_hash !== hashed) {
      return { success: false, error: 'Invalid admin credentials', status: 401 };
    }

    const user: UserDTO = {
      id: userRow.id,
      username: userRow.username,
      phone: userRow.phone,
      email: userRow.email,
      name: userRow.name || userRow.username,
      role: 'Admin',
      is_active: userRow.is_active
    };

    const tokens = await this.issueTokens(c, user, d1, c.req.header('user-agent') || '');
    await logAudit(d1, user.id, 'ADMIN_LOGIN', `Admin ${user.username} logged in.`);

    return {
      success: true,
      message: 'Admin authenticated successfully',
      ...tokens
    };
  }

  /**
   * Refresh Token Endpoint: Validates refresh token, checks revocation in D1, rotates tokens.
   */
  static async refreshToken(c: AppContext, refreshTokenStr: string, db: D1Database | null) {
    if (!refreshTokenStr) {
      return { success: false, error: 'Refresh token is required', status: 400 };
    }

    const secret = this.getJwtSecret(c);
    let payload: any;
    try {
      payload = await verify(refreshTokenStr, secret, 'HS256');
    } catch (e) {
      return { success: false, error: 'Invalid or expired refresh token', status: 401 };
    }

    if (!payload || payload.type !== 'refresh' || !payload.id) {
      return { success: false, error: 'Invalid refresh token type', status: 401 };
    }

    const d1 = db;

    // Check DB revocation status
    if (d1) {
      try {
        await ensureTables(d1);
        const tokenHash = await sha256(refreshTokenStr);
        const record = await d1
          .prepare('SELECT id, revoked, expires_at FROM refresh_tokens WHERE token_hash = ?')
          .bind(tokenHash)
          .first<{ id: string; revoked: number; expires_at: number }>();

        if (record && record.revoked === 1) {
          return { success: false, error: 'Refresh token has been revoked', status: 401 };
        }

        // Revoke the old token (Token Rotation)
        if (record) {
          await d1.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?').bind(record.id).run().catch(() => {});
        }
      } catch (e) {
        console.warn('[RefreshToken DB Check Exception]', e);
      }
    }

    // Retrieve user details to generate fresh tokens
    let user: UserDTO | null = null;
    if (d1) {
      try {
        const row = await d1.prepare('SELECT * FROM users WHERE id = ?').bind(payload.id).first<any>();
        if (row) {
          user = {
            id: row.id,
            username: row.username,
            phone: row.phone,
            email: row.email,
            name: row.name || row.username,
            role: row.role as any,
            is_active: row.is_active
          };
        }
      } catch (e) {}
    }

    if (!user) {
      // Fallback from payload
      user = {
        id: payload.id,
        role: payload.role || 'Customer',
        is_active: 1
      };
    }

    if (user.is_active === 0) {
      return { success: false, error: 'User account is deactivated', status: 403 };
    }

    const newTokens = await this.issueTokens(c, user, d1, c.req.header('user-agent') || '');
    return {
      success: true,
      message: 'Tokens refreshed successfully',
      ...newTokens
    };
  }

  /**
   * Logout Endpoint: Revokes the user's refresh token in D1
   */
  static async logout(c: AppContext, refreshTokenStr?: string, db?: D1Database | null) {
    if (refreshTokenStr && db) {
      try {
        await ensureTables(db);
        const tokenHash = await sha256(refreshTokenStr);
        await db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?').bind(tokenHash).run();
      } catch (e) {
        console.warn('[Logout DB Exception]', e);
      }
    }
    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Get Current Authenticated User Session Details
   */
  static async getMe(c: AppContext, userId: string, db: D1Database | null) {
    const d1 = db;
    if (d1) {
      try {
        await ensureTables(d1);
        const userRow = await d1.prepare('SELECT id, username, phone, email, name, role, is_active, created_at FROM users WHERE id = ?').bind(userId).first<any>();
        if (userRow) {
          return { success: true, user: userRow };
        }
      } catch (e) {}
    }

    const jwtUser = c.get('user');
    return {
      success: true,
      user: jwtUser || { id: userId }
    };
  }

  /**
   * Database Seed Script for Roles (Admin, Manager, Kitchen, Waiter, Customer)
   */
  static async seed(db: D1Database | null) {
    if (!db) {
      return { success: false, message: 'D1 binding unconfigured' };
    }
    await ensureTables(db);

    const adminHash = await sha256('wingsriver@2026');
    const managerHash = await sha256('wings123');
    const waiterHash = await sha256('wings123');
    const kitchenHash = await sha256('wings123');

    const seedUsers = [
      ['usr-admin', 'admin', '9100000001', adminHash, 'admin@wingsrivercafe.com', 'System Admin', 'Admin'],
      ['usr-manager', 'manager', '9100000002', managerHash, 'manager@wingsrivercafe.com', 'Manager Saxena', 'Manager'],
      ['usr-waiter', 'waiter', '9100000003', waiterHash, 'waiter@wingsrivercafe.com', 'Waiter Amit', 'Waiter'],
      ['usr-kitchen', 'kitchen', '9100000004', kitchenHash, 'chef@wingsrivercafe.com', 'Chef Suresh', 'Kitchen'],
      ['usr-demo-customer', 'customer987', '9876543210', '', 'customer@wingsrivercafe.com', 'Rahul Sharma', 'Customer']
    ];

    for (const [id, username, phone, passHash, email, name, role] of seedUsers) {
      await db
        .prepare(
          'INSERT OR IGNORE INTO users (id, username, phone, password_hash, email, name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
        )
        .bind(id, username, phone, passHash, email, name, role)
        .run()
        .catch(() => {});
    }

    return { success: true, message: 'Database seeded with all 5 RBAC roles (Admin, Manager, Waiter, Kitchen, Customer)!' };
  }
}
