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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

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
  } catch (error) {
    console.error('Error fetching community messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
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

    // Find or create user
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

    // Update vote count directly on the message
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
  } catch (error) {
    console.error('Error updating vote:', error)
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    )
  }
} 