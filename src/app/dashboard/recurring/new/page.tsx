'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import Link from 'next/link';
import { createRecurringTransaction } from '@/lib/actions/recurring-transactions';

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function NewRecurringPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'pengeluaran' as 'pemasukan' | 'pengeluaran',
    amount: '',
    description: '',
    accountId: '',
    categoryId: '',
    frequency: 'bulanan',
    nextDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [accountsRes, categoriesRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/categories'),
        ]);
        
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          setAccounts(accountsData);
          if (accountsData.length > 0) {
            setFormData(prev => ({ ...prev, accountId: accountsData[0].id }));
          }
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }
    fetchData();
  }, []);

  const filteredCategories = categories.filter(
    cat => cat.type === formData.type
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData();
    form.append('type', formData.type);
    form.append('amount', formData.amount);
    form.append('description', formData.description);
    form.append('accountId', formData.accountId);
    form.append('categoryId', formData.categoryId);
    form.append('frequency', formData.frequency);
    form.append('nextDate', formData.nextDate);

    const result = await createRecurringTransaction({}, form);
    
    if (result.success) {
      router.push('/dashboard/recurring');
    } else if (result.errors) {
      setError(result.errors.general?.join(', ') || 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/recurring"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transaksi Berulang Baru</h1>
        <p className="text-muted-foreground mt-1">Buat transaksi otomatis yang berulang</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-foreground/10 border border-foreground/20 p-4 text-sm text-foreground">
            {error}
          </div>
        )}

        {/* Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Jenis Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'pengeluaran', categoryId: '' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'pengeluaran'
                    ? 'border-foreground bg-foreground/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <TrendingDown className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Pengeluaran</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'pemasukan', categoryId: '' }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'pemasukan'
                    ? 'border-foreground bg-foreground/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Pemasukan</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormattedNumberInput
              label="Jumlah (Rp)"
              placeholder="0"
              value={formData.amount}
              onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
              required
            />

            <Input
              label="Deskripsi"
              placeholder="Gaji bulanan, Netflix, dll"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Dompet</label>
              <Select
                value={formData.accountId}
                onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                required
              >
                <option value="">Pilih dompet</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Kategori (opsional)</label>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">Pilih kategori</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jadwal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Frekuensi</label>
              <Select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                required
              >
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </Select>
            </div>

            <Input
              type="date"
              label="Tanggal Berikutnya"
              value={formData.nextDate}
              onChange={(e) => setFormData(prev => ({ ...prev, nextDate: e.target.value }))}
              required
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/dashboard/recurring" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading || !formData.accountId || !formData.amount}
            className="flex-1"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
