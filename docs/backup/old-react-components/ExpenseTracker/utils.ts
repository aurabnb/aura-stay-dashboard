
import { ExpenseEntry } from './types';

export const getHistoricalSolPrice = async (date: Date): Promise<number> => {
  // For now, using approximate historical prices based on date
  // In production, you'd use a service like CoinGecko's historical API
  const dateStr = date.toISOString().split('T')[0];
  
  // Mock historical prices - replace with actual API call
  const historicalPrices: { [key: string]: number } = {
    '2024-05-23': 175.50, // Friday, May 23rd, 2024
    '2024-05-22': 174.20,
    '2024-05-21': 173.80,
  };
  
  return historicalPrices[dateStr] || 180; // Default to current approximate price
};

export const parseTransactionAmount = (transaction: string, description: string): number => {
  // Try to extract SOL amount from transaction description or amount field
  const solMatch = description.match(/(\d+\.?\d*)\s*SOL/i) || description.match(/(\d+\.?\d*)/);
  if (solMatch) {
    return parseFloat(solMatch[1]);
  }
  return 0;
};

export const parseDate = (dateStr: string): Date => {
  // Handle various date formats
  if (dateStr.toLowerCase().includes('friday') && dateStr.toLowerCase().includes('may 23')) {
    return new Date('2024-05-23');
  }
  
  // Try to parse other date formats
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Default to current date if parsing fails
  return new Date();
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const getCategoryColor = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('operations')) return 'bg-red-100 text-red-800';
  if (lowerCategory.includes('marketing')) return 'bg-blue-100 text-blue-800';
  if (lowerCategory.includes('business')) return 'bg-green-100 text-green-800';
  if (lowerCategory.includes('funding')) return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-800';
};

export const formatTransactionLink = (transaction: string) => {
  if (transaction.includes('solscan.io')) {
    return {
      isLink: true,
      href: transaction,
      text: 'View Transaction'
    };
  }
  return {
    isLink: false,
    text: transaction
  };
};
