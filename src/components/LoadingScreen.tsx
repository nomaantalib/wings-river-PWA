'use client';

import React, { useState, useEffect } from 'react';
import CircularLogo from './CircularLogo';

export default function LoadingScreen() {
  // Start shouldRender as true so launch screen covers the viewport BEFORE home page paints
  const [shouldRender, setShouldRender] = useState(true);
  const [iconVisible, setIconVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasLaunched = sessionStorage.getItem('wings_pwa_launched_session');

    if (hasLaunched) {
      // Reloads within session: Immediately unmount launch screen statically with 0 delay
      setShouldRender(false);
    } else {
      // First session launch: Mark session as launched
      sessionStorage.setItem('wings_pwa_launched_session', 'true');

      // Trigger 1-second opacity 0 -> 1 fade-in effect on mount
      const fadeInTimer = setTimeout(() => {
        setIconVisible(true);
      }, 50);

      // Start fade out at 1.6s -> unmount at 2.05s
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 1600);

      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 2050);

      return () => {
        clearTimeout(fadeInTimer);
        clearTimeout(fadeTimer);
        clearTimeout(unmountTimer);
      };
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#07090E] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500 ease-in-out select-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`flex flex-col items-center justify-center space-y-4 transition-all duration-1000 ease-out transform ${
          iconVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'
        }`}
      >
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
