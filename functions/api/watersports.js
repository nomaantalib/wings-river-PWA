// Cloudflare Workers Functions API — Water Sports Rides (D1-backed, dedicated table)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS water_sports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Water Sports',
  price REAL DEFAULT 0,
  unit TEXT DEFAULT 'Per Person',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  image TEXT DEFAULT '',
  emoji TEXT DEFAULT '🏄',
  created_at TEXT
)`;

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: true, data: [] }), { headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const { results } = await db.prepare("SELECT * FROM water_sports ORDER BY category ASC, name ASC").all();
    return new Response(JSON.stringify({ success: true, data: results }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const data = await context.request.json();
    const id = data.id || `ride-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      data.category || 'Water Sports',
      parseFloat(data.price) || 0,
      data.unit || 'Per Person',
      data.description || '',
      data.badge || '',
      data.image || '',
      data.emoji || '🏄',
      data.created_at || new Date().toISOString()
    ).run();
    return new Response(JSON.stringify({ success: true, message: 'Ride saved', id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) throw new Error('Missing id parameter');
    await db.prepare("DELETE FROM water_sports WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Ride deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
