import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Plus, CreditCard, Wallet, Building2, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const accountTypeIcons: Record<string, React.ReactNode> = {
  checking: <CreditCard className="h-6 w-6" />,
  savings: <PiggyBank className="h-6 w-6" />,
  cash: <Wallet className="h-6 w-6" />,
  credit: <CreditCard className="h-6 w-6" />,
  investment: <Building2 className="h-6 w-6" />,
};

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userAccounts = await db.query.accounts.findMany({
    where: eq(accounts.userId, session.user.id),
  });

  const totalBalance = userAccounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your bank accounts and wallets
          </p>
        </div>
        <Link href="/dashboard/accounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </Link>
      </div>

      <Card variant="gradient">
        <CardContent className="py-8">
          <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
          <p className="text-4xl font-bold text-foreground">
            {formatCurrency(totalBalance)}
          </p>
        </CardContent>
      </Card>

      {userAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userAccounts.map((account) => (
            <Card key={account.id} className="hover:border-foreground/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center',
                      'bg-muted'
                    )}
                    style={{
                      backgroundColor: account.color
                        ? `${account.color}20`
                        : undefined,
                    }}
                  >
                    {accountTypeIcons[account.type] || (
                      <Wallet className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded-lg',
                      account.isActive
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {account.name}
                </h3>
                <p className="text-muted-foreground text-sm capitalize mb-4">
                  {account.type}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(Number(account.balance))}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No accounts yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Add your bank accounts, credit cards, and wallets to start
                tracking your finances.
              </p>
              <Link href="/dashboard/accounts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
