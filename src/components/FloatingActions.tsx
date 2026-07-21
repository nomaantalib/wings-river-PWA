'use client';

import React from 'react';
import { Phone, Instagram, MapPin } from 'lucide-react';
import BackgroundMusic from './BackgroundMusic';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end space-y-3 pointer-events-auto">
      {/* Sound On/Off Toggle Floating Button (Positioned Above WhatsApp) */}
      <BackgroundMusic />

      {/* WhatsApp Quick Chat */}
      <a
        href="https://wa.me/917310008020?text=Hi%20Wings%20River%20Caf%C3%A9%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20table%2Fparty."
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Chat"
        aria-label="WhatsApp Chat"
        className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zM12.004 2C6.48 2 2 6.48 2 12.004c0 1.944.554 3.763 1.516 5.304L2 22l4.832-1.492C8.315 21.432 10.089 22 12.004 22 17.524 22 22 17.524 22 12.004 22 6.48 16.524 2 12.004 2zm0 18.2c-1.705 0-3.297-.47-4.664-1.282l-.334-.199-2.868.886.883-2.822-.218-.349A8.167 8.167 0 0 1 3.8 12.004C3.8 7.48 7.48 3.8 12.004 3.8c4.524 0 8.2 3.68 8.2 8.204 0 4.524-3.676 8.196-8.2 8.196z"/>
        </svg>
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
        href="https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA"
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
