// Global polyfills for SSR compatibility
// This script sets up necessary globals before any other code runs

// Ensure global exists
if (typeof global === 'undefined') {
  if (typeof globalThis !== 'undefined') {
    global = globalThis;
  } else if (typeof window !== 'undefined') {
    global = window;
  } else {
    // Create a minimal global object
    global = {};
  }
}

// Ensure self exists and points to the correct global context
if (typeof self === 'undefined') {
  if (typeof globalThis !== 'undefined') {
    globalThis.self = globalThis;
  } else if (typeof global !== 'undefined') {
    global.self = global;
  } else if (typeof window !== 'undefined') {
    window.self = window;
  }
}

// Additional browser API polyfills for SSR
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Mock window
  global.window = global;
  
  // Mock document
  global.document = {
    createElement: () => ({}),
    createElementNS: () => ({}),
    createDocumentFragment: () => ({}),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByTagName: () => [],
    getElementsByClassName: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    cookie: '',
    title: '',
    head: {},
    body: {}
  };
  
  // Mock navigator
  global.navigator = {
    userAgent: 'Node.js',
    language: 'en-US',
    languages: ['en-US'],
    onLine: true,
    platform: 'node'
  };
  
  // Mock location
  global.location = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  };
  
  // Mock localStorage
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  };
  
  // Mock sessionStorage
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  };
}

console.log('🔧 Global polyfills initialized for SSR compatibility'); 