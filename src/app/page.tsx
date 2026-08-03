'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import OffersSection from '@/components/OffersSection';
import MenuCardBooklet from '@/components/MenuCardBooklet';



import GallerySection from '@/components/GallerySection';
import ReviewsSection from '@/components/ReviewsSection';
import BlogSection from '@/components/BlogSection';

import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import BookingModal from '@/components/BookingModal';
import InstallPWAView from '@/views/InstallPWAView';
import PWAInstallBanner from '@/components/PWAInstallBanner';

import UserAuthModal, { getStoredUserSession, UserSession } from '@/components/UserAuthModal';
import PushNotifBanner from '@/components/PushNotifBanner';

// SRS Modules
import InteractiveFloorMap from '@/components/InteractiveFloorMap';
import QROrderModal from '@/components/QROrderModal';
import MyBookingsModal from '@/components/MyBookingsModal';
import { Ticket, QrCode } from 'lucide-react';

import { initRealtimeBookingNotifier } from '@/lib/firebaseMessaging';

// Push Notification: register SW silently on page load
import '@/lib/pushNotifications';

export default function Home() {
  const router = useRouter();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const [bookingInitialType, setBookingInitialType] = useState('table_booking');
  const [isQROrderOpen, setIsQROrderOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedTableNumber, setSelectedTableNumber] = useState('T1');
  const [syncKey, setSyncKey] = useState(0);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showFloorMap, setShowFloorMap] = useState(false);

  useEffect(() => {
    initRealtimeBookingNotifier();
    const handleSync = () => setSyncKey(prev => prev + 1);
    const handleOpenMyBookingsEvent = () => setIsMyBookingsOpen(true);
    const handleOpenQREvent = () => setIsQROrderOpen(true);

    window.addEventListener('wings_db_sync', handleSync);
    window.addEventListener('wings_open_my_bookings', handleOpenMyBookingsEvent);
    window.addEventListener('wings_open_qr_order', handleOpenQREvent);

    // Auto-detect Table QR Code URL Scan (e.g. ?table=T4 or ?qr=T4)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table') || params.get('qr') || params.get('t');
      if (tableParam) {
        const formattedTable = tableParam.toUpperCase().startsWith('T') || tableParam.toUpperCase().startsWith('V')
          ? tableParam.toUpperCase()
          : `T${tableParam}`;
        router.push(`/table/${formattedTable}`);
      }

      // Launch vs Reload persistence:
      sessionStorage.setItem('wings_app_session_active', 'true');

      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const element = document.getElementById(targetId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      } else {
        const savedScroll = sessionStorage.getItem('wings_last_scroll_pos');
        if (savedScroll) {
          setTimeout(() => {
            window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
          }, 100);
        }
      }

      // Save scroll position for reload restoration
      const handleScrollSave = () => {
        sessionStorage.setItem('wings_last_scroll_pos', window.scrollY.toString());
      };
      window.addEventListener('scroll', handleScrollSave, { passive: true });
    }

    return () => {
      window.removeEventListener('wings_db_sync', handleSync);
      window.removeEventListener('wings_open_my_bookings', handleOpenMyBookingsEvent);
      window.removeEventListener('wings_open_qr_order', handleOpenQREvent);
    };
  }, [router]);


  const requireAuthAndExecute = (action: () => void) => {
    const session = getStoredUserSession();
    if (!session || !session.loggedIn) {
      setPendingAction(() => action);
      setIsAuthOpen(true);
    } else {
      action();
    }
  };

  const handleOpenBooking = (type: string = 'table_booking') => {
    requireAuthAndExecute(() => {
      setBookingInitialType(type);
      setIsBookingOpen(true);
    });
  };

  const handleOpenQROrder = () => {
    requireAuthAndExecute(() => {
      setIsQROrderOpen(true);
    });
  };

  const handleOpenMyBookings = () => {
    requireAuthAndExecute(() => {
      setIsMyBookingsOpen(true);
    });
  };

  const handleSelectTableFromMap = (table: any) => {
    requireAuthAndExecute(() => {
      setSelectedTableNumber(table.table_number);
      setBookingInitialType('table_booking');
      setIsBookingOpen(true);
    });
  };

  return (
    <main className="min-h-screen bg-dark-950 text-white relative">
      <LoadingScreen />
      <Navbar onOpenBooking={() => handleOpenBooking('table_booking')} onOpenAuth={() => setIsAuthOpen(true)} />
      
      <HeroSection onOpenBooking={handleOpenBooking} onOpenMyBookings={handleOpenMyBookings} />



      <AboutSection />

      {/* ── Reserve a Table — Collapsible Floor Map ──────────────────────── */}
      <section id="floor-map" className="py-12 sm:py-16 bg-[#0E131C] text-white border-y border-[#D4AF37]/20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

        <span id="floor-plan" className="absolute -top-16" aria-hidden="true" />
        <span id="reserve-your-table" className="absolute -top-16" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {!showFloorMap ? (
            /* ── Collapsed CTA Card ── */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#141A24]/90 backdrop-blur-xl rounded-3xl px-8 py-7 border border-[#D4AF37]/30 shadow-2xl hover:border-[#D4AF37]/60 transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                  <Ticket className="w-7 h-7 text-[#0B0E14]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#F8E7A1] leading-tight">Reserve Your Table</h3>
                  <p className="text-xs text-slate-300 mt-1">Choose your area, pick a table, pay & get instant QR ticket</p>
                </div>
              </div>
              <button
                onClick={() => requireAuthAndExecute(() => setShowFloorMap(true))}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#0B0E14] font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Ticket className="w-4 h-4" />
                Reserve a Table Now
              </button>
            </div>
          ) : (
            /* ── Expanded Floor Map ── */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xl text-white">Reserve Your Table</h3>
                <button
                  onClick={() => setShowFloorMap(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D4AF37]/40 bg-[#141A24] text-amber-200 text-xs font-semibold hover:bg-[#1C2433] transition"
                >
                  ✕ Close
                </button>
              </div>
              <InteractiveFloorMap onSelectTable={handleSelectTableFromMap} />
            </div>
          )}
        </div>
      </section>

      {/* Exclusive Deals & Promo Banners Section */}
      <OffersSection key={`offers-${syncKey}`} onOpenBooking={handleOpenBooking} />

      {/* Venue Gallery Section */}
      <GallerySection key={`gallery-${syncKey}`} />
      
      {/* Dynamic Interactive Menu Hub */}
      <MenuCardBooklet key={`booklet-${syncKey}`} onOpenBooking={() => handleOpenBooking('table_booking')} />


      {/* Why Choose Wings River Cafe Horizontal Carousel */}
      <FeaturesSection />
      
      <ReviewsSection key={`reviews-${syncKey}`} />

      <BlogSection key={`blog-${syncKey}`} onOpenBooking={() => handleOpenBooking('table_booking')} />
      
      <Footer />
      <FloatingActions />
      <PWAInstallBanner />
      <InstallPWAView />

      {/* Customer Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialType={bookingInitialType}
      />

      <QROrderModal
        isOpen={isQROrderOpen}
        onClose={() => setIsQROrderOpen(false)}
        tableNumber={selectedTableNumber}
      />

      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
      />

      <UserAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />

      {/* Push Notification Permission Banner */}
      <PushNotifBanner />
    </main>
  );
}

