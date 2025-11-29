'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Building2,
  Smartphone,
  Wallet,
  Banknote,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { deleteAccount } from '@/lib/actions/accounts';
import Link from 'next/link';

interface Account {
  id: string;
  name: string;
  type: 'rekening' | 'emoney' | 'tunai';
  provider: string | null;
  balance: string;
  currency: string;
  color: string | null;
}

interface Props {
  accounts: Account[];
  emoneyProviders: Record<string, { name: string; color: string; initials: string; textColor: string }>;
  bankProviders: Record<string, { name: string; color: string; initials: string; textColor: string }>;
}

function getAccountIcon(type: string) {
  switch (type) {
    case 'rekening':
      return <Banknote className="h-5 w-5" />;
    case 'emoney':
      return <Smartphone className="h-5 w-5" />;
    case 'tunai':
      return <Wallet className="h-5 w-5" />;
    default:
      return <CreditCard className="h-5 w-5" />;
  }
}

export function AccountsList({ accounts, emoneyProviders, bankProviders }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteAccount(id);
      setDeleteConfirm(null);
    });
  };

  const getProviderInfo = (type: string, provider: string | null) => {
    if (type === 'emoney' && provider && emoneyProviders[provider]) {
      return emoneyProviders[provider];
    }
    if (type === 'rekening' && provider && bankProviders[provider]) {
      return bankProviders[provider];
    }
    return null;
  };

  const getTypeLabel = (type: string, provider: string | null) => {
    const providerInfo = getProviderInfo(type, provider);
    if (providerInfo) return providerInfo.name;
    
    switch (type) {
      case 'rekening': return 'Rekening Bank';
      case 'emoney': return 'E-Money';
      case 'tunai': return 'Uang Tunai';
      default: return type;
    }
  };

  // Group accounts by type
  const rekeningAccounts = accounts.filter(a => a.type === 'rekening');
  const emoneyAccounts = accounts.filter(a => a.type === 'emoney');
  const tunaiAccounts = accounts.filter(a => a.type === 'tunai');

  const renderAccountCard = (account: Account) => {
    const providerInfo = getProviderInfo(account.type, account.provider);
    const bgColor = providerInfo?.color || account.color || '#6B7280';
    const textColor = providerInfo?.textColor || '#FFFFFF';

    return (
      <div
        key={account.id}
        className="relative rounded-xl p-4 text-white min-h-[120px] flex flex-col justify-between"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {/* Actions Menu */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === account.id ? null : account.id);
            }}
            className="p-1.5 rounded-lg hover:bg-black/20 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {activeMenu === account.id && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-popover border rounded-lg shadow-lg z-10 py-1 text-foreground">
              <Link href={`/dashboard/accounts/${account.id}/edit`}>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  onClick={() => setActiveMenu(null)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </Link>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground"
                onClick={() => {
                  setDeleteConfirm(account.id);
                  setActiveMenu(null);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {getAccountIcon(account.type)}
          <span className="text-sm opacity-80">
            {getTypeLabel(account.type, account.provider)}
          </span>
        </div>

        <div>
          <p className="text-2xl font-bold">{formatCurrency(Number(account.balance))}</p>
          <p className="text-sm opacity-80 mt-1">{account.name}</p>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, accountsList: Account[], icon: React.ReactNode) => {
    if (accountsList.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountsList.map(renderAccountCard)}
        </div>
      </div>
    );
  };

  return (
    <>
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">Belum ada dompet</p>
            <Link href="/dashboard/accounts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Dompet Pertama
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {renderSection('Rekening Bank', rekeningAccounts, <Building2 className="h-5 w-5 text-foreground" />)}
          {renderSection('E-Money', emoneyAccounts, <Smartphone className="h-5 w-5 text-foreground" />)}
          {renderSection('Uang Tunai', tunaiAccounts, <Wallet className="h-5 w-5 text-foreground" />)}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Dompet?"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus dompet ini? 
            Semua transaksi terkait juga akan terpengaruh.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setDeleteConfirm(null)}
            >
              Batal
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={isPending}
            >
              {isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Click outside to close menu */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setActiveMenu(null)}
        />
      )}
    </>
  );
}
