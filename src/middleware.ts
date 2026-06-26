import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis only if the URL is provided (prevents crashing if env is missing)
const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null;

// Create a new ratelimiter, that allows 60 requests per 1 minute
const ratelimit = redis 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
    })
  : null;

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to /api/* routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    
    // Check if ratelimiter is available
    if (ratelimit) {
      // Use IP address as the identifier, fallback to 'anonymous'
      const ip = request.headers.get('x-forwarded-for') ?? request.ip ?? 'anonymous';
      
      try {
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
        
        // Return 404 instead of 429/401 for security obscurity as recommended in the audit
        if (!success) {
          return new NextResponse(
            JSON.stringify({ error: "Not Found" }),
            { 
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
              }
            }
          );
        }

        // Add rate limit headers to successful requests
        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', reset.toString());
        return response;
        
      } catch (error) {
        // If Redis fails, fail open to avoid blocking legitimate traffic
        console.error("Rate limiting error:", error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
