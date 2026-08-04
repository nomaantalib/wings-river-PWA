import { Review, ContactMessage } from '@/types';

export type { Review, ContactMessage };

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    author_name: 'Ananya Sharma',
    rating: 5,
    review_text: 'Amazing riverside view with great food! The paneer tikka and cold coffee were fantastic.',
    date_str: '2 days ago',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'r2',
    author_name: 'Rahul Verma',
    rating: 5,
    review_text: 'Celebrated my sister’s birthday here. Fairy light decoration near the river was magical.',
    date_str: '1 week ago',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];
