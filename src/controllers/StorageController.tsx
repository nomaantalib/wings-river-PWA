import { Reservation } from '@/models/ReservationModel';
import { MenuItem, INITIAL_MENU_ITEMS } from '@/models/MenuModel';
import { BlogPost, INITIAL_BLOGS } from '@/models/BlogModel';
import { GalleryItem, INITIAL_GALLERY } from '@/models/GalleryModel';
import { Review, ContactMessage, INITIAL_REVIEWS } from '@/models/ReviewModel';

// Generic LocalStorage Safe Handler
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// RESERVATION CONTROLLER
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

  // Sync with Server API endpoint if online
  if (typeof window !== 'undefined' && navigator.onLine) {
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(res)
    }).catch(() => {});
  }
}

export function updateReservationStatus(id: string, newStatus: string): Reservation[] {
  const current = getStoredReservations();
  const updated = current.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
  setLocal('wings_reservations', updated);
  return updated;
}

// GALLERY CONTROLLER
export function getStoredGalleryItems(): GalleryItem[] {
  return getLocal<GalleryItem[]>('wings_gallery', INITIAL_GALLERY);
}

export function saveGalleryItem(item: GalleryItem): GalleryItem[] {
  const current = getStoredGalleryItems();
  current.unshift(item);
  setLocal('wings_gallery', current);
  return current;
}

export function deleteGalleryItem(id: string): GalleryItem[] {
  const current = getStoredGalleryItems();
  const updated = current.filter((g) => g.id !== id);
  setLocal('wings_gallery', updated);
  return updated;
}

// MENU CONTROLLER
export function getStoredMenuItems(): MenuItem[] {
  return getLocal<MenuItem[]>('wings_menu', INITIAL_MENU_ITEMS);
}

export function saveMenuItem(item: MenuItem): void {
  const current = getStoredMenuItems();
  current.unshift(item);
  setLocal('wings_menu', current);
}

// BLOG CONTROLLER
export function getStoredBlogs(): BlogPost[] {
  return getLocal<BlogPost[]>('wings_blogs', INITIAL_BLOGS);
}

export function saveBlog(blog: BlogPost): void {
  const current = getStoredBlogs();
  current.unshift(blog);
  setLocal('wings_blogs', current);
}

// REVIEWS CONTROLLER
export function getStoredReviews(): Review[] {
  return getLocal<Review[]>('wings_reviews', INITIAL_REVIEWS);
}

export function saveReview(rev: Review): void {
  const current = getStoredReviews();
  current.unshift(rev);
  setLocal('wings_reviews', current);
}

// CONTACT CONTROLLER
export function getStoredContactMessages(): ContactMessage[] {
  return getLocal<ContactMessage[]>('wings_contact', []);
}

export function saveContactMessage(msg: ContactMessage): void {
  const current = getStoredContactMessages();
  current.unshift(msg);
  setLocal('wings_contact', current);
}
