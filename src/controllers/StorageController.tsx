// StorageController — 100% Cloudflare D1 as the only storage.
// No localStorage. All reads fetch from D1 API. All writes POST/DELETE to D1 API.

import { Reservation }                             from '@/models/ReservationModel';
import { MenuItem, INITIAL_MENU_ITEMS, MenuPageDefinition, MENU_BOOKLET_PAGES } from '@/models/MenuModel';
import { BlogPost, INITIAL_BLOGS }                 from '@/models/BlogModel';
import { GalleryItem, INITIAL_GALLERY }            from '@/models/GalleryModel';
import { Review, ContactMessage, INITIAL_REVIEWS } from '@/models/ReviewModel';
import { RideTicket, WATER_SPORTS_RIDES }          from '@/models/WaterSportsModel';

// ── Core D1 API fetch helpers ──────────────────────────────────────────────────
async function apiFetch(url: string): Promise<any> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

async function apiPost(url: string, data: any): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`POST ${url} → ${res.status}: ${txt}`);
  }
  return res.json();
}

async function apiDelete(url: string): Promise<any> {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
  return res.json();
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
  try { await apiPost('/api/bookings', reservation); }
  catch (e) { console.error('[D1] saveReservation:', e); }
}

export async function updateReservationStatus(id: string, newStatus: string): Promise<Reservation[]> {
  try {
    // Fetch current record, patch status, re-POST
    const all = await getStoredReservations();
    const matched = all.find(r => r.id === id);
    if (matched) await apiPost('/api/bookings', { ...matched, status: newStatus });
    return await getStoredReservations();
  } catch (e) { console.error('[D1] updateReservationStatus:', e); return []; }
}

export async function deleteReservation(id: string): Promise<Reservation[]> {
  try { await apiDelete(`/api/bookings?id=${id}`); } catch (e) { console.error('[D1] deleteReservation:', e); }
  return getStoredReservations();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GALLERY
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredGalleryItems(): Promise<GalleryItem[]> {
  try {
    const res = await apiFetch('/api/gallery');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        // Seed defaults on first deploy
        await Promise.all(INITIAL_GALLERY.map(item => apiPost('/api/gallery', item).catch(() => {})));
        return INITIAL_GALLERY;
      }
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredGalleryItems:', e); }
  return INITIAL_GALLERY;
}

export async function saveGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  try { await apiPost('/api/gallery', item); } catch (e) { console.error('[D1] saveGalleryItem:', e); }
  return getStoredGalleryItems();
}

export async function updateGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  try { await apiPost('/api/gallery', item); } catch (e) { console.error('[D1] updateGalleryItem:', e); }
  return getStoredGalleryItems();
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem[]> {
  try { await apiDelete(`/api/gallery?id=${id}`); } catch (e) { console.error('[D1] deleteGalleryItem:', e); }
  return getStoredGalleryItems();
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
        return INITIAL_MENU_ITEMS;
      }
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredMenuItems:', e); }
  return INITIAL_MENU_ITEMS;
}

export async function saveMenuItem(item: MenuItem): Promise<MenuItem[]> {
  try { await apiPost('/api/menu', item); } catch (e) { console.error('[D1] saveMenuItem:', e); }
  return getStoredMenuItems();
}

export async function updateMenuItem(item: MenuItem): Promise<MenuItem[]> {
  try { await apiPost('/api/menu', item); } catch (e) { console.error('[D1] updateMenuItem:', e); }
  return getStoredMenuItems();
}

export async function deleteMenuItem(id: string): Promise<MenuItem[]> {
  try { await apiDelete(`/api/menu?id=${id}`); } catch (e) { console.error('[D1] deleteMenuItem:', e); }
  return getStoredMenuItems();
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
        return INITIAL_BLOGS;
      }
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredBlogs:', e); }
  return INITIAL_BLOGS;
}

export async function saveBlog(blog: BlogPost): Promise<BlogPost[]> {
  try { await apiPost('/api/blogs', blog); } catch (e) { console.error('[D1] saveBlog:', e); }
  return getStoredBlogs();
}

export async function updateBlog(blog: BlogPost): Promise<BlogPost[]> {
  try { await apiPost('/api/blogs', blog); } catch (e) { console.error('[D1] updateBlog:', e); }
  return getStoredBlogs();
}

export async function deleteBlog(id: string): Promise<BlogPost[]> {
  try { await apiDelete(`/api/blogs?id=${id}`); } catch (e) { console.error('[D1] deleteBlog:', e); }
  return getStoredBlogs();
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
  try { await apiPost('/api/reviews', rev); } catch (e) { console.error('[D1] saveReview:', e); }
}

export async function deleteReview(id: string): Promise<Review[]> {
  try { await apiDelete(`/api/reviews?id=${id}`); } catch (e) { console.error('[D1] deleteReview:', e); }
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
  try { await apiPost('/api/contact', msg); } catch (e) { console.error('[D1] saveContactMessage:', e); }
}

