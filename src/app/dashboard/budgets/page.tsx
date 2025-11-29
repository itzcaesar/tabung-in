import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { budgets, transactions } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { BudgetCard } from '@/components/dashboard/budget-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { getMonthRange } from '@/lib/utils';

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
        eq(transactions.type, 'expense'),
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Set spending limits and track your progress
          </p>
        </div>
        <Link href="/dashboard/budgets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </Link>
      </div>

      {budgetsWithSpending.length > 0 ? (
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
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <PiggyBank className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No budgets yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create your first budget to start tracking your spending limits
                by category.
              </p>
              <Link href="/dashboard/budgets/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Budget
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
