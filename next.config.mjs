/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Configure output mode for better stability
  output: 'standalone',
  // Disable edge runtime for API routes
  experimental: {
    serverActions: true,
    runtime: 'nodejs',
  },
  // Enable API directory
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
