'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Clock, Calendar, CheckCircle2, ShieldAlert,
  ArrowLeft, Home, Leaf, Sunset, ChevronRight, MapPin,
  Timer, Sparkles, Sun, Compass, Trees, Lock, IndianRupee, Receipt, LogOut
} from 'lucide-react';
import { calculateBookingPrice } from '@/lib/pricing';

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
    borderStyle: 'border-[#F5D061]/35 hover:border-[#E8DCB8]',
    tagStyle: 'bg-[#F5D061]/20 text-[#E8DCB8] border border-[#F5D061]/40',
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
    borderStyle: 'border-[#98A886]/40 hover:border-[#B2C2A1]',
    tagStyle: 'bg-[#98A886]/20 text-[#D8E2CD] border border-[#98A886]/40',
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
    borderStyle: 'border-[#D4C4A0]/40 hover:border-[#F5EBE0]',
    tagStyle: 'bg-[#D4C4A0]/20 text-[#F5EBE0] border border-[#D4C4A0]/40',
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
    return 'bg-gradient-to-br from-[#F5D061] to-[#A8996B] border-[#F5EBE0] text-[#120B08] font-bold shadow-2xl shadow-[#F5D061]/40 scale-110 z-20 ring-2 ring-[#F5EBE0]/60';
  if (s === 'free')
    return 'bg-[#1E2C1A]/80 border-[#98A886] text-[#D8E2CD] hover:bg-[#2D3F27] hover:border-[#B2C2A1] hover:scale-105 cursor-pointer active:scale-95';
  if (s === 'eating')
    return 'bg-[#3B281B]/50 border-[#F5D061]/30 text-[#E8DCB8]/50 opacity-60 cursor-not-allowed';
  if (s === 'reserved')
    return 'bg-[#2A1412]/50 border-red-500/30 text-red-300/60 opacity-50 cursor-not-allowed';
  return 'bg-[#181A1F]/50 border-slate-700/50 text-slate-500 opacity-40 cursor-not-allowed';
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

  const stepRef = useRef<HTMLDivElement>(null);

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

  const STEP_LABELS = ['Choose Area', 'Pick Table', 'Confirm'];

  return (
    <div
      ref={stepRef}
      className="bg-[#12151C] border border-[#F5D061]/40 rounded-3xl shadow-2xl text-white overflow-hidden"
    >

      {/* ── Section Header ───────────────────────────────────── */}
      <div className="bg-[#181B22] border-b border-[#F5D061]/25 px-5 sm:px-7 py-5">
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
          <div className="flex flex-wrap gap-2">

            {/* Date */}
            <label className="flex items-center gap-2 bg-[#1A1D24] border border-[#F5D061]/30 rounded-xl px-3 py-2 text-xs text-[#E8DCB8] cursor-pointer hover:border-[#F5D061]/70 hover:bg-[#231710]/60 transition-all focus-within:ring-2 focus-within:ring-[#F5D061]/40">
              <Calendar className="w-3.5 h-3.5 text-[#98A886] shrink-0" />
              <input
                type="date"
                aria-label="Booking date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-[#E8DCB8] focus:outline-none w-28 cursor-pointer"
              />
            </label>

            {/* Guest Count */}
            <label className="flex items-center gap-2 bg-[#1A1D24] border border-[#F5D061]/30 rounded-xl px-3 py-2 text-xs text-[#E8DCB8] cursor-pointer hover:border-[#F5D061]/70 hover:bg-[#231710]/60 transition-all focus-within:ring-2 focus-within:ring-[#F5D061]/40">
              <Users className="w-3.5 h-3.5 text-[#98A886] shrink-0" />
              <select
                aria-label="Number of guests"
                value={guestCount}
                onChange={e => setGuestCount(Number(e.target.value))}
                className="bg-transparent text-[#E8DCB8] focus:outline-none cursor-pointer"
              >
                {[1,2,3,4,5,6,8,10,12,15,20].map(n => (
                  <option key={n} value={n} className="bg-[#121417]">{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </label>

            {/* Duration */}
            <label className="flex items-center gap-2 bg-[#1A1D24] border border-[#F5D061]/30 rounded-xl px-3 py-2 text-xs text-[#E8DCB8] cursor-pointer hover:border-[#F5D061]/70 hover:bg-[#231710]/60 transition-all focus-within:ring-2 focus-within:ring-[#F5D061]/40">
              <Timer className="w-3.5 h-3.5 text-[#98A886] shrink-0" />
              <select
                aria-label="Duration of stay"
                value={durationHrs}
                onChange={e => setDurationHrs(Number(e.target.value))}
                className="bg-transparent text-[#E8DCB8] focus:outline-none cursor-pointer"
              >
                {DURATIONS.map(d => (
                  <option key={d.value} value={d.value} className="bg-[#121417]">
                    {d.label} ({d.tag})
                  </option>
                ))}
              </select>
            </label>

          </div>
        </div>

        {/* ── Time Slot Picker ─────────────────────────────── */}
        <div className="mt-4">
          <p className="text-[10px] text-[#D4C4A0]/60 uppercase tracking-widest mb-2 font-semibold">
            <Clock className="w-3 h-3 inline mr-1 text-[#98A886]" />
            Select Check-in Time
          </p>
          <div className="flex flex-wrap gap-2">
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
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 border flex items-center gap-1 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F5D061] to-[#A8996B] border-[#E8DCB8]/60 text-[#120B08] shadow-lg shadow-[#F5D061]/30 scale-105'
                      : 'bg-[#1A1D24] border-[#F5D061]/25 text-[#D4C4A0]/80 hover:border-[#F5D061]/60 hover:text-[#E8DCB8] hover:bg-[#231710]/50'
                  }`}
                >
                  <span>{slot.label}</span>
                  {slot.tag && <span className="opacity-60 text-[9px]">· {slot.tag}</span>}
                </button>
              );
            })}
          </div>

          {/* Custom time input */}
          {showCustomTime && (
            <div className="mt-3 flex items-center gap-3 animate-fade-in">
              <label className="flex items-center gap-2 bg-[#1A1D24] border-2 border-[#F5D061]/60 rounded-xl px-4 py-2.5 text-sm text-[#E8DCB8] focus-within:ring-2 focus-within:ring-[#F5D061]/40 transition-all">
                <Clock className="w-4 h-4 text-[#F5D061] shrink-0" />
                <input
                  type="time"
                  aria-label="Custom check-in time"
                  value={customTime}
                  onChange={e => setCustomTime(e.target.value)}
                  className="bg-transparent text-[#E8DCB8] focus:outline-none font-mono font-bold"
                />
              </label>
              <span className="text-xs text-[#D4C4A0]/70">→ Check-out ~<span className="font-bold text-[#E8DCB8]">{formatCheckout(customTime, durationHrs)}</span></span>
            </div>
          )}
          {!showCustomTime && selectedTime && (
            <p className="mt-2 text-[11px] text-[#D4C4A0]/60">
              Check-in: <span className="font-bold text-[#E8DCB8]">{TIME_SLOTS.find(s => s.value === selectedTime)?.label}</span>
              {'  '}→{'  '}Check-out: <span className="font-bold text-[#98A886]">{formatCheckout(selectedTime, durationHrs)}</span>
              <span className="ml-2 opacity-60">({durationHrs}hr{durationHrs > 1 ? 's' : ''})</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Step Breadcrumb ──────────────────────────────────── */}
      <div className="flex items-center gap-0 px-5 sm:px-7 py-3.5 border-b border-[#F5D061]/15 bg-[#12151B]">
        {STEP_LABELS.map((s, i) => {
          const num = i + 1;
          const done   = step > num;
          const active = step === num;
          return (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  done   ? 'bg-[#98A886] text-[#120B08] shadow shadow-[#98A886]/40'  :
                  active ? 'bg-gradient-to-br from-[#F5D061] to-[#A8996B] text-[#120B08] shadow-lg shadow-[#F5D061]/30 scale-110' :
                           'bg-[#1E2129] text-[#D4C4A0]/40 border border-[#F5D061]/20'
                }`}>
                  {done ? '✓' : num}
                </span>
                <span className={`text-[11px] font-semibold transition-all duration-300 ${
                  active ? 'text-[#E8DCB8]' : done ? 'text-[#98A886]' : 'text-slate-600'
                }`}>{s}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <ChevronRight className="w-3 h-3 text-[#F5D061]/25 mx-3 shrink-0" />
              )}
            </React.Fragment>
          );
        })}

        {/* ── BACK BUTTON — Highlighted & Accessible ─────────── */}
        {step > 1 && (
          <button
            onClick={handleBack}
            aria-label={step === 3 ? 'Go back to table selection' : 'Go back to area selection'}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl
              bg-gradient-to-r from-[#231710] to-[#1A1209]
              border border-[#F5D061]/50 hover:border-[#F5D061]
              text-[#F5D061] hover:text-[#F5EBE0]
              text-[11px] font-bold uppercase tracking-wider
              shadow-md hover:shadow-[#F5D061]/20 hover:shadow-lg
              transition-all duration-200 active:scale-95
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
          <p className="text-xs text-[#D4C4A0]/60 pb-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#F5D061]" /> Select a dining area along the Gomti Riverfront
          </p>
          {AREAS.map(area => {
            const areaFreeTables = ALL_TABLES.filter(t => t.cluster_id === area.id && t.status === 'free').length;
            const totalTables    = ALL_TABLES.filter(t => t.cluster_id === area.id).length;
            const occupied = areaFreeTables === 0;
            return (
              <button
                key={area.id}
                onClick={() => handleAreaSelect(area)}
                disabled={occupied}
                aria-label={`Select ${area.label} — ${areaFreeTables} tables available`}
                className={`w-full text-left rounded-2xl border bg-gradient-to-r ${area.gradient} ${area.borderStyle}
                  p-5 transition-all duration-300 group relative overflow-hidden
                  focus:outline-none focus:ring-2 focus:ring-[#F5D061]/50
                  ${occupied ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.015] hover:shadow-2xl hover:shadow-black/40 active:scale-[0.99]'}
                `}
              >
                {/* Shimmer highlight on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                <div className="flex items-center justify-between gap-4 relative z-10">
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-black/30 border border-white/10 p-3 shadow-inner">
                      <AreaIcon type={area.iconType} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-serif font-bold text-[#E8DCB8]">{area.label}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${area.tagStyle}`}>
                          {area.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#D4C4A0]/75 mt-0.5">{area.subtitle}</p>
                      <div className="flex items-center gap-4 mt-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">Tables: {area.tables}</span>
                        <span className={`text-[11px] font-bold ${areaFreeTables > 0 ? 'text-[#98A886]' : 'text-red-400'}`}>
                          {areaFreeTables > 0 ? `✓ ${areaFreeTables} Available` : '✗ Fully Occupied'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: donut + arrow */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(201,176,134,0.12)" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="14" fill="none"
                          stroke={areaFreeTables > 0 ? '#98A886' : '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={`${(areaFreeTables / totalTables) * 87.96} 87.96`}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold font-mono text-[#E8DCB8]">
                        {areaFreeTables}/{totalTables}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-all duration-200 ${occupied ? 'text-slate-600' : 'text-[#F5D061]/60 group-hover:text-[#E8DCB8] group-hover:translate-x-1'}`} />
                  </div>
                </div>
              </button>
            );
          })}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-[#D4C4A0]/60 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#98A886] inline-block" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F5D061] inline-block" />Occupied</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Reserved</span>
          </div>
        </div>
      )}

      {/* ── STEP 2: Pick a Table ─────────────────────────────── */}
      {step === 2 && selectedArea && (
        <div className="p-5 sm:p-7 animate-fade-in">

          {/* Area header */}
          <div className="flex items-center gap-3 mb-5 p-3.5 bg-[#1A1D24]/80 rounded-2xl border border-[#F5D061]/20">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/30 border border-white/10 p-2 shrink-0">
              <AreaIcon type={selectedArea.iconType} className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-serif font-bold text-[#E8DCB8]">{selectedArea.label}</h4>
              <p className="text-[11px] text-[#D4C4A0]/70">{selectedArea.subtitle}</p>
            </div>
            <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${freeCount > 0 ? 'text-[#98A886] border-[#98A886]/40 bg-[#98A886]/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
              {freeCount > 0 ? `${freeCount} free` : 'Full'}
            </div>
          </div>

          {/* ── 3D Venue View — Top Context (River Side) ──────── */}
          {selectedArea.id === 'indoor' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#4A7DA0]/40 mb-1 relative">
              <div className="bg-gradient-to-r from-[#0D1E2F] via-[#1A3550] to-[#0D1E2F] px-4 py-3 flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#7BB8D4] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7BB8D4]">River View — North Side</p>
                  <p className="text-[9px] text-[#4A90C4]/80">Gomti Riverfront · Window-facing seats · Natural light</p>
                </div>
                <span className="ml-auto text-[9px] bg-[#1A3550] border border-[#4A7DA0]/50 text-[#7BB8D4] px-2 py-0.5 rounded-lg font-mono">3D VIEW ↑</span>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-[#1A3550] via-[#2A6FA8] to-[#1A3550] opacity-60" />
            </div>
          )}
          {selectedArea.id === 'garden' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#3A6B2A]/40 mb-1 relative">
              <div className="bg-gradient-to-r from-[#0A1A08] via-[#142810] to-[#0A1A08] px-4 py-3 flex items-center gap-3">
                <Sun className="w-4 h-4 text-[#78C265] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#78C265]">Ground Floor — Open Sky</p>
                  <p className="text-[9px] text-[#5BA348]/80">Spacious outdoor layout · Canopy fairy lights · Open air</p>
                </div>
                <span className="ml-auto text-[9px] bg-[#142810] border border-[#3A6B2A]/50 text-[#78C265] px-2 py-0.5 rounded-lg font-mono">3D VIEW ↑</span>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-[#142810] via-[#2A6B1A] to-[#142810] opacity-60" />
            </div>
          )}
          {selectedArea.id === 'rooftop' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#4A7DA0]/40 mb-1 relative">
              <div className="bg-gradient-to-r from-[#0D1E2F] via-[#1A3550] to-[#0D1E2F] px-4 py-3 flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#7BB8D4] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7BB8D4]">River View — Panoramic North</p>
                  <p className="text-[9px] text-[#4A90C4]/80">Gomti Riverfront · 360° sky view · Sunset facing</p>
                </div>
                <span className="ml-auto text-[9px] bg-[#1A3550] border border-[#4A7DA0]/50 text-[#7BB8D4] px-2 py-0.5 rounded-lg font-mono">3D VIEW ↑</span>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-[#1A3550] via-[#2A6FA8] to-[#1A3550] opacity-60" />
            </div>
          )}

          {/* Riverfront label */}
          <div className="w-full py-2.5 px-5 rounded-t-xl bg-gradient-to-r from-[#18232F]/80 via-[#1E2D40]/80 to-[#18232F]/80 border border-[#4A7DA0]/30 mb-1">
            <p className="text-center text-[10px] tracking-[0.2em] text-[#8BB8D4] uppercase font-mono flex items-center justify-center gap-2">
              <MapPin className="w-3 h-3 text-[#5B9EC9]" />
              Gomti Riverfront — {selectedArea.label}
            </p>
          </div>

          {/* Table grid */}
          <div className="bg-[#141820]/80 border border-[#F5D061]/15 rounded-b-xl rounded-tr-xl p-6 space-y-5">
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
                      {/* Availability pulse dot */}
                      {suitable && tbl.status === 'free' && !isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#98A886] border-2 border-[#141820] animate-pulse" />
                      )}
                      <span className="text-base font-bold font-mono">{tbl.table_number}</span>
                      <span className="text-[10px] opacity-80 flex items-center gap-0.5 mt-0.5">
                        <Users className="w-3 h-3" />{tbl.capacity} Seats
                      </span>
                      <span className={`text-[9px] mt-1 font-bold ${
                        tbl.status === 'free' ? 'text-[#98A886]' :
                        tbl.status === 'eating' ? 'text-[#F5D061]' : 'text-red-300'
                      }`}>{statusLabel(tbl.status)}</span>
                      {/* Unsuitable capacity indicator */}
                      {!suitable && tbl.status === 'free' && (
                        <span className="text-[8px] text-amber-400 mt-0.5">Low capacity</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── 3D Venue View — Bottom Context ──────────────── */}
          {selectedArea.id === 'indoor' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#98A886]/40 mt-3 relative">
              <div className="bg-gradient-to-r from-[#142211] via-[#1F331A] to-[#142211] px-4 py-3 flex items-center gap-3">
                <Trees className="w-4 h-4 text-[#A8C49A] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8C49A]">South View — Open Garden Area</p>
                  <p className="text-[9px] text-[#86AA75]/80">Ground floor · Spacious outdoor lawn access · Glass entrance</p>
                </div>
                <span className="ml-auto text-[9px] bg-[#1F331A] border border-[#98A886]/50 text-[#A8C49A] px-2 py-0.5 rounded-lg font-mono">3D VIEW ↓</span>
              </div>
            </div>
          )}
          {selectedArea.id === 'garden' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#98A886]/40 mt-3 relative">
              <div className="bg-gradient-to-r from-[#142211] via-[#1F331A] to-[#142211] px-4 py-3 flex items-center gap-3">
                <Trees className="w-4 h-4 text-[#A8C49A] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8C49A]">Green Garden 3D View</p>
                  <p className="text-[9px] text-[#86AA75]/80">Lush green lawns · Riverside walkway · Ambient garden lights</p>
                </div>
                <span className="ml-auto text-[9px] bg-[#1F331A] border border-[#98A886]/50 text-[#A8C49A] px-2 py-0.5 rounded-lg font-mono">3D VIEW ↓</span>
              </div>
            </div>
          )}
          {selectedArea.id === 'rooftop' && (
            <div className="w-full rounded-xl overflow-hidden border border-[#F5D061]/40 mt-3 relative">
              <div className="bg-gradient-to-r from-[#231710] via-[#362419] to-[#231710] px-4 py-3 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#E8DCB8] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8DCB8]">Greenery & Canopy View</p>
                  <p className="text-[9px] text-[#D4C4A0]/80">Overlooking garden canopy · Fairy lights glow · Elevated deck</p>
                </div>
                <span className="ml-auto text-[9px] bg-[#362419] border border-[#F5D061]/50 text-[#E8DCB8] px-2 py-0.5 rounded-lg font-mono">3D VIEW ↓</span>
              </div>
            </div>
          )}

          <p className="text-center text-[11px] text-[#D4C4A0]/60 mt-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#98A886] animate-pulse inline-block" />
              Pulsing green tables fit your party of <span className="text-[#E8DCB8] font-bold mx-1">{guestCount}</span>. Tap to select.
            </span>
          </p>
        </div>
      )}

      {/* ── STEP 3: Confirm Booking ──────────────────────────── */}
      {step === 3 && selectedTable && selectedArea && (() => {
        const pricing = calculateBookingPrice(selectedDate, guestCount);
        const checkoutLabel = formatCheckout(effectiveTime, durationHrs);
        const timeLabel = TIME_SLOTS.find(s => s.value === effectiveTime)?.label || effectiveTime;
        return (
          <div className="p-5 sm:p-7 animate-fade-in space-y-4">

            {/* Confirmation card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#1E1609] via-[#1A1510] to-[#0F1015] border border-[#F5D061]/40 p-5 shadow-2xl">

              {/* Top badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-black/40 border border-[#F5D061]/30 p-2 shrink-0">
                    <AreaIcon type={selectedArea.iconType} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#E8DCB8] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#F5D061]" /> Table Locked for Booking
                    </h4>
                    <p className="text-[11px] text-[#D4C4A0]/70">{selectedArea.label}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-[#98A886]/15 text-[#D8E2CD] border border-[#98A886]/40">
                  {pricing.isWeekend ? '₹600/person' : '₹300/person'}
                </span>
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

              {/* Hold timer */}
              <div className="mt-4 flex items-center gap-3 bg-[#0D1118]/80 border border-[#F5D061]/25 rounded-2xl px-4 py-3">
                <ShieldAlert className="w-4 h-4 text-[#F5D061] animate-pulse shrink-0" />
                <p className="text-xs text-[#F5EBE0] flex-1">
                  Table <span className="text-[#E8DCB8] font-bold">{selectedTable.table_number}</span> is locked for you
                </p>
                <span className={`font-mono text-sm font-bold px-3 py-1 rounded-xl border ${
                  holdLeft !== null && holdLeft < 60
                    ? 'bg-red-900/40 border-red-500/50 text-red-300'
                    : 'bg-[#231710] border-[#F5D061]/40 text-[#E8DCB8]'
                }`}>
                  {holdLeft !== null ? fmtTimer(holdLeft) : '5:00'}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {/* Highlighted Back button */}
              <button
                onClick={handleBack}
                aria-label="Go back to pick a different table"
                className="flex-1 py-3.5 rounded-2xl
                  border-2 border-[#F5D061]/50 hover:border-[#F5D061]
                  bg-gradient-to-r from-[#1A1209] to-[#231710] hover:from-[#231710] hover:to-[#2E1F0E]
                  text-[#F5D061] hover:text-[#F5EBE0]
                  text-xs font-bold uppercase tracking-wider
                  flex items-center justify-center gap-2
                  shadow hover:shadow-lg hover:shadow-[#F5D061]/15
                  transition-all duration-200 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-[#F5D061]/40"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Table
              </button>

              {/* Confirm CTA */}
              <button
                onClick={() => onSelectTable(selectedTable, selectedDate, effectiveTime, guestCount)}
                aria-label={`Confirm booking and pay ₹${pricing.totalPrice}`}
                className="flex-2 sm:flex-[2] py-3.5 rounded-2xl
                  bg-gradient-to-r from-[#F5D061] via-[#B8A07A] to-[#A3B58E]
                  hover:from-[#E8DCB8] hover:via-[#D4C4A0] hover:to-[#B2C2A1]
                  text-[#120B08] font-bold text-xs uppercase tracking-wider
                  shadow-xl shadow-[#F5D061]/30 hover:shadow-[#F5D061]/50
                  flex items-center justify-center gap-2
                  transition-all duration-200 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-[#E8DCB8]/50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Pay ₹{pricing.totalPrice} &amp; Confirm
              </button>
            </div>

            <p className="text-center text-[10px] text-[#D4C4A0]/50 pb-1">
              ✦ Cancellation eligible up to 5 hours before check-in · Secure payment via Razorpay
            </p>
          </div>
        );
      })()}

    </div>
  );
}
