// Cloudflare Workers Functions API — Hero Settings (D1-backed via settings table)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)`;

export async function onRequestGet(context) {
  const db = context?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ success: true, data: null }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    await db.prepare(CREATE_TABLE).run();
    let result = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('wings_hero').first();
    
    if (!result) {
      const defaultHero = {
        badgeText: '✨ Lucknow’s Premier Waterfront Dining & Water Sports Destination',
        mainHeadline: 'Wings River Café & Water Sports',
        subHeadline: 'Multicuisine Gourmet Food, Riverside Deck & Thrilling Speedboat Rides',
        contactPhone: '07310008020',
        slides: [
          { id: 'hs-1', image: '/images/Screenshot_20260720-180544_Maps.png', title: 'Wings River Café', subtitle: 'Taste • Eat • Relax by the Gomti River', tag: 'Lucknow Water Sports & Speedboat Rides' },
          { id: 'hs-2', image: '/images/Screenshot_20260720-180555_Maps.png', title: 'Luxurious Riverside Dining', subtitle: 'Multicuisine Delights with Scenic Sunset Views', tag: 'Family Restaurant & Evening Ambience' },
          { id: 'hs-3', image: '/images/Screenshot_20260720-180609_Maps.png', title: 'Celebrations & Party Canopy', subtitle: 'Birthday Parties, Anniversaries & Romantic Dinners', tag: 'Fairy Light Arches & Custom Catering' },
          { id: 'hs-4', image: '/images/Screenshot_20260720-180745_Maps.png', title: 'Speedboat Rides on River Gomti', subtitle: 'Exhilarating Water Sports Adventures Beside the Cafe', tag: 'Lucknow Water Sports Official Hub' },
          { id: 'hs-5', image: '/images/Screenshot_20260720-180621_Maps.png', title: 'Breathtaking Sunset Riverfront', subtitle: 'Relax with Gourmet Coffee & Coolers by Laxman Jhula Bridge', tag: 'Scenic Sunset & Waterfront Deck' },
          { id: 'hs-6', image: '/images/Screenshot_20260720-180644_Maps.png', title: 'Glow of Waterfront Nightlife', subtitle: 'Enchanting Lighting, Music & River Breeze Evenings', tag: 'Lucknow’s Top Waterfront Night Venue' },
          { id: 'hs-7', image: '/images/Screenshot_20260720-180927_Instagram.png', title: 'Master Chef Gourmet Spread', subtitle: 'Authentic Indian, Indochinese & Artisanal Pizzas', tag: 'Premium Multicuisine Gastronomy' }
        ]
      };
      const valueStr = JSON.stringify(defaultHero);
      await db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind('wings_hero', valueStr).run();
      result = await db.prepare("SELECT value FROM settings WHERE key = ?").bind('wings_hero').first();
    }

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
