'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, Utensils, ShoppingBag, Bell, Receipt, CheckCircle, Clock, ChefHat, Zap } from 'lucide-react';
import StorageController, { getStoredMenuItems } from '@/controllers/StorageController';
import { MenuItem } from '@/models/MenuModel';

interface QROrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: string;
}

export default function QROrderModal({ isOpen, onClose, tableNumber = 'T4' }: QROrderModalProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'status' | 'bill'>('menu');
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [orderStatus, setOrderStatus] = useState<'none' | 'new' | 'preparing' | 'ready' | 'served'>('none');
  const [callAlertSent, setCallAlertSent] = useState<string | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const items = await getStoredMenuItems();
      setMenuItems(items);
    };
    fetchMenu();
    window.addEventListener('wings_db_sync', fetchMenu);
    return () => window.removeEventListener('wings_db_sync', fetchMenu);
  }, []);

  if (!isOpen) return null;

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = Math.round(cartTotal * 0.05);
  const totalBill = cartTotal + gstAmount;

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setOrderStatus('new');
    setActiveTab('status');

    // Simulate real-time order progression (New -> Preparing -> Ready)
    setTimeout(() => setOrderStatus('preparing'), 4000);
    setTimeout(() => setOrderStatus('ready'), 10000);
  };

  const handleCallRequest = (type: string) => {
    setCallAlertSent(type);
    setTimeout(() => setCallAlertSent(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-dark-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="bg-dark-950 p-5 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-serif font-bold text-amber-200">Table QR Ordering</h3>
                <span className="text-xs font-mono font-bold bg-amber-500 text-dark-950 px-2 py-0.5 rounded">
                  Table {tableNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">Wings River Café • Direct Table Menu & Service</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-dark-800 bg-dark-950/50 px-4">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
              activeTab === 'menu'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Digital Menu ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
              activeTab === 'status'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Order Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('bill')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition ${
              activeTab === 'bill'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Bill & Call Waiter</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: MENU & CART BUILDER */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-amber-400 tracking-wider uppercase">Select Items for Table {tableNumber}</h4>
              <div className="grid grid-cols-1 gap-3">
                {menuItems.map((item) => {
                  const cartItem = cart.find((i) => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-dark-950 border border-dark-800 rounded-xl hover:border-amber-500/30 transition"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full border border-emerald-500 p-0.5 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                          <span className="text-sm font-bold text-slate-100">{item.name}</span>
                          {item.is_bestseller && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                              Bestseller
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-amber-400 mt-1 block">₹{item.price}</span>
                      </div>

                      {cartItem ? (
                        <div className="flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 rounded-lg px-2 py-1">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-5 h-5 text-amber-300 font-bold hover:text-white"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-amber-200 px-1">{cartItem.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-5 h-5 text-amber-300 font-bold hover:text-white"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-3 py-1.5 text-xs font-bold bg-dark-800 hover:bg-amber-500 hover:text-dark-950 text-amber-300 rounded-lg border border-amber-500/30 transition"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Checkout Bar */}
              {cart.length > 0 && (
                <div className="mt-6 pt-4 border-t border-dark-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Total ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    <span className="text-lg font-bold text-amber-300">₹{totalBill} <span className="text-[10px] text-slate-400 font-normal">(incl. 5% GST)</span></span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-dark-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Send Order to Kitchen</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE ORDER TRACKER */}
          {activeTab === 'status' && (
            <div className="space-y-6 text-center py-4">
              {orderStatus === 'none' ? (
                <div className="py-8 text-slate-400 text-sm">
                  <ChefHat className="w-12 h-12 mx-auto text-dark-700 mb-3" />
                  <p>No active order placed for Table {tableNumber} yet.</p>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="mt-4 px-4 py-2 bg-amber-500 text-dark-950 font-bold text-xs rounded-xl"
                  >
                    Browse Menu & Order
                  </button>
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300 font-mono">
                    <span>Order #ORD-101 • Table {tableNumber}</span>
                  </div>


                  {/* Progress Timeline */}
                  <div className="flex items-center justify-between max-w-sm mx-auto my-6 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-dark-800 -translate-y-1/2 -z-0" />

                    {/* Step 1: Placed */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-dark-950 flex items-center justify-center font-bold text-xs shadow-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 mt-2">Received</span>
                    </div>

                    {/* Step 2: Preparing */}
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${
                          orderStatus === 'preparing' || orderStatus === 'ready' || orderStatus === 'served'
                            ? 'bg-amber-500 text-dark-950 animate-pulse'
                            : 'bg-dark-800 text-slate-500'
                        }`}
                      >
                        <ChefHat className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 mt-2">Preparing</span>
                    </div>

                    {/* Step 3: Ready */}
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${
                          orderStatus === 'ready' || orderStatus === 'served'
                            ? 'bg-emerald-400 text-dark-950'
                            : 'bg-dark-800 text-slate-500'
                        }`}
                      >
                        <Utensils className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 mt-2">Ready</span>
                    </div>
                  </div>

                  <div className="bg-dark-950 p-4 rounded-xl border border-dark-800 text-left max-w-sm mx-auto">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Items</h5>
                    {cart.map((i) => (
                      <div key={i.id} className="flex justify-between text-xs py-1 border-b border-dark-800/50">
                        <span className="text-slate-200">{i.quantity}x {i.name}</span>
                        <span className="font-mono text-amber-400">₹{i.price * i.quantity}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: BILL & CALL WAITER */}
          {activeTab === 'bill' && (
            <div className="space-y-6">
              {/* Call Waiter Alerts */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Call Table Staff</h4>
                {callAlertSent && (
                  <div className="mb-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Staff notified for <strong>{callAlertSent}</strong> at Table {tableNumber}!</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCallRequest('Drinking Water')}
                    className="p-3 bg-dark-950 border border-dark-800 hover:border-amber-500/40 rounded-xl text-xs text-slate-200 hover:text-amber-300 flex items-center space-x-2 transition"
                  >
                    <span>💧 Water Request</span>
                  </button>
                  <button
                    onClick={() => handleCallRequest('Spoon & Tissue')}
                    className="p-3 bg-dark-950 border border-dark-800 hover:border-amber-500/40 rounded-xl text-xs text-slate-200 hover:text-amber-300 flex items-center space-x-2 transition"
                  >
                    <span>🍴 Spoon / Tissue</span>
                  </button>
                  <button
                    onClick={() => handleCallRequest('Call Waiter')}
                    className="p-3 bg-dark-950 border border-dark-800 hover:border-amber-500/40 rounded-xl text-xs text-slate-200 hover:text-amber-300 flex items-center space-x-2 transition"
                  >
                    <span>🙋 Call Waiter</span>
                  </button>
                  <button
                    onClick={() => handleCallRequest('Print Final Bill')}
                    className="p-3 bg-dark-950 border border-dark-800 hover:border-amber-500/40 rounded-xl text-xs text-slate-200 hover:text-amber-300 flex items-center space-x-2 transition"
                  >
                    <span>🧾 Request Bill</span>
                  </button>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-800">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Itemized Bill • Table {tableNumber}</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (5%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-amber-300 pt-2 border-t border-dark-800 mt-2">
                    <span>Total Amount Payable</span>
                    <span>₹{totalBill}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dark-800">
                  <button
                    onClick={async () => {
                      if (totalBill === 0) return alert('Your cart is empty');
                      const { openRazorpayCheckout } = await import('@/lib/razorpay');
                      await openRazorpayCheckout({
                        amount: totalBill,
                        name: `Wings River Café • Table ${tableNumber} Bill`,
                        description: `Food Bill Settlement for Table ${tableNumber}`,
                        customerName: `Guest Table ${tableNumber}`,
                        customerPhone: '07310008020',
                        onSuccess: (paymentId) => {
                          alert(`Payment Successful! Payment ID: ${paymentId}. Your bill has been marked PAID.`);
                        }
                      });
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-dark-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Pay ₹{totalBill} Online via Razorpay (Test Key)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
