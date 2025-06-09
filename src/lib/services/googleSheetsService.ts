import { google } from 'googleapis'

// Google Sheets configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1CzTl1xO9fIEaV0MePMBWnUYaj9rp1i85l7_DtA8SLnk'

// Treasury data interface
export interface TreasuryExpense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  currency: string
  solPrice?: number
  usdValue?: number
  wallet?: string
  transactionHash?: string
  status: 'pending' | 'confirmed' | 'failed'
}

export interface TreasurySummary {
  totalExpenses: number
  totalUsdValue: number
  expensesByCategory: Record<string, number>
  expensesByMonth: Record<string, number>
  lastUpdated: string
}

class GoogleSheetsService {
  private auth: any
  private sheets: any

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth() {
    try {
      // Create OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/api/auth/google/callback'
      )

      // For now, we'll work without authentication and use fallback data
      // To enable Google Sheets access, you need to:
      // 1. Complete OAuth flow to get access tokens
      // 2. Store tokens securely and refresh them
      // 3. Set credentials: oauth2Client.setCredentials({ access_token, refresh_token })
      
      this.auth = oauth2Client
      
      // Only create sheets client if we have credentials
      // For development, this will be null and fallback to mock data
      this.sheets = null
      
      console.log('Google Sheets service initialized (using fallback data until OAuth is configured)')
    } catch (error) {
      console.error('Error initializing Google Sheets auth:', error)
    }
  }

  // Fetch treasury expense data from Google Sheets
  async fetchTreasuryExpenses(): Promise<TreasuryExpense[]> {
    try {
      if (!this.sheets) {
        await this.initializeAuth()
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Sheet1!A:J', // Adjust range based on your sheet structure
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        console.log('No data found in Google Sheets')
        return []
      }

      // Skip header row and parse data
      const expenses: TreasuryExpense[] = rows.slice(1).map((row: any[], index: number) => {
        const [
          date,
          description,
          category,
          amount,
          currency,
          solPrice,
          wallet,
          transactionHash,
          status
        ] = row

        const expenseAmount = parseFloat(amount) || 0
        const solPriceValue = parseFloat(solPrice) || 0
        const usdValue = currency === 'SOL' ? expenseAmount * solPriceValue : expenseAmount

        return {
          id: `expense-${index + 1}`,
          date: date || new Date().toISOString().split('T')[0],
          description: description || 'Unknown expense',
          category: category || 'Other',
          amount: expenseAmount,
          currency: currency || 'USD',
          solPrice: solPriceValue > 0 ? solPriceValue : undefined,
          usdValue,
          wallet: wallet || undefined,
          transactionHash: transactionHash || undefined,
          status: (status as 'pending' | 'confirmed' | 'failed') || 'confirmed'
        }
      })

      return expenses.filter(expense => expense.amount > 0) // Filter out invalid entries
    } catch (error) {
      console.error('Error fetching treasury expenses from Google Sheets:', error)
      
      // Return fallback mock data if API fails
      return this.getFallbackExpenses()
    }
  }

  // Calculate treasury summary from expenses
  async fetchTreasurySummary(): Promise<TreasurySummary> {
    try {
      const expenses = await this.fetchTreasuryExpenses()
      
      const totalExpenses = expenses.length
      const totalUsdValue = expenses.reduce((sum, expense) => sum + (expense.usdValue || 0), 0)
      
      // Group by category
      const expensesByCategory: Record<string, number> = {}
      expenses.forEach(expense => {
        const category = expense.category
        expensesByCategory[category] = (expensesByCategory[category] || 0) + (expense.usdValue || 0)
      })
      
      // Group by month
      const expensesByMonth: Record<string, number> = {}
      expenses.forEach(expense => {
        const month = new Date(expense.date).toISOString().substring(0, 7) // YYYY-MM
        expensesByMonth[month] = (expensesByMonth[month] || 0) + (expense.usdValue || 0)
      })

      return {
        totalExpenses,
        totalUsdValue,
        expensesByCategory,
        expensesByMonth,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error calculating treasury summary:', error)
      return {
        totalExpenses: 0,
        totalUsdValue: 0,
        expensesByCategory: {},
        expensesByMonth: {},
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Add new expense to Google Sheets
  async addTreasuryExpense(expense: Omit<TreasuryExpense, 'id'>): Promise<boolean> {
    try {
      if (!this.sheets) {
        await this.initializeAuth()
      }

      const values = [[
        expense.date,
        expense.description,
        expense.category,
        expense.amount,
        expense.currency,
        expense.solPrice || '',
        expense.wallet || '',
        expense.transactionHash || '',
        expense.status
      ]]

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: 'Sheet1!A:J',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
      })

      return true
    } catch (error) {
      console.error('Error adding treasury expense to Google Sheets:', error)
      return false
    }
  }

  // Fallback data when Google Sheets is unavailable
  private getFallbackExpenses(): TreasuryExpense[] {
    return [
      {
        id: 'fallback-1',
        date: '2024-01-15',
        description: 'Marketing Campaign Q1',
        category: 'Marketing',
        amount: 5000,
        currency: 'USDC',
        usdValue: 5000,
        wallet: '7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2',
        status: 'confirmed'
      },
      {
        id: 'fallback-2',
        date: '2024-01-10',
        description: 'Development Infrastructure',
        category: 'Operations',
        amount: 15.5,
        currency: 'SOL',
        solPrice: 100,
        usdValue: 1550,
        wallet: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
        status: 'confirmed'
      },
      {
        id: 'fallback-3',
        date: '2024-01-08',
        description: 'Legal & Compliance',
        category: 'Business Costs',
        amount: 3500,
        currency: 'USDC',
        usdValue: 3500,
        wallet: 'Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg',
        status: 'confirmed'
      }
    ]
  }
}

export const googleSheetsService = new GoogleSheetsService() 