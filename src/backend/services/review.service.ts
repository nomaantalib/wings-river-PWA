import { D1Database } from '../types';
import { ensureTables } from '../utils/db';

export class ReviewService {
  static async getReviews(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM reviews WHERE is_deleted = 0 ORDER BY created_at DESC').all();
      return { success: true, data: list.results || [] };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  static async saveReview(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `rev-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO reviews (id, author_name, rating, review_text, date_str, avatar_url, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        data.author_name || 'Anonymous Guest',
        parseInt(data.rating) || 5,
        data.review_text || '',
        data.date_str || 'Just now',
        data.avatar_url || '',
        data.status || 'approved',
        Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteReview(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE reviews SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }
}
