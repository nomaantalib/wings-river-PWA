'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, QrCode, Utensils, ShoppingBag, Bell, Receipt, CheckCircle, ChefHat,
  Camera, CameraOff, Loader2, Plus, Minus, AlertCircle, Zap, Scan
} from 'lucide-react';
import { getStoredMenuItems, getStoredCategories, saveOrder, saveCallRequest } from '@/controllers/StorageController';
import { MenuItem, MenuCategory } from '@/models/MenuModel';
import { openRazorpayCheckout } from '@/lib/razorpay';


interface QROrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: string;
}

// ── Dynamically load jsQR from CDN ─────────────────────────────────────────
let jsQRLib: any = null;
async function getJsQR() {
  if (jsQRLib) return jsQRLib;
  await new Promise<void>((resolve, reject) => {
    if ((window as any).jsQR) { jsQRLib = (window as any).jsQR; resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    s.onload = () => { jsQRLib = (window as any).jsQR; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return jsQRLib;
}

// ── Parse Wings River table QR codes ───────────────────────────────────────
function parseTableFromQR(data: string): string | null {
  // Format: WINGS-RIVER-CAFE|TABLE-T5  OR  table=T5  OR  /order?table=T5  OR just "T5"
  const patterns = [
    /TABLE-([A-Z0-9]+)/i,
    /[?&]table=([A-Z0-9]+)/i,
    /^(T\d+|V\d+)$/i,
    /Wings[_\s-]?River.*?([TV]\d+)/i,
  ];
  for (const p of patterns) {
    const m = data.match(p);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

export default function QROrderModal({ isOpen, onClose, tableNumber: initTable = '' }: QROrderModalProps) {
  // ── Core state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<'scan' | 'order'>(initTable ? 'order' : 'scan');
  const [tableNumber, setTableNumber] = useState(initTable || '');
  const [manualTable, setManualTable] = useState('');
  const [activeTab, setActiveTab] = useState<'menu' | 'status' | 'bill'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [orderStatus, setOrderStatus] = useState<'none' | 'new' | 'preparing' | 'ready' | 'served'>('none');
  const [callAlertSent, setCallAlertSent] = useState<string | null>(null);

  // ── Camera / QR Scanner state ────────────────────────────────────────────
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── Load menu items & admin categories ──────────────────────────────────
  useEffect(() => {
    const fetchMenuData = async () => {
      const [items, cats] = await Promise.all([
        getStoredMenuItems(),
        getStoredCategories()
      ]);
      setMenuItems(items.filter(i => i.is_available !== false));
      setCategories(cats);
    };
    if (isOpen) fetchMenuData();
    window.addEventListener('wings_db_sync', fetchMenuData);
    return () => window.removeEventListener('wings_db_sync', fetchMenuData);
  }, [isOpen]);


  // ── Reset on open ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) { stopCamera(); return; }
    if (initTable) { setTableNumber(initTable); setPhase('order'); }
    else { setPhase('scan'); }
  }, [isOpen, initTable]);

  // ── Camera QR Scanning ───────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError('');
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      scanFrame();
    } catch (err: any) {
      setCameraError(err?.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera permission and try again.'
        : 'Camera not available. Enter table number manually below.');
      setScanning(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraActive(false);
    setScanning(false);
  }, []);

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      const jsQR = await getJsQR();
      if (jsQR) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          const parsed = parseTableFromQR(code.data);
          if (parsed) {
            stopCamera();
            setScanSuccess(`Table ${parsed} detected!`);
            setTableNumber(parsed);
            setTimeout(() => { setScanSuccess(''); setPhase('order'); }, 1200);
            return;
          }
        }
      }
    } catch {}

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  // ── Cart helpers ─────────────────────────────────────────────────────────
  const addToCart = (item: { id: string; name: string; price: number }) =>
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      return ex ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...item, quantity: 1 }];
    });

  const removeFromCart = (id: string) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmount = Math.round(cartTotal * 0.05);
  const totalBill = cartTotal + gstAmount;

  const handlePlaceOrder = async (method: 'online' | 'cash') => {
    if (!cart.length) return;
    const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wings_user_session') || '{}') : {};
    const orderPayload = {
      table_number: tableNumber,
      customer_name: session.name || 'Valued Guest',
      customer_phone: session.phone || '',
      total_amount: totalBill,
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      status: 'new' as const,
    };

    if (method === 'online') {
      try {
        const launched = await openRazorpayCheckout({
          amount: totalBill,
          name: 'Wings River Café – Table Order',
          description: `Food Order · Table ${tableNumber} · ${cartCount} items`,
          customerName: session.name || 'Guest',
          customerPhone: session.phone || '',
          onSuccess: async (paymentId) => {
            await saveOrder({ ...orderPayload, payment_status: 'paid', payment_method: 'Razorpay', razorpay_payment_id: paymentId });
            setOrderStatus('new'); setActiveTab('status');
          },
          onFailure: async () => {
            // Save as Cash at Table fallback so order is sent to kitchen
            await saveOrder({ ...orderPayload, payment_status: 'unpaid', payment_method: 'Cash at Table' });
            setOrderStatus('new'); setActiveTab('status');
          },
        });
        if (!launched) {
          await saveOrder({ ...orderPayload, payment_status: 'unpaid', payment_method: 'Cash at Table' });
          setOrderStatus('new'); setActiveTab('status');
        }
      } catch {
        await saveOrder({ ...orderPayload, payment_status: 'unpaid', payment_method: 'Cash at Table' });
        setOrderStatus('new'); setActiveTab('status');
      }
    } else {
      await saveOrder({ ...orderPayload, payment_status: 'unpaid', payment_method: 'Cash at Table' });
      setOrderStatus('new'); setActiveTab('status');
    }

  };

  const handleCallRequest = (type: string) => {
    saveCallRequest({ table_number: tableNumber, type, time: 'Just now' });
    setCallAlertSent(type);
    setTimeout(() => setCallAlertSent(null), 3000);
  };

  if (!isOpen) return null;

  const categoryFilteredMenu = menuItems.filter(item => {
    if (selectedCategory === 'all') return true;
    const catName = (item.category || '').toLowerCase();
    const catId = (item.category_id || '').toLowerCase();
    const sel = selectedCategory.toLowerCase();
    return catName === sel || catId === sel || catName.includes(sel);
  });

  const filteredMenu = menuSearch
    ? categoryFilteredMenu.filter(i => i.name.toLowerCase().includes(menuSearch.toLowerCase()) || (i.category || '').toLowerCase().includes(menuSearch.toLowerCase()))
    : categoryFilteredMenu;

  // Group by category
  const grouped = filteredMenu.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category || item.category_id || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});


  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg sm:max-w-xl bg-[#0E0E0E] border border-[#F5D061]/25 sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[95svh] sm:max-h-[90vh]">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="bg-[#120B08] border-b border-[#F5D061]/20 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5D061]/15 border border-[#F5D061]/30 flex items-center justify-center text-[#F5D061]">
              {phase === 'scan' ? <Scan className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#F8E7A1]">
                {phase === 'scan' ? 'Scan Table QR' : `Table ${tableNumber} – Order Food`}
              </h3>
              <p className="text-[10px] text-[#D4C4A0]/70">Wings River Café · Direct Table Service</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {phase === 'order' && (
              <button
                onClick={() => { stopCamera(); setPhase('scan'); setScanSuccess(''); }}
                className="px-2.5 py-1 rounded-full bg-[#F5D061]/10 border border-[#F5D061]/30 text-[#F5D061] text-[10px] font-bold hover:bg-[#F5D061]/20 transition flex items-center gap-1"
              >
                <QrCode className="w-3 h-3" /> Change Table
              </button>
            )}
            <button onClick={() => { onClose(); stopCamera(); }} className="p-1.5 text-[#D4C4A0] hover:text-white rounded-lg hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── PHASE: QR SCANNER ─────────────────────────────── */}
        {phase === 'scan' && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">

              {/* Scanner Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-xs mx-auto border-2 border-[#F5D061]/40 shadow-xl shadow-[#F5D061]/10">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    {/* Scan frame overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-40 relative">
                        <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#F5D061] rounded-tl-lg" />
                        <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#F5D061] rounded-tr-lg" />
                        <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#F5D061] rounded-bl-lg" />
                        <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#F5D061] rounded-br-lg" />
                        {/* Scanning line */}
                        <div className="absolute inset-x-1 h-0.5 bg-[#F5D061]/70 top-1/2 animate-pulse" />
                      </div>
                    </div>
                    {/* Top tip */}
                    <div className="absolute top-2 inset-x-0 text-center">
                      <span className="bg-black/70 text-[#F5D061] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Point at table QR code
                      </span>
                    </div>
                    {/* Stop button */}
                    <button
                      onClick={stopCamera}
                      className="absolute bottom-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition"
                    >
                      <CameraOff className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
                    {scanSuccess ? (
                      <>
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                        <p className="text-emerald-300 font-bold text-sm">{scanSuccess}</p>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-14 h-14 text-[#F5D061]/40" />
                        <p className="text-[#D4C4A0] text-xs text-center">
                          {cameraError || 'Tap below to start camera and scan your table QR'}
                        </p>
                        {cameraError && (
                          <p className="text-[10px] text-rose-400 text-center">{cameraError}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Scan Button */}
              {!cameraActive && !scanSuccess && (
                <button
                  onClick={startCamera}
                  disabled={scanning}
                  className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] font-extrabold text-sm rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition disabled:opacity-60"
                >
                  {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {scanning ? 'Starting Camera…' : '📷 Scan Table QR Code'}
                </button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 max-w-xs mx-auto">
                <hr className="flex-1 border-white/10" />
                <span className="text-[10px] text-[#D4C4A0]/60 font-semibold uppercase tracking-widest">or enter manually</span>
                <hr className="flex-1 border-white/10" />
              </div>

              {/* Manual Table Entry & Table Object Confirmation */}
              <div className="max-w-xs mx-auto space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#F8E7A1]">Select Table Number</label>
                  <select
                    value={manualTable}
                    onChange={e => {
                      setManualTable(e.target.value);
                      if (e.target.value) setTableNumber(e.target.value);
                    }}
                    className="w-full px-3.5 py-3 rounded-xl bg-white/10 border border-[#F5D061]/40 text-[#F8E7A1] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#F5D061]/50"
                  >
                    <option value="">Select Your Table Number…</option>
                    {['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','V1','V2','V3'].map(t => (
                      <option key={t} value={t} className="bg-[#120B08]">Table {t} — Gomti Riverfront Deck</option>
                    ))}
                  </select>
                </div>

                {manualTable && (
                  <div className="bg-[#1F1810] border border-[#F5D061]/40 rounded-2xl p-4 space-y-3 text-center shadow-lg">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <h4 className="text-base font-extrabold text-[#F8E7A1]">Table {manualTable} Confirmed</h4>
                    </div>
                    <p className="text-[11px] text-[#D4C4A0]/80 leading-relaxed">
                      Laxman Mela Ground · Wings River Café Gomti Waterfront
                    </p>
                    <button
                      onClick={() => {
                        setTableNumber(manualTable);
                        setPhase('order');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] hover:from-[#F8E7A1] hover:to-[#F5D061] text-[#120B08] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition hover:scale-[1.02] active:scale-95"
                    >
                      Confirm Table &amp; Open Menu ➔
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── PHASE: ORDER INTERFACE ────────────────────────── */}
        {phase === 'order' && (
          <>
            {/* Tab Bar */}
            <div className="flex border-b border-white/10 bg-[#0A0A0A] shrink-0">
              {([
                { key: 'menu', icon: <Utensils className="w-3.5 h-3.5" />, label: `Menu ${cartCount > 0 ? `(${cartCount})` : ''}` },
                { key: 'status', icon: <ChefHat className="w-3.5 h-3.5" />, label: 'Tracker' },
                { key: 'bill', icon: <Receipt className="w-3.5 h-3.5" />, label: 'Bill' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${
                    activeTab === tab.key
                      ? 'border-[#F5D061] text-[#F5D061]'
                      : 'border-transparent text-[#D4C4A0]/60 hover:text-[#D4C4A0]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

              {/* ── MENU TAB ───────────────────────────────── */}
              {activeTab === 'menu' && (
                <div className="p-4 space-y-4">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="🔍 Search dishes, mocktails, desserts…"
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/8 border border-white/10 text-[#F8E7A1] text-xs font-medium placeholder:text-[#D4C4A0]/40 focus:outline-none focus:ring-2 focus:ring-[#F5D061]/30"
                  />

                  {/* Horizontal Scrollable Category Filter Pills (Managed via Admin Panel) */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] shadow-md'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      All Items ({menuItems.length})
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id || c.slug}
                        onClick={() => setSelectedCategory(c.name)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
                          selectedCategory === c.name
                            ? 'bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] shadow-md'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>


                  {/* Menu Items by Category */}
                  {Object.keys(grouped).length === 0 ? (
                    <div className="py-10 text-center text-[#D4C4A0]/60 text-sm">
                      <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No menu items found</p>
                    </div>
                  ) : Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat}>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#F5D061] mb-2 border-b border-[#F5D061]/20 pb-1">{cat}</p>
                      <div className="space-y-2">
                        {items.map(item => {
                          const cartItem = cart.find(i => i.id === item.id);
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between px-3 py-2.5 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-[#F5D061]/30 rounded-xl transition"
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Veg/Non-veg indicator */}
                                  <span className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center shrink-0 ${item.is_veg ? 'border-emerald-500' : 'border-rose-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  </span>
                                  <span className="text-xs font-bold text-white/90 truncate">{item.name}</span>
                                  {item.is_bestseller && (
                                    <span className="text-[9px] bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/30 px-1.5 py-0.5 rounded font-bold shrink-0">🔥 Best</span>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-[#F5D061] mt-0.5 block">₹{item.price}</span>
                              </div>

                              {cartItem ? (
                                <div className="flex items-center gap-1 bg-[#F5D061]/15 border border-[#F5D061]/40 rounded-lg px-1.5 py-1 shrink-0">
                                  <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 text-[#F5D061] font-black text-base leading-none flex items-center justify-center hover:text-white transition">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-extrabold text-[#F8E7A1] min-w-[16px] text-center">{cartItem.quantity}</span>
                                  <button onClick={() => addToCart(item)} className="w-5 h-5 text-[#F5D061] font-black text-base leading-none flex items-center justify-center hover:text-white transition">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(item)}
                                  className="shrink-0 px-3 py-1.5 text-[10px] font-extrabold bg-[#F5D061]/10 hover:bg-[#F5D061] hover:text-[#120B08] text-[#F5D061] rounded-lg border border-[#F5D061]/30 transition"
                                >
                                  + ADD
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── ORDER TRACKER ─────────────────────────── */}
              {activeTab === 'status' && (
                <div className="p-5 space-y-5">
                  {orderStatus === 'none' ? (
                    <div className="py-12 text-center text-[#D4C4A0]/60">
                      <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-semibold">No active order for Table {tableNumber}</p>
                      <button onClick={() => setActiveTab('menu')} className="mt-4 px-5 py-2 bg-[#F5D061] text-[#120B08] font-extrabold text-xs rounded-xl">
                        Browse Menu & Order
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <span className="inline-flex items-center gap-2 bg-[#F5D061]/10 border border-[#F5D061]/30 px-3 py-1 rounded-full text-xs text-[#F5D061] font-mono font-bold">
                          <Zap className="w-3 h-3" /> Order Received · Table {tableNumber}
                        </span>
                      </div>

                      {/* Progress Steps */}
                      <div className="flex items-center justify-between max-w-xs mx-auto relative py-2">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
                        {[
                          { label: 'Received', icon: CheckCircle, active: true },
                          { label: 'Cooking', icon: ChefHat, active: orderStatus === 'preparing' || orderStatus === 'ready' },
                          { label: 'Served', icon: Utensils, active: orderStatus === 'ready' || orderStatus === 'served' },
                        ].map((step, i) => (
                          <div key={i} className="flex flex-col items-center relative z-10 gap-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[#120B08] shadow-lg transition-all ${step.active ? 'bg-[#F5D061] shadow-[#F5D061]/40' : 'bg-white/10 text-white/30'}`}>
                              <step.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-bold ${step.active ? 'text-[#F5D061]' : 'text-white/30'}`}>{step.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Order items */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-1">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#D4C4A0]/60 mb-2">Your Order</h5>
                        {cart.map(i => (
                          <div key={i.id} className="flex justify-between text-xs py-1 border-b border-white/5">
                            <span className="text-white/80">{i.quantity}× {i.name}</span>
                            <span className="font-mono text-[#F5D061] font-bold">₹{i.price * i.quantity}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold text-[#F8E7A1] pt-2">
                          <span>Total (incl. GST)</span>
                          <span>₹{totalBill}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── BILL + CALL WAITER ────────────────────── */}
              {activeTab === 'bill' && (
                <div className="p-5 space-y-5">
                  {/* Call Waiter */}
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#F5D061] mb-3">Call Table Staff</h4>
                    {callAlertSent && (
                      <div className="mb-3 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        Staff notified: <strong>{callAlertSent}</strong> at Table {tableNumber}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {['💧 Water Request', '🍴 Spoon / Tissue', '🙋 Call Waiter', '🧾 Request Bill'].map(label => (
                        <button
                          key={label}
                          onClick={() => handleCallRequest(label.replace(/^[^\s]+\s/, ''))}
                          className="p-3 bg-white/5 border border-white/10 hover:border-[#F5D061]/40 hover:bg-[#F5D061]/5 rounded-xl text-xs text-white/80 hover:text-[#F5D061] transition font-semibold"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bill Summary */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#F5D061] mb-2">Bill · Table {tableNumber}</h4>
                    {cart.length === 0 ? (
                      <p className="text-xs text-white/40 text-center py-3">No items ordered yet</p>
                    ) : (
                      <>
                        {cart.map(i => (
                          <div key={i.id} className="flex justify-between text-xs text-white/70">
                            <span>{i.quantity}× {i.name}</span>
                            <span className="font-mono">₹{i.price * i.quantity}</span>
                          </div>
                        ))}
                        <div className="border-t border-white/10 mt-2 pt-2 space-y-1 text-xs text-white/60">
                          <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                          <div className="flex justify-between"><span>GST (5%)</span><span>₹{gstAmount}</span></div>
                          <div className="flex justify-between font-extrabold text-sm text-[#F8E7A1] pt-1 border-t border-white/10">
                            <span>Total Payable</span><span>₹{totalBill}</span>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!totalBill) return;
                            await openRazorpayCheckout({
                              amount: totalBill,
                              name: `Wings River Café – Table ${tableNumber} Bill`,
                              description: `Bill Settlement Table ${tableNumber}`,
                              customerName: 'Guest',
                              customerPhone: '07310008020',
                              onSuccess: (pid) => alert(`✅ Paid! Ref: ${pid}`),
                            });
                          }}
                          className="w-full mt-3 py-3 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition"
                        >
                          <Receipt className="w-4 h-4" />
                          Pay ₹{totalBill} Online via Razorpay
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sticky Checkout Bar (Menu tab only) ──────── */}
            {activeTab === 'menu' && cart.length > 0 && (
              <div className="shrink-0 border-t border-white/10 bg-[#120B08] px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-[#D4C4A0]/70">{cartCount} items · incl. 5% GST</p>
                  <p className="text-base font-extrabold text-[#F8E7A1]">₹{totalBill}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlaceOrder('cash')}
                    className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs rounded-xl transition"
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => handlePlaceOrder('online')}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Pay & Order
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
