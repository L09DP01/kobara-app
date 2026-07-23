import { Ratelimit } from "@upstash/ratelimit";
import { redis, hasRedis } from "../redis";

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

class SafeRateLimiter {
  private upstashLimiter: Ratelimit;
  private memoryFallback: MemoryRateLimiter;

  constructor(upstashLimiter: Ratelimit, memoryFallback: MemoryRateLimiter) {
    this.upstashLimiter = upstashLimiter;
    this.memoryFallback = memoryFallback;
  }

  async limit(identifier: string) {
    try {
      return await this.upstashLimiter.limit(identifier);
    } catch (error) {
      console.error("Upstash RateLimit error, failing open to memory:", error);
      // Fallback au limiteur en mémoire si Upstash échoue (ex: quota atteint)
      return await this.memoryFallback.limit(identifier);
    }
  }
}

// Singleton instances
let authLimiter: SafeRateLimiter | MemoryRateLimiter;
let apiLimiter: SafeRateLimiter | MemoryRateLimiter;
let paymentsLimiter: SafeRateLimiter | MemoryRateLimiter;
let paymentLinksLimiter: SafeRateLimiter | MemoryRateLimiter;
let withdrawalsLimiter: SafeRateLimiter | MemoryRateLimiter;
let webhooksTestLimiter: SafeRateLimiter | MemoryRateLimiter;

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;

if (hasRedis && redis) {
  authLimiter = new SafeRateLimiter(
    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "5 m"), analytics: true }),
    new MemoryRateLimiter(5, 5 * 60 * 1000)
  );

  apiLimiter = new SafeRateLimiter(
    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, "1 m"), analytics: true }),
    new MemoryRateLimiter(100, 60 * 1000)
  );

  paymentsLimiter = new SafeRateLimiter(
    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m"), analytics: true }),
    new MemoryRateLimiter(60, 60 * 1000)
  );

  paymentLinksLimiter = new SafeRateLimiter(
    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1 m"), analytics: true }),
    new MemoryRateLimiter(30, 60 * 1000)
  );

  withdrawalsLimiter = new SafeRateLimiter(
    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m"), analytics: true }),
    new MemoryRateLimiter(10, 60 * 1000)
  );

  webhooksTestLimiter = new SafeRateLimiter(
    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, "1 m"), analytics: true }),
    new MemoryRateLimiter(100, 60 * 1000)
  );
} else {
  // Fallback memory rate limiters
  authLimiter = new MemoryRateLimiter(5, 5 * 60 * 1000);
  apiLimiter = new MemoryRateLimiter(100, 60 * 1000);
  paymentsLimiter = new MemoryRateLimiter(60, 60 * 1000);
  paymentLinksLimiter = new MemoryRateLimiter(30, 60 * 1000);
  withdrawalsLimiter = new MemoryRateLimiter(10, 60 * 1000);
  webhooksTestLimiter = new MemoryRateLimiter(100, 60 * 1000);
}

export { 
  authLimiter, 
  apiLimiter, 
  paymentsLimiter, 
  paymentLinksLimiter, 
  withdrawalsLimiter, 
  webhooksTestLimiter, 
  hasRedis 
};
