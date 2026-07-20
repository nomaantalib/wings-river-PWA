// Cloudflare Workers Functions API — Event Banners (D1-backed, dedicated table)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS event_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  cta_text TEXT DEFAULT '',
  cta_link TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  created_at TEXT
)`;

export async function onRequestGet(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: true, data: [] }), { headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const query = await db.prepare("SELECT * FROM event_banners ORDER BY created_at DESC").all();
    const results = query?.results || [];
    const data = results.map(r => ({ ...r, is_active: r.is_active === 1 || r.is_active === true }));
    return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: true, data: [], error: err.message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const data = await context.request.json();
    const id = data.id || `banner-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO event_banners (id, title, subtitle, image_url, cta_text, cta_link, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      data.subtitle || '',
      data.image_url || '',
      data.cta_text || '',
      data.cta_link || '',
      data.is_active !== false ? 1 : 0,
      data.created_at || new Date().toISOString()
    ).run();
    return new Response(JSON.stringify({ success: true, message: 'Banner saved', id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) throw new Error('Missing id parameter');
    await db.prepare("DELETE FROM event_banners WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Banner deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
