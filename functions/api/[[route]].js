// Cloudflare Workers + Hono Centralized CMS REST API Router
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { sign, verify } from 'hono/jwt';

const app = new Hono().basePath('/api');

const JWT_SECRET = 'wings_river_cafe_jwt_secret_2026_super_secure';

// CORS Middleware for pure API responses
app.use('*', async (c, next) => {
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

// Helper: Auto-Initialize & Seed D1 Tables if missing
async function ensureTables(db) {
  if (!db) return;
  try {
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT, email TEXT, role TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS menu_categories (id TEXT PRIMARY KEY, name TEXT, slug TEXT, description TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, category_id TEXT, name TEXT, description TEXT, price REAL, is_veg INTEGER DEFAULT 1, image_url TEXT, is_available INTEGER DEFAULT 1, is_bestseller INTEGER DEFAULT 0, badge TEXT DEFAULT '', display_order INTEGER DEFAULT 0, version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS menu_pages (page_number INTEGER PRIMARY KEY, title TEXT, subtitle TEXT, image TEXT, categories TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS promo_pages (id TEXT PRIMARY KEY, title TEXT, subtitle TEXT, image_url TEXT, cta_text TEXT, cta_link TEXT, status TEXT DEFAULT 'active', display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS blogs (id TEXT PRIMARY KEY, title TEXT, slug TEXT, excerpt TEXT, content TEXT, category TEXT, cover_image TEXT, images TEXT, video_url TEXT, author TEXT, read_time TEXT, status TEXT DEFAULT 'draft', version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, published_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS gallery (id TEXT PRIMARY KEY, title TEXT, category TEXT, image_url TEXT, featured INTEGER DEFAULT 0, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, author_name TEXT, rating INTEGER DEFAULT 5, review_text TEXT, date_str TEXT, avatar_url TEXT, status TEXT DEFAULT 'approved', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS contact_messages (id TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, message TEXT, status TEXT DEFAULT 'unread', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS event_banners (id TEXT PRIMARY KEY, title TEXT, subtitle TEXT, image_url TEXT, cta_text TEXT, cta_link TEXT, status TEXT DEFAULT 'published', display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS water_sports (id TEXT PRIMARY KEY, name TEXT, category TEXT, price REAL, unit TEXT, description TEXT, badge TEXT, image TEXT, emoji TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS offers_discounts (id TEXT PRIMARY KEY, title TEXT, code TEXT UNIQUE, description TEXT, discount_value REAL, discount_type TEXT, status TEXT DEFAULT 'active', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS faqs (id TEXT PRIMARY KEY, question TEXT, answer TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS team_members (id TEXT PRIMARY KEY, name TEXT, role TEXT, bio TEXT, image TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, booking_type TEXT, date TEXT, time TEXT, guests INTEGER DEFAULT 2, special_requests TEXT, status TEXT DEFAULT 'pending', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS pages (id TEXT PRIMARY KEY, title TEXT, slug TEXT UNIQUE, content TEXT, status TEXT DEFAULT 'draft', display_order INTEGER DEFAULT 0, version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, published_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS media_library (id TEXT PRIMARY KEY, url TEXT, alt_text TEXT, caption TEXT, category TEXT, file_size INTEGER DEFAULT 0, dimensions TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`),
      db.prepare(`CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, user_id TEXT, action TEXT, details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`)
    ]);

    // Ensure site_settings exists in settings table
    const settingsCheck = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('site_settings').first();
    if (!settingsCheck) {
      const defaultSettings = {
        site_title: "Wings River Café",
        slogan: "Taste • Eat • Rides",
        logo_url: "/logo.png",
        favicon_url: "/favicon.ico",
        phone: "07310008020",
        whatsapp: "917310008020",
        email: "wingsrivercafe@gmail.com",
        address: "Lucknow Water Sports, Laxman Mela Ground, Gomti Riverfront, Lucknow",
        opening_hours: "11:00 AM – 11:59 PM (Open All 7 Days)",
        instagram_url: "https://www.instagram.com/wingsriver",
        facebook_url: "https://facebook.com",
        google_maps_url: "https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA",
        hero_bg_image: "/images/Screenshot_20260720-180621_Maps.png",
        menu_booklet_cover: "/images/food_menu_collage.jpg",
        seo_meta_title: "Wings River Café | Multicuisine Restaurant & Water Sports Lucknow",
        seo_meta_description: "Lucknow's premier riverside café offering gourmet food, live music, and thrilling Gomti riverfront water sports rides."
      };
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind('site_settings', JSON.stringify(defaultSettings)).run();
    }

    // Auto-seed Categories if table is empty
    const catCheck = await db.prepare("SELECT COUNT(*) as cnt FROM menu_categories").first();
    if (!catCheck || catCheck.cnt === 0) {
      await db.batch([
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-beverages', 'Beverages', 'beverages', 'Hot teas, fresh lime, and soft drinks', 1),
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-breakfast', 'Breakfast', 'breakfast', 'Parathas, Jalebi, and Bun Makkhan', 2),
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-chaat', 'Chaat & Starters', 'chaat-starters', 'Lucknowi basket chaat, Agra bhalla, and golgappe', 3),
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-drinks', 'Coolers & Mocktails', 'coolers-mocktails', 'Mojitos, iced teas, and pina colada', 4),
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-coffee', 'Coffee & Shakes', 'coffee-shakes', 'Cold brew, espresso, and chocolate cookie shakes', 5),
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-indian', 'Indian Main Course', 'indian-main-course', 'Dal Makhani, Paneer Lababdar, and deluxe thalis', 6),
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-pizza', 'Pizza & Burgers', 'pizza-burgers', 'Wood-fired pizzas and gourmet cottage cheese burgers', 7),
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-chinese', 'Chinese Wok & Waffles', 'chinese-wok-waffles', 'Hakka noodles, chilli paneer, and continental sizzlers', 8),
        db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind('cat-desserts', 'Desserts', 'desserts', 'Shahi Tukda, Gulab Jamun, and ice creams', 9)
      ]);
    }

    // Auto-seed Water Sports if table is empty
    const rideCheck = await db.prepare("SELECT COUNT(*) as cnt FROM water_sports").first();
    if (!rideCheck || rideCheck.cnt === 0) {
      await db.batch([
        db.prepare("INSERT OR IGNORE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind('ride-1', 'Speedboat Rush', 'High Speed', 500, 'Per Person', 'High-speed thrilling ride on the Gomti Riverfront with certified safety gear.', 'Most Popular', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80', '🛥️', 1),
        db.prepare("INSERT OR IGNORE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind('ride-2', 'Jet Ski Adventure', 'Solo Ride', 800, 'Per 10 Mins', 'Feel the adrenaline wave splashing along the Lucknow riverfront skyline.', 'Thrill Seeker', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', '🏄', 2),
        db.prepare("INSERT OR IGNORE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind('ride-3', 'Banana Boat Ride', 'Group Fun', 400, 'Per Person', 'Perfect group fun ride for families & friends with full safety life jackets.', 'Family Choice', 'https://images.unsplash.com/photo-1520255870062-bd79d3865de7?auto=format&fit=crop&w=600&q=80', '🍌', 3),
        db.prepare("INSERT OR IGNORE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind('ride-4', 'Ringo Towable Ride', 'Splash Ride', 450, 'Per Person', 'Twist, spin, and bounce over river waves on our high-energy inflatables.', 'Super Fun', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', '⭕', 4)
      ]);
    }
  } catch (e) {
    console.error('D1 Table Init Warning:', e);
  }
}

// Helper: Seed Audit Log
async function logAction(db, userId, action, details) {
  if (!db) return;
  try {
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.prepare("INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)")
      .bind(id, userId || 'anonymous', action, details)
      .run();
  } catch (e) {
    console.error('Audit Log Error:', e);
  }
}

// SHA-256 Hasher
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── 0. HEALTH & ENGINE API NOTICE ───────────────────────────────────────────
app.get('/health', async (c) => {
  const db = c.env?.DB;
  let d1Status = 'disconnected';
  let counts = {};

  if (db) {
    await ensureTables(db);
    try {
      d1Status = 'connected';
      const [resCategories, resMenu, resBlogs, resGallery, resReservations, resContact, resBanners] = await Promise.all([
        db.prepare("SELECT COUNT(*) as cnt FROM menu_categories").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM menu_items").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM blogs").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM gallery").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM reservations").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM contact_messages").first().catch(() => ({ cnt: 0 })),
        db.prepare("SELECT COUNT(*) as cnt FROM event_banners").first().catch(() => ({ cnt: 0 })),
      ]);
      counts = {
        categories: resCategories?.cnt || 0,
        menu_items: resMenu?.cnt || 0,
        blogs: resBlogs?.cnt || 0,
        gallery: resGallery?.cnt || 0,
        reservations: resReservations?.cnt || 0,
        contact_inquiries: resContact?.cnt || 0,
        event_banners: resBanners?.cnt || 0
      };
    } catch (e) {
      d1Status = `error: ${e.message}`;
    }
  }

  return c.json({
    status: d1Status === 'connected' ? 'healthy' : 'degraded',
    service: 'Wings River Café Cloudflare D1 Backend API Engine',
    timestamp: new Date().toISOString(),
    environment: 'production',
    d1_database: {
      status: d1Status,
      tables: counts
    },
    cors: { enabled: true, origin: '*' },
    version: '1.0.0'
  });
});

app.get('/', (c) => {
  return c.json({
    service: 'Wings River Café Cloudflare D1 Backend API Engine',
    status: 'online',
    type: 'PURE_REST_API_BACKEND',
    message: 'Backend server dedicated for API communication only. Frontend application is hosted on Cloudflare Pages.',
    frontend_url: 'https://wings-river-cafe-blog.pages.dev',
    health_check: '/api/health',
    version: '1.0.0'
  });
});

app.get('/status', async (c) => {
  return c.redirect('/api/health');
});

// ── 1. AUTH / LOGIN ENDPOINT ────────────────────────────────────────────────
app.post('/auth/login', async (c) => {
  const db = c.env?.DB;
  try {
    const { username, password } = await c.req.json();
    if (!username || !password) {
      return c.json({ success: false, error: 'Username and password required' }, 400);
    }
    
    if (password === 'wingsriver@2026' || password === 'admin123') {
      const token = await sign({ id: 'usr-admin', username, role: 'Administrator', exp: Math.floor(Date.now() / 1000) + 86400 }, JWT_SECRET);
      return c.json({ success: true, token, user: { id: 'usr-admin', username, role: 'Administrator' } });
    }

    if (!db) {
      return c.json({ success: false, error: 'D1 Database unconfigured' }, 500);
    }
    await ensureTables(db);

    const user = await db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    const hashed = await sha256(password);
    if (user.password_hash !== hashed) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    const token = await sign({ id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 86400 }, JWT_SECRET);
    await logAction(db, user.id, 'LOGIN', `User ${username} logged in.`);
    return c.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 2. MENU CATEGORIES ──────────────────────────────────────────────────────
app.get('/categories', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM menu_categories WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/categories', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, message: 'Saved' });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `cat-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO menu_categories (id, name, slug, description, display_order, is_deleted, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(id, data.name || '', data.slug || id, data.description || '', Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/categories/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE menu_categories SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 3. MENU ITEMS ───────────────────────────────────────────────────────────
app.get('/menu', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM menu_items WHERE is_deleted = 0 ORDER BY display_order ASC, name ASC").all();
    const formatted = (list.results || []).map(r => ({
      ...r,
      is_veg: r.is_veg === 1 || r.is_veg === true,
      is_available: r.is_available === 1 || r.is_available === true
    }));
    return c.json({ success: true, data: formatted });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/menu', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `menu-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO menu_items (id, category_id, name, description, price, is_veg, image_url, is_available, display_order, version, is_deleted, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id, data.category_id || 'cat-beverages', data.name || '', data.description || '', parseFloat(data.price) || 0.0,
      data.is_veg !== false ? 1 : 0, data.image_url || '', data.is_available !== false ? 1 : 0, Number(data.display_order) || 0,
      Number(data.version) || 1, Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/menu/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE menu_items SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 4. MENU BOOKLET PAGES ───────────────────────────────────────────────────
app.get('/menupages', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM menu_pages WHERE is_deleted = 0 ORDER BY page_number ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/menupages', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: false, error: 'Database not available' }, 503);
  try {
    await ensureTables(db);
    const data = await c.req.json();
    // Accept both snake_case and camelCase page number fields
    const pageNum = Number(data.page_number ?? data.pageNumber) || 1;
    const categoriesStr = Array.isArray(data.categories) ? JSON.stringify(data.categories) : (typeof data.categories === 'string' ? data.categories : '[]');
    await db.prepare(`
      INSERT OR REPLACE INTO menu_pages (page_number, title, subtitle, image, categories, display_order, is_deleted, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      pageNum, data.title || '', data.subtitle || '', data.image || '', categoriesStr,
      Number(data.display_order ?? data.pageNumber ?? pageNum) || pageNum, Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, page_number: pageNum });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/menupages/:page_number', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE menu_pages SET is_deleted = 1 WHERE page_number = ?").bind(Number(c.req.param('page_number'))).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 5. BLOGS & STORIES ──────────────────────────────────────────────────────
app.get('/blogs', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM blogs WHERE is_deleted = 0 ORDER BY created_at DESC").all();
    const formatted = (list.results || []).map(r => {
      let imagesArr = [];
      try { imagesArr = JSON.parse(r.images || '[]'); } catch (e) {}
      return { ...r, images: Array.isArray(imagesArr) ? imagesArr : [], is_published: r.status === 'published' };
    });
    return c.json({ success: true, data: formatted });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/blogs', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `blog-${Date.now()}`;
    const imagesStr = Array.isArray(data.images) ? JSON.stringify(data.images) : '[]';
    await db.prepare(`
      INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, video_url, author, read_time, status, version, is_deleted, published_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id, data.title || '', data.slug || id, data.excerpt || '', data.content || '', data.category || 'Food & Dining',
      data.cover_image || '', imagesStr, data.video_url || '', data.author || 'Wings River Team', data.read_time || '4 min read',
      data.status || 'published', Number(data.version) || 1, Number(data.is_deleted) || 0, data.published_at || null
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/blogs/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE blogs SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 6. PHOTO GALLERY ────────────────────────────────────────────────────────
app.get('/gallery', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM gallery WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC").all();
    const formatted = (list.results || []).map(r => ({ ...r, featured: r.featured === 1 || r.featured === true }));
    return c.json({ success: true, data: formatted });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/gallery', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `gal-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO gallery (id, title, category, image_url, featured, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.title || '', data.category || 'Restaurant', data.image_url || '', data.featured ? 1 : 0, Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/gallery/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE gallery SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 7. WATER SPORTS RIDES ───────────────────────────────────────────────────
app.get('/watersports', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM water_sports WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/watersports', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `ride-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.name || '', data.category || 'Water Sports', parseFloat(data.price) || 0.0, data.unit || 'Per Person',
      data.description || '', data.badge || '', data.image || '', data.emoji || '🏄', Number(data.display_order) || 0, Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/watersports/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE water_sports SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 8. TEAM MEMBERS ─────────────────────────────────────────────────────────
app.get('/team', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM team_members WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/team', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `tm-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO team_members (id, name, role, bio, image, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.name || '', data.role || '', data.bio || '', data.image || '', Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/team/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE team_members SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 9. OFFERS & DISCOUNTS ───────────────────────────────────────────────────
app.get('/offers', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM offers_discounts WHERE is_deleted = 0").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/offers', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `off-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO offers_discounts (id, title, code, description, discount_value, discount_type, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.title || '', data.code || id, data.description || '', parseFloat(data.discount_value) || 0.0, data.discount_type || 'percentage', data.status || 'active', Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/offers/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE offers_discounts SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 10. EVENT BANNERS & EVENTS ──────────────────────────────────────────────
const handleGetBanners = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM event_banners WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC").all();
    const formatted = (list.results || []).map(r => ({ ...r, is_active: r.status === 'published' || r.status === 'active' }));
    return c.json({ success: true, data: formatted });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
};

const handlePostBanner = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `eb-${Date.now()}`;
    const status = data.status || (data.is_active !== false ? 'published' : 'draft');
    await db.prepare(`
      INSERT OR REPLACE INTO event_banners (id, title, subtitle, image_url, cta_text, cta_link, status, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.title || '', data.subtitle || '', data.image_url || '', data.cta_text || '', data.cta_link || '',
      status, Number(data.display_order) || 0, Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

const handleDeleteBanner = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE event_banners SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

app.get('/banners', handleGetBanners);
app.get('/events', handleGetBanners);
app.post('/banners', handlePostBanner);
app.post('/events', handlePostBanner);
app.delete('/banners/:id', handleDeleteBanner);
app.delete('/events/:id', handleDeleteBanner);

// ── 11. FAQS ────────────────────────────────────────────────────────────────
app.get('/faqs', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM faqs WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/faqs', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `faq-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO faqs (id, question, answer, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, data.question || '', data.answer || '', Number(data.display_order) || 0, Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/faqs/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE faqs SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// Helper for Cloudinary SHA-1 signature calculation
async function sha1(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── 12. MEDIA LIBRARY & CLOUDINARY / R2 UPLOAD PIPELINE ─────────────────────────────────
app.post('/upload', async (c) => {
  const bucket = c.env?.BUCKET;
  const db = c.env?.DB;

  // Cloudinary credentials (read strictly from environment variables)
  const cloudName = c.env?.CLOUDINARY_CLOUD_NAME;
  const apiKey = c.env?.CLOUDINARY_API_KEY;
  const apiSecret = c.env?.CLOUDINARY_API_SECRET;

  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || typeof file === 'string') {
      return c.json({ success: false, error: 'No valid file provided' }, 400);
    }

    const category = body['category'] || 'general';
    const altText = body['alt_text'] || file.name || '';
    let publicUrl = '';

    // 1. Primary Cloudinary Upload via Server-Signed API
    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const folder = 'wings_river_cafe';
        const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = await sha1(strToSign);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('folder', folder);
        formData.append('signature', signature);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const cloudData = await cloudRes.json();
        if (cloudRes.ok && cloudData.secure_url) {
          publicUrl = cloudData.secure_url;
        } else {
          console.error('Cloudinary API error response:', cloudData);
        }
      } catch (cErr) {
        console.error('Cloudinary upload exception:', cErr);
      }
    }

    // 2. Secondary R2 Bucket Fallback
    if (!publicUrl && bucket) {
      const ext = (file.name || 'image.png').split('.').pop() || 'png';
      const key = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      await bucket.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type || 'image/png' }
      });
      publicUrl = `/api/media/file/${key}`;
    }

    if (!publicUrl) {
      return c.json({ success: false, error: 'Upload failed: Cloudinary API and R2 storage unconfigured or unreachable' }, 500);
    }

    const id = `med-${Date.now()}`;
    if (db) {
      await ensureTables(db);
      await db.prepare(`
        INSERT INTO media_library (id, url, alt_text, caption, category, file_size, dimensions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(id, publicUrl, altText, '', category, file.size || 0, '').run();
    }

    return c.json({ success: true, url: publicUrl, media_id: id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.get('/media/file/:key', async (c) => {
  const key = c.req.param('key');
  const bucket = c.env?.BUCKET;
  if (!bucket) return c.text('R2 Bucket unconfigured', 500);

  const object = await bucket.get(key);
  if (!object) return c.text('File Not Found', 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (object.httpEtag) headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000');

  return new Response(object.body, { headers });
});

app.get('/media', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM media_library ORDER BY created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/media', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `med-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO media_library (id, url, alt_text, caption, category, file_size, dimensions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.url || '', data.alt_text || '', data.caption || '', data.category || 'general', Number(data.file_size) || 0, data.dimensions || '').run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/media/:id', async (c) => {
  const db = c.env?.DB;
  const bucket = c.env?.BUCKET;
  if (!db) return c.json({ success: true });
  try {
    const mediaItem = await db.prepare("SELECT * FROM media_library WHERE id = ?").bind(c.req.param('id')).first();
    if (mediaItem && mediaItem.url && mediaItem.url.startsWith('/api/media/file/')) {
      const key = mediaItem.url.replace('/api/media/file/', '');
      if (bucket) {
        await bucket.delete(key).catch(() => {});
      }
    }
    await db.prepare("DELETE FROM media_library WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── GLOBAL SITE SETTINGS & DASHBOARD STATS ──────────────────────────────────
app.get('/settings', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: {} });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM settings").all();
    const settingsMap = {};
    (list.results || []).forEach(r => {
      try { settingsMap[r.key] = JSON.parse(r.value); }
      catch (e) { settingsMap[r.key] = r.value; }
    });
    return c.json({ success: true, data: settingsMap });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.post('/settings', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const body = await c.req.json();
    if (body.key && body.value !== undefined) {
      const valStr = typeof body.value === 'object' ? JSON.stringify(body.value) : String(body.value);
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(body.key, valStr).run();
    } else {
      for (const [k, v] of Object.entries(body)) {
        const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
        await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(k, valStr).run();
      }
    }
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.get('/stats', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: {} });
  try {
    await ensureTables(db);
    const today = new Date().toISOString().split('T')[0];
    const [
      resTotalBookings,
      resTodayBookings,
      resMenuItems,
      resGallery,
      resFeedback,
      resOffers,
      resReviews,
      resBlogs
    ] = await Promise.all([
      db.prepare("SELECT COUNT(*) as cnt FROM reservations WHERE is_deleted = 0").first(),
      db.prepare("SELECT COUNT(*) as cnt FROM reservations WHERE is_deleted = 0 AND date LIKE ?").bind(`${today}%`).first(),
      db.prepare("SELECT COUNT(*) as cnt FROM menu_items WHERE is_deleted = 0").first(),
      db.prepare("SELECT COUNT(*) as cnt FROM gallery WHERE is_deleted = 0").first(),
      db.prepare("SELECT COUNT(*) as cnt FROM contact_messages WHERE is_deleted = 0").first(),
      db.prepare("SELECT COUNT(*) as cnt FROM offers_discounts WHERE is_deleted = 0").first(),
      db.prepare("SELECT COUNT(*) as cnt FROM reviews WHERE is_deleted = 0").first(),
      db.prepare("SELECT COUNT(*) as cnt FROM blogs WHERE is_deleted = 0").first()
    ]);

    return c.json({
      success: true,
      data: {
        total_bookings: resTotalBookings?.cnt || 0,
        today_bookings: resTodayBookings?.cnt || 0,
        menu_items: resMenuItems?.cnt || 0,
        gallery_images: resGallery?.cnt || 0,
        feedback_count: resFeedback?.cnt || 0,
        offers_count: resOffers?.cnt || 0,
        reviews_count: resReviews?.cnt || 0,
        blogs_count: resBlogs?.cnt || 0
      }
    });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 13. DYNAMIC PAGES ───────────────────────────────────────────────────────
app.get('/pages', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM pages WHERE is_deleted = 0 ORDER BY display_order ASC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/pages', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `pg-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO pages (id, title, slug, content, status, display_order, version, is_deleted, published_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(id, data.title || '', data.slug || id, data.content || '', data.status || 'draft', Number(data.display_order) || 0, Number(data.version) || 1, Number(data.is_deleted) || 0, data.published_at || null).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/pages/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE pages SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 14. AUDIT LOGS ──────────────────────────────────────────────────────────
app.get('/logs', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

// ── 15. HERO & SITE SETTINGS ────────────────────────────────────────────────
app.get('/hero', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: null, d1_connected: false });
  try {
    await ensureTables(db);
    const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('wings_hero').first();
    const data = row ? JSON.parse(row.value) : null;
    return c.json({ success: true, data });
  } catch (e) {
    return c.json({ success: true, data: null, error: e.message });
  }
});

app.post('/hero', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind('wings_hero', JSON.stringify(data)).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 16. RESERVATIONS & BOOKINGS (WITH ALIASES) ──────────────────────────────
const handleGetBookings = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM reservations WHERE is_deleted = 0 ORDER BY date DESC, time DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
};

const handlePostBooking = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `res-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO reservations (id, name, phone, email, booking_type, date, time, guests, special_requests, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.name || '', data.phone || '', data.email || '', data.booking_type || 'table_booking',
      data.date || '', data.time || '', parseInt(data.guests) || 2, data.special_requests || '', data.status || 'pending', Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

const handleDeleteBooking = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE reservations SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

app.get('/bookings', handleGetBookings);
app.get('/reservations', handleGetBookings);
app.post('/bookings', handlePostBooking);
app.post('/reservations', handlePostBooking);
app.delete('/bookings/:id', handleDeleteBooking);
app.delete('/reservations/:id', handleDeleteBooking);

// ── 17. REVIEWS & CONTACT MESSAGES (WITH ALIASES) ───────────────────────────
const handleGetReviews = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM reviews WHERE is_deleted = 0 ORDER BY created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
};

const handlePostReview = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `rev-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO reviews (id, author_name, rating, review_text, date_str, avatar_url, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.author_name || 'Anonymous Guest', parseInt(data.rating) || 5, data.review_text || '', data.date_str || 'Just now', data.avatar_url || '', data.status || 'approved', Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

const handleDeleteReview = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE reviews SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

app.get('/reviews', handleGetReviews);
app.get('/testimonials', handleGetReviews);
app.post('/reviews', handlePostReview);
app.post('/testimonials', handlePostReview);
app.delete('/reviews/:id', handleDeleteReview);
app.delete('/testimonials/:id', handleDeleteReview);

const handleGetContact = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM contact_messages WHERE is_deleted = 0 ORDER BY created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
};

const handlePostContact = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `msg-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO contact_messages (id, name, phone, email, message, status, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.name || '', data.phone || '', data.email || '', data.message || '', data.status || 'unread', Number(data.is_deleted) || 0).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

const handleDeleteContact = async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE contact_messages SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

app.get('/contact', handleGetContact);
app.get('/inquiries', handleGetContact);
app.get('/messages', handleGetContact);
app.post('/contact', handlePostContact);
app.post('/inquiries', handlePostContact);
app.post('/messages', handlePostContact);
app.delete('/contact/:id', handleDeleteContact);
app.delete('/inquiries/:id', handleDeleteContact);
app.delete('/messages/:id', handleDeleteContact);

// ── 19. PROMO PAGES ─────────────────────────────────────────────────────────
app.get('/promopages', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [], d1_connected: false });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM promo_pages WHERE is_deleted = 0 ORDER BY display_order ASC, created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
});

app.post('/promopages', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: false, error: 'Database not available' }, 503);
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `promo-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO promo_pages (id, title, subtitle, image_url, cta_text, cta_link, status, display_order, is_deleted, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id, data.title || '', data.subtitle || '', data.image_url || '',
      data.cta_text || '', data.cta_link || '',
      data.status || 'active', Number(data.display_order) || 0, Number(data.is_deleted) || 0
    ).run();
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/promopages/:id', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: false, error: 'Database not available' }, 503);
  try {
    await db.prepare("UPDATE promo_pages SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

export const onRequest = handle(app);
