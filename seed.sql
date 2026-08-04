-- Cloudflare D1 Database Seed File for Wings River Café
-- Database ID: 912b607b-c192-4e0a-89ba-75f936fca45c

-- 1. Users (password_hash is SHA-256 of 'wingsriver@2026')
INSERT OR REPLACE INTO users (id, username, password_hash, email, role, created_at, updated_at) VALUES
('usr-admin', 'admin', 'b2390f70f6be8345155f9e80209df95b3f886f371ea17300c3c861f652de4df5', 'admin@wingsrivercafe.com', 'Admin', '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('usr-manager', 'manager', 'b2390f70f6be8345155f9e80209df95b3f886f371ea17300c3c861f652de4df5', 'manager@wingsrivercafe.com', 'Manager', '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('usr-waiter1', 'waiter1', 'b2390f70f6be8345155f9e80209df95b3f886f371ea17300c3c861f652de4df5', 'waiter1@wingsrivercafe.com', 'Waiter', '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('usr-kitchen1', 'kitchen', 'b2390f70f6be8345155f9e80209df95b3f886f371ea17300c3c861f652de4df5', 'kitchen@wingsrivercafe.com', 'Kitchen', '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z');


-- 2. Menu Categories
INSERT OR REPLACE INTO menu_categories (id, name, slug, description, display_order, is_deleted, created_at, updated_at) VALUES
('cat-beverages', 'Beverages', 'beverages', 'Hot teas, fresh lime, and soft drinks', 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cat-breakfast', 'Breakfast', 'breakfast', 'Parathas, Jalebi, and Bun Makkhan', 2, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cat-chaat', 'Chaat & Starters', 'chaat-starters', 'Lucknowi basket chaat, Agra bhalla, and golgappe', 3, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cat-drinks', 'Coolers & Mocktails', 'coolers-mocktails', 'Mojitos, iced teas, and pina colada', 4, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cat-coffee', 'Coffee & Shakes', 'coffee-shakes', 'Cold brew, espresso, and chocolate cookie shakes', 5, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cat-indian', 'Indian Main Course', 'indian-main-course', 'Dal Makhani, Paneer Lababdar, and deluxe thalis', 6, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cat-pizza', 'Pizza & Burgers', 'pizza-burgers', 'Wood-fired pizzas and gourmet cottage cheese burgers', 7, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cat-chinese', 'Chinese Wok & Waffles', 'chinese-wok-waffles', 'Hakka noodles, chilli paneer, and continental sizzlers', 8, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cat-desserts', 'Desserts', 'desserts', 'Shahi Tukda, Gulab Jamun, and ice creams', 9, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z');

-- 3. Menu Items
INSERT OR REPLACE INTO menu_items (id, category_id, name, description, price, is_veg, image_url, is_available, display_order, version, is_deleted, created_at, updated_at) VALUES
('m1', 'cat-beverages', 'Special Masala Chai', 'Freshly brewed kulhad tea with cardamoms & ginger.', 50.0, 1, '/images/menu_page_1.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m2', 'cat-beverages', 'Fresh Lime Soda', 'Sweet or salted sparkling fresh lime soda.', 60.0, 1, '/images/menu_page_1.png', 1, 2, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m3', 'cat-breakfast', 'Bun Makkhan', 'Soft toasted bun stuffed with rich farm butter.', 60.0, 1, '/images/menu_page_1.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m4', 'cat-breakfast', 'Special Chola Bhatura', 'Piping hot fluffy bhaturas served with spicy Amritsari chole.', 150.0, 1, '/images/menu_page_1.png', 1, 2, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m5', 'cat-breakfast', 'Paneer Paratha', 'Stuffed cottage cheese paratha served with curd & pickle.', 110.0, 1, '/images/menu_page_1.png', 1, 3, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m6', 'cat-breakfast', 'Dahi Jalebi (200gm)', 'Crispy golden jalebis paired with fresh thick curd.', 150.0, 1, '/images/menu_page_1.png', 1, 4, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m7', 'cat-chaat', 'Special Pav Bhaji', 'Butter-loaded spicy mashed vegetable bhaji served with toasted pavs.', 150.0, 1, '/images/menu_page_1.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m8', 'cat-chaat', 'Cheese Butter Pav Bhaji', 'Gratinated melted cheese topped over butter pav bhaji.', 170.0, 1, '/images/menu_page_1.png', 1, 2, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m9', 'cat-chaat', 'Agra Ka Special Bhalla', 'Crispy potato bhalla topped with sweet curd & mint chutney.', 80.0, 1, '/images/menu_page_1.png', 1, 3, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m10', 'cat-chaat', 'Lucknowi Basket Chaat', 'Crispy potato basket filled with tikkis, sprouts & curd.', 150.0, 1, '/images/menu_page_1.png', 1, 4, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m11', 'cat-chaat', 'Gol Gappe (6 Pcs)', 'Crispy puris filled with spicy mint water & tangy chutney.', 40.0, 1, '/images/menu_page_1.png', 1, 5, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m12', 'cat-drinks', 'Virgin Mojito', 'Fresh mint, lime wedges, crushed ice & sparkling soda.', 119.0, 1, '/images/menu_page_2.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m13', 'cat-drinks', 'Blue Lagoon Cooler', 'Refreshing curacao blue citrus cooler with lemon zest.', 129.0, 1, '/images/menu_page_2.png', 1, 2, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m14', 'cat-drinks', 'Watermelon Sunset Mojito', 'Fresh watermelon extract, mint & chat masala fizz.', 129.0, 1, '/images/menu_page_2.png', 1, 3, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m15', 'cat-drinks', 'Peach Iced Tea', 'Slow brewed tea infused with natural peach nectar.', 129.0, 1, '/images/menu_page_2.png', 1, 4, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m16', 'cat-drinks', 'Virgin Pina Colada', 'Creamy coconut milk & pineapple juice mocktail.', 129.0, 1, '/images/menu_page_2.png', 1, 5, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m17', 'cat-coffee', 'Riverside Cold Brew Coffee', 'Chilled rich espresso blended with vanilla cream.', 149.0, 1, '/images/menu_page_3.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m18', 'cat-desserts', 'Oreo Cream Shake', 'Rich chocolate cookie shake topped with whipped cream.', 149.0, 1, '/images/menu_page_3.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m19', 'cat-chaat', 'Veg Manchow Soup', 'Spicy Indo-Chinese soup served with crispy fried noodles.', 149.0, 1, '/images/menu_page_3.png', 1, 6, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m20', 'cat-chaat', 'Lemon Coriander Soup', 'Vitamin-C rich clear soup with fresh coriander & lime.', 149.0, 1, '/images/menu_page_3.png', 1, 7, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m21', 'cat-indian', 'Dal Makhani Shahi', 'Slow-cooked black lentils in rich cream & butter.', 265.0, 1, '/images/menu_page_4.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m22', 'cat-indian', 'Paneer Lababdar', 'Soft paneer cubes simmered in onion-tomato cashew gravy.', 315.0, 1, '/images/menu_page_4.png', 1, 2, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m23', 'cat-indian', 'Handi Soya Chaap Gravy', 'Tandoori soya chaap pieces cooked in claypot spices.', 305.0, 1, '/images/menu_page_4.png', 1, 3, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m24', 'cat-indian', 'Deluxe Veg Thali', 'Paneer, Dal Makhani, Mix Veg, Naan, Rice, Raita & Sweet.', 345.0, 1, '/images/menu_page_4.png', 1, 4, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m25', 'cat-pizza', 'Loaded Special Pizza', 'Loaded wood-fired pizza with mozzarella, paneer & peppers.', 349.0, 1, '/images/menu_page_5.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m26', 'cat-pizza', 'Gourmet Paneer Burger', 'Crispy cottage cheese patty, cheddar, jalapenos & dip.', 329.0, 1, '/images/menu_page_5.png', 1, 2, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m27', 'cat-pizza', 'Cheese Garlic Bread (4 Pcs)', 'Toasted baguette topped with garlic butter & mozzarella.', 235.0, 1, '/images/menu_page_5.png', 1, 3, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m28', 'cat-chinese', 'Chilli Paneer Dry', 'Paneer wok-tossed with capsicum, garlic & Schezwan.', 219.0, 1, '/images/menu_page_6.png', 1, 1, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m29', 'cat-chinese', 'Veg Hakka Noodles', 'Stir-fried noodles loaded with crunchy veggies & light soy.', 249.0, 1, '/images/menu_page_6.png', 1, 2, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m30', 'cat-chinese', 'Cottage Cheese Sizzler', 'Paneer steak, herb rice, sautéed veggies & french fries.', 449.0, 1, '/images/menu_page_6.png', 1, 3, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m31', 'cat-chinese', 'Red Sauce Arrabiata Pasta', 'Penne pasta tossed in spicy basil tomato concasse.', 275.0, 1, '/images/menu_page_7.png', 1, 4, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m32', 'cat-chinese', 'Paneer Tikka Charcoal Grilled', 'Classic marinated paneer skewers roasted in tandoor.', 299.0, 1, '/images/menu_page_7.png', 1, 5, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m33', 'cat-desserts', 'Hot Gulab Jamun (2 Pcs)', 'Soft milk solids dumplings in hot cardamom syrup.', 99.0, 1, '/images/menu_page_7.png', 1, 2, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('m34', 'cat-desserts', 'Royal Shahi Tukda', 'Saffron bread topped with thick rabri & pistachios.', 169.0, 1, '/images/menu_page_7.png', 1, 3, 1, 0, '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z');

-- 4. Menu Pages
INSERT OR REPLACE INTO menu_pages (page_number, title, subtitle, image, categories, display_order, is_deleted, updated_at) VALUES
(1, 'Wings River & Water Sports Menu', 'Delicious Moments, Unforgettable Memories', '/images/menu_page_cover.png', '["Cover"]', 1, 0, '2026-07-20T18:00:00Z'),
(2, 'Beverages, Breakfast & Chaat', 'Chai, Chola Bhatura, Pav Bhaji & Agra Bhalla', '/images/menu_page_1.png', '["Beverages","Breakfast","Chaat"]', 2, 0, '2026-07-20T18:00:00Z'),
(3, 'Coolers & Mocktails', 'Virgin Mojito, Blue Lagoon, Iced Teas & Lassi', '/images/menu_page_2.png', '["Coolers & Mocktails"]', 3, 0, '2026-07-20T18:00:00Z'),
(4, 'Shakes & Gourmet Soups', 'Oreo Shake, Cold Coffee, Manchow & Sweet Corn', '/images/menu_page_3.png', '["Shakes","Soup"]', 4, 0, '2026-07-20T18:00:00Z'),
(5, 'Indian Main Course & South Indian', 'Butter Chicken, Dal Makhani, Paneer Lababdar & Thalis', '/images/menu_page_4.png', '["Indian","South Indian"]', 5, 0, '2026-07-20T18:00:00Z'),
(6, 'Pizza, Burger & Sandwiches', 'Loaded Wings Pizza, Paneer Burger & Garlic Breads', '/images/menu_page_5.png', '["Pizza","Burger","Sandwiches"]', 6, 0, '2026-07-20T18:00:00Z'),
(7, 'Chinese Woks & Sizzlers', 'Hakka Noodles, Chilli Paneer, Manchurian & Sizzlers', '/images/menu_page_6.png', '["Chinese","Sizzlers"]', 7, 0, '2026-07-20T18:00:00Z'),
(8, 'Indo-Continental Bites & Desserts', 'Pastas, Paneer Tikka, Gulab Jamun & Shahi Tukda', '/images/menu_page_7.png', '["Indo-Continental","Dessert"]', 8, 0, '2026-07-20T18:00:00Z');

-- 5. Blogs
INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, author, read_time, status, version, is_deleted, published_at, created_at, updated_at) VALUES
('b1', 'Experience Lucknow’s Finest Riverside Dining & Speedboat Rides', 'riverside-dining-and-speedboat-rides-lucknow', 'Discover why Wings River Café at Laxman Jhula Park offers an unforgettable blend of multicuisine delicacies and thrilling river adventures.', 'Wings River Café is not just a place to eat—it is a complete sensory destination situated right along the Gomti River at Laxman Mela Ground. Guests can enjoy mouthwatering multicuisine dishes on our elevated riverside deck while watching speedboats zip across the water.\n\nOur open-air seating provides panoramic views of the water sunset, with warm lighting and ambient acoustic music setting the perfect mood. Combine your meal with an adrenaline-pumping speedboat round operated directly by Lucknow Water Sports!', 'Riverside Experience', '/images/Screenshot_20260720-180544_Maps.png', '["/images/Screenshot_20260720-180544_Maps.png","/images/Screenshot_20260720-180644_Maps.png"]', 'Wings River Team', '4 min read', 'published', 1, 0, '2026-07-15T00:00:00Z', '2026-07-15T00:00:00Z', '2026-07-15T00:00:00Z'),
('b2', 'Host Unforgettable Birthday Parties & Celebrations by the Gomti River', 'host-birthday-parties-wings-river-cafe', 'From fairy light canopies to custom buffet menus, learn how to turn your birthday or anniversary into a magical evening.', 'Searching for the best party venue in Hazratganj and Purana Haidarabad? Wings River Café offers exclusive outdoor canopy setups, personalized lighting arches, DJ audio equipment, and customizable multicuisine buffet spreads for up to 200 guests.\n\nWhether it is a romantic candlelit anniversary setup or a lively birthday bash with friends, our dedicated event management team handles end-to-end decor, custom cake arrangements, and live grill stations.', 'Events & Parties', '/images/Screenshot_20260720-180644_Maps.png', '["/images/Screenshot_20260720-180644_Maps.png","/images/Screenshot_20260720-180544_Maps.png"]', 'Event Coordinator', '3 min read', 'published', 1, 0, '2026-07-10T00:00:00Z', '2026-07-10T00:00:00Z', '2026-07-10T00:00:00Z'),
('b3', 'Nightlife & Evening Ambiance at Laxman Jhula Waterfront', 'nightlife-and-evening-ambiance-wings-river-cafe', 'Experience the stunning night illumination, cool Gomti river breezes, and candlelit outdoor tables.', 'As sunset sets over the Gomti River, Wings River Café transforms into a glowing haven. Enjoy wood-fired pizzas, gourmet cocktails, and soothing music with a magnificent view of the lit-up Laxman Jhula Bridge.\n\nNight owls can relax under our illuminated palm canopy until midnight while sampling artisanal cold coffees, mocktails, and sizzling hot Indo-Chinese starters.', 'Nightlife', '/images/Screenshot_20260720-180644_Maps.png', '["/images/Screenshot_20260720-180644_Maps.png","/images/Screenshot_20260720-180544_Maps.png"]', 'Lifestyle Editor', '3 min read', 'published', 1, 0, '2026-07-08T00:00:00Z', '2026-07-08T00:00:00Z', '2026-07-08T00:00:00Z'),
('b4', 'Official Lucknow Water Sports Ticket Rates & Speedboat Guide', 'lucknow-water-sports-ticket-rates-guide', 'Check out official ride tokens for Jetskis, Speedboats, Motorboats, and kids amusement rides.', 'Lucknow Water Sports operating directly at Wings River Café counter offers safe and thrilling rides on Gomti river. Read our complete guide on rates, safety gear, and booking packages.\n\nAll rides come equipped with standard life jackets and certified captains. Group discounts and combo packages (Ride + Meal Token) are available at the front desk.', 'Water Sports', '/images/watersports_menu.jpg', '["/images/watersports_menu.jpg","/images/Screenshot_20260720-180544_Maps.png"]', 'Water Sports Captain', '5 min read', 'published', 1, 0, '2026-07-05T00:00:00Z', '2026-07-05T00:00:00Z', '2026-07-05T00:00:00Z'),
('b5', 'Chef’s Gourmet Specials & Signature Mocktails Highlight', 'chefs-gourmet-specials-signature-mocktails', 'Explore our top chef recommendations from Paneer Tikka to Blue Lagoon coolers.', 'From traditional North Indian delicacies to trendy mocktails and sizzling Indochinese woks, discover what makes our multicuisine menu a culinary favorite in Lucknow.\n\nDon’t miss out on our Signature Virgin Mojito, Special Chola Bhatura, and Handi Soya Chaap prepared fresh daily by master chefs.', 'Culinary Highlights', '/images/food_menu_collage.jpg', '["/images/food_menu_collage.jpg","/images/food_menu_collage.jpg"]', 'Head Chef', '4 min read', 'published', 1, 0, '2026-07-01T00:00:00Z', '2026-07-01T00:00:00Z', '2026-07-01T00:00:00Z');

-- 6. Photo Gallery
INSERT OR REPLACE INTO gallery (id, title, category, image_url, featured, display_order, is_deleted, created_at) VALUES
('g1', 'Jet Ski Thrill Ride — Gomti River', 'Water Sports', '/images/Screenshot_20260720-180544_Maps.png', 1, 1, 0, '2026-07-20T18:00:00Z'),
('g2', 'Speedboat Action Shot — Gomti', 'Water Sports', '/images/Screenshot_20260720-180745_Maps.png', 1, 2, 0, '2026-07-20T18:00:00Z'),
('g3', 'Water Sports Activity Poster', 'Water Sports', '/images/watersports_menu.jpg', 1, 3, 0, '2026-07-20T18:00:00Z'),
('g4', 'Motorboat Cruise — Laxman Jhula', 'Water Sports', '/images/Screenshot_20260720-180555_Maps.png', 1, 4, 0, '2026-07-20T18:00:00Z'),
('g5', 'Fairy Light Canopy Evening Setup', 'Evening', '/images/Screenshot_20260720-180644_Maps.png', 1, 5, 0, '2026-07-20T18:00:00Z'),
('g6', 'Sunset Gomti Riverfront Lounge', 'River View', '/images/Screenshot_20260720-180621_Maps.png', 1, 6, 0, '2026-07-20T18:00:00Z'),
('g7', 'Nighttime Waterfront Party Lights', 'Evening', '/images/Screenshot_20260720-180644_Maps.png', 1, 7, 0, '2026-07-20T18:00:00Z'),
('g8', 'Riverside Lounge Evening Ambience', 'Evening', '/images/Screenshot_20260720-180755_Maps.png', 0, 8, 0, '2026-07-20T18:00:00Z'),
('g9', 'Cozy Indoor Dining Lounge', 'Restaurant', '/images/Screenshot_20260720-180630_Maps.png', 0, 9, 0, '2026-07-20T18:00:00Z'),
('g10', 'Café Entrance — Laxman Mela Ground', 'Outdoor Seating', '/images/Screenshot_20260720-180724_Maps.png', 0, 10, 0, '2026-07-20T18:00:00Z'),
('g11', 'Outdoor Riverside Lawn & Garden Tables', 'Outdoor Seating', '/images/Screenshot_20260720-180737_Maps.png', 0, 11, 0, '2026-07-20T18:00:00Z'),
('g12', 'Customer Dining Deck & Celebration Venue', 'Outdoor Seating', '/images/Screenshot_20260720-180812_Maps.png', 0, 12, 0, '2026-07-20T18:00:00Z'),
('g13', 'Instagram Highlight: Deck Vibe', 'Restaurant', '/images/Screenshot_20260720-175721_Instagram.png', 0, 13, 0, '2026-07-20T18:00:00Z'),
('g14', 'Chef Special Gourmet Food Spread', 'Food', '/images/Screenshot_20260720-180927_Instagram.png', 1, 14, 0, '2026-07-20T18:00:00Z'),
('g15', 'Signature Drinks & Mocktail Bar', 'Food', '/images/food_menu_collage.jpg', 1, 15, 0, '2026-07-20T18:00:00Z');

-- 7. Reviews / Testimonials
INSERT OR REPLACE INTO reviews (id, author_name, rating, review_text, date_str, avatar_url, status, is_deleted, created_at) VALUES
('r1', 'Ananya Sharma', 5, 'Amazing riverside view with great food! The paneer tikka and cold coffee were fantastic. Riding the speedboat before dinner was the highlight of our weekend!', '2 days ago', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'approved', 0, '2026-07-20T18:00:00Z'),
('r2', 'Rahul Verma', 5, 'Celebrated my sister’s 25th birthday here. The fairy light decoration near the river was magical. Staff were very courteous and the food was delicious!', '1 week ago', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'approved', 0, '2026-07-20T18:00:00Z');

-- 8. Water Sports
INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, display_order, is_deleted, created_at) VALUES
('ride-1', 'Jetski Thrill Ride', 'Water Sports', 350.0, 'Per Person 1 Round', 'High speed jet ski adventure on Gomti river with certified instructor & life jacket.', 'Most Popular', '/images/Screenshot_20260720-180544_Maps.png', '🏄', 1, 0, '2026-07-20T18:00:00Z'),
('ride-2', 'Speed Boat Ride', 'Water Sports', 250.0, 'Per Person 1 Round', 'Exhilarating twin-engine speedboat ride offering panoramic riverfront views.', 'Family Favorite', '/images/Screenshot_20260720-180745_Maps.png', '⚡', 2, 0, '2026-07-20T18:00:00Z'),
('ride-3', 'Motor Boat Cruise', 'Water Sports', 200.0, 'Per Person 1 Round', 'Smooth & comfortable motor boat cruise around Laxman Jhula park riverfront.', 'Scenic Cruise', '/images/Screenshot_20260720-180555_Maps.png', '🚤', 3, 0, '2026-07-20T18:00:00Z'),
('ride-4', 'Panda Train', 'Other Activities', 50.0, 'Per Person 1 Round', 'Fun musical track train ride for toddlers, kids & families near the river park.', 'Kids Zone', '/images/Screenshot_20260720-180737_Maps.png', '🐼', 4, 0, '2026-07-20T18:00:00Z'),
('ride-5', 'Electric Kids Car', 'Other Activities', 50.0, 'Per Person 1 Round', 'Illuminated battery-powered electric drive cars for young adventurers.', 'Kids Fun', '/images/Screenshot_20260720-180621_Maps.png', '🚗', 5, 0, '2026-07-20T18:00:00Z'),
('ride-6', 'Trampoline Jump', 'Other Activities', 50.0, 'Per Person 1 Round', 'Enclosed safety netting high-bounce jumping trampoline enclosure.', 'Active Play', '/images/Screenshot_20260720-180724_Maps.png', '🤸', 6, 0, '2026-07-20T18:00:00Z');

-- 9. Event Banners
INSERT OR REPLACE INTO event_banners (id, title, subtitle, image_url, cta_text, cta_link, status, display_order, is_deleted, created_at) VALUES
('eb-1', '🎉 Weekend Riverside Fiesta!', 'Live music, gourmet BBQ & unlimited mocktails every Saturday & Sunday evening.', '/images/Screenshot_20260720-180644_Maps.png', 'Reserve Your Spot', '#booking', 'published', 1, 0, '2026-07-20T18:00:00Z');

-- 10. FAQs
INSERT OR REPLACE INTO faqs (id, question, answer, display_order, is_deleted, created_at) VALUES
('faq-1', 'Where is Wings River Café located?', 'We are located inside Laxman Mela Ground at Laxman Jhula Park, Gomti River Front, Hazratganj, Lucknow, UP 226001.', 1, 0, '2026-07-20T18:00:00Z'),
('faq-2', 'Are water sports safe?', 'Yes, all rides are conducted by certified captains. Every passenger is provided with a standard safety life jacket.', 2, 0, '2026-07-20T18:00:00Z'),
('faq-3', 'Do you take private party reservations?', 'Yes! We host birthday parties, anniversaries, candlelit dinners, and corporate events with custom catering.', 3, 0, '2026-07-20T18:00:00Z');

-- 11. Team Members
INSERT OR REPLACE INTO team_members (id, name, role, bio, image, display_order, is_deleted, created_at) VALUES
('tm-1', 'Amit Saxena', 'General Manager', ' অমিত oversees restaurant operations and ensures first-class client dining experiences.', '/images/logo.png', 1, 0, '2026-07-20T18:00:00Z'),
('tm-2', 'Chef Suresh Kumar', 'Head Chef', 'Suresh heads our multicuisine kitchen preparing authentic Indian, Chinese & Italian woks.', '/images/logo.png', 2, 0, '2026-07-20T18:00:00Z');

-- 12. Offers
INSERT OR REPLACE INTO offers_discounts (id, title, code, description, discount_value, discount_type, status, is_deleted, created_at) VALUES
('off-1', 'Monsoon Special Flat Discount', 'MONSOON10', 'Enjoy a flat 10% discount on all family buffet dine-in items.', 10.0, 'percentage', 'active', 0, '2026-07-20T18:00:00Z'),
('off-2', 'Free Speedboat Ride Combo', 'RIDEFREE', 'Get 1 free speedboat cruise ride on bill value above ₹1500.', 1500.0, 'flat', 'active', 0, '2026-07-20T18:00:00Z');

-- 13. Settings (Key-Value)
INSERT OR REPLACE INTO settings (key, value) VALUES
('wings_hero', '{"badgeText":"✨ Lucknow’s Premier Waterfront Dining & Water Sports Destination","mainHeadline":"Wings River Café & Water Sports","subHeadline":"Multicuisine Gourmet Food, Riverside Deck & Thrilling Speedboat Rides","contactPhone":"07310008020","aboutBadge":"Premium Multicuisine & Waterfront Haven","aboutTitle":"Welcome to Wings River Café","aboutParagraph1":"Located inside Laxman Mela Ground at Laxman Jhula Park along the scenic Gomti River in Lucknow, Wings River Café is a premier destination where exquisite multicuisine gastronomy meets breathtaking riverside natural ambience and thrilling Lucknow Water Sports speedboat rides.","aboutParagraph2":"Whether you are planning a relaxed family gathering, a festive birthday party under our sparkling fairy-light canopy, or a romantic candlelit evening beside the gentle river waters, our elevated indoor & outdoor dining decks offer an unforgettable experience.","aboutPrimaryImage":"/images/Screenshot_20260720-180544_Maps.png","aboutSecondaryImage":"/images/Screenshot_20260720-180644_Maps.png"}');

-- 14. Table Clusters
INSERT OR REPLACE INTO table_clusters (id, name, description, display_order, created_at) VALUES
('cluster-riverside', 'Riverside Deck', 'Open-air waterfront seating with sunset river views', 1, '2026-07-20T18:00:00Z'),
('cluster-indoor', 'Indoor AC Hall', 'Climate-controlled lounge dining with glass facade', 2, '2026-07-20T18:00:00Z'),
('cluster-canopy', 'VIP Private Canopy', 'Exclusive fairy-light gazebo for parties & candlelit dinners', 3, '2026-07-20T18:00:00Z');

-- 15. Tables
INSERT OR REPLACE INTO tables (id, table_number, cluster_id, capacity, shape, x_position, y_position, status, is_active, created_at) VALUES
('tbl-1', 'T1', 'cluster-riverside', 4, 'rectangle', 10, 20, 'free', 1, '2026-07-20T18:00:00Z'),
('tbl-2', 'T2', 'cluster-riverside', 4, 'rectangle', 35, 20, 'eating', 1, '2026-07-20T18:00:00Z'),
('tbl-3', 'T3', 'cluster-riverside', 2, 'round', 60, 20, 'free', 1, '2026-07-20T18:00:00Z'),
('tbl-4', 'T4', 'cluster-riverside', 6, 'rectangle', 85, 20, 'needs_cleaning', 1, '2026-07-20T18:00:00Z'),
('tbl-5', 'T5', 'cluster-indoor', 4, 'rectangle', 10, 50, 'free', 1, '2026-07-20T18:00:00Z'),
('tbl-6', 'T6', 'cluster-indoor', 4, 'rectangle', 35, 50, 'reserved', 1, '2026-07-20T18:00:00Z'),
('tbl-7', 'T7', 'cluster-indoor', 2, 'round', 60, 50, 'free', 1, '2026-07-20T18:00:00Z'),
('tbl-8', 'T8', 'cluster-indoor', 8, 'rectangle', 85, 50, 'free', 1, '2026-07-20T18:00:00Z'),
('tbl-9', 'V1', 'cluster-canopy', 10, 'canopy', 20, 80, 'free', 1, '2026-07-20T18:00:00Z'),
('tbl-10', 'V2', 'cluster-canopy', 12, 'canopy', 50, 80, 'reserved', 1, '2026-07-20T18:00:00Z'),
('tbl-11', 'V3', 'cluster-canopy', 15, 'canopy', 80, 80, 'free', 1, '2026-07-20T18:00:00Z');

-- 16. Customers
INSERT OR REPLACE INTO customers (id, phone, name, email, total_bookings, total_spent, vip_status, notes, created_at, updated_at) VALUES
('cust-1', '9876543210', 'Rahul Sharma', 'rahul@example.com', 5, 4850.0, 1, 'Prefers Riverside table T2, loves Virgin Mojito', '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z'),
('cust-2', '9123456789', 'Priya Verma', 'priya@example.com', 2, 1820.0, 0, 'Vegetarian, requested quiet corner', '2026-07-20T18:00:00Z', '2026-07-20T18:00:00Z');

-- 17. Party Bookings
INSERT OR REPLACE INTO party_bookings (id, name, phone, email, event_type, event_date, time_slot, guest_count, canopy_name, custom_notes, status, created_at) VALUES
('pb-1', 'Ankit Saxena', '9876543210', 'ankit@example.com', 'Birthday', '2026-08-10', 'Evening 7:00 PM', 15, 'VIP Private Canopy V2', 'Fairy light decoration & chocolate cake setup', 'approved', '2026-07-20T18:00:00Z');

-- 18. Orders & Order Items
INSERT OR REPLACE INTO orders (id, order_number, table_id, table_number, customer_name, customer_phone, order_type, status, total_amount, notes, created_at, updated_at) VALUES
('ord-101', 'ORD-101', 'tbl-2', 'T2', 'Rahul Sharma', '9876543210', 'qr_dine_in', 'preparing', 843.0, 'Extra spicy pav bhaji', '2026-08-01T18:30:00Z', '2026-08-01T18:30:00Z');

INSERT OR REPLACE INTO order_items (id, order_id, menu_item_id, item_name, quantity, price, notes, status) VALUES
('oi-1', 'ord-101', 'm7', 'Special Pav Bhaji', 2, 150.0, 'Extra butter', 'cooking'),
('oi-2', 'ord-101', 'm12', 'Virgin Mojito', 2, 119.0, 'Less ice', 'pending'),
('oi-3', 'ord-101', 'm25', 'Loaded Special Pizza', 1, 349.0, '', 'cooking');

