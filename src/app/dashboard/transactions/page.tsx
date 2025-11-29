import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, session.user.id),
    with: { category: true, account: true },
    orderBy: [desc(transactions.date)],
  });

  const formattedTransactions = userTransactions.map((t) => ({
    ...t,
    date: t.date,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Link href="/dashboard/transactions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList transactions={formattedTransactions} showAccount />
        </CardContent>
      </Card>
    </div>
  );
}
