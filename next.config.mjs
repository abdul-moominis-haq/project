/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  // Specify which routes should not use Edge Runtime
  serverRuntimeConfig: {
    noEdgeRuntime: {
      include: ['/api/profile/*']
    }
  }
};

export default nextConfig;
