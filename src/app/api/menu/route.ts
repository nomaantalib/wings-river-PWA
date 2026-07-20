import { NextResponse } from 'next/server';
import { INITIAL_MENU_ITEMS, MenuItem, getD1Binding } from '@/lib/db';

export const runtime = 'edge';

let localMenu: MenuItem[] = [...INITIAL_MENU_ITEMS];

export async function GET() {
  try {
    const db = getD1Binding(process.env);
    if (db) {
      const { results } = await db.prepare('SELECT * FROM menu_items ORDER BY created_at DESC').all();
      return NextResponse.json({ success: true, data: results.length ? results : localMenu });
    }
    return NextResponse.json({ success: true, data: localMenu });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, name, description, price, is_veg, image_url } = body;

    if (!name || !category || !price) {
      return NextResponse.json({ success: false, message: 'Missing required menu fields' }, { status: 400 });
    }

    const newItem: MenuItem = {
      id: 'm-' + Date.now(),
      category,
      name,
      description: description || '',
      price: Number(price),
      is_veg: Boolean(is_veg),
      image_url: image_url || '/images/Screenshot_20260720-180724_Maps.png',
      is_available: true
    };

    const db = getD1Binding(process.env);
    if (db) {
      await db.prepare(
        `INSERT INTO menu_items (id, category, name, description, price, is_veg, image_url, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(newItem.id, newItem.category, newItem.name, newItem.description, newItem.price, newItem.is_veg ? 1 : 0, newItem.image_url).run();
    } else {
      localMenu.unshift(newItem);
    }

    return NextResponse.json({ success: true, message: 'Menu item created successfully', item: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
