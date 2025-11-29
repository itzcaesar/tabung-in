'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, CalendarClock, Receipt, Bell } from 'lucide-react';
import Link from 'next/link';
import { createBill } from '@/lib/actions/bills';
import { formatCurrency } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function NewBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryId: '',
    dueDate: '',
    frequency: 'bulanan',
    reminderDays: '7',
    notes: '',
    autopay: false,
  });

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories.filter((c: Category) => c.type === 'pengeluaran'));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createBill({
        name: formData.name,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId || undefined,
        dueDate: new Date(formData.dueDate),
        frequency: formData.frequency as 'sekali' | 'mingguan' | 'bulanan' | 'tahunan',
        reminderDays: parseInt(formData.reminderDays),
        notes: formData.notes || undefined,
        autopay: formData.autopay,
      });

      if (result.success) {
        router.push('/dashboard/bills');
        router.refresh();
      } else {
        setError(result.error || 'Gagal membuat tagihan');
      }
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bills">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Tagihan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Buat pengingat tagihan baru
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Informasi Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nama Tagihan</label>
              <Input
                placeholder="Contoh: Listrik PLN"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Kategori</label>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Jumlah (Rp)</label>
              <FormattedNumberInput
                placeholder="500.000"
                value={formData.amount}
                onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Jadwal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tanggal Jatuh Tempo</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Frekuensi</label>
              <Select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <option value="sekali">Sekali</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reminder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Pengingat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ingatkan sebelum</label>
              <Select
                value={formData.reminderDays}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderDays: e.target.value }))}
              >
                <option value="1">1 hari sebelumnya</option>
                <option value="3">3 hari sebelumnya</option>
                <option value="7">7 hari sebelumnya</option>
                <option value="14">14 hari sebelumnya</option>
                <option value="30">30 hari sebelumnya</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Catatan (opsional)</label>
              <Input
                placeholder="Catatan tambahan..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autopay"
                checked={formData.autopay}
                onChange={(e) => setFormData(prev => ({ ...prev, autopay: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="autopay" className="text-sm text-muted-foreground">
                Tagihan ini auto-debit (tidak perlu bayar manual)
              </label>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard/bills" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Tagihan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
