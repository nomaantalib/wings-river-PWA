// Cloudflare Workers Functions API Endpoint for Bookings (D1-backed)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  booking_type TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER DEFAULT 2,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
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
    const query = await db.prepare("SELECT * FROM reservations ORDER BY created_at DESC").all();
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
  if (!db) {
    return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    await db.prepare(CREATE_TABLE).run();
    const data = await context.request.json();
    const id = data.id || `res-${Date.now()}`;
    const guests = parseInt(data.guests) || 2;
    const createdAt = data.created_at || new Date().toISOString();

    await db.prepare(`
      INSERT OR REPLACE INTO reservations (id, name, phone, email, booking_type, date, time, guests, special_requests, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      data.phone || '',
      data.email || null,
      data.booking_type || 'Table Reservation',
      data.date || '',
      data.time || '',
      guests,
      data.special_requests || null,
      data.status || 'pending',
      createdAt
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Reservation saved', id }), {
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

    await db.prepare("DELETE FROM reservations WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Reservation deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
