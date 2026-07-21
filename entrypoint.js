import { onRequest as apiHandler } from './functions/api/[[route]].js';

const API_METADATA = {
  service: 'Wings River Café Cloudflare D1 Backend API Engine',
  status: 'online',
  type: 'PURE_REST_API_BACKEND',
  message: 'Backend server dedicated for API communication only. Frontend application is hosted on Cloudflare Pages.',
  frontend_url: 'https://wings-river-cafe-blog.pages.dev',
  documentation: 'https://wings-river-cafe-blog.pages.dev/api/health',
  available_endpoints: [
    '/api/health',
    '/api/auth/login',
    '/api/menu',
    '/api/categories',
    '/api/menupages',
    '/api/blogs',
    '/api/gallery',
    '/api/watersports',
    '/api/team',
    '/api/offers',
    '/api/faqs',
    '/api/media',
    '/api/pages',
    '/api/hero',
    '/api/bookings',
    '/api/reviews',
    '/api/contact'
  ]
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // CORS Preflight Options
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Delegate /api requests to Hono router
    if (url.pathname.startsWith('/api')) {
      const response = await apiHandler({ request, env: env || {}, ctx, params: {} });
      return injectCors(response, corsHeaders);
    }

    // Non-API routes — Return Pure JSON API Engine Notice (No HTML Frontend)
    return new Response(JSON.stringify(API_METADATA, null, 2), {
      status: 200,
      headers: corsHeaders
    });
  }
};

function injectCors(response, headers) {
  if (!response) {
    return new Response(JSON.stringify({ success: true, data: [] }), {
      status: 200,
      headers
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
