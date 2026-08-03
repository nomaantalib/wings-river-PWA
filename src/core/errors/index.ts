export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: ErrorCode = ErrorCode.INTERNAL_ERROR, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number = 400, code: ErrorCode = ErrorCode.VALIDATION_ERROR, details?: unknown) {
    super(message, code, statusCode, details);
    this.name = 'ApiError';
  }
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private static log(level: LogEntry['level'], message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context ? { context } : {})
    };

    if (process.env.NODE_ENV !== 'production') {
      const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      consoleFn(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, context || '');
    }
  }

  static info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  static warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  static error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  static debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 500,
  backoffFactor: number = 2
): Promise<T> {
  let attempt = 0;
  let currentDelay = delayMs;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      Logger.warn(`Retry attempt ${attempt}/${retries} failed. Retrying in ${currentDelay}ms...`, { error });
      await new Promise(res => setTimeout(res, currentDelay));
      currentDelay *= backoffFactor;
    }
  }
  throw new AppError('Max retries reached', ErrorCode.NETWORK_ERROR);
}
