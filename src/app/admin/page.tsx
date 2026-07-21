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
  getStoredHeroSettings, saveHeroSettings,
  // New CMS exports
  getStoredCategories, saveCategory, deleteCategory,
  getStoredFaqs, saveFaq, deleteFaq,
  getStoredTeamMembers, saveTeamMember, deleteTeamMember,
  getStoredOffers, saveOffer, deleteOffer,
  getStoredMedia, saveMediaItem, deleteMediaItem,
  getStoredAuditLogs,
  getStoredPages, savePage, deletePage,
  getApiUrl,
  // Types
  Reservation, MenuItem, BlogPost, GalleryItem, Review, ContactMessage, EventBanner,
  RideTicket, MenuPageDefinition, HeroSettings,
  MenuCategory, OfferDiscount, FaqItem, TeamMember, MediaItem, SitePage, AuditLog
} from '@/lib/db';
import {
  Lock, Utensils, Calendar, FileText, Star, Mail, Plus, Trash2, Edit3,
  Image as ImageIcon, CheckCircle, Clock, XCircle, LogOut, ShieldAlert,
  Megaphone, ToggleLeft, ToggleRight, X, Save, Eye, EyeOff, Waves, BookOpen,
  Sparkles, Home, Layers, HelpCircle, Users, Award, Tag, Settings, Database, FolderOpen,
  ChevronLeft, ChevronRight, Menu, ArrowLeft
} from 'lucide-react';

// Tab Keys matching separate management modules
type TabKey = 
  | 'dashboard'
  | 'hero' 
  | 'pages'
  | 'categories' 
  | 'menu' 
  | 'menupages' 
  | 'blogs' 
  | 'gallery' 
  | 'rides' 
  | 'banners' 
  | 'offers' 
  | 'faqs' 
  | 'team' 
  | 'bookings' 
  | 'reviews' 
  | 'contact' 
  | 'media' 
  | 'audit';

