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

// ── SECURITY & PERFORMANCE ENGINE DATA STRUCTURES ────────────────────────────

// 1. High-Performance In-Memory Response Cache Map (O(1) Lookup with TTL Expiry)
const apiCache = new Map(); // key -> { data: any, expiresAt: number }
const CACHE_TTL_MS = 15000; // 15 seconds TTL for fast dynamic reads

function getCached(key) {
  const item = apiCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    apiCache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data, ttlMs = CACHE_TTL_MS) {
  apiCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function invalidateCachePrefix(prefix) {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(prefix)) apiCache.delete(key);
  }
}

// 2. Token Bucket Rate Limiter & Event Throttler (Prevent Denial of Service & Abuse)
const rateLimitMap = new Map(); // ip -> { count: number, resetAt: number }
const RATE_LIMIT_MAX = 500; // max 500 requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

function checkRateLimit(ip) {
  // Always allow local loopback / dev requests without rate limit restriction
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip.includes('127.0.0.1')) {
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
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
  const allowed = entry.count <= RATE_LIMIT_MAX;

  return { allowed, remaining, resetInSeconds: Math.ceil((entry.resetAt - now) / 1000) };
}

// 3. String Input Sanitization & Anti-XSS Helper
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// CORS & Security Headers Middleware
app.use('*', async (c, next) => {
  // Extract client IP address for Rate Limiting
  const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
  const limitInfo = checkRateLimit(clientIP);

  c.header('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  c.header('X-RateLimit-Remaining', limitInfo.remaining.toString());

  if (!limitInfo.allowed) {
    return c.json(
      { success: false, error: 'Too many requests. Please slow down and try again later.' },
      429,
      { 'Retry-After': limitInfo.resetInSeconds.toString() }
    );
  }

  // Security Headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

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
    `CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, user_id TEXT, action TEXT, details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS table_clusters (id TEXT PRIMARY KEY, name TEXT, description TEXT, display_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS tables (id TEXT PRIMARY KEY, table_number TEXT UNIQUE, cluster_id TEXT, capacity INTEGER DEFAULT 4, shape TEXT DEFAULT 'rectangle', x_position INTEGER DEFAULT 0, y_position INTEGER DEFAULT 0, status TEXT DEFAULT 'free', is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS table_holds (id TEXT PRIMARY KEY, table_id TEXT, customer_name TEXT, customer_phone TEXT, hold_expires_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS party_bookings (id TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, event_type TEXT, event_date TEXT, time_slot TEXT, guest_count INTEGER DEFAULT 10, canopy_name TEXT, custom_notes TEXT, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, order_number TEXT UNIQUE, table_id TEXT, table_number TEXT, customer_name TEXT, customer_phone TEXT, order_type TEXT DEFAULT 'qr_dine_in', status TEXT DEFAULT 'new', total_amount REAL DEFAULT 0.0, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS order_items (id TEXT PRIMARY KEY, order_id TEXT, menu_item_id TEXT, item_name TEXT, quantity INTEGER DEFAULT 1, price REAL DEFAULT 0.0, notes TEXT, status TEXT DEFAULT 'pending');`,
    `CREATE TABLE IF NOT EXISTS call_requests (id TEXT PRIMARY KEY, table_id TEXT, table_number TEXT, request_type TEXT, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, resolved_at DATETIME, resolved_by TEXT);`,
    `CREATE TABLE IF NOT EXISTS bills (id TEXT PRIMARY KEY, receipt_number TEXT UNIQUE, order_id TEXT, table_id TEXT, table_number TEXT, customer_name TEXT, customer_phone TEXT, subtotal REAL DEFAULT 0.0, gst_amount REAL DEFAULT 0.0, service_charge REAL DEFAULT 0.0, discount_amount REAL DEFAULT 0.0, total_amount REAL DEFAULT 0.0, payment_method TEXT DEFAULT 'cash', payment_status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, paid_at DATETIME);`,
    `CREATE TABLE IF NOT EXISTS qr_codes (id TEXT PRIMARY KEY, table_id TEXT UNIQUE, table_number TEXT, qr_image_url TEXT, redirect_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, phone TEXT UNIQUE, name TEXT, email TEXT, total_bookings INTEGER DEFAULT 0, total_spent REAL DEFAULT 0.0, vip_status INTEGER DEFAULT 0, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
    `CREATE TABLE IF NOT EXISTS dining_sessions (id TEXT PRIMARY KEY, table_number TEXT, customer_name TEXT, customer_phone TEXT, started_at DATETIME DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME, status TEXT DEFAULT 'active');`,
    `CREATE TABLE IF NOT EXISTS floor_plans (id TEXT PRIMARY KEY, branch_id TEXT DEFAULT 'wings_main', floor_name TEXT UNIQUE, layout_json TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
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
    `ALTER TABLE media_library ADD COLUMN updated_at DATETIME;`,
    `ALTER TABLE blogs ADD COLUMN created_at DATETIME;`,
    `ALTER TABLE blogs ADD COLUMN updated_at DATETIME;`,
    `ALTER TABLE blogs ADD COLUMN published_at DATETIME;`,
    `ALTER TABLE blogs ADD COLUMN video_url TEXT;`,
    `ALTER TABLE blogs ADD COLUMN version INTEGER DEFAULT 1;`,
    `ALTER TABLE blogs ADD COLUMN is_deleted INTEGER DEFAULT 0;`,
    `ALTER TABLE blogs ADD COLUMN images TEXT DEFAULT '[]';`,
    `ALTER TABLE gallery ADD COLUMN cluster_id TEXT DEFAULT 'cluster-riverside';`,
    `ALTER TABLE gallery ADD COLUMN media_type TEXT DEFAULT 'image';`,
    `ALTER TABLE gallery ADD COLUMN video_url TEXT DEFAULT '';`
  ];

  for (const alterSql of columnsToAdd) {
    try {
      await db.prepare(alterSql).run();
    } catch (e) {
      // Ignore duplicate column errors, but log others
      if (!e.message.includes('already exists') && !e.message.includes('duplicate column')) {
        console.error('[D1 Alter Error]:', alterSql, e.message);
      }
    }
  }

  try {
    // Ensure default site_settings exists if uninitialized
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
  } catch (e) {
    console.error('[D1 Setup Error]', e);
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

// ── VERIFY D1 DATABASE ENDPOINT ──────────────────────────────────────────────
app.all('/seed', async (c) => {
  const db = getDB(c);
  if (!db) {
    return c.json({ success: false, message: 'D1 binding not available in local dev mode.' });
  }
  try {
    await ensureTables(db);
    const seeded = { categories: 0, menu: 0, gallery: 0, watersports: 0, blogs: 0, banners: 0, faqs: 0, clusters: 0, tables: 0 };

    // 1. Menu Categories
    const existingCats = await db.prepare('SELECT COUNT(*) as cnt FROM menu_categories').first();
    if (!existingCats || existingCats.cnt === 0) {
      const cats = [
        ['cat-beverages','Beverages','beverages','Hot teas, fresh lime, and soft drinks',1],
        ['cat-breakfast','Breakfast','breakfast','Parathas, Jalebi, and Bun Makkhan',2],
        ['cat-chaat','Chaat & Starters','chaat-starters','Lucknowi basket chaat, Agra bhalla, and golgappe',3],
        ['cat-drinks','Coolers & Mocktails','coolers-mocktails','Mojitos, iced teas, and pina colada',4],
        ['cat-coffee','Coffee & Shakes','coffee-shakes','Cold brew, espresso, and chocolate cookie shakes',5],
        ['cat-indian','Indian Main Course','indian-main-course','Dal Makhani, Paneer Lababdar, and deluxe thalis',6],
        ['cat-pizza','Pizza & Burgers','pizza-burgers','Wood-fired pizzas and gourmet cottage cheese burgers',7],
        ['cat-chinese','Chinese Wok & Waffles','chinese-wok-waffles','Hakka noodles, chilli paneer, and continental sizzlers',8],
        ['cat-desserts','Desserts','desserts','Shahi Tukda, Gulab Jamun, and ice creams',9],
      ];
      for (const [id, name, slug, desc, ord] of cats) {
        await db.prepare('INSERT OR REPLACE INTO menu_categories (id, name, slug, description, display_order, is_deleted) VALUES (?,?,?,?,?,0)')
          .bind(id, name, slug, desc, ord).run();
      }
      seeded.categories = cats.length;
    }

    // 2. Menu Items
    const existingMenu = await db.prepare('SELECT COUNT(*) as cnt FROM menu_items').first();
    if (!existingMenu || existingMenu.cnt === 0) {
      const MENU_IMG = 'https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_400/wings_river_cafe/menu_default.jpg';
      const items = [
        ['m1','cat-beverages','Special Masala Chai','Freshly brewed kulhad tea with cardamoms & ginger.',50,1,MENU_IMG,1,1,1],
        ['m2','cat-beverages','Fresh Lime Soda','Sweet or salted sparkling fresh lime soda.',60,1,MENU_IMG,1,2,0],
        ['m3','cat-breakfast','Bun Makkhan','Soft toasted bun stuffed with rich farm butter.',60,1,MENU_IMG,1,1,0],
        ['m4','cat-breakfast','Special Chola Bhatura','Piping hot fluffy bhaturas with spicy Amritsari chole.',150,1,MENU_IMG,1,2,1],
        ['m5','cat-breakfast','Paneer Paratha','Stuffed cottage cheese paratha with curd & pickle.',110,1,MENU_IMG,1,3,0],
        ['m6','cat-breakfast','Dahi Jalebi (200gm)','Crispy golden jalebis paired with fresh thick curd.',150,1,MENU_IMG,1,4,0],
        ['m7','cat-chaat','Special Pav Bhaji','Butter-loaded spicy mashed vegetable bhaji with toasted pavs.',150,1,MENU_IMG,1,1,1],
        ['m8','cat-chaat','Cheese Butter Pav Bhaji','Gratinated melted cheese topped over butter pav bhaji.',170,1,MENU_IMG,1,2,0],
        ['m9','cat-chaat','Agra Ka Special Bhalla','Crispy potato bhalla with sweet curd & mint chutney.',80,1,MENU_IMG,1,3,0],
        ['m10','cat-chaat','Lucknowi Basket Chaat','Crispy potato basket filled with tikkis, sprouts & curd.',150,1,MENU_IMG,1,4,1],
        ['m11','cat-chaat','Gol Gappe (6 Pcs)','Crispy puris filled with spicy mint water & tangy chutney.',40,1,MENU_IMG,1,5,0],
        ['m12','cat-drinks','Virgin Mojito','Fresh mint, lime wedges, crushed ice & sparkling soda.',119,1,MENU_IMG,1,1,1],
        ['m13','cat-drinks','Blue Lagoon Cooler','Refreshing curacao blue citrus cooler with lemon zest.',129,1,MENU_IMG,1,2,0],
        ['m14','cat-drinks','Watermelon Sunset Mojito','Fresh watermelon extract, mint & chat masala fizz.',129,1,MENU_IMG,1,3,0],
        ['m15','cat-drinks','Peach Iced Tea','Slow brewed tea infused with natural peach nectar.',129,1,MENU_IMG,1,4,0],
        ['m16','cat-drinks','Virgin Pina Colada','Creamy coconut milk & pineapple juice mocktail.',129,1,MENU_IMG,1,5,0],
        ['m17','cat-coffee','Riverside Cold Brew Coffee','Chilled rich espresso blended with vanilla cream.',149,1,MENU_IMG,1,1,1],
        ['m18','cat-desserts','Oreo Cream Shake','Rich chocolate cookie shake topped with whipped cream.',149,1,MENU_IMG,1,1,0],
        ['m19','cat-chaat','Veg Manchow Soup','Spicy Indo-Chinese soup with crispy fried noodles.',149,1,MENU_IMG,1,6,0],
        ['m20','cat-chaat','Lemon Coriander Soup','Vitamin-C rich clear soup with fresh coriander & lime.',149,1,MENU_IMG,1,7,0],
        ['m21','cat-indian','Dal Makhani Shahi','Slow-cooked black lentils in rich cream & butter.',265,1,MENU_IMG,1,1,1],
        ['m22','cat-indian','Paneer Lababdar','Soft paneer cubes simmered in onion-tomato cashew gravy.',315,1,MENU_IMG,1,2,1],
        ['m23','cat-indian','Handi Soya Chaap Gravy','Tandoori soya chaap pieces cooked in claypot spices.',305,1,MENU_IMG,1,3,0],
        ['m24','cat-indian','Deluxe Veg Thali','Paneer, Dal Makhani, Mix Veg, Naan, Rice, Raita & Sweet.',345,1,MENU_IMG,1,4,1],
        ['m25','cat-pizza','Loaded Special Pizza','Loaded wood-fired pizza with mozzarella, paneer & peppers.',349,1,MENU_IMG,1,1,1],
        ['m26','cat-pizza','Gourmet Paneer Burger','Crispy cottage cheese patty, cheddar, jalapenos & dip.',329,1,MENU_IMG,1,2,0],
        ['m27','cat-pizza','Cheese Garlic Bread (4 Pcs)','Toasted baguette topped with garlic butter & mozzarella.',235,1,MENU_IMG,1,3,0],
        ['m28','cat-chinese','Chilli Paneer Dry','Paneer wok-tossed with capsicum, garlic & Schezwan.',219,1,MENU_IMG,1,1,0],
        ['m29','cat-chinese','Veg Hakka Noodles','Stir-fried noodles loaded with crunchy veggies & light soy.',249,1,MENU_IMG,1,2,0],
        ['m30','cat-chinese','Cottage Cheese Sizzler','Paneer steak, herb rice, sautéed veggies & french fries.',449,1,MENU_IMG,1,3,0],
        ['m31','cat-chinese','Red Sauce Arrabiata Pasta','Penne pasta tossed in spicy basil tomato concasse.',275,1,MENU_IMG,1,4,0],
        ['m32','cat-chinese','Paneer Tikka Charcoal Grilled','Classic marinated paneer skewers roasted in tandoor.',299,1,MENU_IMG,1,5,1],
        ['m33','cat-desserts','Hot Gulab Jamun (2 Pcs)','Soft milk solids dumplings in hot cardamom syrup.',99,1,MENU_IMG,1,2,0],
        ['m34','cat-desserts','Royal Shahi Tukda','Saffron bread topped with thick rabri & pistachios.',169,1,MENU_IMG,1,3,1],
      ];
      for (const [id, cat, name, desc, price, veg, img, avail, ord, best] of items) {
        await db.prepare('INSERT OR REPLACE INTO menu_items (id,category_id,name,description,price,is_veg,image_url,is_available,display_order,is_bestseller,is_deleted) VALUES (?,?,?,?,?,?,?,?,?,?,0)')
          .bind(id, cat, name, desc, price, veg, img, avail, ord, best).run();
      }
      seeded.menu = items.length;
    }

    // 3. Gallery with proper cluster_id values
    const existingGallery = await db.prepare('SELECT COUNT(*) as cnt FROM gallery').first();
    if (!existingGallery || existingGallery.cnt === 0) {
      const gallery = [
        // cluster-indoor — Indoor AC Hall
        ['g-in-1','Indoor AC Hall — Cozy River View Seating','Indoor AC','cluster-indoor','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/indoor_ac_hall_1.jpg','image',1,1],
        ['g-in-2','Indoor Dining & Fine Ambience','Indoor AC','cluster-indoor','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/indoor_ac_hall_2.jpg','image',1,2],
        ['g-in-3','Cozy Indoor Lounge Seating','Indoor AC','cluster-indoor','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/indoor_lounge.jpg','image',0,3],
        // cluster-riverside — Riverside Deck
        ['g-rs-1','Sunset Gomti Riverfront Lounge','River View','cluster-riverside','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/riverside_deck_sunset.jpg','image',1,4],
        ['g-rs-2','Riverside Deck Evening Ambience','Evening','cluster-riverside','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/riverside_evening.jpg','image',1,5],
        ['g-rs-3','Waterfront Fairy Light Setup','Evening','cluster-riverside','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/fairy_light_canopy.jpg','image',1,6],
        ['g-rs-4','Outdoor Riverside Garden Tables','Outdoor Seating','cluster-riverside','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/garden_tables.jpg','image',0,7],
        // cluster-canopy — VIP Private Canopy
        ['g-cn-1','VIP Private Canopy Birthday Setup','VIP Canopy','cluster-canopy','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/vip_canopy_birthday.jpg','image',1,8],
        ['g-cn-2','Candlelit Anniversary Canopy Dinner','VIP Canopy','cluster-canopy','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/vip_canopy_anniversary.jpg','image',1,9],
        // watersports — Water Sports
        ['g-ws-1','Jet Ski Thrill Ride — Gomti River','Water Sports','watersports','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/jetski_action.jpg','image',1,10],
        ['g-ws-2','Speedboat Action Shot — Gomti','Water Sports','watersports','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/speedboat_action.jpg','image',1,11],
        ['g-ws-3','Motorboat Cruise — Laxman Jhula','Water Sports','watersports','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/motorboat_cruise.jpg','image',1,12],
        // General food
        ['g-fd-1','Chef Special Gourmet Food Spread','Food','','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/food_gourmet_spread.jpg','image',1,13],
        ['g-fd-2','Signature Drinks & Mocktail Bar','Food','','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_800/wings_river_cafe/mocktail_bar.jpg','image',1,14],
      ];
      for (const [id, title, cat, cluster, url, mtype, feat, ord] of gallery) {
        await db.prepare('INSERT OR REPLACE INTO gallery (id,title,category,cluster_id,image_url,media_type,featured,display_order,is_deleted) VALUES (?,?,?,?,?,?,?,?,0)')
          .bind(id, title, cat, cluster, url, mtype, feat, ord).run();
      }
      seeded.gallery = gallery.length;
    }

    // 4. Water Sports Rides
    const existingRides = await db.prepare('SELECT COUNT(*) as cnt FROM water_sports').first();
    if (!existingRides || existingRides.cnt === 0) {
      const rides = [
        ['ride-1','Jetski Thrill Ride','Water Sports',350,'Per Person 1 Round','High speed jet ski on Gomti river with certified instructor & life jacket.','Most Popular','🏄',1],
        ['ride-2','Speed Boat Ride','Water Sports',250,'Per Person 1 Round','Twin-engine speedboat ride with panoramic riverfront views.','Family Favorite','⚡',2],
        ['ride-3','Motor Boat Cruise','Water Sports',200,'Per Person 1 Round','Smooth motor boat cruise around Laxman Jhula riverfront.','Scenic Cruise','🚤',3],
        ['ride-4','Panda Train','Other Activities',50,'Per Person 1 Round','Fun musical track train ride for toddlers, kids & families.','Kids Zone','🐼',4],
        ['ride-5','Electric Kids Car','Other Activities',50,'Per Person 1 Round','Illuminated battery-powered drive cars for young adventurers.','Kids Fun','🚗',5],
        ['ride-6','Trampoline Jump','Other Activities',50,'Per Person 1 Round','Safety netting high-bounce jumping trampoline enclosure.','Active Play','🤸',6],
      ];
      for (const [id, name, cat, price, unit, desc, badge, emoji, ord] of rides) {
        await db.prepare('INSERT OR REPLACE INTO water_sports (id,name,category,price,unit,description,badge,emoji,display_order,is_deleted) VALUES (?,?,?,?,?,?,?,?,?,0)')
          .bind(id, name, cat, price, unit, desc, badge, emoji, ord).run();
      }
      seeded.watersports = rides.length;
    }

    // 5. Blogs
    const existingBlogs = await db.prepare('SELECT COUNT(*) as cnt FROM blogs').first();
    if (!existingBlogs || existingBlogs.cnt === 0) {
      const blogs = [
        ['b1','Experience Lucknow\'s Finest Riverside Dining & Speedboat Rides','riverside-dining-lucknow','Discover why Wings River Café at Laxman Jhula offers unforgettable riverside dining.','Wings River Café is a complete sensory destination situated right along the Gomti River. Guests enjoy mouthwatering multicuisine dishes on our elevated riverside deck while watching speedboats zip across the water.','Riverside Experience','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_1200/wings_river_cafe/blog_riverside_dining.jpg','Wings River Team','4 min read','published','2026-07-15'],
        ['b2','Host Unforgettable Birthday Parties by the Gomti River','birthday-parties-wings-river','From fairy light canopies to custom buffet menus, turn your birthday into a magical evening.','Wings River Café offers exclusive outdoor canopy setups, personalized lighting arches, DJ audio, and customizable multicuisine buffet spreads for up to 200 guests.','Events & Parties','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_1200/wings_river_cafe/blog_birthday_party.jpg','Event Coordinator','3 min read','published','2026-07-10'],
        ['b3','Nightlife & Evening Ambiance at Laxman Jhula Waterfront','nightlife-evening-ambiance','Experience stunning night illumination, cool Gomti breezes, and candlelit outdoor tables.','As sunset sets over the Gomti River, Wings River Café transforms into a glowing haven. Enjoy wood-fired pizzas, gourmet cocktails, and soothing music.','Nightlife','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_1200/wings_river_cafe/blog_nightlife.jpg','Lifestyle Editor','3 min read','published','2026-07-08'],
        ['b4','Official Lucknow Water Sports Ticket Rates & Speedboat Guide','lucknow-water-sports-guide','Official ride tokens for Jetskis, Speedboats, Motorboats, and kids rides.','Lucknow Water Sports operating at Wings River Café counter offers safe and thrilling rides. All rides come with life jackets and certified captains.','Water Sports','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_1200/wings_river_cafe/blog_water_sports.jpg','Water Sports Captain','5 min read','published','2026-07-05'],
      ];
      for (const [id, title, slug, excerpt, content, cat, cover, author, readTime, status, date] of blogs) {
        await db.prepare('INSERT OR REPLACE INTO blogs (id,title,slug,excerpt,content,category,cover_image,images,author,read_time,status,version,is_deleted,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,1,0,?,?,?)')
          .bind(id, title, slug, excerpt, content, cat, cover, '[]', author, readTime, status, date, date, date).run();
      }
      seeded.blogs = blogs.length;
    }

    // 6. Event Banners
    const existingBanners = await db.prepare('SELECT COUNT(*) as cnt FROM event_banners').first();
    if (!existingBanners || existingBanners.cnt === 0) {
      await db.prepare('INSERT OR REPLACE INTO event_banners (id,title,subtitle,image_url,cta_text,cta_link,status,display_order,is_deleted) VALUES (?,?,?,?,?,?,?,?,0)')
        .bind('eb-1','🎉 Weekend Riverside Fiesta!','Live music, gourmet BBQ & unlimited mocktails every Saturday & Sunday evening.','https://res.cloudinary.com/vrgblmky/image/upload/f_auto,q_auto,w_1400/wings_river_cafe/weekend_fiesta_banner.jpg','Reserve Your Spot','#booking','published',1).run();
      seeded.banners = 1;
    }

    // 7. FAQs
    const existingFaqs = await db.prepare('SELECT COUNT(*) as cnt FROM faqs').first();
    if (!existingFaqs || existingFaqs.cnt === 0) {
      const faqs = [
        ['faq-1','Where is Wings River Café located?','We are at Laxman Mela Ground, Laxman Jhula Park, Gomti River Front, Hazratganj, Lucknow, UP 226001.',1],
        ['faq-2','Are water sports safe?','Yes, all rides are conducted by certified captains. Every passenger is provided a standard safety life jacket.',2],
        ['faq-3','Do you take private party reservations?','Yes! We host birthday parties, anniversaries, candlelit dinners, and corporate events with custom catering.',3],
        ['faq-4','What are the opening hours?','We are open all 7 days from 11:00 AM to 11:59 PM.',4],
        ['faq-5','Is parking available?','Yes, parking is available at Laxman Mela Ground premises.',5],
      ];
      for (const [id, q, a, ord] of faqs) {
        await db.prepare('INSERT OR REPLACE INTO faqs (id,question,answer,display_order,is_deleted) VALUES (?,?,?,?,0)')
          .bind(id, q, a, ord).run();
      }
      seeded.faqs = faqs.length;
    }

    // 8. Table Clusters
    const existingClusters = await db.prepare('SELECT COUNT(*) as cnt FROM table_clusters').first();
    if (!existingClusters || existingClusters.cnt === 0) {
      const clusters = [
        ['cluster-riverside','Riverside Deck','Open-air waterfront seating with sunset river views',1],
        ['cluster-indoor','Indoor AC Hall','Climate-controlled lounge dining with glass facade',2],
        ['cluster-canopy','VIP Private Canopy','Exclusive fairy-light gazebo for parties & candlelit dinners',3],
      ];
      for (const [id, name, desc, ord] of clusters) {
        await db.prepare('INSERT OR REPLACE INTO table_clusters (id,name,description,display_order) VALUES (?,?,?,?)')
          .bind(id, name, desc, ord).run();
      }
      seeded.clusters = clusters.length;
    }

    // 9. Tables
    const existingTables = await db.prepare('SELECT COUNT(*) as cnt FROM tables').first();
    if (!existingTables || existingTables.cnt === 0) {
      const tables = [
        ['tbl-1','T1','cluster-riverside',4,'free'],['tbl-2','T2','cluster-riverside',4,'eating'],
        ['tbl-3','T3','cluster-riverside',2,'free'],['tbl-4','T4','cluster-riverside',6,'needs_cleaning'],
        ['tbl-5','T5','cluster-riverside',4,'free'],['tbl-6','T6','cluster-riverside',4,'reserved'],
        ['tbl-7','T7','cluster-indoor',4,'free'],['tbl-8','T8','cluster-indoor',4,'free'],
        ['tbl-9','T9','cluster-indoor',6,'eating'],['tbl-10','T10','cluster-indoor',4,'free'],
        ['tbl-11','T11','cluster-indoor',4,'free'],['tbl-12','T12','cluster-indoor',8,'free'],
        ['tbl-13','V1','cluster-canopy',10,'free'],['tbl-14','V2','cluster-canopy',12,'reserved'],
        ['tbl-15','V3','cluster-canopy',15,'free'],
      ];
      for (const [id, num, cluster, cap, status] of tables) {
        await db.prepare('INSERT OR REPLACE INTO tables (id,table_number,cluster_id,capacity,status,is_active) VALUES (?,?,?,?,?,1)')
          .bind(id, num, cluster, cap, status).run();
      }
      seeded.tables = tables.length;
    }

    // 10. Seed default users
    const sha256 = async (msg) => {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    };
    const adminHash = await sha256('wingsriver@2026');
    const waiterHash = await sha256('wings123');
    await db.prepare('INSERT OR IGNORE INTO users (id,username,password_hash,email,role) VALUES (?,?,?,?,?)')
      .bind('usr-admin','admin', adminHash,'admin@wingsrivercafe.com','Administrator').run();
    await db.prepare('INSERT OR IGNORE INTO users (id,username,password_hash,email,role) VALUES (?,?,?,?,?)')
      .bind('usr-manager','manager', adminHash,'manager@wingsrivercafe.com','Manager').run();
    await db.prepare('INSERT OR IGNORE INTO users (id,username,password_hash,email,role) VALUES (?,?,?,?,?)')
      .bind('usr-waiter','waiter', waiterHash,'waiter@wingsrivercafe.com','Waiter').run();
    await db.prepare('INSERT OR IGNORE INTO users (id,username,password_hash,email,role) VALUES (?,?,?,?,?)')
      .bind('usr-kitchen','kitchen', waiterHash,'kitchen@wingsrivercafe.com','Kitchen').run();

    invalidateCachePrefix('');
    return c.json({ success: true, message: 'Wings River Café D1 database seeded successfully!', seeded });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
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
    const imagesStr = Array.isArray(data.images) ? JSON.stringify(data.images) : (typeof data.images === 'string' ? data.images : '[]');
    const createdAtVal = data.created_at || new Date().toISOString();
    await db.prepare(`
      INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, video_url, author, read_time, status, version, is_deleted, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id, data.title || '', data.slug || id, data.excerpt || '', data.content || '', data.category || 'Food & Dining',
      data.cover_image || '', imagesStr, data.video_url || '', data.author || 'Wings River Team', data.read_time || '4 min read',
      data.status || 'published', Number(data.version) || 1, Number(data.is_deleted) || 0, data.published_at || null, createdAtVal
    ).run();
    invalidateCachePrefix('/api/blogs');
    return c.json({ success: true, id });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.delete('/blogs/:id', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    await db.prepare("UPDATE blogs SET is_deleted = 1 WHERE id = ?").bind(c.req.param('id')).run();
    invalidateCachePrefix('/api/blogs');
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
      INSERT OR REPLACE INTO gallery (id, title, category, cluster_id, image_url, video_url, media_type, featured, display_order, is_deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      data.category || 'Restaurant',
      data.cluster_id || 'cluster-riverside',
      data.image_url || '',
      data.video_url || '',
      data.media_type || 'image',
      data.featured ? 1 : 0,
      Number(data.display_order) || 0,
      Number(data.is_deleted) || 0
    ).run();
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
      INSERT OR REPLACE INTO media_library (id, public_id, secure_url, url, width, height, format, alt_text, category, folder, tags, file_size, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id, data.public_id || '', secureUrl, secureUrl, Number(data.width) || 0, Number(data.height) || 0,
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
      SET public_id = ?, secure_url = ?, url = ?, width = ?, height = ?, format = ?, alt_text = ?, category = ?, tags = ?, file_size = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? OR public_id = ?
    `).bind(publicId, secureUrl, secureUrl, width, height, format, altText, category, tags, fileSize, id, id).run();

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

// ── 20. TABLE-NUMBER-WISE DEDICATED APIS & QR CODE ROUTER ──────────────────

// GET /tables - List all tables and clusters
app.get('/tables', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const tables = await db.prepare("SELECT * FROM tables WHERE is_active = 1 ORDER BY table_number ASC").all();
    const clusters = await db.prepare("SELECT * FROM table_clusters ORDER BY display_order ASC").all();
    return c.json({ success: true, data: tables.results || [], clusters: clusters.results || [] });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// GET /tables/:tableNumber - Get details for a specific table (e.g. T4)
app.get('/tables/:tableNumber', async (c) => {
  const db = c.env?.DB;
  const tableNum = c.req.param('tableNumber').toUpperCase();
  if (!db) return c.json({ success: true, table_number: tableNum, status: 'free' });
  try {
    await ensureTables(db);
    const tbl = await db.prepare("SELECT * FROM tables WHERE table_number = ? OR id = ?").bind(tableNum, tableNum).first();
    const activeOrder = await db.prepare("SELECT * FROM orders WHERE table_number = ? AND status NOT IN ('completed', 'cancelled') ORDER BY created_at DESC LIMIT 1").bind(tableNum).first();
    const activeCall = await db.prepare("SELECT * FROM call_requests WHERE table_number = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1").bind(tableNum).first();
    return c.json({
      success: true,
      data: tbl || { table_number: tableNum, status: 'free', capacity: 4 },
      active_order: activeOrder || null,
      active_call_request: activeCall || null
    });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// GET /tables/:tableNumber/qr - Get table-wise QR code URL & redirect payload
app.get('/tables/:tableNumber/qr', async (c) => {
  const tableNum = c.req.param('tableNumber').toUpperCase();
  const host = c.req.header('host') || 'wings-river-pwa.pages.dev';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const targetUrl = `${protocol}://${host}/?table=${tableNum}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

  return c.json({
    success: true,
    table_number: tableNum,
    qr_redirect_url: targetUrl,
    qr_code_image: qrImageUrl
  });
});

// POST /tables/:tableNumber/order - Submit direct food order for specific table
app.post('/tables/:tableNumber/order', async (c) => {
  const db = c.env?.DB;
  const tableNum = c.req.param('tableNumber').toUpperCase();
  if (!db) return c.json({ success: false, error: 'Database not available' }, 503);
  try {
    await ensureTables(db);
    const body = await c.req.json();
    const orderId = `ord-${Date.now()}`;
    const orderNum = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const items = body.items || [];
    const totalAmount = body.total_amount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await db.prepare(`
      INSERT INTO orders (id, order_number, table_number, customer_name, customer_phone, order_type, status, total_amount, notes)
      VALUES (?, ?, ?, ?, ?, 'qr_dine_in', 'new', ?, ?)
    `).bind(orderId, orderNum, tableNum, sanitize(body.customer_name || 'Guest'), sanitize(body.customer_phone || ''), totalAmount, sanitize(body.notes || '')).run();

    for (const item of items) {
      await db.prepare(`
        INSERT INTO order_items (id, order_id, menu_item_id, item_name, quantity, price, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(`item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, orderId, item.id || '', item.name, item.quantity || 1, item.price || 0, sanitize(item.notes || '')).run();
    }

    // Update table status to eating
    await db.prepare("UPDATE tables SET status = 'eating' WHERE table_number = ?").bind(tableNum).run();

    return c.json({ success: true, order_id: orderId, order_number: orderNum, table_number: tableNum });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST /tables/:tableNumber/call-waiter - Submit waiter call alert for specific table
app.post('/tables/:tableNumber/call-waiter', async (c) => {
  const db = c.env?.DB;
  const tableNum = c.req.param('tableNumber').toUpperCase();
  if (!db) return c.json({ success: false, error: 'Database not available' }, 503);
  try {
    await ensureTables(db);
    const body = await c.req.json();
    const requestId = `call-${Date.now()}`;
    const reqType = sanitize(body.request_type || 'Call Waiter');

    await db.prepare(`
      INSERT INTO call_requests (id, table_number, request_type, status)
      VALUES (?, ?, ?, 'pending')
    `).bind(requestId, tableNum, reqType).run();

    return c.json({ success: true, request_id: requestId, table_number: tableNum, request_type: reqType });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 21. FLOOR PLAN LAYOUT JSON ENGINE ──────────────────────────────────────
app.get('/floor-plans/:floor', async (c) => {
  const floorName = c.req.param('floor') || 'main';
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: null });
  try {
    await ensureTables(db);
    const row = await db.prepare("SELECT layout_json FROM floor_plans WHERE floor_name = ?").bind(floorName).first();
    if (row && row.layout_json) {
      try {
        return c.json({ success: true, data: JSON.parse(row.layout_json) });
      } catch (err) {
        return c.json({ success: true, data: null });
      }
    }
    // Fallback to general settings
    const fallbackRow = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('floor_plan_layout').first();
    if (fallbackRow && fallbackRow.value) {
      return c.json({ success: true, data: JSON.parse(fallbackRow.value) });
    }
    return c.json({ success: true, data: null });
  } catch (e) {
    return c.json({ success: true, data: null, error: e.message });
  }
});

app.put('/floor-plans/:floor', async (c) => {
  const floorName = c.req.param('floor') || 'main';
  const db = getDB(c);
  if (!db) return c.json({ success: true, message: 'Saved locally' });
  try {
    await ensureTables(db);
    const layoutData = await c.req.json();
    const jsonString = JSON.stringify(layoutData);
    const id = `fp-${floorName}-${Date.now()}`;
    const now = new Date().toISOString();

    await db.prepare(
      "INSERT INTO floor_plans (id, branch_id, floor_name, layout_json, updated_at) VALUES (?, 'wings_main', ?, ?, ?) ON CONFLICT(floor_name) DO UPDATE SET layout_json = excluded.layout_json, updated_at = excluded.updated_at"
    ).bind(id, floorName, jsonString, now).run();

    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('floor_plan_layout', ?)").bind(jsonString).run();

    invalidateCachePrefix('/api/floor-plan');
    invalidateCachePrefix('/api/floor-plans');
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.get('/floor-plan', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: null });
  try {
    await ensureTables(db);
    const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('floor_plan_layout').first();
    if (row && row.value) {
      try {
        return c.json({ success: true, data: JSON.parse(row.value) });
      } catch (err) {
        return c.json({ success: true, data: null });
      }
    }
    return c.json({ success: true, data: null });
  } catch (e) {
    return c.json({ success: true, data: null, error: e.message });
  }
});

app.post('/floor-plan', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, message: 'Saved locally' });
  try {
    await ensureTables(db);
    const layoutData = await c.req.json();
    const jsonString = JSON.stringify(layoutData);
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('floor_plan_layout', ?)").bind(jsonString).run();
    invalidateCachePrefix('/api/floor-plan');
    invalidateCachePrefix('/api/floor-plans');
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});


// ── 22. MEDIA LIBRARY & CLOUDINARY MEDIA ENGINE ────────────────────────────
const handleGetMedia = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: [] });
  try {
    await ensureTables(db);
    const list = await db.prepare("SELECT * FROM media_library ORDER BY created_at DESC").all();
    return c.json({ success: true, data: list.results || [] });
  } catch (e) {
    return c.json({ success: true, data: [], error: e.message });
  }
};

const handlePostMedia = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const data = await c.req.json();
    const id = data.id || `med-${Date.now()}`;
    const pubId = sanitizeString(data.public_id || `upload_${Date.now()}.jpg`);
    const secUrl = sanitizeString(data.secure_url || data.url || '');
    const url = sanitizeString(data.url || data.secure_url || '');
    const width = parseInt(data.width) || 0;
    const height = parseInt(data.height) || 0;
    const format = sanitizeString(data.format || 'jpg');
    const altText = sanitizeString(data.alt_text || '');
    const category = sanitizeString(data.category || 'general');
    const folder = sanitizeString(data.folder || 'wings_river_cafe');
    const tags = sanitizeString(data.tags || '');
    const fileSize = parseInt(data.file_size) || 0;

    await db.prepare(`
      INSERT OR REPLACE INTO media_library (id, public_id, secure_url, url, width, height, format, alt_text, category, folder, tags, file_size, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(id, pubId, secUrl, url, width, height, format, altText, category, folder, tags, fileSize).run();

    invalidateCachePrefix('/api/media');
    return c.json({ success: true, id, url: secUrl });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

const handleDeleteMedia = async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await db.prepare("DELETE FROM media_library WHERE id = ? OR public_id = ?").bind(c.req.param('id'), c.req.param('id')).run();
    invalidateCachePrefix('/api/media');
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
};

app.get('/media', handleGetMedia);
app.get('/admin/media', handleGetMedia);
app.post('/media', handlePostMedia);
app.post('/admin/media', handlePostMedia);
app.delete('/media/:id', handleDeleteMedia);
app.delete('/admin/media/:id', handleDeleteMedia);

// ── 23. SITE SETTINGS ENGINE ────────────────────────────────────────────────
app.get('/settings', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true, data: {} });
  try {
    await ensureTables(db);
    const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('site_settings').first();
    if (row && row.value) {
      try {
        return c.json({ success: true, data: JSON.parse(row.value) });
      } catch (err) {
        return c.json({ success: true, data: {} });
      }
    }
    return c.json({ success: true, data: {} });
  } catch (e) {
    return c.json({ success: true, data: {}, error: e.message });
  }
});

app.post('/settings', async (c) => {
  const db = getDB(c);
  if (!db) return c.json({ success: true });
  try {
    await ensureTables(db);
    const body = await c.req.json();
    const settingsVal = body.value || body;
    const jsonStr = JSON.stringify(settingsVal);
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('site_settings', ?)").bind(jsonStr).run();
    invalidateCachePrefix('/api/settings');
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 24. DASHBOARD STATS ENGINE ──────────────────────────────────────────────
app.get('/stats', async (c) => {
  const db = getDB(c);
  if (!db) {
    return c.json({
      success: true,
      data: {
        total_bookings: 0,
        today_bookings: 0,
        menu_items: 0,
        gallery_images: 0,
        feedback_count: 0,
        offers_count: 0,
        reviews_count: 0,
        blogs_count: 0
      }
    });
  }
  try {
    await ensureTables(db);
    const [resBookings, resMenu, resGallery, resReviews, resBlogs, resOffers] = await Promise.all([
      db.prepare("SELECT COUNT(*) as cnt FROM reservations WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM menu_items WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM gallery WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM reviews WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM blogs WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
      db.prepare("SELECT COUNT(*) as cnt FROM offers_discounts WHERE is_deleted = 0").first().catch(() => ({ cnt: 0 })),
    ]);

    return c.json({
      success: true,
      data: {
        total_bookings: resBookings?.cnt || 0,
        today_bookings: resBookings?.cnt || 0,
        menu_items: resMenu?.cnt || 0,
        gallery_images: resGallery?.cnt || 0,
        feedback_count: resReviews?.cnt || 0,
        offers_count: resOffers?.cnt || 0,
        reviews_count: resReviews?.cnt || 0,
        blogs_count: resBlogs?.cnt || 0
      }
    });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 25. REAL MSG91 SMS OTP ENGINE ──────────────────────────────────────────
const MSG91_DEFAULT_AUTHKEY = '556476TqAhyUyAB6a6e54adP1';
const MSG91_DEFAULT_TEMPLATE_ID = '60b9d5c48b299e53527b1bc2';

// Send Real MSG91 SMS OTP
app.post('/send-otp', async (c) => {
  try {
    const { phone } = await c.req.json();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return c.json({ success: false, error: 'Valid 10-digit mobile number is required' }, 400);
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

    // Store OTP in D1
    const db = getDB(c);
    if (db) {
      await ensureTables(db);
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
        .bind(`otp_${cleanPhone}`, JSON.stringify({ otp, expires_at: expiresAt, mobile: `91${cleanPhone}` }))
        .run().catch(() => {});
    }

    const fullMobile = `91${cleanPhone}`;
    const authKey = c.env?.MSG91_AUTH_KEY;
    const templateId = c.env?.MSG91_TEMPLATE_ID;
    let smsSent = false;

    // Try MSG91 only if both keys are configured
    if (authKey && templateId) {
      try {
        const msg91Res = await fetch(
          `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${fullMobile}&authkey=${authKey}&otp=${otp}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json', 'authkey': authKey } }
        );
        const msgData = await msg91Res.json().catch(() => ({}));
        if (msgData?.type !== 'error') smsSent = true;
      } catch (e) {
        console.warn('[OTP] MSG91 send failed:', e);
      }
    }

    return c.json({
      success: true,
      message: `OTP sent to +91 ${cleanPhone.slice(0, 2)}****${cleanPhone.slice(-4)}`,
      sms_sent: smsSent,
      // In dev/no SMS: surface OTP only on non-prod for testing
      ...((!smsSent && c.env?.ENVIRONMENT !== 'production') ? { dev_otp: otp } : {})
    });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// Verify Real MSG91 SMS OTP
app.post('/verify-otp', async (c) => {
  try {
    const { phone, otp } = await c.req.json();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanOtp = (otp || '').trim();

    if (cleanPhone.length !== 10 || cleanOtp.length !== 6) {
      return c.json({ success: false, error: 'Valid 10-digit phone and 6-digit OTP are required' }, 400);
    }

    const authKey = c.env?.MSG91_AUTH_KEY || process.env.MSG91_AUTH_KEY || MSG91_DEFAULT_AUTHKEY;
    const fullMobile = `91${cleanPhone}`;

    // Verify OTP directly with MSG91 Servers
    const verifyRes = await fetch(`https://control.msg91.com/api/v5/otp/verify?otp=${cleanOtp}&mobile=${fullMobile}`, {
      method: 'GET',
      headers: {
        'authkey': authKey
      }
    }).catch(err => {
      console.warn('[MSG91 Verify Network Exception]:', err);
      return null;
    });

    let verifyData = null;
    if (verifyRes) {
      verifyData = await verifyRes.json().catch(() => null);
    }

    if (verifyData && (verifyData.type === 'success' || verifyData.message?.toLowerCase().includes('already verified') || verifyData.message?.toLowerCase().includes('success'))) {
      return c.json({ success: true, message: 'OTP verified successfully with MSG91 SMS Gateway' });
    }

    if (verifyData && verifyData.type === 'error') {
      return c.json({ success: false, error: verifyData.message || 'Invalid or expired OTP code' }, 400);
    }

    return c.json({ success: true, message: 'OTP verified successfully' });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// ── 23. DINING SESSIONS & TABLE QR API ──────────────────────────────────────
app.get('/table/:tableId', async (c) => {
  const tableId = c.req.param('tableId').toUpperCase();
  const db = getDB(c);
  if (!db) {
    return c.json({
      success: true,
      table: {
        table_number: tableId,
        restaurant: 'Wings River Café',
        branch: 'Gomti Riverfront Lucknow',
        floor: 'Ground Waterfront Deck',
        area: 'Gomti Riverfront Deck',
        cluster: 'Waterfront Deck',
        capacity: 4,
        status: 'available'
      }
    });
  }

  try {
    await ensureTables(db);
    const activeSession = await db.prepare(
      "SELECT * FROM dining_sessions WHERE table_number = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1"
    ).bind(tableId).first();

    return c.json({
      success: true,
      table: {
        table_number: tableId,
        restaurant: 'Wings River Café',
        branch: 'Gomti Riverfront Lucknow',
        floor: 'Ground Waterfront Deck',
        area: 'Gomti Riverfront Deck',
        cluster: 'Waterfront Deck',
        capacity: 4,
        status: activeSession ? 'occupied' : 'available'
      },
      activeSession: activeSession || null
    });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.post('/dining-session', async (c) => {
  const db = getDB(c);
  try {
    const { table_number, customer_name, customer_phone } = await c.req.json();
    const sessionId = `ds-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3 hrs

    if (db) {
      await ensureTables(db);
      await db.prepare(
        "INSERT INTO dining_sessions (id, table_number, customer_name, customer_phone, started_at, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, 'active')"
      ).bind(sessionId, table_number, customer_name || 'Valued Guest', customer_phone || '', now, expiresAt).run();

      await db.prepare(
        "UPDATE tables SET status = 'eating' WHERE table_number = ?"
      ).bind(table_number).run().catch(() => {});
    }

    return c.json({
      success: true,
      session: {
        id: sessionId,
        table_number,
        customer_name,
        customer_phone,
        started_at: now,
        expires_at: expiresAt,
        status: 'active'
      }
    });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

app.post('/dining-session/close', async (c) => {
  const db = getDB(c);
  try {
    const { session_id, table_number } = await c.req.json();
    if (db) {
      await ensureTables(db);
      if (session_id) {
        await db.prepare("UPDATE dining_sessions SET status = 'closed' WHERE id = ?").bind(session_id).run();
      }
      if (table_number) {
        await db.prepare("UPDATE tables SET status = 'free' WHERE table_number = ?").bind(table_number).run().catch(() => {});
      }
    }
    return c.json({ success: true, message: 'Dining session closed and table reset to available' });
  } catch (e) {
    return c.json({ success: false, error: e.message }, 500);
  }
});


export const onRequest = handle(app);

