// Cloudflare Workers Functions API Endpoint for Menu Items
export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Wings River Menu API ready'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
