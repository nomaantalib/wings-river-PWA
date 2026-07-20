// StorageController — 100% Cloudflare D1 as the only storage engine.
// No localStorage. All reads fetch directly from D1. All writes POST/DELETE directly to D1.

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
//  RESERVATIONS / BOOKINGS — /api/bookings (Cloudflare D1)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredReservations(): Promise<Reservation[]> {
  try {
    const res = await apiFetch('/api/bookings');
    if (res.success && Array.isArray(res.data)) return res.data;
  } catch (e) { console.error('[D1] getStoredReservations:', e); }
  return [];
}

export async function saveReservation(reservation: Reservation): Promise<void> {
  const res = await apiPost('/api/bookings', reservation);
  if (!res || res.success === false) {
    throw new Error(res?.error || 'Failed to save reservation');
  }
  notifySync();
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

// ═══════════════════════════════════════════════════════════════════════════════
//  GALLERY — /api/gallery (Cloudflare D1)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredGalleryItems(): Promise<GalleryItem[]> {
  try {
    const res = await apiFetch('/api/gallery');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length > 0) return res.data;
      await Promise.all(INITIAL_GALLERY.map(item => apiPost('/api/gallery', item)));
      const fresh = await apiFetch('/api/gallery');
      if (fresh.success && Array.isArray(fresh.data) && fresh.data.length > 0) return fresh.data;
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
  await apiDelete(`/api/gallery?id=${id}`);
  notifySync();
  return getStoredGalleryItems();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU ITEMS — /api/menu (Cloudflare D1)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredMenuItems(): Promise<MenuItem[]> {
  try {
    const res = await apiFetch('/api/menu');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length > 0) return res.data;
      await Promise.all(INITIAL_MENU_ITEMS.map(item => apiPost('/api/menu', item)));
      const fresh = await apiFetch('/api/menu');
      if (fresh.success && Array.isArray(fresh.data) && fresh.data.length > 0) return fresh.data;
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
  await apiDelete(`/api/menu?id=${id}`);
  notifySync();
  return getStoredMenuItems();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOGS — /api/blogs (Cloudflare D1)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredBlogs(): Promise<BlogPost[]> {
  try {
    const res = await apiFetch('/api/blogs');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length > 0) return res.data;
      await Promise.all(INITIAL_BLOGS.map(b => apiPost('/api/blogs', b)));
      const fresh = await apiFetch('/api/blogs');
      if (fresh.success && Array.isArray(fresh.data) && fresh.data.length > 0) return fresh.data;
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
  await apiDelete(`/api/blogs?id=${id}`);
  notifySync();
  return getStoredBlogs();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  REVIEWS — /api/reviews (Cloudflare D1)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredReviews(): Promise<Review[]> {
  try {
    const res = await apiFetch('/api/reviews');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length > 0) return res.data;
      await Promise.all(INITIAL_REVIEWS.map(r => apiPost('/api/reviews', r)));
      const fresh = await apiFetch('/api/reviews');
      if (fresh.success && Array.isArray(fresh.data) && fresh.data.length > 0) return fresh.data;
    }
  } catch (e) { console.error('[D1] getStoredReviews:', e); }
  return INITIAL_REVIEWS;
}

export async function saveReview(rev: Review): Promise<void> {
  await apiPost('/api/reviews', rev);
  notifySync();
}

export async function deleteReview(id: string): Promise<Review[]> {
  await apiDelete(`/api/reviews?id=${id}`);
  notifySync();
  return getStoredReviews();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTACT MESSAGES — /api/contact (Cloudflare D1)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredContactMessages(): Promise<ContactMessage[]> {
  try {
    const res = await apiFetch('/api/contact');
    if (res.success && Array.isArray(res.data)) return res.data;
  } catch (e) { console.error('[D1] getStoredContactMessages:', e); }
  return [];
}

export async function saveContactMessage(msg: ContactMessage): Promise<void> {
  const res = await apiPost('/api/contact', msg);
  if (!res || res.success === false) {
    throw new Error(res?.error || 'Failed to save contact message');
  }
  notifySync();
}

export async function deleteContactMessage(id: string): Promise<ContactMessage[]> {
  await apiDelete(`/api/contact?id=${id}`);
  notifySync();
  return getStoredContactMessages();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EVENT BANNERS — /api/banners (Cloudflare D1)
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
      if (res.data.length > 0) return res.data;
      await Promise.all(DEFAULT_BANNERS.map(b => apiPost('/api/banners', b)));
      const fresh = await apiFetch('/api/banners');
      if (fresh.success && Array.isArray(fresh.data) && fresh.data.length > 0) return fresh.data;
    }
  } catch (e) { console.error('[D1] getStoredEventBanners:', e); }
  return DEFAULT_BANNERS;
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
  await apiDelete(`/api/banners?id=${id}`);
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
//  WATER SPORTS RIDES — /api/watersports (Cloudflare D1)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredWaterSports(): Promise<RideTicket[]> {
  try {
    const res = await apiFetch('/api/watersports');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length > 0) return res.data;
      await Promise.all(WATER_SPORTS_RIDES.map(r => apiPost('/api/watersports', r)));
      const fresh = await apiFetch('/api/watersports');
      if (fresh.success && Array.isArray(fresh.data) && fresh.data.length > 0) return fresh.data;
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
  await apiDelete(`/api/watersports?id=${id}`);
  notifySync();
  return getStoredWaterSports();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU BOOKLET PAGES — /api/menupages (Cloudflare D1)
// ═══════════════════════════════════════════════════════════════════════════════
export async function getStoredMenuPages(): Promise<MenuPageDefinition[]> {
  try {
    const res = await apiFetch('/api/menupages');
    if (res.success && Array.isArray(res.data)) {
      if (res.data.length > 0) return res.data;
      await Promise.all(MENU_BOOKLET_PAGES.map(p => apiPost('/api/menupages', p)));
      const fresh = await apiFetch('/api/menupages');
      if (fresh.success && Array.isArray(fresh.data) && fresh.data.length > 0) return fresh.data;
    }
  } catch (e) { console.error('[D1] getStoredMenuPages:', e); }
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
  await apiDelete(`/api/menupages?page_number=${pageNumber}`);
  notifySync();
  return getStoredMenuPages();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  HERO SECTION SETTINGS — /api/hero (Cloudflare D1)
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
//  SYNC — trigger refresh across browser tabs/components
// ═══════════════════════════════════════════════════════════════════════════════
export async function syncDatabase(): Promise<void> {
  notifySync();
}
