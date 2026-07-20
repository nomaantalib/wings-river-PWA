'use client';

import React, { useState, useEffect } from 'react';
import { getStoredMenuPages, getStoredMenuItems, MenuPageDefinition, MenuItem } from '@/lib/db';
import { ChevronLeft, ChevronRight, BookOpen, Grid, Maximize2, Download, Calendar, ZoomIn, X, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuCardBookletProps {
  onOpenBooking: () => void;
}

export default function MenuCardBooklet({ onOpenBooking }: MenuCardBookletProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'booklet' | 'grid' | 'scroll'>('booklet');
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);
  const [isAutoFlipping, setIsAutoFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  // Database client-side states to prevent hydration mismatch
  const [menuPages, setMenuPages] = useState<MenuPageDefinition[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    Promise.all([getStoredMenuPages(), getStoredMenuItems()]).then(([pages, items]) => {
      setMenuPages(pages);
      setMenuItems(items);
    });
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
            Flip through the pages of our official café menu card with smooth sliding animations, or switch to grid view.
          </p>

          {/* Mode Selector Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => {
                setViewMode('booklet');
                setIsAutoFlipping(false);
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'booklet'
                  ? 'bg-gradient-to-r from-mint-300 to-mint-400 text-dark-950 shadow-lg shadow-mint-400/20'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>3D Page Flip Booklet</span>
            </button>

            <button
              onClick={() => {
                setViewMode('scroll');
                setIsAutoFlipping(false);
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'scroll'
                  ? 'bg-gradient-to-r from-mint-300 to-gold-400 text-dark-950 shadow-lg shadow-mint-400/20'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span>Scroll Feed</span>
            </button>

            <button
              onClick={() => {
                setViewMode('grid');
                setIsAutoFlipping(false);
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-dark-950 shadow-lg shadow-gold-400/20'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Grid View (All {menuPages.length} Pages)</span>
            </button>
          </div>
        </div>

        {/* BOOKLET FLIP VIEW */}
        {viewMode === 'booklet' && currentPage && (
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
                  onClick={() => setActiveZoomImage(currentPage.image)}
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

            {/* Menu Booklet Page Container with Page Flip Slide Animation */}
            <div className="relative group">
              <div className="relative bg-dark-900 rounded-3xl overflow-hidden border-2 border-gold-400/40 shadow-2xl transition-all duration-700 aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
                {/* 3D Page Turning Image Transition */}
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentPageIndex}
                    initial={{
                      rotateY: flipDirection === 'next' ? 95 : -95,
                      opacity: 0.3,
                      scale: 0.95
                    }}
                    animate={{
                      rotateY: 0,
                      opacity: 1,
                      scale: 1
                    }}
                    exit={{
                      rotateY: flipDirection === 'next' ? -95 : 95,
                      opacity: 0.3,
                      scale: 0.95
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.25, 1, 0.5, 1] // Custom smooth easeOut cubic
                    }}
                    style={{
                      transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                      perspective: 1500,
                      backfaceVisibility: 'hidden',
                      touchAction: 'pan-y',
                      userSelect: 'none'
                    }}
                    className="w-full h-full relative overflow-hidden flex items-center justify-center p-2 bg-[#fbf5eb]"
                  >
                    <img
                      src={currentPage.image}
                      alt={currentPage.title}
                      className="w-full h-full object-contain filter drop-shadow-2xl rounded-xl"
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
        {/* SCROLL FEED VIEW */}
        {viewMode === 'scroll' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
            {/* Quick Sticky Page Navigator Sidebar */}
            <div className="w-full lg:w-60 lg:sticky lg:top-24 bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 shrink-0 space-y-4">
              <h4 className="font-serif font-bold text-sm text-gold-400 uppercase tracking-widest">
                Quick Index
              </h4>
              <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 text-xs">
                {menuPages.map((page, idx) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => {
                      document.getElementById(`menu-scroll-page-${page.pageNumber}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }}
                    className="flex items-center space-x-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-gold-400/30 text-left transition-all text-gray-300 hover:text-white"
                  >
                    <span className="font-mono font-bold text-mint-400 shrink-0">0{page.pageNumber}</span>
                    <span className="truncate hidden lg:inline">{page.title}</span>
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10 hidden lg:block">
                <button
                  onClick={onOpenBooking}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-mint-300 to-gold-400 text-dark-950 font-bold rounded-xl text-xs shadow-md hover:scale-[1.02] transition-transform"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve Table Now</span>
                </button>
              </div>
            </div>

            {/* Continuous Vertical Feed */}
            <div className="flex-1 w-full space-y-8">
              {menuPages.map((page, idx) => (
                <div
                  key={page.pageNumber}
                  id={`menu-scroll-page-${page.pageNumber}`}
                  className="relative bg-[#fbf5eb] p-4 sm:p-6 rounded-3xl border-2 border-gold-400/20 shadow-2xl transition-all duration-300 hover:border-gold-400/50"
                >
                  {/* Floating Page Badge */}
                  <div className="absolute top-4 left-4 bg-dark-950/80 backdrop-blur-md text-gold-300 px-4 py-1.5 rounded-full text-xs font-bold z-10 border border-gold-400/25 shadow-lg">
                    Page {idx + 1} of {menuPages.length} · {page.title}
                  </div>

                  {/* Actions bar inside page card */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1.5 z-10">
                    <button
                      onClick={() => setActiveZoomImage(page.image)}
                      className="p-2 rounded-full bg-dark-950/80 hover:bg-gold-400 hover:text-dark-950 text-white backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                      title="Expand Full Screen"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Page Image */}
                  <div className="relative group overflow-hidden rounded-2xl flex items-center justify-center bg-transparent mt-8">
                    <img
                      src={page.image}
                      alt={page.title}
                      className="w-full h-auto object-contain filter drop-shadow-xl rounded-xl transition-all duration-500 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GRID VIEW (ALL PAGES) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {menuPages.map((page) => (
              <div
                key={page.pageNumber}
                onClick={() => setActiveZoomImage(page.image)}
                className="group relative bg-dark-900 rounded-3xl overflow-hidden border border-white/10 hover:border-gold-400 shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-2"
              >
                <div className="h-64 overflow-hidden bg-[#fbf5eb] p-2 flex items-center justify-center">
                  <img
                    src={page.image}
                    alt={page.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-4 bg-dark-900 flex items-center justify-between border-t border-white/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-mint-400">
                      Page 0{page.pageNumber}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-white truncate max-w-[150px]">
                      {page.title}
                    </h4>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gold-400 group-hover:bg-gold-500 group-hover:text-dark-950 transition-colors">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Zoom Viewer */}
      {activeZoomImage && (
        <div className="fixed inset-0 z-[120] bg-dark-950/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setActiveZoomImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full bg-cream-50 rounded-3xl overflow-hidden border border-white/20 shadow-2xl p-4 flex flex-col items-center">
            <div className="max-h-[82vh] overflow-auto w-full flex justify-center">
              <img
                src={activeZoomImage}
                alt="High Resolution Menu Card Page"
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="w-full mt-3 flex items-center justify-between px-4">
              <span className="text-xs font-bold text-dark-900">
                Wings River Café & Lucknow Water Sports Official Menu Card
              </span>
              <a
                href={activeZoomImage}
                download
                className="px-4 py-2 bg-mint-500 text-dark-950 font-bold text-xs rounded-xl shadow-md"
              >
                Download Page Image
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
