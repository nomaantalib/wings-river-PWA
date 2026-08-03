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
  
  aboutBadge?: string;
  aboutTitle?: string;
  aboutParagraph1?: string;
  aboutParagraph2?: string;
  aboutPrimaryImage?: string;
  aboutSecondaryImage?: string;

  highlight1Title?: string;
  highlight1Subtitle?: string;
  highlight2Title?: string;
  highlight2Subtitle?: string;
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
    image: '/images/Screenshot_20260720-180644_Maps.png',
    title: 'Celebrations & Party Canopy',
    subtitle: 'Birthday Parties, Anniversaries & Romantic Dinners',
    tag: 'Fairy Light Arches & Custom Catering'
  }
];

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  badgeText: 'Lucknow’s Premier Waterfront Dining Destination',
  mainHeadline: 'Wings River Café & Water Sports',
  subHeadline: 'Multicuisine Gourmet Food, Riverside Deck & Thrilling Speedboat Rides',
  contactPhone: '07310008020',
  slides: DEFAULT_HERO_SLIDES,
  aboutBadge: 'Premium Multicuisine & Waterfront Haven',
  aboutTitle: 'Welcome to Wings River Café',
  aboutParagraph1: 'Located inside Laxman Mela Ground at Laxman Jhula Park along the scenic Gomti River in Lucknow.',
  aboutParagraph2: 'Whether you are planning a relaxed family gathering, a festive birthday party, or a romantic candlelit evening.',
  aboutPrimaryImage: '/images/Screenshot_20260720-180544_Maps.png',
  aboutSecondaryImage: '/images/Screenshot_20260720-180621_Maps.png',
  highlight1Title: 'Multicuisine Delights',
  highlight1Subtitle: 'North Indian, Chinese, Italian, Pizzas & Artisanal Coffee',
  highlight2Title: 'Water Sports & Rides',
  highlight2Subtitle: 'Speedboats & jet rides directly accessible at our river jetty'
};
