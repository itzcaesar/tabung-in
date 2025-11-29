import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Plus, Wallet, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { AccountsList } from './accounts-list';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

// E-Money providers with their colors and initials
const emoneyProviders: Record<string, { name: string; color: string; initials: string; textColor: string }> = {
  gopay: { name: 'GoPay', color: '#00AA13', initials: 'GP', textColor: '#FFFFFF' },
  ovo: { name: 'OVO', color: '#4C3494', initials: 'OVO', textColor: '#FFFFFF' },
  dana: { name: 'DANA', color: '#108EE9', initials: 'DA', textColor: '#FFFFFF' },
  shopeepay: { name: 'ShopeePay', color: '#EE4D2D', initials: 'SP', textColor: '#FFFFFF' },
  linkaja: { name: 'LinkAja', color: '#E31E25', initials: 'LA', textColor: '#FFFFFF' },
  isaku: { name: 'iSaku', color: '#FF6B00', initials: 'iS', textColor: '#FFFFFF' },
  sakuku: { name: 'Sakuku', color: '#0066B3', initials: 'SK', textColor: '#FFFFFF' },
  doku: { name: 'DOKU', color: '#E31E25', initials: 'DK', textColor: '#FFFFFF' },
  jenius: { name: 'Jenius', color: '#00A8E8', initials: 'J', textColor: '#FFFFFF' },
  blu: { name: 'blu by BCA', color: '#0066B3', initials: 'blu', textColor: '#FFFFFF' },
  jago: { name: 'Bank Jago', color: '#FFCC00', initials: 'JG', textColor: '#000000' },
  livin: { name: 'Livin\' Mandiri', color: '#003D79', initials: 'LV', textColor: '#FFFFFF' },
  octo: { name: 'OCTO Mobile', color: '#B01116', initials: 'OC', textColor: '#FFFFFF' },
};

// Bank providers with their colors and initials
const bankProviders: Record<string, { name: string; color: string; initials: string; textColor: string }> = {
  bca: { name: 'BCA', color: '#0066B3', initials: 'BCA', textColor: '#FFFFFF' },
  mandiri: { name: 'Mandiri', color: '#003D79', initials: 'MDR', textColor: '#FFFFFF' },
  bni: { name: 'BNI', color: '#F15A23', initials: 'BNI', textColor: '#FFFFFF' },
  bri: { name: 'BRI', color: '#0066B3', initials: 'BRI', textColor: '#FFFFFF' },
  cimb: { name: 'CIMB Niaga', color: '#B01116', initials: 'CIMB', textColor: '#FFFFFF' },
  danamon: { name: 'Danamon', color: '#003D79', initials: 'DN', textColor: '#FFFFFF' },
  permata: { name: 'PermataBank', color: '#006738', initials: 'PMT', textColor: '#FFFFFF' },
  ocbc: { name: 'OCBC NISP', color: '#DA291C', initials: 'OCBC', textColor: '#FFFFFF' },
  maybank: { name: 'Maybank', color: '#FFC72C', initials: 'MB', textColor: '#000000' },
  bsi: { name: 'BSI', color: '#00A651', initials: 'BSI', textColor: '#FFFFFF' },
  btn: { name: 'BTN', color: '#F7941D', initials: 'BTN', textColor: '#FFFFFF' },
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
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Virtual Dompet</h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua dompet digital dan rekening Anda
          </p>
        </div>
        <Link href="/dashboard/accounts/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Dompet
          </Button>
        </Link>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-to-br from-foreground to-foreground/80 text-background">
        <CardContent className="py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-background/20 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-background/70 text-sm">Total Saldo</p>
              <p className="text-3xl md:text-4xl font-bold">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-background/70">
            <TrendingUp className="h-4 w-4" />
            <span>{userAccounts.length} dompet aktif</span>
          </div>
        </CardContent>
      </Card>

      {userAccounts.length > 0 ? (
        <AccountsList 
          accounts={userAccounts} 
          emoneyProviders={emoneyProviders}
          bankProviders={bankProviders}
        />
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Belum ada dompet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Tambahkan dompet virtual pertama Anda untuk mulai melacak keuangan.
              </p>
              <Link href="/dashboard/accounts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Dompet Pertama
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
