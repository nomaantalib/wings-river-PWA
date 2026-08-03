import { D1Database } from '../types';
import { ensureTables } from '../utils/db';

export class MenuService {
  // Categories
  static async getCategories(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db
        .prepare('SELECT * FROM menu_categories WHERE is_deleted = 0 ORDER BY display_order ASC')
        .all();
      return { success: true, data: list.results || [] };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  static async saveCategory(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `cat-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO menu_categories (id, name, slug, description, display_order, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(
        id,
        data.name || '',
        data.slug || id,
        data.description || '',
        Number(data.display_order) || 0,
        Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteCategory(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE menu_categories SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Menu Items
  static async getMenuItems(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db
        .prepare('SELECT * FROM menu_items WHERE is_deleted = 0 ORDER BY display_order ASC, name ASC')
        .all();
      const data = (list.results || []).map((r: any) => ({
        ...r,
        is_veg: r.is_veg === 1,
        is_available: r.is_available === 1
      }));
      return { success: true, data };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  static async saveMenuItem(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `menu-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO menu_items (id, category_id, name, description, price, is_veg, image_url, is_available, display_order, version, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(
        id,
        data.category_id || 'cat-beverages',
        data.name || '',
        data.description || '',
        parseFloat(data.price) || 0,
        data.is_veg !== false ? 1 : 0,
        data.image_url || '',
        data.is_available !== false ? 1 : 0,
        Number(data.display_order) || 0,
        Number(data.version) || 1,
        Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteMenuItem(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE menu_items SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Menu Booklet Pages
  static async getMenuPages(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db
        .prepare('SELECT * FROM menu_pages WHERE is_deleted = 0 ORDER BY page_number ASC')
        .all();
      return { success: true, data: list.results || [] };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  static async saveMenuPage(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const pageNum = Number(data.page_number ?? data.pageNumber) || 1;
    const categoriesStr = Array.isArray(data.categories) ? JSON.stringify(data.categories) : data.categories || '[]';
    await db
      .prepare(
        'INSERT OR REPLACE INTO menu_pages (page_number, title, subtitle, image, categories, display_order, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(
        pageNum,
        data.title || '',
        data.subtitle || '',
        data.image || '',
        categoriesStr,
        Number(data.display_order ?? pageNum) || pageNum,
        Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, page_number: pageNum };
  }

  static async deleteMenuPage(db: D1Database | null, pageNumber: number) {
    if (!db) return { success: true };
    await db.prepare('UPDATE menu_pages SET is_deleted = 1 WHERE page_number = ?').bind(pageNumber).run();
    return { success: true };
  }
}
