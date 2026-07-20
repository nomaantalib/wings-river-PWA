'use client';

import React, { useState, useEffect } from 'react';
import {
  getStoredReservations, updateReservationStatus, deleteReservation,
  getStoredMenuItems, saveMenuItem, updateMenuItem, deleteMenuItem,
  getStoredBlogs, saveBlog, updateBlog, deleteBlog,
  getStoredGalleryItems, saveGalleryItem, updateGalleryItem, deleteGalleryItem,
  getStoredReviews, deleteReview,
  getStoredContactMessages, deleteContactMessage,
  getStoredEventBanners, saveEventBanner, updateEventBanner, deleteEventBanner, toggleEventBanner,
  getStoredWaterSports, saveWaterSports, updateWaterSports, deleteWaterSports,
  getStoredMenuPages, saveMenuPage, updateMenuPage, deleteMenuPage,
  Reservation, MenuItem, BlogPost, GalleryItem, Review, ContactMessage, EventBanner,
  RideTicket, MenuPageDefinition,
} from '@/lib/db';
import ImageUploader from '@/components/ImageUploader';
import {
  Lock, Utensils, Calendar, FileText, Star, Mail, Plus, Trash2, Edit3,
  Image as ImageIcon, CheckCircle, Clock, XCircle, LogOut, ShieldAlert,
  Megaphone, ToggleLeft, ToggleRight, X, Save, Eye, EyeOff, Waves, BookOpen
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type TabKey = 'events' | 'bookings' | 'gallery' | 'menu' | 'menupages' | 'rides' | 'blogs' | 'reviews' | 'contact';

// ─── SHARED STYLE ATOMS ───────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2.5 text-xs bg-dark-950/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all';
const labelCls = 'block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1';
const cardCls = 'bg-dark-900/70 backdrop-blur-sm border border-white/8 rounded-2xl';
const btnPrimary = 'flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs shadow-md transition-all hover:scale-105';
const btnDanger  = 'p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition-all';
const btnEdit    = 'p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white transition-all';

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[300] bg-dark-950/90 backdrop-blur-xl flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-dark-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl my-8 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xl text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── CONFIRM DELETE ───────────────────────────────────────────────────────────
function ConfirmDelete({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[400] bg-dark-950/90 flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-white text-base">Delete {label}?</h4>
          <p className="text-xs text-gray-400 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl transition-colors">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('events');

  // Data
  const [banners, setBanners]     = useState<EventBanner[]>([]);
  const [bookings, setBookings]   = useState<Reservation[]>([]);
  const [gallery, setGallery]     = useState<GalleryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuPages, setMenuPages] = useState<MenuPageDefinition[]>([]);
  const [rides, setRides]         = useState<RideTicket[]>([]);
  const [blogs, setBlogs]         = useState<BlogPost[]>([]);
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [messages, setMessages]   = useState<ContactMessage[]>([]);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ label: string; fn: () => void } | null>(null);

  // Modal open state
  const [modal, setModal] = useState<
    | { type: 'add-banner' }
    | { type: 'edit-banner'; item: EventBanner }
    | { type: 'add-gallery' }
    | { type: 'edit-gallery'; item: GalleryItem }
    | { type: 'add-menu' }
    | { type: 'edit-menu'; item: MenuItem }
    | { type: 'edit-menupage'; item: MenuPageDefinition }
    | { type: 'add-ride' }
    | { type: 'edit-ride'; item: RideTicket }
    | { type: 'add-blog' }
    | { type: 'edit-blog'; item: BlogPost }
    | null
  >(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('wings_admin_auth') === 'true') { setIsAuthenticated(true); loadAll(); }
  }, []);
  const loadAll = () => {
    setBanners(getStoredEventBanners());
    setBookings(getStoredReservations());
    setGallery(getStoredGalleryItems());
    setMenuItems(getStoredMenuItems());
    setMenuPages(getStoredMenuPages());
    setRides(getStoredWaterSports());
    setBlogs(getStoredBlogs());
    setReviews(getStoredReviews());
    setMessages(getStoredContactMessages());
  };
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'wingsriver@2026' || passwordInput === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('wings_admin_auth', 'true');
      setErrorMsg('');
      loadAll();
    } else { setErrorMsg('Invalid password. Use: wingsriver@2026'); }
  };
  const handleLogout = () => { setIsAuthenticated(false); localStorage.removeItem('wings_admin_auth'); };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading Wings River CMS...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(circle at 50% 0%, #1a0e0200 0%, #0a0604 70%)' }}>
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <img src="/logo.png" alt="Wings River Café" className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-amber-400/40 shadow-2xl" />
            <div>
              <h1 className="font-serif font-extrabold text-3xl text-white">Wings River CMS</h1>
              <p className="text-xs text-amber-400 font-semibold tracking-widest uppercase mt-1">Admin Content Management</p>
            </div>
          </div>

          <div className="bg-dark-900/70 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelCls}>Admin Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter admin password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className={inputCls + ' pr-10'}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">Default: <code className="text-amber-400">wingsriver@2026</code></p>
              </div>
              <button type="submit"
                className="w-full py-3.5 font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.02] text-dark-950"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #16a34a)' }}>
                <Lock className="w-4 h-4 inline mr-2" />Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  MAIN DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'events'   as TabKey, label: 'Event Banners', icon: Megaphone,   count: banners.length   },
    { id: 'bookings' as TabKey, label: 'Bookings',      icon: Calendar,    count: bookings.length  },
    { id: 'gallery'  as TabKey, label: 'Gallery',       icon: ImageIcon,   count: gallery.length   },
    { id: 'menu'     as TabKey, label: 'Food Menu',     icon: Utensils,    count: menuItems.length },
    { id: 'menupages' as TabKey, label: 'Menu Pages',   icon: BookOpen,    count: menuPages.length },
    { id: 'rides'    as TabKey, label: 'Water Sports',  icon: Waves,       count: rides.length     },
    { id: 'blogs'    as TabKey, label: 'Blog Posts',    icon: FileText,    count: blogs.length     },
    { id: 'reviews'  as TabKey, label: 'Reviews',       icon: Star,        count: reviews.length   },
    { id: 'contact'  as TabKey, label: 'Messages',      icon: Mail,        count: messages.length  },
  ];

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: '#0a0604' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(10,6,4,0.95)', backdropFilter: 'blur(24px)' }}>
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-amber-400/40 shadow-lg" />
          <div>
            <h1 className="font-serif font-bold text-base text-white leading-tight">Wings River CMS</h1>
            <p className="text-[9px] text-amber-400 font-semibold uppercase tracking-widest">Full Content Management</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 border border-white/10 transition-colors">
          <LogOut className="w-3.5 h-3.5" /><span>Logout</span>
        </button>
      </header>

      {/* Tab Nav */}
      <nav className="border-b border-white/10 overflow-x-auto no-scrollbar"
        style={{ background: 'rgba(15,10,6,0.8)' }}>
        <div className="flex items-center px-4 sm:px-6 space-x-1 py-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-dark-950 shadow-md shadow-amber-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeTab === tab.id ? 'bg-dark-950/30 text-dark-950' : 'bg-white/10 text-gray-300'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {/* ═══ EVENT BANNERS TAB ═══════════════════════════════════════════ */}
        {activeTab === 'events' && (
          <TabSection title="Event Banners" subtitle="Add promotional banners displayed across the site homepage."
            action={<button className={btnPrimary} onClick={() => setModal({ type: 'add-banner' })}><Plus className="w-4 h-4" /><span>Add Banner</span></button>}>
            <div className="space-y-4">
              {banners.map(banner => (
                <div key={banner.id} className={`${cardCls} overflow-hidden`}>
                  <div className="flex flex-col sm:flex-row items-stretch">
                    {/* Image */}
                    <div className="sm:w-48 h-32 sm:h-auto shrink-0 bg-dark-950 overflow-hidden">
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    </div>
                    {/* Details */}
                    <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${banner.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                            {banner.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-white text-base">{banner.title}</h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{banner.subtitle}</p>
                        <p className="text-[10px] text-amber-400 font-semibold mt-1">CTA: {banner.cta_text} → {banner.cta_link}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => { setBanners(toggleEventBanner(banner.id)); }} title={banner.is_active ? 'Hide Banner' : 'Show Banner'}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${banner.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500 hover:text-white'}`}>
                          {banner.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          <span>{banner.is_active ? 'Active' : 'Hidden'}</span>
                        </button>
                        <button className={btnEdit} onClick={() => setModal({ type: 'edit-banner', item: banner })} title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Banner', fn: () => { setBanners(deleteEventBanner(banner.id)); setDeleteTarget(null); } })} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && <EmptyState icon={Megaphone} message="No event banners yet. Add your first promotional banner!" />}
            </div>
          </TabSection>
        )}

        {/* ═══ BOOKINGS TAB ════════════════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <TabSection title="Reservations & Bookings" subtitle="Manage table, event, and water sports token reservations.">
            <div className={`${cardCls} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="text-gray-500 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>{['Guest', 'Phone', 'Type', 'Date & Time', 'Guests', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">{b.name}</td>
                        <td className="px-4 py-3 text-amber-400 font-medium">{b.phone}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-black uppercase border border-amber-500/20">{b.booking_type?.replace(/_/g, ' ')}</span></td>
                        <td className="px-4 py-3 text-gray-300">{b.date} · {b.time}</td>
                        <td className="px-4 py-3 text-gray-300">{b.guests} pax</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${b.status === 'confirmed' ? 'bg-green-500/15 text-green-400 border-green-500/25' : b.status === 'completed' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' : 'bg-rose-500/15 text-rose-400 border-rose-500/25'}`}>{b.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            <button onClick={() => setBookings(updateReservationStatus(b.id, 'confirmed') as any)} title="Confirm" className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all"><CheckCircle className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setBookings(updateReservationStatus(b.id, 'completed') as any)} title="Complete" className="p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"><Clock className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setBookings(updateReservationStatus(b.id, 'cancelled') as any)} title="Cancel" className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"><XCircle className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteTarget({ label: 'Reservation', fn: () => { setBookings(deleteReservation(b.id)); setDeleteTarget(null); } })} title="Delete" className={btnDanger}><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bookings.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No bookings yet.</div>}
              </div>
            </div>
          </TabSection>
        )}

        {/* ═══ GALLERY TAB ═════════════════════════════════════════════════ */}
        {activeTab === 'gallery' && (
          <TabSection title="Image Gallery" subtitle="Add, edit, and delete venue photos for the auto-slideshow gallery."
            action={<button className={btnPrimary} onClick={() => setModal({ type: 'add-gallery' })}><Plus className="w-4 h-4" /><span>Add Photo</span></button>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map(item => (
                <div key={item.id} className={`${cardCls} overflow-hidden group`}>
                  <div className="relative h-44 bg-dark-950">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-dark-950/85 text-amber-400 text-[9px] font-black uppercase border border-amber-400/25">{item.category}</span>
                    {item.featured && <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-dark-950 text-[9px] font-black">⭐ Featured</span>}
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white truncate pr-2 flex-1">{item.title}</h4>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button className={btnEdit} onClick={() => setModal({ type: 'edit-gallery', item })} title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Gallery Photo', fn: () => { setGallery(deleteGalleryItem(item.id)); setDeleteTarget(null); } })} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {gallery.length === 0 && <EmptyState icon={ImageIcon} message="No gallery photos yet." />}
            </div>
          </TabSection>
        )}

        {/* ═══ MENU TAB ════════════════════════════════════════════════════ */}
        {activeTab === 'menu' && (
          <TabSection title="Food & Café Menu" subtitle="Manage menu items displayed in the admin-controlled menu section."
            action={<button className={btnPrimary} onClick={() => setModal({ type: 'add-menu' })}><Plus className="w-4 h-4" /><span>Add Dish</span></button>}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <div key={item.id} className={`${cardCls} flex items-center space-x-4 p-4 group hover:border-amber-400/30 transition-all`}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-950 shrink-0">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">{item.category}</span>
                    <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs font-bold text-green-400">₹{item.price}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${item.is_veg ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>{item.is_veg ? 'Veg' : 'Non-Veg'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5 shrink-0">
                    <button className={btnEdit} onClick={() => setModal({ type: 'edit-menu', item })} title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Menu Item', fn: () => { setMenuItems(deleteMenuItem(item.id)); setDeleteTarget(null); } })} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && <EmptyState icon={Utensils} message="No menu items yet." />}
            </div>
          </TabSection>
        )}

        {/* ═══ MENU PAGES TAB ═══════════════════════════════════════════════ */}
        {activeTab === 'menupages' && (
          <TabSection title="Interactive Booklet Pages" subtitle="Modify booklet page sheets, titles, and categories list.">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuPages.map(page => (
                <div key={page.pageNumber} className={`${cardCls} overflow-hidden group`}>
                  <div className="relative h-48 bg-cream-50 p-2 flex items-center justify-center">
                    <img src={page.image} alt={page.title} className="max-h-full object-contain" />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-dark-950/80 text-amber-400 text-[10px] font-black uppercase">Page 0{page.pageNumber}</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-serif font-bold text-white text-sm truncate">{page.title}</h4>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{page.subtitle}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {page.categories.map(c => <span key={c} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 text-[8px] font-semibold">{c}</span>)}
                    </div>
                    <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                      <button className={`${btnEdit} flex-1 py-2 font-bold text-xs justify-center flex items-center space-x-1`}
                        onClick={() => setModal({ type: 'edit-menupage', item: page })}>
                        <Edit3 className="w-3.5 h-3.5" /><span>Edit Page Sheet</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabSection>
        )}

        {/* ═══ WATER SPORTS TAB ════════════════════════════════════════════ */}
        {activeTab === 'rides' && (
          <TabSection title="Water Sports Rides & Activities" subtitle="Manage Lucknow Water Sports speedboats, jet skis, and kids amusement rides."
            action={<button className={btnPrimary} onClick={() => setModal({ type: 'add-ride' })}><Plus className="w-4 h-4" /><span>Add Ride</span></button>}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rides.map(ride => (
                <div key={ride.id} className={`${cardCls} flex items-stretch p-4 space-x-4 group hover:border-amber-400/30 transition-all`}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-950 shrink-0">
                    <img src={ride.image} alt={ride.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base">{ride.emoji}</span>
                        <h4 className="font-bold text-white text-sm truncate">{ride.name}</h4>
                      </div>
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider block mt-0.5">{ride.category}</span>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{ride.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-green-400">₹{ride.price} <span className="text-[9px] font-medium text-gray-500">/ {ride.unit}</span></span>
                      {ride.badge && <span className="px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 text-[8px] font-black uppercase">{ride.badge}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between shrink-0 pl-2">
                    <button className={btnEdit} onClick={() => setModal({ type: 'edit-ride', item: ride })} title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Ride', fn: () => { setRides(deleteWaterSports(ride.id)); setDeleteTarget(null); } })} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {rides.length === 0 && <EmptyState icon={Waves} message="No water sports rides yet. Add your first speedboat or jetski ride!" />}
            </div>
          </TabSection>
        )}

        {/* ═══ BLOGS TAB ═══════════════════════════════════════════════════ */}
        {activeTab === 'blogs' && (
          <TabSection title="Blog Articles" subtitle="Publish and manage blog stories shown on the website."
            action={<button className={btnPrimary} onClick={() => setModal({ type: 'add-blog' })}><Plus className="w-4 h-4" /><span>New Post</span></button>}>
            <div className="space-y-4">
              {blogs.map(blog => (
                <div key={blog.id} className={`${cardCls} flex flex-col sm:flex-row items-stretch overflow-hidden group hover:border-amber-400/30 transition-all`}>
                  <div className="sm:w-40 h-32 sm:h-auto shrink-0 bg-dark-950 overflow-hidden">
                    <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-black uppercase border border-amber-500/20">{blog.category}</span>
                        <span className="text-[10px] text-gray-500">{blog.created_at} · {blog.read_time}</span>
                      </div>
                      <h4 className="font-serif font-bold text-white text-base leading-snug">{blog.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{blog.excerpt}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <button className={`${btnEdit} flex items-center space-x-1`} onClick={() => setModal({ type: 'edit-blog', item: blog })}><Edit3 className="w-3.5 h-3.5" /><span className="text-xs font-bold">Edit</span></button>
                      <button className={`${btnDanger} flex items-center space-x-1`} onClick={() => setDeleteTarget({ label: 'Blog Post', fn: () => { setBlogs(deleteBlog(blog.id)); setDeleteTarget(null); } })}><Trash2 className="w-3.5 h-3.5" /><span className="text-xs font-bold">Delete</span></button>
                    </div>
                  </div>
                </div>
              ))}
              {blogs.length === 0 && <EmptyState icon={FileText} message="No blog posts yet." />}
            </div>
          </TabSection>
        )}

        {/* ═══ REVIEWS TAB ═════════════════════════════════════════════════ */}
        {activeTab === 'reviews' && (
          <TabSection title="Guest Reviews" subtitle="View and moderate customer reviews.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(rev => (
                <div key={rev.id} className={`${cardCls} p-5 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm">{rev.author_name?.charAt(0)}</div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{rev.author_name}</h4>
                        <span className="text-[10px] text-gray-500">{rev.date_str}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-400 text-sm font-black">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                      <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Review', fn: () => { setReviews(deleteReview(rev.id)); setDeleteTarget(null); } })}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 italic leading-relaxed border-l-2 border-amber-400/30 pl-3">"{rev.review_text}"</p>
                </div>
              ))}
              {reviews.length === 0 && <EmptyState icon={Star} message="No reviews yet." />}
            </div>
          </TabSection>
        )}

        {/* ═══ CONTACT TAB ═════════════════════════════════════════════════ */}
        {activeTab === 'contact' && (
          <TabSection title="Contact Messages" subtitle="Inquiries received from the contact form.">
            <div className="space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`${cardCls} p-5 flex items-start justify-between space-x-4`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-white text-sm">{m.name}</h4>
                      <span className="text-amber-400 text-xs font-medium">{m.phone}</span>
                      <span className="text-[10px] text-gray-500 ml-auto">{m.created_at}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{m.message}</p>
                  </div>
                  <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Message', fn: () => { setMessages(deleteContactMessage(m.id)); setDeleteTarget(null); } })}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {messages.length === 0 && <EmptyState icon={Mail} message="No contact messages yet." />}
            </div>
          </TabSection>
        )}
      </div>

      {/* ═══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Add / Edit Event Banner */}
      {(modal?.type === 'add-banner' || modal?.type === 'edit-banner') && (
        <BannerModal
          initial={modal.type === 'edit-banner' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={banner => {
            if (modal.type === 'edit-banner') { setBanners(updateEventBanner(banner)); }
            else { setBanners(saveEventBanner(banner)); }
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Gallery */}
      {(modal?.type === 'add-gallery' || modal?.type === 'edit-gallery') && (
        <GalleryModal
          initial={modal.type === 'edit-gallery' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={item => {
            if (modal.type === 'edit-gallery') { setGallery(updateGalleryItem(item)); }
            else { setGallery(saveGalleryItem(item)); }
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Menu Item */}
      {(modal?.type === 'add-menu' || modal?.type === 'edit-menu') && (
        <MenuModal
          initial={modal.type === 'edit-menu' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={item => {
            if (modal.type === 'edit-menu') { updateMenuItem(item); }
            else { saveMenuItem(item); }
            setMenuItems(getStoredMenuItems());
            setModal(null);
          }}
        />
      )}

      {/* Edit Menu Booklet Page */}
      {modal?.type === 'edit-menupage' && (
        <MenuPageModal
          initial={modal.item}
          onClose={() => setModal(null)}
          onSave={page => {
            setMenuPages(updateMenuPage(page));
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Water Sports Ride */}
      {(modal?.type === 'add-ride' || modal?.type === 'edit-ride') && (
        <RideModal
          initial={modal.type === 'edit-ride' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={ride => {
            if (modal.type === 'edit-ride') { setRides(updateWaterSports(ride)); }
            else { setRides(saveWaterSports(ride)); }
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Blog */}
      {(modal?.type === 'add-blog' || modal?.type === 'edit-blog') && (
        <BlogModal
          initial={modal.type === 'edit-blog' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={blog => {
            if (modal.type === 'edit-blog') { updateBlog(blog); }
            else { saveBlog(blog); }
            setBlogs(getStoredBlogs());
            setModal(null);
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDelete
          label={deleteTarget.label}
          onConfirm={deleteTarget.fn}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function TabSection({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="col-span-full text-center py-16 space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-gray-500" />
      </div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  BANNER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function BannerModal({ initial, onClose, onSave }: { initial?: EventBanner; onClose: () => void; onSave: (b: EventBanner) => void }) {
  const [form, setForm] = useState<EventBanner>(initial ?? {
    id: 'eb-' + Date.now(),
    title: '', subtitle: '', image_url: '', cta_text: 'Reserve Now', cta_link: '#booking', is_active: true, created_at: new Date().toISOString(),
  });
  const set = (k: keyof EventBanner, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={initial ? 'Edit Event Banner' : 'Add Event Banner'} onClose={onClose}>
      <div className="space-y-4">
        <div><label className={labelCls}>Banner Title</label><input className={inputCls} placeholder="e.g. 🎉 Weekend Riverside Fiesta!" value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div><label className={labelCls}>Subtitle / Description</label><textarea className={inputCls} rows={2} placeholder="Short description of the event..." value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></div>
        <ImageUploader label="Banner Image" value={form.image_url} onChange={v => set('image_url', v)} previewHeight="h-40" />
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>CTA Button Text</label><input className={inputCls} placeholder="Reserve Now" value={form.cta_text} onChange={e => set('cta_text', e.target.value)} /></div>
          <div><label className={labelCls}>CTA Link</label><input className={inputCls} placeholder="#booking or https://..." value={form.cta_link} onChange={e => set('cta_link', e.target.value)} /></div>
        </div>
        <div className="flex items-center space-x-3">
          <input type="checkbox" id="banner-active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <label htmlFor="banner-active" className="text-xs text-gray-300 font-medium">Active (visible on site)</label>
        </div>
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Save Banner</span></button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  GALLERY MODAL
// ─────────────────────────────────────────────────────────────────────────────
function GalleryModal({ initial, onClose, onSave }: { initial?: GalleryItem; onClose: () => void; onSave: (g: GalleryItem) => void }) {
  const [form, setForm] = useState<GalleryItem>(initial ?? { id: 'gal-' + Date.now(), title: '', category: 'Restaurant', image_url: '', featured: false });
  const set = (k: keyof GalleryItem, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={initial ? 'Edit Gallery Photo' : 'Add Gallery Photo'} onClose={onClose}>
      <div className="space-y-4">
        <ImageUploader label="Photo (upload from device or use URL)" value={form.image_url} onChange={v => set('image_url', v)} previewHeight="h-48" maxSizeMB={8} />
        <div><label className={labelCls}>Photo Title</label><input className={inputCls} placeholder="e.g. Sunset Riverfront Deck" value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div><label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
            {['Restaurant', 'River View', 'Evening', 'Outdoor Seating', 'Water Sports', 'Food'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-3">
          <input type="checkbox" id="gallery-featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-amber-500" />
          <label htmlFor="gallery-featured" className="text-xs text-gray-300 font-medium">⭐ Featured (shown first in carousel)</label>
        </div>
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Save Photo</span></button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MENU ITEM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function MenuModal({ initial, onClose, onSave }: { initial?: MenuItem; onClose: () => void; onSave: (m: MenuItem) => void }) {
  const [form, setForm] = useState<MenuItem>(initial ?? {
    id: 'm-' + Date.now(), name: '', category: 'Starter', description: '', price: 0, is_veg: true, image_url: '', is_available: true, page_number: 1
  });
  const set = (k: keyof MenuItem, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={initial ? 'Edit Menu Item' : 'Add Menu Item'} onClose={onClose}>
      <div className="space-y-4">
        <ImageUploader label="Dish Photo (upload or URL)" value={form.image_url} onChange={v => set('image_url', v)} previewHeight="h-40" />
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className={labelCls}>Dish Name</label><input className={inputCls} placeholder="e.g. Paneer Tikka Masala" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div><label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
              {['Starter', 'Indian', 'Chinese', 'Italian', 'Pizza', 'Burger', 'Coffee', 'Desserts', 'Drinks', 'Chaat', 'Breakfast', 'Shakes', 'Soup'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Price (₹)</label><input type="number" className={inputCls} placeholder="149" value={form.price || ''} onChange={e => set('price', Number(e.target.value))} /></div>
        </div>
        <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} placeholder="Short description of the dish..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="is-veg" checked={form.is_veg} onChange={e => set('is_veg', e.target.checked)} className="w-4 h-4 accent-green-500" />
            <label htmlFor="is-veg" className="text-xs text-gray-300 font-medium">🟢 Vegetarian</label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="is-avail" checked={form.is_available} onChange={e => set('is_available', e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <label htmlFor="is-avail" className="text-xs text-gray-300 font-medium">✅ Available</label>
          </div>
          <div className="flex items-center space-x-2 flex-1 min-w-[120px]">
            <label className="text-xs text-gray-400 font-bold uppercase whitespace-nowrap">Page Num:</label>
            <select className={inputCls + ' !py-1.5'} value={form.page_number} onChange={e => set('page_number', Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Page 0{n}</option>)}
            </select>
          </div>
        </div>
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Save Dish</span></button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  BLOG MODAL
// ─────────────────────────────────────────────────────────────────────────────
function BlogModal({ initial, onClose, onSave }: { initial?: BlogPost; onClose: () => void; onSave: (b: BlogPost) => void }) {
  const [form, setForm] = useState<BlogPost>(initial ?? {
    id: 'blog-' + Date.now(), title: '', slug: '', excerpt: '', content: '', category: 'Food & Dining', cover_image: '', author: 'Wings River Team', read_time: '3 min read', created_at: new Date().toISOString().split('T')[0]
  });
  const set = (k: keyof BlogPost, v: any) => setForm(f => ({ ...f, [k]: v }));
  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <Modal title={initial ? 'Edit Blog Post' : 'Publish Blog Post'} onClose={onClose}>
      <div className="space-y-4">
        <ImageUploader label="Cover Image (upload or URL)" value={form.cover_image} onChange={v => set('cover_image', v)} previewHeight="h-40" />
        <div>
          <label className={labelCls}>Article Title</label>
          <input className={inputCls} placeholder="e.g. Top 5 River Dining Experiences in Lucknow" value={form.title}
            onChange={e => { set('title', e.target.value); if (!initial) set('slug', autoSlug(e.target.value)); }} />
        </div>
        <div><label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
            {['Food & Dining', 'Riverside Experience', 'Events & Parties', 'Water Sports', 'Nightlife', 'Culinary Highlights', 'Travel & Lifestyle'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Excerpt (short summary)</label><textarea className={inputCls} rows={2} placeholder="A brief description shown in the blog card..." value={form.excerpt} onChange={e => set('excerpt', e.target.value)} /></div>
        <div><label className={labelCls}>Full Content</label><textarea className={inputCls} rows={5} placeholder="Write the full blog article here..." value={form.content} onChange={e => set('content', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Author</label><input className={inputCls} placeholder="Wings River Team" value={form.author} onChange={e => set('author', e.target.value)} /></div>
          <div><label className={labelCls}>Read Time</label><input className={inputCls} placeholder="4 min read" value={form.read_time} onChange={e => set('read_time', e.target.value)} /></div>
        </div>
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Publish Post</span></button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MENU BOOKLET PAGE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function MenuPageModal({ initial, onClose, onSave }: { initial: MenuPageDefinition; onClose: () => void; onSave: (p: MenuPageDefinition) => void }) {
  const [form, setForm] = useState<MenuPageDefinition>({ ...initial });
  const set = (k: keyof MenuPageDefinition, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={`Edit Booklet Page 0${form.pageNumber}`} onClose={onClose}>
      <div className="space-y-4">
        <ImageUploader label="Booklet Page Sheet (upload or URL)" value={form.image} onChange={v => set('image', v)} previewHeight="h-48" maxSizeMB={12} />
        <div><label className={labelCls}>Page Title</label><input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div><label className={labelCls}>Subtitle</label><input className={inputCls} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></div>
        <div>
          <label className={labelCls}>Categories (comma separated)</label>
          <input className={inputCls} value={form.categories.join(', ')} onChange={e => set('categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
        </div>
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Save Sheet</span></button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  WATER SPORTS RIDE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function RideModal({ initial, onClose, onSave }: { initial?: RideTicket; onClose: () => void; onSave: (r: RideTicket) => void }) {
  const [form, setForm] = useState<RideTicket>(initial ?? {
    id: 'ride-' + Date.now(), name: '', category: 'Water Sports', price: 0, unit: 'Per Person 1 Round', description: '', badge: '', image: '', emoji: '🏄'
  });
  const set = (k: keyof RideTicket, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={initial ? 'Edit Ride Ticket' : 'Add Ride Ticket'} onClose={onClose}>
      <div className="space-y-4">
        <ImageUploader label="Ride Photo (upload or URL)" value={form.image} onChange={v => set('image', v)} previewHeight="h-40" />
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><label className={labelCls}>Ride Name</label><input className={inputCls} placeholder="e.g. Speedboat Tour" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div><label className={labelCls}>Emoji Icon</label><input className={inputCls} placeholder="🏄" value={form.emoji} onChange={e => set('emoji', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="Water Sports">Water Sports</option>
              <option value="Other Activities">Other Activities</option>
            </select>
          </div>
          <div><label className={labelCls}>Price (₹)</label><input type="number" className={inputCls} value={form.price || ''} onChange={e => set('price', Number(e.target.value))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Unit</label><input className={inputCls} placeholder="Per Person 1 Round" value={form.unit} onChange={e => set('unit', e.target.value)} /></div>
          <div><label className={labelCls}>Badge</label><input className={inputCls} placeholder="e.g. Most Popular, Kids Fun" value={form.badge} onChange={e => set('badge', e.target.value)} /></div>
        </div>
        <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} placeholder="Explain the ride safety, gear, rounds..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Save Ride</span></button>
        </div>
      </div>
    </Modal>
  );
}
