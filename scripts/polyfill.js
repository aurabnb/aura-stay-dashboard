// Critical polyfills that must be applied before any other code runs
// This file is loaded via --require flag to ensure it runs first

// Ensure self exists in all Node.js contexts
if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    Object.defineProperty(global, 'self', {
      value: global,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
  
  if (typeof global.window === 'undefined') {
    Object.defineProperty(global, 'window', {
      value: global,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
}

// Ensure globalThis compatibility
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.self === 'undefined') {
    Object.defineProperty(globalThis, 'self', {
      value: globalThis,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
  
  if (typeof globalThis.global === 'undefined') {
    Object.defineProperty(globalThis, 'global', {
      value: globalThis,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
}

// Special handling for webpack chunks
if (typeof global !== 'undefined' && typeof global.self !== 'undefined') {
  // Pre-initialize webpackChunk to prevent undefined errors
  if (!global.self.webpackChunk_N_E) {
    global.self.webpackChunk_N_E = [];
  }
}

// Additional safety for module loading
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}

console.log('🔧 Critical polyfills applied for Node.js compatibility'); 