'use client';

import React, { useState, useEffect } from 'react';
import { getStoredGalleryItems, GalleryItem } from '@/lib/db';
import { X, ZoomIn, Camera, Play, Pause, ChevronLeft, ChevronRight, LayoutGrid, Sliders } from 'lucide-react';

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
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  // Carousel States
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    setItems(getStoredGalleryItems());
  }, []);

  const filteredItems = items.filter(
    (item) => selectedCat === 'All' || item.category === selectedCat
  );

  // Auto-play interval for Carousel
  useEffect(() => {
    if (!isPlaying || filteredItems.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, filteredItems.length]);

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const currentCarouselItem = filteredItems[carouselIndex] || filteredItems[0];

  return (
    <section id="gallery" className="py-20 bg-dark-950 text-white relative overflow-hidden">
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-mint-400/20 border border-mint-400/30 text-mint-300 font-extrabold text-xs tracking-widest uppercase mb-3 shadow-md">
            Interactive Visual Story
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Riverside & Venue Gallery
          </h2>
          <p className="font-sans text-gray-300 text-sm sm:text-base leading-relaxed">
            Explore our scenic Gomti riverfront views, evening fairy-light canopies, luxury multicuisine dining, and Lucknow Water Sports rides.
          </p>
        </div>

        {/* Control Bar: Categories & View Mode Switcher */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCat(cat);
                  setCarouselIndex(0);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  selectedCat === cat
                    ? 'bg-gradient-to-r from-mint-300 via-mint-400 to-gold-400 text-dark-950 shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle Button (Auto Carousel vs Grid) */}
          <div className="flex items-center space-x-1.5 bg-dark-900/90 p-1.5 rounded-2xl border border-white/15 shadow-lg shrink-0">
            <button
              onClick={() => setViewMode('carousel')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'carousel'
                  ? 'bg-gold-400 text-dark-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Auto Slideshow</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'grid'
                  ? 'bg-gold-400 text-dark-950 shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Masonry Grid</span>
            </button>
          </div>
        </div>

        {/* MODE 1: Auto Animated Carousel Showcase */}
        {viewMode === 'carousel' && filteredItems.length > 0 && (
          <div className="space-y-6">
            <div
              className="relative rounded-3xl overflow-hidden border-2 border-gold-400/40 shadow-2xl bg-dark-900 group min-h-[420px] sm:min-h-[520px] flex items-stretch"
              onMouseEnter={() => setIsPlaying(false)}
              onMouseLeave={() => setIsPlaying(true)}
            >
              {/* Sliding Blurred Backdrop (Syncs with main slide) */}
              <div 
                className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] scale-110 filter blur-xl opacity-60"
                style={{ transform: `translateX(-${carouselIndex * 100}%)`, width: `${filteredItems.length * 100}%` }}
              >
                {filteredItems.map((item) => (
                  <div 
                    key={`bg-${item.id}`} 
                    className="w-full h-full bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${item.image_url})` }}
                  />
                ))}
              </div>

              {/* Main Slides Track */}
              <div 
                className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateX(-${carouselIndex * 100}%)`, width: `${filteredItems.length * 100}%` }}
              >
                {filteredItems.map((item, idx) => {
                  const isActive = idx === carouselIndex;
                  return (
                    <div
                      key={item.id}
                      className="w-full h-full flex-shrink-0 relative flex items-end min-h-[420px] sm:min-h-[520px] overflow-hidden"
                    >
                      {/* Vignette Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent z-10" />

                      {/* Main Focused Carousel Image with 3D zoom & blur on inactive */}
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ${
                          isActive 
                            ? 'scale-100 opacity-90 blur-0' 
                            : 'scale-95 opacity-20 blur-[3px]'
                        }`}
                      />

                      {/* Slide Details Content (only animate/fade for active slide) */}
                      <div className={`relative z-20 p-6 sm:p-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 transition-all duration-700 ${
                        isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}>
                        <div className="space-y-2 max-w-2xl">
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full bg-mint-400 text-dark-950 text-xs font-extrabold uppercase shadow-md">
                              {item.category}
                            </span>
                            <span className="text-xs text-gold-300 font-semibold">
                              Photo {idx + 1} of {filteredItems.length}
                            </span>
                          </div>
                          <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-white drop-shadow-md">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-cream-200">
                            Official photo capture from Wings River Café & Gomti Waterfront Deck.
                          </p>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <button
                            onClick={() => setActivePhoto(item)}
                            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-mint-300 to-gold-400 text-dark-950 font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform"
                          >
                            <ZoomIn className="w-4 h-4" />
                            <span>Expand Fullscreen</span>
                          </button>

                          {/* Play / Pause Toggle */}
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            title={isPlaying ? 'Pause Auto-Play' : 'Play Auto-Play'}
                            className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slide Control Navigation Arrows */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-dark-950/60 hover:bg-gold-400 hover:text-dark-950 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-dark-950/60 hover:bg-gold-400 hover:text-dark-950 text-white backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Strip Bar */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCarouselIndex(idx)}
                  className={`relative shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    idx === carouselIndex
                      ? 'border-gold-400 scale-105 shadow-lg shadow-gold-500/30'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2: Pinterest Masonry Grid */}
        {viewMode === 'grid' && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="break-inside-avoid relative rounded-3xl overflow-hidden group cursor-pointer border border-white/15 hover:border-gold-400/70 shadow-2xl bg-dark-900 transition-all duration-500 hover:-translate-y-1 hover:shadow-gold-500/20"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none scale-125"
                  style={{ backgroundImage: `url(${item.image_url})` }}
                />

                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 relative z-10"
                  loading="lazy"
                />

                <div className="absolute inset-0 z-20 bg-gradient-to-t from-dark-950/95 via-dark-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 backdrop-blur-[2px]">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-gold-400 mb-1 bg-white/10 px-2.5 py-0.5 rounded-full w-max border border-gold-400/30">
                    {item.category}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-white mb-2 leading-snug">{item.title}</h4>
                  <div className="inline-flex items-center space-x-1.5 text-mint-300 text-xs font-semibold">
                    <ZoomIn className="w-4 h-4 text-gold-400" />
                    <span>Click to expand high-res photo</span>
                  </div>
                </div>
              </div>
            ))}
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

          <div className="max-w-4xl w-full bg-dark-900 rounded-3xl overflow-hidden border border-gold-400/30 shadow-2xl">
            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-6 bg-dark-900 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-mint-400">{activePhoto.category}</span>
                <h3 className="font-serif font-bold text-xl text-white mt-1">{activePhoto.title}</h3>
              </div>
              <div className="flex items-center space-x-2 text-cream-200 text-xs">
                <Camera className="w-4 h-4 text-gold-400" />
                <span>Wings River Café Official Gallery</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
