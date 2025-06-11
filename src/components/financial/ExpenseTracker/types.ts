export interface ExpenseEntry {
  date: string
  category: string
  transaction: string
  amount?: string
  solAmount?: number
  solPriceAtTime?: number
  usdValueAtTime?: number
  transactionDate?: Date
  status?: 'pending' | 'confirmed' | 'failed'
  wallet?: string
  transactionHash?: string
} 