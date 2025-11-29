'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Target, Calculator, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { createGoal } from '@/lib/actions/goals';
import { calculateSavingsSimulation, calculateRequiredDailySavings } from '@/lib/utils/goals';
import { goalCategories } from '@/lib/constants/goals';
import { formatCurrency } from '@/lib/utils';

export default function NewGoalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    category: '',
    deadline: '',
    priority: '3',
  });

  // Simulation state
  const [dailySavings, setDailySavings] = useState('');
  const [simulation, setSimulation] = useState<{
    daysToGoal: number;
    weeksToGoal: number;
    monthsToGoal: number;
    targetDate: Date;
    isOnTrack: boolean;
  } | null>(null);

  const selectedCategory = goalCategories.find(c => c.id === formData.category);

  const handleSimulate = () => {
    const target = parseFloat(formData.targetAmount) || 0;
    const current = parseFloat(formData.currentAmount) || 0;
    const daily = parseFloat(dailySavings) || 0;
    const deadline = formData.deadline ? new Date(formData.deadline) : null;

    if (target > 0 && daily > 0) {
      const sim = calculateSavingsSimulation(target, current, daily, deadline);
      setSimulation(sim);
    }
  };

  const getRequiredDaily = () => {
    const target = parseFloat(formData.targetAmount) || 0;
    const current = parseFloat(formData.currentAmount) || 0;
    const deadline = formData.deadline ? new Date(formData.deadline) : null;

    if (target > 0 && deadline) {
      return calculateRequiredDailySavings(target, current, deadline);
    }
    return null;
  };

  const requiredDaily = getRequiredDaily();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createGoal({
        name: formData.name,
        description: formData.description || undefined,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        category: formData.category || undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        priority: parseInt(formData.priority),
        icon: selectedCategory?.icon,
        color: selectedCategory?.color,
      });

      if (result.success) {
        router.push('/dashboard/goals');
        router.refresh();
      } else {
        setError(result.error || 'Gagal membuat goal');
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
        <Link href="/dashboard/goals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buat Goal Baru</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tetapkan target tabunganmu
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Informasi Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nama Goal</label>
              <Input
                placeholder="Contoh: MacBook Pro M3"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Kategori</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Pilih kategori</option>
                {goalCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Deskripsi (opsional)</label>
              <Input
                placeholder="Deskripsi singkat tentang goal ini"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prioritas</label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="1">🔵 Rendah</option>
                <option value="2">🟢 Normal</option>
                <option value="3">🟡 Sedang</option>
                <option value="4">🟠 Tinggi</option>
                <option value="5">🔴 Sangat Tinggi</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Amount & Deadline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Target & Deadline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Jumlah (Rp)</label>
              <FormattedNumberInput
                placeholder="15.000.000"
                value={formData.targetAmount}
                onChange={(val) => setFormData(prev => ({ ...prev, targetAmount: val }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Jumlah Terkumpul Saat Ini (Rp)</label>
              <FormattedNumberInput
                placeholder="0"
                value={formData.currentAmount}
                onChange={(val) => setFormData(prev => ({ ...prev, currentAmount: val }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Deadline (opsional)</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {requiredDaily !== null && requiredDaily > 0 && (
              <div className="p-4 bg-foreground/10 rounded-xl border border-foreground/20">
                <p className="text-sm text-muted-foreground mb-1">
                  Untuk mencapai target tepat waktu:
                </p>
                <p className="text-lg font-bold text-foreground">
                  Nabung {formatCurrency(requiredDaily)}/hari
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Simulasi Tabungan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Jika nabung per hari (Rp)
              </label>
              <div className="flex gap-2">
                <FormattedNumberInput
                  placeholder="50.000"
                  value={dailySavings}
                  onChange={(val) => setDailySavings(val)}
                />
                <Button type="button" variant="outline" onClick={handleSimulate}>
                  Hitung
                </Button>
              </div>
            </div>

            {simulation && (
              <div className="p-4 bg-muted rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Waktu tercapai:</span>
                  <span className="font-medium">
                    {simulation.daysToGoal} hari ({simulation.monthsToGoal} bulan)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tanggal tercapai:</span>
                  <span className="font-medium">
                    {simulation.targetDate.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {formData.deadline && (
                  <div className="flex justify-between p-2 rounded-lg bg-foreground/10 text-foreground">
                    <span className="text-sm">Status:</span>
                    <span className="font-medium">
                      {simulation.isOnTrack ? '✓ Tepat Waktu' : '✗ Melewati Deadline'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 bg-foreground/10 border border-foreground/20 rounded-xl text-foreground text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard/goals" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Goal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
