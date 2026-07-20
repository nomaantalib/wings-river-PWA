-- Seed data for Cloudflare D1 Database wings-river-db (c2491a90-0f90-4a1e-8a4d-852e6588a68a)

-- 1. Water Sports Rides
INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji) VALUES
('ride-1', 'High-Speed Jet Ski', 'Extreme Adventure', 699, 'Per Person / 10 Mins', 'Feel the thrill of roaring across the Gomti River with professional instructors.', 'Best Seller', '/images/jet-ski.jpg', '🚤'),
('ride-2', 'Luxury Speedboat Cruise', 'Family & Couples', 999, 'Per Group (Up to 4)', 'Glide along the scenic Lucknow riverfront in our premium covered speedboat.', 'Popular', '/images/speedboat.jpg', '🛥️'),
('ride-3', 'Banana Boat Rush', 'Group Fun', 499, 'Per Person / 15 Mins', 'Hold on tight as our fast boat pulls your banana tube over river waves!', 'Trending', '/images/banana-boat.jpg', '🍌'),
('ride-4', 'Bumper Tube Thrill', 'Solo & Couples', 549, 'Per Person', 'Spin and splash across water currents with full safety gear.', 'Fun', '/images/bumper-tube.jpg', '⭕'),
('ride-5', 'River Water Skiing', 'Pro Adventure', 1299, 'Per Person', 'Master water skiing guided by certified river sports trainers.', 'Pro', '/images/water-skiing.jpg', '🏄');

-- 2. Event Banners
INSERT OR REPLACE INTO event_banners (id, title, subtitle, image_url, cta_text, cta_link, is_active) VALUES
('banner-1', 'Riverside Sunset DJ Party', 'Live Music & Neon Lights every Saturday evening 6 PM onwards', '/images/dj-party.jpg', 'Reserve Canopy', '#booking', 1),
('banner-2', 'Romantic Candlelight Package', 'Private riverside canopy with 3-course dinner & rose decor', '/images/romantic-dinner.jpg', 'Book Romantic Table', '#booking', 1),
('banner-3', 'Birthday & Anniversary Bash', 'Custom cakes, river view seating & 15% group discount', '/images/birthday-party.jpg', 'Plan Event', '#booking', 1);

-- 3. Menu Booklet Pages
INSERT OR REPLACE INTO menu_pages (page_number, title, subtitle, image, categories) VALUES
(1, 'Starters & Crispy Bites', 'Freshly Prepared Appetizers', '/images/starters-page.jpg', '["Starter", "Snacks"]'),
(2, 'Italian & Pizzas', 'Hand-Tossed Wood-Fired Style', '/images/pizza-page.jpg', '["Pizza", "Italian"]'),
(3, 'Indian & Chinese Main Course', 'Rich Gravies & Wok Specials', '/images/maincourse-page.jpg', '["Indian", "Chinese"]'),
(4, 'Drinks & Desserts', 'Artisanal Coffees & Shakes', '/images/drinks-page.jpg', '["Drinks", "Coffee", "Desserts"]');

-- 4. Food Menu Items
INSERT OR REPLACE INTO menu_items (id, category, name, description, price, is_veg, image_url, is_available, page_number) VALUES
('m-1', 'Starter', 'Crispy Chilli Paneer', 'Fresh cottage cheese tossed in spicy soy-garlic sauce with peppers', 280, 1, '/images/chilli-paneer.jpg', 1, 1),
('m-2', 'Starter', 'Tandoori Malai Soya Chaap', 'Marinated chaap cooked in charcoal clay oven with rich cream', 290, 1, '/images/malai-chaap.jpg', 1, 1),
('m-3', 'Pizza', 'Wings Special Riverside Pizza', 'Loaded with olives, jalapeños, bell peppers, extra mozzarella', 390, 1, '/images/pizza.jpg', 1, 2),
('m-4', 'Italian', 'Creamy Alfredo Pasta', 'Penne pasta in garlic parmesan white cream sauce', 320, 1, '/images/alfredo-pasta.jpg', 1, 2),
('m-5', 'Indian', 'Dal Makhani & Butter Naan Combo', 'Overnight slow-cooked black lentils served with 2 flaky butter naans', 340, 1, '/images/dal-makhani.jpg', 1, 3),
('m-6', 'Drinks', 'Iced Hazelnut Cold Coffee', 'Rich espresso blended with chilled milk and hazelnut syrup', 180, 1, '/images/cold-coffee.jpg', 1, 4),
('m-7', 'Desserts', 'Hot Sizzling Brownie with Vanilla', 'Warm chocolate brownie topped with melting vanilla ice cream & fudge', 240, 1, '/images/sizzling-brownie.jpg', 1, 4);

