// Cloudflare Workers Functions API Endpoint for generic key-value settings storage (D1-backed)
export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ success: true, data: {} }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get('key');

    if (key) {
      const result = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
      return new Response(JSON.stringify({ success: true, data: result ? JSON.parse(result.value) : null }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await db.prepare("SELECT * FROM settings").all();
    const settingsMap = {};
    results.forEach(row => {
      try {
        settingsMap[row.key] = JSON.parse(row.value);
      } catch {
        settingsMap[row.key] = row.value;
      }
    });

    return new Response(JSON.stringify({ success: true, data: settingsMap }), {
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
    const key = data.key;
    if (!key) throw new Error('Missing key parameter');
    const valueString = JSON.stringify(data.value);

    await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(key, valueString).run();

    return new Response(JSON.stringify({ success: true, message: 'Settings saved', key }), {
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
    const key = url.searchParams.get('key');
    if (!key) throw new Error('Missing key parameter');

    await db.prepare("DELETE FROM settings WHERE key = ?").bind(key).run();
    return new Response(JSON.stringify({ success: true, message: 'Setting deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
