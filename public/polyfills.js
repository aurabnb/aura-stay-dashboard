// Browser polyfills for SSR compatibility
(function() {
  if (typeof global !== 'undefined') {
    // Set up self reference
    if (typeof self === 'undefined') {
      global.self = global;
    }

    // Set up window reference if not defined
    if (typeof window === 'undefined') {
      global.window = global;
    }

    // Set up basic DOM APIs
    if (typeof document === 'undefined') {
      global.document = {
        createElement: function() { return {}; },
        createElementNS: function() { return {}; },
        createDocumentFragment: function() { return {}; },
        querySelector: function() { return null; },
        querySelectorAll: function() { return []; },
        getElementById: function() { return null; },
        getElementsByTagName: function() { return []; },
        getElementsByClassName: function() { return []; },
        addEventListener: function() {},
        removeEventListener: function() {},
        cookie: '',
        title: '',
        head: {},
        body: {}
      };
    }

    // Set up navigator if not defined
    if (typeof navigator === 'undefined') {
      global.navigator = { 
        userAgent: 'Node.js',
        language: 'en-US',
        languages: ['en-US'],
        onLine: true,
        platform: 'node'
      };
    }

    // Set up location if not defined
    if (typeof location === 'undefined') {
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
    }

    // Set up localStorage if not defined
    if (typeof localStorage === 'undefined') {
      global.localStorage = {
        getItem: function() { return null; },
        setItem: function() {},
        removeItem: function() {},
        clear: function() {},
        length: 0,
        key: function() { return null; }
      };
    }

    // Set up sessionStorage if not defined
    if (typeof sessionStorage === 'undefined') {
      global.sessionStorage = {
        getItem: function() { return null; },
        setItem: function() {},
        removeItem: function() {},
        clear: function() {},
        length: 0,
        key: function() { return null; }
      };
    }
  }
})(); 