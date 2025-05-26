
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, RefreshCw, ExternalLink, TrendingDown } from 'lucide-react';

interface ExpenseEntry {
  date: string;
  category: string;
  transaction: string;
  amount?: string;
}

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Sheets CSV export URL
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1CzTl1xO9fIEaV0MePMBWnUYaj9rp1i85l7_DtA8SLnk/export?format=csv&gid=0';

  const fetchExpenseData = async () => {
    try {
      console.log('Fetching expense data from Google Sheets...');
      setError(null);
      
      // Use a CORS proxy to fetch the CSV data
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(SHEET_URL));
      
      if (!response.ok) {
        throw new Error('Failed to fetch expense data');
      }
      
      const data = await response.json();
      const csvText = data.contents;
      
      console.log('Raw CSV response:', csvText);
      
      // Parse CSV data - handle base64 encoded content
      let actualCsvText = csvText;
      if (csvText.startsWith('data:text/csv;base64,')) {
        // Decode base64 content
        const base64Content = csvText.replace('data:text/csv;base64,', '');
        actualCsvText = atob(base64Content);
      }
      
      console.log('Decoded CSV text:', actualCsvText);
      
      // Split into lines and parse
      const lines = actualCsvText.split(/\r?\n/);
      console.log('CSV lines:', lines);
      
      const parsedExpenses: ExpenseEntry[] = [];
      
      // Skip header row and empty rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith(',,')) {
          try {
            // Enhanced CSV parsing to handle quoted fields properly
            const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
            const values = line.split(csvRegex).map(v => v.replace(/^"|"$/g, '').trim());
            
            console.log(`Parsing line ${i}:`, line, 'Values:', values);
            
            if (values.length >= 3 && values[0] && values[1] && values[2]) {
              const expense: ExpenseEntry = {
                date: values[0] || '',
                category: values[1] || '',
                transaction: values[2] || ''
              };
              
              // Add amount if available
              if (values[3]) {
                expense.amount = values[3];
              }
              
              parsedExpenses.push(expense);
            }
          } catch (lineError) {
            console.warn(`Error parsing line ${i}:`, lineError);
          }
        }
      }
      
      console.log('Parsed expenses:', parsedExpenses);
      setExpenses(parsedExpenses);
    } catch (err) {
      console.error('Error fetching expense data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expense data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchExpenseData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchExpenseData();
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchExpenseData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const openSheet = () => {
    window.open('https://docs.google.com/spreadsheets/d/1CzTl1xO9fIEaV0MePMBWnUYaj9rp1i85l7_DtA8SLnk/edit?gid=0#gid=0', '_blank');
  };

  const formatTransactionLink = (transaction: string) => {
    if (transaction.includes('solscan.io')) {
      return (
        <a 
          href={transaction} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          View Transaction
        </a>
      );
    }
    return <span className="text-sm">{transaction}</span>;
  };

  const getCategoryColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('operations')) return 'bg-red-100 text-red-800';
    if (lowerCategory.includes('marketing')) return 'bg-blue-100 text-blue-800';
    if (lowerCategory.includes('business')) return 'bg-green-100 text-green-800';
    if (lowerCategory.includes('funding')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

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
    );
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
    );
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
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4" />
              Open Sheet
            </button>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time expense tracking from Google Sheets. Total entries: {expenses.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm font-medium text-gray-700">Total Entries</div>
                <div className="text-2xl font-bold text-red-600">{expenses.length}</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-700">Categories</div>
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(expenses.map(e => e.category.split(' - ')[0])).size}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-gray-700">Transactions</div>
                <div className="text-2xl font-bold text-green-600">
                  {expenses.filter(e => e.transaction.includes('solscan.io')).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Transaction</TableHead>
                {expenses.some(e => e.amount) && <TableHead>Amount</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {expense.date}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatTransactionLink(expense.transaction)}
                    </TableCell>
                    {expenses.some(e => e.amount) && (
                      <TableCell>
                        {expense.amount && (
                          <span className="font-medium text-gray-900">{expense.amount}</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No expense data available. Click refresh to fetch latest data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-gray-500 border-t pt-4 mt-6">
          <p>Data is automatically synced from the Google Sheets document every 5 minutes.</p>
          <p className="mt-1">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseTracker;
