'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { 
  RefreshCw, 
  Play, 
  Pause, 
  Trash2, 
  Edit,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  toggleRecurringTransaction, 
  deleteRecurringTransaction,
  createRecurringTransaction,
  updateRecurringTransaction
} from '@/lib/actions/recurring-transactions';

interface RecurringTransaction {
  id: string;
  type: 'pemasukan' | 'pengeluaran' | 'transfer';
  amount: string;
  description: string | null;
  frequency: string;
  nextDate: Date;
  isActive: boolean | null;
  account: { id: string; name: string } | null;
  category: { id: string; name: string; color: string | null } | null;
}

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: 'pemasukan' | 'pengeluaran';
}

interface Props {
  recurring: RecurringTransaction[];
  accounts: Account[];
  categories: Category[];
}

function getFrequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'harian': return 'Harian';
    case 'mingguan': return 'Mingguan';
    case 'bulanan': return 'Bulanan';
    case 'tahunan': return 'Tahunan';
    default: return frequency;
  }
}

function getDaysUntilNext(nextDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const next = new Date(nextDate);
  next.setHours(0, 0, 0, 0);
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Format number with thousand separators (150000 -> 150.000)
function formatNumberInput(value: string): string {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse formatted number back to raw number (150.000 -> 150000)
function parseFormattedNumber(value: string): string {
  return value.replace(/\./g, '');
}

export function RecurringTransactionsList({ recurring, accounts, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [amountDisplay, setAmountDisplay] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [selectedType, setSelectedType] = useState<'pemasukan' | 'pengeluaran'>('pengeluaran');

  const filteredCategories = categories.filter(cat => cat.type === selectedType);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFormattedNumber(e.target.value);
    setAmountRaw(raw);
    setAmountDisplay(formatNumberInput(raw));
  };

  const handleToggle = (id: string, currentStatus: boolean | null) => {
    startTransition(async () => {
      await toggleRecurringTransaction(id, !currentStatus);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteRecurringTransaction(id);
      setDeleteConfirm(null);
    });
  };

  const activeRecurring = recurring.filter(r => r.isActive);
  const inactiveRecurring = recurring.filter(r => !r.isActive);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      if (editingItem) {
        await updateRecurringTransaction(editingItem.id, {}, formData);
      } else {
        await createRecurringTransaction({}, formData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    });
  };

  const openEditModal = (item: RecurringTransaction) => {
    setEditingItem(item);
    const rawAmount = item.amount || '';
    setAmountRaw(rawAmount);
    setAmountDisplay(formatNumberInput(rawAmount));
    setSelectedType(item.type as 'pemasukan' | 'pengeluaran');
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingItem(null);
    setAmountRaw('');
    setAmountDisplay('');
    setSelectedType('pengeluaran');
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Active Recurring */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-4 w-4 text-foreground" />
            Transaksi Aktif ({activeRecurring.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRecurring.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Belum ada transaksi berulang aktif</p>
              <Button 
                onClick={openNewModal}
                variant="outline" 
                className="mt-4"
              >
                Tambah Transaksi Berulang
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRecurring.map((item) => {
                const daysUntil = getDaysUntilNext(item.nextDate);
                return (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-foreground/10">
                        {item.type === 'pemasukan' 
                          ? <TrendingUp className="h-5 w-5 text-foreground" />
                          : <TrendingDown className="h-5 w-5 text-foreground" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.description || 'Transaksi Berulang'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.account?.name || '-'}</span>
                          <span>•</span>
                          <span>{getFrequencyLabel(item.frequency)}</span>
                          {item.category && (
                            <>
                              <span>•</span>
                              <span 
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={{ 
                                  backgroundColor: `${item.category.color}20`,
                                  color: item.category.color || undefined
                                }}
                              >
                                {item.category.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {item.type === 'pemasukan' ? '+' : '-'}
                          {formatCurrency(Number(item.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysUntil === 0 
                            ? 'Hari ini' 
                            : daysUntil < 0 
                              ? `${Math.abs(daysUntil)} hari lalu`
                              : `${daysUntil} hari lagi`
                          }
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openEditModal(item)}
                          disabled={isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleToggle(item.id, item.isActive)}
                          disabled={isPending}
                        >
                          <Pause className="h-4 w-4 text-foreground" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setDeleteConfirm(item.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Recurring */}
      {inactiveRecurring.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
              <Pause className="h-4 w-4" />
              Transaksi Nonaktif ({inactiveRecurring.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveRecurring.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-muted/20 rounded-xl opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      {item.type === 'pemasukan' 
                        ? <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        : <TrendingDown className="h-5 w-5 text-muted-foreground" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {item.description || 'Transaksi Berulang'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.account?.name || '-'}</span>
                        <span>•</span>
                        <span>{getFrequencyLabel(item.frequency)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-bold text-muted-foreground">
                      {formatCurrency(Number(item.amount))}
                    </p>

                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => handleToggle(item.id, item.isActive)}
                        disabled={isPending}
                      >
                        <Play className="h-4 w-4 text-foreground" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => setDeleteConfirm(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Transaksi Berulang?"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus transaksi berulang ini? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirm(null)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={isPending}
            >
              {isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Transaksi Berulang' : 'Tambah Transaksi Berulang'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Jenis</label>
            <select 
              name="type" 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'pemasukan' | 'pengeluaran')}
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground"
              required
            >
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Jumlah</label>
            <input type="hidden" name="amount" value={amountRaw} />
            <input
              type="text"
              value={amountDisplay}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <input
              type="text"
              name="description"
              defaultValue={editingItem?.description || ''}
              placeholder="Gaji bulanan, Netflix, dll"
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dompet</label>
            <select 
              name="accountId" 
              defaultValue={editingItem?.account?.id || ''}
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground"
              required
            >
              <option value="">Pilih dompet</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kategori (opsional)</label>
            <select 
              name="categoryId" 
              defaultValue={editingItem?.category?.id || ''}
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground"
            >
              <option value="">Pilih kategori</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Frekuensi</label>
            <select 
              name="frequency" 
              defaultValue={editingItem?.frequency || 'bulanan'}
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground"
              required
            >
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tanggal Berikutnya</label>
            <input
              type="date"
              name="nextDate"
              defaultValue={editingItem?.nextDate ? new Date(editingItem.nextDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
              className="w-full p-3 rounded-xl bg-muted border border-border text-foreground"
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : editingItem ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
