'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoadingScreen() {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'done'>('in');

  useEffect(() => {
    // Phase: hold content visible
    const holdTimer  = setTimeout(() => setPhase('out'), 1800);
    // Phase: remove from DOM after fade-out transition
    const doneTimer  = setTimeout(() => setPhase('done'), 2500);
    return () => { clearTimeout(holdTimer); clearTimeout(doneTimer); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 60%, #1a0f00 0%, #060a12 70%)',
        transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: phase === 'out' ? 0 : 1,
      }}
    >
      {/* Ambient glow blob */}
      <div
        className="absolute w-[340px] h-[340px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -58%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative flex flex-col items-center z-10">
        {/* Logo */}
        <div
          className="loading-logo relative w-28 h-28 mb-5 rounded-[25%] overflow-hidden shadow-2xl"
          style={{
            boxShadow: '0 0 0 1px rgba(245,158,11,0.35), 0 20px 60px rgba(245,158,11,0.22)',
            background: 'linear-gradient(145deg, #1c1205, #110b01)',
          }}
        >
          <Image
            src="/logo.png"
            alt="Wings River Café Logo"
            width={112}
            height={112}
            priority
            className="w-full h-full object-cover rounded-[25%]"
          />
          {/* Shine sweep */}
          <div
            className="absolute inset-0 rounded-[25%]"
            style={{
              background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.09) 50%, transparent 70%)',
            }}
          />
        </div>

        {/* Brand Name */}
        <h1
          className="loading-title text-xl font-serif font-bold tracking-[0.18em] text-amber-200 uppercase"
          style={{ textShadow: '0 0 24px rgba(245,158,11,0.5)' }}
        >
          Wings River Café
        </h1>

        {/* Tagline */}
        <p className="loading-tagline text-[10px] tracking-[0.3em] text-amber-400/75 font-sans uppercase mt-1">
          Taste&nbsp;•&nbsp;Eat&nbsp;•&nbsp;Rides&nbsp;|&nbsp;Lucknow
        </p>

        {/* Loading bar */}
        <div className="mt-6 w-44 h-[2px] rounded-full overflow-hidden bg-white/8">
          <div
            className="loading-bar h-full rounded-full loading-glow"
            style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b, #fcd34d)' }}
          />
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center space-x-1.5 mt-4">
          <span className="dot-bounce-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-400/60" />
          <span className="dot-bounce-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-400/60" />
          <span className="dot-bounce-3 inline-block w-1.5 h-1.5 rounded-full bg-amber-400/60" />
        </div>
      </div>
    </div>
  );
}
