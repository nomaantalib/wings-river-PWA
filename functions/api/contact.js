// Cloudflare Workers API - Contact Endpoint
export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message received by Wings River team',
        contact: { ...data, id: `msg-${Date.now()}` }
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
