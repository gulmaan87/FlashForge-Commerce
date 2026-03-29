/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker deployment — produces a self-contained server bundle
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'burst.shopifycdn.com',
      },
    ],
  },
};

module.exports = nextConfig;
