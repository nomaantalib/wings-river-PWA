-- Cloudflare D1 Database Schema for Wings River Café
-- Database ID: c2491a90-0f90-4a1e-8a4d-852e6588a68a

-- Reservations / Bookings Table (Table, Party, Water Sports)
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  booking_type TEXT NOT NULL DEFAULT 'table_booking', -- 'table_booking', 'birthday_party', 'anniversary', 'corporate_event', 'romantic_dinner', 'speedboat_ride'
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 2,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Food Menu Table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- 'Starter', 'Indian', 'Chinese', 'Italian', 'Pizza', 'Burger', 'Coffee', 'Desserts', 'Drinks'
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  is_veg INTEGER NOT NULL DEFAULT 1, -- 1 for Veg, 0 for Non-Veg
  image_url TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table (WordPress Style)
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Food & Dining', -- 'Events', 'Recipes', 'Riverside Stories', 'Offers', 'Water Sports'
  cover_image TEXT,
  author TEXT DEFAULT 'Wings River Team',
  read_time TEXT DEFAULT '4 min read',
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Photo Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Restaurant', -- 'Restaurant', 'Food', 'River View', 'Evening', 'Outdoor Seating', 'Coffee', 'Desserts', 'Water Sports'
  image_url TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer Reviews Table
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

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
