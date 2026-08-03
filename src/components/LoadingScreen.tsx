'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');
  const [iconLoaded, setIconLoaded] = useState(false);

  useEffect(() => {
    // Skip if already launched in this session
    if (typeof window !== 'undefined') {
      const alreadyLaunched = sessionStorage.getItem('wings_pwa_launched');
      if (alreadyLaunched) {
        setPhase('done');
        return;
      }
      sessionStorage.setItem('wings_pwa_launched', 'true');
    }

    // Trigger 2-second smooth fade in from low to high opacity
    const fadeInTimer = setTimeout(() => setIconLoaded(true), 60);

    // Smooth fade out after 2-second presentation
    const holdTimer = setTimeout(() => setPhase('out'), 2100);
    const doneTimer = setTimeout(() => setPhase('done'), 2800);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden bg-[#090C12]"
      style={{
        transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: phase === 'out' ? 0 : 1,
        willChange: 'opacity',
      }}
    >
      {/* Soft Ambient Gold Glow */}
      <div
        className="absolute w-[380px] h-[380px] rounded-full pointer-events-none transition-opacity duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1)"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(55px)',
          opacity: iconLoaded ? 1 : 0.05,
        }}
      />

      <div className="relative flex flex-col items-center z-10 space-y-4">
        {/* PWA Mobile Logo Icon — Pure Smooth Fading, 1px Padding, 20% Border Radius */}
        <div
          className="relative w-24 h-24 sm:w-28 sm:h-28 p-[1px] rounded-[20%] overflow-hidden shadow-2xl transition-opacity duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1)"
          style={{
            borderRadius: '20%',
            padding: '1px',
            opacity: iconLoaded ? 1 : 0.05,
            boxShadow: iconLoaded
              ? '0 0 0 1.5px rgba(212,175,55,0.45), 0 20px 60px rgba(212,175,55,0.25)'
              : '0 0 0 1px rgba(212,175,55,0.1), 0 5px 15px rgba(0,0,0,0.5)',
            background: 'linear-gradient(145deg, #1F1810, #0B0E14)',
          }}
        >
          <Image
            src="/logo.png"
            alt="Wings River Café Logo"
            width={112}
            height={112}
            priority
            className="w-full h-full object-cover rounded-[20%]"
            style={{ borderRadius: '20%' }}
          />
        </div>

        {/* Brand Name — Pure Smooth Fade-In */}
        <h1
          className="font-serif text-xl sm:text-2xl font-bold tracking-[0.25em] text-[#F8E7A1] uppercase transition-opacity duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1)"
          style={{
            opacity: iconLoaded ? 1 : 0.05,
            textShadow: '0 2px 20px rgba(212,175,55,0.4)',
          }}
        >
          Wings River Café
        </h1>
      </div>
    </div>
  );
}
