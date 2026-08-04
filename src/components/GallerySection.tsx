'use client';

import React, { useState, useEffect } from 'react';
import { getStoredGalleryItems, GalleryItem } from '@/lib/db';
import { getCloudinaryOptimizedUrl } from '@/controllers/StorageController';
import { X, ZoomIn, Camera, Play, Pause, ChevronLeft, ChevronRight, Info } from 'lucide-react';

import { useModalHistory } from '@/hooks/useModalHistory';

export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  // Bind mobile hardware back button to close photo lightbox
  useModalHistory(!!activePhoto, () => setActivePhoto(null), 'gallery_photo');

  // Carousel States
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const refreshData = () => { getStoredGalleryItems().then(setItems); };
    refreshData();
    window.addEventListener('wings_db_sync', refreshData);
    return () => window.removeEventListener('wings_db_sync', refreshData);
  }, []);

  const displayItems = items;

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
    <section id="gallery" className="py-16 sm:py-20 bg-[#FAF7F2] text-[#1F1810] relative overflow-hidden border-t border-[#E5B82C]/30 shadow-xl">
      {/* Background Soft Glows */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#F5D061]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-[#98A886]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#1F1810] border border-[#F5D061]/40 text-[#F8E7A1] font-bold text-[11px] tracking-widest uppercase shadow-md">
            Visual Journal &amp; Gallery
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#1F1810] tracking-tight">
            Wings River Café Gallery
          </h2>
          <p className="font-sans text-gray-600 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Waterfront Ambience • Sunset Dining • Speedboat Dock • Evening Canopies
          </p>
        </div>

        {/* Fancy Sober 4:6 Aspect Ratio Gallery Showcase */}
        {displayItems.length > 0 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div
              className="relative rounded-3xl overflow-hidden border border-[#F5D061]/50 shadow-2xl bg-[#14171D] group aspect-[4/6] max-h-[620px] flex flex-col justify-between mx-auto text-white"
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
                          decoding="async"
                          fetchPriority={isActive ? 'high' : 'low'}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                      </div>

                      {/* Bottom Caption Overlay */}
                      <div className="absolute bottom-0 inset-x-0 z-20 p-5 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/80 to-transparent pt-12 text-white">
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5D061] font-mono">
                              {item.category || 'Atmosphere'}
                            </span>
                            <h3 className="font-serif font-bold text-xl text-[#F8E7A1] mt-0.5">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#D4C4A0]/80 mt-1 line-clamp-2">
                              {item.about || item.description || ''}
                            </p>
                          </div>

                          <button
                            onClick={() => setActivePhoto(item)}
                            className="p-3 rounded-2xl bg-[#F5D061] text-[#120B08] font-bold hover:scale-110 transition shadow-lg shrink-0 ml-3"
                            title="Fullscreen View"
                          >
                            <ZoomIn className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls Bar */}
              <div className="relative z-30 p-4 bg-[#14171D] border-t border-[#F5D061]/25 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5D061] transition flex items-center justify-center shrink-0 border border-white/10"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <span className="text-xs font-mono text-[#D4C4A0]">
                    {carouselIndex + 1} / {displayItems.length}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5D061] transition flex items-center justify-center shrink-0 border border-white/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5D061] transition flex items-center justify-center shrink-0 border border-white/10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-5 right-5 p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] text-center space-y-4">
            <img
              src={activePhoto.image_url}
              alt={activePhoto.title}
              className="max-h-[75vh] max-w-full object-contain mx-auto rounded-2xl border border-[#F5D061]/40 shadow-2xl"
            />
            <h3 className="font-serif font-bold text-xl text-[#F8E7A1]">{activePhoto.title}</h3>
            <p className="text-xs text-[#D4C4A0] max-w-lg mx-auto">{activePhoto.description}</p>
          </div>
        </div>
      )}
    </section>
  );
}
