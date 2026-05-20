import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Basic memory cache fallback if Redis is not configured
const memoryCache = new Map<string, number>();

class MemoryRateLimiter {
  private maxLimit: number;
  private windowMs: number;

  constructor(maxLimit: number, windowMs: number) {
    this.maxLimit = maxLimit;
    this.windowMs = windowMs;
  }

  async limit(identifier: string) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Cleanup old entries
    for (const [key, timestamp] of Array.from(memoryCache.entries())) {
      if (timestamp < windowStart) {
        memoryCache.delete(key);
      }
    }

    const currentCount = memoryCache.get(identifier) || 0;
    
    if (currentCount >= this.maxLimit) {
      return { success: false, limit: this.maxLimit, remaining: 0, reset: now + this.windowMs };
    }

    memoryCache.set(identifier, currentCount + 1);
    return { success: true, limit: this.maxLimit, remaining: this.maxLimit - currentCount - 1, reset: now + this.windowMs };
  }
}

// Singleton instances
let authLimiter: Ratelimit | MemoryRateLimiter;
let apiLimiter: Ratelimit | MemoryRateLimiter;

const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

if (hasRedis) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  authLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "5 m"), // 5 requests per 5 minutes for Auth
    analytics: true,
  });

  apiLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute for API
    analytics: true,
  });
} else {
  // Fallback memory rate limiters
  authLimiter = new MemoryRateLimiter(5, 5 * 60 * 1000);
  apiLimiter = new MemoryRateLimiter(100, 60 * 1000);
}

export { authLimiter, apiLimiter, hasRedis };
