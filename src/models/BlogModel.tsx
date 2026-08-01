// Blog Post Model & Initial Articles
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string;
  images?: string[]; // Multiple images for blog gallery & inline sliders
  video_url?: string; // Glimpse video or embed URL
  tags?: string[];   // Topic tags for filtering
  author: string;
  read_time: string;
  created_at?: string;
  status?: string;   // draft, published, scheduled
  is_published?: boolean;
  version?: number;
  is_deleted?: number;
  published_at?: string;
  updated_at?: string;
}

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Experience Lucknow’s Finest Riverside Dining & Speedboat Rides',
    slug: 'riverside-dining-and-speedboat-rides-lucknow',
    excerpt: 'Discover why Wings River Café at Laxman Jhula Park offers an unforgettable blend of multicuisine delicacies and thrilling river adventures.',
    content: 'Wings River Café is not just a place to eat—it is a complete sensory destination situated right along the Gomti River at Laxman Mela Ground. Guests can enjoy mouthwatering multicuisine dishes on our elevated riverside deck while watching speedboats zip across the water.\n\nOur open-air seating provides panoramic views of the water sunset, with warm lighting and ambient acoustic music setting the perfect mood. Combine your meal with an adrenaline-pumping speedboat round operated directly by Lucknow Water Sports!',
    category: 'Riverside Experience',
    cover_image: '/images/Screenshot_20260720-180544_Maps.png',
    images: [
      '/images/Screenshot_20260720-180544_Maps.png',
      '/images/Screenshot_20260720-180644_Maps.png',
      '/images/Screenshot_20260720-180644_Maps.png',
      '/images/food_menu_collage.jpg'
    ],
    tags: ['Riverside', 'Speedboat', 'Gomti River', 'Dining'],
    author: 'Wings River Team',
    read_time: '4 min read',
    created_at: '2026-07-15',
    is_published: true
  },
  {
    id: 'b2',
    title: 'Host Unforgettable Birthday Parties & Celebrations by the Gomti River',
    slug: 'host-birthday-parties-wings-river-cafe',
    excerpt: 'From fairy light canopies to custom buffet menus, learn how to turn your birthday or anniversary into a magical evening.',
    content: 'Searching for the best party venue in Hazratganj and Purana Haidarabad? Wings River Café offers exclusive outdoor canopy setups, personalized lighting arches, DJ audio equipment, and customizable multicuisine buffet spreads for up to 200 guests.\n\nWhether it is a romantic candlelit anniversary setup or a lively birthday bash with friends, our dedicated event management team handles end-to-end decor, custom cake arrangements, and live grill stations.',
    category: 'Events & Parties',
    cover_image: '/images/Screenshot_20260720-180644_Maps.png',
    images: [
      '/images/Screenshot_20260720-180644_Maps.png',
      '/images/Screenshot_20260720-180544_Maps.png',
      '/images/Screenshot_20260720-180938_Instagram.png'
    ],
    tags: ['Birthday', 'Parties', 'Anniversary', 'Decor'],
    author: 'Event Coordinator',
    read_time: '3 min read',
    created_at: '2026-07-10',
    is_published: true
  },
  {
    id: 'b3',
    title: 'Nightlife & Evening Ambiance at Laxman Jhula Waterfront',
    slug: 'nightlife-and-evening-ambiance-wings-river-cafe',
    excerpt: 'Experience the stunning night illumination, cool Gomti river breezes, and candlelit outdoor tables.',
    content: 'As sunset sets over the Gomti River, Wings River Café transforms into a glowing haven. Enjoy wood-fired pizzas, gourmet cocktails, and soothing music with a magnificent view of the lit-up Laxman Jhula Bridge.\n\nNight owls can relax under our illuminated palm canopy until midnight while sampling artisanal cold coffees, mocktails, and sizzling hot Indo-Chinese starters.',
    category: 'Nightlife',
    cover_image: '/images/Screenshot_20260720-180644_Maps.png',
    images: [
      '/images/Screenshot_20260720-180644_Maps.png',
      '/images/Screenshot_20260720-180544_Maps.png',
      '/images/water_sports_ticket_poster.png'
    ],
    tags: ['Nightlife', 'Evening Vibe', 'Gomti View', 'Pizza'],
    author: 'Lifestyle Editor',
    read_time: '3 min read',
    created_at: '2026-07-08',
    is_published: true
  },
  {
    id: 'b4',
    title: 'Official Lucknow Water Sports Ticket Rates & Speedboat Guide',
    slug: 'lucknow-water-sports-ticket-rates-guide',
    excerpt: 'Check out official ride tokens for Jetskis, Speedboats, Motorboats, and kids amusement rides.',
    content: 'Lucknow Water Sports operating directly at Wings River Café counter offers safe and thrilling rides on Gomti river. Read our complete guide on rates, safety gear, and booking packages.\n\nAll rides come equipped with standard life jackets and certified captains. Group discounts and combo packages (Ride + Meal Token) are available at the front desk.',
    category: 'Water Sports',
    cover_image: '/images/water_sports_ticket_poster.png',
    images: [
      '/images/water_sports_ticket_poster.png',
      '/images/Screenshot_20260720-180544_Maps.png'
    ],
    tags: ['Water Sports', 'Tickets', 'Speedboat', 'JetSki'],
    author: 'Water Sports Captain',
    read_time: '5 min read',
    created_at: '2026-07-05',
    is_published: true
  },
  {
    id: 'b5',
    title: 'Chef’s Gourmet Specials & Signature Mocktails Highlight',
    slug: 'chefs-gourmet-specials-signature-mocktails',
    excerpt: 'Explore our top chef recommendations from Paneer Tikka to Blue Lagoon coolers.',
    content: 'From traditional North Indian delicacies to trendy mocktails and sizzling Indochinese woks, discover what makes our multicuisine menu a culinary favorite in Lucknow.\n\nDon’t miss out on our Signature Virgin Mojito, Special Chola Bhatura, and Handi Soya Chaap prepared fresh daily by master chefs.',
    category: 'Culinary Highlights',
    cover_image: '/images/Screenshot_20260720-180938_Instagram.png',
    images: [
      '/images/Screenshot_20260720-180938_Instagram.png',
      '/images/food_menu_collage.jpg',
      '/images/food_menu_collage.jpg'
    ],
    tags: ['Food', 'Mocktails', 'Chef Special', 'Lucknowi Flavors'],
    author: 'Head Chef',
    read_time: '4 min read',
    created_at: '2026-07-01',
    is_published: true
  }
];
