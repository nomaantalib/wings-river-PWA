import { RideTicket } from '@/types';

export type { RideTicket };

export const WATER_SPORTS_RIDES: RideTicket[] = [
  {
    id: 'ride-1',
    name: 'Jetski Thrill Ride',
    emoji: '🏄',
    category: 'Water Sports',
    price: 350,
    unit: 'Per Person 1 Round',
    description: 'High speed jet ski adventure on Gomti river with certified instructor & life jacket.',
    badge: 'Most Popular',
    image: '/images/Screenshot_20260720-180544_Maps.png'
  },
  {
    id: 'ride-2',
    name: 'Speed Boat Ride',
    emoji: '⚡',
    category: 'Water Sports',
    price: 250,
    unit: 'Per Person 1 Round',
    description: 'Exhilarating twin-engine speedboat ride offering panoramic riverfront views.',
    badge: 'Family Favorite',
    image: '/images/Screenshot_20260720-180745_Maps.png'
  },
  {
    id: 'ride-3',
    name: 'Motor Boat Cruise',
    emoji: '🚤',
    category: 'Water Sports',
    price: 200,
    unit: 'Per Person 1 Round',
    description: 'Smooth & comfortable motor boat cruise around Laxman Jhula park riverfront.',
    badge: 'Scenic Cruise',
    image: '/images/Screenshot_20260720-180555_Maps.png'
  }
];
