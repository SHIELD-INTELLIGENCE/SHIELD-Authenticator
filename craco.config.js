// Copyright © 2026 SHIELD Intelligence. All rights reserved.
const webpack = require("webpack");

// Mock localStorage for Node.js environment to fix HtmlWebpackPlugin error in Node.js v22+
try {
  if (!global.localStorage) {
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    };
  }
} catch (e) {
  // If accessing localStorage throws an error, define it
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    writable: false,
    configurable: true,
  });
}

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        vm: require.resolve("vm-browserify"),
        process: require.resolve("process/browser"),
      };

      config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
      ]);

      return config;
    },
  },
  devServer: (devServerConfig) => {
    // Fix for webpack-dev-server 5.x compatibility
    // Create new config without deprecated properties
    const { onAfterSetupMiddleware, onBeforeSetupMiddleware, https, ...cleanConfig } = devServerConfig;
    
    // Convert https to server format if needed
    if (https) {
      cleanConfig.server = {
        type: 'https',
        options: typeof https === 'object' ? https : {},
      };
    }
    
    return cleanConfig;
  },
};
