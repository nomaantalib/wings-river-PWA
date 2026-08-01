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
      {/* Background Video & Slideshow Carousel with Dark Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          key={currentSlide % 2 === 0 ? '/videos/gemini_generated_video_5c810dd6.mp4' : '/videos/gemini_generated_video_d2d858f7.mp4'}
          className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-110 transition-opacity duration-1000"
        >
          <source
            src={currentSlide % 2 === 0 ? '/videos/gemini_generated_video_5c810dd6.mp4' : '/videos/gemini_generated_video_d2d858f7.mp4'}
            type="video/mp4"
          />
        </video>

        {/* Overlay Gradients for Luxury Waterfront Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-dark-950/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-transparent to-dark-950/90" />
      </div>




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
            <Utensils className="w-4 h-4" />
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
