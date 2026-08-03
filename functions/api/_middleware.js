// Centralized CORS & Fail-Safe Middleware for Cloudflare Pages API Functions
export async function onRequest(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };

  // Handle preflight OPTIONS requests immediately
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Proceed with the Hono request handler
    const response = await context.next();

    if (!response) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Clone response and inject CORS headers
    const newHeaders = new Headers(response.headers || {});
    for (const [key, val] of Object.entries(corsHeaders)) {
      newHeaders.set(key, val);
    }

    return new Response(response.body, {
      status: response.status || 200,
      statusText: response.statusText || 'OK',
      headers: newHeaders,
    });
  } catch (err) {
    console.error('[Pages Middleware Exception]', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'An unexpected server error occurred.',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
}
