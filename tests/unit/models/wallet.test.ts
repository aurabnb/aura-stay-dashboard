import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { walletService } from '@/lib/services/walletService'

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>

describe('Wallet Model Tests', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('Wallet Creation', () => {
    it('should create a new wallet with valid data', async () => {
      const mockWallet = {
        id: 'wallet-1',
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        name: 'Test Wallet',
        description: 'A test wallet',
        blockchain: 'solana',
        walletType: 'treasury',
        explorerUrl: 'https://explorer.solana.com/address/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.wallet.create.mockResolvedValue(mockWallet)

      const result = await walletService.createWallet({
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        name: 'Test Wallet',
        description: 'A test wallet',
        blockchain: 'solana',
        walletType: 'treasury',
      })

      expect(result).toEqual(mockWallet)
      expect(prismaMock.wallet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          name: 'Test Wallet',
          blockchain: 'solana',
          walletType: 'treasury',
        })
      })
    })

    it('should throw error for invalid wallet address', async () => {
      await expect(walletService.createWallet({
        address: 'invalid-address',
        name: 'Test Wallet',
        blockchain: 'solana',
        walletType: 'treasury',
      })).rejects.toThrow('Invalid Solana wallet address')
    })

    it('should throw error for duplicate wallet address', async () => {
      prismaMock.wallet.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`address`)')
      )

      await expect(walletService.createWallet({
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        name: 'Test Wallet',
        blockchain: 'solana',
        walletType: 'treasury',
      })).rejects.toThrow('Wallet address already exists')
    })
  })

  describe('Wallet Retrieval', () => {
    it('should get wallet by ID', async () => {
      const mockWallet = {
        id: 'wallet-1',
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        name: 'Test Wallet',
        description: 'A test wallet',
        blockchain: 'solana',
        walletType: 'treasury',
        explorerUrl: 'https://explorer.solana.com/address/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        createdAt: new Date(),
        updatedAt: new Date(),
        balances: [],
        transactions: [],
      }

      prismaMock.wallet.findUnique.mockResolvedValue(mockWallet)

      const result = await walletService.getWalletById('wallet-1')

      expect(result).toEqual(mockWallet)
      expect(prismaMock.wallet.findUnique).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
        include: {
          balances: true,
          transactions: true,
        }
      })
    })

    it('should return null for non-existent wallet', async () => {
      prismaMock.wallet.findUnique.mockResolvedValue(null)

      const result = await walletService.getWalletById('non-existent')

      expect(result).toBeNull()
    })

    it('should get all wallets with pagination', async () => {
      const mockWallets = [
        {
          id: 'wallet-1',
          address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          name: 'Wallet 1',
          blockchain: 'solana',
          walletType: 'treasury',
          explorerUrl: 'https://explorer.solana.com/address/9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'wallet-2',
          address: 'AnotherWalletAddress123456789',
          name: 'Wallet 2',
          blockchain: 'solana',
          walletType: 'multisig',
          explorerUrl: 'https://explorer.solana.com/address/AnotherWalletAddress123456789',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]

      prismaMock.wallet.findMany.mockResolvedValue(mockWallets)

      const result = await walletService.getAllWallets({ page: 1, limit: 10 })

      expect(result).toEqual(mockWallets)
      expect(prismaMock.wallet.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('Wallet Balance Management', () => {
    it('should update wallet balance', async () => {
      const mockBalance = {
        id: 'balance-1',
        walletId: 'wallet-1',
        tokenSymbol: 'SOL',
        tokenName: 'Solana',
        balance: 100.5,
        usdValue: 2500.0,
        lastUpdated: new Date(),
      }

      prismaMock.walletBalance.upsert.mockResolvedValue(mockBalance)

      const result = await walletService.updateWalletBalance('wallet-1', {
        tokenSymbol: 'SOL',
        tokenName: 'Solana',
        balance: 100.5,
        usdValue: 2500.0,
      })

      expect(result).toEqual(mockBalance)
      expect(prismaMock.walletBalance.upsert).toHaveBeenCalledWith({
        where: {
          walletId_tokenSymbol: {
            walletId: 'wallet-1',
            tokenSymbol: 'SOL'
          }
        },
        update: expect.objectContaining({
          balance: 100.5,
          usdValue: 2500.0,
        }),
        create: expect.objectContaining({
          walletId: 'wallet-1',
          tokenSymbol: 'SOL',
          balance: 100.5,
        })
      })
    })

    it('should get wallet total USD value', async () => {
      const mockBalances = [
        { tokenSymbol: 'SOL', balance: 100, usdValue: 2500 },
        { tokenSymbol: 'USDC', balance: 1000, usdValue: 1000 },
        { tokenSymbol: 'AURA', balance: 50000, usdValue: 500 },
      ]

      prismaMock.walletBalance.findMany.mockResolvedValue(mockBalances as any)

      const result = await walletService.getWalletTotalValue('wallet-1')

      expect(result).toBe(4000) // 2500 + 1000 + 500
      expect(prismaMock.walletBalance.findMany).toHaveBeenCalledWith({
        where: { walletId: 'wallet-1' },
        select: { usdValue: true }
      })
    })
  })

  describe('Wallet Validation', () => {
    it('should validate Solana wallet address format', () => {
      const validAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      const invalidAddress = 'invalid-address'

      expect(walletService.isValidSolanaAddress(validAddress)).toBe(true)
      expect(walletService.isValidSolanaAddress(invalidAddress)).toBe(false)
    })

    it('should generate explorer URL for wallet address', () => {
      const address = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      const expectedUrl = `https://explorer.solana.com/address/${address}`

      const result = walletService.generateExplorerUrl(address, 'solana')

      expect(result).toBe(expectedUrl)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      prismaMock.wallet.findMany.mockRejectedValue(new Error('Database connection failed'))

      await expect(walletService.getAllWallets()).rejects.toThrow('Database connection failed')
    })

    it('should handle invalid wallet type', async () => {
      await expect(walletService.createWallet({
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        name: 'Test Wallet',
        blockchain: 'solana',
        walletType: 'invalid-type' as any,
      })).rejects.toThrow('Invalid wallet type')
    })
  })
}) 