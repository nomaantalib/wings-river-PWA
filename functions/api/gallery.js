// Cloudflare Workers Functions API Endpoint for Photo Gallery (D1-backed)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Restaurant',
  image_url TEXT NOT NULL,
  featured INTEGER DEFAULT 0,
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
    const query = await db.prepare("SELECT * FROM gallery ORDER BY created_at DESC").all();
    const results = query?.results || [];
    const formatted = results.map(r => ({
      ...r,
      featured: r.featured === 1 || r.featured === true
    }));
    return new Response(JSON.stringify({ success: true, data: formatted }), {
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
    const data = await context.request.json().catch(() => ({}));
    const id = data.id || `gal-${Date.now()}`;
    const featured = data.featured ? 1 : 0;
    const createdAt = data.created_at || new Date().toISOString();

    await db.prepare(`
      INSERT OR REPLACE INTO gallery (id, title, category, image_url, featured, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      data.category || 'Restaurant',
      data.image_url || '',
      featured,
      createdAt
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Gallery item saved', id }), {
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

    await db.prepare("DELETE FROM gallery WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Gallery item deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
