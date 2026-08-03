import { Hono } from 'hono';
import { AppContext, Env, AppVariables } from '../types';
import { getDB } from '../utils/db';
import { successResponse } from '../utils/response';
import { TableService } from '../services/table.service';

const tableRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

tableRoutes.get('/tables', async (c: AppContext) => successResponse(c, await TableService.getTables(getDB(c))));
tableRoutes.get('/tables/:tableNumber', async (c: AppContext) => successResponse(c, await TableService.getTableByNumber(getDB(c), (c.req.param('tableNumber') || '').toUpperCase())));
tableRoutes.get('/tables/:tableNumber/qr', (c: AppContext) => successResponse(c, TableService.getQrRedirect(c, (c.req.param('tableNumber') || '').toUpperCase())));
tableRoutes.post('/tables/:tableNumber/order', async (c: AppContext) => successResponse(c, await TableService.createOrder(getDB(c), (c.req.param('tableNumber') || '').toUpperCase(), await getBody(c))));
tableRoutes.post('/tables/:tableNumber/call-waiter', async (c: AppContext) => {
  const body = await getBody(c);
  return successResponse(c, await TableService.callWaiter(getDB(c), (c.req.param('tableNumber') || '').toUpperCase(), body.request_type));
});

tableRoutes.get('/floor-plans/:floor', async (c: AppContext) => successResponse(c, await TableService.getFloorPlan(getDB(c), c.req.param('floor') || 'main')));
tableRoutes.get('/floor-plan', async (c: AppContext) => successResponse(c, await TableService.getFloorPlan(getDB(c), 'main')));
const saveFloorPlanHandler = async (c: AppContext) => successResponse(c, await TableService.saveFloorPlan(getDB(c), c.req.param('floor') || 'main', await getBody(c)));
tableRoutes.post('/floor-plans/:floor', saveFloorPlanHandler);
tableRoutes.put('/floor-plans/:floor', saveFloorPlanHandler);
tableRoutes.post('/floor-plan', async (c: AppContext) => successResponse(c, await TableService.saveFloorPlan(getDB(c), 'main', await getBody(c))));

tableRoutes.get('/table/:tableId', async (c: AppContext) => successResponse(c, await TableService.getDiningSession(getDB(c), (c.req.param('tableId') || '').toUpperCase())));
tableRoutes.post('/dining-session', async (c: AppContext) => successResponse(c, await TableService.startDiningSession(getDB(c), await getBody(c))));
tableRoutes.post('/dining-session/close', async (c: AppContext) => successResponse(c, await TableService.closeDiningSession(getDB(c), await getBody(c))));

export default tableRoutes;
