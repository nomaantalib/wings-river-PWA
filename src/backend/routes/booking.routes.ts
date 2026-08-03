import { Hono } from 'hono';
import { AppContext, Env, AppVariables } from '../types';
import { getDB } from '../utils/db';
import { successResponse } from '../utils/response';
import { BookingService } from '../services/booking.service';

const bookingRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

const getBookingsHandler = async (c: AppContext) => successResponse(c, await BookingService.getBookings(getDB(c)));
const postBookingHandler = async (c: AppContext) => successResponse(c, await BookingService.saveBooking(getDB(c), await getBody(c)));
const deleteBookingHandler = async (c: AppContext) => successResponse(c, await BookingService.deleteBooking(getDB(c), c.req.param('id') || ''));

bookingRoutes.get('/bookings', getBookingsHandler);
bookingRoutes.get('/reservations', getBookingsHandler);
bookingRoutes.post('/bookings', postBookingHandler);
bookingRoutes.post('/reservations', postBookingHandler);
bookingRoutes.delete('/bookings/:id', deleteBookingHandler);
bookingRoutes.delete('/reservations/:id', deleteBookingHandler);

export default bookingRoutes;
