// StorageController — 100% Cloudflare D1 as the only storage.
// No localStorage. All reads fetch from D1 API. All writes POST/DELETE to D1 API.

import { Reservation }                             from '@/models/ReservationModel';
import { MenuItem, INITIAL_MENU_ITEMS, MenuPageDefinition, MENU_BOOKLET_PAGES } from '@/models/MenuModel';
import { BlogPost, INITIAL_BLOGS }                 from '@/models/BlogModel';
import { GalleryItem, INITIAL_GALLERY }            from '@/models/GalleryModel';
import { Review, ContactMessage, INITIAL_REVIEWS } from '@/models/ReviewModel';
import { RideTicket, WATER_SPORTS_RIDES }          from '@/models/WaterSportsModel';
import { HeroSettings, DEFAULT_HERO_SETTINGS }     from '@/models/HeroModel';

// ── Event dispatch helper to notify all open UI components instantly ─────────
function notifySync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wings_db_sync'));
  }
}

// ── Core D1 API fetch helpers ──────────────────────────────────────────────────
async function apiFetch(url: string): Promise<any> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
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
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(url, { method: 'DELETE' });
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
  } catch (e) { console.error('[D1] getStoredReservations:', e); }
  return [];
}

export async function saveReservation(reservation: Reservation): Promise<void> {
  try {
    await apiPost('/api/bookings', reservation);
    notifySync();
  } catch (e) { console.error('[D1] saveReservation:', e); }
}

export async function updateReservationStatus(id: string, newStatus: string): Promise<Reservation[]> {
  try {
    const all = await getStoredReservations();
    const matched = all.find(r => r.id === id);
    if (matched) await apiPost('/api/bookings', { ...matched, status: newStatus });
    notifySync();
    return await getStoredReservations();
  } catch (e) { console.error('[D1] updateReservationStatus:', e); return []; }
}

export async function deleteReservation(id: string): Promise<Reservation[]> {
  try {
    await apiDelete(`/api/bookings?id=${id}`);
    notifySync();
  } catch (e) { console.error('[D1] deleteReservation:', e); }
  return getStoredReservations();
}

// In-memory optimistic caches
let galleryCache: GalleryItem[] | null = null;
let menuCache: MenuItem[] | null = null;
let blogCache: BlogPost[] | null = null;
let waterSportsCache: RideTicket[] | null = null;
let bannersCache: EventBanner[] | null = null;
let menuPagesCache: MenuPageDefinition[] | null = null;
let heroCache: HeroSettings | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
//  GALLERY
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredGalleryItems(): Promise<GalleryItem[]> {
  try {
    const res = await apiFetch('/api/gallery');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        await Promise.all(INITIAL_GALLERY.map(item => apiPost('/api/gallery', item).catch(() => {})));
        galleryCache = INITIAL_GALLERY;
        return INITIAL_GALLERY;
      }
      galleryCache = res.data;
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredGalleryItems:', e); }
  return galleryCache || INITIAL_GALLERY;
}

export async function saveGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  const current = galleryCache || INITIAL_GALLERY;
  const exists = current.some(g => g.id === item.id);
  const updated = exists ? current.map(g => g.id === item.id ? item : g) : [item, ...current];
  galleryCache = updated;
  notifySync();
  apiPost('/api/gallery', item).catch(() => {});
  return updated;
}

