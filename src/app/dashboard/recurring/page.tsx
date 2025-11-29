import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { recurringTransactions, accounts, categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RefreshCw, 
  Plus, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Pause,
  Play
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecurringTransactionsList } from './recurring-list';

async function getRecurringData(userId: string) {
  const allRecurring = await db.query.recurringTransactions.findMany({
    where: eq(recurringTransactions.userId, userId),
    with: {
      account: true,
      category: true,
    },
    orderBy: (rt, { asc }) => [asc(rt.nextDate)],
  });

  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
  });

  const userCategories = await db.query.categories.findMany({
    where: eq(categories.userId, userId),
  });

  const activeRecurring = allRecurring.filter(r => r.isActive);
  const inactiveRecurring = allRecurring.filter(r => !r.isActive);

  const monthlyIncome = activeRecurring
    .filter(r => r.type === 'pemasukan' && r.frequency === 'bulanan')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const monthlyExpense = activeRecurring
    .filter(r => r.type === 'pengeluaran' && r.frequency === 'bulanan')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  // Calculate estimated monthly (convert all frequencies to monthly)
  const estimatedMonthlyIncome = activeRecurring
    .filter(r => r.type === 'pemasukan')
    .reduce((sum, r) => {
      const amount = Number(r.amount);
      switch (r.frequency) {
        case 'harian': return sum + (amount * 30);
        case 'mingguan': return sum + (amount * 4);
        case 'bulanan': return sum + amount;
        case 'tahunan': return sum + (amount / 12);
        default: return sum;
      }
    }, 0);

  const estimatedMonthlyExpense = activeRecurring
    .filter(r => r.type === 'pengeluaran')
    .reduce((sum, r) => {
      const amount = Number(r.amount);
      switch (r.frequency) {
        case 'harian': return sum + (amount * 30);
        case 'mingguan': return sum + (amount * 4);
        case 'bulanan': return sum + amount;
        case 'tahunan': return sum + (amount / 12);
        default: return sum;
      }
    }, 0);

  return {
    allRecurring,
    activeRecurring,
    inactiveRecurring,
    monthlyIncome,
    monthlyExpense,
    estimatedMonthlyIncome,
    estimatedMonthlyExpense,
    accounts: userAccounts,
    categories: userCategories,
  };
}

function getFrequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'harian': return 'Harian';
    case 'mingguan': return 'Mingguan';
    case 'bulanan': return 'Bulanan';
    case 'tahunan': return 'Tahunan';
    default: return frequency;
  }
}

export default async function RecurringPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getRecurringData(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaksi Berulang</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola pemasukan dan pengeluaran otomatis
          </p>
        </div>
        <Link href="/dashboard/recurring/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Berulang
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Aktif</p>
                <p className="text-2xl font-bold">{data.activeRecurring.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pemasukan/Bulan</p>
                <p className="text-xl font-bold text-emerald-500">
                  {formatCurrency(data.estimatedMonthlyIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pengeluaran/Bulan</p>
                <p className="text-xl font-bold text-red-500">
                  {formatCurrency(data.estimatedMonthlyExpense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net/Bulan</p>
                <p className={`text-xl font-bold ${
                  data.estimatedMonthlyIncome - data.estimatedMonthlyExpense >= 0 
                    ? 'text-emerald-500' 
                    : 'text-red-500'
                }`}>
                  {formatCurrency(data.estimatedMonthlyIncome - data.estimatedMonthlyExpense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recurring List */}
      <RecurringTransactionsList 
        recurring={data.allRecurring}
        accounts={data.accounts}
        categories={data.categories}
      />
    </div>
  );
}
