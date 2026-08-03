import { MiddlewareHandler } from 'hono';
import { CONFIG } from '../config';
import { errorResponse } from '../utils/response';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';

  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.includes('localhost')) {
    await next();
    return;
  }

  const now = Date.now();
  const entry = rateLimitMap.get(clientIP) || { count: 0, resetAt: now + CONFIG.RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + CONFIG.RATE_LIMIT_WINDOW_MS;
  } else {
    entry.count += 1;
  }

  rateLimitMap.set(clientIP, entry);

  c.header('X-RateLimit-Limit', CONFIG.RATE_LIMIT_MAX.toString());
  c.header('X-RateLimit-Remaining', Math.max(0, CONFIG.RATE_LIMIT_MAX - entry.count).toString());

  if (entry.count > CONFIG.RATE_LIMIT_MAX) {
    return errorResponse(c, 'Too many requests. Please slow down.', 429, 'RATE_LIMITED');
  }

  await next();
};
