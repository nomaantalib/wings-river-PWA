// Cloudflare Workers Functions API — Hero Settings (D1-backed via settings table)
// Stored as a single JSON blob in the settings table under key "wings_hero"

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: true, data: null }), { headers: { 'Content-Type': 'application/json' } });
  try {
    const result = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('wings_hero').first();
    const data = result ? JSON.parse(result.value) : null;
    return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  try {
    const data = await context.request.json();
    const valueStr = JSON.stringify(data);
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind('wings_hero', valueStr).run();
    return new Response(JSON.stringify({ success: true, message: 'Hero settings saved' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare("DELETE FROM settings WHERE key = ?").bind('wings_hero').run();
    return new Response(JSON.stringify({ success: true, message: 'Hero settings reset' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
