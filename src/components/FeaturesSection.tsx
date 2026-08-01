'use client';

import React, { useRef } from 'react';
import {
  Users,
  Waves,
  Anchor,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  ChefHat,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function FeaturesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: Users,
      badge: 'Family Friendly',
      title: 'Family Restaurant',
      desc: 'Spacious seating setups tailored for family dinners, reunions & kids.',
    },
    {
      icon: Waves,
      badge: 'Panoramic',
      title: 'Riverside View',
      desc: 'Unobstructed scenic waterfront vistas along the quiet Gomti River.',
    },
    {
      icon: Anchor,
      badge: 'Water Sports',
      title: 'Speedboat Rides',
      desc: 'Official Lucknow Water Sports jet boating and speedboat rides at our private dock.',
    },
    {
      icon: UtensilsCrossed,
      badge: 'Luxury Comfort',
      title: 'Dine In',
      desc: 'Elevated indoor AC fine dining and outdoor river deck dining options.',
    },
    {
      icon: ShoppingBag,
      badge: 'Express Service',
      title: 'Takeaway',
      desc: 'Quick, hygienic packing for your favorite meals on the go.',
    },
    {
      icon: Truck,
      badge: 'Safe & Clean',
      title: 'No Contact Delivery',
      desc: 'Fresh, piping hot multicuisine delivered right to your doorstep.',
    },
    {
      icon: ChefHat,
      badge: 'Chef Specials',
      title: 'Multicuisine',
      desc: 'North Indian gravies, authentic Chinese woks, Italian pastas & woodfired pizzas.',
    },
    {
      icon: Sun,
      badge: 'Fresh Breeze',
      title: 'Outdoor Seating',
      desc: 'Breeze outdoor terrace tables under green ceiling foliage & floral arches.',
    },
    {
      icon: Moon,
      badge: 'Magical Nights',
      title: 'Evening Ambience',
      desc: 'Illuminated fairy light arches, cozy bonfire setups & romantic night decor.',
    },
  ];

  return (
    <section className="py-16 bg-dark-950 text-white relative overflow-hidden border-t border-dark-800/80">
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-[11px] tracking-widest uppercase mb-2">
              Why Choose Wings River Café
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-amber-100">
              Unrivaled Experience By The River
            </h2>
            <p className="font-sans text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Designed for unforgettable dining, festive events, and exhilarating waterfront leisure.
            </p>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-xl bg-dark-900 border border-dark-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition shadow"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-xl bg-dark-900 border border-dark-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition shadow"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Horizontal Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {features.map((item, idx) => (
            <div
              key={idx}
              className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-dark-900/90 border border-dark-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-dark-950 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-amber-100 mb-1">
                  {item.title}
                </h3>

                <p className="font-sans text-xs text-slate-300 leading-snug line-clamp-3">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
