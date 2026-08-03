import { D1Database } from '../types';
import { ensureTables } from '../utils/db';

export class ContactService {
  static async getContactMessages(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM contact_messages WHERE is_deleted = 0 ORDER BY created_at DESC').all();
      return { success: true, data: list.results || [] };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  static async saveContactMessage(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `msg-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO contact_messages (id, name, phone, email, message, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        data.name || '',
        data.phone || '',
        data.email || '',
        data.message || '',
        data.status || 'unread',
        Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteContactMessage(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE contact_messages SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }
}
