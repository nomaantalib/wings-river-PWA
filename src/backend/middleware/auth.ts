import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';
import { CONFIG } from '../config';
import { errorResponse } from '../utils/response';

export interface UserTokenPayload {
  id: string;
  username?: string;
  phone?: string;
  email?: string;
  role: 'Customer' | 'Waiter' | 'Kitchen' | 'Manager' | 'Admin' | 'Administrator';
  exp: number;
  iat?: number;
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(c, 'Unauthorized: Missing or invalid Bearer token', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.substring(7).trim();
  const secret = c.env?.JWT_SECRET || c.env?.ADMIN_SECRET_KEY || CONFIG.JWT_SECRET_FALLBACK;

  try {
    const payload = (await verify(token, secret, 'HS256')) as unknown as UserTokenPayload;
    if (!payload || !payload.id || !payload.role) {
      return errorResponse(c, 'Unauthorized: Malformed token payload', 401, 'INVALID_TOKEN');
    }

    c.set('jwtPayload', payload);
    c.set('user', payload);
    await next();
  } catch (e: any) {
    return errorResponse(c, 'Unauthorized: Token expired or invalid signature', 401, 'EXPIRED_TOKEN');
  }
};
