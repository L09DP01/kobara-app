/** @type {import('next').NextConfig} */
const nextConfig = {
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
            value: 'dashboard.kobara.app',
          },
        ],
        destination: '/dashboard/:path*',
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
