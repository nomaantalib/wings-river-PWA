import type { Metadata } from 'next';
import './globals.css';
import SEOStructuredData from '@/components/SEOStructuredData';

export const metadata: Metadata = {
  title: 'Wings River Café | Premium Riverside Restaurant & Water Sports in Lucknow',
  description: 'Wings River Café is Lucknow’s premier waterfront family restaurant at Laxman Mela Ground. Enjoy gourmet multicuisine food, birthday party canopies, scenic river sunset dining & Lucknow Water Sports speedboat rides. Call 07310008020.',
  keywords: [
    'Wings River Cafe',
    'Wings River Lucknow',
    'Lucknow Water Sports',
    'Riverside Cafe Lucknow',
    'Family Restaurant Hazratganj',
    'Purana Haidarabad Cafe',
    'Laxman Mela Ground Cafe',
    'Speedboat Rides Gomti River',
    'Birthday Party Venue Lucknow',
    'Multicuisine Restaurant Lucknow'
  ],
  authors: [{ name: 'Wings River Café' }],
  openGraph: {
    title: 'Wings River Café | Taste • Eat • Rides',
    description: 'Luxury waterfront restaurant, birthday party canopy & speedboat rides along Gomti River, Lucknow.',
    url: 'https://wings-river-cafe-blog.pages.dev',
    siteName: 'Wings River Café',
    images: [
      {
        url: 'https://wings-river-cafe-blog.pages.dev/logo.png',
        width: 1200,
        height: 630,
        alt: 'Wings River Café - Taste, Eat & Rides Multicuisine Logo'
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wings River Café Lucknow',
    description: 'Taste • Eat • Rides at Laxman Jhula Park, Gomti Riverfront Lucknow.',
    images: ['https://wings-river-cafe-blog.pages.dev/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8FD3C7" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Wings River" />
      </head>
      <body className="bg-dark-950 text-dark-900 antialiased selection:bg-mint-300 selection:text-dark-950">
        <SEOStructuredData />
        {children}
      </body>
    </html>
  );
}
