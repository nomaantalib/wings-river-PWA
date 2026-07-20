'use client';

import React from 'react';

interface CircularLogoProps {
  className?: string;
  size?: number;
}

export default function CircularLogo({ className = '', size = 120 }: CircularLogoProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-2xl p-[2px] bg-gradient-to-tr from-gold-500 via-mint-300 to-gold-400 shadow-xl flex items-center justify-center select-none group transition-all duration-500 hover:scale-105 shrink-0 ${className}`}
    >
      <div className="w-full h-full rounded-[14px] bg-cream-50 overflow-hidden flex items-center justify-center relative shadow-inner">
        <img
          src="/logo.png"
          alt="Wings River Café - Taste, Eat & Rides Multicuisine Logo"
          className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  );
}
