'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, QrCode, Ticket, CheckCircle, Clock, MapPin, Phone, RefreshCw, AlertCircle, ShieldAlert, Sparkles, User } from 'lucide-react';
import { getStoredReservations, updateReservationStatus, Reservation } from '@/lib/db';
import { getStoredUserSession } from '@/components/UserAuthModal';
import { isEligibleForRefundCancellation } from '@/lib/notifications';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyBookingsModal({ isOpen, onClose }: MyBookingsModalProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [userBookings, setUserBookings] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userSession, setUserSession] = useState(getStoredUserSession());

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const session = getStoredUserSession();
      setUserSession(session);
      const all = await getStoredReservations();

      if (!session || !session.phone) {
        setUserBookings([]);
        setIsLoading(false);
        return;
      }

      const userCleanPhone = session.phone.replace(/\D/g, '');
      const filtered = all.filter(r => r.phone.replace(/\D/g, '') === userCleanPhone);
      
      // Sort newest first
      filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      setUserBookings(filtered);
    } catch (err) {
      console.error('[MyBookings] Error loading reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadReservations();

    // Listen to real-time database sync events
    const handleSync = () => {
      loadReservations();
    };

    window.addEventListener('wings_db_sync', handleSync);
    window.addEventListener('wings_auth_change', handleSync);
    return () => {
      window.removeEventListener('wings_db_sync', handleSync);
      window.removeEventListener('wings_auth_change', handleSync);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = userBookings.filter(b => {
    if (b.status === 'completed' || b.status === 'cancelled') return false;
    return (b.date || '') >= todayStr || b.status === 'eating' || b.status === 'confirmed' || b.status === 'pending';
  });

  const pastBookings = userBookings.filter(b => {
    if (b.status === 'completed' || b.status === 'cancelled') return true;
    return (b.date || '') < todayStr;
  });

  const activeBookingsList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleCancelBooking = async (booking: Reservation) => {
    const check = isEligibleForRefundCancellation(booking.date, booking.time);
    const confirmMsg = check.eligible
      ? `Full refund eligible! ${check.reason}\n\nAre you sure you want to cancel your reservation for Table ${booking.table_number || ''}?`
      : `Cancellation notice: ${check.reason}\n\nDo you still wish to proceed with cancellation?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateReservationStatus(booking.id, 'cancelled');
      window.dispatchEvent(new Event('wings_db_sync'));
      alert('Reservation has been cancelled successfully.');
      loadReservations();
    } catch (err) {
      alert('Failed to cancel reservation. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in text-white">
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-[#F5D061]/15 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-[#98A886]/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative w-full max-w-2xl bg-[#12151C] border border-[#F5D061]/35 rounded-3xl shadow-[0_25px_60px_-15px_rgba(245,208,97,0.2)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-[#181B22] p-5 border-b border-[#F5D061]/25 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#E5B82C] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#120B08] rounded-[14px] flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#F5D061]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#98A886]">
                  Customer Portal
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Real-time syncing" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#F8E7A1]">My Reservations &amp; QR Passes</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadReservations}
              title="Refresh Reservations"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#D4C4A0] hover:text-white transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#D4C4A0] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info Bar */}
        {userSession && userSession.loggedIn && (
          <div className="bg-[#181B22]/70 px-5 py-2.5 border-b border-[#F5D061]/15 flex items-center justify-between text-xs text-[#D4C4A0]">
            <div className="flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-[#F5D061]" />
              <span className="font-bold text-[#F8E7A1]">{userSession.name}</span>
              <span className="font-mono text-[11px] text-[#98A886]">({userSession.phone})</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Real-time Sync Active
            </span>
          </div>
        )}

        {/* Tab Selection Bar */}
        <div className="flex border-b border-[#F5D061]/15 bg-[#0F1117] px-4 shrink-0">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center space-x-2 ${
              activeTab === 'upcoming'
                ? 'border-[#F5D061] text-[#F5D061]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Upcoming Reservations</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F5D061]/20 text-[#F5D061]">
              {upcomingBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center space-x-2 ${
              activeTab === 'past'
                ? 'border-[#F5D061] text-[#F5D061]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Past Visit History</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/10 text-slate-300">
              {pastBookings.length}
            </span>
          </button>
        </div>

        {/* Bookings List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeBookingsList.length > 0 ? (
            activeBookingsList.map((b) => {
              const qrCodeValue = b.qr_code || `WINGS-${b.id.toUpperCase()}`;
              const isEating = b.status === 'eating';
              const isConfirmed = b.status === 'confirmed';
              const isCancelled = b.status === 'cancelled';
              const isCompleted = b.status === 'completed';

              return (
                <div
                  key={b.id}
                  className="bg-[#181B22] border border-[#F5D061]/25 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl transition-all hover:border-[#F5D061]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-widest bg-[#1F1810] text-[#F5D061] px-2.5 py-0.5 rounded-md border border-[#F5D061]/30">
                          {b.booking_type === 'party_booking' ? 'Party Canopy Booking' : 'Table Reservation'}
                        </span>
                        {b.table_number && (
                          <span className="text-[10px] font-mono font-bold text-[#98A886] bg-[#1E2C1A] px-2 py-0.5 rounded-md border border-[#98A886]/30">
                            Table {b.table_number}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-serif font-bold text-[#F8E7A1]">
                        {b.name || userSession?.name || 'Valued Guest'}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#D4C4A0]/80 mt-1.5">
                        <span className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-[#F5D061]" />
                          <span>{b.date}</span>
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-[#F5D061]" />
                          <span>{b.time}</span>
                        </span>
                        <span className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1 text-[#98A886]" />
                          <span>{b.guests || 2} Guests</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isEating && (
                        <span className="text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-3 py-1 rounded-xl flex items-center shadow-sm animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Dining Now
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-xl flex items-center shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Confirmed
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Completed
                        </span>
                      )}
                      {isCancelled && (
                        <span className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-3 py-1 rounded-xl flex items-center">
                          <X className="w-3.5 h-3.5 mr-1.5" /> Cancelled
                        </span>
                      )}
                      {!isEating && !isConfirmed && !isCompleted && !isCancelled && (
                        <span className="text-xs font-bold text-[#F5D061] bg-[#1F1810] border border-[#F5D061]/40 px-3 py-1 rounded-xl flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Pending Approval
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QR Entry Ticket & WhatsApp Share */}
                  {!isCancelled && (
                    <div className="mt-4 pt-3.5 border-t border-[#F5D061]/15 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#121418] p-3.5 rounded-2xl border border-[#F5D061]/20 gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 shadow-md">
                            <QrCode className="w-10 h-10 text-dark-950" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#D4C4A0]/60 block uppercase font-bold tracking-wider">Show Ticket at Desk</span>
                            <span className="text-xs font-mono font-bold text-[#F5D061]">{qrCodeValue}</span>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/917310008020?text=Hi%20Wings%20River%20Caf%C3%A9%2C%20here%20is%20my%20reservation%20QR%20Code%3A%20${qrCodeValue}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-[#1A2E1A] hover:bg-[#253E25] text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp Pass</span>
                        </a>
                      </div>

                      {/* Refund & Cancellation Section */}
                      {activeTab === 'upcoming' && !isEating && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1116] border border-white/5 text-xs">
                          <div className="text-[11px] text-[#D4C4A0]/70">
                            <span className="text-[#F5D061] font-semibold block">5-Hour Cancellation Guarantee:</span>
                            Full refund eligible if cancelled 5+ hours prior to slot time.
                          </div>
                          <button
                            onClick={() => handleCancelBooking(b)}
                            className="px-3.5 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 rounded-xl text-[11px] font-bold shrink-0 transition ml-3"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#D4C4A0]/60 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#181B22] border border-[#F5D061]/25 flex items-center justify-center mx-auto text-[#F5D061]">
                <Ticket className="w-7 h-7" />
              </div>
              <p className="font-serif text-base font-bold text-[#F8E7A1]">
                {activeTab === 'upcoming' ? 'No Upcoming Reservations' : 'No Past Visit History'}
              </p>
              <p className="text-xs text-[#D4C4A0]/70 max-w-xs mx-auto">
                {activeTab === 'upcoming'
                  ? 'Reserve your table on the Gomti riverfront deck or book water sports rides to see your QR passes here.'
                  : 'Your past table check-ins and dining records will appear here after your visit.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
