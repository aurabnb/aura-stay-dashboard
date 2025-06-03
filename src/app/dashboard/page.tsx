import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  Home, 
  Users, 
  Settings,
  PieChart,
  Activity,
  Coins
} from 'lucide-react'

export default function DashboardPage() {
  const dashboardItems = [
    {
      title: 'Analytics',
      description: 'Comprehensive analytics and insights into AURA ecosystem performance',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-blue-500',
      stats: '47 metrics tracked'
    },
    {
      title: 'Trading',
      description: 'Advanced trading interface with real-time market data',
      icon: TrendingUp,
      href: '/dashboard/trading',
      color: 'bg-green-500',
      stats: '23 active trades'
    },
    {
      title: 'Wallet',
      description: 'Manage your portfolio, view balances and transaction history',
      icon: Wallet,
      href: '/dashboard/wallet',
      color: 'bg-purple-500',
      stats: 'Connect to view'
    },
    {
      title: 'Treasury',
      description: 'Monitor treasury performance and staking rewards',
      icon: PieChart,
      href: '/dashboard/treasury',
      color: 'bg-orange-500',
      stats: '$2.45M value'
    },
    {
      title: 'Properties',
      description: 'Browse and manage AuraBNB property listings',
      icon: Home,
      href: '/dashboard/properties',
      color: 'bg-cyan-500',
      stats: '12 properties'
    },
    {
      title: 'Governance',
      description: 'Participate in DAO governance and voting',
      icon: Users,
      href: '/dashboard/governance',
      color: 'bg-indigo-500',
      stats: '5 active proposals'
    },
    {
      title: 'Staking',
      description: 'Stake your tokens and earn rewards',
      icon: Coins,
      href: '/dashboard/staking',
      color: 'bg-yellow-500',
      stats: '12.5% APY'
    },
    {
      title: 'Community',
      description: 'Connect with the AuraBNB community',
      icon: Activity,
      href: '/dashboard/community',
      color: 'bg-pink-500',
      stats: '2,847 members'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your AuraBNB control center. Access all platform features and manage your assets.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,543.21</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.2%</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AURA Staked</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,420 AURA</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> APY
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treasury Health</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">
                Excellent performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3</span> new today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm mb-4">
                      {item.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {item.stats}
                      </span>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        Open →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Staking Rewards Claimed</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
                <p className="font-medium text-green-600">+125.5 AURA</p>
              </div>
              
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tokens Swapped</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
                <p className="font-medium">1000 AURA → 2.5 SOL</p>
              </div>
              
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Governance Vote Cast</p>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                </div>
                <p className="font-medium">Proposal #42</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
} 