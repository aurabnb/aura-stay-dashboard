import { ExpenseEntry } from './types'

// Mock function to simulate historical SOL price lookup
const getHistoricalSolPrice = async (date: Date): Promise<number> => {
  // Mock historical prices based on date ranges
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff < 30) return 95 + Math.random() * 10  // Recent: $95-105
  if (daysDiff < 90) return 85 + Math.random() * 20  // 1-3 months: $85-105
  if (daysDiff < 180) return 75 + Math.random() * 30 // 3-6 months: $75-105
  return 60 + Math.random() * 40                     // Older: $60-100
}

// Mock function to parse transaction amounts
const parseTransactionAmount = (transaction: string, category: string): number => {
  // Extract SOL amounts from transaction descriptions
  const solMatch = transaction.match(/(\d+\.?\d*)\s*SOL/i)
  if (solMatch) {
    return parseFloat(solMatch[1])
  }
  
  // Default amounts based on category
  const categoryDefaults: Record<string, number> = {
    'Development': 50 + Math.random() * 100,
    'Marketing': 25 + Math.random() * 75,
    'Operations': 15 + Math.random() * 50,
    'Legal': 100 + Math.random() * 200,
    'Infrastructure': 30 + Math.random() * 80
  }
  
  return categoryDefaults[category] || 10 + Math.random() * 40
}

// Mock function to parse dates
const parseDate = (dateStr: string): Date => {
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? new Date() : date
}

export const fetchExpenseData = async (): Promise<{ expenses: ExpenseEntry[], totalUsdValue: number }> => {
  // Mock data for demonstration - replace with real Google Sheets integration
  const mockExpenses: ExpenseEntry[] = []
  let calculatedTotal = 0
  
  // Generate mock expenses for the last 6 months
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 180)
    const transactionDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    
    const categories = ['Development', 'Marketing', 'Operations', 'Legal', 'Infrastructure', 'Design', 'Community']
    const category = categories[Math.floor(Math.random() * categories.length)]
    
    const transactions = [
      'Website development payment',
      'Social media marketing campaign',
      'Server hosting costs',
      'Legal consultation fees',
      'Database infrastructure',
      'Smart contract audit',
      'Community rewards distribution',
      'Logo design services',
      'Technical documentation',
      'Bug bounty payout'
    ]
    
    const transaction = transactions[Math.floor(Math.random() * transactions.length)]
    const solAmount = parseTransactionAmount(transaction, category)
    const solPriceAtTime = await getHistoricalSolPrice(transactionDate)
    const usdValueAtTime = solAmount * solPriceAtTime
    
    const expense: ExpenseEntry = {
      date: transactionDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      category,
      transaction: `${transaction} (${solAmount.toFixed(2)} SOL)`,
      amount: `$${usdValueAtTime.toFixed(2)}`,
      solAmount,
      solPriceAtTime,
      usdValueAtTime,
      transactionDate
    }
    
    calculatedTotal += usdValueAtTime
    mockExpenses.push(expense)
  }
  
  // Sort by date (newest first)
  mockExpenses.sort((a, b) => (b.transactionDate?.getTime() || 0) - (a.transactionDate?.getTime() || 0))
  
  return { expenses: mockExpenses, totalUsdValue: calculatedTotal }
} 