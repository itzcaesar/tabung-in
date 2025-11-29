'use client';

import { useActionState } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBudget, type BudgetState } from '@/lib/actions/budgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Check, Target, AlertTriangle, PiggyBank } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  type: string;
  color: string | null;
  icon: string | null;
}

const periods = [
  { value: 'harian', label: 'Harian', description: 'Reset setiap hari' },
  { value: 'mingguan', label: 'Mingguan', description: 'Reset setiap minggu' },
  { value: 'bulanan', label: 'Bulanan', description: 'Reset setiap bulan' },
  { value: 'tahunan', label: 'Tahunan', description: 'Reset setiap tahun' },
];

const alertThresholds = [
  { value: 50, label: '50%', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { value: 70, label: '70%', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { value: 80, label: '80%', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { value: 90, label: '90%', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function NewBudgetPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('bulanan');
  const [selectedThreshold, setSelectedThreshold] = useState(80);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [state, formAction, pending] = useActionState<BudgetState, FormData>(
    createBudget,
    {}
  );

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        // Filter only expense categories
        const expenseCategories = data.filter((cat: Category) => cat.type === 'pengeluaran');
        setCategories(expenseCategories);
      })
      .catch(console.error);
  }, []);

  if (state.success) {
    router.push('/dashboard/budgets');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/budgets"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Anggaran
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Buat Anggaran Baru</h1>
        <p className="text-muted-foreground mt-2">Tetapkan batas pengeluaran untuk mengontrol keuangan Anda</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.errors?.general && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {state.errors.general.join(', ')}
          </div>
        )}

        {/* Budget Name & Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              Detail Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              name="name"
              type="text"
              label="Nama Anggaran"
              placeholder="cth: Makan & Minum, Hiburan, Transport"
              error={state.errors?.name?.join(', ')}
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Jumlah Anggaran
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rp
                </span>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setAmount(value);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  required
                />
                <input type="hidden" name="amount" value={amount || '0'} />
              </div>
              {amount && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatRupiah(parseInt(amount) || 0)}
                </p>
              )}
              {state.errors?.amount && (
                <p className="text-sm text-red-400 mt-1">{state.errors.amount.join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Periode Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {periods.map((period) => {
                const isSelected = selectedPeriod === period.value;
                return (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-foreground bg-foreground/5 shadow-lg scale-[1.02]'
                        : 'border-border hover:border-muted-foreground/50 bg-card'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <div className="font-semibold text-foreground">{period.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{period.description}</div>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="period" value={selectedPeriod} />
            {state.errors?.period && (
              <p className="text-sm text-red-400 mt-2">{state.errors.period.join(', ')}</p>
            )}

            <div className="mt-4">
              <Input
                name="startDate"
                type="date"
                label="Tanggal Mulai"
                defaultValue={new Date().toISOString().split('T')[0]}
                error={state.errors?.startDate?.join(', ')}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Alert Threshold */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              Batas Peringatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Anda akan menerima peringatan ketika pengeluaran mencapai persentase ini dari anggaran
            </p>
            <div className="grid grid-cols-4 gap-3">
              {alertThresholds.map((threshold) => {
                const isSelected = selectedThreshold === threshold.value;
                return (
                  <button
                    key={threshold.value}
                    type="button"
                    onClick={() => setSelectedThreshold(threshold.value)}
                    className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? `${threshold.color} border-current shadow-lg scale-[1.02]`
                        : 'border-border hover:border-muted-foreground/50 bg-card'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className={`text-lg font-bold ${isSelected ? '' : 'text-foreground'}`}>
                      {threshold.label}
                    </div>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="alertThreshold" value={selectedThreshold} />
          </CardContent>
        </Card>

        {/* Category Selection (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-muted-foreground" />
              Kategori (Opsional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Hubungkan anggaran ke kategori tertentu untuk pelacakan otomatis
            </p>
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedCategory === ''
                      ? 'border-foreground bg-foreground/5 shadow-lg'
                      : 'border-border hover:border-muted-foreground/50 bg-card'
                  }`}
                >
                  <div className="font-medium text-foreground">Semua Kategori</div>
                </button>
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-foreground bg-foreground/5 shadow-lg scale-[1.02]'
                          : 'border-border hover:border-muted-foreground/50 bg-card'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div 
                        className="w-6 h-6 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      />
                      <div className="font-medium text-foreground text-sm text-center">
                        {category.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada kategori pengeluaran
              </p>
            )}
            <input type="hidden" name="categoryId" value={selectedCategory} />
          </CardContent>
        </Card>

        {/* Preview */}
        {amount && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview Anggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Batas {periods.find(p => p.value === selectedPeriod)?.label}</span>
                  <span className="text-2xl font-bold text-foreground">{formatRupiah(parseInt(amount) || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Peringatan di</span>
                  <span className="text-amber-500 font-medium">{formatRupiah((parseInt(amount) || 0) * selectedThreshold / 100)}</span>
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-amber-500 rounded-full transition-all"
                    style={{ width: `${selectedThreshold}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={pending || !amount} className="flex-1">
            {pending ? 'Menyimpan...' : 'Simpan Anggaran'}
          </Button>
          <Link href="/dashboard/budgets">
            <Button type="button" variant="secondary">
              Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
