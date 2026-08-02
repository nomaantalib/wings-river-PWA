'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Clock, Calendar, CheckCircle2, ShieldAlert,
  ArrowLeft, Home, Leaf, Sunset, ChevronRight, ChevronLeft, MapPin,
  Timer, Zap, Sun, Compass, Trees, Lock, IndianRupee, Receipt, LogOut,
  Camera, X, User, Phone, Mail, Loader2, Download, QrCode, ShieldCheck, Ticket
} from 'lucide-react';
import { calculateBookingPrice } from '@/lib/pricing';
import { getStoredUserSession } from './UserAuthModal';
import { saveReservation, Reservation, getStoredGalleryItems, GalleryItem, INITIAL_GALLERY, getStoredFloorPlan, FloorPlanLayout, FloorObject } from '@/lib/db';
import { notifyBookingConfirmed } from '@/lib/pushNotifications';
import { openRazorpayCheckout } from '@/lib/razorpay';

/* ─── Data Types ─────────────────────────────────────────── */

interface TableData {
  id: string;
  table_number: string;
  cluster_id: string;
  capacity: number;
  status: 'free' | 'eating' | 'needs_cleaning' | 'reserved';
}

interface AreaCard {
  id: string;
  label: string;
  subtitle: string;
  tag: string;
  iconType: 'home' | 'leaf' | 'sunset';
  gradient: string;
  borderStyle: string;
  tagStyle: string;
  tables: string;
  tableIds: string[];
}

interface InteractiveFloorMapProps {
  onSelectTable: (table: TableData, date: string, time: string, guests: number) => void;
}

/* ─── Static Table Data ───────────────────────────────────── */
const ALL_TABLES: TableData[] = [
  // Rooftop Upper Deck — T1-T6
  { id: 'tbl-1',  table_number: 'T1', cluster_id: 'rooftop', capacity: 2, status: 'free' },
  { id: 'tbl-2',  table_number: 'T2', cluster_id: 'rooftop', capacity: 4, status: 'eating' },
  { id: 'tbl-3',  table_number: 'T3', cluster_id: 'rooftop', capacity: 2, status: 'free' },
  { id: 'tbl-4',  table_number: 'T4', cluster_id: 'rooftop', capacity: 4, status: 'free' },
  { id: 'tbl-5',  table_number: 'T5', cluster_id: 'rooftop', capacity: 2, status: 'free' },
  { id: 'tbl-6',  table_number: 'T6', cluster_id: 'rooftop', capacity: 4, status: 'reserved' },
  // Open Garden — T7-T13
  { id: 'tbl-7',  table_number: 'T7',  cluster_id: 'garden', capacity: 4, status: 'free' },
  { id: 'tbl-8',  table_number: 'T8',  cluster_id: 'garden', capacity: 4, status: 'free' },
  { id: 'tbl-9',  table_number: 'T9',  cluster_id: 'garden', capacity: 6, status: 'eating' },
  { id: 'tbl-10', table_number: 'T10', cluster_id: 'garden', capacity: 4, status: 'free' },
  { id: 'tbl-11', table_number: 'T11', cluster_id: 'garden', capacity: 4, status: 'free' },
  { id: 'tbl-12', table_number: 'T12', cluster_id: 'garden', capacity: 6, status: 'free' },
  { id: 'tbl-13', table_number: 'T13', cluster_id: 'garden', capacity: 8, status: 'reserved' },
  // Indoor AC Hall — T14-T17
  { id: 'tbl-14', table_number: 'T14', cluster_id: 'indoor', capacity: 4, status: 'free' },
  { id: 'tbl-15', table_number: 'T15', cluster_id: 'indoor', capacity: 4, status: 'free' },
  { id: 'tbl-16', table_number: 'T16', cluster_id: 'indoor', capacity: 6, status: 'eating' },
  { id: 'tbl-17', table_number: 'T17', cluster_id: 'indoor', capacity: 8, status: 'free' },
];

const AREAS: AreaCard[] = [
  {
    id: 'indoor',
    label: 'Indoor AC Hall',
    subtitle: 'Air-conditioned • Cozy • River View Windows',
    tag: 'Most Popular',
    iconType: 'home',
    gradient: 'from-[#2A1E17] via-[#1E140F] to-[#120B08]',
    borderStyle: 'border-[#6B8E5E] hover:border-[#8A9A78]',
    tagStyle: 'bg-[#6B8E5E] text-[#FFF8E7] border border-[#4F6C44] font-extrabold shadow-md px-2.5 py-1 rounded-lg',
    tables: 'T14 – T17',
    tableIds: ['tbl-14','tbl-15','tbl-16','tbl-17'],
  },
  {
    id: 'garden',
    label: 'Open Garden Area',
    subtitle: 'Outdoor • Canopy Lights • Riverside Breeze',
    tag: 'Family Favourite',
    iconType: 'leaf',
    gradient: 'from-[#212C1B] via-[#182213] to-[#0E150B]',
    borderStyle: 'border-[#8A9A78] hover:border-[#98A886]',
    tagStyle: 'bg-[#E5B82C] text-[#120B08] border border-[#F5D061] font-extrabold shadow-md px-2.5 py-1 rounded-lg',
    tables: 'T7 – T13',
    tableIds: ['tbl-7','tbl-8','tbl-9','tbl-10','tbl-11','tbl-12','tbl-13'],
  },
  {
    id: 'rooftop',
    label: 'Rooftop Upper Deck',
    subtitle: 'Best River View • Sunset Dining • Starlit Nights',
    tag: 'Premium View',
    iconType: 'sunset',
    gradient: 'from-[#332216] via-[#24160C] to-[#120A05]',
    borderStyle: 'border-[#4A7DA0] hover:border-[#7BB8D4]',
    tagStyle: 'bg-[#1A3550] text-[#7BB8D4] border border-[#4A7DA0] font-extrabold shadow-md px-2.5 py-1 rounded-lg',
    tables: 'T1 – T6',
    tableIds: ['tbl-1','tbl-2','tbl-3','tbl-4','tbl-5','tbl-6'],
  },
];

