import { D1Database } from '../types';
import { ensureTables } from '../utils/db';

export class ContentService {
  // Blogs
  static async getBlogs(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM blogs WHERE is_deleted = 0 ORDER BY created_at DESC').all();
      const data = (list.results || []).map((r: any) => {
        let images = [];
        try { images = JSON.parse(r.images || '[]'); } catch (e) {}
        return { ...r, images, is_published: r.status === 'published' };
      });
      return { success: true, data };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async saveBlog(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `blog-${Date.now()}`;
    const imagesStr = Array.isArray(data.images) ? JSON.stringify(data.images) : data.images || '[]';
    const now = new Date().toISOString();
    await db
      .prepare(
        'INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, video_url, author, read_time, status, version, is_deleted, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(
        id, data.title || '', data.slug || id, data.excerpt || '', data.content || '',
        data.category || 'Food & Dining', data.cover_image || '', imagesStr, data.video_url || '',
        data.author || 'Wings River Team', data.read_time || '4 min read', data.status || 'published',
        Number(data.version) || 1, Number(data.is_deleted) || 0, data.published_at || null, data.created_at || now
      )
      .run();
    return { success: true, id };
  }

  static async deleteBlog(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE blogs SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Gallery
  static async getGallery(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM gallery WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC').all();
      const data = (list.results || []).map((r: any) => ({ ...r, featured: r.featured === 1 }));
      return { success: true, data };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async saveGallery(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `gal-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO gallery (id, title, category, cluster_id, image_url, video_url, media_type, featured, display_order, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id, data.title || '', data.category || 'Restaurant', data.cluster_id || '',
        data.image_url || '', data.video_url || '', data.media_type || 'image',
        data.featured ? 1 : 0, Number(data.display_order) || 0, Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteGallery(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE gallery SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Water Sports
  static async getWaterSports(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM water_sports WHERE is_deleted = 0 ORDER BY display_order ASC').all();
      return { success: true, data: list.results || [] };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async saveWaterSport(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `ride-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id, data.name || '', data.category || 'Water Sports', parseFloat(data.price) || 0,
        data.unit || 'Per Person', data.description || '', data.badge || '', data.image || '',
        data.emoji || '🏄', Number(data.display_order) || 0, Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteWaterSport(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE water_sports SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Team
  static async getTeam(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM team_members WHERE is_deleted = 0 ORDER BY display_order ASC').all();
      return { success: true, data: list.results || [] };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async saveTeamMember(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `tm-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO team_members (id, name, role, bio, image, display_order, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id, data.name || '', data.role || '', data.bio || '', data.image || '',
        Number(data.display_order) || 0, Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteTeamMember(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE team_members SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Offers
  static async getOffers(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM offers_discounts WHERE is_deleted = 0').all();
      return { success: true, data: list.results || [] };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async saveOffer(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `off-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO offers_discounts (id, title, code, description, discount_value, discount_type, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id, data.title || '', data.code || id, data.description || '', parseFloat(data.discount_value) || 0,
        data.discount_type || 'percentage', data.status || 'active', Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteOffer(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE offers_discounts SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // FAQs
  static async getFaqs(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM faqs WHERE is_deleted = 0 ORDER BY display_order ASC').all();
      return { success: true, data: list.results || [] };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async saveFaq(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `faq-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO faqs (id, question, answer, display_order, is_deleted) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(
        id, data.question || '', data.answer || '', Number(data.display_order) || 0, Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteFaq(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE faqs SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Banners
  static async getBanners(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM event_banners WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC').all();
      const data = (list.results || []).map((r: any) => ({ ...r, is_active: r.status === 'published' || r.status === 'active' }));
      return { success: true, data };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async saveBanner(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `eb-${Date.now()}`;
    const status = data.status || (data.is_active !== false ? 'published' : 'draft');
    await db
      .prepare(
        'INSERT OR REPLACE INTO event_banners (id, title, subtitle, image_url, cta_text, cta_link, status, display_order, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(
        id, data.title || '', data.subtitle || '', data.image_url || '', data.cta_text || '',
        data.cta_link || '', status, Number(data.display_order) || 0, Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deleteBanner(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE event_banners SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Promo Pages
  static async getPromoPages(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM promo_pages WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC').all();
      return { success: true, data: list.results || [] };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async savePromoPage(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `promo-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO promo_pages (id, title, subtitle, image_url, cta_text, cta_link, status, display_order, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(
        id, data.title || '', data.subtitle || '', data.image_url || '', data.cta_text || '',
        data.cta_link || '', data.status || 'active', Number(data.display_order) || 0, Number(data.is_deleted) || 0
      )
      .run();
    return { success: true, id };
  }

  static async deletePromoPage(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE promo_pages SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }

  // Pages
  static async getPages(db: D1Database | null) {
    if (!db) return { success: true, data: [] };
    try {
      await ensureTables(db);
      const list = await db.prepare('SELECT * FROM pages WHERE is_deleted = 0 ORDER BY display_order ASC').all();
      return { success: true, data: list.results || [] };
    } catch (e) { return { success: true, data: [] }; }
  }

  static async savePage(db: D1Database | null, data: any) {
    if (!db) return { success: true };
    await ensureTables(db);
    const id = data.id || `pg-${Date.now()}`;
    await db
      .prepare(
        'INSERT OR REPLACE INTO pages (id, title, slug, content, status, display_order, version, is_deleted, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(
        id, data.title || '', data.slug || id, data.content || '', data.status || 'draft',
        Number(data.display_order) || 0, Number(data.version) || 1, Number(data.is_deleted) || 0, data.published_at || null
      )
      .run();
    return { success: true, id };
  }

  static async deletePage(db: D1Database | null, id: string) {
    if (!db) return { success: true };
    await db.prepare('UPDATE pages SET is_deleted = 1 WHERE id = ?').bind(id).run();
    return { success: true };
  }
}
