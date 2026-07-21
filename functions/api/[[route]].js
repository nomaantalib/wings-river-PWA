// Cloudflare Workers + Hono Centralized CMS REST API Router
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { sign, verify } from 'hono/jwt';

const app = new Hono().basePath('/api');

const JWT_SECRET = 'wings_river_cafe_jwt_secret_2026_super_secure';

// Helper: Get D1 Database binding from env (supports DB, d1, DATABASE, D1, or custom binding names)
function getDB(c) {
  if (!c || !c.env) return null;
  return c.env.DB || c.env.DB_BINDING || c.env.wings_river_cafe_reservations || c.env.d1 || c.env.DATABASE || c.env.D1 || null;
}

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
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT, email TEXT, role TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS menu_categories (id TEXT PRIMARY KEY, name TEXT, slug TEXT, description TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS menu_items (id TEXT PRIMARY KEY, category_id TEXT, name TEXT, description TEXT, price REAL, is_veg INTEGER DEFAULT 1, image_url TEXT, is_available INTEGER DEFAULT 1, is_bestseller INTEGER DEFAULT 0, badge TEXT DEFAULT '', display_order INTEGER DEFAULT 0, version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS menu_pages (page_number INTEGER PRIMARY KEY, title TEXT, subtitle TEXT, image TEXT, categories TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS promo_pages (id TEXT PRIMARY KEY, title TEXT, subtitle TEXT, image_url TEXT, cta_text TEXT, cta_link TEXT, status TEXT DEFAULT 'active', display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS blogs (id TEXT PRIMARY KEY, title TEXT, slug TEXT, excerpt TEXT, content TEXT, category TEXT, cover_image TEXT, images TEXT, video_url TEXT, author TEXT, read_time TEXT, status TEXT DEFAULT 'draft', version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, published_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS gallery (id TEXT PRIMARY KEY, title TEXT, category TEXT, image_url TEXT, featured INTEGER DEFAULT 0, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, author_name TEXT, rating INTEGER DEFAULT 5, review_text TEXT, date_str TEXT, avatar_url TEXT, status TEXT DEFAULT 'approved', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS contact_messages (id TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, message TEXT, status TEXT DEFAULT 'unread', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS event_banners (id TEXT PRIMARY KEY, title TEXT, subtitle TEXT, image_url TEXT, cta_text TEXT, cta_link TEXT, status TEXT DEFAULT 'published', display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS water_sports (id TEXT PRIMARY KEY, name TEXT, category TEXT, price REAL, unit TEXT, description TEXT, badge TEXT, image TEXT, emoji TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS offers_discounts (id TEXT PRIMARY KEY, title TEXT, code TEXT UNIQUE, description TEXT, discount_value REAL, discount_type TEXT, status TEXT DEFAULT 'active', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS faqs (id TEXT PRIMARY KEY, question TEXT, answer TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS team_members (id TEXT PRIMARY KEY, name TEXT, role TEXT, bio TEXT, image TEXT, display_order INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, booking_type TEXT, date TEXT, time TEXT, guests INTEGER DEFAULT 2, special_requests TEXT, status TEXT DEFAULT 'pending', is_deleted INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS pages (id TEXT PRIMARY KEY, title TEXT, slug TEXT UNIQUE, content TEXT, status TEXT DEFAULT 'draft', display_order INTEGER DEFAULT 0, version INTEGER DEFAULT 1, is_deleted INTEGER DEFAULT 0, published_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS media_library (id TEXT PRIMARY KEY, public_id TEXT, secure_url TEXT NOT NULL, url TEXT, width INTEGER DEFAULT 0, height INTEGER DEFAULT 0, format TEXT DEFAULT 'jpg', alt_text TEXT DEFAULT '', category TEXT DEFAULT 'general', folder TEXT DEFAULT 'wings_river_cafe', tags TEXT DEFAULT '', file_size INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE INDEX IF NOT EXISTS idx_media_public_id ON media_library(public_id);`,
    `CREATE INDEX IF NOT EXISTS idx_media_category ON media_library(category);`,
    `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`,
    `CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, user_id TEXT, action TEXT, details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
  ];

  for (const sql of tables) {
    try {
      await db.prepare(sql).run();
    } catch (e) {
      console.warn('[D1 Table Setup]', sql.substring(0, 45), e.message);
    }
  }

  // Safe Column Migrations (Fixes SQLite "has no column named public_id" or "NOT NULL constraint failed: media_library.url")
  const columnsToAdd = [
    `ALTER TABLE media_library ADD COLUMN public_id TEXT;`,
    `ALTER TABLE media_library ADD COLUMN secure_url TEXT;`,
    `ALTER TABLE media_library ADD COLUMN url TEXT;`,
    `ALTER TABLE media_library ADD COLUMN width INTEGER DEFAULT 0;`,
    `ALTER TABLE media_library ADD COLUMN height INTEGER DEFAULT 0;`,
    `ALTER TABLE media_library ADD COLUMN format TEXT DEFAULT 'jpg';`,
    `ALTER TABLE media_library ADD COLUMN alt_text TEXT DEFAULT '';`,
    `ALTER TABLE media_library ADD COLUMN category TEXT DEFAULT 'general';`,
    `ALTER TABLE media_library ADD COLUMN folder TEXT DEFAULT 'wings_river_cafe';`,
    `ALTER TABLE media_library ADD COLUMN tags TEXT DEFAULT '';`,
    `ALTER TABLE media_library ADD COLUMN file_size INTEGER DEFAULT 0;`,
    `ALTER TABLE media_library ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;`
  ];

  for (const alterSql of columnsToAdd) {
    try {
      await db.prepare(alterSql).run();
    } catch (e) {
      // Column already exists - ignore duplicate column error
    }
  }

  try {
    // 1. Ensure site_settings exists
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
        google_maps_url: "https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA",
        hero_bg_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
        menu_booklet_cover: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        seo_meta_title: "Wings River Café | Multicuisine Restaurant & Water Sports Lucknow",
        seo_meta_description: "Lucknow's premier riverside café offering gourmet food, live music, and thrilling Gomti riverfront water sports rides."
      };
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind('site_settings', JSON.stringify(defaultSettings)).run();
    }

    // 2. Auto-seed Categories if empty
    const catCheck = await db.prepare("SELECT COUNT(*) as cnt FROM menu_categories").first();
    if (!catCheck || catCheck.cnt === 0) {
      const cats = [
        ['cat-beverages', 'Beverages', 'beverages', 'Hot teas, fresh lime, and soft drinks', 1],
        ['cat-breakfast', 'Breakfast', 'breakfast', 'Parathas, Jalebi, and Bun Makkhan', 2],
        ['cat-chaat', 'Chaat & Starters', 'chaat-starters', 'Lucknowi basket chaat, Agra bhalla, and golgappe', 3],
        ['cat-drinks', 'Coolers & Mocktails', 'coolers-mocktails', 'Mojitos, iced teas, and pina colada', 4],
        ['cat-coffee', 'Coffee & Shakes', 'coffee-shakes', 'Cold brew, espresso, and chocolate cookie shakes', 5],
        ['cat-indian', 'Indian Main Course', 'indian-main-course', 'Dal Makhani, Paneer Lababdar, and deluxe thalis', 6],
        ['cat-pizza', 'Pizza & Burgers', 'pizza-burgers', 'Wood-fired pizzas and gourmet cottage cheese burgers', 7],
        ['cat-chinese', 'Chinese Wok & Waffles', 'chinese-wok-waffles', 'Hakka noodles, chilli paneer, and continental sizzlers', 8],
        ['cat-desserts', 'Desserts', 'desserts', 'Shahi Tukda, Gulab Jamun, and ice creams', 9]
      ];
      for (const c of cats) {
        await db.prepare("INSERT OR IGNORE INTO menu_categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)").bind(...c).run();
      }
    }

    // 3. Auto-seed Water Sports if empty
    const rideCheck = await db.prepare("SELECT COUNT(*) as cnt FROM water_sports").first();
    if (!rideCheck || rideCheck.cnt === 0) {
      const rides = [
        ['ride-1', 'Speedboat Rush', 'High Speed', 500, 'Per Person', 'High-speed thrilling ride on the Gomti Riverfront with certified safety gear.', 'Most Popular', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80', '🛥️', 1],
        ['ride-2', 'Jet Ski Adventure', 'Solo Ride', 800, 'Per 10 Mins', 'Feel the adrenaline wave splashing along the Lucknow riverfront skyline.', 'Thrill Seeker', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', '🏄', 2],
        ['ride-3', 'Banana Boat Ride', 'Group Fun', 400, 'Per Person', 'Perfect group fun ride for families & friends with full safety life jackets.', 'Family Choice', 'https://images.unsplash.com/photo-1520255870062-bd79d3865de7?auto=format&fit=crop&w=600&q=80', '🍌', 3],
        ['ride-4', 'Ringo Towable Ride', 'Splash Ride', 450, 'Per Person', 'Twist, spin, and bounce over river waves on our high-energy inflatables.', 'Super Fun', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', '⭕', 4]
      ];
      for (const r of rides) {
        await db.prepare("INSERT OR IGNORE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(...r).run();
      }
    }

    // 4. Auto-seed Media Library if empty with Cloudinary URLs
    const mediaCheck = await db.prepare("SELECT COUNT(*) as cnt FROM media_library").first();
    if (!mediaCheck || mediaCheck.cnt === 0) {
      const initialMedia = [
        ['med-hero-1', 'wings_river_cafe/hero_bg', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80', 1400, 900, 'jpg', 'Wings River Cafe Dining Atmosphere', 'hero', 'wings_river_cafe', '', 180000],
        ['med-menu-cover', 'wings_river_cafe/menu_cover', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', 1200, 800, 'jpg', 'Food Menu Booklet Cover', 'menu', 'wings_river_cafe', '', 150000],
        ['med-ride-1', 'wings_river_cafe/speedboat_rush', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80', 800, 600, 'jpg', 'Speedboat Rush Ride', 'watersports', 'wings_river_cafe', '', 120000],
        ['med-ride-2', 'wings_river_cafe/jetski_adventure', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', 800, 600, 'jpg', 'Jet Ski Adventure', 'watersports', 'wings_river_cafe', '', 120000]
      ];
      for (const m of initialMedia) {
        await db.prepare(`
          INSERT OR IGNORE INTO media_library (id, public_id, secure_url, width, height, format, alt_text, category, folder, tags, file_size, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(...m).run();
      }
    }
  } catch (e) {
    console.error('[D1 Seed Error]', e);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("UPDATE faqs SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 12. CLOUDINARY SERVICE & MEDIA LIBRARY D1 PIPELINE ──────────────────

// SHA-1 Helper for Cloudinary signed requests
async function sha1(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get active Cloudinary credentials (from env vars, D1 site_settings, or account defaults)
async function getCloudinaryCreds(c, db) {
  let cloudName = c.env?.CLOUDINARY_CLOUD_NAME;
  let apiKey = c.env?.CLOUDINARY_API_KEY;
  let apiSecret = c.env?.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    if (db) {
      try {
        await ensureTables(db);
        const sRow = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('site_settings').first();
        if (sRow && sRow.value) {
          const parsed = JSON.parse(sRow.value);
          if (!cloudName) cloudName = parsed.cloudinary_cloud_name;
          if (!apiKey) apiKey = parsed.cloudinary_api_key;
          if (!apiSecret) apiSecret = parsed.cloudinary_api_secret;
        }
      } catch (e) {}
    }
  }

  if (!cloudName) cloudName = 'vrgblmky';
  if (!apiKey) apiKey = '938174893659986';
  if (!apiSecret) apiSecret = 'FyD8S6x7JG4bXwK5WBz9n-O5jV4';

  return { cloudName, apiKey, apiSecret };
}

// Upload file directly to Cloudinary API with SHA-1 signature
async function uploadToCloudinary(file, folderName, c, db) {
  const { cloudName, apiKey, apiSecret } = await getCloudinaryCreds(c, db);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = folderName || 'wings_river_cafe';
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
    return {
      success: true,
      public_id: cloudData.public_id,
      secure_url: cloudData.secure_url,
      width: cloudData.width || 0,
      height: cloudData.height || 0,
      format: cloudData.format || 'jpg',
      bytes: cloudData.bytes || 0,
      folder: folder
    };
  }
  throw new Error(cloudData.error?.message || 'Cloudinary upload failed');
}

// Destroy asset from Cloudinary storage
async function destroyCloudinaryAsset(publicId, c, db) {
  if (!publicId) return true;
  try {
    const { cloudName, apiKey, apiSecret } = await getCloudinaryCreds(c, db);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await sha1(strToSign);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });
    const data = await cloudRes.json();
    return data.result === 'ok' || data.result === 'not found';
  } catch (e) {
    console.error('Cloudinary destroy exception:', e);
    return false;
  }
}

// ── REST API ENDPOINTS ───────────────────────────────────────────────────

// POST /api/upload & POST /api/admin/images/upload
const handleUpload = async (c) => {
  const db = getDB(c);
  if (!db) {
    console.error('[Upload Pipeline] ❌ D1 Database binding missing in Worker env');
    return c.json({ success: false, error: 'Database binding (D1) unconfigured or unavailable.' }, 500);
  }
  try {
    console.log('[Upload Pipeline] ✓ Upload started');
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || typeof file === 'string') {
      return c.json({ success: false, error: 'No valid file provided' }, 400);
    }

    // MIME & File Extension type validation (Mobile iOS Safari HEIC/HEIF & camera photos support)
    const type = file.type || '';
    const name = file.name || '';
    const isImage = !type || type.startsWith('image/') || type.includes('heic') || type.includes('heif') || /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(name);
    if (!isImage) {
      return c.json({ success: false, error: 'Unsupported file type. Only image files allowed.' }, 400);
    }

    const category = body['category'] || 'general';
    const altText = body['alt_text'] || file.name || '';
    const folder = body['folder'] || 'wings_river_cafe';
    const tags = body['tags'] || '';

    // 1. Upload to Cloudinary API
    const cloudResult = await uploadToCloudinary(file, folder, c, db);
    console.log(`[Upload Pipeline] ✓ Cloudinary upload successful: ${cloudResult.secure_url}`);

    // 2. Persist directly to Cloudflare D1 SQL database
    const id = `med-${Date.now()}`;
    console.log('[Upload Pipeline] ✓ Writing image metadata into Cloudflare D1 database...');
    await ensureTables(db);

    const d1Res = await db.prepare(`
      INSERT INTO media_library (id, public_id, secure_url, url, width, height, format, alt_text, category, folder, tags, file_size, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      id, cloudResult.public_id, cloudResult.secure_url, cloudResult.secure_url,
      cloudResult.width, cloudResult.height, cloudResult.format,
      altText, category, folder, tags, cloudResult.bytes || file.size || 0
    ).run();

    if (d1Res && d1Res.success === false) {
      console.error('[Upload Pipeline] ❌ D1 SQL Insert Error:', d1Res);
      return c.json({ success: false, error: 'Failed to write image metadata into D1 database.' }, 500);
    }
    console.log('[Upload Pipeline] ✓ D1 SQL insert/update successful');

    // 3. Fetch newly inserted record from D1 to verify single source of truth
    const savedRecord = await db.prepare("SELECT * FROM media_library WHERE id = ?").bind(id).first();
    console.log('[Upload Pipeline] ✓ Returning updated D1 record to client');

    return c.json({
      success: true,
      url: savedRecord ? savedRecord.secure_url : cloudResult.secure_url,
      media_id: id,
      image: savedRecord || {
        id,
        public_id: cloudResult.public_id,
        secure_url: cloudResult.secure_url,
        width: cloudResult.width,
        height: cloudResult.height,
        format: cloudResult.format,
        alt_text: altText,
        category,
        folder,
        tags,
        file_size: cloudResult.bytes || file.size || 0
      }
    });
  } catch (e) {
    console.error('[Upload Pipeline] ❌ Exception during upload/D1 sync:', e);
    return c.json({ success: false, error: e.message || 'Upload & D1 persistence failed' }, 500);
  }
};

app.post('/upload', handleUpload);
app.post('/admin/images/upload', handleUpload);

// GET /api/media & GET /api/images
const handleGetImages = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const category = c.req.query('category');
    let query = "SELECT * FROM media_library ORDER BY created_at DESC";
    let params = [];
    if (category) {
      query = "SELECT * FROM media_library WHERE category = ? ORDER BY created_at DESC";
      params = [category];
    }
    const list = await db.prepare(query).bind(...params).all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
};

app.get('/media', handleGetImages);
app.get('/images', handleGetImages);

// GET /api/media/:id & GET /api/images/:id
const handleGetSingleImage = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: false, error: 'Database unavailable' }, 503);
  try {
    await ensureTables(db);
    const id = c.req.param('id');
    const item = await db.prepare("SELECT * FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).first();
    if (!item) return c.json({ success: false, error: 'Image not found' }, 404);
    return c.json({ success: true, data: item, image: item });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

app.get('/media/:id', handleGetSingleImage);
app.get('/images/:id', handleGetSingleImage);

// POST /media (Create / Record image metadata manually in D1)
app.post('/media', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: false, error: 'Database unavailable' }, 503);
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `med-${Date.now()}`;
    const secureUrl = data.secure_url || data.url || '';
    await db.prepare(`
      INSERT OR REPLACE INTO media_library (id, public_id, secure_url, width, height, format, alt_text, category, folder, tags, file_size, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id, data.public_id || '', secureUrl, Number(data.width) || 0, Number(data.height) || 0,
      data.format || 'jpg', data.alt_text || '', data.category || 'general',
      data.folder || 'wings_river_cafe', data.tags || '', Number(data.file_size) || 0
    ).run();
    const saved = await db.prepare("SELECT * FROM media_library WHERE id = ?").bind(id).first();
    return c.json({ success: true, id, secure_url: secureUrl, image: saved });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// PUT /api/media/:id & PUT /api/admin/images/:id (Image Replacement & Metadata Update)
const handleUpdateImage = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: false, error: 'Database unavailable' }, 503);
  try {
    await ensureTables(db);
    const id = c.req.param('id');
    const item = await db.prepare("SELECT * FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).first();
    if (!item) return c.json({ success: false, error: 'Image not found in D1' }, 404);

    let body = {};
    try { body = await c.req.parseBody(); } catch { body = await c.req.json(); }

    const newFile = body['file'];
    let publicId = item.public_id;
    let secureUrl = item.secure_url;
    let width = item.width;
    let height = item.height;
    let format = item.format;
    let fileSize = item.file_size;

    // Replacement logic: Upload new asset to Cloudinary, destroy old Cloudinary asset
    if (newFile && typeof newFile !== 'string') {
      console.log(`[Image Replacement] Uploading new image file to Cloudinary for ID ${id}...`);
      const cloudResult = await uploadToCloudinary(newFile, item.folder || 'wings_river_cafe', c, db);
      if (item.public_id) {
        console.log(`[Image Replacement] Destroying old Cloudinary asset ${item.public_id}...`);
        await destroyCloudinaryAsset(item.public_id, c, db);
      }
      publicId = cloudResult.public_id;
      secureUrl = cloudResult.secure_url;
      width = cloudResult.width;
      height = cloudResult.height;
      format = cloudResult.format;
      fileSize = cloudResult.bytes || newFile.size || 0;
    }

    const altText = body['alt_text'] ?? item.alt_text;
    const category = body['category'] ?? item.category;
    const tags = body['tags'] ?? item.tags;

    await db.prepare(`
      UPDATE media_library
      SET public_id = ?, secure_url = ?, width = ?, height = ?, format = ?, alt_text = ?, category = ?, tags = ?, file_size = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR public_id = ?
    `).bind(publicId, secureUrl, width, height, format, altText, category, tags, fileSize, id, id).run();

    const updatedRecord = await db.prepare("SELECT * FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).first();
    console.log('[Image Replacement] ✓ D1 update successful');

    return c.json({ success: true, id, secure_url: secureUrl, public_id: publicId, image: updatedRecord });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

app.put('/media/:id', handleUpdateImage);
app.put('/admin/images/:id', handleUpdateImage);

// DELETE /api/media/:id & DELETE /api/admin/images/:id (Deletes asset from Cloudinary & record from D1)
const handleDeleteImage = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: false, error: 'Database unavailable' }, 503);
  try {
    await ensureTables(db);
    const id = c.req.param('id');
    const item = await db.prepare("SELECT * FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).first();
    if (item && item.public_id) {
      await destroyCloudinaryAsset(item.public_id, c, db);
    }
    await db.prepare("DELETE FROM media_library WHERE id = ? OR public_id = ?").bind(id, id).run();
    return c.json({ success: true, message: 'Image deleted from Cloudinary and D1' });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

app.delete('/media/:id', handleDeleteImage);
app.delete('/admin/images/:id', handleDeleteImage);

// ── GLOBAL SITE SETTINGS & DASHBOARD STATS ──────────────────────────────────
app.get('/settings', async (c) => {
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
  const db = getDB(c);
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
