'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getStoredBlogs, BlogPost, INITIAL_BLOGS } from '@/lib/db';
import { Calendar, User, Clock, ArrowRight, X, ChevronLeft, ChevronRight, Image as ImageIcon, Tag, BookOpen, Zap } from 'lucide-react';

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
  const [currentScrollIdx, setCurrentScrollIdx] = useState<number>(0);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refreshData = () => {
      getStoredBlogs().then(data => {
        if (data && data.length > 0) {
          setBlogs(data);
        } else {
          setBlogs(INITIAL_BLOGS);
        }
      });
    };
    refreshData();
    window.addEventListener('wings_db_sync', refreshData);
    return () => window.removeEventListener('wings_db_sync', refreshData);
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  const filteredBlogs = selectedCategory === 'All'
    ? blogs
    : blogs.filter(b => b.category === selectedCategory);

  // Horizontal Auto-sliding Carousel interval (scrolls 340px every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (!carouselRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        setCurrentScrollIdx(0);
      } else {
        carouselRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        setCurrentScrollIdx(prev => Math.min(prev + 1, filteredBlogs.length - 1));
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, filteredBlogs.length]);

  const scrollLeft = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    setCurrentScrollIdx(prev => Math.max(0, prev - 1));
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    setCurrentScrollIdx(prev => Math.min(prev + 1, filteredBlogs.length - 1));
  };

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

  const nextImage = useCallback(() => {
    if (activeBlogImages.length > 0) {
      changeSlide((activeImageIndex + 1) % activeBlogImages.length);
    }
  }, [activeBlogImages, activeImageIndex]);

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
  }, [activeBlog, activeBlogImages.length, nextImage]);

  return (
    <section id="blog" className="my-12 sm:my-20 py-16 sm:py-24 bg-[#0B0E14] border-y border-[#F5D061]/25 relative overflow-hidden text-[#F5EBE0] shadow-2xl">
      {/* Ambient background lighting accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F5D061]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#98A886]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#1F1810] border border-[#F5D061]/40 text-[#F8E7A1] font-bold text-xs tracking-widest uppercase mb-3 shadow-lg">
            <BookOpen className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>Riverside Journal &amp; Blog</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F8E7A1] tracking-tight mb-3">
            Stories, Gastronomy &amp; Event Highlights
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#D4C4A0]/80 leading-relaxed max-w-xl mx-auto">
            Discover restaurant stories, multicuisine recipes, party planning guides, Lucknow Water Sports ticket updates, and evening sunset vibes.
          </p>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentScrollIdx(0);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#120B08] shadow-lg shadow-yellow-500/20 scale-105'
                    : 'bg-[#151821] text-[#D4C4A0]/80 hover:bg-[#1F242E] hover:text-[#F8E7A1] border border-[#F5D061]/25'
                }`}
              >
                {cat === 'All' ? 'All Articles' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Very Fancy Horizontal Carousel Container with Faded Corner Edges */}
        <div
          className="relative group px-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Faded Left & Right Corner Edges overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0B0E14] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0B0E14] to-transparent z-20 pointer-events-none" />

          {/* Fancy Scroll Left Button */}
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] shadow-[0_0_25px_rgba(245,208,97,0.5)] hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5 font-bold" />
          </button>

          {/* Fancy Scroll Right Button */}
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-gradient-to-r from-[#F5D061] to-[#E5B82C] text-[#120B08] shadow-[0_0_25px_rgba(245,208,97,0.5)] hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5 font-bold" />
          </button>

          {/* Horizontal Track */}
          <div
            ref={carouselRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-4 px-3 scroll-smooth snap-x snap-mandatory"
          >
            {filteredBlogs.map((post, idx) => {
              const postImages = safeImages(post.images, post.cover_image);

              return (
                <div
                  key={post.id}
                  className="snap-start shrink-0 w-[230px] sm:w-[320px] bg-[#FAF3EA] rounded-3xl overflow-hidden shadow-xl border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:shadow-[0_15px_35px_rgba(212,175,55,0.25)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col group/card"
                >
                  {/* Shorter Compact Image Banner */}
                  <div
                    className="relative h-44 overflow-hidden bg-[#1E1610] cursor-pointer flex items-center justify-center"
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
                      className="relative z-10 max-h-full max-w-full object-contain p-2 transition-transform duration-500 group-hover/card:scale-105"
                    />

                    {/* Category Tag */}
                    <span className="absolute top-3 left-3 z-20 px-2.5 py-0.5 rounded-lg bg-[#2A1D13]/90 backdrop-blur-md text-[#F8E7A1] text-[9px] font-bold uppercase tracking-wider border border-[#F5D061]/50 shadow-md">
                      {post.category}
                    </span>

                    {/* Photo count badge */}
                    {postImages.length > 1 && (
                      <span className="absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-lg bg-[#D4AF37] text-[#120B08] font-bold text-[9px] flex items-center gap-1 shadow-md">
                        <ImageIcon className="w-3 h-3" />
                        <span>{postImages.length} Photos</span>
                      </span>
                    )}
                  </div>

                  {/* Compact Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta Date & Read time */}
                      <div className="flex items-center space-x-2 text-[10px] text-[#7A5C3A] mb-2 font-mono font-medium">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-[#B3871E]" />
                          <span>{formatBlogDate(post.created_at)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-[#5C7040]" />
                          <span>{post.read_time}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="font-serif font-bold text-base text-[#2A1D13] mb-2 group-hover/card:text-[#B3871E] transition-colors line-clamp-2 cursor-pointer leading-snug"
                        onClick={() => openBlogReader(post)}
                      >
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="font-sans text-xs text-[#5A4A3A] leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Read More Footer */}
                    <div className="pt-3 border-t border-[#D4AF37]/30 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#6B5744] font-mono uppercase tracking-wider">
                        #{post.category}
                      </span>
                      <button
                        onClick={() => openBlogReader(post)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#2A1D13] hover:bg-[#D4AF37] text-[#F8E7A1] hover:text-[#120B08] font-bold text-xs transition-all duration-300 shadow-sm"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fancy Progress Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {filteredBlogs.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentScrollIdx % filteredBlogs.length === idx
                    ? 'w-4.5 bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#B8860B] shadow-[0_0_8px_rgba(212,175,55,0.7)]'
                    : 'w-1.5 bg-[#D4AF37]/30 border border-[#D4AF37]/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ INTERACTIVE FANCY MULTI-IMAGE BLOG READER MODAL ═════════════════ */}
      {activeBlog && (
        <div className="fixed inset-0 z-[200] bg-dark-950/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in text-white">
          <div className="relative w-full max-w-4xl bg-[#12151C] border border-[#F5D061]/40 rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col my-auto text-white">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#181B22] border-b border-[#F5D061]/25 shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <span className="px-3 py-1 rounded-full bg-[#F5D061] text-[#120B08] font-extrabold text-[10px] uppercase tracking-wider shrink-0 shadow-md">
                  {activeBlog.category}
                </span>
                <span className="text-sm font-serif font-bold truncate text-[#F8E7A1]">
                  {activeBlog.title}
                </span>
              </div>
              <button
                onClick={closeBlogReader}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#D4C4A0] hover:text-white transition-colors shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Photo Slider (3:4 Aspect Ratio Container for Portrait/Collage Photos) */}
              {activeBlogImages.length > 0 && (
                <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden bg-[#0A0D12] border border-[#F5D061]/35 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group my-2">
                  <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                      src={activeBlogImages[activeImageIndex]}
                      alt={activeBlog.title}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                      }`}
                    />
                  </div>

                  {/* Nav Arrows if multiple */}
                  {activeBlogImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        aria-label="Previous Image"
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 text-[#F5D061] border border-[#F5D061]/40 hover:bg-[#F5D061] hover:text-black transition-all shadow-xl hover:scale-110 active:scale-95 z-20"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        aria-label="Next Image"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 text-[#F5D061] border border-[#F5D061]/40 hover:bg-[#F5D061] hover:text-black transition-all shadow-xl hover:scale-110 active:scale-95 z-20"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      {/* Nano 80% Reduced Indicator Bar */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center space-x-[1.5px] px-1 py-0 h-[4px] rounded-full bg-[#0E2A1C]/90 backdrop-blur-md border border-[#34D399]/30 shadow-sm z-20">
                        {activeBlogImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => changeSlide(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            className={`h-[1px] rounded-full transition-all duration-300 ${
                              i === activeImageIndex
                                ? 'bg-[#F5D061] w-[3px] shadow-[0_0_3px_rgba(245,208,97,0.9)]'
                                : 'bg-white/40 w-[1px] hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Aesthetic Blog Title & Meta Header */}
              <div className="space-y-3 pt-2">
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[#FFF5D0] via-[#F5D061] to-[#E5B82C] leading-tight tracking-tight">
                  {activeBlog.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#D4C4A0]/80 font-mono border-b border-[#F5D061]/20 pb-4">
                  <span className="flex items-center space-x-1.5 bg-[#F5D061]/10 border border-[#F5D061]/30 px-2.5 py-1 rounded-full text-[#F5D061] font-bold">
                    <User className="w-3.5 h-3.5 text-[#F5D061]" />
                    <span>{activeBlog.author}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[#D4C4A0]">
                    <Calendar className="w-3.5 h-3.5 text-[#F5D061]" />
                    <span>{formatBlogDate(activeBlog.created_at)}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[#98A886]">
                    <Clock className="w-3.5 h-3.5 text-[#98A886]" />
                    <span>{activeBlog.read_time}</span>
                  </span>
                </div>
              </div>

              {/* Full Blog Content Paragraphs */}
              <div className="font-sans text-sm sm:text-base text-[#E2D6C0] leading-relaxed space-y-4 whitespace-pre-line bg-white/[0.03] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-inner">
                {activeBlog.content}
              </div>

              {/* Bottom Aesthetic CTA Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#171B24] via-[#1A1E29] to-[#141720] border border-[#F5D061]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h4 className="font-serif font-black text-lg text-[#F8E7A1]">Experience Wings River Café</h4>
                  <p className="text-xs text-[#D4C4A0]/80 mt-0.5">Reserve your Gomti riverfront deck table or party canopy today.</p>
                </div>
                <a
                  href="#floor-map"
                  onClick={() => closeBlogReader()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#120B08] font-black text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(245,208,97,0.35)] hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  Reserve Table Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
