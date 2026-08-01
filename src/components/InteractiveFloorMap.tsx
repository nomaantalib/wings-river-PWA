'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Clock, Calendar, CheckCircle2, ShieldAlert,
  ArrowLeft, Home, Leaf, Sunset, ChevronRight, MapPin,
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
  tables: string; // range label e.g. "T14 – T17"
  tableIds: string[];
}

interface InteractiveFloorMapProps {
  onSelectTable: (table: TableData, date: string, time: string, guests: number) => void;
}

/* ─── Static Table Data ───────────────────────────────────── */
const ALL_TABLES: TableData[] = [
  // Rooftop Upper Deck — T1-T6
  { id: 'tbl-1',  table_number: 'T1', cluster_id: 'rooftop',  capacity: 2, status: 'free' },
  { id: 'tbl-2',  table_number: 'T2', cluster_id: 'rooftop',  capacity: 4, status: 'eating' },
  { id: 'tbl-3',  table_number: 'T3', cluster_id: 'rooftop',  capacity: 2, status: 'free' },
  { id: 'tbl-4',  table_number: 'T4', cluster_id: 'rooftop',  capacity: 4, status: 'free' },
  { id: 'tbl-5',  table_number: 'T5', cluster_id: 'rooftop',  capacity: 2, status: 'free' },
  { id: 'tbl-6',  table_number: 'T6', cluster_id: 'rooftop',  capacity: 4, status: 'reserved' },
  // Open Garden — T7-T13
  { id: 'tbl-7',  table_number: 'T7',  cluster_id: 'garden',  capacity: 4, status: 'free' },
  { id: 'tbl-8',  table_number: 'T8',  cluster_id: 'garden',  capacity: 4, status: 'free' },
  { id: 'tbl-9',  table_number: 'T9',  cluster_id: 'garden',  capacity: 6, status: 'eating' },
  { id: 'tbl-10', table_number: 'T10', cluster_id: 'garden',  capacity: 4, status: 'free' },
  { id: 'tbl-11', table_number: 'T11', cluster_id: 'garden',  capacity: 4, status: 'free' },
  { id: 'tbl-12', table_number: 'T12', cluster_id: 'garden',  capacity: 6, status: 'free' },
  { id: 'tbl-13', table_number: 'T13', cluster_id: 'garden',  capacity: 8, status: 'reserved' },
  // Indoor AC Hall — T14-T17
  { id: 'tbl-14', table_number: 'T14', cluster_id: 'indoor',  capacity: 4, status: 'free' },
  { id: 'tbl-15', table_number: 'T15', cluster_id: 'indoor',  capacity: 4, status: 'free' },
  { id: 'tbl-16', table_number: 'T16', cluster_id: 'indoor',  capacity: 6, status: 'eating' },
  { id: 'tbl-17', table_number: 'T17', cluster_id: 'indoor',  capacity: 8, status: 'free' },
];

