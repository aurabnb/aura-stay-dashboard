import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// Mock data for when database is not available
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

    // Try to use database first
    try {
      const whereClause = category && category !== 'all' ? { category } : {}

      const messages = await prisma.communityMessage.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              username: true,
              walletAddress: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 50
      })

      // Format messages for response
      const formattedMessages = messages.map(message => ({
        id: message.id,
        content: message.content,
        authorId: message.authorId,
        category: message.category,
        upvotes: message.upvotes,
        downvotes: message.downvotes,
        timestamp: message.timestamp.toISOString(),
        author: {
          username: message.author?.username,
          walletAddress: message.author?.walletAddress
        }
      }))

      return NextResponse.json({ messages: formattedMessages })
    } catch (dbError) {
      console.log('Database not available, using mock data:', dbError)
      
      // Filter mock messages by category if specified
      let filteredMessages = mockMessages
      if (category && category !== 'all') {
        filteredMessages = mockMessages.filter(msg => msg.category === category)
      }
      
      return NextResponse.json({ messages: filteredMessages })
    }
  } catch (error) {
    console.error('Error fetching community messages:', error)
    
    // Return mock data as fallback
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

    try {
      // Try to use database first
      let user = await prisma.user.findUnique({
        where: { walletAddress }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            username: `user_${walletAddress.slice(0, 8)}`
          }
        })
      }

      // Create message
      const message = await prisma.communityMessage.create({
        data: {
          content,
          category,
          authorId: user.id
        },
        include: {
          author: {
            select: {
              username: true,
              walletAddress: true
            }
          }
        }
      })

      const formattedMessage = {
        id: message.id,
        content: message.content,
        authorId: message.authorId,
        category: message.category,
        upvotes: 0,
        downvotes: 0,
        timestamp: message.timestamp.toISOString(),
        author: {
          username: message.author.username,
          walletAddress: message.author.walletAddress
        }
      }

      return NextResponse.json(formattedMessage)
    } catch (dbError) {
      console.log('Database not available, simulating message creation:', dbError)
      
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
    }
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
    const { messageId, action, userId } = body

    if (!messageId || !action || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['upvote', 'downvote'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    try {
      // Try to use database first
      const updateData = action === 'upvote' 
        ? { upvotes: { increment: 1 } }
        : { downvotes: { increment: 1 } }

      const message = await prisma.communityMessage.update({
        where: { id: messageId },
        data: updateData,
        include: {
          author: {
            select: {
              username: true,
              walletAddress: true
            }
          }
        }
      })

      const formattedMessage = {
        id: message.id,
        content: message.content,
        authorId: message.authorId,
        category: message.category,
        upvotes: message.upvotes,
        downvotes: message.downvotes,
        timestamp: message.timestamp.toISOString(),
        author: {
          username: message.author.username,
          walletAddress: message.author.walletAddress
        }
      }

      return NextResponse.json(formattedMessage)
    } catch (dbError) {
      console.log('Database not available, simulating vote update:', dbError)
      
      // Find mock message and simulate vote update
      const mockMessage = mockMessages.find(msg => msg.id === messageId)
      if (mockMessage) {
        if (action === 'upvote') {
          mockMessage.upvotes += 1
        } else {
          mockMessage.downvotes += 1
        }
        return NextResponse.json(mockMessage)
      }
      
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error updating vote:', error)
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    )
  }
} 