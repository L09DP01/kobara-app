import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Forward the pathname so server layouts can detect the current route
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Extract NextAuth session token from cookies (works in development & production)
  const sessionToken = request.cookies.get("next-auth.session-token")?.value ||
                       request.cookies.get("__Secure-next-auth.session-token")?.value;

  const userLoggedIn = !!sessionToken;

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
  
  let isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // If the request is for the payment domain, it's public (handled by rewrites to /pay)
  if (hostname === 'pay.kobara.app') {
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
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // -------------------------------------------------------------
  // SUPER ADMIN SECURITY
  // -------------------------------------------------------------
  if (pathname.startsWith('/system-core') && !pathname.startsWith('/system-core/login')) {
    const adminToken = request.cookies.get('kbr_admin_token')?.value;
    
    if (!adminToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/system-core/login';
      return NextResponse.redirect(url);
    }

    try {
      // Decode JWT without library inside Edge if necessary, but we have jose.
      // We will do a simple expiration check here or rely on jose if imported.
      // Since jose is imported at the top? We need to import jwtVerify. Let's do it dynamically or import it at top.
      const { jwtVerify } = await import('jose');
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_kobara_admin_2026');
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
    if (adminToken) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_kobara_admin_2026');
        await jwtVerify(adminToken, secret);
        const url = request.nextUrl.clone();
        url.pathname = '/system-core/dashboard';
        return NextResponse.redirect(url);
      } catch (e) {
        // invalid token, just let them see login page
      }
    }
  }

  return supabaseResponse;
}
