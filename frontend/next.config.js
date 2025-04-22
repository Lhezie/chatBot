/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const backendUrl = isProd
  ? 'https://chatbot-hdsv.onrender.com' // your Render backend
  : 'http://localhost:4000'; // your local dev server

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/chat',
        destination: `${backendUrl}/`,
      },
      {
        source: '/payment/:path*',
        destination: `${backendUrl}/payment/:path*`,
      },
      {
        source: '/seedmenu/:path*',
        destination: `${backendUrl}/seedmenu/:path*`,
      },
      {
        source: '/stats/:path*',
        destination: `${backendUrl}/stats/:path*`,
      },
      {
        source: '/session-debug',
        destination: `${backendUrl}/session-debug`,
      },
    ];
  },
};

export default nextConfig;
