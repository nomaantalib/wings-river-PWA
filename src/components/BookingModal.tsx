'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, User, Phone, Mail, Sparkles, Anchor, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveReservation, Reservation } from '@/lib/db';

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

  const handleSubmit = (e: React.FormEvent) => {
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

      saveReservation(newBooking);

      setSuccessMsg('Your reservation request has been submitted successfully! Our team will call you to confirm.');
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
      setErrorMsg('Failed to submit reservation request. Please call us directly at 07310008020');
    } finally {
      setLoading(false);
    }
  };

  const bookingOptions = [
    { id: 'table_booking', label: 'Table Booking', icon: Calendar },
    { id: 'birthday_party', label: 'Birthday Party', icon: Sparkles },
    { id: 'anniversary', label: 'Anniversary', icon: Sparkles },
    { id: 'speedboat_ride', label: 'Speedboat Ride', icon: Anchor },
    { id: 'corporate_event', label: 'Corporate Event', icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-mint-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-mint-500 via-mint-600 to-dark-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] uppercase tracking-widest font-bold text-gold-300">
            Wings River Café • Reserve Online
          </span>
          <h3 className="font-serif text-2xl font-bold mt-1">Book Your Experience</h3>
          <p className="text-xs text-cream-200 mt-1">
            Table Dining • Birthday Parties • Speedboat Water Sports
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
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Booking Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {bookingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBookingType(opt.id)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        bookingType === opt.id
                          ? 'bg-mint-500 text-dark-950 border-mint-500 shadow-md scale-102'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-cream-100'
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-mint-600" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-mint-600" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 07310008020"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>
              </div>

              {/* Date, Time & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-mint-600" />
                    <span>Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-mint-600" />
                    <span>Time *</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-mint-600" />
                    <span>Guests *</span>
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-400 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                      <option key={n} value={n} className="text-gray-900">
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Optional */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-mint-600" />
                  <span>Email Address (Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-400"
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Special Requests / Cake & Lighting preferences
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Riverside table, Birthday cake setup, Fairy lights decoration..."
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-mint-400 via-mint-500 to-gold-400 text-dark-950 font-bold text-base rounded-xl shadow-xl hover:shadow-mint-500/30 transition-all duration-300 disabled:opacity-50"
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
