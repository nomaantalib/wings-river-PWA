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

import UserAuthModal, { getStoredUserSession, getPendingAuthState, UserSession } from '@/components/UserAuthModal';
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
    const handleOpenAuthEvent = () => setIsAuthOpen(true);

    window.addEventListener('wings_db_sync', handleSync);
    window.addEventListener('wings_open_my_bookings', handleOpenMyBookingsEvent);
    window.addEventListener('wings_open_qr_order', handleOpenQREvent);
    window.addEventListener('wings_open_auth', handleOpenAuthEvent);

    // Auto-reopen auth modal if login/signup OTP verification was in progress when page reloaded
    if (typeof window !== 'undefined') {
      const pendingAuth = getPendingAuthState();
      const session = getStoredUserSession();
      if (pendingAuth && (!session || !session.loggedIn)) {
        setIsAuthOpen(true);
      }

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
    }

    return () => {
      window.removeEventListener('wings_db_sync', handleSync);
      window.removeEventListener('wings_open_my_bookings', handleOpenMyBookingsEvent);
      window.removeEventListener('wings_open_qr_order', handleOpenQREvent);
      window.removeEventListener('wings_open_auth', handleOpenAuthEvent);
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
      <section id="floor-map" className="py-10 sm:py-14 bg-[#FAF7F2] text-[#1F1810] border-y border-[#E5B82C]/30 relative">
        <span id="floor-plan" className="absolute -top-16" aria-hidden="true" />
        <span id="reserve-your-table" className="absolute -top-16" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showFloorMap ? (
            /* ── Collapsed CTA Card ── */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-[#1F1810] rounded-2xl px-6 py-6 border border-[#E5B82C]/30 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#E5B82C] flex items-center justify-center shadow-lg shrink-0">
                  <Ticket className="w-6 h-6 text-[#1F1810]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#F8E7A1] leading-tight">Reserve Your Table</h3>
                  <p className="text-xs text-[#D4C4A0]/80 mt-0.5">Choose your area, pick a table, pay & get instant QR ticket</p>
                </div>
              </div>
              <button
                onClick={() => requireAuthAndExecute(() => setShowFloorMap(true))}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#F8E7A1] text-[#1F1810] font-extrabold text-sm rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all"
              >
                <Ticket className="w-4 h-4" />
                Reserve a Table Now
              </button>
            </div>
          ) : (
            /* ── Expanded Floor Map ── */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-[#1F1810]">Reserve Your Table</h3>
                <button
                  onClick={() => setShowFloorMap(false)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#E5B82C]/40 bg-white text-[#7A5C3A] text-xs font-semibold hover:bg-[#FFF8E7] transition"
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

