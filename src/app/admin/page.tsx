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
  getStoredHeroSettings, saveHeroSettings, HeroSettings, HeroSlide, DEFAULT_HERO_SETTINGS,
  Reservation, MenuItem, BlogPost, GalleryItem, Review, ContactMessage, EventBanner,
  RideTicket, MenuPageDefinition,
} from '@/lib/db';
import ImageUploader from '@/components/ImageUploader';
import {
  Lock, Utensils, Calendar, FileText, Star, Mail, Plus, Trash2, Edit3,
  Image as ImageIcon, CheckCircle, Clock, XCircle, LogOut, ShieldAlert,
  Megaphone, ToggleLeft, ToggleRight,  X, Save, Eye, EyeOff, Waves, BookOpen, Sparkles, Home
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type TabKey = 'hero' | 'events' | 'bookings' | 'gallery' | 'menu' | 'menupages' | 'rides' | 'blogs' | 'reviews' | 'contact';

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
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);
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
    | { type: 'add-menupage' }
    | { type: 'edit-menupage'; item: MenuPageDefinition }
    | { type: 'add-ride' }
    | { type: 'edit-ride'; item: RideTicket }
    | { type: 'add-blog' }
    | { type: 'edit-blog'; item: BlogPost }
    | { type: 'add-heroslide' }
    | { type: 'edit-heroslide'; item: HeroSlide }
    | null
  >(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  // ── Auth & Active Tab Persistence ─────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('wings_admin_auth') === 'true') {
      setIsAuthenticated(true);
      loadAll();
      const savedTab = localStorage.getItem('wings_admin_tab') as TabKey;
      if (savedTab) setActiveTab(savedTab);
    }

    const handleSync = () => {
      if (localStorage.getItem('wings_admin_auth') === 'true') { loadAll(); }
    };
    window.addEventListener('wings_db_sync', handleSync);
    return () => window.removeEventListener('wings_db_sync', handleSync);
  }, []);
  const loadAll = async () => {
    setHeroSettings(await getStoredHeroSettings());
    setBanners(await getStoredEventBanners());
    setBookings(await getStoredReservations());
    setGallery(await getStoredGalleryItems());
    setMenuItems(await getStoredMenuItems());
    setMenuPages(await getStoredMenuPages());
    setRides(await getStoredWaterSports());
    setBlogs(await getStoredBlogs());
    setReviews(await getStoredReviews());
    setMessages(await getStoredContactMessages());
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
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('wings_admin_auth');
    localStorage.removeItem('wings_admin_tab');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

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
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative"
        style={{ background: 'radial-gradient(circle at 50% 0%, #1a0e0200 0%, #0a0604 70%)' }}>
        
        {/* Redirect button to return to home page */}
        <div className="absolute top-6 left-6 z-20">
          <a
            href="/"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs border border-white/10 transition-all shadow-md hover:scale-105"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>← Back to Website Home</span>
          </a>
        </div>

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
    { id: 'hero'     as TabKey, label: 'Hero Section',  icon: Sparkles,    count: heroSettings.slides?.length || 0 },
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
        
        {/* Navigation & Logout Controls */}
        <div className="flex items-center space-x-2">
          <a
            href="/"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500 hover:to-emerald-500 text-amber-300 hover:text-dark-950 font-bold text-xs border border-amber-500/40 transition-all hover:scale-105 shadow-md"
            title="Go to Website Home Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home Page</span>
          </a>
          <button onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-xs text-rose-300 hover:text-white border border-rose-500/30 transition-all hover:scale-105"
            title="Logout and return to site">
            <LogOut className="w-3.5 h-3.5" /><span>Logout</span>
          </button>
        </div>
      </header>

      {/* Tab Nav */}
      <nav className="border-b border-white/10 overflow-x-auto no-scrollbar"
        style={{ background: 'rgba(15,10,6,0.8)' }}>
        <div className="flex items-center px-4 sm:px-6 space-x-1 py-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); localStorage.setItem('wings_admin_tab', tab.id); }}
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

        {/* ═══ HERO SECTION TAB ════════════════════════════════════════════ */}
        {activeTab === 'hero' && (
          <TabSection title="Hero Section Settings & Slideshow" subtitle="Edit main Hero headline, sub-headline, contact phone number, and background slideshow images."
            action={<button className={btnPrimary} onClick={() => setModal({ type: 'add-heroslide' })}><Plus className="w-4 h-4" /><span>Add Slide</span></button>}>
            <div className="space-y-6">
              {/* Header Text Settings Card */}
              <div className={`${cardCls} p-6 space-y-4`}>
                <h3 className="font-serif font-bold text-amber-400 text-lg flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Main Hero Text & Contact Details</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Badge Tagline</label>
                    <input className={inputCls} value={heroSettings.badgeText || ''} onChange={e => setHeroSettings(h => ({ ...h, badgeText: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Phone Number</label>
                    <input className={inputCls} value={heroSettings.contactPhone || ''} onChange={e => setHeroSettings(h => ({ ...h, contactPhone: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Main Headline</label>
                    <input className={inputCls} value={heroSettings.mainHeadline || ''} onChange={e => setHeroSettings(h => ({ ...h, mainHeadline: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Sub-Headline</label>
                    <input className={inputCls} value={heroSettings.subHeadline || ''} onChange={e => setHeroSettings(h => ({ ...h, subHeadline: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={async () => { await saveHeroSettings(heroSettings); alert('Hero text settings saved successfully!'); }} className={btnPrimary}>
                    <Save className="w-4 h-4" /><span>Save Text Settings</span>
                  </button>
                </div>
              </div>

              {/* Background Slides Grid */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-white text-base">Background Slideshow Images ({heroSettings.slides?.length || 0})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroSettings.slides.map(slide => (
                    <div key={slide.id} className={`${cardCls} overflow-hidden group`}>
                      <div className="relative h-44 bg-dark-950">
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-dark-950/80 text-amber-400 text-[9px] font-black uppercase border border-amber-400/25">{slide.tag}</span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-serif font-bold text-white text-sm truncate">{slide.title}</h4>
                        <p className="text-[10px] text-gray-400 line-clamp-1">{slide.subtitle}</p>
                        <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                          <button className={`${btnEdit} flex-1 py-1.5 font-bold text-xs justify-center flex items-center space-x-1`}
                            onClick={() => setModal({ type: 'edit-heroslide', item: slide })}>
                            <Edit3 className="w-3.5 h-3.5" /><span>Edit Slide</span>
                          </button>
                          <button className={btnDanger}
                            onClick={() => setDeleteTarget({
                              label: `Slide (${slide.title})`,
                              fn: async () => {
                                const updatedSlides = heroSettings.slides.filter(s => s.id !== slide.id);
                                const newSettings = { ...heroSettings, slides: updatedSlides };
                                setHeroSettings(await saveHeroSettings(newSettings));
                                setDeleteTarget(null);
                              }
                            })}
                            title="Delete Slide">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabSection>
        )}

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
                        <button onClick={async () => { setBanners(await toggleEventBanner(banner.id)); }} title={banner.is_active ? 'Hide Banner' : 'Show Banner'}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${banner.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500 hover:text-white'}`}>
                          {banner.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          <span>{banner.is_active ? 'Active' : 'Hidden'}</span>
                        </button>
                        <button className={btnEdit} onClick={() => setModal({ type: 'edit-banner', item: banner })} title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Banner', fn: async () => { setBanners(await deleteEventBanner(banner.id)); setDeleteTarget(null); } })} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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
                            <button onClick={async () => setBookings(await updateReservationStatus(b.id, 'confirmed'))} title="Confirm" className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-all"><CheckCircle className="w-3.5 h-3.5" /></button>
                            <button onClick={async () => setBookings(await updateReservationStatus(b.id, 'completed'))} title="Complete" className="p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"><Clock className="w-3.5 h-3.5" /></button>
                            <button onClick={async () => setBookings(await updateReservationStatus(b.id, 'cancelled'))} title="Cancel" className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"><XCircle className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteTarget({ label: 'Reservation', fn: async () => { setBookings(await deleteReservation(b.id)); setDeleteTarget(null); } })} title="Delete" className={btnDanger}><Trash2 className="w-3 h-3" /></button>
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
                      <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Gallery Photo', fn: async () => { setGallery(await deleteGalleryItem(item.id)); setDeleteTarget(null); } })} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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
                    <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Menu Item', fn: async () => { setMenuItems(await deleteMenuItem(item.id)); setDeleteTarget(null); } })} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && <EmptyState icon={Utensils} message="No menu items yet." />}
            </div>
          </TabSection>
        )}

        {/* ═══ MENU PAGES TAB ═══════════════════════════════════════════════ */}
        {activeTab === 'menupages' && (
          <TabSection title="Interactive Booklet Pages" subtitle="Add new booklet pages or modify existing page sheets, titles, and categories."
            action={<button className={btnPrimary} onClick={() => setModal({ type: 'add-menupage' })}><Plus className="w-4 h-4" /><span>Add New Page</span></button>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuPages.map(page => (
                <div key={page.pageNumber} className={`${cardCls} overflow-hidden group`}>
                  <div className="relative h-48 bg-cream-50 p-2 flex items-center justify-center">
                    <img src={page.image} alt={page.title} className="max-h-full object-contain" />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-dark-950/80 text-amber-400 text-[10px] font-black uppercase">Page {String(page.pageNumber).padStart(2, '0')}</span>
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
                        <Edit3 className="w-3.5 h-3.5" /><span>Edit Sheet</span>
                      </button>
                      <button className={btnDanger}
                        onClick={() => setDeleteTarget({ label: `Menu Page ${page.pageNumber}`, fn: async () => { setMenuPages(await deleteMenuPage(page.pageNumber)); setDeleteTarget(null); } })}
                        title="Delete Page">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {menuPages.length === 0 && <EmptyState icon={BookOpen} message="No menu pages yet. Add your first interactive booklet page!" />}
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
                    <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Ride', fn: async () => { setRides(await deleteWaterSports(ride.id)); setDeleteTarget(null); } })} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {rides.length === 0 && <EmptyState icon={Waves} message="No water sports rides yet. Add your first speedboat or jetski ride!" />}
            </div>
          </TabSection>
        )}

        {/* ═══ BLOGS TAB ═══════════════════════════════════════════════════ */}
        {activeTab === 'blogs' && (
          <TabSection title="Blog Articles" subtitle="Publish and manage blog stories shown on the website with multi-image galleries."
            action={<button className={btnPrimary} onClick={() => setModal({ type: 'add-blog' })}><Plus className="w-4 h-4" /><span>New Post</span></button>}>
            <div className="space-y-4">
              {blogs.map(blog => {
                const imgCount = (blog.images && blog.images.length > 0) ? blog.images.length : (blog.cover_image ? 1 : 0);
                return (
                  <div key={blog.id} className={`${cardCls} flex flex-col sm:flex-row items-stretch overflow-hidden group hover:border-amber-400/30 transition-all`}>
                    <div className="sm:w-48 h-36 sm:h-auto shrink-0 bg-dark-950 overflow-hidden relative">
                      <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-dark-950/85 text-amber-400 text-[9px] font-black uppercase border border-amber-400/20">
                        🖼️ {imgCount} {imgCount === 1 ? 'Photo' : 'Photos'}
                      </span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-black uppercase border border-amber-500/20">{blog.category}</span>
                          <span className="text-[10px] text-gray-500">{blog.created_at} · {blog.read_time}</span>
                        </div>
                        <h4 className="font-serif font-bold text-white text-base leading-snug">{blog.title}</h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{blog.excerpt}</p>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {blog.tags.map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400 text-[9px]">#{t}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button className={`${btnEdit} flex items-center space-x-1`} onClick={() => setModal({ type: 'edit-blog', item: blog })}><Edit3 className="w-3.5 h-3.5" /><span className="text-xs font-bold">Edit Article</span></button>
                        <button className={`${btnDanger} flex items-center space-x-1`} onClick={() => setDeleteTarget({ label: 'Blog Post', fn: async () => { setBlogs(await deleteBlog(blog.id)); setDeleteTarget(null); } })}><Trash2 className="w-3.5 h-3.5" /><span className="text-xs font-bold">Delete</span></button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                      <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Review', fn: async () => { setReviews(await deleteReview(rev.id)); setDeleteTarget(null); } })}><Trash2 className="w-3.5 h-3.5" /></button>
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
                  <button className={btnDanger} onClick={() => setDeleteTarget({ label: 'Message', fn: async () => { setMessages(await deleteContactMessage(m.id)); setDeleteTarget(null); } })}><Trash2 className="w-3.5 h-3.5" /></button>
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
          onSave={async banner => {
            if (modal.type === 'edit-banner') { setBanners(await updateEventBanner(banner)); }
            else { setBanners(await saveEventBanner(banner)); }
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Gallery */}
      {(modal?.type === 'add-gallery' || modal?.type === 'edit-gallery') && (
        <GalleryModal
          initial={modal.type === 'edit-gallery' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={async item => {
            if (modal.type === 'edit-gallery') { setGallery(await updateGalleryItem(item)); }
            else { setGallery(await saveGalleryItem(item)); }
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Menu Item */}
      {(modal?.type === 'add-menu' || modal?.type === 'edit-menu') && (
        <MenuModal
          initial={modal.type === 'edit-menu' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={async item => {
            if (modal.type === 'edit-menu') { setMenuItems(await updateMenuItem(item)); }
            else { setMenuItems(await saveMenuItem(item)); }
            setModal(null);
          }}
        />
      )}

      {/* Add Menu Booklet Page */}
      {modal?.type === 'add-menupage' && (
        <AddMenuPageModal
          existingPageNumbers={menuPages.map(p => p.pageNumber)}
          onClose={() => setModal(null)}
          onSave={async page => {
            setMenuPages(await saveMenuPage(page));
            setModal(null);
          }}
        />
      )}

      {/* Edit Menu Booklet Page */}
      {modal?.type === 'edit-menupage' && (
        <MenuPageModal
          initial={modal.item}
          onClose={() => setModal(null)}
          onSave={async page => {
            setMenuPages(await updateMenuPage(page));
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Water Sports Ride */}
      {(modal?.type === 'add-ride' || modal?.type === 'edit-ride') && (
        <RideModal
          initial={modal.type === 'edit-ride' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={async ride => {
            if (modal.type === 'edit-ride') { setRides(await updateWaterSports(ride)); }
            else { setRides(await saveWaterSports(ride)); }
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Blog */}
      {(modal?.type === 'add-blog' || modal?.type === 'edit-blog') && (
        <BlogModal
          initial={modal.type === 'edit-blog' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={async blog => {
            if (modal.type === 'edit-blog') { setBlogs(await updateBlog(blog)); }
            else { setBlogs(await saveBlog(blog)); }
            setModal(null);
          }}
        />
      )}

      {/* Add / Edit Hero Slide */}
      {(modal?.type === 'add-heroslide' || modal?.type === 'edit-heroslide') && (
        <HeroSlideModal
          initial={modal.type === 'edit-heroslide' ? modal.item : undefined}
          onClose={() => setModal(null)}
          onSave={async slide => {
            let updatedSlides: HeroSlide[];
            if (modal.type === 'edit-heroslide') {
              updatedSlides = heroSettings.slides.map(s => s.id === slide.id ? slide : s);
            } else {
              updatedSlides = [slide, ...heroSettings.slides];
            }
            const updatedSettings = { ...heroSettings, slides: updatedSlides };
            setHeroSettings(await saveHeroSettings(updatedSettings));
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
//  BLOG MODAL (With Multi-Image Upload & Details)
// ─────────────────────────────────────────────────────────────────────────────
function BlogModal({ initial, onClose, onSave }: { initial?: BlogPost; onClose: () => void; onSave: (b: BlogPost) => void }) {
  const [form, setForm] = useState<BlogPost>(initial ?? {
    id: 'blog-' + Date.now(),
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Food & Dining',
    cover_image: '',
    images: [],
    tags: [],
    author: 'Wings River Team',
    read_time: '3 min read',
    created_at: new Date().toISOString().split('T')[0],
    is_published: true
  });
  const [newImage, setNewImage] = useState('');

  const set = (k: keyof BlogPost, v: any) => setForm(f => ({ ...f, [k]: v }));
  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const addImageToGallery = (url: string) => {
    if (!url.trim()) return;
    const currentImages = form.images || [];
    if (!currentImages.includes(url)) {
      const updated = [...currentImages, url];
      setForm(f => ({
        ...f,
        images: updated,
        cover_image: f.cover_image || url
      }));
    }
    setNewImage('');
  };

  const removeImage = (index: number) => {
    const currentImages = form.images || [];
    const removedUrl = currentImages[index];
    const updated = currentImages.filter((_, i) => i !== index);
    let newCover = form.cover_image;
    if (form.cover_image === removedUrl) {
      newCover = updated.length > 0 ? updated[0] : '';
    }
    setForm(f => ({ ...f, images: updated, cover_image: newCover }));
  };

  const setCoverImage = (url: string) => {
    setForm(f => ({ ...f, cover_image: url }));
  };

  const handleSave = () => {
    if (!form.title.trim()) { alert('Please enter a blog title.'); return; }
    if (!form.content.trim()) { alert('Please enter blog content.'); return; }
    const imagesList = form.images || [];
    const finalCover = form.cover_image || (imagesList.length > 0 ? imagesList[0] : '/images/Screenshot_20260720-180544_Maps.png');
    onSave({
      ...form,
      cover_image: finalCover,
      images: imagesList.length > 0 ? imagesList : [finalCover]
    });
  };

  return (
    <Modal title={initial ? 'Edit Blog Post' : 'Publish New Blog Post'} onClose={onClose}>
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Article Title */}
        <div>
          <label className={labelCls}>Article Title *</label>
          <input className={inputCls} placeholder="e.g. Top 5 River Dining Experiences in Lucknow" value={form.title}
            onChange={e => { set('title', e.target.value); if (!initial) set('slug', autoSlug(e.target.value)); }} />
        </div>

        {/* Category & Read Time & Author */}
        <div className="grid grid-cols-3 gap-3">
          <div><label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
              {['Food & Dining', 'Riverside Experience', 'Events & Parties', 'Water Sports', 'Nightlife', 'Culinary Highlights', 'Travel & Lifestyle'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Author</label><input className={inputCls} placeholder="Wings River Team" value={form.author} onChange={e => set('author', e.target.value)} /></div>
          <div><label className={labelCls}>Read Time</label><input className={inputCls} placeholder="4 min read" value={form.read_time} onChange={e => set('read_time', e.target.value)} /></div>
        </div>

        {/* Primary Cover Image */}
        <div>
          <label className={labelCls}>Main Cover Image</label>
          <ImageUploader label="Upload Cover Image or enter URL" value={form.cover_image} onChange={v => {
            set('cover_image', v);
            if (v && (!form.images || !form.images.includes(v))) {
              setForm(f => ({ ...f, images: [v, ...(f.images || [])] }));
            }
          }} previewHeight="h-40" />
        </div>

        {/* Multi-Image Gallery Uploader */}
        <div className="p-4 rounded-2xl bg-white/3 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelCls + ' !mb-0 text-amber-400 font-bold flex items-center space-x-1.5'}>
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Article Photo Gallery (Multiple Images)</span>
            </label>
            <span className="text-[10px] text-gray-400 font-semibold">{form.images?.length || 0} Photos Added</span>
          </div>

          {/* Quick Uploader / Add URL */}
          <div className="space-y-2">
            <ImageUploader label="Upload photo to add to blog gallery" value={newImage} onChange={v => {
              if (v) addImageToGallery(v);
            }} previewHeight="h-28" />
          </div>

          {/* Gallery Thumbnails Grid */}
          {form.images && form.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-2">
              {form.images.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden bg-dark-950 border border-white/10 aspect-video">
                  <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  {form.cover_image === imgUrl && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-dark-950 font-black text-[8px] uppercase">Cover</span>
                  )}
                  <div className="absolute inset-0 bg-dark-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1 p-1">
                    {form.cover_image !== imgUrl && (
                      <button type="button" onClick={() => setCoverImage(imgUrl)} className="px-2 py-0.5 rounded bg-amber-500 text-dark-950 text-[9px] font-bold">Set Cover</button>
                    )}
                    <button type="button" onClick={() => removeImage(idx)} className="px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className={labelCls}>Excerpt (Short Summary for card)</label>
          <textarea className={inputCls} rows={2} placeholder="A brief catchy description shown in the blog card..." value={form.excerpt} onChange={e => set('excerpt', e.target.value)} />
        </div>

        {/* Full Content */}
        <div>
          <label className={labelCls}>Full Blog Content (Paragraphs)</label>
          <textarea className={inputCls} rows={6} placeholder="Write the full blog story here. Use double line breaks between paragraphs..." value={form.content} onChange={e => set('content', e.target.value)} />
        </div>

        {/* Tags */}
        <div>
          <label className={labelCls}>Topic Tags (comma separated)</label>
          <input className={inputCls} placeholder="e.g. Riverside, Speedboat, Gomti River, Gourmet" value={(form.tags || []).join(', ')}
            onChange={e => set('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
        </div>

        {/* Save / Cancel buttons */}
        <div className="flex space-x-3 pt-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1">
            <Save className="w-3.5 h-3.5" />
            <span>{initial ? 'Update Post' : 'Publish Article'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADD MENU BOOKLET PAGE MODAL (New Page)
// ─────────────────────────────────────────────────────────────────────────────
function AddMenuPageModal({ existingPageNumbers, onClose, onSave }: { existingPageNumbers: number[]; onClose: () => void; onSave: (p: MenuPageDefinition) => void }) {
  const nextPageNum = existingPageNumbers.length > 0 ? Math.max(...existingPageNumbers) + 1 : 1;
  const [form, setForm] = useState<MenuPageDefinition>({
    pageNumber: nextPageNum,
    title: '',
    subtitle: '',
    image: '',
    categories: [],
  });
  const set = (k: keyof MenuPageDefinition, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) { alert('Please enter a page title.'); return; }
    if (!form.image.trim()) { alert('Please upload or enter a page image URL.'); return; }
    onSave(form);
  };

  return (
    <Modal title="Add New Booklet Page" onClose={onClose}>
      <div className="space-y-4">
        {/* Info badge */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-2">
          <BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
          <span>This page will appear in the <strong>Interactive Menu Card</strong> booklet on the website. Upload your menu card image and set the page details.</span>
        </div>
        <ImageUploader label="Page Image / Menu Card Sheet (upload or URL)" value={form.image} onChange={v => set('image', v)} previewHeight="h-56" maxSizeMB={12} />
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Page Title</label>
            <input className={inputCls} placeholder="e.g. Starters & Snacks" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Page No.</label>
            <input type="number" min={1} className={inputCls} value={form.pageNumber}
              onChange={e => set('pageNumber', Number(e.target.value))} />
          </div>
        </div>
        <div><label className={labelCls}>Subtitle / Description</label><input className={inputCls} placeholder="Short description shown below page title..." value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></div>
        <div>
          <label className={labelCls}>Categories (comma separated)</label>
          <input className={inputCls} placeholder="e.g. Starter, Snacks, Tandoor" value={form.categories.join(', ')}
            onChange={e => set('categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          <p className="text-[10px] text-gray-500 mt-1">These appear as tags on the booklet page card.</p>
        </div>
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"><Save className="w-3.5 h-3.5" /><span>Add Page</span></button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EDIT MENU BOOKLET PAGE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function MenuPageModal({ initial, onClose, onSave }: { initial: MenuPageDefinition; onClose: () => void; onSave: (p: MenuPageDefinition) => void }) {
  const [form, setForm] = useState<MenuPageDefinition>({ ...initial });
  const set = (k: keyof MenuPageDefinition, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={`Edit Booklet Page ${String(form.pageNumber).padStart(2, '0')}`} onClose={onClose}>
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

// ─────────────────────────────────────────────────────────────────────────────
//  HERO SLIDE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function HeroSlideModal({ initial, onClose, onSave }: { initial?: HeroSlide; onClose: () => void; onSave: (s: HeroSlide) => void }) {
  const [form, setForm] = useState<HeroSlide>(initial ?? {
    id: 'hs-' + Date.now(),
    image: '',
    title: '',
    subtitle: '',
    tag: 'Wings River Café'
  });
  const set = (k: keyof HeroSlide, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.image.trim()) { alert('Please upload or enter a background image URL.'); return; }
    if (!form.title.trim()) { alert('Please enter a slide title.'); return; }
    onSave(form);
  };

  return (
    <Modal title={initial ? 'Edit Hero Slide' : 'Add New Hero Slide'} onClose={onClose}>
      <div className="space-y-4">
        <ImageUploader label="Background Slide Image (upload or URL)" value={form.image} onChange={v => set('image', v)} previewHeight="h-48" maxSizeMB={10} />
        <div>
          <label className={labelCls}>Slide Main Title</label>
          <input className={inputCls} placeholder="e.g. Luxurious Riverside Dining" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Slide Subtitle</label>
          <input className={inputCls} placeholder="e.g. Multicuisine Delights with Scenic Sunset Views" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Tagline Badge Text</label>
          <input className={inputCls} placeholder="e.g. Family Restaurant & Evening Ambience" value={form.tag} onChange={e => set('tag', e.target.value)} />
        </div>
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1">
            <Save className="w-3.5 h-3.5" /><span>Save Slide</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