export async function deleteContactMessage(id: string): Promise<ContactMessage[]> {
  try { await apiDelete(`/api/contact?id=${id}`); } catch (e) { console.error('[D1] deleteContactMessage:', e); }
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
        return DEFAULT_BANNERS;
      }
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredEventBanners:', e); }
  return DEFAULT_BANNERS;
}

export async function saveEventBanner(banner: EventBanner): Promise<EventBanner[]> {
  try { await apiPost('/api/banners', banner); } catch (e) { console.error('[D1] saveEventBanner:', e); }
  return getStoredEventBanners();
}

export async function updateEventBanner(banner: EventBanner): Promise<EventBanner[]> {
  try { await apiPost('/api/banners', banner); } catch (e) { console.error('[D1] updateEventBanner:', e); }
  return getStoredEventBanners();
}

export async function deleteEventBanner(id: string): Promise<EventBanner[]> {
  try { await apiDelete(`/api/banners?id=${id}`); } catch (e) { console.error('[D1] deleteEventBanner:', e); }
  return getStoredEventBanners();
}

export async function toggleEventBanner(id: string): Promise<EventBanner[]> {
  try {
    const all = await getStoredEventBanners();
    const target = all.find(b => b.id === id);
    if (target) await apiPost('/api/banners', { ...target, is_active: !target.is_active });
  } catch (e) { console.error('[D1] toggleEventBanner:', e); }
  return getStoredEventBanners();
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
        return WATER_SPORTS_RIDES;
      }
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredWaterSports:', e); }
  return WATER_SPORTS_RIDES;
}

export async function saveWaterSports(ride: RideTicket): Promise<RideTicket[]> {
  try { await apiPost('/api/watersports', ride); } catch (e) { console.error('[D1] saveWaterSports:', e); }
  return getStoredWaterSports();
}

export async function updateWaterSports(ride: RideTicket): Promise<RideTicket[]> {
  try { await apiPost('/api/watersports', ride); } catch (e) { console.error('[D1] updateWaterSports:', e); }
  return getStoredWaterSports();
}

export async function deleteWaterSports(id: string): Promise<RideTicket[]> {
  try { await apiDelete(`/api/watersports?id=${id}`); } catch (e) { console.error('[D1] deleteWaterSports:', e); }
  return getStoredWaterSports();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU BOOKLET PAGES  — /api/menupages (dedicated D1 table)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredMenuPages(): Promise<MenuPageDefinition[]> {
  try {
    const res = await apiFetch('/api/menupages');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length === 0) {
        // Bulk seed all default pages in one POST
        await apiPost('/api/menupages', MENU_BOOKLET_PAGES).catch(() => {});
        return MENU_BOOKLET_PAGES;
      }
      return res.data;
    }
  } catch (e) { console.error('[D1] getStoredMenuPages:', e); }
  return MENU_BOOKLET_PAGES;
}

export async function saveMenuPage(page: MenuPageDefinition): Promise<MenuPageDefinition[]> {
  try { await apiPost('/api/menupages', page); } catch (e) { console.error('[D1] saveMenuPage:', e); }
  return getStoredMenuPages();
}

export async function updateMenuPage(page: MenuPageDefinition): Promise<MenuPageDefinition[]> {
  try { await apiPost('/api/menupages', page); } catch (e) { console.error('[D1] updateMenuPage:', e); }
  return getStoredMenuPages();
}

export async function deleteMenuPage(pageNumber: number): Promise<MenuPageDefinition[]> {
  try { await apiDelete(`/api/menupages?page_number=${pageNumber}`); } catch (e) { console.error('[D1] deleteMenuPage:', e); }
  return getStoredMenuPages();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HERO SECTION SETTINGS  — /api/settings (D1 key-value pair)
// ═══════════════════════════════════════════════════════════════════════════════
import { HeroSettings, DEFAULT_HERO_SETTINGS } from '@/models/HeroModel';

export async function getStoredHeroSettings(): Promise<HeroSettings> {
  try {
    const res = await apiFetch('/api/settings');
    if (res.success && res.data && res.data.wings_hero_settings) {
      const parsed = typeof res.data.wings_hero_settings === 'string'
        ? JSON.parse(res.data.wings_hero_settings)
        : res.data.wings_hero_settings;
      return parsed;
    }
  } catch (e) { console.error('[D1] getStoredHeroSettings:', e); }
  return DEFAULT_HERO_SETTINGS;
}

export async function saveHeroSettings(settings: HeroSettings): Promise<HeroSettings> {
  try {
    await apiPost('/api/settings', { key: 'wings_hero_settings', value: JSON.stringify(settings) });
  } catch (e) { console.error('[D1] saveHeroSettings:', e); }
  return settings;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SYNC  — warms all data on page load (no-op here, just fires all fetches)
// ═══════════════════════════════════════════════════════════════════════════════
export async function syncDatabase(): Promise<void> {
  // No localStorage to sync. All data is always live from D1.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wings_db_sync'));
  }
}
