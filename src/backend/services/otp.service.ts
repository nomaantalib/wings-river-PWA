import { AppContext, D1Database } from '../types';
import { ensureTables } from '../utils/db';

export class OtpService {
  static async sendOtp(c: AppContext, phone: string, db: D1Database | null) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Valid 10-digit mobile number required', status: 400 };
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000;

    if (db) {
      try {
        await ensureTables(db);
        await db
          .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
          .bind(`otp_${cleanPhone}`, JSON.stringify({ otp, expires_at: expiresAt }))
          .run()
          .catch(() => {});
      } catch (e) {}
    }

    const authKey = c.env?.MSG91_AUTH_KEY;
    const templateId = c.env?.MSG91_TEMPLATE_ID;
    let smsSent = false;

    if (authKey && templateId) {
      try {
        const res = await fetch(
          `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${cleanPhone}&authkey=${authKey}&otp=${otp}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json', authkey: authKey } }
        );
        const data: any = await res.json().catch(() => ({}));
        if (data?.type !== 'error') smsSent = true;
      } catch (e) {}
    }

    return {
      success: true,
      message: `OTP sent to +91 ${cleanPhone.slice(0, 2)}****${cleanPhone.slice(-4)}`,
      sms_sent: smsSent,
      ...(!smsSent && c.env?.ENVIRONMENT !== 'production' ? { dev_otp: otp } : {})
    };
  }

  static async verifyOtp(c: AppContext, phone: string, otp: string, db: D1Database | null) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();

    if (cleanPhone.length !== 10 || cleanOtp.length !== 6) {
      return { success: false, error: 'Valid 10-digit phone and 6-digit OTP required', status: 400 };
    }

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
        }
      } catch (e) {}
    }

    if (db) {
      try {
        const row = await db
          .prepare('SELECT value FROM settings WHERE key = ?')
          .bind(`otp_${cleanPhone}`)
          .first() as any;

        if (row?.value) {
          const stored = JSON.parse(row.value);
          if (stored.otp !== cleanOtp) {
            return { success: false, error: 'Invalid OTP', status: 400 };
          }
          if (Date.now() > stored.expires_at) {
            return { success: false, error: 'OTP expired', status: 400 };
          }
        }
      } catch (e) {}
    }

    return { success: true, message: 'OTP verified successfully' };
  }
}
