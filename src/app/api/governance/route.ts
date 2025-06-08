import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Required for static export compatibility
export const dynamic = 'force-dynamic'
export const revalidate = 180 // Revalidate every 3 minutes

interface ProposalData {
  id: string
  title: string
  description: string
  category: string
  status: string
  proposerId: string
  votesFor: number
  votesAgainst: number
  totalVotes: number
  startDate: string
  endDate: string
  createdAt: string
  proposer: {
    username?: string
    walletAddress?: string
  }
}

interface VoteData {
  id: string
  proposalId: string
  userId: string
  voteType: string
  weight: number
  timestamp: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const proposalId = searchParams.get('proposalId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // If requesting a specific proposal
    if (proposalId) {
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          proposer: {
            select: {
              username: true,
              walletAddress: true
            }
          },
          votes: {
            include: {
              user: {
                select: {
                  username: true,
                  walletAddress: true
                }
              }
            }
          }
        }
      })

      if (!proposal) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
      }

      const formattedProposal = {
        ...proposal,
        startDate: proposal.startDate.toISOString(),
        endDate: proposal.endDate.toISOString(),
        createdAt: proposal.createdAt.toISOString(),
        proposer: {
          username: proposal.proposer.username || undefined,
          walletAddress: proposal.proposer.walletAddress || undefined
        },
        votes: proposal.votes.map(vote => ({
          id: vote.id,
          proposalId: vote.proposalId,
          userId: vote.userId,
          voteType: vote.voteType,
          weight: vote.weight,
          timestamp: vote.timestamp.toISOString(),
          user: {
            username: vote.user.username || undefined,
            walletAddress: vote.user.walletAddress || undefined
          }
        }))
      }

      return NextResponse.json(formattedProposal)
    }

    // Build where clause for filtering
    const whereClause: any = {}
    if (status) whereClause.status = status.toUpperCase()
    if (category) whereClause.category = category.toUpperCase()

    const proposals = await prisma.proposal.findMany({
      where: whereClause,
      include: {
        proposer: {
          select: {
            username: true,
            walletAddress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    const formattedProposals: ProposalData[] = proposals.map(proposal => ({
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      category: proposal.category,
      status: proposal.status,
      proposerId: proposal.proposerId,
      votesFor: proposal.votesFor,
      votesAgainst: proposal.votesAgainst,
      totalVotes: proposal.totalVotes,
      startDate: proposal.startDate.toISOString(),
      endDate: proposal.endDate.toISOString(),
      createdAt: proposal.createdAt.toISOString(),
      proposer: {
        username: proposal.proposer.username || undefined,
        walletAddress: proposal.proposer.walletAddress || undefined
      }
    }))

    return NextResponse.json({
      proposals: formattedProposals,
      total: proposals.length
    })
  } catch (error) {
    console.error('Governance GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_proposal') {
      const { title, description, category, walletAddress, endDate } = data

      if (!title || !description || !category || !walletAddress || !endDate) {
        return NextResponse.json({ 
          error: 'Title, description, category, wallet address, and end date are required' 
        }, { status: 400 })
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            username: `user_${walletAddress.slice(-6)}`
          }
        })
      }

      // Create proposal
      const proposal = await prisma.proposal.create({
        data: {
          title,
          description,
          category: category.toUpperCase(),
          proposerId: user.id,
          endDate: new Date(endDate)
        },
        include: {
          proposer: {
            select: {
              username: true,
              walletAddress: true
            }
          }
        }
      })

      const formattedProposal: ProposalData = {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        category: proposal.category,
        status: proposal.status,
        proposerId: proposal.proposerId,
        votesFor: proposal.votesFor,
        votesAgainst: proposal.votesAgainst,
        totalVotes: proposal.totalVotes,
        startDate: proposal.startDate.toISOString(),
        endDate: proposal.endDate.toISOString(),
        createdAt: proposal.createdAt.toISOString(),
        proposer: {
          username: proposal.proposer.username || undefined,
          walletAddress: proposal.proposer.walletAddress || undefined
        }
      }

      return NextResponse.json(formattedProposal, { status: 201 })
    }

    if (action === 'vote') {
      const { proposalId, walletAddress, voteType, stakingAmount } = data

      if (!proposalId || !walletAddress || !voteType) {
        return NextResponse.json({ 
          error: 'Proposal ID, wallet address, and vote type are required' 
        }, { status: 400 })
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { walletAddress }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Check if proposal exists and is active
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId }
      })

      if (!proposal) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
      }

      if (proposal.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Proposal is not active' }, { status: 400 })
      }

      if (new Date() > proposal.endDate) {
        return NextResponse.json({ error: 'Voting period has ended' }, { status: 400 })
      }

      // Check if user already voted
      const existingVote = await prisma.vote.findUnique({
        where: {
          proposalId_userId: {
            proposalId,
            userId: user.id
          }
        }
      })

      if (existingVote) {
        return NextResponse.json({ error: 'User has already voted' }, { status: 400 })
      }

      // Calculate voting weight based on staking amount
      const votingWeight = Math.min(stakingAmount || 1, 2000) // Max 2% of total supply

      // Create vote
      const vote = await prisma.vote.create({
        data: {
          proposalId,
          userId: user.id,
          voteType: voteType.toUpperCase(),
          weight: votingWeight
        }
      })

      // Update proposal vote counts
      const updateData = voteType.toUpperCase() === 'FOR' 
        ? { votesFor: proposal.votesFor + votingWeight }
        : { votesAgainst: proposal.votesAgainst + votingWeight }

      const updatedProposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          ...updateData,
          totalVotes: proposal.totalVotes + votingWeight
        }
      })

      const voteData: VoteData = {
        id: vote.id,
        proposalId: vote.proposalId,
        userId: vote.userId,
        voteType: vote.voteType,
        weight: vote.weight,
        timestamp: vote.timestamp.toISOString()
      }

      return NextResponse.json({
        vote: voteData,
        proposal: {
          id: updatedProposal.id,
          votesFor: updatedProposal.votesFor,
          votesAgainst: updatedProposal.votesAgainst,
          totalVotes: updatedProposal.totalVotes
        }
      }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Governance POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

// Admin endpoint for proposal status updates
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposalId, status } = body

    if (!proposalId || !status) {
      return NextResponse.json({ error: 'Proposal ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['ACTIVE', 'PASSED', 'REJECTED', 'EXPIRED']
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: status.toUpperCase() }
    })

    return NextResponse.json({
      id: updatedProposal.id,
      status: updatedProposal.status
    })
  } catch (error) {
    console.error('Governance PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
  }
} 