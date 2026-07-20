-- Cloudflare D1 Database Schema and Seed Data for Wings River Café
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

-- ══════════════════════════════════════════════════════════════════════════════
--  SEEDING INITIAL DATABASE RECORDS
-- ══════════════════════════════════════════════════════════════════════════════

-- settings
INSERT OR REPLACE INTO settings (key, value) VALUES ('wings_hero', '{"badgeText":"✨ Lucknow’s Premier Waterfront Dining & Water Sports Destination","mainHeadline":"Wings River Café & Water Sports","subHeadline":"Multicuisine Gourmet Food, Riverside Deck & Thrilling Speedboat Rides","contactPhone":"07310008020","slides":[{"id":"hs-1","image":"/images/Screenshot_20260720-180544_Maps.png","title":"Wings River Café","subtitle":"Taste • Eat • Relax by the Gomti River","tag":"Lucknow Water Sports & Speedboat Rides"},{"id":"hs-2","image":"/images/Screenshot_20260720-180555_Maps.png","title":"Luxurious Riverside Dining","subtitle":"Multicuisine Delights with Scenic Sunset Views","tag":"Family Restaurant & Evening Ambience"},{"id":"hs-3","image":"/images/Screenshot_20260720-180609_Maps.png","title":"Celebrations & Party Canopy","subtitle":"Birthday Parties, Anniversaries & Romantic Dinners","tag":"Fairy Light Arches & Custom Catering"},{"id":"hs-4","image":"/images/Screenshot_20260720-180745_Maps.png","title":"Speedboat Rides on River Gomti","subtitle":"Exhilarating Water Sports Adventures Beside the Cafe","tag":"Lucknow Water Sports Official Hub"},{"id":"hs-5","image":"/images/Screenshot_20260720-180621_Maps.png","title":"Breathtaking Sunset Riverfront","subtitle":"Relax with Gourmet Coffee & Coolers by Laxman Jhula Bridge","tag":"Scenic Sunset & Waterfront Deck"},{"id":"hs-6","image":"/images/Screenshot_20260720-180644_Maps.png","title":"Glow of Waterfront Nightlife","subtitle":"Enchanting Lighting, Music & River Breeze Evenings","tag":"Lucknow’s Top Waterfront Night Venue"},{"id":"hs-7","image":"/images/Screenshot_20260720-180927_Instagram.png","title":"Master Chef Gourmet Spread","subtitle":"Authentic Indian, Indochinese & Artisanal Pizzas","tag":"Premium Multicuisine Gastronomy"}]}');

-- event_banners
INSERT OR REPLACE INTO event_banners (id, title, subtitle, image_url, cta_text, cta_link, is_active, created_at) VALUES
('eb-1', '🎉 Weekend Riverside Fiesta!', 'Live music, gourmet BBQ & unlimited mocktails every Saturday & Sunday evening.', '/images/Screenshot_20260720-180609_Maps.png', 'Reserve Your Spot', '#booking', 1, '2026-07-20T18:00:00Z');

-- water_sports
INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, created_at) VALUES
('ride-1', 'Jetski Thrill Ride', 'Water Sports', 350, 'Per Person 1 Round', 'High speed jet ski adventure on Gomti river with certified instructor & life jacket.', 'Most Popular', '/images/Screenshot_20260720-180544_Maps.png', '🏄', '2026-07-20T18:00:00Z'),
('ride-2', 'Speed Boat Ride', 'Water Sports', 250, 'Per Person 1 Round', 'Exhilarating twin-engine speedboat ride offering panoramic riverfront views.', 'Family Favorite', '/images/Screenshot_20260720-180745_Maps.png', '⚡', '2026-07-20T18:00:00Z'),
('ride-3', 'Motor Boat Cruise', 'Water Sports', 200, 'Per Person 1 Round', 'Smooth & comfortable motor boat cruise around Laxman Jhula park riverfront.', 'Scenic Cruise', '/images/Screenshot_20260720-180555_Maps.png', '🚤', '2026-07-20T18:00:00Z'),
('ride-4', 'Panda Train', 'Other Activities', 50, 'Per Person 1 Round', 'Fun musical track train ride for toddlers, kids & families near the river park.', 'Kids Zone', '/images/Screenshot_20260720-180737_Maps.png', '🐼', '2026-07-20T18:00:00Z'),
('ride-5', 'Electric Kids Car', 'Other Activities', 50, 'Per Person 1 Round', 'Illuminated battery-powered electric drive cars for young adventurers.', 'Kids Fun', '/images/Screenshot_20260720-180621_Maps.png', '🚗', '2026-07-20T18:00:00Z'),
('ride-6', 'Trampoline Jump', 'Other Activities', 50, 'Per Person 1 Round', 'Enclosed safety netting high-bounce jumping trampoline enclosure.', 'Active Play', '/images/Screenshot_20260720-180724_Maps.png', '🤸', '2026-07-20T18:00:00Z');

