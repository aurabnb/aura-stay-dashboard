import { google } from 'googleapis'

// Google Sheets configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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'
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
      // Try different authentication methods
      if (GOOGLE_API_KEY) {
        // Method 1: Using API Key (for public sheets)
        this.auth = GOOGLE_API_KEY
        this.sheets = google.sheets({ version: 'v4', auth: GOOGLE_API_KEY })
        console.log('Google Sheets service initialized with API key')
      } else {
        // Method 2: Try to access public sheet without auth
        // This requires the sheet to be publicly readable
        this.sheets = google.sheets({ version: 'v4' })
        console.log('Google Sheets service initialized without authentication (public access)')
      }
    } catch (error) {
      console.error('Error initializing Google Sheets auth:', error)
      this.sheets = null
    }
  }

  // Fetch treasury expense data from Google Sheets
  async fetchTreasuryExpenses(): Promise<TreasuryExpense[]> {
    try {
      // First try the API method
      if (this.sheets) {
        console.log('Fetching data from Google Sheets API...')
        console.log('Spreadsheet ID:', GOOGLE_SHEETS_SPREADSHEET_ID)
        
        try {
          const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
            range: 'Sheet1!A:J', // Fetch all columns A through J
          })

          const rows = response.data.values
          if (rows && rows.length > 0) {
            return this.parseRowsToExpenses(rows)
          }
        } catch (apiError) {
          console.log('API method failed, trying CSV export method...')
        }
      }

      // Fallback to CSV export method (works with public sheets)
      console.log('Fetching data from Google Sheets CSV export...')
      const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_SPREADSHEET_ID}/export?format=csv&gid=0`
      
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const csvText = await response.text()
      const rows = this.parseCSV(csvText)
      
      if (!rows || rows.length === 0) {
        console.log('No data found in Google Sheets CSV')
        return this.getFallbackExpenses()
      }

      console.log(`Found ${rows.length} rows in Google Sheets CSV`)
      return this.parseRowsToExpenses(rows)

    } catch (error) {
      console.error('Error fetching treasury expenses from Google Sheets:', error)
      
      // Type guard to safely access error properties
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error details:', errorMessage)
      
      if (errorMessage.includes('403')) {
        console.log('❌ Permission denied. To fix this:')
        console.log('1. Open your Google Sheet')
        console.log('2. Click "Share" button')
        console.log('3. Change access to "Anyone with the link can view"')
        console.log('4. Make sure "General access" is set to "Viewer"')
      }
      
      // Return fallback mock data if all methods fail
      return this.getFallbackExpenses()
    }
  }

  // Parse CSV text into rows
  private parseCSV(csvText: string): string[][] {
    const lines = csvText.split('\n')
    const rows: string[][] = []
    
    for (const line of lines) {
      if (line.trim()) {
        // Simple CSV parsing - this could be improved for complex CSV
        const row = line.split(',').map(cell => cell.replace(/"/g, '').trim())
        rows.push(row)
      }
    }
    
    return rows
  }

  // Parse rows data into TreasuryExpense objects
  private parseRowsToExpenses(rows: string[][]): TreasuryExpense[] {
    console.log('First few rows:', rows.slice(0, 3))

    const expenses: TreasuryExpense[] = []
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || []
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

      // Skip empty rows
      if (!date && !description && !amount) {
        continue
      }

      const expenseAmount = parseFloat(amount) || 0
      const solPriceValue = parseFloat(solPrice) || 0
      const usdValue = currency === 'SOL' ? expenseAmount * solPriceValue : expenseAmount

      const expense: TreasuryExpense = {
        id: `expense-${i}`,
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

      expenses.push(expense)
    }

    console.log(`✅ Successfully parsed ${expenses.length} expenses from Google Sheets`)
    return expenses
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