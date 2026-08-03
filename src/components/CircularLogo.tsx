'use client';

import React from 'react';

interface CircularLogoProps {
  className?: string;
  size?: number;
}

export default function CircularLogo({ className = '', size = 120 }: CircularLogoProps) {
  return (
    <div
      style={{ width: size, height: size, borderRadius: '25px' }}
      className={`relative rounded-[25px] p-[1px] bg-gradient-to-tr from-gold-500 via-mint-300 to-gold-400 shadow-xl flex items-center justify-center select-none group transition-all duration-500 hover:scale-105 shrink-0 ${className}`}
    >
      <div
        style={{ borderRadius: '23px' }}
        className="w-full h-full rounded-[23px] bg-cream-50 overflow-hidden flex items-center justify-center relative shadow-inner p-[1px]"
      >
        <img
          src="/logo.png"
          alt="Wings River Café - Taste, Eat & Rides Multicuisine Logo"
          className="w-full h-full object-contain p-0.5 rounded-[22px] group-hover:scale-105 transition-transform duration-500"
          style={{ borderRadius: '22px' }}
        />
      </div>
    </div>
  );
}
