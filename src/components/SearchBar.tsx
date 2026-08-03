'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '', id }: SearchBarProps) {
  return (
    <div className={`relative group ${className}`}>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-gold-400 transition-colors duration-200 pointer-events-none"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/35
          focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/60 transition-all duration-200
          hover:bg-white/8 hover:border-white/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
