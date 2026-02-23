'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Receipt, ArrowRight } from 'lucide-react'

export default function ExpenseTrackerPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to user dashboard expenses tab after a brief delay
    const timer = setTimeout(() => {
      router.push('/user-dashboard#expenses')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Expense Tracker Moved</h2>
            <p className="text-gray-600">
              The expense tracker has been moved to the User Dashboard for better integration
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <span className="text-sm">Redirecting to User Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </div>
          
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 