'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';

export default function FeaturesSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto sliding carousel loop
  useEffect(() => {
    let timer: any;
    if (!isPaused) {
      timer = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 20) {
            // Loop back seamlessly to start
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
          }
        }
      }, 3200);
    }
    return () => clearInterval(timer);
  }, [isPaused]);

  const features = [
    {
      icon: Waves,
      badge: 'Panoramic',
      title: 'Riverside View',
      desc: 'Unobstructed scenic waterfront vistas along the quiet Gomti River deck.',
    },
    {
      icon: Users,
      badge: 'Family Friendly',
      title: 'Family Restaurant',
      desc: 'Spacious seating setups tailored for family dinners, reunions & celebrations.',
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
      title: 'Dine In & Deck',
      desc: 'Elevated indoor AC fine dining and outdoor river deck dining options.',
    },
    {
      icon: ChefHat,
      badge: 'Chef Specials',
      title: 'Multicuisine',
      desc: 'North Indian gravies, authentic Chinese woks, Italian pastas & woodfired pizzas.',
    },
  ];

  return (
    <section className="py-16 bg-[#090C12] text-white relative overflow-hidden border-t border-[#D4AF37]/20">
      {/* Background Soft Gold & Warm Beige Ambient Glow */}
      <div className="absolute top-1/2 -left-20 w-96 h-96 bg-[#D4AF37]/15 rounded-full filter blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F5D061]/10 rounded-full filter blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-9 gap-4">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#FAF4E6]/10 border border-[#D4AF37]/40 text-[#F5D061] font-bold text-[11px] tracking-widest uppercase mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Why Choose Wings River Café</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F8E7A1]">
              Unrivaled Experience By The River
            </h2>
            <p className="font-sans text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl">
              Designed for unforgettable dining, festive events, and exhilarating waterfront leisure.
            </p>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-xl bg-[#141A24] border border-[#D4AF37]/40 hover:bg-[#F5D061] hover:text-[#0B0E14] text-amber-200 transition shadow-lg hover:scale-105 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-xl bg-[#141A24] border border-[#D4AF37]/40 hover:bg-[#F5D061] hover:text-[#0B0E14] text-amber-200 transition shadow-lg hover:scale-105 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auto-Sliding Horizontal Cards Carousel */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex space-x-5 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {features.map((item, idx) => (
            <div
              key={idx}
              className="snap-start shrink-0 w-[270px] sm:w-[295px] bg-gradient-to-b from-[#FDFBF7] via-[#FAF5EB] to-[#F7EFE1] border-2 border-[#E2CF9D] hover:border-[#D4AF37] rounded-3xl p-5 transition-all duration-300 hover:-translate-y-2 shadow-xl shadow-amber-950/20 hover:shadow-2xl hover:shadow-[#D4AF37]/25 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#F4E4BC] border border-[#D4AF37]/50 flex items-center justify-center text-[#855B00] shadow-sm group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-[#EBD8A7] text-[#5C3F00] border border-[#D4AF37]/40 shadow-xs">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-serif font-extrabold text-lg text-slate-900 mb-1.5 group-hover:text-[#855B00] transition-colors">
                  {item.title}
                </h3>

                <p className="font-sans text-xs text-slate-700 leading-relaxed line-clamp-3 font-medium">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8DAB7] flex items-center justify-between text-[11px] font-bold text-[#855B00]">
                <span>Wings River Premium</span>
                <span>★ ★ ★ ★ ★</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
