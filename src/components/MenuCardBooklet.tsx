'use client';

import React, { useState, useEffect } from 'react';
import { getStoredMenuPages, getStoredMenuItems, MenuPageDefinition, MenuItem, MENU_BOOKLET_PAGES, INITIAL_MENU_ITEMS } from '@/lib/db';
import { ChevronLeft, ChevronRight, BookOpen, Download, Calendar, Maximize2, ZoomIn, X, Play, Pause, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuCardBookletProps {
  onOpenBooking: () => void;
}

export default function MenuCardBooklet({ onOpenBooking }: MenuCardBookletProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);
  const [isAutoFlipping, setIsAutoFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [isHdMode, setIsHdMode] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);

  // Database client-side states to prevent hydration mismatch
  const [menuPages, setMenuPages] = useState<MenuPageDefinition[]>(MENU_BOOKLET_PAGES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  useEffect(() => {
    const refreshData = () => {
      Promise.all([getStoredMenuPages(), getStoredMenuItems()]).then(([pages, items]) => {
        setMenuPages(pages);
        setMenuItems(items);
      });
    };
    refreshData();
    window.addEventListener('wings_db_sync', refreshData);
    return () => window.removeEventListener('wings_db_sync', refreshData);
  }, []);

  // Auto flip effect
  useEffect(() => {
    let timer: any;
    if (isAutoFlipping && menuPages.length > 0) {
      timer = setInterval(() => {
        setCurrentPageIndex((prev) => (prev + 1) % menuPages.length);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoFlipping, menuPages]);

  if (menuPages.length === 0) {
    return (
      <div className="py-20 bg-dark-950 text-center text-gray-500 text-xs">
        Loading booklet menu...
      </div>
    );
  }

  const currentPage = menuPages[currentPageIndex] || menuPages[0];

  const nextPage = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setFlipDirection('next');
    setCurrentPageIndex((prev) => (prev + 1) % menuPages.length);
  };

  const prevPage = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setFlipDirection('prev');
    setCurrentPageIndex((prev) => (prev - 1 + menuPages.length) % menuPages.length);
  };

  // Find corresponding items for the current page
  const pageItems = menuItems.filter((item) => item.page_number === currentPage.pageNumber);

  return (
    <section id="menu-card" className="py-20 bg-dark-950 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-mint-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gold-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold-400/20 border border-gold-400/30 text-gold-300 font-semibold text-xs tracking-widest uppercase mb-3">
            <BookOpen className="w-3.5 h-3.5 text-gold-400" />
            <span>Official Menu Booklet & Card</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Interactive Menu Card Screen
          </h2>
          <p className="font-sans text-gray-300 text-base">
            Swipe or use arrows to flip through our official café menu booklet with smooth 3D page-roll animation.
          </p>
        </div>

        {/* BOOKLET FLIP VIEW */}
        {currentPage && (
          <div className="max-w-4xl mx-auto">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 mb-6 text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-serif font-bold text-mint-300 text-sm">
                  Page {currentPageIndex + 1} of {menuPages.length}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-200 truncate">{currentPage.title}</span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Auto flip button */}
                <button

                  onClick={() => setIsAutoFlipping(!isAutoFlipping)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isAutoFlipping
                      ? 'bg-mint-400 text-dark-950 border-mint-400'
                      : 'bg-white/10 text-gray-200 border-white/20 hover:bg-white/20'
                  }`}
                >
                  {isAutoFlipping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isAutoFlipping ? 'Pause Auto Flip' : 'Auto Flip'}</span>
                </button>

                {/* Zoom Fullscreen */}
                <button
                  onClick={() => {
                    setZoomScale(1);
                    setActiveZoomImage(currentPage.image);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  title="Expand Full Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Download Full Collage */}
                <a
                  href="/images/food_menu_collage.jpg"
                  download="Wings_River_Cafe_Menu_Card.jpg"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gold-500 text-dark-950 font-bold hover:bg-gold-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card</span>
                </a>
              </div>
            </div>

            {/* Menu Booklet Page Container */}


            <div className="relative group">
              <div className="relative bg-dark-900 rounded-3xl overflow-hidden border-2 border-gold-400/40 shadow-2xl transition-all duration-700 aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
                {/* Smooth Non-Glitch Horizontal Slide Transition */}
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentPageIndex}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -40) nextPage();
                      else if (info.offset.x > 40) prevPage();
                    }}
                    initial={{
                      x: flipDirection === 'next' ? 300 : -300,
                      opacity: 0,
                      scale: 0.96
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      scale: 1
                    }}
                    exit={{
                      x: flipDirection === 'next' ? -300 : 300,
                      opacity: 0,
                      scale: 0.96
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.32, 0.72, 0, 1]
                    }}
                    style={{
                      touchAction: 'pan-y',
                      userSelect: 'none',
                      cursor: 'grab'
                    }}
                    className="w-full h-full relative overflow-hidden flex items-center justify-center p-2 bg-[#ffffff]"
                  >

                    <img
                      src={currentPage.image}
                      alt={currentPage.title}
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        transform: 'translateZ(0)',
                      }}
                      className={`w-full h-full object-contain filter drop-shadow-2xl rounded-xl pointer-events-none transition-all duration-300 ${
                        isHdMode ? 'contrast-[1.06] brightness-[1.02] saturate-[1.04]' : ''
                      }`}
                    />

                    {/* Left/Right Spine Shadow Overlay */}
                    <div className={`absolute inset-y-0 w-16 bg-gradient-to-r from-black/10 to-transparent pointer-events-none ${
                      flipDirection === 'next' ? 'left-0' : 'right-0'
                    }`} />
                  </motion.div>
                </AnimatePresence>

                {/* Left Navigation Arrow */}
                <button
                  onClick={prevPage}
                  aria-label="Previous Page"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/20 text-white hover:bg-gold-500 hover:text-dark-950 transition-all shadow-xl hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  onClick={nextPage}
                  aria-label="Next Page"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/20 text-white hover:bg-gold-500 hover:text-dark-950 transition-all shadow-xl hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Bottom Quick Page Thumbnails Bar */}
              <div className="flex items-center justify-center space-x-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                {menuPages.map((page, idx) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => {
                      setCurrentPageIndex(idx);
                      setIsAutoFlipping(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 w-16 h-12 ${
                      idx === currentPageIndex
                        ? 'border-gold-400 scale-110 shadow-lg shadow-gold-500/30'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={page.image} alt={page.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-dark-950/80 text-[9px] font-bold px-1 text-gold-300">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Digital Items Preview For Active Page */}
            {pageItems.length > 0 && (
              <div className="mt-8 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-lg text-gold-400">
                    Dishes Featured On Page {currentPage.pageNumber}
                  </h4>
                  <button
                    onClick={onOpenBooking}
                    className="flex items-center space-x-1 px-3 py-1 bg-mint-400 text-dark-950 font-bold text-xs rounded-full"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reserve Table</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {pageItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] text-gray-300">{item.category}</span>
                      </div>
                      <span className="font-serif font-bold text-gold-400 text-sm">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Zoom Viewer */}
      {activeZoomImage && (
        <div className="fixed inset-0 z-[120] bg-dark-950/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="absolute top-6 right-6 flex items-center space-x-2 z-30">
            <button
              onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 flex items-center space-x-1"
              title="Zoom In"
            >
              <span>Zoom In +</span>
            </button>
            <button
              onClick={() => setZoomScale(prev => Math.max(1, prev - 0.25))}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 flex items-center space-x-1"
              title="Zoom Out"
            >
              <span>Zoom Out -</span>
            </button>
            <button
              onClick={() => setZoomScale(1)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10"
              title="Reset Zoom"
            >
              <span>Reset</span>
            </button>
            <button
              onClick={() => {
                setActiveZoomImage(null);
                setZoomScale(1);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-6xl w-full bg-white rounded-3xl overflow-hidden border border-white/20 shadow-2xl p-4 flex flex-col items-center">
            <div className="max-h-[80vh] overflow-auto w-full flex justify-center p-2">
              <img
                src={activeZoomImage}
                alt="High Resolution Menu Card Page"
                style={{
                  imageRendering: '-webkit-optimize-contrast',
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'center center',
                }}
                className={`max-h-[78vh] w-auto object-contain rounded-xl shadow-xl transition-transform duration-300 ${
                  isHdMode ? 'contrast-[1.06] brightness-[1.02]' : ''
                }`}
              />
            </div>
            <div className="w-full mt-3 flex items-center justify-between px-4 pt-2 border-t border-gray-200">
              <span className="text-xs font-bold text-dark-900 flex items-center space-x-2">
                <span>Wings River Café & Lucknow Water Sports Official Menu Card</span>
                <span className="bg-amber-500/20 text-amber-900 px-2 py-0.5 rounded text-[10px] font-mono">
                  {Math.round(zoomScale * 100)}% Zoom
                </span>
              </span>
              <a
                href={activeZoomImage}
                download
                className="px-4 py-2 bg-amber-500 text-dark-950 font-bold text-xs rounded-xl shadow-md hover:bg-amber-400"
              >
                Download HD Page Image
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
