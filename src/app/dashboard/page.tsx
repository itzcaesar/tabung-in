import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions, accounts, budgets, categories } from '@/lib/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { BudgetCard } from '@/components/dashboard/budget-card';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { getMonthRange } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getDashboardData(userId: string) {
  const { start } = getMonthRange();

  const [
    userAccounts,
    recentTransactions,
    userBudgets,
    monthlyStats,
    categoryStats,
    dailyStats,
  ] = await Promise.all([
    db.query.accounts.findMany({
      where: eq(accounts.userId, userId),
    }),
    db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      with: { category: true, account: true },
      orderBy: [desc(transactions.date)],
      limit: 5,
    }),
    db.query.budgets.findMany({
      where: and(eq(budgets.userId, userId), eq(budgets.isActive, true)),
      with: { category: true },
    }),
    db
      .select({
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, start)
        )
      )
      .groupBy(transactions.type),
    db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        total: sql<number>`sum(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, start)
        )
      )
      .groupBy(transactions.categoryId, categories.name, categories.color),
    db
      .select({
        date: sql<string>`date(${transactions.date})`,
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`date(${transactions.date})`, transactions.type),
  ]);

  const totalBalance = userAccounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );
  const monthlyIncome =
    monthlyStats.find((s) => s.type === 'income')?.total || 0;
  const monthlyExpenses =
    monthlyStats.find((s) => s.type === 'expense')?.total || 0;

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = dailyStats.filter((d) => d.date === dateStr);
    return {
      date: dateStr,
      income: dayData.find((d) => d.type === 'income')?.total || 0,
      expense: dayData.find((d) => d.type === 'expense')?.total || 0,
    };
  });

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      date: t.date,
    })),
    budgets: userBudgets,
    categoryBreakdown: categoryStats.map((c) => ({
      name: c.categoryName || 'Tanpa Kategori',
      value: c.total,
      color: c.categoryColor || '#71717a',
    })),
    chartData,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Beranda</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali{session.user.name ? `, ${session.user.name}` : ''}!
          </p>
        </div>
        <Link href="/dashboard/transactions/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Total Saldo"
          value={data.totalBalance}
          icon={<Wallet className="h-5 w-5 md:h-6 md:w-6 text-foreground" />}
        />
        <StatsCard
          title="Pemasukan"
          value={data.monthlyIncome}
          icon={<TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />}
        />
        <StatsCard
          title="Pengeluaran"
          value={data.monthlyExpenses}
          icon={<TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-red-500" />}
        />
        <StatsCard
          title="Tabungan"
          value={data.monthlyIncome - data.monthlyExpenses}
          icon={<ArrowLeftRight className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />}
        />
      </div>

      <BentoGrid>
        <BentoCard title="Ringkasan Pengeluaran" colSpan={2} rowSpan={2}>
          <ExpenseChart data={data.chartData} />
        </BentoCard>

        <BentoCard title="Rincian Kategori" colSpan={2}>
          <CategoryBreakdown data={data.categoryBreakdown} />
        </BentoCard>

        <BentoCard title="Transaksi Terbaru" colSpan={2} rowSpan={2}>
          <TransactionList transactions={data.recentTransactions} showAccount />
          <Link href="/dashboard/transactions" className="block mt-4">
            <Button variant="secondary" className="w-full">
              Lihat Semua Transaksi
            </Button>
          </Link>
        </BentoCard>

        <BentoCard title="Anggaran Aktif" colSpan={2}>
          <div className="space-y-3">
            {data.budgets.length > 0 ? (
              data.budgets.slice(0, 3).map((budget) => (
                <BudgetCard
                  key={budget.id}
                  name={budget.name}
                  spent={0}
                  limit={Number(budget.amount)}
                  category={budget.category?.name}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Belum ada anggaran</p>
                <Link href="/dashboard/budgets/new">
                  <Button variant="secondary" size="sm">
                    Buat Anggaran
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
