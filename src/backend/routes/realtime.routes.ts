import { Hono } from 'hono';
import { AppContext, Env, AppVariables } from '../types';
import { successResponse, errorResponse } from '../utils/response';
import { RealtimeService } from '../services/realtime.service';
import { authMiddleware } from '../middleware/auth';

const realtimeRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

realtimeRoutes.get('/connect', (c: AppContext) => {
  const doNamespace = c.env?.REALTIME_ENGINE;
  if (!doNamespace) {
    return errorResponse(c, 'Real-time Durable Object engine binding unconfigured', 503, 'SERVICE_UNAVAILABLE');
  }
  const stub = doNamespace.get(doNamespace.idFromName('wings-river-main-do'));
  return stub.fetch(c.req.raw);
});

realtimeRoutes.post('/hold-table', async (c: AppContext) => {
  const body = await getBody(c);
  const user = c.get('user');
  const res = await RealtimeService.holdTable(
    c,
    body.tableNumber || '',
    body.customerName || user?.name || 'Guest',
    body.customerPhone || user?.phone || '',
    user?.id || user?.sub || 'anon'
  );
  if (!res.success) return errorResponse(c, res.error || 'Failed to hold table', 400);
  return successResponse(c, res);
});

realtimeRoutes.post('/release-table', async (c: AppContext) => {
  const body = await getBody(c);
  const user = c.get('user');
  const res = await RealtimeService.releaseTable(c, body.tableNumber || '', user?.id || user?.sub || 'anon');
  return successResponse(c, res);
});

realtimeRoutes.post('/broadcast', authMiddleware, async (c: AppContext) => {
  const body = await getBody(c);
  const res = await RealtimeService.broadcast(c, body.room || 'global', body.event, body.payload);
  return successResponse(c, res);
});

realtimeRoutes.get('/presence', async (c: AppContext) => {
  const room = (c.req.query('room') as any) || 'global';
  const res = await RealtimeService.getPresence(c, room);
  return successResponse(c, res);
});

export default realtimeRoutes;
