'use client'

import React from 'react'
import { TrendingDown, Receipt, ExternalLink, DollarSign } from 'lucide-react'
import { ExpenseEntry } from './types'

interface SummaryStatsProps {
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

const SummaryStats: React.FC<SummaryStatsProps> = ({ expenses, totalUsdValue }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-gray-700" />
          <div>
            <div className="text-sm font-medium text-gray-700">Total Entries</div>
            <div className="text-2xl font-bold text-gray-900">{expenses.length}</div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-gray-700" />
          <div>
            <div className="text-sm font-medium text-gray-700">Categories</div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(expenses.map(e => e.category.split(' - ')[0])).size}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-gray-700" />
          <div>
            <div className="text-sm font-medium text-gray-700">Transactions</div>
            <div className="text-2xl font-bold text-gray-900">
              {expenses.filter(e => e.transaction.includes('solscan.io') || e.transaction.includes('SOL')).length}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gray-700" />
          <div>
            <div className="text-sm font-medium text-gray-700">Total Value</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalUsdValue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryStats 