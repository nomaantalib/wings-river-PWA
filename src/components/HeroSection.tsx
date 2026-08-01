'use client';

import React, { useState, useEffect } from 'react';
import { getStoredHeroSettings, HeroSettings, DEFAULT_HERO_SETTINGS, DEFAULT_HERO_SLIDES } from '@/lib/db';
import { Calendar, Utensils, Anchor, ChevronDown, Sparkles, ChevronRight, ChevronLeft, BookOpen, Ticket } from 'lucide-react';
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
      {/* Background Video — Playing ambient background loop */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
        >
          <source
            src="/videos/gemini_generated_video_5c810dd6.mp4"
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


        {/* CTA Button Group — Vertical Stack (One Below Another) filled with Golden Yellow */}
        <div className="w-full max-w-sm mx-auto px-4 mb-6">
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <a
              href="#floor-map"
              className="flex items-center justify-center space-x-2 px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#120B08] font-extrabold text-xs sm:text-xs rounded-xl sm:rounded-2xl shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 w-full max-w-[260px] sm:max-w-xs text-center"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Reserve Table</span>
            </a>

            <button
              onClick={() => onOpenBooking('birthday_party')}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#F8E7A1] via-[#F5D061] to-[#E5B82C] hover:from-[#FBF0BE] hover:to-[#F8E7A1] text-[#120B08] font-extrabold text-xs sm:text-xs rounded-xl sm:rounded-2xl shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 w-full max-w-[260px] sm:max-w-xs text-center"
            >
              <Utensils className="w-4 h-4 shrink-0" />
              <span>Book Party / Event</span>
            </button>

            <button
              onClick={() => onOpenMyBookings ? onOpenMyBookings() : onOpenBooking('table_booking')}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#120B08] font-extrabold text-xs sm:text-xs rounded-xl sm:rounded-2xl shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 w-full max-w-[260px] sm:max-w-xs text-center"
            >
              <Ticket className="w-4 h-4 text-[#120B08] shrink-0" />
              <span>My Reservations</span>
            </button>

            <a
              href="#menu-card"
              className="flex items-center justify-center space-x-2 px-5 py-2.5 sm:py-3 bg-[#121417]/90 backdrop-blur-md border border-[#F5D061]/50 text-[#F5D061] font-extrabold text-xs sm:text-xs rounded-xl sm:rounded-2xl hover:bg-[#1A1D24] hover:border-[#F5D061] hover:scale-[1.02] active:scale-95 transition-all duration-300 w-full max-w-[260px] sm:max-w-xs text-center shadow-lg"
            >
              <BookOpen className="w-4 h-4 text-[#F5D061] shrink-0" />
              <span>View Menu</span>
            </a>
          </div>
        </div>

        {/* Horizontal Auto-sliding Carousel for Info Highlights */}
        <div className="w-full max-w-xl mx-auto px-2 relative">
          <div
            ref={infoCarouselRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth snap-x snap-mandatory"
          >
            {[
              { title: 'Gomti River', sub: 'Scenic Waterfront', color: 'text-[#F8E7A1]' },
              { title: 'Multicuisine', sub: 'Indian • Chinese • Italian', color: 'text-[#98A886]' },
              { title: 'Speedboats', sub: 'Lucknow Water Sports', color: 'text-[#F5D061]' },
              { title: '11 AM – 12 AM', sub: `Open Daily · ${heroSettings.contactPhone || '07310008020'}`, color: 'text-[#98A886]' },
            ].map((card, idx) => (
              <div
                key={idx}
                className="snap-center shrink-0 min-w-[190px] sm:min-w-[210px] bg-[#121417]/80 backdrop-blur-md border border-[#F5D061]/25 px-3.5 py-2 rounded-xl text-center shadow-lg hover:border-[#F5D061]/60 transition-all"
              >
                <p className={`${card.color} font-serif font-bold text-xs sm:text-sm`}>{card.title}</p>
                <p className="text-[9px] sm:text-[10px] text-[#D4C4A0]/80 uppercase tracking-wider font-sans mt-0.5">{card.sub}</p>
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
