import { Hono } from 'hono';
import { AppContext, Env, AppVariables } from '../types';
import { getDB } from '../utils/db';
import { successResponse } from '../utils/response';
import { SettingsService } from '../services/settings.service';

const settingsRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

settingsRoutes.get('/settings', async (c: AppContext) => successResponse(c, await SettingsService.getSettings(getDB(c))));
settingsRoutes.post('/settings', async (c: AppContext) => successResponse(c, await SettingsService.saveSettings(getDB(c), await getBody(c))));

settingsRoutes.get('/hero', async (c: AppContext) => successResponse(c, await SettingsService.getHero(getDB(c))));
settingsRoutes.post('/hero', async (c: AppContext) => successResponse(c, await SettingsService.saveHero(getDB(c), await getBody(c))));

settingsRoutes.get('/stats', async (c: AppContext) => successResponse(c, await SettingsService.getStats(getDB(c))));
settingsRoutes.get('/logs', async (c: AppContext) => successResponse(c, await SettingsService.getLogs(getDB(c))));

export default settingsRoutes;
