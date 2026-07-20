// Client-Side Database & LocalStorage Service Layer for Wings River Café
export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  booking_type: string;
  date: string;
  time: string;
  guests: number;
  special_requests?: string;
  status: string;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  image_url: string;
  is_available: boolean;
  page_number?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string;
  author: string;
  read_time: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  featured?: boolean;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string;
  date_str: string;
  avatar_url?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  created_at?: string;
}

export interface MenuPageDefinition {
  pageNumber: number;
  title: string;
  subtitle: string;
  image: string;
  categories: string[];
}

export const MENU_BOOKLET_PAGES: MenuPageDefinition[] = [
  {
    pageNumber: 1,
    title: 'Wings River & Water Sports Menu',
    subtitle: 'Delicious Moments, Unforgettable Memories',
    image: '/images/menu_page_cover.png',
    categories: ['Cover']
  },
  {
    pageNumber: 2,
    title: 'Beverages, Breakfast & Chaat',
    subtitle: 'Chai, Chola Bhatura, Pav Bhaji & Agra Bhalla',
    image: '/images/menu_page_1.png',
    categories: ['Beverages', 'Breakfast', 'Chaat']
  },
  {
    pageNumber: 3,
    title: 'Coolers & Mocktails',
    subtitle: 'Virgin Mojito, Blue Lagoon, Iced Teas & Lassi',
    image: '/images/menu_page_2.png',
    categories: ['Coolers & Mocktails']
  },
  {
    pageNumber: 4,
    title: 'Shakes & Gourmet Soups',
    subtitle: 'Oreo Shake, Cold Coffee, Manchow & Sweet Corn',
    image: '/images/menu_page_3.png',
    categories: ['Shakes', 'Soup']
  },
  {
    pageNumber: 5,
    title: 'Indian Main Course & South Indian',
    subtitle: 'Butter Chicken, Dal Makhani, Paneer Lababdar & Thalis',
    image: '/images/menu_page_4.png',
    categories: ['Indian', 'South Indian']
  },
  {
    pageNumber: 6,
    title: 'Pizza, Burger & Sandwiches',
    subtitle: 'Loaded Wings Pizza, Paneer Burger & Garlic Breads',
    image: '/images/menu_page_5.png',
    categories: ['Pizza', 'Burger', 'Sandwiches']
  },
  {
    pageNumber: 7,
    title: 'Chinese Woks & Sizzlers',
    subtitle: 'Hakka Noodles, Chilli Paneer, Manchurian & Sizzlers',
    image: '/images/menu_page_6.png',
    categories: ['Chinese', 'Sizzlers']
  },
  {
    pageNumber: 8,
    title: 'Indo-Continental Bites & Desserts',
    subtitle: 'Pastas, Paneer Tikka, Gulab Jamun & Shahi Tukda',
    image: '/images/menu_page_7.png',
    categories: ['Indo-Continental', 'Dessert']
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', category: 'Beverages', name: 'Special Masala Chai', description: 'Freshly brewed kulhad tea with aromatic cardamoms & ginger.', price: 50, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm2', category: 'Beverages', name: 'Fresh Lime Soda / Water', description: 'Sweet or salted sparkling fresh lime soda.', price: 60, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm3', category: 'Breakfast', name: 'Bun Makkhan (White/Yellow)', description: 'Soft toasted bun stuffed with rich farm butter.', price: 60, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm4', category: 'Breakfast', name: 'Special Chola Bhatura', description: 'Piping hot fluffy bhaturas served with spicy Amritsari chole & pickles.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm5', category: 'Breakfast', name: 'Paneer Paratha with White Butter', description: 'Stuffed cottage cheese paratha served with curd & pickle.', price: 110, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm6', category: 'Breakfast', name: 'Dahi Jalebi (200gm)', description: 'Crispy golden jalebis paired with fresh thick curd.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm7', category: 'Chaat', name: 'Special Pav Bhaji', description: 'Butter-loaded spicy mashed vegetable bhaji served with toasted pavs.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm8', category: 'Chaat', name: 'Cheese Butter Pav Bhaji', description: 'Gratinated melted cheese topped over butter pav bhaji.', price: 170, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm9', category: 'Chaat', name: 'Agra Ka Special Bhalla', description: 'Crispy potato bhalla topped with sweet curd & mint chutney.', price: 80, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm10', category: 'Chaat', name: 'Lucknowi Basket Chaat', description: 'Crispy potato basket filled with tikkis, sprouts, curd & pomegranate seeds.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm11', category: 'Chaat', name: 'Gol Gappe (6 Pcs)', description: 'Crispy puris filled with spicy mint water & tangy tamarind chutney.', price: 40, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm12', category: 'Drinks', name: 'Virgin Mojito', description: 'Fresh mint, lime wedges, crushed ice & sparkling soda.', price: 119, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm13', category: 'Drinks', name: 'Blue Lagoon Cooler', description: 'Refreshing curacao blue citrus cooler with lemon zest.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm14', category: 'Drinks', name: 'Watermelon Sunset Mojito', description: 'Fresh watermelon extract, mint & chat masala fizz.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm15', category: 'Drinks', name: 'Peach Iced Tea', description: 'Slow brewed tea infused with natural peach nectar.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm16', category: 'Drinks', name: 'Virgin Pina Colada', description: 'Creamy coconut milk & pineapple juice mocktail.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm17', category: 'Coffee', name: 'Riverside Cold Brew Coffee', description: 'Chilled rich espresso blended with vanilla cream & chocolate syrup.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm18', category: 'Desserts', name: 'Oreo Cream Shake', description: 'Rich chocolate cookie shake topped with whipped cream.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm19', category: 'Starter', name: 'Veg Manchow Soup', description: 'Spicy Indo-Chinese soup served with crispy fried noodles.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm20', category: 'Starter', name: 'Lemon Coriander Soup', description: 'Vitamin-C rich aromatic clear soup with fresh coriander & lime.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm21', category: 'Indian', name: 'Dal Makhani Shahi', description: 'Overnight slow-cooked black lentils in rich cream & white butter.', price: 265, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm22', category: 'Indian', name: 'Paneer Lababdar', description: 'Soft paneer cubes simmered in rich onion-tomato gravy with cashew paste.', price: 315, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm23', category: 'Indian', name: 'Handi Soya Chaap Gravy', description: 'Tandoori soya chaap pieces cooked in claypot handi spices.', price: 305, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm24', category: 'Indian', name: 'Wings Special Deluxe Veg Thali', description: 'Complete meal with Paneer, Dal Makhani, Mix Veg, Naan, Rice, Raita & Sweet.', price: 345, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm25', category: 'Pizza', name: 'Loaded Wings Special Pizza', description: 'Loaded wood-fired pizza with mozzarella, jalapenos, paneer & bell peppers.', price: 349, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },
  { id: 'm26', category: 'Burger', name: 'Gourmet Paneer Burger', description: 'Crispy cottage cheese patty, cheddar slice, jalapenos & house dip.', price: 329, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },
  { id: 'm27', category: 'Starter', name: 'Cheese Garlic Bread (4 Pcs)', description: 'Toasted French baguette topped with garlic butter & melted mozzarella.', price: 235, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },
  { id: 'm28', category: 'Chinese', name: 'Chilli Paneer Dry', description: 'Crispy paneer cubes wok-tossed with capsicum, garlic & Schezwan sauce.', price: 219, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },
  { id: 'm29', category: 'Chinese', name: 'Veg Hakka Noodles', description: 'Stir-fried noodles loaded with crunchy veggies & light soy.', price: 249, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },
  { id: 'm30', category: 'Chinese', name: 'Cottage Cheese Steak Sizzler', description: 'Sizzling hot plate with paneer steak, herb rice, sautéed veggies & french fries.', price: 449, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },
  { id: 'm31', category: 'Italian', name: 'Red Sauce Arrabiata Pasta', description: 'Penne pasta tossed in spicy basil tomato concasse & olive oil.', price: 275, is_veg: true, image_url: '/images/menu_page_7.png', is_available: true, page_number: 8 },
  { id: 'm32', category: 'Starter', name: 'Paneer Tikka Charcoal Grilled', description: 'Classic marinated paneer skewers roasted in traditional tandoor.', price: 299, is_veg: true, image_url: '/images/menu_page_7.png', is_available: true, page_number: 8 },
  { id: 'm33', category: 'Desserts', name: 'Hot Gulab Jamun (2 Pcs)', description: 'Soft milk solids dumplings fried golden and soaked in cardamom syrup.', price: 99, is_veg: true, image_url: '/images/menu_page_7.png', is_available: true, page_number: 8 },
  { id: 'm34', category: 'Desserts', name: 'Royal Shahi Tukda', description: 'Fried saffron bread topped with thick rabri, pistachios & silver leaf.', price: 169, is_veg: true, image_url: '/images/menu_page_7.png', is_available: true, page_number: 8 }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Experience Lucknow’s Finest Riverside Dining & Speedboat Rides',
    slug: 'riverside-dining-and-speedboat-rides-lucknow',
    excerpt: 'Discover why Wings River Café at Laxman Jhula Park offers an unforgettable blend of multicuisine delicacies and thrilling river adventures.',
    content: 'Wings River Café is not just a place to eat—it is a complete sensory destination situated right along the Gomti River at Laxman Mela Ground. Guests can enjoy mouthwatering multicuisine dishes on our elevated riverside deck while watching speedboats zip across the water.',
    category: 'Riverside Experience',
    cover_image: '/images/Screenshot_20260720-180544_Maps.png',
    author: 'Wings River Team',
    read_time: '4 min read',
    created_at: '2026-07-15'
  },
  {
    id: 'b2',
    title: 'Host Unforgettable Birthday Parties & Celebrations by the Gomti River',
    slug: 'host-birthday-parties-wings-river-cafe',
    excerpt: 'From fairy light canopies to custom buffet menus, learn how to turn your birthday or anniversary into a magical evening.',
    content: 'Searching for the best party venue in Hazratganj and Purana Haidarabad? Wings River Café offers exclusive outdoor canopy setups, personalized lighting arches, DJ audio equipment, and customizable multicuisine buffet spreads for up to 200 guests.',
    category: 'Events & Parties',
    cover_image: '/images/Screenshot_20260720-180609_Maps.png',
    author: 'Event Coordinator',
    read_time: '3 min read',
    created_at: '2026-07-10'
  },
  {
    id: 'b3',
    title: 'Nightlife & Evening Ambiance at Laxman Jhula Waterfront',
    slug: 'nightlife-and-evening-ambiance-wings-river-cafe',
    excerpt: 'Experience the stunning night illumination, cool Gomti river breezes, and candlelit outdoor tables.',
    content: 'As sunset sets over the Gomti River, Wings River Café transforms into a glowing haven. Enjoy wood-fired pizzas, gourmet cocktails, and soothing music with a magnificent view of the lit-up Laxman Jhula Bridge.',
    category: 'Nightlife',
    cover_image: '/images/Screenshot_20260720-180644_Maps.png',
    author: 'Lifestyle Editor',
    read_time: '3 min read',
    created_at: '2026-07-08'
  },
  {
    id: 'b4',
    title: 'Official Lucknow Water Sports Ticket Rates & Speedboat Guide',
    slug: 'lucknow-water-sports-ticket-rates-guide',
    excerpt: 'Check out official ride tokens for Jetskis, Speedboats, Motorboats, and kids amusement rides.',
    content: 'Lucknow Water Sports operating directly at Wings River Café counter offers safe and thrilled rides on Gomti river. Read our complete guide on rates, safety gear, and booking packages.',
    category: 'Water Sports',
    cover_image: '/images/water_sports_ticket_poster.png',
    author: 'Water Sports Captain',
    read_time: '5 min read',
    created_at: '2026-07-05'
  },
  {
    id: 'b5',
    title: 'Chef’s Gourmet Specials & Signature Mocktails Highlight',
    slug: 'chefs-gourmet-specials-signature-mocktails',
    excerpt: 'Explore our top chef recommendations from Paneer Tikka to Blue Lagoon coolers.',
    content: 'From traditional North Indian delicacies to trendy mocktails and sizzling Indochinese woks, discover what makes our multicuisine menu a culinary favorite in Lucknow.',
    category: 'Culinary Highlights',
    cover_image: '/images/Screenshot_20260720-180938_Instagram.png',
    author: 'Head Chef',
    read_time: '4 min read',
    created_at: '2026-07-01'
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  { id: 'g1', title: 'Official Menu Card Cover', category: 'Restaurant', image_url: '/images/menu_page_cover.png', featured: true },
  { id: 'g2', title: 'Water Sports & Speedboats Dock', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180544_Maps.png', featured: true },
  { id: 'g3', title: 'Evening Riverside Deck Seating', category: 'Evening', image_url: '/images/Screenshot_20260720-180555_Maps.png', featured: true },
  { id: 'g4', title: 'Celebration & Fairy Light Canopy Setup', category: 'Evening', image_url: '/images/Screenshot_20260720-180609_Maps.png', featured: true },
  { id: 'g5', title: 'Sunset Gomti River View & Waterfront Lounge', category: 'River View', image_url: '/images/Screenshot_20260720-180621_Maps.png', featured: true },
  { id: 'g6', title: 'Cozy Indoor Dining Lounge & Interior', category: 'Restaurant', image_url: '/images/Screenshot_20260720-180630_Maps.png', featured: false },
  { id: 'g7', title: 'Nighttime Waterfront Party Lights', category: 'Evening', image_url: '/images/Screenshot_20260720-180644_Maps.png', featured: true },
  { id: 'g8', title: 'Cafe Gateway & Laxman Jhula Park Entrance', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180724_Maps.png', featured: false },
  { id: 'g9', title: 'Outdoor Riverside Lawn & Garden Tables', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180737_Maps.png', featured: false },
  { id: 'g10', title: 'Speedboat Ride Action on Gomti River', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180745_Maps.png', featured: true },
  { id: 'g11', title: 'Riverside Lounge Evening Ambience', category: 'Evening', image_url: '/images/Screenshot_20260720-180755_Maps.png', featured: false },
  { id: 'g12', title: 'Customer Dining Deck & Event Celebration Venue', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180812_Maps.png', featured: false },
  { id: 'g13', title: 'Instagram Highlight: Ambiance & Deck Vibe', category: 'Restaurant', image_url: '/images/Screenshot_20260720-175721_Instagram.png', featured: false },
  { id: 'g14', title: 'Chef Special Gourmet Food Spread', category: 'Food', image_url: '/images/Screenshot_20260720-180927_Instagram.png', featured: true },
  { id: 'g15', title: 'Signature Drinks & Mocktail Vibe', category: 'Food', image_url: '/images/Screenshot_20260720-180938_Instagram.png', featured: true },
  { id: 'g16', title: 'Lucknow Water Sports Official Ticket Poster', category: 'Water Sports', image_url: '/images/water_sports_ticket_poster.png', featured: true },
  { id: 'g17', title: 'Full Menu Card Collage (All Specialties)', category: 'Restaurant', image_url: '/images/full_menu_card_collage.png', featured: true },
  { id: 'g18', title: 'Menu Page 1: Chai, Breakfast & Lucknow Chaat', category: 'Food', image_url: '/images/menu_page_1.png', featured: false },
  { id: 'g19', title: 'Menu Page 2: Coolers & Refreshing Mocktails', category: 'Food', image_url: '/images/menu_page_2.png', featured: false },
  { id: 'g20', title: 'Menu Page 3: Gourmet Shakes & Warm Soups', category: 'Food', image_url: '/images/menu_page_3.png', featured: false },
  { id: 'g21', title: 'Menu Page 4: Indian Main Course, Thalis & South Indian', category: 'Food', image_url: '/images/menu_page_4.png', featured: false },
  { id: 'g22', title: 'Menu Page 5: Pizzas, Burgers & Sandwiches', category: 'Food', image_url: '/images/menu_page_5.png', featured: false },
  { id: 'g23', title: 'Menu Page 6: Chinese Woks & Sizzlers', category: 'Food', image_url: '/images/menu_page_6.png', featured: false },
  { id: 'g24', title: 'Menu Page 7: Indo-Continental Bites & Desserts', category: 'Food', image_url: '/images/menu_page_7.png', featured: false }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    author_name: 'Ananya Sharma',
    rating: 5,
    review_text: 'Amazing riverside view with great food! The paneer tikka and cold coffee were fantastic. Riding the speedboat before dinner was the highlight of our weekend!',
    date_str: '2 days ago',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'r2',
    author_name: 'Rahul Verma',
    rating: 5,
    review_text: 'Celebrated my sister’s 25th birthday here. The fairy light decoration near the river was magical. Staff were very courteous and the food was delicious!',
    date_str: '1 week ago',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

// Pure Client-Side LocalStorage Data Handlers
export function getStoredReservations(): Reservation[] {
  if (typeof window === 'undefined') return [];
  const local = localStorage.getItem('wings_reservations');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return [
    {
      id: 'res-101',
      name: 'Aarav Gupta',
      phone: '09876543210',
      email: 'aarav@example.com',
      booking_type: 'birthday_party',
      date: '2026-07-25',
      time: '19:30',
      guests: 8,
      special_requests: 'Fairy light table setup near river deck',
      status: 'confirmed',
      created_at: new Date().toISOString()
    }
  ];
}

export function saveReservation(res: Reservation): void {
  if (typeof window === 'undefined') return;
  const current = getStoredReservations();
  current.unshift(res);
  localStorage.setItem('wings_reservations', JSON.stringify(current));
}

export function getStoredMenuItems(): MenuItem[] {
  if (typeof window === 'undefined') return INITIAL_MENU_ITEMS;
  const local = localStorage.getItem('wings_menu');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_MENU_ITEMS;
}

export function saveMenuItem(item: MenuItem): void {
  if (typeof window === 'undefined') return;
  const current = getStoredMenuItems();
  current.unshift(item);
  localStorage.setItem('wings_menu', JSON.stringify(current));
}

export function getStoredBlogs(): BlogPost[] {
  if (typeof window === 'undefined') return INITIAL_BLOGS;
  const local = localStorage.getItem('wings_blogs');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_BLOGS;
}

export function saveBlog(blog: BlogPost): void {
  if (typeof window === 'undefined') return;
  const current = getStoredBlogs();
  current.unshift(blog);
  localStorage.setItem('wings_blogs', JSON.stringify(current));
}

export function getStoredReviews(): Review[] {
  if (typeof window === 'undefined') return INITIAL_REVIEWS;
  const local = localStorage.getItem('wings_reviews');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_REVIEWS;
}

export function saveReview(rev: Review): void {
  if (typeof window === 'undefined') return;
  const current = getStoredReviews();
  current.unshift(rev);
  localStorage.setItem('wings_reviews', JSON.stringify(current));
}

export function getStoredContactMessages(): ContactMessage[] {
  if (typeof window === 'undefined') return [];
  const local = localStorage.getItem('wings_contact');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return [];
}

export function saveContactMessage(msg: ContactMessage): void {
  if (typeof window === 'undefined') return;
  const current = getStoredContactMessages();
  current.unshift(msg);
  localStorage.setItem('wings_contact', JSON.stringify(current));
}
