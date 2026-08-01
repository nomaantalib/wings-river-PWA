'use client';

import React, { useState, useEffect } from 'react';
import { getStoredGalleryItems, GalleryItem, INITIAL_GALLERY } from '@/lib/db';
import { getCloudinaryOptimizedUrl } from '@/controllers/StorageController';
import { X, ZoomIn, Camera, Play, Pause, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
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

  // Auto-play interval for Auto Slideshow (every 4s)
  useEffect(() => {
    if (!isPlaying || displayItems.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % displayItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, displayItems.length]);

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  };

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % displayItems.length);
  };

  return (
    <section id="gallery" className="py-20 bg-[#0B0C0E]/95 text-white relative overflow-hidden border-t border-[#C9B086]/20">
      {/* Background Soft Glows (Pista & Executive Brown) */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#362419]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-[#2D3825]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#C9B086]/15 border border-[#C9B086]/35 text-[#E8DCB8] font-bold text-[11px] tracking-widest uppercase shadow-md">
            Visual Journal
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#E8DCB8] tracking-tight">
            Wings River Café Gallery
          </h2>
          <p className="font-sans text-[#D4C4A0]/80 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-light">
            Waterfront Ambience • Sunset Dining • Speedboat Dock • Evening Canopies
          </p>
        </div>

        {/* Fancy Sober 4:6 Aspect Ratio Gallery Showcase */}
        {displayItems.length > 0 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div
              className="relative rounded-3xl overflow-hidden border border-[#C9B086]/35 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#14171D] group aspect-[4/6] max-h-[620px] flex flex-col justify-between mx-auto"
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
              {/* Main 4:6 Slides Track with Cloudinary Optimization */}
              <div className="relative w-full h-full z-10 flex-1 overflow-hidden">
                {displayItems.map((item, idx) => {
                  const isActive = idx === carouselIndex;
                  const optimizedUrl = getCloudinaryOptimizedUrl(item.image_url, 800, 'auto');
                  return (
                    <div
                      key={item.id}
                      className={`absolute inset-0 w-full h-full flex flex-col justify-between overflow-hidden transition-all duration-700 ease-in-out ${
                        isActive
                          ? 'opacity-100 scale-100 pointer-events-auto z-10'
                          : 'opacity-0 scale-98 pointer-events-none z-0'
                      }`}
                    >
                      {/* Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-transparent to-[#0B0C0E]/40 z-10 pointer-events-none" />

                      {/* 4:6 Cropped Full Image Container */}
                      <div className="relative z-10 w-full h-full overflow-hidden">
                        <img
                          src={optimizedUrl}
                          alt={item.title}
                          onClick={() => setActivePhoto(item)}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer"
                        />
                      </div>

                      {/* Sober Slide Details Bar */}
                      <div className="relative z-20 px-5 py-3.5 w-full flex items-center justify-between gap-3 bg-[#121417]/95 backdrop-blur-xl border-t border-[#C9B086]/25">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-[#D4C4A0]/60 font-mono font-semibold">
                              {idx + 1} / {displayItems.length}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-sm sm:text-base text-[#E8DCB8] truncate">
                            {item.title}
                          </h3>
                          {item.about && (
                            <p className="text-[10px] sm:text-[11px] text-[#D4C4A0]/80 line-clamp-1 flex items-center gap-1 font-light">
                              <Info className="w-3 h-3 text-[#98A886] shrink-0 inline" />
                              <span>{item.about}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => setActivePhoto(item)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-[#C9B086] hover:bg-[#E8DCB8] text-[#120B08] font-bold text-[11px] rounded-xl shadow-md transition"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Expand</span>
                          </button>

                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            title={isPlaying ? 'Pause Auto-Play' : 'Play Auto-Play'}
                            className="p-1.5 rounded-xl bg-[#1A1D24] border border-[#C9B086]/30 text-[#D4C4A0] hover:text-white transition"
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#121417]/85 border border-[#C9B086]/30 text-[#D4C4A0] hover:text-white transition shadow-xl hover:scale-110"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#121417]/85 border border-[#C9B086]/30 text-[#D4C4A0] hover:text-white transition shadow-xl hover:scale-110"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sober Thumbnail Strip Bar */}
            <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
              {displayItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCarouselIndex(idx)}
                  className={`relative shrink-0 w-12 h-16 rounded-lg overflow-hidden border transition-all duration-300 ${
                    idx === carouselIndex
                      ? 'border-[#C9B086] scale-105 shadow-md ring-1 ring-[#C9B086]/40'
                      : 'border-[#181A1F] opacity-40 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getCloudinaryOptimizedUrl(item.image_url, 150, 'auto')}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal with Full 4:6 Image & Sober Description */}
      {activePhoto && (
        <div className="fixed inset-0 z-[120] bg-[#0B0C0E]/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-md w-full bg-[#14171D] rounded-3xl overflow-hidden border border-[#C9B086]/35 shadow-2xl">
            <div className="aspect-[4/6] max-h-[65vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={getCloudinaryOptimizedUrl(activePhoto.image_url, 1000, 'auto')}
                alt={activePhoto.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-[#1A1D24] border-t border-[#C9B086]/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#98A886] tracking-wider uppercase">
                  Wings River Café Showcase
                </span>
                <Camera className="w-3.5 h-3.5 text-[#C9B086]" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#E8DCB8]">{activePhoto.title}</h3>
              {activePhoto.about && (
                <p className="text-[11px] text-[#D4C4A0]/90 font-light leading-relaxed bg-[#121417] p-2.5 rounded-xl border border-[#C9B086]/15 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#98A886] shrink-0 mt-0.5" />
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
