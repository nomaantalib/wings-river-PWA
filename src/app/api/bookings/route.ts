import { NextResponse } from 'next/server';
import { Reservation, getD1Binding } from '@/lib/db';

export const runtime = 'edge';

// In-memory array fallback for local dev
let localReservations: Reservation[] = [
  {
    id: 'res-101',
    name: 'Aarav Gupta',
    phone: '09876543210',
    email: 'aarav@example.com',
    booking_type: 'birthday_party',
    date: '2026-07-25',
    time: '19:30',
    guests: 8,
    special_requests: 'Fairy light table setup near river deck',
    status: 'confirmed',
    created_at: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  try {
    const db = getD1Binding(process.env);
    if (db) {
      const { results } = await db.prepare(
        'SELECT * FROM reservations ORDER BY created_at DESC'
      ).all();
      return NextResponse.json({ success: true, data: results });
    }

    return NextResponse.json({ success: true, data: localReservations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, booking_type, date, time, guests, special_requests } = body;

    if (!name || !phone || !date || !time) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields (Name, Phone, Date, Time).' },
        { status: 400 }
      );
    }

    const newBooking: Reservation = {
      id: 'res-' + Date.now(),
      name,
      phone,
      email: email || '',
      booking_type: booking_type || 'table_booking',
      date,
      time,
      guests: Number(guests) || 2,
      special_requests: special_requests || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const db = getD1Binding(process.env);
    if (db) {
      await db.prepare(
        `INSERT INTO reservations (id, name, phone, email, booking_type, date, time, guests, special_requests, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        newBooking.id,
        newBooking.name,
        newBooking.phone,
        newBooking.email,
        newBooking.booking_type,
        newBooking.date,
        newBooking.time,
        newBooking.guests,
        newBooking.special_requests,
        newBooking.status
      ).run();
    } else {
      localReservations.unshift(newBooking);
    }

    return NextResponse.json({
      success: true,
      message: 'Your reservation request has been submitted successfully! Our team will call you to confirm.',
      booking: newBooking
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
