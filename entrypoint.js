import { onRequestGet as getBlogs } from './functions/api/blogs.js';
import { onRequestGet as getBookings, onRequestPost as postBookings } from './functions/api/bookings.js';
import { onRequestPost as postContact } from './functions/api/contact.js';
import { onRequestGet as getMenu } from './functions/api/menu.js';
import { onRequestGet as getReviews } from './functions/api/reviews.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const context = { request, env, ctx, params: {} };

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === '/api/blogs' && request.method === 'GET') {
        const res = await getBlogs(context);
        return injectCors(res, corsHeaders);
      }
      if (url.pathname === '/api/bookings') {
        if (request.method === 'GET') {
          const res = await getBookings(context);
          return injectCors(res, corsHeaders);
        }
        if (request.method === 'POST') {
          const res = await postBookings(context);
          return injectCors(res, corsHeaders);
        }
      }
      if (url.pathname === '/api/contact' && request.method === 'POST') {
        const res = await postContact(context);
        return injectCors(res, corsHeaders);
      }
      if (url.pathname === '/api/menu' && request.method === 'GET') {
        const res = await getMenu(context);
        return injectCors(res, corsHeaders);
      }
      if (url.pathname === '/api/reviews' && request.method === 'GET') {
        const res = await getReviews(context);
        return injectCors(res, corsHeaders);
      }
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Default to serving static assets
    return env.ASSETS.fetch(request);
  }
};

function injectCors(response, headers) {
  const newHeaders = new Headers(response.headers);
  for (const [key, val] of Object.entries(headers)) {
    newHeaders.set(key, val);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
