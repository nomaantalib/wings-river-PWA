'use client';

import React from 'react';

export default function SEOStructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Wings River Café",
    "logo": "https://wings-river-cafe-blog.pages.dev/logo.png",
    "image": [
      "https://wings-river-cafe-blog.pages.dev/logo.png",
      "https://wings-river-cafe-blog.pages.dev/images/Screenshot_20260720-180544_Maps.png",
      "https://wings-river-cafe-blog.pages.dev/images/Screenshot_20260720-180609_Maps.png"
    ],
    "@id": "https://wings-river-cafe-blog.pages.dev/#restaurant",
    "url": "https://wings-river-cafe-blog.pages.dev",
    "telephone": "07310008020",
    "priceRange": "₹200 - ₹1000",
    "servesCuisine": [
      "Multicuisine",
      "North Indian",
      "Chinese",
      "Italian",
      "Pizza",
      "Coffee",
      "Desserts"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Laxman Mela Ground, Laxman Jhula Park, River Front, Kala Kankar Colony, Purana Haidarabad, Hazratganj",
      "addressLocality": "Lucknow",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "226001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.8679093,
      "longitude": 80.9501509
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "11:00",
        "closes": "23:59"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.1",
      "reviewCount": "500"
    },
    "sameAs": [
      "https://www.instagram.com/wingsriver",
      "https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
