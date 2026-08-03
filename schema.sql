-- Cloudflare D1 Database Schema for Wings River Café WordPress-like CMS
-- Database ID: 912b607b-c192-4e0a-89ba-75f936fca45c

-- Drop existing tables to ensure clean recreation during upgrade
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS offers_discounts;
DROP TABLE IF EXISTS water_sports;
DROP TABLE IF EXISTS event_banners;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS menu_pages;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS menu_categories;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS media_library;
DROP TABLE IF EXISTS users;

-- 1. Users Table for JWT & RBAC Auth
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'Author', -- Administrator, Editor, Author
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Media Library Table
CREATE TABLE IF NOT EXISTS media_library (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  file_size INTEGER DEFAULT 0,
  dimensions TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT DEFAULT '',
  status TEXT DEFAULT 'draft', -- draft, published, scheduled
  display_order INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  is_deleted INTEGER DEFAULT 0, -- soft delete flag (0 = active, 1 = deleted)
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_deleted ON pages(is_deleted);

-- 4. Menu Categories Table
CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON menu_categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_deleted ON menu_categories(is_deleted);

-- 5. Menu Items Table (normalized relationship with categories)
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL DEFAULT 0.0,
  is_veg INTEGER DEFAULT 1,
  image_url TEXT DEFAULT '',
  is_available INTEGER DEFAULT 1,
  is_bestseller INTEGER DEFAULT 0,
  badge TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_deleted ON menu_items(is_deleted);

-- 6. Menu Booklet Pages Table
CREATE TABLE IF NOT EXISTS menu_pages (
  page_number INTEGER PRIMARY KEY,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  image TEXT DEFAULT '',
  categories TEXT DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_pages_deleted ON menu_pages(is_deleted);

-- 7. Blog Posts Table
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'Food & Dining',
  cover_image TEXT DEFAULT '',
  images TEXT DEFAULT '[]', -- JSON string array
  video_url TEXT DEFAULT '',
  author TEXT DEFAULT 'Wings River Team',
  read_time TEXT DEFAULT '4 min read',
  status TEXT DEFAULT 'draft', -- draft, published, scheduled
  version INTEGER DEFAULT 1,
  is_deleted INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_deleted ON blogs(is_deleted);

-- 8. Photo Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Restaurant',
  image_url TEXT NOT NULL,
  featured INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_deleted ON gallery(is_deleted);

-- 9. Testimonials / Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  date_str TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- pending, approved, spam
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_deleted ON reviews(is_deleted);

-- 10. Contact Messages & Feedback Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- unread, read, archived
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_deleted ON contact_messages(is_deleted);

-- 11. Event Banners Table
CREATE TABLE IF NOT EXISTS event_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  status TEXT DEFAULT 'draft', -- draft, published
  display_order INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banners_deleted ON event_banners(is_deleted);

-- 12. Water Sports / Rides Table
CREATE TABLE IF NOT EXISTS water_sports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Water Sports',
  price REAL DEFAULT 0.0,
  unit TEXT DEFAULT 'Per Person',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  image TEXT DEFAULT '',
  emoji TEXT DEFAULT '🏄',
  display_order INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rides_deleted ON water_sports(is_deleted);

-- 13. Offers & Discounts Table
CREATE TABLE IF NOT EXISTS offers_discounts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  discount_value REAL NOT NULL DEFAULT 0.0,
  discount_type TEXT DEFAULT 'percentage', -- percentage, flat
  status TEXT DEFAULT 'draft', -- draft, active, expired
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offers_code ON offers_discounts(code);
CREATE INDEX IF NOT EXISTS idx_offers_deleted ON offers_discounts(is_deleted);

-- 14. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faqs_deleted ON faqs(is_deleted);

-- 15. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT DEFAULT '',
  image TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_team_deleted ON team_members(is_deleted);

-- 16. Site Settings Table (Key-Value)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 17. Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  booking_type TEXT NOT NULL DEFAULT 'table_booking', -- table_booking, party_booking, speedboat_ride
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER DEFAULT 2,
  special_requests TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_deleted ON reservations(is_deleted);

-- 18. Audit Logs Table for Admin Actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL, -- CREATE, EDIT, DELETE, RESTORE, etc.
  details TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 19. Table Clusters Table
CREATE TABLE IF NOT EXISTS table_clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 20. Restaurant Floor Tables Table
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  table_number TEXT UNIQUE NOT NULL,
  cluster_id TEXT DEFAULT 'riverside',
  capacity INTEGER DEFAULT 4,
  shape TEXT DEFAULT 'rectangle', -- rectangle, round, canopy
  x_position INTEGER DEFAULT 0,
  y_position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'free', -- free, eating, needs_cleaning, reserved
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);

-- 21. Table Hold Lock Timer Table
CREATE TABLE IF NOT EXISTS table_holds (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  hold_expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 22. Party & Canopy Bookings Table
CREATE TABLE IF NOT EXISTS party_bookings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  event_type TEXT DEFAULT 'Birthday', -- Birthday, Corporate, Anniversary, Celebration
  event_date TEXT NOT NULL,
  time_slot TEXT DEFAULT 'Evening 7:00 PM',
  guest_count INTEGER DEFAULT 10,
  canopy_name TEXT DEFAULT 'Riverside Canopy 1',
  custom_notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 23. Food Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  table_id TEXT DEFAULT '',
  table_number TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  order_type TEXT DEFAULT 'qr_dine_in', -- qr_dine_in, waiter_dine_in, takeaway
  status TEXT DEFAULT 'new', -- new, preparing, ready, served, completed, cancelled
  total_amount REAL DEFAULT 0.0,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 24. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  menu_item_id TEXT DEFAULT '',
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price REAL NOT NULL DEFAULT 0.0,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- pending, cooking, ready, served
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 25. Call Requests (Waiter Alert) Table
CREATE TABLE IF NOT EXISTS call_requests (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL,
  table_number TEXT NOT NULL,
  request_type TEXT NOT NULL, -- water, spoon, tissue, waiter
  status TEXT DEFAULT 'pending', -- pending, resolved
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  resolved_by TEXT
);

-- 26. Bills & Payments Ledger Table
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  order_id TEXT DEFAULT '',
  table_id TEXT DEFAULT '',
  table_number TEXT DEFAULT '',
  customer_name TEXT DEFAULT 'Guest',
  customer_phone TEXT DEFAULT '',
  subtotal REAL DEFAULT 0.0,
  gst_amount REAL DEFAULT 0.0,
  service_charge REAL DEFAULT 0.0,
  discount_amount REAL DEFAULT 0.0,
  total_amount REAL DEFAULT 0.0,
  payment_method TEXT DEFAULT 'cash', -- cash, upi, card, online
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  paid_at TEXT
);

-- 27. Table QR Codes Table
CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY,
  table_id TEXT UNIQUE NOT NULL,
  table_number TEXT NOT NULL,
  qr_image_url TEXT DEFAULT '',
  redirect_url TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 28. Customer CRM Database Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  total_bookings INTEGER DEFAULT 0,
  total_spent REAL DEFAULT 0.0,
  vip_status INTEGER DEFAULT 0, -- 0 = normal, 1 = VIP
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

PRAGMA foreign_keys = ON;

