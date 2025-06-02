import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';
import { ExpenseEntry } from './types';
import { formatCurrency, getCategoryColor, formatTransactionLink } from './utils';

interface ExpenseTableProps {
  expenses: ExpenseEntry[];
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses }) => {
  // Calculate running totals
  let cumulativeTotal = 0;
  const expensesWithTotals = expenses.map(expense => {
    if (expense.usdValueAtTime) {
      cumulativeTotal += expense.usdValueAtTime;
    }
    return {
      ...expense,
      cumulativeTotal
    };
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>SOL Amount</TableHead>
            <TableHead>SOL Price</TableHead>
            <TableHead>USD Value</TableHead>
            <TableHead className="text-right">Cumulative Total</TableHead>
            {expenses.some(e => e.amount) && <TableHead>Notes</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {expensesWithTotals.length > 0 ? (
            expensesWithTotals.map((expense, index) => {
              const transactionLinkData = formatTransactionLink(expense.transaction);
              
              return (
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
                    {transactionLinkData.isLink ? (
                      <a 
                        href={transactionLinkData.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {transactionLinkData.text}
                      </a>
                    ) : (
                      <span className="text-sm">{transactionLinkData.text}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {expense.solAmount ? `${expense.solAmount.toFixed(4)} SOL` : '-'}
                  </TableCell>
                  <TableCell>
                    {expense.solPriceAtTime ? formatCurrency(expense.solPriceAtTime) : '-'}
                  </TableCell>
                  <TableCell>
                    {expense.usdValueAtTime ? (
                      <span className="font-medium text-gray-900">
                        {formatCurrency(expense.usdValueAtTime)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(expense.cumulativeTotal)}
                  </TableCell>
                  {expenses.some(e => e.amount) && (
                    <TableCell>
                      {expense.amount && (
                        <span className="text-sm text-gray-600">{expense.amount}</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No expense data available. Click refresh to fetch latest data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpenseTable;
