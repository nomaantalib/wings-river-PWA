'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');

  useEffect(() => {
    // If user is navigating or has already seen initial launch splash in this tab, skip instantly
    if (typeof window !== 'undefined') {
      const alreadyLaunched = sessionStorage.getItem('wings_pwa_launched');
      if (alreadyLaunched) {
        setPhase('done');
        return;
      }
      sessionStorage.setItem('wings_pwa_launched', 'true');
    }

    // Phase: start smooth fade-out
    const holdTimer = setTimeout(() => setPhase('out'), 1200);
    // Phase: unmount completely from DOM
    const doneTimer = setTimeout(() => setPhase('done'), 1700);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 60%, #1c1205 0%, #0B0E14 75%)',
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: phase === 'out' ? 0 : 1,
        transform: phase === 'out' ? 'scale(1.02)' : 'scale(1)',
        willChange: 'opacity, transform',
      }}
    >
      {/* Ambient gold glow blob */}
      <div
        className="absolute w-[340px] h-[340px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,208,97,0.2) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -55%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative flex flex-col items-center z-10">
        {/* Logo */}
        <div
          className="loading-logo relative w-24 h-24 sm:w-28 sm:h-28 mb-5 rounded-3xl overflow-hidden shadow-2xl"
          style={{
            boxShadow: '0 0 0 1px rgba(245,208,97,0.4), 0 20px 60px rgba(245,208,97,0.25)',
            background: 'linear-gradient(145deg, #2A1E10, #120B08)',
          }}
        >
          <Image
            src="/logo.png"
            alt="Wings River Café Logo"
            width={112}
            height={112}
            priority
            className="w-full h-full object-cover rounded-3xl"
          />
          {/* Shine sweep */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
            }}
          />
        </div>

        {/* Brand Name */}
        <h1
          className="loading-title text-lg sm:text-xl font-serif font-bold tracking-[0.2em] text-[#F8E7A1] uppercase"
          style={{ textShadow: '0 0 24px rgba(245,208,97,0.5)' }}
        >
          Wings River Café
        </h1>

        {/* Tagline */}
        <p className="loading-tagline text-[10px] tracking-[0.3em] text-[#F5D061] font-sans uppercase mt-1">
          Taste&nbsp;•&nbsp;Eat&nbsp;•&nbsp;Rides&nbsp;|&nbsp;Lucknow
        </p>

        {/* Loading bar */}
        <div className="mt-5 w-40 h-[3px] rounded-full overflow-hidden bg-white/10">
          <div
            className="loading-bar h-full rounded-full loading-glow"
            style={{ background: 'linear-gradient(90deg, #F5D061, #E5B82C, #F8E7A1)' }}
          />
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center space-x-1.5 mt-3.5">
          <span className="dot-bounce-1 inline-block w-1.5 h-1.5 rounded-full bg-[#F5D061]" />
          <span className="dot-bounce-2 inline-block w-1.5 h-1.5 rounded-full bg-[#F5D061]" />
          <span className="dot-bounce-3 inline-block w-1.5 h-1.5 rounded-full bg-[#F5D061]" />
        </div>
      </div>
    </div>
  );
}
