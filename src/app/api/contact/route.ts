import { NextResponse } from 'next/server';
import { ContactMessage } from '@/lib/db';

export const runtime = 'edge';

let localMessages: ContactMessage[] = [];

export async function GET() {
  try {
    const env = (process.env as any) || {};
    if (env.DB) {
      const { results } = await env.DB.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
      return NextResponse.json({ success: true, data: results });
    }
    return NextResponse.json({ success: true, data: localMessages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ success: false, message: 'Name, Phone, and Message are required' }, { status: 400 });
    }

    const newMessage: ContactMessage = {
      id: 'msg-' + Date.now(),
      name,
      phone,
      email: email || '',
      message,
      created_at: new Date().toISOString()
    };

    const env = (process.env as any) || {};
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO contact_messages (id, name, phone, email, message) VALUES (?, ?, ?, ?, ?)`
      ).bind(newMessage.id, newMessage.name, newMessage.phone, newMessage.email, newMessage.message).run();
    } else {
      localMessages.unshift(newMessage);
    }

    return NextResponse.json({ success: true, message: 'Thank you! Your message has been sent to Wings River Café.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
