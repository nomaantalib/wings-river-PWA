// Cloudflare Workers Functions API Endpoint for Food Menu (D1-backed)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL DEFAULT 0,
  is_veg INTEGER DEFAULT 1,
  image_url TEXT,
  is_available INTEGER DEFAULT 1,
  page_number INTEGER DEFAULT 1
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
    const query = await db.prepare("SELECT * FROM menu_items ORDER BY category ASC, name ASC").all();
    const results = query?.results || [];
    const formatted = results.map(r => ({
      ...r,
      is_veg: r.is_veg === 1 || r.is_veg === true,
      is_available: r.is_available === 1 || r.is_available === true
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
    const data = await context.request.json();
    const id = data.id || `menu-${Date.now()}`;
    const price = parseFloat(data.price) || 0;
    const isVeg = data.is_veg !== false ? 1 : 0;
    const isAvailable = data.is_available !== false ? 1 : 0;
    const pageNumber = Number(data.page_number) || 1;

    await db.prepare(`
      INSERT OR REPLACE INTO menu_items (id, category, name, description, price, is_veg, image_url, is_available, page_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.category || 'Starter',
      data.name || '',
      data.description || '',
      price,
      isVeg,
      data.image_url || '',
      isAvailable,
      pageNumber
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Menu item saved', id }), {
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

    await db.prepare("DELETE FROM menu_items WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Menu item deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
