'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, Send, CheckCircle2, ChevronDown, ChevronUp, X, Mail, MessageCircle, Instagram, ArrowDown } from 'lucide-react';
import { saveContactMessage, ContactMessage, getSiteSettings } from '@/lib/db';

const DEFAULTS = {
  phone: '07310008020',
  opening_hours: '11:00 AM – 11:59 PM',
  address: 'Laxman Jhula Park, Kala Kankar Colony, Purana Haidarabad, Hazratganj, Lucknow UP 226001',
};

const MAPS_LINK = 'https://maps.app.goo.gl/NRm9bDgWz6gSQ7MCA';
const WA_LINK   = 'https://wa.me/917310008020?text=Hi%20Wings%20River%20Caf%C3%A9%2C%20I%20have%20an%20inquiry.';

function Field({ label, type = 'text', required, placeholder, value, onChange }: {
  label: string; type?: string; required?: boolean; placeholder?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#D4C4A0] mb-1 uppercase tracking-wider">{label}</label>
      <input
        type={type} required={required} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/10 border border-[#E5B82C]/30 text-[#F8E7A1] placeholder:text-[#D4C4A0]/40 focus:outline-none focus:ring-2 focus:ring-[#F5D061]/40"
      />
    </div>
  );
}

export default function LocationSection() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const [cfg, setCfg]           = useState(DEFAULTS);
  const [form, setForm]         = useState({ name: '', phone: '', email: '', message: '' });

  useEffect(() => {
    const load = () => getSiteSettings().then(s => {
      if (s) setCfg({
        phone: s.phone || DEFAULTS.phone,
        opening_hours: (s.opening_hours || DEFAULTS.opening_hours).split('(')[0].trim(),
        address: s.address || DEFAULTS.address,
      });
    });
    load();
    window.addEventListener('wings_db_sync', load);
    return () => window.removeEventListener('wings_db_sync', load);
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
    <section id="location" className="py-10 sm:py-14 bg-[#FAF7F2] border-t border-[#E5B82C]/30 relative">
      <span id="contact" className="absolute -top-16" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ── Heading row ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#1F1810] border border-[#E5B82C]/50 text-[#F5D061] font-bold text-[10px] tracking-widest uppercase mb-2">
              Find Us
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1F1810] leading-tight">
              Wings River Café&nbsp;<span className="text-[#E5B82C]">— Lucknow</span>
            </h2>
            <p className="text-[#7A5C3A] text-xs mt-1">Inside Laxman Mela Ground, Gomti Riverfront · Open 7 days</p>
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <a href={`tel:${cfg.phone}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1F1810] text-[#F5D061] border border-[#E5B82C]/40 rounded-full text-xs font-bold hover:bg-[#2a1f12] transition">
              <Phone className="w-3.5 h-3.5" />{cfg.phone}
            </a>
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#1F1810] rounded-full text-xs font-bold hover:opacity-90 transition shadow-md">
              <Navigation className="w-3.5 h-3.5" />Get Directions
            </a>
            <button
              onClick={() => { setShowForm(v => !v); setSuccess(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition ${showForm ? 'bg-[#E5B82C]/20 border-[#E5B82C]/60 text-[#1F1810]' : 'bg-white border-[#E5B82C]/40 text-[#1F1810] hover:bg-[#FFF8E7]'}`}>
              <Send className="w-3.5 h-3.5" />Send Inquiry
              {showForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* ── Location & Address Info ───────────── */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1F1810] rounded-2xl p-6 border border-[#E5B82C]/25 shadow-xl flex flex-col gap-5">
            <div className="space-y-4">
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address">
                {cfg.address}
              </InfoRow>
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Hours">
                Mon – Sun: {cfg.opening_hours}
              </InfoRow>
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone">
                <a href={`tel:${cfg.phone}`} className="text-[#F5D061] font-bold hover:underline">{cfg.phone}</a>
              </InfoRow>
            </div>

            <div className="pt-4 border-t border-[#E5B82C]/20 flex flex-col sm:flex-row gap-3">
              <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#1F1810] font-extrabold text-xs rounded-xl shadow hover:opacity-90 transition">
                <Navigation className="w-3.5 h-3.5" />Open in Google Maps
              </a>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow hover:bg-emerald-800 transition">
                <MessageCircle className="w-3.5 h-3.5 fill-current" />WhatsApp Inquiry
              </a>
            </div>
          </div>
        </div>



        {/* ── Collapsible Inquiry Form ─────────────────────── */}
        {showForm && (
          <div className="bg-[#1F1810] rounded-2xl p-5 sm:p-6 border border-[#E5B82C]/30 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#F8E7A1]">Send an Inquiry</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4C4A0] transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#F5D061]" />
                <p className="font-bold text-[#F8E7A1]">Message Sent!</p>
                <p className="text-xs text-[#D4C4A0]">Our team will reply shortly.</p>
                <button onClick={() => { setSuccess(false); setShowForm(false); }}
                  className="px-5 py-2 bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#1F1810] font-bold rounded-xl text-xs">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Your Name *" required placeholder="e.g. Priyanshu Singh" value={form.name} onChange={v => setForm({ ...form, name: v })} />
                <Field label="Phone Number *" type="tel" required placeholder="9876543210" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
                <Field label="Email Address" type="email" placeholder="name@example.com" value={form.email} onChange={v => setForm({ ...form, email: v })} />
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#D4C4A0] mb-1 uppercase tracking-wider">Message / Event Details *</label>
                  <textarea required rows={3}
                    placeholder="Birthday party, anniversary, speedboat combo, party menu..."
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/10 border border-[#E5B82C]/30 text-[#F8E7A1] placeholder:text-[#D4C4A0]/40 focus:outline-none focus:ring-2 focus:ring-[#F5D061]/40 resize-none"
                  />
                </div>
                {error && <p className="sm:col-span-2 text-rose-400 text-xs font-semibold text-center">{error}</p>}
                <div className="sm:col-span-2">
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#F8E7A1] text-[#1F1810] font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60">
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
