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
    let query = await db.prepare("SELECT * FROM blogs ORDER BY created_at DESC").all();
    let results = query?.results || [];

    if (results.length === 0) {
      const initialBlogs = [
        {
          id: 'b1',
          title: 'Experience Lucknow’s Finest Riverside Dining & Speedboat Rides',
          slug: 'riverside-dining-and-speedboat-rides-lucknow',
          excerpt: 'Discover why Wings River Café at Laxman Jhula Park offers an unforgettable blend of multicuisine delicacies and thrilling river adventures.',
          content: 'Wings River Café is not just a place to eat—it is a complete sensory destination situated right along the Gomti River at Laxman Mela Ground. Guests can enjoy mouthwatering multicuisine dishes on our elevated riverside deck while watching speedboats zip across the water.\n\nOur open-air seating provides panoramic views of the water sunset, with warm lighting and ambient acoustic music setting the perfect mood. Combine your meal with an adrenaline-pumping speedboat round operated directly by Lucknow Water Sports!',
          category: 'Riverside Experience',
          cover_image: '/images/Screenshot_20260720-180544_Maps.png',
          images: JSON.stringify([
            '/images/Screenshot_20260720-180544_Maps.png',
            '/images/Screenshot_20260720-180609_Maps.png',
            '/images/Screenshot_20260720-180644_Maps.png',
            '/images/food_menu_collage.jpg'
          ]),
          author: 'Wings River Team',
          read_time: '4 min read',
          created_at: '2026-07-15'
        },
        {
          id: 'b2',
          title: 'Host Unforgettable Birthday Parties & Celebrations by the Gomti River',
          slug: 'host-birthday-parties-wings-river-cafe',
          excerpt: 'From fairy light canopies to custom buffet menus, learn how to turn your birthday or anniversary into a magical evening.',
          content: 'Searching for the best party venue in Hazratganj and Purana Haidarabad? Wings River Café offers exclusive outdoor canopy setups, personalized lighting arches, DJ audio equipment, and customizable multicuisine buffet spreads for up to 200 guests.\n\nWhether it is a romantic candlelit anniversary setup or a lively birthday bash with friends, our dedicated event management team handles end-to-end decor, custom cake arrangements, and live grill stations.',
          category: 'Events & Parties',
          cover_image: '/images/Screenshot_20260720-180609_Maps.png',
          images: JSON.stringify([
            '/images/Screenshot_20260720-180609_Maps.png',
            '/images/Screenshot_20260720-180644_Maps.png',
            '/images/Screenshot_20260720-180938_Instagram.png'
          ]),
          author: 'Event Coordinator',
          read_time: '3 min read',
          created_at: '2026-07-10'
        },
        {
          id: 'b3',
          title: 'Nightlife & Evening Ambiance at Laxman Jhula Waterfront',
          slug: 'nightlife-and-evening-ambiance-wings-river-cafe',
          excerpt: 'Experience the stunning night illumination, cool Gomti river breezes, and candlelit outdoor tables.',
          content: 'As sunset sets over the Gomti River, Wings River Café transforms into a glowing haven. Enjoy wood-fired pizzas, gourmet cocktails, and soothing music with a magnificent view of the lit-up Laxman Jhula Bridge.\n\nNight owls can relax under our illuminated palm canopy until midnight while sampling artisanal cold coffees, mocktails, and sizzling hot Indo-Chinese starters.',
          category: 'Nightlife',
          cover_image: '/images/Screenshot_20260720-180644_Maps.png',
          images: JSON.stringify([
            '/images/Screenshot_20260720-180644_Maps.png',
            '/images/Screenshot_20260720-180544_Maps.png',
            '/images/water_sports_ticket_poster.png'
          ]),
          author: 'Lifestyle Editor',
          read_time: '3 min read',
          created_at: '2026-07-08'
        },
        {
          id: 'b4',
          title: 'Official Lucknow Water Sports Ticket Rates & Speedboat Guide',
          slug: 'lucknow-water-sports-ticket-rates-guide',
          excerpt: 'Check out official ride tokens for Jetskis, Speedboats, Motorboats, and kids amusement rides.',
          content: 'Lucknow Water Sports operating directly at Wings River Café counter offers safe and thrilling rides on Gomti river. Read our complete guide on rates, safety gear, and booking packages.\n\nAll rides come equipped with standard life jackets and certified captains. Group discounts and combo packages (Ride + Meal Token) are available at the front desk.',
          category: 'Water Sports',
          cover_image: '/images/water_sports_ticket_poster.png',
          images: JSON.stringify([
            '/images/water_sports_ticket_poster.png',
            '/images/Screenshot_20260720-180544_Maps.png'
          ]),
          author: 'Water Sports Captain',
          read_time: '5 min read',
          created_at: '2026-07-05'
        },
        {
          id: 'b5',
          title: 'Chef’s Gourmet Specials & Signature Mocktails Highlight',
          slug: 'chefs-gourmet-specials-signature-mocktails',
          excerpt: 'Explore our top chef recommendations from Paneer Tikka to Blue Lagoon coolers.',
          content: 'From traditional North Indian delicacies to trendy mocktails and sizzling Indochinese woks, discover what makes our multicuisine menu a culinary favorite in Lucknow.\n\nDon’t miss out on our Signature Virgin Mojito, Special Chola Bhatura, and Handi Soya Chaap prepared fresh daily by master chefs.',
          category: 'Culinary Highlights',
          cover_image: '/images/Screenshot_20260720-180938_Instagram.png',
          images: JSON.stringify([
            '/images/Screenshot_20260720-180938_Instagram.png',
            '/images/food_menu_collage.jpg',
            '/images/Screenshot_20260720-180609_Maps.png'
          ]),
          author: 'Head Chef',
          read_time: '4 min read',
          created_at: '2026-07-01'
        }
      ];
      for (const b of initialBlogs) {
        await db.prepare(`
          INSERT INTO blogs (id, title, slug, excerpt, content, category, cover_image, images, author, read_time, is_published, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        `).bind(
          b.id,
          b.title,
          b.slug,
          b.excerpt,
          b.content,
          b.category,
          b.cover_image,
          b.images,
          b.author,
          b.read_time,
          b.created_at
        ).run();
      }
      query = await db.prepare("SELECT * FROM blogs ORDER BY created_at DESC").all();
      results = query?.results || [];
    }

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
