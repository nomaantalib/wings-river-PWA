import { Hono } from 'hono';
import { AppContext, Env, AppVariables } from '../types';
import { getDB } from '../utils/db';
import { successResponse, errorResponse } from '../utils/response';
import { MediaService } from '../services/media.service';

const mediaRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

mediaRoutes.get('/media', async (c: AppContext) => successResponse(c, await MediaService.getMediaList(getDB(c), c.req.query('category'))));
mediaRoutes.get('/media/:id', async (c: AppContext) => {
  const res = await MediaService.getMediaById(getDB(c), c.req.param('id') || '');
  if (!res.success) return errorResponse(c, res.error || 'Media not found', res.status || 200);
  return successResponse(c, res);
});
mediaRoutes.post('/media', async (c: AppContext) => successResponse(c, await MediaService.saveMediaRecord(getDB(c), await getBody(c))));
mediaRoutes.put('/media/:id', async (c: AppContext) => {
  let body: any = {};
  try { body = await c.req.parseBody(); } catch { body = await getBody(c); }
  const res = await MediaService.updateMediaRecord(getDB(c), c.req.param('id') || '', body, c);
  if (!res.success) return errorResponse(c, res.error || 'Update failed', res.status || 200);
  return successResponse(c, res);
});
mediaRoutes.delete('/media/:id', async (c: AppContext) => successResponse(c, await MediaService.deleteMediaRecord(getDB(c), c.req.param('id') || '', c)));
mediaRoutes.get('/images', (c: AppContext) => c.redirect('/api/media'));

const handleUpload = async (c: AppContext) => {
  const res = await MediaService.uploadMedia(c, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Upload failed', res.status || 200);
  return successResponse(c, res);
};
mediaRoutes.post('/upload', handleUpload);
mediaRoutes.post('/admin/images/upload', handleUpload);

export default mediaRoutes;
