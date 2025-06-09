'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  Calendar,
  DollarSign,
  ArrowUpDown,
  Eye
} from 'lucide-react'

interface TaxTransaction {
  id: string
  timestamp: string
  transactionHash: string
  fromWallet: string
  toWallet: string
  tradingPair: string
  swapAmount: number
  taxAmount: number
  taxRate: number
  status: 'completed' | 'pending' | 'failed'
  blockNumber: number
}

export const AdminTaxHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Sample tax transaction data
  const [transactions] = useState<TaxTransaction[]>([
    {
      id: '1',
      timestamp: '2024-06-05T10:30:00Z',
      transactionHash: '4xKzP9L8QmN6vW2rR5cF7dY3nM1eH9jB8pV5tU7qA2kS',
      fromWallet: '8mKJ4p9L2nQ5vW8rR5cF7dY3nM1eH9jB8pV5tU7qA2kS',
      toWallet: '6dR3p9L2nQ5vW8rR5cF7dY3nM1eH9jB8pV5tU7qA2kS',
      tradingPair: 'SOL/AURA',
      swapAmount: 10.5,
      taxAmount: 0.21,
      taxRate: 2.0,
      status: 'completed',
      blockNumber: 245789321
    },
    {
      id: '2',
      timestamp: '2024-06-05T10:25:00Z',
      transactionHash: '3wJbN8K7QlM5uV1qP4bE6cX2mL0dG8iA7oT4sR6pZ1jQ',
      fromWallet: '7lI2o8K6PlL4uT7qP4bE6cX2mL0dG8iA7oT4sR6pZ1jQ',
      toWallet: '5bP2o8K6PlL4uT7qP4bE6cX2mL0dG8iA7oT4sR6pZ1jQ',
      tradingPair: 'USDC/AURA',
      swapAmount: 25.0,
      taxAmount: 0.375,
      taxRate: 1.5,
      status: 'completed',
      blockNumber: 245789315
    },
    {
      id: '3',
      timestamp: '2024-06-05T10:20:00Z',
      transactionHash: '2vGaN7J6PkK4tS0pO3aD5bW1lK9cF7hZ6nS3rP5oY0iP',
      fromWallet: '6kH1n7J5OjJ3tS7pO3aD5bW1lK9cF7hZ6nS3rP5oY0iP',
      toWallet: '4aO1n7J5OjJ3tS7pO3aD5bW1lK9cF7hZ6nS3rP5oY0iP',
      tradingPair: 'SOL/AURA',
      swapAmount: 50.0,
      taxAmount: 1.25,
      taxRate: 2.5,
      status: 'completed',
      blockNumber: 245789308
    },
    {
      id: '4',
      timestamp: '2024-06-05T10:15:00Z',
      transactionHash: '1uFZM6I5NiI2rR9nN2ZC4aV0kI8bE6gY5mR2qO4nX9hO',
      fromWallet: '5jG0m6I4NhI2rR6nN2ZC4aV0kI8bE6gY5mR2qO4nX9hO',
      toWallet: '3ZN0m6I4NhI2rR6nN2ZC4aV0kI8bE6gY5mR2qO4nX9hO',
      tradingPair: 'RAY/AURA',
      swapAmount: 15.75,
      taxAmount: 0.315,
      taxRate: 2.0,
      status: 'pending',
      blockNumber: 245789302
    },
    {
      id: '5',
      timestamp: '2024-06-05T10:10:00Z',
      transactionHash: '0tEYL5H4MhH1qQ8mM1YB3ZU9jH7aD5fX4lQ1pN3mW8gN',
      fromWallet: '4iF9l5H3MgH1qQ5mM1YB3ZU9jH7aD5fX4lQ1pN3mW8gN',
      toWallet: '2YM9l5H3MgH1qQ5mM1YB3ZU9jH7aD5fX4lQ1pN3mW8gN',
      tradingPair: 'SOL/AURA',
      swapAmount: 8.2,
      taxAmount: 0.164,
      taxRate: 2.0,
      status: 'failed',
      blockNumber: 245789295
    }
  ])

  const filteredTransactions = transactions
    .filter(tx => 
      statusFilter === 'all' || tx.status === statusFilter
    )
    .filter(tx => 
      searchTerm === '' || 
      tx.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.tradingPair.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromWallet.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy as keyof TaxTransaction]
      const bValue = b[sortBy as keyof TaxTransaction]
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const truncateAddress = (address: string, length = 8) => {
    return `${address.slice(0, length)}...${address.slice(-4)}`
  }

  const exportTransactions = () => {
    const csvContent = [
      ['Timestamp', 'Transaction Hash', 'Trading Pair', 'Swap Amount', 'Tax Amount', 'Tax Rate', 'Status'],
      ...filteredTransactions.map(tx => [
        formatTimestamp(tx.timestamp),
        tx.transactionHash,
        tx.tradingPair,
        tx.swapAmount.toString(),
        tx.taxAmount.toString(),
        `${tx.taxRate}%`,
        tx.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aura-tax-history-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const totalTaxCollected = filteredTransactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.taxAmount, 0)

  const viewOnExplorer = (hash: string) => {
    window.open(`https://solscan.io/tx/${hash}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold">{filteredTransactions.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Tax Collected</p>
              <p className="text-2xl font-bold text-green-600">{totalTaxCollected.toFixed(3)} SOL</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {((filteredTransactions.filter(tx => tx.status === 'completed').length / filteredTransactions.length) * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Average Tax</p>
              <p className="text-2xl font-bold text-purple-600">
                {(totalTaxCollected / filteredTransactions.filter(tx => tx.status === 'completed').length).toFixed(4)} SOL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tax Transaction History</span>
            <Button onClick={exportTransactions} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by transaction hash, trading pair, or wallet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Time</SelectItem>
                <SelectItem value="taxAmount">Tax Amount</SelectItem>
                <SelectItem value="swapAmount">Swap Amount</SelectItem>
                <SelectItem value="tradingPair">Trading Pair</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </Button>
          </div>

          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Transaction</th>
                  <th className="text-left p-3">Trading Pair</th>
                  <th className="text-right p-3">Swap Amount</th>
                  <th className="text-right p-3">Tax Amount</th>
                  <th className="text-center p-3">Rate</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-600">
                      {formatTimestamp(tx.timestamp)}
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-sm">
                        {truncateAddress(tx.transactionHash)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Block {tx.blockNumber}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{tx.tradingPair}</Badge>
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {tx.swapAmount} SOL
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-semibold text-green-600">
                        {tx.taxAmount} SOL
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary">{tx.taxRate}%</Badge>
                    </td>
                    <td className="p-3 text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewOnExplorer(tx.transactionHash)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 