// Browser polyfills to prevent SSR issues
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // @ts-ignore
  global.self = global;
  // @ts-ignore
  global.window = global;
  // @ts-ignore
  global.document = {};
  // @ts-ignore
  global.navigator = { userAgent: 'Node.js' };
  // @ts-ignore
  global.location = { href: '', origin: '', protocol: 'https:' };
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

// Handle 'self is not defined' specifically for Node.js environments
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  // @ts-ignore
  global.self = global;
} 