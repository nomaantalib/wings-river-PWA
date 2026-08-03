import type { Metadata, Viewport } from 'next';
import './globals.css';
import SEOStructuredData from '@/components/SEOStructuredData';
import BackgroundVideo from '@/components/BackgroundVideo';

export const viewport: Viewport = {
  themeColor: '#0B0E14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Wings River Café | Riverside Restaurant & Water Sports Lucknow',
  description: "Wings River Café — Lucknow's premier waterfront family restaurant at Laxman Mela Ground. Gourmet multicuisine dining, birthday party canopies, river sunset dining & Lucknow Water Sports speedboat rides. Call 07310008020.",
  keywords: [
    'Wings River Cafe Lucknow',
    'Lucknow Water Sports',
    'Riverside Cafe Lucknow',
    'Family Restaurant Hazratganj',
    'Laxman Mela Ground Cafe',
    'Speedboat Rides Gomti River',
    'Birthday Party Venue Lucknow',
    'Multicuisine Restaurant Lucknow',
    'Jetski Lucknow',
    'Café near Gomti River'
  ],
  authors: [{ name: 'Wings River Café' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Wings River Café | Taste • Eat • Rides',
    description: 'Luxury waterfront restaurant, birthday party canopy & speedboat rides along Gomti River, Lucknow.',
    url: 'https://wings-river-cafe-blog.pages.dev',
    siteName: 'Wings River Café',
    images: [{ url: 'https://wings-river-cafe-blog.pages.dev/logo.png', width: 512, height: 512, alt: 'Wings River Café Logo' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wings River Café Lucknow',
    description: 'Taste • Eat • Rides at Laxman Jhula Park, Gomti Riverfront Lucknow.',
    images: ['https://wings-river-cafe-blog.pages.dev/logo.png'],
  },
  robots: { index: true, follow: true },
};

import { AuthProvider } from '@/context/AuthContext';
import RouteScrollRestorer from '@/components/RouteScrollRestorer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Favicon — Wings River Cafe Logo */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Wings River" />
        {/* 
          PWA Install Prompt:
          We do NOT call e.preventDefault() here any more.
          We just stash the event so the React hook (PWAController) 
          can call e.preventDefault() + e.prompt() cleanly on user tap.
        */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('beforeinstallprompt', function(e) {
              window.deferredInstallPrompt = e;
              if (typeof window.onBeforeInstallPromptReady === 'function') {
                window.onBeforeInstallPromptReady(e);
              }
            });
            window.addEventListener('error', function(e) {
              var msg = e.message || '';
              var target = e.target || {};
              var src = target.src || '';
              if (msg.indexOf('ChunkLoadError') !== -1 || msg.indexOf('Loading chunk') !== -1 || (target.tagName === 'SCRIPT' && src.indexOf('_next/static/chunks/') !== -1)) {
                console.warn('Chunk load failure detected. Reloading page...', src);
                window.location.reload();
              }
            }, true);
          `
        }} />

        {/* Google Fonts — Playfair Display + Lato (café feel) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,600&family=Lato:wght@300;400;700;900&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-amber-300 selection:text-amber-950 text-slate-100 relative min-h-screen" style={{ fontFamily: "'Lato', sans-serif", background: '#070a0f' }}>
        <AuthProvider>
          <RouteScrollRestorer />
          {/* Fixed App-Wide Dual Background Video Backdrop */}
          <BackgroundVideo />
          <SEOStructuredData />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
