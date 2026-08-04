'use client';

import React, { useState, useEffect } from 'react';
import CircularLogo from './CircularLogo';

export default function LoadingScreen() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app has already been launched in this browser session
    const hasLaunched = sessionStorage.getItem('wings_pwa_launched_session');

    if (!hasLaunched) {
      // Mark as launched for this session so future reloads/refreshes remain 100% static
      sessionStorage.setItem('wings_pwa_launched_session', 'true');
      setShouldRender(true);

      // Smooth fade-out timer (1.2s total duration)
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 900);

      const removeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 1250);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#07090E] flex flex-col items-center justify-center pointer-events-none transition-opacity duration-400 ease-out select-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
        {/* Glow Ring Behind Logo */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-[#F5D061]/20 blur-xl animate-pulse" />
          <CircularLogo size={100} className="shadow-[0_0_35px_rgba(245,208,97,0.3)] relative z-10" />
        </div>

        {/* Café Title Only */}
        <h1 className="font-serif font-black text-2xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-[#FFF5D0] via-[#F5D061] to-[#E5B82C] tracking-tight leading-tight pt-1">
          Wings River Café
        </h1>
      </div>
    </div>
  );
}
