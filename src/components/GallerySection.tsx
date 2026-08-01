'use client';

import React, { useState, useEffect } from 'react';
import { getStoredGalleryItems, GalleryItem, INITIAL_GALLERY } from '@/lib/db';
import { X, ZoomIn, Camera, Play, Pause, ChevronLeft, ChevronRight, Info } from 'lucide-react';

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
    <section id="gallery" className="py-16 bg-[#121417]/95 text-white relative overflow-hidden border-t border-[#C9B086]/20">
      {/* Background Soft Glows (Brown & Pista) */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#362419]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-[#2D3825]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#C9B086]/20 border border-[#C9B086]/40 text-[#E8DCB8] font-bold text-[11px] tracking-widest uppercase mb-3">
            Lucknow Water Sports &amp; Café
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#E8DCB8] tracking-tight mb-3">
            Laxman Mela Ground Waterfront
          </h2>
          <p className="font-sans text-[#D4C4A0]/90 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                selectedCat === cat
                  ? 'bg-[#C9B086] text-[#120B08] font-bold shadow-md scale-105'
                  : 'bg-[#1A1D24] text-[#D4C4A0] border border-[#C9B086]/25 hover:border-[#C9B086] hover:text-[#E8DCB8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Consistent Aspect Ratio Auto Slideshow Showcase */}
        {filteredItems.length > 0 && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div
              className="relative rounded-3xl overflow-hidden border border-[#C9B086]/35 shadow-2xl bg-[#181A1F] group aspect-[4/3] sm:aspect-[16/9] flex flex-col justify-between"
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
                      idx === carouselIndex ? 'opacity-40 scale-110' : 'opacity-0 scale-100'
                    }`}
                    style={{ backgroundImage: `url(${item.image_url})` }}
                  />
                ))}
              </div>

              {/* Main Slides Track (Cross-fade) */}
              <div className="relative w-full h-full z-10 flex-1 overflow-hidden">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121417] via-transparent to-[#121417]/40 z-10 pointer-events-none" />

                      {/* Main Full-Size Image Container */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-5 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          onClick={() => setActivePhoto(item)}
                          className="max-h-full max-w-full object-contain mx-auto my-auto drop-shadow-2xl rounded-2xl border border-[#C9B086]/30 cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
                        />
                      </div>

                      {/* Slide Details Content & Brief Description */}
                      <div className="relative z-20 px-5 py-4 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14171D]/95 backdrop-blur-xl border-t border-[#C9B086]/25">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#98A886]/20 text-[#D8E2CD] text-[10px] font-bold uppercase tracking-wider border border-[#98A886]/40">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-[#D4C4A0]/60 font-mono">
                              {idx + 1} of {filteredItems.length}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-sm sm:text-base text-[#E8DCB8] truncate">
                            {item.title}
                          </h3>
                          {item.about && (
                            <p className="text-xs text-[#D4C4A0]/80 line-clamp-2 sm:line-clamp-1 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-[#98A886] shrink-0 inline" />
                              <span>{item.about}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => setActivePhoto(item)}
                            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-[#C9B086] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs rounded-xl shadow transition"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Expand</span>
                          </button>

                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            title={isPlaying ? 'Pause Auto-Play' : 'Play Auto-Play'}
                            className="p-2 rounded-xl bg-[#231710] border border-[#C9B086]/30 hover:border-[#C9B086] text-[#D4C4A0] hover:text-[#E8DCB8] transition"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#121417]/85 border border-[#C9B086]/30 hover:border-[#C9B086] text-[#D4C4A0] hover:text-[#E8DCB8] transition shadow-xl"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#121417]/85 border border-[#C9B086]/30 hover:border-[#C9B086] text-[#D4C4A0] hover:text-[#E8DCB8] transition shadow-xl"
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
                      ? 'border-[#C9B086] scale-105 shadow-md'
                      : 'border-[#181A1F] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal with Full-Size Image & Brief About Details */}
      {activePhoto && (
        <div className="fixed inset-0 z-[120] bg-[#0B0C0E]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full bg-[#14171D] rounded-3xl overflow-hidden border border-[#C9B086]/40 shadow-2xl">
            <div className="max-h-[70vh] overflow-hidden flex items-center justify-center bg-black p-2">
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[68vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-5 bg-[#1A1D24] border-t border-[#C9B086]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[#98A886] px-2.5 py-0.5 rounded bg-[#98A886]/15 border border-[#98A886]/30">
                  {activePhoto.category}
                </span>
                <div className="flex items-center space-x-2 text-[#D4C4A0]/70 text-xs">
                  <Camera className="w-4 h-4 text-[#C9B086]" />
                  <span>Wings River Café Official Gallery</span>
                </div>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#E8DCB8]">{activePhoto.title}</h3>
              {activePhoto.about && (
                <p className="text-xs text-[#D4C4A0] leading-relaxed bg-[#121417] p-3 rounded-xl border border-[#C9B086]/20 flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#98A886] shrink-0 mt-0.5" />
                  <span>{activePhoto.about}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
