/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: true,
  optimizeImages: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname + '/src',
    };
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        styles: {
          name: 'styles',
          test: /\.(css|scss)$/,
          chunks: 'all',
          enforce: true,
          priority: 10,
        },
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 