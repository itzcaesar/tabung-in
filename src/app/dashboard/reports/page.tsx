import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [monthlyData, categoryData, topExpenses, dailyStats] = await Promise.all([
    db
      .select({
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount}::numeric)`,
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.user.id),
          gte(transactions.date, thirtyDaysAgo)
        )
      )
      .groupBy(transactions.type),
    db
      .select({
        categoryName: categories.name,
        categoryColor: categories.color,
        total: sql<number>`sum(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, session.user.id),
          eq(transactions.type, 'expense'),
          gte(transactions.date, thirtyDaysAgo)
        )
      )
      .groupBy(categories.name, categories.color)
      .orderBy(desc(sql`sum(${transactions.amount}::numeric)`)),
    db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, 'expense'),
        gte(transactions.date, thirtyDaysAgo)
      ),
      with: { category: true },
      orderBy: [desc(transactions.amount)],
      limit: 5,
    }),
    db
      .select({
        date: sql<string>`date(${transactions.date})`,
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.user.id),
          gte(transactions.date, thirtyDaysAgo)
        )
      )
      .groupBy(sql`date(${transactions.date})`, transactions.type),
  ]);

  const income = monthlyData.find((d) => d.type === 'income')?.total || 0;
  const expenses = monthlyData.find((d) => d.type === 'expense')?.total || 0;
  const transactionCount = monthlyData.reduce((sum, d) => sum + Number(d.count), 0);
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  const categoryBreakdown = categoryData.map((c) => ({
    name: c.categoryName || 'Tanpa Kategori',
    value: c.total,
    color: c.categoryColor || '#71717a',
  }));

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = dailyStats.filter((d) => d.date === dateStr);
    return {
      date: dateStr,
      income: dayData.find((d) => d.type === 'income')?.total || 0,
      expense: dayData.find((d) => d.type === 'expense')?.total || 0,
    };
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Laporan Keuangan</h1>
        <p className="text-muted-foreground mt-1">
          Insight dan analitik 30 hari terakhir
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <span className="text-muted-foreground text-sm">Pemasukan</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {formatCurrency(income)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-muted-foreground text-sm">Pengeluaran</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {formatCurrency(expenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-muted-foreground text-sm">Transaksi</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">{transactionCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <Target className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-muted-foreground text-sm">Rasio Tabungan</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {savingsRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <BentoGrid>
        <BentoCard title="Pemasukan vs Pengeluaran" colSpan={3} rowSpan={2}>
          <ExpenseChart data={chartData} />
        </BentoCard>

        <BentoCard title="Pengeluaran per Kategori" colSpan={1} rowSpan={2}>
          <CategoryBreakdown data={categoryBreakdown} />
        </BentoCard>

        <BentoCard title="Pengeluaran Terbesar" colSpan={2}>
          <div className="space-y-3">
            {topExpenses.length > 0 ? (
              topExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-5">
                      {index + 1}.
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        {expense.description || 'Tanpa judul'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category?.name || 'Tanpa Kategori'}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-500">
                    -{formatCurrency(Number(expense.amount))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Belum ada pengeluaran tercatat
              </p>
            )}
          </div>
        </BentoCard>

        <BentoCard title="Ringkasan Bulanan" colSpan={2}>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-emerald-500 text-sm mb-1">Pendapatan Bersih</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {formatCurrency(income - expenses)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted border border-border">
              <p className="text-muted-foreground text-sm mb-1">Rata-rata Harian</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {formatCurrency(expenses / 30)}
              </p>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
