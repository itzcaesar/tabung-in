import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { bills, categories } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Plus, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BillsList } from './bills-list';

async function getBillsData(userId: string) {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [allBills, allCategories] = await Promise.all([
    db.query.bills.findMany({
      where: eq(bills.userId, userId),
      with: { category: true },
      orderBy: [bills.dueDate],
    }),
    db.query.categories.findMany({
      where: eq(categories.userId, userId),
    }),
  ]);

  const activeBills = allBills.filter(b => b.status === 'aktif');
  const upcomingBills = activeBills.filter(b => {
    const dueDate = new Date(b.dueDate);
    return dueDate >= now && dueDate <= thirtyDaysFromNow;
  });
  const overdueBills = activeBills.filter(b => {
    const dueDate = new Date(b.dueDate);
    return dueDate < now;
  });
  const paidBills = allBills.filter(b => b.status === 'lunas');

  const totalMonthly = activeBills
    .filter(b => b.frequency === 'bulanan')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  return {
    allBills,
    activeBills,
    upcomingBills,
    overdueBills,
    paidBills,
    totalMonthly,
    categories: allCategories,
  };
}

function getDaysUntilDue(dueDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusBadge(status: string, daysUntilDue: number) {
  if (status === 'lunas') {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-foreground/10 text-foreground">
        <CheckCircle2 className="h-3 w-3" />
        Lunas
      </span>
    );
  }
  if (status === 'nonaktif') {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
        <XCircle className="h-3 w-3" />
        Nonaktif
      </span>
    );
  }
  if (daysUntilDue < 0) {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-foreground/10 text-foreground">
        <AlertTriangle className="h-3 w-3" />
        Terlambat {Math.abs(daysUntilDue)} hari
      </span>
    );
  }
  if (daysUntilDue <= 7) {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-foreground/10 text-foreground">
        <Clock className="h-3 w-3" />
        {daysUntilDue} hari lagi
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
      <Clock className="h-3 w-3" />
      {daysUntilDue} hari lagi
    </span>
  );
}

export default async function BillsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getBillsData(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tagihan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola dan pantau tagihan bulananmu
          </p>
        </div>
        <Link href="/dashboard/bills/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tagihan
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tagihan</p>
                <p className="text-2xl font-bold">{data.activeBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Akan Jatuh Tempo</p>
                <p className="text-2xl font-bold">{data.upcomingBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terlambat</p>
                <p className="text-2xl font-bold">{data.overdueBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total/Bulan</p>
                <p className="text-xl font-bold">{formatCurrency(data.totalMonthly)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Bills Alert */}
      {data.overdueBills.length > 0 && (
        <Card className="border-foreground/30 bg-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Tagihan Terlambat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.overdueBills.map((bill) => {
                const daysUntilDue = getDaysUntilDue(new Date(bill.dueDate));
                return (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-background rounded-xl">
                    <div>
                      <p className="font-medium text-foreground">{bill.name}</p>
                      <p className="text-xs text-red-500">
                        Jatuh tempo: {new Date(bill.dueDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500">{formatCurrency(Number(bill.amount))}</p>
                      {getStatusBadge(bill.status, daysUntilDue)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bills List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Semua Tagihan</h2>
        <BillsList bills={data.allBills} categories={data.categories} />
      </div>
    </div>
  );
}
