'use client';

import React, { useState, useEffect } from 'react';
import { Award, Users, Star, DollarSign, Clock, ShieldCheck, Anchor, MapPin } from 'lucide-react';
import CircularLogo from './CircularLogo';
import { getStoredHeroSettings, HeroSettings } from '@/lib/db';

export default function AboutSection() {
  const [settings, setSettings] = useState<Partial<HeroSettings>>({});

  useEffect(() => {
    async function loadData() {
      const stored = await getStoredHeroSettings();
      if (stored) setSettings(stored);
    }
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('wings_db_sync', handleSync);
    return () => window.removeEventListener('wings_db_sync', handleSync);
  }, []);

  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Happy Customers',
      subText: 'Satisfied Diners & Parties'
    },
    {
      icon: Star,
      value: '4.9 / 5.0',
      label: 'Guest Rating',
      subText: 'Based on 500+ Reviews'
    },
    {
      icon: DollarSign,
      value: '₹200–1000',
      label: 'Affordable Dining',
      subText: 'Premium Multicuisine Value'
    },
    {
      icon: Clock,
      value: '11 AM–11:59 PM',
      label: 'Open Daily',
      subText: 'Lunch, Sunset & Late Dinner'
    }
  ];

  return (
    <section id="about" className="py-16 sm:py-20 bg-[#FAF7F2] text-[#1F1810] relative overflow-hidden">
      {/* Subtle Ambient Warm Glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#F5D061]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#98A886]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Left Grid: Images Collage & Circular Logo Accent */}
          <div className="relative group">
            {/* Glowing Backdrop Blur Ring */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#F5D061]/30 via-[#E5B82C]/20 to-[#98A886]/30 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" />

            {/* Primary Main Image (River & Deck view) */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E5B82C]/40 bg-white">
              <img
                src={settings.aboutPrimaryImage || "/images/Screenshot_20260720-180544_Maps.png"}
                alt="Wings River Cafe Waterfront & Water Sports"
                className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1810]/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-block px-3 py-1 bg-[#F5D061] text-[#120B08] text-xs font-extrabold rounded-full mb-1.5 shadow-md">
                  Lucknow Water Sports &amp; Café
                </span>
                <p className="font-serif font-bold text-xl text-[#F8E7A1] drop-shadow-md">Laxman Mela Ground Waterfront</p>
                <p className="text-xs text-amber-100/90 mt-0.5">Gomti Riverfront Deck &amp; Speedboat Dock</p>
              </div>
            </div>

            {/* Secondary Floating Overlapping Card (Evening Lights Canopy) */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 w-3/5 rounded-2xl overflow-hidden shadow-2xl border border-[#F5D061]/60 hidden sm:block group/sub">
              <img
                src={settings.aboutSecondaryImage || "/images/Screenshot_20260720-180644_Maps.png"}
                alt="Evening Party Canopy at Wings River Cafe"
                className="w-full h-44 object-cover group-hover/sub:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1810]/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 text-[11px] font-bold text-[#F5D061]">
                Evening Celebration Canopy
              </div>
            </div>

            {/* Overlapping Floating Emblem */}
            <div className="absolute -top-6 -left-6 hidden sm:block">
              <CircularLogo size={90} className="shadow-2xl shadow-yellow-600/20" />
            </div>
          </div>

          {/* Right Grid: About Narrative & Details */}
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1F1810] border border-[#F5D061]/50 text-[#F8E7A1] text-xs font-bold uppercase tracking-wider mb-3 shadow-md">
              <Award className="w-3.5 h-3.5 text-[#F5D061]" />
              <span>{settings.aboutBadge || 'Premium Multicuisine & Waterfront Haven'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1810] tracking-tight leading-tight mb-4">
              {settings.aboutTitle || 'Welcome to Wings River Café'}
            </h2>

            <p className="font-sans text-gray-700 text-base sm:text-lg leading-relaxed mb-4 font-normal">
              {settings.aboutParagraph1 || 'Located inside Laxman Mela Ground at Laxman Jhula Park along the scenic Gomti River in Lucknow, Wings River Café is a premier destination where exquisite multicuisine gastronomy meets breathtaking riverside natural ambience and thrilling Lucknow Water Sports speedboat rides.'}
            </p>

            <p className="font-sans text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              {settings.aboutParagraph2 || 'Whether you are planning a relaxed family gathering, a festive birthday party under our sparkling fairy-light canopy, or a romantic candlelit evening beside the gentle river waters, our elevated indoor & outdoor dining decks offer an unforgettable experience.'}
            </p>

            {/* Key Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-[#E5B82C]/30 shadow-md">
                <ShieldCheck className="w-5 h-5 text-[#829370] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1F1810] text-xs font-serif">Multicuisine Delights</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">North Indian, Chinese, Italian, Pizzas &amp; Artisanal Coffee</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-[#E5B82C]/30 shadow-md">
                <Anchor className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#1F1810] text-xs font-serif">Water Sports &amp; Rides</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">Speedboats &amp; jet rides directly accessible at our river jetty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reduced Compact Stats Cards Grid */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/90 border border-[#E5B82C]/30 rounded-2xl p-3.5 sm:p-4 shadow-md hover:shadow-xl hover:border-[#E5B82C]/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#F5D061]/50 flex items-center justify-center mb-2 group-hover:bg-[#F5D061] transition-colors">
                <stat.icon className="w-4 h-4 text-[#C59B27] group-hover:text-[#120B08] transition-colors" />
              </div>
              <span className="font-serif font-extrabold text-lg sm:text-xl text-[#1F1810] tracking-tight">
                {stat.value}
              </span>
              <span className="font-sans font-bold text-xs text-[#2A2218] mt-0.5">{stat.label}</span>
              <span className="font-sans text-[10px] text-gray-500 mt-0.5">{stat.subText}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
