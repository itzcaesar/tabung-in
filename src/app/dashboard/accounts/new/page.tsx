'use client';

import { useActionState } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount, type AccountState } from '@/lib/actions/accounts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building2, Smartphone, Wallet, Check } from 'lucide-react';
import Link from 'next/link';

const walletTypes = [
  { 
    value: 'rekening', 
    label: 'Rekening Bank', 
    icon: Building2, 
    description: 'BCA, Mandiri, BNI, dll',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  { 
    value: 'emoney', 
    label: 'E-Money', 
    icon: Smartphone, 
    description: 'GoPay, OVO, DANA, dll',
    color: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  { 
    value: 'tunai', 
    label: 'Tunai', 
    icon: Wallet, 
    description: 'Uang cash di dompet',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
];

const eMoneyProviders = [
  { value: 'gopay', label: 'GoPay', color: '#00AA13', logo: '/logos/gopay.svg', initials: 'GP' },
  { value: 'ovo', label: 'OVO', color: '#4C3494', logo: '/logos/ovo.svg', initials: 'OVO' },
  { value: 'dana', label: 'DANA', color: '#108EE9', logo: '/logos/dana.svg', initials: 'DA' },
  { value: 'shopeepay', label: 'ShopeePay', color: '#EE4D2D', logo: '/logos/shopeepay.svg', initials: 'SP' },
  { value: 'linkaja', label: 'LinkAja', color: '#E31E25', logo: '/logos/linkaja.svg', initials: 'LA' },
  { value: 'isaku', label: 'iSaku', color: '#FF6B00', logo: '/logos/isaku.svg', initials: 'iS' },
  { value: 'sakuku', label: 'Sakuku', color: '#0066B3', logo: '/logos/sakuku.svg', initials: 'SK' },
  { value: 'doku', label: 'DOKU', color: '#E31E25', logo: '/logos/doku.svg', initials: 'DK' },
  { value: 'jenius', label: 'Jenius', color: '#00A8E8', logo: '/logos/jenius.svg', initials: 'J' },
  { value: 'blu', label: 'blu by BCA', color: '#0066B3', logo: '/logos/blu.svg', initials: 'blu' },
  { value: 'jago', label: 'Bank Jago', color: '#FFCC00', logo: '/logos/jago.svg', initials: 'JG' },
  { value: 'livin', label: 'Livin\' Mandiri', color: '#003D79', logo: '/logos/livin.svg', initials: 'LV' },
  { value: 'octo', label: 'OCTO Mobile', color: '#B01116', logo: '/logos/octo.svg', initials: 'OC' },
  { value: 'other_emoney', label: 'Lainnya', color: '#6B7280', logo: '', initials: '?' },
];

const bankProviders = [
  { value: 'bca', label: 'BCA', color: '#0066B3', logo: '/logos/bca.svg', initials: 'BCA' },
  { value: 'mandiri', label: 'Mandiri', color: '#003D79', logo: '/logos/mandiri.svg', initials: 'MDR' },
  { value: 'bni', label: 'BNI', color: '#F15A23', logo: '/logos/bni.svg', initials: 'BNI' },
  { value: 'bri', label: 'BRI', color: '#0066B3', logo: '/logos/bri.svg', initials: 'BRI' },
  { value: 'cimb', label: 'CIMB Niaga', color: '#B01116', logo: '/logos/cimb.svg', initials: 'CIMB' },
  { value: 'danamon', label: 'Danamon', color: '#003D79', logo: '/logos/danamon.svg', initials: 'DN' },
  { value: 'permata', label: 'PermataBank', color: '#006738', logo: '/logos/permata.svg', initials: 'PMT' },
  { value: 'ocbc', label: 'OCBC NISP', color: '#DA291C', logo: '/logos/ocbc.svg', initials: 'OCBC' },
  { value: 'maybank', label: 'Maybank', color: '#FFC72C', logo: '/logos/maybank.svg', initials: 'MB' },
  { value: 'bsi', label: 'BSI', color: '#00A651', logo: '/logos/bsi.svg', initials: 'BSI' },
  { value: 'btn', label: 'BTN', color: '#F7941D', logo: '/logos/btn.svg', initials: 'BTN' },
  { value: 'other_bank', label: 'Bank Lainnya', color: '#6B7280', logo: '', initials: '?' },
];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function NewAccountPage() {
  const router = useRouter();
  const [walletType, setWalletType] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6B7280');
  const [balance, setBalance] = useState('');
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    createAccount,
    {}
  );

  if (state.success) {
    router.push('/dashboard/accounts');
  }

  const handleProviderSelect = (provider: { value: string; color: string }) => {
    setSelectedProvider(provider.value);
    setSelectedColor(provider.color);
  };

  const currentProviders = walletType === 'emoney' ? eMoneyProviders : 
                          walletType === 'rekening' ? bankProviders : [];

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
        <h1 className="text-3xl font-bold text-foreground">Tambah Virtual Dompet</h1>
        <p className="text-muted-foreground mt-2">Buat dompet virtual baru untuk mengatur keuanganmu</p>
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
            <CardTitle className="text-lg">Pilih Jenis Dompet</CardTitle>
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
                    <Icon className={`h-8 w-8 mb-3 ${isSelected ? '' : 'text-muted-foreground'}`} />
                    <div className={`font-semibold ${isSelected ? '' : 'text-foreground'}`}>
                      {type.label}
                    </div>
                    <div className={`text-sm mt-1 ${isSelected ? 'opacity-80' : 'text-muted-foreground'}`}>
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="type" value={walletType} />
            {state.errors?.type && (
              <p className="text-sm text-red-400 mt-2">{state.errors.type.join(', ')}</p>
            )}
          </CardContent>
        </Card>

        {/* Provider Selection */}
        {(walletType === 'emoney' || walletType === 'rekening') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {walletType === 'emoney' ? 'Pilih E-Money Provider' : 'Pilih Bank'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentProviders.map((provider) => {
                  const isSelected = selectedProvider === provider.value;
                  const textColor = provider.value === 'jago' || provider.value === 'maybank' ? '#000000' : '#FFFFFF';
                  return (
                    <button
                      key={provider.value}
                      type="button"
                      onClick={() => handleProviderSelect(provider)}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-foreground shadow-lg scale-[1.02]'
                          : 'border-border hover:border-muted-foreground/50 bg-card'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      {/* Brand Logo/Initials */}
                      <div 
                        className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center font-bold text-sm shadow-md"
                        style={{ 
                          backgroundColor: provider.color,
                          color: textColor
                        }}
                      >
                        {provider.initials}
                      </div>
                      <div className={`text-sm font-medium text-center ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {provider.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="provider" value={selectedProvider} />
              {state.errors?.provider && (
                <p className="text-sm text-red-400 mt-2">{state.errors.provider.join(', ')}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detail Dompet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              name="name"
              type="text"
              label="Nama Dompet"
              placeholder="cth: Tabungan Utama, Dana Darurat"
              error={state.errors?.name?.join(', ')}
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Saldo Awal
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rp
                </span>
                <input
                  type="text"
                  value={balance}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setBalance(value);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <input type="hidden" name="balance" value={balance || '0'} />
              </div>
              {balance && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatRupiah(parseInt(balance) || 0)}
                </p>
              )}
              {state.errors?.balance && (
                <p className="text-sm text-red-400 mt-1">{state.errors.balance.join(', ')}</p>
              )}
            </div>

            <input type="hidden" name="currency" value="IDR" />
            <input type="hidden" name="color" value={selectedColor} />
          </CardContent>
        </Card>

        {/* Preview Card */}
        {walletType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="p-4 rounded-xl text-white"
                style={{ backgroundColor: selectedColor }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {walletType === 'rekening' && <Building2 className="h-6 w-6 opacity-80" />}
                  {walletType === 'emoney' && <Smartphone className="h-6 w-6 opacity-80" />}
                  {walletType === 'tunai' && <Wallet className="h-6 w-6 opacity-80" />}
                  <span className="font-medium opacity-80">
                    {walletTypes.find(t => t.value === walletType)?.label}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {formatRupiah(parseInt(balance) || 0)}
                </div>
                <div className="text-sm opacity-80 mt-1">
                  {selectedProvider ? 
                    currentProviders.find(p => p.value === selectedProvider)?.label : 
                    'Nama dompet akan tampil di sini'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={pending || !walletType} 
            className="flex-1"
          >
            {pending ? 'Menyimpan...' : 'Simpan Dompet'}
          </Button>
          <Link href="/dashboard/accounts">
            <Button type="button" variant="secondary">
              Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
