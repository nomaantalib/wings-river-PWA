// StorageController — synced with Cloudflare D1 Database REST APIs
import { Reservation } from '@/models/ReservationModel';
import { MenuItem, INITIAL_MENU_ITEMS, MenuPageDefinition, MENU_BOOKLET_PAGES } from '@/models/MenuModel';
import { BlogPost, INITIAL_BLOGS } from '@/models/BlogModel';
import { GalleryItem, INITIAL_GALLERY } from '@/models/GalleryModel';
import { Review, ContactMessage, INITIAL_REVIEWS } from '@/models/ReviewModel';
import { RideTicket, WATER_SPORTS_RIDES } from '@/models/WaterSportsModel';

// ── Generic localStorage helpers ─────────────────────────────────────────────
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch { return fallback; }
}
function setLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { }
}

// ── API background sync helpers ──────────────────────────────────────────────
async function postApi(url: string, data: any) {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) { console.error('API POST failed:', url, e); }
}

async function deleteApi(url: string, id: string | number) {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  try {
    await fetch(`${url}?id=${id}`, {
      method: 'DELETE'
    });
  } catch (e) { console.error('API DELETE failed:', url, e); }
}

async function postSetting(key: string, value: any) {
  await postApi('/api/settings', { key, value });
}

// Background sync helper
export async function syncDatabase() {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  try {
    // 1. Sync Bookings
    const resBookings = await fetch('/api/bookings').then(r => r.json());
    if (resBookings.success && resBookings.data) {
      if (resBookings.data.length > 0) {
        setLocal('wings_reservations', resBookings.data);
      } else {
        const defaults = getStoredReservations();
        for (const item of defaults) {
          await postApi('/api/bookings', item);
        }
      }
    }
    // 2. Sync Blogs
    const resBlogs = await fetch('/api/blogs').then(r => r.json());
    if (resBlogs.success && resBlogs.data) {
      if (resBlogs.data.length > 0) {
        setLocal('wings_blogs', resBlogs.data);
      } else {
        for (const item of INITIAL_BLOGS) {
          await postApi('/api/blogs', item);
        }
        setLocal('wings_blogs', INITIAL_BLOGS);
      }
    }
    // 3. Sync Menu Items
    const resMenu = await fetch('/api/menu').then(r => r.json());
    if (resMenu.success && resMenu.data) {
      if (resMenu.data.length > 0) {
        setLocal('wings_menu', resMenu.data);
      } else {
        for (const item of INITIAL_MENU_ITEMS) {
          await postApi('/api/menu', item);
        }
        setLocal('wings_menu', INITIAL_MENU_ITEMS);
      }
    }
    // 4. Sync Reviews
    const resReviews = await fetch('/api/reviews').then(r => r.json());
    if (resReviews.success && resReviews.data) {
      if (resReviews.data.length > 0) {
        setLocal('wings_reviews', resReviews.data);
      } else {
        for (const item of INITIAL_REVIEWS) {
          await postApi('/api/reviews', item);
        }
        setLocal('wings_reviews', INITIAL_REVIEWS);
      }
    }
    // 5. Sync Contact Messages
    const resContact = await fetch('/api/contact').then(r => r.json());
    if (resContact.success && resContact.data && resContact.data.length > 0) {
      setLocal('wings_contact', resContact.data);
    }
    // 6. Sync Gallery
    const resGallery = await fetch('/api/gallery').then(r => r.json());
    if (resGallery.success && resGallery.data) {
      if (resGallery.data.length > 0) {
        setLocal('wings_gallery', resGallery.data);
      } else {
        for (const item of INITIAL_GALLERY) {
          await postApi('/api/gallery', item);
        }
        setLocal('wings_gallery', INITIAL_GALLERY);
      }
    }
    // 7. Sync Settings (JSON keys for custom lists)
    const resSettings = await fetch('/api/settings').then(r => r.json());
    if (resSettings.success && resSettings.data) {
      if (!resSettings.data.wings_event_banners) {
        const defaults = getStoredEventBanners();
        await postSetting('wings_event_banners', defaults);
      }
      if (!resSettings.data.wings_water_sports) {
        await postSetting('wings_water_sports', WATER_SPORTS_RIDES);
      }
      if (!resSettings.data.wings_menu_pages) {
        await postSetting('wings_menu_pages', MENU_BOOKLET_PAGES);
      }

      const reSettings = await fetch('/api/settings').then(r => r.json());
      if (reSettings.success && reSettings.data) {
        const keys = Object.keys(reSettings.data);
        keys.forEach(k => {
          setLocal(k, reSettings.data[k]);
        });
      }
    }

    // Trigger custom event to tell React views to refresh if they want to
    window.dispatchEvent(new Event('wings_db_sync'));
  } catch (e) {
    console.error('Database synchronization failed:', e);
  }
}

