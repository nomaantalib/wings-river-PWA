import { NextResponse } from 'next/server';
import { INITIAL_REVIEWS, Review } from '@/lib/db';

export const runtime = 'edge';

let localReviews: Review[] = [...INITIAL_REVIEWS];

export async function GET() {
  try {
    const env = (process.env as any) || {};
    if (env.DB) {
      const { results } = await env.DB.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
      return NextResponse.json({ success: true, data: results.length ? results : localReviews });
    }
    return NextResponse.json({ success: true, data: localReviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author_name, rating, review_text } = body;

    if (!author_name || !review_text) {
      return NextResponse.json({ success: false, message: 'Name and Review comment are required.' }, { status: 400 });
    }

    const newReview: Review = {
      id: 'rev-' + Date.now(),
      author_name,
      rating: Number(rating) || 5,
      review_text,
      date_str: 'Just now',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author_name)}`
    };

    const env = (process.env as any) || {};
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO reviews (id, author_name, rating, review_text, date_str, avatar_url) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(newReview.id, newReview.author_name, newReview.rating, newReview.review_text, newReview.date_str, newReview.avatar_url).run();
    } else {
      localReviews.unshift(newReview);
    }

    return NextResponse.json({ success: true, message: 'Thank you for your review!', review: newReview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
