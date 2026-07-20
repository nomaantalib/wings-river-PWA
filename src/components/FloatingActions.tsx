'use client';

import React from 'react';
import { Phone, Instagram, MapPin, MessageCircle } from 'lucide-react';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
      {/* WhatsApp Quick Chat */}
      <a
        href="https://wa.me/917310008020?text=Hi%20Wings%20River%20Caf%C3%A9%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20table%2Fparty."
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Chat"
        aria-label="WhatsApp Chat"
        className="w-12 h-12 rounded-full bg-emerald-500 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>

      {/* Direct Phone Call */}
      <a
        href="tel:07310008020"
        title="Call 07310008020"
        aria-label="Call 07310008020"
        className="w-12 h-12 rounded-full bg-gold-400 text-dark-950 shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <Phone className="w-5 h-5 fill-current" />
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/wingsriver"
        target="_blank"
        rel="noopener noreferrer"
        title="Instagram Page"
        aria-label="Instagram Page"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <Instagram className="w-5 h-5" />
      </a>

      {/* Google Maps Directions */}
      <a
        href="https://www.google.com/maps/place/Lucknow+water+sports+wings+River,+Laxman+mela+ground,+Kala+Kankar+Colony,+Purana+Haidarabad,+sikandar+nagar,+Lucknow,+Uttar+Pradesh+226001/"
        target="_blank"
        rel="noopener noreferrer"
        title="Get Google Maps Directions"
        aria-label="Get Google Maps Directions"
        className="w-12 h-12 rounded-full bg-mint-400 text-dark-950 shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <MapPin className="w-5 h-5" />
      </a>
    </div>
  );
}
