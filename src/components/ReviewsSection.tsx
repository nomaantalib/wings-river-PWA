'use client';

import React, { useState, useEffect } from 'react';
import { getStoredReviews, saveReview, Review, INITIAL_REVIEWS } from '@/lib/db';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquarePlus } from 'lucide-react';

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
    <section id="reviews" className="py-20 bg-cream-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold-300/30 border border-gold-400/50 text-gold-800 text-xs font-bold uppercase mb-3">
            <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
            <span>4.1 ★ Google Rating • 500+ Happy Customers</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-900 tracking-tight mb-4">
            Guest Testimonials & Reviews
          </h2>
          <p className="font-sans text-gray-600 text-base">
            See what our valued guests and event hosts say about their experience at Wings River Café.
          </p>
        </div>

        {/* Reviews Carousel Wrapper */}
        <div className="relative max-w-4xl mx-auto">
          {reviews.length > 0 && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-cream-200 relative">
              <Quote className="w-12 h-12 text-mint-200 absolute top-6 right-6 pointer-events-none" />

              {/* Star Rating */}
              <div className="flex items-center space-x-1 text-gold-500 mb-6">
                {[...Array(reviews[currentIndex].rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>

              {/* Review Quote */}
              <p className="font-serif text-lg sm:text-2xl text-dark-900 leading-relaxed italic mb-8">
                "{reviews[currentIndex].review_text}"
              </p>

              {/* Author & Avatar */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      reviews[currentIndex].avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        reviews[currentIndex].author_name
                      )}`
                    }
                    alt={reviews[currentIndex].author_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-mint-300"
                  />
                  <div>
                    <h4 className="font-bold text-dark-900 text-base">
                      {reviews[currentIndex].author_name}
                    </h4>
                    <span className="text-xs text-gray-500 font-sans">
                      Verified Google Review • {reviews[currentIndex].date_str}
                    </span>
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevReview}
                    className="p-2.5 rounded-full bg-cream-100 hover:bg-mint-300 text-dark-900 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextReview}
                    className="p-2.5 rounded-full bg-cream-100 hover:bg-mint-300 text-dark-900 transition-colors"
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
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-dark-900 text-white font-bold text-xs hover:bg-mint-600 transition-colors shadow-md"
            >
              <MessageSquarePlus className="w-4 h-4 text-gold-400" />
              <span>{newReviewForm ? 'Cancel Review' : 'Write a Guest Review'}</span>
            </button>
          </div>

          {submittedSuccess && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold text-center animate-fade-in max-w-xl mx-auto shadow-sm">
              ✨ Thank you! Your guest review has been posted and added to Wings River Café testimonials.
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mint-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
                <select
                  value={ratingInput}
                  onChange={(e) => setRatingInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                >
                  <option value={5}>5 Stars ★★★★★ - Excellent</option>
                  <option value={4}>4 Stars ★★★★☆ - Very Good</option>
                  <option value={3}>3 Stars ★★★☆☆ - Good</option>
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mint-400"
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
