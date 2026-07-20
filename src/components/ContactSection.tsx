'use client';

import React, { useState } from 'react';
import { Phone, Clock, Mail, Send, CheckCircle, MapPin } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        setErrorMsg(data.message || 'Error sending message.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect. Please call us directly at 07310008020');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-cream-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Direct Call & Info */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-mint-200 border border-mint-300 text-mint-800 font-semibold text-xs tracking-widest uppercase">
              Get In Touch
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 tracking-tight leading-tight">
              We’d Love to Hear From You
            </h2>
            <p className="font-sans text-gray-600 text-base leading-relaxed">
              Have questions about party packages, table reservations, corporate event hosting, or speedboat water sports? Contact our friendly team today.
            </p>

            {/* Direct Phone Call Card */}
            <a
              href="tel:07310008020"
              className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-mint-500 to-mint-600 text-dark-950 shadow-xl hover:scale-102 transition-transform duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-dark-950 shrink-0">
                <Phone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-dark-900/80">
                  Click To Call Direct
                </span>
                <p className="font-serif font-extrabold text-2xl text-dark-950 group-hover:underline">
                  07310008020
                </p>
              </div>
            </a>

            {/* Operating Hours & Location summary */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-cream-200 space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gold-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-dark-900 text-sm">Opening Hours</h4>
                  <p className="text-xs text-gray-500">Monday – Sunday: 11:00 AM – 11:59 PM</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 border-t border-gray-100 pt-3">
                <MapPin className="w-5 h-5 text-mint-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-dark-900 text-sm">Address</h4>
                  <p className="text-xs text-gray-500">Laxman Mela Ground, Purana Haidarabad, Hazratganj, Lucknow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-cream-200">
            <h3 className="font-serif font-bold text-2xl text-dark-900 mb-2">Send Us a Message</h3>
            <p className="text-xs text-gray-500 mb-6">Fill in the details below and we will get back to you promptly.</p>

            {submitted ? (
              <div className="bg-mint-50 border border-mint-300 p-8 rounded-2xl text-center space-y-3 animate-fade-in">
                <CheckCircle className="w-12 h-12 text-mint-600 mx-auto" />
                <h4 className="font-serif font-bold text-xl text-dark-900">Message Sent Successfully!</h4>
                <p className="text-sm text-gray-600">
                  Thank you for reaching out to Wings River Café. Our manager will call you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-mint-500 text-dark-950 font-bold text-xs rounded-xl"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mint-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="07310008020"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mint-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your event, table booking, or general inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-mint-400 via-mint-500 to-gold-400 text-dark-950 font-bold text-sm rounded-xl shadow-xl hover:shadow-mint-500/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending Message...' : 'Send Message Now'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
