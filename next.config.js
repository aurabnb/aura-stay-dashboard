/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
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
        new (require("webpack")).DefinePlugin({
          "process.env": JSON.stringify(process.env),
        })
      );
      
      config.plugins.push(
        new (require("webpack")).ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );
    }
    
    return config;
  },
  env: {
    ANCHOR_PROVIDER_URL: process.env.ANCHOR_PROVIDER_URL || "http://127.0.0.1:8899",
    ANCHOR_WALLET: process.env.ANCHOR_WALLET || "~/.config/solana/id.json",
  },
};

module.exports = nextConfig;
