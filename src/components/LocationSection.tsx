'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin, Navigation, Clock, Phone, Send, CheckCircle2, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { saveContactMessage, ContactMessage, getSiteSettings, SiteSettings } from '@/lib/db';

const DEFAULTS = {
  phone: '07310008020',
  opening_hours: '11:00 AM – 11:59 PM',
  address: 'Laxman Mela Ground, Laxman Jhula Park, Gomti Riverfront, Hazratganj, Lucknow UP 226001',
};

const MAP_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1779.6997424578135!2d80.94902!3d26.85764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd007c08a68b%3A0xb35a3a789ef51a70!2sLucknow%20water%20sports%20wings%20River!5e0!3m2!1sen!2sin!4v1711111111111!5m2!1sen!2sin';

const MAPS_LINK = 'https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA';

export default function LocationSection() {
  const [showForm, setShowForm]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');
  const [cfg, setCfg]               = useState(DEFAULTS);
  const [form, setForm]             = useState({ name: '', phone: '', email: '', message: '' });

  useEffect(() => {
    getSiteSettings().then((s) => {
      if (s) setCfg({
        phone: s.phone || DEFAULTS.phone,
        opening_hours: (s.opening_hours || DEFAULTS.opening_hours).split('(')[0].trim(),
        address: s.address || DEFAULTS.address,
      });
    });
    const onSync = () => getSiteSettings().then((s) => { if (s) setCfg({ phone: s.phone || DEFAULTS.phone, opening_hours: (s.opening_hours || DEFAULTS.opening_hours).split('(')[0].trim(), address: s.address || DEFAULTS.address }); });
    window.addEventListener('wings_db_sync', onSync);
    return () => window.removeEventListener('wings_db_sync', onSync);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await saveContactMessage({ id: `msg-${Date.now()}`, ...form, created_at: new Date().toISOString() } as ContactMessage);
      setSuccess(true);
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setError(err?.message || `Failed to send. Call us at ${cfg.phone}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="location" className="py-10 sm:py-14 bg-[#FAF7F2] border-t border-[#E5B82C]/30">
      {/* Alias for #contact anchor */}
      <span id="contact" className="absolute -top-1" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ── Top Info Row ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#1F1810] border border-[#E5B82C]/50 text-[#F5D061] font-bold text-[10px] tracking-widest uppercase mb-1">
              Find Us
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1F1810] leading-tight">
              Wings River Café&nbsp;
              <span className="text-[#E5B82C]">— Lucknow</span>
            </h2>
            <p className="text-[#7A5C3A] text-xs mt-1">Inside Laxman Mela Ground, Gomti Riverfront · Open 7 days</p>
          </div>

          {/* Quick action pills */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href={`tel:${cfg.phone}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1F1810] text-[#F5D061] border border-[#E5B82C]/40 rounded-full text-xs font-bold hover:bg-[#2a1f12] transition"
            >
              <Phone className="w-3.5 h-3.5" />
              {cfg.phone}
            </a>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#1F1810] rounded-full text-xs font-bold hover:opacity-90 transition shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" />
              Get Directions
            </a>
            <button
              onClick={() => { setShowForm(v => !v); setSuccess(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition ${
                showForm
                  ? 'bg-[#E5B82C]/20 border-[#E5B82C]/60 text-[#1F1810]'
                  : 'bg-white border-[#E5B82C]/40 text-[#1F1810] hover:bg-[#FFF8E7]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Send Inquiry
              {showForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* ── Main Card ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* Info card */}
          <div className="lg:col-span-4 bg-[#1F1810] rounded-2xl p-5 border border-[#E5B82C]/25 shadow-xl flex flex-col gap-4">
            <div className="space-y-3">
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address">
                Laxman Jhula Park, Kala Kankar Colony, Purana Haidarabad, Hazratganj, Lucknow 226001
              </InfoRow>
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Hours">
                Mon – Sun: {cfg.opening_hours}
              </InfoRow>
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone">
                <a href={`tel:${cfg.phone}`} className="text-[#F5D061] font-bold hover:underline">{cfg.phone}</a>
              </InfoRow>
            </div>

            <div className="mt-auto pt-3 border-t border-[#E5B82C]/20">
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#1F1810] font-extrabold text-xs rounded-xl shadow hover:opacity-90 transition"
              >
                <Navigation className="w-3.5 h-3.5" />
                Google Maps Directions
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-[#E5B82C]/25 shadow-xl min-h-[240px] sm:min-h-[280px] bg-[#E8DFD0]">
            <iframe
              title="Wings River Café Location Map"
              src={MAP_URL}
              className="w-full h-full min-h-[240px] sm:min-h-[280px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* ── Collapsible Inquiry Form ───────────────────────── */}
        {showForm && (
          <div className="bg-[#1F1810] rounded-2xl p-5 sm:p-6 border border-[#E5B82C]/30 shadow-2xl text-white animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#F8E7A1]">Send an Inquiry</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4C4A0] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#F5D061]" />
                <p className="font-bold text-[#F8E7A1]">Message Sent!</p>
                <p className="text-xs text-[#D4C4A0]">Our team will get back to you shortly.</p>
                <button
                  onClick={() => { setSuccess(false); setShowForm(false); }}
                  className="px-5 py-2 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#1F1810] font-bold rounded-xl text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                  label="Your Name *" type="text" required placeholder="e.g. Priyanshu Singh"
                  value={form.name} onChange={v => setForm({ ...form, name: v })}
                />
                <FormInput
                  label="Phone Number *" type="tel" required placeholder="e.g. 9876543210"
                  value={form.phone} onChange={v => setForm({ ...form, phone: v })}
                />
                <FormInput
                  label="Email Address" type="email" placeholder="name@example.com"
                  value={form.email} onChange={v => setForm({ ...form, email: v })}
                />
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-[#D4C4A0] mb-1 uppercase tracking-wider">
                    Message / Event Details *
                  </label>
                  <textarea
                    required rows={3}
                    placeholder="Birthday party, anniversary, speedboat combo, party menu..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/10 border border-[#E5B82C]/30 text-[#F8E7A1] font-medium placeholder:text-[#D4C4A0]/40 focus:outline-none focus:ring-2 focus:ring-[#F5D061]/40 resize-none"
                  />
                </div>

                {error && (
                  <p className="sm:col-span-2 text-rose-400 text-xs font-semibold text-center">{error}</p>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit" disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#F8E7A1] text-[#1F1810] font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Sub-components ────────────────────────────────────────── */
function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-[#F5D061] shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#F5D061] mb-0.5">{label}</p>
        <div className="text-xs text-[#D4C4A0] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function FormInput({ label, type, required, placeholder, value, onChange }: {
  label: string; type: string; required?: boolean; placeholder?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#D4C4A0] mb-1 uppercase tracking-wider">{label}</label>
      <input
        type={type} required={required} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/10 border border-[#E5B82C]/30 text-[#F8E7A1] font-medium placeholder:text-[#D4C4A0]/40 focus:outline-none focus:ring-2 focus:ring-[#F5D061]/40"
      />
    </div>
  );
}