-- reviews
INSERT OR REPLACE INTO reviews (id, author_name, rating, review_text, date_str, avatar_url, is_approved, created_at) VALUES
('r1', 'Ananya Sharma', 5, 'Amazing riverside view with great food! The paneer tikka and cold coffee were fantastic. Riding the speedboat before dinner was the highlight of our weekend!', '2 days ago', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 1, '2026-07-20T18:00:00Z'),
('r2', 'Rahul Verma', 5, 'Celebrated my sister’s 25th birthday here. The fairy light decoration near the river was magical. Staff were very courteous and the food was delicious!', '1 week ago', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 1, '2026-07-20T18:00:00Z');

-- menu_pages
INSERT OR REPLACE INTO menu_pages (page_number, title, subtitle, image, categories, updated_at) VALUES
(1, 'Wings River & Water Sports Menu', 'Delicious Moments, Unforgettable Memories', '/menu card food/page1.png', '["Cover"]', '2026-07-20T18:00:00Z'),
(2, 'Beverages, Breakfast & Chaat', 'Chai, Chola Bhatura, Pav Bhaji & Agra Bhalla', '/menu card food/page2.png', '["Beverages","Breakfast","Chaat"]', '2026-07-20T18:00:00Z'),
(3, 'Coolers & Mocktails', 'Virgin Mojito, Blue Lagoon, Iced Teas & Lassi', '/menu card food/page 3.png', '["Coolers & Mocktails"]', '2026-07-20T18:00:00Z'),
(4, 'Shakes & Gourmet Soups', 'Oreo Shake, Cold Coffee, Manchow & Sweet Corn', '/menu card food/page4 .png', '["Shakes","Soup"]', '2026-07-20T18:00:00Z'),
(5, 'Indian Main Course & South Indian', 'Butter Chicken, Dal Makhani, Paneer Lababdar & Thalis', '/menu card food/page 5.png', '["Indian","South Indian"]', '2026-07-20T18:00:00Z'),
(6, 'Pizza, Burger & Sandwiches', 'Loaded Wings Pizza, Paneer Burger & Garlic Breads', '/menu card food/page6 .png', '["Pizza","Burger","Sandwiches"]', '2026-07-20T18:00:00Z'),
(7, 'Chinese Woks & Sizzlers', 'Hakka Noodles, Chilli Paneer, Manchurian & Sizzlers', '/menu card food/page 7.png', '["Chinese","Sizzlers"]', '2026-07-20T18:00:00Z'),
(8, 'Indo-Continental Bites & Desserts', 'Pastas, Paneer Tikka, Gulab Jamun & Shahi Tukda', '/menu card food/page 8.png', '["Indo-Continental","Dessert"]', '2026-07-20T18:00:00Z');

