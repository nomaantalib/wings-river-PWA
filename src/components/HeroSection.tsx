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
      {/* Background Slideshow with Smooth Cross-Fade & Scale Effects */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 pointer-events-auto z-0' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Blurred Background Backdrop Image */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-70 transition-transform duration-[8000ms] ease-out"
            style={{ backgroundImage: `url(${slide.image})` }}
          />

          {/* Sharp Foreground Focused Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80 transition-transform duration-[10000ms] ease-out scale-105"
            style={{ backgroundImage: `url(${slide.image})` }}
          />

          {/* Overlay Gradient (Dark vignette + Mint glow) */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-dark-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-transparent to-dark-950/80" />
        </div>
      ))}

      {/* Floating Leaves & Sparkles Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-1/4 left-10 text-mint-300/30 animate-float text-3xl">🍃</div>
        <div className="absolute top-1/3 right-12 text-gold-400/30 animate-float text-2xl" style={{ animationDelay: '1.5s' }}>✨</div>
        <div className="absolute bottom-1/4 left-1/5 text-mint-400/30 animate-float text-xl" style={{ animationDelay: '2.5s' }}>🍃</div>
        <div className="absolute top-2/3 right-1/4 text-gold-300/20 animate-float text-3xl" style={{ animationDelay: '3.5s' }}>🌟</div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center py-12">
        {/* Animated Circular Logo Badge */}
        <div className="mb-6 transform hover:rotate-6 transition-transform duration-700">
          <CircularLogo size={130} className="shadow-2xl shadow-mint-400/20" />
        </div>

        {/* Dynamic Tagline Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-mint-300/30 text-mint-200 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>{activeSlide.tag || heroSettings.badgeText}</span>
        </div>

        {/* Dynamic Main Heading */}
        <h1 className="font-serif font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-white drop-shadow-lg leading-tight mb-4 transition-all duration-700">
          {activeSlide.title || heroSettings.mainHeadline}
        </h1>

        {/* Dynamic Subheading */}
        <p className="font-sans text-lg sm:text-2xl text-cream-100 font-light tracking-wide max-w-2xl mb-8 drop-shadow-md transition-all duration-700">
          {activeSlide.subtitle || heroSettings.subHeadline}
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            onClick={() => onOpenBooking('table_booking')}
            className="flex items-center space-x-2 px-7 py-3.5 bg-gradient-to-r from-mint-300 via-mint-400 to-mint-500 text-dark-950 font-bold text-sm rounded-full shadow-xl shadow-mint-400/25 hover:scale-105 transition-all duration-300"
          >
            <Calendar className="w-4 h-4" />
            <span>Reserve Table</span>
          </button>

          <button
            onClick={() => onOpenBooking('birthday_party')}
            className="flex items-center space-x-2 px-7 py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 text-dark-950 font-bold text-sm rounded-full shadow-xl shadow-gold-500/25 hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book Party / Event</span>
          </button>

          <button
            onClick={() => onOpenBooking('speedboat_ride')}
            className="flex items-center space-x-2 px-7 py-3.5 bg-white/15 backdrop-blur-md hover:bg-white/25 border border-white/30 text-white font-bold text-sm rounded-full shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Anchor className="w-4 h-4 text-mint-300" />
            <span>Speedboat Rides</span>
          </button>

          <a
            href="#menu-card"
            className="flex items-center space-x-2 px-7 py-3.5 bg-dark-900/80 backdrop-blur-md border border-mint-400/40 text-cream-100 font-semibold text-sm rounded-full hover:bg-dark-800 transition-all duration-300"
          >
            <Utensils className="w-4 h-4 text-gold-400" />
            <span>View Menu</span>
          </a>
        </div>

        {/* Glassmorphism Info Overlay Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center">
            <p className="text-gold-400 font-serif font-bold text-lg">Gomti River</p>
            <p className="text-[11px] text-cream-200 uppercase tracking-wider">Scenic Waterfront</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center">
            <p className="text-mint-300 font-serif font-bold text-lg">Multicuisine</p>
            <p className="text-[11px] text-cream-200 uppercase tracking-wider">Indian • Chinese • Italian</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center">
            <p className="text-gold-400 font-serif font-bold text-lg">Speedboats</p>
            <p className="text-[11px] text-cream-200 uppercase tracking-wider">Lucknow Water Sports</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center">
            <p className="text-mint-300 font-serif font-bold text-lg">11 AM – 12 AM</p>
            <p className="text-[11px] text-cream-200 uppercase tracking-wider">Open Daily · {heroSettings.contactPhone || '07310008020'}</p>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 z-30 p-3 rounded-full bg-dark-900/60 backdrop-blur-md border border-white/20 text-white hover:bg-gold-500 hover:text-dark-950 transition-all hidden sm:block shadow-xl hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 z-30 p-3 rounded-full bg-dark-900/60 backdrop-blur-md border border-white/20 text-white hover:bg-gold-500 hover:text-dark-950 transition-all hidden sm:block shadow-xl hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slideshow Indicator Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 z-30 flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-3 rounded-full transition-all duration-500 ${
                idx === currentSlide ? 'bg-gold-400 w-8' : 'bg-white/40 hover:bg-white/80 w-3'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll Down Indicator */}
      <a
        href="#about"
        aria-label="Scroll Down"
        className="absolute bottom-2 z-20 text-mint-200/80 animate-bounce flex flex-col items-center text-[10px] tracking-widest uppercase"
      >
        <span>Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </a>
    </section>
  );
}
