'use client';

import React, { useState } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import {
  Calendar, Clock, Users, ChevronLeft, ChevronRight,
  Tent, Waves, CheckCircle, ArrowRight, Info, QrCode
} from 'lucide-react';
import { saveReservation, Reservation } from '@/lib/db';
import { notifyBookingConfirmed } from '@/lib/pushNotifications';
import { calculateBookingPrice } from '@/lib/pricing';
import { openRazorpayCheckout } from '@/lib/razorpay';

const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '06:00 PM', '06:30 PM', '07:00 PM',
  '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM',
];

const SEATING_TYPES = [
  { id: 'indoor',  label: 'Indoor Hall',     icon: '🏛️', desc: 'Air-conditioned dining', available: true  },
  { id: 'canopy',  label: 'Riverside Canopy', icon: '🌊', desc: 'Private tent by the river', available: true  },
  { id: 'terrace', label: 'Open Terrace',    icon: '🌇', desc: 'Sunset view seating', available: true  },
  { id: 'vip',     label: 'VIP Cabana',      icon: '✨', desc: 'Exclusive riverside cabana', available: false },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReservePage() {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [seating, setSeating] = useState('indoor');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Customer details & Confirmation State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const isPast = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(todayYear, todayMonth, todayDate);
    return d < t;
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDate(null);
  };

  const canContinue1 = selectedDate !== null;
  const canContinue2 = selectedTime !== null;

  const dateStr = selectedDate
    ? `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    : '';

  const dateLabel = selectedDate
    ? `${selectedDate} ${MONTHS[calMonth]} ${calYear}`
    : 'Select a date';

  const handleConfirmReservation = async () => {
    if (!guestName || !guestPhone) {
      setErrorMsg('Please enter your Name and Phone Number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const bookingId = 'WRC-' + Math.floor(1000 + Math.random() * 9000);
    const seatingLabel = SEATING_TYPES.find(s => s.id === seating)?.label || 'Indoor Hall';

    const newBooking: Reservation = {
      id: bookingId,
      name: guestName,
      phone: guestPhone,
      email: guestEmail || '',
      booking_type: 'table_booking',
      date: dateStr || new Date().toISOString().split('T')[0],
      time: selectedTime || '07:00 PM',
      guests: guests,
      special_requests: `Seating: ${seatingLabel}${specialNotes ? ` | ${specialNotes}` : ''}`,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    try {
      const pricing = calculateBookingPrice(newBooking.date, guests);
      await openRazorpayCheckout({
        amount: pricing.totalPrice,
        name: 'Wings River Café Reservation',
        description: `Table Reservation • ${guests} Guests (${seatingLabel})`,
        customerName: guestName,
        customerPhone: guestPhone,
        customerEmail: guestEmail,
        onSuccess: async () => {
          await saveReservation(newBooking);
          await notifyBookingConfirmed({
            name: guestName,
            table: seatingLabel,
            date: dateLabel,
            time: selectedTime || '',
            bookingId: bookingId,
          });
          setConfirmedBooking(newBooking);
        },
        onFailure: async () => {
          newBooking.status = 'pending';
          await saveReservation(newBooking);
          setConfirmedBooking(newBooking);
        },
      });
    } catch {
      await saveReservation(newBooking);
      setConfirmedBooking(newBooking);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedBooking) {
    return (
      <CustomerLayout breadcrumbs={[{ label: 'Reserve Table' }]}>
        <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-xl">
            ✓
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-serif text-white">Reservation Confirmed!</h1>
            <p className="text-sm text-white/60">We look forward to hosting you at Wings River Café.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-white/40">Booking Ref</span>
              <span className="text-sm font-mono font-bold text-gold-400">#{confirmedBooking.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-white/40 mb-0.5">Guest Name</p>
                <p className="font-bold text-white">{confirmedBooking.name}</p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">Phone</p>
                <p className="font-bold text-white">{confirmedBooking.phone}</p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">Date & Time</p>
                <p className="font-bold text-gold-400">{confirmedBooking.date} at {confirmedBooking.time}</p>
              </div>
              <div>
                <p className="text-white/40 mb-0.5">Guests & Seating</p>
                <p className="font-bold text-white">{confirmedBooking.guests} Guests ({SEATING_TYPES.find(s => s.id === seating)?.label})</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 mt-3">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shrink-0">
                <QrCode className="w-9 h-9 text-slate-950" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Entry Pass QR</p>
                <p className="text-base font-bold text-gold-400 font-mono">{confirmedBooking.id}</p>
                <p className="text-[10px] text-white/40">Show this QR ticket upon arrival at the venue</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href="/my-reservations"
              className="flex-1 py-3 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              View My Bookings
            </a>
            <button
              onClick={() => { setConfirmedBooking(null); setStep(1); }}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
            >
              Book Another Table
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout breadcrumbs={[{ label: 'Reserve Table' }]}>
      <div className="max-w-lg mx-auto px-4 pb-10">

        {/* Header */}
        <div className="pt-6 pb-5">
          <h1 className="text-2xl font-bold font-serif text-white mb-1">
            Reserve a <span className="text-gold-400">Table</span>
          </h1>
          <p className="text-sm text-white/50">Book your perfect riverside experience</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-7">
          {([1, 2, 3] as const).map(s => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? 'text-gold-400' : 'text-white/30'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${step === s ? 'border-gold-400 bg-gold-400 text-slate-950'
                    : step > s ? 'border-gold-400 bg-gold-400/20 text-gold-400'
                    : 'border-white/20 text-white/30'}`}>
                  {step > s ? '✓' : s}
                </span>
                <span className="text-xs font-medium hidden sm:block">
                  {s === 1 ? 'Date & Time' : s === 2 ? 'Guests' : 'Confirm'}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-gold-400/60' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Date & Time ── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Mini Calendar */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all" aria-label="Previous month">
                  <ChevronLeft className="w-4 h-4 text-white/70" />
                </button>
                <span className="text-sm font-bold text-white">{MONTHS[calMonth]} {calYear}</span>
                <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all" aria-label="Next month">
                  <ChevronRight className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <div key={d} className="text-center text-[10px] text-white/30 font-semibold py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const past = isPast(day);
                  const isToday = day === todayDate && calMonth === todayMonth && calYear === todayYear;
                  const selected = day === selectedDate;

                  return (
                    <button
                      key={day}
                      disabled={past}
                      onClick={() => setSelectedDate(day)}
                      className={`h-9 w-full rounded-lg text-sm font-medium transition-all
                        ${past ? 'text-white/15 cursor-not-allowed'
                          : selected ? 'bg-gold-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                          : isToday ? 'border border-gold-500/60 text-gold-400 hover:bg-gold-500/10'
                          : 'text-white/80 hover:bg-white/10'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400" /> Select Time Slot
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all
                      ${selectedTime === slot
                        ? 'bg-gold-500 text-slate-950 border-gold-500 shadow-md shadow-amber-500/30'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canContinue1 || !canContinue2}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Guests & Seating ── */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Selected Date/Time Summary */}
            <div className="flex items-center gap-3 bg-gold-500/10 border border-gold-500/30 rounded-xl px-4 py-3">
              <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-sm text-gold-300 font-medium">{dateLabel}</span>
              <span className="text-white/40">·</span>
              <Clock className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-sm text-gold-300 font-medium">{selectedTime}</span>
            </div>

            {/* Guest Counter */}
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-400" /> Number of Guests
              </h3>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setGuests(g => Math.max(1, g - 1))}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xl flex items-center justify-center transition-all"
                  aria-label="Decrease guests"
                >−</button>
                <span className="text-3xl font-bold text-gold-400 w-8 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(g => Math.min(20, g + 1))}
                  className="w-12 h-12 rounded-full bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xl flex items-center justify-center transition-all"
                  aria-label="Increase guests"
                >+</button>
              </div>
              <p className="text-xs text-white/35 mt-2">Max 20 guests per reservation. For larger groups, call us.</p>
            </div>

            {/* Seating Type */}
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Tent className="w-4 h-4 text-gold-400" /> Seating Preference
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {SEATING_TYPES.map(s => (
                  <button
                    key={s.id}
                    disabled={!s.available}
                    onClick={() => setSeating(s.id)}
                    className={`relative flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all
                      ${!s.available ? 'opacity-40 cursor-not-allowed border-white/10 bg-white/3'
                        : seating === s.id ? 'border-gold-500 bg-gold-500/10 shadow-md shadow-amber-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/25'}`}
                  >
                    {!s.available && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold text-white/30 bg-white/10 px-1.5 py-0.5 rounded-full">FULL</span>
                    )}
                    {seating === s.id && s.available && (
                      <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-gold-400" />
                    )}
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-xs font-bold text-white">{s.label}</span>
                    <span className="text-[10px] text-white/45">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 font-semibold py-3 rounded-xl hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Review Booking <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === 3 && (
          <div className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-bold text-white">Booking Details</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Special Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Window seat, anniversary decoration..."
                    value={specialNotes}
                    onChange={e => setSpecialNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
                {[
                  { label: 'Date',    value: dateLabel,       icon: Calendar },
                  { label: 'Time',    value: selectedTime!,   icon: Clock },
                  { label: 'Guests',  value: `${guests} guests`, icon: Users },
                  { label: 'Seating', value: SEATING_TYPES.find(s => s.id === seating)?.label ?? '', icon: Tent },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-white/50"><Icon className="w-4 h-4 text-gold-400/70" />{label}</span>
                    <span className="text-white font-semibold text-right">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 mt-3">
                <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-sky-300 leading-relaxed">
                  Reservation confirmation ticket will be generated instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/70 font-semibold py-3 rounded-xl hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Edit
              </button>
              <button
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
                onClick={handleConfirmReservation}
              >
                <CheckCircle className="w-4.5 h-4.5" /> {isSubmitting ? 'Processing…' : 'Confirm & Reserve Table'}
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

