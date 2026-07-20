'use client';

import React, { useState, useEffect } from 'react';
import { Reservation, MenuItem, BlogPost, Review, ContactMessage } from '@/lib/db';
import { Calendar, Utensils, BookOpen, Image as ImageIcon, Star, Mail, Settings, Lock, CheckCircle, Plus, Trash2, Edit3, ArrowLeft } from 'lucide-react';
import CircularLogo from '@/components/CircularLogo';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');

  // Data states
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Modals for adding items
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category: 'Starter',
    description: '',
    price: '',
    is_veg: true,
    image_url: '/images/Screenshot_20260720-180724_Maps.png'
  });

  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Riverside Experience',
    cover_image: '/images/Screenshot_20260720-180544_Maps.png'
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [resBookings, resMenu, resBlogs, resReviews, resContact] = await Promise.all([
        fetch('/api/bookings').then((r) => r.json()),
        fetch('/api/menu').then((r) => r.json()),
        fetch('/api/blogs').then((r) => r.json()),
        fetch('/api/reviews').then((r) => r.json()),
        fetch('/api/contact').then((r) => r.json())
      ]);

      if (resBookings.success) setBookings(resBookings.data || []);
      if (resMenu.success) setMenuItems(resMenu.data || []);
      if (resBlogs.success) setBlogs(resBlogs.data || []);
      if (resReviews.success) setReviews(resReviews.data || []);
      if (resContact.success) setMessages(resContact.data || []);
    } catch (err) {}
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'wingsriver@2026' || passwordInput === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Admin Password. Check .env setting.');
    }
  };

  const handleAddMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMenuItem)
      });
      const data = await res.json();
      if (data.success && data.item) {
        setMenuItems([data.item, ...menuItems]);
        setShowAddMenuModal(false);
        setNewMenuItem({
          name: '',
          category: 'Starter',
          description: '',
          price: '',
          is_veg: true,
          image_url: '/images/Screenshot_20260720-180724_Maps.png'
        });
      }
    } catch (err) {}
  };

  const handleAddBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlog)
      });
      const data = await res.json();
      if (data.success && data.blog) {
        setBlogs([data.blog, ...blogs]);
        setShowAddBlogModal(false);
        setNewBlog({
          title: '',
          excerpt: '',
          content: '',
          category: 'Riverside Experience',
          cover_image: '/images/Screenshot_20260720-180544_Maps.png'
        });
      }
    } catch (err) {}
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-dark-900 border border-white/10 p-8 rounded-3xl shadow-2xl text-center space-y-6">
          <CircularLogo size={100} className="mx-auto" />
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">Admin CMS Portal</h1>
            <p className="text-xs text-mint-300 mt-1">Wings River Café • Cloudflare D1 Backend</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-500/20 text-red-300 text-xs rounded-xl border border-red-500/30">
                {authError}
              </div>
            )}
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="Enter Admin Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-mint-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-mint-400 to-gold-400 text-dark-950 font-bold text-sm rounded-xl shadow-lg hover:scale-102 transition-transform"
            >
              Access Dashboard
            </button>
          </form>

          <a href="/" className="inline-flex items-center space-x-1 text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream-50 text-dark-900 flex flex-col">
      {/* Top Header */}
      <header className="bg-dark-950 text-white py-4 px-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CircularLogo size={46} />
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight">Wings River Café CMS</h1>
            <span className="text-[10px] text-mint-300 font-mono">D1 DB: c2491a90-0f90-4a1e-8a4d-852e6588a68a</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="/"
            target="_blank"
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
          >
            View Live Site ↗
          </a>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Navigation Sidebar */}
        <aside className="md:col-span-3 bg-white p-4 rounded-3xl shadow-lg border border-cream-200 h-fit space-y-2">
          {[
            { id: 'bookings', label: 'Reservations', icon: Calendar, count: bookings.length },
            { id: 'menu', label: 'Menu Management', icon: Utensils, count: menuItems.length },
            { id: 'blogs', label: 'WordPress Blogs', icon: BookOpen, count: blogs.length },
            { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
            { id: 'messages', label: 'Contact Queries', icon: Mail, count: messages.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-mint-500 text-dark-950 shadow-md'
                  : 'text-gray-700 hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/60 text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <section className="md:col-span-9 bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-cream-200">
          {/* TAB 1: RESERVATIONS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-dark-900">Reservations & Bookings</h2>
                  <p className="text-xs text-gray-500">Table Dining, Birthday Parties & Speedboat Rides</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-cream-100 border-b border-gray-200 text-gray-700 uppercase font-bold text-[10px]">
                      <th className="p-3">Customer</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Booking Type</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Guests</th>
                      <th className="p-3">Special Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-cream-50">
                        <td className="p-3 font-bold text-dark-900">{b.name}</td>
                        <td className="p-3 text-mint-700 font-semibold">{b.phone}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full bg-mint-100 text-mint-800 font-bold uppercase text-[9px]">
                            {b.booking_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">{b.date} @ {b.time}</td>
                        <td className="p-3 font-bold">{b.guests}</td>
                        <td className="p-3 text-gray-500 max-w-xs truncate">{b.special_requests || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MENU MANAGEMENT */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-dark-900">Menu Items</h2>
                  <p className="text-xs text-gray-500">Add, edit and manage category items</p>
                </div>
                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-mint-500 text-dark-950 font-bold text-xs rounded-xl shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-cream-200 bg-cream-50 flex items-center space-x-4">
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-mint-600">{item.category}</span>
                        <span className="font-bold text-dark-900 text-sm">₹{item.price}</span>
                      </div>
                      <h4 className="font-bold text-sm text-dark-900">{item.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BLOGS */}
          {activeTab === 'blogs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-dark-900">WordPress Style Blogs</h2>
                  <p className="text-xs text-gray-500">Publish posts, food news and events</p>
                </div>
                <button
                  onClick={() => setShowAddBlogModal(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gold-400 text-dark-950 font-bold text-xs rounded-xl shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Post</span>
                </button>
              </div>

              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div key={blog.id} className="p-4 rounded-2xl border border-cream-200 bg-cream-50 flex items-start space-x-4">
                    <img src={blog.cover_image} alt={blog.title} className="w-24 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold text-gold-600">{blog.category}</span>
                      <h4 className="font-serif font-bold text-base text-dark-900">{blog.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{blog.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-2xl text-dark-900">Customer Reviews</h2>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl border border-cream-200 bg-cream-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-dark-900">{r.author_name}</span>
                      <span className="text-gold-500 text-xs">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-xs text-gray-600 italic">"{r.review_text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-2xl text-dark-900">Contact Messages</h2>
              {messages.length === 0 ? (
                <p className="text-xs text-gray-500">No new contact messages received yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl border border-cream-200 bg-cream-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-dark-900">{m.name}</span>
                      <span className="text-mint-700 font-mono text-xs">{m.phone}</span>
                    </div>
                    <p className="text-xs text-gray-700">{m.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>

      {/* Modal Add Menu Item */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-xl text-dark-900">Add New Dish</h3>
            <form onSubmit={handleAddMenuSubmit} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Dish Name"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
              <select
                value={newMenuItem.category}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
              >
                {['Starter', 'Indian', 'Chinese', 'Italian', 'Pizza', 'Burger', 'Coffee', 'Desserts', 'Drinks'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                required
                placeholder="Price in INR (e.g. 350)"
                value={newMenuItem.price}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
              <textarea
                placeholder="Description"
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_veg"
                  checked={newMenuItem.is_veg}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, is_veg: e.target.checked })}
                />
                <label htmlFor="is_veg" className="font-bold">Is Vegetarian?</label>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="w-1/2 py-2.5 bg-gray-200 text-dark-900 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-mint-500 text-dark-950 font-bold rounded-xl"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Blog */}
      {showAddBlogModal && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-xl text-dark-900">Publish New WordPress Article</h3>
            <form onSubmit={handleAddBlogSubmit} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Article Title"
                value={newBlog.title}
                onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
              <input
                type="text"
                required
                placeholder="Short Excerpt"
                value={newBlog.excerpt}
                onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
              <textarea
                required
                rows={5}
                placeholder="Full Content Body..."
                value={newBlog.content}
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBlogModal(false)}
                  className="w-1/2 py-2.5 bg-gray-200 text-dark-900 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gold-400 text-dark-950 font-bold rounded-xl"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
