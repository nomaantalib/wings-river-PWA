// Database Abstraction layer for Cloudflare D1 with local fallback
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

// Menu Card Booklet Page Definitions
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

// Consolidated Master Menu Items extracted from Official Lucknow Water Sports Menu Card
export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // BEVERAGES & BREAKFAST
  { id: 'm1', category: 'Beverages', name: 'Special Masala Chai', description: 'Freshly brewed kulhad tea with aromatic cardamoms & ginger.', price: 50, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm2', category: 'Beverages', name: 'Fresh Lime Soda / Water', description: 'Sweet or salted sparkling fresh lime soda.', price: 60, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm3', category: 'Breakfast', name: 'Bun Makkhan (White/Yellow)', description: 'Soft toasted bun stuffed with rich farm butter.', price: 60, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm4', category: 'Breakfast', name: 'Special Chola Bhatura', description: 'Piping hot fluffy bhaturas served with spicy Amritsari chole & pickles.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm5', category: 'Breakfast', name: 'Paneer Paratha with White Butter', description: 'Stuffed cottage cheese paratha served with curd & pickle.', price: 110, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm6', category: 'Breakfast', name: 'Dahi Jalebi (200gm)', description: 'Crispy golden jalebis paired with fresh thick curd.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },

  // CHAAT
  { id: 'm7', category: 'Chaat', name: 'Special Pav Bhaji', description: 'Butter-loaded spicy mashed vegetable bhaji served with toasted pavs.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm8', category: 'Chaat', name: 'Cheese Butter Pav Bhaji', description: 'Gratinated melted cheese topped over butter pav bhaji.', price: 170, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm9', category: 'Chaat', name: 'Agra Ka Special Bhalla', description: 'Crispy potato bhalla topped with sweet curd & mint chutney.', price: 80, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm10', category: 'Chaat', name: 'Lucknowi Basket Chaat', description: 'Crispy potato basket filled with tikkis, sprouts, curd & pomegranate seeds.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm11', category: 'Chaat', name: 'Gol Gappe (6 Pcs)', description: 'Crispy puris filled with spicy mint water & tangy tamarind chutney.', price: 40, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },

  // COOLERS & MOCKTAILS
  { id: 'm12', category: 'Drinks', name: 'Virgin Mojito', description: 'Fresh mint, lime wedges, crushed ice & sparkling soda.', price: 119, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm13', category: 'Drinks', name: 'Blue Lagoon Cooler', description: 'Refreshing curacao blue citrus cooler with lemon zest.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm14', category: 'Drinks', name: 'Watermelon Sunset Mojito', description: 'Fresh watermelon extract, mint & chat masala fizz.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm15', category: 'Drinks', name: 'Peach Iced Tea', description: 'Slow brewed tea infused with natural peach nectar.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm16', category: 'Drinks', name: 'Virgin Pina Colada', description: 'Creamy coconut milk & pineapple juice mocktail.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },

  // SHAKES & SOUP
  { id: 'm17', category: 'Coffee', name: 'Riverside Cold Brew Coffee', description: 'Chilled rich espresso blended with vanilla cream & chocolate syrup.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm18', category: 'Desserts', name: 'Oreo Cream Shake', description: 'Rich chocolate cookie shake topped with whipped cream.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm19', category: 'Starter', name: 'Veg Manchow Soup', description: 'Spicy Indo-Chinese soup served with crispy fried noodles.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm20', category: 'Starter', name: 'Lemon Coriander Soup', description: 'Vitamin-C rich aromatic clear soup with fresh coriander & lime.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },

  // INDIAN MAIN COURSE
  { id: 'm21', category: 'Indian', name: 'Dal Makhani Shahi', description: 'Overnight slow-cooked black lentils in rich cream & white butter.', price: 265, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm22', category: 'Indian', name: 'Paneer Lababdar', description: 'Soft paneer cubes simmered in rich onion-tomato gravy with cashew paste.', price: 315, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm23', category: 'Indian', name: 'Handi Soya Chaap Gravy', description: 'Tandoori soya chaap pieces cooked in claypot handi spices.', price: 305, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm24', category: 'Indian', name: 'Wings Special Deluxe Veg Thali', description: 'Complete meal with Paneer, Dal Makhani, Mix Veg, Naan, Rice, Raita & Sweet.', price: 345, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },

  // PIZZA, BURGER & SANDWICHES
  { id: 'm25', category: 'Pizza', name: 'Loaded Wings Special Pizza', description: 'Loaded wood-fired pizza with mozzarella, jalapenos, paneer & bell peppers.', price: 349, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },
  { id: 'm26', category: 'Burger', name: 'Gourmet Paneer Burger', description: 'Crispy cottage cheese patty, cheddar slice, jalapenos & house dip.', price: 329, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },
  { id: 'm27', category: 'Starter', name: 'Cheese Garlic Bread (4 Pcs)', description: 'Toasted French baguette topped with garlic butter & melted mozzarella.', price: 235, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },

  // CHINESE
  { id: 'm28', category: 'Chinese', name: 'Chilli Paneer Dry', description: 'Crispy paneer cubes wok-tossed with capsicum, garlic & Schezwan sauce.', price: 219, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },
  { id: 'm29', category: 'Chinese', name: 'Veg Hakka Noodles', description: 'Stir-fried noodles loaded with crunchy veggies & light soy.', price: 249, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },
  { id: 'm30', category: 'Chinese', name: 'Cottage Cheese Steak Sizzler', description: 'Sizzling hot plate with paneer steak, herb rice, sautéed veggies & french fries.', price: 449, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },

  // INDO-CONTINENTAL & DESSERTS
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
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  { id: 'g1', title: 'Official Menu Card Cover', category: 'Restaurant', image_url: '/images/menu_page_cover.png', featured: true },
  { id: 'g2', title: 'Water Sports & Speedboats Dock', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180544_Maps.png', featured: true },
  { id: 'g3', title: 'Beverages & Breakfast Menu Page', category: 'Food', image_url: '/images/menu_page_1.png', featured: true },
  { id: 'g4', title: 'Evening Riverside Deck Seating', category: 'Evening', image_url: '/images/Screenshot_20260720-180555_Maps.png', featured: true },
  { id: 'g5', title: 'Coolers & Mocktails Menu Page', category: 'Food', image_url: '/images/menu_page_2.png', featured: false },
  { id: 'g6', title: 'Full Menu Card Collage', category: 'Restaurant', image_url: '/images/full_menu_card_collage.png', featured: true }
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
