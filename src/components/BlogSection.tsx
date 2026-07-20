'use client';

import React, { useState, useEffect } from 'react';
import { getStoredBlogs, BlogPost } from '@/lib/db';
import { Calendar, User, Clock, ArrowRight, X } from 'lucide-react';

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    setBlogs(getStoredBlogs());
  }, []);

  const featured = blogs[0];
  const regularPosts = blogs.slice(1);

  return (
    <section id="blog" className="py-20 bg-cream-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-mint-200 border border-mint-300 text-mint-800 font-semibold text-xs tracking-widest uppercase mb-3">
            WordPress Style Journal
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 tracking-tight mb-4">
            Riverside Stories & Food News
          </h2>
          <p className="font-sans text-gray-600 text-base">
            Discover restaurant events, seasonal multicuisine offers, party planning tips, and Lucknow Water Sports updates.
          </p>
        </div>

        {/* Featured Article Layout */}
        {featured && (
          <div className="mb-12 bg-white rounded-3xl overflow-hidden shadow-xl border border-cream-200 grid grid-cols-1 lg:grid-cols-12 gap-0 group">
            <div className="lg:col-span-7 relative h-72 lg:h-auto overflow-hidden">
              <img
                src={featured.cover_image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1 rounded-full bg-gold-500 text-dark-950 font-bold text-xs shadow-md">
                  FEATURED ARTICLE
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-mint-600" />
                    <span>{featured.created_at}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gold-500" />
                    <span>{featured.read_time}</span>
                  </span>
                </div>

                <h3 className="font-serif font-extrabold text-2xl lg:text-3xl text-dark-900 mb-3 leading-snug group-hover:text-mint-700 transition-colors">
                  {featured.title}
                </h3>

                <p className="font-sans text-sm text-gray-600 leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
              </div>

              <button
                onClick={() => setActiveBlog(featured)}
                className="inline-flex items-center space-x-2 text-mint-700 font-bold text-sm hover:text-gold-600 transition-colors group/btn"
              >
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Regular Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-cream-200 hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md text-mint-300 text-[10px] font-bold uppercase">
                  {post.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 text-[11px] text-gray-400 mb-2">
                    <span>{post.created_at}</span>
                    <span>•</span>
                    <span>{post.read_time}</span>
                  </div>

                  <h4 className="font-serif font-bold text-lg text-dark-900 mb-2 group-hover:text-mint-700 transition-colors">
                    {post.title}
                  </h4>

                  <p className="font-sans text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                </div>

                <button
                  onClick={() => setActiveBlog(post)}
                  className="inline-flex items-center space-x-1 text-mint-700 font-bold text-xs hover:text-gold-600 transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Post Reader Modal */}
      {activeBlog && (
        <div className="fixed inset-0 z-[110] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <img
                src={activeBlog.cover_image}
                alt={activeBlog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/40 to-transparent" />
              <button
                onClick={() => setActiveBlog(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-dark-950/60 hover:bg-dark-950 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-3 py-1 rounded-full bg-mint-400 text-dark-950 font-bold text-xs uppercase mb-2 inline-block">
                  {activeBlog.category}
                </span>
                <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                  {activeBlog.title}
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
              <div className="flex items-center space-x-4 text-xs text-gray-500 border-b border-gray-100 pb-4">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-mint-600" />
                  <span>By {activeBlog.author}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" />
                  <span>{activeBlog.created_at}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-mint-600" />
                  <span>{activeBlog.read_time}</span>
                </span>
              </div>

              <p className="font-semibold text-dark-900 text-lg leading-snug">
                {activeBlog.excerpt}
              </p>

              <div className="space-y-4 text-gray-700 font-sans">
                {activeBlog.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
