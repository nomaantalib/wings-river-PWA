import React from 'react';
import { Calendar, Utensils, IndianRupee, MessageSquare, Megaphone, Star, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { Reservation } from '@/types';

interface AdminOverviewTabProps {
  stats: any;
  reservations: Reservation[];
  onNavigateTab: (tab: string) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ stats, reservations, onNavigateTab }) => {
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-900/40 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-2xl font-bold text-amber-200">System Dashboard Overview</h2>
        <p className="text-sm text-amber-300/80 mt-1">Real-time statistics & quick operations for Wings River Café CMS.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div onClick={() => onNavigateTab('reservations')} className="cursor-pointer bg-black/40 border border-white/10 hover:border-amber-500/50 p-5 rounded-2xl transition-all shadow-lg hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Bookings</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl"><Calendar className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{stats?.total_bookings || reservations.length}</div>
          <div className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {pendingCount} Pending Approval
          </div>
        </div>

        <div onClick={() => onNavigateTab('menu')} className="cursor-pointer bg-black/40 border border-white/10 hover:border-amber-500/50 p-5 rounded-2xl transition-all shadow-lg hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Menu Items</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl"><Utensils className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{stats?.menu_items || 0}</div>
          <div className="text-xs text-gray-400 mt-1">Active Multicuisine Items</div>
        </div>

        <div onClick={() => onNavigateTab('media')} className="cursor-pointer bg-black/40 border border-white/10 hover:border-amber-500/50 p-5 rounded-2xl transition-all shadow-lg hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Media Assets</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl"><Megaphone className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{stats?.gallery_images || 0}</div>
          <div className="text-xs text-gray-400 mt-1">Cloudinary Images & Videos</div>
        </div>

        <div onClick={() => onNavigateTab('content')} className="cursor-pointer bg-black/40 border border-white/10 hover:border-amber-500/50 p-5 rounded-2xl transition-all shadow-lg hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Blogs & Reviews</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl"><BookOpen className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{(stats?.blogs_count || 0) + (stats?.reviews_count || 0)}</div>
          <div className="text-xs text-gray-400 mt-1">Articles & Customer Feedbacks</div>
        </div>
      </div>

      {/* Recent Reservations Snapshot */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" /> Recent Reservation Requests
          </h3>
          <button onClick={() => onNavigateTab('reservations')} className="text-xs font-semibold text-amber-400 hover:underline">
            View All ({reservations.length}) →
          </button>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No reservations recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/5 text-gray-400 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Guests</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reservations.slice(0, 5).map((res) => (
                  <tr key={res.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>{res.name}</div>
                      <div className="text-xs text-gray-400 font-normal">{res.phone}</div>
                    </td>
                    <td className="py-3 px-4">{res.date} at {res.time}</td>
                    <td className="py-3 px-4 font-mono">{res.guests} Guests</td>
                    <td className="py-3 px-4 text-xs font-medium text-amber-300">{res.booking_type || 'Table Booking'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        res.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        res.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewTab;
