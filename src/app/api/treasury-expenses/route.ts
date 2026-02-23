import { NextResponse, NextRequest } from 'next/server'
import { googleSheetsService } from '@/lib/services/googleSheetsService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'expenses'

    switch (type) {
      case 'expenses':
        const expenses = await googleSheetsService.fetchTreasuryExpenses()
        return NextResponse.json({
          expenses,
          total: expenses.length,
          lastUpdated: new Date().toISOString()
        })

      case 'summary':
        const summary = await googleSheetsService.fetchTreasurySummary()
        return NextResponse.json(summary)

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use "expenses" or "summary"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error fetching treasury expenses:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch treasury expenses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      description,
      category,
      amount,
      currency,
      solPrice,
      wallet,
      transactionHash,
      status = 'confirmed'
    } = body

    // Validate required fields
    if (!date || !description || !category || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: date, description, category, amount, currency' },
        { status: 400 }
      )
    }

    const success = await googleSheetsService.addTreasuryExpense({
      date,
      description,
      category,
      amount: parseFloat(amount),
      currency,
      solPrice: solPrice ? parseFloat(solPrice) : undefined,
      wallet,
      transactionHash,
      status
    })

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Expense added successfully' 
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to add expense to Google Sheets' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error adding treasury expense:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add treasury expense',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 