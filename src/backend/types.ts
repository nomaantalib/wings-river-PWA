import { Context } from 'hono';

export type D1Database = any;

export interface Env {
  DB?: D1Database;
  wings_river_cafe_reservations?: D1Database;
  DB_BINDING?: D1Database;
  d1?: D1Database;
  DATABASE?: D1Database;
  JWT_SECRET?: string;
  ADMIN_SECRET_KEY?: string;
  ADMIN_PASSWORD?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  MSG91_AUTH_KEY?: string;
  MSG91_TEMPLATE_ID?: string;
  ENVIRONMENT?: string;
  [key: string]: any;
}

export type AppContext = Context<{ Bindings: Env }>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  message?: string;
  [key: string]: any;
}