const AREA_LAYOUTS: Record<string, string[][]> = {
  rooftop: [['T1', 'T3', 'T5'], ['T2', 'T4', 'T6']],
  garden:  [['T13', 'T12', 'T11', 'T10'], ['T7', 'T8', 'T9']],
  indoor:  [['T14', 'T15'], ['T16', 'T17']],
};

/* ─── Time Slot Presets ────────────────────────────────────── */
const TIME_SLOTS = [
  { value: '11:00', label: '11:00 AM', tag: 'Brunch' },
  { value: '12:30', label: '12:30 PM', tag: 'Lunch' },
  { value: '14:00', label: '02:00 PM', tag: 'Afternoon' },
  { value: '17:30', label: '05:30 PM', tag: 'Sunset' },
  { value: '19:00', label: '07:00 PM', tag: 'Dinner' },
  { value: '19:30', label: '07:30 PM', tag: 'Prime' },
  { value: '21:00', label: '09:00 PM', tag: 'Late Night' },
  { value: 'custom', label: 'Custom Time', tag: '' },
];

const DURATIONS = [
  { value: 1, label: '1 Hour', tag: 'Quick' },
  { value: 2, label: '2 Hours', tag: 'Ideal' },
  { value: 3, label: '3 Hours', tag: 'Relaxed' },
  { value: 4, label: '4 Hours', tag: 'Event' },
];

/* ─── Helpers ─────────────────────────────────────────────── */
function statusLabel(s: TableData['status']) {
  if (s === 'free') return 'Available';
  if (s === 'eating') return 'Occupied';
  if (s === 'reserved') return 'Reserved';
  return 'Cleaning';
}

function statusClasses(s: TableData['status'], selected: boolean) {
  if (selected)
    return 'bg-gradient-to-br from-[#F5D061] via-[#E5B82C] to-[#D4AF37] border-[#1F1810] text-[#120B08] font-bold shadow-2xl shadow-[#F5D061]/50 scale-110 z-20 ring-4 ring-[#1F1810]';
  if (s === 'free')
    return 'bg-[#FAF7F2] border-2 border-[#2D6A4F] text-[#1F1810] hover:bg-[#E8F0EC] hover:border-[#1B4332] hover:scale-105 cursor-pointer active:scale-95 shadow-sm';
  if (s === 'eating')
    return 'bg-[#F4EFE6] border-[#E5B82C]/50 text-[#7A5C3A]/60 opacity-60 cursor-not-allowed';
  if (s === 'reserved')
    return 'bg-[#F4EFE6] border-red-500/40 text-red-700/60 opacity-50 cursor-not-allowed';
  return 'bg-[#E5D9C8] border-[#A08060]/40 text-[#8B7355] opacity-40 cursor-not-allowed';
}

function AreaIcon({ type, className = 'w-6 h-6' }: { type: 'home' | 'leaf' | 'sunset'; className?: string }) {
  if (type === 'home') return <Home className={`${className} text-[#E8DCB8]`} />;
  if (type === 'leaf') return <Leaf className={`${className} text-[#98A886]`} />;
  return <Sunset className={`${className} text-[#F5EBE0]`} />;
}

