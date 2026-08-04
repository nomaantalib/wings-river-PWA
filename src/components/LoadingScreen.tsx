'use client';

import React, { useState, useEffect } from 'react';
import CircularLogo from './CircularLogo';

export default function LoadingScreen() {
  // Synchronously initialize state so launch screen renders from frame #1 before home section loads
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('wings_pwa_launched_session');
    }
    return true;
  });

  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasLaunched = sessionStorage.getItem('wings_pwa_launched_session');

    if (!hasLaunched) {
      // Mark session as launched
      sessionStorage.setItem('wings_pwa_launched_session', 'true');

      // 1.6s display -> 450ms smooth fade out -> Total ~2.0s
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 1600);

      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 2050);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    } else {
      setShouldRender(false);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#07090E] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500 ease-in-out select-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in scale-100 transition-transform duration-700">
        {/* Glow Ring Behind Logo */}
        <div className="relative">
          <div className="absolute -inset-5 rounded-full bg-[#F5D061]/25 blur-2xl animate-pulse" />
          <CircularLogo size={110} className="shadow-[0_0_40px_rgba(245,208,97,0.35)] relative z-10" />
        </div>

        {/* Café Title Only */}
        <h1 className="font-serif font-black text-2xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-[#FFF5D0] via-[#F5D061] to-[#E5B82C] tracking-tight leading-tight pt-1">
          Wings River Café
        </h1>
      </div>
    </div>
  );
}
