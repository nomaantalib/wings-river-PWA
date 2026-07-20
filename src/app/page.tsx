'use client';

import React, { useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import MenuCardBooklet from '@/components/MenuCardBooklet';
import WaterSportsTickets from '@/components/WaterSportsTickets';
import FoodMenuSection from '@/components/FoodMenuSection';
import GallerySection from '@/components/GallerySection';
import ReviewsSection from '@/components/ReviewsSection';
import BlogSection from '@/components/BlogSection';
import LocationSection from '@/components/LocationSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import BookingModal from '@/components/BookingModal';
import InstallPWAView from '@/views/InstallPWAView';

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInitialType, setBookingInitialType] = useState('table_booking');

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
      
      {/* Dynamic Interactive Menu & Water Sports Hub */}
      <MenuCardBooklet onOpenBooking={() => handleOpenBooking('table_booking')} />
      <WaterSportsTickets onOpenBooking={handleOpenBooking} />
      <FoodMenuSection onOpenBooking={() => handleOpenBooking('table_booking')} />
      
      <GallerySection />
      <ReviewsSection />
      <BlogSection />
      <LocationSection />
      <ContactSection />
      
      <Footer />
      <FloatingActions />
      <InstallPWAView />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialType={bookingInitialType}
      />
    </main>
  );
}
