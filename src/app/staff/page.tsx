'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, UserCheck, LayoutDashboard, QrCode, LogOut, CheckCircle, Clock, AlertTriangle, Utensils, DollarSign, Bell, RefreshCw, Phone, Users, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import StorageController from '@/controllers/StorageController';

export default function StaffPWA() {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: 'Kitchen' | 'Waiter' | 'Manager' | 'Admin' } | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Active Role View
  const [activeRole, setActiveRole] = useState<'Kitchen' | 'Waiter' | 'Manager'>('Kitchen');

  // Staff Data States
  const [tables, setTables] = useState([
    { id: 'tbl-1', table_number: 'T1', cluster: 'Riverside Deck', capacity: 4, status: 'free' },
    { id: 'tbl-2', table_number: 'T2', cluster: 'Riverside Deck', capacity: 4, status: 'eating' },
    { id: 'tbl-3', table_number: 'T3', cluster: 'Riverside Deck', capacity: 2, status: 'free' },
    { id: 'tbl-4', table_number: 'T4', cluster: 'Riverside Deck', capacity: 6, status: 'needs_cleaning' },
    { id: 'tbl-5', table_number: 'T5', cluster: 'Indoor AC', capacity: 4, status: 'free' },
    { id: 'tbl-6', table_number: 'T6', cluster: 'Indoor AC', capacity: 4, status: 'reserved' },
    { id: 'tbl-9', table_number: 'V1', cluster: 'VIP Canopy', capacity: 10, status: 'free' },
    { id: 'tbl-10', table_number: 'V2', cluster: 'VIP Canopy', capacity: 12, status: 'reserved' },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'ord-101',
      order_number: 'ORD-101',
      table_number: 'T2',
      customer_name: 'Rahul Sharma',
      status: 'new',
      total_amount: 843,
      items: [
        { name: 'Special Pav Bhaji', quantity: 2, price: 150 },
        { name: 'Virgin Mojito', quantity: 2, price: 119 },
        { name: 'Loaded Special Pizza', quantity: 1, price: 349 },
      ],
      time: '18:30',
    },
    {
      id: 'ord-102',
      order_number: 'ORD-102',
      table_number: 'T4',
      customer_name: 'Walk-in Guest',
      status: 'preparing',
      total_amount: 498,
      items: [
        { name: 'Chilli Paneer Dry', quantity: 1, price: 219 },
        { name: 'Red Sauce Arrabiata Pasta', quantity: 1, price: 275 },
      ],
      time: '18:42',
    },
  ]);

  const [callRequests, setCallRequests] = useState([
    { id: 'call-1', table_number: 'T2', type: 'Drinking Water', time: '2 mins ago', status: 'pending' },
    { id: 'call-2', table_number: 'T4', type: 'Request Bill', time: 'Just now', status: 'pending' },
  ]);

  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [selectedWalkinTable, setSelectedWalkinTable] = useState('T1');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const u = loginForm.username.toLowerCase().trim();
    const p = loginForm.password;

    if (u === 'kitchen' || u === 'chef') {
      const user = { username: 'Chef Suresh', role: 'Kitchen' as const };
      setCurrentUser(user);
      setActiveRole('Kitchen');
    } else if (u === 'waiter' || u === 'waiter1') {
      const user = { username: 'Waiter Amit', role: 'Waiter' as const };
      setCurrentUser(user);
      setActiveRole('Waiter');
    } else if (u === 'manager' || u === 'reception') {
      const user = { username: 'Manager Saxena', role: 'Manager' as const };
      setCurrentUser(user);
      setActiveRole('Manager');
    } else if (u === 'admin') {
      const user = { username: 'Administrator', role: 'Manager' as const };
      setCurrentUser(user);
      setActiveRole('Manager');
    } else {
      setLoginError('Invalid credentials. Use kitchen, waiter, or manager.');
    }
  };

  // Staff Table Status Updates (Vacant / Ready / Occupied / Reserved / Cleaning)
  const updateTableStatus = (id: string, newStatus: string) => {
    setTables(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status: newStatus } : t);
      if (typeof window !== 'undefined') {
        const statusMap: Record<string, string> = {};
        updated.forEach(tbl => { statusMap[tbl.table_number] = tbl.status; });
        localStorage.setItem('wings_tables_status', JSON.stringify(statusMap));
        window.dispatchEvent(new Event('wings_db_sync'));
      }
      return updated;
    });
  };


  // Kitchen Order Status Flow
  const updateOrderStatus = (orderId: string, nextStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  // Resolve Call Request
  const resolveCall = (id: string) => {
    setCallRequests(prev => prev.filter(c => c.id !== id));
  };

  // Handle Walkin Registration
  const handleWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone) return;

    // Update selected table status to eating
    setTables(prev => prev.map(t => t.table_number === selectedWalkinTable ? { ...t, status: 'eating' } : t));
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
                placeholder="kitchen / waiter / manager"
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passcode</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* High Contrast Header Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
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
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveRole('Kitchen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRole === 'Kitchen' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            👨‍🍳 Kitchen Queue ({orders.filter(o => o.status !== 'completed').length})
          </button>
          <button
            onClick={() => setActiveRole('Waiter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRole === 'Waiter' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            💁 Waiter Floor Map
          </button>
          <button
            onClick={() => setActiveRole('Manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRole === 'Manager' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            📊 Manager Dashboard
          </button>
        </div>

        <button
          onClick={() => setCurrentUser(null)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Staff Container */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* ========================================================================= */}
        {/* ROLE 1: KITCHEN PWA (3 SCREENS / VIEWS) */}
        {/* ========================================================================= */}
        {activeRole === 'Kitchen' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Kitchen Display Order Queue</h2>
                <p className="text-xs text-slate-500">Big-button 1-tap progression for chefs</p>
              </div>
              <div className="text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg">
                Live Kitchen Sync • {orders.length} Total Orders
              </div>
            </div>

            {/* 3-Column Order Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* COLUMN 1: NEW ORDERS */}
              <div className="bg-slate-200/70 p-4 rounded-2xl border border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-red-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2" /> New Orders
                  </h3>
                  <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
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
                        <span className="text-xs text-slate-400 font-mono">{order.time}</span>
                      </div>

                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm font-bold text-slate-800">
                            <span>{item.quantity}x {item.name}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase rounded-xl shadow-md transition"
                      >
                        Start Preparing ➔
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMN 2: PREPARING */}
              <div className="bg-slate-200/70 p-4 rounded-2xl border border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-amber-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2" /> Cooking in Progress
                  </h3>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
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
                        <span className="text-xs text-slate-400 font-mono">{order.time}</span>
                      </div>

                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm font-bold text-slate-800">
                            <span>{item.quantity}x {item.name}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm uppercase rounded-xl shadow-md transition"
                      >
                        Mark Ready to Serve ➔
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMN 3: READY / COMPLETED */}
              <div className="bg-slate-200/70 p-4 rounded-2xl border border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-emerald-700 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" /> Ready for Waiter Pickup
                  </h3>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
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

                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase rounded-xl shadow-md transition"
                      >
                        Complete Order ✓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 2: WAITER PWA (6 SCREENS / VIEWS) */}
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

                <div className="flex space-x-2">
                  {callRequests.map(c => (
                    <button
                      key={c.id}
                      onClick={() => resolveCall(c.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Clear Table {c.table_number} ({c.type}) ✓
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Floor Map Table Status Grid */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Waiter Floor Map & Table Control</h3>
                  <p className="text-xs text-slate-500">Tap table status button to update live floor map</p>
                </div>

                {/* Status Legend */}
                <div className="flex items-center space-x-3 text-xs font-bold">
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1" /> Free</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-500 mr-1" /> Eating</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1" /> Cleaning Needed</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-1" /> Reserved</span>
                </div>
              </div>

              {/* Table Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {tables.map(t => {
                  let statusBg = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                  if (t.status === 'eating') statusBg = 'bg-amber-50 border-amber-300 text-amber-800';
                  if (t.status === 'needs_cleaning') statusBg = 'bg-red-50 border-red-300 text-red-800';
                  if (t.status === 'reserved') statusBg = 'bg-blue-50 border-blue-300 text-blue-800';

                  return (
                    <div key={t.id} className={`p-4 rounded-xl border-2 shadow-sm space-y-3 ${statusBg}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-black">{t.table_number}</h4>
                          <span className="text-[10px] uppercase font-bold opacity-80 block">{t.cluster}</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded uppercase bg-white/70">
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Waiter One-Tap Action Buttons */}
                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/60 text-[10px] font-bold">
                        <button
                          onClick={() => updateTableStatus(t.id, 'eating')}
                          className="py-1.5 bg-amber-500 text-slate-950 rounded hover:bg-amber-400"
                        >
                          Check In
                        </button>
                        <button
                          onClick={() => updateTableStatus(t.id, 'needs_cleaning')}
                          className="py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Need Clean
                        </button>
                        <button
                          onClick={() => updateTableStatus(t.id, 'free')}
                          className="py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 col-span-2"
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
        {/* ROLE 3: MANAGER / RECEPTION PWA (8 SCREENS / VIEWS) */}
        {/* ========================================================================= */}
        {activeRole === 'Manager' && (
          <div className="space-y-6">
            {/* Manager Revenue & Occupancy Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Today's Revenue</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">₹34,850</h3>
                <span className="text-[10px] text-emerald-600 font-bold">+18% vs yesterday</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Current Floor Occupancy</span>
                <h3 className="text-2xl font-black text-amber-600 mt-1">68%</h3>
                <span className="text-[10px] text-slate-500">11 of 16 tables seated</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Today's Reservations</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">24 Bookings</h3>
                <span className="text-[10px] text-blue-600 font-bold">4 VIP Canopies Confirmed</span>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase">Walk-ins Today</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">14 Parties</h3>
                <span className="text-[10px] text-slate-500">Avg wait time 8 mins</span>
              </div>
            </div>

            {/* Reception Walk-in Quick Seating Form */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4">Walk-in Guest Quick Seating</h3>
              <form onSubmit={handleWalkin} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={walkinName}
                    onChange={e => setWalkinName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Table</label>
                  <select
                    value={selectedWalkinTable}
                    onChange={e => setSelectedWalkinTable(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    {tables.filter(t => t.status === 'free').map(t => (
                      <option key={t.id} value={t.table_number}>{t.table_number} ({t.cluster})</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Seat Guest & Mark Occupied
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