// ── RESERVATIONS ─────────────────────────────────────────────────────────────
export function getStoredReservations(): Reservation[] {
  return getLocal<Reservation[]>('wings_reservations', [
    {
      id: 'res-101',
      name: 'Aarav Gupta',
      phone: '09876543210',
      email: 'aarav@example.com',
      booking_type: 'birthday_party',
      date: '2026-07-25',
      time: '19:30',
      guests: 8,
      special_requests: 'Fairy light table setup near river deck',
      status: 'confirmed',
      created_at: new Date().toISOString()
    }
  ]);
}
export function saveReservation(res: Reservation): void {
  const current = getStoredReservations();
  current.unshift(res);
  setLocal('wings_reservations', current);
  postApi('/api/bookings', res);
}
export function updateReservationStatus(id: string, newStatus: string): Reservation[] {
  const current = getStoredReservations();
  const updated = current.map(r => r.id === id ? { ...r, status: newStatus } : r);
  setLocal('wings_reservations', updated);
  const matched = updated.find(r => r.id === id);
  if (matched) postApi('/api/bookings', matched);
  return updated;
}
export function deleteReservation(id: string): Reservation[] {
  const updated = getStoredReservations().filter(r => r.id !== id);
  setLocal('wings_reservations', updated);
  deleteApi('/api/bookings', id);
  return updated;
}

// ── GALLERY ───────────────────────────────────────────────────────────────────
export function getStoredGalleryItems(): GalleryItem[] {
  return getLocal<GalleryItem[]>('wings_gallery', INITIAL_GALLERY);
}
export function saveGalleryItem(item: GalleryItem): GalleryItem[] {
  const current = getStoredGalleryItems();
  current.unshift(item);
  setLocal('wings_gallery', current);
  postApi('/api/gallery', item);
  return current;
}
export function updateGalleryItem(item: GalleryItem): GalleryItem[] {
  const updated = getStoredGalleryItems().map(g => g.id === item.id ? item : g);
  setLocal('wings_gallery', updated);
  postApi('/api/gallery', item);
  return updated;
}
export function deleteGalleryItem(id: string): GalleryItem[] {
  const updated = getStoredGalleryItems().filter(g => g.id !== id);
  setLocal('wings_gallery', updated);
  deleteApi('/api/gallery', id);
  return updated;
}

// ── MENU ITEMS ────────────────────────────────────────────────────────────────
export function getStoredMenuItems(): MenuItem[] {
  return getLocal<MenuItem[]>('wings_menu', INITIAL_MENU_ITEMS);
}
export function saveMenuItem(item: MenuItem): void {
  const current = getStoredMenuItems();
  current.unshift(item);
  setLocal('wings_menu', current);
  postApi('/api/menu', item);
}
export function updateMenuItem(item: MenuItem): void {
  const updated = getStoredMenuItems().map(m => m.id === item.id ? item : m);
  setLocal('wings_menu', updated);
  postApi('/api/menu', item);
}
export function deleteMenuItem(id: string): MenuItem[] {
  const updated = getStoredMenuItems().filter(m => m.id !== id);
  setLocal('wings_menu', updated);
  deleteApi('/api/menu', id);
  return updated;
}

// ── BLOGS ─────────────────────────────────────────────────────────────────────
export function getStoredBlogs(): BlogPost[] {
  return getLocal<BlogPost[]>('wings_blogs', INITIAL_BLOGS);
}
export function saveBlog(blog: BlogPost): void {
  const current = getStoredBlogs();
  current.unshift(blog);
  setLocal('wings_blogs', current);
  postApi('/api/blogs', blog);
}
export function updateBlog(blog: BlogPost): void {
  const updated = getStoredBlogs().map(b => b.id === blog.id ? blog : b);
  setLocal('wings_blogs', updated);
  postApi('/api/blogs', blog);
}
export function deleteBlog(id: string): BlogPost[] {
  const updated = getStoredBlogs().filter(b => b.id !== id);
  setLocal('wings_blogs', updated);
  deleteApi('/api/blogs', id);
  return updated;
}

