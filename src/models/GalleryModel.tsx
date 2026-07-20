// Gallery Item Model — Curated venue photos only (no logo, no tiny menu pages)
export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  featured?: boolean;
  display_order?: number;
  is_deleted?: number;
  created_at?: string;
}

export const INITIAL_GALLERY: GalleryItem[] = [
  // Water Sports
  { id: 'g1', title: 'Jet Ski Thrill Ride — Gomti River', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180544_Maps.png', featured: true },
  { id: 'g2', title: 'Speedboat Action Shot — Gomti', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180745_Maps.png', featured: true },
  { id: 'g3', title: 'Water Sports Activity Poster', category: 'Water Sports', image_url: '/images/watersports_menu.jpg', featured: true },
  { id: 'g4', title: 'Motorboat Cruise — Laxman Jhula', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180555_Maps.png', featured: true },

  // Evening & Ambience
  { id: 'g5', title: 'Fairy Light Canopy Evening Setup', category: 'Evening', image_url: '/images/Screenshot_20260720-180609_Maps.png', featured: true },
  { id: 'g6', title: 'Sunset Gomti Riverfront Lounge', category: 'River View', image_url: '/images/Screenshot_20260720-180621_Maps.png', featured: true },
  { id: 'g7', title: 'Nighttime Waterfront Party Lights', category: 'Evening', image_url: '/images/Screenshot_20260720-180644_Maps.png', featured: true },
  { id: 'g8', title: 'Riverside Lounge Evening Ambience', category: 'Evening', image_url: '/images/Screenshot_20260720-180755_Maps.png', featured: false },

  // Restaurant & Outdoor Seating
  { id: 'g9', title: 'Cozy Indoor Dining Lounge', category: 'Restaurant', image_url: '/images/Screenshot_20260720-180630_Maps.png', featured: false },
  { id: 'g10', title: 'Café Entrance — Laxman Mela Ground', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180724_Maps.png', featured: false },
  { id: 'g11', title: 'Outdoor Riverside Lawn & Garden Tables', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180737_Maps.png', featured: false },
  { id: 'g12', title: 'Customer Dining Deck & Celebration Venue', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180812_Maps.png', featured: false },
  { id: 'g13', title: 'Instagram Highlight: Deck Vibe', category: 'Restaurant', image_url: '/images/Screenshot_20260720-175721_Instagram.png', featured: false },

  // Food
  { id: 'g14', title: 'Chef Special Gourmet Food Spread', category: 'Food', image_url: '/images/Screenshot_20260720-180927_Instagram.png', featured: true },
  { id: 'g15', title: 'Signature Drinks & Mocktail Bar', category: 'Food', image_url: '/images/Screenshot_20260720-180938_Instagram.png', featured: true },
];
