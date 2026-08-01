'use client';

import React, { useState, useEffect } from 'react';
import { getStoredHeroSettings, HeroSettings, DEFAULT_HERO_SETTINGS, DEFAULT_HERO_SLIDES } from '@/lib/db';
import { Calendar, Utensils, Anchor, ChevronDown, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
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
    <section id="home" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-dark-950 text-white pt-20">
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
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1200 ease-in-out ${
                  isActive
                    ? 'opacity-100 pointer-events-auto z-10'
                    : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                {/* Dynamic Tagline Badge */}
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#C9B086]/30 text-[#E8DCB8] text-xs font-semibold tracking-wide uppercase mb-3 shadow-lg">
                  <span>{slide.tag || heroSettings.badgeText}</span>
                </div>

                {/* Dynamic Main Heading */}
                <h1 className="font-serif font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-lg leading-tight mb-3 text-center">
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

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => onOpenBooking('table_booking')}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-[#C9B086] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs rounded-full shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Calendar className="w-4 h-4" />
            <span>Reserve Table</span>
          </button>

          <button
            onClick={() => onOpenBooking('birthday_party')}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-dark-950 font-bold text-xs rounded-full shadow-xl shadow-gold-500/25 hover:scale-105 transition-all duration-300"
          >
            <Utensils className="w-4 h-4" />
            <span>Book Party / Event</span>
          </button>

          <a
            href="#menu-card"
            className="flex items-center space-x-2 px-6 py-2.5 bg-dark-900/80 backdrop-blur-md border border-[#C9B086]/30 text-[#E8DCB8] font-semibold text-xs rounded-full hover:bg-dark-800 transition-all duration-300"
          >
            <Utensils className="w-4 h-4 text-[#C9B086]" />
            <span>View Menu</span>
          </a>
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
