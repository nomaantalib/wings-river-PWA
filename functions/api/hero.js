// Cloudflare Workers Functions API — Hero Settings (D1-backed via settings table)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)`;

export async function onRequestGet(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: true, data: null }), { headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const result = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('wings_hero').first();
    const data = result ? JSON.parse(result.value) : null;
    return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: true, data: null, error: err.message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const data = await context.request.json();
    const valueStr = JSON.stringify(data);
    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind('wings_hero', valueStr).run();
    return new Response(JSON.stringify({ success: true, message: 'Hero settings saved' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    await db.prepare("DELETE FROM settings WHERE key = ?").bind('wings_hero').run();
    return new Response(JSON.stringify({ success: true, message: 'Hero settings reset' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
