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
    const query = await db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
    const results = query?.results || [];
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
