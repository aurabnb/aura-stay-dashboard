// Critical polyfills - must run before any other code
(function() {
  // Ensure global exists
  if (typeof global === 'undefined') {
    if (typeof globalThis !== 'undefined') {
      globalThis.global = globalThis;
    }
  }
  
  // Ensure self exists
  if (typeof self === 'undefined') {
    if (typeof globalThis !== 'undefined') {
      globalThis.self = globalThis;
    } else if (typeof global !== 'undefined') {
      global.self = global;
    }
  }
  
  // Additional safety checks
  if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
    global.self = global;
  }
  
  if (typeof globalThis !== 'undefined') {
    if (typeof globalThis.self === 'undefined') {
      globalThis.self = globalThis;
    }
    if (typeof globalThis.window === 'undefined') {
      globalThis.window = globalThis;
    }
  }
})();

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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['localhost', 'aurabnb.com', 'lovable-uploads'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
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
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https: blob:",
                "font-src 'self' data:",
                "connect-src 'self' https: wss:",
                "frame-src 'self' https:",
              ].join('; '),
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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Remove the custom plugin as it's causing webpack runtime issues
    // We'll use a different approach for the self reference fix
    
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
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        global: require.resolve('global'),
      };
      
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env": JSON.stringify(process.env),
        })
      );
      
      // Add global polyfills for browser APIs
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'globalThis',
          'global': 'globalThis',
          'window': '(typeof window !== "undefined" ? window : globalThis)',
          'document': '(typeof document !== "undefined" ? document : {})',
          'navigator': '(typeof navigator !== "undefined" ? navigator : { userAgent: "Node.js" })',
          'localStorage': '(typeof localStorage !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {}, length: 0, key: () => null })',
        })
      );
      
      // Add ProvidePlugin for browser globals
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    // Provide global for all environments (client and server)
    config.plugins.push(
      new webpack.ProvidePlugin({
        global: require.resolve('global'),
      })
    );

    // Server-side configuration to handle wallet adapters and browser-specific modules
    if (isServer) {
      // Make sure externals array exists
      config.externals = config.externals || [];
      
      // Add problematic browser-only packages as externals for server builds
      config.externals.push(
        // Function-based external to catch more patterns
        function ({ context, request }, callback) {
          // Externalize all wallet adapter packages
          if (request && (
            request.includes('@solana/wallet-adapter') ||
            request.includes('@walletconnect') ||
            request.includes('@reown/appkit') ||
            request.includes('@trezor/connect') ||
            request.includes('canvas') ||
            request.includes('jsdom')
          )) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        }
      );
    }
    
    // Handle server-side self reference issues
    if (isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': '(typeof globalThis !== "undefined" ? globalThis : global)',
          'window': '(typeof globalThis !== "undefined" ? globalThis : global)',
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
    
    // Optimize chunking strategy
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          solana: {
            test: /[\\/]node_modules[\\/](@solana|@coral-xyz)[\\/]/,
            name: 'solana',
            priority: 20,
            reuseExistingChunk: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'ui',
            priority: 15,
            reuseExistingChunk: true,
          },
        },
      },
    };
    
    return config;
  },
  
  // Environment variables
  env: {
    ANCHOR_PROVIDER_URL: process.env.ANCHOR_PROVIDER_URL || "http://127.0.0.1:8899",
    ANCHOR_WALLET: process.env.ANCHOR_WALLET || "~/.config/solana/id.json",
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Experimental features optimized for Node.js 24
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'framer-motion'
    ],
    webpackBuildWorker: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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
          source: '/home',
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
  
  // Additional experimental features
  // (typedRoutes disabled to prevent SSR issues)
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
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
  
  // Compression and Caching
  poweredByHeader: false,
  
  // Asset Optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? '/assets' : '',
  
  // Redirect and Rewrites
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  },
  
  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
