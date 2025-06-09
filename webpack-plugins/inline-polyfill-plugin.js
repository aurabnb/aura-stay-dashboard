class InlinePolyfillPlugin {
  apply(compiler) {
    // Hook into the emit phase to modify generated assets
    compiler.hooks.emit.tapAsync('InlinePolyfillPlugin', (compilation, callback) => {
      // Find the vendors.js file
      const vendorsAsset = compilation.assets['vendors.js'];
      
      if (vendorsAsset) {
        // Get the original source
        const originalSource = vendorsAsset.source();
        
        // Check if it contains the problematic self reference
        if (originalSource.includes('self.webpackChunk_N_E')) {
          console.log('🔧 InlinePolyfillPlugin: Fixing self reference in vendors.js');
          
          // Create a polyfill that gets executed before the problematic code
          const polyfill = `
// Inline polyfill for SSR compatibility
if (typeof self === 'undefined') {
  if (typeof globalThis !== 'undefined') {
    globalThis.self = globalThis;
  } else if (typeof global !== 'undefined') {
    global.self = global;
  } else if (typeof window !== 'undefined') {
    window.self = window;
  }
}
`;
          
          // Inject the polyfill at the very beginning
          const newSource = polyfill + originalSource;
          
          // Update the asset
          compilation.assets['vendors.js'] = {
            source: () => newSource,
            size: () => newSource.length
          };
          
          console.log('✅ InlinePolyfillPlugin: Successfully applied polyfill');
        }
      }
      
      callback();
    });
  }
}

module.exports = InlinePolyfillPlugin; 