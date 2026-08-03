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
  const [scrolled, setScrolled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const checkAuth = () => setUser(getStoredUserSession());
    checkAuth();
    window.addEventListener('wings_auth_change', checkAuth);
    return () => window.removeEventListener('wings_auth_change', checkAuth);
  }, []);

  useEffect(() => {
    // Keep header background always active by default
    setScrolled(true);
    const handleScroll = () => {
      setScrolled(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleConfirmLogout = () => {
    clearUserSession();
    setShowLogoutConfirm(false);
  };

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
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0B0E14]/85 backdrop-blur-xl shadow-2xl py-2.5 border-b border-[#D4AF37]/20 text-white'
            : 'bg-gradient-to-b from-[#0B0E14]/90 via-[#0B0E14]/50 to-transparent py-4 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <a href="#home" className="flex items-center space-x-3 group">
            <CircularLogo size={50} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight leading-none text-white">
                Wings River <span className="text-champagne-400">Café</span>
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase text-champagne-400/90 mt-0.5"
              >
                Lucknow Water Sports &amp; Café
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-semibold tracking-wide uppercase text-slate-300 hover:text-champagne-300 transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-champagne-400 hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center space-x-3">

            {/* Reserve CTA Button */}
            <a
              href="#floor-map"
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#0B0E14] font-extrabold text-xs rounded-full shadow-lg shadow-amber-500/10 hover:scale-105 transition-all duration-300"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reserve Table</span>
            </a>

            {/* Profile Icon & Sidebar Toggle Only */}
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="relative flex items-center space-x-1.5 bg-[#1A1D24] border border-[#98A886]/50 rounded-full pl-2.5 pr-2 py-1 text-xs shadow-md">
                  <div className="relative flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-[#98A886] text-[#120B08] flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-[#2D3825] rounded-full text-[#98A886] p-0.5 border border-[#98A886]">
                      <CheckCircle2 className="w-3 h-3 text-[#98A886] fill-[#98A886] text-[#120B08]" />
                    </span>
                  </div>

                  <span className="text-[#E8DCB8] font-bold text-xs max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>

                  <button
                    onClick={() => setShowLogoutConfirm(true)}
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

            {/* Mobile Menu Toggle Button — rotates icon smoothly */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 rounded-lg transition-colors text-white hover:bg-white/20"
            >
              <span
                className="block transition-transform duration-300"
                style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer — smooth expand/collapse via max-height + opacity transition */}
        <div
          className="lg:hidden overflow-hidden transition-all duration-500 ease-in-out"
          style={{
            maxHeight: mobileMenuOpen ? '600px' : '0px',
            opacity: mobileMenuOpen ? 1 : 0,
            transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-8px)',
            pointerEvents: mobileMenuOpen ? 'auto' : 'none',
          }}
        >
          <div className="bg-dark-950/97 backdrop-blur-2xl border-b border-[#C9B086]/20 px-6 py-5">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-200 text-sm font-medium hover:text-[#C9B086] transition-colors py-2.5 border-b border-white/5 last:border-0"
                  style={{
                    transitionDelay: mobileMenuOpen ? `${i * 30}ms` : '0ms',
                    opacity: mobileMenuOpen ? 1 : 0,
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-8px)',
                    transition: `opacity 0.35s ease ${i * 30}ms, transform 0.35s ease ${i * 30}ms, color 0.2s`,
                  }}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#floor-map"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 w-full py-3 bg-gradient-to-r from-[#C9B086] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-center rounded-2xl shadow-xl block transition-all duration-300"
                style={{
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 0.4s ease ${navLinks.length * 30}ms, transform 0.4s ease ${navLinks.length * 30}ms`,
                }}
              >
                Reserve Table
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Recheck Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#14171D] border border-[#C9B086]/40 rounded-3xl p-6 text-white text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-serif font-bold text-[#E8DCB8]">Confirm Logout</h4>
              <p className="text-xs text-[#D4C4A0]/80">
                Are you sure you want to log out of <strong className="text-white">{user?.name}</strong> on this device?
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-[#1A1D24] border border-[#C9B086]/30 text-[#E8DCB8] text-xs font-bold hover:bg-[#231710] transition"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

