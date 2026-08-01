'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Smooth fade out effect
    const timer1 = setTimeout(() => {
      setIsFading(true);
    }, 500);

    const timer2 = setTimeout(() => {
      setIsVisible(false);
    }, 850);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-950 text-white transition-all duration-500 ease-out pointer-events-none ${
        isFading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Brand Logo with Soft Glow */}
        <div className="relative w-28 h-28 mb-4 flex items-center justify-center animate-pulse">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl" />
          <Image
            src="/logo.png"
            alt="Wings River Café Logo"
            width={112}
            height={112}
            priority
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_25px_rgba(217,119,6,0.3)]"
          />
        </div>

        {/* Brand Title */}
        <h1 className="text-xl font-serif font-bold tracking-widest text-amber-200 uppercase mt-2">
          Wings River Café
        </h1>
        <p className="text-[10px] tracking-[0.25em] text-amber-400/80 font-sans uppercase mt-1">
          Taste • Eat • Rides | Lucknow
        </p>
      </div>
    </div>
  );
}
