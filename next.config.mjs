/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
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
      ],
    };
  },
};

export default nextConfig;
