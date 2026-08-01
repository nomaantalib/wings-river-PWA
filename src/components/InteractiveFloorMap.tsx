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
  icon: React.ElementType;
  emoji: string;
  gradient: string;
  tables: string; // range label e.g. "T14 – T17"
  accentColor: string;
  bgCard: string;
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

const AREAS: AreaCard[] = [
  {
    id: 'indoor',
    label: 'Indoor AC Hall',
    subtitle: 'Air-conditioned • Cozy • River View Windows',
    tag: 'Most Popular',
    emoji: '🏠',
    icon: Home,
    gradient: 'from-blue-950/80 to-slate-900/80',
    accentColor: 'blue',
    bgCard: 'border-blue-500/30 hover:border-blue-400/60',
    tables: 'T14 – T17',
    tableIds: ['tbl-14','tbl-15','tbl-16','tbl-17'],
  },
  {
    id: 'garden',
    label: 'Open Garden Area',
    subtitle: 'Outdoor • Canopy Lights • Riverside Breeze',
    tag: 'Family Favourite',
    emoji: '🌳',
    icon: Leaf,
    gradient: 'from-emerald-950/80 to-dark-900/80',
    accentColor: 'emerald',
    bgCard: 'border-emerald-500/30 hover:border-emerald-400/60',
    tables: 'T7 – T13',
    tableIds: ['tbl-7','tbl-8','tbl-9','tbl-10','tbl-11','tbl-12','tbl-13'],
  },
  {
    id: 'rooftop',
    label: 'Rooftop Upper Deck',
    subtitle: 'Best River View • Sunset Dining • Starlit Nights',
    tag: 'Premium View',
    emoji: '🌅',
    icon: Sunset,
    gradient: 'from-amber-950/80 to-dark-900/80',
    accentColor: 'amber',
    bgCard: 'border-amber-500/30 hover:border-amber-400/60',
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

/* ─── Status helpers ─────────────────────────────────────── */
function statusLabel(s: TableData['status']) {
  if (s === 'free') return 'Available';
  if (s === 'eating') return 'Occupied';
  if (s === 'reserved') return 'Reserved';
  return 'Cleaning';
}

function statusClasses(s: TableData['status'], selected: boolean) {
  if (selected)
    return 'bg-amber-500 border-amber-300 text-dark-950 shadow-xl shadow-amber-500/40 scale-105 z-20 ring-2 ring-amber-300';
  if (s === 'free')
    return 'bg-emerald-900/40 border-emerald-500/60 text-emerald-300 hover:bg-emerald-800/50 hover:border-emerald-400 cursor-pointer';
  if (s === 'eating')
    return 'bg-amber-900/30 border-amber-500/50 text-amber-400 opacity-60 cursor-not-allowed';
  if (s === 'reserved')
    return 'bg-red-950/50 border-red-500/50 text-red-400 opacity-50 cursor-not-allowed';
  return 'bg-slate-800/50 border-slate-600 text-slate-500 opacity-50 cursor-not-allowed';
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
    <div className="bg-dark-900 border border-amber-500/20 rounded-2xl shadow-2xl text-white overflow-hidden">

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="bg-dark-950 border-b border-dark-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Reserve Your Table
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Choose your dining area, then pick a table</p>
        </div>

        {/* Date / Time / Guests — always visible */}
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-1.5 bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 cursor-pointer hover:border-amber-500/40 transition">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-amber-200 focus:outline-none w-28"
            />
          </label>
          <label className="flex items-center gap-1.5 bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 cursor-pointer hover:border-amber-500/40 transition">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              className="bg-transparent text-amber-200 focus:outline-none"
            >
              <option value="12:30" className="bg-dark-900">12:30 PM (Lunch)</option>
              <option value="14:00" className="bg-dark-900">02:00 PM (Afternoon)</option>
              <option value="17:30" className="bg-dark-900">05:30 PM (Sunset)</option>
              <option value="19:30" className="bg-dark-900">07:30 PM (Dinner)</option>
              <option value="21:00" className="bg-dark-900">09:00 PM (Late)</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 cursor-pointer hover:border-amber-500/40 transition">
            <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={guestCount}
              onChange={e => setGuestCount(Number(e.target.value))}
              className="bg-transparent text-amber-200 focus:outline-none"
            >
              {[1,2,3,4,5,6,8,10,12,15,20].map(n => (
                <option key={n} value={n} className="bg-dark-900">{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── Step Breadcrumb ──────────────────────────────────── */}
      <div className="flex items-center gap-0 px-5 py-3 border-b border-dark-800 bg-dark-900/60">
        {steps.map((s, i) => {
          const num = i + 1;
          const done = step > num;
          const active = step === num;
          return (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  done   ? 'bg-emerald-500 text-white'  :
                  active ? 'bg-amber-500 text-dark-950' :
                           'bg-dark-700 text-slate-500'
                }`}>
                  {done ? '✓' : num}
                </span>
                <span className={`text-[11px] font-semibold transition-colors ${
                  active ? 'text-amber-300' : done ? 'text-emerald-400' : 'text-slate-600'
                }`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-700 mx-2 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
        {step > 1 && (
          <button
            onClick={handleBack}
            className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}
      </div>

      {/* ── STEP 1: Choose Area ──────────────────────────────── */}
      {step === 1 && (
        <div className="p-5 space-y-3 animate-fade-in">
          {AREAS.map(area => {
            const areaFreeTables = ALL_TABLES.filter(t => t.cluster_id === area.id && t.status === 'free').length;
            const totalTables    = ALL_TABLES.filter(t => t.cluster_id === area.id).length;
            const Icon = area.icon;
            return (
              <button
                key={area.id}
                onClick={() => handleAreaSelect(area)}
                className={`w-full text-left rounded-2xl border bg-gradient-to-br ${area.gradient} ${area.bgCard} p-4 transition-all duration-300 hover:scale-[1.015] hover:shadow-xl group relative overflow-hidden`}
              >
                {/* subtle background glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />

                <div className="flex items-center justify-between gap-4 relative z-10">
                  {/* Left: icon + text */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-white/5 border border-white/10 shadow-inner`}>
                      {area.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white">{area.label}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          area.accentColor === 'amber'   ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          area.accentColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                                           'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {area.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{area.subtitle}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">Tables: {area.tables}</span>
                        <span className={`text-[10px] font-semibold ${areaFreeTables > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {areaFreeTables > 0 ? `${areaFreeTables} Available` : 'Fully Occupied'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: availability ring + arrow */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="14" fill="none"
                          stroke={areaFreeTables > 0 ? '#10b981' : '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={`${(areaFreeTables / totalTables) * 87.96} 87.96`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {areaFreeTables}/{totalTables}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </button>
            );
          })}

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 pt-1 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Available</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Occupied</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Reserved</span>
          </div>
        </div>
      )}

      {/* ── STEP 2: Pick a Table ─────────────────────────────── */}
      {step === 2 && selectedArea && (
        <div className="p-5 animate-fade-in">
          {/* Area header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="text-3xl">{selectedArea.emoji}</div>
            <div>
              <h4 className="text-sm font-bold text-white">{selectedArea.label}</h4>
              <p className="text-[11px] text-slate-400">{selectedArea.subtitle}</p>
            </div>
            <div className="ml-auto text-[11px] font-semibold text-emerald-400">
              {freeCount} table{freeCount !== 1 ? 's' : ''} free
            </div>
          </div>

          {/* Gomti River label */}
          <div className="w-full py-1.5 px-4 rounded-t-xl bg-gradient-to-r from-blue-900/30 via-cyan-800/40 to-blue-900/30 border border-cyan-500/20 mb-1">
            <p className="text-center text-[9px] tracking-[0.2em] text-cyan-300 uppercase font-mono">
              🌊 Gomti Riverfront — {selectedArea.label}
            </p>
          </div>

          {/* Table grid */}
          <div className="bg-dark-950/80 border border-dark-800 rounded-b-xl rounded-tr-xl p-5 space-y-4">
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
                      className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 px-4 py-3 min-w-[72px] ${statusClasses(tbl.status, isSelected)}`}
                    >
                      {suitable && tbl.status === 'free' && !isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-dark-950 animate-pulse" />
                      )}
                      <span className="text-sm font-bold font-mono">{tbl.table_number}</span>
                      <span className="text-[9px] opacity-75 flex items-center gap-0.5 mt-0.5">
                        <Users className="w-2.5 h-2.5" />{tbl.capacity}
                      </span>
                      <span className={`text-[8px] mt-0.5 font-semibold ${
                        tbl.status === 'free' ? 'text-emerald-400' :
                        tbl.status === 'eating' ? 'text-amber-400' : 'text-red-400'
                      }`}>{statusLabel(tbl.status)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Capacity note */}
          <p className="text-center text-[10px] text-slate-500 mt-3">
            Tables with <span className="text-emerald-400">●</span> green dot fit your party of <span className="text-amber-300 font-semibold">{guestCount}</span>.
            Tap a table to select it.
          </p>
        </div>
      )}

      {/* ── STEP 3: Confirm Booking ──────────────────────────── */}
      {step === 3 && selectedTable && selectedArea && (() => {
        const pricing = calculateBookingPrice(selectedDate, guestCount);
        return (
          <div className="p-5 animate-fade-in space-y-4">
            {/* Summary card */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-950/70 to-dark-950 border border-amber-500/40 p-5">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{selectedArea.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-sm font-bold text-amber-200">Your Table is on Hold</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pricing.isWeekend ? 'Weekend Rate (₹600/person)' : 'Weekday Rate (₹300/person)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedArea.label}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                    {[
                      { label: 'Table', value: selectedTable.table_number },
                      { label: 'Seats', value: `${selectedTable.capacity} max` },
                      { label: 'Date', value: `${selectedDate} (${pricing.dayName.slice(0, 3)})` },
                      { label: 'Time', value: selectedTime },
                      { label: 'Guests', value: `${guestCount} people` },
                      { label: 'Calculated Booking Fee', value: `₹${pricing.totalPrice} (₹${pricing.perPersonRate} x ${guestCount})` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-dark-900/80 rounded-lg px-3 py-2 border border-dark-700">
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
                        <p className="text-xs font-bold text-amber-200 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hold timer */}
              <div className="mt-4 flex items-center gap-2 bg-dark-950/70 border border-amber-500/20 rounded-xl px-3 py-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <p className="text-[11px] text-slate-300 flex-1">
                  Table <span className="text-amber-300 font-bold">{selectedTable.table_number}</span> is temporarily held for you
                </p>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  {holdLeft !== null ? fmtTime(holdLeft) : '5:00'}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-2.5 rounded-xl border border-dark-700 text-slate-300 text-xs font-semibold hover:border-dark-600 hover:text-white transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Change Table
              </button>
              <button
                onClick={() => onSelectTable(selectedTable, selectedDate, selectedTime, guestCount)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-dark-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2"
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
