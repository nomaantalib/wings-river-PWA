// Hero Section Model & Default Data

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
}

export interface HeroSettings {
  badgeText: string;
  mainHeadline: string;
  subHeadline: string;
  contactPhone: string;
  slides: HeroSlide[];
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hs-1',
    image: '/images/Screenshot_20260720-180544_Maps.png',
    title: 'Wings River Café',
    subtitle: 'Taste • Eat • Relax by the Gomti River',
    tag: 'Lucknow Water Sports & Speedboat Rides'
  },
  {
    id: 'hs-2',
    image: '/images/Screenshot_20260720-180555_Maps.png',
    title: 'Luxurious Riverside Dining',
    subtitle: 'Multicuisine Delights with Scenic Sunset Views',
    tag: 'Family Restaurant & Evening Ambience'
  },
  {
    id: 'hs-3',
    image: '/images/Screenshot_20260720-180609_Maps.png',
    title: 'Celebrations & Party Canopy',
    subtitle: 'Birthday Parties, Anniversaries & Romantic Dinners',
    tag: 'Fairy Light Arches & Custom Catering'
  },
  {
    id: 'hs-4',
    image: '/images/Screenshot_20260720-180745_Maps.png',
    title: 'Speedboat Rides on River Gomti',
    subtitle: 'Exhilarating Water Sports Adventures Beside the Cafe',
    tag: 'Lucknow Water Sports Official Hub'
  },
  {
    id: 'hs-5',
    image: '/images/Screenshot_20260720-180621_Maps.png',
    title: 'Breathtaking Sunset Riverfront',
    subtitle: 'Relax with Gourmet Coffee & Coolers by Laxman Jhula Bridge',
    tag: 'Scenic Sunset & Waterfront Deck'
  },
  {
    id: 'hs-6',
    image: '/images/Screenshot_20260720-180644_Maps.png',
    title: 'Glow of Waterfront Nightlife',
    subtitle: 'Enchanting Lighting, Music & River Breeze Evenings',
    tag: 'Lucknow’s Top Waterfront Night Venue'
  },
  {
    id: 'hs-7',
    image: '/images/Screenshot_20260720-180927_Instagram.png',
    title: 'Master Chef Gourmet Spread',
    subtitle: 'Authentic Indian, Indochinese & Artisanal Pizzas',
    tag: 'Premium Multicuisine Gastronomy'
  }
];

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  badgeText: '✨ Lucknow’s Premier Waterfront Dining & Water Sports Destination',
  mainHeadline: 'Wings River Café & Water Sports',
  subHeadline: 'Multicuisine Gourmet Food, Riverside Deck & Thrilling Speedboat Rides',
  contactPhone: '07310008020',
  slides: DEFAULT_HERO_SLIDES
};