// ── REVIEWS ───────────────────────────────────────────────────────────────────
export function getStoredReviews(): Review[] {
  return getLocal<Review[]>('wings_reviews', INITIAL_REVIEWS);
}
export function saveReview(rev: Review): void {
  const current = getStoredReviews();
  current.unshift(rev);
  setLocal('wings_reviews', current);
  postApi('/api/reviews', rev);
}
export function deleteReview(id: string): Review[] {
  const updated = getStoredReviews().filter(r => r.id !== id);
  setLocal('wings_reviews', updated);
  deleteApi('/api/reviews', id);
  return updated;
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
export function getStoredContactMessages(): ContactMessage[] {
  return getLocal<ContactMessage[]>('wings_contact', []);
}
export function saveContactMessage(msg: ContactMessage): void {
  const current = getStoredContactMessages();
  current.unshift(msg);
  setLocal('wings_contact', current);
  postApi('/api/contact', msg);
}
export function deleteContactMessage(id: string): ContactMessage[] {
  const updated = getStoredContactMessages().filter(m => m.id !== id);
  setLocal('wings_contact', updated);
  deleteApi('/api/contact', id);
  return updated;
}

// ── EVENT BANNERS ─────────────────────────────────────────────────────────────
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
export function getStoredEventBanners(): EventBanner[] {
  return getLocal<EventBanner[]>('wings_event_banners', [
    {
      id: 'eb-1',
      title: '🎉 Weekend Riverside Fiesta!',
      subtitle: 'Live music, gourmet BBQ & unlimited mocktails every Saturday & Sunday evening.',
      image_url: '/images/Screenshot_20260720-180609_Maps.png',
      cta_text: 'Reserve Your Spot',
      cta_link: '#booking',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]);
}
export function saveEventBanner(banner: EventBanner): EventBanner[] {
  const current = getStoredEventBanners();
  current.unshift(banner);
  setLocal('wings_event_banners', current);
  postSetting('wings_event_banners', current);
  return current;
}
export function updateEventBanner(banner: EventBanner): EventBanner[] {
  const updated = getStoredEventBanners().map(b => b.id === banner.id ? banner : b);
  setLocal('wings_event_banners', updated);
  postSetting('wings_event_banners', updated);
  return updated;
}
export function deleteEventBanner(id: string): EventBanner[] {
  const updated = getStoredEventBanners().filter(b => b.id !== id);
  setLocal('wings_event_banners', updated);
  postSetting('wings_event_banners', updated);
  return updated;
}
export function toggleEventBanner(id: string): EventBanner[] {
  const updated = getStoredEventBanners().map(b => b.id === id ? { ...b, is_active: !b.is_active } : b);
  setLocal('wings_event_banners', updated);
  postSetting('wings_event_banners', updated);
  return updated;
}

// ── WATER SPORTS RIDES ────────────────────────────────────────────────────────
export function getStoredWaterSports(): RideTicket[] {
  return getLocal<RideTicket[]>('wings_water_sports', WATER_SPORTS_RIDES);
}
export function saveWaterSports(ride: RideTicket): RideTicket[] {
  const current = getStoredWaterSports();
  current.push(ride);
  setLocal('wings_water_sports', current);
  postSetting('wings_water_sports', current);
  return current;
}
export function updateWaterSports(ride: RideTicket): RideTicket[] {
  const updated = getStoredWaterSports().map(r => r.id === ride.id ? ride : r);
  setLocal('wings_water_sports', updated);
  postSetting('wings_water_sports', updated);
  return updated;
}
export function deleteWaterSports(id: string): RideTicket[] {
  const updated = getStoredWaterSports().filter(r => r.id !== id);
  setLocal('wings_water_sports', updated);
  postSetting('wings_water_sports', updated);
  return updated;
}

// ── MENU BOOKLET PAGES ────────────────────────────────────────────────────────
export function getStoredMenuPages(): MenuPageDefinition[] {
  const list = getLocal<MenuPageDefinition[]>('wings_menu_pages', MENU_BOOKLET_PAGES);
  // Auto-migrate old /images/ menu page paths to high-res /menu card food/ paths
  let changed = false;
  const migrated = list.map(item => {
    if (item.image.includes('/images/menu_page_')) {
      changed = true;
      const def = MENU_BOOKLET_PAGES.find(p => p.pageNumber === item.pageNumber);
      if (def) return { ...item, image: def.image };
    }
    return item;
  });
  if (changed) {
    setLocal('wings_menu_pages', migrated);
    postSetting('wings_menu_pages', migrated);
    return migrated;
  }
  return list;
}
export function saveMenuPage(page: MenuPageDefinition): MenuPageDefinition[] {
  const current = getStoredMenuPages();
  current.push(page);
  setLocal('wings_menu_pages', current);
  postSetting('wings_menu_pages', current);
  return current;
}
export function updateMenuPage(page: MenuPageDefinition): MenuPageDefinition[] {
  const updated = getStoredMenuPages().map(p => p.pageNumber === page.pageNumber ? page : p);
  setLocal('wings_menu_pages', updated);
  postSetting('wings_menu_pages', updated);
  return updated;
}
export function deleteMenuPage(pageNumber: number): MenuPageDefinition[] {
  const updated = getStoredMenuPages().filter(p => p.pageNumber !== pageNumber);
  setLocal('wings_menu_pages', updated);
  postSetting('wings_menu_pages', updated);
  return updated;
}

// ── INITIAL WAKE-UP SYNC ON RUNTIME LOAD ────────────────────────────────────
if (typeof window !== 'undefined') {
  setTimeout(syncDatabase, 1500); // 1.5s delay to avoid blocking initial critical page render
  window.addEventListener('online', syncDatabase);
}
