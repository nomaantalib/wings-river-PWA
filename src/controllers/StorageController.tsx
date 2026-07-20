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
  url: string;
  alt_text: string;
  caption: string;
  category: string;
  file_size: number;
  dimensions: string;
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
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
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
function getApiUrl(url: string): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `https://wings-river-cafe-blog.pages.dev${url}`;
    }
  }
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
  const res = await apiFetch('/api/bookings');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function saveReservation(reservation: Reservation): Promise<void> {
  const res = await apiPost('/api/bookings', reservation);
  if (!res || res.success === false) {
    throw new Error(res?.error || 'Failed to save reservation');
  }
  notifySync();
}

export async function updateReservationStatus(id: string, newStatus: string): Promise<Reservation[]> {
  const all = await getStoredReservations();
  const matched = all.find(r => r.id === id);
  if (matched) await apiPost('/api/bookings', { ...matched, status: newStatus });
  notifySync();
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
  const res = await apiFetch('/api/gallery');
  return res.success && Array.isArray(res.data) ? res.data : INITIAL_GALLERY;
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
  const res = await apiFetch('/api/categories');
  return res.success && Array.isArray(res.data) ? res.data : [];
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
  const res = await apiFetch('/api/menu');
  return res.success && Array.isArray(res.data) ? res.data : INITIAL_MENU_ITEMS;
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
  const res = await apiFetch('/api/blogs');
  return res.success && Array.isArray(res.data) ? res.data : INITIAL_BLOGS;
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
  const res = await apiFetch('/api/reviews');
  return res.success && Array.isArray(res.data) ? res.data : INITIAL_REVIEWS;
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
  const res = await apiFetch('/api/contact');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function saveContactMessage(msg: ContactMessage): Promise<void> {
  const res = await apiPost('/api/contact', msg);
  if (!res || res.success === false) {
    throw new Error(res?.error || 'Failed to save contact message');
  }
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
  const res = await apiFetch('/api/banners');
  return res.success && Array.isArray(res.data) ? res.data : [];
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
  const res = await apiFetch('/api/watersports');
  return res.success && Array.isArray(res.data) ? res.data : WATER_SPORTS_RIDES;
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
  const res = await apiFetch('/api/menupages');
  if (res.success && Array.isArray(res.data)) {
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
  return MENU_BOOKLET_PAGES;
}

export async function saveMenuPage(page: MenuPageDefinition): Promise<MenuPageDefinition[]> {
  await apiPost('/api/menupages', page);
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
  const res = await apiFetch('/api/hero');
  return res.success && res.data ? (res.data as HeroSettings) : DEFAULT_HERO_SETTINGS;
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

// ═══════════════════════════════════════════════════════════════════════════════
//  MEDIA LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredMedia(): Promise<MediaItem[]> {
  const res = await apiFetch('/api/media');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function saveMediaItem(media: MediaItem): Promise<MediaItem[]> {
  await apiPost('/api/media', media);
  notifySync();
  return getStoredMedia();
}

export async function deleteMediaItem(id: string): Promise<MediaItem[]> {
  await apiDelete(`/api/media/${id}`);
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
//  SYNC
// ═══════════════════════════════════════════════════════════════════════════════
export async function syncDatabase(): Promise<void> {
  notifySync();
}
