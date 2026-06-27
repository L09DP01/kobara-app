import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { updateSession } from '@/utils/supabase/middleware';

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
  const url = request.nextUrl;
  const hostname = request.headers.get("host");

  // 1. API Subdomain Routing
  if (hostname === "api.kobara.app" || hostname?.startsWith("api.localhost") || hostname === "api.kobara.local") {
    // Root endpoint for the API subdomain
    if (url.pathname === "/") {
      return NextResponse.json({
        name: "Kobara API",
        version: "v1",
        docs: "https://kobara.app/docs",
        status: "active"
      });
    }

    // Automatically prefix with /api if not present so /v1/payments maps to /api/v1/payments
    if (!url.pathname.startsWith("/api/")) {
      url.pathname = `/api${url.pathname}`;
    }
    
    // Pass through rate limiter before rewriting? The old proxy.ts rewrote immediately.
    // Let's rewrite first, then we can let the rate limit apply. Wait, if we rewrite, does it continue middleware? No, rewrite returns a response.
    // So we should do rate limit check first if it's an API request.
  }

  // 2. Rate Limiting (Applies to all /api paths, including rewritten ones from api subdomain)
  if (url.pathname.startsWith('/api') || hostname === "api.kobara.app" || hostname?.startsWith("api.localhost") || hostname === "api.kobara.local") {
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'anonymous';
      
      try {
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
        
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
        
        // Rate limit OK.
        // If it was the API subdomain, we need to rewrite now.
        if (hostname === "api.kobara.app" || hostname?.startsWith("api.localhost") || hostname === "api.kobara.local") {
          const rewriteResponse = NextResponse.rewrite(url);
          rewriteResponse.headers.set('X-RateLimit-Limit', limit.toString());
          rewriteResponse.headers.set('X-RateLimit-Remaining', remaining.toString());
          rewriteResponse.headers.set('X-RateLimit-Reset', reset.toString());
          return rewriteResponse;
        }

        // Regular /api request, proceed with headers
        const nextResponse = NextResponse.next();
        nextResponse.headers.set('X-RateLimit-Limit', limit.toString());
        nextResponse.headers.set('X-RateLimit-Remaining', remaining.toString());
        nextResponse.headers.set('X-RateLimit-Reset', reset.toString());
        return nextResponse;
        
      } catch (error) {
        console.error("Rate limiting error:", error);
      }
    } else if (hostname === "api.kobara.app" || hostname?.startsWith("api.localhost") || hostname === "api.kobara.local") {
      // If ratelimit fails but we are on API subdomain, still rewrite
      return NextResponse.rewrite(url);
    }
  }

  // 3. Regular application routing (Supabase Auth Middleware & NextAuth)
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
