'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getStoredMenuPages, getStoredMenuItems, MenuPageDefinition, MenuItem, MENU_BOOKLET_PAGES, INITIAL_MENU_ITEMS } from '@/lib/db';
import { ChevronLeft, ChevronRight, BookOpen, Download, Calendar, Maximize2, X, Play, Pause } from 'lucide-react';
// @ts-ignore
import HTMLFlipBook from 'react-pageflip';

const FlipBookComponent = HTMLFlipBook as any;

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
  const [isMounted, setIsMounted] = useState(false);
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipBookRef = useRef<any>(null);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Database client-side states to prevent hydration mismatch
  const [menuPages, setMenuPages] = useState<MenuPageDefinition[]>(MENU_BOOKLET_PAGES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  useEffect(() => {
    setIsMounted(true);
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
        if (flipBookRef.current) {
          try {
            flipBookRef.current.pageFlip().flipNext();
          } catch {
            setCurrentPageIndex((prev) => (prev + 1) % menuPages.length);
          }
        } else {
          setCurrentPageIndex((prev) => (prev + 1) % menuPages.length);
        }
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoFlipping, menuPages.length]);

  if (menuPages.length === 0) {
    return (
      <div className="py-20 bg-[#0B0E14] text-center text-slate-500 text-xs">
        Loading booklet menu...
      </div>
    );
  }

  const currentPage = menuPages[currentPageIndex] || menuPages[0];

  const goToPage = (idx: number, direction?: 'next' | 'prev') => {
    if (idx === currentPageIndex || isTransitioning) return;
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current);

    const dir = direction || (idx > currentPageIndex ? 'next' : 'prev');
    setFlipDirection(dir);
    setIsTransitioning(true);
    setPrevPageIndex(currentPageIndex);

    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().flip(idx);
      } catch (e) {
        // fallback
      }
    }

    transitionTimeout.current = setTimeout(() => {
      setCurrentPageIndex(idx);
      setIsTransitioning(false);
    }, 450);
  };

  const nextPage = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().flipNext();
        return;
      } catch (e) {
        // fallback
      }
    }
    goToPage((currentPageIndex + 1) % menuPages.length, 'next');
  };

  const prevPage = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (flipBookRef.current) {
      try {
        flipBookRef.current.pageFlip().flipPrev();
        return;
      } catch (e) {
        // fallback
      }
    }
    goToPage((currentPageIndex - 1 + menuPages.length) % menuPages.length, 'prev');
  };

  // Touch Swipe Handlers for mobile & desktop drag
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStartX.current = clientX;
    touchStartY.current = clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - touchStartX.current;
    const deltaY = clientY - touchStartY.current;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        // Swiped Left -> Move Next (Right to Left roll)
        nextPage();
        setIsAutoFlipping(false);
      } else {
        // Swiped Right -> Move Prev (Left to Right roll)
        prevPage();
        setIsAutoFlipping(false);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Find corresponding items for the current page
  const pageItems = menuItems.filter((item) => item.page_number === currentPage.pageNumber);

  return (
    <section id="menu-card" className="py-20 bg-[#0B0E14] text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#141A24] border border-[#D4AF37]/40 text-[#F8E7A1] font-bold text-xs tracking-widest uppercase mb-3 shadow-md">
            <BookOpen className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>Our Delicacies &amp; Offerings</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8E7A1] tracking-tight mb-2">
            Our Delicacies &amp; Offerings
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Swipe left/right or use controls to flip through our official booklet menu
          </p>
        </div>

        {/* BOOKLET FLIP VIEW */}
        {currentPage && (
          <div className="max-w-4xl mx-auto">
            {/* Compact Aesthetic Green Top Toolbar */}
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/90 via-emerald-900/90 to-emerald-950/90 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl border border-emerald-500/40 mb-4 text-xs shadow-xl">
              <div className="flex items-center space-x-2 truncate">
                <span className="font-serif font-bold text-amber-300 text-xs sm:text-sm shrink-0">
                  Page {currentPageIndex + 1} of {menuPages.length}
                </span>
                <span className="text-emerald-500/50">|</span>
                <span className="text-emerald-100 font-semibold text-xs sm:text-sm truncate">{currentPage.title || `Menu Page ${currentPage.pageNumber}`}</span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {/* Auto flip button - ICON ONLY */}
                <button
                  onClick={() => setIsAutoFlipping(!isAutoFlipping)}
                  className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                    isAutoFlipping
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                      : 'bg-emerald-900/70 text-emerald-200 border-emerald-500/40 hover:bg-emerald-800 hover:text-white'
                  }`}
                  title={isAutoFlipping ? 'Pause Auto Flip' : 'Start Auto Flip'}
                >
                  {isAutoFlipping ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                {/* Zoom Fullscreen - ICON ONLY */}
                <button
                  onClick={() => {
                    setZoomScale(1.2);
                    setActiveZoomImage(currentPage.image || null);
                  }}
                  className="p-2 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 transition-all hover:scale-105"
                  title="Expand Full Screen Zoom"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Download Full Card - ICON ONLY */}
                <a
                  href="/images/food_menu_collage.jpg"
                  download="Wings_River_Cafe_Menu_Card.jpg"
                  className="p-2 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-md hover:scale-105 transition-all"
                  title="Download Menu Card"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Menu Booklet Page Container with 3:4 Layout & Single Page Flip */}
            <div className="relative group max-w-3xl mx-auto">
              {/* 3:4 Aspect Ratio Stage Stage */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                className="relative bg-[#070A0F] rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-[0_25px_65px_rgba(0,0,0,0.9)] aspect-[3/4] min-h-[460px] sm:min-h-[580px] lg:min-h-[640px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                style={{
                  perspective: '2000px',
                  perspectiveOrigin: '50% 50%',
                }}
              >
                {/* Subtle Center Spine Shadow Overlay */}
                <div
                  className="absolute inset-0 z-30 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to right, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 3%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 97%, rgba(0,0,0,0.12) 100%)',
                  }}
                />

                {/* Render Single-Page HD FlipBook */}
                {isMounted ? (
                  <div className="w-full h-full flex items-center justify-center p-0 z-20">
                    <FlipBookComponent
                      width={480}
                      height={640}
                      size="stretch"
                      minWidth={300}
                      maxWidth={800}
                      minHeight={400}
                      maxHeight={1000}
                      maxShadowOpacity={0.4}
                      showCover={true}
                      singlePage={true}
                      usePortrait={true}
                      mobileScrollSupport={false}
                      useMouseEvents={false}
                      startPage={currentPageIndex}
                      drawShadow={true}
                      flippingTime={550}
                      className="menu-booklet-flipbook shadow-2xl rounded-2xl w-full h-full"
                      ref={flipBookRef}
                      onFlip={(e: any) => {
                        if (typeof e.data === 'number') {
                          setCurrentPageIndex(e.data);
                        }
                      }}
                    >
                      {menuPages.map((page, idx) => (
                        <div
                          key={page.pageNumber || idx}
                          className="bg-[#0A0D14] w-full h-full p-0 flex items-center justify-center shadow-inner relative overflow-hidden"
                        >
                          <img
                            src={page.image}
                            alt={page.title || `Page ${page.pageNumber}`}
                            style={{
                              imageRendering: 'crisp-edges',
                              WebkitFontSmoothing: 'antialiased',
                            }}
                            className={`w-full h-full object-contain scale-[1.03] rounded-xl transition-transform duration-300 ${
                              isHdMode ? 'contrast-[1.08] brightness-[1.02] saturate-[1.04]' : ''
                            }`}
                          />
                        </div>
                      ))}
                    </FlipBookComponent>
                  </div>
                ) : (
                  /* Fallback static page while mounting */
                  <div className="w-full h-full p-0 flex items-center justify-center z-20">
                    <img
                      src={currentPage.image}
                      alt={currentPage.title}
                      style={{
                        imageRendering: 'crisp-edges',
                      }}
                      className="w-full h-full object-contain scale-[1.03] rounded-xl contrast-[1.08] brightness-[1.02]"
                    />
                  </div>
                )}

                {/* Left Navigation Arrow */}
                <button
                  onClick={prevPage}
                  aria-label="Previous Page"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-[#0B0E14]/80 backdrop-blur-md border border-[#D4AF37]/50 text-amber-200 hover:bg-[#F5D061] hover:text-[#0B0E14] transition-all shadow-2xl hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  onClick={nextPage}
                  aria-label="Next Page"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-[#0B0E14]/80 backdrop-blur-md border border-[#D4AF37]/50 text-amber-200 hover:bg-[#F5D061] hover:text-[#0B0E14] transition-all shadow-2xl hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Floating Touch Swipe Hint */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 bg-[#0B0E14]/70 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] text-slate-300 pointer-events-none hidden sm:block">
                  👈 Swipe left / right to flip 3D pages 👉
                </div>
              </div>

              {/* Bottom Quick Page Thumbnails Bar */}
              <div className="flex items-center justify-center space-x-2.5 mt-5 overflow-x-auto pb-2 no-scrollbar">
                {menuPages.map((page, idx) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => {
                      goToPage(idx);
                      setIsAutoFlipping(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 w-16 h-12 ${
                      idx === currentPageIndex
                        ? 'border-[#F5D061] scale-110 shadow-lg shadow-amber-500/30'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={page.image} alt={page.title} loading="lazy" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-[#0B0E14]/90 text-[9px] font-bold px-1.5 text-[#F5D061] rounded-tl">
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
                  <a
                    href="#floor-map"
                    className="flex items-center space-x-1 px-3 py-1 bg-mint-400 text-dark-950 font-bold text-xs rounded-full"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reserve Table</span>
                  </a>

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