-- gallery
INSERT OR REPLACE INTO gallery (id, title, category, image_url, featured, created_at) VALUES
('g1', 'Jet Ski Thrill Ride — Gomti River', 'Water Sports', '/images/Screenshot_20260720-180544_Maps.png', 1, '2026-07-20T18:00:00Z'),
('g2', 'Speedboat Action Shot — Gomti', 'Water Sports', '/images/Screenshot_20260720-180745_Maps.png', 1, '2026-07-20T18:00:00Z'),
('g3', 'Water Sports Activity Poster', 'Water Sports', '/images/watersports_menu.jpg', 1, '2026-07-20T18:00:00Z'),
('g4', 'Motorboat Cruise — Laxman Jhula', 'Water Sports', '/images/Screenshot_20260720-180555_Maps.png', 1, '2026-07-20T18:00:00Z'),
('g5', 'Fairy Light Canopy Evening Setup', 'Evening', '/images/Screenshot_20260720-180609_Maps.png', 1, '2026-07-20T18:00:00Z'),
('g6', 'Sunset Gomti Riverfront Lounge', 'River View', '/images/Screenshot_20260720-180621_Maps.png', 1, '2026-07-20T18:00:00Z'),
('g7', 'Nighttime Waterfront Party Lights', 'Evening', '/images/Screenshot_20260720-180644_Maps.png', 1, '2026-07-20T18:00:00Z'),
('g8', 'Riverside Lounge Evening Ambience', 'Evening', '/images/Screenshot_20260720-180755_Maps.png', 0, '2026-07-20T18:00:00Z'),
('g9', 'Cozy Indoor Dining Lounge', 'Restaurant', '/images/Screenshot_20260720-180630_Maps.png', 0, '2026-07-20T18:00:00Z'),
('g10', 'Café Entrance — Laxman Mela Ground', 'Outdoor Seating', '/images/Screenshot_20260720-180724_Maps.png', 0, '2026-07-20T18:00:00Z'),
('g11', 'Outdoor Riverside Lawn & Garden Tables', 'Outdoor Seating', '/images/Screenshot_20260720-180737_Maps.png', 0, '2026-07-20T18:00:00Z'),
('g12', 'Customer Dining Deck & Celebration Venue', 'Outdoor Seating', '/images/Screenshot_20260720-180812_Maps.png', 0, '2026-07-20T18:00:00Z'),
('g13', 'Instagram Highlight: Deck Vibe', 'Restaurant', '/images/Screenshot_20260720-175721_Instagram.png', 0, '2026-07-20T18:00:00Z'),
('g14', 'Chef Special Gourmet Food Spread', 'Food', '/images/Screenshot_20260720-180927_Instagram.png', 1, '2026-07-20T18:00:00Z'),
('g15', 'Signature Drinks & Mocktail Bar', 'Food', '/images/Screenshot_20260720-180938_Instagram.png', 1, '2026-07-20T18:00:00Z');

