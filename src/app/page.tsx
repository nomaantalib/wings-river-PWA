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

import UserAuthModal from '@/components/UserAuthModal';
import PushNotifBanner from '@/components/PushNotifBanner';

// SRS Modules
import InteractiveFloorMap from '@/components/InteractiveFloorMap';
import QROrderModal from '@/components/QROrderModal';
import MyBookingsModal from '@/components/MyBookingsModal';
import { Ticket, QrCode } from 'lucide-react';

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


  useEffect(() => {
    const handleSync = () => setSyncKey(prev => prev + 1);
    window.addEventListener('wings_db_sync', handleSync);

    // Auto-detect Table QR Code URL Scan (e.g. ?table=T4 or ?qr=T4)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table') || params.get('qr') || params.get('t');
      if (tableParam) {
        const formattedTable = tableParam.toUpperCase().startsWith('T') || tableParam.toUpperCase().startsWith('V')
          ? tableParam.toUpperCase()
          : `T${tableParam}`;
        setSelectedTableNumber(formattedTable);
        setIsQROrderOpen(true);
      }
    }

    return () => window.removeEventListener('wings_db_sync', handleSync);
  }, []);

  const handleOpenBooking = (type: string = 'table_booking') => {
    setBookingInitialType(type);
    setIsBookingOpen(true);
  };

  const handleSelectTableFromMap = (table: any) => {
    setSelectedTableNumber(table.table_number);
    handleOpenBooking('table_booking');
  };

  return (
    <main className="min-h-screen bg-dark-950 text-white relative">
      <LoadingScreen />
      <Navbar onOpenBooking={() => handleOpenBooking('table_booking')} onOpenAuth={() => setIsAuthOpen(true)} />
      
      <HeroSection onOpenBooking={handleOpenBooking} />

      {/* Quick Action Floating Bar for Customer Orders & Tickets */}
      <div className="flex items-center justify-center gap-3 py-4 bg-dark-950/60 backdrop-blur-md border-y border-amber-500/20 px-4 flex-wrap">
        <button
          onClick={() => setIsQROrderOpen(true)}
          className="flex items-center space-x-2 px-5 py-2 rounded-full bg-amber-500 text-dark-950 font-bold text-xs shadow-lg hover:bg-amber-400 transition"
        >
          <QrCode className="w-4 h-4" />
          <span>Quick QR Food Order (Table {selectedTableNumber})</span>
        </button>

        <button
          onClick={() => setIsMyBookingsOpen(true)}
          className="flex items-center space-x-2 px-5 py-2 rounded-full bg-dark-900 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-dark-800 transition"
        >
          <Ticket className="w-4 h-4" />
          <span>My Reservations &amp; QR Tickets</span>
        </button>
      </div>

      <AboutSection />

      {/* SRS Interactive Table Reservation Floor Map Section */}
      <section id="floor-map" className="py-12 px-4 max-w-7xl mx-auto">
        <InteractiveFloorMap onSelectTable={handleSelectTableFromMap} />
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
      />

      {/* Push Notification Permission Banner */}
      <PushNotifBanner />
    </main>
  );
}

