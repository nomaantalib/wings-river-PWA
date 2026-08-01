'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, CheckCircle2, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import StorageController from '@/controllers/StorageController';

interface TableData {
  id: string;
  table_number: string;
  cluster_id: string;
  capacity: number;
  shape: string;
  x_position: number;
  y_position: number;
  status: 'free' | 'eating' | 'needs_cleaning' | 'reserved';
}

interface ClusterData {
  id: string;
  name: string;
  description: string;
}

interface InteractiveFloorMapProps {
  onSelectTable: (table: TableData, date: string, time: string, guests: number) => void;
}

export default function InteractiveFloorMap({ onSelectTable }: InteractiveFloorMapProps) {
  const [clusters, setClusters] = useState<ClusterData[]>([
    { id: 'cluster-riverside', name: 'Riverside Deck', description: 'Open-air waterfront seating with sunset river views' },
    { id: 'cluster-indoor', name: 'Indoor AC Hall', description: 'Climate-controlled lounge dining with glass facade' },
    { id: 'cluster-canopy', name: 'VIP Private Canopy', description: 'Exclusive fairy-light gazebo for parties & candlelit dinners' }
  ]);

  const [tables, setTables] = useState<TableData[]>([
    { id: 'tbl-1', table_number: 'T1', cluster_id: 'cluster-riverside', capacity: 4, shape: 'rectangle', x_position: 15, y_position: 25, status: 'free' },
    { id: 'tbl-2', table_number: 'T2', cluster_id: 'cluster-riverside', capacity: 4, shape: 'rectangle', x_position: 40, y_position: 25, status: 'eating' },
    { id: 'tbl-3', table_number: 'T3', cluster_id: 'cluster-riverside', capacity: 2, shape: 'round', x_position: 65, y_position: 25, status: 'free' },
    { id: 'tbl-4', table_number: 'T4', cluster_id: 'cluster-riverside', capacity: 6, shape: 'rectangle', x_position: 88, y_position: 25, status: 'free' },
    
    { id: 'tbl-5', table_number: 'T5', cluster_id: 'cluster-indoor', capacity: 4, shape: 'rectangle', x_position: 15, y_position: 55, status: 'free' },
    { id: 'tbl-6', table_number: 'T6', cluster_id: 'cluster-indoor', capacity: 4, shape: 'rectangle', x_position: 40, y_position: 55, status: 'reserved' },
    { id: 'tbl-7', table_number: 'T7', cluster_id: 'cluster-indoor', capacity: 2, shape: 'round', x_position: 65, y_position: 55, status: 'free' },
    { id: 'tbl-8', table_number: 'T8', cluster_id: 'cluster-indoor', capacity: 8, shape: 'rectangle', x_position: 88, y_position: 55, status: 'free' },
    
    { id: 'tbl-9', table_number: 'V1', cluster_id: 'cluster-canopy', capacity: 10, shape: 'canopy', x_position: 25, y_position: 85, status: 'free' },
    { id: 'tbl-10', table_number: 'V2', cluster_id: 'cluster-canopy', capacity: 12, shape: 'canopy', x_position: 55, y_position: 85, status: 'reserved' },
    { id: 'tbl-11', table_number: 'V3', cluster_id: 'cluster-canopy', capacity: 15, shape: 'canopy', x_position: 85, y_position: 85, status: 'free' },
  ]);

  const [activeCluster, setActiveCluster] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('19:30');
  const [guestCount, setGuestCount] = useState<number>(4);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  // 5-minute table hold countdown timer
  const [holdTimeLeft, setHoldTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (selectedTable) {
      setHoldTimeLeft(300); // 5 minutes in seconds
    } else {
      setHoldTimeLeft(null);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (holdTimeLeft === null || holdTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setHoldTimeLeft((prev) => (prev && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [holdTimeLeft]);

  const formatHoldTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredTables = tables.filter(t => activeCluster === 'all' || t.cluster_id === activeCluster);

  return (
    <div className="bg-dark-900 border border-amber-500/20 rounded-2xl p-6 shadow-2xl text-white">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-dark-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-serif font-bold text-amber-200">Interactive Floor Plan Table Picker</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tap an available table to lock your reservation on the Gomti Riverfront floor map.
          </p>
        </div>

        {/* Date, Time & Guests selection */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-dark-950 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400 mr-2" />
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-amber-200 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center bg-dark-950 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 mr-2" />
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-transparent text-amber-200 focus:outline-none cursor-pointer"
            >
              <option value="12:30" className="bg-dark-900">12:30 PM (Lunch)</option>
              <option value="14:00" className="bg-dark-900">02:00 PM (Afternoon)</option>
              <option value="17:30" className="bg-dark-900">05:30 PM (Sunset Cruise)</option>
              <option value="19:30" className="bg-dark-900">07:30 PM (Dinner & Lights)</option>
              <option value="21:00" className="bg-dark-900">09:00 PM (Late Dinner)</option>
            </select>
          </div>

          <div className="flex items-center bg-dark-950 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <Users className="w-3.5 h-3.5 text-amber-400 mr-2" />
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="bg-transparent text-amber-200 focus:outline-none cursor-pointer"
            >
              {[2, 3, 4, 6, 8, 10, 12, 15].map(n => (
                <option key={n} value={n} className="bg-dark-900">{n} Guests</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Zone / Cluster Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <button
          onClick={() => setActiveCluster('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeCluster === 'all'
              ? 'bg-amber-500 text-dark-950 shadow-lg shadow-amber-500/20 font-bold'
              : 'bg-dark-800 text-slate-300 hover:bg-dark-700'
          }`}
        >
          All Zones
        </button>
        {clusters.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCluster(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCluster === c.id
                ? 'bg-amber-500 text-dark-950 shadow-lg shadow-amber-500/20 font-bold'
                : 'bg-dark-800 text-slate-300 hover:bg-dark-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Visual Floor Map Canvas */}
      <div className="relative w-full h-80 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 rounded-xl border border-dark-800 overflow-hidden shadow-inner p-4">
        {/* Gomti River Graphic Accent */}
        <div className="absolute top-0 right-0 w-full h-12 bg-gradient-to-r from-blue-900/30 via-cyan-800/40 to-blue-900/30 border-b border-cyan-500/20 flex items-center justify-between px-4">
          <span className="text-[10px] uppercase tracking-widest text-cyan-300 font-mono flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-cyan-400" /> Gomti River Waterfront Promenade
          </span>
          <span className="text-[9px] text-cyan-400/70 font-mono">Outdoor View</span>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center space-x-4 bg-dark-950/80 backdrop-blur border border-dark-800 rounded-lg px-3 py-1.5 text-[10px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400" />
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400" />
            <span className="text-slate-300">Occupied</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 border border-red-400" />
            <span className="text-slate-300">Reserved</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse border border-yellow-200" />
            <span className="text-amber-300 font-semibold">Selected</span>
          </div>
        </div>

        {/* Interactive Tables Rendering */}
        <div className="relative w-full h-full pt-10">
          {filteredTables.map((t) => {
            const isSelected = selectedTable?.id === t.id;
            const isAvailable = t.status === 'free';
            const isSuitable = t.capacity >= guestCount;

            let bgColor = 'bg-emerald-900/40 border-emerald-500/60 text-emerald-300 hover:bg-emerald-800/60';
            if (t.status === 'eating') bgColor = 'bg-amber-900/40 border-amber-500/60 text-amber-300 cursor-not-allowed opacity-75';
            if (t.status === 'reserved') bgColor = 'bg-red-950/50 border-red-500/60 text-red-300 cursor-not-allowed opacity-50';
            if (t.status === 'needs_cleaning') bgColor = 'bg-slate-800/60 border-slate-600 text-slate-400 cursor-not-allowed';
            if (isSelected) bgColor = 'bg-amber-500 border-amber-300 text-dark-950 font-bold shadow-lg shadow-amber-500/50 scale-110 z-20';

            return (
              <button
                key={t.id}
                disabled={!isAvailable}
                onClick={() => setSelectedTable(t)}
                style={{
                  left: `${t.x_position}%`,
                  top: `${t.y_position}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute transition-all duration-300 rounded-xl border flex flex-col items-center justify-center p-2 min-w-[64px] min-h-[52px] ${bgColor} ${
                  isSuitable && isAvailable ? 'ring-2 ring-emerald-400/30' : ''
                }`}
              >
                <span className="text-xs font-bold font-mono">{t.table_number}</span>
                <span className="text-[9px] opacity-80 flex items-center mt-0.5">
                  <Users className="w-2.5 h-2.5 mr-0.5" /> {t.capacity} Seats
                </span>
                {t.shape === 'canopy' && (
                  <span className="text-[8px] tracking-wider uppercase bg-amber-400/20 text-amber-200 px-1 rounded mt-0.5">
                    Canopy
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Table Hold Countdown Bar & Proceed Action */}
      {selectedTable && (
        <div className="mt-6 bg-gradient-to-r from-amber-950/80 via-dark-950 to-amber-950/80 border border-amber-500/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-amber-200">
                  Table {selectedTable.table_number} Hold Reserved
                </h4>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  {holdTimeLeft !== null ? formatHoldTime(holdTimeLeft) : '0:00'} Hold Timer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                This table is temporarily locked for you ({guestCount} guests, {selectedDate} at {selectedTime}).
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTable(selectedTable, selectedDate, selectedTime, guestCount)}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-dark-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Complete Booking</span>
          </button>
        </div>
      )}
    </div>
  );
}
