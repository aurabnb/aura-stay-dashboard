// Next.js Instrumentation Hook - Runs early in the server lifecycle
export async function register() {
  // Set up critical polyfills before any other code runs
  if (typeof globalThis !== 'undefined') {
    // Ensure self exists
    if (typeof globalThis.self === 'undefined') {
      globalThis.self = globalThis;
    }
    
    // Ensure global exists
    if (typeof globalThis.global === 'undefined') {
      globalThis.global = globalThis;
    }
    
    // For Node.js environments, ensure global.self exists
    if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
      global.self = global;
    }
  }
  
  // Additional Node.js specific setup
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    // We're in a Node.js environment
    if (typeof global !== 'undefined') {
      // Set up global.self
      if (typeof global.self === 'undefined') {
        global.self = global;
      }
      
      // Set up window reference for SSR compatibility
      if (typeof global.window === 'undefined') {
        global.window = global;
      }
    }
  }
  
  console.log('🚀 Instrumentation: SSR polyfills registered');
} 