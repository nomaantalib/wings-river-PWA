// Wings River Café — Service Worker v3
// Handles: Offline Cache + Web Push Notifications (Booking, Orders, Table Ready, Reminders)

const CACHE_NAME = 'wings-river-v3';
const VAPID_PUBLIC_KEY = 'BB_D3Bo704xpIpSFlesjRGUCnDx8qx2fKV1dV4w3M_eArGEQ4E7MPI6r86uvMLdjLS8XoQS72eXf5a_36GBiNFk';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
];

// ── INSTALL: Cache static assets ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: Remove old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((c) => c !== CACHE_NAME && caches.delete(c)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Network-first with cache fallback ──────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((cached) =>
        cached || (event.request.headers.get('accept')?.includes('text/html') ? caches.match('/') : null)
      ))
  );
});

// ── NOTIFICATION ICON MAP per type ────────────────────────────────────────────
function getNotificationConfig(type) {
  switch (type) {
    case 'booking_confirmed':
      return {
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'booking-confirmed',
        requireInteraction: true,
        actions: [
          { action: 'view_booking', title: 'View Booking' },
          { action: 'whatsapp', title: 'WhatsApp Us' },
        ],
        vibrate: [300, 100, 300, 100, 300],
      };
    case 'booking_reminder':
      return {
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'booking-reminder',
        requireInteraction: true,
        actions: [
          { action: 'view_booking', title: 'View Details' },
          { action: 'directions', title: 'Get Directions' },
        ],
        vibrate: [200, 100, 200],
      };
    case 'order_ready':
      return {
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'order-ready',
        requireInteraction: true,
        actions: [
          { action: 'acknowledge', title: 'Acknowledge' },
        ],
        vibrate: [400, 100, 400],
      };
    case 'table_ready':
      return {
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'table-ready',
        requireInteraction: true,
        actions: [
          { action: 'view_map', title: 'Reserve Now' },
        ],
        vibrate: [300, 100, 300],
      };
    case 'cancellation':
      return {
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'cancellation',
        requireInteraction: false,
        actions: [
          { action: 'rebook', title: 'Book Again' },
        ],
        vibrate: [100, 100, 100],
      };
    default:
      return {
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'wings-general',
        requireInteraction: false,
        actions: [],
        vibrate: [200, 100, 200],
      };
  }
}

// ── PUSH EVENT: Show rich notification ────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Wings River Café',
    body: 'You have a new update from Wings River Café!',
    type: 'general',
    url: '/',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const config = getNotificationConfig(payload.type);

  const options = {
    body: payload.body,
    icon: config.icon,
    badge: config.badge,
    tag: config.tag,
    requireInteraction: config.requireInteraction,
    actions: config.actions,
    vibrate: config.vibrate,
    timestamp: Date.now(),
    data: {
      url: payload.url || '/',
      type: payload.type,
      bookingId: payload.bookingId || null,
    },
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// ── NOTIFICATION CLICK: Handle action buttons ─────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { url, type, bookingId } = event.notification.data || {};
  const action = event.action;

  let targetUrl = url || '/';

  if (action === 'view_booking' || action === 'acknowledge') {
    targetUrl = '/#floor-map';
  } else if (action === 'whatsapp') {
    targetUrl = 'https://wa.me/917310008020?text=Hi%2C%20I%20have%20a%20question%20about%20my%20booking%20at%20Wings%20River%20Caf%C3%A9.';
  } else if (action === 'directions') {
    targetUrl = 'https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA';
  } else if (action === 'view_map') {
    targetUrl = '/#floor-map';
  } else if (action === 'rebook') {
    targetUrl = '/#floor-map';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ── PUSH SUBSCRIPTION CHANGE: Re-subscribe if needed ─────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    }).then((subscription) => {
      return fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });
    })
  );
});
