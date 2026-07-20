'use client';

import React, { useState, useEffect } from 'react';
import { getStoredMenuItems, MenuItem } from '@/lib/db';
import { Search, Utensils, Leaf, Flame } from 'lucide-react';

interface FoodMenuSectionProps {
  onOpenBooking: () => void;
}

const CATEGORIES = [
  'All',
  'Starter',
  'Indian',
  'Chinese',
  'Italian',
  'Pizza',
  'Burger',
  'Coffee',
  'Desserts',
  'Drinks'
];

export default function FoodMenuSection({ onOpenBooking }: FoodMenuSectionProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setItems(getStoredMenuItems());
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="py-16 bg-cream-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold-300/30 border border-gold-400/40 text-gold-700 font-semibold text-xs tracking-widest uppercase mb-3">
            Culinary Offerings
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 tracking-tight mb-4">
            Multicuisine Gourmet Menu
          </h2>
          <p className="font-sans text-gray-600 text-base">
            Savor hand-crafted dishes made with fresh ingredients by our expert culinary team.
          </p>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-mint-500 text-dark-950 shadow-md shadow-mint-300/40 scale-105'
                    : 'bg-white text-gray-700 hover:bg-mint-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mint-400 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-cream-200 hover:border-mint-300 hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Item Image */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm ${
                      item.is_veg
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    {item.is_veg ? (
                      <>
                        <Leaf className="w-3 h-3 text-emerald-600" />
                        <span>VEG</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3 h-3 text-rose-600" />
                        <span>NON-VEG</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-gold-400 font-serif font-bold text-sm border border-gold-400/30">
                  ₹{item.price}
                </div>
              </div>

              {/* Item Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-mint-600">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-dark-900 mb-2 group-hover:text-mint-700 transition-colors">
                    {item.name}
                  </h3>

                  <p className="font-sans text-xs text-gray-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={onOpenBooking}
                  className="w-full py-2.5 bg-cream-100 hover:bg-mint-400 text-dark-900 font-bold text-xs rounded-xl border border-mint-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Reserve Table to Enjoy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