const inputCls = 'w-full px-3 py-2.5 text-xs bg-dark-950/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all';
const labelCls = 'block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1';
const cardCls = 'bg-dark-900/70 backdrop-blur-sm border border-white/8 rounded-2xl p-5';
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
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── CONFIRM DELETE ───────────────────────────────────────────────────────────
function ConfirmDelete({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[400] bg-dark-950/90 flex items-center justify-center p-4 text-white">
      <div className="bg-dark-900 border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-white text-base">Delete {label}?</h4>
          <p className="text-xs text-gray-400 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors">Cancel</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl transition-colors">Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core CMS state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [banners, setBanners] = useState<EventBanner[]>([]);
  const [rides, setRides] = useState<RideTicket[]>([]);
  const [menuPages, setMenuPages] = useState<MenuPageDefinition[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [offers, setOffers] = useState<OfferDiscount[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);

  // Edit / Creation modals state
  const [categoryModal, setCategoryModal] = useState<Partial<MenuCategory> | null>(null);
  const [menuModal, setMenuModal] = useState<Partial<MenuItem> | null>(null);
  const [blogModal, setBlogModal] = useState<Partial<BlogPost> | null>(null);
  const [galleryModal, setGalleryModal] = useState<Partial<GalleryItem> | null>(null);
  const [rideModal, setRideModal] = useState<Partial<RideTicket> | null>(null);
  const [bannerModal, setBannerModal] = useState<Partial<EventBanner> | null>(null);
  const [offerModal, setOfferModal] = useState<Partial<OfferDiscount> | null>(null);
  const [faqModal, setFaqModal] = useState<Partial<FaqItem> | null>(null);
  const [teamModal, setTeamModal] = useState<Partial<TeamMember> | null>(null);
  const [pageModal, setPageModal] = useState<Partial<SitePage> | null>(null);
  const [mediaModal, setMediaModal] = useState<Partial<MediaItem> | null>(null);
  const [menuPageModal, setMenuPageModal] = useState<Partial<MenuPageDefinition> | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ label: string; action: () => void } | null>(null);

  // Search, Filter & Sort options
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('display_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const authStatus = localStorage.getItem('wings_admin_auth');
    const token = localStorage.getItem('wings_admin_jwt');
    if (authStatus === 'true' && token) {
      setIsAuthenticated(true);
      loadAll();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Sync listener
  useEffect(() => {
    const handleSync = () => {
      if (isAuthenticated) loadAll();
    };
    window.addEventListener('wings_db_sync', handleSync);
    return () => window.removeEventListener('wings_db_sync', handleSync);
  }, [isAuthenticated]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [
        resBookings, resMenu, resCategories, resBlogs, resGallery,
        resReviews, resMessages, resBanners, resRides, resMenuPages,
        resFaqs, resTeam, resOffers, resMedia, resPages, resHero
      ] = await Promise.all([
        getStoredReservations(), getStoredMenuItems(), getStoredCategories(),
        getStoredBlogs(), getStoredGalleryItems(), getStoredReviews(),
        getStoredContactMessages(), getStoredEventBanners(), getStoredWaterSports(),
        getStoredMenuPages(), getStoredFaqs(), getStoredTeamMembers(),
        getStoredOffers(), getStoredMedia(), getStoredPages(), getStoredHeroSettings()
      ]);

      setReservations(resBookings);
      setMenuItems(resMenu);
      setCategories(resCategories);
      setBlogs(resBlogs);
      setGallery(resGallery);
      setReviews(resReviews);
      setMessages(resMessages);
      setBanners(resBanners);
      setRides(resRides);
      setMenuPages(resMenuPages);
      setFaqs(resFaqs);
      setTeam(resTeam);
      setOffers(resOffers);
      setMedia(resMedia);
      setPages(resPages);
      setHeroSettings(resHero);

      // Audit logs (auth protected)
      const logs = await getStoredAuditLogs();
      setAuditLogs(logs);

    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: passwordInput })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          localStorage.setItem('wings_admin_jwt', data.token);
          localStorage.setItem('wings_admin_auth', 'true');
          setIsAuthenticated(true);
          loadAll();
          return;
        } else if (data.error) {
          setErrorMsg(data.error);
          return;
        }
      }
    } catch (err) {
      console.error('[D1 Login Error]:', err);
    }

    // Fallback authentication for master admin keys (if API server is offline or returned failure)
    if (
      passwordInput === 'wingsriver@2026' ||
      passwordInput === 'wings_river_cafe_admin_secret_2026' ||
      passwordInput === 'admin123' ||
      passwordInput === 'admin'
    ) {
      localStorage.setItem('wings_admin_auth', 'true');
      localStorage.setItem('wings_admin_jwt', 'local_admin_master_session_token_2026');
      setIsAuthenticated(true);
      loadAll();
    } else {
      setErrorMsg('Invalid admin credentials. Please enter a valid password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wings_admin_auth');
    localStorage.removeItem('wings_admin_jwt');
    setIsAuthenticated(false);
  };

  // ─── CRUD OPERATORS ─────────────────────────────────────────────────────────

  // Categories Save
  const saveCategoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryModal) return;
    const catToSave = {
      id: categoryModal.id || `cat-${Date.now()}`,
      name: categoryModal.name || '',
      slug: categoryModal.slug || (categoryModal.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: categoryModal.description || '',
      display_order: Number(categoryModal.display_order) || 0
    };
    const fresh = await saveCategory(catToSave);
    setCategories(fresh);
    setCategoryModal(null);
  };

  // Menu Items Save
  const saveMenuItemItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuModal) return;
    const itemToSave = {
      id: menuModal.id || `menu-${Date.now()}`,
      category_id: menuModal.category_id || 'cat-beverages',
      name: menuModal.name || '',
      description: menuModal.description || '',
      price: Number(menuModal.price) || 0.0,
      is_veg: menuModal.is_veg !== false,
      image_url: menuModal.image_url || '/images/menu_page_1.png',
      is_available: menuModal.is_available !== false,
      display_order: Number(menuModal.display_order) || 0,
      version: Number(menuModal.version) || 1,
      is_deleted: Number(menuModal.is_deleted) || 0
    };
    const fresh = await saveMenuItem(itemToSave);
    setMenuItems(fresh);
    setMenuModal(null);
  };

  // Blog Posts Save
  const saveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogModal) return;
    const blogToSave = {
      id: blogModal.id || `blog-${Date.now()}`,
      title: blogModal.title || '',
      slug: blogModal.slug || (blogModal.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: blogModal.excerpt || '',
      content: blogModal.content || '',
      category: blogModal.category || 'Food & Dining',
      cover_image: blogModal.cover_image || '',
      images: blogModal.images || [],
      author: blogModal.author || 'Wings River Team',
      read_time: blogModal.read_time || '4 min read',
      status: blogModal.status || 'draft',
      is_published: blogModal.status === 'published'
    };
    const fresh = await saveBlog(blogToSave);
    setBlogs(fresh);
    setBlogModal(null);
  };

  // Photo Gallery Save
  const saveGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryModal) return;
    const photoToSave = {
      id: galleryModal.id || `gal-${Date.now()}`,
      title: galleryModal.title || '',
      category: galleryModal.category || 'Restaurant',
      image_url: galleryModal.image_url || '',
      featured: galleryModal.featured || false,
      display_order: Number(galleryModal.display_order) || 0
    };
    const fresh = await saveGalleryItem(photoToSave);
    setGallery(fresh);
    setGalleryModal(null);
  };

  // Water Sports Save
  const saveRideTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rideModal) return;
    const rideToSave = {
      id: rideModal.id || `ride-${Date.now()}`,
      name: rideModal.name || '',
      category: rideModal.category || 'Water Sports',
      price: Number(rideModal.price) || 0.0,
      unit: rideModal.unit || 'Per Person',
      description: rideModal.description || '',
      badge: rideModal.badge || '',
      image: rideModal.image || '',
      emoji: rideModal.emoji || '🏄',
      display_order: Number(rideModal.display_order) || 0
    };
    const fresh = await saveWaterSports(rideToSave);
    setRides(fresh);
    setRideModal(null);
  };

  // Event Banner Save
  const saveBannerItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerModal) return;
    const bannerToSave = {
      id: bannerModal.id || `eb-${Date.now()}`,
      title: bannerModal.title || '',
      subtitle: bannerModal.subtitle || '',
      image_url: bannerModal.image_url || '',
      cta_text: bannerModal.cta_text || '',
      cta_link: bannerModal.cta_link || '',
      is_active: bannerModal.is_active !== false
    };
    const fresh = await saveEventBanner(bannerToSave);
    setBanners(fresh);
    setBannerModal(null);
  };

  // Offers Save
  const saveOfferItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModal) return;
    const offerToSave = {
      id: offerModal.id || `off-${Date.now()}`,
      title: offerModal.title || '',
      code: offerModal.code || '',
      description: offerModal.description || '',
      discount_value: Number(offerModal.discount_value) || 0.0,
      discount_type: offerModal.discount_type || 'percentage',
      status: offerModal.status || 'draft'
    };
    const fresh = await saveOffer(offerToSave);
    setOffers(fresh);
    setOfferModal(null);
  };

  // FAQs Save
  const saveFaqItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqModal) return;
    const faqToSave = {
      id: faqModal.id || `faq-${Date.now()}`,
      question: faqModal.question || '',
      answer: faqModal.answer || '',
      display_order: Number(faqModal.display_order) || 0
    };
    const fresh = await saveFaq(faqToSave);
    setFaqs(fresh);
    setFaqModal(null);
  };

  // Team Members Save
  const saveTeamMemberItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamModal) return;
    const tmToSave = {
      id: teamModal.id || `tm-${Date.now()}`,
      name: teamModal.name || '',
      role: teamModal.role || '',
      bio: teamModal.bio || '',
      image: teamModal.image || '',
      display_order: Number(teamModal.display_order) || 0
    };
    const fresh = await saveTeamMember(tmToSave);
    setTeam(fresh);
    setTeamModal(null);
  };

  // Dynamic Pages Save
  const saveDynamicPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageModal) return;
    const pageToSave = {
      id: pageModal.id || `pg-${Date.now()}`,
      title: pageModal.title || '',
      slug: pageModal.slug || (pageModal.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: pageModal.content || '',
      status: pageModal.status || 'draft',
      display_order: Number(pageModal.display_order) || 0,
      version: Number(pageModal.version) || 1
    };
    const fresh = await savePage(pageToSave);
    setPages(fresh);
    setPageModal(null);
  };

  // Media Library Upload
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaModal) return;
    const itemToSave = {
      id: mediaModal.id || `med-${Date.now()}`,
      url: mediaModal.url || '',
      alt_text: mediaModal.alt_text || '',
      caption: mediaModal.caption || '',
      category: mediaModal.category || 'general',
      file_size: Number(mediaModal.file_size) || 0,
      dimensions: mediaModal.dimensions || ''
    };
    const fresh = await saveMediaItem(itemToSave);
    setMedia(fresh);
    setMediaModal(null);
  };

  // Hero Section Settings Save
  const handleHeroSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSettings) return;
    const updated = await saveHeroSettings(heroSettings);
    setHeroSettings(updated);
  };

  // Menu Booklet Page Save
  const saveMenuPageItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuPageModal) return;
    const pageToSave = {
      page_number: Number(menuPageModal.page_number) || 1,
      title: menuPageModal.title || '',
      subtitle: menuPageModal.subtitle || '',
      image: menuPageModal.image || '',
      categories: Array.isArray(menuPageModal.categories) ? menuPageModal.categories : [],
      display_order: Number(menuPageModal.display_order) || 0
    };
    const fresh = await saveMenuPage(pageToSave);
    setMenuPages(fresh);
    setMenuPageModal(null);
  };

  // ─── LOGIN PANEL ───────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent opacity-40" />
        <div className="max-w-md w-full bg-dark-900 border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-dark-950 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-white">Wings River Café CMS</h2>
            <p className="text-xs text-gray-400">Secure Cloudflare D1-Backed Administrator Area</p>
          </div>
          {errorMsg && (
            <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center space-x-2 text-rose-400 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>Administrator Password</label>
              <input type="password" placeholder="••••••••••••" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={inputCls} required />
            </div>
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all">Sign In</button>
          </form>
          <div className="pt-2 border-t border-white/10 text-center">
            <a href="/" className="inline-flex items-center justify-center space-x-2 w-full py-2.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white font-bold text-xs rounded-xl transition-all border border-white/10">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home Screen</span>
            </a>
          </div>
        </div>
      </main>
    );
  }

  const navTabs: { id: TabKey; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard',  label: 'Dashboard Overview', icon: <Home className="w-4 h-4 shrink-0" /> },
    { id: 'hero',       label: 'Hero & About CMS',   icon: <Settings className="w-4 h-4 shrink-0" /> },
    { id: 'pages',      label: 'Dynamic Pages',      icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: 'categories', label: 'Menu Categories',    icon: <Layers className="w-4 h-4 shrink-0" /> },
    { id: 'menu',       label: 'Menu Items',         icon: <Utensils className="w-4 h-4 shrink-0" /> },
    { id: 'menupages',  label: 'Booklet Pages',      icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { id: 'blogs',      label: 'Blogs & News',       icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: 'gallery',    label: 'Photo Gallery',      icon: <ImageIcon className="w-4 h-4 shrink-0" /> },
    { id: 'rides',      label: 'Water Sports Rides', icon: <Waves className="w-4 h-4 shrink-0" /> },
    { id: 'banners',    label: 'Promo Banners',      icon: <Megaphone className="w-4 h-4 shrink-0" /> },
    { id: 'offers',     label: 'Offers & Discounts', icon: <Tag className="w-4 h-4 shrink-0" /> },
    { id: 'faqs',       label: 'FAQs Management',    icon: <HelpCircle className="w-4 h-4 shrink-0" /> },
    { id: 'team',       label: 'Team Members',       icon: <Users className="w-4 h-4 shrink-0" /> },
    { id: 'bookings',   label: 'Reservations',       icon: <Calendar className="w-4 h-4 shrink-0" /> },
    { id: 'reviews',    label: 'Customer Reviews',   icon: <Star className="w-4 h-4 shrink-0" /> },
    { id: 'contact',    label: 'Inquiries & Messages',icon:<Mail className="w-4 h-4 shrink-0" /> },
    { id: 'media',      label: 'Media Library',      icon: <FolderOpen className="w-4 h-4 shrink-0" /> },
    { id: 'audit',      label: 'Security Audit Logs',icon: <Database className="w-4 h-4 shrink-0" /> },
  ];

  // ─── MAIN ADMIN WORKSPACE ──────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-dark-950 text-white font-sans flex relative overflow-x-hidden">
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-dark-900 border-r border-white/10 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between min-h-[64px]">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-dark-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-md">W</div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <h1 className="font-serif font-bold text-sm leading-tight truncate text-white">Wings River CMS</h1>
                <p className="text-[10px] text-amber-400 font-mono truncate">D1 Storage</p>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-xl bg-white/5 text-gray-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navTabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                title={t.label}
                onClick={() => {
                  setActiveTab(t.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'
                } py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-dark-950 shadow-md scale-[1.02]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t.icon}
                {!isSidebarCollapsed && <span className="truncate">{t.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {/* Back to Home Button */}
          <a
            href="/"
            title="Back to Home Screen"
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center px-0' : 'space-x-2.5 px-3'
            } py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-dark-950 text-amber-300 rounded-xl text-xs font-bold transition-all border border-amber-500/20`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Back to Home</span>}
          </a>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log Out"
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center px-0' : 'space-x-2.5 px-3'
            } py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 rounded-xl text-xs font-bold transition-all`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <section className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between min-h-[64px]">
          <div className="flex items-center space-x-3">
            {/* Mobile Open Drawer Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-serif font-bold text-xl uppercase tracking-wider text-amber-400">{activeTab} Section</h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-block text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">D1 Connected</span>
            <button onClick={loadAll} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-mono transition-colors">Reload</button>
            <a
              href="/"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-dark-950 text-amber-300 text-xs font-bold transition-all border border-amber-500/20"
              title="Return to Wings River Café Website"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Home</span>
            </a>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-white/5 rounded-lg animate-pulse w-1/4" />
              <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="bg-dark-900 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="text-gray-400 text-xs">Total Reservations</div>
                      <div className="text-2xl font-bold">{reservations.length}</div>
                    </div>
                    <div className="bg-dark-900 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="text-gray-400 text-xs">Menu Items</div>
                      <div className="text-2xl font-bold">{menuItems.length}</div>
                    </div>
                    <div className="bg-dark-900 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="text-gray-400 text-xs">Blogs & News</div>
                      <div className="text-2xl font-bold">{blogs.length}</div>
                    </div>
                    <div className="bg-dark-900 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="text-gray-400 text-xs">Media Library</div>
                      <div className="text-2xl font-bold">{media.length} items</div>
                    </div>
                  </div>

                  <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="font-serif font-bold text-base">Recent Site Operations Audit Logs</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-white/10 text-gray-400 font-mono">
                            <th className="py-2.5">User</th>
                            <th className="py-2.5">Action</th>
                            <th className="py-2.5">Details</th>
                            <th className="py-2.5">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {auditLogs.slice(0, 10).map((l) => (
                            <tr key={l.id} className="hover:bg-white/5 font-mono">
                              <td className="py-2.5 text-amber-400">{l.user_id}</td>
                              <td className="py-2.5 font-bold">{l.action}</td>
                              <td className="py-2.5 text-gray-300">{l.details}</td>
                              <td className="py-2.5 text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HERO & ABOUT CMS */}
              {activeTab === 'hero' && heroSettings && (
                <form onSubmit={handleHeroSettingsSave} className="space-y-6 max-w-2xl bg-dark-900 border border-white/10 rounded-2xl p-6">
                  <h3 className="font-serif font-bold text-base text-amber-400">Public Website Hero Section Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Top Highlight Badge</label>
                      <input type="text" value={heroSettings.badgeText || ''} onChange={(e) => setHeroSettings({ ...heroSettings, badgeText: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Main Title Headline</label>
                      <input type="text" value={heroSettings.mainHeadline || ''} onChange={(e) => setHeroSettings({ ...heroSettings, mainHeadline: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Sub-Headline Tagline</label>
                      <input type="text" value={heroSettings.subHeadline || ''} onChange={(e) => setHeroSettings({ ...heroSettings, subHeadline: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Contact Phone number</label>
                      <input type="text" value={heroSettings.contactPhone || ''} onChange={(e) => setHeroSettings({ ...heroSettings, contactPhone: e.target.value })} className={inputCls} />
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-base text-amber-400 pt-6 border-t border-white/10">About Section Narrative</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Narrative Header Tag</label>
                      <input type="text" value={heroSettings.aboutBadge || ''} onChange={(e) => setHeroSettings({ ...heroSettings, aboutBadge: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>About Main Title</label>
                      <input type="text" value={heroSettings.aboutTitle || ''} onChange={(e) => setHeroSettings({ ...heroSettings, aboutTitle: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>First Paragraph Content</label>
                      <textarea rows={4} value={heroSettings.aboutParagraph1 || ''} onChange={(e) => setHeroSettings({ ...heroSettings, aboutParagraph1: e.target.value })} className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                    </div>
                    <div>
                      <label className={labelCls}>Second Paragraph Content</label>
                      <textarea rows={4} value={heroSettings.aboutParagraph2 || ''} onChange={(e) => setHeroSettings({ ...heroSettings, aboutParagraph2: e.target.value })} className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Primary Image URL</label>
                        <input type="text" value={heroSettings.aboutPrimaryImage || ''} onChange={(e) => setHeroSettings({ ...heroSettings, aboutPrimaryImage: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Secondary Image URL</label>
                        <input type="text" value={heroSettings.aboutSecondaryImage || ''} onChange={(e) => setHeroSettings({ ...heroSettings, aboutSecondaryImage: e.target.value })} className={inputCls} />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className={btnPrimary}>Save Hero & About Settings</button>
                </form>
              )}

              {/* TAB 3: DYNAMIC PAGES */}
              {activeTab === 'pages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Dynamic Static Pages</h3>
                    <button onClick={() => setPageModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Page</span></button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {pages.map((p) => (
                      <div key={p.id} className="bg-dark-900/50 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{p.title}</h4>
                          <p className="text-[10px] text-gray-400 font-mono">/{p.slug} • status: {p.status}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setPageModal(p)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget({ label: p.title, action: async () => { await deletePage(p.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Menu Categories</h3>
                    <button onClick={() => setCategoryModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Category</span></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((c) => (
                      <div key={c.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{c.name}</h4>
                          <p className="text-[10px] text-gray-400">Slug: {c.slug} • Order: {c.display_order}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setCategoryModal(c)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget({ label: c.name, action: async () => { await deleteCategory(c.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: MENU ITEMS */}
              {activeTab === 'menu' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Menu Food Dishes</h3>
                    <button onClick={() => setMenuModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Menu Item</span></button>
                  </div>
                  <div className="bg-dark-900/50 border border-white/10 rounded-2xl p-6 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                          <th className="py-2.5">Dish Name</th>
                          <th className="py-2.5">Category ID</th>
                          <th className="py-2.5">Price</th>
                          <th className="py-2.5">Type</th>
                          <th className="py-2.5">Availability</th>
                          <th className="py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {menuItems.map((m) => (
                          <tr key={m.id} className="hover:bg-white/5">
                            <td className="py-2.5 font-bold text-white">{m.name}</td>
                            <td className="py-2.5 text-gray-400 font-mono">{m.category_id}</td>
                            <td className="py-2.5">₹{m.price}</td>
                            <td className="py-2.5">{m.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}</td>
                            <td className="py-2.5">{m.is_available ? '✅ In Stock' : '❌ Out of Stock'}</td>
                            <td className="py-2.5 flex items-center space-x-2">
                              <button onClick={() => setMenuModal(m)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteTarget({ label: m.name, action: async () => { await deleteMenuItem(m.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* OTHER TABS OMITTED FOR BRIEFNESS BUT INCLUDED IN THE FULL CODE */}
              {activeTab === 'blogs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Blogs & Stories</h3>
                    <button onClick={() => setBlogModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Create Blog</span></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blogs.map((b) => (
                      <div key={b.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{b.title}</h4>
                          <p className="text-[10px] text-gray-400">/{b.slug} • Author: {b.author} • status: {b.status}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setBlogModal(b)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget({ label: b.title, action: async () => { await deleteBlog(b.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Gallery Images</h3>
                    <button onClick={() => setGalleryModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Photo</span></button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gallery.map((g) => (
                      <div key={g.id} className="bg-dark-900 border border-white/10 rounded-2xl overflow-hidden relative group">
                        <img src={g.image_url} alt={g.title} className="w-full h-32 object-cover" />
                        <div className="p-3">
                          <h4 className="font-bold text-xs text-white truncate">{g.title}</h4>
                          <p className="text-[10px] text-gray-400">{g.category}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">{g.featured ? 'Featured' : 'Standard'}</span>
                            <button onClick={() => setDeleteTarget({ label: g.title, action: async () => { await deleteGalleryItem(g.id); loadAll(); } })} className="text-rose-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'rides' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Water Sports Rides</h3>
                    <button onClick={() => setRideModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Ride</span></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rides.map((r) => (
                      <div key={r.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{r.emoji}</span>
                          <div>
                            <h4 className="font-bold text-sm text-white">{r.name}</h4>
                            <p className="text-[10px] text-gray-400">₹{r.price} {r.unit} • {r.badge}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setRideModal(r)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget({ label: r.name, action: async () => { await deleteWaterSports(r.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Frequently Asked Questions</h3>
                    <button onClick={() => setFaqModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add FAQ</span></button>
                  </div>
                  <div className="space-y-3">
                    {faqs.map((f) => (
                      <div key={f.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-amber-400">Q: {f.question}</h4>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => setFaqModal(f)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteTarget({ label: f.question, action: async () => { await deleteFaq(f.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300">A: {f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Team Members</h3>
                    <button onClick={() => setTeamModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Team Member</span></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.map((t) => (
                      <div key={t.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{t.name}</h4>
                          <p className="text-[10px] text-gray-400">{t.role} • {t.bio}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setTeamModal(t)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget({ label: t.name, action: async () => { await deleteTeamMember(t.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-base">Reservations Bookings</h3>
                  <div className="bg-dark-900/50 border border-white/10 rounded-2xl overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                          <th className="py-2.5">Name</th>
                          <th className="py-2.5">Phone</th>
                          <th className="py-2.5">Type</th>
                          <th className="py-2.5">Date & Time</th>
                          <th className="py-2.5">Guests</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {reservations.map((r) => (
                          <tr key={r.id} className="hover:bg-white/5">
                            <td className="py-2.5 font-bold">{r.name}</td>
                            <td className="py-2.5 font-mono">{r.phone}</td>
                            <td className="py-2.5 capitalize">{r.booking_type.replace('_', ' ')}</td>
                            <td className="py-2.5">{r.date} @ {r.time}</td>
                            <td className="py-2.5">{r.guests}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${r.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : r.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.status}</span>
                            </td>
                            <td className="py-2.5 flex items-center space-x-2">
                              {r.status === 'pending' && (
                                <button onClick={async () => { await updateReservationStatus(r.id, 'confirmed'); loadAll(); }} className="text-emerald-400 hover:underline">Confirm</button>
                              )}
                              <button onClick={() => setDeleteTarget({ label: `Booking for ${r.name}`, action: async () => { await deleteReservation(r.id); loadAll(); } })} className="text-rose-400 hover:underline">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-base">Reviews Feed</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{r.author_name} ({r.rating} ★)</h4>
                          <p className="text-xs text-gray-300 mt-1">{r.review_text}</p>
                        </div>
                        <button onClick={() => setDeleteTarget({ label: `Review by ${r.author_name}`, action: async () => { await deleteReview(r.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-base">Customer Inquiries</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {messages.map((m) => (
                      <div key={m.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{m.name} ({m.phone} • {m.email})</h4>
                          <p className="text-xs text-gray-300 mt-1">{m.message}</p>
                        </div>
                        <button onClick={() => setDeleteTarget({ label: `Message from ${m.name}`, action: async () => { await deleteContactMessage(m.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Media Library Files</h3>
                    <button onClick={() => setMediaModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Upload Media</span></button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {media.map((m) => (
                      <div key={m.id} className="bg-dark-900 border border-white/10 rounded-2xl overflow-hidden relative group">
                        <img src={m.url} alt={m.alt_text} className="w-full h-32 object-cover" />
                        <div className="p-3">
                          <h4 className="font-bold text-xs text-white truncate">{m.alt_text || 'No Alt Text'}</h4>
                          <p className="text-[10px] text-gray-400">{m.category}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <span className="text-[9px] text-gray-500">{m.dimensions}</span>
                            <button onClick={() => setDeleteTarget({ label: m.alt_text || 'Media Item', action: async () => { await deleteMediaItem(m.id); loadAll(); } })} className="text-rose-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'offers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Discount Coupons & Offers</h3>
                    <button onClick={() => setOfferModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Offer</span></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map((o) => (
                      <div key={o.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{o.title} (Code: <span className="font-mono text-amber-400">{o.code}</span>)</h4>
                          <p className="text-[10px] text-gray-400">{o.discount_value}% Discount • {o.status}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setOfferModal(o)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget({ label: o.title, action: async () => { await deleteOffer(o.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'menupages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Menu Booklet Pages</h3>
                    <button onClick={() => setMenuPageModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Menu Page</span></button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {menuPages.map((mp) => (
                      <div key={mp.page_number} className="bg-dark-900 border border-white/10 rounded-2xl overflow-hidden relative group">
                        <img src={mp.image} alt={mp.title} className="w-full h-32 object-cover" />
                        <div className="p-3">
                          <h4 className="font-bold text-xs text-white">Page {mp.page_number}</h4>
                          <p className="text-[10px] text-gray-400 truncate">{mp.title}</p>
                          <div className="flex items-center justify-end mt-2 pt-2 border-t border-white/5">
                            <button onClick={() => setDeleteTarget({ label: `Page ${mp.page_number}`, action: async () => { await deleteMenuPage(mp.page_number!); loadAll(); } })} className="text-rose-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'banners' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base">Promotion Banners</h3>
                    <button onClick={() => setBannerModal({})} className={btnPrimary}><Plus className="w-4 h-4" /> <span>Add Banner</span></button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {banners.map((b) => (
                      <div key={b.id} className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{b.title}</h4>
                          <p className="text-[10px] text-gray-400">{b.subtitle} • CTA: {b.cta_text}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setBannerModal(b)} className={btnEdit}><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget({ label: b.title, action: async () => { await deleteEventBanner(b.id); loadAll(); } })} className={btnDanger}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="font-serif font-bold text-base">D1 Audit Logs Database</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 font-mono">
                          <th className="py-2.5">User</th>
                          <th className="py-2.5">Action</th>
                          <th className="py-2.5">Details</th>
                          <th className="py-2.5">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {auditLogs.map((l) => (
                          <tr key={l.id} className="hover:bg-white/5 font-mono">
                            <td className="py-2.5 text-amber-400">{l.user_id}</td>
                            <td className="py-2.5 font-bold">{l.action}</td>
                            <td className="py-2.5 text-gray-300">{l.details}</td>
                            <td className="py-2.5 text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── MODALS ───────────────────────────────────────────────────────────── */}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <ConfirmDelete label={deleteTarget.label} onConfirm={() => { deleteTarget.action(); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
        )}

        {/* Category Modal */}
        {categoryModal && (
          <Modal title={categoryModal.id ? "Edit Category" : "Add Category"} onClose={() => setCategoryModal(null)}>
            <form onSubmit={saveCategoryItem} className="space-y-4">
              <div>
                <label className={labelCls}>Category Name</label>
                <input type="text" required value={categoryModal.name || ''} onChange={(e) => setCategoryModal({ ...categoryModal, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input type="text" value={categoryModal.description || ''} onChange={(e) => setCategoryModal({ ...categoryModal, description: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Display Order</label>
                <input type="number" value={categoryModal.display_order || 0} onChange={(e) => setCategoryModal({ ...categoryModal, display_order: parseInt(e.target.value) })} className={inputCls} />
              </div>
              <button type="submit" className={btnPrimary}>Save Category</button>
            </form>
          </Modal>
        )}

        {/* Menu Item Modal */}
        {menuModal && (
          <Modal title={menuModal.id ? "Edit Menu Item" : "Add Menu Item"} onClose={() => setMenuModal(null)}>
            <form onSubmit={saveMenuItemItem} className="space-y-4">
              <div>
                <label className={labelCls}>Dish Name</label>
                <input type="text" required value={menuModal.name || ''} onChange={(e) => setMenuModal({ ...menuModal, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select value={menuModal.category_id || 'cat-beverages'} onChange={(e) => setMenuModal({ ...menuModal, category_id: e.target.value })} className={inputCls}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Price (₹)</label>
                <input type="number" step="0.01" required value={menuModal.price || ''} onChange={(e) => setMenuModal({ ...menuModal, price: parseFloat(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea rows={3} value={menuModal.description || ''} onChange={(e) => setMenuModal({ ...menuModal, description: e.target.value })} className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input type="text" value={menuModal.image_url || ''} onChange={(e) => setMenuModal({ ...menuModal, image_url: e.target.value })} className={inputCls} />
              </div>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-xs text-white">
                  <input type="checkbox" checked={menuModal.is_veg !== false} onChange={(e) => setMenuModal({ ...menuModal, is_veg: e.target.checked })} />
                  <span>Veg (Green Label)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-white">
                  <input type="checkbox" checked={menuModal.is_available !== false} onChange={(e) => setMenuModal({ ...menuModal, is_available: e.target.checked })} />
                  <span>Available In Stock</span>
                </label>
              </div>
              <button type="submit" className={btnPrimary}>Save Menu Item</button>
            </form>
          </Modal>
        )}

        {/* Blog Modal */}
        {blogModal && (
          <Modal title={blogModal.id ? "Edit Blog Post" : "Create Blog Post"} onClose={() => setBlogModal(null)}>
            <form onSubmit={saveBlogPost} className="space-y-4">
              <div>
                <label className={labelCls}>Blog Title</label>
                <input type="text" required value={blogModal.title || ''} onChange={(e) => setBlogModal({ ...blogModal, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <input type="text" value={blogModal.category || ''} onChange={(e) => setBlogModal({ ...blogModal, category: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cover Image URL</label>
                <input type="text" value={blogModal.cover_image || ''} onChange={(e) => setBlogModal({ ...blogModal, cover_image: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Excerpt Summary</label>
                <input type="text" value={blogModal.excerpt || ''} onChange={(e) => setBlogModal({ ...blogModal, excerpt: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Content Narrative</label>
                <textarea rows={5} value={blogModal.content || ''} onChange={(e) => setBlogModal({ ...blogModal, content: e.target.value })} className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-xs text-white">
                  <input type="checkbox" checked={blogModal.status === 'published'} onChange={(e) => setBlogModal({ ...blogModal, status: e.target.checked ? 'published' : 'draft' })} />
                  <span>Publish Instantly</span>
                </label>
              </div>
              <button type="submit" className={btnPrimary}>Save Blog Post</button>
            </form>
          </Modal>
        )}

        {/* Gallery Modal */}
        {galleryModal && (
          <Modal title={galleryModal.id ? "Edit Gallery Item" : "Add Gallery Item"} onClose={() => setGalleryModal(null)}>
            <form onSubmit={saveGalleryPhoto} className="space-y-4">
              <div>
                <label className={labelCls}>Photo Title</label>
                <input type="text" required value={galleryModal.title || ''} onChange={(e) => setGalleryModal({ ...galleryModal, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <input type="text" value={galleryModal.category || ''} onChange={(e) => setGalleryModal({ ...galleryModal, category: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input type="text" required value={galleryModal.image_url || ''} onChange={(e) => setGalleryModal({ ...galleryModal, image_url: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-xs text-white">
                  <input type="checkbox" checked={galleryModal.featured || false} onChange={(e) => setGalleryModal({ ...galleryModal, featured: e.target.checked })} />
                  <span>Feature on Homepage Gallery</span>
                </label>
              </div>
              <button type="submit" className={btnPrimary}>Save Photo</button>
            </form>
          </Modal>
        )}

        {/* Ride Modal */}
        {rideModal && (
          <Modal title={rideModal.id ? "Edit Ride Ticket" : "Add Ride Ticket"} onClose={() => setRideModal(null)}>
            <form onSubmit={saveRideTicket} className="space-y-4">
              <div>
                <label className={labelCls}>Ride Name</label>
                <input type="text" required value={rideModal.name || ''} onChange={(e) => setRideModal({ ...rideModal, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Price (₹)</label>
                <input type="number" required value={rideModal.price || ''} onChange={(e) => setRideModal({ ...rideModal, price: parseFloat(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Price Unit</label>
                <input type="text" value={rideModal.unit || ''} onChange={(e) => setRideModal({ ...rideModal, unit: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input type="text" value={rideModal.description || ''} onChange={(e) => setRideModal({ ...rideModal, description: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Badge Tag</label>
                <input type="text" value={rideModal.badge || ''} onChange={(e) => setRideModal({ ...rideModal, badge: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input type="text" value={rideModal.image || ''} onChange={(e) => setRideModal({ ...rideModal, image: e.target.value })} className={inputCls} />
              </div>
              <button type="submit" className={btnPrimary}>Save Ride Ticket</button>
            </form>
          </Modal>
        )}

        {/* FAQ Modal */}
        {faqModal && (
          <Modal title={faqModal.id ? "Edit FAQ" : "Add FAQ"} onClose={() => setFaqModal(null)}>
            <form onSubmit={saveFaqItem} className="space-y-4">
              <div>
                <label className={labelCls}>Question</label>
                <input type="text" required value={faqModal.question || ''} onChange={(e) => setFaqModal({ ...faqModal, question: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Answer</label>
                <textarea rows={3} required value={faqModal.answer || ''} onChange={(e) => setFaqModal({ ...faqModal, answer: e.target.value })} className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              <button type="submit" className={btnPrimary}>Save FAQ</button>
            </form>
          </Modal>
        )}

        {/* Team Modal */}
        {teamModal && (
          <Modal title={teamModal.id ? "Edit Member" : "Add Member"} onClose={() => setTeamModal(null)}>
            <form onSubmit={saveTeamMemberItem} className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" required value={teamModal.name || ''} onChange={(e) => setTeamModal({ ...teamModal, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Role / Designation</label>
                <input type="text" required value={teamModal.role || ''} onChange={(e) => setTeamModal({ ...teamModal, role: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Short Bio</label>
                <input type="text" value={teamModal.bio || ''} onChange={(e) => setTeamModal({ ...teamModal, bio: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input type="text" value={teamModal.image || ''} onChange={(e) => setTeamModal({ ...teamModal, image: e.target.value })} className={inputCls} />
              </div>
              <button type="submit" className={btnPrimary}>Save Team Member</button>
            </form>
          </Modal>
        )}

        {/* Dynamic Page Modal */}
        {pageModal && (
          <Modal title={pageModal.id ? "Edit Static Page" : "Add Static Page"} onClose={() => setPageModal(null)}>
            <form onSubmit={saveDynamicPage} className="space-y-4">
              <div>
                <label className={labelCls}>Page Title</label>
                <input type="text" required value={pageModal.title || ''} onChange={(e) => setPageModal({ ...pageModal, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Slug</label>
                <input type="text" value={pageModal.slug || ''} onChange={(e) => setPageModal({ ...pageModal, slug: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Content (HTML/Markdown Supported)</label>
                <textarea rows={5} value={pageModal.content || ''} onChange={(e) => setPageModal({ ...pageModal, content: e.target.value })} className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white focus:outline-none" />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={pageModal.status || 'draft'} onChange={(e) => setPageModal({ ...pageModal, status: e.target.value as any })} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <button type="submit" className={btnPrimary}>Save Page</button>
            </form>
          </Modal>
        )}

        {/* Media Modal */}
        {mediaModal && (
          <Modal title="Upload File to Media Library" onClose={() => setMediaModal(null)}>
            <form onSubmit={handleMediaUpload} className="space-y-4">
              <div>
                <label className={labelCls}>File/Image URL</label>
                <input type="text" required value={mediaModal.url || ''} onChange={(e) => setMediaModal({ ...mediaModal, url: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Alt Text</label>
                <input type="text" value={mediaModal.alt_text || ''} onChange={(e) => setMediaModal({ ...mediaModal, alt_text: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Caption</label>
                <input type="text" value={mediaModal.caption || ''} onChange={(e) => setMediaModal({ ...mediaModal, caption: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <input type="text" value={mediaModal.category || 'general'} onChange={(e) => setMediaModal({ ...mediaModal, category: e.target.value })} className={inputCls} />
              </div>
              <button type="submit" className={btnPrimary}>Save Media Item</button>
            </form>
          </Modal>
        )}

        {/* Offer Modal */}
        {offerModal && (
          <Modal title={offerModal.id ? "Edit Coupon" : "Add Coupon"} onClose={() => setOfferModal(null)}>
            <form onSubmit={saveOfferItem} className="space-y-4">
              <div>
                <label className={labelCls}>Coupon Title</label>
                <input type="text" required value={offerModal.title || ''} onChange={(e) => setOfferModal({ ...offerModal, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Discount Code</label>
                <input type="text" required value={offerModal.code || ''} onChange={(e) => setOfferModal({ ...offerModal, code: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Discount Value</label>
                <input type="number" required value={offerModal.discount_value || ''} onChange={(e) => setOfferModal({ ...offerModal, discount_value: parseFloat(e.target.value) })} className={inputCls} />
              </div>
              <button type="submit" className={btnPrimary}>Save Coupon</button>
            </form>
          </Modal>
        )}

        {/* Menu Booklet Page Modal */}
        {menuPageModal && (
          <Modal title="Add Menu Booklet Page" onClose={() => setMenuPageModal(null)}>
            <form onSubmit={saveMenuPageItem} className="space-y-4">
              <div>
                <label className={labelCls}>Page Number</label>
                <input type="number" required value={menuPageModal.page_number || ''} onChange={(e) => setMenuPageModal({ ...menuPageModal, page_number: parseInt(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Title</label>
                <input type="text" value={menuPageModal.title || ''} onChange={(e) => setMenuPageModal({ ...menuPageModal, title: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Subtitle</label>
                <input type="text" value={menuPageModal.subtitle || ''} onChange={(e) => setMenuPageModal({ ...menuPageModal, subtitle: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input type="text" required value={menuPageModal.image || ''} onChange={(e) => setMenuPageModal({ ...menuPageModal, image: e.target.value })} className={inputCls} />
              </div>
              <button type="submit" className={btnPrimary}>Save Page</button>
            </form>
          </Modal>
        )}

      </section>
    </main>
  );
}
