'use client';

import React from 'react';
import { Users, Waves, UtensilsCrossed, ShoppingBag, Truck, ChefHat, Sun, Moon, Anchor } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: 'Family Restaurant',
      desc: 'Spacious seating setups tailored for family dinners, reunions & kids.',
      badge: 'Family Friendly'
    },
    {
      icon: Waves,
      title: 'Riverside View',
      desc: 'Unobstructed scenic waterfront vistas along the quiet Gomti River.',
      badge: 'Panoramic'
    },
    {
      icon: Anchor,
      title: 'Speedboat Rides',
      desc: 'Official Lucknow Water Sports jet boating and speedboat rides at our private dock.',
      badge: 'Water Sports'
    },
    {
      icon: UtensilsCrossed,
      title: 'Dine In',
      desc: 'Elevated indoor AC fine dining and outdoor river deck dining options.',
      badge: 'Luxury Comfort'
    },
    {
      icon: ShoppingBag,
      title: 'Takeaway',
      desc: 'Quick, hygienic packing for your favorite meals on the go.',
      badge: 'Express Service'
    },
    {
      icon: Truck,
      title: 'No Contact Delivery',
      desc: 'Fresh, piping hot multicuisine delivered right to your doorstep.',
      badge: 'Safe & Clean'
    },
    {
      icon: ChefHat,
      title: 'Multicuisine',
      desc: 'North Indian gravies, authentic Chinese woks, Italian pastas & woodfired pizzas.',
      badge: 'Chef Specials'
    },
    {
      icon: Sun,
      title: 'Outdoor Seating',
      desc: 'Breeze outdoor terrace tables under green ceiling foliage & floral arches.',
      badge: 'Fresh Breeze'
    },
    {
      icon: Moon,
      title: 'Evening Ambience',
      desc: 'Illuminated fairy light arches, cozy bonfire setups & romantic night decor.',
      badge: 'Magical Nights'
    }
  ];

  return (
    <section className="py-20 bg-dark-900 text-white relative overflow-hidden">
      {/* Background Gradient & Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-mint-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-mint-400/20 border border-mint-400/30 text-mint-300 font-semibold text-xs tracking-widest uppercase mb-3">
            Why Choose Wings River Café
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Unrivaled Experience By The River
          </h2>
          <p className="font-sans text-gray-300 text-base sm:text-lg">
            Designed for unforgettable dining, festive events, and exhilarating waterfront leisure.
          </p>
        </div>

        {/* Feature Cards Grid (Glass Cards with Hover Animations) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-white/5 backdrop-blur-lg border border-white/10 hover:border-mint-400/60 p-6 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-mint-500/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-400/20 to-gold-400/20 border border-mint-300/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-6 h-6 text-mint-300 group-hover:text-gold-400 transition-colors" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-gold-300 border border-white/10">
                  {item.badge}
                </span>
              </div>

              <h3 className="font-serif font-bold text-xl text-white group-hover:text-mint-300 transition-colors mb-2">
                {item.title}
              </h3>

              <p className="font-sans text-sm text-gray-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
