'use client';

import React, { useState, useEffect } from 'react';
import { Award, Users, DollarSign, Clock, ShieldCheck, Anchor } from 'lucide-react';
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
    { icon: Users,      value: '500+',         label: 'Happy Customers',  subText: 'Satisfied Diners & Parties'    },
    { icon: Award,      value: '4.9 / 5.0',    label: 'Guest Rating',     subText: 'Based on 500+ Reviews'        },
    { icon: DollarSign, value: '₹200–1000',    label: 'Affordable Dining',subText: 'Premium Multicuisine Value'   },
    { icon: Clock,      value: '11 AM–11:59 PM',label: 'Open Daily',      subText: 'Lunch, Sunset & Late Dinner'  },
  ];

  return (
    <section id="about" className="py-10 sm:py-14 bg-[#FAF7F2] text-[#1F1810] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-[#F5D061]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-[#98A886]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* ── Left: Image Collage ─────────────────────────────────── */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#F5D061]/25 via-[#E5B82C]/15 to-[#98A886]/25 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />

            {/* Primary image */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#E5B82C]/40 bg-white">
              <img
                src={settings.aboutPrimaryImage || '/images/Screenshot_20260720-180544_Maps.png'}
                alt="Wings River Cafe Waterfront & Water Sports"
                decoding="async"
                className="w-full h-[260px] sm:h-[320px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1810]/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-block px-2.5 py-0.5 bg-[#F5D061] text-[#120B08] text-[10px] font-extrabold rounded-full mb-1 shadow-md">
                  Lucknow Water Sports &amp; Café
                </span>
                <p className="font-serif font-bold text-base sm:text-lg text-[#F8E7A1] drop-shadow-md leading-tight">
                  Laxman Mela Ground Waterfront
                </p>
                <p className="text-[10px] text-amber-100/90 mt-0.5">Gomti Riverfront Deck &amp; Speedboat Dock</p>
              </div>
            </div>

            {/* Secondary floating card */}
            <div className="absolute -bottom-5 -right-3 sm:-right-5 w-3/5 rounded-2xl overflow-hidden shadow-2xl border border-[#F5D061]/60 hidden sm:block group/sub">
              <img
                src={settings.aboutSecondaryImage || '/images/Screenshot_20260720-180644_Maps.png'}
                alt="Evening Party Canopy at Wings River Cafe"
                decoding="async"
                className="w-full h-36 object-cover group-hover/sub:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1810]/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 text-[10px] font-bold text-[#F5D061]">Evening Celebration Canopy</div>
            </div>

            {/* Emblem */}
            <div className="absolute -top-5 -left-5 hidden sm:block">
              <CircularLogo size={80} className="shadow-2xl shadow-yellow-600/20" />
            </div>
          </div>

          {/* ── Right: Narrative ────────────────────────────────────── */}
          <div className="pt-4 sm:pt-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1F1810] border border-[#F5D061]/50 text-[#F8E7A1] text-[10px] font-bold uppercase tracking-wider mb-3 shadow-md">
              <Award className="w-3 h-3 text-[#F5D061]" />
              <span>{settings.aboutBadge || 'Premium Multicuisine & Waterfront Haven'}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F1810] tracking-tight leading-tight mb-3">
              {settings.aboutTitle || 'Welcome to Wings River Café'}
            </h2>

            <p className="font-sans text-gray-700 text-sm sm:text-base leading-relaxed mb-3">
              {settings.aboutParagraph1 ||
                'Located inside Laxman Mela Ground at Laxman Jhula Park along the scenic Gomti River in Lucknow, Wings River Café is a premier destination where exquisite multicuisine gastronomy meets breathtaking riverside ambience and thrilling Lucknow Water Sports speedboat rides.'}
            </p>

            <p className="font-sans text-gray-600 text-sm leading-relaxed mb-5">
              {settings.aboutParagraph2 ||
                'Whether you are planning a relaxed family gathering, a festive birthday party under our sparkling fairy-light canopy, or a romantic candlelit evening beside the gentle river waters, our elevated indoor & outdoor dining decks offer an unforgettable experience.'}
            </p>

            {/* Key highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-mint-800 border border-gold-500/40 text-white shadow-md">
                <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs font-serif">{settings.highlight1Title || 'Multicuisine Delights'}</h4>
                  <p className="text-[10px] text-mint-100 mt-0.5">{settings.highlight1Subtitle || 'North Indian, Chinese, Italian, Pizzas & Artisanal Coffee'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-mint-800 border border-gold-500/40 text-white shadow-md">
                <Anchor className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs font-serif">{settings.highlight2Title || 'Water Sports & Rides'}</h4>
                  <p className="text-[10px] text-mint-100 mt-0.5">{settings.highlight2Subtitle || 'Speedboats & jet rides directly accessible at our river jetty'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/90 border border-[#E5B82C]/30 rounded-2xl p-3 sm:p-3.5 shadow-md hover:shadow-lg hover:border-[#E5B82C]/60 hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#F5D061]/50 flex items-center justify-center mb-1.5 group-hover:bg-[#F5D061] transition-colors">
                <stat.icon className="w-3.5 h-3.5 text-[#C59B27] group-hover:text-[#120B08] transition-colors" />
              </div>
              <span className="font-serif font-extrabold text-base sm:text-lg text-[#1F1810] tracking-tight leading-tight">
                {stat.value}
              </span>
              <span className="font-sans font-bold text-[10px] sm:text-xs text-[#2A2218] mt-0.5">{stat.label}</span>
              <span className="font-sans text-[9px] sm:text-[10px] text-gray-500 mt-0.5">{stat.subText}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
