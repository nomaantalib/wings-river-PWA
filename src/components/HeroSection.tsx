'use client';

import React, { useState, useEffect } from 'react';
import { getStoredHeroSettings, HeroSettings, DEFAULT_HERO_SETTINGS, DEFAULT_HERO_SLIDES } from '@/lib/db';
import { Calendar, Utensils, Anchor, ChevronDown, Sparkles, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import CircularLogo from './CircularLogo';

interface HeroSectionProps {
  onOpenBooking: (type?: string) => void;
}

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const activeSlide = slides[currentSlide] || slides[0];

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


        {/* CTA Button Group — Increased size, equal width, responsive grid */}
        <div className="w-full max-w-2xl mx-auto px-2 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 justify-items-stretch">
            <a
              href="#floor-map"
              className="flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#120B08] font-extrabold text-sm sm:text-base rounded-2xl shadow-2xl shadow-yellow-500/25 hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full text-center"
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Reserve Table</span>
            </a>

            <button
              onClick={() => onOpenBooking('birthday_party')}
              className="flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-gradient-to-r from-[#F8E7A1] via-[#F5D061] to-[#E5B82C] hover:from-[#FBF0BE] hover:to-[#F8E7A1] text-[#120B08] font-extrabold text-sm sm:text-base rounded-2xl shadow-2xl shadow-yellow-500/25 hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full text-center"
            >
              <Utensils className="w-5 h-5 shrink-0" />
              <span>Book Party / Event</span>
            </button>

            <a
              href="#menu-card"
              className="col-span-1 sm:col-span-2 md:col-span-1 flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-[#121417]/90 backdrop-blur-md border border-[#F5D061]/50 text-[#F5D061] font-bold text-sm sm:text-base rounded-2xl hover:bg-[#1A1D24] hover:border-[#F5D061] hover:scale-[1.03] active:scale-95 transition-all duration-300 w-full text-center shadow-lg"
            >
              <BookOpen className="w-5 h-5 text-[#F5D061] shrink-0" />
              <span>View Menu</span>
            </a>
          </div>
        </div>

        {/* Compact & Shortened Glassmorphism Info Overlay Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-3xl">
          <div className="bg-[#121417]/80 backdrop-blur-md border border-[#C9B086]/25 px-2.5 py-2 rounded-xl text-center shadow-md">
            <p className="text-[#E8DCB8] font-serif font-bold text-xs sm:text-sm">Gomti River</p>
            <p className="text-[9px] sm:text-[10px] text-[#D4C4A0]/80 uppercase tracking-wider">Scenic Waterfront</p>
          </div>
          <div className="bg-[#121417]/80 backdrop-blur-md border border-[#C9B086]/25 px-2.5 py-2 rounded-xl text-center shadow-md">
            <p className="text-[#98A886] font-serif font-bold text-xs sm:text-sm">Multicuisine</p>
            <p className="text-[9px] sm:text-[10px] text-[#D4C4A0]/80 uppercase tracking-wider">Indian • Chinese • Italian</p>
          </div>
          <div className="bg-[#121417]/80 backdrop-blur-md border border-[#C9B086]/25 px-2.5 py-2 rounded-xl text-center shadow-md">
            <p className="text-[#E8DCB8] font-serif font-bold text-xs sm:text-sm">Speedboats</p>
            <p className="text-[9px] sm:text-[10px] text-[#D4C4A0]/80 uppercase tracking-wider">Lucknow Water Sports</p>
          </div>
          <div className="bg-[#121417]/80 backdrop-blur-md border border-[#C9B086]/25 px-2.5 py-2 rounded-xl text-center shadow-md">
            <p className="text-[#98A886] font-serif font-bold text-xs sm:text-sm">11 AM – 12 AM</p>
            <p className="text-[9px] sm:text-[10px] text-[#D4C4A0]/80 uppercase tracking-wider">Open Daily · {heroSettings.contactPhone || '07310008020'}</p>
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
