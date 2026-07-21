'use client';

import React, { useState } from 'react';
import { Phone, MapPin, Clock, Mail, Send, CheckCircle2 } from 'lucide-react';
import { saveContactMessage, ContactMessage } from '@/lib/db';

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const msg: ContactMessage = {
        id: 'msg-' + Date.now(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        created_at: new Date().toISOString()
      };
      await saveContactMessage(msg);
      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setError(err?.message || 'Failed to send message. Please call us directly at 07310008020');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-dark-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold-400/20 border border-gold-400/40 text-gold-400 text-xs font-bold uppercase tracking-widest">
              Get in Touch
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              We’d Love to Hear From You
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Have questions about booking private birthday canopies, custom party menus, or speedboat tickets? Reach out to our dedicated team.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-mint-500/10 text-mint-400 border border-mint-500/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Direct Phone Call</h4>
                  <a href="tel:07310008020" className="text-sm text-mint-400 font-semibold hover:underline">
                    07310008020
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-mint-500/10 text-mint-400 border border-mint-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Opening Hours</h4>
                  <p className="text-sm text-gray-400">11:00 AM – 11:59 PM (Open Daily)</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-mint-500/10 text-mint-400 border border-mint-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Location & Address</h4>
                  <p className="text-sm text-gray-400">
                    Laxman Mela Ground, Laxman Jhula Park, Gomti River Front, Hazratganj, Lucknow, UP 226001
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 bg-dark-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
            {success ? (
              <div className="p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-mint-400 mx-auto" />
                <h3 className="font-serif font-bold text-2xl text-white">Message Sent Successfully!</h3>
                <p className="text-sm text-gray-300">
                  Thank you for writing to Wings River Café. Our team will respond shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 bg-mint-500 text-dark-950 font-bold rounded-xl text-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif font-bold text-2xl text-white mb-6">Send an Inquiry</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priyanshu Singh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-white border border-gray-300 text-black font-semibold placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mint-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 07310008020"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 text-sm rounded-xl bg-white border border-gray-300 text-black font-semibold placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mint-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white border border-gray-300 text-black font-semibold placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Message / Event Details *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your inquiry or party requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 text-sm rounded-xl bg-white border border-gray-300 text-black font-semibold placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center font-bold">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-mint-500 hover:bg-mint-400 text-dark-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
