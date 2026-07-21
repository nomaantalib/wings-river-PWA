'use client';

import React, { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import MenuCardBooklet from '@/components/MenuCardBooklet';
import FoodMenuSection from '@/components/FoodMenuSection';
import WaterSportsTickets from '@/components/WaterSportsTickets';
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

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInitialType, setBookingInitialType] = useState('table_booking');
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    const handleSync = () => setSyncKey(prev => prev + 1);
    window.addEventListener('wings_db_sync', handleSync);
    return () => window.removeEventListener('wings_db_sync', handleSync);
  }, []);

  const handleOpenBooking = (type: string = 'table_booking') => {
    setBookingInitialType(type);
    setIsBookingOpen(true);
  };

  return (
    <main className="min-h-screen bg-dark-950 text-white relative">
      <LoadingScreen />
      <Navbar onOpenBooking={() => handleOpenBooking('table_booking')} />
      
      <HeroSection onOpenBooking={handleOpenBooking} />
      <AboutSection />
      <FeaturesSection />
      
      {/* Venue Gallery Section */}
      <GallerySection key={`gallery-${syncKey}`} />
      
      {/* Dynamic Interactive Menu & Water Sports Hub */}
      <MenuCardBooklet key={`booklet-${syncKey}`} onOpenBooking={() => handleOpenBooking('table_booking')} />
      <WaterSportsTickets key={`sports-${syncKey}`} onOpenBooking={handleOpenBooking} />
      <FoodMenuSection key={`foodmenu-${syncKey}`} onOpenBooking={() => handleOpenBooking('table_booking')} />
      
      <ReviewsSection key={`reviews-${syncKey}`} />
      <BlogSection key={`blog-${syncKey}`} onOpenBooking={() => handleOpenBooking('table_booking')} />
      <LocationSection />
      <ContactSection />
      
      <Footer />
      <FloatingActions />
      <PWAInstallBanner />
      <InstallPWAView />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialType={bookingInitialType}
      />
    </main>
  );
}
