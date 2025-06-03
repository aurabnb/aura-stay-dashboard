'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, MessageCircle, Twitter, Linkedin, TrendingUp } from 'lucide-react'

interface SocialMetrics {
  xFollowers: number
  telegramMembers: number
  linkedinFollowers: number
  lastUpdated: string
}

interface GrowthData {
  month: string
  xFollowers: number
  telegramMembers: number
  linkedinFollowers: number
}

export function CommunityGrowthMetrics() {
  const [metrics, setMetrics] = useState<SocialMetrics>({
    xFollowers: 15420,
    telegramMembers: 8745,
    linkedinFollowers: 3250,
    lastUpdated: new Date().toISOString()
  })
  
  const [mounted, setMounted] = useState(false)

  // Fix hydration by only running random values after mount
  useEffect(() => {
    setMounted(true)
    // Add small random variations only on client side
    setMetrics(prev => ({
      ...prev,
      xFollowers: 15420 + Math.floor(Math.random() * 100),
      telegramMembers: 8745 + Math.floor(Math.random() * 50),
      linkedinFollowers: 3250 + Math.floor(Math.random() * 25),
    }))
  }, [])

  // Static data for SSR, dynamic data after mount
  const growthData: GrowthData[] = [
    { month: 'Jan', xFollowers: 12000, telegramMembers: 5200, linkedinFollowers: 2100 },
    { month: 'Feb', xFollowers: 12800, telegramMembers: 5800, linkedinFollowers: 2300 },
    { month: 'Mar', xFollowers: 13500, telegramMembers: 6400, linkedinFollowers: 2500 },
    { month: 'Apr', xFollowers: 14200, telegramMembers: 7100, linkedinFollowers: 2700 },
    { month: 'May', xFollowers: 14900, telegramMembers: 7800, linkedinFollowers: 2900 },
    { month: 'Jun', xFollowers: 15600, telegramMembers: 8500, linkedinFollowers: 3100 }
  ]

  const platforms = [
    {
      name: 'X (Twitter)',
      icon: Twitter,
      count: metrics.xFollowers,
      growth: '+12.3%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Telegram',
      icon: MessageCircle,
      count: metrics.telegramMembers,
      growth: '+8.7%',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      count: metrics.linkedinFollowers,
      growth: '+15.2%',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    }
  ]

  const totalFollowers = platforms.reduce((sum, platform) => sum + platform.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Community Growth</h2>
        <p className="text-muted-foreground">
          Building a global community of hospitality enthusiasts
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Community</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +11.2% from last month
            </p>
          </CardContent>
        </Card>

        {platforms.map((platform) => {
          const Icon = platform.icon
          return (
            <Card key={platform.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{platform.name}</CardTitle>
                <Icon className={`h-4 w-4 ${platform.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platform.count.toLocaleString()}</div>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className={`${platform.bgColor} ${platform.color}`}>
                    {platform.growth}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Trajectory</CardTitle>
          <CardDescription>
            Community growth across all platforms over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="xFollowers" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="X Followers"
                />
                <Line 
                  type="monotone" 
                  dataKey="telegramMembers" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  name="Telegram Members"
                />
                <Line 
                  type="monotone" 
                  dataKey="linkedinFollowers" 
                  stroke="#1d4ed8" 
                  strokeWidth={2}
                  name="LinkedIn Followers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>
              Current follower distribution across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platforms.map(p => ({ name: p.name.split(' ')[0], count: p.count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Insights</CardTitle>
            <CardDescription>
              Key metrics and community highlights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Daily Growth</span>
              <span className="font-semibold">+127 followers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Most Active Platform</span>
              <span className="font-semibold">Telegram</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
              <span className="font-semibold">8.4%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Geographic Reach</span>
              <span className="font-semibold">47 countries</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        {mounted ? (
          <>Last updated: {metrics.lastUpdated ? new Date(metrics.lastUpdated).toLocaleString() : 'Never'}</>
        ) : (
          <>Last updated: Loading...</>
        )}
      </div>
    </div>
  )
} 