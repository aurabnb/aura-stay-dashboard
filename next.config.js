/** @type {import('next').NextConfig} */

// Check if we're building for static export
const isStaticExport = process.env.STATIC_EXPORT === 'true' || process.env.STATIC_EXPORT === '1'

const nextConfig = {
  reactStrictMode: true,
  
  // Static export configuration
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    // Disable features not compatible with static export
    experimental: {
      // Disable middleware for static export
    }
  }),
  
  // Standard configuration for development/server mode
  ...(!isStaticExport && {
    experimental: {
      optimizeCss: true,
      webpackBuildWorker: true,
    }
  }),

  // Transpile Solana packages for proper bundling
  transpilePackages: [
    '@solana/web3.js',
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@coral-xyz/anchor',
    '@project-serum/anchor',
    '@solana/spl-token',
  ],

  webpack: (config, { isServer, dev }) => {
    // Configure externals for server-side rendering
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@solana/web3.js': 'commonjs @solana/web3.js',
        '@coral-xyz/anchor': 'commonjs @coral-xyz/anchor',
        '@solana/wallet-adapter-react': 'commonjs @solana/wallet-adapter-react',
        '@solana/wallet-adapter-react-ui': 'commonjs @solana/wallet-adapter-react-ui',
        '@solana/spl-token': 'commonjs @solana/spl-token',
      })
    }

    // Solana wallet adapter and web3.js configuration for client-side
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
        path: false,
        os: false,
        http: false,
        https: false,
        url: false,
      };
      
      // Safer environment variable handling
      config.plugins.push(
        new (require("webpack")).DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || 'development'),
          "process.env.NEXT_PUBLIC_SOLANA_RPC_URL": JSON.stringify(process.env.NEXT_PUBLIC_SOLANA_RPC_URL),
          "process.env.NEXT_PUBLIC_SOLANA_NETWORK": JSON.stringify(process.env.NEXT_PUBLIC_SOLANA_NETWORK),
        })
      );
      
      config.plugins.push(
        new (require("webpack")).ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );
    }
    
    // Optimize chunks to prevent vendor chunk issues
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          solana: {
            test: /[\\/]node_modules[\\/](@solana|@coral-xyz)[\\/]/,
            name: 'solana',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    }
    
    // Disable source maps in development to improve performance
    if (dev) {
      config.devtool = false;
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    ANCHOR_PROVIDER_URL: process.env.ANCHOR_PROVIDER_URL || "http://127.0.0.1:8899",
    ANCHOR_WALLET: process.env.ANCHOR_WALLET || "~/.config/solana/id.json",
  },

  // Rewrites for development (disabled in static export)
  ...(!isStaticExport && {
    async rewrites() {
      return [
        // Add any necessary rewrites here
      ];
    }
  }),

  // Headers for security
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;
