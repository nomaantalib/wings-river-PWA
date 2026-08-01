'use client';

import React, { useState, useEffect } from 'react';
import { getStoredGalleryItems, GalleryItem, INITIAL_GALLERY } from '@/lib/db';
import { X, ZoomIn, Camera, Play, Pause, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const GALLERY_CATEGORIES = [
  'All',
  'Restaurant',
  'River View',
  'Evening',
  'Outdoor Seating',
  'Water Sports',
  'Food'
];

export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [selectedCat, setSelectedCat] = useState('All');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  // Carousel States
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const refreshData = () => { getStoredGalleryItems().then(setItems); };
    refreshData();
    window.addEventListener('wings_db_sync', refreshData);
    return () => window.removeEventListener('wings_db_sync', refreshData);
  }, []);

  const displayItems = items && items.length > 0 ? items : INITIAL_GALLERY;

  const filteredItems = displayItems.filter(
    (item) => selectedCat === 'All' || item.category === selectedCat
  );

  // Auto-play interval for Auto Slideshow (every 3.5s)
  useEffect(() => {
    if (!isPlaying || filteredItems.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPlaying, filteredItems.length]);

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
  };

  return (
    <section id="gallery" className="py-16 bg-dark-950/80 text-white relative overflow-hidden border-t border-dark-800/80">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-[11px] tracking-widest uppercase mb-3">
            Lucknow Water Sports &amp; Café
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-amber-100 tracking-tight mb-3">
            Laxman Mela Ground Waterfront
          </h2>
          <p className="font-sans text-slate-300 text-xs sm:text-sm leading-relaxed">
            Gomti Riverfront Deck &amp; Speedboat Dock • Evening Party Canopy at Wings River Cafe • Fairy Light Celebration Canopy • Premium Multicuisine &amp; Waterfront Haven
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCat(cat);
                setCarouselIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                selectedCat === cat
                  ? 'bg-amber-500 text-dark-950 shadow-md font-bold'
                  : 'bg-dark-900 text-slate-300 border border-dark-700 hover:border-amber-500/40 hover:text-amber-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Auto Animated Carousel Showcase */}
        {filteredItems.length > 0 && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div
              className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-dark-900 group h-[360px] sm:h-[450px] lg:h-[500px] max-h-[75vh] flex flex-col justify-between"
              onMouseEnter={() => setIsPlaying(false)}
              onMouseLeave={() => setIsPlaying(true)}
              onTouchStart={(e) => {
                const touchDown = e.touches[0].clientX;
                (window as any)._touchX = touchDown;
              }}
              onTouchEnd={(e) => {
                const touchUp = e.changedTouches[0].clientX;
                const touchDown = (window as any)._touchX || 0;
                if (touchDown - touchUp > 50) handleNextSlide();
                if (touchUp - touchDown > 50) handlePrevSlide();
              }}
            >
              {/* Sliding Blurred Backdrop */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {filteredItems.map((item, idx) => (
                  <div
                    key={`bg-${item.id}`}
                    className={`absolute inset-0 bg-cover bg-center filter blur-2xl transition-opacity duration-700 ${
                      idx === carouselIndex ? 'opacity-50 scale-110' : 'opacity-0 scale-100'
                    }`}
                    style={{ backgroundImage: `url(${item.image_url})` }}
                  />
                ))}
              </div>

              {/* Main Slides Track (Cross-fade) */}
              <div className="relative w-full h-full z-10">
                {filteredItems.map((item, idx) => {
                  const isActive = idx === carouselIndex;
                  return (
                    <div
                      key={item.id}
                      className={`absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden transition-all duration-700 ease-in-out ${
                        isActive
                          ? 'opacity-100 scale-100 pointer-events-auto z-10'
                          : 'opacity-0 scale-95 pointer-events-none z-0'
                      }`}
                    >
                      {/* Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-dark-950/40 z-10 pointer-events-none" />

                      {/* Main Focused Carousel Image */}
                      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          onClick={() => setActivePhoto(item)}
                          className="max-h-full max-w-full object-contain mx-auto my-auto drop-shadow-2xl rounded-2xl border border-amber-500/20 cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                        />
                      </div>

                      {/* Slide Details Content */}
                      <div className="relative z-20 px-5 py-4 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-950/90 backdrop-blur-xl border-t border-dark-800">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {idx + 1} of {filteredItems.length}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100 truncate">
                            {item.title}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => setActivePhoto(item)}
                            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-dark-950 font-bold text-xs rounded-xl shadow transition"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Expand</span>
                          </button>

                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            title={isPlaying ? 'Pause Auto-Play' : 'Play Auto-Play'}
                            className="p-2 rounded-xl bg-dark-900 border border-dark-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-dark-950/80 border border-dark-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition shadow-xl"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-dark-950/80 border border-dark-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition shadow-xl"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Strip Bar */}
            <div className="flex items-center justify-center space-x-2.5 overflow-x-auto pb-2 no-scrollbar">
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCarouselIndex(idx)}
                  className={`relative shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    idx === carouselIndex
                      ? 'border-amber-400 scale-105 shadow-md'
                      : 'border-dark-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-[120] bg-dark-950/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full bg-dark-900 rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl">
            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-5 bg-dark-950 flex items-center justify-between border-t border-dark-800">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400">{activePhoto.category}</span>
                <h3 className="font-serif font-bold text-lg text-white mt-0.5">{activePhoto.title}</h3>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Wings River Café Official Gallery</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
