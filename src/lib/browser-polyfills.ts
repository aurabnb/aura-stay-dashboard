// Browser polyfills to prevent SSR issues

// Ensure we're in a Node.js environment
if (typeof global !== 'undefined') {
  // Set up self reference
  if (typeof self === 'undefined') {
    // @ts-ignore
    global.self = global;
  }

  // Set up window reference if not defined
  if (typeof window === 'undefined') {
    // @ts-ignore
    global.window = global;
  }

  // Set up document if not defined
  if (typeof document === 'undefined') {
    // @ts-ignore
    global.document = {
      createElement: () => ({} as any),
      createElementNS: () => ({} as any),
      createDocumentFragment: () => ({} as any),
      querySelector: () => null,
      querySelectorAll: () => [] as any,
      getElementById: () => null,
      getElementsByTagName: () => [] as any,
      getElementsByClassName: () => [] as any,
      addEventListener: () => {},
      removeEventListener: () => {},
      cookie: '',
      title: '',
      head: {} as any,
      body: {} as any
    };
  }

  // Set up navigator if not defined
  if (typeof navigator === 'undefined') {
    // @ts-ignore
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
    // @ts-ignore
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
    // @ts-ignore
    global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    };
  }

  // Set up sessionStorage if not defined
  if (typeof sessionStorage === 'undefined') {
    // @ts-ignore
    global.sessionStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    };
  }
}

console.log('Browser polyfills loaded - self:', typeof self, 'window:', typeof window, 'global:', typeof global); 