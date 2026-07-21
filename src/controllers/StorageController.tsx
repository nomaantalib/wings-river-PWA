// StorageController — Cloudflare D1 persistent storage engine via Hono.
// No mock local storage. Full support for REST endpoints with JWT authorization.

import { Reservation }                             from '@/models/ReservationModel';
import { MenuItem, INITIAL_MENU_ITEMS, MenuPageDefinition, MENU_BOOKLET_PAGES } from '@/models/MenuModel';
import { BlogPost, INITIAL_BLOGS }                 from '@/models/BlogModel';
import { GalleryItem, INITIAL_GALLERY }            from '@/models/GalleryModel';
import { Review, ContactMessage, INITIAL_REVIEWS } from '@/models/ReviewModel';
import { RideTicket, WATER_SPORTS_RIDES }          from '@/models/WaterSportsModel';
import { HeroSettings, DEFAULT_HERO_SETTINGS }     from '@/models/HeroModel';

// ── Models & Types for Expanded Modules ──────────────────────────────────────
export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_deleted?: number;
}

export interface OfferDiscount {
  id: string;
  title: string;
  code: string;
  description: string;
  discount_value: number;
  discount_type: 'percentage' | 'flat';
  status: 'draft' | 'active' | 'expired';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  display_order: number;
}

export interface MediaItem {
  id: string;
  public_id?: string;
  secure_url: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  alt_text?: string;
  caption?: string;
  category?: string;
  folder?: string;
  tags?: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
}

export function getCloudinaryOptimizedUrl(url: string, width?: number, quality: string = 'auto'): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    const transform = width ? `f_auto,q_${quality},w_${width}` : `f_auto,q_${quality}`;
    return `${parts[0]}/upload/${transform}/${parts[1]}`;
  }
  return url;
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
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
}

export interface PromoPage {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  status: 'active' | 'inactive';
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
  created_at?: string;
}

// ── Event dispatch helper to notify all open UI components instantly ─────────
function notifySync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wings_db_sync'));
  }
}

// ── Core API Path Mapping ────────────────────────────────────────────────────
export function getApiUrl(url: string): string {
  return url;
}

// Fetch headers helper incorporating JWT tokens
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wings_admin_jwt');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

