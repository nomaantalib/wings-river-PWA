// Firebase Cloud Messaging & Web Push Notifications Helper for Realtime Booking Updates

export function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve(false);
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }

  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then(permission => {
      return permission === 'granted';
    });
  }

  return Promise.resolve(false);
}

export function sendLocalWebNotification(title: string, body: string, icon: string = '/images/wings-logo.png') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: 'wings-booking-update',
      });
    } catch (err) {
      console.warn('[Push Notification] Failed to trigger notification:', err);
    }
  }
}

// Subscribe to real-time database sync events to trigger browser push notifications for booking updates
export function initRealtimeBookingNotifier() {
  if (typeof window === 'undefined') return;

  requestNotificationPermission();

  window.addEventListener('wings_db_sync', (event: any) => {
    const detail = event.detail;
    if (detail && detail.type === 'reservation_update') {
      sendLocalWebNotification(
        'Wings River Café • Reservation Update',
        `Your reservation status for Table ${detail.table_number || ''} is now ${detail.status?.toUpperCase()}`
      );
    }
  });
}
