'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, RefreshCw, ExternalLink } from 'lucide-react'
import { ExpenseEntry } from './ExpenseTracker/types'
import { fetchExpenseData } from './ExpenseTracker/expenseService'
import SummaryStats from './ExpenseTracker/SummaryStats'
import ExpenseTable from './ExpenseTracker/ExpenseTable'
import TotalSummary from './ExpenseTracker/TotalSummary'

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalUsdValue, setTotalUsdValue] = useState(0)

  const handleFetchData = async () => {
    try {
      setError(null)
      const { expenses: fetchedExpenses, totalUsdValue: calculatedTotal } = await fetchExpenseData()
      setExpenses(fetchedExpenses)
      setTotalUsdValue(calculatedTotal)
    } catch (err) {
      console.error('Error fetching expense data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch expense data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await handleFetchData()
    setRefreshing(false)
  }

  useEffect(() => {
    handleFetchData()
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(handleFetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const openSheet = () => {
    window.open('https://docs.google.com/spreadsheets/d/1CzTl1xO9fIEaV0MePMBWnUYaj9rp1i85l7_DtA8SLnk/edit?gid=0#gid=0', '_blank')
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expense Tracker
          </CardTitle>
          <CardDescription>
            Live expense tracking from Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expense Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            <p className="font-medium">Error loading expense data</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={refreshData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expense Tracker
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openSheet}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              <ExternalLink className="h-4 w-4" />
              Open Sheet
            </button>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time expense tracking with historical value calculations. Total entries: {expenses.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SummaryStats expenses={expenses} totalUsdValue={totalUsdValue} />
        <ExpenseTable expenses={expenses} />
        <TotalSummary expenses={expenses} totalUsdValue={totalUsdValue} />

        <div className="text-sm text-gray-500 border-t pt-4 mt-6">
          <p>Data is automatically synced from the Google Sheets document every 5 minutes.</p>
          <p className="mt-1">
            Historical SOL prices are used to calculate USD values at transaction time.
          </p>
          <p className="mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ExpenseTracker 