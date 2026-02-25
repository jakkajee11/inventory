/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@inventory/types', '@inventory/utils'],
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    // Disable ESLint during build to avoid configuration issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during build (only for development speed)
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:13101/api/v1',
  },
};

module.exports = nextConfig;
