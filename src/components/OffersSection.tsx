'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Copy, Check, Megaphone, ArrowRight, Gift, Flame, Percent } from 'lucide-react';
import { getStoredOffers, getStoredEventBanners, getStoredPromoPages, OfferDiscount, EventBanner, PromoPage } from '@/controllers/StorageController';

interface OffersSectionProps {
  onOpenBooking: (type?: string) => void;
}

export default function OffersSection({ onOpenBooking }: OffersSectionProps) {
  const [offers, setOffers] = useState<OfferDiscount[]>([]);
  const [banners, setBanners] = useState<EventBanner[]>([]);
  const [promoPages, setPromoPages] = useState<PromoPage[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const loadData = async () => {
    try {
      const [offData, banData, promoData] = await Promise.all([
        getStoredOffers(),
        getStoredEventBanners(),
        getStoredPromoPages()
      ]);
      setOffers(offData.filter(o => o.status === 'active' || (o.status as string) === 'published'));
      setBanners(banData.filter(b => b.is_active !== false && b.status !== 'draft'));
      setPromoPages(promoData.filter(p => p.status === 'active'));
    } catch (e) {
      console.error('OffersSection load error:', e);
    }
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('wings_db_sync', handleSync);
    return () => window.removeEventListener('wings_db_sync', handleSync);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="py-11 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden font-sans border-t border-white/10">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-mint-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Exclusive Deals & Event Special Offers</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Promotions & Discount Coupons
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Enjoy special discounts on birthday parties, water sports thrill rides, and lakeside gourmet dining.
          </p>
        </div>

        {/* ── 1. PROMO EVENT BANNERS CAROUSEL ─────────────────────────────────── */}
        {banners.length > 0 && (
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-dark-900 min-h-[240px] sm:min-h-[295px] flex items-center group">
            {banners.map((banner, index) => {
              const isActive = index === activeBannerIndex;
              return (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Background Image */}
                  <img
                    src={banner.image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent" />

                  {/* Banner Content */}
                  <div className="relative z-10 p-6 sm:p-12 max-w-2xl space-y-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gold-400/20 border border-gold-400/40 rounded-lg text-gold-300 text-xs font-bold uppercase tracking-wider">
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Special Event Announcement</span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-xs sm:text-base text-cream-200 line-clamp-2">
                        {banner.subtitle}
                      </p>
                    )}
                    <div className="pt-2">
                      <button
                        onClick={() => onOpenBooking('table_booking')}
                        className="inline-flex items-center space-x-2.5 px-6 py-3 bg-gradient-to-r from-gold-400 via-amber-500 to-gold-500 text-dark-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-amber-500/20 hover:scale-105 transition-all"
                      >
                        <span>{banner.cta_text || 'Claim Offer & Book Now'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Carousel Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 right-6 z-20 flex space-x-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIndex(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === activeBannerIndex ? 'bg-gold-400 w-8' : 'bg-white/40 hover:bg-white/80 w-2.5'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 2. PROMO PAGES SHOWCASE GRID ───────────────────────────────────── */}
        {promoPages.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-2xl text-white">Special Promo Highlights</h3>
              <span className="text-xs text-amber-400 font-mono font-semibold">Featured Highlights</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promoPages.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-dark-900/90 border border-white/10 hover:border-amber-500/40 rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
                >
                  {promo.image_url && (
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={promo.image_url}
                        alt={promo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />
                    </div>
                  )}
                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                        {promo.title}
                      </h4>
                      {promo.subtitle && (
                        <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                          {promo.subtitle}
                        </p>
                      )}
                    </div>
                    {promo.cta_text && (
                      <div className="pt-3">
                        <button
                          onClick={() => onOpenBooking('table_booking')}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                        >
                          <span>{promo.cta_text}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. OFFERS & DISCOUNT COUPON CARDS GRID ─────────────────────────── */}
        {offers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-dark-900/90 border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 relative group transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-mint-500/10 text-mint-400 border border-mint-500/20 text-[10px] font-bold uppercase tracking-wider">
                      <Percent className="w-3 h-3" />
                      <span>{offer.discount_type === 'flat' ? `Flat ₹${offer.discount_value} OFF` : `${offer.discount_value}% Discount`}</span>
                    </span>
                  </div>


                  {/* Title & Description */}
                  <div>
                    <h4 className="font-serif font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                      {offer.title}
                    </h4>
                    <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                      {offer.description || 'Valid on online table reservations and water sports package bookings.'}
                    </p>
                  </div>
                </div>

                {/* Bottom Coupon Code & Action */}
                <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between bg-dark-950 p-2.5 rounded-2xl border border-dashed border-amber-500/30">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">Coupon Code</span>
                      <span className="font-mono font-extrabold text-sm text-amber-400 tracking-wider">
                        {offer.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 flex items-center space-x-1.5 transition-all"
                    >
                      {copiedCode === offer.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenBooking('table_booking')}
                    className="w-full py-2.5 bg-white/5 hover:bg-amber-500 hover:text-dark-950 text-white font-bold text-xs rounded-xl border border-white/10 hover:border-amber-500 transition-all duration-300"
                  >
                    Apply Coupon & Reserve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
