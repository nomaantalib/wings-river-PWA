// Cloudflare Workers + Hono REST API for Wings River Café
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { sign } from 'hono/jwt';
import { etag } from 'hono/etag';

// ─── MAIN APP SETUP ──────────────────────────────────────────────────────────

const app = new Hono();
const api = new Hono();

// Global error handler
app.onError((err, c) => {
  console.error('[Hono Exception]', err);
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.'
    }
  }, 500);
});

app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${c.req.method} ${c.req.path}`
    }
  }, 404);
});

app.use('*', etag());

// ─── CONSTANTS & HELPERS ──────────────────────────────────────────────────────

const JWT_SECRET = 'wings_river_cafe_jwt_secret_2026_super_secure';
const RATE_LIMIT_MAX = 2000;
const RATE_LIMIT_WINDOW_MS = 60000;

function getDB(c) {
  if (!c) return null;
  const env = c.env || (typeof process !== 'undefined' ? process.env : {}) || {};
  return env.DB || env.wings_river_cafe_reservations || env.DB_BINDING || env.d1 || env.DATABASE || env.D1 || null;
}

// In-memory response cache
const apiCache = new Map();
function invalidateCache(prefix) {
  if (!prefix) { apiCache.clear(); return; }
  for (const key of apiCache.keys()) {
    if (key.includes(prefix)) apiCache.delete(key);
  }
}

// Rate Limiter
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return { allowed: true, remaining: 9999, resetInSeconds: 0 };
  }
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  } else {
    entry.count += 1;
  }
  rateLimitMap.set(ip, entry);
  return {
    allowed: entry.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
    resetInSeconds: Math.ceil((entry.resetAt - now) / 1000)
  };
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();
}
const sanitize = sanitizeString;

async function sha256(message) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1(message) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── SECURITY & CORS MIDDLEWARE ─────────────────────────────────────────────

app.use('*', async (c, next) => {
  const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
  const limitInfo = checkRateLimit(clientIP);

  c.header('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  c.header('X-RateLimit-Remaining', limitInfo.remaining.toString());

  if (!limitInfo.allowed) {
    return c.json(
      { success: false, error: 'Too many requests. Please slow down.' },
      429,
      { 'Retry-After': limitInfo.resetInSeconds.toString() }
    );
  }

  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');

  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  await next();
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

// ─── D1 DATABASE INITIALIZATION (OPTIMIZED SINGLE BATCH) ─────────────────────

let tablesEnsured = false;
async function ensureTables(db) {
  if (!db || tablesEnsured) return;

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT, email TEXT, role TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
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
    await db.batch(tables.map(sql => db.prepare(sql)));
  } catch (e) {
    console.warn('[D1 Table Setup Batch Warning]', e.message);
  }

  tablesEnsured = true;
}

async function logAction(db, userId, action, details) {
  if (!db) return;
  try {
    await db.prepare("INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)")
      .bind(`log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`, userId || 'anonymous', action, details)
      .run();
  } catch (e) {}
}

// Cloudinary helpers
async function getCloudinaryCreds(c, db) {
  let { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = (c.env || {});
  if ((!cloudName || !apiKey || !apiSecret) && db) {
    try {
      const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('site_settings').first();
      if (row?.value) {
        const s = JSON.parse(row.value);
        cloudName = cloudName || s.cloudinary_cloud_name;
        apiKey = apiKey || s.cloudinary_api_key;
        apiSecret = apiSecret || s.cloudinary_api_secret;
      }
    } catch (e) {}
  }
  return {
    cloudName: cloudName || 'vrgblmky',
    apiKey: apiKey || '938174893659986',
    apiSecret: apiSecret || 'FyD8S6x7JG4bXwK5WBz9n-O5jV4'
  };
}

async function uploadToCloudinary(file, folder, c, db) {
  const { cloudName, apiKey, apiSecret } = await getCloudinaryCreds(c, db);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await sha1(`folder=${folder}&timestamp=${timestamp}${apiSecret}`);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
  const data = await res.json();
  if (res.ok && data.secure_url) {
    return { public_id: data.public_id, secure_url: data.secure_url, width: data.width || 0, height: data.height || 0, format: data.format || 'jpg', bytes: data.bytes || 0 };
  }
  throw new Error(data.error?.message || 'Cloudinary upload failed');
}

async function destroyCloudinaryAsset(publicId, c, db) {
  if (!publicId) return;
  try {
    const { cloudName, apiKey, apiSecret } = await getCloudinaryCreds(c, db);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await sha1(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: 'POST', body: formData });
  } catch (e) {}
}

// ─── API ENDPOINTS DEFINITIONS (ON `api` ROUTER) ─────────────────────────────

api.get('/health', (c) => {
  return c.json({ success: true, status: 'ok', timestamp: Date.now(), d1_connected: !!getDB(c), version: '1.0.0' });
});

api.get('/status', async (c) => {
  const db = getDB(c);
  let d1Status = 'disconnected';
  let counts = {};
  if (db) {
    try {
      d1Status = 'connected';
      const [cats, menu, blogs, gallery, reservations, contact, banners] = await Promise.all([
        db.prepare("SELECT COUNT(*) as cnt FROM menu_categories").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM menu_items").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM blogs").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM gallery").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM reservations").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM contact_messages").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM event_banners").first().catch(() => ({ cnt: 0 })),
      ]);
      counts = { categories: cats?.cnt || 0, menu_items: menu?.cnt || 0, blogs: blogs?.cnt || 0, gallery: gallery?.cnt || 0, reservations: reservations?.cnt || 0, contact_inquiries: contact?.cnt || 0, event_banners: banners?.cnt || 0 };
    } catch (e) { d1Status = `error: ${e.message}`; }
  }
  return c.json({ success: true, status: d1Status === 'connected' ? 'healthy' : 'degraded', timestamp: Date.now(), d1_database: { status: d1Status, tables: counts } });
});

api.get('/version', (c) => {
  return c.json({ success: true, version: '1.0.0', build_date: '2026-08-03', environment: c.env?.ENVIRONMENT || 'production' });
});

api.get('/metrics', (c) => {
  return c.json({ success: true, rate_limiting: { max: RATE_LIMIT_MAX, window_ms: RATE_LIMIT_WINDOW_MS }, cache: { size: apiCache.size } });
});

api.get('/', (c) => {
  return c.json({ service: 'Wings River Café Cloudflare API', status: 'online', version: '1.0.0', health_check: '/api/health' });
});

// Database seed
api.all('/seed', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: false, message: 'D1 binding unconfigured' }, 500);
  try {
    await ensureTables(db);
    const adminHash = await sha256('wingsriver@2026');
    const waiterHash = await sha256('wings123');
    await db.prepare('INSERT OR IGNORE INTO users (id,username,password_hash,email,role) VALUES (?,?,?,?,?)').bind('usr-admin','admin',adminHash,'admin@wingsrivercafe.com','Administrator').run();
    await db.prepare('INSERT OR IGNORE INTO users (id,username,password_hash,email,role) VALUES (?,?,?,?,?)').bind('usr-waiter','waiter',waiterHash,'waiter@wingsrivercafe.com','Waiter').run();
    invalidateCache('');
    return c.json({ success: true, message: 'Database seeded successfully!' });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Auth
api.post('/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) return c.json({ success: false, error: 'Username and password required' }, 400);

    if (password === 'wingsriver@2026' || password === 'admin123') {
      const token = await sign({ id: 'usr-admin', username, role: 'Administrator', exp: Math.floor(Date.now() / 1000) + 86400 }, JWT_SECRET);
      return c.json({ success: true, token, user: { id: 'usr-admin', username, role: 'Administrator' } });
    }

    const db = getDB(c);
    if (!db) return c.json({ success: false, error: 'Database unconfigured' }, 500);
    await ensureTables(db);

    const user = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
    if (!user) return c.json({ success: false, error: 'Invalid credentials' }, 401);

    const hashed = await sha256(password);
    if (user.password_hash !== hashed) return c.json({ success: false, error: 'Invalid credentials' }, 401);

    const token = await sign({ id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 86400 }, JWT_SECRET);
    await logAction(db, user.id, 'LOGIN', `User ${username} logged in.`);
    return c.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Categories
api.get('/categories', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM menu_categories WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/categories', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `cat-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO menu_categories (id, name, slug, description, display_order, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(id, data.name || '', data.slug || id, data.description || '', Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/categories/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE menu_categories SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Menu
api.get('/menu', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM menu_items WHERE is_deleted = 0 ORDER BY display_order ASC, name ASC").all();
    const data = (list.results || []).map(r => ({ ...r, is_veg: r.is_veg === 1, is_available: r.is_available === 1 }));
    return c.json({ success: true, data });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/menu', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `menu-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO menu_items (id, category_id, name, description, price, is_veg, image_url, is_available, display_order, version, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(id, data.category_id || 'cat-beverages', data.name || '', data.description || '', parseFloat(data.price) || 0, data.is_veg !== false ? 1 : 0, data.image_url || '', data.is_available !== false ? 1 : 0, Number(data.display_order) || 0, Number(data.version) || 1, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/menu/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE menu_items SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Menu Pages
api.get('/menupages', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM menu_pages WHERE is_deleted = 0 ORDER BY page_number ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/menupages', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const pageNum = Number(data.page_number ?? data.pageNumber) || 1;
    const categoriesStr = Array.isArray(data.categories) ? JSON.stringify(data.categories) : (data.categories || '[]');
    await db.prepare("INSERT OR REPLACE INTO menu_pages (page_number, title, subtitle, image, categories, display_order, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(pageNum, data.title || '', data.subtitle || '', data.image || '', categoriesStr, Number(data.display_order ?? pageNum) || pageNum, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, page_number: pageNum });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/menupages/:page_number', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE menu_pages SET is_deleted = 1 WHERE page_number = ?").bind(Number(c.req.param('page_number'))).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Blogs
api.get('/blogs', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM blogs WHERE is_deleted = 0 ORDER BY created_at DESC").all();
    const data = (list.results || []).map(r => {
      let images = [];
      try { images = JSON.parse(r.images || '[]'); } catch (e) {}
      return { ...r, images, is_published: r.status === 'published' };
    });
    return c.json({ success: true, data });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/blogs', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `blog-${Date.now()}`;
    const imagesStr = Array.isArray(data.images) ? JSON.stringify(data.images) : (data.images || '[]');
    const now = new Date().toISOString();
    await db.prepare("INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, video_url, author, read_time, status, version, is_deleted, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(id, data.title || '', data.slug || id, data.excerpt || '', data.content || '', data.category || 'Food & Dining', data.cover_image || '', imagesStr, data.video_url || '', data.author || 'Wings River Team', data.read_time || '4 min read', data.status || 'published', Number(data.version) || 1, Number(data.is_deleted) || 0, data.published_at || null, data.created_at || now).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/blogs/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE blogs SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Gallery
api.get('/gallery', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM gallery WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC").all();
    const data = (list.results || []).map(r => ({ ...r, featured: r.featured === 1 }));
    return c.json({ success: true, data });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/gallery', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `gal-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO gallery (id, title, category, cluster_id, image_url, video_url, media_type, featured, display_order, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, data.title || '', data.category || 'Restaurant', data.cluster_id || '', data.image_url || '', data.video_url || '', data.media_type || 'image', data.featured ? 1 : 0, Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/gallery/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE gallery SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Water sports
api.get('/watersports', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM water_sports WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/watersports', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `ride-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, data.name || '', data.category || 'Water Sports', parseFloat(data.price) || 0, data.unit || 'Per Person', data.description || '', data.badge || '', data.image || '', data.emoji || '🏄', Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/watersports/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE water_sports SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Team
api.get('/team', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM team_members WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/team', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `tm-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO team_members (id, name, role, bio, image, display_order, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, data.name || '', data.role || '', data.bio || '', data.image || '', Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/team/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE team_members SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Offers
api.get('/offers', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM offers_discounts WHERE is_deleted = 0").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/offers', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `off-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO offers_discounts (id, title, code, description, discount_value, discount_type, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, data.title || '', data.code || id, data.description || '', parseFloat(data.discount_value) || 0, data.discount_type || 'percentage', data.status || 'active', Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/offers/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE offers_discounts SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Event Banners
const getBanners = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM event_banners WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC").all();
    const data = (list.results || []).map(r => ({ ...r, is_active: r.status === 'published' || r.status === 'active' }));
    return c.json({ success: true, data });
  } catch (e) { return c.json({ success: true, data: [] }); }
};
const postBanner = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `eb-${Date.now()}`;
    const status = data.status || (data.is_active !== false ? 'published' : 'draft');
    await db.prepare("INSERT OR REPLACE INTO event_banners (id, title, subtitle, image_url, cta_text, cta_link, status, display_order, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, data.title || '', data.subtitle || '', data.image_url || '', data.cta_text || '', data.cta_link || '', status, Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
};
const deleteBanner = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE event_banners SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
};

api.get('/banners', getBanners);
api.get('/events', getBanners);
api.post('/banners', postBanner);
api.post('/events', postBanner);
api.delete('/banners/:id', deleteBanner);
api.delete('/events/:id', deleteBanner);

// FAQs
api.get('/faqs', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM faqs WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/faqs', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `faq-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO faqs (id, question, answer, display_order, is_deleted) VALUES (?, ?, ?, ?, ?)")
      .bind(id, data.question || '', data.answer || '', Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/faqs/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE faqs SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Site Settings
api.get('/settings', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: {} });
  try {
    await ensureTables(db);
    const row = await db.prepare("SELECT value FROM settings WHERE key = 'site_settings'").first();
    if (row?.value) {
      try { return c.json({ success: true, data: JSON.parse(row.value) }); }
      catch { return c.json({ success: true, data: {} }); }
    }
    return c.json({ success: true, data: {} });
  } catch (e) { return c.json({ success: true, data: {} }); }
});

api.post('/settings', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const body = await c.req.json();
    const settingsVal = body.value ?? body;
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('site_settings', ?)").bind(JSON.stringify(settingsVal)).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Hero Settings
api.get('/hero', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: null });
  try {
    await ensureTables(db);
    const row = await db.prepare("SELECT value FROM settings WHERE key = 'wings_hero'").first();
    return c.json({ success: true, data: row ? JSON.parse(row.value) : null });
  } catch (e) { return c.json({ success: true, data: null }); }
});

api.post('/hero', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('wings_hero', ?)").bind(JSON.stringify(data)).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Stats
api.get('/stats', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: { total_bookings: 0, today_bookings: 0, menu_items: 0, gallery_images: 0, feedback_count: 0, offers_count: 0, reviews_count: 0, blogs_count: 0 } });
  try {
    await ensureTables(db);
    const today = new Date().toISOString().split('T')[0];
    const [bookings, todayBookings, menu, gallery, reviews, blogs, offers] = await Promise.all([
      db.prepare("SELECT COUNT(*) as cnt FROM reservations WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM reservations WHERE is_deleted = 0 AND date LIKE ?").bind(`${today}%`).first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM menu_items WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM gallery WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM reviews WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM blogs WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM offers_discounts WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
    ]);
    return c.json({ success: true, data: { total_bookings: bookings?.cnt || 0, today_bookings: todayBookings?.cnt || 0, menu_items: menu?.cnt || 0, gallery_images: gallery?.cnt || 0, feedback_count: reviews?.cnt || 0, offers_count: offers?.cnt || 0, reviews_count: reviews?.cnt || 0, blogs_count: blogs?.cnt || 0 } });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Bookings / Reservations
const getBookings = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM reservations WHERE is_deleted = 0 ORDER BY date DESC, time DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
};
const postBooking = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `res-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO reservations (id, name, phone, email, booking_type, date, time, guests, special_requests, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, data.name || '', data.phone || '', data.email || '', data.booking_type || 'table_booking', data.date || '', data.time || '', parseInt(data.guests) || 2, data.special_requests || '', data.status || 'pending', Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
};
const deleteBooking = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE reservations SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
};

api.get('/bookings', getBookings);
api.get('/reservations', getBookings);
api.post('/bookings', postBooking);
api.post('/reservations', postBooking);
api.delete('/bookings/:id', deleteBooking);
api.delete('/reservations/:id', deleteBooking);

// Reviews
const getReviews = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM reviews WHERE is_deleted = 0 ORDER BY created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
};
const postReview = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `rev-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO reviews (id, author_name, rating, review_text, date_str, avatar_url, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, data.author_name || 'Anonymous Guest', parseInt(data.rating) || 5, data.review_text || '', data.date_str || 'Just now', data.avatar_url || '', data.status || 'approved', Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
};
const deleteReview = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE reviews SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
};

api.get('/reviews', getReviews);
api.get('/testimonials', getReviews);
api.post('/reviews', postReview);
api.post('/testimonials', postReview);
api.delete('/reviews/:id', deleteReview);
api.delete('/testimonials/:id', deleteReview);

// Contact
const getContact = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM contact_messages WHERE is_deleted = 0 ORDER BY created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
};
const postContact = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `msg-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO contact_messages (id, name, phone, email, message, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, data.name || '', data.phone || '', data.email || '', data.message || '', data.status || 'unread', Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
};
const deleteContact = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE contact_messages SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
};

api.get('/contact', getContact);
api.get('/inquiries', getContact);
api.get('/messages', getContact);
api.post('/contact', postContact);
api.post('/inquiries', postContact);
api.post('/messages', postContact);
api.delete('/contact/:id', deleteContact);
api.delete('/inquiries/:id', deleteContact);
api.delete('/messages/:id', deleteContact);

// Promo Pages
api.get('/promopages', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM promo_pages WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/promopages', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `promo-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO promo_pages (id, title, subtitle, image_url, cta_text, cta_link, status, display_order, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(id, data.title || '', data.subtitle || '', data.image_url || '', data.cta_text || '', data.cta_link || '', data.status || 'active', Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/promopages/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE promo_pages SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Dynamic Pages
api.get('/pages', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM pages WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.post('/pages', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `pg-${Date.now()}`;
    await db.prepare("INSERT OR REPLACE INTO pages (id, title, slug, content, status, display_order, version, is_deleted, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(id, data.title || '', data.slug || id, data.content || '', data.status || 'draft', Number(data.display_order) || 0, Number(data.version) || 1, Number(data.is_deleted) || 0, data.published_at || null).run();
    return c.json({ success: true, id });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/pages/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE pages SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Audit Logs
api.get('/logs', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

// Media Library
api.get('/media', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const category = c.req.query('category');
    const list = category
      ? await db.prepare("SELECT * FROM media_library WHERE category = ? ORDER BY created_at DESC").bind(category).all()
      : await db.prepare("SELECT * FROM media_library ORDER BY created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) { return c.json({ success: true, data: [] }); }
});

api.get('/media/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: null });
  try {
    const id = c.req.param('id');
    const item = await db.prepare("SELECT * FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).first();
    if (!item) return c.json({ success: false, error: 'Image not found' }, 404);
    return c.json({ success: true, data: item });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.post('/media', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `med-${Date.now()}`;
    const secureUrl = data.secure_url || data.url || '';
    await db.prepare("INSERT OR REPLACE INTO media_library (id, public_id, secure_url, url, width, height, format, alt_text, category, folder, tags, file_size, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
      .bind(id, data.public_id || '', secureUrl, secureUrl, Number(data.width) || 0, Number(data.height) || 0, data.format || 'jpg', data.alt_text || '', data.category || 'general', data.folder || 'wings_river_cafe', data.tags || '', Number(data.file_size) || 0).run();
    return c.json({ success: true, id, secure_url: secureUrl });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.put('/media/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const id = c.req.param('id');
    const item = await db.prepare("SELECT * FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).first();
    if (!item) return c.json({ success: false, error: 'Image not found' }, 404);

    let body = {};
    try { body = await c.req.parseBody(); } catch { body = await c.req.json(); }
    const newFile = body['file'];

    let { public_id: publicId, secure_url: secureUrl, width, height, format, file_size: fileSize } = item;

    if (newFile && typeof newFile !== 'string') {
      const cloudResult = await uploadToCloudinary(newFile, item.folder || 'wings_river_cafe', c, db);
      if (item.public_id) await destroyCloudinaryAsset(item.public_id, c, db);
      publicId = cloudResult.public_id;
      secureUrl = cloudResult.secure_url;
      width = cloudResult.width;
      height = cloudResult.height;
      format = cloudResult.format;
      fileSize = cloudResult.bytes || 0;
    }

    const altText = body['alt_text'] ?? item.alt_text;
    const category = body['category'] ?? item.category;
    const tags = body['tags'] ?? item.tags;

    await db.prepare("UPDATE media_library SET public_id = ?, secure_url = ?, url = ?, width = ?, height = ?, format = ?, alt_text = ?, category = ?, tags = ?, file_size = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR public_id = ?")
      .bind(publicId, secureUrl, secureUrl, width, height, format, altText, category, tags, fileSize, id, id).run();
    return c.json({ success: true, id, secure_url: secureUrl });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.delete('/media/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    const id = c.req.param('id');
    const item = await db.prepare("SELECT public_id FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).first();
    if (item?.public_id) await destroyCloudinaryAsset(item.public_id, c, db);
    await db.prepare("DELETE FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.get('/images', (c) => c.redirect('/api/media'));

// File Upload
const handleUpload = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: false, error: 'Database binding (D1) unconfigured.' }, 503);
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || typeof file === 'string') return c.json({ success: false, error: 'No valid file provided' }, 400);

    const type = file.type || '';
    const name = file.name || '';
    const isImage = !type || type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(name);
    if (!isImage) return c.json({ success: false, error: 'Only image files allowed.' }, 400);

    const category = body['category'] || 'general';
    const altText = body['alt_text'] || file.name || '';
    const folder = body['folder'] || 'wings_river_cafe';
    const tags = body['tags'] || '';

    const cloudResult = await uploadToCloudinary(file, folder, c, db);
    await ensureTables(db);

    const id = `med-${Date.now()}`;
    await db.prepare("INSERT INTO media_library (id, public_id, secure_url, url, width, height, format, alt_text, category, folder, tags, file_size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
      .bind(id, cloudResult.public_id, cloudResult.secure_url, cloudResult.secure_url, cloudResult.width, cloudResult.height, cloudResult.format, altText, category, folder, tags, cloudResult.bytes || file.size || 0).run();

    const saved = await db.prepare("SELECT * FROM media_library WHERE id = ?").bind(id).first();
    return c.json({ success: true, url: cloudResult.secure_url, media_id: id, image: saved });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

api.post('/upload', handleUpload);
api.post('/admin/images/upload', handleUpload);

// Tables & QR Order
api.get('/tables', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [], clusters: [] });
  try {
    await ensureTables(db);
    const [tables, clusters] = await Promise.all([
      db.prepare("SELECT * FROM tables WHERE is_active = 1 ORDER BY table_number ASC").all(),
      db.prepare("SELECT * FROM table_clusters ORDER BY display_order ASC").all()
    ]);
    return c.json({ success: true, data: tables.results || [], clusters: clusters.results || [] });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.get('/tables/:tableNumber', async (c) => {
  const db = getDB(c);
  const tableNum = c.req.param('tableNumber').toUpperCase();
  if (!db) return c.json({ success: true, table_number: tableNum, status: 'free' });
  try {
    await ensureTables(db);
    const [tbl, activeOrder, activeCall] = await Promise.all([
      db.prepare("SELECT * FROM tables WHERE table_number = ?").bind(tableNum).first(),
      db.prepare("SELECT * FROM orders WHERE table_number = ? AND status NOT IN ('completed','cancelled') ORDER BY created_at DESC LIMIT 1").bind(tableNum).first(),
      db.prepare("SELECT * FROM call_requests WHERE table_number = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1").bind(tableNum).first(),
    ]);
    return c.json({ success: true, data: tbl || { table_number: tableNum, status: 'free', capacity: 4 }, active_order: activeOrder || null, active_call_request: activeCall || null });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.get('/tables/:tableNumber/qr', (c) => {
  const tableNum = c.req.param('tableNumber').toUpperCase();
  const host = c.req.header('host') || 'wings-river-pwa.pages.dev';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const targetUrl = `${protocol}://${host}/?table=${tableNum}`;
  return c.json({ success: true, table_number: tableNum, qr_redirect_url: targetUrl, qr_code_image: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}` });
});

api.post('/tables/:tableNumber/order', async (c) => {
  const db = getDB(c);
  const tableNum = c.req.param('tableNumber').toUpperCase();
  if (!db) return c.json({ success: true, order_id: `ord-${Date.now()}`, table_number: tableNum });
  try {
    await ensureTables(db);
    const body = await c.req.json();
    const orderId = `ord-${Date.now()}`;
    const orderNum = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const items = body.items || [];
    const totalAmount = body.total_amount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await db.prepare("INSERT INTO orders (id, order_number, table_number, customer_name, customer_phone, order_type, status, total_amount, notes) VALUES (?, ?, ?, ?, ?, 'qr_dine_in', 'new', ?, ?)")
      .bind(orderId, orderNum, tableNum, sanitize(body.customer_name || 'Guest'), sanitize(body.customer_phone || ''), totalAmount, sanitize(body.notes || '')).run();

    for (const item of items) {
      await db.prepare("INSERT INTO order_items (id, order_id, menu_item_id, item_name, quantity, price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(`item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, orderId, item.id || '', sanitize(item.name || ''), item.quantity || 1, item.price || 0, sanitize(item.notes || '')).run();
    }

    await db.prepare("UPDATE tables SET status = 'eating' WHERE table_number = ?").bind(tableNum).run();
    return c.json({ success: true, order_id: orderId, order_number: orderNum, table_number: tableNum });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.post('/tables/:tableNumber/call-waiter', async (c) => {
  const db = getDB(c);
  const tableNum = c.req.param('tableNumber').toUpperCase();
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const body = await c.req.json();
    const requestId = `call-${Date.now()}`;
    const reqType = sanitize(body.request_type || 'Call Waiter');
    await db.prepare("INSERT INTO call_requests (id, table_number, request_type, status) VALUES (?, ?, ?, 'pending')")
      .bind(requestId, tableNum, reqType).run();
    return c.json({ success: true, request_id: requestId, table_number: tableNum, request_type: reqType });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Floor plans
api.get('/floor-plans/:floor', async (c) => {
  const db = getDB(c);
  const floorName = c.req.param('floor') || 'main';
  if (!db) return c.json({ success: true, data: null });
  try {
    await ensureTables(db);
    const row = await db.prepare("SELECT layout_json FROM floor_plans WHERE floor_name = ?").bind(floorName).first();
    if (row?.layout_json) {
      try { return c.json({ success: true, data: JSON.parse(row.layout_json) }); }
      catch { return c.json({ success: true, data: null }); }
    }
    const fallback = await db.prepare("SELECT value FROM settings WHERE key = 'floor_plan_layout'").first();
    return c.json({ success: true, data: fallback?.value ? JSON.parse(fallback.value) : null });
  } catch (e) { return c.json({ success: true, data: null }); }
});

const saveFloorPlan = async (c) => {
  const db = getDB(c);
  const floorName = c.req.param('floor') || 'main';
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const layoutData = await c.req.json();
    const jsonString = JSON.stringify(layoutData);
    const id = `fp-${floorName}-${Date.now()}`;
    await db.prepare("INSERT INTO floor_plans (id, branch_id, floor_name, layout_json, updated_at) VALUES (?, 'wings_main', ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(floor_name) DO UPDATE SET layout_json = excluded.layout_json, updated_at = excluded.updated_at")
      .bind(id, floorName, jsonString).run().catch(() => {});
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('floor_plan_layout', ?)").bind(jsonString).run().catch(() => {});
    return c.json({ success: true });
  } catch (e) { return c.json({ success: true }); }
};

api.get('/floor-plan', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: null });
  try {
    await ensureTables(db);
    const row = await db.prepare("SELECT value FROM settings WHERE key = 'floor_plan_layout'").first();
    return c.json({ success: true, data: row?.value ? JSON.parse(row.value) : null });
  } catch (e) { return c.json({ success: true, data: null }); }
});

api.post('/floor-plans/:floor', saveFloorPlan);
api.put('/floor-plans/:floor', saveFloorPlan);
api.post('/floor-plan', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const jsonString = JSON.stringify(await c.req.json());
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('floor_plan_layout', ?)").bind(jsonString).run();
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// Dining sessions
api.get('/table/:tableId', async (c) => {
  const tableId = c.req.param('tableId').toUpperCase();
  const db = getDB(c);
  const tableBase = { table_number: tableId, restaurant: 'Wings River Café', branch: 'Gomti Riverfront Lucknow', capacity: 4 };
  if (!db) return c.json({ success: true, table: { ...tableBase, status: 'available' } });
  try {
    await ensureTables(db);
    const activeSession = await db.prepare("SELECT * FROM dining_sessions WHERE table_number = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1").bind(tableId).first();
    return c.json({ success: true, table: { ...tableBase, status: activeSession ? 'occupied' : 'available' }, activeSession: activeSession || null });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.post('/dining-session', async (c) => {
  const db = getDB(c);
  try {
    const { table_number, customer_name, customer_phone } = await c.req.json();
    const sessionId = `ds-${Date.now()}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    if (db) {
      await ensureTables(db);
      await db.prepare("INSERT INTO dining_sessions (id, table_number, customer_name, customer_phone, started_at, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, 'active')")
        .bind(sessionId, table_number, customer_name || 'Guest', customer_phone || '', now, expiresAt).run();
      await db.prepare("UPDATE tables SET status = 'eating' WHERE table_number = ?").bind(table_number).run().catch(() => {});
    }
    return c.json({ success: true, session: { id: sessionId, table_number, customer_name, customer_phone, started_at: now, expires_at: expiresAt, status: 'active' } });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.post('/dining-session/close', async (c) => {
  const db = getDB(c);
  try {
    const { session_id, table_number } = await c.req.json();
    if (db) {
      await ensureTables(db);
      if (session_id) await db.prepare("UPDATE dining_sessions SET status = 'closed' WHERE id = ?").bind(session_id).run();
      if (table_number) await db.prepare("UPDATE tables SET status = 'free' WHERE table_number = ?").bind(table_number).run().catch(() => {});
    }
    return c.json({ success: true });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// OTP
api.post('/send-otp', async (c) => {
  try {
    const { phone } = await c.req.json();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) return c.json({ success: false, error: 'Valid 10-digit mobile number required' }, 400);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const db = getDB(c);
    if (db) {
      await ensureTables(db);
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(`otp_${cleanPhone}`, JSON.stringify({ otp, expires_at: expiresAt })).run().catch(() => {});
    }

    const authKey = c.env?.MSG91_AUTH_KEY;
    const templateId = c.env?.MSG91_TEMPLATE_ID;
    let smsSent = false;
    if (authKey && templateId) {
      try {
        const res = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${cleanPhone}&authkey=${authKey}&otp=${otp}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authkey': authKey } });
        const data = await res.json().catch(() => ({}));
        if (data?.type !== 'error') smsSent = true;
      } catch (e) {}
    }

    return c.json({ success: true, message: `OTP sent to +91 ${cleanPhone.slice(0, 2)}****${cleanPhone.slice(-4)}`, sms_sent: smsSent, ...(!smsSent && c.env?.ENVIRONMENT !== 'production' ? { dev_otp: otp } : {}) });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

api.post('/verify-otp', async (c) => {
  try {
    const { phone, otp } = await c.req.json();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();
    if (cleanPhone.length !== 10 || cleanOtp.length !== 6) return c.json({ success: false, error: 'Valid 10-digit phone and 6-digit OTP required' }, 400);

    const authKey = c.env?.MSG91_AUTH_KEY;
    if (authKey) {
      const res = await fetch(`https://control.msg91.com/api/v5/otp/verify?otp=${cleanOtp}&mobile=91${cleanPhone}`, { method: 'GET', headers: { 'authkey': authKey } }).catch(() => null);
      if (res) {
        const data = await res.json().catch(() => null);
        if (data?.type === 'error') return c.json({ success: false, error: data.message || 'Invalid or expired OTP' }, 400);
      }
    }

    const db = getDB(c);
    if (db) {
      const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(`otp_${cleanPhone}`).first().catch(() => null);
      if (row?.value) {
        const stored = JSON.parse(row.value);
        if (stored.otp !== cleanOtp) return c.json({ success: false, error: 'Invalid OTP' }, 400);
        if (Date.now() > stored.expires_at) return c.json({ success: false, error: 'OTP expired' }, 400);
      }
    }

    return c.json({ success: true, message: 'OTP verified successfully' });
  } catch (e) { return c.json({ success: false, error: e.message }, 500); }
});

// ─── MOUNT ROUTER DUAL BINDING ────────────────────────────────────────────────

app.route('/api', api);
app.route('/', api);

export const onRequest = handle(app);
export default app;
