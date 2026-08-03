import { Hono } from 'hono';
import { etag } from 'hono/etag';
import { AppContext } from './types';
import { getDB } from './utils/db';
import { corsMiddleware } from './middleware/cors';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { jsonResponse, successResponse, errorResponse } from './utils/response';

import { AuthService } from './services/auth.service';
import { MenuService } from './services/menu.service';
import { ContentService } from './services/content.service';
import { TableService } from './services/table.service';
import { BookingService } from './services/booking.service';
import { ReviewService } from './services/review.service';
import { ContactService } from './services/contact.service';
import { MediaService } from './services/media.service';
import { SettingsService } from './services/settings.service';
import { OtpService } from './services/otp.service';

const app = new Hono<{ Bindings: any }>();
const api = new Hono<{ Bindings: any }>();

// Global Error Handler — Prevents 500 / 503 HTML Error Pages and Worker Crashes
app.onError((err, c: AppContext) => {
  console.error('[Backend Runtime Exception]', err);
  return errorResponse(c, err?.message || 'An unexpected error occurred.', 200, 'SERVER_ERROR');
});

// Global Not Found Handler — Returns Valid JSON
app.notFound((c: AppContext) => {
  return errorResponse(c, `Route not found: ${c.req.method} ${c.req.path}`, 404, 'NOT_FOUND');
});

// Global Middleware
app.use('*', etag());
app.use('*', corsMiddleware);
app.use('*', rateLimitMiddleware);

// Helper to safely parse JSON body
async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

// ─── HEALTH & METRICS ENDPOINTS ──────────────────────────────────────────────
api.get('/health', (c: AppContext) => {
  return jsonResponse(c, {
    success: true,
    status: 'ok',
    timestamp: Date.now(),
    d1_connected: !!getDB(c),
    version: '1.0.0'
  });
});

api.get('/status', async (c: AppContext) => {
  const db = getDB(c);
  const stats = await SettingsService.getStats(db);
  return jsonResponse(c, {
    success: true,
    status: db ? 'healthy' : 'degraded',
    timestamp: Date.now(),
    d1_database: { status: db ? 'connected' : 'disconnected', tables: stats.data }
  });
});

api.get('/version', (c: AppContext) => {
  return jsonResponse(c, {
    success: true,
    version: '1.0.0',
    build_date: '2026-08-03',
    environment: c.env?.ENVIRONMENT || 'production'
  });
});

api.get('/metrics', (c: AppContext) => {
  return jsonResponse(c, {
    success: true,
    status: 'online',
    d1_connected: !!getDB(c)
  });
});

api.get('/', (c: AppContext) => {
  return jsonResponse(c, {
    service: 'Wings River Café Backend API',
    status: 'online',
    version: '1.0.0',
    health_check: '/api/health'
  });
});

// ─── AUTH & SEED ─────────────────────────────────────────────────────────────
api.all('/seed', async (c: AppContext) => {
  const res = await AuthService.seed(getDB(c));
  return successResponse(c, res);
});

