// Cloudflare Workers Functions API Endpoint for Bookings
export async function onRequestGet(context) {
  const sampleBookings = [
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

  return new Response(JSON.stringify({ success: true, data: sampleBookings }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reservation recorded successfully',
        booking: { ...data, id: `res-${Date.now()}` }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
