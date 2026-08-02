'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Utensils, QrCode, CheckCircle2, Clock, Users, MapPin, Search, Plus, Minus,
  ShoppingBag, Bell, Receipt, ChefHat, AlertCircle, ArrowLeft, Download, Shield,
  Sparkles, Coffee, Flame, RefreshCw, X, ChevronRight, Phone, MessageSquare
} from 'lucide-react';
import {
  getStoredMenuItems, getStoredCategories, createDiningSession, closeDiningSession,
  saveOrder, saveCallRequest, MenuCategory, DiningSession
} from '@/lib/db';
import { MenuItem } from '@/models/MenuModel';
import { openRazorpayCheckout } from '@/lib/razorpay';

export default function TableLandingPage() {
  const params = useParams();
  const router = useRouter();
  const rawTableId = (params?.tableId as string || 'T1').toUpperCase();
  const tableId = rawTableId.startsWith('TABLE-') ? rawTableId.replace('TABLE-', '') : rawTableId;

  // ── States ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Landing, 2: Menu, 3: Tracker/Bill
  const [session, setSession] = useState<DiningSession | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);

  // Cart & Customizations
  const [cart, setCart] = useState<{
    id: string;
    item: MenuItem;
    quantity: number;
    customizations: string[];
    specialInstructions: string;
    itemTotal: number;
  }[]>([]);
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(null);
  const [customOpts, setCustomOpts] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  // Checkout & Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'none' | 'received' | 'accepted' | 'preparing' | 'ready' | 'served' | 'completed'>('none');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [callAlertSent, setCallAlertSent] = useState<string | null>(null);
  const [tableStatus, setTableStatus] = useState<'available' | 'occupied' | 'reserved' | 'cleaning'>('available');

  // Load Menu, Categories & Check Existing Session
  useEffect(() => {
    const initData = async () => {
      const [items, cats] = await Promise.all([
        getStoredMenuItems(),
        getStoredCategories()
      ]);
      setMenuItems(items.filter(i => i.is_available !== false));
      setCategories(cats);

      // Check local session
      if (typeof window !== 'undefined') {
        const existingRaw = localStorage.getItem(`wings_dining_session_${tableId}`);
        if (existingRaw) {
          try {
            const parsed: DiningSession = JSON.parse(existingRaw);
            if (parsed && parsed.status === 'active') {
              setSession(parsed);
              setStep(2);
            }
          } catch (e) {}
        }
      }
    };
    initData();
  }, [tableId]);

  // ── Step 1 ➔ Step 2: Establish Dining Session ─────────────────────────────
  const handleConfirmTable = async () => {
    setIsSubmitting(true);
    const newSession = await createDiningSession(tableId, customerName || 'Valued Guest', customerPhone);
    setSession(newSession);
    setTableStatus('occupied');
    setIsSubmitting(false);
    setStep(2);
  };

  // ── Add Item to Cart with Customizations ─────────────────────────────────
  const handleAddToCart = (item: MenuItem) => {
    setSelectedFoodItem(item);
    setCustomOpts([]);
    setInstructions('');
  };

  const confirmAddToCart = () => {
    if (!selectedFoodItem) return;
    const basePrice = selectedFoodItem.price || 0;
    const extraPrice = customOpts.includes('Extra Cheese (+₹40)') ? 40 : 0;
    const unitPrice = basePrice + extraPrice;

    setCart(prev => {
      const existingIdx = prev.findIndex(
        c => c.item.id === selectedFoodItem.id && JSON.stringify(c.customizations) === JSON.stringify(customOpts)
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        updated[existingIdx].itemTotal = updated[existingIdx].quantity * unitPrice;
        return updated;
      }
      return [
        ...prev,
        {
          id: `${selectedFoodItem.id}-${Date.now()}`,
          item: selectedFoodItem,
          quantity: 1,
          customizations: [...customOpts],
          specialInstructions: instructions,
          itemTotal: unitPrice
        }
      ];
    });
    setSelectedFoodItem(null);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(c => {
          if (c.id === id) {
            const newQty = c.quantity + delta;
            const unitPrice = c.itemTotal / c.quantity;
            return newQty > 0 ? { ...c, quantity: newQty, itemTotal: newQty * unitPrice } : null;
          }
          return c;
        })
        .filter(Boolean) as typeof cart
    );
  };

  // Calculations
  const subtotal = cart.reduce((sum, c) => sum + c.itemTotal, 0);
  const gstTax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gstTax;

  // ── Place Order & Checkout ───────────────────────────────────────────────
  const handlePlaceOrder = async (payMethod: 'online' | 'cash') => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const invoiceNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderPayload = {
      order_number: orderId,
      table_number: tableId,
      customer_name: customerName || session?.customer_name || 'Guest',
      customer_phone: customerPhone || session?.customer_phone || '',
      items: cart.map(c => ({
        menu_item_id: c.item.id,
        name: `${c.item.name}${c.customizations.length ? ` (${c.customizations.join(', ')})` : ''}`,
        quantity: c.quantity,
        price: c.item.price
      })),

      total_amount: grandTotal,
      notes: `Session: ${session?.id || 'N/A'} | Invoice: ${invoiceNum} | Pay: ${payMethod.toUpperCase()}`,
      payment_method: payMethod,
      payment_status: (payMethod === 'online' ? 'paid' : 'unpaid') as 'paid' | 'unpaid'
    };


    if (payMethod === 'online') {
      const launched = await openRazorpayCheckout({
        amount: grandTotal,
        description: `Wings River Cafe - Table ${tableId} Order ${orderId}`,
        prefill: { name: customerName, phone: customerPhone },
        onSuccess: async () => {
          await saveOrder(orderPayload);
          setActiveOrderId(orderId);
          setOrderStatus('received');
          setCart([]);
          setIsCheckoutOpen(false);
          setIsSubmitting(false);
          setStep(3);
        },
        onFailure: async () => {
          await saveOrder({ ...orderPayload, notes: `${orderPayload.notes} (Cash Fallback)` });
          setActiveOrderId(orderId);
          setOrderStatus('received');
          setCart([]);
          setIsCheckoutOpen(false);
          setIsSubmitting(false);
          setStep(3);
        }
      });

      if (!launched) {
        await saveOrder(orderPayload);
        setActiveOrderId(orderId);
        setOrderStatus('received');
        setCart([]);
        setIsCheckoutOpen(false);
        setIsSubmitting(false);
        setStep(3);
      }
    } else {
      await saveOrder(orderPayload);
      setActiveOrderId(orderId);
      setOrderStatus('received');
      setCart([]);
      setIsCheckoutOpen(false);
      setIsSubmitting(false);
      setStep(3);
    }
  };

  // ── Quick Staff Service Calls ────────────────────────────────────────────
  const handleCallWaiter = (type: string) => {
    saveCallRequest({ table_number: tableId, type, time: 'Just now' });
    setCallAlertSent(type);
    setTimeout(() => setCallAlertSent(null), 3500);
  };

  // ── Request Bill & Download GST Invoice PDF ──────────────────────────────
  const handleRequestBill = async () => {
    handleCallWaiter('Request Final Bill & Payment');
    const invoiceContent = `
====================================================
               WINGS RIVER CAFÉ
     Laxman Mela Ground, Gomti Riverfront
                Lucknow, UP
====================================================
INVOICE NO: INV-${Date.now().toString().slice(-6)}
DATE: ${new Date().toLocaleString()}
TABLE: Table ${tableId}
GUEST: ${session?.customer_name || customerName || 'Valued Customer'}
PHONE: ${session?.customer_phone || customerPhone || 'N/A'}
----------------------------------------------------
TOTAL PAID: ₹${grandTotal} (Inc. 5% GST)
STATUS: PAID / BILL GENERATED
====================================================
 Thank you for dining with us at Wings River Café!
====================================================
`;
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wings-river-invoice-table-${tableId}.txt`;
    a.click();

    // Close Dining Session
    if (session) {
      await closeDiningSession(session.id, tableId);
    }
  };

  // Menu Filtering
  const filteredMenu = menuItems.filter(item => {
    const matchesCat =
      selectedCategory === 'all' ||
      (item.category || '').toLowerCase() === selectedCategory.toLowerCase() ||
      (item.category_id || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !isVegOnly || item.is_veg === true;
    return matchesCat && matchesSearch && matchesVeg;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#F5D061] selection:text-[#120B08] flex flex-col font-sans">

      {/* ── TOP APP BAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#120B08]/95 backdrop-blur-md border-b border-[#F5D061]/20 px-4 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#E5B82C] flex items-center justify-center text-[#120B08] font-black text-lg shadow-md">
            W
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#F8E7A1] tracking-tight">Wings River Café</h1>
            <p className="text-[10px] text-[#D4C4A0]/80 font-medium">Gomti Riverfront Deck · Lucknow</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#1F1810] border border-[#F5D061]/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-[#F5D061] tracking-wide">Table {tableId}</span>
          </div>
        </div>
      </header>

      {/* ── STEP 1: TABLE LANDING PAGE ─────────────────────────────────── */}
      {step === 1 && (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-6 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#F5D061] via-[#E5B82C] to-[#D4AF37] flex items-center justify-center text-[#120B08] shadow-[0_0_50px_rgba(245,208,97,0.35)] transform hover:scale-105 transition-transform duration-300">
            <Utensils className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5D061] bg-[#F5D061]/10 px-3 py-1 rounded-full border border-[#F5D061]/30">
              Smart QR Ordering System
            </span>
            <h2 className="text-2xl font-black text-[#F8E7A1] tracking-tight">Welcome to Wings River Café</h2>
            <p className="text-xs text-[#D4C4A0]/80 leading-relaxed">
              Scan established your table object. Confirm table session to browse our dynamic multicuisine menu and order food directly.
            </p>
          </div>

          {/* Table Details Card */}
          <div className="w-full bg-[#16100B] border border-[#F5D061]/30 rounded-2xl p-5 space-y-3.5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-[#D4C4A0]/70 font-semibold">Table Identifier</span>
              <span className="text-sm font-black text-[#F5D061] bg-[#120B08] px-2.5 py-0.5 rounded-lg border border-[#F5D061]/30">
                Table {tableId}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#D4C4A0]/70 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#F5D061]" /> Area Cluster</span>
              <span className="font-extrabold text-white">Gomti Waterfront Deck</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#D4C4A0]/70 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#F5D061]" /> Seating Capacity</span>
              <span className="font-extrabold text-white">2 – 6 Guests</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#D4C4A0]/70 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#F5D061]" /> Scan Time</span>
              <span className="font-medium text-[#F8E7A1]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
              <span className="text-[#D4C4A0]/70 font-semibold">Table Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Available
              </span>
            </div>
          </div>

          {/* Customer Input */}
          <div className="w-full space-y-3">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#D4C4A0]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F5D061]/50"
            />
            <input
              type="tel"
              placeholder="Phone Number for Live Updates (Optional)"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#D4C4A0]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F5D061]/50"
            />
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <button
              onClick={handleConfirmTable}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#120B08] font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_8px_30px_rgba(245,208,97,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Establishing Session…' : 'Confirm This Table & Open Menu ➔'}
            </button>
            <button
              onClick={() => router.push('/#floor-map')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-[#D4C4A0] text-xs font-bold rounded-xl transition"
            >
              Scan / Select Another Table
            </button>
          </div>
        </main>
      )}

      {/* ── STEP 2: DYNAMIC MENU INTERFACE ───────────────────────────────── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pb-28">

          {/* Navigation Bar */}
          <div className="sticky top-[61px] z-40 bg-[#0A0A0A]/95 backdrop-blur-md px-4 py-3 space-y-3 border-b border-white/10">
            {/* Search & Veg Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#D4C4A0]/50" />
                <input
                  type="text"
                  placeholder="Search dishes, drinks, mocktails…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/8 border border-white/10 text-white placeholder:text-[#D4C4A0]/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F5D061]/50"
                />
              </div>
              <button
                onClick={() => setIsVegOnly(!isVegOnly)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shrink-0 ${
                  isVegOnly
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-[#D4C4A0]/70'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Veg
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 transition ${
                  selectedCategory === 'all'
                    ? 'bg-[#F5D061] text-[#120B08] shadow-md'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id || c.slug}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 transition ${
                    selectedCategory === c.name
                      ? 'bg-[#F5D061] text-[#120B08] shadow-md'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Staff Alert Notification */}
          {callAlertSent && (
            <div className="mx-4 mt-3 bg-amber-500/20 border border-amber-500/50 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between animate-bounce">
              <span>🔔 Request &apos;{callAlertSent}&apos; sent to floor waiter!</span>
              <X className="w-4 h-4 cursor-pointer" onClick={() => setCallAlertSent(null)} />
            </div>
          )}

          {/* Food Grid */}
          <div className="p-4 space-y-3">
            {filteredMenu.length === 0 ? (
              <div className="py-16 text-center text-[#D4C4A0]/60 space-y-2">
                <Utensils className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-semibold">No items match your selected category or filter.</p>
              </div>
            ) : (
              filteredMenu.map(item => (
                <div
                  key={item.id}
                  className="bg-[#140E0A] border border-white/10 hover:border-[#F5D061]/40 rounded-2xl p-3.5 flex gap-3.5 items-center shadow-lg transition"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                      🍽️
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.is_veg !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <h3 className="text-sm font-extrabold text-[#F8E7A1] truncate">{item.name}</h3>
                      {item.is_bestseller && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#D4C4A0]/70 line-clamp-2 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-[#F5D061]">₹{item.price}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="px-3.5 py-1.5 bg-[#F5D061] text-[#120B08] font-black text-xs rounded-xl hover:bg-[#E5B82C] active:scale-95 transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── ITEM CUSTOMIZATION MODAL ─────────────────────────────────────── */}
      {selectedFoodItem && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#140E0A] border border-[#F5D061]/30 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold text-[#F5D061] uppercase tracking-wider">Customize Dish</span>
                <h3 className="text-lg font-black text-[#F8E7A1]">{selectedFoodItem.name}</h3>
                <p className="text-xs text-[#F5D061] font-bold">₹{selectedFoodItem.price}</p>
              </div>
              <button onClick={() => setSelectedFoodItem(null)} className="p-1 rounded-lg bg-white/10 text-white/70">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#D4C4A0]">Customization Add-ons</label>
              {[
                'Extra Cheese (+₹40)',
                'Extra Sauce (+₹20)',
                'Less Spicy 🌶️',
                'Extra Spicy 🌶️🌶️',
                'No Onion / No Garlic 🧄',
              ].map(opt => (
                <label key={opt} className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl text-xs text-[#D4C4A0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customOpts.includes(opt)}
                    onChange={e => {
                      if (e.target.checked) setCustomOpts([...customOpts, opt]);
                      else setCustomOpts(customOpts.filter(c => c !== opt));
                    }}
                    className="accent-[#F5D061] w-4 h-4"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#D4C4A0]">Special Instructions for Chef</label>
              <textarea
                rows={2}
                placeholder="E.g. Make it extra crispy, serve with extra dips..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>

            <button
              onClick={confirmAddToCart}
              className="w-full py-3 bg-[#F5D061] text-[#120B08] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md"
            >
              Add Item to Order ➔
            </button>
          </div>
        </div>
      )}

      {/* ── BOTTOM FLOATING CART BAR ─────────────────────────────────────── */}
      {step === 2 && cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-[150] bg-[#120B08]/95 border-t border-[#F5D061]/30 p-4 backdrop-blur-lg">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-[#D4C4A0]/80 font-bold uppercase">Cart ({cart.reduce((a, b) => a + b.quantity, 0)} Items)</p>
              <p className="text-lg font-black text-[#F8E7A1]">₹{grandTotal} <span className="text-[10px] font-normal text-[#D4C4A0]/60">(Inc. GST)</span></p>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition"
            >
              <ShoppingBag className="w-4 h-4" /> View Cart &amp; Checkout ➔
            </button>
          </div>
        </div>
      )}

      {/* ── CHECKOUT MODAL ────────────────────────────────────────────────── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#140E0A] border border-[#F5D061]/30 rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-[#F8E7A1]">Review Order &amp; Checkout</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1 text-white/70"><X className="w-5 h-5" /></button>
            </div>

            {/* Items summary */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {cart.map(c => (
                <div key={c.id} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-white truncate">{c.item.name}</p>
                    {c.customizations.length > 0 && (
                      <p className="text-[10px] text-[#F5D061]">{c.customizations.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQty(c.id, -1)} className="w-6 h-6 rounded bg-white/10 text-white font-bold">-</button>
                    <span className="font-bold text-xs">{c.quantity}</span>
                    <button onClick={() => updateCartQty(c.id, 1)} className="w-6 h-6 rounded bg-white/10 text-white font-bold">+</button>
                    <span className="font-black text-[#F5D061] w-12 text-right">₹{c.itemTotal}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="bg-[#1F1810] p-3.5 rounded-xl space-y-1.5 text-xs text-[#D4C4A0]">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-white font-bold">₹{subtotal}</span></div>
              <div className="flex justify-between"><span>GST Taxes (5%)</span><span className="text-white font-bold">₹{gstTax}</span></div>
              <div className="flex justify-between pt-1 border-t border-white/10 text-sm font-black text-[#F5D061]">
                <span>Grand Total</span><span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handlePlaceOrder('online')}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#120B08] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                💳 Pay Online via Razorpay / UPI
              </button>
              <button
                onClick={() => handlePlaceOrder('cash')}
                disabled={isSubmitting}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl"
              >
                💵 Pay Cash / Pay at Venue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: REAL-TIME TRACKER & QUICK ACTIONS ───────────────────── */}
      {step === 3 && (
        <main className="flex-1 max-w-md mx-auto w-full p-5 space-y-5 animate-fade-in">
          <div className="bg-[#16100B] border border-emerald-500/40 rounded-2xl p-5 text-center space-y-3 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h2 className="text-xl font-black text-[#F8E7A1]">Order Sent to Kitchen!</h2>
            <p className="text-xs text-[#D4C4A0]/80">Order #{activeOrderId} is directly registered on Staff KDS Terminal.</p>
          </div>

          {/* Tracker Progression */}
          <div className="bg-[#140E0A] border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-[#F5D061] uppercase tracking-wider">Real-time Order Tracker</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
              {['Received', 'Preparing', 'Ready', 'Served'].map((st, idx) => (
                <div key={st} className={`p-2 rounded-xl border ${idx <= 1 ? 'bg-[#F5D061]/20 border-[#F5D061] text-[#F5D061]' : 'bg-white/5 border-white/10 text-white/40'}`}>
                  {st}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold text-[#D4C4A0] uppercase tracking-wider">Quick Table Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setStep(2)}
                className="p-3 bg-white/5 border border-white/10 hover:border-[#F5D061]/40 rounded-xl text-xs font-bold text-[#F8E7A1] flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#F5D061]" /> Order More Food
              </button>
              <button
                onClick={() => handleCallWaiter('Water Refill')}
                className="p-3 bg-white/5 border border-white/10 hover:border-[#F5D061]/40 rounded-xl text-xs font-bold text-[#F8E7A1] flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-[#F5D061]" /> Need Water
              </button>
              <button
                onClick={() => handleCallWaiter('Call Waiter')}
                className="p-3 bg-white/5 border border-white/10 hover:border-[#F5D061]/40 rounded-xl text-xs font-bold text-[#F8E7A1] flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#F5D061]" /> Call Waiter
              </button>
              <button
                onClick={handleRequestBill}
                className="p-3 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] font-black rounded-xl text-xs flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" /> Request Bill &amp; Invoice
              </button>
            </div>
          </div>
        </main>
      )}

    </div>
  );
}