-- 5. Blog Posts
INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, author, read_time, is_published) VALUES
('blog-1', 'Experience Lucknow’s Best Riverside Dining at Wings River Café', 'experience-lucknows-best-riverside-dining', 'Discover why Wings River Café in Purana Haidarabad is Lucknow’s favorite hotspot for delicious multicuisine food and scenic river views.', 'Wings River Café brings a unique blend of exquisite multicuisine food, vibrant riverfront seating, and thrilling water sports right in the heart of Lucknow near Hazratganj & Purana Haidarabad.\n\nEnjoy our handcrafted pizzas, sizzling brownies, and artisan cold coffees while watching the sunset over the Gomti River.', 'Food & Dining', '/images/blog-riverside.jpg', '["/images/blog-riverside.jpg", "/images/canopy-seating.jpg"]', 'Wings River Team', '4 min read', 1),
('blog-2', 'Top 5 Water Sports Rides to Try in Lucknow', 'top-5-water-sports-rides-lucknow', 'From high-speed Jet Skis to luxury Speedboats, here is your ultimate guide to water sports adventures at Wings River Café.', 'Looking for adrenaline-pumping fun in Lucknow? Wings River Café offers licensed river adventure rides including Jet Skis, Speedboat Cruises, and Banana Rides.', 'Water Sports', '/images/jet-ski.jpg', '["/images/jet-ski.jpg", "/images/speedboat.jpg"]', 'Wings River Team', '3 min read', 1);

-- 6. Photo Gallery
INSERT OR REPLACE INTO gallery (id, title, category, image_url, featured) VALUES
('gal-1', 'Golden Hour Riverside View', 'River View', '/images/golden-hour.jpg', 1),
('gal-2', 'Private Outdoor Canopy Seating', 'Outdoor Seating', '/images/canopy-seating.jpg', 1),
('gal-3', 'Handcrafted Pizza & Drinks', 'Food', '/images/pizza.jpg', 1),
('gal-4', 'Jet Ski Ride Action Shot', 'Water Sports', '/images/jet-ski.jpg', 1);

-- 7. Customer Reviews
INSERT OR REPLACE INTO reviews (id, author_name, rating, review_text, date_str, is_approved) VALUES
('rev-1', 'Rohan Sharma', 5, 'The best café experience in Lucknow! The river view during sunset is breathtaking and the Chilli Paneer was top tier.', 'Jul 2026', 1),
('rev-2', 'Priya Verma', 5, 'Celebrated my birthday here in their canopy setup. Amazing food, quick service, and the speedboat ride was super fun!', 'Jul 2026', 1),
('rev-3', 'Amitabh Roy', 5, 'Unbelievable vibes next to the river. Great cold coffee and sizzling brownie!', 'Jun 2026', 1);

-- 8. Site Hero Settings
INSERT OR REPLACE INTO settings (key, value) VALUES
('wings_hero', '{"badge":"Taste • Eat • Rides","title":"Lucknow’s Premier Riverside Café & Water Sports","subtitle":"Experience multicuisine dining with scenic river views, private canopy setups & exciting water rides in Purana Haidarabad.","ctaText":"Book a Table","ctaLink":"#booking"}');
