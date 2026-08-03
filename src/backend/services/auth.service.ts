import { sign } from 'hono/jwt';
import { AppContext, D1Database } from '../types';
import { CONFIG } from '../config';
import { ensureTables, logAudit } from '../utils/db';
import { sha256 } from '../utils/crypto';

export class AuthService {
  static async login(c: AppContext, username: string, pass: string, db: D1Database | null) {
    if (!username || !pass) {
      return { success: false, error: 'Username and password required', status: 400 };
    }

    const secret = c.env?.JWT_SECRET || c.env?.ADMIN_SECRET_KEY || CONFIG.JWT_SECRET_FALLBACK;

    // Hardcoded static fallback for emergency recovery
    if (pass === 'wingsriver@2026' || pass === 'admin123') {
      const token = await sign(
        { id: 'usr-admin', username, role: 'Administrator', exp: Math.floor(Date.now() / 1000) + 86400 },
        secret
      );
      return {
        success: true,
        token,
        user: { id: 'usr-admin', username, role: 'Administrator' }
      };
    }

    if (!db) {
      return { success: false, error: 'Database unconfigured', status: 500 };
    }

    await ensureTables(db);

    const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first() as any;
    if (!user) {
      return { success: false, error: 'Invalid credentials', status: 401 };
    }

    const hashed = await sha256(pass);
    if (user.password_hash !== hashed) {
      return { success: false, error: 'Invalid credentials', status: 401 };
    }

    const token = await sign(
      { id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 86400 },
      secret
    );

    await logAudit(db, user.id, 'LOGIN', `User ${username} logged in.`);

    return {
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role, email: user.email }
    };
  }

  static async seed(db: D1Database | null) {
    if (!db) {
      return { success: false, message: 'D1 binding unconfigured' };
    }
    await ensureTables(db);
    const adminHash = await sha256('wingsriver@2026');
    const waiterHash = await sha256('wings123');

    await db
      .prepare('INSERT OR IGNORE INTO users (id,username,password_hash,email,role) VALUES (?,?,?,?,?)')
      .bind('usr-admin', 'admin', adminHash, 'admin@wingsrivercafe.com', 'Administrator')
      .run();

    await db
      .prepare('INSERT OR IGNORE INTO users (id,username,password_hash,email,role) VALUES (?,?,?,?,?)')
      .bind('usr-waiter', 'waiter', waiterHash, 'waiter@wingsrivercafe.com', 'Waiter')
      .run();

    return { success: true, message: 'Database seeded successfully!' };
  }
}
