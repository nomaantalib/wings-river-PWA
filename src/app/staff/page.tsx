'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, UserCheck, LayoutDashboard, QrCode, LogOut, CheckCircle, Clock, AlertTriangle, Utensils, DollarSign, Bell, RefreshCw, Phone, Users, ShieldAlert, Sparkles, Filter, ExternalLink, Calendar, PlusCircle } from 'lucide-react';
import StorageController, {
  getStoredOrders,
  updateOrderStatus as syncUpdateOrderStatus,
  TableOrder,
  getStoredTables,
  updateTableStatusInStore,
  TableStatus,
  getStoredCallRequests,
  resolveCallRequest,
  CallRequest,
  getStoredReservations
} from '@/controllers/StorageController';
import type { Reservation } from '@/models/ReservationModel';
import { notifyOrderReady, notifyTableReady } from '@/lib/pushNotifications';

export default function StaffPWA() {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: 'Kitchen' | 'Waiter' | 'Manager' | 'Admin' } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Active Role View
  const [activeRole, setActiveRole] = useState<'Kitchen' | 'Waiter' | 'Manager'>('Kitchen');

  // Staff Data States
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [orders, setOrders] = useState<TableOrder[]>([]);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [selectedWalkinTable, setSelectedWalkinTable] = useState('T1');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const u = loginForm.username.toLowerCase().trim();

    if (u === 'kitchen' || u === 'chef') {
      const user = { username: 'Chef Suresh', role: 'Kitchen' as const };
      setCurrentUser(user);
      setActiveRole('Kitchen');
    } else if (u === 'waiter' || u === 'waiter1') {
      const user = { username: 'Waiter Amit', role: 'Waiter' as const };
      setCurrentUser(user);
      setActiveRole('Waiter');
    } else if (u === 'manager' || u === 'reception' || u === 'admin') {
      const user = { username: 'Manager Saxena (Main Admin)', role: 'Manager' as const };
      setCurrentUser(user);
      setActiveRole('Manager');
    } else {
      setLoginError('Invalid credentials. Use kitchen, waiter, or manager.');
    }
  };

  // Staff Table Status Updates (Vacant / Ready / Occupied / Reserved / Cleaning)
  const handleUpdateTableStatus = async (tableNumber: string, newStatus: any) => {
    const updated = await updateTableStatusInStore(tableNumber, newStatus);
    setTables(updated);

    // 🔔 Notify customers when a table becomes free/available
    if (newStatus === 'free') {
      notifyTableReady(tableNumber);
    }
  };

  // Live sync effect for staff orders, tables, calls, reservations
  const loadStaffData = async () => {
    const liveOrders = await getStoredOrders();
    setOrders(liveOrders);

    const liveTables = await getStoredTables();
    setTables(liveTables);

    const liveCalls = await getStoredCallRequests();
    setCallRequests(liveCalls);

    const liveRes = await getStoredReservations();
    setReservations(liveRes);
  };

  useEffect(() => {
    loadStaffData();
    const handleSync = () => {
      loadStaffData();
    };
    window.addEventListener('wings_db_sync', handleSync);
    return () => window.removeEventListener('wings_db_sync', handleSync);
  }, []);

  // Kitchen Order Status Flow — fire push notification when order is ready
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: any) => {
    await syncUpdateOrderStatus(orderId, nextStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    if (nextStatus === 'ready' || nextStatus === 'served') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        notifyOrderReady({
          table: order.table_number,
          orderNumber: order.order_number,
        });
      }
    }
  };

  // Resolve Call Request
  const handleResolveCall = async (id: string) => {
    const updated = await resolveCallRequest(id);
    setCallRequests(updated);
  };

  // Handle Walkin Registration
  const handleWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone) return;

    // Update selected table status to eating
    await handleUpdateTableStatus(selectedWalkinTable, 'eating');
    setWalkinName('');
    setWalkinPhone('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 font-bold text-2xl mx-auto mb-3 shadow-lg shadow-amber-500/30">
              W
            </div>
            <h2 className="text-xl font-bold text-slate-900">Wings River Staff Portal</h2>
            <p className="text-xs text-slate-500 mt-1">Single-Tap Operations for Kitchen, Waiter & Reception</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Staff Username</label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                placeholder="kitchen / waiter / manager"
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passcode</label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition"
            >
              Log In to Staff Terminal
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block">Demo Quick Logins:</span>
            <div className="flex justify-center space-x-2 mt-2 text-xs">
              <button onClick={() => setLoginForm({ username: 'kitchen', password: '123' })} className="px-2.5 py-1 bg-slate-100 rounded-md font-semibold text-slate-700 hover:bg-amber-100">Chef Kitchen</button>
              <button onClick={() => setLoginForm({ username: 'waiter', password: '123' })} className="px-2.5 py-1 bg-slate-100 rounded-md font-semibold text-slate-700 hover:bg-amber-100">Waiter</button>
              <button onClick={() => setLoginForm({ username: 'manager', password: '123' })} className="px-2.5 py-1 bg-slate-100 rounded-md font-semibold text-slate-700 hover:bg-amber-100">Manager</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live manager dashboard stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalSeated = tables.filter(t => t.status === 'eating').length;
  const occupancyPercent = tables.length > 0 ? Math.round((totalSeated / tables.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* High Contrast Header Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row items-center justify-between shadow-md gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-950">
            W
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Wings River Operating System</h1>
            <p className="text-xs text-slate-400">Logged in as {currentUser.username} ({activeRole})</p>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveRole('Kitchen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              activeRole === 'Kitchen' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen Queue ({orders.filter(o => o.status !== 'completed').length})</span>
          </button>
          <button
            onClick={() => setActiveRole('Waiter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              activeRole === 'Waiter' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Waiter Floor Map ({callRequests.length > 0 ? `🔔 ${callRequests.length}` : tables.length})</span>
          </button>
          <button
            onClick={() => setActiveRole('Manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              activeRole === 'Manager' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Manager Dashboard</span>
          </button>
          
          {/* Main Admin Direct Link */}
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition flex items-center space-x-1 border border-amber-300"
            title="Open Full Admin Portal"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
            <span>Main Admin Portal</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 flex items-center space-x-1 text-xs font-bold"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit</span>
        </button>
      </header>

      {/* Main Staff Container */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* ROLE 1: KITCHEN CHEF KDS DISPLAY */}
        {/* ========================================================================= */}
        {activeRole === 'Kitchen' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <ChefHat className="w-6 h-6 text-amber-500" />
                  <span>Kitchen Display System (KDS Terminal)</span>
                </h2>
                <p className="text-xs text-slate-500">1-tap order status progression for chef workflow</p>
              </div>
              <div className="text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                <span>Live Kitchen Sync • {orders.length} Total Orders</span>
              </div>
            </div>

            {/* 3-Column Order Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* COLUMN 1: NEW ORDERS */}
              <div className="bg-slate-200/70 p-4 rounded-2xl border border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-red-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 animate-ping" /> New Orders
                  </h3>
                  <span className="text-xs font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
                    {orders.filter(o => o.status === 'new').length}
                  </span>
                </div>

                <div className="space-y-4">
                  {orders.filter(o => o.status === 'new').map(order => (
                    <div key={order.id} className="bg-white rounded-xl p-4 shadow-md border-2 border-red-400 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            {order.order_number}
                          </span>
                          <h4 className="text-lg font-extrabold text-slate-900 mt-1">Table {order.table_number}</h4>
                        </div>
                        <span className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        {(order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm font-bold text-slate-800">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="text-xs text-slate-500 font-mono">₹{item.price}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                      >
                        <span>Start Preparing ➔</span>
                      </button>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'new').length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500 bg-white/60 rounded-xl border border-dashed border-slate-300">
                      No new incoming orders right now.
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: PREPARING */}
              <div className="bg-slate-200/70 p-4 rounded-2xl border border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-amber-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2" /> Cooking in Progress
                  </h3>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    {orders.filter(o => o.status === 'preparing').length}
                  </span>
                </div>

                <div className="space-y-4">
                  {orders.filter(o => o.status === 'preparing').map(order => (
                    <div key={order.id} className="bg-white rounded-xl p-4 shadow-md border-2 border-amber-400 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            {order.order_number}
                          </span>
                          <h4 className="text-lg font-extrabold text-slate-900 mt-1">Table {order.table_number}</h4>
                        </div>
                        <span className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                          <span>Cooking</span>
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        {(order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm font-bold text-slate-800">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="text-xs text-slate-500 font-mono">₹{item.price}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm uppercase rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                      >
                        <span>Mark Ready to Serve ➔</span>
                      </button>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'preparing').length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500 bg-white/60 rounded-xl border border-dashed border-slate-300">
                      No items currently cooking.
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 3: READY / COMPLETED */}
              <div className="bg-slate-200/70 p-4 rounded-2xl border border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-emerald-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" /> Ready for Waiter Pickup
                  </h3>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {orders.filter(o => o.status === 'ready').length}
                  </span>
                </div>

                <div className="space-y-4">
                  {orders.filter(o => o.status === 'ready').map(order => (
                    <div key={order.id} className="bg-white rounded-xl p-4 shadow-md border-2 border-emerald-400 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {order.order_number}
                          </span>
                          <h4 className="text-lg font-extrabold text-slate-900 mt-1">Table {order.table_number}</h4>
                        </div>
                        <span className="text-xs text-emerald-600 font-bold flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Ready
                        </span>
                      </div>

                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        {(order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm font-bold text-slate-800">
                            <span>{item.quantity}x {item.name}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                      >
                        <span>Complete Order ✓</span>
                      </button>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'ready').length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500 bg-white/60 rounded-xl border border-dashed border-slate-300">
                      No orders awaiting waiter pickup.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 2: WAITER PWA */}
        {/* ========================================================================= */}
        {activeRole === 'Waiter' && (
          <div className="space-y-6">
            {/* Call Requests Alert Banner */}
            {callRequests.length > 0 && (
              <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-lg border border-amber-600 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 animate-bounce text-slate-950" />
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider">
                      {callRequests.length} Customer Call Alert(s) Active!
                    </h3>
                    <p className="text-xs font-medium">
                      Table {callRequests[0].table_number} requested: <strong>{callRequests[0].type}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {callRequests.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleResolveCall(c.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1"
                    >
                      <span>Clear Table {c.table_number} ({c.type})</span>
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ready Food Orders Notification for Waiters */}
            {orders.filter(o => o.status === 'ready').length > 0 && (
              <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg border border-emerald-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Utensils className="w-6 h-6 animate-pulse text-amber-300" />
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider">
                      {orders.filter(o => o.status === 'ready').length} Order(s) Ready for Table Delivery!
                    </h3>
                    <p className="text-xs text-emerald-100">
                      Deliver to: {orders.filter(o => o.status === 'ready').map(o => `Table ${o.table_number}`).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Floor Map Table Status Grid */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-amber-500" />
                    <span>Waiter Floor Map & Live Table Control</span>
                  </h3>
                  <p className="text-xs text-slate-500">Tap status buttons to update floor occupancy instantly</p>
                </div>

                {/* Status Legend */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1" /> Free</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-1" /> Seated/Eating</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1" /> Cleaning Needed</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-1" /> Reserved</span>
                </div>
              </div>

              {/* Table Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tables.map(t => {
                  let statusBg = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                  if (t.status === 'eating') statusBg = 'bg-amber-50 border-amber-300 text-amber-900';
                  if (t.status === 'needs_cleaning') statusBg = 'bg-red-50 border-red-300 text-red-900';
                  if (t.status === 'reserved') statusBg = 'bg-blue-50 border-blue-300 text-blue-900';

                  return (
                    <div key={t.id} className={`p-4 rounded-2xl border-2 shadow-sm space-y-3 transition hover:shadow-md ${statusBg}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-2xl font-black">{t.table_number}</h4>
                          <span className="text-[10px] uppercase font-bold opacity-80 block truncate max-w-[100px]">{t.cluster}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-white/80 shadow-xs border border-black/10">
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold opacity-75">
                        Capacity: {t.capacity} Guests
                      </div>

                      {/* Waiter One-Tap Action Buttons */}
                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/60 text-[10px] font-bold">
                        <button
                          onClick={() => handleUpdateTableStatus(t.table_number, 'eating')}
                          className="py-1.5 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition"
                        >
                          Check In
                        </button>
                        <button
                          onClick={() => handleUpdateTableStatus(t.table_number, 'needs_cleaning')}
                          className="py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          Need Clean
                        </button>
                        <button
                          onClick={() => handleUpdateTableStatus(t.table_number, 'free')}
                          className="py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 col-span-2 transition"
                        >
                          Mark Free / Cleaned ✓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 3: MANAGER / MAIN ADMIN PWA */}
        {/* ========================================================================= */}
        {activeRole === 'Manager' && (
          <div className="space-y-6">
            {/* Manager Revenue & Occupancy Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live Total Revenue</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">₹{totalRevenue.toLocaleString()}</h3>
                <span className="text-xs text-emerald-600 font-bold mt-1 block">Real-time calculate from orders</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current Floor Occupancy</span>
                <h3 className="text-3xl font-black text-amber-600 mt-1">{occupancyPercent}%</h3>
                <span className="text-xs text-slate-500 mt-1 block">{totalSeated} of {tables.length} tables seated</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Table Reservations</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{reservations.length} Bookings</h3>
                <span className="text-xs text-blue-600 font-bold mt-1 block">Live customer table reservations</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Food Orders</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{orders.length} Orders</h3>
                <span className="text-xs text-amber-600 font-bold mt-1 block">Kitchen & QR live orders</span>
              </div>
            </div>

            {/* Reception Walk-in Quick Seating Form */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <span>Walk-in Guest Quick Table Seating</span>
              </h3>
              <form onSubmit={handleWalkin} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={walkinName}
                    onChange={e => setWalkinName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={walkinPhone}
                    onChange={e => setWalkinPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Table</label>
                  <select
                    value={selectedWalkinTable}
                    onChange={e => setSelectedWalkinTable(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {tables.filter(t => t.status === 'free').map(t => (
                      <option key={t.id} value={t.table_number}>{t.table_number} ({t.cluster})</option>
                    ))}
                    {tables.filter(t => t.status === 'free').length === 0 && (
                      <option value="T1">All tables currently occupied</option>
                    )}
                  </select>
                </div>
                <button
                  type="submit"
                  className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1"
                >
                  <span>Seat Guest & Mark Occupied</span>
                </button>
              </form>
            </div>

            {/* Live Table Bookings Overview */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span>Recent Table & Party Reservations ({reservations.length})</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Booking Type</th>
                      <th className="p-3">Table / Area</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Guests</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reservations.map(res => (
                      <tr key={res.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          <div>{res.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{res.phone}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-700 uppercase">{res.booking_type.replace('_', ' ')}</td>
                        <td className="p-3 font-bold text-amber-800">{res.table_number || res.cluster_name || 'Assigned at Venue'}</td>
                        <td className="p-3 font-mono">{res.date} at {res.time}</td>
                        <td className="p-3 font-bold">{res.guests} Guests</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">No active table reservations.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
