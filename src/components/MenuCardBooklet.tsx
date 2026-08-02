'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getStoredMenuPages, getStoredMenuItems, MenuPageDefinition, MenuItem, MENU_BOOKLET_PAGES, INITIAL_MENU_ITEMS } from '@/lib/db';
import { ChevronLeft, ChevronRight, BookOpen, Download, Calendar, Maximize2, X, Play, Pause } from 'lucide-react';

interface MenuCardBookletProps {
  onOpenBooking: () => void;
}

export default function MenuCardBooklet({ onOpenBooking }: MenuCardBookletProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [prevPageIndex, setPrevPageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);
  const [isAutoFlipping, setIsAutoFlipping] = useState(false);
  const [isHdMode, setIsHdMode] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const goToPage = (idx: number) => {
    if (idx === currentPageIndex || isTransitioning) return;
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
    setIsTransitioning(true);
    setPrevPageIndex(currentPageIndex);
    transitionTimeout.current = setTimeout(() => {
      setCurrentPageIndex(idx);
      setIsTransitioning(false);
    }, 260); // half of 500ms total crossfade
  };

  const nextPage = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    goToPage((currentPageIndex + 1) % menuPages.length);
  };

  const prevPage = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    goToPage((currentPageIndex - 1 + menuPages.length) % menuPages.length);
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
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#1F1810] border border-[#F5D061]/40 text-[#F8E7A1] font-bold text-xs tracking-widest uppercase mb-3 shadow-md">
            <BookOpen className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>Our Delicacies &amp; Offerings</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8E7A1] tracking-tight mb-2">
            Our Delicacies &amp; Offerings
          </h2>
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
                <span className="text-[#F5D061] font-bold text-sm truncate">{currentPage.title || `Menu Page ${currentPage.pageNumber}`}</span>
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

            {/* Menu Booklet Page Container — CSS crossfade, no glitch */}
            <div className="relative group">
              {/* Crossfade container — pure CSS, no layout shift */}
              <div
                className="relative bg-[#fdfaf5] rounded-3xl overflow-hidden border-2 border-[#C9A84C]/50 shadow-2xl transition-all duration-500 aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center"
                style={{ minHeight: '280px' }}
              >
                {/* Outgoing page fades out */}
                {isTransitioning && menuPages[prevPageIndex] && (
                  <img
                    key={`out-${prevPageIndex}`}
                    src={menuPages[prevPageIndex].image}
                    alt={menuPages[prevPageIndex].title}
                    loading="lazy"
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'contain',
                      opacity: 0,
                      transition: 'opacity 0.26s ease',
                      padding: '8px',
                    }}
                  />
                )}

                {/* Current page fades in */}
                <img
                  key={`in-${currentPageIndex}`}
                  src={menuPages[currentPageIndex]?.image || ''}
                  alt={menuPages[currentPageIndex]?.title || ''}
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'contain',
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'opacity 0.5s ease',
                    padding: '8px',
                  }}
                  className={`rounded-xl pointer-events-none ${
                    isHdMode ? 'contrast-[1.05] brightness-[1.01] saturate-[1.03]' : ''
                  }`}
                />

                {/* Left Navigation Arrow */}
                <button
                  onClick={prevPage}
                  aria-label="Previous Page"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#120B08]/70 backdrop-blur-sm border border-[#C9A84C]/40 text-[#F5EBE0] hover:bg-[#C9A84C] hover:text-[#120B08] transition-all shadow-xl hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  onClick={nextPage}
                  aria-label="Next Page"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#120B08]/70 backdrop-blur-sm border border-[#C9A84C]/40 text-[#F5EBE0] hover:bg-[#C9A84C] hover:text-[#120B08] transition-all shadow-xl hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Quick Page Thumbnails Bar */}
              <div className="flex items-center justify-center space-x-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                {menuPages.map((page, idx) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => {
                      goToPage(idx);
                      setIsAutoFlipping(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 w-16 h-12 ${
                      idx === currentPageIndex
                        ? 'border-gold-400 scale-110 shadow-lg shadow-gold-500/30'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={page.image} alt={page.title} loading="lazy" className="w-full h-full object-cover" />
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
