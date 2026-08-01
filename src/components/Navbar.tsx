'use client';

import React, { useState, useEffect } from 'react';
import CircularLogo from './CircularLogo';
import { MapPin, Instagram, Phone, Menu as MenuIcon, X, Calendar } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Menu', href: '#menu-card' },
    { name: 'Reserve Table', href: '#floor-map' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Blog', href: '#blog' },
    { name: 'Location', href: '#location' },
    { name: 'Staff Terminal', href: '/staff' },
    { name: 'Admin CMS', href: '/admin' },
  ];


  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-mint-800/95 backdrop-blur-md shadow-lg py-2 border-b border-gold-500/30 text-white'
          : 'bg-gradient-to-b from-dark-950/80 via-dark-950/40 to-transparent py-4 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <a href="#home" className="flex items-center space-x-3 group">
          <CircularLogo size={52} className="shrink-0" />
          <div className="flex flex-col">
            <span
              className="font-serif font-bold text-lg sm:text-xl tracking-tight leading-none text-white"
            >
              Wings River <span className="text-gold-500">Café</span>
            </span>
            <span
              className={`text-[10px] font-medium tracking-wider uppercase ${
                scrolled ? 'text-gold-300' : 'text-mint-300'
              }`}
            >
              Lucknow Water Sports & Café
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-gold-300 ${
                scrolled ? 'text-gray-100' : 'text-gray-200'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action Cluster & Icons Only */}
        <div className="flex items-center space-x-3">
          {/* Reserve CTA Button */}
          <button
            onClick={onOpenBooking}
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-mint-300 to-gold-400 text-dark-950 font-bold text-xs rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Table / Party</span>
          </button>

          {/* ICON-ONLY BUTTONS (Right Side Only - No Text Beside Icons) */}
          <div className="flex items-center space-x-2">
            <a
              href="https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA"
              target="_blank"
              rel="noopener noreferrer"
              title="Google Maps Location"
              aria-label="Google Maps Location"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/15 backdrop-blur-sm text-white hover:bg-gold-500 hover:text-dark-950"
            >
              <MapPin className="w-4 h-4" />
            </a>

            {/* Instagram Icon Button */}
            <a
              href="https://www.instagram.com/wingsriver"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/15 backdrop-blur-sm text-white hover:bg-gold-500 hover:text-dark-950"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Call Icon Button */}
            <a
              href="tel:07310008020"
              title="Call Us"
              aria-label="Call Us"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-gold-500 text-dark-950 hover:bg-gold-400"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-lg transition-colors text-white hover:bg-white/20"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-dark-950/95 backdrop-blur-xl border-b border-mint-500/30 px-6 py-6 transition-all animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-200 text-base font-medium hover:text-gold-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="mt-4 w-full py-3 bg-gradient-to-r from-mint-400 to-gold-400 text-dark-950 font-bold text-center rounded-xl shadow-lg"
            >
              Book Table / Party / Rides
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
