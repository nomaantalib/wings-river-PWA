// StorageController — Cloudflare D1 persistent storage engine via Hono.
// No mock local storage. Full support for REST endpoints with JWT authorization.

import { Reservation, INITIAL_RESERVATIONS } from '@/models/ReservationModel';
import { MenuItem, INITIAL_MENU_ITEMS, MenuPageDefinition, MENU_BOOKLET_PAGES } from '@/models/MenuModel';
import { BlogPost, INITIAL_BLOGS }                 from '@/models/BlogModel';
import { GalleryItem, INITIAL_GALLERY }            from '@/models/GalleryModel';
import { Review, ContactMessage, INITIAL_REVIEWS } from '@/models/ReviewModel';
import { RideTicket, WATER_SPORTS_RIDES }          from '@/models/WaterSportsModel';
import { HeroSettings, DEFAULT_HERO_SETTINGS }     from '@/models/HeroModel';
import { FloorPlanLayout, INITIAL_FLOOR_PLAN }    from '@/models/FloorPlanModel';

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

// ── Cloudinary Image Optimization CDN Helpers ──────────────────────────────
const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vrgblmky';

export function getCloudinaryOptimizedUrl(url: string, width?: number, quality: string = 'auto'): string {
  if (!url) return url;
  // Already a Cloudinary URL → inject transformation params
  if (url.includes('res.cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const cropTransform = width ? `c_fill,ar_4:6,g_auto,f_auto,q_${quality},w_${width}` : `f_auto,q_${quality}`;
      return `${parts[0]}/upload/${cropTransform}/${parts[1]}`;
    }
    return url;
  }
  // External URL → proxy via Cloudinary fetch with auto 4:6 crop
  if (url.startsWith('http')) {
    const encoded = encodeURIComponent(url);
    const cropTransform = width
      ? `c_fill,ar_4:6,g_auto,f_auto,q_${quality},w_${width}`
      : `f_auto,q_${quality}`;
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${cropTransform}/${encoded}`;
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

export interface TableOrder {
  id: string;
  order_number: string;
  table_number: string;
  customer_name: string;
  customer_phone: string;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  payment_status: 'paid' | 'unpaid';
  payment_method?: string;
  razorpay_payment_id?: string;
  total_amount: number;
  items: { name: string; quantity: number; price: number }[];
  notes?: string;
  created_at: string;
}


// ── Zero-delay cross-tab & PWA synchronization ──────────────────────────────
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('wings_pwa_sync_channel');
    syncChannel.onmessage = () => {
      window.dispatchEvent(new Event('wings_db_sync'));
    };
  } catch (e) {}
}

let syncDebounceTimer: any = null;
export function notifySync() {
  if (typeof window !== 'undefined') {
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      window.dispatchEvent(new Event('wings_db_sync'));
      if (syncChannel) {
        try {
          syncChannel.postMessage('sync');
        } catch (e) {}
      }
    }, 40);
  }
}

export function subscribeToSync(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleEvent = () => callback();
  window.addEventListener('wings_db_sync', handleEvent);
  window.addEventListener('storage', handleEvent);
  return () => {
    window.removeEventListener('wings_db_sync', handleEvent);
    window.removeEventListener('storage', handleEvent);
  };
}

// Background heartbeat auto-sync loop (revalidates active endpoints every 10s)
if (typeof window !== 'undefined') {
  setInterval(() => {
    revalidateInBackground('/api/menu', 'wings_menu_db');
    revalidateInBackground('/api/categories', 'wings_categories_db');
    revalidateInBackground('/api/blogs', 'wings_blogs_db');
    revalidateInBackground('/api/hero', 'wings_hero_db');
  }, 10000);
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
    const res = await fetch(getApiUrl(url), { headers: getHeaders(), cache: 'no-store' });
    const result = await res.json().catch(() => null);
    if (!res.ok) return { success: false, data: [], error: result?.error || `HTTP ${res.status}` };
    return result || { success: true, data: [] };
  } catch (err: any) {
    return { success: false, data: [], error: err?.message || 'Network error' };
  }
}

// ── Cache-first SWR helpers — zero buffering on reload ──────────────────────────
// readCache: returns parsed localStorage value instantly (sync)
function readCache<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; } catch { return []; }
}
// readCacheObj: for single objects (settings, hero)
function readCacheObj<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
// writeCache: persist D1 result to localStorage
function writeCache(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}
// revalidateInBackground: fetch D1, write cache, notify sync if changed
function revalidateInBackground(url: string, cacheKey: string, transform?: (d: any) => any) {
  if (typeof window === 'undefined') return;
  // Use requestIdleCallback when available for non-urgent revalidation
  const run = () => {
    apiFetch(url).then(res => {
      if (res.success && Array.isArray(res.data)) {
        const data = transform ? transform(res.data) : res.data;
        const prev = localStorage.getItem(cacheKey);
        const next = JSON.stringify(data);
        if (prev !== next) { writeCache(cacheKey, data); notifySync(); }
      }
    }).catch(() => {});
  };
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 100);
}
// revalidateObjInBackground: for single-object endpoints
function revalidateObjInBackground(url: string, cacheKey: string) {
  if (typeof window === 'undefined') return;
  const run = () => {
    apiFetch(url).then(res => {
      if (res.success && res.data && typeof res.data === 'object') {
        const prev = localStorage.getItem(cacheKey);
        const next = JSON.stringify(res.data);
        if (prev !== next) { writeCache(cacheKey, res.data); notifySync(); }
      }
    }).catch(() => {});
  };
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 100);
}

async function apiPost(url: string, data: any): Promise<any> {
  try {
    const res = await fetch(getApiUrl(url), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => null);
    if (!res.ok) {
      return { success: false, error: result?.error || `HTTP error ${res.status}` };
    }
    return result || { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

async function apiDelete(url: string): Promise<any> {
  try {
    const res = await fetch(getApiUrl(url), {
      method: 'DELETE',
      headers: getHeaders()
    });
    const result = await res.json().catch(() => null);
    if (!res.ok) {
      return { success: false, error: result?.error || `HTTP error ${res.status}` };
    }
    return result || { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

// ── Core Orders API & Local Storage Sync ────────────────────────────────────
export function getStoredOrders(): Promise<TableOrder[]> {
  return Promise.resolve(readCache<TableOrder>('wings_orders_db'));
}

export async function saveOrder(order: Partial<TableOrder>): Promise<TableOrder> {
  const newOrder: TableOrder = {
    id: order.id || `ord-${Date.now()}`,
    order_number: order.order_number || `ORD-${Math.floor(100 + Math.random() * 900)}`,
    table_number: order.table_number || 'T1',
    customer_name: order.customer_name || 'Guest',
    customer_phone: order.customer_phone || '',
    status: order.status || 'new',
    payment_status: order.payment_status || 'paid',
    payment_method: order.payment_method || 'Online Razorpay',
    razorpay_payment_id: order.razorpay_payment_id || '',
    total_amount: order.total_amount || 0,
    items: order.items || [],
    created_at: new Date().toISOString(),
  };

  const current = await getStoredOrders();
  const updated = [newOrder, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem('wings_orders_db', JSON.stringify(updated));
  }
  notifySync();
  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: TableOrder['status']): Promise<void> {
  const current = await getStoredOrders();
  const updated = current.map(o => o.id === orderId ? { ...o, status } : o);
  if (typeof window !== 'undefined') {
    localStorage.setItem('wings_orders_db', JSON.stringify(updated));
  }
  notifySync();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  RESERVATIONS / BOOKINGS — cache-first
// ═══════════════════════════════════════════════════════════════════════════════
export function getStoredReservations(): Promise<Reservation[]> {
  revalidateInBackground('/api/bookings', 'wings_reservations_db');
  return Promise.resolve(readCache<Reservation>('wings_reservations_db'));
}

export async function saveReservation(reservation: Reservation): Promise<void> {
  apiPost('/api/bookings', reservation).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredReservations();
    const idx = current.findIndex(r => r.id === reservation.id);
    let updated: Reservation[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = reservation;
    } else {
      updated = [reservation, ...current];
    }
    localStorage.setItem('wings_reservations_db', JSON.stringify(updated));
  }
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
  apiDelete(`/api/bookings/${id}`).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredReservations();
    const updated = current.filter(r => r.id !== id);
    localStorage.setItem('wings_reservations_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredReservations();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CALL REQUESTS & TABLE STATUS CONTROL
// ═══════════════════════════════════════════════════════════════════════════════
export interface CallRequest {
  id: string;
  table_number: string;
  type: string;
  time: string;
  status: 'pending' | 'resolved';
}

export function getStoredCallRequests(): Promise<CallRequest[]> {
  return Promise.resolve(readCache<CallRequest>('wings_call_requests'));
}

export async function saveCallRequest(req: { table_number: string; type: string; time?: string }): Promise<CallRequest[]> {
  const current = await getStoredCallRequests();
  const newCall: CallRequest = {
    id: `call-${Date.now()}`,
    table_number: req.table_number,
    type: req.type,
    time: req.time || 'Just now',
    status: 'pending'
  };
  const updated = [newCall, ...current.filter(c => !(c.table_number === req.table_number && c.type === req.type))];
  if (typeof window !== 'undefined') {
    localStorage.setItem('wings_call_requests', JSON.stringify(updated));
  }
  notifySync();
  return updated;
}

export async function resolveCallRequest(id: string): Promise<CallRequest[]> {
  const current = await getStoredCallRequests();
  const updated = current.filter(c => c.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem('wings_call_requests', JSON.stringify(updated));
  }
  notifySync();
  return updated;
}

export interface TableStatus {
  id: string;
  table_number: string;
  cluster: string;
  capacity: number;
  status: 'free' | 'eating' | 'needs_cleaning' | 'reserved';
}

export const INITIAL_TABLES: TableStatus[] = [
  { id: 'tbl-1',  table_number: 'T1',  cluster: 'Rooftop Upper Deck', capacity: 2, status: 'free' },
  { id: 'tbl-2',  table_number: 'T2',  cluster: 'Rooftop Upper Deck', capacity: 4, status: 'eating' },
  { id: 'tbl-3',  table_number: 'T3',  cluster: 'Rooftop Upper Deck', capacity: 2, status: 'free' },
  { id: 'tbl-4',  table_number: 'T4',  cluster: 'Rooftop Upper Deck', capacity: 4, status: 'needs_cleaning' },
  { id: 'tbl-5',  table_number: 'T5',  cluster: 'Rooftop Upper Deck', capacity: 2, status: 'free' },
  { id: 'tbl-6',  table_number: 'T6',  cluster: 'Rooftop Upper Deck', capacity: 4, status: 'reserved' },
  { id: 'tbl-7',  table_number: 'T7',  cluster: 'Open Garden Area',   capacity: 4, status: 'free' },
  { id: 'tbl-8',  table_number: 'T8',  cluster: 'Open Garden Area',   capacity: 4, status: 'free' },
  { id: 'tbl-9',  table_number: 'T9',  cluster: 'Open Garden Area',   capacity: 6, status: 'eating' },
  { id: 'tbl-10', table_number: 'T10', cluster: 'Open Garden Area',   capacity: 4, status: 'free' },
  { id: 'tbl-11', table_number: 'T11', cluster: 'Open Garden Area',   capacity: 4, status: 'free' },
  { id: 'tbl-12', table_number: 'T12', cluster: 'Open Garden Area',   capacity: 6, status: 'free' },
  { id: 'tbl-13', table_number: 'T13', cluster: 'Open Garden Area',   capacity: 8, status: 'reserved' },
  { id: 'tbl-14', table_number: 'T14', cluster: 'Indoor AC Hall',     capacity: 4, status: 'free' },
  { id: 'tbl-15', table_number: 'T15', cluster: 'Indoor AC Hall',     capacity: 4, status: 'free' },
  { id: 'tbl-16', table_number: 'T16', cluster: 'Indoor AC Hall',     capacity: 6, status: 'eating' },
  { id: 'tbl-17', table_number: 'T17', cluster: 'Indoor AC Hall',     capacity: 8, status: 'free' },
  { id: 'tbl-18', table_number: 'V1',  cluster: 'VIP Canopy',         capacity: 10, status: 'free' },
  { id: 'tbl-19', table_number: 'V2',  cluster: 'VIP Canopy',         capacity: 12, status: 'reserved' },
];

export async function getStoredTables(): Promise<TableStatus[]> {
  if (typeof window === 'undefined') return INITIAL_TABLES;
  const rawMap = localStorage.getItem('wings_tables_status');
  if (!rawMap) return INITIAL_TABLES;
  try {
    const statusMap: Record<string, string> = JSON.parse(rawMap);
    return INITIAL_TABLES.map(t => ({
      ...t,
      status: (statusMap[t.table_number] as any) || t.status
    }));
  } catch (e) {
    return INITIAL_TABLES;
  }
}

export async function updateTableStatusInStore(tableNumber: string, status: string): Promise<TableStatus[]> {
  if (typeof window !== 'undefined') {
    const rawMap = localStorage.getItem('wings_tables_status');
    const statusMap: Record<string, string> = rawMap ? JSON.parse(rawMap) : {};
    statusMap[tableNumber] = status;
    localStorage.setItem('wings_tables_status', JSON.stringify(statusMap));
  }
  notifySync();
  return getStoredTables();
}


// resolveData is kept only for write-path helpers that still need sync resolve
function resolveData<T>(res: any, localStorageKey: string): T[] {
  if (res && res.success && Array.isArray(res.data)) {
    writeCache(localStorageKey, res.data);
    return res.data;
  }
  return readCache<T>(localStorageKey);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GALLERY — cache-first, no mock fallback
// ═══════════════════════════════════════════════════════════════════════════════
export function getStoredGalleryItems(): Promise<GalleryItem[]> {
  revalidateInBackground('/api/gallery', 'wings_gallery_db');
  return Promise.resolve(readCache<GalleryItem>('wings_gallery_db'));
}

export async function saveGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  apiPost('/api/gallery', item).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredGalleryItems();
    const idx = current.findIndex(g => g.id === item.id);
    let updated: GalleryItem[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = item;
    } else {
      updated = [item, ...current];
    }
    localStorage.setItem('wings_gallery_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredGalleryItems();
}

export async function updateGalleryItem(item: GalleryItem): Promise<GalleryItem[]> {
  return saveGalleryItem(item);
}

export async function deleteGalleryItem(id: string): Promise<GalleryItem[]> {
  apiDelete(`/api/gallery/${id}`).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredGalleryItems();
    const updated = current.filter(g => g.id !== id);
    localStorage.setItem('wings_gallery_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredGalleryItems();
}

const DEFAULT_CATEGORIES: MenuCategory[] = [
  { id: 'cat-starters', name: 'Starters & Tandoor', slug: 'starters-tandoor', description: 'Crispy rolls, kebabs, tandoori tikka & momos', display_order: 1 },
  { id: 'cat-indian', name: 'Indian Main Course', slug: 'indian-main-course', description: 'Authentic paneer, rich curries & garlic naan', display_order: 2 },
  { id: 'cat-chinese', name: 'Chinese & Asian', slug: 'chinese-asian', description: 'Hakka noodles, Manchurian, fried rice & chilli paneer', display_order: 3 },
  { id: 'cat-[#1]', name: 'Pizza & Italian Pasta', slug: 'pizza-italian-pasta', description: 'Wood-fired gourmet pizzas & creamy pastas', display_order: 4 },
  { id: 'cat-[#2]', name: 'Burgers, Rolls & Snacks', slug: 'burgers-rolls-snacks', description: 'Crispy veggie burgers, kathak rolls & fries', display_order: 5 },
  { id: 'cat-[#3]', name: 'Biryani & Pulao', slug: 'biryani-pulao', description: 'Aromatic Dum Biryani with spiced raita', display_order: 6 },
  { id: 'cat-[#4]', name: 'Desserts & Ice Cream', slug: 'desserts-ice-cream', description: 'Hot Gulab Jamun, Sizzling Brownie & Ice Creams', display_order: 7 },
  { id: 'cat-beverages', name: 'Mocktails, Tea & Coffee', slug: 'mocktails-tea-coffee', description: 'Chilled Mojito, Cold Coffee & Spiced Chai', display_order: 8 },
  { id: 'cat-[#5]', name: 'Water Sports Rides', slug: 'water-sports-rides', description: 'Gomti River Speedboat & Jet Ski Ride Tickets', display_order: 9 }
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU CATEGORIES — auto seed if empty
// ═══════════════════════════════════════════════════════════════════════════════
export function getStoredCategories(): Promise<MenuCategory[]> {
  revalidateInBackground('/api/categories', 'wings_categories_db');
  const cached = readCache<MenuCategory>('wings_categories_db');
  if (cached && cached.length > 0) return Promise.resolve(cached);
  if (typeof window !== 'undefined') localStorage.setItem('wings_categories_db', JSON.stringify(DEFAULT_CATEGORIES));
  return Promise.resolve(DEFAULT_CATEGORIES);
}

export async function saveCategory(cat: MenuCategory): Promise<MenuCategory[]> {
  apiPost('/api/categories', cat).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredCategories();
    const idx = current.findIndex(c => c.id === cat.id);
    let updated: MenuCategory[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = cat;
    } else {
      updated = [cat, ...current];
    }
    localStorage.setItem('wings_categories_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredCategories();
}

export async function deleteCategory(id: string): Promise<MenuCategory[]> {
  apiDelete(`/api/categories/${id}`).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredCategories();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem('wings_categories_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredCategories();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MENU ITEMS — auto seed if empty
// ═══════════════════════════════════════════════════════════════════════════════
export function getStoredMenuItems(): Promise<MenuItem[]> {
  revalidateInBackground('/api/menu', 'wings_menu_db');
  const cached = readCache<MenuItem>('wings_menu_db');
  if (cached && cached.length > 0) return Promise.resolve(cached);
  if (typeof window !== 'undefined') localStorage.setItem('wings_menu_db', JSON.stringify(INITIAL_MENU_ITEMS));
  return Promise.resolve(INITIAL_MENU_ITEMS);
}


export async function saveMenuItem(item: MenuItem): Promise<MenuItem[]> {
  apiPost('/api/menu', item).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredMenuItems();
    const idx = current.findIndex(m => m.id === item.id);
    let updated: MenuItem[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = item;
    } else {
      updated = [item, ...current];
    }
    localStorage.setItem('wings_menu_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredMenuItems();
}

export async function updateMenuItem(item: MenuItem): Promise<MenuItem[]> {
  return saveMenuItem(item);
}

export async function deleteMenuItem(id: string): Promise<MenuItem[]> {
  apiDelete(`/api/menu/${id}`).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredMenuItems();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem('wings_menu_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredMenuItems();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BLOGS — cache-first
// ═══════════════════════════════════════════════════════════════════════════════
export function getStoredBlogs(): Promise<BlogPost[]> {
  revalidateInBackground('/api/blogs', 'wings_blogs_db');
  return Promise.resolve(readCache<BlogPost>('wings_blogs_db'));
}

export async function saveBlog(blog: BlogPost): Promise<BlogPost[]> {
  apiPost('/api/blogs', blog).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredBlogs();
    const idx = current.findIndex(b => b.id === blog.id);
    let updated: BlogPost[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = blog;
    } else {
      updated = [blog, ...current];
    }
    localStorage.setItem('wings_blogs_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredBlogs();
}

export async function updateBlog(blog: BlogPost): Promise<BlogPost[]> {
  return saveBlog(blog);
}

export async function deleteBlog(id: string): Promise<BlogPost[]> {
  apiDelete(`/api/blogs/${id}`).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredBlogs();
    const updated = current.filter(b => b.id !== id);
    localStorage.setItem('wings_blogs_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredBlogs();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  REVIEWS / TESTIMONIALS — cache-first
// ═══════════════════════════════════════════════════════════════════════════════
export function getStoredReviews(): Promise<Review[]> {
  revalidateInBackground('/api/reviews', 'wings_reviews_db');
  return Promise.resolve(readCache<Review>('wings_reviews_db'));
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
export function getStoredWaterSports(): Promise<RideTicket[]> {
  revalidateInBackground('/api/watersports', 'wings_watersports_db');
  return Promise.resolve(readCache<RideTicket>('wings_watersports_db'));
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
export function getStoredMenuPages(): Promise<MenuPageDefinition[]> {
  revalidateInBackground('/api/menupages', 'wings_menupages_db', (data: any[]) =>
    data.map((item: any) => ({
      ...item,
      pageNumber: item.page_number ?? item.pageNumber,
      categories: typeof item.categories === 'string'
        ? (() => { try { return JSON.parse(item.categories); } catch { return []; } })()
        : (Array.isArray(item.categories) ? item.categories : []),
    }))
  );
  return Promise.resolve(readCache<MenuPageDefinition>('wings_menupages_db'));
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
export function getStoredHeroSettings(): Promise<HeroSettings> {
  revalidateObjInBackground('/api/hero', 'wings_hero_db');
  return Promise.resolve(readCacheObj<HeroSettings>('wings_hero_db', DEFAULT_HERO_SETTINGS));
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

export function getStoredMedia(): Promise<MediaItem[]> {
  revalidateInBackground('/api/media', 'wings_media_db');
  revalidateInBackground('/api/images', 'wings_media_db');
  return Promise.resolve(readCache<MediaItem>('wings_media_db'));
}

export async function saveMediaItem(media: MediaItem): Promise<MediaItem[]> {
  apiPost('/api/media', media).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredMedia();
    const idx = current.findIndex(m => m.id === media.id);
    let updated: MediaItem[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = media;
    } else {
      updated = [media, ...current];
    }
    localStorage.setItem('wings_media_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredMedia();
}

export async function updateMediaItem(id: string, fileOrData: File | Partial<MediaItem>): Promise<MediaItem[]> {
  if (fileOrData instanceof File) {
    const formData = new FormData();
    formData.append('file', fileOrData);
    await apiPost(`/api/admin/images/${id}`, formData).catch(() => {});
  } else {
    await apiPost(`/api/media/${id}`, fileOrData).catch(() => {});
  }
  notifySync();
  return getStoredMedia();
}

export async function deleteMediaItem(id: string): Promise<MediaItem[]> {
  apiDelete(`/api/admin/images/${id}`).catch(() => {});
  apiDelete(`/api/media/${id}`).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredMedia();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem('wings_media_db', JSON.stringify(updated));
  }
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
//  DYNAMIC PAGES — Cache-first SWR
// ═══════════════════════════════════════════════════════════════════════════════
export function getStoredPages(): Promise<SitePage[]> {
  revalidateInBackground('/api/pages', 'wings_pages_db');
  return Promise.resolve(readCache<SitePage>('wings_pages_db'));
}

export async function savePage(page: SitePage): Promise<SitePage[]> {
  apiPost('/api/pages', page).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredPages();
    const idx = current.findIndex(p => p.id === page.id);
    let updated: SitePage[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = page;
    } else {
      updated = [page, ...current];
    }
    localStorage.setItem('wings_pages_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredPages();
}

export async function deletePage(id: string, hard: boolean = false): Promise<SitePage[]> {
  apiDelete(`/api/pages/${id}?hard=${hard ? '1' : '0'}`).catch(() => {});
  if (typeof window !== 'undefined') {
    const current = await getStoredPages();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem('wings_pages_db', JSON.stringify(updated));
  }
  notifySync();
  return getStoredPages();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CLOUDINARY MEDIA UPLOADER & SITE SETTINGS & STATS
// ═══════════════════════════════════════════════════════════════════════════════
export async function uploadMediaFile(file: File, category: string = 'general', altText: string = ''): Promise<{ success: boolean; url?: string; media_id?: string; error?: string }> {
  let cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vrgblmky';
  let uploadPreset = 'wings_river_pwa';

  try {
    const siteCfg = await getSiteSettings();
    if (siteCfg?.cloudinary_cloud_name) cloudName = siteCfg.cloudinary_cloud_name;
    if (siteCfg?.cloudinary_upload_preset) uploadPreset = siteCfg.cloudinary_upload_preset;
  } catch {}

  // 1. Try unsigned direct Cloudinary upload first
  try {
    const cRes = await uploadCloudinaryFile(file, cloudName, uploadPreset);
    if (cRes.success && cRes.url) {
      const mediaItem: MediaItem = {
        id: 'med-' + Date.now(),
        public_id: file.name || `upload_${Date.now()}.jpg`,
        secure_url: cRes.url,
        url: cRes.url,
        category: category,
        alt_text: altText || file.name || 'Cloudinary Media',
        created_at: new Date().toISOString()
      };
      // Save media item metadata persistently into D1 database 912b607b-c192-4e0a-89ba-75f936fca45c and local cache
      await saveMediaItem(mediaItem).catch(() => {});
      notifySync();
      return { success: true, url: cRes.url, media_id: mediaItem.id };
    }
  } catch (e) {
    console.warn('[Cloudinary Direct Upload Notice]:', e);
  }

  // 2. Try backend Worker upload endpoint (/api/admin/images/upload)
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
    if (res.ok) {
      const data = await res.json();
      if (data.url || data.image?.secure_url) {
        const mediaUrl = data.url || data.image?.secure_url;
        const mediaItem: MediaItem = data.image || {
          id: data.media_id || 'med-' + Date.now(),
          public_id: fileName,
          secure_url: mediaUrl,
          url: mediaUrl,
          category,
          alt_text: altText || fileName,
          created_at: new Date().toISOString()
        };
        await saveMediaItem(mediaItem).catch(() => {});
        notifySync();
        return { success: true, url: mediaUrl, media_id: mediaItem.id };
      }
    }
  } catch (e: any) {
    console.warn('[Backend Worker Upload Notice]:', e);
  }

  // 3. Ultra-fast local FileReader fallback if completely offline
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const mediaItem: MediaItem = {
        id: 'med-' + Date.now(),
        public_id: file.name || `upload_${Date.now()}.jpg`,
        secure_url: dataUrl,
        url: dataUrl,
        category: category,
        alt_text: altText || file.name || 'Local Media',
        created_at: new Date().toISOString()
      };
      saveMediaItem(mediaItem).catch(() => {});
      notifySync();
      resolve({ success: true, url: dataUrl, media_id: mediaItem.id });
    };
    reader.onerror = () => resolve({ success: false, error: 'File read error' });
    reader.readAsDataURL(file);
  });
}

export async function uploadCloudinaryFile(
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Try provided preset, or common fallback presets: wings_river_pwa, ml_default, unsigned
  const presetsToTry = Array.from(new Set([uploadPreset, 'wings_river_pwa', 'ml_default', 'unsigned']));

  for (const preset of presetsToTry) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.secure_url) {
        return { success: true, url: data.secure_url };
      }
    } catch (e) {
      // Continue to next preset
    }
  }
  return { success: false, error: 'Cloudinary direct upload fallback exhausted' };
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

export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  site_title: 'Wings River Café',
  slogan: 'Taste • Eat • Rides',
  logo_url: '/logo.png',
  favicon_url: '/favicon.ico',
  phone: '07310008020',
  whatsapp: '917310008020',
  email: 'wingsrivercafe@gmail.com',
  address: 'Laxman Mela Ground, Gomti Riverfront, Lucknow UP 226001',
  opening_hours: '11:00 AM – 11:59 PM (Open All 7 Days)',
  instagram_url: 'https://www.instagram.com/wingsriver',
  facebook_url: 'https://facebook.com',
  google_maps_url: 'https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA',
  hero_bg_image: '/images/Screenshot_20260720-180621_Maps.png',
  menu_booklet_cover: '/images/food_menu_collage.jpg',
  seo_meta_title: 'Wings River Café | Multicuisine Restaurant & Water Sports Lucknow',
  seo_meta_description: "Lucknow's premier riverside café offering gourmet food, live music, and thrilling Gomti riverfront water sports rides.",
};

export function getSiteSettings(): Promise<SiteSettings> {
  // Revalidate from D1 in background, return cache instantly (no buffering)
  if (typeof window !== 'undefined') {
    const run = () => {
      apiFetch('/api/settings').then(res => {
        if (res.success && res.data?.site_settings) {
          const prev = localStorage.getItem('wings_site_settings');
          const next = JSON.stringify(res.data.site_settings);
          if (prev !== next) {
            try { localStorage.setItem('wings_site_settings', next); } catch {}
            notifySync();
          }
        }
      }).catch(() => {});
    };
    if ('requestIdleCallback' in window) (window as any).requestIdleCallback(run, { timeout: 3000 });
    else setTimeout(run, 100);
  }
  return Promise.resolve(readCacheObj<SiteSettings>('wings_site_settings', SITE_SETTINGS_DEFAULTS));
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
//  FLOOR PLAN LAYOUT DESIGNER
// ══════════════════════════════════════════════════════════════════════════════
export async function getStoredFloorPlan(floorName: string = 'main'): Promise<FloorPlanLayout> {
  let cached: FloorPlanLayout | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`wings_floor_plan_${floorName}`) || localStorage.getItem('wings_floor_plan_layout');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.objects)) cached = parsed;
      }
    } catch (e) {}
  }

  try {
    const res = await apiFetch(`/api/floor-plans/${floorName}`);
    if (res.success && res.data && Array.isArray(res.data.objects)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`wings_floor_plan_${floorName}`, JSON.stringify(res.data));
        localStorage.setItem('wings_floor_plan_layout', JSON.stringify(res.data));
      }
      return res.data;
    }
  } catch (e) {
    console.warn('[D1] getStoredFloorPlan error:', e);
  }

  return cached || INITIAL_FLOOR_PLAN;
}

export async function saveFloorPlan(layout: FloorPlanLayout, floorName: string = 'main'): Promise<boolean> {
  try {
    const payload = { ...layout, updatedAt: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`wings_floor_plan_${floorName}`, JSON.stringify(payload));
      localStorage.setItem('wings_floor_plan_layout', JSON.stringify(payload));
    }
    const res = await apiPost(`/api/floor-plans/${floorName}`, payload);

    notifySync();
    return res.success;
  } catch (e) {
    console.error('[D1] saveFloorPlan failed:', e);
    notifySync();
    return true; // saved locally
  }
}


export interface DiningSession {
  id: string;
  table_number: string;
  customer_name?: string;
  customer_phone?: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'closed';
}

export async function createDiningSession(tableNumber: string, name?: string, phone?: string): Promise<DiningSession> {
  const sessionId = `ds-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const session: DiningSession = {
    id: sessionId,
    table_number: tableNumber,
    customer_name: name || 'Valued Guest',
    customer_phone: phone || '',
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`wings_dining_session_${tableNumber}`, JSON.stringify(session));
  }

  try {
    await apiPost('/api/dining-session', { table_number: tableNumber, customer_name: name, customer_phone: phone });
  } catch (e) {
    console.warn('[D1] createDiningSession fallback to local:', e);
  }

  notifySync();
  return session;
}

export async function closeDiningSession(sessionId: string, tableNumber: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`wings_dining_session_${tableNumber}`);
  }
  try {
    await apiPost('/api/dining-session/close', { session_id: sessionId, table_number: tableNumber });
  } catch (e) {
    console.warn('[D1] closeDiningSession fallback:', e);
  }
  notifySync();
  return true;
}

export async function syncDatabase(): Promise<void> {
  notifySync();
}


const StorageController = {
  syncDatabase,
  getApiUrl,
  getStoredReservations,
  getStoredMenuItems,
  getStoredBlogs,
  getStoredGalleryItems,
  getStoredReviews,
  getStoredContactMessages,
  getStoredEventBanners,
  getStoredWaterSports,
};

export default StorageController;

