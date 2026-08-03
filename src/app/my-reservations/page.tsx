'use client';

import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import EmptyState from '@/components/EmptyState';
import {
  CalendarCheck, Clock, Users, MapPin, QrCode,
  XCircle, CheckCircle, ChevronDown, ChevronUp, Award
} from 'lucide-react';
import { getStoredReservations, Reservation as DBReservation } from '@/lib/db';

type ReservationStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  table: string;
  seating: string;
  status: ReservationStatus;
  qrCode?: string;
  canCancel: boolean;
}

const DUMMY_RESERVATIONS: Reservation[] = [
  { id: 'WRC-1024', date: 'Today, 3 Aug 2026', time: '07:30 PM', guests: 4, table: 'T-07', seating: 'Riverside Canopy', status: 'upcoming', qrCode: 'WRC-1024', canCancel: true },
  { id: 'WRC-1003', date: 'Fri, 2 Aug 2026',   time: '12:00 PM', guests: 2, table: 'T-03', seating: 'Indoor Hall',      status: 'completed', canCancel: false },
  { id: 'WRC-0982', date: 'Mon, 28 Jul 2026',   time: '08:00 PM', guests: 6, table: 'T-11', seating: 'Open Terrace',    status: 'cancelled', canCancel: false },
];

const STATUS_CONFIG: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  upcoming:  { label: 'Upcoming',  color: 'text-sky-400',     bg: 'bg-sky-400/15 border-sky-400/30' },
  active:    { label: 'Active',    color: 'text-emerald-400', bg: 'bg-emerald-400/15 border-emerald-400/30' },
  completed: { label: 'Completed', color: 'text-white/50',    bg: 'bg-white/5 border-white/10' },
  cancelled: { label: 'Cancelled', color: 'text-rose-400',    bg: 'bg-rose-400/10 border-rose-400/20' },
};

function ReservationCard({ res }: { res: Reservation }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.upcoming;

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${cfg.bg}`}>
      {/* Card Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-white/50">#{res.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white font-semibold flex-wrap">
            <span className="flex items-center gap-1.5"><CalendarCheck className="w-4 h-4 text-gold-400" />{res.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold-400" />{res.time}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-white/40 shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-white/40 shrink-0 mt-1" />}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/40 text-xs mb-0.5">Guests</p>
              <p className="text-white font-semibold flex items-center gap-1.5"><Users className="w-4 h-4 text-gold-400" />{res.guests} guests</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-0.5">Table</p>
              <p className="text-white font-semibold flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold-400" />{res.table}</p>
            </div>
            <div className="col-span-2">
              <p className="text-white/40 text-xs mb-0.5">Seating</p>
              <p className="text-white font-semibold">{res.seating}</p>
            </div>
          </div>

          {/* QR Code Display */}
          {(res.status === 'upcoming' || res.status === 'active') && res.qrCode && (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-slate-950" />
              </div>
              <div>
                <p className="text-xs text-white/50 mb-0.5">Entry QR Code</p>
                <p className="text-lg font-bold text-gold-400 font-mono tracking-wider">{res.qrCode}</p>
                <p className="text-[10px] text-white/35 mt-0.5">Show this at the entrance</p>
              </div>
            </div>
          )}

          {/* Completed Review CTA */}
          {res.status === 'completed' && (
            <button className="w-full flex items-center justify-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold text-sm py-2.5 rounded-xl hover:bg-amber-500/25 transition-all">
              <Award className="w-4 h-4" /> Rate Your Experience
            </button>
          )}

          {/* Cancel Button */}
          {res.canCancel && (
            <button className="w-full flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-sm py-2.5 rounded-xl hover:bg-rose-500/20 transition-all">
              <XCircle className="w-4 h-4" /> Cancel Reservation
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyReservationsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reservations, setReservations] = useState<Reservation[]>(DUMMY_RESERVATIONS);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const dbItems: DBReservation[] = await getStoredReservations();
        if (dbItems && dbItems.length > 0) {
          const mapped: Reservation[] = dbItems.map((dbRes) => ({
            id: dbRes.id || `WRC-${Math.floor(1000 + Math.random() * 9000)}`,
            date: dbRes.date || 'Today',
            time: dbRes.time || '07:00 PM',
            guests: dbRes.guests || 2,
            table: dbRes.table_number || dbRes.cluster_name || 'Assigned at Venue',
            seating: dbRes.special_requests || 'Table Booking',
            status: (dbRes.status === 'confirmed' || dbRes.status === 'pending') ? 'upcoming' : (dbRes.status as ReservationStatus || 'upcoming'),
            qrCode: dbRes.id,
            canCancel: dbRes.status === 'confirmed' || dbRes.status === 'pending',
          }));

          // Merge DB items with fallback dummy items
          const existingIds = new Set(mapped.map(m => m.id));
          const filteredDummy = DUMMY_RESERVATIONS.filter(d => !existingIds.has(d.id));
          setReservations([...mapped, ...filteredDummy]);
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
      }
    };

    fetchReservations();
    window.addEventListener('wings_db_sync', fetchReservations);
    return () => window.removeEventListener('wings_db_sync', fetchReservations);
  }, []);

  const upcoming = reservations.filter(r => r.status === 'upcoming' || r.status === 'active');
  const past     = reservations.filter(r => r.status === 'completed' || r.status === 'cancelled');
  const list     = tab === 'upcoming' ? upcoming : past;

  return (
    <CustomerLayout breadcrumbs={[{ label: 'My Reservations' }]}>
      <div className="max-w-lg mx-auto px-4 pb-10">

        <div className="pt-6 pb-5">
          <h1 className="text-2xl font-bold font-serif text-white mb-1">
            My <span className="text-gold-400">Reservations</span>
          </h1>
          <p className="text-sm text-white/50">Track and manage your bookings</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all
                ${tab === t ? 'bg-gold-500 text-slate-950 shadow-md' : 'text-white/50 hover:text-white/80'}`}
            >
              {t} {t === 'upcoming' && upcoming.length > 0 && (
                <span className="ml-1.5 bg-slate-950/30 text-xs px-1.5 py-0.5 rounded-full">{upcoming.length}</span>
              )}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={tab === 'upcoming' ? 'No upcoming reservations' : 'No past bookings'}
            description={tab === 'upcoming' ? "Ready for a riverside experience? Book your table now." : "Your completed and cancelled bookings will appear here."}
            actionLabel={tab === 'upcoming' ? 'Reserve a Table' : undefined}
            actionHref="/reserve"
          />
        ) : (
          <div className="space-y-3">
            {list.map(res => <ReservationCard key={res.id} res={res} />)}
          </div>
        )}

        {/* New Reservation CTA */}
        {tab === 'upcoming' && (
          <a
            href="/reserve"
            className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            <CalendarCheck className="w-4.5 h-4.5" /> Book New Table
          </a>
        )}
      </div>
    </CustomerLayout>
  );
}