-- menu_items
INSERT OR REPLACE INTO menu_items (id, category, name, description, price, is_veg, image_url, is_available, page_number, created_at) VALUES
('m1', 'Beverages', 'Special Masala Chai', 'Freshly brewed kulhad tea with cardamoms & ginger.', 50, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m2', 'Beverages', 'Fresh Lime Soda', 'Sweet or salted sparkling fresh lime soda.', 60, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m3', 'Breakfast', 'Bun Makkhan', 'Soft toasted bun stuffed with rich farm butter.', 60, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m4', 'Breakfast', 'Special Chola Bhatura', 'Piping hot fluffy bhaturas served with spicy Amritsari chole.', 150, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m5', 'Breakfast', 'Paneer Paratha', 'Stuffed cottage cheese paratha served with curd & pickle.', 110, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m6', 'Breakfast', 'Dahi Jalebi (200gm)', 'Crispy golden jalebis paired with fresh thick curd.', 150, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m7', 'Chaat', 'Special Pav Bhaji', 'Butter-loaded spicy mashed vegetable bhaji served with toasted pavs.', 150, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m8', 'Chaat', 'Cheese Butter Pav Bhaji', 'Gratinated melted cheese topped over butter pav bhaji.', 170, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m9', 'Chaat', 'Agra Ka Special Bhalla', 'Crispy potato bhalla topped with sweet curd & mint chutney.', 80, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m10', 'Chaat', 'Lucknowi Basket Chaat', 'Crispy potato basket filled with tikkis, sprouts & curd.', 150, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m11', 'Chaat', 'Gol Gappe (6 Pcs)', 'Crispy puris filled with spicy mint water & tangy chutney.', 40, 1, '/images/menu_page_1.png', 1, 2, '2026-07-20T18:00:00Z'),
('m12', 'Drinks', 'Virgin Mojito', 'Fresh mint, lime wedges, crushed ice & sparkling soda.', 119, 1, '/images/menu_page_2.png', 1, 3, '2026-07-20T18:00:00Z'),
('m13', 'Drinks', 'Blue Lagoon Cooler', 'Refreshing curacao blue citrus cooler with lemon zest.', 129, 1, '/images/menu_page_2.png', 1, 3, '2026-07-20T18:00:00Z'),
('m14', 'Drinks', 'Watermelon Sunset Mojito', 'Fresh watermelon extract, mint & chat masala fizz.', 129, 1, '/images/menu_page_2.png', 1, 3, '2026-07-20T18:00:00Z'),
('m15', 'Drinks', 'Peach Iced Tea', 'Slow brewed tea infused with natural peach nectar.', 129, 1, '/images/menu_page_2.png', 1, 3, '2026-07-20T18:00:00Z'),
('m16', 'Drinks', 'Virgin Pina Colada', 'Creamy coconut milk & pineapple juice mocktail.', 129, 1, '/images/menu_page_2.png', 1, 3, '2026-07-20T18:00:00Z'),
('m17', 'Coffee', 'Riverside Cold Brew Coffee', 'Chilled rich espresso blended with vanilla cream.', 149, 1, '/images/menu_page_3.png', 1, 4, '2026-07-20T18:00:00Z'),
('m18', 'Desserts', 'Oreo Cream Shake', 'Rich chocolate cookie shake topped with whipped cream.', 149, 1, '/images/menu_page_3.png', 1, 4, '2026-07-20T18:00:00Z'),
('m19', 'Starter', 'Veg Manchow Soup', 'Spicy Indo-Chinese soup served with crispy fried noodles.', 149, 1, '/images/menu_page_3.png', 1, 4, '2026-07-20T18:00:00Z'),
('m20', 'Starter', 'Lemon Coriander Soup', 'Vitamin-C rich clear soup with fresh coriander & lime.', 149, 1, '/images/menu_page_3.png', 1, 4, '2026-07-20T18:00:00Z'),
('m21', 'Indian', 'Dal Makhani Shahi', 'Slow-cooked black lentils in rich cream & butter.', 265, 1, '/images/menu_page_4.png', 1, 5, '2026-07-20T18:00:00Z'),
('m22', 'Indian', 'Paneer Lababdar', 'Soft paneer cubes simmered in onion-tomato cashew gravy.', 315, 1, '/images/menu_page_4.png', 1, 5, '2026-07-20T18:00:00Z'),
('m23', 'Indian', 'Handi Soya Chaap Gravy', 'Tandoori soya chaap pieces cooked in claypot spices.', 305, 1, '/images/menu_page_4.png', 1, 5, '2026-07-20T18:00:00Z'),
('m24', 'Indian', 'Deluxe Veg Thali', 'Paneer, Dal Makhani, Mix Veg, Naan, Rice, Raita & Sweet.', 345, 1, '/images/menu_page_4.png', 1, 5, '2026-07-20T18:00:00Z'),
('m25', 'Pizza', 'Loaded Special Pizza', 'Loaded wood-fired pizza with mozzarella, paneer & peppers.', 349, 1, '/images/menu_page_5.png', 1, 6, '2026-07-20T18:00:00Z'),
('m26', 'Burger', 'Gourmet Paneer Burger', 'Crispy cottage cheese patty, cheddar, jalapenos & dip.', 329, 1, '/images/menu_page_5.png', 1, 6, '2026-07-20T18:00:00Z'),
('m27', 'Starter', 'Cheese Garlic Bread (4 Pcs)', 'Toasted baguette topped with garlic butter & mozzarella.', 235, 1, '/images/menu_page_5.png', 1, 6, '2026-07-20T18:00:00Z'),
('m28', 'Chinese', 'Chilli Paneer Dry', 'Paneer wok-tossed with capsicum, garlic & Schezwan.', 219, 1, '/images/menu_page_6.png', 1, 7, '2026-07-20T18:00:00Z'),
('m29', 'Chinese', 'Veg Hakka Noodles', 'Stir-fried noodles loaded with crunchy veggies & light soy.', 249, 1, '/images/menu_page_6.png', 1, 7, '2026-07-20T18:00:00Z'),
('m30', 'Chinese', 'Cottage Cheese Sizzler', 'Paneer steak, herb rice, sautéed veggies & french fries.', 449, 1, '/images/menu_page_6.png', 1, 7, '2026-07-20T18:00:00Z'),
('m31', 'Italian', 'Red Sauce Arrabiata Pasta', 'Penne pasta tossed in spicy basil tomato concasse.', 275, 1, '/images/menu_page_7.png', 1, 8, '2026-07-20T18:00:00Z'),
('m32', 'Starter', 'Paneer Tikka Charcoal Grilled', 'Classic marinated paneer skewers roasted in tandoor.', 299, 1, '/images/menu_page_7.png', 1, 8, '2026-07-20T18:00:00Z'),
('m33', 'Desserts', 'Hot Gulab Jamun (2 Pcs)', 'Soft milk solids dumplings in hot cardamom syrup.', 99, 1, '/images/menu_page_7.png', 1, 8, '2026-07-20T18:00:00Z'),
('m34', 'Desserts', 'Royal Shahi Tukda', 'Saffron bread topped with thick rabri & pistachios.', 169, 1, '/images/menu_page_7.png', 1, 8, '2026-07-20T18:00:00Z');