export async function updateGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  return saveGalleryItem(item);
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem[]> {
  const current = galleryCache || INITIAL_GALLERY;
  const updated = current.filter(g => g.id !== id);
  galleryCache = updated;
  notifySync();
  apiDelete(`/api/gallery?id=${id}`).catch(() => {});
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU ITEMS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredMenuItems(): Promise<MenuItem[]> {
  try {
    const res = await apiFetch('/api/menu');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        await Promise.all(INITIAL_MENU_ITEMS.map(item => apiPost('/api/menu', item).catch(() => {})));
        menuCache = INITIAL_MENU_ITEMS;
        return INITIAL_MENU_ITEMS;
      }
      menuCache = res.data;
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredMenuItems:', e); }
  return menuCache || INITIAL_MENU_ITEMS;
}

export async function saveMenuItem(item: MenuItem): Promise<MenuItem[]> {
  const current = menuCache || INITIAL_MENU_ITEMS;
  const exists = current.some(m => m.id === item.id);
  const updated = exists ? current.map(m => m.id === item.id ? item : m) : [item, ...current];
  menuCache = updated;
  notifySync();
  apiPost('/api/menu', item).catch(() => {});
  return updated;
}

export async function updateMenuItem(item: MenuItem): Promise<MenuItem[]> {
  return saveMenuItem(item);
}

export async function deleteMenuItem(id: string): Promise<MenuItem[]> {
  const current = menuCache || INITIAL_MENU_ITEMS;
  const updated = current.filter(m => m.id !== id);
  menuCache = updated;
  notifySync();
  apiDelete(`/api/menu?id=${id}`).catch(() => {});
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOGS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredBlogs(): Promise<BlogPost[]> {
  try {
    const res = await apiFetch('/api/blogs');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        await Promise.all(INITIAL_BLOGS.map(b => apiPost('/api/blogs', b).catch(() => {})));
        blogCache = INITIAL_BLOGS;
        return INITIAL_BLOGS;
      }
      blogCache = res.data;
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredBlogs:', e); }
  return blogCache || INITIAL_BLOGS;
}

export async function saveBlog(blog: BlogPost): Promise<BlogPost[]> {
  const current = blogCache || INITIAL_BLOGS;
  const exists = current.some(b => b.id === blog.id);
  const updated = exists ? current.map(b => b.id === blog.id ? blog : b) : [blog, ...current];
  blogCache = updated;
  notifySync();
  apiPost('/api/blogs', blog).catch(() => {});
  return updated;
}

export async function updateBlog(blog: BlogPost): Promise<BlogPost[]> {
  return saveBlog(blog);
}

export async function deleteBlog(id: string): Promise<BlogPost[]> {
  const current = blogCache || INITIAL_BLOGS;
  const updated = current.filter(b => b.id !== id);
  blogCache = updated;
  notifySync();
  apiDelete(`/api/blogs?id=${id}`).catch(() => {});
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredReviews(): Promise<Review[]> {
  try {
    const res = await apiFetch('/api/reviews');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        await Promise.all(INITIAL_REVIEWS.map(r => apiPost('/api/reviews', r).catch(() => {})));
        return INITIAL_REVIEWS;
      }
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredReviews:', e); }
  return INITIAL_REVIEWS;
}

export async function saveReview(rev: Review): Promise<void> {
  try {
    await apiPost('/api/reviews', rev);
    notifySync();
  } catch (e) { console.error('[D1] saveReview:', e); }
}

export async function deleteReview(id: string): Promise<Review[]> {
  try {
    await apiDelete(`/api/reviews?id=${id}`);
    notifySync();
  } catch (e) { console.error('[D1] deleteReview:', e); }
  return getStoredReviews();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTACT MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredContactMessages(): Promise<ContactMessage[]> {
  try {
    const res = await apiFetch('/api/contact');
    if (res.success && Array.isArray(res.data)) return res.data;
  } catch (e) { console.error('[D1] getStoredContactMessages:', e); }
  return [];
}

export async function saveContactMessage(msg: ContactMessage): Promise<void> {
  try {
    await apiPost('/api/contact', msg);
    notifySync();
  } catch (e) { console.error('[D1] saveContactMessage:', e); }
}

export async function deleteContactMessage(id: string): Promise<ContactMessage[]> {
  try {
    await apiDelete(`/api/contact?id=${id}`);
    notifySync();
  } catch (e) { console.error('[D1] deleteContactMessage:', e); }
  return getStoredContactMessages();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENT BANNERS  — /api/banners (dedicated D1 table)
// ═══════════════════════════════════════════════════════════════════════════════
export interface EventBanner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  created_at: string;
}

const DEFAULT_BANNERS: EventBanner[] = [
  {
    id: 'eb-1',
    title: '🎉 Weekend Riverside Fiesta!',
    subtitle: 'Live music, gourmet BBQ & unlimited mocktails every Saturday & Sunday evening.',
    image_url: '/images/Screenshot_20260720-180609_Maps.png',
    cta_text: 'Reserve Your Spot',
    cta_link: '#booking',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function getStoredEventBanners(): Promise<EventBanner[]> {
  try {
    const res = await apiFetch('/api/banners');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        await Promise.all(DEFAULT_BANNERS.map(b => apiPost('/api/banners', b).catch(() => {})));
        bannersCache = DEFAULT_BANNERS;
        return DEFAULT_BANNERS;
      }
      bannersCache = res.data;
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredEventBanners:', e); }
  return bannersCache || DEFAULT_BANNERS;
}

export async function saveEventBanner(banner: EventBanner): Promise<EventBanner[]> {
  const current = bannersCache || DEFAULT_BANNERS;
  const exists = current.some(b => b.id === banner.id);
  const updated = exists ? current.map(b => b.id === banner.id ? banner : b) : [banner, ...current];
  bannersCache = updated;
  notifySync();
  apiPost('/api/banners', banner).catch(() => {});
  return updated;
}

export async function updateEventBanner(banner: EventBanner): Promise<EventBanner[]> {
  return saveEventBanner(banner);
}

export async function deleteEventBanner(id: string): Promise<EventBanner[]> {
  const current = bannersCache || DEFAULT_BANNERS;
  const updated = current.filter(b => b.id !== id);
  bannersCache = updated;
  notifySync();
  apiDelete(`/api/banners?id=${id}`).catch(() => {});
  return updated;
}

export async function toggleEventBanner(id: string): Promise<EventBanner[]> {
  const current = bannersCache || DEFAULT_BANNERS;
  const target = current.find(b => b.id === id);
  if (target) {
    const updatedBanner = { ...target, is_active: !target.is_active };
    return saveEventBanner(updatedBanner);
  }
  return current;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  WATER SPORTS RIDES  — /api/watersports (dedicated D1 table)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredWaterSports(): Promise<RideTicket[]> {
  try {
    const res = await apiFetch('/api/watersports');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        await Promise.all(WATER_SPORTS_RIDES.map(r => apiPost('/api/watersports', r).catch(() => {})));
        waterSportsCache = WATER_SPORTS_RIDES;
        return WATER_SPORTS_RIDES;
      }
      waterSportsCache = res.data;
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredWaterSports:', e); }
  return waterSportsCache || WATER_SPORTS_RIDES;
}

export async function saveWaterSports(ride: RideTicket): Promise<RideTicket[]> {
  const current = waterSportsCache || WATER_SPORTS_RIDES;
  const exists = current.some(r => r.id === ride.id);
  const updated = exists ? current.map(r => r.id === ride.id ? ride : r) : [ride, ...current];
  waterSportsCache = updated;
  notifySync();
  apiPost('/api/watersports', ride).catch(() => {});
  return updated;
}

export async function updateWaterSports(ride: RideTicket): Promise<RideTicket[]> {
  return saveWaterSports(ride);
}

export async function deleteWaterSports(id: string): Promise<RideTicket[]> {
  const current = waterSportsCache || WATER_SPORTS_RIDES;
  const updated = current.filter(r => r.id !== id);
  waterSportsCache = updated;
  notifySync();
  apiDelete(`/api/watersports?id=${id}`).catch(() => {});
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU BOOKLET PAGES  — /api/menupages (dedicated D1 table)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredMenuPages(): Promise<MenuPageDefinition[]> {
  try {
    const res = await apiFetch('/api/menupages');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        await apiPost('/api/menupages', MENU_BOOKLET_PAGES).catch(() => {});
        menuPagesCache = MENU_BOOKLET_PAGES;
        return MENU_BOOKLET_PAGES;
      }
      menuPagesCache = res.data;
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredMenuPages:', e); }
  return menuPagesCache || MENU_BOOKLET_PAGES;
}

export async function saveMenuPage(page: MenuPageDefinition): Promise<MenuPageDefinition[]> {
  const current = menuPagesCache || MENU_BOOKLET_PAGES;
  const exists = current.some(p => p.pageNumber === page.pageNumber);
  const updated = exists ? current.map(p => p.pageNumber === page.pageNumber ? page : p) : [...current, page];
  menuPagesCache = updated;
  notifySync();
  apiPost('/api/menupages', page).catch(() => {});
  return updated;
}

export async function updateMenuPage(page: MenuPageDefinition): Promise<MenuPageDefinition[]> {
  return saveMenuPage(page);
}

export async function deleteMenuPage(pageNumber: number): Promise<MenuPageDefinition[]> {
  const current = menuPagesCache || MENU_BOOKLET_PAGES;
  const updated = current.filter(p => p.pageNumber !== pageNumber);
  menuPagesCache = updated;
  notifySync();
  apiDelete(`/api/menupages?page_number=${pageNumber}`).catch(() => {});
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HERO SECTION SETTINGS  — /api/hero (dedicated D1 endpoint)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredHeroSettings(): Promise<HeroSettings> {
  try {
    const res = await apiFetch('/api/hero');
    if (res.success && res.data) {
      heroCache = res.data as HeroSettings;
      return res.data as HeroSettings;
    }
  } catch (e) { console.error('[D1] getStoredHeroSettings:', e); }
  return heroCache || DEFAULT_HERO_SETTINGS;
}

export async function saveHeroSettings(settings: HeroSettings): Promise<HeroSettings> {
  heroCache = settings;
  notifySync();
  apiPost('/api/hero', settings).catch(() => {});
  return settings;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SYNC  — trigger refresh across browser tabs/components
// ═══════════════════════════════════════════════════════════════════════════════
export async function syncDatabase(): Promise<void> {
  notifySync();
}
