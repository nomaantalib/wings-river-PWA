// Menu Item & Booklet Page Models
export interface MenuItem {
  id: string;
  category_id: string;
  category?: string;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  image_url: string;
  is_available: boolean;
  is_bestseller?: boolean;
  display_order?: number;
  version?: number;
  is_deleted?: number;
  page_number?: number;
}

export interface MenuPageDefinition {
  pageNumber?: number;
  page_number?: number;
  title: string;
  subtitle: string;
  image: string;
  categories: string[] | string;
  display_order?: number;
}

export const MENU_BOOKLET_PAGES: MenuPageDefinition[] = [
  {
    pageNumber: 1,
    title: 'Wings River & Water Sports Menu',
    subtitle: 'Delicious Moments, Unforgettable Memories',
    image: '/menu card food/page1.png',
    categories: ['Cover']
  },
  {
    pageNumber: 2,
    title: 'Beverages, Breakfast & Chaat',
    subtitle: 'Chai, Chola Bhatura, Pav Bhaji & Agra Bhalla',
    image: '/menu card food/page2.png',
    categories: ['Beverages', 'Breakfast', 'Chaat']
  },
  {
    pageNumber: 3,
    title: 'Coolers & Mocktails',
    subtitle: 'Virgin Mojito, Blue Lagoon, Iced Teas & Lassi',
    image: '/menu card food/page 3.png',
    categories: ['Coolers & Mocktails']
  },
  {
    pageNumber: 4,
    title: 'Shakes & Gourmet Soups',
    subtitle: 'Oreo Shake, Cold Coffee, Manchow & Sweet Corn',
    image: '/menu card food/page4 .png',
    categories: ['Shakes', 'Soup']
  },
  {
    pageNumber: 5,
    title: 'Indian Main Course & South Indian',
    subtitle: 'Butter Chicken, Dal Makhani, Paneer Lababdar & Thalis',
    image: '/menu card food/page 5.png',
    categories: ['Indian', 'South Indian']
  },
  {
    pageNumber: 6,
    title: 'Pizza, Burger & Sandwiches',
    subtitle: 'Loaded Wings Pizza, Paneer Burger & Garlic Breads',
    image: '/menu card food/page6 .png',
    categories: ['Pizza', 'Burger', 'Sandwiches']
  },
  {
    pageNumber: 7,
    title: 'Chinese Woks & Sizzlers',
    subtitle: 'Hakka Noodles, Chilli Paneer, Manchurian & Sizzlers',
    image: '/menu card food/page 7.png',
    categories: ['Chinese', 'Sizzlers']
  },
  {
    pageNumber: 8,
    title: 'Indo-Continental Bites & Desserts',
    subtitle: 'Pastas, Paneer Tikka, Gulab Jamun & Shahi Tukda',
    image: '/menu card food/page 8.png',
    categories: ['Indo-Continental', 'Dessert']
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', category_id: 'cat-beverages', category: 'Beverages', name: 'Special Masala Chai', description: 'Freshly brewed kulhad tea with aromatic cardamoms & ginger.', price: 50, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm2', category_id: 'cat-beverages', category: 'Beverages', name: 'Fresh Lime Soda / Water', description: 'Sweet or salted sparkling fresh lime soda.', price: 60, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm3', category_id: 'cat-breakfast', category: 'Breakfast', name: 'Bun Makkhan (White/Yellow)', description: 'Soft toasted bun stuffed with rich farm butter.', price: 60, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm4', category_id: 'cat-breakfast', category: 'Breakfast', name: 'Special Chola Bhatura', description: 'Piping hot fluffy bhaturas served with spicy Amritsari chole & pickles.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm5', category_id: 'cat-breakfast', category: 'Breakfast', name: 'Paneer Paratha with White Butter', description: 'Stuffed cottage cheese paratha served with curd & pickle.', price: 110, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm6', category_id: 'cat-breakfast', category: 'Breakfast', name: 'Dahi Jalebi (200gm)', description: 'Crispy golden jalebis paired with fresh thick curd.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm7', category_id: 'cat-chaat', category: 'Chaat', name: 'Special Pav Bhaji', description: 'Butter-loaded spicy mashed vegetable bhaji served with toasted pavs.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm8', category_id: 'cat-chaat', category: 'Chaat', name: 'Cheese Butter Pav Bhaji', description: 'Gratinated melted cheese topped over butter pav bhaji.', price: 170, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm9', category_id: 'cat-chaat', category: 'Chaat', name: 'Agra Ka Special Bhalla', description: 'Crispy potato bhalla topped with sweet curd & mint chutney.', price: 80, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm10', category_id: 'cat-chaat', category: 'Chaat', name: 'Lucknowi Basket Chaat', description: 'Crispy potato basket filled with tikkis, sprouts, curd & pomegranate seeds.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm11', category_id: 'cat-chaat', category: 'Chaat', name: 'Gol Gappe (6 Pcs)', description: 'Crispy puris filled with spicy mint water & tangy tamarind chutney.', price: 40, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true, page_number: 2 },
  { id: 'm12', category_id: 'cat-drinks', category: 'Drinks', name: 'Virgin Mojito', description: 'Fresh mint, lime wedges, crushed ice & sparkling soda.', price: 119, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm13', category_id: 'cat-drinks', category: 'Drinks', name: 'Blue Lagoon Cooler', description: 'Refreshing curacao blue citrus cooler with lemon zest.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm14', category_id: 'cat-drinks', category: 'Drinks', name: 'Watermelon Sunset Mojito', description: 'Fresh watermelon extract, mint & chat masala fizz.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm15', category_id: 'cat-drinks', category: 'Drinks', name: 'Peach Iced Tea', description: 'Slow brewed tea infused with natural peach nectar.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm16', category_id: 'cat-drinks', category: 'Drinks', name: 'Virgin Pina Colada', description: 'Creamy coconut milk & pineapple juice mocktail.', price: 129, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true, page_number: 3 },
  { id: 'm17', category_id: 'cat-coffee', category: 'Coffee', name: 'Riverside Cold Brew Coffee', description: 'Chilled rich espresso blended with vanilla cream & chocolate syrup.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm18', category_id: 'cat-desserts', category: 'Desserts', name: 'Oreo Cream Shake', description: 'Rich chocolate cookie shake topped with whipped cream.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm19', category_id: 'cat-chaat', category: 'Starter', name: 'Veg Manchow Soup', description: 'Spicy Indo-Chinese soup served with crispy fried noodles.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm20', category_id: 'cat-chaat', category: 'Starter', name: 'Lemon Coriander Soup', description: 'Vitamin-C rich aromatic clear soup with fresh coriander & lime.', price: 149, is_veg: true, image_url: '/images/menu_page_3.png', is_available: true, page_number: 4 },
  { id: 'm21', category_id: 'cat-indian', category: 'Indian', name: 'Dal Makhani Shahi', description: 'Overnight slow-cooked black lentils in rich cream & white butter.', price: 265, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm22', category_id: 'cat-indian', category: 'Indian', name: 'Paneer Lababdar', description: 'Soft paneer cubes simmered in rich onion-tomato gravy with cashew paste.', price: 315, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm23', category_id: 'cat-indian', category: 'Indian', name: 'Handi Soya Chaap Gravy', description: 'Tandoori soya chaap pieces cooked in claypot handi spices.', price: 305, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm24', category_id: 'cat-indian', category: 'Indian', name: 'Wings Special Deluxe Veg Thali', description: 'Complete meal with Paneer, Dal Makhani, Mix Veg, Naan, Rice, Raita & Sweet.', price: 345, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true, page_number: 5 },
  { id: 'm25', category_id: 'cat-pizza', category: 'Pizza', name: 'Loaded Wings Special Pizza', description: 'Loaded wood-fired pizza with mozzarella, jalapenos, paneer & bell peppers.', price: 349, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },
  { id: 'm26', category_id: 'cat-pizza', category: 'Burger', name: 'Gourmet Paneer Burger', description: 'Crispy cottage cheese patty, cheddar slice, jalapenos & house dip.', price: 329, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },
  { id: 'm27', category_id: 'cat-chaat', category: 'Starter', name: 'Cheese Garlic Bread (4 Pcs)', description: 'Toasted French baguette topped with garlic butter & melted mozzarella.', price: 235, is_veg: true, image_url: '/images/menu_page_5.png', is_available: true, page_number: 6 },
  { id: 'm28', category_id: 'cat-chinese', category: 'Chinese', name: 'Chilli Paneer Dry', description: 'Crispy paneer cubes wok-tossed with capsicum, garlic & Schezwan sauce.', price: 219, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },
  { id: 'm29', category_id: 'cat-chinese', category: 'Chinese', name: 'Veg Hakka Noodles', description: 'Stir-fried noodles loaded with crunchy veggies & light soy.', price: 249, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },
  { id: 'm30', category_id: 'cat-chinese', category: 'Chinese', name: 'Cottage Cheese Steak Sizzler', description: 'Sizzling hot plate with paneer steak, herb rice, sautéed veggies & french fries.', price: 449, is_veg: true, image_url: '/images/menu_page_6.png', is_available: true, page_number: 7 },
  { id: 'm31', category_id: 'cat-chinese', category: 'Italian', name: 'Red Sauce Arrabiata Pasta', description: 'Penne pasta tossed in spicy basil tomato concasse & olive oil.', price: 275, is_veg: true, image_url: '/images/menu_page_7.png', is_available: true, page_number: 8 },
  { id: 'm32', category_id: 'cat-chaat', category: 'Starter', name: 'Paneer Tikka Charcoal Grilled', description: 'Classic marinated paneer skewers roasted in traditional tandoor.', price: 299, is_veg: true, image_url: '/images/menu_page_7.png', is_available: true, page_number: 8 },
  { id: 'm33', category_id: 'cat-desserts', category: 'Desserts', name: 'Hot Gulab Jamun (2 Pcs)', description: 'Soft milk solids dumplings fried golden and soaked in cardamom syrup.', price: 99, is_veg: true, image_url: '/images/menu_page_7.png', is_available: true, page_number: 8 },
  { id: 'm34', category_id: 'cat-desserts', category: 'Desserts', name: 'Royal Shahi Tukda', description: 'Fried saffron bread topped with thick rabri, pistachios & silver leaf.', price: 169, is_veg: true, image_url: '/images/menu_page_7.png', is_available: true, page_number: 8 }
];