function formatCheckout(checkin: string, durationHrs: number): string {
  if (!checkin || checkin === 'custom') return '';
  const [h, m] = checkin.split(':').map(Number);
  const totalMins = h * 60 + m + durationHrs * 60;
  const outH = Math.floor(totalMins / 60) % 24;
  const outM = totalMins % 60;
  const period = outH >= 12 ? 'PM' : 'AM';
  const h12 = outH % 12 || 12;
  return `${h12}:${outM < 10 ? '0' : ''}${outM} ${period}`;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function InteractiveFloorMap({ onSelectTable }: InteractiveFloorMapProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedArea, setSelectedArea] = useState<AreaCard | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [tablesList, setTablesList] = useState<TableData[]>(ALL_TABLES);

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('19:30');
  const [customTime, setCustomTime] = useState<string>('19:30');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [durationHrs, setDurationHrs] = useState<number>(2);
  const [guestCount, setGuestCount] = useState<number>(2);

  // User contact details & autofill
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoggedInUser, setIsLoggedInUser] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Area Gallery Modal state
  const [activeClusterGallery, setActiveClusterGallery] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);

  // Ticket generation state
  const [isProcessingBooking, setIsProcessingBooking] = useState<boolean>(false);
  const [ticketSlip, setTicketSlip] = useState<any>(null);

  const stepRef = useRef<HTMLDivElement>(null);

  // Load user session details automatically
  useEffect(() => {
    const syncUser = () => {
      const sess = getStoredUserSession();
      if (sess && sess.loggedIn) {
        setIsLoggedInUser(true);
        if (sess.name) setUserName(sess.name);
        if (sess.phone) setUserPhone(sess.phone);
        if (sess.email) setUserEmail(sess.email);
      } else {
        setIsLoggedInUser(false);
      }
    };
    syncUser();
    window.addEventListener('wings_auth_change', syncUser);
    return () => window.removeEventListener('wings_auth_change', syncUser);
  }, []);

  // Floor Plan Layout state from Admin Builder / D1
  const [floorPlanLayout, setFloorPlanLayout] = useState<FloorPlanLayout | null>(null);

  // Single download / print state
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const handlePrintSaveTicket = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      window.print();
    } catch {}
    setTimeout(() => setIsPrinting(false), 2500);
  };

  const handleCloseTicket = () => {
    setTicketSlip(null);
    setSelectedTable(null);
    setSelectedArea(null);
    setHoldLeft(null);
    setFormError('');
    setStep(1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wings_open_my_bookings'));
    }
  };

  // Area Gallery Modal Auto-sliding Carousel State
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState<boolean>(true);

  useEffect(() => {
    const loadPlan = () => {
      getStoredFloorPlan().then((plan) => {
        if (plan && Array.isArray(plan.objects)) setFloorPlanLayout(plan);
      });
    };
    loadPlan();
    window.addEventListener('wings_db_sync', loadPlan);
    return () => window.removeEventListener('wings_db_sync', loadPlan);
  }, []);

  // Pre-load gallery & map images into browser cache for 0-buffering instant rendering
  useEffect(() => {
    if (typeof window !== 'undefined' && Array.isArray(galleryItems)) {
      galleryItems.forEach(item => {
        if (item.image_url && !item.image_url.endsWith('.mp4')) {
          const img = new Image();
          img.src = item.image_url;
        }
      });
    }
  }, [galleryItems]);

  // Auto-slide effect for cluster gallery photos/videos
  useEffect(() => {
    if (!activeClusterGallery || !isCarouselPlaying) return;
    const items = galleryItems.filter(
      item => !item.cluster_id || item.cluster_id === activeClusterGallery || item.category?.toLowerCase().includes(activeClusterGallery)
    );
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % items.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [activeClusterGallery, isCarouselPlaying, galleryItems]);

  // Sync staff/admin table readiness updates
  useEffect(() => {
    const syncTableStatus = () => {
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem('wings_tables_status');
        if (raw) {
          const map = JSON.parse(raw);
          setTablesList(prev => prev.map(t => map[t.table_number] ? { ...t, status: map[t.table_number] } : t));
        }
      } catch { /* fallback */ }
    };
    syncTableStatus();
    window.addEventListener('wings_db_sync', syncTableStatus);
    return () => window.removeEventListener('wings_db_sync', syncTableStatus);
  }, []);

  // 5-minute hold timer
  const [holdLeft, setHoldLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!selectedTable) { setHoldLeft(null); return; }
    setHoldLeft(300);
  }, [selectedTable]);
  useEffect(() => {
    if (holdLeft === null || holdLeft <= 0) return;
    const t = setInterval(() => setHoldLeft(p => (p && p > 1 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [holdLeft]);
  const fmtTimer = (s: number) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  const effectiveTime = showCustomTime ? customTime : selectedTime;

  // Smooth scroll to top of component on step change
  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [step]);

  const areaTables = selectedArea ? tablesList.filter(t => t.cluster_id === selectedArea.id) : [];
  const freeCount  = areaTables.filter(t => t.status === 'free').length;

  const handleAreaSelect = (area: AreaCard) => { setSelectedArea(area); setSelectedTable(null); setStep(2); };
  const handleTableSelect = (t: TableData) => { if (t.status !== 'free') return; setSelectedTable(t); setStep(3); };
  const handleBack = () => {
    if (step === 3) { setSelectedTable(null); setStep(2); }
    else { setSelectedArea(null); setSelectedTable(null); setStep(1); }
  };

  const handleConfirmReservation = async () => {
    setFormError('');
    if (!userName.trim()) {
      setFormError('Please enter your full name for the booking ticket.');
      return;
    }
    if (!userPhone.trim() || userPhone.trim().length < 8) {
      setFormError('Please enter a valid phone number for table reservation confirmation.');
      return;
    }

    if (!selectedTable || !selectedArea) return;

    setIsProcessingBooking(true);
    const pricing = calculateBookingPrice(selectedDate, guestCount);
    const resId = 'WR-' + Math.floor(100000 + Math.random() * 900000);
    const checkoutLabel = formatCheckout(effectiveTime, durationHrs);
    const timeLabel = TIME_SLOTS.find(s => s.value === effectiveTime)?.label || effectiveTime;

    try {
      // 1. Launch Razorpay Payment Gateway Checkout first
      const launched = await openRazorpayCheckout({
        amount: pricing.totalPrice,
        name: 'Wings River Café Table Reservation',
        description: `Table ${selectedTable.table_number} (${selectedArea.label}) for ${guestCount} guests`,
        customerName: userName,
        customerPhone: userPhone,
        customerEmail: userEmail || 'guest@wingsrivercafe.com',
        onSuccess: async (paymentId: string) => {
          try {
            const reservationObj: Reservation = {
              id: resId,
              name: userName,
              phone: userPhone,
              email: userEmail || '',
              booking_type: 'table_booking',
              date: selectedDate,
              time: effectiveTime,
              guests: guestCount,
              table_number: selectedTable.table_number,
              cluster_id: selectedArea.id,
              special_requests: `Area: ${selectedArea.label} • PaymentId: ${paymentId} • Duration: ${durationHrs} hrs (Checkout ~${checkoutLabel})`,
              status: 'confirmed',
              created_at: new Date().toISOString()
            };

            // 2. Save to D1 Database persistently
            await saveReservation(reservationObj);

            // 3. Trigger Push Notifications & SMS alerts
            await notifyBookingConfirmed({
              name: userName,
              table: `${selectedTable.table_number} (${selectedArea.label})`,
              date: selectedDate,
              time: timeLabel,
              bookingId: resId,
            }).catch(() => {});

            // 4. Generate QR Code Ticket Payload & URL
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
              `WINGS-RIVER-CAFE|${resId}|TABLE-${selectedTable.table_number}|${selectedDate}|${effectiveTime}|PAYMENT-${paymentId}|GUESTS-${guestCount}|${userName}`
            )}`;

            setTicketSlip({
              bookingId: resId,
              guestName: userName,
              guestPhone: userPhone,
              guestEmail: userEmail,
              areaName: selectedArea.label,
              tableNumber: selectedTable.table_number,
              date: selectedDate,
              timeLabel: timeLabel,
              checkoutLabel: checkoutLabel,
              durationHrs: durationHrs,
              guestCount: guestCount,
              totalAmount: pricing.totalPrice,
              perPersonRate: pricing.perPersonRate,
              qrUrl: qrUrl,
              createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            // Stop hold timer
            setHoldLeft(null);

            // Trigger parent callback
            onSelectTable(selectedTable, selectedDate, effectiveTime, guestCount);
          } catch (err: any) {
            setFormError(err.message || 'Payment recorded but ticket generation failed.');
          } finally {
            setIsProcessingBooking(false);
          }
        },
        onFailure: (err: any) => {
          setIsProcessingBooking(false);
          setFormError('Payment was not completed. Your table remains on 5-minute hold. Please try paying again.');
        }
      });

      if (!launched) {
        setIsProcessingBooking(false);
        setFormError('Failed to launch Razorpay Payment window. Please check connection.');
      }
    } catch (err: any) {
      setIsProcessingBooking(false);
      setFormError(err.message || 'Failed to initiate Razorpay checkout. Please try again.');
    }
  };

  const STEP_LABELS = ['Choose Area', 'Pick Table', 'Confirm & QR Ticket'];

  return (
    <div
      ref={stepRef}
      className="bg-[#FAF7F2] border border-[#E5B82C]/40 rounded-3xl shadow-2xl text-[#1F1810] overflow-hidden relative"
    >

      {/* ── Section Header ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1F1810] via-[#2A1D0E] to-[#1F1810] border-b border-[#F5D061]/25 px-5 sm:px-7 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#E5B82C] p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-[#120B08] rounded-[14px] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#F5D061]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#F8E7A1]">
                Reserve Your Table
              </h3>
              <p className="text-xs text-[#D4C4A0]/80 mt-0.5">Select Gomti riverfront deck area → pick table → instant QR ticket</p>
            </div>
          </div>

          {/* ── Booking Filters ──────────────────────────────── */}
          <div className="flex flex-wrap gap-2.5">

            {/* Date */}
            <label className="flex items-center gap-2 bg-[#2A1D0E] border-2 border-[#F5D061]/60 rounded-xl px-3.5 py-2 text-xs font-bold text-[#FFF8E7] cursor-pointer hover:border-[#F5D061] hover:bg-[#3D291C] transition-all focus-within:ring-2 focus-within:ring-[#F5D061]">
              <Calendar className="w-4 h-4 text-[#F5D061] shrink-0" />
              <input
                type="date"
                aria-label="Booking date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-[#FFF8E7] font-bold focus:outline-none w-28 cursor-pointer"
              />
            </label>

            {/* Guest Count */}
            <label className="flex items-center gap-2 bg-[#2A1D0E] border-2 border-[#F5D061]/60 rounded-xl px-3.5 py-2 text-xs font-bold text-[#FFF8E7] cursor-pointer hover:border-[#F5D061] hover:bg-[#3D291C] transition-all focus-within:ring-2 focus-within:ring-[#F5D061]">
              <Users className="w-4 h-4 text-[#F5D061] shrink-0" />
              <select
                aria-label="Number of guests"
                value={guestCount}
                onChange={e => setGuestCount(Number(e.target.value))}
                className="bg-transparent text-[#FFF8E7] font-bold focus:outline-none cursor-pointer"
              >
                {[1,2,3,4,5,6,8,10,12,15,20].map(n => (
                  <option key={n} value={n} className="bg-[#1F1810] text-[#FFF8E7] font-bold">{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </label>

            {/* Duration */}
            <label className="flex items-center gap-2 bg-[#2A1D0E] border-2 border-[#F5D061]/60 rounded-xl px-3.5 py-2 text-xs font-bold text-[#FFF8E7] cursor-pointer hover:border-[#F5D061] hover:bg-[#3D291C] transition-all focus-within:ring-2 focus-within:ring-[#F5D061]">
              <Timer className="w-4 h-4 text-[#F5D061] shrink-0" />
              <select
                aria-label="Duration of stay"
                value={durationHrs}
                onChange={e => setDurationHrs(Number(e.target.value))}
                className="bg-transparent text-[#FFF8E7] font-bold focus:outline-none cursor-pointer"
              >
                {DURATIONS.map(d => (
                  <option key={d.value} value={d.value} className="bg-[#1F1810] text-[#FFF8E7] font-bold">
                    {d.label} ({d.tag})
                  </option>
                ))}
              </select>
            </label>

          </div>
        </div>

        {/* ── Time Slot Picker — Movable Horizontal Carousel ───────────────── */}
        <div className="mt-4">
          <p className="text-xs text-[#F5D061] uppercase tracking-widest mb-2.5 font-extrabold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#F5D061]" />
            Select Check-in Time Slot
          </p>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 px-1 scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing">
            {TIME_SLOTS.map(slot => {
              const isCustomSlot = slot.value === 'custom';
              const isActive = isCustomSlot ? showCustomTime : (!showCustomTime && selectedTime === slot.value);
              return (
                <button
                  key={slot.value}
                  aria-pressed={isActive}
                  onClick={() => {
                    if (isCustomSlot) {
                      setShowCustomTime(true);
                    } else {
                      setShowCustomTime(false);
                      setSelectedTime(slot.value);
                    }
                  }}
                  className={`snap-start shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 border flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] border-[#FFF8E7] text-[#120B08] shadow-xl shadow-[#F5D061]/40 scale-105 ring-2 ring-[#FFF8E7]'
                      : 'bg-[#2A1D0E] border-[#E5B82C]/40 text-[#F5EBE0] hover:border-[#F5D061] hover:text-[#FFF8E7] hover:bg-[#3D291C]'
                  }`}
                >
                  <span>{slot.label}</span>
                  {slot.tag && <span className="opacity-75 text-[9px] font-mono">· {slot.tag}</span>}
                </button>
              );
            })}
          </div>

          {/* Custom time input */}
          {showCustomTime && (
            <div className="mt-3 flex items-center gap-3 animate-fade-in">
              <label className="flex items-center gap-2 bg-[#2A1D0E] border-2 border-[#F5D061] rounded-xl px-4 py-2.5 text-sm text-[#FFF8E7] focus-within:ring-2 focus-within:ring-[#F5D061] transition-all">
                <Clock className="w-4 h-4 text-[#F5D061] shrink-0" />
                <input
                  type="time"
                  aria-label="Custom check-in time"
                  value={customTime}
                  onChange={e => setCustomTime(e.target.value)}
                  className="bg-transparent text-[#FFF8E7] focus:outline-none font-mono font-bold"
                />
              </label>
              <span className="text-xs text-[#F5EBE0]">→ Check-out ~<span className="font-bold text-[#F5D061]">{formatCheckout(customTime, durationHrs)}</span></span>
            </div>
          )}
          {!showCustomTime && selectedTime && (
            <p className="mt-2.5 text-xs text-[#F5EBE0] font-medium">
              Check-in: <span className="font-extrabold text-[#F5D061]">{TIME_SLOTS.find(s => s.value === selectedTime)?.label}</span>
              {'  '}→{'  '}Check-out: <span className="font-extrabold text-[#8A9A78]">{formatCheckout(selectedTime, durationHrs)}</span>
              <span className="ml-2 opacity-80 text-[11px]">({durationHrs}hr{durationHrs > 1 ? 's' : ''})</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Step Breadcrumb (Single Line & Center-Aligned on PWA / Mobile) ──────────────────────────── */}
      <div className="flex items-center justify-center px-3 sm:px-7 py-3 border-b border-[#4F6C44] bg-gradient-to-r from-[#5A7A4B] via-[#6B8E5E] to-[#5A7A4B] shadow-inner text-white overflow-hidden text-center">
        <div className="flex items-center justify-center gap-1.5 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap flex-nowrap w-full py-0.5 max-w-2xl mx-auto">
          {STEP_LABELS.map((s, i) => {
            const num = i + 1;
            const done   = step > num;
            const active = step === num;
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <span className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all duration-300 ${
                    done   ? 'bg-[#FAF7F2] text-[#5A7A4B] shadow-md font-bold' :
                    active ? 'bg-[#F5D061] text-[#120B08] shadow-lg scale-105 ring-1 sm:ring-2 ring-white font-extrabold' :
                             'bg-[#4F6C44] text-[#D0E2C8] border border-[#7A9E6A]'
                  }`}>
                    {done ? '✓' : num}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                    active ? 'text-[#FAF7F2] tracking-wide' : done ? 'text-[#FAF7F2]/90' : 'text-[#D0E2C8]'
                  }`}>{s}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FAF7F2]/40 shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── BACK BUTTON ─────────────────────────── */}
        {step > 1 && (
          <button
            onClick={handleBack}
            aria-label={step === 3 ? 'Go back to table selection' : 'Go back to area selection'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-[#120B08]
              border border-[#F5D061] hover:border-[#FFF8E7]
              text-[#F5D061] hover:text-[#FFF8E7]
              text-[11px] font-bold uppercase tracking-wider
              shadow-md transition-all duration-200 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-[#F5D061]/50"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            {step === 3 ? 'Change Table' : 'Back'}
          </button>
        )}
      </div>

      {/* ── STEP 1: Choose Area ──────────────────────────────── */}
      {step === 1 && (
        <div className="p-5 sm:p-7 space-y-3 animate-fade-in">
          <p className="text-xs text-[#7A5C3A] pb-1 flex items-center gap-1.5 font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#E5B82C]" /> Select a dining area along the Gomti Riverfront
          </p>
          {AREAS.map(area => {
            const areaFreeTables = ALL_TABLES.filter(t => t.cluster_id === area.id && t.status === 'free').length;
            const totalTables    = ALL_TABLES.filter(t => t.cluster_id === area.id).length;
            const occupied = areaFreeTables === 0;
            return (
              <div
                key={area.id}
                className="rounded-2xl border bg-white/90 border-[#E5B82C]/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group relative"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#1F1810] border border-[#E5B82C]/40 p-3 shadow-md">
                      <AreaIcon type={area.iconType} className="w-6 h-6 text-[#F5D061]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-serif font-bold text-[#1F1810]">{area.label}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${area.tagStyle}`}>
                          {area.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A5C3A] mt-0.5">{area.subtitle}</p>
                      <div className="flex items-center gap-4 mt-1.5">
                        <span className="text-[10px] text-[#A08060] font-mono font-semibold">Tables: {area.tables}</span>
                        <span className={`text-[11px] font-bold ${areaFreeTables > 0 ? 'text-[#6B8E5E]' : 'text-red-600'}`}>
                          {areaFreeTables > 0 ? `✓ ${areaFreeTables} Available` : '✗ Fully Occupied'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Donut */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* View Area Photos Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveClusterGallery(area.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5B82C]/60 text-[#1F1810] text-[11px] font-bold flex items-center gap-1.5 hover:bg-[#F5D061]/20 hover:border-[#F5D061] transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#E5B82C]" />
                      <span>View Photos</span>
                    </button>

                    {/* Choose Area CTA */}
                    <button
                      type="button"
                      onClick={() => handleAreaSelect(area)}
                      disabled={occupied}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow ${
                        occupied
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#120B08] hover:scale-105 active:scale-95 shadow-[#F5D061]/30'
                      }`}
                    >
                      <span>Select Area</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-[#7A5C3A] font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6B8E5E] inline-block" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F5D061] inline-block" />Occupied</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Reserved</span>
          </div>
        </div>
      )}

      {/* ── STEP 2: Pick a Table ─────────────────────────────── */}
      {step === 2 && selectedArea && (
        <div className="p-5 sm:p-7 animate-fade-in">

          {/* Area header */}
          <div className="flex items-center justify-between gap-3 mb-5 p-3.5 bg-[#1F1810] rounded-2xl border border-[#E5B82C]/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#F5D061] to-[#E5B82C] shadow-md p-2 shrink-0">
                <AreaIcon type={selectedArea.iconType} className="w-5 h-5 text-[#1F1810]" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-[#F8E7A1]">{selectedArea.label}</h4>
                <p className="text-[11px] text-[#D4C4A0]/80">{selectedArea.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveClusterGallery(selectedArea.id)}
                className="px-3 py-1.5 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/50 text-[#F5D061] text-xs font-bold flex items-center gap-1.5 hover:bg-[#3D291C]"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Area Gallery</span>
              </button>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${freeCount > 0 ? 'text-[#98A886] border-[#98A886]/40 bg-[#98A886]/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
                {freeCount > 0 ? `${freeCount} free` : 'Full'}
              </div>
            </div>
          </div>

          {/* ── Realistic Venue View — Top Context (No 3D View text label) ──────── */}
          {selectedArea.id === 'indoor' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#4A7DA0]/40 mb-1 relative">
              <div className="bg-gradient-to-r from-[#0D1E2F] via-[#1A3550] to-[#0D1E2F] px-4 py-3 flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#7BB8D4] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7BB8D4]">Gomti Riverfront — Window Deck View</p>
                  <p className="text-[9px] text-[#4A90C4]/80">Window-facing tables · Natural waterfront light · Air conditioned</p>
                </div>
                <span className="ml-auto flex items-center gap-1 bg-[#1A3550] border border-[#4A7DA0]/50 text-[#7BB8D4] px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                  <Compass className="w-3 h-3 text-[#7BB8D4]" /> Waterfront Panorama
                </span>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-[#1A3550] via-[#2A6FA8] to-[#1A3550] opacity-60" />
            </div>
          )}
          {selectedArea.id === 'garden' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#3A6B2A]/40 mb-1 relative">
              <div className="bg-gradient-to-r from-[#0A1A08] via-[#142810] to-[#0A1A08] px-4 py-3 flex items-center gap-3">
                <Sun className="w-4 h-4 text-[#78C265] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78C265]">Ground Lawn — Open Canopy</p>
                  <p className="text-[9px] text-[#5BA348]/80">Spacious outdoor layout · Canopy fairy lights · Open air breeze</p>
                </div>
                <span className="ml-auto flex items-center gap-1 bg-[#142810] border border-[#3A6B2A]/50 text-[#78C265] px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                  <Sun className="w-3 h-3 text-[#78C265]" /> Open Sky Lawn
                </span>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-[#142810] via-[#2A6B1A] to-[#142810] opacity-60" />
            </div>
          )}
          {selectedArea.id === 'rooftop' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#4A7DA0]/40 mb-1 relative">
              <div className="bg-gradient-to-r from-[#0D1E2F] via-[#1A3550] to-[#0D1E2F] px-4 py-3 flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#7BB8D4] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7BB8D4]">Upper Deck — Panoramic Sunset Deck</p>
                  <p className="text-[9px] text-[#4A90C4]/80">Gomti Riverfront · 360° sky view · Sunset facing VIP tables</p>
                </div>
                <span className="ml-auto flex items-center gap-1 bg-[#1A3550] border border-[#4A7DA0]/50 text-[#7BB8D4] px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                  <Sunset className="w-3 h-3 text-[#7BB8D4]" /> Sunset Deck
                </span>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-[#1A3550] via-[#2A6FA8] to-[#1A3550] opacity-60" />
            </div>
          )}

          {/* Table grid */}
          <div className="bg-white/70 border border-[#E5B82C]/30 rounded-b-xl rounded-tr-xl p-6 space-y-5">
            {AREA_LAYOUTS[selectedArea.id].map((row, ri) => (
              <div key={ri} className="flex items-center justify-center gap-3 flex-wrap">
                {row.map(tNum => {
                  const tbl = areaTables.find(t => t.table_number === tNum);
                  if (!tbl) return null;
                  const isSelected = selectedTable?.id === tbl.id;
                  const suitable   = tbl.capacity >= guestCount;
                  return (
                    <button
                      key={tbl.id}
                      disabled={tbl.status !== 'free'}
                      onClick={() => handleTableSelect(tbl)}
                      aria-label={`Table ${tbl.table_number}, ${tbl.capacity} seats, ${statusLabel(tbl.status)}`}
                      aria-pressed={isSelected}
                      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 px-5 py-3.5 min-w-[86px]
                        focus:outline-none focus:ring-2 focus:ring-[#F5D061]/50
                        ${statusClasses(tbl.status, isSelected)}`}
                    >
                      {suitable && tbl.status === 'free' && !isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#6B8E5E] border-2 border-[#FAF7F2] animate-pulse" />
                      )}
                      <span className="text-base font-bold font-mono">{tbl.table_number}</span>
                      <span className="text-[10px] opacity-80 flex items-center gap-0.5 mt-0.5">
                        <Users className="w-3 h-3" />{tbl.capacity} Seats
                      </span>
                      <span className={`text-[9px] mt-1 font-bold ${
                        tbl.status === 'free' ? 'text-[#2D6A4F]' :
                        tbl.status === 'eating' ? 'text-[#7A5C3A]' : 'text-red-700'
                      }`}>{statusLabel(tbl.status)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-[#5A6A50] mt-4 font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6B8E5E] animate-pulse inline-block" />
              Green tables fit your party of <span className="text-[#1F1810] font-bold mx-1">{guestCount}</span>. Tap to pick your table.
            </span>
          </p>
        </div>
      )}

      {/* ── STEP 3: Confirm Booking & Generate Ticket ─────────── */}
      {step === 3 && selectedTable && selectedArea && (() => {
        const pricing = calculateBookingPrice(selectedDate, guestCount);
        const checkoutLabel = formatCheckout(effectiveTime, durationHrs);
        const timeLabel = TIME_SLOTS.find(s => s.value === effectiveTime)?.label || effectiveTime;
        return (
          <div className="p-5 sm:p-7 animate-fade-in space-y-4">

            {/* 5-Minute Hold Timer Warning Banner */}
            {holdLeft !== null && holdLeft > 0 && (
              <div className="bg-amber-950/80 border-2 border-[#F5D061] rounded-2xl p-3.5 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-2.5">
                  <Timer className="w-5 h-5 text-[#F5D061] shrink-0 animate-spin" />
                  <div>
                    <p className="text-xs font-bold text-[#F8E7A1]">
                      Table {selectedTable.table_number} Hold Timer: <span className="font-mono text-[#F5D061] font-black">{fmtTimer(holdLeft)}</span>
                    </p>
                    <p className="text-[10px] text-amber-200/80">Complete Razorpay payment to generate your official QR Ticket Slip.</p>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-[#F5D061] bg-[#120B08] px-3 py-1 rounded-xl border border-[#F5D061]/50 shrink-0 shadow">
                  {fmtTimer(holdLeft)}
                </span>
              </div>
            )}

            {/* Confirmation card */}
            <div className="rounded-3xl bg-[#1F1810] border border-[#F5D061]/40 p-5 shadow-2xl space-y-4">

              {/* Top badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-black/40 border border-[#F5D061]/30 p-2 shrink-0">
                    <AreaIcon type={selectedArea.iconType} className="w-5 h-5 text-[#F5D061]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#E8DCB8] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#F5D061]" /> Table Locked for Booking
                    </h4>
                    <p className="text-[11px] text-[#D4C4A0]/70">{selectedArea.label} • Table {selectedTable.table_number}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-[#98A886]/15 text-[#D8E2CD] border border-[#98A886]/40">
                  {pricing.isWeekend ? '₹600/person' : '₹300/person'}
                </span>
              </div>

              {/* Contact Information Form (Autofilled if logged in) */}
              <div className="bg-[#2A1D0E] border border-[#F5D061]/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#F5D061] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#F5D061]" /> Guest Details for QR Ticket
                  </h5>
                  {isLoggedInUser && (
                    <span className="text-[10px] bg-[#6B8E5E]/20 text-[#98A886] border border-[#6B8E5E]/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Autofilled from Login
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#FFF8E7] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1F1810] border border-[#E5B82C]/50 text-[#FFF8E7] font-bold placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5D061]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#FFF8E7] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 07310008020"
                      value={userPhone}
                      onChange={e => setUserPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#1F1810] border border-[#E5B82C]/50 text-[#FFF8E7] font-bold placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5D061]"
                    />
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: 'Table', value: selectedTable.table_number, Icon: Home },
                  { label: 'Seats', value: `${selectedTable.capacity} max`, Icon: Users },
                  { label: 'Date', value: `${selectedDate} (${pricing.dayName.slice(0,3)})`, Icon: Calendar },
                  { label: 'Check-in', value: timeLabel, Icon: Clock },
                  { label: 'Check-out', value: checkoutLabel || '—', Icon: LogOut },
                  { label: 'Duration', value: `${durationHrs} hr${durationHrs > 1 ? 's' : ''}`, Icon: Timer },
                  { label: 'Guests', value: `${guestCount} people`, Icon: Users },
                  { label: 'Rate', value: `₹${pricing.perPersonRate}/person`, Icon: IndianRupee },
                  { label: 'Total', value: `₹${pricing.totalPrice}`, Icon: Receipt },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="bg-[#131619]/80 rounded-xl px-3 py-2.5 border border-[#F5D061]/15">
                    <p className="text-[9px] text-[#D4C4A0]/50 uppercase tracking-wider flex items-center gap-1">
                      <Icon className="w-3 h-3 text-[#F5D061]" />{label}
                    </p>
                    <p className="text-xs font-bold text-[#E8DCB8] mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {formError && (
                <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold text-center">
                  {formError}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleBack}
                aria-label="Go back to pick a different table"
                className="flex-1 py-3.5 rounded-2xl
                  border-2 border-[#F5D061]/50 hover:border-[#F5D061]
                  bg-[#1A1209] text-[#F5D061] hover:text-[#F5EBE0]
                  text-xs font-bold uppercase tracking-wider
                  flex items-center justify-center gap-2
                  shadow transition-all duration-200 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Table
              </button>

              <button
                onClick={handleConfirmReservation}
                disabled={isProcessingBooking || (holdLeft !== null && holdLeft <= 0)}
                aria-label={`Pay ₹${pricing.totalPrice} via Razorpay and get QR Ticket Slip`}
                className="flex-2 sm:flex-[2] py-3.5 rounded-2xl
                  bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37]
                  hover:from-[#F8E7A1] hover:to-[#F5D061]
                  text-[#120B08] font-bold text-xs uppercase tracking-wider
                  shadow-xl shadow-[#F5D061]/30 hover:shadow-[#F5D061]/50
                  flex items-center justify-center gap-2
                  transition-all duration-200 active:scale-95
                  disabled:opacity-50"
              >
                {isProcessingBooking ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-[#120B08]" /> Hold on, booking confirmation on the way…</>
                ) : (
                  <><QrCode className="w-4 h-4 text-[#120B08]" /> Pay ₹{pricing.totalPrice} Online &amp; Get QR Ticket Slip</>
                )}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Processing Booking & Razorpay Gateway Loading Overlay ─────────── */}
      {isProcessingBooking && (
        <div className="fixed inset-0 z-[200] bg-[#07090C]/95 backdrop-blur-xl flex items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-[#1F1810] border-2 border-[#F5D061] rounded-3xl p-8 max-w-sm w-full space-y-5 shadow-2xl text-white">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#F5D061]/30 border-t-[#F5D061] animate-spin" />
              <img src="/logo.png" alt="Wings Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-lg text-[#F8E7A1]">
                Hold on, your booking confirmation is on the way...
              </h3>
              <p className="text-xs text-[#D4C4A0]/80 mt-2">
                Securing table {selectedTable?.table_number} on Gomti Riverfront &amp; connecting to Razorpay...
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#120B08] border border-[#F5D061]/30 text-[10px] text-amber-300 font-mono">
              ⚡ Guaranteed 0-Delay ACID Cloudflare D1 Synchronization
            </div>
          </div>
        </div>
      )}

      {/* ── Area / Cluster Gallery Auto-Sliding Modal ────────────────────── */}
      {activeClusterGallery && (() => {
        const clusterItems = galleryItems.filter(
          item => !item.cluster_id || item.cluster_id === activeClusterGallery || item.category?.toLowerCase().includes(activeClusterGallery)
        );
        const currentItem = clusterItems[carouselIndex % Math.max(1, clusterItems.length)];
        const areaInfo = AREAS.find(a => a.id === activeClusterGallery);

        return (
          <div className="fixed inset-0 z-[110] bg-[#07090C]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-4xl bg-[#1A1209] rounded-3xl border-2 border-[#F5D061] overflow-hidden shadow-2xl flex flex-col">
              
              {/* Modal Header */}
              <div className="bg-[#120B08] border-b border-[#F5D061]/30 p-5 flex items-center justify-between text-[#F8E7A1]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#E5B82C] flex items-center justify-center text-[#120B08] shadow-md">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#F8E7A1]">
                      {areaInfo?.label} Gallery &amp; Video Tour
                    </h3>
                    <p className="text-xs text-[#D4C4A0]/80">Auto-sliding gallery • Gomti Riverfront Ambience</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCarouselPlaying(!isCarouselPlaying)}
                    className="px-3 py-1.5 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/40 text-[#F5D061] text-xs font-bold flex items-center gap-1.5 hover:bg-[#3D291C]"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isCarouselPlaying ? 'Pause Slides' : 'Auto Play'}</span>
                  </button>
                  <button
                    onClick={() => { setActiveClusterGallery(null); setCarouselIndex(0); }}
                    className="p-2 rounded-full bg-white/10 hover:bg-[#F5D061] hover:text-[#120B08] text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Carousel Display Stage */}
              <div className="relative w-full h-[400px] sm:h-[460px] bg-[#0B0C0E] overflow-hidden flex items-center justify-center">
                {currentItem && (
                  <div className="relative w-full h-full transition-opacity duration-700 ease-in-out">
                    {currentItem.media_type === 'video' || currentItem.video_url || currentItem.image_url?.endsWith('.mp4') ? (
                      <div className="relative w-full h-full">
                        <video
                          src={currentItem.video_url || currentItem.image_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-[#120B08]/90 border border-[#F5D061] text-[#F5D061] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Live Ambience Video
                        </div>
                      </div>
                    ) : (
                      <img
                        src={currentItem.image_url}
                        alt={currentItem.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0F0A06] via-[#0F0A06]/80 to-transparent p-6 text-white">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-serif font-bold text-lg text-[#F8E7A1]">{currentItem.title}</h4>
                          {currentItem.about && (
                            <p className="text-xs text-[#D4C4A0]/90 mt-1 max-w-2xl">{currentItem.about}</p>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-[#F5D061] bg-[#120B08]/80 px-3 py-1 rounded-full border border-[#F5D061]/30">
                          {(carouselIndex % clusterItems.length) + 1} / {clusterItems.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Left & Right Controls */}
                {clusterItems.length > 1 && (
                  <>
                    <button
                      onClick={() => setCarouselIndex((prev) => (prev - 1 + clusterItems.length) % clusterItems.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#120B08]/80 border border-[#F5D061]/50 text-[#F5D061] hover:bg-[#F5D061] hover:text-[#120B08] transition-all shadow-xl"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCarouselIndex((prev) => (prev + 1) % clusterItems.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-[#120B08]/80 border border-[#F5D061]/50 text-[#F5D061] hover:bg-[#F5D061] hover:text-[#120B08] transition-all shadow-xl"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Footer */}
              <div className="bg-[#120B08] p-4 border-t border-[#F5D061]/20 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  {clusterItems.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        carouselIndex % clusterItems.length === idx
                          ? 'border-[#F5D061] scale-105 ring-2 ring-white'
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={item.image_url} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                      {item.media_type === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[#F5D061]">
                          ▶
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Official QR Ticket Slip Modal (Guaranteed 1-Page Print) ────────────── */}
      {ticketSlip && (
        <div className="fixed inset-0 z-[120] bg-[#07090C]/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
          <div id="printable-ticket-wrapper" className="relative w-full max-w-md bg-[#1F1810] border-2 border-[#F5D061] rounded-3xl overflow-hidden shadow-2xl text-white">

            {/* Top Badge */}
            <div className="bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#120B08] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-serif font-extrabold text-sm uppercase tracking-wider">Wings River Café Ticket</h3>
                  <p className="text-[10px] opacity-90 font-mono">Ref: {ticketSlip.bookingId}</p>
                </div>
              </div>
              <button
                onClick={handleCloseTicket}
                className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-[#120B08] transition-colors no-print"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4 text-center">

              {/* Scannable QR Code */}
              <div className="bg-white p-4 rounded-2xl inline-block shadow-xl border-4 border-[#F5D061]/50">
                <img
                  src={ticketSlip.qrUrl}
                  alt={`QR Code ${ticketSlip.bookingId}`}
                  className="w-44 h-44 mx-auto"
                />
                <p className="text-[10px] font-mono text-gray-600 mt-1 font-bold">SCAN AT VENUE GATE</p>
              </div>

              {/* Ticket Details */}
              <div className="bg-[#120B08] border border-[#F5D061]/30 rounded-2xl p-4 text-left space-y-2">
                <div className="flex justify-between items-center border-b border-[#F5D061]/20 pb-2">
                  <span className="text-[10px] text-[#D4C4A0] uppercase font-bold">Guest Name</span>
                  <span className="text-xs font-extrabold text-[#F8E7A1]">{ticketSlip.guestName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#F5D061]/20 pb-2">
                  <span className="text-[10px] text-[#D4C4A0] uppercase font-bold">Phone Number</span>
                  <span className="text-xs font-extrabold text-[#F8E7A1]">{ticketSlip.guestPhone}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#F5D061]/20 pb-2">
                  <span className="text-[10px] text-[#D4C4A0] uppercase font-bold">Reserved Table</span>
                  <span className="text-xs font-extrabold text-[#F5D061]">{ticketSlip.tableNumber} ({ticketSlip.areaName})</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#F5D061]/20 pb-2">
                  <span className="text-[10px] text-[#D4C4A0] uppercase font-bold">Check-in Slot</span>
                  <span className="text-xs font-extrabold text-[#98A886]">{ticketSlip.date} • {ticketSlip.timeLabel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#D4C4A0] uppercase font-bold">Booking Amount</span>
                  <span className="text-xs font-extrabold text-[#F5D061]">₹{ticketSlip.totalAmount} (Confirmed)</span>
                </div>
              </div>

              {/* Actions (Hidden on Print) */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 no-print">
                <button
                  type="button"
                  onClick={handlePrintSaveTicket}
                  disabled={isPrinting}
                  className="flex-1 py-3 rounded-xl bg-[#2A1D0E] border border-[#F5D061]/50 text-[#F5D061] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#3D291C] disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> {isPrinting ? 'Generating...' : 'Print / Save Ticket'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseTicket}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 shadow-lg"
                >
                  <Ticket className="w-4 h-4" /> View in My Reservations →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
