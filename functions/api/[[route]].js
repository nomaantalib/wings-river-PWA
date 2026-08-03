import app from '../../src/backend/app';
export { TableSessionDO, OrderNotifierDO } from '../../src/backend/durableObjects';

export const onRequest = async (context) => {
  try {
    const response = await app.fetch(context.request, context.env, context);
    if (response) return response;
  } catch (err) {
    console.error('[Pages API Handler Error]', err);
  }

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
