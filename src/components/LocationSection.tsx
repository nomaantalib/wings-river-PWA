'use client';

import React from 'react';
import { MapPin, Navigation, Clock, Phone, Compass, Anchor } from 'lucide-react';

export default function LocationSection() {
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1779.6997424578135!2d80.94902!3d26.85764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd007c08a68b%3A0xb35a3a789ef51a70!2sLucknow%20water%20sports%20wings%20River!5e0!3m2!1sen!2sin!4v1711111111111!5m2!1sen!2sin";
  const directMapsLink = "https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA";

  return (
    <section id="location" className="py-12 sm:py-16 bg-[#FAF7F2] text-[#1F1810] relative border-t border-[#E5B82C]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-[#1F1810] border border-[#E5B82C]/50 text-[#F5D061] font-semibold text-xs tracking-widest uppercase mb-2 shadow-sm">
            Find Our Waterfront Venue
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1810] tracking-tight mb-3">
            Location &amp; Directions
          </h2>
          <p className="font-sans text-[#7A5C3A] text-base font-medium">
            Situated right inside Laxman Mela Ground at Laxman Jhula Park along Gomti Riverfront.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Address Card */}
          <div className="lg:col-span-5 bg-[#1F1810] border border-[#E5B82C]/30 p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#E5B82C] flex items-center justify-center text-[#1F1810] shadow-lg shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#F8E7A1]">Wings River Café</h3>
                  <p className="text-xs text-[#F5D061] font-semibold">Lucknow Water Sports Hub</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-[#D4C4A0]">
                <div className="flex items-start space-x-3">
                  <Compass className="w-5 h-5 text-[#F5D061] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F8E7A1] block">Full Address:</strong>
                    Laxman Jhula Park, River Front, Kala Kankar Colony, Purana Haidarabad, Hazratganj, Lucknow, Uttar Pradesh 226001
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Anchor className="w-5 h-5 text-[#F5D061] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F8E7A1] block">Landmark:</strong>
                    Located inside Laxman Mela Ground beside Lucknow Water Sports Dock
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#F5D061] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F8E7A1] block">Business Hours:</strong>
                    Monday – Sunday: 11:00 AM – 11:59 PM
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-[#F5D061] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F8E7A1] block">Phone Enquiries:</strong>
                    <a href="tel:07310008020" className="text-[#F5D061] hover:underline font-bold">
                      07310008020
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E5B82C]/30">
              <a
                href={directMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#F8E7A1] text-[#1F1810] font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Driving Directions on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Embedded Map (Mobile & Desktop) */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#E5B82C]/30 shadow-2xl min-h-[300px] sm:min-h-[380px] bg-[#F0EAE0] relative">
            <iframe
              title="Wings River Cafe Google Maps"
              src={mapEmbedUrl}
              className="w-full h-full min-h-[300px] sm:min-h-[380px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
