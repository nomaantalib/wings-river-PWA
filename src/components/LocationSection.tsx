'use client';

import React from 'react';
import { MapPin, Navigation, Clock, Phone, Compass, Anchor } from 'lucide-react';

export default function LocationSection() {
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.395724578135!2d80.9501509!3d26.8679093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd007c08a68b%3A0xb35a3a789ef51a70!2sLucknow%20water%20sports%20wings%20River!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";
  const directMapsLink = "https://www.google.com/maps/place/Lucknow+water+sports+wings+River,+Laxman+mela+ground,+Kala+Kankar+Colony,+Purana+Haidarabad,+sikandar+nagar,+Lucknow,+Uttar+Pradesh+226001/";

  return (
    <section id="location" className="py-20 bg-dark-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold-400/20 border border-gold-400/30 text-gold-300 font-semibold text-xs tracking-widest uppercase mb-3">
            Find Our Waterfront Venue
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Location & Directions
          </h2>
          <p className="font-sans text-gray-300 text-base">
            Situated right inside Laxman Mela Ground at Laxman Jhula Park along Gomti Riverfront.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Address Card */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-mint-400/20 border border-mint-300/40 flex items-center justify-center text-mint-300">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-white">Wings River Café</h3>
                  <p className="text-xs text-mint-300 font-semibold">Lucknow Water Sports Hub</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex items-start space-x-3">
                  <Compass className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Full Address:</strong>
                    Laxman Jhula Park, River Front, Kala Kankar Colony, Purana Haidarabad, Hazratganj, Lucknow, Uttar Pradesh 226001
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Anchor className="w-5 h-5 text-mint-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Landmark:</strong>
                    Located inside Laxman Mela Ground beside Lucknow Water Sports Dock
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Business Hours:</strong>
                    Monday – Sunday: 11:00 AM – 11:59 PM
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-mint-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Phone Enquiries:</strong>
                    <a href="tel:07310008020" className="text-gold-400 hover:underline font-bold">
                      07310008020
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <a
                href={directMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-gradient-to-r from-mint-400 via-mint-500 to-gold-400 text-dark-950 font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center space-x-2 hover:scale-102 transition-transform"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Driving Directions on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Embedded Map */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-[380px] bg-dark-800 relative">
            <iframe
              title="Wings River Cafe Google Maps"
              src={mapEmbedUrl}
              className="w-full h-full min-h-[400px] border-0"
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
