-- Cloudflare D1 Database Schema for Wings River Café
-- Database ID: c2491a90-0f90-4a1e-8a4d-852e6588a68a

-- 1. Reservations / Bookings Table
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  booking_type TEXT NOT NULL DEFAULT 'table_booking',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 2,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Food Menu Table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  is_veg INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  page_number INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Menu Booklet Pages Table
CREATE TABLE IF NOT EXISTS menu_pages (
  page_number INTEGER PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  image TEXT DEFAULT '',
  categories TEXT DEFAULT '[]',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Blog Posts Table
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Food & Dining',
  cover_image TEXT,
  images TEXT,
  author TEXT DEFAULT 'Wings River Team',
  read_time TEXT DEFAULT '4 min read',
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Photo Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Restaurant',
  image_url TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Customer Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL,
  date_str TEXT NOT NULL,
  avatar_url TEXT,
  is_approved INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Event Banners Table
CREATE TABLE IF NOT EXISTS event_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Water Sports Rides Table
CREATE TABLE IF NOT EXISTS water_sports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Water Sports',
  price REAL DEFAULT 0,
  unit TEXT DEFAULT 'Per Person',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  image TEXT DEFAULT '',
  emoji TEXT DEFAULT '🏄',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Site Settings Table (Key-Value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