// ── Core D1 API fetch helpers ──────────────────────────────────────────────────
async function apiFetch(url: string): Promise<any> {
  try {
    const res = await fetch(getApiUrl(url), {
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) {
      return { success: false, data: [] };
    }
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

async function apiPost(url: string, data: any): Promise<any> {
  try {
    const res = await fetch(getApiUrl(url), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return { success: false };
    }
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}

async function apiDelete(url: string): Promise<any> {
  try {
    const res = await fetch(getApiUrl(url), {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      return { success: false };
    }
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  RESERVATIONS / BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredReservations(): Promise<Reservation[]> {
  try {
    const res = await apiFetch('/api/bookings');
    if (res.success && Array.isArray(res.data)) return res.data;
  } catch (e) {}
  return [];
}

export async function saveReservation(reservation: Reservation): Promise<void> {
  await apiPost('/api/bookings', reservation);
  notifySync();
}

export async function updateReservationStatus(id: string, newStatus: string): Promise<Reservation[]> {
  const all = await getStoredReservations();
  const matched = all.find(r => r.id === id);
  if (matched) {
    const updated = { ...matched, status: newStatus };
    await saveReservation(updated);
  }
  return getStoredReservations();
}

export async function deleteReservation(id: string): Promise<Reservation[]> {
  await apiDelete(`/api/bookings/${id}`);
  notifySync();
  return getStoredReservations();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GALLERY
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredGalleryItems(): Promise<GalleryItem[]> {
  try {
    const res = await apiFetch('/api/gallery');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredGalleryItems:', e); }
  return INITIAL_GALLERY;
}

export async function saveGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  await apiPost('/api/gallery', item);
  notifySync();
  return getStoredGalleryItems();
}

export async function updateGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  return saveGalleryItem(item);
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem[]> {
  await apiDelete(`/api/gallery/${id}`);
  notifySync();
  return getStoredGalleryItems();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredCategories(): Promise<MenuCategory[]> {
  const defaultCats = [
    { id: 'cat-beverages', name: 'Beverages', slug: 'beverages', description: 'Hot teas, fresh lime, and soft drinks', display_order: 1 },
    { id: 'cat-breakfast', name: 'Breakfast', slug: 'breakfast', description: 'Parathas, Jalebi, and Bun Makkhan', display_order: 2 },
    { id: 'cat-chaat', name: 'Chaat & Starters', slug: 'chaat-starters', description: 'Lucknowi basket chaat, Agra bhalla, and golgappe', display_order: 3 },
    { id: 'cat-drinks', name: 'Coolers & Mocktails', slug: 'coolers-mocktails', description: 'Mojitos, iced teas, and pina colada', display_order: 4 },
    { id: 'cat-coffee', name: 'Coffee & Shakes', slug: 'coffee-shakes', description: 'Cold brew, espresso, and chocolate cookie shakes', display_order: 5 },
    { id: 'cat-indian', name: 'Indian Main Course', slug: 'indian-main-course', description: 'Dal Makhani, Paneer Lababdar, and deluxe thalis', display_order: 6 },
    { id: 'cat-pizza', name: 'Pizza & Burgers', slug: 'pizza-burgers', description: 'Wood-fired pizzas and gourmet cottage cheese burgers', display_order: 7 },
    { id: 'cat-chinese', name: 'Chinese Wok & Waffles', slug: 'chinese-wok-waffles', description: 'Hakka noodles, chilli paneer, and continental sizzlers', display_order: 8 },
    { id: 'cat-desserts', name: 'Desserts', slug: 'desserts', description: 'Shahi Tukda, Gulab Jamun, and ice creams', display_order: 9 }
  ];
  try {
    const res = await apiFetch('/api/categories');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredCategories:', e); }
  return defaultCats;
}

export async function saveCategory(cat: MenuCategory): Promise<MenuCategory[]> {
  await apiPost('/api/categories', cat);
  notifySync();
  return getStoredCategories();
}

export async function deleteCategory(id: string): Promise<MenuCategory[]> {
  await apiDelete(`/api/categories/${id}`);
  notifySync();
  return getStoredCategories();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU ITEMS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredMenuItems(): Promise<MenuItem[]> {
  try {
    const res = await apiFetch('/api/menu');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredMenuItems:', e); }
  return INITIAL_MENU_ITEMS;
}

export async function saveMenuItem(item: MenuItem): Promise<MenuItem[]> {
  await apiPost('/api/menu', item);
  notifySync();
  return getStoredMenuItems();
}

export async function updateMenuItem(item: MenuItem): Promise<MenuItem[]> {
  return saveMenuItem(item);
}

export async function deleteMenuItem(id: string): Promise<MenuItem[]> {
  await apiDelete(`/api/menu/${id}`);
  notifySync();
  return getStoredMenuItems();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOGS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredBlogs(): Promise<BlogPost[]> {
  try {
    const res = await apiFetch('/api/blogs');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredBlogs:', e); }
  return INITIAL_BLOGS;
}

export async function saveBlog(blog: BlogPost): Promise<BlogPost[]> {
  await apiPost('/api/blogs', blog);
  notifySync();
  return getStoredBlogs();
}

export async function updateBlog(blog: BlogPost): Promise<BlogPost[]> {
  return saveBlog(blog);
}

export async function deleteBlog(id: string): Promise<BlogPost[]> {
  await apiDelete(`/api/blogs/${id}`);
  notifySync();
  return getStoredBlogs();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  REVIEWS / TESTIMONIALS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredReviews(): Promise<Review[]> {
  try {
    const res = await apiFetch('/api/reviews');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch (e) {}
  return INITIAL_REVIEWS;
}

export async function saveReview(review: Review): Promise<Review[]> {
  await apiPost('/api/reviews', review);
  notifySync();
  return getStoredReviews();
}

export async function deleteReview(id: string): Promise<Review[]> {
  await apiDelete(`/api/reviews/${id}`);
  notifySync();
  return getStoredReviews();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTACT MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredContactMessages(): Promise<ContactMessage[]> {
  try {
    const res = await apiFetch('/api/contact');
    if (res.success && Array.isArray(res.data)) return res.data;
  } catch (e) {}
  return [];
}

export async function saveContactMessage(msg: ContactMessage): Promise<void> {
  await apiPost('/api/contact', msg);
  notifySync();
}

export async function deleteContactMessage(id: string): Promise<ContactMessage[]> {
  await apiDelete(`/api/contact/${id}`);
  notifySync();
  return getStoredContactMessages();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENT BANNERS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredEventBanners(): Promise<EventBanner[]> {
  try {
    const res = await apiFetch('/api/banners');
    if (res.success && Array.isArray(res.data)) return res.data;
  } catch (e) {}
  return [];
}

export async function saveEventBanner(banner: EventBanner): Promise<EventBanner[]> {
  await apiPost('/api/banners', banner);
  notifySync();
  return getStoredEventBanners();
}

export async function updateEventBanner(banner: EventBanner): Promise<EventBanner[]> {
  return saveEventBanner(banner);
}

export async function deleteEventBanner(id: string): Promise<EventBanner[]> {
  await apiDelete(`/api/banners/${id}`);
  notifySync();
  return getStoredEventBanners();
}

export async function toggleEventBanner(id: string): Promise<EventBanner[]> {
  const current = await getStoredEventBanners();
  const target = current.find(b => b.id === id);
  if (target) {
    const updatedBanner = { ...target, is_active: !target.is_active };
    return saveEventBanner(updatedBanner);
  }
  return current;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  WATER SPORTS RIDES
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredWaterSports(): Promise<RideTicket[]> {
  try {
    const res = await apiFetch('/api/watersports');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredWaterSports:', e); }
  return WATER_SPORTS_RIDES;
}

export async function saveWaterSports(ride: RideTicket): Promise<RideTicket[]> {
  await apiPost('/api/watersports', ride);
  notifySync();
  return getStoredWaterSports();
}

export async function updateWaterSports(ride: RideTicket): Promise<RideTicket[]> {
  return saveWaterSports(ride);
}

export async function deleteWaterSports(id: string): Promise<RideTicket[]> {
  await apiDelete(`/api/watersports/${id}`);
  notifySync();
  return getStoredWaterSports();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU BOOKLET PAGES
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredMenuPages(): Promise<MenuPageDefinition[]> {
  try {
    const res = await apiFetch('/api/menupages');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((item: any) => {
        let cats = [];
        if (typeof item.categories === 'string') {
          try { cats = JSON.parse(item.categories); } catch (e) { cats = []; }
        } else if (Array.isArray(item.categories)) {
          cats = item.categories;
        }
        return {
          ...item,
          pageNumber: item.page_number ?? item.pageNumber,
          categories: cats
        };
      });
    }
  } catch (e) { console.error('[D1] getStoredMenuPages:', e); }
  return MENU_BOOKLET_PAGES;
}

export async function saveMenuPage(page: MenuPageDefinition): Promise<MenuPageDefinition[]> {
  // Normalize page_number from either snake_case or camelCase field
  const payload = {
    ...page,
    page_number: Number(page.page_number ?? page.pageNumber) || 1,
    display_order: Number(page.display_order ?? page.pageNumber ?? page.page_number) || 1,
  };
  const res = await apiPost('/api/menupages', payload);
  if (!res.success) {
    console.error('[D1] saveMenuPage failed:', res.error);
  }
  notifySync();
  return getStoredMenuPages();
}

export async function updateMenuPage(page: MenuPageDefinition): Promise<MenuPageDefinition[]> {
  return saveMenuPage(page);
}

export async function deleteMenuPage(pageNumber: number): Promise<MenuPageDefinition[]> {
  await apiDelete(`/api/menupages/${pageNumber}`);
  notifySync();
  return getStoredMenuPages();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SITE SETTINGS & HERO
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredHeroSettings(): Promise<HeroSettings> {
  try {
    const res = await apiFetch('/api/hero');
    if (res.success && res.data && Object.keys(res.data).length > 0) {
      return res.data as HeroSettings;
    }
  } catch (e) { console.error('[D1] getStoredHeroSettings:', e); }
  return DEFAULT_HERO_SETTINGS;
}

export async function saveHeroSettings(settings: HeroSettings): Promise<HeroSettings> {
  await apiPost('/api/hero', settings);
  notifySync();
  return getStoredHeroSettings();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FAQs
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredFaqs(): Promise<FaqItem[]> {
  const res = await apiFetch('/api/faqs');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function saveFaq(faq: FaqItem): Promise<FaqItem[]> {
  await apiPost('/api/faqs', faq);
  notifySync();
  return getStoredFaqs();
}

export async function deleteFaq(id: string): Promise<FaqItem[]> {
  await apiDelete(`/api/faqs/${id}`);
  notifySync();
  return getStoredFaqs();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TEAM MEMBERS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredTeamMembers(): Promise<TeamMember[]> {
  const res = await apiFetch('/api/team');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function saveTeamMember(tm: TeamMember): Promise<TeamMember[]> {
  await apiPost('/api/team', tm);
  notifySync();
  return getStoredTeamMembers();
}

export async function deleteTeamMember(id: string): Promise<TeamMember[]> {
  await apiDelete(`/api/team/${id}`);
  notifySync();
  return getStoredTeamMembers();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  OFFERS & DISCOUNTS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredOffers(): Promise<OfferDiscount[]> {
  const res = await apiFetch('/api/offers');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function saveOffer(off: OfferDiscount): Promise<OfferDiscount[]> {
  await apiPost('/api/offers', off);
  notifySync();
  return getStoredOffers();
}

export async function deleteOffer(id: string): Promise<OfferDiscount[]> {
  await apiDelete(`/api/offers/${id}`);
  notifySync();
  return getStoredOffers();
}

export async function getStoredMedia(): Promise<MediaItem[]> {
  const res = await apiFetch('/api/images');
  if (res.success && Array.isArray(res.data)) return res.data;
  const fallback = await apiFetch('/api/media');
  return fallback.success && Array.isArray(fallback.data) ? fallback.data : [];
}

export async function saveMediaItem(media: MediaItem): Promise<MediaItem[]> {
  await apiPost('/api/media', media);
  notifySync();
  return getStoredMedia();
}

export async function updateMediaItem(id: string, fileOrData: File | Partial<MediaItem>): Promise<MediaItem[]> {
  if (fileOrData instanceof File) {
    const formData = new FormData();
    formData.append('file', fileOrData);
    await apiPost(`/api/admin/images/${id}`, formData);
  } else {
    await apiPost(`/api/media/${id}`, fileOrData);
  }
  notifySync();
  return getStoredMedia();
}

export async function deleteMediaItem(id: string): Promise<MediaItem[]> {
  await apiDelete(`/api/admin/images/${id}`);
  notifySync();
  return getStoredMedia();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredAuditLogs(): Promise<AuditLog[]> {
  const res = await apiFetch('/api/logs');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DYNAMIC PAGES
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredPages(): Promise<SitePage[]> {
  const res = await apiFetch('/api/pages');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function savePage(page: SitePage): Promise<SitePage[]> {
  await apiPost('/api/pages', page);
  notifySync();
  return getStoredPages();
}

export async function deletePage(id: string, hard: boolean = false): Promise<SitePage[]> {
  await apiDelete(`/api/pages/${id}?hard=${hard ? '1' : '0'}`);
  notifySync();
  return getStoredPages();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  R2 MEDIA UPLOADER & SITE SETTINGS & STATS
// ═══════════════════════════════════════════════════════════════════════════════
export async function uploadMediaFile(file: File, category: string = 'general', altText: string = ''): Promise<{ success: boolean; url?: string; media_id?: string; error?: string }> {
  try {
    const fileName = (file.name && file.name.trim()) ? file.name : `upload_${Date.now()}.jpg`;
    const formData = new FormData();
    formData.append('file', file, fileName);
    formData.append('category', category);
    formData.append('alt_text', altText || fileName);

    const token = typeof window !== 'undefined' ? localStorage.getItem('wings_admin_jwt') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(getApiUrl('/api/admin/images/upload'), {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Upload failed' };
    }
    const data = await res.json();
    notifySync();
    return data;
  } catch (e: any) {
    return { success: false, error: e.message || 'Upload error' };
  }
}

export async function uploadCloudinaryFile(
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.secure_url) {
      return { success: true, url: data.secure_url };
    }
    return { success: false, error: data.error?.message || 'Cloudinary upload failed' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Upload connection error' };
  }
}

export interface SiteSettings {
  site_title?: string;
  slogan?: string;
  logo_url?: string;
  favicon_url?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  opening_hours?: string;
  instagram_url?: string;
  facebook_url?: string;
  google_maps_url?: string;
  hero_bg_image?: string;
  menu_booklet_cover?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
  [key: string]: any;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await apiFetch('/api/settings');
    if (res.success && res.data && res.data.site_settings) {
      return res.data.site_settings;
    }
  } catch (e) {}
  return {
    site_title: "Wings River Café",
    slogan: "Taste • Eat • Rides",
    logo_url: "/logo.png",
    favicon_url: "/favicon.ico",
    phone: "07310008020",
    whatsapp: "917310008020",
    email: "wingsrivercafe@gmail.com",
    address: "Lucknow Water Sports, Laxman Mela Ground, Gomti Riverfront, Lucknow",
    opening_hours: "11:00 AM – 11:59 PM (Open All 7 Days)",
    instagram_url: "https://www.instagram.com/wingsriver",
    facebook_url: "https://facebook.com",
    google_maps_url: "https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA",
    hero_bg_image: "/images/Screenshot_20260720-180621_Maps.png",
    menu_booklet_cover: "/images/food_menu_collage.jpg",
    seo_meta_title: "Wings River Café | Multicuisine Restaurant & Water Sports Lucknow",
    seo_meta_description: "Lucknow's premier riverside café offering gourmet food, live music, and thrilling Gomti riverfront water sports rides."
  };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  await apiPost('/api/settings', { key: 'site_settings', value: settings });
  notifySync();
  return getSiteSettings();
}

export async function getDashboardStats(): Promise<any> {
  try {
    const res = await apiFetch('/api/stats');
    if (res.success && res.data) return res.data;
  } catch (e) {}
  return {
    total_bookings: 0,
    today_bookings: 0,
    menu_items: 0,
    gallery_images: 0,
    feedback_count: 0,
    offers_count: 0,
    reviews_count: 0,
    blogs_count: 0
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROMO PAGES
// ══════════════════════════════════════════════════════════════════════════════
export async function getStoredPromoPages(): Promise<PromoPage[]> {
  try {
    const res = await apiFetch('/api/promopages');
    if (res.success && Array.isArray(res.data)) return res.data;
  } catch (e) { console.error('[D1] getStoredPromoPages:', e); }
  return [];
}

export async function savePromoPage(page: PromoPage): Promise<PromoPage[]> {
  const payload = { ...page, id: page.id || `promo-${Date.now()}` };
  const res = await apiPost('/api/promopages', payload);
  if (!res.success) console.error('[D1] savePromoPage failed:', res.error);
  notifySync();
  return getStoredPromoPages();
}

export async function deletePromoPage(id: string): Promise<PromoPage[]> {
  await apiDelete(`/api/promopages/${id}`);
  notifySync();
  return getStoredPromoPages();
}

// ══════════════════════════════════════════════════════════════════════════════
//  SYNC
// ══════════════════════════════════════════════════════════════════════════════
export async function syncDatabase(): Promise<void> {
  notifySync();
}
