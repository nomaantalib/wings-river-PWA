// Cloudflare Workers Functions API Endpoint for Contact Messages (D1-backed)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
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
    const query = await db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all();
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
    const id = data.id || `msg-${Date.now()}`;
    const createdAt = data.created_at || new Date().toISOString();

    await db.prepare(`
      INSERT OR REPLACE INTO contact_messages (id, name, phone, email, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      data.phone || '',
      data.email || null,
      data.message || '',
      data.status || 'unread',
      createdAt
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Message saved', id }), {
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

    await db.prepare("DELETE FROM contact_messages WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Message deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
