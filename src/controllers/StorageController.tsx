// StorageController — extended with update + delete operations for all entities
import { Reservation } from '@/models/ReservationModel';
import { MenuItem, INITIAL_MENU_ITEMS } from '@/models/MenuModel';
import { BlogPost, INITIAL_BLOGS } from '@/models/BlogModel';
import { GalleryItem, INITIAL_GALLERY } from '@/models/GalleryModel';
import { Review, ContactMessage, INITIAL_REVIEWS } from '@/models/ReviewModel';

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
  if (typeof window !== 'undefined' && navigator.onLine) {
    fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(res) }).catch(() => {});
  }
}
export function updateReservationStatus(id: string, newStatus: string): Reservation[] {
  const current = getStoredReservations();
  const updated = current.map(r => r.id === id ? { ...r, status: newStatus } : r);
  setLocal('wings_reservations', updated);
  return updated;
}
export function deleteReservation(id: string): Reservation[] {
  const updated = getStoredReservations().filter(r => r.id !== id);
  setLocal('wings_reservations', updated);
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
  return current;
}
export function updateGalleryItem(item: GalleryItem): GalleryItem[] {
  const updated = getStoredGalleryItems().map(g => g.id === item.id ? item : g);
  setLocal('wings_gallery', updated);
  return updated;
}
export function deleteGalleryItem(id: string): GalleryItem[] {
  const updated = getStoredGalleryItems().filter(g => g.id !== id);
  setLocal('wings_gallery', updated);
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
}
export function updateMenuItem(item: MenuItem): void {
  const updated = getStoredMenuItems().map(m => m.id === item.id ? item : m);
  setLocal('wings_menu', updated);
}
export function deleteMenuItem(id: string): MenuItem[] {
  const updated = getStoredMenuItems().filter(m => m.id !== id);
  setLocal('wings_menu', updated);
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
}
export function updateBlog(blog: BlogPost): void {
  const updated = getStoredBlogs().map(b => b.id === blog.id ? blog : b);
  setLocal('wings_blogs', updated);
}
export function deleteBlog(id: string): BlogPost[] {
  const updated = getStoredBlogs().filter(b => b.id !== id);
  setLocal('wings_blogs', updated);
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
}
export function deleteReview(id: string): Review[] {
  const updated = getStoredReviews().filter(r => r.id !== id);
  setLocal('wings_reviews', updated);
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
}
export function deleteContactMessage(id: string): ContactMessage[] {
  const updated = getStoredContactMessages().filter(m => m.id !== id);
  setLocal('wings_contact', updated);
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
  return current;
}
export function updateEventBanner(banner: EventBanner): EventBanner[] {
  const updated = getStoredEventBanners().map(b => b.id === banner.id ? banner : b);
  setLocal('wings_event_banners', updated);
  return updated;
}
export function deleteEventBanner(id: string): EventBanner[] {
  const updated = getStoredEventBanners().filter(b => b.id !== id);
  setLocal('wings_event_banners', updated);
  return updated;
}
export function toggleEventBanner(id: string): EventBanner[] {
  const updated = getStoredEventBanners().map(b => b.id === id ? { ...b, is_active: !b.is_active } : b);
  setLocal('wings_event_banners', updated);
  return updated;
}
