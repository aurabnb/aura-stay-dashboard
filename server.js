#!/usr/bin/env node

// Critical polyfills that must run before anything else
if (typeof global !== 'undefined') {
  // Set up self reference
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  
  // Set up window reference
  if (typeof global.window === 'undefined') {
    global.window = global;
  }
}

if (typeof globalThis !== 'undefined') {
  // Set up self reference
  if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  
  // Set up global reference
  if (typeof globalThis.global === 'undefined') {
    globalThis.global = globalThis;
  }
}

console.log('🚀 Server: Critical polyfills applied');

// Now start the build process
const { spawn } = require('child_process');
const path = require('path');

// Set up environment
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_OPTIONS = '--max-old-space-size=8192';

// Start Next.js build
const nextBuild = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Ensure polyfills are available
    FORCE_GLOBAL_POLYFILLS: 'true'
  }
});

nextBuild.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  process.exit(code);
});

nextBuild.on('error', (error) => {
  console.error('Build process error:', error);
  process.exit(1);
}); 