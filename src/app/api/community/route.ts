import { NextRequest, NextResponse } from 'next/server'

// Required for static export compatibility
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every minute

interface CommunityMessage {
  id: string
  content: string
  authorId: string
  category: string
  upvotes: number
  downvotes: number
  timestamp: string
  author: {
    username?: string
    walletAddress?: string
  }
}

// Mock data for demonstration
const mockMessages: CommunityMessage[] = [
  {
    id: '1',
    content: 'Welcome to the AURA community! This is a demo message showcasing the community board functionality.',
    authorId: 'demo-user-1',
    category: 'general',
    upvotes: 5,
    downvotes: 0,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    author: {
      username: 'aura_founder',
      walletAddress: 'DEMO...WALLET'
    }
  },
  {
    id: '2',
    content: 'I propose we explore more eco-friendly building materials for the Volcano House project.',
    authorId: 'demo-user-2',
    category: 'proposals',
    upvotes: 12,
    downvotes: 1,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    author: {
      username: 'eco_builder',
      walletAddress: 'DEMO...BUILD'
    }
  },
  {
    id: '3',
    content: 'The recent treasury report looks great! Funding progress is ahead of schedule.',
    authorId: 'demo-user-3',
    category: 'treasury',
    upvotes: 8,
    downvotes: 0,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    author: {
      username: 'community_member',
      walletAddress: 'DEMO...TREA'
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Use mock data for now to avoid build issues
    let filteredMessages = mockMessages
    if (category && category !== 'all') {
      filteredMessages = mockMessages.filter(msg => msg.category === category)
    }
    
    return NextResponse.json({ messages: filteredMessages })
  } catch (error) {
    console.error('Error fetching community messages:', error)
    return NextResponse.json({ messages: mockMessages })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, category, walletAddress } = body

    if (!content || !category || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Simulate message creation with mock data
    const newMessage: CommunityMessage = {
      id: Date.now().toString(),
      content,
      authorId: `user_${walletAddress}`,
      category,
      upvotes: 0,
      downvotes: 0,
      timestamp: new Date().toISOString(),
      author: {
        username: `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
        walletAddress: walletAddress
      }
    }
    
    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error creating community message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, action } = body

    if (!messageId || !action || !['upvote', 'downvote'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Simulate vote update
    const response = {
      messageId,
      action,
      success: true,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating message vote:', error)
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    )
  }
} 