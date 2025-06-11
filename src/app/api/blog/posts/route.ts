import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'aura-admin-secret'

// Helper function to verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value

  if (!token) {
    throw new Error('Not authenticated')
  }

  const decoded = jwt.verify(token, JWT_SECRET) as any
  
  const admin = await prisma.admin.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true, isActive: true },
  })

  if (!admin || !admin.isActive) {
    throw new Error('Admin not found or inactive')
  }

  return admin
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper function to calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// GET - Fetch blog posts (public and admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const adminView = searchParams.get('admin') === 'true'

    // Check admin authentication for admin view
    let isAdmin = false
    try {
      if (adminView) {
        await verifyAdmin(request)
        isAdmin = true
      }
    } catch (error) {
      if (adminView) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (!isAdmin) {
      // Public view - only show published posts
      where.status = 'PUBLISHED'
      where.publishedAt = { lte: new Date() }
    } else if (status) {
      // Admin view with status filter
      where.status = status
    }

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Fetch posts
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    const data = await request.json()

    const {
      title,
      content,
      excerpt,
      featuredImage,
      categoryId,
      tags,
      metaTitle,
      metaDescription,
      status = 'DRAFT',
    } = data

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = generateSlug(title)
    let counter = 1
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${generateSlug(title)}-${counter}`
      counter++
    }

    // Calculate read time
    const readTime = calculateReadTime(content)

    // Create blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        authorId: admin.id,
        categoryId,
        tags: tags || [],
        metaTitle,
        metaDescription,
        status,
        readTime,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      post: blogPost,
      message: 'Blog post created successfully',
    })
  } catch (error) {
    console.error('Error creating blog post:', error)
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
} 