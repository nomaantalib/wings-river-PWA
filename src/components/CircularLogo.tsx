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
      className={`relative rounded-full p-[3px] bg-gradient-to-tr from-gold-500 via-mint-300 to-gold-400 shadow-xl flex items-center justify-center select-none group transition-transform duration-500 hover:scale-105 ${className}`}
    >
      {/* Inner Circular Frame */}
      <div className="w-full h-full rounded-full bg-cream-50 border-2 border-mint-200 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden shadow-inner">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-mint-50/50 via-transparent to-gold-300/10 pointer-events-none" />

        {/* Top Decorative Leaf Emblem */}
        <div className="flex items-center justify-center space-x-0.5 text-mint-500 mb-[1px]">
          <svg className="w-4 h-4 fill-current transform -rotate-12" viewBox="0 0 24 24">
            <path d="M17,8C8,10,59,16.17,3.83,12C-0.5,7.83,2,2,2,2S8,2,12.17,6.17C16.34,10.34,17,8,17,8Z" />
          </svg>
          <svg className="w-4 h-4 fill-current transform rotate-12" viewBox="0 0 24 24">
            <path d="M17,8C8,10,59,16.17,3.83,12C-0.5,7.83,2,2,2,2S8,2,12.17,6.17C16.34,10.34,17,8,17,8Z" />
          </svg>
        </div>

        {/* Main Cursive Brand Header */}
        <div className="font-serif font-bold text-dark-900 tracking-tight leading-none text-xs sm:text-sm drop-shadow-sm text-gold-600">
          Wings
        </div>
        <div className="font-serif italic text-dark-900 font-extrabold tracking-wide leading-none text-xs text-mint-600">
          River
        </div>

        {/* Slogan Pill */}
        <div className="my-[2px] px-1.5 py-[1px] bg-mint-300/40 rounded-full border border-mint-400/50">
          <span className="text-[7px] uppercase font-bold tracking-wider text-dark-900 block leading-tight">
            Taste • Eat • Rides
          </span>
        </div>

        {/* Bottom Sub-tag */}
        <div className="text-[7.5px] font-sans font-semibold text-gray-700 tracking-tighter leading-none">
          Multicuisine Café
        </div>
      </div>
    </div>
  );
}
