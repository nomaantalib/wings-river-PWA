'use client';

import React, { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Quick, professional initial load animation (600ms total)
    const timer1 = setTimeout(() => {
      setIsFading(true);
    }, 450);

    const timer2 = setTimeout(() => {
      setIsVisible(false);
    }, 750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-950 text-white transition-opacity duration-300 pointer-events-none ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Sleek Golden Wings Emblem */}
        <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-25" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[2px] shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-dark-950 rounded-full flex items-center justify-center">
              <span className="text-amber-400 text-2xl font-serif font-bold tracking-tighter">W</span>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-xl font-serif font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 uppercase">
          Wings River Café
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-amber-300/70 font-sans uppercase mt-1">
          Taste • Eat • Rides | Lucknow
        </p>

        {/* Minimal Progress Bar */}
        <div className="w-32 h-[2px] bg-dark-800 rounded-full mt-6 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 w-full animate-[loading_0.6s_ease-in-out]" />
        </div>
      </div>
    </div>
  );
}
