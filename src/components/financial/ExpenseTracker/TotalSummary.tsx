'use client'

import React from 'react'
import { DollarSign } from 'lucide-react'
import { ExpenseEntry } from './types'

interface TotalSummaryProps {
  expenses: ExpenseEntry[]
  totalUsdValue: number
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const TotalSummary: React.FC<TotalSummaryProps> = ({ expenses, totalUsdValue }) => {
  if (expenses.length === 0) return null

  return (
    <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total Expense Value</h3>
            <p className="text-sm text-gray-600">Calculated using historical SOL prices at transaction time</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(totalUsdValue)}
          </div>
          <div className="text-sm text-gray-500">
            {expenses.reduce((sum, expense) => sum + (expense.solAmount || 0), 0).toFixed(4)} SOL total
          </div>
        </div>
      </div>
    </div>
  )
}

export default TotalSummary 