api.post('/auth/login', async (c: AppContext) => {
  const body = await getBody(c);
  const res = await AuthService.login(c, body.username, body.password, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Login failed', res.status || 200);
  return successResponse(c, res);
});

// ─── MENU & CATEGORIES ────────────────────────────────────────────────────────
api.get('/categories', async (c: AppContext) => successResponse(c, await MenuService.getCategories(getDB(c))));
api.post('/categories', async (c: AppContext) => successResponse(c, await MenuService.saveCategory(getDB(c), await getBody(c))));
api.delete('/categories/:id', async (c: AppContext) => successResponse(c, await MenuService.deleteCategory(getDB(c), c.req.param('id') || '')));

api.get('/menu', async (c: AppContext) => successResponse(c, await MenuService.getMenuItems(getDB(c))));
api.post('/menu', async (c: AppContext) => successResponse(c, await MenuService.saveMenuItem(getDB(c), await getBody(c))));
api.delete('/menu/:id', async (c: AppContext) => successResponse(c, await MenuService.deleteMenuItem(getDB(c), c.req.param('id') || '')));

api.get('/menupages', async (c: AppContext) => successResponse(c, await MenuService.getMenuPages(getDB(c))));
api.post('/menupages', async (c: AppContext) => successResponse(c, await MenuService.saveMenuPage(getDB(c), await getBody(c))));
api.delete('/menupages/:page_number', async (c: AppContext) => successResponse(c, await MenuService.deleteMenuPage(getDB(c), Number(c.req.param('page_number') || 0))));

// ─── CONTENT (Blogs, Gallery, WaterSports, Team, Offers, FAQs, Banners) ─────
api.get('/blogs', async (c: AppContext) => successResponse(c, await ContentService.getBlogs(getDB(c))));
api.post('/blogs', async (c: AppContext) => successResponse(c, await ContentService.saveBlog(getDB(c), await getBody(c))));
api.delete('/blogs/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteBlog(getDB(c), c.req.param('id') || '')));

api.get('/gallery', async (c: AppContext) => successResponse(c, await ContentService.getGallery(getDB(c))));
api.post('/gallery', async (c: AppContext) => successResponse(c, await ContentService.saveGallery(getDB(c), await getBody(c))));
api.delete('/gallery/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteGallery(getDB(c), c.req.param('id') || '')));

api.get('/watersports', async (c: AppContext) => successResponse(c, await ContentService.getWaterSports(getDB(c))));
api.post('/watersports', async (c: AppContext) => successResponse(c, await ContentService.saveWaterSport(getDB(c), await getBody(c))));
api.delete('/watersports/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteWaterSport(getDB(c), c.req.param('id') || '')));

api.get('/team', async (c: AppContext) => successResponse(c, await ContentService.getTeam(getDB(c))));
api.post('/team', async (c: AppContext) => successResponse(c, await ContentService.saveTeamMember(getDB(c), await getBody(c))));
api.delete('/team/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteTeamMember(getDB(c), c.req.param('id') || '')));

api.get('/offers', async (c: AppContext) => successResponse(c, await ContentService.getOffers(getDB(c))));
api.post('/offers', async (c: AppContext) => successResponse(c, await ContentService.saveOffer(getDB(c), await getBody(c))));
api.delete('/offers/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteOffer(getDB(c), c.req.param('id') || '')));

api.get('/faqs', async (c: AppContext) => successResponse(c, await ContentService.getFaqs(getDB(c))));
api.post('/faqs', async (c: AppContext) => successResponse(c, await ContentService.saveFaq(getDB(c), await getBody(c))));
api.delete('/faqs/:id', async (c: AppContext) => successResponse(c, await ContentService.deleteFaq(getDB(c), c.req.param('id') || '')));

// Banner / Events alias handlers
const getBannersHandler = async (c: AppContext) => successResponse(c, await ContentService.getBanners(getDB(c)));
const postBannerHandler = async (c: AppContext) => successResponse(c, await ContentService.saveBanner(getDB(c), await getBody(c)));
const deleteBannerHandler = async (c: AppContext) => successResponse(c, await ContentService.deleteBanner(getDB(c), c.req.param('id') || ''));

api.get('/banners', getBannersHandler);
api.get('/events', getBannersHandler);
api.post('/banners', postBannerHandler);
api.post('/events', postBannerHandler);
api.delete('/banners/:id', deleteBannerHandler);
api.delete('/events/:id', deleteBannerHandler);

api.get('/promopages', async (c: AppContext) => successResponse(c, await ContentService.getPromoPages(getDB(c))));
api.post('/promopages', async (c: AppContext) => successResponse(c, await ContentService.savePromoPage(getDB(c), await getBody(c))));
api.delete('/promopages/:id', async (c: AppContext) => successResponse(c, await ContentService.deletePromoPage(getDB(c), c.req.param('id') || '')));

api.get('/pages', async (c: AppContext) => successResponse(c, await ContentService.getPages(getDB(c))));
api.post('/pages', async (c: AppContext) => successResponse(c, await ContentService.savePage(getDB(c), await getBody(c))));
api.delete('/pages/:id', async (c: AppContext) => successResponse(c, await ContentService.deletePage(getDB(c), c.req.param('id') || '')));

// ─── BOOKINGS, REVIEWS, CONTACT ─────────────────────────────────────────────
const getBookingsHandler = async (c: AppContext) => successResponse(c, await BookingService.getBookings(getDB(c)));
const postBookingHandler = async (c: AppContext) => successResponse(c, await BookingService.saveBooking(getDB(c), await getBody(c)));
const deleteBookingHandler = async (c: AppContext) => successResponse(c, await BookingService.deleteBooking(getDB(c), c.req.param('id') || ''));

api.get('/bookings', getBookingsHandler);
api.get('/reservations', getBookingsHandler);
api.post('/bookings', postBookingHandler);
api.post('/reservations', postBookingHandler);
api.delete('/bookings/:id', deleteBookingHandler);
api.delete('/reservations/:id', deleteBookingHandler);

const getReviewsHandler = async (c: AppContext) => successResponse(c, await ReviewService.getReviews(getDB(c)));
const postReviewHandler = async (c: AppContext) => successResponse(c, await ReviewService.saveReview(getDB(c), await getBody(c)));
const deleteReviewHandler = async (c: AppContext) => successResponse(c, await ReviewService.deleteReview(getDB(c), c.req.param('id') || ''));

api.get('/reviews', getReviewsHandler);
api.get('/testimonials', getReviewsHandler);
api.post('/reviews', postReviewHandler);
api.post('/testimonials', postReviewHandler);
api.delete('/reviews/:id', deleteReviewHandler);
api.delete('/testimonials/:id', deleteReviewHandler);

const getContactHandler = async (c: AppContext) => successResponse(c, await ContactService.getContactMessages(getDB(c)));
const postContactHandler = async (c: AppContext) => successResponse(c, await ContactService.saveContactMessage(getDB(c), await getBody(c)));
const deleteContactHandler = async (c: AppContext) => successResponse(c, await ContactService.deleteContactMessage(getDB(c), c.req.param('id') || ''));

api.get('/contact', getContactHandler);
api.get('/inquiries', getContactHandler);
api.get('/messages', getContactHandler);
api.post('/contact', postContactHandler);
api.post('/inquiries', postContactHandler);
api.post('/messages', postContactHandler);
api.delete('/contact/:id', deleteContactHandler);
api.delete('/inquiries/:id', deleteContactHandler);
api.delete('/messages/:id', deleteContactHandler);

// ─── TABLES, QR ORDERS & FLOOR PLANS ────────────────────────────────────────
api.get('/tables', async (c: AppContext) => successResponse(c, await TableService.getTables(getDB(c))));
api.get('/tables/:tableNumber', async (c: AppContext) => successResponse(c, await TableService.getTableByNumber(getDB(c), (c.req.param('tableNumber') || '').toUpperCase())));
api.get('/tables/:tableNumber/qr', (c: AppContext) => successResponse(c, TableService.getQrRedirect(c, (c.req.param('tableNumber') || '').toUpperCase())));
api.post('/tables/:tableNumber/order', async (c: AppContext) => successResponse(c, await TableService.createOrder(getDB(c), (c.req.param('tableNumber') || '').toUpperCase(), await getBody(c))));
api.post('/tables/:tableNumber/call-waiter', async (c: AppContext) => {
  const body = await getBody(c);
  return successResponse(c, await TableService.callWaiter(getDB(c), (c.req.param('tableNumber') || '').toUpperCase(), body.request_type));
});

api.get('/floor-plans/:floor', async (c: AppContext) => successResponse(c, await TableService.getFloorPlan(getDB(c), c.req.param('floor') || 'main')));
api.get('/floor-plan', async (c: AppContext) => successResponse(c, await TableService.getFloorPlan(getDB(c), 'main')));
const saveFloorPlanHandler = async (c: AppContext) => successResponse(c, await TableService.saveFloorPlan(getDB(c), c.req.param('floor') || 'main', await getBody(c)));
api.post('/floor-plans/:floor', saveFloorPlanHandler);
api.put('/floor-plans/:floor', saveFloorPlanHandler);
api.post('/floor-plan', async (c: AppContext) => successResponse(c, await TableService.saveFloorPlan(getDB(c), 'main', await getBody(c))));

api.get('/table/:tableId', async (c: AppContext) => successResponse(c, await TableService.getDiningSession(getDB(c), (c.req.param('tableId') || '').toUpperCase())));
api.post('/dining-session', async (c: AppContext) => successResponse(c, await TableService.startDiningSession(getDB(c), await getBody(c))));
api.post('/dining-session/close', async (c: AppContext) => successResponse(c, await TableService.closeDiningSession(getDB(c), await getBody(c))));

// ─── MEDIA LIBRARY & UPLOADS ─────────────────────────────────────────────────
api.get('/media', async (c: AppContext) => successResponse(c, await MediaService.getMediaList(getDB(c), c.req.query('category'))));
api.get('/media/:id', async (c: AppContext) => {
  const res = await MediaService.getMediaById(getDB(c), c.req.param('id') || '');
  if (!res.success) return errorResponse(c, res.error || 'Media not found', res.status || 200);
  return successResponse(c, res);
});
api.post('/media', async (c: AppContext) => successResponse(c, await MediaService.saveMediaRecord(getDB(c), await getBody(c))));
api.put('/media/:id', async (c: AppContext) => {
  let body: any = {};
  try { body = await c.req.parseBody(); } catch { body = await getBody(c); }
  const res = await MediaService.updateMediaRecord(getDB(c), c.req.param('id') || '', body, c);
  if (!res.success) return errorResponse(c, res.error || 'Update failed', res.status || 200);
  return successResponse(c, res);
});
api.delete('/media/:id', async (c: AppContext) => successResponse(c, await MediaService.deleteMediaRecord(getDB(c), c.req.param('id') || '', c)));
api.get('/images', (c: AppContext) => c.redirect('/api/media'));

const handleUpload = async (c: AppContext) => {
  const res = await MediaService.uploadMedia(c, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Upload failed', res.status || 200);
  return successResponse(c, res);
};
api.post('/upload', handleUpload);
api.post('/admin/images/upload', handleUpload);

// ─── SETTINGS, HERO, STATS & LOGS ───────────────────────────────────────────
api.get('/settings', async (c: AppContext) => successResponse(c, await SettingsService.getSettings(getDB(c))));
api.post('/settings', async (c: AppContext) => successResponse(c, await SettingsService.saveSettings(getDB(c), await getBody(c))));

api.get('/hero', async (c: AppContext) => successResponse(c, await SettingsService.getHero(getDB(c))));
api.post('/hero', async (c: AppContext) => successResponse(c, await SettingsService.saveHero(getDB(c), await getBody(c))));

api.get('/stats', async (c: AppContext) => successResponse(c, await SettingsService.getStats(getDB(c))));
api.get('/logs', async (c: AppContext) => successResponse(c, await SettingsService.getLogs(getDB(c))));

// ─── OTP ─────────────────────────────────────────────────────────────────────
api.post('/send-otp', async (c: AppContext) => {
  const body = await getBody(c);
  const res = await OtpService.sendOtp(c, body.phone, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Failed to send OTP', res.status || 200);
  return successResponse(c, res);
});

api.post('/verify-otp', async (c: AppContext) => {
  const body = await getBody(c);
  const res = await OtpService.verifyOtp(c, body.phone, body.otp, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Failed to verify OTP', res.status || 200);
  return successResponse(c, res);
});

// Mount routes under `/api` and `/`
app.route('/api', api);
app.route('/', api);

export default app;
