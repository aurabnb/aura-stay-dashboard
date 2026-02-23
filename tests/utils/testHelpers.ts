import { PrismaClient } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'

// Test data generators
export const generateMockWallet = (overrides: Partial<any> = {}) => ({
  id: 'wallet-test-id',
  address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  name: 'Test Wallet',
  description: 'A test wallet for unit testing',
  blockchain: 'solana',
  walletType: 'treasury',
  explorerUrl: 'https://explorer.solana.com/address/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const generateMockUser = (overrides: Partial<any> = {}) => ({
  id: 'user-test-id',
  email: 'test@example.com',
  walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  username: 'testuser',
  avatar: null,
  bio: 'Test user bio',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const generateMockProposal = (overrides: Partial<any> = {}) => ({
  id: 'proposal-test-id',
  title: 'Test Proposal',
  description: 'This is a test proposal for unit testing',
  category: 'TREASURY',
  status: 'ACTIVE',
  proposerId: 'user-test-id',
  votesFor: 0,
  votesAgainst: 0,
  totalVotes: 0,
  startDate: new Date('2024-01-01T00:00:00Z'),
  endDate: new Date('2024-01-08T00:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const generateMockVote = (overrides: Partial<any> = {}) => ({
  id: 'vote-test-id',
  proposalId: 'proposal-test-id',
  userId: 'user-test-id',
  voteType: 'FOR',
  weight: 100,
  timestamp: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const generateMockWalletBalance = (overrides: Partial<any> = {}) => ({
  id: 'balance-test-id',
  walletId: 'wallet-test-id',
  tokenSymbol: 'SOL',
  tokenName: 'Solana',
  balance: 100.0,
  usdValue: 2500.0,
  lastUpdated: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const generateMockTransaction = (overrides: Partial<any> = {}) => ({
  id: 'transaction-test-id',
  walletId: 'wallet-test-id',
  hash: 'test-transaction-hash-123456789',
  type: 'TRANSFER',
  amount: 10.0,
  tokenSymbol: 'SOL',
  fromAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  toAddress: 'AnotherWalletAddress123456789',
  status: 'CONFIRMED',
  blockNumber: 123456,
  timestamp: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
})

export const generateMockStakingRecord = (overrides: Partial<any> = {}) => ({
  id: 'staking-test-id',
  userId: 'user-test-id',
  stakedAmount: 1000,
  rewardAmount: 50,
  status: 'ACTIVE',
  startDate: new Date('2024-01-01T00:00:00Z'),
  endDate: null,
  ...overrides,
})

// Test database utilities
export const createMockPrismaClient = () => {
  return mockDeep<PrismaClient>()
}

// Date utilities for testing
export const createDateInFuture = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export const createDateInPast = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Wallet address utilities
export const generateValidSolanaAddress = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateInvalidSolanaAddress = () => {
  return 'invalid-address-123'
}

// API response utilities
export const createSuccessResponse = (data: any) => ({
  success: true,
  data,
  error: null,
})

export const createErrorResponse = (error: string, code = 400) => ({
  success: false,
  data: null,
  error,
  code,
})

// Test environment utilities
export const setupTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
  
  // Mock console methods to reduce noise in tests
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  
  beforeAll(() => {
    console.error = jest.fn()
    console.warn = jest.fn()
  })
  
  afterAll(() => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  })
}

// Async test utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
) => {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true
    }
    await waitFor(interval)
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

// Mock Solana wallet utilities
export const createMockWallet = (connected = true) => ({
  connected,
  publicKey: connected ? {
    toString: () => '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
  } : null,
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  signTransaction: jest.fn().mockResolvedValue({ signature: 'mock-signature' }),
  signAllTransactions: jest.fn().mockResolvedValue([{ signature: 'mock-signature' }]),
  signMessage: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
})

// Test data validation utilities
export const validateTestData = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidUsername: (username: string) => /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/.test(username),
  isValidSolanaAddress: (address: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address),
  isValidUUID: (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid),
}

// Error simulation utilities
export const simulateNetworkError = () => {
  throw new Error('Network request failed')
}

export const simulateDatabaseError = () => {
  throw new Error('Database connection failed')
}

export const simulateValidationError = (field: string) => {
  throw new Error(`Validation failed for field: ${field}`)
}

// Test assertion helpers
export const expectToBeValidDate = (date: any) => {
  expect(date).toBeInstanceOf(Date)
  expect(date.getTime()).not.toBeNaN()
}

export const expectToBeValidWalletAddress = (address: string) => {
  expect(typeof address).toBe('string')
  expect(address.length).toBeGreaterThanOrEqual(32)
  expect(address.length).toBeLessThanOrEqual(44)
  expect(validateTestData.isValidSolanaAddress(address)).toBe(true)
}

export const expectToBeValidProposal = (proposal: any) => {
  expect(proposal).toHaveProperty('id')
  expect(proposal).toHaveProperty('title')
  expect(proposal).toHaveProperty('description')
  expect(proposal).toHaveProperty('category')
  expect(proposal).toHaveProperty('status')
  expect(['DRAFT', 'ACTIVE', 'PASSED', 'FAILED', 'CANCELLED']).toContain(proposal.status)
}

// Performance testing utilities
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  return {
    result,
    executionTime: end - start,
  }
}

export const expectExecutionTimeToBeUnder = async (fn: () => Promise<any>, maxTime: number) => {
  const { executionTime } = await measureExecutionTime(fn)
  expect(executionTime).toBeLessThan(maxTime)
}

// Cleanup utilities
export const cleanupTestData = async (prisma: any) => {
  // Clean up test data in reverse dependency order
  await prisma.vote.deleteMany({ where: { id: { contains: 'test' } } })
  await prisma.proposal.deleteMany({ where: { id: { contains: 'test' } } })
  await prisma.walletBalance.deleteMany({ where: { id: { contains: 'test' } } })
  await prisma.transaction.deleteMany({ where: { id: { contains: 'test' } } })
  await prisma.wallet.deleteMany({ where: { id: { contains: 'test' } } })
  await prisma.stakingRecord.deleteMany({ where: { id: { contains: 'test' } } })
  await prisma.user.deleteMany({ where: { id: { contains: 'test' } } })
}

export default {
  generateMockWallet,
  generateMockUser,
  generateMockProposal,
  generateMockVote,
  generateMockWalletBalance,
  generateMockTransaction,
  generateMockStakingRecord,
  createMockPrismaClient,
  createDateInFuture,
  createDateInPast,
  generateValidSolanaAddress,
  generateInvalidSolanaAddress,
  createSuccessResponse,
  createErrorResponse,
  setupTestEnvironment,
  waitFor,
  waitForCondition,
  createMockWallet,
  validateTestData,
  simulateNetworkError,
  simulateDatabaseError,
  simulateValidationError,
  expectToBeValidDate,
  expectToBeValidWalletAddress,
  expectToBeValidProposal,
  measureExecutionTime,
  expectExecutionTimeToBeUnder,
  cleanupTestData,
} 