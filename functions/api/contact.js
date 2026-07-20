// Cloudflare Workers Functions API Endpoint for Contact Messages (D1-backed)
export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ success: true, data: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const { results } = await db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all();
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
    const id = data.id || `msg-${Date.now()}`;

    await db.prepare(`
      INSERT OR REPLACE INTO contact_messages (id, name, phone, email, message, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name,
      data.phone,
      data.email || null,
      data.message,
      data.status || 'unread'
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
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500 });
  try {
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
