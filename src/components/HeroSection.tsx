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



      {/* Main Hero Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center py-12">
        {/* Animated Circular Logo Badge */}
        <div className="mb-6 transform hover:rotate-6 transition-transform duration-700">
          <CircularLogo size={130} className="shadow-2xl shadow-mint-400/20" />
        </div>

        {/* Smooth Transitioning Hero Headlines & Subtitles for Each Slide */}
        <div className="relative w-full min-h-[220px] sm:min-h-[260px] flex items-center justify-center my-2">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id || idx}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
                  isActive
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto z-10'
                    : 'opacity-0 scale-95 -translate-y-4 pointer-events-none z-0'
                }`}
              >
                {/* Dynamic Tagline Badge */}
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-mint-300/30 text-mint-200 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>{slide.tag || heroSettings.badgeText}</span>
                </div>

                {/* Dynamic Main Heading */}
                <h1 className="font-serif font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-white drop-shadow-lg leading-tight mb-4 text-center">
                  {slide.title || heroSettings.mainHeadline}
                </h1>

                {/* Dynamic Subheading */}
                <p className="font-sans text-lg sm:text-2xl text-cream-100 font-light tracking-wide max-w-2xl drop-shadow-md text-center">
                  {slide.subtitle || heroSettings.subHeadline}
                </p>
              </div>
            );
          })}
        </div>

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

      {/* Realistic Animated Jet Ski Crossing Screen (Left to Right with Water Splash) */}
      <div className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none overflow-hidden h-28">
        <style>{`
          @keyframes jetskiMoveLeftToRight {
            0% { transform: translateX(-380px) translateY(0px) rotate(-2deg); }
            20% { transform: translateX(20vw) translateY(-8px) rotate(3deg); }
            40% { transform: translateX(45vw) translateY(4px) rotate(-1deg); }
            60% { transform: translateX(70vw) translateY(-10px) rotate(4deg); }
            80% { transform: translateX(95vw) translateY(2px) rotate(-1deg); }
            100% { transform: translateX(125vw) translateY(0px) rotate(-2deg); }
          }
        `}</style>
        <div
          className="absolute bottom-1 left-0 flex items-end"
          style={{
            animation: 'jetskiMoveLeftToRight 10s cubic-bezier(0.25, 0.1, 0.25, 1) infinite',
            willChange: 'transform'
          }}
        >
          {/* Water Splash Foam Spray behind Jet Ski (Trailing on the Left) */}
          <div className="relative -mr-3 mb-1 flex items-end space-x-1">
            {/* Heavy Spray Wave */}
            <div className="w-20 h-9 bg-gradient-to-r from-transparent via-cyan-200/80 to-white/95 rounded-full blur-[2px] animate-pulse transform skew-x-12" />
            {/* Frothy Bubbles */}
            <div className="w-7 h-7 rounded-full bg-white/90 blur-[1px] animate-ping" />
            <div className="w-5 h-5 rounded-full bg-cyan-100/90 blur-[1px] animate-bounce" />
            <div className="w-10 h-4 rounded-full bg-white/80 blur-[2px]" />
          </div>

          {/* Realistic Jet Ski Rider SVG & Graphic */}
          <div className="relative filter drop-shadow-[0_12px_12px_rgba(0,0,0,0.6)]">
            <svg className="w-28 h-20" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Spray arc under hull */}
              <path d="M 10 48 Q 40 58 85 46 Q 95 44 98 48 C 80 58 35 60 5 50 Z" fill="url(#splashGradHero)" opacity="0.95" />
              {/* Jet Ski Hull (Aerodynamic Water Sports Craft) */}
              <path d="M 5 45 L 35 45 L 75 42 L 95 38 L 88 46 L 30 48 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
              <path d="M 25 45 L 45 35 L 70 34 L 85 38 L 70 42 Z" fill="#111827" />
              {/* Seat & Steering Handlebars */}
              <path d="M 25 38 L 45 35 L 52 35 L 48 39 Z" fill="#EF4444" />
              <path d="M 55 35 L 62 25 L 64 25" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              {/* Rider (Helmet, Lifejacket & Torso) */}
              <circle cx="48" cy="18" r="6" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1.5" />
              <path d="M 44 24 L 56 26 L 58 35 L 42 35 Z" fill="#F97316" />
              <path d="M 54 26 L 62 25" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="splashGradHero" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            {/* Front Bow Water Crest */}
            <div className="absolute top-10 left-0 w-10 h-5 bg-white/90 rounded-full blur-[1px] animate-pulse transform -skew-y-12" />
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href="#about"
        aria-label="Scroll Down"
        className="absolute bottom-2 z-30 text-mint-200/80 animate-bounce flex flex-col items-center text-[10px] tracking-widest uppercase"
      >
        <span>Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </a>
    </section>
  );
}
