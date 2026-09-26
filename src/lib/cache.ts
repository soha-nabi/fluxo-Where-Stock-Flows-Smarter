/**
 * Client-Side In-Memory Cache with TTL & AbortController support
 * Caches GET requests and data operations to prevent redundant network calls.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttlMs: number = 300000): void {
    // Default 5 minutes TTL (300,000 ms)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  public invalidate(keyOrPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const queryCache = new QueryCache();

/**
 * Higher-order function to wrap async fetchers with TTL caching
 */
export async function withQueryCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 300000 // 5 minutes default
): Promise<T> {
  const cached = queryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const freshData = await fetcher();
  queryCache.set<T>(key, freshData, ttlMs);
  return freshData;
}
