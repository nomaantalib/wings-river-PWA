'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Anchor, ShieldCheck, HeartHandshake, Waves, Ticket,
  ZoomIn, ZoomOut, X, Download, Maximize2, CheckCircle2,
  IndianRupee, AlertCircle, Clock
} from 'lucide-react';
import { getStoredWaterSports, RideTicket, WATER_SPORTS_RIDES } from '@/lib/db';

interface WaterSportsTicketsProps {
  onOpenBooking: (type?: string) => void;
}

export default function WaterSportsTickets({ onOpenBooking }: WaterSportsTicketsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Water Sports' | 'Other Activities'>('All');
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredRide, setHoveredRide] = useState<string | null>(null);
  const [rides, setRides] = useState<RideTicket[]>(WATER_SPORTS_RIDES);

  useEffect(() => {
    const refreshData = () => { getStoredWaterSports().then(setRides); };
    refreshData();
    window.addEventListener('wings_db_sync', refreshData);
    return () => window.removeEventListener('wings_db_sync', refreshData);
  }, []);

  const filteredRides = rides.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.3, 4));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.3, 0.5));
  const resetZoom = () => setZoomLevel(1);

  return (
    <section id="water-sports-tickets" className="pt-12 pb-6 bg-dark-950 relative overflow-hidden">
      {/* Ambient decorations */}
      <div className="absolute -top-20 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-mint-500 to-gold-500" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-mint-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── HERO HEADER CARD ── */}
        <div className="relative rounded-3xl overflow-hidden mb-16 shadow-2xl border border-gold-400/25">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url('/images/Screenshot_20260720-180544_Maps.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2244] to-[#061525]" style={{ opacity: 0.93 }} />

          {/* Wave SVG decoration */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
            <svg viewBox="0 0 1200 80" className="w-full" preserveAspectRatio="none">
              <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" fill="rgba(255,255,255,0.04)" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch p-8 sm:p-12">
            {/* Left: Text */}
            <div className="lg:col-span-3 space-y-5">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-yellow-400 text-dark-950 font-extrabold text-xs tracking-wider uppercase shadow-md">
                <Ticket className="w-4 h-4" />
                <span>Lucknow Water Sports — Official Tokens</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                All Tokens & Tickets<br />
                <span className="text-yellow-400">Available Here!</span>
              </h2>

              <p className="font-sans text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                Reserve your ride token online and skip the queue — then simply <strong className="text-yellow-300">pay at the counter</strong> when you arrive. Tokens are valid for the same day.
              </p>

              {/* Pay at Counter Notice */}
              <div className="flex items-start space-x-3 bg-yellow-400/15 border border-yellow-400/40 rounded-2xl px-5 py-4">
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-extrabold text-sm">Online Reservation → Pay at Counter</p>
                  <p className="text-blue-200 text-xs mt-0.5 leading-relaxed">
                    All ride tokens & tickets are available <strong>only at the physical counter</strong> beside Wings River Café. Reserve your spot online now — payment is collected at the waterfront.
                  </p>
                </div>
              </div>

              {/* Safety Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs text-blue-100 border border-white/15">
                  <ShieldCheck className="w-4 h-4 text-mint-400" />
                  <span>Safe Rides · Your Safety Our Priority</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs text-yellow-200 border border-white/15">
                  <HeartHandshake className="w-4 h-4 text-yellow-400" />
                  <span>Happy Rides · Fun for Everyone</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs text-blue-100 border border-white/15">
                  <Waves className="w-4 h-4 text-mint-300" />
                  <span>Feel the Thrill · Splash & Make Memories!</span>
                </div>
              </div>
            </div>

            {/* Right: Official Poster Card */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Poster preview */}
              <div
                className="relative rounded-2xl overflow-hidden border-2 border-yellow-400/50 shadow-2xl cursor-pointer group flex-1 min-h-[200px]"
                onClick={() => setShowPosterModal(true)}
              >
                <img
                  src="/images/watersports_menu.jpg"
                  alt="Lucknow Water Sports — Official Rate Poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-dark-950/30 group-hover:bg-dark-950/10 transition-colors flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm text-dark-900 font-bold text-xs px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg group-hover:scale-110 transition-transform">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Full Rate Poster</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-yellow-400 text-dark-950 text-[10px] font-extrabold uppercase">Official</div>
              </div>

              {/* Reserve CTA */}
              <button
                onClick={() => onOpenBooking('speedboat_ride')}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-mint-400 text-dark-950 font-extrabold text-sm rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center space-x-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Reserve Ride Token Now — Pay at Counter</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CATEGORY FILTER ── */}
        <div className="flex items-center justify-center space-x-3 mb-10">
          {(['All', 'Water Sports', 'Other Activities'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-mint-300 via-mint-400 to-gold-400 text-dark-950 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10'
              }`}
            >
              {cat === 'Water Sports' ? '🌊 ' : cat === 'Other Activities' ? '🎡 ' : '🎯 '}{cat}
            </button>
          ))}
        </div>

        {/* ── RIDE CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRides.map((ride) => (
            <div
              key={ride.id}
              onMouseEnter={() => setHoveredRide(ride.id)}
              onMouseLeave={() => setHoveredRide(null)}
              className="bg-dark-900/40 backdrop-blur-sm border border-white/10 hover:border-gold-400/40 hover:shadow-2xl hover:shadow-gold-500/10 hover:-translate-y-1 transition-all duration-400 flex flex-col group rounded-3xl overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden bg-gray-900">
                <img
                  src={ride.image}
                  alt={ride.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Blur layer on hover */}
                <div className={`absolute inset-0 bg-cover bg-center blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 scale-110`}
                  style={{ backgroundImage: `url(${ride.image})` }} />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-dark-950/85 backdrop-blur-md text-gold-400 text-[10px] font-bold uppercase tracking-wider border border-gold-400/30">
                    {ride.badge || ride.category}
                  </span>
                </div>

                {/* Price pill */}
                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-mint-300 to-gold-400 text-dark-950 font-serif font-extrabold text-base px-4 py-1.5 rounded-full shadow-lg">
                  ₹{ride.price}
                  <span className="text-[9px] font-sans font-normal ml-1 opacity-90">/ {ride.unit}</span>
                </div>

                {/* Category chip */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold uppercase">
                  {ride.emoji}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mint-400 block mb-1">
                    {ride.category}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-white group-hover:text-gold-300 transition-colors">
                    {ride.emoji} {ride.name}
                  </h3>
                  <p className="font-sans text-xs text-gray-300 leading-relaxed mt-2">{ride.description}</p>
                </div>

                {/* Pay at counter notice */}
                <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span className="text-[10px] text-gold-300 font-semibold">Reserve now · Pay at counter on arrival</span>
                </div>

                <button
                  onClick={() => onOpenBooking(ride.id)}
                  className="w-full py-3 bg-gradient-to-r from-mint-300 to-gold-400 hover:from-mint-200 hover:to-gold-300 text-dark-950 font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-gold-500/20 flex items-center justify-center space-x-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Get Token — {ride.emoji} {ride.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── FOOTER NOTE ── */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col lg:flex-row items-center gap-4 bg-dark-900/60 backdrop-blur-sm border border-white/10 rounded-3xl px-8 py-5 text-gray-300">
            <div className="flex items-center space-x-2 text-mint-300">
              <CheckCircle2 className="w-5 h-5 text-mint-400" />
              <span className="text-sm font-bold">Token reserved online</span>
            </div>
            <span className="text-gray-600 hidden lg:block">→</span>
            <div className="flex items-center space-x-2 text-gold-300">
              <IndianRupee className="w-5 h-5 text-gold-400" />
              <span className="text-sm font-bold">Pay cash at the Lucknow Water Sports counter</span>
            </div>
            <span className="text-gray-600 hidden lg:block">→</span>
            <div className="flex items-center space-x-2 text-mint-300">
              <Waves className="w-5 h-5 text-mint-400" />
              <span className="text-sm font-bold">Enjoy your ride!</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FULLSCREEN POSTER LIGHTBOX ─── */}
      {showPosterModal && (
        <div
          className="fixed inset-0 z-[200] bg-dark-950/97 backdrop-blur-2xl flex flex-col items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowPosterModal(false); resetZoom(); } }}
        >
          {/* Control bar */}
          <div className="flex items-center justify-between w-full max-w-5xl px-4 sm:px-6 py-3 mb-3">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-yellow-400/40" />
              <div>
                <span className="font-serif font-bold text-white text-sm block">Official Rate Poster</span>
                <span className="text-[10px] text-yellow-400 font-semibold uppercase tracking-widest">Lucknow Water Sports</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={zoomOut} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button onClick={resetZoom} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold min-w-[52px] text-center">
                {Math.round(zoomLevel * 100)}%
              </button>
              <button onClick={zoomIn} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                <ZoomIn className="w-4 h-4" />
              </button>
              <a href="/images/watersports_menu.jpg" download="Lucknow_Water_Sports_Rates.jpg"
                className="p-2 rounded-xl bg-mint-400/80 hover:bg-mint-400 text-dark-950 transition-all">
                <Download className="w-4 h-4" />
              </a>
              <button onClick={() => { setShowPosterModal(false); resetZoom(); }}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Poster image */}
          <div className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto px-4">
            <img
              src="/images/watersports_menu.jpg"
              alt="Lucknow Water Sports Official Rate Poster"
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-yellow-400/20 select-none"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out',
              }}
              draggable={false}
            />
          </div>

          {/* CTA below poster */}
          <div className="w-full max-w-5xl px-4 py-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">Press <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-300 rounded text-[10px] font-mono">Esc</kbd> to close</p>
            <button
              onClick={() => { setShowPosterModal(false); onOpenBooking('speedboat_ride'); }}
              className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-mint-400 text-dark-950 font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center space-x-2"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Reserve Token — Pay at Counter</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
