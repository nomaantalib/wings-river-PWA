export interface AppConfig {
  siteName: string;
  slogan: string;
  phone: string;
  whatsapp: string;
  mapsUrl: string;
  instagramUrl: string;
  apiBaseUrl: string;
  jwtSecret: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  features: {
    enableRealtime: boolean;
    enablePushNotifications: boolean;
    enablePosIntegration: boolean;
    enableRazorpay: boolean;
    enableCloudinary: boolean;
  };
}

export const CONFIG: AppConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Wings River Café',
  slogan: process.env.NEXT_PUBLIC_SLOGAN || 'Taste • Eat • Rides',
  phone: process.env.NEXT_PUBLIC_PHONE || '07310008020',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '917310008020',
  mapsUrl: process.env.NEXT_PUBLIC_MAPS_URL || 'https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA',
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/wingsriver',
  apiBaseUrl: typeof window !== 'undefined' ? '/api' : 'https://wings-river-pwa.pages.dev/api',
  jwtSecret: 'wings_river_cafe_jwt_secret_2026_super_secure',
  rateLimitMax: 2000,
  rateLimitWindowMs: 60000,
  features: {
    enableRealtime: true,
    enablePushNotifications: true,
    enablePosIntegration: true,
    enableRazorpay: true,
    enableCloudinary: true
  }
};
