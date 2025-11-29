import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { TransactionList } from '@/components/dashboard/transaction-list';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, Receipt, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, getMonthRange } from '@/lib/utils';

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { start } = getMonthRange();

  const [userTransactions, monthlyStats] = await Promise.all([
    db.query.transactions.findMany({
      where: eq(transactions.userId, session.user.id),
      with: { category: true, account: true },
      orderBy: [desc(transactions.date)],
    }),
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
          gte(transactions.date, start)
        )
      )
      .groupBy(transactions.type),
  ]);

  const formattedTransactions = userTransactions.map((t) => ({
    ...t,
    date: t.date,
  }));

  const pemasukan = monthlyStats.find(s => s.type === 'pemasukan');
  const pengeluaran = monthlyStats.find(s => s.type === 'pengeluaran');
  const totalTransactions = monthlyStats.reduce((sum, s) => sum + Number(s.count), 0);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transaksi</h1>
          <p className="text-muted-foreground mt-1">
            Lihat dan kelola semua transaksi Anda
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/receipts">
            <Button variant="secondary" className="w-full sm:w-auto">
              <ScanLine className="h-4 w-4 mr-2" />
              Scan Struk
            </Button>
          </Link>
          <Link href="/dashboard/transactions/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-foreground/20 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-foreground/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-muted-foreground text-sm">Pemasukan</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              +{formatCurrency(pemasukan?.total || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {pemasukan?.count || 0} transaksi bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-foreground/15 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-muted-foreground text-sm">Pengeluaran</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              -{formatCurrency(pengeluaran?.total || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {pengeluaran?.count || 0} transaksi bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-foreground/15 flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-muted-foreground text-sm">Selisih</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency((pemasukan?.total || 0) - (pengeluaran?.total || 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-foreground/15 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-muted-foreground text-sm">Total</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {totalTransactions}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Semua Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formattedTransactions.length > 0 ? (
            <TransactionList transactions={formattedTransactions} showAccount />
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Belum ada transaksi
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Mulai catat transaksi pertama Anda atau scan struk belanja
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/dashboard/receipts">
                  <Button variant="secondary">
                    <ScanLine className="h-4 w-4 mr-2" />
                    Scan Struk
                  </Button>
                </Link>
                <Link href="/dashboard/transactions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Manual
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
