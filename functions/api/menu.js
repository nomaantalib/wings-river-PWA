// Cloudflare Workers Functions API Endpoint for Food Menu (D1-backed)
export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ success: true, data: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const { results } = await db.prepare("SELECT * FROM menu_items ORDER BY category ASC, name ASC").all();
    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500 });
  try {
    const data = await context.request.json();
    const id = data.id || `menu-${Date.now()}`;
    const price = parseFloat(data.price) || 0;
    const isVeg = data.is_veg !== undefined ? (data.is_veg ? 1 : 0) : 1;
    const isAvailable = data.is_available !== undefined ? (data.is_available ? 1 : 0) : 1;

    await db.prepare(`
      INSERT OR REPLACE INTO menu_items (id, category, name, description, price, is_veg, image_url, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.category,
      data.name,
      data.description || null,
      price,
      isVeg,
      data.image_url || null,
      isAvailable
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
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500 });
  try {
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
