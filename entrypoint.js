import { onRequestGet as getBlogs, onRequestPost as postBlogs, onRequestDelete as deleteBlogs } from './functions/api/blogs.js';
import { onRequestGet as getBookings, onRequestPost as postBookings, onRequestDelete as deleteBookings } from './functions/api/bookings.js';
import { onRequestGet as getContact, onRequestPost as postContact, onRequestDelete as deleteContact } from './functions/api/contact.js';
import { onRequestGet as getMenu, onRequestPost as postMenu, onRequestDelete as deleteMenu } from './functions/api/menu.js';
import { onRequestGet as getReviews, onRequestPost as postReviews, onRequestDelete as deleteReviews } from './functions/api/reviews.js';
import { onRequestGet as getGallery, onRequestPost as postGallery, onRequestDelete as deleteGallery } from './functions/api/gallery.js';
import { onRequestGet as getSettings, onRequestPost as postSettings, onRequestDelete as deleteSettings } from './functions/api/settings.js';

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
      // ── RESERVATIONS ──
      if (url.pathname === '/api/bookings') {
        if (request.method === 'GET') return injectCors(await getBookings(context), corsHeaders);
        if (request.method === 'POST') return injectCors(await postBookings(context), corsHeaders);
        if (request.method === 'DELETE') return injectCors(await deleteBookings(context), corsHeaders);
      }

      // ── BLOGS ──
      if (url.pathname === '/api/blogs') {
        if (request.method === 'GET') return injectCors(await getBlogs(context), corsHeaders);
        if (request.method === 'POST') return injectCors(await postBlogs(context), corsHeaders);
        if (request.method === 'DELETE') return injectCors(await deleteBlogs(context), corsHeaders);
      }

      // ── MENU ──
      if (url.pathname === '/api/menu') {
        if (request.method === 'GET') return injectCors(await getMenu(context), corsHeaders);
        if (request.method === 'POST') return injectCors(await postMenu(context), corsHeaders);
        if (request.method === 'DELETE') return injectCors(await deleteMenu(context), corsHeaders);
      }

      // ── REVIEWS ──
      if (url.pathname === '/api/reviews') {
        if (request.method === 'GET') return injectCors(await getReviews(context), corsHeaders);
        if (request.method === 'POST') return injectCors(await postReviews(context), corsHeaders);
        if (request.method === 'DELETE') return injectCors(await deleteReviews(context), corsHeaders);
      }

      // ── CONTACT MESSAGES ──
      if (url.pathname === '/api/contact') {
        if (request.method === 'GET') return injectCors(await getContact(context), corsHeaders);
        if (request.method === 'POST') return injectCors(await postContact(context), corsHeaders);
        if (request.method === 'DELETE') return injectCors(await deleteContact(context), corsHeaders);
      }

      // ── GALLERY ──
      if (url.pathname === '/api/gallery') {
        if (request.method === 'GET') return injectCors(await getGallery(context), corsHeaders);
        if (request.method === 'POST') return injectCors(await postGallery(context), corsHeaders);
        if (request.method === 'DELETE') return injectCors(await deleteGallery(context), corsHeaders);
      }

      // ── SETTINGS (JSON keys) ──
      if (url.pathname === '/api/settings') {
        if (request.method === 'GET') return injectCors(await getSettings(context), corsHeaders);
        if (request.method === 'POST') return injectCors(await postSettings(context), corsHeaders);
        if (request.method === 'DELETE') return injectCors(await deleteSettings(context), corsHeaders);
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
