import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions, categories } from '@/lib/db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Calendar, Target, PiggyBank, BarChart3, Wallet } from 'lucide-react';

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Optimize: Calculate date once and reuse
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
          eq(transactions.type, 'pengeluaran'),
          gte(transactions.date, thirtyDaysAgo)
        )
      )
      .groupBy(categories.name, categories.color)
      .orderBy(desc(sql`sum(${transactions.amount}::numeric)`)),
    db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, 'pengeluaran'),
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

  const income = monthlyData.find((d) => d.type === 'pemasukan')?.total || 0;
  const expenses = monthlyData.find((d) => d.type === 'pengeluaran')?.total || 0;
  const transactionCount = monthlyData.reduce((sum, d) => sum + Number(d.count), 0);
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const netIncome = income - expenses;
  const dailyAverage = expenses / 30;

  const categoryBreakdown = categoryData.map((c) => ({
    name: c.categoryName || 'Tanpa Kategori',
    value: c.total,
    color: c.categoryColor || '#71717a',
  }));

  // Optimize: Create a Map for faster daily stats lookup
  const dailyStatsMap = new Map<string, { income: number; expense: number }>();
  for (const stat of dailyStats) {
    if (!dailyStatsMap.has(stat.date)) {
      dailyStatsMap.set(stat.date, { income: 0, expense: 0 });
    }
    const day = dailyStatsMap.get(stat.date)!;
    if (stat.type === 'pemasukan') {
      day.income = stat.total;
    } else {
      day.expense = stat.total;
    }
  }

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = dailyStatsMap.get(dateStr) || { income: 0, expense: 0 };
    return {
      date: dateStr,
      income: dayData.income,
      expense: dayData.expense,
    };
  });

  const stats = [
    {
      label: 'Total Pemasukan',
      value: formatCurrency(income),
      icon: TrendingUp,
      color: 'bg-foreground/10 text-foreground',
      borderColor: 'border-foreground/20',
    },
    {
      label: 'Total Pengeluaran',
      value: formatCurrency(expenses),
      icon: TrendingDown,
      color: 'bg-foreground/10 text-foreground',
      borderColor: 'border-foreground/20',
    },
    {
      label: 'Total Transaksi',
      value: `${transactionCount} Transaksi`,
      icon: Calendar,
      color: 'bg-foreground/10 text-foreground',
      borderColor: 'border-foreground/20',
    },
    {
      label: 'Rasio Tabungan',
      value: `${savingsRate.toFixed(1)}%`,
      icon: Target,
      color: 'bg-foreground/10 text-foreground',
      borderColor: 'border-foreground/20',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Laporan Keuangan</h1>
        <p className="text-muted-foreground mt-1">
          Insight dan analitik 30 hari terakhir
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`overflow-hidden border ${stat.borderColor}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg font-bold text-foreground truncate">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ringkasan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-hidden bg-foreground/5 border-foreground/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-foreground/10">
                <PiggyBank className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Pendapatan Bersih</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {formatCurrency(netIncome)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {netIncome >= 0 ? 'Kamu menabung bulan ini! 🎉' : 'Pengeluaran melebihi pemasukan'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-foreground/5 border-foreground/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-foreground/10">
                <BarChart3 className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Rata-rata Harian</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {formatCurrency(dailyAverage)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pengeluaran per hari selama 30 hari
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-foreground/5 border-foreground/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-foreground/10">
                <Wallet className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Kategori Terbanyak</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground truncate">
              {categoryBreakdown[0]?.name || '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {categoryBreakdown[0] ? formatCurrency(categoryBreakdown[0].value) : 'Belum ada pengeluaran'}
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
                  className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-500/10 text-red-500 text-sm font-bold">
                      {index + 1}
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
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Belum ada pengeluaran tercatat</p>
              </div>
            )}
          </div>
        </BentoCard>

        <BentoCard title="Tips Keuangan" colSpan={2}>
          <div className="space-y-3">
            {savingsRate < 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">
                  ⚠️ Pengeluaran melebihi pemasukan. Coba kurangi pengeluaran di kategori {categoryBreakdown[0]?.name || 'terbesar'}.
                </p>
              </div>
            )}
            {savingsRate >= 0 && savingsRate < 20 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-400">
                  💡 Rasio tabunganmu {savingsRate.toFixed(1)}%. Target idealnya adalah 20% atau lebih.
                </p>
              </div>
            )}
            {savingsRate >= 20 && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400">
                  🎉 Bagus! Kamu berhasil menabung {savingsRate.toFixed(1)}% dari pemasukanmu bulan ini.
                </p>
              </div>
            )}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-400">
                📊 Pengeluaran harianmu rata-rata {formatCurrency(dailyAverage)}. Perhatikan pengeluaran di hari-hari tertentu.
              </p>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
