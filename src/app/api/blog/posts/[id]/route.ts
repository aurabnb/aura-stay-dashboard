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

// GET - Fetch single blog post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const isAdminView = searchParams.get('admin') === 'true'
    const incrementViews = searchParams.get('views') !== 'false'

    // Check admin authentication for admin view
    let isAdmin = false
    try {
      if (isAdminView) {
        await verifyAdmin(request)
        isAdmin = true
      }
    } catch (error) {
      if (isAdminView) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Find post by ID or slug
    const where = id.length === 25 ? { id } : { slug: id }
    
    // Add published status filter for public view
    if (!isAdmin) {
      Object.assign(where, {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
      })
    }

    const post = await prisma.blogPost.findFirst({
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
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Increment view count for public view
    if (!isAdmin && incrementViews) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      })
      post.views += 1
    }

    // Get related posts
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: post.id },
        categoryId: post.categoryId,
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
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
      take: 3,
      orderBy: { publishedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      post,
      relatedPosts,
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    const { id } = await context.params
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
      status,
    } = data

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Generate new slug if title changed
    let slug = existingPost.slug
    if (title && title !== existingPost.title) {
      slug = generateSlug(title)
      let counter = 1
      while (await prisma.blogPost.findFirst({
        where: { slug, id: { not: id } }
      })) {
        slug = `${generateSlug(title)}-${counter}`
        counter++
      }
    }

    // Calculate read time if content changed
    let readTime = existingPost.readTime
    if (content && content !== existingPost.content) {
      readTime = calculateReadTime(content)
    }

    // Determine publishedAt date
    let publishedAt = existingPost.publishedAt
    if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      publishedAt = new Date()
    } else if (status !== 'PUBLISHED' && existingPost.status === 'PUBLISHED') {
      publishedAt = null
    }

    // Update blog post
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title: title || existingPost.title,
        slug,
        content: content || existingPost.content,
        excerpt,
        featuredImage,
        categoryId,
        tags: tags || existingPost.tags,
        metaTitle,
        metaDescription,
        status: status || existingPost.status,
        readTime,
        publishedAt,
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
      post: updatedPost,
      message: 'Blog post updated successfully',
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request)
    const { id } = await context.params

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Delete blog post
    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
} 