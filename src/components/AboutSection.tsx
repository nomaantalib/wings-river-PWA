'use client';

import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, Clock, Award, ShieldCheck, HeartHandshake, Anchor } from 'lucide-react';
import CircularLogo from './CircularLogo';
import { getStoredHeroSettings, HeroSettings, DEFAULT_HERO_SETTINGS } from '@/lib/db';

export default function AboutSection() {
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);

  useEffect(() => {
    let isSubscribed = true;
    getStoredHeroSettings().then((data) => {
      if (isSubscribed && data) setSettings(data);
    });

    const handleSync = async () => {
      const updated = await getStoredHeroSettings();
      if (isSubscribed && updated) setSettings(updated);
    };

    window.addEventListener('wings_db_sync', handleSync);
    return () => {
      isSubscribed = false;
      window.removeEventListener('wings_db_sync', handleSync);
    };
  }, []);

  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Happy Customers',
      subText: 'Satisfied Diners & Parties',
      color: 'text-mint-600',
      bgColor: 'bg-mint-100',
      cardBg: 'bg-white border-mint-100'
    },
    {
      icon: Award,
      value: '4.9 / 5.0',
      label: 'Guest Rating',
      subText: 'Based on 500+ Google Reviews',
      color: 'text-dark-900',
      bgColor: 'bg-gold-500',
      cardBg: 'bg-gold-300/25 border-gold-400/50 shadow-gold-500/10'
    },
    {
      icon: IndianRupee,
      value: '₹200–1000',
      label: 'Affordable Dining',
      subText: 'Premium Multicuisine Value',
      color: 'text-mint-700',
      bgColor: 'bg-mint-100',
      cardBg: 'bg-white border-mint-100'
    },
    {
      icon: Clock,
      value: '11 AM–11:59 PM',
      label: 'Open Daily',
      subText: 'Lunch, Sunset & Late Dinner',
      color: 'text-gold-600',
      bgColor: 'bg-gold-300/30',
      cardBg: 'bg-white border-mint-100'
    }
  ];

  return (
    <section id="about" className="py-20 bg-[#0B0E14] text-[#F5EBE0] relative overflow-hidden">
      {/* Subtle Background Pattern & Ambient Lighting */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#F5D061]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#98A886]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Grid: Images Collage & Circular Logo Accent */}
          <div className="relative group">
            {/* Glowing Backdrop Blur Ring */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#F5D061]/30 via-[#E5B82C]/20 to-[#98A886]/30 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" />

            {/* Primary Main Image (River & Deck view) */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#F5D061]/40 bg-dark-900">
              <img
                src={settings.aboutPrimaryImage || "/images/Screenshot_20260720-180544_Maps.png"}
                alt="Wings River Cafe Waterfront & Water Sports"
                className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-dark-950/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-block px-3.5 py-1 bg-[#F5D061] text-[#120B08] text-xs font-extrabold rounded-full mb-1.5 shadow-md">
                  Lucknow Water Sports &amp; Café
                </span>
                <p className="font-serif font-bold text-xl text-[#F8E7A1] drop-shadow-md">Laxman Mela Ground Waterfront</p>
                <p className="text-xs text-[#D4C4A0]/80 mt-0.5">Gomti Riverfront Deck &amp; Speedboat Dock</p>
              </div>
            </div>

            {/* Secondary Floating Overlapping Card (Evening Lights Canopy) */}
            <div className="absolute -bottom-8 -right-4 sm:-right-8 w-3/5 rounded-2xl overflow-hidden shadow-2xl border border-[#F5D061]/50 hidden sm:block group/sub">
              <img
                src={settings.aboutSecondaryImage || "/images/Screenshot_20260720-180644_Maps.png"}
                alt="Evening Party Canopy at Wings River Cafe"
                className="w-full h-48 object-cover group-hover/sub:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 text-[11px] font-bold text-[#F5D061]">
                Evening Celebration Canopy
              </div>
            </div>

            {/* Overlapping Floating Emblem */}
            <div className="absolute -top-6 -left-6 hidden sm:block">
              <CircularLogo size={100} className="shadow-2xl shadow-yellow-500/20" />
            </div>
          </div>

          {/* Right Grid: About Narrative & Details */}
          <div>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#1F1810] border border-[#F5D061]/30 text-[#F8E7A1] text-xs font-bold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5 text-[#F5D061]" />
              <span>{settings.aboutBadge || 'Premium Multicuisine & Waterfront Haven'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8E7A1] tracking-tight leading-tight mb-4">
              {settings.aboutTitle || 'Welcome to Wings River Café'}
            </h2>

            <p className="font-sans text-[#D4C4A0]/90 text-base sm:text-lg leading-relaxed mb-4">
              {settings.aboutParagraph1 || 'Located inside Laxman Mela Ground at Laxman Jhula Park along the scenic Gomti River in Lucknow, Wings River Café is a premier destination where exquisite multicuisine gastronomy meets breathtaking riverside natural ambience and thrilling Lucknow Water Sports speedboat rides.'}
            </p>

            <p className="font-sans text-[#D4C4A0]/70 text-sm sm:text-base leading-relaxed mb-8">
              {settings.aboutParagraph2 || 'Whether you are planning a relaxed family gathering, a festive birthday party under our sparkling fairy-light canopy, or a romantic candlelit evening beside the gentle river waters, our elevated indoor & outdoor dining decks offer an unforgettable experience.'}
            </p>

            {/* Key Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#14171D] border border-[#F5D061]/20 shadow-md">
                <ShieldCheck className="w-5 h-5 text-[#98A886] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#F8E7A1] text-sm font-serif">Multicuisine Delights</h4>
                  <p className="text-xs text-[#D4C4A0]/70 mt-0.5">North Indian, Chinese, Italian, Pizzas &amp; Artisanal Coffee</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#14171D] border border-[#F5D061]/20 shadow-md">
                <Anchor className="w-5 h-5 text-[#F5D061] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#F8E7A1] text-sm font-serif">Water Sports &amp; Rides</h4>
                  <p className="text-xs text-[#D4C4A0]/70 mt-0.5">Speedboats &amp; jet rides directly accessible at our river jetty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#14171D]/90 border border-[#F5D061]/25 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-[#F5D061]/60 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1A1D24] border border-[#F5D061]/40 flex items-center justify-center mb-3 group-hover:bg-[#F5D061] transition-colors">
                <stat.icon className="w-6 h-6 text-[#F5D061] group-hover:text-[#120B08] transition-colors" />
              </div>
              <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#F8E7A1] tracking-tight">
                {stat.value}
              </span>
              <span className="font-sans font-bold text-xs sm:text-sm text-[#F5EBE0] mt-1">{stat.label}</span>
              <span className="font-sans text-xs text-[#D4C4A0]/70 mt-0.5">{stat.subText}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
