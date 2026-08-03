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
    <section id="about" className="py-16 sm:py-24 bg-[#0B0E14] text-white relative overflow-hidden border-t border-[#D4AF37]/15">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left: Image Collage ─────────────────────────────────── */}
          <div className="relative group">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#D4AF37]/20 via-[#F5D061]/10 to-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />

            {/* Primary image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 bg-[#10141D]">
              <img
                src={settings.aboutPrimaryImage || '/images/Screenshot_20260720-180544_Maps.png'}
                alt="Wings River Cafe Waterfront & Water Sports"
                loading="lazy"
                className="w-full h-[280px] sm:h-[360px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#0B0E14] text-[10px] font-extrabold rounded-full mb-2 shadow-lg">
                  Lucknow Water Sports &amp; Café
                </span>
                <p className="font-serif font-bold text-lg sm:text-xl text-[#F8E7A1] drop-shadow-md leading-tight">
                  Laxman Mela Ground Waterfront
                </p>
                <p className="text-xs text-slate-300 mt-1">Gomti Riverfront Deck &amp; Speedboat Dock</p>
              </div>
            </div>

            {/* Secondary floating card */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 w-3/5 rounded-2xl overflow-hidden shadow-2xl border border-[#D4AF37]/50 hidden sm:block group/sub">
              <img
                src={settings.aboutSecondaryImage || '/images/Screenshot_20260720-180644_Maps.png'}
                alt="Evening Party Canopy at Wings River Cafe"
                loading="lazy"
                className="w-full h-40 object-cover group-hover/sub:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14]/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-xs font-bold text-[#F5D061]">Evening Celebration Canopy</div>
            </div>

            {/* Emblem */}
            <div className="absolute -top-6 -left-6 hidden sm:block">
              <CircularLogo size={88} className="shadow-2xl shadow-amber-500/10" />
            </div>
          </div>

          {/* ── Right: Narrative ────────────────────────────────────── */}
          <div className="pt-4 sm:pt-0">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141A24] border border-[#D4AF37]/35 text-[#F8E7A1] text-[10px] font-bold uppercase tracking-wider mb-4 shadow-lg">
              <Award className="w-3.5 h-3.5 text-[#F5D061]" />
              <span>{settings.aboutBadge || 'Premium Multicuisine & Waterfront Haven'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              {settings.aboutTitle || 'Welcome to Wings River Café'}
            </h2>

            <p className="font-sans text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
              {settings.aboutParagraph1 ||
                'Located inside Laxman Mela Ground at Laxman Jhula Park along the scenic Gomti River in Lucknow, Wings River Café is a premier destination where exquisite multicuisine gastronomy meets breathtaking riverside ambience and thrilling Lucknow Water Sports speedboat rides.'}
            </p>

            <p className="font-sans text-slate-400 text-sm leading-relaxed mb-6">
              {settings.aboutParagraph2 ||
                'Whether you are planning a relaxed family gathering, a festive birthday party under our sparkling fairy-light canopy, or a romantic candlelit evening beside the gentle river waters, our elevated indoor & outdoor dining decks offer an unforgettable experience.'}
            </p>

            {/* Key highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[#10141D]/90 border border-[#D4AF37]/25 text-white shadow-lg">
                <ShieldCheck className="w-5 h-5 text-[#F5D061] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs font-serif">{settings.highlight1Title || 'Multicuisine Delights'}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">{settings.highlight1Subtitle || 'North Indian, Chinese, Italian, Pizzas & Artisanal Coffee'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-2xl bg-[#10141D]/90 border border-[#D4AF37]/25 text-white shadow-lg">
                <Anchor className="w-5 h-5 text-[#F5D061] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs font-serif">{settings.highlight2Title || 'Water Sports & Rides'}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">{settings.highlight2Subtitle || 'Speedboats & jet rides directly accessible at our river jetty'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────── */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#10141D]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-4 shadow-xl hover:border-[#D4AF37]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#18202E] border border-[#D4AF37]/35 flex items-center justify-center mb-2 group-hover:bg-gradient-to-br group-hover:from-[#F5D061] group-hover:to-[#D4AF37] transition-all">
                <stat.icon className="w-4 h-4 text-[#F5D061] group-hover:text-[#0B0E14] transition-colors" />
              </div>
              <span className="font-serif font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight">
                {stat.value}
              </span>
              <span className="font-sans font-semibold text-xs text-amber-200 mt-1">{stat.label}</span>
              <span className="font-sans text-[10px] text-slate-400 mt-0.5">{stat.subText}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
