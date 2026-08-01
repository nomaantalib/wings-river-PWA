'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getStoredBlogs, BlogPost, INITIAL_BLOGS } from '@/lib/db';
import { Calendar, User, Clock, ArrowRight, X, ChevronLeft, ChevronRight, Image as ImageIcon, Tag, BookOpen } from 'lucide-react';

interface BlogSectionProps {
  onOpenBooking?: () => void;
}

export default function BlogSection({ onOpenBooking }: BlogSectionProps = {}) {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeBlogImages, setActiveBlogImages] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refreshData = () => { getStoredBlogs().then(setBlogs); };
    refreshData();
    window.addEventListener('wings_db_sync', refreshData);
    return () => window.removeEventListener('wings_db_sync', refreshData);
  }, []);

  // Horizontal Auto-sliding Carousel interval (scrolls 320px every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (!carouselRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };
  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };


  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  const filteredBlogs = selectedCategory === 'All'
    ? blogs
    : blogs.filter(b => b.category === selectedCategory);

  const safeImages = (rawImgs: any, coverImage: string): string[] => {
    let arr: string[] = [];
    if (Array.isArray(rawImgs)) arr = rawImgs;
    else if (typeof rawImgs === 'string' && rawImgs.trim()) {
      try { const p = JSON.parse(rawImgs); if (Array.isArray(p)) arr = p; } catch { arr = [rawImgs.trim()]; }
    }
    const clean = arr.filter(x => typeof x === 'string' && x.trim());
    return clean.length > 0 ? clean : [coverImage].filter(Boolean);
  };

  const formatBlogDate = (dateStr: any) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return String(dateStr);
    }
  };

  const openBlogReader = (blog: BlogPost) => {
    setActiveBlog(blog);
    setActiveImageIndex(0);
    const imgs = safeImages(blog.images, blog.cover_image);
    setActiveBlogImages(imgs);
  };

  const closeBlogReader = () => {
    setActiveBlog(null);
    setActiveImageIndex(0);
    setActiveBlogImages([]);
  };

  const changeSlide = (newIndex: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImageIndex(newIndex);
      setIsTransitioning(false);
    }, 150);
  };

  const nextImage = () => {
    if (activeBlogImages.length > 0) {
      changeSlide((activeImageIndex + 1) % activeBlogImages.length);
    }
  };

  const prevImage = () => {
    if (activeBlogImages.length > 0) {
      changeSlide((activeImageIndex - 1 + activeBlogImages.length) % activeBlogImages.length);
    }
  };

  // Auto-advance modal slide if multiple photos exist
  useEffect(() => {
    if (!activeBlog || activeBlogImages.length <= 1) return;
    const timer = setInterval(() => {
      nextImage();
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBlog, activeImageIndex, activeBlogImages]);

  return (
    <section id="blog" className="py-16 sm:py-20 bg-[#0B0E14]/90 backdrop-blur-md relative overflow-hidden text-[#F5EBE0]">
      {/* Background ambient lighting accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9B086]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#98A886]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#1F1810] border border-[#C9B086]/30 text-[#E8DCB8] font-bold text-xs tracking-widest uppercase mb-3 shadow-md">
            <BookOpen className="w-3.5 h-3.5 text-[#C9B086]" />
            <span>Riverside Journal & Blog</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E8DCB8] tracking-tight mb-3">
            Stories, Food News & Event Highlights
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#D4C4A0]/80 leading-relaxed max-w-xl mx-auto">
            Discover restaurant stories, multicuisine recipes, party planning guides, Lucknow Water Sports ticket updates, and evening sunset vibes.
          </p>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#C9B086] via-[#B8A07A] to-[#A3B58E] text-[#120B08] shadow-lg scale-105'
                    : 'bg-[#14171D] text-[#D4C4A0]/80 hover:bg-[#1F242E] hover:text-[#E8DCB8] border border-[#C9B086]/20'
                }`}
              >
                {cat === 'All' ? 'All Articles' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Horizontal Auto-sliding Carousel Container */}
        <div
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Scroll Left Button */}
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#181B22]/90 border border-[#C9B086]/40 text-[#C9B086] shadow-2xl hover:bg-[#C9B086] hover:text-[#120B08] transition-all opacity-80 hover:opacity-100 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#181B22]/90 border border-[#C9B086]/40 text-[#C9B086] shadow-2xl hover:bg-[#C9B086] hover:text-[#120B08] transition-all opacity-80 hover:opacity-100 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Track */}
          <div
            ref={carouselRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth snap-x snap-mandatory"
          >
            {filteredBlogs.map((post) => {
              const postImages = safeImages(post.images, post.cover_image);

              return (
                <div
                  key={post.id}
                  className="snap-start shrink-0 w-[270px] sm:w-[310px] bg-[#12151C]/90 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl border border-[#C9B086]/20 transition-all duration-300 flex flex-col group/card hover:-translate-y-1"
                >
                  {/* Shorter Compact Image Banner */}
                  <div
                    className="relative h-36 overflow-hidden bg-[#0A0C10] cursor-pointer flex items-center justify-center"
                    onClick={() => openBlogReader(post)}
                  >
                    {/* Ambient Blur Layer */}
                    <img
                      src={post.cover_image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-40 scale-110 transition-transform duration-500 group-hover/card:scale-120"
                    />

                    {/* Sharp Image */}
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="relative z-10 max-h-full max-w-full object-contain p-2 transition-transform duration-300 group-hover/card:scale-105"
                    />

                    {/* Category Tag */}
                    <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-[#0A0C10]/80 backdrop-blur-sm text-[#E8DCB8] text-[9px] font-bold uppercase tracking-wider border border-[#C9B086]/30">
                      {post.category}
                    </span>

                    {/* Photo count badge */}
                    {postImages.length > 1 && (
                      <span className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-[#C9B086] text-[#120B08] font-bold text-[9px] flex items-center gap-1 shadow-sm">
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>{postImages.length}</span>
                      </span>
                    )}
                  </div>

                  {/* Compact Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta Date & Read time */}
                      <div className="flex items-center space-x-2 text-[10px] text-[#D4C4A0]/60 mb-1.5 font-mono">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-[#98A886]" />
                          <span>{formatBlogDate(post.created_at)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#98A886]" />
                          <span>{post.read_time}</span>
                        </span>
                      </div>

                      {/* Title — 2 lines */}
                      <h3
                        className="font-serif font-bold text-sm text-[#E8DCB8] mb-1.5 group-hover/card:text-[#C9B086] transition-colors line-clamp-2 cursor-pointer leading-tight"
                        onClick={() => openBlogReader(post)}
                      >
                        {post.title}
                      </h3>

                      {/* Excerpt — 2 lines */}
                      <p className="font-sans text-[11px] text-[#D4C4A0]/70 leading-snug line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Read More Footer */}
                    <div className="pt-2.5 border-t border-[#C9B086]/15 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#98A886] font-mono">
                        #{post.category}
                      </span>
                      <button
                        onClick={() => openBlogReader(post)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-[#C9B086] hover:text-[#E8DCB8] transition-colors"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ INTERACTIVE FANCY MULTI-IMAGE BLOG READER MODAL ═════════════════ */}
      {activeBlog && (
        <div className="fixed inset-0 z-[200] bg-dark-950/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col my-auto border border-amber-200">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-dark-950 text-white border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <span className="px-2.5 py-1 rounded-full bg-gold-400 text-dark-950 font-black text-[10px] uppercase tracking-wider shrink-0">
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
              
              {/* Fancy Multi-Image Showcase (Full Image Display with Smooth Transitions) */}
              {activeBlogImages.length > 0 && (
                <div className="space-y-3">
                  {/* Main Display Image Frame */}
                  <div className="relative h-72 sm:h-[420px] w-full rounded-3xl overflow-hidden bg-dark-950 shadow-2xl flex items-center justify-center group border border-white/10">
                    {/* Ambient Blurred Background Layer */}
                    <img
                      src={activeBlogImages[activeImageIndex]}
                      alt=""
                      aria-hidden="true"
                      className={`absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-40 scale-110 transition-all duration-700 ease-in-out ${
                        isTransitioning ? 'opacity-0 scale-100' : 'opacity-40 scale-110'
                      }`}
                    />

                    {/* Dark Vignette Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-dark-950/40" />

                    {/* Foreground Full Un-cropped Image */}
                    <img
                      src={activeBlogImages[activeImageIndex]}
                      alt={activeBlog.title}
                      className={`relative z-10 max-h-full max-w-full object-contain p-4 drop-shadow-2xl transition-all duration-500 ease-out transform ${
                        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                      }`}
                    />

                    {/* Navigation Buttons */}
                    {activeBlogImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-dark-950/80 hover:bg-gold-400 text-white hover:text-dark-950 transition-all shadow-xl hover:scale-110 border border-white/20"
                          title="Previous Photo"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-dark-950/80 hover:bg-gold-400 text-white hover:text-dark-950 transition-all shadow-xl hover:scale-110 border border-white/20"
                          title="Next Photo"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute bottom-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-dark-950/90 text-amber-300 font-extrabold text-xs backdrop-blur-md border border-amber-400/30 shadow-lg">
                          Photo {activeImageIndex + 1} of {activeBlogImages.length}
                        </div>

                      </>
                    )}
                  </div>

                  {/* Thumbnail Row with Smooth Highlight */}
                  {activeBlogImages.length > 1 && (
                    <div className="flex items-center justify-center space-x-3 overflow-x-auto py-2 no-scrollbar">
                      {activeBlogImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => changeSlide(idx)}
                          className={`relative w-20 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 bg-dark-950 p-0.5 ${
                            activeImageIndex === idx
                              ? 'border-gold-400 scale-110 shadow-lg ring-2 ring-gold-400/50'
                              : 'border-transparent opacity-50 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-contain" />
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
                    <span>{formatBlogDate(activeBlog.created_at)}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{activeBlog.read_time}</span>
                  </span>
                </div>
              </div>

              {/* Excerpt Quote */}
              <div className="p-4 rounded-2xl bg-amber-50 border-l-4 border-gold-400 text-amber-950 font-medium text-sm sm:text-base leading-relaxed">
                "{activeBlog.excerpt}"
              </div>

              {/* Glimpse Video Preview Player */}
              {activeBlog.video_url && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
                    <span>Experience Glimpse Video</span>
                  </h4>

                  <div className="rounded-3xl overflow-hidden bg-black border-2 border-amber-400/30 aspect-video shadow-2xl relative">
                    <iframe
                      src={
                        activeBlog.video_url.includes('youtube.com') || activeBlog.video_url.includes('youtu.be')
                          ? activeBlog.video_url.replace('watch?v=', 'embed/')
                          : activeBlog.video_url
                      }
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Glimpse Video"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 text-gray-700 font-sans text-sm sm:text-base leading-relaxed">
                {(activeBlog.content || '').split('\n').filter(Boolean).map((paragraph, idx) => (
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
                    className="px-6 py-2.5 rounded-xl bg-gold-400 hover:bg-amber-400 text-dark-950 font-extrabold text-xs shadow-lg transition-all whitespace-nowrap flex items-center space-x-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reserve Table / Event</span>
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
