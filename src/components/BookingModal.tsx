'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, User, Phone, Mail, Zap, Anchor, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveReservation, Reservation } from '@/lib/db';
import { notifyBookingConfirmed } from '@/lib/pushNotifications';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
}

export default function BookingModal({ isOpen, onClose, initialType = 'table_booking' }: BookingModalProps) {
  const [bookingType, setBookingType] = useState(initialType);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    guests: '2',
    special_requests: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

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
        created_at: new Date().toISOString()
      };

      // Import & launch Razorpay Checkout with calculated rate (₹300 weekday / ₹600 weekend per person)
      const { calculateBookingPrice } = await import('@/lib/pricing');
      const pricing = calculateBookingPrice(formData.date, Number(formData.guests) || 2);

      const { openRazorpayCheckout } = await import('@/lib/razorpay');
      await openRazorpayCheckout({
        amount: pricing.totalPrice,
        name: 'Wings River Café Reservation',
        description: `${bookingType.replace('_', ' ').toUpperCase()} • ${formData.guests} Guests (${pricing.isWeekend ? 'Weekend ₹600/p' : 'Weekday ₹300/p'})`,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        onSuccess: async (paymentId) => {
          newBooking.status = 'confirmed';
          await saveReservation(newBooking);
          setSuccessMsg(`Payment Successful! (Ref: ${paymentId}). Your reservation for ${formData.guests} guests (₹${pricing.totalPrice}) is confirmed.`);
          // 🔔 Fire push notification on booking confirmation
          await notifyBookingConfirmed({
            name: formData.name,
            table: 'Your Reserved Table',
            date: formData.date,
            time: formData.time,
            bookingId: newBooking.id,
          });
        },
        onFailure: async () => {
          await saveReservation(newBooking);
          setSuccessMsg(`Reservation saved for ${formData.guests} guests (Pay ₹${pricing.totalPrice} at venue). Our team will confirm shortly.`);
          // 🔔 Also notify on pay-at-venue reservations
          await notifyBookingConfirmed({
            name: formData.name,
            table: 'Your Reserved Table',
            date: formData.date,
            time: formData.time,
            bookingId: newBooking.id,
          });
        }
      });


      setFormData({
        name: '',
        phone: '',
        email: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        guests: '2',
        special_requests: ''
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit reservation request. Please call us directly at 07310008020');
    } finally {
      setLoading(false);
    }
  };


  const bookingOptions = [
    { id: 'table_booking', label: 'Table Booking', icon: Calendar },
    { id: 'birthday_party', label: 'Birthday Celebration 🎂', icon: Users },
    { id: 'kitty_party', label: 'Kitty Party 🐱', icon: Users },
    { id: 'anniversary', label: 'Anniversary Party 💍', icon: Users },
    { id: 'corporate_event', label: 'Corporate Event', icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#120B08]/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl shadow-2xl border-2 border-[#E5B82C] overflow-hidden max-h-[90vh] flex flex-col text-[#1F1810]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F1810] via-[#2A1E14] to-[#120B08] text-white p-6 relative border-b-2 border-[#F5D061]/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-[#F5D061] hover:text-[#120B08] text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#F5D061]">
            Wings River Café • Reserve Online
          </span>
          <h3 className="font-serif text-2xl font-bold mt-1 text-[#F8E7A1]">Book Table &amp; Private Party</h3>
          <p className="text-xs text-[#D4C4A0] mt-1">
            Riverside Table Dining &amp; VIP Private Canopy Event Bookings
          </p>
        </div>


        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successMsg ? (
            <div className="bg-mint-50 border border-mint-300 p-6 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-mint-600 mx-auto" />
              <h4 className="font-serif font-bold text-xl text-dark-900">Booking Submitted!</h4>
              <p className="text-sm text-gray-700">{successMsg}</p>
              <div className="p-3 bg-white rounded-xl border border-mint-200 text-xs text-gray-600">
                Direct Call Confirmation: <a href="tel:07310008020" className="font-bold text-mint-700 underline">07310008020</a>
              </div>
              <button
                onClick={() => {
                  setSuccessMsg('');
                  onClose();
                }}
                className="w-full py-3 bg-mint-500 text-dark-950 font-bold rounded-xl shadow-md"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Booking Type Selector */}
              <div>
                <label className="block text-xs font-extrabold text-[#1F1810] uppercase tracking-wider mb-2">
                  Select Booking Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {bookingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBookingType(opt.id)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                        bookingType === opt.id
                          ? 'bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] border-[#120B08] shadow-md scale-102'
                          : 'bg-white text-[#1F1810] border-[#E5B82C]/40 hover:border-[#F5D061] hover:bg-[#FAF5EC]'
                      }`}
                    >
                      <opt.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1810] mb-1 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-[#E5B82C]" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-bold bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5D061] focus:border-[#F5D061]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1810] mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-[#E5B82C]" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 07310008020"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-bold bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5D061] focus:border-[#F5D061]"
                  />
                </div>
              </div>

              {/* Date, Time & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1810] mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#E5B82C]" />
                    <span>Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#F5D061] focus:border-[#F5D061]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1810] mb-1 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#E5B82C]" />
                      <span>Time Slot *</span>
                    </span>
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#F5D061] focus:border-[#F5D061]"
                  >
                    <option value="11:00 AM">11:00 AM Slot</option>
                    <option value="12:00 PM">12:00 PM Slot</option>
                    <option value="01:00 PM">01:00 PM Slot</option>
                    <option value="02:00 PM">02:00 PM Slot</option>
                    <option value="03:00 PM">03:00 PM Slot</option>
                    <option value="04:00 PM">04:00 PM Slot</option>
                    <option value="05:00 PM">05:00 PM Slot</option>
                    <option value="06:00 PM">06:00 PM Slot</option>
                    <option value="07:00 PM">07:00 PM (Dinner Special)</option>
                    <option value="08:00 PM">08:00 PM Slot</option>
                    <option value="09:00 PM">09:00 PM Slot</option>
                    <option value="10:00 PM">10:00 PM Slot</option>
                    <option value="11:00 PM">11:00 PM Slot</option>
                    <option value="custom">Custom Time Request...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1810] mb-1 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-[#E5B82C]" />
                    <span>Guests *</span>
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#F5D061] focus:border-[#F5D061]"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                      <option key={n} value={n} className="text-[#1F1810] font-bold">
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Optional */}
              <div>
                <label className="block text-xs font-bold text-[#1F1810] mb-1 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-[#E5B82C]" />
                  <span>Email Address (Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-bold bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5D061] focus:border-[#F5D061]"
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-bold text-[#1F1810] mb-1">
                  Special Requests / Cake &amp; Lighting preferences
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Riverside table, Birthday cake setup, Fairy lights decoration..."
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border-2 border-[#E5B82C]/60 text-[#1F1810] font-bold bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5D061] focus:border-[#F5D061]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#120B08] font-extrabold text-base rounded-xl shadow-xl hover:from-[#F8E7A1] hover:to-[#F5D061] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Submitting Reservation...' : 'Confirm Reservation Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