-- blogs
INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, author, read_time, is_published, created_at) VALUES
('b1', 'Experience Lucknow’s Finest Riverside Dining & Speedboat Rides', 'riverside-dining-and-speedboat-rides-lucknow', 'Discover why Wings River Café at Laxman Jhula Park offers an unforgettable blend of multicuisine delicacies and thrilling river adventures.', 'Wings River Café is not just a place to eat—it is a complete sensory destination situated right along the Gomti River at Laxman Mela Ground. Guests can enjoy mouthwatering multicuisine dishes on our elevated riverside deck while watching speedboats zip across the water.\n\nOur open-air seating provides panoramic views of the water sunset, with warm lighting and ambient acoustic music setting the perfect mood. Combine your meal with an adrenaline-pumping speedboat round operated directly by Lucknow Water Sports!', 'Riverside Experience', '/images/Screenshot_20260720-180544_Maps.png', '["/images/Screenshot_20260720-180544_Maps.png","/images/Screenshot_20260720-180609_Maps.png","/images/Screenshot_20260720-180644_Maps.png","/images/food_menu_collage.jpg"]', 'Wings River Team', '4 min read', 1, '2026-07-15T00:00:00Z'),
('b2', 'Host Unforgettable Birthday Parties & Celebrations by the Gomti River', 'host-birthday-parties-wings-river-cafe', 'From fairy light canopies to custom buffet menus, learn how to turn your birthday or anniversary into a magical evening.', 'Searching for the best party venue in Hazratganj and Purana Haidarabad? Wings River Café offers exclusive outdoor canopy setups, personalized lighting arches, DJ audio equipment, and customizable multicuisine buffet spreads for up to 200 guests.\n\nWhether it is a romantic candlelit anniversary setup or a lively birthday bash with friends, our dedicated event management team handles end-to-end decor, custom cake arrangements, and live grill stations.', 'Events & Parties', '/images/Screenshot_20260720-180609_Maps.png', '["/images/Screenshot_20260720-180609_Maps.png","/images/Screenshot_20260720-180644_Maps.png","/images/Screenshot_20260720-180938_Instagram.png"]', 'Event Coordinator', '3 min read', 1, '2026-07-10T00:00:00Z'),
('b3', 'Nightlife & Evening Ambiance at Laxman Jhula Waterfront', 'nightlife-and-evening-ambiance-wings-river-cafe', 'Experience the stunning night illumination, cool Gomti river breezes, and candlelit outdoor tables.', 'As sunset sets over the Gomti River, Wings River Café transforms into a glowing haven. Enjoy wood-fired pizzas, gourmet cocktails, and soothing music with a magnificent view of the lit-up Laxman Jhula Bridge.\n\nNight owls can relax under our illuminated palm canopy until midnight while sampling artisanal cold coffees, mocktails, and sizzling hot Indo-Chinese starters.', 'Nightlife', '/images/Screenshot_20260720-180644_Maps.png', '["/images/Screenshot_20260720-180644_Maps.png","/images/Screenshot_20260720-180544_Maps.png","/images/water_sports_ticket_poster.png"]', 'Lifestyle Editor', '3 min read', 1, '2026-07-08T00:00:00Z'),
('b4', 'Official Lucknow Water Sports Ticket Rates & Speedboat Guide', 'lucknow-water-sports-ticket-rates-guide', 'Check out official ride tokens for Jetskis, Speedboats, Motorboats, and kids amusement rides.', 'Lucknow Water Sports operating directly at Wings River Café counter offers safe and thrilling rides on Gomti river. Read our complete guide on rates, safety gear, and booking packages.\n\nAll rides come equipped with standard life jackets and certified captains. Group discounts and combo packages (Ride + Meal Token) are available at the front desk.', 'Water Sports', '/images/water_sports_ticket_poster.png', '["/images/water_sports_ticket_poster.png","/images/Screenshot_20260720-180544_Maps.png"]', 'Water Sports Captain', '5 min read', 1, '2026-07-05T00:00:00Z'),
('b5', 'Chef’s Gourmet Specials & Signature Mocktails Highlight', 'chefs-gourmet-specials-signature-mocktails', 'Explore our top chef recommendations from Paneer Tikka to Blue Lagoon coolers.', 'From traditional North Indian delicacies to trendy mocktails and sizzling Indochinese woks, discover what makes our multicuisine menu a culinary favorite in Lucknow.\n\nDon’t miss out on our Signature Virgin Mojito, Special Chola Bhatura, and Handi Soya Chaap prepared fresh daily by master chefs.', 'Culinary Highlights', '/images/Screenshot_20260720-180938_Instagram.png', '["/images/Screenshot_20260720-180938_Instagram.png","/images/food_menu_collage.jpg","/images/Screenshot_20260720-180609_Maps.png"]', 'Head Chef', '4 min read', 1, '2026-07-01T00:00:00Z');
