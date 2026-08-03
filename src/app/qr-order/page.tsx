'use client';

import React, { useState } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import SearchBar from '@/components/SearchBar';
import { QrCode, UtensilsCrossed, ShoppingCart, Flame, Leaf, Award, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { saveOrder } from '@/lib/db';
import { notifyOrderPlaced } from '@/lib/pushNotifications';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];

const MENU = [
  { id: 1, cat: 'Starters', name: 'Paneer Tikka',          price: 280, veg: true,  rating: 4.8 },
  { id: 2, cat: 'Starters', name: 'Chicken Seekh Kebab',   price: 340, veg: false, rating: 4.7 },
  { id: 3, cat: 'Mains',    name: 'Mutton Rogan Josh',      price: 480, veg: false, rating: 4.9 },
  { id: 4, cat: 'Mains',    name: 'Dal Makhani',            price: 220, veg: true,  rating: 4.6 },
  { id: 5, cat: 'Mains',    name: 'Riverside Fish Curry',   price: 420, veg: false, rating: 4.8 },
  { id: 6, cat: 'Desserts', name: 'Gulab Jamun Sundae',     price: 180, veg: true,  rating: 4.7 },
  { id: 7, cat: 'Drinks',   name: 'Mango Lassi',            price: 120, veg: true,  rating: 4.8 },
  { id: 8, cat: 'Drinks',   name: 'Gomti Sunset Mocktail',  price: 160, veg: true,  rating: 4.9 },
];

export default function QROrderPage() {
  const [tableNo, setTableNo] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [ordered, setOrdered] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartTotal = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartValue = MENU.reduce((acc, item) => acc + (cart[item.id] || 0) * item.price, 0);

  const filtered = MENU.filter(i => {
    const matchCat = category === 'All' || i.cat === category;
    const matchQ   = !query || i.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const addItem  = (id: number) => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const removeItem = (id: number) => setCart(p => {
    const n = { ...p };
    if (n[id] > 1) n[id]--; else delete n[id];
    return n;
  });

  const handlePlaceOrder = async () => {
    if (cartTotal === 0 || !tableNo) return;
    setIsSubmitting(true);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const orderItems = Object.entries(cart).map(([idStr, qty]) => {
      const item = MENU.find(m => m.id === Number(idStr));
      return {
        menu_item_id: String(idStr),
        name: item?.name || 'Dish',
        quantity: qty,
        price: item?.price || 0,
      };
    });

    try {
      await saveOrder({
        order_number: orderId,
        table_number: tableNo,
        customer_name: 'Dine-In Guest',
        items: orderItems,
        total_amount: cartValue,
        notes: 'QR Code Dine-In Order',
        payment_method: 'cash',
        payment_status: 'unpaid',
      });
      await notifyOrderPlaced({ table: tableNo, total: cartValue });
      setActiveOrderId(orderId);
      setOrdered(true);
    } catch (e) {
      console.error('Error placing order:', e);
      setActiveOrderId(orderId);
      setOrdered(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tableNo) {
    return (
      <CustomerLayout breadcrumbs={[{ label: 'QR Order' }]}>
        <div className="max-w-sm mx-auto px-4 py-16 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
            <QrCode className="w-12 h-12 text-gold-400/80" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold font-serif text-white mb-2">Scan Table QR</h1>
          <p className="text-sm text-white/50 mb-8 leading-relaxed">
            Scan the QR code on your table to start ordering, or select your table number below.
          </p>
          <div className="w-full mb-3">
            <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">Or select table manually</p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 15 }, (_, i) => `T${i + 1}`).map(t => (
                <button
                  key={t}
                  onClick={() => setTableNo(t)}
                  className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold hover:border-gold-500/60 hover:text-gold-400 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (ordered) {
    return (
      <CustomerLayout breadcrumbs={[{ label: 'QR Order' }]}>
        <div className="max-w-md mx-auto px-4 py-14 flex flex-col items-center text-center space-y-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl scale-150" />
            <div className="relative w-24 h-24 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-white mb-1">Order Sent to Kitchen!</h2>
            <p className="text-sm text-white/60">Your order #{activeOrderId} for Table <span className="text-gold-400 font-bold">{tableNo}</span> is being prepared.</p>
            <p className="text-xs text-white/40 mt-1">Estimated preparation time: ~15-20 mins</p>
          </div>

          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-3">
            <h3 className="text-xs font-bold text-gold-400 uppercase tracking-wider">Live Status Tracker</h3>
            <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
              {['Received', 'Preparing', 'Ready', 'Served'].map((st, idx) => (
                <div key={st} className={`py-2 px-1 rounded-lg border ${idx <= 1 ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                  {st}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex gap-3">
            <a
              href={`/table/${tableNo}`}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-lg shadow-amber-500/30"
            >
              Open Interactive Table View <ChevronRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => { setCart({}); setOrdered(false); }}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Order More
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout breadcrumbs={[{ label: 'QR Order' }]} cartCount={cartTotal}>
      <div className="max-w-lg mx-auto px-4 pb-32">
        {/* Table badge */}
        <div className="pt-5 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-serif text-white">Dine-In Order</h1>
            <p className="text-sm text-white/50">Table <span className="text-gold-400 font-bold">{tableNo}</span></p>
          </div>
          <button
            onClick={() => { setTableNo(null); setCart({}); }}
            className="text-xs text-white/40 hover:text-white/70 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/25 transition-all"
          >
            Change Table
          </button>
        </div>

        {/* Search */}
        <SearchBar value={query} onChange={setQuery} placeholder="Search dishes…" className="mb-4" />

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all
                ${category === cat
                  ? 'bg-gold-500 text-slate-950 border-gold-500 shadow-md shadow-amber-500/25'
                  : 'bg-white/5 border-white/10 text-white/65 hover:border-white/30'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-4 transition-all">
              {/* Thumb */}
              <div className="w-16 h-16 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-7 h-7 text-white/20" strokeWidth={1} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                  <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 ${item.veg ? 'border-emerald-500' : 'border-rose-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gold-400 font-bold text-sm">₹{item.price}</span>
                  <span className="flex items-center gap-0.5 text-[11px] text-white/40">
                    <Award className="w-3.5 h-3.5 text-amber-400" />{item.rating}
                  </span>
                </div>
              </div>
              {/* Cart controls */}
              {cart[item.id] ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-all">−</button>
                  <span className="text-sm font-bold text-gold-400 min-w-[18px] text-center">{cart[item.id]}</span>
                  <button onClick={() => addItem(item.id)} className="w-8 h-8 rounded-full bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold flex items-center justify-center transition-all">+</button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(item.id)}
                  className="shrink-0 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-full transition-all active:scale-95"
                >
                  Add
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Place Order Strip */}
      {cartTotal > 0 && (
        <div className="fixed bottom-[68px] lg:bottom-6 inset-x-0 flex justify-center px-4 z-40 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold text-sm px-5 py-3.5 rounded-2xl shadow-2xl shadow-amber-500/40 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartTotal} item{cartTotal > 1 ? 's' : ''} · ₹{cartValue}
            </span>
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="flex items-center gap-1 bg-slate-950/20 px-3 py-1.5 rounded-lg hover:bg-slate-950/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Placing…' : 'Place Order'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

