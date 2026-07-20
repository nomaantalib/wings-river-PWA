// Water Sports Ticket Model Definition
export interface RideTicket {
  id: string;
  name: string;
  category: 'Water Sports' | 'Other Activities';
  price: number;
  unit: string;
  description: string;
  badge?: string;
  image: string;
}

export const WATER_SPORTS_RIDES: RideTicket[] = [
  {
    id: 'ride-1',
    name: 'Jetski Thrill Ride',
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
    category: 'Water Sports',
    price: 200,
    unit: 'Per Person 1 Round',
    description: 'Smooth & comfortable motor boat cruise around Laxman Jhula park riverfront.',
    badge: 'Scenic Cruise',
    image: '/images/Screenshot_20260720-180555_Maps.png'
  },
  {
    id: 'ride-4',
    name: 'Panda Train',
    category: 'Other Activities',
    price: 50,
    unit: 'Per Person 1 Round',
    description: 'Fun musical track train ride for toddlers, kids & families near the river park.',
    badge: 'Kids Zone',
    image: '/images/Screenshot_20260720-180737_Maps.png'
  },
  {
    id: 'ride-5',
    name: 'Electric Kids Car',
    category: 'Other Activities',
    price: 50,
    unit: 'Per Person 1 Round',
    description: 'Illuminated battery-powered electric drive cars for young adventurers.',
    badge: 'Kids Fun',
    image: '/images/Screenshot_20260720-180621_Maps.png'
  },
  {
    id: 'ride-6',
    name: 'Trampoline Jump',
    category: 'Other Activities',
    price: 50,
    unit: 'Per Person 1 Round',
    description: 'Enclosed safety netting high-bounce jumping trampoline enclosure.',
    badge: 'Active Play',
    image: '/images/Screenshot_20260720-180724_Maps.png'
  }
];
