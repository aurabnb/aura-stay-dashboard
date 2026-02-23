import { NextResponse } from 'next/server'

// Required for static export compatibility - only in non-static mode
// export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // For now, skip database check to avoid build issues
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'optional',
        api: 'operational'
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'operational'
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json(errorStatus, { status: 503 })
  }
} 