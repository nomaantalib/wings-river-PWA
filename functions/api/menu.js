// Cloudflare Workers Functions API Endpoint for Food Menu (D1-backed)
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL DEFAULT 0,
  is_veg INTEGER DEFAULT 1,
  image_url TEXT,
  is_available INTEGER DEFAULT 1,
  page_number INTEGER DEFAULT 1
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
    let query = await db.prepare("SELECT * FROM menu_items ORDER BY category ASC, name ASC").all();
    let results = query?.results || [];

    if (results.length === 0) {
      const initialItems = [
        { id: 'm1', category: 'Beverages', name: 'Special Masala Chai', description: 'Freshly brewed kulhad tea with cardamoms & ginger.', price: 50, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm2', category: 'Beverages', name: 'Fresh Lime Soda', description: 'Sweet or salted sparkling fresh lime soda.', price: 60, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm3', category: 'Breakfast', name: 'Bun Makkhan', description: 'Soft toasted bun stuffed with rich farm butter.', price: 60, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm4', category: 'Breakfast', name: 'Special Chola Bhatura', description: 'Piping hot fluffy bhaturas served with spicy Amritsari chole.', price: 150, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm5', category: 'Breakfast', name: 'Paneer Paratha', description: 'Stuffed cottage cheese paratha served with curd & pickle.', price: 110, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm6', category: 'Breakfast', name: 'Dahi Jalebi (200gm)', description: 'Crispy golden jalebis paired with fresh thick curd.', price: 150, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm7', category: 'Chaat', name: 'Special Pav Bhaji', description: 'Butter-loaded spicy mashed vegetable bhaji served with toasted pavs.', price: 150, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm8', category: 'Chaat', name: 'Cheese Butter Pav Bhaji', description: 'Gratinated melted cheese topped over butter pav bhaji.', price: 170, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm9', category: 'Chaat', name: 'Agra Ka Special Bhalla', description: 'Crispy potato bhalla topped with sweet curd & mint chutney.', price: 80, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm10', category: 'Chaat', name: 'Lucknowi Basket Chaat', description: 'Crispy potato basket filled with tikkis, sprouts & curd.', price: 150, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm11', category: 'Chaat', name: 'Gol Gappe (6 Pcs)', description: 'Crispy puris filled with spicy mint water & tangy chutney.', price: 40, is_veg: 1, image_url: '/images/menu_page_1.png', page_number: 2 },
        { id: 'm12', category: 'Drinks', name: 'Virgin Mojito', description: 'Fresh mint, lime wedges, crushed ice & sparkling soda.', price: 119, is_veg: 1, image_url: '/images/menu_page_2.png', page_number: 3 },
        { id: 'm13', category: 'Drinks', name: 'Blue Lagoon Cooler', description: 'Refreshing curacao blue citrus cooler with lemon zest.', price: 129, is_veg: 1, image_url: '/images/menu_page_2.png', page_number: 3 },
        { id: 'm14', category: 'Drinks', name: 'Watermelon Sunset Mojito', description: 'Fresh watermelon extract, mint & chat masala fizz.', price: 129, is_veg: 1, image_url: '/images/menu_page_2.png', page_number: 3 },
        { id: 'm15', category: 'Drinks', name: 'Peach Iced Tea', description: 'Slow brewed tea infused with natural peach nectar.', price: 129, is_veg: 1, image_url: '/images/menu_page_2.png', page_number: 3 },
        { id: 'm16', category: 'Drinks', name: 'Virgin Pina Colada', description: 'Creamy coconut milk & pineapple juice mocktail.', price: 129, is_veg: 1, image_url: '/images/menu_page_2.png', page_number: 3 },
        { id: 'm17', category: 'Coffee', name: 'Riverside Cold Brew Coffee', description: 'Chilled rich espresso blended with vanilla cream.', price: 149, is_veg: 1, image_url: '/images/menu_page_3.png', page_number: 4 },
        { id: 'm18', category: 'Desserts', name: 'Oreo Cream Shake', description: 'Rich chocolate cookie shake topped with whipped cream.', price: 149, is_veg: 1, image_url: '/images/menu_page_3.png', page_number: 4 },
        { id: 'm19', category: 'Starter', name: 'Veg Manchow Soup', description: 'Spicy Indo-Chinese soup served with crispy fried noodles.', price: 149, is_veg: 1, image_url: '/images/menu_page_3.png', page_number: 4 },
        { id: 'm20', category: 'Starter', name: 'Lemon Coriander Soup', description: 'Vitamin-C rich clear soup with fresh coriander & lime.', price: 149, is_veg: 1, image_url: '/images/menu_page_3.png', page_number: 4 },
        { id: 'm21', category: 'Indian', name: 'Dal Makhani Shahi', description: 'Slow-cooked black lentils in rich cream & butter.', price: 265, is_veg: 1, image_url: '/images/menu_page_4.png', page_number: 5 },
        { id: 'm22', category: 'Indian', name: 'Paneer Lababdar', description: 'Soft paneer cubes simmered in onion-tomato cashew gravy.', price: 315, is_veg: 1, image_url: '/images/menu_page_4.png', page_number: 5 },
        { id: 'm23', category: 'Indian', name: 'Handi Soya Chaap Gravy', description: 'Tandoori soya chaap pieces cooked in claypot spices.', price: 305, is_veg: 1, image_url: '/images/menu_page_4.png', page_number: 5 },
        { id: 'm24', category: 'Indian', name: 'Deluxe Veg Thali', description: 'Paneer, Dal Makhani, Mix Veg, Naan, Rice, Raita & Sweet.', price: 345, is_veg: 1, image_url: '/images/menu_page_4.png', page_number: 5 },
        { id: 'm25', category: 'Pizza', name: 'Loaded Special Pizza', description: 'Loaded wood-fired pizza with mozzarella, paneer & peppers.', price: 349, is_veg: 1, image_url: '/images/menu_page_5.png', page_number: 6 },
        { id: 'm26', category: 'Burger', name: 'Gourmet Paneer Burger', description: 'Crispy cottage cheese patty, cheddar, jalapenos & dip.', price: 329, is_veg: 1, image_url: '/images/menu_page_5.png', page_number: 6 },
        { id: 'm27', category: 'Starter', name: 'Cheese Garlic Bread (4 Pcs)', description: 'Toasted baguette topped with garlic butter & mozzarella.', price: 235, is_veg: 1, image_url: '/images/menu_page_5.png', page_number: 6 },
        { id: 'm28', category: 'Chinese', name: 'Chilli Paneer Dry', description: 'Paneer wok-tossed with capsicum, garlic & Schezwan.', price: 219, is_veg: 1, image_url: '/images/menu_page_6.png', page_number: 7 },
        { id: 'm29', category: 'Chinese', name: 'Veg Hakka Noodles', description: 'Stir-fried noodles loaded with crunchy veggies & light soy.', price: 249, is_veg: 1, image_url: '/images/menu_page_6.png', page_number: 7 },
        { id: 'm30', category: 'Chinese', name: 'Cottage Cheese Sizzler', description: 'Paneer steak, herb rice, sautéed veggies & french fries.', price: 449, is_veg: 1, image_url: '/images/menu_page_6.png', page_number: 7 },
        { id: 'm31', category: 'Italian', name: 'Red Sauce Arrabiata Pasta', description: 'Penne pasta tossed in spicy basil tomato concasse.', price: 275, is_veg: 1, image_url: '/images/menu_page_7.png', page_number: 8 },
        { id: 'm32', category: 'Starter', name: 'Paneer Tikka Charcoal Grilled', description: 'Classic marinated paneer skewers roasted in tandoor.', price: 299, is_veg: 1, image_url: '/images/menu_page_7.png', page_number: 8 },
        { id: 'm33', category: 'Desserts', name: 'Hot Gulab Jamun (2 Pcs)', description: 'Soft milk solids dumplings in hot cardamom syrup.', price: 99, is_veg: 1, image_url: '/images/menu_page_7.png', page_number: 8 },
        { id: 'm34', category: 'Desserts', name: 'Royal Shahi Tukda', description: 'Saffron bread topped with thick rabri & pistachios.', price: 169, is_veg: 1, image_url: '/images/menu_page_7.png', page_number: 8 }
      ];
      for (const item of initialItems) {
        await db.prepare(`
          INSERT INTO menu_items (id, category, name, description, price, is_veg, image_url, is_available, page_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          item.id,
          item.category,
          item.name,
          item.description,
          item.price,
          item.is_veg,
          item.image_url,
          1,
          item.page_number
        ).run();
      }
      query = await db.prepare("SELECT * FROM menu_items ORDER BY category ASC, name ASC").all();
      results = query?.results || [];
    }

    const formatted = results.map(r => ({
      ...r,
      is_veg: r.is_veg === 1 || r.is_veg === true,
      is_available: r.is_available === 1 || r.is_available === true
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
    const id = data.id || `menu-${Date.now()}`;
    const price = parseFloat(data.price) || 0;
    const isVeg = data.is_veg !== false ? 1 : 0;
    const isAvailable = data.is_available !== false ? 1 : 0;
    const pageNumber = Number(data.page_number) || 1;

    await db.prepare(`
      INSERT OR REPLACE INTO menu_items (id, category, name, description, price, is_veg, image_url, is_available, page_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.category || 'Starter',
      data.name || '',
      data.description || '',
      price,
      isVeg,
      data.image_url || '',
      isAvailable,
      pageNumber
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Menu item saved', id }), {
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

    await db.prepare("DELETE FROM menu_items WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Menu item deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
