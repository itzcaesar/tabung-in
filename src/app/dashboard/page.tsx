import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions, accounts, budgets, categories, bills, goals } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { FinancialNews } from '@/components/dashboard/financial-news';
import { BillsWidget } from '@/components/dashboard/bills-widget';
import { GoalsWidget } from '@/components/dashboard/goals-widget';
import { NewsTicker } from '@/components/dashboard/news-ticker';
import { DashboardGridClient } from '@/components/dashboard/dashboard-grid-client';
import { InsightsWidget } from '@/components/dashboard/insights-widget';
import { getUserPreferences } from '@/lib/actions/preferences';
import { generateFinancialInsights } from '@/lib/services/insights';
import { defaultWidgetConfig } from '@/lib/utils/widget-config';
import { formatCurrency, getMonthRange } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ScanLine,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Brand providers info
const brandProviders: Record<string, { initials: string; textColor: string }> = {
  // E-Money
  gopay: { initials: 'GP', textColor: '#FFFFFF' },
  ovo: { initials: 'OVO', textColor: '#FFFFFF' },
  dana: { initials: 'DA', textColor: '#FFFFFF' },
  shopeepay: { initials: 'SP', textColor: '#FFFFFF' },
  linkaja: { initials: 'LA', textColor: '#FFFFFF' },
  isaku: { initials: 'iS', textColor: '#FFFFFF' },
  sakuku: { initials: 'SK', textColor: '#FFFFFF' },
  doku: { initials: 'DK', textColor: '#FFFFFF' },
  jenius: { initials: 'J', textColor: '#FFFFFF' },
  blu: { initials: 'blu', textColor: '#FFFFFF' },
  jago: { initials: 'JG', textColor: '#000000' },
  livin: { initials: 'LV', textColor: '#FFFFFF' },
  octo: { initials: 'OC', textColor: '#FFFFFF' },
  // Banks
  bca: { initials: 'BCA', textColor: '#FFFFFF' },
  mandiri: { initials: 'MDR', textColor: '#FFFFFF' },
  bni: { initials: 'BNI', textColor: '#FFFFFF' },
  bri: { initials: 'BRI', textColor: '#FFFFFF' },
  cimb: { initials: 'CIMB', textColor: '#FFFFFF' },
  danamon: { initials: 'DN', textColor: '#FFFFFF' },
  permata: { initials: 'PMT', textColor: '#FFFFFF' },
  ocbc: { initials: 'OCBC', textColor: '#FFFFFF' },
  maybank: { initials: 'MB', textColor: '#000000' },
  bsi: { initials: 'BSI', textColor: '#FFFFFF' },
  btn: { initials: 'BTN', textColor: '#FFFFFF' },
};

