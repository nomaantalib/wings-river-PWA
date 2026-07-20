'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, X, Download, ChevronDown } from 'lucide-react';

interface FoodMenuSectionProps {
  onOpenBooking: () => void;
}

export default function FoodMenuSection({ onOpenBooking }: FoodMenuSectionProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.3;

  const zoomIn = () => setZoomLevel((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => {
    setZoomLevel((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
    if (zoomLevel <= MIN_ZOOM + ZOOM_STEP) setPan({ x: 0, y: 0 });
  };
  const resetZoom = () => { setZoomLevel(1); setPan({ x: 0, y: 0 }); };

  // Wheel scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoomLevel((z) => Math.min(Math.max(z + delta, MIN_ZOOM), MAX_ZOOM));
  };

  // Mouse drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Touch zoom & pan
  const lastTouchDist = useRef<number | null>(null);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist.current !== null) {
        const delta = (dist - lastTouchDist.current) * 0.005;
        setZoomLevel((z) => Math.min(Math.max(z + delta, MIN_ZOOM), MAX_ZOOM));
      }
      lastTouchDist.current = dist;
    }
  };
  const handleTouchEnd = () => { lastTouchDist.current = null; };

  // Close fullscreen on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setIsFullscreen(false); resetZoom(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const openFullscreen = () => { setIsFullscreen(true); resetZoom(); };
  const closeFullscreen = () => { setIsFullscreen(false); resetZoom(); };

  const ZoomableImage = ({ inFullscreen = false }: { inFullscreen?: boolean }) => (
    <div
      ref={inFullscreen ? undefined : containerRef}
      className={`relative overflow-hidden rounded-2xl ${inFullscreen ? 'w-full h-full flex items-center justify-center' : 'w-full'} ${zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${isDragging ? 'cursor-grabbing' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none' }}
    >
      <img
        ref={imgRef}
        src="/images/menu_card.jpg"
        alt="Wings River Café Full Menu Card - Beverages, Breakfast, Chaat, Indian, Chinese, Pizza, Burger, Desserts"
        className={`${inFullscreen ? 'max-h-[88vh] max-w-full object-contain' : 'w-full h-auto object-contain'} transition-transform duration-200 ease-out select-none`}
        style={{
          transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
          transformOrigin: 'center center',
          willChange: 'transform',
          opacity: isLoaded ? 1 : 0,
        }}
        onLoad={() => setIsLoaded(true)}
        draggable={false}
        onClick={!inFullscreen && zoomLevel === 1 ? openFullscreen : undefined}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-cream-50 flex items-center justify-center rounded-2xl">
          <div className="w-10 h-10 border-4 border-mint-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );

  return (
    <section id="menu" className="py-20 bg-gradient-to-b from-cream-50 via-cream-100 to-cream-50 relative overflow-hidden">

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mint-300 via-gold-400 to-mint-300" />
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-mint-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gold-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold-300/40 border border-gold-400/50 text-gold-700 font-extrabold text-xs tracking-widest uppercase mb-3 shadow-sm">
            🍽️ Our Offerings
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 tracking-tight mb-4">
            Multicuisine Gourmet Menu
          </h2>
          <p className="font-sans text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Pinch to zoom or scroll to explore our full menu — Beverages, Breakfast, Chaat, Indian, Chinese, Burgers, Pizza, and Desserts.
          </p>

          {/* Hint arrow bounce */}
          <div className="flex items-center justify-center mt-4 text-gold-500 animate-bounce">
            <ChevronDown className="w-5 h-5" />
            <span className="text-xs font-semibold ml-1">Scroll & pinch to zoom</span>
          </div>
        </div>

        {/* Menu Card Container */}
        <div className={`relative transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Glowing ambient ring behind the card */}
          <div className="absolute -inset-3 bg-gradient-to-r from-mint-300 via-gold-300 to-mint-400 rounded-3xl blur-2xl opacity-30 animate-pulse-glow pointer-events-none" />

          {/* Menu Card Wrapper */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gold-200/60 overflow-hidden group">

            {/* Top Control Bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-dark-950 via-dark-900 to-dark-950 border-b border-gold-400/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-gold-400/40">
                  <img src="/logo.png" alt="Wings River Café Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-serif font-bold text-white text-sm">Wings River Café</span>
                  <span className="block text-[9px] text-gold-400 font-semibold uppercase tracking-widest">Full Menu Card</span>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={zoomOut}
                  disabled={zoomLevel <= MIN_ZOOM}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={resetZoom}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold min-w-[44px] text-center transition-all"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  onClick={zoomIn}
                  disabled={zoomLevel >= MAX_ZOOM}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-5 bg-white/20 mx-0.5" />

                <button
                  onClick={openFullscreen}
                  className="p-1.5 rounded-lg bg-gold-400/80 hover:bg-gold-400 text-dark-950 transition-all shadow-sm"
                  title="Open Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <a
                  href="/images/menu_card.jpg"
                  download="wings-river-cafe-menu.jpg"
                  className="p-1.5 rounded-lg bg-mint-400/80 hover:bg-mint-400 text-dark-950 transition-all shadow-sm"
                  title="Download Menu"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Menu Image Viewer */}
            <div
              className="w-full bg-[#f9f5ee] overflow-hidden"
              style={{ minHeight: '340px', maxHeight: '82vh', cursor: zoomLevel > 1 ? 'grab' : 'zoom-in' }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src="/images/menu_card.jpg"
                alt="Wings River Café Full Menu Card"
                className="w-full h-auto block select-none transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
                  transformOrigin: 'top center',
                  willChange: 'transform',
                  opacity: isLoaded ? 1 : 0,
                  filter: isLoaded ? 'none' : 'blur(12px)',
                  transition: isLoaded
                    ? 'transform 0.18s ease-out, filter 0.6s ease'
                    : 'filter 0.6s ease, opacity 0.6s ease',
                }}
                onLoad={() => setIsLoaded(true)}
                draggable={false}
                onClick={() => { if (zoomLevel === 1) openFullscreen(); }}
              />
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-mint-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Bottom CTA Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-cream-50 to-cream-100 border-t border-gold-200/50">
              <p className="text-xs text-gray-500 font-medium italic">
                📍 Lucknow Water Sports, Laxman Mela Ground · Open 11 AM – 11:59 PM · Call <span className="text-dark-900 font-bold not-italic">07310008020</span>
              </p>
              <button
                onClick={onOpenBooking}
                className="flex-shrink-0 px-6 py-2.5 bg-gradient-to-r from-mint-400 via-mint-500 to-gold-400 text-dark-950 font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform"
              >
                🗓 Reserve a Table
              </button>
            </div>
          </div>

          {/* Hint Text */}
          <p className="text-center text-xs text-gray-400 mt-4 font-medium">
            Click image or press <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-mono">⤢</kbd> to open fullscreen · Scroll / pinch to zoom · Drag to pan
          </p>
        </div>
      </div>

      {/* ─── FULLSCREEN LIGHTBOX OVERLAY ─── */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[200] bg-dark-950/96 backdrop-blur-2xl flex flex-col items-center justify-center animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) closeFullscreen(); }}
        >
          {/* Fullscreen Control Bar */}
          <div className="flex items-center justify-between w-full max-w-5xl px-4 sm:px-6 py-3 mb-2">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-gold-400/40" />
              <span className="font-serif font-bold text-white text-base">Full Menu Card</span>
            </div>

            <div className="flex items-center space-x-2">
              <button onClick={zoomOut} disabled={zoomLevel <= MIN_ZOOM} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-all">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={resetZoom} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold min-w-[52px] text-center">
                {Math.round(zoomLevel * 100)}%
              </button>
              <button onClick={zoomIn} disabled={zoomLevel >= MAX_ZOOM} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-all">
                <ZoomIn className="w-4 h-4" />
              </button>

              <a href="/images/menu_card.jpg" download="wings-river-cafe-menu.jpg" className="p-2 rounded-xl bg-mint-400/80 hover:bg-mint-400 text-dark-950 transition-all">
                <Download className="w-4 h-4" />
              </a>

              <button onClick={closeFullscreen} className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fullscreen Image */}
          <div
            className={`relative flex items-center justify-center overflow-auto w-full max-w-5xl flex-1 rounded-2xl ${zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${isDragging ? 'cursor-grabbing' : ''}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ userSelect: 'none' }}
          >
            <img
              src="/images/menu_card.jpg"
              alt="Wings River Café Full Menu Card"
              className="max-h-[82vh] max-w-full object-contain select-none rounded-2xl shadow-2xl"
              style={{
                transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.18s ease-out',
                willChange: 'transform',
              }}
              draggable={false}
            />
          </div>

          <p className="text-xs text-gray-500 mt-3 pb-4">Press <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-300 rounded text-[10px] font-mono">Esc</kbd> to close · Scroll / pinch to zoom · Drag to pan</p>
        </div>
      )}
    </section>
  );
}
