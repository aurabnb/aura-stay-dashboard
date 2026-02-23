import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>

// Mock user service
const userService = {
  createUser: jest.fn(),
  findByWalletAddress: jest.fn(),
  findByEmail: jest.fn(),
  updateProfile: jest.fn(),
  linkWallet: jest.fn(),
  getUserWithStats: jest.fn(),
  isValidUsername: jest.fn(),
  isValidEmail: jest.fn(),
  isValidWalletAddress: jest.fn(),
  getGovernanceParticipation: jest.fn(),
  getStakingSummary: jest.fn(),
  searchUsers: jest.fn(),
  getTopContributors: jest.fn(),
}

describe('User Model Tests', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    jest.clearAllMocks()
  })

  describe('User Creation', () => {
    it('should create user with wallet address', async () => {
      const mockUser = {
        id: 'user-1',
        email: null,
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'testuser',
        avatar: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userService.createUser.mockResolvedValue(mockUser)

      const result = await userService.createUser({
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'testuser',
      })

      expect(result).toEqual(mockUser)
      expect(userService.createUser).toHaveBeenCalledWith({
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'testuser',
      })
    })

    it('should create user with email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        walletAddress: null,
        username: 'testuser',
        avatar: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userService.createUser.mockResolvedValue(mockUser)

      const result = await userService.createUser({
        email: 'test@example.com',
        username: 'testuser',
      })

      expect(result).toEqual(mockUser)
    })

    it('should throw error for duplicate username', async () => {
      userService.createUser.mockRejectedValue(new Error('Username already exists'))

      await expect(userService.createUser({
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'existinguser',
      })).rejects.toThrow('Username already exists')
    })

    it('should throw error for duplicate wallet address', async () => {
      userService.createUser.mockRejectedValue(new Error('Wallet address already registered'))

      await expect(userService.createUser({
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'testuser',
      })).rejects.toThrow('Wallet address already registered')
    })
  })

  describe('User Authentication', () => {
    it('should find user by wallet address', async () => {
      const mockUser = {
        id: 'user-1',
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'testuser',
        email: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userService.findByWalletAddress.mockResolvedValue(mockUser)

      const result = await userService.findByWalletAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')

      expect(result).toEqual(mockUser)
    })

    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        walletAddress: null,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userService.findByEmail.mockResolvedValue(mockUser)

      const result = await userService.findByEmail('test@example.com')

      expect(result).toEqual(mockUser)
    })

    it('should return null for non-existent user', async () => {
      userService.findByWalletAddress.mockResolvedValue(null)

      const result = await userService.findByWalletAddress('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('User Profile Management', () => {
    it('should update user profile', async () => {
      const mockUpdatedUser = {
        id: 'user-1',
        username: 'updateduser',
        bio: 'Updated bio',
        avatar: 'https://example.com/avatar.jpg',
        email: 'test@example.com',
        walletAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userService.updateProfile.mockResolvedValue(mockUpdatedUser)

      const result = await userService.updateProfile('user-1', {
        username: 'updateduser',
        bio: 'Updated bio',
        avatar: 'https://example.com/avatar.jpg',
      })

      expect(result).toEqual(mockUpdatedUser)
    })

    it('should link wallet to existing email user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userService.linkWallet.mockResolvedValue(mockUser)

      const result = await userService.linkWallet('user-1', '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')

      expect(result).toEqual(mockUser)
    })

    it('should get user with activity stats', async () => {
      const mockUserWithStats = {
        id: 'user-1',
        username: 'testuser',
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        _count: {
          messages: 15,
          proposals: 3,
          votes: 25,
          stakingRecords: 2,
        }
      }

      userService.getUserWithStats.mockResolvedValue(mockUserWithStats)

      const result = await userService.getUserWithStats('user-1')

      expect(result).toEqual(mockUserWithStats)
    })
  })

  describe('User Validation', () => {
    it('should validate username format', () => {
      userService.isValidUsername.mockImplementation((username: string) => {
        return /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/.test(username)
      })

      expect(userService.isValidUsername('validuser123')).toBe(true)
      expect(userService.isValidUsername('valid_user')).toBe(true)
      expect(userService.isValidUsername('ab')).toBe(false) // too short
      expect(userService.isValidUsername('a'.repeat(31))).toBe(false) // too long
      expect(userService.isValidUsername('invalid-user!')).toBe(false) // invalid characters
      expect(userService.isValidUsername('123user')).toBe(false) // starts with number
    })

    it('should validate email format', () => {
      userService.isValidEmail.mockImplementation((email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      })

      expect(userService.isValidEmail('test@example.com')).toBe(true)
      expect(userService.isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(userService.isValidEmail('invalid-email')).toBe(false)
      expect(userService.isValidEmail('test@')).toBe(false)
      expect(userService.isValidEmail('@example.com')).toBe(false)
    })

    it('should validate wallet address format', () => {
      userService.isValidWalletAddress.mockImplementation((address: string) => {
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
      })

      const validAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
      const invalidAddress = 'invalid-address'

      expect(userService.isValidWalletAddress(validAddress)).toBe(true)
      expect(userService.isValidWalletAddress(invalidAddress)).toBe(false)
    })
  })

  describe('User Activity Tracking', () => {
    it('should get user governance participation', async () => {
      const mockParticipation = {
        totalProposalsCreated: 5,
        totalVotesCast: 25,
        votingPowerUsed: 2500,
        participationRate: 0.85,
        recentActivity: [
          {
            type: 'VOTE',
            proposalId: 'prop-1',
            timestamp: new Date(),
          }
        ]
      }

      userService.getGovernanceParticipation.mockResolvedValue(mockParticipation)

      const result = await userService.getGovernanceParticipation('user-1')

      expect(result.totalProposalsCreated).toBe(5)
      expect(result.totalVotesCast).toBe(25)
      expect(result.votingPowerUsed).toBe(2500)
    })

    it('should get user staking summary', async () => {
      const mockStakingSummary = {
        totalStaked: 1000,
        totalRewards: 75,
        activeStakes: 1,
        completedStakes: 1,
      }

      userService.getStakingSummary.mockResolvedValue(mockStakingSummary)

      const result = await userService.getStakingSummary('user-1')

      expect(result.totalStaked).toBe(1000)
      expect(result.totalRewards).toBe(75)
      expect(result.activeStakes).toBe(1)
      expect(result.completedStakes).toBe(1)
    })
  })

  describe('User Search and Discovery', () => {
    it('should search users by username', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'testuser1',
          avatar: null,
          walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        },
        {
          id: 'user-2',
          username: 'testuser2',
          avatar: null,
          walletAddress: 'AnotherWalletAddress123456789',
        }
      ]

      userService.searchUsers.mockResolvedValue(mockUsers)

      const result = await userService.searchUsers('testuser', { limit: 10 })

      expect(result).toEqual(mockUsers)
    })

    it('should get top contributors', async () => {
      const mockTopUsers = [
        {
          id: 'user-1',
          username: 'topcontributor',
          _count: { votes: 50, proposals: 10 }
        }
      ]

      userService.getTopContributors.mockResolvedValue(mockTopUsers)

      const result = await userService.getTopContributors({ limit: 5 })

      expect(result).toEqual(mockTopUsers)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      userService.findByWalletAddress.mockRejectedValue(new Error('Database connection failed'))

      await expect(userService.findByWalletAddress('test-address')).rejects.toThrow('Database connection failed')
    })

    it('should handle invalid user data gracefully', async () => {
      userService.createUser.mockRejectedValue(new Error('Invalid username'))

      await expect(userService.createUser({
        username: '', // Invalid empty username
        walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      })).rejects.toThrow('Invalid username')
    })
  })
}) 