'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Modal } from '@/components/ui/modal';
import { 
  Edit, 
  Trash2, 
  MoreVertical,
  CalendarClock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { deleteBill, updateBill, markBillAsPaid } from '@/lib/actions/bills';
import type { UpdateBillInput } from '@/lib/utils/bills';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface Bill {
  id: string;
  name: string;
  amount: string;
  dueDate: Date;
  frequency: string;
  status: string;
  category?: Category | null;
}

interface Props {
  bills: Bill[];
  categories: Category[];
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
  if (daysUntilDue < 0) {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-foreground/10 text-foreground">
        <AlertTriangle className="h-3 w-3" />
        Terlambat
      </span>
    );
  }
  if (daysUntilDue <= 7) {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-foreground/10 text-foreground">
        <Clock className="h-3 w-3" />
        {daysUntilDue}d
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
      <Clock className="h-3 w-3" />
      {daysUntilDue}d
    </span>
  );
}

export function BillsList({ bills, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Form state for edit
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDay: '',
    frequency: 'bulanan',
    categoryId: '',
  });

  const handleEdit = (bill: Bill) => {
    const dueDate = new Date(bill.dueDate);
    setFormData({
      name: bill.name,
      amount: bill.amount,
      dueDay: dueDate.getDate().toString(),
      frequency: bill.frequency,
      categoryId: bill.category?.id || '',
    });
    setEditBill(bill);
    setActiveMenu(null);
  };

  const handleSaveEdit = () => {
    if (!editBill) return;
    
    startTransition(async () => {
      // Calculate new due date based on day of month
      const now = new Date();
      const dueDay = parseInt(formData.dueDay) || 1;
      const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
      // If the day has passed this month, set for next month
      if (dueDate < now) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      
      await updateBill({
        id: editBill.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        dueDate: dueDate,
        frequency: formData.frequency as 'bulanan' | 'mingguan' | 'tahunan' | 'sekali',
        categoryId: formData.categoryId || undefined,
      });
      setEditBill(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteBill(id);
      setDeleteConfirm(null);
    });
  };

  const handleMarkPaid = (id: string) => {
    startTransition(async () => {
      await markBillAsPaid(id);
      setActiveMenu(null);
    });
  };

  // Split bills by status
  const activeBills = bills.filter(b => b.status === 'aktif');
  const paidBills = bills.filter(b => b.status === 'lunas');

  return (
    <>
      {activeBills.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">Belum ada tagihan aktif</p>
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
          {activeBills.map((bill) => {
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
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-1">
                        <p className="text-lg font-bold">{formatCurrency(Number(bill.amount))}</p>
                        <div className="flex items-center justify-end gap-2">
                          {getStatusBadge(bill.status, daysUntilDue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(bill.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      
                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === bill.id ? null : bill.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {activeMenu === bill.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-popover border rounded-lg shadow-lg z-10 py-1">
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                              onClick={() => handleEdit(bill)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground"
                              onClick={() => handleMarkPaid(bill.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Tandai Lunas
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground"
                              onClick={() => {
                                setDeleteConfirm(bill.id);
                                setActiveMenu(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Tagihan Lunas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paidBills.slice(0, 6).map((bill) => (
              <Card key={bill.id} className="border-foreground/20 bg-foreground/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{bill.name}</p>
                        <p className="text-xs text-foreground">Lunas</p>
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

      {/* Edit Modal */}
      <Modal
        isOpen={!!editBill}
        onClose={() => setEditBill(null)}
        title="Edit Tagihan"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nama Tagihan</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="PLN, Internet, dll"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Nominal</label>
            <FormattedNumberInput
              value={formData.amount}
              onChange={(val) => setFormData({ ...formData, amount: val })}
              placeholder="100.000"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tanggal Jatuh Tempo</label>
            <Input
              type="number"
              min="1"
              max="31"
              value={formData.dueDay}
              onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
              placeholder="1-31"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Frekuensi</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full h-10 px-3 rounded-md border bg-background"
            >
              <option value="bulanan">Bulanan</option>
              <option value="mingguan">Mingguan</option>
              <option value="tahunan">Tahunan</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Kategori</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full h-10 px-3 rounded-md border bg-background"
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setEditBill(null)}
            >
              Batal
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSaveEdit}
              disabled={isPending || !formData.name || !formData.amount}
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Tagihan?"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus tagihan ini?
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
