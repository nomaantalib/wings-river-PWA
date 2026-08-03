// Cloudflare Pages Function handler pointing to modular backend app
import { handle } from 'hono/cloudflare-pages';
import app from '../../src/backend/app';

export const onRequest = handle(app);
export default app;
