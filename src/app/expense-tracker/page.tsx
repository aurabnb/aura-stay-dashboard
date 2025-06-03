import { Suspense } from 'react'
import ExpenseTracker from '@/components/financial/ExpenseTracker'
import { Card, CardContent } from '@/components/ui/card'

function ExpenseTrackerLoadingSkeleton() {
  return (
    <Card className="w-full animate-pulse">
      <CardContent className="p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExpenseTrackerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
            <p className="text-muted-foreground">
              Track and analyze treasury expenses with historical SOL price calculations
            </p>
          </div>
          
          <Suspense fallback={<ExpenseTrackerLoadingSkeleton />}>
            <ExpenseTracker />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 