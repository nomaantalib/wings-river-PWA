// Cloudflare Workers fetch handler delegating to modular Hono app and Durable Object exports
import app from './src/backend/app.ts';
import { RealtimeEngineDO } from './src/backend/durable/RealtimeEngineDO.ts';

export { RealtimeEngineDO };

export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  }
};
