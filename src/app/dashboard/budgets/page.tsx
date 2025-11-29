import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { budgets, transactions } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { BudgetCard } from '@/components/dashboard/budget-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, PiggyBank, Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { getMonthRange, formatCurrency } from '@/lib/utils';

export default async function BudgetsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { start } = getMonthRange();

  const userBudgets = await db.query.budgets.findMany({
    where: eq(budgets.userId, session.user.id),
    with: { category: true },
  });

  const categorySpending = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`sum(${transactions.amount}::numeric)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user.id),
        eq(transactions.type, 'pengeluaran'),
        gte(transactions.date, start)
      )
    )
    .groupBy(transactions.categoryId);

  const spendingMap = new Map(
    categorySpending.map((s) => [s.categoryId, s.total])
  );

  const budgetsWithSpending = userBudgets.map((budget) => ({
    ...budget,
    spent: budget.categoryId ? spendingMap.get(budget.categoryId) || 0 : 0,
  }));

  // Calculate stats
  const totalBudget = budgetsWithSpending.reduce((acc, b) => acc + Number(b.amount), 0);
  const totalSpent = budgetsWithSpending.reduce((acc, b) => acc + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const budgetsOverLimit = budgetsWithSpending.filter(b => b.spent > Number(b.amount)).length;
  const budgetsNearLimit = budgetsWithSpending.filter(b => {
    const budgetAmount = Number(b.amount) || 1; // Prevent division by zero
    const percentage = (b.spent / budgetAmount) * 100;
    return percentage >= 80 && percentage < 100;
  }).length;

  const stats = [
    {
      label: 'Total Anggaran',
      value: formatCurrency(totalBudget),
      icon: Target,
      color: 'bg-foreground/10 text-foreground',
    },
    {
      label: 'Total Terpakai',
      value: formatCurrency(totalSpent),
      icon: TrendingDown,
      color: 'bg-foreground/10 text-foreground',
    },
    {
      label: 'Sisa Anggaran',
      value: formatCurrency(remaining),
      icon: TrendingUp,
      color: 'bg-foreground/10 text-foreground',
    },
    {
      label: 'Perlu Perhatian',
      value: `${budgetsNearLimit + budgetsOverLimit} Anggaran`,
      icon: AlertTriangle,
      color: 'bg-foreground/10 text-foreground',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Anggaran</h1>
          <p className="text-muted-foreground mt-1">
            Tetapkan batas pengeluaran dan pantau kemajuan Anda
          </p>
        </div>
        <Link href="/dashboard/budgets/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Buat Anggaran
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {budgetsWithSpending.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground truncate">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {budgetsWithSpending.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-muted-foreground" />
              Daftar Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetsWithSpending.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  name={budget.name}
                  spent={budget.spent}
                  limit={Number(budget.amount)}
                  category={budget.category?.name}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <PiggyBank className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Belum ada anggaran
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Buat anggaran pertama Anda untuk mulai melacak batas pengeluaran
                per kategori dan mengontrol keuangan dengan lebih baik.
              </p>
              <Link href="/dashboard/budgets/new">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Anggaran Pertama
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
