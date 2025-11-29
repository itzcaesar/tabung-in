'use client';

import { useActionState, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createTransaction, type TransactionState } from '@/lib/actions/transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
  Wallet,
  Smartphone,
  Banknote,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatCurrency } from '@/lib/utils';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  color: string | null;
  provider: string | null;
}

const transactionTypes = [
  { value: 'pengeluaran', label: 'Pengeluaran', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/20' },
  { value: 'pemasukan', label: 'Pemasukan', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
  { value: 'transfer', label: 'Transfer', icon: ArrowLeftRight, color: 'text-blue-500', bg: 'bg-blue-500/20' },
];

function getAccountIcon(type: string) {
  switch (type) {
    case 'rekening':
      return <Banknote className="h-4 w-4" />;
    case 'emoney':
      return <Smartphone className="h-4 w-4" />;
    case 'tunai':
      return <Wallet className="h-4 w-4" />;
    default:
      return <Wallet className="h-4 w-4" />;
  }
}

export default function NewTransactionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [selectedType, setSelectedType] = useState('pengeluaran');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const [state, formAction, pending] = useActionState<TransactionState, FormData>(
    createTransaction,
    {}
  );

  // Fetch accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch('/api/accounts');
        if (res.ok) {
          const data = await res.json();
          setAccounts(data);
          if (data.length > 0) {
            setSelectedAccountId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
      } finally {
        setLoadingAccounts(false);
      }
    }
    if (session?.user?.id) {
      fetchAccounts();
    }
  }, [session?.user?.id]);

  if (state.success) {
    router.push('/dashboard/transactions');
  }

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Transaksi
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transaksi Baru</h1>
        <p className="text-muted-foreground mt-1">Catat pemasukan atau pengeluaran baru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state.errors?.general && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
                {state.errors.general.join(', ')}
              </div>
            )}

            {/* Transaction Type Selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Jenis Transaksi
              </label>
              <div className="grid grid-cols-3 gap-3">
                {transactionTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        isSelected
                          ? `border-foreground/50 ${type.bg}`
                          : 'border-border hover:border-foreground/30'
                      )}
                    >
                      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', type.bg)}>
                        <Icon className={cn('h-5 w-5', type.color)} />
                      </div>
                      <span className={cn('text-sm font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="type" value={selectedType} />
              {state.errors?.type && (
                <p className="text-sm text-red-500 mt-2">{state.errors.type.join(', ')}</p>
              )}
            </div>

            {/* Account Selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Dari Dompet
              </label>
              {loadingAccounts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-2">
                  {accounts.map((account) => {
                    const isSelected = selectedAccountId === account.id;
                    const color = account.color || '#71717a';
                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedAccountId(account.id)}
                        className={cn(
                          'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                          isSelected
                            ? 'border-foreground/50 bg-muted'
                            : 'border-border hover:border-foreground/30'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {getAccountIcon(account.type)}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{account.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {account.type === 'emoney' ? 'E-Money' : account.type === 'rekening' ? 'Rekening' : 'Tunai'}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(Number(account.balance))}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/50 rounded-xl">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">Belum ada dompet</p>
                  <Link href="/dashboard/accounts/new">
                    <Button variant="secondary" size="sm">
                      Buat Dompet
                    </Button>
                  </Link>
                </div>
              )}
              <input type="hidden" name="accountId" value={selectedAccountId} />
              {state.errors?.accountId && (
                <p className="text-sm text-red-500 mt-2">{state.errors.accountId.join(', ')}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <Input
                name="amount"
                type="number"
                step="1"
                label="Jumlah (Rp)"
                placeholder="0"
                error={state.errors?.amount?.join(', ')}
                required
                className="text-2xl font-bold"
              />
            </div>

            {/* Description */}
            <Input
              name="description"
              type="text"
              label="Keterangan"
              placeholder="Untuk apa transaksi ini?"
              error={state.errors?.description?.join(', ')}
            />

            {/* Date */}
            <Input
              name="date"
              type="date"
              label="Tanggal"
              defaultValue={new Date().toISOString().split('T')[0]}
              error={state.errors?.date?.join(', ')}
              required
            />

            {/* Category (optional, hidden for now) */}
            <input type="hidden" name="categoryId" value="" />

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={pending || !selectedAccountId || accounts.length === 0} 
                className="flex-1"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Transaksi'
                )}
              </Button>
              <Link href="/dashboard/transactions">
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
