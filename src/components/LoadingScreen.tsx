'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in');

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

    // Phase transitions for luxury fade out
    const holdTimer = setTimeout(() => setPhase('out'), 1100);
    const doneTimer = setTimeout(() => setPhase('done'), 1800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden bg-[#090C12]"
      style={{
        transition: 'opacity 0.7s ease-in-out, transform 0.7s ease-in-out',
        opacity: phase === 'out' ? 0 : 1,
        transform: phase === 'out' ? 'scale(1.03)' : 'scale(1)',
        willChange: 'opacity, transform',
      }}
    >
      {/* Soft Ambient Gold Glow */}
      <div
        className="absolute w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative flex flex-col items-center z-10 space-y-4">
        {/* Single Brand Logo Icon with Fade/Pulse */}
        <div
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 animate-pulse"
          style={{
            boxShadow: '0 0 0 1.5px rgba(212,175,55,0.4), 0 20px 50px rgba(212,175,55,0.25)',
            background: 'linear-gradient(145deg, #1F1810, #0B0E14)',
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
        </div>

        {/* Brand Name */}
        <h1
          className="font-serif text-xl sm:text-2xl font-bold tracking-[0.25em] text-[#F8E7A1] uppercase transition-opacity duration-700"
          style={{ textShadow: '0 2px 20px rgba(212,175,55,0.4)' }}
        >
          Wings River Café
        </h1>
      </div>
    </div>
  );
}
