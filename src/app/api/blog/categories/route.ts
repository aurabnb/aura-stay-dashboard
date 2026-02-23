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

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET - Fetch blog categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includePostCount = searchParams.get('count') === 'true'

    const categories = await prisma.blogCategory.findMany({
      include: includePostCount ? {
        _count: {
          select: {
            blogPosts: {
              where: {
                status: 'PUBLISHED',
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      } : undefined,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create new blog category
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    const data = await request.json()

    const { name, description, color } = data

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = generateSlug(name)
    let counter = 1
    while (await prisma.blogCategory.findUnique({ where: { slug } })) {
      slug = `${generateSlug(name)}-${counter}`
      counter++
    }

    // Create category
    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description,
        color,
      },
    })

    return NextResponse.json({
      success: true,
      category,
      message: 'Category created successfully',
    })
  } catch (error) {
    console.error('Error creating category:', error)
    if (error instanceof Error && error.message.includes('Not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
} 