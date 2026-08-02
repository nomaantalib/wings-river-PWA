'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, Mail, Send, CheckCircle2 } from 'lucide-react';
import { saveContactMessage, ContactMessage, getSiteSettings, SiteSettings } from '@/lib/db';

const DEFAULTS: Partial<SiteSettings> = {
  phone: '07310008020',
  opening_hours: '11:00 AM – 11:59 PM (Open Daily)',
  address: 'Laxman Mela Ground, Laxman Jhula Park, Gomti River Front, Hazratganj, Lucknow, UP 226001',
  email: 'wingsrivercafe@gmail.com',
};

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [siteCfg, setSiteCfg] = useState<Partial<SiteSettings>>(DEFAULTS);

  useEffect(() => {
    let active = true;
    getSiteSettings().then((s) => { if (active && s) setSiteCfg(s); });
    const onSync = () => getSiteSettings().then((s) => { if (active && s) setSiteCfg(s); });
    window.addEventListener('wings_db_sync', onSync);
    return () => { active = false; window.removeEventListener('wings_db_sync', onSync); };
  }, []);

  const phone        = siteCfg.phone        || DEFAULTS.phone!;
  const hours        = siteCfg.opening_hours || DEFAULTS.opening_hours!;
  const address      = siteCfg.address       || DEFAULTS.address!;

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
      setError(err?.message || `Failed to send message. Please call us directly at ${phone}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#FAF7F2] text-[#1F1810] relative overflow-hidden border-t border-[#E5B82C]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1F1810] border border-[#E5B82C]/50 text-[#F5D061] text-xs font-bold uppercase tracking-widest">
              Get in Touch
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1F1810] leading-tight">
              We’d Love to Hear From You
            </h2>
            <p className="text-[#7A5C3A] text-sm leading-relaxed">
              Have questions about booking private birthday canopies, custom party menus, or speedboat tickets? Reach out to our dedicated team.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-[#1F1810] text-[#F5D061] border border-[#E5B82C]/30 shadow-md">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1F1810]">Direct Phone Call</h4>
                  <a href={`tel:${phone}`} className="text-sm text-[#E5B82C] font-semibold hover:underline">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-[#1F1810] text-[#F5D061] border border-[#E5B82C]/30 shadow-md">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1F1810]">Opening Hours</h4>
                  <p className="text-sm text-[#7A5C3A]">{hours.split('(')[0].trim()}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-[#1F1810] text-[#F5D061] border border-[#E5B82C]/30 shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1F1810]">Location &amp; Address</h4>
                  <p className="text-sm text-[#7A5C3A]">{address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side — Compact Pista Green Background */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#5A7A4B] via-[#6B8E5E] to-[#4F6C44] rounded-3xl p-5 sm:p-6 border-2 border-[#4F6C44] shadow-2xl text-white">
            {success ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#F5D061] mx-auto" />
                <h3 className="font-serif font-bold text-xl text-[#FAF7F2]">Message Sent Successfully!</h3>
                <p className="text-xs text-[#E8F0E4]">
                  Thank you for writing to Wings River Café. Our team will respond shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-5 py-2 bg-[#F5D061] text-[#120B08] font-bold rounded-xl text-xs hover:bg-[#E5B82C]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <h3 className="font-serif font-bold text-xl text-[#FAF7F2] mb-3 flex items-center gap-2">
                  <span>Send an Inquiry</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FAF7F2] mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priyanshu Singh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#4F6C44]/80 border border-white/30 text-white font-semibold placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#F5D061]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FAF7F2] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 07310008020"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#4F6C44]/80 border border-white/30 text-white font-semibold placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#F5D061]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FAF7F2] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#4F6C44]/80 border border-white/30 text-white font-semibold placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#F5D061]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FAF7F2] mb-1">Message / Event Details *</label>
                  <textarea
                    required
                    rows={2.5 as any}
                    placeholder="Write your inquiry or party requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#4F6C44]/80 border border-white/30 text-white font-semibold placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#F5D061]"
                  />
                </div>

                {error && (
                  <div className="p-2.5 bg-rose-900/40 border border-rose-400/50 rounded-xl text-rose-200 text-xs text-center font-bold">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#F8E7A1] hover:from-[#E5B82C] hover:to-[#F5D061] text-[#120B08] font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
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
