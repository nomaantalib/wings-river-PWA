'use client';

import React, { useState } from 'react';
import { Anchor, ShieldCheck, HeartHandshake, Waves, Sparkles, Ticket, Calendar, CheckCircle2 } from 'lucide-react';

interface WaterSportsTicketsProps {
  onOpenBooking: (type?: string) => void;
}

export interface RideTicket {
  id: string;
  name: string;
  category: 'Water Sports' | 'Other Activities';
  price: number;
  unit: string;
  description: string;
  badge?: string;
  image: string;
}

export const WATER_SPORTS_RIDES: RideTicket[] = [
  {
    id: 'ride-1',
    name: 'Jetski Thrill Ride',
    category: 'Water Sports',
    price: 350,
    unit: 'Per Person 1 Round',
    description: 'High speed jet ski adventure on Gomti river with certified instructor & life jacket.',
    badge: 'Most Popular',
    image: '/images/Screenshot_20260720-180544_Maps.png'
  },
  {
    id: 'ride-2',
    name: 'Speed Boat Ride',
    category: 'Water Sports',
    price: 250,
    unit: 'Per Person 1 Round',
    description: 'Exhilarating twin-engine speedboat ride offering panoramic riverfront views.',
    badge: 'Family Favorite',
    image: '/images/Screenshot_20260720-180745_Maps.png'
  },
  {
    id: 'ride-3',
    name: 'Motor Boat Cruise',
    category: 'Water Sports',
    price: 200,
    unit: 'Per Person 1 Round',
    description: 'Smooth & comfortable motor boat cruise around Laxman Jhula park riverfront.',
    badge: 'Scenic Cruise',
    image: '/images/Screenshot_20260720-180555_Maps.png'
  },
  {
    id: 'ride-4',
    name: 'Panda Train',
    category: 'Other Activities',
    price: 50,
    unit: 'Per Person 1 Round',
    description: 'Fun musical track train ride for toddlers, kids & families near the river park.',
    badge: 'Kids Zone',
    image: '/images/Screenshot_20260720-180609_Maps.png'
  },
  {
    id: 'ride-5',
    name: 'Electric Kids Car',
    category: 'Other Activities',
    price: 50,
    unit: 'Per Person 1 Round',
    description: 'Illuminated battery-powered electric drive cars for young adventurers.',
    badge: 'Kids Fun',
    image: '/images/Screenshot_20260720-180621_Maps.png'
  },
  {
    id: 'ride-6',
    name: 'Trampoline Jump',
    category: 'Other Activities',
    price: 50,
    unit: 'Per Person 1 Round',
    description: 'Enclosed safety netting high-bounce jumping trampoline enclosure.',
    badge: 'Active Play',
    image: '/images/Screenshot_20260720-180737_Maps.png'
  }
];

export default function WaterSportsTickets({ onOpenBooking }: WaterSportsTicketsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Water Sports' | 'Other Activities'>('All');

  const filteredRides = WATER_SPORTS_RIDES.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  return (
    <section id="water-sports-tickets" className="py-16 bg-cream-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Poster Style Ticket Header */}
        <div className="bg-gradient-to-r from-dark-950 via-mint-900 to-dark-950 rounded-3xl p-8 sm:p-12 border-2 border-gold-400/40 shadow-2xl text-white relative overflow-hidden mb-12">
          {/* Subtle Background Waves */}
          <div className="absolute inset-0 bg-[radial-gradient(#8FD3C7_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold-400 text-dark-950 font-extrabold text-xs tracking-wider uppercase shadow-md">
                <Ticket className="w-4 h-4" />
                <span>Lucknow Water Sports Counter</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                All Tokens & Tickets Available Here
              </h2>

              <p className="font-sans text-cream-200 text-sm sm:text-base max-w-2xl">
                Official ride tokens for Gomti river speedboats, jet skis, motor boats & kids amusement rides are available directly at our riverside counter beside Wings River Café.
              </p>

              {/* Safety Badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-xl text-xs text-mint-200 border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-mint-400" />
                  <span>Safe Rides (Your Safety Our Priority)</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-xl text-xs text-gold-300 border border-white/10">
                  <HeartHandshake className="w-4 h-4 text-gold-400" />
                  <span>Happy Rides (Fun for Everyone)</span>
                </div>
              </div>
            </div>

            {/* Poster Highlight Card */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-gold-400 text-dark-950 flex items-center justify-center mx-auto shadow-lg">
                <Anchor className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-white">Instant Ticket Reservation</h3>
              <p className="text-xs text-cream-200">
                Reserve your ride token online to bypass ticket counter lines during peak hours.
              </p>
              <button
                onClick={() => onOpenBooking('speedboat_ride')}
                className="w-full py-3 bg-gradient-to-r from-mint-300 via-mint-400 to-gold-400 text-dark-950 font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform"
              >
                Book Ride Token Now
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center space-x-3 mb-10">
          {(['All', 'Water Sports', 'Other Activities'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-mint-500 text-dark-950 shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-mint-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ride Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRides.map((ride) => (
            <div
              key={ride.id}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-cream-200 hover:border-mint-400 hover:shadow-2xl transition-all duration-300 flex flex-col group"
            >
              {/* Image & Badge */}
              <div className="relative h-52 w-full overflow-hidden bg-gray-900">
                <img
                  src={ride.image}
                  alt={ride.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-gold-400 text-[10px] font-bold uppercase tracking-wider border border-gold-400/30">
                    {ride.badge || ride.category}
                  </span>
                </div>

                {/* Price Pill */}
                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-mint-500 to-gold-400 text-dark-950 font-serif font-extrabold text-base px-4 py-1.5 rounded-full shadow-lg">
                  ₹{ride.price} <span className="text-[10px] font-sans font-normal text-dark-900">/ {ride.unit}</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mint-600 block mb-1">
                    {ride.category}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-dark-900 group-hover:text-mint-700 transition-colors">
                    {ride.name}
                  </h3>
                  <p className="font-sans text-xs text-gray-600 leading-relaxed mt-2">
                    {ride.description}
                  </p>
                </div>

                <button
                  onClick={() => onOpenBooking('speedboat_ride')}
                  className="w-full py-3 bg-cream-100 hover:bg-mint-400 text-dark-900 font-bold text-xs rounded-xl border border-mint-200 transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Ticket className="w-3.5 h-3.5 text-gold-600" />
                  <span>Reserve {ride.name} Token</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
