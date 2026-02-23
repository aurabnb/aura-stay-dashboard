import { PrismaClient, ProposalStatus, ProposalCategory, VoteType } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { governanceService } from '@/lib/services/governanceService'

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>

describe('Governance Model Tests', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('Proposal Creation', () => {
    it('should create a new proposal with valid data', async () => {
      const mockProposal = {
        id: 'proposal-1',
        title: 'Increase Treasury Allocation',
        description: 'Proposal to increase treasury allocation for development',
        category: ProposalCategory.TREASURY,
        status: ProposalStatus.ACTIVE,
        proposerId: 'user-1',
        votesFor: 0,
        votesAgainst: 0,
        totalVotes: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
      }

      prismaMock.proposal.create.mockResolvedValue(mockProposal)

      const result = await governanceService.createProposal({
        title: 'Increase Treasury Allocation',
        description: 'Proposal to increase treasury allocation for development',
        category: ProposalCategory.TREASURY,
        proposerId: 'user-1',
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      expect(result).toEqual(mockProposal)
      expect(prismaMock.proposal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Increase Treasury Allocation',
          category: ProposalCategory.TREASURY,
          proposerId: 'user-1',
        })
      })
    })

    it('should throw error for invalid proposal duration', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday

      await expect(governanceService.createProposal({
        title: 'Test Proposal',
        description: 'Test description',
        category: ProposalCategory.TREASURY,
        proposerId: 'user-1',
        endDate: pastDate,
      })).rejects.toThrow('End date must be in the future')
    })

    it('should throw error for proposal duration too long', async () => {
      const farFutureDate = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000) // 31 days

      await expect(governanceService.createProposal({
        title: 'Test Proposal',
        description: 'Test description',
        category: ProposalCategory.TREASURY,
        proposerId: 'user-1',
        endDate: farFutureDate,
      })).rejects.toThrow('Proposal duration cannot exceed 30 days')
    })
  })

  describe('Voting System', () => {
    it('should cast a vote on active proposal', async () => {
      const mockProposal = {
        id: 'proposal-1',
        status: ProposalStatus.ACTIVE,
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        votesFor: 0,
        votesAgainst: 0,
        totalVotes: 0,
      }

      const mockVote = {
        id: 'vote-1',
        proposalId: 'proposal-1',
        userId: 'user-1',
        voteType: VoteType.FOR,
        weight: 100,
        timestamp: new Date(),
      }

      const mockUser = {
        id: 'user-1',
        stakingRecords: [
          { stakedAmount: 1000, status: 'ACTIVE' }
        ]
      }

      prismaMock.proposal.findUnique.mockResolvedValue(mockProposal as any)
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
      prismaMock.vote.create.mockResolvedValue(mockVote)
      prismaMock.proposal.update.mockResolvedValue({
        ...mockProposal,
        votesFor: 100,
        totalVotes: 100,
      } as any)

      const result = await governanceService.castVote({
        proposalId: 'proposal-1',
        userId: 'user-1',
        voteType: VoteType.FOR,
      })

      expect(result).toEqual(mockVote)
      expect(prismaMock.vote.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          proposalId: 'proposal-1',
          userId: 'user-1',
          voteType: VoteType.FOR,
          weight: 100,
        })
      })
    })

    it('should prevent voting on expired proposal', async () => {
      const mockProposal = {
        id: 'proposal-1',
        status: ProposalStatus.ACTIVE,
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      }

      prismaMock.proposal.findUnique.mockResolvedValue(mockProposal as any)

      await expect(governanceService.castVote({
        proposalId: 'proposal-1',
        userId: 'user-1',
        voteType: VoteType.FOR,
      })).rejects.toThrow('Proposal voting period has ended')
    })

    it('should prevent duplicate voting', async () => {
      const mockProposal = {
        id: 'proposal-1',
        status: ProposalStatus.ACTIVE,
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }

      prismaMock.proposal.findUnique.mockResolvedValue(mockProposal as any)
      prismaMock.vote.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`proposalId`,`userId`)')
      )

      await expect(governanceService.castVote({
        proposalId: 'proposal-1',
        userId: 'user-1',
        voteType: VoteType.FOR,
      })).rejects.toThrow('User has already voted on this proposal')
    })

    it('should calculate voting weight based on staked tokens', async () => {
      const mockUser = {
        id: 'user-1',
        stakingRecords: [
          { stakedAmount: 1000, status: 'ACTIVE' },
          { stakedAmount: 500, status: 'ACTIVE' },
          { stakedAmount: 200, status: 'ENDED' }, // Should not count
        ]
      }

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

      const votingWeight = await governanceService.calculateVotingWeight('user-1')

      expect(votingWeight).toBe(1500) // 1000 + 500
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          stakingRecords: {
            where: { status: 'ACTIVE' }
          }
        }
      })
    })
  })

  describe('Proposal Status Management', () => {
    it('should automatically close expired proposals', async () => {
      const expiredProposals = [
        {
          id: 'proposal-1',
          status: ProposalStatus.ACTIVE,
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          votesFor: 150,
          votesAgainst: 50,
          totalVotes: 200,
        },
        {
          id: 'proposal-2',
          status: ProposalStatus.ACTIVE,
          endDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
          votesFor: 30,
          votesAgainst: 70,
          totalVotes: 100,
        }
      ]

      prismaMock.proposal.findMany.mockResolvedValue(expiredProposals as any)
      prismaMock.proposal.updateMany.mockResolvedValue({ count: 2 })

      const result = await governanceService.processExpiredProposals()

      expect(result.processed).toBe(2)
      expect(result.passed).toBe(1) // proposal-1 has majority
      expect(result.failed).toBe(1) // proposal-2 does not have majority

      expect(prismaMock.proposal.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['proposal-1'] }
        },
        data: { status: ProposalStatus.PASSED }
      })

      expect(prismaMock.proposal.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['proposal-2'] }
        },
        data: { status: ProposalStatus.FAILED }
      })
    })

    it('should get proposal results', async () => {
      const mockProposal = {
        id: 'proposal-1',
        title: 'Test Proposal',
        votesFor: 150,
        votesAgainst: 50,
        totalVotes: 200,
        status: ProposalStatus.PASSED,
        votes: [
          { voteType: VoteType.FOR, weight: 100, user: { username: 'user1' } },
          { voteType: VoteType.AGAINST, weight: 50, user: { username: 'user2' } },
        ]
      }

      prismaMock.proposal.findUnique.mockResolvedValue(mockProposal as any)

      const result = await governanceService.getProposalResults('proposal-1')

      expect(result).toEqual({
        proposal: mockProposal,
        participationRate: 0.2, // Assuming 1000 total eligible voters
        passingThreshold: 0.5,
        isPassing: true,
        timeRemaining: expect.any(Number),
      })
    })
  })

  describe('Proposal Queries', () => {
    it('should get active proposals with pagination', async () => {
      const mockProposals = [
        {
          id: 'proposal-1',
          title: 'Proposal 1',
          status: ProposalStatus.ACTIVE,
          category: ProposalCategory.TREASURY,
          createdAt: new Date(),
        },
        {
          id: 'proposal-2',
          title: 'Proposal 2',
          status: ProposalStatus.ACTIVE,
          category: ProposalCategory.GOVERNANCE,
          createdAt: new Date(),
        }
      ]

      prismaMock.proposal.findMany.mockResolvedValue(mockProposals as any)
      prismaMock.proposal.count.mockResolvedValue(2)

      const result = await governanceService.getActiveProposals({ page: 1, limit: 10 })

      expect(result.proposals).toEqual(mockProposals)
      expect(result.total).toBe(2)
      expect(result.hasMore).toBe(false)

      expect(prismaMock.proposal.findMany).toHaveBeenCalledWith({
        where: { status: ProposalStatus.ACTIVE },
        include: {
          proposer: { select: { username: true, walletAddress: true } },
          _count: { select: { votes: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    })

    it('should filter proposals by category', async () => {
      const treasuryProposals = [
        {
          id: 'proposal-1',
          category: ProposalCategory.TREASURY,
          status: ProposalStatus.ACTIVE,
        }
      ]

      prismaMock.proposal.findMany.mockResolvedValue(treasuryProposals as any)

      const result = await governanceService.getProposalsByCategory(ProposalCategory.TREASURY)

      expect(result).toEqual(treasuryProposals)
      expect(prismaMock.proposal.findMany).toHaveBeenCalledWith({
        where: { 
          category: ProposalCategory.TREASURY,
          status: { not: ProposalStatus.DRAFT }
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      })
    })
  })

  describe('Governance Analytics', () => {
    it('should get governance statistics', async () => {
      prismaMock.proposal.count.mockResolvedValueOnce(50) // total
      prismaMock.proposal.count.mockResolvedValueOnce(10) // active
      prismaMock.proposal.count.mockResolvedValueOnce(30) // passed
      prismaMock.proposal.count.mockResolvedValueOnce(10) // failed
      prismaMock.vote.count.mockResolvedValue(500) // total votes
      prismaMock.user.count.mockResolvedValue(100) // total users

      const stats = await governanceService.getGovernanceStats()

      expect(stats).toEqual({
        totalProposals: 50,
        activeProposals: 10,
        passedProposals: 30,
        failedProposals: 10,
        totalVotes: 500,
        participationRate: 5.0, // 500 votes / 100 users
        passRate: 0.75, // 30 passed / (30 passed + 10 failed)
      })
    })

    it('should get user voting history', async () => {
      const mockVotes = [
        {
          id: 'vote-1',
          voteType: VoteType.FOR,
          weight: 100,
          timestamp: new Date(),
          proposal: {
            id: 'proposal-1',
            title: 'Test Proposal',
            status: ProposalStatus.PASSED,
          }
        }
      ]

      prismaMock.vote.findMany.mockResolvedValue(mockVotes as any)

      const result = await governanceService.getUserVotingHistory('user-1', { page: 1, limit: 10 })

      expect(result).toEqual(mockVotes)
      expect(prismaMock.vote.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          proposal: {
            select: {
              id: true,
              title: true,
              status: true,
              category: true,
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip: 0,
        take: 10,
      })
    })
  })
}) 