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

  const [isPaused, setIsPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const refreshData = () => { getStoredReviews().then(setReviews); };
    refreshData();
    window.addEventListener('wings_db_sync', refreshData);
    return () => window.removeEventListener('wings_db_sync', refreshData);
  }, []);

  const changeReview = React.useCallback((targetIndex: number) => {
    if (isFading || targetIndex === currentIndex) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(targetIndex);
      setIsFading(false);
    }, 250);
  }, [isFading, currentIndex]);

  // Automatic Slideshow Effect with Smooth Fading
  useEffect(() => {
    let timer: any;
    if (!isPaused && !newReviewForm && reviews.length > 0) {
      timer = setInterval(() => {
        changeReview((currentIndex + 1) % reviews.length);
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [isPaused, newReviewForm, reviews.length, currentIndex, changeReview]);

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

  const nextReview = () => changeReview((currentIndex + 1) % reviews.length);
  const prevReview = () => changeReview((currentIndex - 1 + reviews.length) % reviews.length);

  return (
    <section id="reviews" className="py-20 bg-cream-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-dark-950 text-xs sm:text-sm font-extrabold uppercase mb-4 shadow-xl">
            <span className="tracking-wide">4.9 / 5.0 Rating • 500+ Happy Customers</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 tracking-tight mb-4">
            Guest Testimonials & Reviews
          </h2>
          <p className="font-sans text-gray-600 text-base">
            See what our valued guests and event hosts say about their experience at Wings River Café.
          </p>
        </div>

        {/* Reviews Auto Slideshow Wrapper */}
        <div className="relative max-w-4xl mx-auto">
          {reviews.length > 0 && (
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-cream-200 relative transition-all duration-500"
            >
              <Quote className="w-12 h-12 text-amber-200 absolute top-6 right-6 pointer-events-none" />

              {/* Inner Fading Container */}
              <div className={`transition-all duration-300 ease-in-out ${isFading ? 'opacity-0 scale-98 translate-y-1' : 'opacity-100 scale-100 translate-y-0'}`}>
                {/* Rating Badge */}
                <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold font-mono mb-6">
                  <span>{reviews[currentIndex]?.rating || 5}.0 / 5.0 Rating</span>
                </div>

                {/* Review Quote */}
                <p className="font-serif text-lg sm:text-2xl text-dark-900 leading-relaxed italic mb-8 min-h-[90px]">
                  &quot;{reviews[currentIndex]?.review_text}&quot;
                </p>

                {/* Author & Avatar & Controls */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        reviews[currentIndex]?.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          reviews[currentIndex]?.author_name || 'Guest'
                        )}`
                      }
                      alt={reviews[currentIndex]?.author_name}
                      decoding="async"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-sm"
                    />
                    <div>
                      <h4 className="font-bold text-dark-900 text-base">
                        {reviews[currentIndex]?.author_name}
                      </h4>
                      <span className="text-xs text-gray-500 font-sans">
                        Verified Google Review • {reviews[currentIndex]?.date_str}
                      </span>
                    </div>
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevReview}
                      aria-label="Previous Review"
                      className="p-2.5 rounded-full bg-cream-100 hover:bg-amber-400 text-dark-900 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextReview}
                      aria-label="Next Review"
                      className="p-2.5 rounded-full bg-cream-100 hover:bg-amber-400 text-dark-900 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dot Indicators */}
              <div className="flex items-center justify-center space-x-1.5 mt-5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`min-h-0 min-w-0 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-4.5 bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#B8860B] shadow-[0_0_8px_rgba(212,175,55,0.7)] scale-100'
                        : 'w-1.5 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/60 border border-[#D4AF37]/40 scale-90 hover:scale-110'
                    }`}
                    aria-label={`Go to review ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Leave a Review Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setNewReviewForm(!newReviewForm)}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-dark-900 text-white font-bold text-xs hover:bg-mint-600 transition-colors shadow-md"
            >
              <MessageSquarePlus className="w-4 h-4 text-gold-400" />
              <span>{newReviewForm ? 'Cancel Review' : 'Write a Guest Review'}</span>
            </button>
          </div>

          {submittedSuccess && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold text-center animate-fade-in max-w-xl mx-auto shadow-sm">
              Thank you! Your guest review has been posted and added to Wings River Café testimonials.
            </div>
          )}



          {/* Review Submission Form Drawer */}
          {newReviewForm && (
            <form
              onSubmit={handleAddReview}
              className="mt-6 bg-white p-6 rounded-2xl border border-mint-200 shadow-lg space-y-4 animate-fade-in max-w-xl mx-auto"
            >
              <h4 className="font-serif font-bold text-lg text-dark-900">Share Your Experience</h4>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sameer Verma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 text-black font-semibold bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mint-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
                <select
                  value={ratingInput}
                  onChange={(e) => setRatingInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 text-black font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-mint-400"
                >
                  <option value={5} className="text-black font-semibold">5 / 5 - Excellent</option>
                  <option value={4} className="text-black font-semibold">4 / 5 - Very Good</option>
                  <option value={3} className="text-black font-semibold">3 / 5 - Good</option>

                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Review</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your feedback..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 text-black font-semibold bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mint-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-mint-500 text-dark-950 font-bold text-xs rounded-xl hover:bg-mint-400 transition-colors"
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
