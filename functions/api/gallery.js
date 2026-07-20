// Cloudflare Workers Functions API Endpoint for Photo Gallery (D1-backed)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Restaurant',
  image_url TEXT NOT NULL,
  featured INTEGER DEFAULT 0,
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
    let query = await db.prepare("SELECT * FROM gallery ORDER BY created_at DESC").all();
    let results = query?.results || [];

    if (results.length === 0) {
      const initialItems = [
        { id: 'g1', title: 'Jet Ski Thrill Ride — Gomti River', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180544_Maps.png', featured: 1 },
        { id: 'g2', title: 'Speedboat Action Shot — Gomti', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180745_Maps.png', featured: 1 },
        { id: 'g3', title: 'Water Sports Activity Poster', category: 'Water Sports', image_url: '/images/watersports_menu.jpg', featured: 1 },
        { id: 'g4', title: 'Motorboat Cruise — Laxman Jhula', category: 'Water Sports', image_url: '/images/Screenshot_20260720-180555_Maps.png', featured: 1 },
        { id: 'g5', title: 'Fairy Light Canopy Evening Setup', category: 'Evening', image_url: '/images/Screenshot_20260720-180609_Maps.png', featured: 1 },
        { id: 'g6', title: 'Sunset Gomti Riverfront Lounge', category: 'River View', image_url: '/images/Screenshot_20260720-180621_Maps.png', featured: 1 },
        { id: 'g7', title: 'Nighttime Waterfront Party Lights', category: 'Evening', image_url: '/images/Screenshot_20260720-180644_Maps.png', featured: 1 },
        { id: 'g8', title: 'Riverside Lounge Evening Ambience', category: 'Evening', image_url: '/images/Screenshot_20260720-180755_Maps.png', featured: 0 },
        { id: 'g9', title: 'Cozy Indoor Dining Lounge', category: 'Restaurant', image_url: '/images/Screenshot_20260720-180630_Maps.png', featured: 0 },
        { id: 'g10', title: 'Café Entrance — Laxman Mela Ground', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180724_Maps.png', featured: 0 },
        { id: 'g11', title: 'Outdoor Riverside Lawn & Garden Tables', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180737_Maps.png', featured: 0 },
        { id: 'g12', title: 'Customer Dining Deck & Celebration Venue', category: 'Outdoor Seating', image_url: '/images/Screenshot_20260720-180812_Maps.png', featured: 0 },
        { id: 'g13', title: 'Instagram Highlight: Deck Vibe', category: 'Restaurant', image_url: '/images/Screenshot_20260720-175721_Instagram.png', featured: 0 },
        { id: 'g14', title: 'Chef Special Gourmet Food Spread', category: 'Food', image_url: '/images/Screenshot_20260720-180927_Instagram.png', featured: 1 },
        { id: 'g15', title: 'Signature Drinks & Mocktail Bar', category: 'Food', image_url: '/images/Screenshot_20260720-180938_Instagram.png', featured: 1 }
      ];
      for (const item of initialItems) {
        await db.prepare(`
          INSERT INTO gallery (id, title, category, image_url, featured, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          item.id,
          item.title,
          item.category,
          item.image_url,
          item.featured,
          new Date().toISOString()
        ).run();
      }
      query = await db.prepare("SELECT * FROM gallery ORDER BY created_at DESC").all();
      results = query?.results || [];
    }

    const formatted = results.map(r => ({
      ...r,
      featured: r.featured === 1 || r.featured === true
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
    const data = await context.request.json().catch(() => ({}));
    const id = data.id || `gal-${Date.now()}`;
    const featured = data.featured ? 1 : 0;
    const createdAt = data.created_at || new Date().toISOString();

    await db.prepare(`
      INSERT OR REPLACE INTO gallery (id, title, category, image_url, featured, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      data.category || 'Restaurant',
      data.image_url || '',
      featured,
      createdAt
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Gallery item saved', id }), {
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

    await db.prepare("DELETE FROM gallery WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Gallery item deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
