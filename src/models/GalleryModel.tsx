// Gallery Item Model — Curated venue photos with detailed descriptions
export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  media_type?: 'image' | 'video';
  video_url?: string;
  about?: string;
  description?: string;
  featured?: boolean;
  cluster_id?: 'indoor' | 'garden' | 'rooftop' | string;
  display_order?: number;
  is_deleted?: number;
  created_at?: string;
}

export const INITIAL_GALLERY: GalleryItem[] = [
  // Cluster-specific photos for Area Gallery View
  {
    id: 'area-indoor-1',
    title: 'Indoor AC Hall — Cozy River View Seating',
    category: 'Indoor AC',
    cluster_id: 'indoor',
    image_url: '/images/Screenshot_20260720-180621_Maps.png',
    about: 'Fully air-conditioned indoor dining hall with panoramic window tables facing Gomti Riverfront.',
    featured: true
  },
  {
    id: 'area-indoor-2',
    title: 'Indoor AC Dining & Fine Ambience',
    category: 'Indoor AC',
    cluster_id: 'indoor',
    image_url: '/images/Screenshot_20260720-180630_Maps.png',
    about: 'Luxurious indoor seating with plush sofas, warm lighting, and private dining comfort.',
    featured: true
  },
  {
    id: 'area-indoor-video-1',
    title: 'Indoor AC Ambience Video Tour',
    category: 'Indoor AC',
    cluster_id: 'indoor',
    image_url: '/images/Screenshot_20260720-180621_Maps.png',
    media_type: 'video',
    video_url: '/wings background/gemini_generated_video_d2d858f7.mp4',
    about: 'Live video view of the luxury air-conditioned hall and window dining tables.',
    featured: true
  },
  {
    id: 'area-garden-1',
    title: 'Open Garden Area — Riverside Breeze & Lawns',
    category: 'Garden Area',
    cluster_id: 'garden',
    image_url: '/images/Screenshot_20260720-180644_Maps.png',
    about: 'Spacious outdoor garden seating under canopy fairy lights beside Gomti River walkway.',
    featured: true
  },
  {
    id: 'area-garden-2',
    title: 'Canopy Party Setup — Open Garden Area',
    category: 'Garden Area',
    cluster_id: 'garden',
    image_url: '/images/Screenshot_20260720-180724_Maps.png',
    about: 'Private canopy setups in our open garden for birthdays, anniversaries, and family celebrations.',
    featured: true
  },
  {
    id: 'area-rooftop-1',
    title: 'Rooftop Upper Deck — Panoramic Sunset View',
    category: 'Rooftop Deck',
    cluster_id: 'rooftop',
    image_url: '/images/Screenshot_20260720-180737_Maps.png',
    about: 'Elevated rooftop upper deck with 360° starlit sky views and unobstructed Gomti riverfront sunset dining.',
    featured: true
  },
  {
    id: 'area-rooftop-video-1',
    title: 'Riverside Sunset Atmosphere Video',
    category: 'Rooftop Deck',
    cluster_id: 'rooftop',
    image_url: '/images/Screenshot_20260720-180737_Maps.png',
    media_type: 'video',
    video_url: '/wings background/gemini_generated_video_5c810dd6.mp4',
    about: 'Dynamic sunset video stream from our rooftop upper deck overlooking Gomti Riverfront.',
    featured: true
  },
  {
    id: 'area-rooftop-2',
    title: 'VIP Upper Deck Sunset Table',
    category: 'Rooftop Deck',
    cluster_id: 'rooftop',
    image_url: '/images/Screenshot_20260720-180927_Instagram.png',
    about: 'Lucknow premier rooftop dining experience overlooking the riverfront promenade.',
    featured: true
  },

  // Water Sports
  {
    id: 'g1',
    title: 'Jet Ski Thrill Ride — Gomti River',
    category: 'Water Sports',
    image_url: '/images/Screenshot_20260720-180544_Maps.png',
    about: 'High-octane jet skiing experience along the Gomti Riverfront with certified instructors and full safety gear.',
    featured: true
  },
  {
    id: 'g2',
    title: 'Speedboat Action Shot — Gomti',
    category: 'Water Sports',
    image_url: '/images/Screenshot_20260720-180745_Maps.png',
    about: 'Exhilarating high-speed motorboat rides offering panoramic waterfront views of Laxman Jhula Park and Lucknow skyline.',
    featured: true
  },
  {
    id: 'g3',
    title: 'Water Sports Activity Poster',
    category: 'Water Sports',
    image_url: '/images/watersports_menu.jpg',
    about: 'Official Lucknow Water Sports activity roster featuring jet skiing, speedboats, and family motorboat rides at our dock.',
    featured: true
  },
  {
    id: 'g4',
    title: 'Motorboat Cruise — Laxman Jhula',
    category: 'Water Sports',
    image_url: '/images/Screenshot_20260720-180555_Maps.png',
    about: 'Relaxing motorboat cruise along Gomti Riverfront, perfect for family outings, sunset photos, and peaceful evening rides.',
    featured: true
  },

  // Evening & Ambience

  {
    id: 'g6',
    title: 'Sunset Gomti Riverfront Lounge',
    category: 'River View',
    image_url: '/images/Screenshot_20260720-180621_Maps.png',
    about: 'Unobstructed waterfront sunset view from our private open deck along Laxman Mela Ground Gomti Riverfront.',
    featured: true
  },
  {
    id: 'g7',
    title: 'Nighttime Waterfront Party Lights',
    category: 'Evening',
    image_url: '/images/Screenshot_20260720-180644_Maps.png',
    about: 'Vibrant evening celebration atmosphere featuring warm glowing canopy lights, live music vibes, and gourmet dining.',
    featured: true
  },
  {
    id: 'g8',
    title: 'Riverside Lounge Evening Ambience',
    category: 'Evening',
    image_url: '/images/Screenshot_20260720-180755_Maps.png',
    about: 'Serene twilight dining ambiance combining cool Gomti river breezes with executive comfortable seating.',
    featured: false
  },

  // Restaurant & Outdoor Seating
  {
    id: 'g9',
    title: 'Cozy Indoor Dining Lounge',
    category: 'Restaurant',
    image_url: '/images/Screenshot_20260720-180630_Maps.png',
    about: 'Air-conditioned indoor dining hall featuring cozy seating setups, warm ambient lighting, and panoramic river view windows.',
    featured: false
  },
  {
    id: 'g10',
    title: 'Café Entrance — Laxman Mela Ground',
    category: 'Outdoor Seating',
    image_url: '/images/Screenshot_20260720-180724_Maps.png',
    about: 'Welcoming main entrance to Wings River Café at Laxman Mela Ground Waterfront, Hazratganj, Lucknow.',
    featured: false
  },
  {
    id: 'g11',
    title: 'Outdoor Riverside Lawn & Garden Tables',
    category: 'Outdoor Seating',
    image_url: '/images/Screenshot_20260720-180737_Maps.png',
    about: 'Spacious open garden seating surrounded by lush green lawns and fresh open-air waterfront breezes.',
    featured: false
  },
  {
    id: 'g12',
    title: 'Customer Dining Deck & Celebration Venue',
    category: 'Outdoor Seating',
    image_url: '/images/Screenshot_20260720-180812_Maps.png',
    about: 'Exclusive deck reservation area tailored for family reunions, corporate gatherings, and festive group celebrations.',
    featured: false
  },
  {
    id: 'g13',
    title: 'Instagram Highlight: Deck Vibe',
    category: 'Restaurant',
    image_url: '/images/Screenshot_20260720-175721_Instagram.png',
    about: 'Trending Instagram highlight capturing our signature waterfront deck dining and relaxed evening hospitality.',
    featured: false
  },

  // Food
  {
    id: 'g14',
    title: 'Chef Special Gourmet Food Spread',
    category: 'Food',
    image_url: '/images/Screenshot_20260720-180927_Instagram.png',
    about: 'Authentic multicuisine food spread including rich North Indian gravies, authentic Chinese woks, and artisanal pizzas.',
    featured: true
  },
  {
    id: 'g15',
    title: 'Signature Drinks & Mocktail Bar',
    category: 'Food',
    image_url: '/images/Screenshot_20260720-180938_Instagram.png',
    about: 'Handcrafted refreshing mocktails, iced teas, and gourmet beverages served fresh at our waterfront beverage bar.',
    featured: true
  },
];
