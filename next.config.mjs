/** @type {import('next').NextConfig} */
const nextConfig = {
  // LOW-02: Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'api.kobara.app',
          },
        ],
        destination: '/api/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pay.kobara.app',
          },
        ],
        destination: '/pay/:path*',
      },
    ];
  },
};

export default nextConfig;
