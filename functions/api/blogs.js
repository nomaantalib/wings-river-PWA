// Cloudflare Workers Functions API Endpoint for Blogs (D1-backed)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'Food & Dining',
  cover_image TEXT,
  images TEXT,
  author TEXT DEFAULT 'Wings River Team',
  read_time TEXT DEFAULT '4 min read',
  is_published INTEGER DEFAULT 1,
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
    const query = await db.prepare("SELECT * FROM blogs ORDER BY created_at DESC").all();
    const results = query?.results || [];
    const formatted = results.map(row => {
      let imagesArr = [];
      if (row.images) {
        try { imagesArr = JSON.parse(row.images); } catch { }
      }
      return {
        ...row,
        is_published: row.is_published === 1 || row.is_published === true,
        images: Array.isArray(imagesArr) && imagesArr.length > 0 ? imagesArr : (row.cover_image ? [row.cover_image] : [])
      };
    });
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
    const data = await context.request.json().catch(() => ({}));
    const id = data.id || `blog-${Date.now()}`;
    const slug = data.slug || id;
    const isPublished = data.is_published !== false ? 1 : 0;
    const createdAt = data.created_at || new Date().toISOString();
    const imagesStr = Array.isArray(data.images) ? JSON.stringify(data.images) : null;

    await db.prepare(`
      INSERT OR REPLACE INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, author, read_time, is_published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      slug,
      data.excerpt || '',
      data.content || '',
      data.category || 'Food & Dining',
      data.cover_image || null,
      imagesStr,
      data.author || 'Wings River Team',
      data.read_time || '4 min read',
      isPublished,
      createdAt
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Blog post saved', id }), {
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

    await db.prepare("DELETE FROM blogs WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Blog post deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
