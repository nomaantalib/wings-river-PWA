// Cloudflare Workers Functions API Endpoint for Customer Reviews (D1-backed)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  date_str TEXT,
  avatar_url TEXT,
  is_approved INTEGER DEFAULT 1,
  created_at TEXT
)`;

export async function onRequestGet(context) {
  const db = context?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ success: true, data: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    await db.prepare(CREATE_TABLE).run();
    let query = await db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
    let results = query?.results || [];

    if (results.length === 0) {
      const initialReviews = [
        {
          id: 'r1',
          author_name: 'Ananya Sharma',
          rating: 5,
          review_text: 'Amazing riverside view with great food! The paneer tikka and cold coffee were fantastic. Riding the speedboat before dinner was the highlight of our weekend!',
          date_str: '2 days ago',
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
        },
        {
          id: 'r2',
          author_name: 'Rahul Verma',
          rating: 5,
          review_text: 'Celebrated my sister’s 25th birthday here. The fairy light decoration near the river was magical. Staff were very courteous and the food was delicious!',
          date_str: '1 week ago',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        }
      ];
      for (const r of initialReviews) {
        await db.prepare(`
          INSERT INTO reviews (id, author_name, rating, review_text, date_str, avatar_url, is_approved, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        `).bind(
          r.id,
          r.author_name,
          r.rating,
          r.review_text,
          r.date_str,
          r.avatar_url,
          new Date().toISOString()
        ).run();
      }
      query = await db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
      results = query?.results || [];
    }

    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: true, data: [], error: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const data = await context.request.json();
    const id = data.id || `rev-${Date.now()}`;
    const rating = parseInt(data.rating) || 5;
    const isApproved = data.is_approved !== false ? 1 : 0;
    const dateStr = data.date_str || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const createdAt = data.created_at || new Date().toISOString();

    await db.prepare(`
      INSERT OR REPLACE INTO reviews (id, author_name, rating, review_text, date_str, avatar_url, is_approved, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.author_name || data.author || 'Guest',
      rating,
      data.review_text || data.text || '',
      dateStr,
      data.avatar_url || data.avatar || null,
      isApproved,
      createdAt
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Review saved', id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) throw new Error('Missing ID parameter');

    await db.prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Review deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
