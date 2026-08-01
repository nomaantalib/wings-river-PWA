'use client';

import React, { useState, useEffect } from 'react';
import CircularLogo from './CircularLogo';
import { Menu as MenuIcon, X, Calendar, User, LogOut, CheckCircle2 } from 'lucide-react';

import { getStoredUserSession, clearUserSession, UserSession } from './UserAuthModal';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenBooking, onOpenAuth }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const checkAuth = () => setUser(getStoredUserSession());
    checkAuth();
    window.addEventListener('wings_auth_change', checkAuth);
    return () => window.removeEventListener('wings_auth_change', checkAuth);
  }, []);

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
          <a
            href="#floor-map"
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-[#C9B086] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs rounded-full shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reserve Table</span>
          </a>


          {/* ICON-ONLY BUTTONS — Profile Icon & Sidebar Toggle Only */}
          <div className="flex items-center space-x-2">
            {/* User Login / Profile Icon Button with Tick Mark on Login */}
            {user ? (
              <div className="relative flex items-center space-x-1.5 bg-[#1A1D24] border border-[#98A886]/50 rounded-full pl-2.5 pr-2 py-1 text-xs shadow-md">
                <div className="relative flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-[#98A886] text-[#120B08] flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  {/* Verified Green Tick Mark Badge */}
                  <span className="absolute -top-1 -right-1 bg-[#2D3825] rounded-full text-[#98A886] p-0.5 border border-[#98A886]">
                    <CheckCircle2 className="w-3 h-3 text-[#98A886] fill-[#98A886] text-[#120B08]" />
                  </span>
                </div>

                <span className="text-[#E8DCB8] font-bold text-xs max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>

                <button
                  onClick={clearUserSession}
                  title="Logout"
                  className="p-1 rounded-full text-[#D4C4A0] hover:text-red-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                title="User OTP Login"
                aria-label="User OTP Login"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-[#C9B086] text-[#120B08] font-bold hover:bg-[#E8DCB8] shadow-md"
              >
                <User className="w-4 h-4" />
              </button>
            )}
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
