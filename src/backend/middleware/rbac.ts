import { MiddlewareHandler } from 'hono';
import { errorResponse } from '../utils/response';
import { UserTokenPayload } from './auth';

export type UserRole = 'Customer' | 'Waiter' | 'Kitchen' | 'Manager' | 'Admin' | 'Administrator';

function normalizeRole(role?: string): string {
  if (!role) return '';
  const r = role.toLowerCase().trim();
  if (r === 'administrator' || r === 'admin') return 'admin';
  return r;
}

export function rbacMiddleware(allowedRoles: UserRole[]): MiddlewareHandler {
  return async (c, next) => {
    const user = (c.get('user') || c.get('jwtPayload')) as UserTokenPayload | undefined;

    if (!user || !user.role) {
      return errorResponse(c, 'Forbidden: Missing user role claim', 403, 'FORBIDDEN');
    }

    const userRoleNormalized = normalizeRole(user.role);
    const isAllowed = allowedRoles.some(role => {
      const allowedNormalized = normalizeRole(role);
      return allowedNormalized === userRoleNormalized;
    });

    if (!isAllowed) {
      return errorResponse(
        c,
        `Forbidden: Role '${user.role}' is not authorized to access this resource.`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    await next();
  };
}
