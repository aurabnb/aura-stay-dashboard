import { NextResponse } from 'next/server'

// Mock data for proposals (replace with actual database calls)
const proposals = [
  {
    id: '1',
    title: 'Add USDC as Payment Method',
    description: 'Should we allow users to pay with USDC?',
    votesFor: 150,
    votesAgainst: 50,
    status: 'active',
    startDate: '2024-06-01T12:00:00Z',
    endDate: '2024-06-15T12:00:00Z',
    quorum: 200,
    type: 'payment',
    category: 'finance',
    author: 'DAO Initiator',
    created_at: '2024-05-25T10:00:00Z',
    updated_at: '2024-05-25T10:00:00Z',
    valid: true
  },
  {
    id: '2',
    title: 'Integrate Chainlink VRF for Randomness',
    description: 'Use Chainlink VRF for provable randomness in our NFT drops.',
    votesFor: 300,
    votesAgainst: 25,
    status: 'passed',
    startDate: '2024-05-01T12:00:00Z',
    endDate: '2024-05-15T12:00:00Z',
    quorum: 100,
    type: 'feature',
    category: 'technology',
    author: 'Tech Lead',
    created_at: '2024-04-25T10:00:00Z',
    updated_at: '2024-04-25T10:00:00Z',
    valid: true
  },
  {
    id: '3',
    title: 'Launch Referral Program - Q3 2024',
    description: 'Incentivize user growth with a referral rewards program.',
    votesFor: 80,
    votesAgainst: 120,
    status: 'rejected',
    startDate: '2024-04-01T12:00:00Z',
    endDate: '2024-04-15T12:00:00Z',
    quorum: 200,
    type: 'marketing',
    category: 'community',
    author: 'Marketing Manager',
    created_at: '2024-03-25T10:00:00Z',
    updated_at: '2024-03-25T10:00:00Z',
    valid: true
  },
  {
    id: '4',
    title: 'Airdrop AURA to Early Adopters',
    description: 'Reward our earliest users with an AURA token airdrop.',
    votesFor: 500,
    votesAgainst: 10,
    status: 'active',
    startDate: '2024-07-01T12:00:00Z',
    endDate: '2024-07-15T12:00:00Z',
    quorum: 400,
    type: 'tokenomics',
    category: 'community',
    author: 'Tokenomics Expert',
    created_at: '2024-06-25T10:00:00Z',
    updated_at: '2024-06-25T10:00:00Z',
    valid: true
  },
  {
    id: '5',
    title: 'Strategic Partnership with Solana Foundation',
    description: 'Explore a strategic alliance to boost development.',
    votesFor: 220,
    votesAgainst: 30,
    status: 'pending',
    startDate: '2024-08-01T12:00:00Z',
    endDate: '2024-08-15T12:00:00Z',
    quorum: 250,
    type: 'partnership',
    category: 'business',
    author: 'Business Development',
    created_at: '2024-07-25T10:00:00Z',
    updated_at: '2024-07-25T10:00:00Z',
    valid: true
  }
]

interface Proposal {
  id: string
  title: string
  description: string
  votesFor: number
  votesAgainst: number
  status: string
  startDate: string
  endDate: string
  quorum: number
  type: string
  category: string
  author: string
  created_at: string
  updated_at: string
  valid: boolean
}

interface VotingResult {
  id: string
  title: string
  forPercentage: number
  againstPercentage: number
  totalVotes: number
}

export async function GET() {
  try {
    // Simulate a delay to mimic real-world API latency
    await new Promise(resolve => setTimeout(resolve, 500))

    // Filter out invalid proposals
    const validProposals = proposals.filter(proposal => proposal.valid)
    
    // Calculate voting results
    const totalVotes = validProposals.reduce((acc: number, proposal: any) => 
      acc + (proposal.votesFor || 0) + (proposal.votesAgainst || 0), 0
    )
    
    const votingResults = validProposals.map((proposal: any) => {
      const totalProposalVotes = (proposal.votesFor || 0) + (proposal.votesAgainst || 0)
      return {
        id: proposal.id,
        title: proposal.title,
        forPercentage: totalProposalVotes > 0 ? ((proposal.votesFor || 0) / totalProposalVotes) * 100 : 0,
        againstPercentage: totalProposalVotes > 0 ? ((proposal.votesAgainst || 0) / totalProposalVotes) * 100 : 0,
        totalVotes: totalProposalVotes
      }
    })

    return NextResponse.json({
      proposals: validProposals,
      votingResults
    })
  } catch (error) {
    console.error('Governance API error:', error)
    return NextResponse.json({ error: 'Failed to fetch governance data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { actionType, proposalData } = await request.json()

    if (!actionType) {
      return NextResponse.json({ error: 'Missing action type' }, { status: 400 })
    }

    if (actionType === 'create') {
      // Validate proposal data
      if (!proposalData.title || !proposalData.description) {
        return NextResponse.json({ error: 'Missing proposal details' }, { status: 400 })
      }

      // Create a new proposal (mock implementation)
      const newProposal = {
        id: String(proposals.length + 1),
        ...proposalData,
        votesFor: 0,
        votesAgainst: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        valid: true
      }
      proposals.push(newProposal)

      return NextResponse.json({ message: 'Proposal created successfully', proposal: newProposal }, { status: 201 })
    }
    
    // Handle votes with proper typing
    if (actionType === 'vote') {
      const votes = proposalData.votes?.map((vote: any) => ({
        voter: vote.voter,
        choice: vote.choice,
        weight: vote.weight || 1,
        timestamp: vote.timestamp || new Date().toISOString()
      })) || []

      // Find the proposal
      const proposalIndex = proposals.findIndex(p => p.id === proposalData.proposalId)
      if (proposalIndex === -1) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
      }

      // Process votes (mock implementation)
      votes.forEach(vote => {
        if (vote.choice === 'for') {
          proposals[proposalIndex].votesFor += vote.weight
        } else if (vote.choice === 'against') {
          proposals[proposalIndex].votesAgainst += vote.weight
        }
      })

      return NextResponse.json({ message: 'Votes recorded successfully' }, { status: 200 })
    }

    return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })

  } catch (error) {
    console.error('Governance API error:', error)
    return NextResponse.json({ error: 'Failed to process governance action' }, { status: 500 })
  }
}
