import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host");

  // API Subdomain Routing
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
    
    return NextResponse.rewrite(url);
  }

  // Regular application routing
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
