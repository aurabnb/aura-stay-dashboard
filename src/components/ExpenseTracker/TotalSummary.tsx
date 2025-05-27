
import React from 'react';
import { DollarSign } from 'lucide-react';
import { ExpenseEntry } from './types';
import { formatCurrency } from './utils';

interface TotalSummaryProps {
  expenses: ExpenseEntry[];
  totalUsdValue: number;
}

const TotalSummary: React.FC<TotalSummaryProps> = ({ expenses, totalUsdValue }) => {
  if (expenses.length === 0) return null;

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-2 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total Expense Value</h3>
            <p className="text-sm text-gray-600">Calculated using historical SOL prices at transaction time</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(totalUsdValue)}
          </div>
          <div className="text-sm text-gray-500">
            {expenses.reduce((sum, expense) => sum + (expense.solAmount || 0), 0).toFixed(4)} SOL total
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalSummary;
