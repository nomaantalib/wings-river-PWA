// Gallery Item Model & Catalogue of all 24 Project Image Assets
export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  featured?: boolean;
}

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
