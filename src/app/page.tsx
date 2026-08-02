'use client';

import React, { useState, useEffect } from 'react';
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
import LocationSection from '@/components/LocationSection';
import ContactSection from '@/components/ContactSection';
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
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInitialType, setBookingInitialType] = useState('table_booking');
  const [isQROrderOpen, setIsQROrderOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedTableNumber, setSelectedTableNumber] = useState('T1');
  const [syncKey, setSyncKey] = useState(0);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    initRealtimeBookingNotifier();
    const handleSync = () => setSyncKey(prev => prev + 1);
    const handleOpenMyBookingsEvent = () => setIsMyBookingsOpen(true);

    window.addEventListener('wings_db_sync', handleSync);
    window.addEventListener('wings_open_my_bookings', handleOpenMyBookingsEvent);

    // Auto-detect Table QR Code URL Scan (e.g. ?table=T4 or ?qr=T4)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table') || params.get('qr') || params.get('t');
      if (tableParam) {
        const formattedTable = tableParam.toUpperCase().startsWith('T') || tableParam.toUpperCase().startsWith('V')
          ? tableParam.toUpperCase()
          : `T${tableParam}`;
        setSelectedTableNumber(formattedTable);
        
        // Require auth before opening QR order
        const session = getStoredUserSession();
        if (!session || !session.loggedIn) {
          setPendingAction(() => () => setIsQROrderOpen(true));
          setIsAuthOpen(true);
        } else {
          setIsQROrderOpen(true);
        }
      }

      // Launch vs Reload persistence:
      const isSessionActive = sessionStorage.getItem('wings_app_session_active');
      if (!isSessionActive) {
        sessionStorage.setItem('wings_app_session_active', 'true');
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname);
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
      return () => {
        window.removeEventListener('wings_db_sync', handleSync);
        window.removeEventListener('wings_open_my_bookings', handleOpenMyBookingsEvent);
        window.removeEventListener('scroll', handleScrollSave);
      };
    }

    return () => {
      window.removeEventListener('wings_db_sync', handleSync);
      window.removeEventListener('wings_open_my_bookings', handleOpenMyBookingsEvent);
    };
  }, []);

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

      {/* SRS Interactive Table Reservation Floor Map Section — Beige, Black & Golden Theme */}
      <section id="floor-map" className="py-14 sm:py-20 bg-[#FAF7F2] text-[#1F1810] border-y border-[#E5B82C]/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <InteractiveFloorMap onSelectTable={handleSelectTableFromMap} />
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
      <LocationSection />
      <ContactSection />
      
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

