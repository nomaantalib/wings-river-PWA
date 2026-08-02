'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, User, Phone, Mail, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { saveReservation, Reservation } from '@/lib/db';
import { notifyBookingConfirmed } from '@/lib/pushNotifications';

const PARTY_TYPES = ['birthday_party', 'kitty_party', 'anniversary', 'corporate_event'];
const BOOKING_OPTIONS = [
  { id: 'table_booking',    label: 'Table Booking',          emoji: '🍽️' },
  { id: 'birthday_party',   label: 'Birthday Celebration',   emoji: '🎂' },
  { id: 'kitty_party',      label: 'Kitty Party',            emoji: '🐱' },
  { id: 'anniversary',      label: 'Anniversary',            emoji: '💍' },
  { id: 'corporate_event',  label: 'Corporate Event',        emoji: '🏢' },
];

const TIME_SLOTS = ['11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM',
  '05:00 PM','06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM','11:00 PM'];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
}

const EMPTY_FORM = {
  name: '', phone: '', email: '',
  date: new Date().toISOString().split('T')[0],
  time: '07:00 PM', guests: '2', special_requests: '',
};

export default function BookingModal({ isOpen, onClose, initialType = 'table_booking' }: BookingModalProps) {
  const [bookingType, setBookingType] = useState(initialType);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isParty = PARTY_TYPES.includes(bookingType);

  const buildWhatsAppMessage = () => {
    const opt = BOOKING_OPTIONS.find(o => o.id === bookingType);
    return [
      `*${opt?.emoji} ${opt?.label} Inquiry — Wings River Café*`,
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      `Date: ${formData.date}`,
      `Time: ${formData.time}`,
      `Guests: ${formData.guests}`,
      formData.special_requests ? `Details: ${formData.special_requests}` : '',
    ].filter(Boolean).join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    // Party/events → WhatsApp redirect
    if (isParty) {
      const msg = encodeURIComponent(buildWhatsAppMessage());
      window.open(`https://wa.me/917310008020?text=${msg}`, '_blank');
      onClose();
      return;
    }

    // Table booking → Razorpay payment
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const newBooking: Reservation = {
        id: 'res-' + Date.now(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email || '',
        booking_type: bookingType,
        date: formData.date,
        time: formData.time,
        guests: Number(formData.guests) || 2,
        special_requests: formData.special_requests || '',
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const { calculateBookingPrice } = await import('@/lib/pricing');
      const pricing = calculateBookingPrice(formData.date, Number(formData.guests) || 2);
      const { openRazorpayCheckout } = await import('@/lib/razorpay');

      await openRazorpayCheckout({
        amount: pricing.totalPrice,
        name: 'Wings River Café Reservation',
        description: `Table Booking • ${formData.guests} Guests (${pricing.isWeekend ? 'Weekend ₹600/p' : 'Weekday ₹300/p'})`,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        onSuccess: async (paymentId) => {
          newBooking.status = 'confirmed';
          await saveReservation(newBooking);
          await notifyBookingConfirmed({ name: formData.name, table: 'Your Reserved Table', date: formData.date, time: formData.time, bookingId: newBooking.id });
          setSuccessMsg(`✅ Paid ₹${pricing.totalPrice} (Ref: ${paymentId}). Reservation confirmed for ${formData.guests} guests.`);
          setFormData(EMPTY_FORM);
        },
        onFailure: async () => {
          await saveReservation(newBooking);
          setSuccessMsg(`Reservation saved! Pay ₹${pricing.totalPrice} at the venue. Our team will confirm shortly.`);
          setFormData(EMPTY_FORM);
        },
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit. Please call 07310008020');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof EMPTY_FORM, type = 'text', required = false, placeholder = '') => (
    <div>
      <label className="block text-xs font-bold text-[#1F1810] mb-1">{label}{required && ' *'}</label>
      <input
        type={type} required={required} placeholder={placeholder} value={formData[key]}
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
        className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-medium bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5D061] focus:border-[#F5D061]"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#120B08]/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl shadow-2xl border-2 border-[#E5B82C] overflow-hidden max-h-[92vh] flex flex-col text-[#1F1810]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F1810] to-[#2A1E14] text-white px-6 py-5 border-b-2 border-[#F5D061]/40 shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-[#F5D061] hover:text-[#120B08] text-white transition">
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#F5D061]">Wings River Café</span>
          <h3 className="font-serif text-2xl font-bold mt-1 text-[#F8E7A1]">Book Table & Events</h3>
          <p className="text-xs text-[#D4C4A0] mt-0.5">Riverside Dining & VIP Private Canopy Events</p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successMsg ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="font-serif font-bold text-xl text-[#1F1810]">Booking Submitted!</h4>
              <p className="text-sm text-gray-700">{successMsg}</p>
              <div className="p-3 bg-white rounded-xl border border-green-200 text-xs text-gray-600">
                Confirmation call: <a href="tel:07310008020" className="font-bold text-green-700 underline">07310008020</a>
              </div>
              <button onClick={() => { setSuccessMsg(''); onClose(); }} className="w-full py-3 bg-green-500 text-white font-bold rounded-xl">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}
                </div>
              )}

              {/* Booking type */}
              <div>
                <label className="block text-xs font-extrabold text-[#1F1810] uppercase tracking-wider mb-2">Booking Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BOOKING_OPTIONS.map(opt => (
                    <button key={opt.id} type="button" onClick={() => setBookingType(opt.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                        bookingType === opt.id
                          ? 'bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] border-[#120B08] shadow-md'
                          : 'bg-white text-[#1F1810] border-[#E5B82C]/40 hover:border-[#F5D061]'
                      }`}>
                      <span>{opt.emoji}</span><span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* WhatsApp hint for party types */}
                {isParty && (
                  <div className="mt-2.5 flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 fill-current" />
                    This inquiry will be sent directly to our team via WhatsApp.
                  </div>
                )}
              </div>

              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('Full Name', 'name', 'text', true, 'e.g. Rahul Sharma')}
                {field('Phone Number', 'phone', 'tel', true, 'e.g. 9876543210')}
              </div>

              {/* Date, Time, Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {field('Date', 'date', 'date', true)}
                <div>
                  <label className="block text-xs font-bold text-[#1F1810] mb-1">Time Slot *</label>
                  <select value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#F5D061]">
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1810] mb-1">Guests *</label>
                  <select value={formData.guests} onChange={e => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#F5D061]">
                    {[1,2,3,4,5,6,8,10,15,20,30,50].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                  </select>
                </div>
              </div>

              {/* Email (table only) */}
              {!isParty && field('Email Address (Optional)', 'email', 'email', false, 'name@example.com')}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#1F1810] mb-1">
                  {isParty ? 'Event Details / Special Requests *' : 'Special Requests'}
                </label>
                <textarea rows={2} required={isParty}
                  placeholder={isParty ? 'e.g. Riverside canopy, Birthday cake, Fairy lights, Food preferences...' : 'e.g. Window seat, Birthday cake, Dietary notes...'}
                  value={formData.special_requests} onChange={e => setFormData({ ...formData, special_requests: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5D061] resize-none"
                />
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className={`w-full py-3.5 font-extrabold text-base rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  isParty
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500'
                    : 'bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#120B08] hover:from-[#F8E7A1] hover:to-[#F5D061]'
                }`}>
                {loading ? 'Processing…' : isParty ? (
                  <><MessageCircle className="w-5 h-5 fill-current" /> Send via WhatsApp</>
                ) : 'Confirm & Pay Reservation'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
