import { AppContext, D1Database } from '../types';

let isTablesEnsured = false;

export function getDB(c: AppContext): D1Database | null {
  if (!c) return null;
  const env = c.env || (typeof process !== 'undefined' ? (process as any).env : {}) || {};
  return (
    env.DB ||
    env['wings-river-cafe'] ||
    env.wings_river_cafe ||
    env.wings_river_cafe_reservations ||
    env.DB_BINDING ||
    env.d1 ||
    env.DATABASE ||
    env.D1 ||
    null
  );
}

export async function ensureTables(db: D1Database | null): Promise<void> {
  if (!db || isTablesEnsured) return;

  const schemaQueries = [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, phone TEXT UNIQUE, password_hash TEXT, email TEXT, name TEXT, role TEXT DEFAULT 'Customer', is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL, device_info TEXT DEFAULT '', expires_at INTEGER NOT NULL, revoked INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS refresh_tokens (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token_hash TEXT UNIQUE NOT NULL, device_info TEXT DEFAULT '', expires_at INTEGER NOT NULL, revoked INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS otps (id TEXT PRIMARY KEY, phone TEXT NOT NULL, otp_code TEXT NOT NULL, attempts INTEGER DEFAULT 0, max_attempts INTEGER DEFAULT 5, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL);`,
    `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`,
    `CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`,
    `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);`,
    `CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone);`,
    `CREATE TABLE IF NOT EXISTS menu_categories (id TEXT PRIMARY KEY, name TEXT, slug TEXT, description TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, category_id TEXT, name TEXT, description TEXT, price REAL, is_veg INTEGER DEFAULT 1, image_url TEXT, is_available INTEGER DEFAULT 1, is_bestseller INTEGER DEFAULT 0, badge TEXT DEFAULT '', display_order INTEGER DEFAULT 0, version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS menu_pages (page_number INTEGER PRIMARY KEY, title TEXT, subtitle TEXT, image TEXT, categories TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS promo_pages (id TEXT PRIMARY KEY, title TEXT, subtitle TEXT, image_url TEXT, cta_text TEXT, cta_link TEXT, status TEXT DEFAULT 'active', display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS blogs (id TEXT PRIMARY KEY, title TEXT, slug TEXT, excerpt TEXT, content TEXT, category TEXT, cover_image TEXT, images TEXT, video_url TEXT, author TEXT, read_time TEXT, status TEXT DEFAULT 'draft', version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, published_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS gallery (id TEXT PRIMARY KEY, title TEXT, category TEXT, cluster_id TEXT DEFAULT '', image_url TEXT, video_url TEXT DEFAULT '', media_type TEXT DEFAULT 'image', featured INTEGER DEFAULT 0, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, author_name TEXT, rating INTEGER DEFAULT 5, review_text TEXT, date_str TEXT, avatar_url TEXT, status TEXT DEFAULT 'approved', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS contact_messages (id TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, message TEXT, status TEXT DEFAULT 'unread', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS event_banners (id TEXT PRIMARY KEY, title TEXT, subtitle TEXT, image_url TEXT, cta_text TEXT, cta_link TEXT, status TEXT DEFAULT 'published', display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS water_sports (id TEXT PRIMARY KEY, name TEXT, category TEXT, price REAL, unit TEXT, description TEXT, badge TEXT, image TEXT, emoji TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS offers_discounts (id TEXT PRIMARY KEY, title TEXT, code TEXT UNIQUE, description TEXT, discount_value REAL, discount_type TEXT, status TEXT DEFAULT 'active', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS faqs (id TEXT PRIMARY KEY, question TEXT, answer TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS team_members (id TEXT PRIMARY KEY, name TEXT, role TEXT, bio TEXT, image TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, booking_type TEXT, date TEXT, time TEXT, guests INTEGER DEFAULT 2, special_requests TEXT, status TEXT DEFAULT 'pending', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS pages (id TEXT PRIMARY KEY, title TEXT, slug TEXT UNIQUE, content TEXT, status TEXT DEFAULT 'draft', display_order INTEGER DEFAULT 0, version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, published_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS media_library (id TEXT PRIMARY KEY, public_id TEXT, secure_url TEXT, url TEXT, width INTEGER DEFAULT 0, height INTEGER DEFAULT 0, format TEXT DEFAULT 'jpg', alt_text TEXT DEFAULT '', category TEXT DEFAULT 'general', folder TEXT DEFAULT 'wings_river_cafe', tags TEXT DEFAULT '', file_size INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE INDEX IF NOT EXISTS idx_media_public_id ON media_library(public_id);`,
    `CREATE INDEX IF NOT EXISTS idx_media_category ON media_library(category);`,
    `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`,
    `CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, user_id TEXT, action TEXT, details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS table_clusters (id TEXT PRIMARY KEY, name TEXT, description TEXT, display_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS tables (id TEXT PRIMARY KEY, table_number TEXT UNIQUE, cluster_id TEXT, capacity INTEGER DEFAULT 4, shape TEXT DEFAULT 'rectangle', x_position INTEGER DEFAULT 0, y_position INTEGER DEFAULT 0, status TEXT DEFAULT 'free', is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, order_number TEXT UNIQUE, table_id TEXT, table_number TEXT, customer_name TEXT, customer_phone TEXT, order_type TEXT DEFAULT 'qr_dine_in', status TEXT DEFAULT 'new', total_amount REAL DEFAULT 0.0, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS order_items (id TEXT PRIMARY KEY, order_id TEXT, menu_item_id TEXT, item_name TEXT, quantity INTEGER DEFAULT 1, price REAL DEFAULT 0.0, notes TEXT, status TEXT DEFAULT 'pending');`,
    `CREATE TABLE IF NOT EXISTS call_requests (id TEXT PRIMARY KEY, table_id TEXT, table_number TEXT, request_type TEXT, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, resolved_at DATETIME, resolved_by TEXT);`,
    `CREATE TABLE IF NOT EXISTS dining_sessions (id TEXT PRIMARY KEY, table_number TEXT, customer_name TEXT, customer_phone TEXT, started_at DATETIME DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME, status TEXT DEFAULT 'active');`,
    `CREATE TABLE IF NOT EXISTS floor_plans (id TEXT PRIMARY KEY, branch_id TEXT DEFAULT 'wings_main', floor_name TEXT UNIQUE, layout_json TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
  ];

  try {
    await db.batch(schemaQueries.map(sql => db.prepare(sql)));
    isTablesEnsured = true;
  } catch (e: any) {
    console.warn('[D1 ensureTables Warning]', e?.message || e);
  }
}

export async function logAudit(db: D1Database | null, userId: string, action: string, details: string): Promise<void> {
  if (!db) return;
  try {
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    await db.prepare('INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)')
      .bind(id, userId || 'anonymous', action, details)
      .run();
  } catch (e) {}
}
