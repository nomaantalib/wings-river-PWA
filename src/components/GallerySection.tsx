'use client';

import React, { useState } from 'react';
import { INITIAL_GALLERY, GalleryItem } from '@/lib/db';
import { X, ZoomIn, Camera } from 'lucide-react';

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
  const [items] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [selectedCat, setSelectedCat] = useState('All');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const filteredItems = items.filter(
    (item) => selectedCat === 'All' || item.category === selectedCat
  );

  return (
    <section id="gallery" className="py-20 bg-dark-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-mint-400/20 border border-mint-400/30 text-mint-300 font-semibold text-xs tracking-widest uppercase mb-3">
            Visual Story
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Riverside & Venue Gallery
          </h2>
          <p className="font-sans text-gray-300 text-base">
            Explore our scenic river views, luxury dining lounges, fairy-light celebration setups, and Lucknow Water Sports.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                selectedCat === cat
                  ? 'bg-gradient-to-r from-mint-300 to-gold-400 text-dark-950 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pinterest Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="break-inside-avoid relative rounded-3xl overflow-hidden group cursor-pointer border border-white/15 hover:border-gold-400/70 shadow-2xl bg-dark-900 transition-all duration-500 hover:-translate-y-1 hover:shadow-gold-500/20"
            >
              {/* Blurred Glow Background behind image on hover */}
              <div className="absolute inset-0 bg-cover bg-center filter blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none scale-125" style={{ backgroundImage: `url(${item.image_url})` }} />

              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 relative z-10"
                loading="lazy"
              />

              {/* Hover Glassmorphism Overlay */}
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

          <div className="max-w-4xl w-full bg-dark-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-6 bg-dark-900 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-mint-400">{activePhoto.category}</span>
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
