import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Solana wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    wallet: null,
    publicKey: null,
    connected: false,
    connecting: false,
    disconnecting: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendTransaction: jest.fn(),
    signTransaction: jest.fn(),
    signAllTransactions: jest.fn(),
    signMessage: jest.fn(),
  }),
  useConnection: () => ({
    connection: {
      getBalance: jest.fn().mockResolvedValue(0),
      getAccountInfo: jest.fn().mockResolvedValue(null),
      sendTransaction: jest.fn().mockResolvedValue('mock-signature'),
    },
  }),
}))

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Global test timeout
jest.setTimeout(30000)

// Suppress console warnings in tests
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

beforeAll(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
}) 