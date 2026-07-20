import { NextResponse } from 'next/server';
import { INITIAL_BLOGS, BlogPost, getD1Binding } from '@/lib/db';

export const runtime = 'edge';

let localBlogs: BlogPost[] = [...INITIAL_BLOGS];

export async function GET() {
  try {
    const db = getD1Binding(process.env);
    if (db) {
      const { results } = await db.prepare('SELECT * FROM blogs ORDER BY created_at DESC').all();
      return NextResponse.json({ success: true, data: results.length ? results : localBlogs });
    }
    return NextResponse.json({ success: true, data: localBlogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, excerpt, content, category, cover_image, author } = body;

    if (!title || !content || !excerpt) {
      return NextResponse.json({ success: false, message: 'Title, Excerpt, and Content are required.' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newBlog: BlogPost = {
      id: 'blog-' + Date.now(),
      title,
      slug,
      excerpt,
      content,
      category: category || 'Food & Dining',
      cover_image: cover_image || '/images/Screenshot_20260720-180544_Maps.png',
      author: author || 'Wings River Team',
      read_time: '4 min read',
      created_at: new Date().toISOString().split('T')[0]
    };

    const db = getD1Binding(process.env);
    if (db) {
      await db.prepare(
        `INSERT INTO blogs (id, title, slug, excerpt, content, category, cover_image, author, read_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(newBlog.id, newBlog.title, newBlog.slug, newBlog.excerpt, newBlog.content, newBlog.category, newBlog.cover_image, newBlog.author, newBlog.read_time).run();
    } else {
      localBlogs.unshift(newBlog);
    }

    return NextResponse.json({ success: true, message: 'Blog published successfully', blog: newBlog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
