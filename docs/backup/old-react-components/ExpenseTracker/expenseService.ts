
import { ExpenseEntry } from './types';
import { parseDate, parseTransactionAmount, getHistoricalSolPrice } from './utils';

export const fetchExpenseData = async (): Promise<{ expenses: ExpenseEntry[], totalUsdValue: number }> => {
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1CzTl1xO9fIEaV0MePMBWnUYaj9rp1i85l7_DtA8SLnk/export?format=csv&gid=0';
  
  console.log('Fetching expense data from Google Sheets...');
  
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
    const base64Content = csvText.replace('data:text/csv;base64,', '');
    actualCsvText = atob(base64Content);
  }
  
  console.log('Decoded CSV text:', actualCsvText);
  
  const lines = actualCsvText.split(/\r?\n/);
  console.log('CSV lines:', lines);
  
  const parsedExpenses: ExpenseEntry[] = [];
  let calculatedTotal = 0;
  
  // Skip header row and empty rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith(',,')) {
      try {
        const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
        const values = line.split(csvRegex).map(v => v.replace(/^"|"$/g, '').trim());
        
        console.log(`Parsing line ${i}:`, line, 'Values:', values);
        
        if (values.length >= 3 && values[0] && values[1] && values[2]) {
          const parsedDate = parseDate(values[0]);
          const solAmount = parseTransactionAmount(values[2], values[1]);
          
          // Get historical SOL price for this date
          const solPriceAtTime = await getHistoricalSolPrice(parsedDate);
          const usdValueAtTime = solAmount * solPriceAtTime;
          
          const expense: ExpenseEntry = {
            date: parsedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            category: values[1] || '',
            transaction: values[2] || '',
            amount: values[3] || '',
            solAmount,
            solPriceAtTime,
            usdValueAtTime,
            transactionDate: parsedDate
          };
          
          calculatedTotal += usdValueAtTime;
          parsedExpenses.push(expense);
        }
      } catch (lineError) {
        console.warn(`Error parsing line ${i}:`, lineError);
      }
    }
  }
  
  console.log('Parsed expenses:', parsedExpenses);
  return { expenses: parsedExpenses, totalUsdValue: calculatedTotal };
};
