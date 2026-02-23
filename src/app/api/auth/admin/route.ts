import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'aura-admin-secret'

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (action === 'login') {
      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      // Find admin user
      const admin = await prisma.admin.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          password: true,
        },
      })

      if (!admin || !admin.isActive) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Update last login
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() },
      })

      // Create JWT token
      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      // Remove password from response
      const { password: _, ...adminData } = admin

      const response = NextResponse.json({
        success: true,
        admin: adminData,
        message: 'Login successful',
      })

      // Set HTTP-only cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      })

      return response
    }

    if (action === 'logout') {
      const response = NextResponse.json({
        success: true,
        message: 'Logout successful',
      })

      // Clear the admin token cookie
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Fetch admin data
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLogin: true,
      },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: 'Admin not found or inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      admin,
    })
  } catch (error) {
    console.error('Admin verification error:', error)
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
} 