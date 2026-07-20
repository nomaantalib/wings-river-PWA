'use client';

import React, { useState, useEffect } from 'react';
import {
  getStoredReservations,
  getStoredMenuItems,
  getStoredBlogs,
  getStoredReviews,
  getStoredContactMessages,
  saveMenuItem,
  saveBlog,
  Reservation,
  MenuItem,
  BlogPost,
  Review,
  ContactMessage
} from '@/lib/db';
import { Lock, Utensils, Calendar, FileText, Star, Mail, Plus, Check, LogOut, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'bookings' | 'menu' | 'blogs' | 'reviews' | 'contact'>('bookings');

  // Data states
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Add Item Modals
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);

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
            <h2 className="font-serif font-bold text-2xl text-white">Wings River Admin</h2>
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
      {/* Top Navbar */}
      <header className="bg-dark-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-mint-500/20 border border-mint-500/40 flex items-center justify-center text-mint-400 font-bold font-serif text-sm">
            WR
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-white">Wings River CMS Panel</h1>
            <p className="text-[10px] text-mint-400">Pure Client Architecture</p>
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

      {/* Admin Content Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'bookings', label: 'Reservations', icon: Calendar, count: bookings.length },
            { id: 'menu', label: 'Menu Items', icon: Utensils, count: menuItems.length },
            { id: 'blogs', label: 'Blog Posts', icon: FileText, count: blogs.length },
            { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
            { id: 'contact', label: 'Messages', icon: Mail, count: messages.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

        {/* Tab 1: Bookings / Reservations */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-white">Table & Water Sports Reservations</h3>
            <div className="bg-dark-900 rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-dark-950 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Guest Name</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Booking Type</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Guests</th>
                      <th className="p-4">Special Requests</th>
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
                        <td className="p-4 text-gray-400 italic">{b.special_requests || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Menu Items */}
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

        {/* Tab 3: Blog Posts */}
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

        {/* Tab 4: Reviews */}
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

        {/* Tab 5: Contact Messages */}
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
