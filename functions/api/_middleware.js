// Centralized CORS Middleware for Cloudflare Pages API Functions
export async function onRequest(context) {
  // Handle preflight OPTIONS requests
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Proceed with the request handler
  const response = await context.next();

  // Clone response and set CORS headers
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Access-Control-Allow-Origin", "*");
  newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return newResponse;
}
