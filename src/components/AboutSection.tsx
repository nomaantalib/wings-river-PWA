'use client';

import React, { useState, useEffect } from 'react';
import { Users, Star, IndianRupee, Clock, Award, ShieldCheck, HeartHandshake, Anchor } from 'lucide-react';
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
    <section id="about" className="py-20 bg-cream-100 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#8FD3C7_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Grid: Images Collage & Circular Logo Accent */}
          <div className="relative group">
            {/* Glowing Backdrop Blur Ring */}
            <div className="absolute -inset-2 bg-gradient-to-r from-mint-400 via-gold-400 to-mint-500 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-65 transition-opacity duration-700 pointer-events-none" />

            {/* Primary Main Image (River & Deck view) */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-dark-900">
              <img
                src={settings.aboutPrimaryImage || "/images/Screenshot_20260720-180544_Maps.png"}
                alt="Wings River Cafe Waterfront & Water Sports"
                className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/85 via-dark-950/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-block px-3.5 py-1 bg-mint-400 text-dark-950 text-xs font-extrabold rounded-full mb-1.5 shadow-md">
                  Lucknow Water Sports & Café
                </span>
                <p className="font-serif font-bold text-xl text-white drop-shadow-md">Laxman Mela Ground Waterfront</p>
                <p className="text-xs text-cream-200 mt-0.5">Gomti Riverfront Deck & Speedboat Dock</p>
              </div>
            </div>

            {/* Secondary Floating Overlapping Card (Evening Lights Canopy) */}
            <div className="absolute -bottom-8 -right-4 sm:-right-8 w-3/5 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/90 hidden sm:block group/sub shadow-gold-500/20">
              <img
                src={settings.aboutSecondaryImage || "/images/Screenshot_20260720-180609_Maps.png"}
                alt="Evening Party Canopy at Wings River Cafe"
                className="w-full h-48 object-cover group-hover/sub:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 text-[11px] font-bold text-gold-300">
                ✨ Fairy Light Celebration Canopy
              </div>
            </div>

            {/* Overlapping Floating Emblem */}
            <div className="absolute -top-6 -left-6 hidden sm:block">
              <CircularLogo size={100} className="shadow-2xl shadow-mint-400/30" />
            </div>
          </div>

          {/* Right Grid: About Narrative & Details */}
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-mint-200/60 border border-mint-300 text-mint-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5 text-gold-600" />
              <span>{settings.aboutBadge || 'Premium Multicuisine & Waterfront Haven'}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 tracking-tight leading-tight mb-4">
              {settings.aboutTitle || 'Welcome to Wings River Café'}
            </h2>

            <p className="font-sans text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
              {settings.aboutParagraph1 || 'Located inside Laxman Mela Ground at Laxman Jhula Park along the scenic Gomti River in Lucknow, Wings River Café is a premier destination where exquisite multicuisine gastronomy meets breathtaking riverside natural ambience and thrilling Lucknow Water Sports speedboat rides.'}
            </p>

            <p className="font-sans text-gray-600 text-sm sm:text-base leading-relaxed mb-8">
              {settings.aboutParagraph2 || 'Whether you are planning a relaxed family gathering, a festive birthday party under our sparkling fairy-light canopy, or a romantic candlelit evening beside the gentle river waters, our elevated indoor & outdoor dining decks offer an unforgettable experience.'}
            </p>

            {/* Key Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-white shadow-sm border border-cream-200">
                <ShieldCheck className="w-5 h-5 text-mint-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-dark-900 text-sm">Multicuisine Delights</h4>
                  <p className="text-xs text-gray-500">North Indian, Chinese, Italian, Pizzas & Artisanal Coffee</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-white shadow-sm border border-cream-200">
                <Anchor className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-dark-900 text-sm">Water Sports & Rides</h4>
                  <p className="text-xs text-gray-500">Speedboats & jet rides directly accessible at our river jetty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.cardBg} rounded-2xl p-6 shadow-lg border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center`}
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="font-serif font-extrabold text-3xl text-dark-900 tracking-tight">
                {stat.value}
              </span>
              <span className="font-sans font-bold text-sm text-gray-800 mt-1">{stat.label}</span>
              <span className="font-sans text-xs text-gray-500 mt-0.5">{stat.subText}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
