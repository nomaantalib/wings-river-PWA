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
    <section className="py-20 bg-[#0B0E14] text-white relative overflow-hidden border-t border-[#D4AF37]/15">
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 -left-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#141A24] border border-[#D4AF37]/35 text-[#F8E7A1] font-semibold text-[10px] tracking-widest uppercase mb-3 shadow-md">
              Why Choose Wings River Café
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Unrivaled Experience By The River
            </h2>
            <p className="font-sans text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl">
              Designed for unforgettable dining, festive events, and exhilarating waterfront leisure.
            </p>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-2xl bg-[#141A24] border border-[#D4AF37]/25 hover:border-[#D4AF37] text-slate-300 hover:text-amber-200 transition shadow-lg"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-2xl bg-[#141A24] border border-[#D4AF37]/25 hover:border-[#D4AF37] text-slate-300 hover:text-amber-200 transition shadow-lg"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Horizontal Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-5 overflow-x-auto pb-6 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {features.map((item, idx) => (
            <div
              key={idx}
              className="snap-start shrink-0 w-[270px] sm:w-[290px] bg-[#10141D]/80 backdrop-blur-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18202E] to-[#141A24] border border-[#D4AF37]/35 flex items-center justify-center text-[#F5D061] shadow-md">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-[#141A24] text-amber-200 border border-[#D4AF37]/30">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-white mb-2">
                  {item.title}
                </h3>

                <p className="font-sans text-xs text-slate-300 leading-relaxed line-clamp-3">
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
