/**
 * Wings River Café - Firebase Cloud Messaging (FCM) & Web Push Integration
 */

export const FCM_CONFIG = {
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BB_D3Bo704xpIpSFlesjRGUCnDx8qx2fKV1dV4w3M_eArGEQ4E7MPI6r86uvMLdjLS8XoQS72eXf5a_36GBiNFk',
  messagingSenderId: process.env.NEXT_PUBLIC_FCM_SENDER_ID || '901662805305',
};

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Web Push Notifications are not supported in this browser.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('User denied push notification permission.');
      return null;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const keyArray = urlBase64ToUint8Array(FCM_CONFIG.vapidKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyArray as unknown as BufferSource,
        });
      }

      const token = JSON.stringify(subscription);
      localStorage.setItem('wings_fcm_token', token);
      return token;
    }
  } catch (e) {
    console.error('[FCM Web Push Permission Error]:', e);
  }

  return null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
