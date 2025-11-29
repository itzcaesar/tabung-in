import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Plus, CreditCard, Wallet, Banknote, Smartphone, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

function getProviderInfo(type: string, provider?: string | null) {
  if (type === 'emoney' && provider && emoneyProviders[provider]) {
    return emoneyProviders[provider];
  }
  if (type === 'rekening' && provider && bankProviders[provider]) {
    return bankProviders[provider];
  }
  return null;
}

function getAccountIcon(type: string, color: string) {
  const style = { color };
  switch (type) {
    case 'rekening':
      return <Banknote className="h-6 w-6" style={style} />;
    case 'emoney':
      return <Smartphone className="h-6 w-6" style={style} />;
    case 'tunai':
      return <Wallet className="h-6 w-6" style={style} />;
    default:
      return <CreditCard className="h-6 w-6" style={style} />;
  }
}

function getTypeLabel(type: string, provider?: string | null) {
  if (type === 'emoney' && provider && emoneyProviders[provider]) {
    return emoneyProviders[provider].name;
  }
  if (type === 'rekening' && provider && bankProviders[provider]) {
    return bankProviders[provider].name;
  }
  switch (type) {
    case 'rekening':
      return 'Rekening Bank';
    case 'emoney':
      return 'E-Money';
    case 'tunai':
      return 'Uang Tunai';
    default:
      return type;
  }
}

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

  // Group accounts by type
  const rekeningAccounts = userAccounts.filter(a => a.type === 'rekening');
  const emoneyAccounts = userAccounts.filter(a => a.type === 'emoney');
  const tunaiAccounts = userAccounts.filter(a => a.type === 'tunai');

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
        <div className="space-y-6">
          {/* Rekening Bank */}
          {rekeningAccounts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-muted-foreground" />
                Rekening Bank
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rekeningAccounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </div>
          )}

          {/* E-Money */}
          {emoneyAccounts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                E-Money
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emoneyAccounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </div>
          )}

          {/* Uang Tunai */}
          {tunaiAccounts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                Uang Tunai
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tunaiAccounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </div>
          )}
        </div>
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

function AccountCard({ account }: { account: typeof accounts.$inferSelect }) {
  const providerInfo = getProviderInfo(account.type, account.provider);
  const color = account.color || providerInfo?.color || '#71717a';
  const textColor = providerInfo?.textColor || '#FFFFFF';
  const initials = providerInfo?.initials || account.name.substring(0, 2).toUpperCase();
  
  return (
    <Card className="hover:border-foreground/20 transition-all hover:shadow-lg group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          {/* Brand Logo/Initials */}
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 font-bold text-sm shadow-md"
            style={{ 
              backgroundColor: color,
              color: textColor
            }}
          >
            {initials}
          </div>
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              account.isActive
                ? 'bg-emerald-500/20 text-emerald-500'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {account.isActive ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {account.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          {getTypeLabel(account.type, account.provider)}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {formatCurrency(Number(account.balance))}
        </p>
      </CardContent>
    </Card>
  );
}
