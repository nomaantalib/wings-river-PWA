// Cloudflare Workers Functions API — Water Sports Rides (D1-backed, dedicated table)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS water_sports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Water Sports',
  price REAL DEFAULT 0,
  unit TEXT DEFAULT 'Per Person',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  image TEXT DEFAULT '',
  emoji TEXT DEFAULT '🏄',
  created_at TEXT
)`;

export async function onRequestGet(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: true, data: [] }), { headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    let query = await db.prepare("SELECT * FROM water_sports ORDER BY category ASC, name ASC").all();
    let results = query?.results || [];

    if (results.length === 0) {
      const initialRides = [
        { id: 'ride-1', name: 'Jetski Thrill Ride', emoji: '🏄', category: 'Water Sports', price: 350, unit: 'Per Person 1 Round', description: 'High speed jet ski adventure on Gomti river with certified instructor & life jacket.', badge: 'Most Popular', image: '/images/Screenshot_20260720-180544_Maps.png' },
        { id: 'ride-2', name: 'Speed Boat Ride', emoji: '⚡', category: 'Water Sports', price: 250, unit: 'Per Person 1 Round', description: 'Exhilarating twin-engine speedboat ride offering panoramic riverfront views.', badge: 'Family Favorite', image: '/images/Screenshot_20260720-180745_Maps.png' },
        { id: 'ride-3', name: 'Motor Boat Cruise', emoji: '🚤', category: 'Water Sports', price: 200, unit: 'Per Person 1 Round', description: 'Smooth & comfortable motor boat cruise around Laxman Jhula park riverfront.', badge: 'Scenic Cruise', image: '/images/Screenshot_20260720-180555_Maps.png' },
        { id: 'ride-4', name: 'Panda Train', emoji: '🐼', category: 'Other Activities', price: 50, unit: 'Per Person 1 Round', description: 'Fun musical track train ride for toddlers, kids & families near the river park.', badge: 'Kids Zone', image: '/images/Screenshot_20260720-180737_Maps.png' },
        { id: 'ride-5', name: 'Electric Kids Car', emoji: '🚗', category: 'Other Activities', price: 50, unit: 'Per Person 1 Round', description: 'Illuminated battery-powered electric drive cars for young adventurers.', badge: 'Kids Fun', image: '/images/Screenshot_20260720-180621_Maps.png' },
        { id: 'ride-6', name: 'Trampoline Jump', emoji: '🤸', category: 'Other Activities', price: 50, unit: 'Per Person 1 Round', description: 'Enclosed safety netting high-bounce jumping trampoline enclosure.', badge: 'Active Play', image: '/images/Screenshot_20260720-180724_Maps.png' }
      ];
      for (const r of initialRides) {
        await db.prepare(`
          INSERT INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          r.id,
          r.name,
          r.category,
          r.price,
          r.unit,
          r.description,
          r.badge,
          r.image,
          r.emoji,
          new Date().toISOString()
        ).run();
      }
      query = await db.prepare("SELECT * FROM water_sports ORDER BY category ASC, name ASC").all();
      results = query?.results || [];
    }

    return new Response(JSON.stringify({ success: true, data: results }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: true, data: [], error: err.message }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestPost(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    await db.prepare(CREATE_TABLE).run();
    const data = await context.request.json();
    const id = data.id || `ride-${Date.now()}`;
    await db.prepare(`
      INSERT OR REPLACE INTO water_sports (id, name, category, price, unit, description, badge, image, emoji, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      data.category || 'Water Sports',
      parseFloat(data.price) || 0,
      data.unit || 'Per Person',
      data.description || '',
      data.badge || '',
      data.image || '',
      data.emoji || '🏄',
      data.created_at || new Date().toISOString()
    ).run();
    return new Response(JSON.stringify({ success: true, message: 'Ride saved', id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function onRequestDelete(context) {
  const db = context?.env?.DB;
  if (!db) return new Response(JSON.stringify({ success: false, error: 'Database not bound' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) throw new Error('Missing id parameter');
    await db.prepare("DELETE FROM water_sports WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Ride deleted' }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
