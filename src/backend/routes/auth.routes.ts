import { Hono } from 'hono';
import { AppContext, Env, AppVariables } from '../types';
import { getDB } from '../utils/db';
import { successResponse, errorResponse } from '../utils/response';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { authMiddleware } from '../middleware/auth';
import {
  sendOtpSchema,
  verifyOtpSchema,
  customerLoginSchema,
  staffLoginSchema,
  adminLoginSchema,
  refreshTokenSchema
} from '../validators/auth.validator';

const authRoutes = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function getBody(c: AppContext) {
  return c.req.json().catch(() => ({}));
}

authRoutes.all('/seed', async (c: AppContext) => {
  const res = await AuthService.seed(getDB(c));
  return successResponse(c, res);
});

authRoutes.post('/send-otp', async (c: AppContext) => {
  const rawBody = await getBody(c);
  const parseResult = sendOtpSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return errorResponse(c, parseResult.error.issues[0]?.message || 'Invalid phone input', 400, 'VALIDATION_ERROR');
  }
  const res = await OtpService.sendOtp(c, parseResult.data.phone, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Failed to send OTP', res.status || 400);
  return successResponse(c, res);
});

authRoutes.post('/verify-otp', async (c: AppContext) => {
  const rawBody = await getBody(c);
  const parseResult = verifyOtpSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return errorResponse(c, parseResult.error.issues[0]?.message || 'Invalid OTP payload', 400, 'VALIDATION_ERROR');
  }
  const res = await OtpService.verifyOtp(c, parseResult.data.phone, parseResult.data.otp, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'OTP verification failed', res.status || 400);
  return successResponse(c, res);
});

authRoutes.post('/verify-widget-token', async (c: AppContext) => {
  const rawBody = await getBody(c);
  const accessToken = rawBody['access-token'] || rawBody.accessToken || rawBody.token;
  const res = await OtpService.verifyWidgetAccessToken(c, accessToken);
  if (!res.success) return errorResponse(c, res.error || 'Widget token verification failed', res.status || 400);
  return successResponse(c, res);
});

authRoutes.post('/customer-login', async (c: AppContext) => {
  const rawBody = await getBody(c);
  const parseResult = customerLoginSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return errorResponse(c, parseResult.error.issues[0]?.message || 'Invalid customer login input', 400, 'VALIDATION_ERROR');
  }
  const { phone, otp, name, email } = parseResult.data;
  const res = await AuthService.customerLoginWithOtp(c, phone, otp, name, email, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Customer authentication failed', res.status || 400);
  return successResponse(c, res);
});

authRoutes.post('/staff-login', async (c: AppContext) => {
  const rawBody = await getBody(c);
  const parseResult = staffLoginSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return errorResponse(c, parseResult.error.issues[0]?.message || 'Invalid staff credentials', 400, 'VALIDATION_ERROR');
  }
  const res = await AuthService.staffLogin(c, parseResult.data.username, parseResult.data.password, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Staff authentication failed', res.status || 401);
  return successResponse(c, res);
});

authRoutes.post('/admin-login', async (c: AppContext) => {
  const rawBody = await getBody(c);
  const parseResult = adminLoginSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return errorResponse(c, parseResult.error.issues[0]?.message || 'Invalid admin credentials', 400, 'VALIDATION_ERROR');
  }
  const res = await AuthService.adminLogin(c, parseResult.data.username, parseResult.data.password, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Admin authentication failed', res.status || 401);
  return successResponse(c, res);
});

authRoutes.post('/login', async (c: AppContext) => {
  const body = await getBody(c);
  const res = await AuthService.adminLogin(c, body.username, body.password, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Login failed', res.status || 401);
  return successResponse(c, res);
});

authRoutes.post('/refresh', async (c: AppContext) => {
  const rawBody = await getBody(c);
  const parseResult = refreshTokenSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return errorResponse(c, parseResult.error.issues[0]?.message || 'Refresh token required', 400, 'VALIDATION_ERROR');
  }
  const res = await AuthService.refreshToken(c, parseResult.data.refreshToken, getDB(c));
  if (!res.success) return errorResponse(c, res.error || 'Refresh token failed', res.status || 401);
  return successResponse(c, res);
});

authRoutes.post('/logout', authMiddleware, async (c: AppContext) => {
  const body = await getBody(c);
  const res = await AuthService.logout(c, body.refreshToken, getDB(c));
  return successResponse(c, res);
});

authRoutes.get('/me', authMiddleware, async (c: AppContext) => {
  const user = c.get('user');
  const res = await AuthService.getMe(c, user?.id || user?.sub, getDB(c));
  return successResponse(c, res);
});

export default authRoutes;
