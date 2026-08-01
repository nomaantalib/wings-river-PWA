'use client';

import React, { useState } from 'react';
import { X, Calendar, QrCode, Ticket, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyBookingsModal({ isOpen, onClose }: MyBookingsModalProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const demoBookings = [
    {
      id: 'res-892',
      type: 'table_booking',
      table_number: 'T2 (Riverside Deck)',
      date: '2026-08-05',
      time: '07:30 PM',
      guests: 4,
      status: 'confirmed',
      qr_code: 'WINGS-RES-892-T2',
      created_at: '2026-08-01'
    },
    {
      id: 'pb-104',
      type: 'party_booking',
      canopy_name: 'VIP Private Canopy V2',
      date: '2026-08-12',
      time: '07:00 PM',
      guests: 15,
      status: 'approved',
      qr_code: 'WINGS-CANOPY-V2-PARTY',
      created_at: '2026-07-28'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-dark-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="bg-dark-950 p-5 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-amber-200">My Bookings & QR Tickets</h3>
              <p className="text-xs text-slate-400">Wings River Café • Table Reservations & Event Passes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-dark-800 bg-dark-950/50 px-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'upcoming'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upcoming Reservations ({demoBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'past'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Past Visit History
          </button>
        </div>

        {/* Bookings List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'upcoming' ? (
            demoBookings.map((b) => (
              <div
                key={b.id}
                className="bg-dark-950 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      {b.type === 'table_booking' ? 'Table Reservation' : 'Party Canopy Booking'}
                    </span>
                    <h4 className="text-sm font-serif font-bold text-slate-100 mt-2">
                      {b.table_number || b.canopy_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" /> {b.date}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" /> {b.time}
                      </span>
                      <span>{b.guests} Guests</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirmed
                  </span>
                </div>

                {/* QR Entry Code Section */}
                <div className="mt-4 pt-3 border-t border-dark-800 flex items-center justify-between bg-dark-900 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-md p-1 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-dark-950" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Show QR Ticket at Reception</span>
                      <span className="text-xs font-mono font-bold text-amber-300">{b.qr_code}</span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/917310008020?text=Hi%2C%20here%20is%20my%20booking%20QR%20code%3A%20${b.qr_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition"
                  >
                    WhatsApp Ticket
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No past visits recorded under this session yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
