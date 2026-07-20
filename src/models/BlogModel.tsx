// Blog Post Model & Initial Articles
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
