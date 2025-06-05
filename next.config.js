/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Output configuration for Docker deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Performance optimizations
  compress: true,
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 2,
    },
    // Disable source maps in development for faster compilation
    productionBrowserSourceMaps: false,
  }),
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['api.coingecko.com', 'assets.coingecko.com'],
  },
  
  // Security headers (only in production to speed up development)
  ...(process.env.NODE_ENV === 'production' && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'geolocation=(), microphone=(), camera=()',
            },
          ],
        },
        {
          source: '/api/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
          ],
        },
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    },
  }),
  
  // Optimized Webpack configuration for Solana and Node.js 24.1.0
  webpack: (config, { isServer, webpack, dev }) => {
    // Development optimizations
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Reduce bundle analysis overhead in development
      config.stats = 'errors-warnings';
      
      // Disable expensive source map generation in development
      config.devtool = 'eval-cheap-module-source-map';
    }
    
    // Solana wallet adapter and web3.js configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser"),
        zlib: require.resolve("browserify-zlib"),
        assert: require.resolve("assert"),
        util: require.resolve("util"),
      };
      
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env": JSON.stringify(process.env),
        })
      );
      
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );
    }
    
    // Bundle analyzer in development (only when explicitly requested)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    ANCHOR_PROVIDER_URL: process.env.ANCHOR_PROVIDER_URL || "http://127.0.0.1:8899",
    ANCHOR_WALLET: process.env.ANCHOR_WALLET || "~/.config/solana/id.json",
  },
  
  // Experimental features optimized for Node.js 24
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    webpackBuildWorker: true,
  },
  
  // Turbopack configuration (stable in Next.js 15) - disabled for now to improve startup time
  // turbopack: {
  //   rules: {
  //     '*.svg': {
  //       loaders: ['@svgr/webpack'],
  //       as: '*.js',
  //     },
  //   },
  // },
  
  // Redirects for SEO (disabled in development)
  ...(process.env.NODE_ENV === 'production' && {
    async redirects() {
      return [
        {
          source: '/dashboard',
          destination: '/',
          permanent: true,
        },
      ];
    },
  }),
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Build configuration
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  
  // Production-only optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),
};

module.exports = nextConfig;
