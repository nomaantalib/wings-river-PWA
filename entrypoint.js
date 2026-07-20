import { onRequest as apiHandler } from './functions/api/[[route]].js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Preflight Options
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Delegate API requests to Hono router
    if (url.pathname.startsWith('/api')) {
      const response = await apiHandler({ request, env: env || {}, ctx, params: {} });
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
      return injectCors(response, corsHeaders);
    }

    // Default — serve static assets
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

function injectCors(response, headers) {
  if (!response) {
    return new Response(JSON.stringify({ success: true, data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }
  const newHeaders = new Headers(response.headers || {});
  for (const [key, val] of Object.entries(headers)) {
    newHeaders.set(key, val);
  }
  return new Response(response.body, {
    status: response.status || 200,
    statusText: response.statusText || 'OK',
    headers: newHeaders
  });
}
