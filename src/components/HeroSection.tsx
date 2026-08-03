'use client';

import React, { useState, useEffect } from 'react';
import { getStoredHeroSettings, HeroSettings, DEFAULT_HERO_SETTINGS, DEFAULT_HERO_SLIDES } from '@/lib/db';
import { Calendar, Utensils, Anchor, ChevronDown, Zap, ChevronRight, ChevronLeft, BookOpen, Ticket } from 'lucide-react';
import CircularLogo from './CircularLogo';

interface HeroSectionProps {
  onOpenBooking: (type?: string) => void;
  onOpenMyBookings?: () => void;
}

export default function HeroSection({ onOpenBooking, onOpenMyBookings }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);

  useEffect(() => {
    let isSubscribed = true;
    getStoredHeroSettings().then((data: HeroSettings) => {
      if (isSubscribed && data) setHeroSettings(data);
    });

    const handleSync = async () => {
      const updated = await getStoredHeroSettings();
      if (isSubscribed && updated) setHeroSettings(updated);
    };

    window.addEventListener('wings_db_sync', handleSync);
    return () => {
      isSubscribed = false;
      window.removeEventListener('wings_db_sync', handleSync);
    };
  }, []);

  const slides = heroSettings.slides && heroSettings.slides.length > 0 ? heroSettings.slides : DEFAULT_HERO_SLIDES;

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [slides]);

  const infoCarouselRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = infoCarouselRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 210, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-dark-950 text-white pt-14">
      {/* Background Video — Both videos playing in continuation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
          onEnded={(e) => {
            const vid = e.currentTarget;
            // Alternate between the two videos by swapping src
            const current = vid.src.includes('d2d858f7') ? 'd2d858f7' : '5c810dd6';
            const nextSrc = current === 'd2d858f7'
              ? '/videos/gemini_generated_video_5c810dd6.mp4'
              : '/videos/gemini_generated_video_d2d858f7.mp4';
            vid.src = nextSrc;
            vid.play().catch(() => {});
          }}
        >
          <source
            src="/videos/gemini_generated_video_d2d858f7.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay Gradients for Luxury Waterfront Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-950/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-transparent to-dark-950/90" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center py-10">
        {/* Animated Circular Logo Badge */}
        <div className="mb-4 transform hover:rotate-6 transition-transform duration-700">
          <CircularLogo size={110} className="shadow-2xl shadow-mint-400/20" />
        </div>

        {/* Soft Fading Hero Headline & Subtitle */}
        <div className="relative w-full min-h-[180px] sm:min-h-[210px] flex items-center justify-center my-2">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
                  isActive
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto z-10'
                    : 'opacity-0 scale-95 translate-y-2 pointer-events-none z-0'
                }`}
              >
                {/* Dynamic Tagline Badge */}
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#C9B086]/30 text-[#E8DCB8] text-xs font-semibold tracking-wide uppercase mb-3 shadow-lg">
                  <span>{slide.tag || heroSettings.badgeText}</span>
                </div>

                {/* Dynamic Main Heading */}
                <h1 className="font-serif font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-tight mb-3 text-center">
                  {slide.title || heroSettings.mainHeadline}
                </h1>

                {/* Dynamic Subheading */}
                <p className="font-sans text-sm sm:text-lg text-[#D4C4A0] font-light tracking-wide max-w-xl drop-shadow-md text-center">
                  {slide.subtitle || heroSettings.subHeadline}
                </p>
              </div>
            );
          })}
        </div>


        {/* CTA Button Group — Cohesive Luxury Champagne Stack */}
        <div className="w-full max-w-sm mx-auto px-4 mb-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <a
              href="#floor-map"
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#0B0E14] font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full max-w-[280px] sm:max-w-xs text-center border border-amber-300/30"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Reserve Table</span>
            </a>

            <button
              onClick={() => onOpenBooking('birthday_party')}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#141A24]/85 backdrop-blur-xl border border-[#D4AF37]/40 text-[#F8E7A1] font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:border-[#D4AF37] hover:bg-[#1C2433] hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full max-w-[280px] sm:max-w-xs text-center"
            >
              <Utensils className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Book Party / Event</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5 w-full max-w-[280px] sm:max-w-xs">
              <button
                onClick={() => onOpenMyBookings ? onOpenMyBookings() : onOpenBooking('table_booking')}
                className="flex items-center justify-center space-x-1.5 px-3 py-3 bg-[#141A24]/75 backdrop-blur-md border border-white/10 text-slate-200 font-semibold text-xs rounded-xl hover:border-[#D4AF37]/50 hover:text-amber-200 transition-all text-center"
              >
                <Ticket className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="truncate">My Bookings</span>
              </button>

              <a
                href="#menu-card"
                className="flex items-center justify-center space-x-1.5 px-3 py-3 bg-[#141A24]/75 backdrop-blur-md border border-white/10 text-slate-200 font-semibold text-xs rounded-xl hover:border-[#D4AF37]/50 hover:text-amber-200 transition-all text-center"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="truncate">View Menu</span>
              </a>
            </div>
          </div>
        </div>

        {/* Horizontal Auto-sliding Carousel for Info Highlights */}
        <div className="w-full max-w-[540px] mx-auto px-2 relative group">
          {/* Faded Left & Right Corner Edges overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0B0E14] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0B0E14] to-transparent z-20 pointer-events-none" />

          <div
            ref={infoCarouselRef}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-3 scroll-smooth snap-x snap-mandatory"
          >
            {[
              { title: 'Gomti River', sub: 'Scenic Waterfront', color: 'text-[#F8E7A1]' },
              { title: 'Multicuisine', sub: 'Indian • Chinese • Italian', color: 'text-emerald-300' },
              { title: 'Speedboats', sub: 'Lucknow Water Sports', color: 'text-[#F5D061]' },
              { title: '11 AM – 12 AM', sub: `Open Daily · ${heroSettings.contactPhone || '07310008020'}`, color: 'text-emerald-300' },
            ].map((card, idx) => (
              <div
                key={idx}
                className="snap-center shrink-0 w-[148px] sm:w-[184px] bg-[#10141D]/80 backdrop-blur-xl border border-[#D4AF37]/20 px-3.5 py-2.5 rounded-2xl text-center shadow-lg hover:border-[#D4AF37]/50 hover:-translate-y-0.5 transition-all duration-300"
              >
                <p className={`${card.color} font-serif font-bold text-xs sm:text-sm truncate`}>{card.title}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-sans tracking-wide mt-0.5 truncate">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href="#about"
        aria-label="Scroll Down"
        className="absolute bottom-3 z-30 text-[#D4C4A0]/80 animate-bounce flex flex-col items-center text-[10px] tracking-widest uppercase"
      >
        <span>Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </a>
    </section>

  );
}
