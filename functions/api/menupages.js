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
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: true, data: [] }), { headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    let query = await db.prepare("SELECT * FROM menu_pages ORDER BY page_number ASC").all();
    let results = query?.results || [];

    if (results.length === 0) {
      const initialPages = [
        { pageNumber: 1, title: 'Wings River & Water Sports Menu', subtitle: 'Delicious Moments, Unforgettable Memories', image: '/menu card food/page1.png', categories: JSON.stringify(['Cover']) },
        { pageNumber: 2, title: 'Beverages, Breakfast & Chaat', subtitle: 'Chai, Chola Bhatura, Pav Bhaji & Agra Bhalla', image: '/menu card food/page2.png', categories: JSON.stringify(['Beverages', 'Breakfast', 'Chaat']) },
        { pageNumber: 3, title: 'Coolers & Mocktails', subtitle: 'Virgin Mojito, Blue Lagoon, Iced Teas & Lassi', image: '/menu card food/page 3.png', categories: JSON.stringify(['Coolers & Mocktails']) },
        { pageNumber: 4, title: 'Shakes & Gourmet Soups', subtitle: 'Oreo Shake, Cold Coffee, Manchow & Sweet Corn', image: '/menu card food/page4 .png', categories: JSON.stringify(['Shakes', 'Soup']) },
        { pageNumber: 5, title: 'Indian Main Course & South Indian', subtitle: 'Butter Chicken, Dal Makhani, Paneer Lababdar & Thalis', image: '/menu card food/page 5.png', categories: JSON.stringify(['Indian', 'South Indian']) },
        { pageNumber: 6, title: 'Pizza, Burger & Sandwiches', subtitle: 'Loaded Wings Pizza, Paneer Burger & Garlic Breads', image: '/menu card food/page6 .png', categories: JSON.stringify(['Pizza', 'Burger', 'Sandwiches']) },
        { pageNumber: 7, title: 'Chinese Woks & Sizzlers', subtitle: 'Hakka Noodles, Chilli Paneer, Manchurian & Sizzlers', image: '/menu card food/page 7.png', categories: JSON.stringify(['Chinese', 'Sizzlers']) },
        { pageNumber: 8, title: 'Indo-Continental Bites & Desserts', subtitle: 'Pastas, Paneer Tikka, Gulab Jamun & Shahi Tukda', image: '/menu card food/page 8.png', categories: JSON.stringify(['Indo-Continental', 'Dessert']) }
      ];
      for (const p of initialPages) {
        await db.prepare(`
          INSERT INTO menu_pages (page_number, title, subtitle, image, categories, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          p.pageNumber,
          p.title,
          p.subtitle,
          p.image,
          p.categories,
          new Date().toISOString()
        ).run();
      }
      query = await db.prepare("SELECT * FROM menu_pages ORDER BY page_number ASC").all();
      results = query?.results || [];
    }

    const data = results.map(r => ({
      pageNumber: r.page_number,
      title: r.title || '',
      subtitle: r.subtitle || '',
      image: r.image || '',
      categories: (() => { try { return JSON.parse(r.categories || '[]'); } catch { return []; } })()
    }));
    return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: true, data: [], error: err.message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const payload = await context.request.json();
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
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
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
