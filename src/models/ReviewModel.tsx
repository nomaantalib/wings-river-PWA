// Review Model Definition & Customer Testimonials
export interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string;
  date_str: string;
  avatar_url?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  created_at?: string;
}

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    author_name: 'Ananya Sharma',
    rating: 5,
    review_text: 'Amazing riverside view with great food! The paneer tikka and cold coffee were fantastic. Riding the speedboat before dinner was the highlight of our weekend!',
    date_str: '2 days ago',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'r2',
    author_name: 'Rahul Verma',
    rating: 5,
    review_text: 'Celebrated my sister’s 25th birthday here. The fairy light decoration near the river was magical. Staff were very courteous and the food was delicious!',
    date_str: '1 week ago',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];
