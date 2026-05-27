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
    // If we're in production without Redis, we fail securely to prevent DDoS / rate limit bypass
    if (process.env.NODE_ENV === 'production') {
      return { success: false, limit: 0, remaining: 0, reset: Date.now() + 60000 };
    }

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
  // LOW-03: Memory rate limiter is useless in serverless (Vercel) — warn in production
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️ CRITICAL: Upstash Redis is NOT configured. Rate limiting will NOT work in production serverless environment. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN immediately.');
  }
  // Fallback memory rate limiters (only useful in local dev)
  authLimiter = new MemoryRateLimiter(5, 5 * 60 * 1000);
  apiLimiter = new MemoryRateLimiter(100, 60 * 1000);
}

export { authLimiter, apiLimiter, hasRedis };
