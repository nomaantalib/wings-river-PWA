// Cloudflare Workers Functions API — Menu Booklet Pages (D1-backed, dedicated table)
// Each row stores one page; categories stored as JSON string
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS menu_pages (
  page_number INTEGER PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  image TEXT DEFAULT '',
  categories TEXT DEFAULT '[]',
  updated_at TEXT
)`;

export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: true, data: [] }), { headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const { results } = await db.prepare("SELECT * FROM menu_pages ORDER BY page_number ASC").all();
    const data = results.map(r => ({
      pageNumber: r.page_number,
      title: r.title || '',
      subtitle: r.subtitle || '',
      image: r.image || '',
      categories: (() => { try { return JSON.parse(r.categories || '[]'); } catch { return []; } })()
    }));
    return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const payload = await context.request.json();
    // Accept either a single page or an array of pages
    const pages = Array.isArray(payload) ? payload : [payload];

    for (const page of pages) {
      if (!page.pageNumber && page.pageNumber !== 0) continue;
      await db.prepare(`
        INSERT OR REPLACE INTO menu_pages (page_number, title, subtitle, image, categories, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        Number(page.pageNumber),
        page.title || '',
        page.subtitle || '',
        page.image || '',
        JSON.stringify(Array.isArray(page.categories) ? page.categories : []),
        new Date().toISOString()
      ).run();
    }

    return new Response(JSON.stringify({ success: true, message: 'Menu pages saved' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  const db = context.env.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  try {
    const url = new URL(context.request.url);
    const pn = url.searchParams.get('page_number');
    if (!pn) throw new Error('Missing page_number parameter');
    await db.prepare("DELETE FROM menu_pages WHERE page_number = ?").bind(Number(pn)).run();
    return new Response(JSON.stringify({ success: true, message: 'Menu page deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
