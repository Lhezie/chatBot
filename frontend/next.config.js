/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/chat',
          destination: 'http://localhost:4000/',
        },
        {
          source: '/payment/:path*',
          destination: 'http://localhost:4000/payment/:path*',
        },
        {
          source: '/seedmenu/:path*',
          destination: 'http://localhost:4000/seedmenu/:path*',
        },
        {
          source: '/stats/:path*',
          destination: 'http://localhost:4000/stats/:path*',
        },
        {
          source: '/session-debug',
          destination: 'http://localhost:4000/session-debug',
        },
      ];
    },
  };
  export default nextConfig;