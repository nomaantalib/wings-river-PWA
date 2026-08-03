export interface MenuItem {
  id: string;
  category_id?: string;
  category?: string;
  name: string;
  description: string;
  price: number;
  is_veg: boolean | number;
  image_url: string;
  is_available: boolean | number;
  is_bestseller?: boolean | number;
  badge?: string;
  display_order?: number;
  version?: number;
  is_deleted?: number;
  page_number?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuPageDefinition {
  pageNumber?: number;
  page_number?: number;
  title: string;
  subtitle?: string;
  image?: string;
  categories: string[] | string;
  display_order?: number;
  is_deleted?: number;
}
