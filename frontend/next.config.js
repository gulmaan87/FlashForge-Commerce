
const nextConfig = {

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
