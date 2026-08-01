'use client';

// Wings River Café — Push Notification Engine
// Handles VAPID subscription, permission requests, and dispatching push events

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  'BB_D3Bo704xpIpSFlesjRGUCnDx8qx2fKV1dV4w3M_eArGEQ4E7MPI6r86uvMLdjLS8XoQS72eXf5a_36GBiNFk';

// Convert VAPID base64 key to Uint8Array for pushManager.subscribe()
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

// ── Register Service Worker ───────────────────────────────────────────────────
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('[PushNotif] SW registration failed:', err);
    return null;
  }
}

// ── Request Permission & Subscribe ───────────────────────────────────────────
export async function requestPushPermission(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[PushNotif] Permission denied by user.');
    return null;
  }

  const reg = await registerServiceWorker();
  if (!reg) return null;

  try {
    // Check existing subscription first
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      storePushSubscription(existing);
      return existing;
    }

    // Subscribe with VAPID key
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });

    storePushSubscription(subscription);

    // Persist subscription on server
    await saveSubscriptionToServer(subscription);

    return subscription;
  } catch (err) {
    console.warn('[PushNotif] Subscription failed:', err);
    return null;
  }
}

// ── Store subscription in localStorage ───────────────────────────────────────
function storePushSubscription(sub: PushSubscription) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wings_push_subscription', JSON.stringify(sub.toJSON()));
}

export function getStoredPushSubscription(): PushSubscriptionJSON | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('wings_push_subscription');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Send subscription to backend API ─────────────────────────────────────────
async function saveSubscriptionToServer(sub: PushSubscription) {
  try {
    const session = localStorage.getItem('wings_user_session');
    const user = session ? JSON.parse(session) : null;
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        phone: user?.phone || 'anonymous',
        name: user?.name || 'Guest',
      }),
    });
  } catch (err) {
    console.warn('[PushNotif] Could not save subscription to server:', err);
  }
}

// ── Notification Payload Types ────────────────────────────────────────────────
export type PushNotifType =
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'order_ready'
  | 'table_ready'
  | 'cancellation'
  | 'general';

export interface PushPayload {
  title: string;
  body: string;
  type: PushNotifType;
  url?: string;
  bookingId?: string;
}

// ── Show LOCAL notification (immediate, no server needed) ─────────────────────
export async function showLocalNotification(payload: PushPayload): Promise<void> {
  if (typeof window === 'undefined') return;

  // Request permission if not yet granted
  if (Notification.permission === 'default') {
    await requestPushPermission();
  }

  if (Notification.permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;

  const iconMap: Record<PushNotifType, string> = {
    booking_confirmed: '📋',
    booking_reminder: '⏰',
    order_ready: '🍽️',
    table_ready: '🪑',
    cancellation: '❌',
    general: '🔔',
  };

  await reg.showNotification(`${iconMap[payload.type]} ${payload.title}`, {
    body: payload.body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.type,
    requireInteraction: ['booking_confirmed', 'order_ready', 'table_ready'].includes(payload.type),
    vibrate: [300, 100, 300],
    data: { url: payload.url || '/', type: payload.type, bookingId: payload.bookingId },
  } as NotificationOptions);
}

// ── Pre-built Notification Senders ───────────────────────────────────────────

export async function notifyBookingConfirmed(opts: {
  name: string;
  table: string;
  date: string;
  time: string;
  bookingId?: string;
}) {
  await showLocalNotification({
    title: 'Booking Confirmed! 🎉',
    body: `Hi ${opts.name}! Your table ${opts.table} is reserved for ${opts.date} at ${opts.time}. Show your QR code at reception. See you soon! 🌊`,
    type: 'booking_confirmed',
    url: '/#floor-map',
    bookingId: opts.bookingId,
  });
}

export async function notifyBookingReminder(opts: {
  name: string;
  table: string;
  time: string;
}) {
  await showLocalNotification({
    title: 'Reminder: Your Table at Wings River Café ⏰',
    body: `Hi ${opts.name}! Don't forget — your table ${opts.table} is booked for ${opts.time} today. We're excited to see you! 🍽️`,
    type: 'booking_reminder',
    url: '/#floor-map',
  });
}

export async function notifyOrderReady(opts: {
  table: string;
  orderNumber: string;
}) {
  await showLocalNotification({
    title: 'Your Order is Ready! 🍽️',
    body: `Order ${opts.orderNumber} for Table ${opts.table} is ready and on its way to you!`,
    type: 'order_ready',
    url: '/',
  });
}

export async function notifyTableReady(tableNumber: string) {
  await showLocalNotification({
    title: 'Table Available Now! 🪑',
    body: `Table ${tableNumber} is now clean and ready for booking. Reserve it now before someone else does!`,
    type: 'table_ready',
    url: '/#floor-map',
  });
}

export async function notifyBookingCancelled(opts: {
  name: string;
  bookingId: string;
  refundEligible: boolean;
}) {
  await showLocalNotification({
    title: 'Booking Cancelled',
    body: opts.refundEligible
      ? `Hi ${opts.name}, booking #${opts.bookingId} has been cancelled. Your full refund will be processed within 3–5 business days.`
      : `Hi ${opts.name}, booking #${opts.bookingId} has been cancelled. No refund applicable as it was within the 5-hour window.`,
    type: 'cancellation',
    url: '/#floor-map',
  });
}

// ── Auto-init on import (register SW silently) ────────────────────────────────
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerServiceWorker();
}
