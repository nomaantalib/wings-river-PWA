import { Hono } from 'hono';
import { etag } from 'hono/etag';
import { AppContext, Env, AppVariables } from './types';
import { getDB } from './utils/db';
import { corsMiddleware } from './middleware/cors';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { authMiddleware } from './middleware/auth';
import { rbacMiddleware } from './middleware/rbac';
import { jsonResponse, successResponse, errorResponse } from './utils/response';

import authRoutes from './routes/auth.routes';
import menuRoutes from './routes/menu.routes';
import bookingRoutes from './routes/booking.routes';
import tableRoutes from './routes/table.routes';
import contentRoutes from './routes/content.routes';
import mediaRoutes from './routes/media.routes';
import settingsRoutes from './routes/settings.routes';
import realtimeRoutes from './routes/realtime.routes';

import { AuthService } from './services/auth.service';
import { TableService } from './services/table.service';
import { SettingsService } from './services/settings.service';

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();
const api = new Hono<{ Bindings: Env; Variables: AppVariables }>();

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

// ─── ROUTE MODULES ──────────────────────────────────────────────────────────
api.route('/auth', authRoutes);
api.route('/', authRoutes);
api.route('/', menuRoutes);
api.route('/', bookingRoutes);
api.route('/', tableRoutes);
api.route('/', contentRoutes);
api.route('/', mediaRoutes);
api.route('/', settingsRoutes);
api.route('/realtime', realtimeRoutes);

// ─── ROLE BASED ACCESS CONTROL (RBAC) PROTECTED ROUTE GROUPS ─────────────────

// 1. Customer Protected Routes
const customerApi = new Hono<{ Bindings: Env; Variables: AppVariables }>();
customerApi.use('*', authMiddleware, rbacMiddleware(['Customer', 'Manager', 'Admin']));
customerApi.get('/profile', async (c: AppContext) => {
  const user = c.get('user');
  return successResponse(c, await AuthService.getMe(c, user?.id || user?.sub, getDB(c)));
});
api.route('/customer', customerApi);

// 2. Waiter Staff Protected Routes
const waiterApi = new Hono<{ Bindings: Env; Variables: AppVariables }>();
waiterApi.use('*', authMiddleware, rbacMiddleware(['Waiter', 'Manager', 'Admin']));
waiterApi.get('/orders', async (c: AppContext) => successResponse(c, await TableService.getTables(getDB(c))));
api.route('/staff/waiter', waiterApi);

// 3. Kitchen Staff Protected Routes
const kitchenApi = new Hono<{ Bindings: Env; Variables: AppVariables }>();
kitchenApi.use('*', authMiddleware, rbacMiddleware(['Kitchen', 'Manager', 'Admin']));
kitchenApi.get('/kds-orders', async (c: AppContext) => successResponse(c, []));
api.route('/staff/kitchen', kitchenApi);

// 4. Manager Staff Protected Routes
const managerApi = new Hono<{ Bindings: Env; Variables: AppVariables }>();
managerApi.use('*', authMiddleware, rbacMiddleware(['Manager', 'Admin']));
managerApi.get('/dashboard', async (c: AppContext) => successResponse(c, await SettingsService.getStats(getDB(c))));
api.route('/staff/manager', managerApi);

// 5. Admin Protected Routes
const adminApi = new Hono<{ Bindings: Env; Variables: AppVariables }>();
adminApi.use('*', authMiddleware, rbacMiddleware(['Admin', 'Administrator']));
adminApi.get('/audit-logs', async (c: AppContext) => successResponse(c, await SettingsService.getLogs(getDB(c))));
adminApi.get('/settings', async (c: AppContext) => successResponse(c, await SettingsService.getSettings(getDB(c))));
api.route('/admin', adminApi);

// Mount routes under `/api` and `/`
app.route('/api', api);
app.route('/', api);

export default app;
