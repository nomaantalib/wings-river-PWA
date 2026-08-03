// Cloudflare Workers fetch handler delegating to modular Hono app
import app from './src/backend/app.ts';

export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  }
};
