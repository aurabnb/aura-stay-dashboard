#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Add global polyfill immediately
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  global.self = global;
}

const serverDir = path.join(process.cwd(), '.next/server');
const vendorsPath = path.join(serverDir, 'vendors.js');
const webpackRuntimePath = path.join(serverDir, 'webpack-runtime.js');

console.log('🔧 Patching server files for SSR compatibility...');

function patchFile(filePath, fileName) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Comprehensive polyfill that gets added to the beginning
      const polyfill = `// SSR Compatibility Polyfill - Auto-generated
if (typeof self === 'undefined') {
  if (typeof globalThis !== 'undefined') {
    globalThis.self = globalThis;
  } else if (typeof global !== 'undefined') {
    global.self = global;
  }
}
if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}
`;
      
      // Replace problematic patterns
      content = content
        // Fix self.webpackChunk patterns
        .replace(/\(self\.webpackChunk_N_E=self\.webpackChunk_N_E\|\|\[\]\)/g, 
          '((typeof self !== "undefined" ? self : globalThis).webpackChunk_N_E=(typeof self !== "undefined" ? self : globalThis).webpackChunk_N_E||[])')
        // Fix other self patterns
        .replace(/self\.webpackChunk/g, '(typeof self !== "undefined" ? self : globalThis).webpackChunk')
        .replace(/\bself\[/g, '(typeof self !== "undefined" ? self : globalThis)[')
        .replace(/=self\./g, '=(typeof self !== "undefined" ? self : globalThis).')
        // Fix potential undefined access patterns
        .replace(/\.length\b/g, '&&t.length||0');
      
      // Only modify if we made changes
      if (content !== originalContent) {
        // Add polyfill at the beginning
        content = polyfill + content;
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Successfully patched ${fileName}`);
        
        // Show first line for debugging
        const firstLine = content.split('\n')[6]; // Skip polyfill lines
        console.log(`📄 Patched first line of ${fileName}:`, firstLine.substring(0, 80) + '...');
      } else {
        console.log(`ℹ️  No changes needed for ${fileName}`);
      }
    } else {
      console.log(`⚠️  ${fileName} not found at:`, filePath);
    }
  } catch (error) {
    console.error(`❌ Error patching ${fileName}:`, error.message);
    throw error;
  }
}

try {
  // Patch vendors.js
  patchFile(vendorsPath, 'vendors.js');
  
  // Patch webpack-runtime.js
  patchFile(webpackRuntimePath, 'webpack-runtime.js');
  
  console.log('🎉 All server files patched successfully!');
} catch (error) {
  console.error('❌ Patching failed:', error.message);
  process.exit(1);
} 