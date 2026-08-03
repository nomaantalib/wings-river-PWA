import { AppContext } from '../types';

export function jsonResponse(c: AppContext, data: any, status: number = 200, headers: Record<string, string> = {}) {
  c.header('Content-Type', 'application/json');
  for (const [k, v] of Object.entries(headers)) {
    c.header(k, v);
  }
  return c.json(data, status as any);
}

export function successResponse(c: AppContext, payload: any = {}, status: number = 200, headers: Record<string, string> = {}) {
  if (typeof payload === 'object' && payload !== null && !Array.isArray(payload) && !('success' in payload)) {
    return jsonResponse(c, { success: true, ...payload }, status, headers);
  }
  return jsonResponse(c, payload, status, headers);
}

export function errorResponse(c: AppContext, errorMsg: string, status: number = 200, code: string = 'ERROR') {
  // Always return valid JSON, and avoid 500/503 errors
  const safeStatus = (status === 500 || status === 503) ? 200 : status;
  return jsonResponse(c, {
    success: false,
    error: typeof errorMsg === 'string' ? errorMsg : 'An error occurred',
    code
  }, safeStatus);
}
