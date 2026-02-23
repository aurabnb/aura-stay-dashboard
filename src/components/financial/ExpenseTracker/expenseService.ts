import { ExpenseEntry } from './types'

// Function to fetch current SOL price
const getCurrentSolPrice = async (): Promise<number> => {
  try {
    const response = await fetch('/api/sol-price')
    const data = await response.json()
    return data.price || 150
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    return 150 // Fallback price
  }
}

// Function to convert Google Sheets expense to ExpenseEntry format
const convertToExpenseEntry = (expense: any): ExpenseEntry => {
  const transactionDate = new Date(expense.date)
  const formattedDate = transactionDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Calculate SOL amount and USD value
  let solAmount = 0
  let usdValueAtTime = expense.usdValue || 0
  let solPriceAtTime = expense.solPrice

  if (expense.currency === 'SOL') {
    solAmount = expense.amount
    solPriceAtTime = expense.solPrice || 150
    usdValueAtTime = solAmount * solPriceAtTime
  } else if (expense.currency === 'USDC' || expense.currency === 'USD') {
    usdValueAtTime = expense.amount
    solAmount = 0
    solPriceAtTime = undefined
  }

  return {
    date: formattedDate,
    category: expense.category,
    transaction: `${expense.description}${solAmount > 0 ? ` (${solAmount.toFixed(2)} SOL)` : ''}`,
    amount: `$${usdValueAtTime.toFixed(2)}`,
    solAmount,
    solPriceAtTime,
    usdValueAtTime,
    transactionDate,
    status: expense.status,
    wallet: expense.wallet,
    transactionHash: expense.transactionHash
  }
}

// Function to generate fallback mock data when Google Sheets is unavailable
const generateFallbackData = async (): Promise<{ expenses: ExpenseEntry[], totalUsdValue: number }> => {
  const mockExpenses: ExpenseEntry[] = []
  let calculatedTotal = 0
  const currentSolPrice = await getCurrentSolPrice()
  
  // Generate some realistic mock expenses
  const mockData = [
    {
      date: '2024-01-15',
      description: 'Marketing Campaign Q1',
      category: 'Marketing',
      amount: 5000,
      currency: 'USDC',
      status: 'confirmed'
    },
    {
      date: '2024-01-12',
      description: 'Development Infrastructure',
      category: 'Operations',
      amount: 15.5,
      currency: 'SOL',
      solPrice: currentSolPrice,
      status: 'confirmed'
    },
    {
      date: '2024-01-10',
      description: 'Legal & Compliance Consultation',
      category: 'Business Costs',
      amount: 3500,
      currency: 'USDC',
      status: 'confirmed'
    },
    {
      date: '2024-01-08',
      description: 'Smart Contract Audit',
      category: 'Operations',
      amount: 25,
      currency: 'SOL',
      solPrice: currentSolPrice,
      status: 'confirmed'
    },
    {
      date: '2024-01-05',
      description: 'Community Rewards Distribution',
      category: 'Community',
      amount: 12.8,
      currency: 'SOL',
      solPrice: currentSolPrice,
      status: 'confirmed'
    }
  ]

  for (const data of mockData) {
    const expense = convertToExpenseEntry(data)
    calculatedTotal += expense.usdValueAtTime || 0
    mockExpenses.push(expense)
  }

  return { expenses: mockExpenses, totalUsdValue: calculatedTotal }
}

export const fetchExpenseData = async (): Promise<{ expenses: ExpenseEntry[], totalUsdValue: number }> => {
  try {
    // Try to fetch real data from Google Sheets API
    const response = await fetch('/api/treasury-expenses?type=expenses')
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.expenses || data.expenses.length === 0) {
      console.log('No expenses found in Google Sheets, using fallback data')
      return await generateFallbackData()
    }

    // Convert Google Sheets data to ExpenseEntry format
    const expenses: ExpenseEntry[] = data.expenses.map(convertToExpenseEntry)
    const totalUsdValue = expenses.reduce((sum, expense) => sum + (expense.usdValueAtTime || 0), 0)

    // Sort by date (newest first)
    expenses.sort((a, b) => (b.transactionDate?.getTime() || 0) - (a.transactionDate?.getTime() || 0))

    return { expenses, totalUsdValue }
  } catch (error) {
    console.error('Error fetching expenses from Google Sheets:', error)
    console.log('Falling back to mock data')
    
    // Fallback to mock data if Google Sheets API fails
    return await generateFallbackData()
  }
} 