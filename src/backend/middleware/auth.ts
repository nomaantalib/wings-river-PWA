import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';
import { CONFIG } from '../config';
import { errorResponse } from '../utils/response';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(c, 'Unauthorized: Missing or invalid token', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.substring(7).trim();
  const secret = c.env?.JWT_SECRET || c.env?.ADMIN_SECRET_KEY || CONFIG.JWT_SECRET_FALLBACK;

  try {
    const payload = await verify(token, secret, 'HS256');
    c.set('jwtPayload', payload);
    await next();
  } catch (e: any) {
    return errorResponse(c, 'Unauthorized: Token expired or invalid', 401, 'INVALID_TOKEN');
  }
};
