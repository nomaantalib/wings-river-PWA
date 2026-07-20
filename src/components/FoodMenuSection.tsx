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
  const lastTouchDist = useRef<number | null>(null);

  const MIN_ZOOM = 0.5, MAX_ZOOM = 5, ZOOM_STEP = 0.3;
  const zoomIn = () => setZoomLevel(z => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => { setZoomLevel(z => Math.max(z - ZOOM_STEP, MIN_ZOOM)); if (zoomLevel <= MIN_ZOOM + ZOOM_STEP) setPan({ x: 0, y: 0 }); };
  const resetZoom = () => { setZoomLevel(1); setPan({ x: 0, y: 0 }); };

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const modalViewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomLevel(z => Math.min(Math.max(z + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP), MIN_ZOOM), MAX_ZOOM));
    };

    const el = viewerRef.current;
    if (el) el.addEventListener('wheel', onWheel, { passive: false });

    const modalEl = modalViewerRef.current;
    if (modalEl) modalEl.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      if (el) el.removeEventListener('wheel', onWheel);
      if (modalEl) modalEl.removeEventListener('wheel', onWheel);
    };
  }, [isFullscreen]);

  const handleMouseDown = (e: React.MouseEvent) => { if (zoomLevel <= 1) return; setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging) return; setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist.current !== null) setZoomLevel(z => Math.min(Math.max(z + (dist - lastTouchDist.current!) * 0.005, MIN_ZOOM), MAX_ZOOM));
      lastTouchDist.current = dist;
    }
  };
  const handleTouchEnd = () => { lastTouchDist.current = null; };

  const openFullscreen = () => { setIsFullscreen(true); resetZoom(); };
  const closeFullscreen = () => { setIsFullscreen(false); resetZoom(); };

  return (
    <section id="menu" className="py-10 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f9f3e8 0%, #fdf6ee 50%, #f9f3e8 100%)' }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
      {/* Ambient glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-green-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center max-w-3xl mx-auto mb-10 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="inline-block px-5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-extrabold text-xs tracking-widest uppercase mb-4 shadow-sm">
            🍽️ Café & Food Menu
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#2d1a0e] tracking-tight mb-4">
            Multicuisine Gourmet Menu
          </h2>
          <p className="text-[#6b4c30] text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Scroll, pinch to zoom, or tap <strong>fullscreen</strong> to browse our complete menu — Beverages, Breakfast, Chaat, Indian, Chinese, Burgers, Pizza, Desserts & more.
          </p>
          <div className="flex items-center justify-center mt-3 text-amber-600 animate-bounce">
            <ChevronDown className="w-5 h-5" /><span className="text-xs font-semibold ml-1">Scroll & pinch to zoom</span>
          </div>
        </div>

        {/* Card container */}
        <div className={`relative transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Ambient ring */}
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-300 via-yellow-400 to-green-300 rounded-3xl blur-2xl opacity-25 animate-pulse pointer-events-none" />

          {/* Menu card */}
          <div className="relative bg-white rounded-[10%_10%_10%_10%/4%_4%_4%_4%] shadow-2xl border border-amber-200/60 overflow-hidden"
            style={{ borderRadius: '1.5rem' }}>
            {/* Control bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-amber-200/40"
              style={{ background: 'linear-gradient(90deg, #2d1a0e, #4a2c1a, #2d1a0e)' }}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-400/40">
                  <img src="/logo.png" alt="Wings River Café Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-serif font-bold text-white text-sm">Wings River Café</span>
                  <span className="block text-[9px] text-amber-400 font-semibold uppercase tracking-widest">Café & Restaurant Menu</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button onClick={zoomOut} disabled={zoomLevel <= MIN_ZOOM} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-all" title="Zoom Out"><ZoomOut className="w-3.5 h-3.5" /></button>
                <button onClick={resetZoom} className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold min-w-[44px] text-center">{Math.round(zoomLevel * 100)}%</button>
                <button onClick={zoomIn} disabled={zoomLevel >= MAX_ZOOM} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-all" title="Zoom In"><ZoomIn className="w-3.5 h-3.5" /></button>
                <div className="w-px h-5 bg-white/20 mx-0.5" />
                <button onClick={openFullscreen} className="p-1.5 rounded-lg bg-amber-500/80 hover:bg-amber-400 text-white transition-all shadow-sm" title="Fullscreen"><Maximize2 className="w-3.5 h-3.5" /></button>
                <a href="/images/food_menu_collage.jpg" download="wings-river-cafe-food-menu.jpg" className="p-1.5 rounded-lg bg-green-500/80 hover:bg-green-400 text-white transition-all shadow-sm" title="Download Menu"><Download className="w-3.5 h-3.5" /></a>
              </div>
            </div>

            {/* Image viewer */}
            <div ref={viewerRef} className="w-full overflow-hidden bg-[#fdf6ee]" style={{ minHeight: '340px', maxHeight: '82vh', cursor: zoomLevel > 1 ? 'grab' : 'zoom-in' }}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              <img
                src="/images/food_menu_collage.jpg"
                alt="Wings River Café Complete Food & Café Menu — Beverages, Breakfast, Chaat, Indian, Chinese, Pizza, Burger, Desserts"
                className="w-full h-auto block select-none"
                style={{
                  transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
                  transformOrigin: 'top center',
                  willChange: 'transform',
                  opacity: isLoaded ? 1 : 0,
                  filter: isLoaded ? 'none' : 'blur(12px)',
                  transition: isLoaded ? 'transform 0.18s ease-out, filter 0.6s ease' : 'filter 0.6s ease, opacity 0.6s ease',
                }}
                onLoad={() => setIsLoaded(true)}
                draggable={false}
                onClick={() => { if (zoomLevel === 1) openFullscreen(); }}
              />
              {!isLoaded && <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>}
            </div>

            {/* CTA bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-amber-100" style={{ background: 'linear-gradient(90deg, #fdf6ee, #f9f3e8)' }}>
              <p className="text-xs text-[#6b4c30] font-medium italic">
                📍 Lucknow Water Sports, Laxman Mela Ground · 11 AM – 11:59 PM · <span className="font-bold text-[#2d1a0e] not-italic">07310008020</span>
              </p>
              <button onClick={onOpenBooking} className="flex-shrink-0 px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform text-white"
                style={{ background: 'linear-gradient(135deg, #d97706, #16a34a)' }}>
                🗓 Reserve a Table
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-[#8b6344] mt-4 font-medium">
            Click image or press <kbd className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-mono">⤢</kbd> for fullscreen · Scroll/pinch to zoom · Drag to pan
          </p>
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] backdrop-blur-2xl flex flex-col items-center justify-center" style={{ background: 'rgba(10,6,2,0.97)' }}
          onClick={e => { if (e.target === e.currentTarget) closeFullscreen(); }}>
          <div className="flex items-center justify-between w-full max-w-5xl px-4 sm:px-6 py-3 mb-2">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-amber-400/40" />
              <span className="font-serif font-bold text-white text-base">Full Food & Café Menu</span>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={zoomOut} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"><ZoomOut className="w-4 h-4" /></button>
              <button onClick={resetZoom} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold min-w-[52px] text-center">{Math.round(zoomLevel * 100)}%</button>
              <button onClick={zoomIn} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"><ZoomIn className="w-4 h-4" /></button>
              <a href="/images/food_menu_collage.jpg" download="wings-river-cafe-food-menu.jpg" className="p-2 rounded-xl bg-green-500/80 hover:bg-green-400 text-white transition-all"><Download className="w-4 h-4" /></a>
              <button onClick={closeFullscreen} className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div ref={modalViewerRef} className={`relative flex items-center justify-center overflow-auto w-full max-w-5xl flex-1 rounded-2xl ${zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${isDragging ? 'cursor-grabbing' : ''}`}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={{ userSelect: 'none' }}>
            <img src="/images/food_menu_collage.jpg" alt="Wings River Café Full Food Menu" className="max-h-[82vh] max-w-full object-contain select-none rounded-2xl shadow-2xl"
              style={{ transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`, transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.18s ease-out', willChange: 'transform' }}
              draggable={false} />
          </div>
          <p className="text-xs text-gray-500 mt-3 pb-4">Press <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-300 rounded text-[10px] font-mono">Esc</kbd> to close</p>
        </div>
      )}
    </section>
  );
}
