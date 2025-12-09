'use client';

import { memo } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';

export interface Transaction {
  id: string;
  type: 'pemasukan' | 'pengeluaran' | 'transfer';
  amount: string | number;
  description: string | null;
  date: Date;
  category?: { name: string; icon: string | null; color: string | null } | null;
  account?: { name: string } | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  showAccount?: boolean;
}

// Optimize: Memoize component to prevent unnecessary re-renders
export const TransactionList = memo(function TransactionList({
  transactions,
  onTransactionClick,
  showAccount = false,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Belum ada transaksi</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Tambah transaksi pertama untuk memulai</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <button
          key={transaction.id}
          onClick={() => onTransactionClick?.(transaction)}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all duration-200"
        >
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/10'
            )}
          >
            {transaction.type === 'pemasukan' && (
              <ArrowDownLeft className="h-5 w-5 text-foreground" />
            )}
            {transaction.type === 'pengeluaran' && (
              <ArrowUpRight className="h-5 w-5 text-foreground" />
            )}
            {transaction.type === 'transfer' && (
              <ArrowLeftRight className="h-5 w-5 text-foreground" />
            )}
          </div>

          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">
              {transaction.description || transaction.category?.name || 'Tanpa judul'}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.category?.name}
              {showAccount && transaction.account && (
                <> · {transaction.account.name}</>
              )}
              {' · '}
              {formatDate(transaction.date)}
            </p>
          </div>

          <p
            className={cn(
              'text-lg font-semibold text-foreground'
            )}
          >
            {transaction.type === 'pemasukan' ? '+' : transaction.type === 'pengeluaran' ? '-' : ''}
            {formatCurrency(Number(transaction.amount))}
          </p>
        </button>
      ))}
    </div>
  );
});
