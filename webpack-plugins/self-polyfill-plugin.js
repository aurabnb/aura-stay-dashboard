class SelfPolyfillPlugin {
  apply(compiler) {
    // Hook into the compilation process
    compiler.hooks.thisCompilation.tap('SelfPolyfillPlugin', (compilation) => {
      // Process assets at a later stage to avoid interfering with webpack runtime
      compilation.hooks.processAssets.tap(
        {
          name: 'SelfPolyfillPlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_REPORT
        },
        (assets) => {
          // Only target the specific vendors.js file that contains the problematic self reference
          const vendorsFile = Object.keys(assets).find(key => 
            key === 'vendors.js' || key.endsWith('/vendors.js')
          );
          
          if (vendorsFile) {
            try {
              const asset = assets[vendorsFile];
              const source = asset.source();
              
              if (typeof source === 'string' && source.includes('self.webpackChunk_N_E')) {
                console.log(`🔧 SelfPolyfillPlugin: Fixing self reference in ${vendorsFile}...`);
                
                // Simple, targeted fix - just replace the problematic pattern
                const fixedSource = source.replace(
                  '(self.webpackChunk_N_E=self.webpackChunk_N_E||[])',
                  '((typeof self !== "undefined" ? self : globalThis).webpackChunk_N_E=(typeof self !== "undefined" ? self : globalThis).webpackChunk_N_E||[])'
                );
                
                // Only modify if we actually made a change
                if (fixedSource !== source) {
                  const { sources } = require('webpack');
                  assets[vendorsFile] = new sources.RawSource(fixedSource);
                  console.log('✅ SelfPolyfillPlugin: Fixed self reference');
                }
              }
            } catch (error) {
              console.warn(`⚠️ SelfPolyfillPlugin: Error processing ${vendorsFile}:`, error.message);
            }
          }
        }
      );
    });
  }
}

module.exports = SelfPolyfillPlugin; 