'use client';

import React, { useState } from 'react';
import CustomerLayout from '@/components/CustomerLayout';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { UtensilsCrossed, Flame, Leaf, Award, ShoppingCart, Filter, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'all',       label: 'All',          emoji: '🍽️' },
  { id: 'starters',  label: 'Starters',     emoji: '🥗' },
  { id: 'mains',     label: 'Mains',        emoji: '🍛' },
  { id: 'desserts',  label: 'Desserts',     emoji: '🍮' },
  { id: 'drinks',    label: 'Drinks',       emoji: '🥤' },
  { id: 'specials',  label: "Chef's Pick",  emoji: '👨‍🍳' },
];

const MENU_ITEMS = [
  { id: 1, category: 'starters',  name: 'Grilled Paneer Tikka',    price: 280,  veg: true,  rating: 4.8, bestseller: true,  img: '', desc: 'Marinated cottage cheese grilled in clay oven with spiced yoghurt.' },
  { id: 2, category: 'starters',  name: 'Chicken Seekh Kebab',     price: 340,  veg: false, rating: 4.7, bestseller: true,  img: '', desc: 'Minced chicken on skewers with aromatic herbs & spices.' },
  { id: 3, category: 'mains',     name: 'Mutton Rogan Josh',        price: 480,  veg: false, rating: 4.9, bestseller: true,  img: '', desc: 'Slow-cooked Kashmiri lamb curry with whole spices.' },
  { id: 4, category: 'mains',     name: 'Dal Makhani',              price: 220,  veg: true,  rating: 4.6, bestseller: false, img: '', desc: 'Creamy black lentils slow-cooked overnight in a rich butter sauce.' },
  { id: 5, category: 'mains',     name: 'Riverside Fish Curry',     price: 420,  veg: false, rating: 4.8, bestseller: true,  img: '', desc: 'Freshwater fish in tangy Gomti-style coconut gravy.' },
  { id: 6, category: 'desserts',  name: 'Gulab Jamun Sundae',       price: 180,  veg: true,  rating: 4.7, bestseller: false, img: '', desc: 'Warm gulab jamun with vanilla ice cream and rose syrup.' },
  { id: 7, category: 'drinks',    name: 'Mango Lassi',              price: 120,  veg: true,  rating: 4.8, bestseller: true,  img: '', desc: 'Thick, chilled yogurt blended with Alphonso mango pulp.' },
  { id: 8, category: 'drinks',    name: 'Gomti Sunset Mocktail',    price: 160,  veg: true,  rating: 4.9, bestseller: false, img: '', desc: 'Layered passion fruit, orange, and grenadine mocktail.' },
  { id: 9, category: 'specials',  name: 'Wings River Platter',      price: 899,  veg: false, rating: 5.0, bestseller: true,  img: '', desc: 'Mixed grill platter for two: kebabs, tikkas, and tandoori chicken.' },
  { id: 10, category: 'specials', name: 'Vegetarian Feast Thali',   price: 599,  veg: true,  rating: 4.9, bestseller: true,  img: '', desc: 'Complete veg meal with dal, sabzi, roti, rice, papad, and dessert.' },
];

export default function MenuPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});

  const filtered = MENU_ITEMS.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchVeg = !vegOnly || item.veg;
    const matchQ   = !query || item.name.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchVeg && matchQ;
  });

  const cartTotal = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: number) => setCart(prev => {
    const c = { ...prev };
    if (c[id] > 1) c[id]--;
    else delete c[id];
    return c;
  });

  return (
    <CustomerLayout breadcrumbs={[{ label: 'Menu' }]} cartCount={cartTotal}>
      <div className="max-w-2xl mx-auto px-4 pb-8">

        {/* Page Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold font-serif text-white mb-1">
            Our <span className="text-gold-400">Menu</span>
          </h1>
          <p className="text-sm text-white/50">Discover riverside flavours crafted with love</p>
        </div>

        {/* Search & Filter Row */}
        <div className="flex items-center gap-3 mb-5">
          <SearchBar
            id="menu-search"
            value={query}
            onChange={setQuery}
            placeholder="Search dishes…"
            className="flex-1"
          />
          <button
            onClick={() => setVegOnly(v => !v)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all
              ${vegOnly
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}
          >
            <Leaf className="w-3.5 h-3.5" />
            Veg
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all
                ${activeCategory === cat.id
                  ? 'bg-gold-500 text-slate-950 border-gold-500 shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 border-white/10 text-white/65 hover:border-white/30'}`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No dishes found"
            description="Try changing the filters or search query."
            actionLabel="Show All"
            onAction={() => { setQuery(''); setActiveCategory('all'); setVegOnly(false); }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(item => (
              <div
                key={item.id}
                className="relative flex items-start gap-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all group"
              >
                {/* Veg / Non-Veg Indicator */}
                <span
                  className={`absolute top-3 right-3 w-4 h-4 rounded-sm border-2 flex items-center justify-center ${item.veg ? 'border-emerald-500' : 'border-rose-500'}`}
                  title={item.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                  aria-label={item.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                >
                  <span className={`w-2 h-2 rounded-full ${item.veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </span>

                {/* Image Placeholder */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                  <UtensilsCrossed className="w-8 h-8 text-white/20" strokeWidth={1} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="text-sm font-bold text-white leading-tight truncate">{item.name}</h3>
                    {item.bestseller && (
                      <span className="shrink-0 flex items-center gap-0.5 bg-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3" /> Bestseller
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/45 mb-2 line-clamp-2 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gold-400 font-bold text-sm">₹{item.price}</span>
                      <span className="flex items-center gap-0.5 text-[11px] text-white/45">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> {item.rating}
                      </span>
                    </div>
                    {/* Cart Controls */}
                    {cart[item.id] ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center transition-all">−</button>
                        <span className="text-sm font-bold text-gold-400 min-w-[16px] text-center">{cart[item.id]}</span>
                        <button onClick={() => addToCart(item.id)} className="w-7 h-7 rounded-full bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-sm flex items-center justify-center transition-all">+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item.id)}
                        className="flex items-center gap-1 bg-gold-500 hover:bg-gold-400 active:scale-95 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-full transition-all"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Strip */}
      {cartTotal > 0 && (
        <div className="fixed bottom-[68px] lg:bottom-6 inset-x-0 flex justify-center px-4 z-40 pointer-events-none">
          <a
            href="/qr-order"
            className="pointer-events-auto flex items-center justify-between gap-4 w-full max-w-md bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold text-sm px-5 py-3.5 rounded-2xl shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/60 transition-all"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartTotal} item{cartTotal > 1 ? 's' : ''} in cart
            </span>
            <span className="flex items-center gap-1">Checkout & Order <ChevronRight className="w-4 h-4" /></span>
          </a>
        </div>
      )}
    </CustomerLayout>
  );
}
