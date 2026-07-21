'use client';

import React, { useEffect, useState } from 'react';
import CircularLogo from './CircularLogo';
import { MapPin, Instagram, Phone, Heart, MessageCircle } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/db';

const DEFAULTS: SiteSettings = {
  site_title: 'Wings River Café',
  phone: '07310008020',
  whatsapp: '917310008020',
  email: 'wingsrivercafe@gmail.com',
  address: 'Laxman Mela Ground, Gomti Riverfront, Lucknow',
  opening_hours: '11:00 AM – 11:59 PM (Open All 7 Days)',
  instagram_url: 'https://www.instagram.com/wingsriver',
  google_maps_url: 'https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA',
};

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    let active = true;
    getSiteSettings().then((s) => { if (active && s) setSettings(s); });
    const onSync = () => getSiteSettings().then((s) => { if (active && s) setSettings(s); });
    window.addEventListener('wings_db_sync', onSync);
    return () => { active = false; window.removeEventListener('wings_db_sync', onSync); };
  }, []);

  const phone        = settings.phone        || DEFAULTS.phone!;
  const whatsappNum  = settings.whatsapp     || DEFAULTS.whatsapp || '917310008020';
  const whatsappUrl  = `https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=Hello%20Wings%20River%20Caf%C3%A9%2C%20I%20would%20like%20to%20reserve%20a%20table%20/%20know%20more!`;
  const instagram    = settings.instagram_url || DEFAULTS.instagram_url!;
  const mapsUrl      = settings.google_maps_url || DEFAULTS.google_maps_url!;
  const hours        = settings.opening_hours  || DEFAULTS.opening_hours!;
  const address      = settings.address        || DEFAULTS.address!;

  return (
    <footer className="bg-dark-950 text-white pt-16 pb-8 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <a href="#home" className="inline-flex items-center space-x-3">
              <CircularLogo size={60} />
              <div>
                <span className="font-serif font-bold text-xl text-white block">
                  Wings River <span className="text-gold-400">Café</span>
                </span>
                <span className="text-[10px] text-mint-300 font-semibold tracking-wider uppercase">
                  Lucknow Water Sports &amp; Café
                </span>
              </div>
            </a>
            <p className="font-sans text-xs text-gray-400 leading-relaxed">
              Lucknow's premier riverside family restaurant offering gourmet multicuisine delicacies, fairy light party canopies, and thrilling speedboat water sports rides.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Google Maps"
                aria-label="Google Maps"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 hover:text-dark-950 flex items-center justify-center transition-colors text-white"
              >
                <MapPin className="w-4 h-4" />
              </a>

              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 hover:text-dark-950 flex items-center justify-center transition-colors text-white"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Chat on WhatsApp"
                aria-label="Chat on WhatsApp"
                className="w-10 h-10 rounded-full bg-emerald-600/30 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-colors text-emerald-400 border border-emerald-500/30"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              <a
                href={`tel:${phone}`}
                title={`Call ${phone}`}
                aria-label={`Call ${phone}`}
                className="w-10 h-10 rounded-full bg-gold-400 hover:bg-gold-500 text-dark-950 flex items-center justify-center transition-colors font-bold"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-base text-gold-400 mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><a href="#home" className="hover:text-mint-300 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-mint-300 transition-colors">About Us</a></li>
              <li><a href="#menu-card" className="hover:text-mint-300 transition-colors">Food Menu</a></li>
              <li><a href="#gallery" className="hover:text-mint-300 transition-colors">Photo Gallery</a></li>
              <li><a href="#reviews" className="hover:text-mint-300 transition-colors">Customer Reviews</a></li>
              <li><a href="#blog" className="hover:text-mint-300 transition-colors">Blog &amp; News</a></li>
              <li><a href="/admin" className="hover:text-gold-400 transition-colors font-semibold">Admin CMS Panel</a></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-serif font-bold text-base text-gold-400 mb-4 uppercase tracking-wider">
              Opening Hours
            </h4>
            <div className="space-y-2 text-xs text-gray-300">
              <p><strong className="text-white">Monday – Sunday:</strong></p>
              <p className="text-mint-300 font-semibold text-sm">{hours.split('(')[0].trim()}</p>
              <p className="text-gray-400 pt-2">Lunch • Sunset Snacks • Late Dinner</p>
              <p className="text-gray-400">Speedboat Rides available daily during daylight hours.</p>
            </div>
          </div>

          {/* Location Details */}
          <div>
            <h4 className="font-serif font-bold text-base text-gold-400 mb-4 uppercase tracking-wider">
              Location
            </h4>
            <address className="not-italic text-xs text-gray-300 space-y-1.5 leading-relaxed">
              <p>{address}</p>
              <p className="pt-2 text-gold-400 font-bold">Tel: {phone}</p>
              {settings.email && (
                <p>
                  <a href={`mailto:${settings.email}`} className="text-mint-400 hover:underline">{settings.email}</a>
                </p>
              )}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-amber-400 hover:text-amber-300 pt-1 text-[11px] font-semibold"
              >
                <MapPin className="w-3 h-3" />
                <span>View on Google Maps</span>
              </a>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Wings River Café. All Rights Reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
            <span>for Lucknow Waterfront</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