async function getDashboardData(userId: string) {
  const { start } = getMonthRange();

  // Get bills due in next 30 days
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [
    userAccounts,
    recentTransactions,
    userBudgets,
    monthlyStats,
    categoryStats,
    dailyStats,
    userBills,
    userGoals,
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
          eq(transactions.type, 'pengeluaran'),
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
    db.query.bills.findMany({
      where: and(
        eq(bills.userId, userId),
        lte(bills.dueDate, thirtyDaysFromNow)
      ),
      with: { category: true },
      orderBy: [bills.dueDate],
    }),
    db.query.goals.findMany({
      where: and(
        eq(goals.userId, userId),
        eq(goals.status, 'aktif')
      ),
      orderBy: [desc(goals.priority), desc(goals.createdAt)],
    }),
  ]);

  const totalBalance = userAccounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );
  const monthlyIncome =
    monthlyStats.find((s) => s.type === 'pemasukan')?.total || 0;
  const monthlyExpenses =
    monthlyStats.find((s) => s.type === 'pengeluaran')?.total || 0;

  // Calculate spending per category for budgets
  const categorySpending = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`sum(${transactions.amount}::numeric)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'pengeluaran'),
        gte(transactions.date, start)
      )
    )
    .groupBy(transactions.categoryId);

  const spendingMap = new Map(
    categorySpending.map((s) => [s.categoryId, s.total])
  );

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = dailyStats.filter((d) => d.date === dateStr);
    return {
      date: dateStr,
      income: dayData.find((d) => d.type === 'pemasukan')?.total || 0,
      expense: dayData.find((d) => d.type === 'pengeluaran')?.total || 0,
    };
  });

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    accounts: userAccounts,
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      date: t.date,
    })),
    budgets: userBudgets.map((b) => ({
      ...b,
      spent: b.categoryId ? spendingMap.get(b.categoryId) || 0 : 0,
    })),
    categoryBreakdown: categoryStats.map((c) => ({
      name: c.categoryName || 'Tanpa Kategori',
      value: c.total,
      color: c.categoryColor || '#71717a',
    })),
    chartData,
    bills: userBills.map((b) => ({
      ...b,
      dueDate: b.dueDate,
    })),
    goals: userGoals,
  };
}

// Helper function to get brand initials
function getBrandInfo(provider?: string | null, accountName?: string) {
  if (provider && brandProviders[provider]) {
    return brandProviders[provider];
  }
  return { 
    initials: accountName?.substring(0, 2).toUpperCase() || '??', 
    textColor: '#FFFFFF' 
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [data, userPrefs, insights] = await Promise.all([
    getDashboardData(session.user.id),
    getUserPreferences(),
    generateFinancialInsights(session.user.id),
  ]);
  
  const widgets = userPrefs?.dashboardWidgets || defaultWidgetConfig;
  const savings = data.monthlyIncome - data.monthlyExpenses;

  // Balance Card Widget
  const balanceCard = (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden h-full">
      <CardContent className="pt-6 h-full flex flex-col justify-center">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
            <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {formatCurrency(data.totalBalance)}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4 text-foreground" />
                <span className="text-sm text-foreground font-medium">
                  +{formatCurrency(data.monthlyIncome)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">
                  -{formatCurrency(data.monthlyExpenses)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/transactions/new">
              <Button size="sm" className="shadow-md">
                <Plus className="h-4 w-4 mr-1.5" />
                Transaksi
              </Button>
            </Link>
            <Link href="/dashboard/receipts">
              <Button size="sm" variant="outline">
                <ScanLine className="h-4 w-4 mr-1.5" />
                Scan
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Stats Card Widget
  const statsCard = (
    <div className="grid grid-cols-3 gap-3 h-full">
      <Card className="hover:border-foreground/20 transition-colors group h-full">
        <CardContent className="p-4 h-full flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Pemasukan</p>
          <p className="text-lg font-bold text-foreground">
            +{formatCurrency(data.monthlyIncome)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:border-foreground/20 transition-colors group h-full">
        <CardContent className="p-4 h-full flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Pengeluaran</p>
          <p className="text-lg font-bold text-foreground">
            -{formatCurrency(data.monthlyExpenses)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:border-foreground/20 transition-colors group h-full">
        <CardContent className="p-4 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <PiggyBank className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Tabungan</p>
              <p className="text-lg font-bold text-foreground">
                {savings >= 0 ? '+' : ''}{formatCurrency(savings)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Accounts Card Widget
  const accountsCard = (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4 flex-shrink-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          Dompet
        </CardTitle>
        <Link href="/dashboard/accounts">
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            Lihat <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        {data.accounts.length > 0 ? (
          <div className="space-y-2">
            {data.accounts.slice(0, 4).map((account) => {
              const brandInfo = getBrandInfo(account.provider, account.name);
              const color = account.color || '#71717a';
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{ 
                        backgroundColor: color,
                        color: brandInfo.textColor
                      }}
                    >
                      {brandInfo.initials}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{account.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {account.type === 'emoney' ? 'E-Money' : account.type === 'rekening' ? 'Bank' : 'Tunai'}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{formatCurrency(Number(account.balance))}</p>
                </div>
              );
            })}
            {data.accounts.length > 4 && (
              <Link href="/dashboard/accounts">
                <p className="text-center text-xs text-muted-foreground hover:text-foreground py-2 transition-colors">
                  +{data.accounts.length - 4} dompet lainnya
                </p>
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Wallet className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Belum ada dompet</p>
            <Link href="/dashboard/accounts/new">
              <Button variant="secondary" size="sm">
                <Plus className="h-3 w-3 mr-1.5" />
                Tambah Dompet
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Chart Card Widget
  const chartCard = (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-4 flex-shrink-0">
        <CardTitle className="text-base font-semibold">Aktivitas 7 Hari</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <ExpenseChart data={data.chartData} />
      </CardContent>
    </Card>
  );

  // Budgets Card Widget
  const budgetsCard = data.budgets.length > 0 ? (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4 flex-shrink-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
          Anggaran
        </CardTitle>
        <Link href="/dashboard/budgets">
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            Kelola <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.budgets.slice(0, 4).map((budget) => {
            const percentage = budget.spent / Number(budget.amount) * 100;
            const isOverBudget = percentage > 100;
            const isWarning = percentage > 80;
            return (
              <div
                key={budget.id}
                className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm truncate pr-2">{budget.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isOverBudget
                        ? 'bg-red-500/15 text-red-500'
                        : isWarning
                        ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-500'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500'
                    }`}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className="h-1.5"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatCurrency(budget.spent)}
                  </span>
                  <span className="text-foreground">
                    {formatCurrency(Number(budget.amount))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="border-dashed h-full flex flex-col justify-center">
      <CardContent className="py-8">
        <div className="text-center">
          <PiggyBank className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="font-medium text-foreground mb-1">Belum ada anggaran</p>
          <p className="text-sm text-muted-foreground mb-4">Buat anggaran untuk kontrol pengeluaranmu</p>
          <Link href="/dashboard/budgets/new">
            <Button variant="secondary" size="sm">
              <Plus className="h-3 w-3 mr-1.5" />
              Buat Anggaran
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  // Bills Card Widget
  const billsCard = <BillsWidget bills={data.bills} />;

  // Goals Card Widget
  const goalsCard = <GoalsWidget goals={data.goals} />;

  // News Card Widget
  const newsCard = <FinancialNews />;

  // Insights Card Widget
  const insightsCard = <InsightsWidget insights={insights} />;

  // Transactions Card Widget
  const transactionsCard = (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4 flex-shrink-0">
        <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
        <Link href="/dashboard/transactions">
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            Semua <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        <TransactionList transactions={data.recentTransactions} showAccount />
      </CardContent>
    </Card>
  );

  // Categories Card Widget
  const categoriesCard = (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-4 flex-shrink-0">
        <CardTitle className="text-base font-semibold">Pengeluaran per Kategori</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        {data.categoryBreakdown.length > 0 ? (
          <CategoryBreakdown data={data.categoryBreakdown} />
        ) : (
          <div className="text-center py-6">
            <div className="h-10 w-10 rounded-full bg-muted mx-auto flex items-center justify-center mb-2">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Belum ada data pengeluaran</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Halo, {session.user.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Kelola keuanganmu dengan mudah
          </p>
        </div>
      </div>

      {/* News Ticker */}
      <NewsTicker />

      {/* Draggable Grid Dashboard */}
      <DashboardGridClient
        widgets={widgets}
        balanceCard={balanceCard}
        statsCard={statsCard}
        accountsCard={accountsCard}
        chartCard={chartCard}
        budgetsCard={budgetsCard}
        billsCard={billsCard}
        goalsCard={goalsCard}
        newsCard={newsCard}
        transactionsCard={transactionsCard}
        categoriesCard={categoriesCard}
        insightsCard={insightsCard}
      />
    </div>
  );
}
