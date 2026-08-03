import { D1Database } from '../types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheManager {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Retrieves item from cache if present and not expired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Sets item in cache with a TTL in seconds (default 60s).
   */
  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { data, expiresAt });
  }

  /**
   * Invalidates a specific key or all keys matching a prefix.
   */
  invalidate(keyOrPrefix: string): void {
    for (const key of this.store.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache store.
   */
  clear(): void {
    this.store.clear();
  }
}

export const D1Cache = new CacheManager();

/**
 * Helper to wrap any async database fetch with automatic TTL caching and fallback execution.
 */
export async function cachedQuery<T>(
  cacheKey: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = D1Cache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const freshData = await fetchFn();
  if (freshData !== null && freshData !== undefined) {
    D1Cache.set<T>(cacheKey, freshData, ttlSeconds);
  }

  return freshData;
}
