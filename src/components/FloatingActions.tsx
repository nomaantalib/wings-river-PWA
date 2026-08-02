'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Instagram, MapPin, MessageCircle, ScanLine } from 'lucide-react';

export default function FloatingActions() {
  const [showQRPulse, setShowQRPulse] = useState(true);

  // Stop pulsing QR button after 8s so it doesn't distract
  useEffect(() => {
    const t = setTimeout(() => setShowQRPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const openQROrder = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wings_open_qr_order'));
    }
  };

  return (
    <div className="fixed bottom-6 right-4 z-[100] flex flex-col items-end space-y-3 pointer-events-auto">

      {/* 📷 QR Scan to Order — Primary mobile FAB */}
      <button
        onClick={openQROrder}
        title="Scan Table QR to Order Food"
        aria-label="Scan Table QR to Order Food"
        className={`relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-[#F5D061] text-[#120B08] font-extrabold text-xs shadow-2xl shadow-[#F5D061]/40 hover:bg-[#E5B82C] hover:scale-105 active:scale-95 transition-all duration-200 ${showQRPulse ? 'animate-bounce' : ''}`}
        style={showQRPulse ? { animationDuration: '2s' } : undefined}
      >
        <ScanLine className="w-5 h-5 shrink-0" />
        <span className="whitespace-nowrap">Scan & Order</span>
        {showQRPulse && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      {/* WhatsApp Quick Chat */}
      <a
        href="https://wa.me/917310008020?text=Hi%20Wings%20River%20Caf%C3%A9%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20table."
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Chat"
        aria-label="WhatsApp Chat"
        className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
      </a>

      {/* Direct Phone Call */}
      <a
        href="tel:07310008020"
        title="Call 07310008020"
        aria-label="Call Wings River Café"
        className="w-11 h-11 rounded-full bg-[#E5B82C] text-[#120B08] shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <Phone className="w-5 h-5 fill-current" />
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/wingsriver"
        target="_blank"
        rel="noopener noreferrer"
        title="Instagram"
        aria-label="Wings River Café Instagram"
        className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <Instagram className="w-4.5 h-4.5" />
      </a>

      {/* Google Maps */}
      <a
        href="https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA"
        target="_blank"
        rel="noopener noreferrer"
        title="Get Directions"
        aria-label="Get Directions to Wings River Café"
        className="w-11 h-11 rounded-full bg-[#4CAF50] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <MapPin className="w-5 h-5" />
      </a>
    </div>
  );
}
