import { Hono } from 'hono';
import { AppContext, Env, AppVariables } from '../types';
import { getDB } from '../utils/db';
import { successResponse } from '../utils/response';
import { MenuService } from '../services/menu.service';

const menuRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

menuRoutes.get('/categories', async (c: AppContext) => successResponse(c, await MenuService.getCategories(getDB(c))));
menuRoutes.post('/categories', async (c: AppContext) => successResponse(c, await MenuService.saveCategory(getDB(c), await getBody(c))));
menuRoutes.delete('/categories/:id', async (c: AppContext) => successResponse(c, await MenuService.deleteCategory(getDB(c), c.req.param('id') || '')));

menuRoutes.get('/menu', async (c: AppContext) => successResponse(c, await MenuService.getMenuItems(getDB(c))));
menuRoutes.post('/menu', async (c: AppContext) => successResponse(c, await MenuService.saveMenuItem(getDB(c), await getBody(c))));
menuRoutes.delete('/menu/:id', async (c: AppContext) => successResponse(c, await MenuService.deleteMenuItem(getDB(c), c.req.param('id') || '')));

menuRoutes.get('/menupages', async (c: AppContext) => successResponse(c, await MenuService.getMenuPages(getDB(c))));
menuRoutes.post('/menupages', async (c: AppContext) => successResponse(c, await MenuService.saveMenuPage(getDB(c), await getBody(c))));
menuRoutes.delete('/menupages/:page_number', async (c: AppContext) => successResponse(c, await MenuService.deleteMenuPage(getDB(c), Number(c.req.param('page_number') || 0))));

export default menuRoutes;
