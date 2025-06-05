#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Add global polyfill immediately
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  global.self = global;
}

const vendorsPath = path.join(process.cwd(), '.next/server/vendors.js');

console.log('🔧 Patching vendors.js for SSR compatibility...');

try {
  if (fs.existsSync(vendorsPath)) {
    let content = fs.readFileSync(vendorsPath, 'utf8');
    
    // Show first line for debugging
    const firstLine = content.split('\n')[0];
    console.log('📄 First line of vendors.js:', firstLine.substring(0, 100) + '...');
    
    // Replace all instances of 'self.' with safe fallback
    const originalContent = content;
    
    // More comprehensive replacement patterns
    content = content
      // Replace self.webpackChunk with safe fallback
      .replace(/self\.webpackChunk/g, '(typeof globalThis !== "undefined" ? globalThis : global).webpackChunk')
      // Replace standalone self references
      .replace(/\(self\./g, '((typeof globalThis !== "undefined" ? globalThis : global).')
      // Replace self assignments
      .replace(/=self\./g, '=(typeof globalThis !== "undefined" ? globalThis : global).')
      // Replace other self patterns
      .replace(/\bself\b(?=\[|\.|=)/g, '(typeof globalThis !== "undefined" ? globalThis : global)');
    
    if (content !== originalContent) {
      // Add polyfill at the beginning of the file
      const polyfill = `// SSR Compatibility Polyfill
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  global.self = global;
}
`;
      content = polyfill + content;
      
      fs.writeFileSync(vendorsPath, content, 'utf8');
      console.log('✅ Successfully patched vendors.js for SSR compatibility');
      
      // Show the new first line
      const newFirstLine = content.split('\n')[3]; // Skip the polyfill lines
      console.log('📄 Patched first line:', newFirstLine.substring(0, 100) + '...');
    } else {
      console.log('ℹ️  No problematic patterns found in vendors.js');
    }
  } else {
    console.log('⚠️  vendors.js not found at:', vendorsPath);
  }
} catch (error) {
  console.error('❌ Error patching vendors.js:', error.message);
  console.error(error.stack);
  process.exit(1);
}

console.log('🎉 Patching complete!'); 