'use client';

import React from 'react';
import CircularLogo from './CircularLogo';
import { MapPin, Instagram, Phone, Heart } from 'lucide-react';

export default function Footer() {
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
                  विंग्स रिवर • Lucknow Water Sports
                </span>
              </div>
            </a>
            <p className="font-sans text-xs text-gray-400 leading-relaxed">
              Lucknow’s premier riverside family restaurant offering gourmet multicuisine delicacies, fairy light party canopies, and thrilling speedboat water sports rides.
            </p>

            {/* SOCIAL ICONS ONLY (No text beside icons) */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://www.google.com/maps/place/Lucknow+water+sports+wings+River,+Laxman+mela+ground,+Kala+Kankar+Colony,+Purana+Haidarabad,+sikandar+nagar,+Lucknow,+Uttar+Pradesh+226001/"
                target="_blank"
                rel="noopener noreferrer"
                title="Google Maps"
                aria-label="Google Maps"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 hover:text-dark-950 flex items-center justify-center transition-colors text-white"
              >
                <MapPin className="w-4 h-4" />
              </a>

              <a
                href="https://www.instagram.com/wingsriver"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 hover:text-dark-950 flex items-center justify-center transition-colors text-white"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="tel:07310008020"
                title="Call 07310008020"
                aria-label="Call 07310008020"
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
              <li><a href="#menu" className="hover:text-mint-300 transition-colors">Food Menu</a></li>
              <li><a href="#gallery" className="hover:text-mint-300 transition-colors">Photo Gallery</a></li>
              <li><a href="#reviews" className="hover:text-mint-300 transition-colors">Customer Reviews</a></li>
              <li><a href="#blog" className="hover:text-mint-300 transition-colors">WordPress Blog</a></li>
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
              <p className="text-mint-300 font-semibold text-sm">11:00 AM – 11:59 PM</p>
              <p className="text-gray-400 pt-2">Lunch • Sunset Snacks • Late Dinner</p>
              <p className="text-gray-400">Speedboat Rides available daily during daylight hours.</p>
            </div>
          </div>

          {/* Location Details */}
          <div>
            <h4 className="font-serif font-bold text-base text-gold-400 mb-4 uppercase tracking-wider">
              Location
            </h4>
            <address className="not-italic text-xs text-gray-300 space-y-2 leading-relaxed">
              <p>Laxman Jhula Park, River Front</p>
              <p>Inside Laxman Mela Ground</p>
              <p>Kala Kankar Colony, Purana Haidarabad</p>
              <p>Hazratganj, Lucknow, UP 226001</p>
              <p className="pt-2 text-gold-400 font-bold">Tel: 07310008020</p>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Wings River Café (विंग्स रिवर). All Rights Reserved.</p>
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
