'use client';

import React, { useState, useEffect } from 'react';
import {
  getStoredReservations,
  getStoredMenuItems,
  getStoredBlogs,
  getStoredGalleryItems,
  getStoredReviews,
  getStoredContactMessages,
  saveMenuItem,
  saveBlog,
  saveGalleryItem,
  deleteGalleryItem,
  updateReservationStatus,
  Reservation,
  MenuItem,
  BlogPost,
  GalleryItem,
  Review,
  ContactMessage
} from '@/lib/db';
import {
  Lock,
  Utensils,
  Calendar,
  FileText,
  Star,
  Mail,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'bookings' | 'gallery' | 'menu' | 'blogs' | 'reviews' | 'contact'>('bookings');

  // Data states
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Modals
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);

  // New Gallery Item State
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: '',
    category: 'Restaurant',
    image_url: '/images/Screenshot_20260720-180544_Maps.png',
    featured: true
  });

  // New Menu Item State
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category: 'Starter',
    description: '',
    price: '',
    is_veg: true,
    image_url: '/images/menu_page_1.png'
  });

  // New Blog State
  const [newBlog, setNewBlog] = useState({
    title: '',
    category: 'Food & Dining',
    excerpt: '',
    content: '',
    cover_image: '/images/menu_page_cover.png'
  });

  useEffect(() => {
    const authStatus = localStorage.getItem('wings_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = () => {
    setBookings(getStoredReservations());
    setGalleryItems(getStoredGalleryItems());
    setMenuItems(getStoredMenuItems());
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
      fetchData();
    } else {
      setErrorMsg('Invalid admin password. Default pass: wingsriver@2026');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('wings_admin_auth');
  };

  const handleStatusChange = (id: string, status: string) => {
    const updated = updateReservationStatus(id, status);
    setBookings(updated);
  };

  const handleCreateGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.title || !newGalleryItem.image_url) return;
    const item: GalleryItem = {
      id: 'gal-' + Date.now(),
      title: newGalleryItem.title,
      category: newGalleryItem.category,
      image_url: newGalleryItem.image_url,
      featured: newGalleryItem.featured
    };
    const updated = saveGalleryItem(item);
    setGalleryItems(updated);
    setShowAddGalleryModal(false);
    setNewGalleryItem({ title: '', category: 'Restaurant', image_url: '/images/Screenshot_20260720-180544_Maps.png', featured: true });
  };

  const handleDeleteGallery = (id: string) => {
    const updated = deleteGalleryItem(id);
    setGalleryItems(updated);
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price) return;
    const item: MenuItem = {
      id: 'm-' + Date.now(),
      category: newMenuItem.category,
      name: newMenuItem.name,
      description: newMenuItem.description,
      price: Number(newMenuItem.price),
      is_veg: newMenuItem.is_veg,
      image_url: newMenuItem.image_url || '/images/menu_page_1.png',
      is_available: true
    };
    saveMenuItem(item);
    setMenuItems([item, ...menuItems]);
    setShowAddMenuModal(false);
    setNewMenuItem({ name: '', category: 'Starter', description: '', price: '', is_veg: true, image_url: '/images/menu_page_1.png' });
  };

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content) return;
    const blog: BlogPost = {
      id: 'blog-' + Date.now(),
      title: newBlog.title,
      slug: newBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt: newBlog.excerpt,
      content: newBlog.content,
      category: newBlog.category,
      cover_image: newBlog.cover_image || '/images/menu_page_cover.png',
      author: 'Wings River Team',
      read_time: '4 min read',
      created_at: new Date().toISOString().split('T')[0]
    };
    saveBlog(blog);
    setBlogs([blog, ...blogs]);
    setShowAddBlogModal(false);
    setNewBlog({ title: '', category: 'Food & Dining', excerpt: '', content: '', cover_image: '/images/menu_page_cover.png' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-dark-900 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-mint-500/20 text-mint-400 rounded-full flex items-center justify-center mx-auto border border-mint-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-white">Wings River Admin CMS</h2>
            <p className="text-xs text-gray-400">Enter secure password to access CMS Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Admin Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-dark-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-mint-400"
              />
              <p className="text-[10px] text-gray-500 mt-1">Default Password: <code className="text-gold-400">wingsriver@2026</code></p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-mint-500 text-dark-950 font-bold text-sm rounded-xl hover:bg-mint-400 transition-colors shadow-lg"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="bg-dark-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-gold-400/40 shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-white">Wings River CMS Panel</h1>
            <p className="text-[10px] text-mint-400">Pure Client Architecture • Event & Media Management</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </header>

      {/* Admin Body Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'bookings', label: 'Reservations & Events', icon: Calendar, count: bookings.length },
            { id: 'gallery', label: 'Image Gallery', icon: ImageIcon, count: galleryItems.length },
            { id: 'menu', label: 'Food Menu', icon: Utensils, count: menuItems.length },
            { id: 'blogs', label: 'Blog Articles', icon: FileText, count: blogs.length },
            { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
            { id: 'contact', label: 'Messages', icon: Mail, count: messages.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-mint-500 text-dark-950 shadow-md'
                  : 'bg-dark-900 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-dark-950/40 text-current">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab 1: Bookings & Events */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Table & Event Reservations</h3>
                <p className="text-xs text-gray-400">Manage table bookings, birthday party setups, and water sports rides.</p>
              </div>
            </div>

            <div className="bg-dark-900 rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-dark-950 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Guest Name</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Event Type</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Guests</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5">
                        <td className="p-4 font-bold text-white">{b.name}</td>
                        <td className="p-4 text-mint-400">{b.phone}</td>
                        <td className="p-4 uppercase text-[10px] font-bold text-gold-400">{b.booking_type}</td>
                        <td className="p-4">{b.date} at {b.time}</td>
                        <td className="p-4">{b.guests} Guests</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : b.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleStatusChange(b.id, 'confirmed')}
                              title="Confirm"
                              className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-dark-950"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, 'completed')}
                              title="Complete"
                              className="p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-dark-950"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, 'cancelled')}
                              title="Cancel"
                              className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gallery Images */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Image Gallery Manager</h3>
                <p className="text-xs text-gray-400">Add, view, and delete venue photos displayed in the auto-slideshow gallery.</p>
              </div>
              <button
                onClick={() => setShowAddGalleryModal(true)}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-mint-500 text-dark-950 font-bold text-xs shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-dark-900 rounded-2xl p-3 border border-white/10 relative group">
                  <div className="h-40 rounded-xl overflow-hidden mb-3 relative bg-black">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-dark-950/80 text-gold-400 text-[9px] font-extrabold uppercase border border-gold-400/30">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-white truncate pr-2">{item.title}</h4>
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Menu Items */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-white">Multicuisine Menu Items</h3>
              <button
                onClick={() => setShowAddMenuModal(true)}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-mint-500 text-dark-950 font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-dark-900 rounded-2xl p-4 border border-white/10 flex items-center space-x-4">
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <span className="text-[10px] text-mint-400 font-bold uppercase">{item.category}</span>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-xs text-gold-400 font-bold">₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Blog Articles */}
        {activeTab === 'blogs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-white">WordPress Blog Stories</h3>
              <button
                onClick={() => setShowAddBlogModal(true)}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-mint-500 text-dark-950 font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Post</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-dark-900 rounded-2xl p-5 border border-white/10 space-y-2">
                  <span className="text-[10px] text-gold-400 font-bold uppercase">{blog.category}</span>
                  <h4 className="font-serif font-bold text-base text-white">{blog.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{blog.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-white">Guest Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-dark-900 rounded-2xl p-5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{rev.author_name}</h4>
                    <span className="text-gold-400 text-xs">★ {rev.rating}/5</span>
                  </div>
                  <p className="text-xs text-gray-300 italic">"{rev.review_text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Contact Messages */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-white">Inquiries & Contact Messages</h3>
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="bg-dark-900 rounded-2xl p-5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{m.name} ({m.phone})</h4>
                    <span className="text-[10px] text-gray-500">{m.created_at}</span>
                  </div>
                  <p className="text-xs text-gray-300">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Gallery Item Modal */}
      {showAddGalleryModal && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 flex items-center justify-center p-4">
          <div className="bg-dark-900 rounded-3xl p-6 max-w-md w-full border border-white/10 space-y-4">
            <h3 className="font-serif font-bold text-xl text-white">Add Photo to Gallery</h3>
            <form onSubmit={handleCreateGalleryItem} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Photo Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Riverfront Deck"
                  value={newGalleryItem.title}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Category</label>
                <select
                  value={newGalleryItem.category}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="River View">River View</option>
                  <option value="Evening">Evening</option>
                  <option value="Outdoor Seating">Outdoor Seating</option>
                  <option value="Water Sports">Water Sports</option>
                  <option value="Food">Food</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1">Image URL / Path</label>
                <input
                  type="text"
                  required
                  placeholder="/images/Screenshot_20260720-180544_Maps.png"
                  value={newGalleryItem.image_url}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, image_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-mint-500 text-dark-950 font-bold text-xs rounded-xl"
                >
                  Add Image
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGalleryModal(false)}
                  className="w-full py-2.5 bg-white/10 text-white font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 flex items-center justify-center p-4">
          <div className="bg-dark-900 rounded-3xl p-6 max-w-md w-full border border-white/10 space-y-4">
            <h3 className="font-serif font-bold text-xl text-white">Add New Menu Dish</h3>
            <form onSubmit={handleCreateMenuItem} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Dish Name"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
              />
              <input
                type="number"
                required
                placeholder="Price (₹)"
                value={newMenuItem.price}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
              />
              <textarea
                placeholder="Description"
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-mint-500 text-dark-950 font-bold text-xs rounded-xl"
                >
                  Save Dish
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="w-full py-2.5 bg-white/10 text-white font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Blog Post Modal */}
      {showAddBlogModal && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 flex items-center justify-center p-4">
          <div className="bg-dark-900 rounded-3xl p-6 max-w-md w-full border border-white/10 space-y-4">
            <h3 className="font-serif font-bold text-xl text-white">Publish Blog Post</h3>
            <form onSubmit={handleCreateBlog} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Article Title"
                value={newBlog.title}
                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
              />
              <input
                type="text"
                required
                placeholder="Excerpt / Summary"
                value={newBlog.excerpt}
                onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
              />
              <textarea
                required
                rows={4}
                placeholder="Full Content"
                value={newBlog.content}
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-dark-950 border border-white/10 rounded-xl text-white"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-mint-500 text-dark-950 font-bold text-xs rounded-xl"
                >
                  Publish Article
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBlogModal(false)}
                  className="w-full py-2.5 bg-white/10 text-white font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
