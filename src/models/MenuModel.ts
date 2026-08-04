import { MenuItem, MenuPageDefinition } from '@/types';

export type { MenuItem, MenuPageDefinition };

export const MENU_BOOKLET_PAGES: MenuPageDefinition[] = [
  {
    page_number: 1,
    title: 'Wings River & Water Sports Menu',
    subtitle: 'Delicious Moments, Unforgettable Memories',
    image: '/images/menu_page_cover.png',
    categories: ['Cover']
  },
  {
    page_number: 2,
    title: 'Beverages, Breakfast & Chaat',
    subtitle: 'Chai, Chola Bhatura, Pav Bhaji & Agra Bhalla',
    image: '/images/menu_page_1.png',
    categories: ['Beverages', 'Breakfast', 'Chaat']
  },
  {
    page_number: 3,
    title: 'Coolers & Mocktails',
    subtitle: 'Virgin Mojito, Blue Lagoon, Iced Teas & Lassi',
    image: '/images/menu_page_2.png',
    categories: ['Coolers & Mocktails']
  },
  {
    page_number: 4,
    title: 'Shakes & Gourmet Soups',
    subtitle: 'Oreo Shake, Cold Coffee, Manchow & Sweet Corn',
    image: '/images/menu_page_3.png',
    categories: ['Shakes', 'Soup']
  },
  {
    page_number: 5,
    title: 'Indian Main Course & South Indian',
    subtitle: 'Butter Chicken, Dal Makhani, Paneer Lababdar & Thalis',
    image: '/images/menu_page_4.png',
    categories: ['Indian', 'South Indian']
  },
  {
    page_number: 6,
    title: 'Pizza, Burger & Sandwiches',
    subtitle: 'Loaded Wings Pizza, Paneer Burger & Garlic Breads',
    image: '/images/menu_page_5.png',
    categories: ['Pizza', 'Burger', 'Sandwiches']
  },
  {
    page_number: 7,
    title: 'Chinese Woks & Sizzlers',
    subtitle: 'Hakka Noodles, Chilli Paneer, Manchurian & Sizzlers',
    image: '/images/menu_page_6.png',
    categories: ['Chinese', 'Sizzlers']
  },
  {
    page_number: 8,
    title: 'Indo-Continental Bites & Desserts',
    subtitle: 'Pastas, Paneer Tikka, Gulab Jamun & Shahi Tukda',
    image: '/images/menu_page_7.png',
    categories: ['Indo-Continental', 'Dessert']
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', category_id: 'cat-beverages', category: 'Beverages', name: 'Special Masala Chai', description: 'Freshly brewed kulhad tea with aromatic cardamoms & ginger.', price: 50, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true },
  { id: 'm4', category_id: 'cat-breakfast', category: 'Breakfast', name: 'Special Chola Bhatura', description: 'Piping hot fluffy bhaturas served with spicy Amritsari chole & pickles.', price: 150, is_veg: true, image_url: '/images/menu_page_1.png', is_available: true },
  { id: 'm12', category_id: 'cat-drinks', category: 'Drinks', name: 'Virgin Mojito', description: 'Fresh mint, lime wedges, crushed ice & sparkling soda.', price: 119, is_veg: true, image_url: '/images/menu_page_2.png', is_available: true },
  { id: 'm21', category_id: 'cat-indian', category: 'Indian', name: 'Dal Makhani Shahi', description: 'Overnight slow-cooked black lentils in rich cream & white butter.', price: 265, is_veg: true, image_url: '/images/menu_page_4.png', is_available: true }
];
