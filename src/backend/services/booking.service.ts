import { D1Database } from '../types';
import { ensureTables } from '../utils/db';

export class BookingService {
  static async getBookings(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM reservations WHERE is_deleted = 0 ORDER BY date DESC, time DESC').all();
      return { success: true, data: list.results || [] };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  static async saveBooking(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `res-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO reservations (id, name, phone, email, booking_type, date, time, guests, special_requests, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id,
        data.name || '',
        data.phone || '',
        data.email || '',
        data.booking_type || 'table_booking',
        data.date || '',
        data.time || '',
        parseInt(data.guests) || 2,
        data.special_requests || '',
        data.status || 'pending',
        Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteBooking(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE reservations SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }
}