/* ─── Executive Color Palette Cards (Brown, Pista, Golden Beige, Black) ── */
const AREAS: AreaCard[] = [
  {
    id: 'indoor',
    label: 'Indoor AC Hall',
    subtitle: 'Air-conditioned • Cozy • River View Windows',
    tag: 'Most Popular',
    iconType: 'home',
    gradient: 'from-[#2A1E17] via-[#1E140F] to-[#120B08]',
    borderStyle: 'border-[#C9B086]/35 hover:border-[#E8DCB8]',
    tagStyle: 'bg-[#C9B086]/20 text-[#E8DCB8] border border-[#C9B086]/40',
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


/* ─── Table Layout per area (row arrays) ─────────────────── */
const AREA_LAYOUTS: Record<string, string[][]> = {
  rooftop: [
    ['T1', 'T3', 'T5'],
    ['T2', 'T4', 'T6'],
  ],
  garden: [
    ['T13', 'T12', 'T11', 'T10'],
    ['T7',  'T8',  'T9'],
  ],
  indoor: [
    ['T14', 'T15'],
    ['T16', 'T17'],
  ],
};

/* ─── Status helpers with Pista & Golden Beige Palette ───── */
function statusLabel(s: TableData['status']) {
  if (s === 'free') return 'Available';
  if (s === 'eating') return 'Occupied';
  if (s === 'reserved') return 'Reserved';
  return 'Cleaning';
}

function statusClasses(s: TableData['status'], selected: boolean) {
  if (selected)
    return 'bg-[#C9B086] border-[#F5EBE0] text-[#120B08] font-bold shadow-xl shadow-[#C9B086]/30 scale-105 z-20 ring-2 ring-[#F5EBE0]';
  if (s === 'free')
    return 'bg-[#2D3825]/70 border-[#98A886] text-[#D8E2CD] hover:bg-[#3B4A31] hover:border-[#B2C2A1] cursor-pointer';
  if (s === 'eating')
    return 'bg-[#3B281B]/60 border-[#C9B086]/40 text-[#E8DCB8]/70 opacity-70 cursor-not-allowed';
  if (s === 'reserved')
    return 'bg-[#2A1412]/60 border-red-500/40 text-red-300 opacity-60 cursor-not-allowed';
  return 'bg-[#181A1F]/60 border-slate-700 text-slate-400 opacity-50 cursor-not-allowed';
}

function AreaIcon({ type, className = "w-6 h-6" }: { type: 'home' | 'leaf' | 'sunset'; className?: string }) {
  if (type === 'home') return <Home className={`${className} text-[#E8DCB8]`} />;
  if (type === 'leaf') return <Leaf className={`${className} text-[#98A886]`} />;
  return <Sunset className={`${className} text-[#F5EBE0]`} />;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function InteractiveFloorMap({ onSelectTable }: InteractiveFloorMapProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedArea, setSelectedArea] = useState<AreaCard | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('19:30');
  const [guestCount, setGuestCount] = useState<number>(2);

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
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  // Tables for selected area
  const areaTables = selectedArea
    ? ALL_TABLES.filter(t => t.cluster_id === selectedArea.id)
    : [];
  const freeCount = areaTables.filter(t => t.status === 'free').length;

  const handleAreaSelect = (area: AreaCard) => {
    setSelectedArea(area);
    setSelectedTable(null);
    setStep(2);
  };

  const handleTableSelect = (t: TableData) => {
    if (t.status !== 'free') return;
    setSelectedTable(t);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) { setSelectedTable(null); setStep(2); }
    else { setSelectedArea(null); setSelectedTable(null); setStep(1); }
  };

  /* ── STEP INDICATOR ─────────────────────────────────────── */
  const steps = ['Choose Area', 'Pick Table', 'Confirm'];

  return (
    <div className="bg-[#121417]/95 border border-[#C9B086]/30 rounded-3xl shadow-2xl text-[#F5EBE0] overflow-hidden">

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="bg-[#1A1D24] border-b border-[#C9B086]/20 px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#E8DCB8] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#98A886]" />
            Reserve Your Table
          </h3>
          <p className="text-xs text-[#D4C4A0]/80 mt-0.5">Choose your dining area, then pick a table</p>
        </div>

        {/* Date / Time / Guests — always visible */}
        <div className="flex flex-wrap gap-2.5">
          <label className="flex items-center gap-2 bg-[#231710] border border-[#C9B086]/30 rounded-xl px-3 py-2 text-xs text-[#E8DCB8] cursor-pointer hover:border-[#C9B086] transition">
            <Calendar className="w-3.5 h-3.5 text-[#98A886] shrink-0" />
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-[#E8DCB8] focus:outline-none w-28 cursor-pointer"
            />
          </label>

          <label className="flex items-center gap-2 bg-[#231710] border border-[#C9B086]/30 rounded-xl px-3 py-2 text-xs text-[#E8DCB8] cursor-pointer hover:border-[#C9B086] transition">
            <Clock className="w-3.5 h-3.5 text-[#98A886] shrink-0" />
            <select
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              className="bg-transparent text-[#E8DCB8] focus:outline-none cursor-pointer"
            >
              <option value="12:30" className="bg-[#121417]">12:30 PM (Lunch)</option>
              <option value="14:00" className="bg-[#121417]">02:00 PM (Afternoon)</option>
              <option value="17:30" className="bg-[#121417]">05:30 PM (Sunset)</option>
              <option value="19:30" className="bg-[#121417]">07:30 PM (Dinner)</option>
              <option value="21:00" className="bg-[#121417]">09:00 PM (Late)</option>
            </select>
          </label>

          <label className="flex items-center gap-2 bg-[#231710] border border-[#C9B086]/30 rounded-xl px-3 py-2 text-xs text-[#E8DCB8] cursor-pointer hover:border-[#C9B086] transition">
            <Users className="w-3.5 h-3.5 text-[#98A886] shrink-0" />
            <select
              value={guestCount}
              onChange={e => setGuestCount(Number(e.target.value))}
              className="bg-transparent text-[#E8DCB8] focus:outline-none cursor-pointer"
            >
              {[1,2,3,4,5,6,8,10,12,15,20].map(n => (
                <option key={n} value={n} className="bg-[#121417]">{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── Step Breadcrumb ──────────────────────────────────── */}
      <div className="flex items-center gap-0 px-6 py-3.5 border-b border-[#C9B086]/15 bg-[#14171D]">
        {steps.map((s, i) => {
          const num = i + 1;
          const done = step > num;
          const active = step === num;
          return (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  done   ? 'bg-[#98A886] text-[#120B08]'  :
                  active ? 'bg-[#C9B086] text-[#120B08]' :
                           'bg-[#231710] text-[#D4C4A0]/50 border border-[#C9B086]/20'
                }`}>
                  {done ? '✓' : num}
                </span>
                <span className={`text-[11px] font-semibold transition-colors ${
                  active ? 'text-[#E8DCB8]' : done ? 'text-[#98A886]' : 'text-slate-500'
                }`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#C9B086]/30 mx-3 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
        {step > 1 && (
          <button
            onClick={handleBack}
            className="ml-auto flex items-center gap-1 text-[11px] text-[#D4C4A0]/80 hover:text-[#E8DCB8] transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}
      </div>

      {/* ── STEP 1: Choose Area ──────────────────────────────── */}
      {step === 1 && (
        <div className="p-6 space-y-4 animate-fade-in">
          {AREAS.map(area => {
            const areaFreeTables = ALL_TABLES.filter(t => t.cluster_id === area.id && t.status === 'free').length;
            const totalTables    = ALL_TABLES.filter(t => t.cluster_id === area.id).length;
            return (
              <button
                key={area.id}
                onClick={() => handleAreaSelect(area)}
                className={`w-full text-left rounded-2xl border bg-gradient-to-r ${area.gradient} ${area.borderStyle} p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl group relative overflow-hidden`}
              >
                <div className="flex items-center justify-between gap-4 relative z-10">
                  {/* Left: icon + details */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#231710]/80 border border-[#C9B086]/30 p-3 shadow-inner">
                      <AreaIcon type={area.iconType} className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-base font-serif font-bold text-[#E8DCB8]">{area.label}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${area.tagStyle}`}>
                          {area.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[#D4C4A0]/80 mt-1">{area.subtitle}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] text-slate-400 font-mono">Tables: {area.tables}</span>
                        <span className={`text-[11px] font-bold ${areaFreeTables > 0 ? 'text-[#98A886]' : 'text-red-400'}`}>
                          {areaFreeTables > 0 ? `${areaFreeTables} Available` : 'Fully Occupied'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: progress indicator + arrow */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="relative w-11 h-11">
                      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(201,176,134,0.12)" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="14" fill="none"
                          stroke={areaFreeTables > 0 ? '#98A886' : '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={`${(areaFreeTables / totalTables) * 87.96} 87.96`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold font-mono text-[#E8DCB8]">
                        {areaFreeTables}/{totalTables}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C9B086]/60 group-hover:text-[#E8DCB8] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            );
          })}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-3 text-xs text-[#D4C4A0]/70 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#98A886] inline-block" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C9B086] inline-block" />Occupied</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Reserved</span>
          </div>
        </div>
      )}

      {/* ── STEP 2: Pick a Table ─────────────────────────────── */}
      {step === 2 && selectedArea && (
        <div className="p-6 animate-fade-in">
          {/* Area header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#231710] border border-[#C9B086]/30 p-2">
              <AreaIcon type={selectedArea.iconType} className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-serif font-bold text-[#E8DCB8]">{selectedArea.label}</h4>
              <p className="text-xs text-[#D4C4A0]/80">{selectedArea.subtitle}</p>
            </div>
            <div className="ml-auto text-xs font-bold text-[#98A886]">
              {freeCount} table{freeCount !== 1 ? 's' : ''} free
            </div>
          </div>

          {/* Gomti River label */}
          <div className="w-full py-2 px-4 rounded-t-xl bg-gradient-to-r from-[#231710] via-[#362419] to-[#231710] border border-[#C9B086]/30 mb-1">
            <p className="text-center text-[10px] tracking-[0.2em] text-[#E8DCB8] uppercase font-mono flex items-center justify-center gap-2">
              <MapPin className="w-3 h-3 text-[#98A886]" />
              Gomti Riverfront — {selectedArea.label}
            </p>
          </div>

          {/* Table grid */}
          <div className="bg-[#181A1F] border border-[#C9B086]/20 rounded-b-xl rounded-tr-xl p-6 space-y-4">
            {AREA_LAYOUTS[selectedArea.id].map((row, ri) => (
              <div key={ri} className="flex items-center justify-center gap-4 flex-wrap">
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
                      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 px-5 py-3.5 min-w-[80px] ${statusClasses(tbl.status, isSelected)}`}
                    >
                      {suitable && tbl.status === 'free' && !isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#98A886] border-2 border-[#121417] animate-pulse" />
                      )}
                      <span className="text-base font-bold font-mono">{tbl.table_number}</span>
                      <span className="text-[10px] opacity-80 flex items-center gap-0.5 mt-0.5">
                        <Users className="w-3 h-3" />{tbl.capacity} Seats
                      </span>
                      <span className={`text-[9px] mt-1 font-bold ${
                        tbl.status === 'free' ? 'text-[#98A886]' :
                        tbl.status === 'eating' ? 'text-[#C9B086]' : 'text-red-300'
                      }`}>{statusLabel(tbl.status)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Capacity note */}
          <p className="text-center text-xs text-[#D4C4A0]/70 mt-4">
            Tables with pista green indicator fit your party of <span className="text-[#E8DCB8] font-bold">{guestCount}</span>.
            Tap an available table to select it.
          </p>
        </div>
      )}

      {/* ── STEP 3: Confirm Booking ──────────────────────────── */}
      {step === 3 && selectedTable && selectedArea && (() => {
        const pricing = calculateBookingPrice(selectedDate, guestCount);
        return (
          <div className="p-6 animate-fade-in space-y-4">
            {/* Summary card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#231710] to-[#121417] border border-[#C9B086]/40 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#231710] border border-[#C9B086]/30 p-3 shrink-0">
                  <AreaIcon type={selectedArea.iconType} className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-base font-serif font-bold text-[#E8DCB8]">Your Table is on Hold</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#98A886]/20 text-[#D8E2CD] border border-[#98A886]/40">
                      {pricing.isWeekend ? 'Weekend Rate (₹600/person)' : 'Weekday Rate (₹300/person)'}
                    </span>
                  </div>
                  <p className="text-xs text-[#D4C4A0]/80 mt-0.5">{selectedArea.label}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Table', value: selectedTable.table_number },
                      { label: 'Seats', value: `${selectedTable.capacity} max` },
                      { label: 'Date', value: `${selectedDate} (${pricing.dayName.slice(0, 3)})` },
                      { label: 'Time', value: selectedTime },
                      { label: 'Guests', value: `${guestCount} people` },
                      { label: 'Calculated Fee', value: `₹${pricing.totalPrice} (₹${pricing.perPersonRate} x ${guestCount})` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#181A1F] rounded-xl px-3.5 py-2.5 border border-[#C9B086]/20">
                        <p className="text-[9px] text-[#D4C4A0]/60 uppercase tracking-wider">{label}</p>
                        <p className="text-xs font-bold text-[#E8DCB8] mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hold timer */}
              <div className="mt-5 flex items-center gap-3 bg-[#14171D] border border-[#C9B086]/30 rounded-2xl px-4 py-3">
                <ShieldAlert className="w-4 h-4 text-[#98A886] animate-pulse shrink-0" />
                <p className="text-xs text-[#F5EBE0] flex-1">
                  Table <span className="text-[#E8DCB8] font-bold">{selectedTable.table_number}</span> is locked for you
                </p>
                <span className="font-mono text-xs font-bold text-[#E8DCB8] bg-[#231710] border border-[#C9B086]/40 px-3 py-1 rounded-xl">
                  {holdLeft !== null ? fmtTime(holdLeft) : '5:00'}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-2xl border border-[#C9B086]/30 text-[#D4C4A0] text-xs font-semibold hover:border-[#C9B086] hover:text-white transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Change Table
              </button>
              <button
                onClick={() => onSelectTable(selectedTable, selectedDate, selectedTime, guestCount)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#C9B086] to-[#A3B58E] hover:from-[#E8DCB8] hover:to-[#B2C2A1] text-[#120B08] font-bold text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Pay ₹{pricing.totalPrice} &amp; Confirm
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
