export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string;
  images?: string[];
  video_url?: string;
  tags?: string[];
  author: string;
  read_time: string;
  status?: string;
  is_published?: boolean;
  version?: number;
  is_deleted?: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string;
  date_str?: string;
  avatar_url?: string;
  status?: 'pending' | 'approved' | 'spam';
  is_deleted?: number;
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status?: 'unread' | 'read' | 'archived' | 'pending' | string;
  is_deleted?: number;
  created_at?: string;
}

export interface RideTicket {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  badge?: string;
  image?: string;
  emoji?: string;
  display_order?: number;
  is_deleted?: number;
  created_at?: string;
}

export interface OfferDiscount {
  id: string;
  title: string;
  code: string;
  description: string;
  discount_value: number;
  discount_type: 'percentage' | 'flat';
  status: 'draft' | 'active' | 'expired';
  is_deleted?: number;
  created_at?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_deleted?: number;
  created_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  display_order: number;
  is_deleted?: number;
  created_at?: string;
}

export interface EventBanner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  is_active?: boolean;
  status?: string;
  display_order?: number;
  is_deleted?: number;
  created_at?: string;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled';
  display_order: number;
  version: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}
