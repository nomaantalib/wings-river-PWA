import { D1Database } from '../types';
import { ensureTables } from '../utils/db';

export class SettingsService {
  static async getSettings(db: D1Database | null) {
    if (!db) return { success: true, data: {} };
    try {
      await ensureTables(db);
      const row = await db.prepare("SELECT value FROM settings WHERE key = 'site_settings'").first() as any;
      if (row?.value) {
        try { return { success: true, data: JSON.parse(row.value) }; } catch { return { success: true, data: {} }; }
      }
      return { success: true, data: {} };
    } catch (e) {
      return { success: true, data: {} };
    }
  }

  static async saveSettings(db: D1Database | null, body: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const settingsVal = body.value ?? body;
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('site_settings', ?)").bind(JSON.stringify(settingsVal)).run();
    return { success: true };
  }

  static async getHero(db: D1Database | null) {
    if (!db) return { success: true, data: null };
    try {
      await ensureTables(db);
      const row = await db.prepare("SELECT value FROM settings WHERE key = 'wings_hero'").first() as any;
      return { success: true, data: row?.value ? JSON.parse(row.value) : null };
    } catch (e) {
      return { success: true, data: null };
    }
  }

  static async saveHero(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('wings_hero', ?)").bind(JSON.stringify(data)).run();
    return { success: true };
  }

  static async getStats(db: D1Database | null) {
    const emptyStats = {
      total_bookings: 0, today_bookings: 0, menu_items: 0,
      gallery_images: 0, feedback_count: 0, offers_count: 0,
      reviews_count: 0, blogs_count: 0
    };
    if (!db) return { success: true, data: emptyStats };

    try {
      await ensureTables(db);
      const today = new Date().toISOString().split('T')[0];

      const [bookings, todayBookings, menu, gallery, reviews, blogs, offers] = await Promise.all([
        db.prepare('SELECT COUNT(*) as cnt FROM reservations WHERE is_deleted = 0').first().catch(() => ({ cnt: 0 })),
        db.prepare('SELECT COUNT(*) as cnt FROM reservations WHERE is_deleted = 0 AND date LIKE ?').bind(`${today}%`).first().catch(() => ({ cnt: 0 })),
        db.prepare('SELECT COUNT(*) as cnt FROM menu_items WHERE is_deleted = 0').first().catch(() => ({ cnt: 0 })),
        db.prepare('SELECT COUNT(*) as cnt FROM gallery WHERE is_deleted = 0').first().catch(() => ({ cnt: 0 })),
        db.prepare('SELECT COUNT(*) as cnt FROM reviews WHERE is_deleted = 0').first().catch(() => ({ cnt: 0 })),
        db.prepare('SELECT COUNT(*) as cnt FROM blogs WHERE is_deleted = 0').first().catch(() => ({ cnt: 0 })),
        db.prepare('SELECT COUNT(*) as cnt FROM offers_discounts WHERE is_deleted = 0').first().catch(() => ({ cnt: 0 }))
      ]);

      return {
        success: true,
        data: {
          total_bookings: bookings?.cnt || 0,
          today_bookings: todayBookings?.cnt || 0,
          menu_items: menu?.cnt || 0,
          gallery_images: gallery?.cnt || 0,
          feedback_count: reviews?.cnt || 0,
          offers_count: offers?.cnt || 0,
          reviews_count: reviews?.cnt || 0,
          blogs_count: blogs?.cnt || 0
        }
      };
    } catch (e) {
      return { success: true, data: emptyStats };
    }
  }

  static async getLogs(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50').all();
      return { success: true, data: list.results || [] };
    } catch (e) {
      return { success: true, data: [] };
    }
  }
}
