'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { 
  Receipt, 
  Plus, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createBill, markBillAsPaid, deleteBill } from '@/lib/actions/bills';
import { billCategories } from '@/lib/constants/bills';
import type { BillFrequency } from '@/lib/utils/bills';

interface Bill {
  id: string;
  name: string;
  description?: string | null;
  amount: string;
  dueDate: Date;
  frequency: string;
  status: string;
  icon?: string | null;
  color?: string | null;
  categoryId?: string | null;
  category?: { name: string; color?: string | null } | null;
}

interface BillsWidgetProps {
  bills: Bill[];
  onUpdate?: () => void;
}

export function BillsWidget({ bills, onUpdate }: BillsWidgetProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    frequency: 'bulanan' as BillFrequency,
    categoryId: '',
    icon: '📝',
    color: '#6B7280',
    notes: '',
  });

  const today = new Date();
  
  // Sort bills: overdue first, then by due date
  const sortedBills = [...bills].sort((a, b) => {
    const aOverdue = new Date(a.dueDate) < today && a.status === 'aktif';
    const bOverdue = new Date(b.dueDate) < today && b.status === 'aktif';
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const activeBills = sortedBills.filter(b => b.status === 'aktif' || b.status === 'terlambat');
  const overdueBills = activeBills.filter(b => new Date(b.dueDate) < today);
  const upcomingBills = activeBills.filter(b => new Date(b.dueDate) >= today);

  const getDaysUntilDue = (dueDate: Date) => {
    const diff = new Date(dueDate).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDueDate = (dueDate: Date) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return `Terlambat ${Math.abs(days)} hari`;
    if (days === 0) return 'Hari ini';
    if (days === 1) return 'Besok';
    if (days <= 7) return `${days} hari lagi`;
    return new Date(dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createBill({
        name: formData.name,
        amount: parseInt(formData.amount),
        dueDate: new Date(formData.dueDate),
        frequency: formData.frequency,
        categoryId: formData.categoryId || undefined,
        icon: formData.icon,
        color: formData.color,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          amount: '',
          dueDate: '',
          frequency: 'bulanan',
          categoryId: '',
          icon: '📝',
          color: '#6B7280',
          notes: '',
        });
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error creating bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markBillAsPaid(id);
      onUpdate?.();
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus tagihan ini?')) return;
    try {
      await deleteBill(id);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  const handleCategorySelect = (catId: string) => {
    const cat = billCategories.find(c => c.id === catId);
    if (cat) {
      setFormData(prev => ({
        ...prev,
        categoryId: catId,
        icon: cat.icon,
        color: cat.color,
        name: prev.name || cat.name,
      }));
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Tagihan
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {activeBills.length === 0 ? (
            <div className="text-center py-6">
              <Receipt className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Belum ada tagihan</p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Tambah Tagihan
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Overdue Alert */}
              {overdueBills.length > 0 && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-500 font-medium">
                    {overdueBills.length} tagihan terlambat
                  </span>
                </div>
              )}

              {/* Bills List */}
              {activeBills.slice(0, 4).map((bill) => {
                const isOverdue = new Date(bill.dueDate) < today;
                const days = getDaysUntilDue(bill.dueDate);
                const isUrgent = days <= 3 && days >= 0;
                
                return (
                  <div
                    key={bill.id}
                    className={`p-3 rounded-xl transition-colors group ${
                      isOverdue 
                        ? 'bg-red-500/10 border border-red-500/20' 
                        : isUrgent
                        ? 'bg-yellow-500/10 border border-yellow-500/20'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div 
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ backgroundColor: bill.color ? `${bill.color}20` : undefined }}
                        >
                          {bill.icon || '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{bill.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs flex items-center gap-1 ${
                              isOverdue ? 'text-red-500' : isUrgent ? 'text-yellow-600 dark:text-yellow-500' : 'text-muted-foreground'
                            }`}>
                              {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {formatDueDate(bill.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm">{formatCurrency(Number(bill.amount))}</p>
                        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleMarkPaid(bill.id)}
                            className="p-1 rounded hover:bg-emerald-500/20 text-emerald-500"
                            title="Tandai Lunas"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bill.id)}
                            className="p-1 rounded hover:bg-red-500/20 text-red-500"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeBills.length > 4 && (
                <button className="w-full py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors">
                  Lihat {activeBills.length - 4} lainnya
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Bill Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Tagihan"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Quick Select */}
          <div>
            <label className="text-sm font-medium mb-2 block">Jenis Tagihan</label>
            <div className="grid grid-cols-4 gap-2">
              {billCategories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    formData.categoryId === cat.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <span className="text-xl block mb-1">{cat.icon}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Nama Tagihan</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Listrik PLN"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Jumlah (Rp)</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Jatuh Tempo</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frekuensi</label>
              <Select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as BillFrequency }))}
              >
                <option value="sekali">Sekali</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Catatan (opsional)</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="No pelanggan, dll"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
