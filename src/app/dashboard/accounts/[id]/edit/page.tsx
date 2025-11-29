'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { updateAccount, type AccountState } from '@/lib/actions/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building2, Smartphone, Wallet, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const walletTypes = [
  { 
    value: 'rekening', 
    label: 'Rekening Bank', 
    icon: Building2, 
    description: 'BCA, Mandiri, BNI, dll',
    color: 'bg-foreground/10 text-foreground border-foreground/20'
  },
  { 
    value: 'emoney', 
    label: 'E-Money', 
    icon: Smartphone, 
    description: 'GoPay, OVO, DANA, dll',
    color: 'bg-foreground/10 text-foreground border-foreground/20'
  },
  { 
    value: 'tunai', 
    label: 'Tunai', 
    icon: Wallet, 
    description: 'Uang cash di dompet',
    color: 'bg-foreground/10 text-foreground border-foreground/20'
  },
];

const eMoneyProviders = [
  { value: 'gopay', label: 'GoPay', color: '#00AA13', initials: 'GP' },
  { value: 'ovo', label: 'OVO', color: '#4C3494', initials: 'OVO' },
  { value: 'dana', label: 'DANA', color: '#108EE9', initials: 'DA' },
  { value: 'shopeepay', label: 'ShopeePay', color: '#EE4D2D', initials: 'SP' },
  { value: 'linkaja', label: 'LinkAja', color: '#E31E25', initials: 'LA' },
  { value: 'isaku', label: 'iSaku', color: '#FF6B00', initials: 'iS' },
  { value: 'sakuku', label: 'Sakuku', color: '#0066B3', initials: 'SK' },
  { value: 'doku', label: 'DOKU', color: '#E31E25', initials: 'DK' },
  { value: 'jenius', label: 'Jenius', color: '#00A8E8', initials: 'J' },
  { value: 'blu', label: 'blu by BCA', color: '#0066B3', initials: 'blu' },
  { value: 'jago', label: 'Bank Jago', color: '#FFCC00', initials: 'JG' },
  { value: 'livin', label: 'Livin\' Mandiri', color: '#003D79', initials: 'LV' },
  { value: 'octo', label: 'OCTO Mobile', color: '#B01116', initials: 'OC' },
  { value: 'other_emoney', label: 'Lainnya', color: '#6B7280', initials: '?' },
];

const bankProviders = [
  { value: 'bca', label: 'BCA', color: '#0066B3', initials: 'BCA' },
  { value: 'mandiri', label: 'Mandiri', color: '#003D79', initials: 'MDR' },
  { value: 'bni', label: 'BNI', color: '#F15A23', initials: 'BNI' },
  { value: 'bri', label: 'BRI', color: '#0066B3', initials: 'BRI' },
  { value: 'cimb', label: 'CIMB Niaga', color: '#B01116', initials: 'CIMB' },
  { value: 'danamon', label: 'Danamon', color: '#003D79', initials: 'DN' },
  { value: 'permata', label: 'PermataBank', color: '#006738', initials: 'PMT' },
  { value: 'ocbc', label: 'OCBC NISP', color: '#DA291C', initials: 'OCBC' },
  { value: 'maybank', label: 'Maybank', color: '#FFC72C', initials: 'MB' },
  { value: 'bsi', label: 'BSI', color: '#00A651', initials: 'BSI' },
  { value: 'btn', label: 'BTN', color: '#F7941D', initials: 'BTN' },
  { value: 'other_bank', label: 'Bank Lainnya', color: '#6B7280', initials: '?' },
];

interface AccountData {
  id: string;
  name: string;
  type: 'rekening' | 'emoney' | 'tunai';
  provider: string | null;
  balance: string;
  currency: string;
  color: string | null;
}

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [walletType, setWalletType] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6B7280');
  const [balance, setBalance] = useState('');
  const [name, setName] = useState('');

  // Bound update action with account ID
  const boundUpdateAccount = updateAccount.bind(null, accountId);
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    boundUpdateAccount,
    {}
  );

  // Fetch account data on mount
  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch(`/api/accounts/${accountId}`);
        if (res.ok) {
          const data = await res.json();
          setAccount(data);
          setName(data.name);
          setWalletType(data.type);
          setSelectedProvider(data.provider || '');
          setSelectedColor(data.color || '#6B7280');
          setBalance(data.balance);
        }
      } catch (error) {
        console.error('Failed to fetch account:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAccount();
  }, [accountId]);

  if (state.success) {
    router.push('/dashboard/accounts');
  }

  const handleProviderSelect = (provider: { value: string; color: string }) => {
    setSelectedProvider(provider.value);
    setSelectedColor(provider.color);
  };

  const currentProviders = walletType === 'emoney' ? eMoneyProviders : 
                          walletType === 'rekening' ? bankProviders : [];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Dompet tidak ditemukan</p>
            <Link href="/dashboard/accounts">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/accounts"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Virtual Dompet
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Edit Dompet</h1>
        <p className="text-muted-foreground mt-2">Ubah detail dompet virtual Anda</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.errors?.general && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {state.errors.general.join(', ')}
          </div>
        )}

        {/* Wallet Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jenis Dompet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {walletTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = walletType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setWalletType(type.value);
                      setSelectedProvider('');
                      if (type.value === 'tunai') {
                        setSelectedColor('#F59E0B');
                      }
                    }}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? `${type.color} border-current shadow-lg scale-[1.02]`
                        : 'border-border hover:border-muted-foreground/50 bg-card'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <Icon className="h-8 w-8 mb-2" />
                    <p className="font-semibold">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="type" value={walletType} />
          </CardContent>
        </Card>

        {/* Provider Selection */}
        {(walletType === 'emoney' || walletType === 'rekening') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {walletType === 'emoney' ? 'Pilih E-Money' : 'Pilih Bank'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {currentProviders.map((provider) => {
                  const isSelected = selectedProvider === provider.value;
                  return (
                    <button
                      key={provider.value}
                      type="button"
                      onClick={() => handleProviderSelect(provider)}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-foreground shadow-lg scale-[1.02]'
                          : 'border-border hover:border-muted-foreground/50 bg-card'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: provider.color, color: '#FFF' }}
                      >
                        {provider.initials}
                      </div>
                      <span className="text-xs font-medium text-center line-clamp-1">
                        {provider.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="provider" value={selectedProvider} />
              <input type="hidden" name="color" value={selectedColor} />
            </CardContent>
          </Card>
        )}

        {/* Wallet Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nama Dompet</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              name="name"
              placeholder="Contoh: Tabungan Liburan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg"
            />
            {state.errors?.name && (
              <p className="text-sm text-red-400 mt-2">{state.errors.name.join(', ')}</p>
            )}
          </CardContent>
        </Card>

        {/* Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saldo Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                Rp
              </span>
              <FormattedNumberInput
                name="balance"
                placeholder="0"
                value={balance}
                onChange={(val) => setBalance(val)}
                className="pl-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Link href="/dashboard/accounts" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1"
            disabled={pending || !walletType || !name}
          >
            {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
