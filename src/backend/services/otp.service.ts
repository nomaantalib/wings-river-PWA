import { AppContext, D1Database } from '../types';
import { ensureTables } from '../utils/db';

export class OtpService {
  /**
   * Generates and stores a rate-limited, expiring 6-digit OTP code for a 10-digit mobile number.
   */
  static async sendOtp(c: AppContext, phone: string, db: D1Database | null) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Valid 10-digit mobile number required', status: 400 };
    }

    const now = Date.now();
    const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
    const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
    const MAX_SENDS_PER_WINDOW = 3;

    if (db) {
      try {
        await ensureTables(db);

        // Rate-limit check: check how many OTPs generated for this phone in the last 10 minutes
        const windowStart = now - RATE_LIMIT_WINDOW_MS;
        const recentRows = await db
          .prepare('SELECT COUNT(*) as cnt FROM otps WHERE phone = ? AND created_at > ?')
          .bind(cleanPhone, windowStart)
          .first<{ cnt: number }>();

        if (recentRows && recentRows.cnt >= MAX_SENDS_PER_WINDOW) {
          return {
            success: false,
            error: 'Too many OTP requests. Please wait 10 minutes before requesting again.',
            status: 429
          };
        }
      } catch (e) {
        console.warn('[OtpService DB RateLimit Exception]', e);
      }
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = now + OTP_EXPIRY_MS;
    const otpId = `otp-${now}-${Math.random().toString(36).substring(2, 7)}`;

    if (db) {
      try {
        // Delete old pending OTP records for this phone number
        await db.prepare('DELETE FROM otps WHERE phone = ?').bind(cleanPhone).run().catch(() => {});

        // Insert new OTP record with attempts = 0
        await db
          .prepare('INSERT INTO otps (id, phone, otp_code, attempts, max_attempts, expires_at, created_at) VALUES (?, ?, ?, 0, 5, ?, ?)')
          .bind(otpId, cleanPhone, otpCode, expiresAt, now)
          .run();
      } catch (e) {
        console.warn('[OtpService DB Insert Exception]', e);
      }
    }

    const authKey = c.env?.MSG91_AUTH_KEY;
    const templateId = c.env?.MSG91_TEMPLATE_ID;
    let smsSent = false;

    if (authKey && templateId) {
      try {
        const res = await fetch(
          `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${cleanPhone}&authkey=${authKey}&otp=${otpCode}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json', authkey: authKey } }
        );
        const data: any = await res.json().catch(() => ({}));
        if (data?.type !== 'error') smsSent = true;
      } catch (e) {
        console.warn('[MSG91 Send Error]', e);
      }
    }

    return {
      success: true,
      message: `OTP sent to +91 ${cleanPhone.slice(0, 2)}****${cleanPhone.slice(-4)}`,
      sms_sent: smsSent,
      expires_in_seconds: 300,
      ...(!smsSent || c.env?.ENVIRONMENT !== 'production' ? { dev_otp: otpCode } : {})
    };
  }

  /**
   * Verifies the OTP code against D1 store and MSG91 fallback, enforcing max retry attempts and expiration.
   */
  static async verifyOtp(c: AppContext, phone: string, otp: string, db: D1Database | null) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();

    if (cleanPhone.length !== 10 || cleanOtp.length !== 6) {
      return { success: false, error: 'Valid 10-digit phone and 6-digit OTP required', status: 400 };
    }

    const now = Date.now();

    // Check D1 OTP database
    if (db) {
      try {
        await ensureTables(db);
        const row = await db
          .prepare('SELECT id, otp_code, attempts, max_attempts, expires_at FROM otps WHERE phone = ? ORDER BY created_at DESC LIMIT 1')
          .bind(cleanPhone)
          .first<{ id: string; otp_code: string; attempts: number; max_attempts: number; expires_at: number }>();

        if (!row) {
          return { success: false, error: 'No active OTP request found. Please request a new OTP.', status: 400 };
        }

        if (now > row.expires_at) {
          await db.prepare('DELETE FROM otps WHERE id = ?').bind(row.id).run().catch(() => {});
          return { success: false, error: 'OTP has expired. Please request a new OTP.', status: 400 };
        }

        if (row.attempts >= row.max_attempts) {
          await db.prepare('DELETE FROM otps WHERE id = ?').bind(row.id).run().catch(() => {});
          return {
            success: false,
            error: 'Maximum OTP verification attempts exceeded. Please request a new OTP.',
            status: 429
          };
        }

        if (row.otp_code !== cleanOtp) {
          // Increment failed attempts
          await db
            .prepare('UPDATE otps SET attempts = attempts + 1 WHERE id = ?')
            .bind(row.id)
            .run()
            .catch(() => {});

          const remainingAttempts = row.max_attempts - (row.attempts + 1);
          return {
            success: false,
            error: `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`,
            status: 400
          };
        }

        // Successfully verified — remove OTP record from DB
        await db.prepare('DELETE FROM otps WHERE id = ?').bind(row.id).run().catch(() => {});
        return { success: true, message: 'OTP verified successfully' };

      } catch (e) {
        console.warn('[OtpService DB Verify Exception]', e);
      }
    }

    // MSG91 external fallback verification if configured
    const authKey = c.env?.MSG91_AUTH_KEY;
    if (authKey) {
      try {
        const res = await fetch(`https://control.msg91.com/api/v5/otp/verify?otp=${cleanOtp}&mobile=91${cleanPhone}`, {
          method: 'GET',
          headers: { authkey: authKey }
        });
        if (res.ok) {
          const data: any = await res.json().catch(() => null);
          if (data?.type === 'error') {
            return { success: false, error: data.message || 'Invalid or expired OTP', status: 400 };
          }
          return { success: true, message: 'OTP verified successfully' };
        }
      } catch (e) {}
    }

    // Fallback for dev mode when DB or MSG91 are not configured
    if (c.env?.ENVIRONMENT !== 'production') {
      return { success: true, message: 'OTP verified in dev fallback mode' };
    }

    return { success: false, error: 'OTP verification failed', status: 400 };
  }
}
