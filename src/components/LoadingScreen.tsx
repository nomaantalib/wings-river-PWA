'use client';

import React, { useEffect, useState } from 'react';
import CircularLogo from './CircularLogo';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-dark-950 flex flex-col items-center justify-center transition-opacity duration-700">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-mint-500/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center animate-pulse-slow">
        <CircularLogo size={140} className="shadow-2xl shadow-mint-300/30" />
        <h2 className="mt-6 font-serif text-2xl font-bold tracking-widest text-gold-400 uppercase">
          Wings River Café
        </h2>
        <p className="mt-1 font-sans text-xs tracking-widest text-mint-300/80 uppercase">
          विंग्स रिवर • Lucknow Water Sports
        </p>

        {/* Loading Spinner */}
        <div className="mt-8 flex space-x-2">
          <div className="w-2.5 h-2.5 bg-mint-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-mint-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
