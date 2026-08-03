import { Context } from 'hono';

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = Record<string, any>>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta?: any }>;
  all<T = Record<string, any>>(): Promise<{ results: T[]; success: boolean }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

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
  RESEND_API_KEY?: string;
  ENVIRONMENT?: string;
  REALTIME_ENGINE?: any;
  [key: string]: any;
}

export type AppVariables = {
  jwtPayload: any;
  user: any;
};

export type AppContext = Context<{ Bindings: Env; Variables: AppVariables }>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  message?: string;
  [key: string]: any;
}
