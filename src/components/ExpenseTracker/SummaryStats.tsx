
import React from 'react';
import { TrendingDown, Receipt, ExternalLink, DollarSign } from 'lucide-react';
import { ExpenseEntry } from './types';
import { formatCurrency } from './utils';

interface SummaryStatsProps {
  expenses: ExpenseEntry[];
  totalUsdValue: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ expenses, totalUsdValue }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-yellow-600" />
          <div>
            <div className="text-sm font-medium text-gray-700">Total Value</div>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalUsdValue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
