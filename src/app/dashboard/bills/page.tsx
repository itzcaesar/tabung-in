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

async function getBillsData(userId: string) {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const allBills = await db.query.bills.findMany({
    where: eq(bills.userId, userId),
    with: { category: true },
    orderBy: [bills.dueDate],
  });

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
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
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
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500">
        <AlertTriangle className="h-3 w-3" />
        Terlambat {Math.abs(daysUntilDue)} hari
      </span>
    );
  }
  if (daysUntilDue <= 7) {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">
        <Clock className="h-3 w-3" />
        {daysUntilDue} hari lagi
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
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
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-primary" />
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
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
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
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Terlambat</p>
                <p className="text-2xl font-bold text-red-500">{data.overdueBills.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CalendarClock className="h-5 w-5 text-blue-500" />
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
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-500 flex items-center gap-2">
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
        
        {data.activeBills.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada tagihan</p>
              <Link href="/dashboard/bills/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Tagihan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.activeBills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(new Date(bill.dueDate));
              
              return (
                <Card key={bill.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="h-12 w-12 rounded-xl flex items-center justify-center text-lg"
                          style={{ 
                            backgroundColor: bill.category?.color ? `${bill.category.color}20` : '#6366f120' 
                          }}
                        >
                          {bill.category?.icon || '📄'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{bill.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{bill.category?.name || 'Lainnya'}</span>
                            <span>•</span>
                            <span className="capitalize">{bill.frequency}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <p className="text-lg font-bold">{formatCurrency(Number(bill.amount))}</p>
                        <div className="flex items-center justify-end gap-2">
                          {getStatusBadge(bill.status, daysUntilDue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bill.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Paid Bills */}
      {data.paidBills.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Tagihan Lunas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.paidBills.slice(0, 6).map((bill) => (
              <Card key={bill.id} className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium text-foreground">{bill.name}</p>
                        <p className="text-xs text-emerald-500">Lunas</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatCurrency(Number(bill.amount))}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
