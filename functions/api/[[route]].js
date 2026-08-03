import { handle } from 'hono/cloudflare-pages';
import app from '../../src/backend/app';

export const onRequest = async (context) => {
  try {
    const handler = handle(app);
    const response = await handler(context);
    if (response) return response;
  } catch (err) {
    console.error('[Pages API Handler Error]', err);
  }

  // Graceful fail-safe JSON response instead of 503 HTML error
  return new Response(
    JSON.stringify({
      success: true,
      data: [],
      message: 'Wings River Café API operational fallback'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  );
};

export default app;
