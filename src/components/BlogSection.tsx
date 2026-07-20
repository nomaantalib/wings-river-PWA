'use client';

import React, { useState, useEffect } from 'react';
import { getStoredBlogs, BlogPost } from '@/lib/db';
import { Calendar, User, Clock, ArrowRight, X, ChevronLeft, ChevronRight, Image as ImageIcon, Tag, Sparkles, BookOpen } from 'lucide-react';

interface BlogSectionProps {
  onOpenBooking?: () => void;
}

export default function BlogSection({ onOpenBooking }: BlogSectionProps = {}) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  useEffect(() => {
    getStoredBlogs().then(setBlogs);
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  const filteredBlogs = selectedCategory === 'All'
    ? blogs
    : blogs.filter(b => b.category === selectedCategory);

  const openBlogReader = (blog: BlogPost) => {
    setActiveBlog(blog);
    setActiveImageIndex(0);
  };

  const closeBlogReader = () => {
    setActiveBlog(null);
    setActiveImageIndex(0);
  };

  const activeBlogImages = activeBlog
    ? (activeBlog.images && activeBlog.images.length > 0 ? activeBlog.images : [activeBlog.cover_image])
    : [];

  const nextImage = () => {
    if (activeBlogImages.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % activeBlogImages.length);
    }
  };

  const prevImage = () => {
    if (activeBlogImages.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + activeBlogImages.length) % activeBlogImages.length);
    }
  };

  return (
    <section id="blog" className="py-20 bg-cream-50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-xs tracking-widest uppercase mb-3 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Riverside Journal & Blog</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 tracking-tight mb-4">
            Stories, Food News & Event Highlights
          </h2>
          <p className="font-sans text-gray-600 text-base leading-relaxed">
            Discover restaurant stories, multicuisine recipes, party planning guides, Lucknow Water Sports ticket updates, and evening sunset vibes.
          </p>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-dark-950 shadow-md scale-105'
                    : 'bg-white text-gray-600 hover:bg-amber-50 hover:text-amber-800 border border-cream-200'
                }`}
              >
                {cat === 'All' ? '✨ All Articles' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((post) => {
            const postImages = post.images && post.images.length > 0 ? post.images : [post.cover_image];
            const isExpanded = expandedCardId === post.id;

            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-cream-200 hover:shadow-2xl transition-all duration-300 flex flex-col group"
              >
                {/* Card Image Banner */}
                <div className="relative h-56 overflow-hidden bg-dark-950 cursor-pointer" onClick={() => openBlogReader(post)}>
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                    {post.category}
                  </span>

                  {/* Multi-Image Count Badge */}
                  {postImages.length > 1 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-dark-950 font-extrabold text-[10px] flex items-center space-x-1 shadow-md">
                      <ImageIcon className="w-3 h-3" />
                      <span>{postImages.length} Photos</span>
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Meta Header */}
                    <div className="flex items-center space-x-3 text-[11px] text-gray-500 mb-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        <span>{post.created_at}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{post.read_time}</span>
                      </span>
                    </div>

                    {/* Article Title */}
                    <h3
                      className="font-serif font-bold text-lg text-dark-900 mb-2 group-hover:text-amber-700 transition-colors leading-snug cursor-pointer"
                      onClick={() => openBlogReader(post)}
                    >
                      {post.title}
                    </h3>

                    {/* Article Excerpt */}
                    <p className="font-sans text-xs text-gray-600 leading-relaxed mb-4">
                      {isExpanded ? post.content : post.excerpt}
                    </p>

                    {/* Multi-Image Thumbnails Bar */}
                    {postImages.length > 1 && (
                      <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                        {postImages.slice(0, 4).map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => openBlogReader(post)}
                            className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-amber-200 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {postImages.length > 4 && (
                          <div
                            onClick={() => openBlogReader(post)}
                            className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 border border-amber-200 cursor-pointer"
                          >
                            +{postImages.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-cream-200 text-gray-700 text-[10px] font-semibold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                    <button
                      onClick={() => setExpandedCardId(isExpanded ? null : post.id)}
                      className="text-[11px] font-bold text-gray-500 hover:text-amber-700 transition-colors"
                    >
                      {isExpanded ? 'Collapse text ▲' : 'Expand preview ▼'}
                    </button>

                    <button
                      onClick={() => openBlogReader(post)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-900 hover:text-dark-950 font-bold text-xs transition-all"
                    >
                      <span>Read Full & Gallery</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ INTERACTIVE MULTI-IMAGE BLOG READER MODAL ═══════════════════════ */}
      {activeBlog && (
        <div className="fixed inset-0 z-[200] bg-dark-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto border border-amber-200">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-dark-950 text-white border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-dark-950 font-black text-[10px] uppercase tracking-wider shrink-0">
                  {activeBlog.category}
                </span>
                <span className="text-xs font-serif font-bold truncate text-gray-200">
                  {activeBlog.title}
                </span>
              </div>
              <button
                onClick={closeBlogReader}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
              
              {/* Multi-Image Gallery Showcase */}
              {activeBlogImages.length > 0 && (
                <div className="space-y-3">
                  {/* Main Display Image */}
                  <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-dark-950 shadow-inner group">
                    <img
                      src={activeBlogImages[activeImageIndex]}
                      alt={activeBlog.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />

                    {/* Navigation Buttons */}
                    {activeBlogImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-dark-950/70 hover:bg-amber-500 text-white hover:text-dark-950 transition-all shadow-lg"
                          title="Previous Photo"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-dark-950/70 hover:bg-amber-500 text-white hover:text-dark-950 transition-all shadow-lg"
                          title="Next Photo"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-dark-950/80 text-amber-300 font-bold text-xs backdrop-blur-md">
                          Photo {activeImageIndex + 1} of {activeBlogImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {activeBlogImages.length > 1 && (
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
                      {activeBlogImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                            activeImageIndex === idx
                              ? 'border-amber-500 scale-105 shadow-md'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Metadata */}
              <div>
                <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-dark-900 mb-3 leading-snug">
                  {activeBlog.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-b border-cream-200 pb-4">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>By {activeBlog.author}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>{activeBlog.created_at}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{activeBlog.read_time}</span>
                  </span>
                </div>
              </div>

              {/* Excerpt Quote */}
              <div className="p-4 rounded-2xl bg-amber-50 border-l-4 border-amber-500 text-amber-950 font-medium text-sm sm:text-base leading-relaxed">
                "{activeBlog.excerpt}"
              </div>

              {/* Article Paragraphs */}
              <div className="space-y-4 text-gray-700 font-sans text-sm sm:text-base leading-relaxed">
                {activeBlog.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Topic Tags */}
              {activeBlog.tags && activeBlog.tags.length > 0 && (
                <div className="pt-4 border-t border-cream-200 flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-gray-500">Tags:</span>
                  {activeBlog.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-cream-200 text-dark-900 font-semibold text-xs">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA Footer */}
              <div className="p-5 rounded-2xl bg-dark-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h4 className="font-serif font-bold text-amber-400 text-base">Planning a visit or special occasion?</h4>
                  <p className="text-xs text-gray-400">Book your table deck or water sports package directly at Wings River Café.</p>
                </div>
                {onOpenBooking && (
                  <button
                    onClick={() => { closeBlogReader(); onOpenBooking(); }}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-extrabold text-xs shadow-lg transition-all whitespace-nowrap"
                  >
                    🗓️ Reserve Table / Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
