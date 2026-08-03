'use client';

import { getStoredReviews, INITIAL_REVIEWS, Review, saveReview } from '@/lib/db';
import { ChevronLeft, ChevronRight, MessageSquarePlus, Quote } from 'lucide-react';
import React, { useEffect, useState } from 'react';


export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newReviewForm, setNewReviewForm] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    const refreshData = () => { getStoredReviews().then(setReviews); };
    refreshData();
    window.addEventListener('wings_db_sync', refreshData);
    return () => window.removeEventListener('wings_db_sync', refreshData);
  }, []);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !commentInput) return;

    const newRev: Review = {
      id: 'rev-' + Date.now(),
      author_name: nameInput,
      rating: Number(ratingInput) || 5,
      review_text: commentInput,
      date_str: 'Just now',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameInput)}`
    };

    saveReview(newRev);
    setReviews([newRev, ...reviews]);
    setNameInput('');
    setCommentInput('');
    setNewReviewForm(false);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 5000);
  };

  const nextReview = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <section id="reviews" className="py-20 bg-[#0B0E14] text-white relative overflow-hidden border-t border-[#D4AF37]/15">
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#0B0E14] text-xs sm:text-sm font-extrabold uppercase mb-4 shadow-xl shadow-amber-500/10">
            <span className="tracking-wide">4.9 / 5.0 Rating • 500+ Happy Customers</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Guest Testimonials & Reviews
          </h2>
          <p className="font-sans text-slate-300 text-sm sm:text-base">
            See what our valued guests and event hosts say about their experience at Wings River Café.
          </p>
        </div>

        {/* Reviews Carousel Wrapper */}
        <div className="relative max-w-4xl mx-auto">
          {reviews.length > 0 && (
            <div className="bg-[#10141D]/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#D4AF37]/25 relative">
              <Quote className="w-12 h-12 text-[#D4AF37]/20 absolute top-6 right-6 pointer-events-none" />

              {/* Rating Badge */}
              <div className="inline-flex items-center space-x-1.5 bg-[#141A24] text-amber-200 border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono mb-6 shadow-md">
                <span>{reviews[currentIndex].rating || 5}.0 / 5.0 Rating</span>
              </div>

              {/* Review Quote */}
              <p className="font-serif text-lg sm:text-2xl text-slate-100 leading-relaxed italic mb-8">
                &quot;{reviews[currentIndex].review_text}&quot;
              </p>

              {/* Author & Avatar */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      reviews[currentIndex].avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        reviews[currentIndex].author_name
                      )}`
                    }
                    alt={reviews[currentIndex].author_name}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]/50"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base">
                      {reviews[currentIndex].author_name}
                    </h4>
                    <span className="text-xs text-slate-400 font-sans">
                      Verified Google Review • {reviews[currentIndex].date_str}
                    </span>
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevReview}
                    className="p-3 rounded-full bg-[#141A24] border border-[#D4AF37]/25 hover:border-[#D4AF37] text-slate-300 hover:text-amber-200 transition-all shadow-md"
                    aria-label="Previous Review"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextReview}
                    className="p-3 rounded-full bg-[#141A24] border border-[#D4AF37]/25 hover:border-[#D4AF37] text-slate-300 hover:text-amber-200 transition-all shadow-md"
                    aria-label="Next Review"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Leave a Review Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setNewReviewForm(!newReviewForm)}
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-full bg-[#141A24] border border-[#D4AF37]/40 text-amber-200 font-bold text-xs hover:bg-[#1C2433] hover:border-[#D4AF37] transition-all shadow-lg"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#F5D061]" />
              <span>{newReviewForm ? 'Cancel Review' : 'Write a Guest Review'}</span>
            </button>
          </div>

          {submittedSuccess && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center animate-fade-in max-w-xl mx-auto shadow-sm">
              Thank you! Your guest review has been posted and added to Wings River Café testimonials.
            </div>
          )}

          {/* Review Submission Form Drawer */}
          {newReviewForm && (
            <form
              onSubmit={handleAddReview}
              className="mt-6 bg-[#10141D] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl space-y-4 animate-fade-in max-w-xl mx-auto text-white"
            >
              <h4 className="font-serif font-bold text-xl text-[#F8E7A1]">Share Your Experience</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sameer Verma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/15 bg-[#141A24] text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rating</label>
                <select
                  value={ratingInput}
                  onChange={(e) => setRatingInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/15 bg-[#141A24] text-white font-medium focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value={5} className="bg-[#141A24] text-white">5 / 5 - Excellent</option>
                  <option value={4} className="bg-[#141A24] text-white">4 / 5 - Very Good</option>
                  <option value={3} className="bg-[#141A24] text-white">3 / 5 - Good</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Review</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your feedback..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/15 bg-[#141A24] text-white font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#F5D061] via-[#E5B82C] to-[#D4AF37] text-[#0B0E14] font-extrabold text-xs rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
