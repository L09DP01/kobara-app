import { NextResponse, type NextRequest } from "next/server";

// CRIT-02: No hardcoded fallback — fail explicitly if secret is missing
const _jwtSecretRaw = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

export async function updateSession(request: NextRequest) {
  // Forward the pathname so server layouts can detect the current route
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // HIGH-04: Validate JWT signature & expiration, not just cookie presence
  // NextAuth tokens are encrypted (JWE). We must use `getToken` from `next-auth/jwt` to decrypt and verify them.
  let userLoggedIn = false;

  if (_jwtSecretRaw) {
    try {
      const { getToken } = await import('next-auth/jwt');
      const token = await getToken({
        req: request,
        secret: _jwtSecretRaw,
      });
      if (token) {
        userLoggedIn = true;
      }
    } catch (e) {
      // Token is invalid, expired, or tampered — treat as not logged in
      userLoggedIn = false;
    }
  }

  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/confirmed',
    '/api',
    '/pay',
    '/pricing',
    '/developers',
    '/docs',
    '/dashboard/developers',
    '/contact',
    '/terms',
    '/privacy',
    '/onboarding',
    '/kyc/mobile',
    '/system-core'
  ];

  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get("host")?.split(":")[0] || request.nextUrl.hostname;

  const isDashboardHost = 
    hostname === "dashboard.kobara.app" || 
    hostname.startsWith("dashboard.localhost") || 
    hostname === "dashboard.kobara.local";

  // Clean URL redirect for dashboard host:
  // e.g., dashboard.kobara.app/dashboard -> dashboard.kobara.app/
  // e.g., dashboard.kobara.app/dashboard/payments -> dashboard.kobara.app/payments
  if (isDashboardHost && (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.pathname = pathname === '/dashboard' ? '/' : pathname.replace('/dashboard', '');
    return NextResponse.redirect(cleanUrl);
  }

  let isPublicRoute = publicRoutes.some(route => {
    // On dashboard subdomain, the root '/' is the dashboard itself, which is protected (not public)
    if (isDashboardHost && route === '/') {
      return false;
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  // If the request is for a custom subdomain, it's public (handled by rewrites)
  if (hostname === 'pay.kobara.app' || hostname === 'api.kobara.app') {
    isPublicRoute = true;
  }

  // Default-deny: if not a public route and no user, redirect to login
  if (!isPublicRoute && !userLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/confirmed'].includes(pathname);
  if (isAuthPage && userLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = isDashboardHost ? '/' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // -------------------------------------------------------------
  // SUPER ADMIN SECURITY — CRIT-02: no hardcoded fallback
  // -------------------------------------------------------------
  if (pathname.startsWith('/system-core') && !pathname.startsWith('/system-core/login')) {
    const adminToken = request.cookies.get('kbr_admin_token')?.value;
    
    if (!adminToken || !_jwtSecretRaw) {
      const url = request.nextUrl.clone();
      url.pathname = '/system-core/login';
      return NextResponse.redirect(url);
    }

    try {
      const { jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(_jwtSecretRaw);
      const { payload } = await jwtVerify(adminToken, secret);
      
      if (payload.role !== 'superadmin') throw new Error('Invalid role');
    } catch (e) {
      const url = request.nextUrl.clone();
      url.pathname = '/system-core/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('kbr_admin_token');
      return response;
    }
  }

  if (pathname === '/system-core/login') {
    const adminToken = request.cookies.get('kbr_admin_token')?.value;
    if (adminToken && _jwtSecretRaw) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(_jwtSecretRaw);
        await jwtVerify(adminToken, secret);
        const url = request.nextUrl.clone();
        url.pathname = '/system-core/dashboard';
        return NextResponse.redirect(url);
      } catch (e) {
        // invalid token, just let them see login page
      }
    }
  }

  // -------------------------------------------------------------
  // DASHBOARD SUBDOMAIN INTERNAL REWRITE ROUTING
  // -------------------------------------------------------------
  const isAssetOrApi = 
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api/") || 
    pathname.startsWith("/static/") ||
    !!pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$/);

  const isExcludedFromRewrite = 
    isAuthPage || 
    isAssetOrApi || 
    pathname.startsWith("/system-core") ||
    pathname.startsWith("/pay");

  if (isDashboardHost && !isExcludedFromRewrite) {
    // If requesting '/', rewrite to '/dashboard'
    // If requesting '/payments', rewrite to '/dashboard/payments'
    if (pathname === '/' || !pathname.startsWith('/dashboard')) {
      const rewriteUrl = request.nextUrl.clone();
      const rewrittenPath = pathname === '/' ? '/dashboard' : `/dashboard${pathname}`;
      rewriteUrl.pathname = rewrittenPath;
      
      requestHeaders.set("x-pathname", rewrittenPath);
      
      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders
        }
      });
    }
  }

  return supabaseResponse;
}
