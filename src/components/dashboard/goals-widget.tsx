'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Plus, 
  Calendar,
  TrendingUp,
  ChevronRight,
  Trash2,
  Calculator,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  createGoal, 
  addGoalProgress, 
  deleteGoal,
} from '@/lib/actions/goals';
import {
  calculateSavingsSimulation,
  calculateRequiredDailySavings,
} from '@/lib/utils/goals';
import { goalCategories } from '@/lib/constants/goals';

interface Goal {
  id: string;
  name: string;
  description?: string | null;
  targetAmount: string;
  currentAmount: string;
  category?: string | null;
  deadline?: Date | null;
  priority?: number | null;
  icon?: string | null;
  color?: string | null;
  status: string;
}

interface GoalsWidgetProps {
  goals: Goal[];
  onUpdate?: () => void;
}

export function GoalsWidget({ goals, onUpdate }: GoalsWidgetProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [dailySavings, setDailySavings] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    category: '',
    deadline: '',
    icon: '🎯',
    color: '#6B7280',
    notes: '',
  });

  const activeGoals = goals.filter(g => g.status === 'aktif');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createGoal({
        name: formData.name,
        targetAmount: parseInt(formData.targetAmount),
        currentAmount: formData.currentAmount ? parseInt(formData.currentAmount) : 0,
        category: formData.category || undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        icon: formData.icon,
        color: formData.color,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          targetAmount: '',
          currentAmount: '',
          category: '',
          deadline: '',
          icon: '🎯',
          color: '#6B7280',
          notes: '',
        });
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async (goalId: string, amount: number) => {
    try {
      await addGoalProgress(goalId, amount);
      onUpdate?.();
    } catch (error) {
      console.error('Error adding progress:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus goal ini?')) return;
    try {
      await deleteGoal(id);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleCategorySelect = (catId: string) => {
    const cat = goalCategories.find(c => c.id === catId);
    if (cat) {
      setFormData(prev => ({
        ...prev,
        category: catId,
        icon: cat.icon,
        color: cat.color,
        name: prev.name || cat.name,
      }));
    }
  };

  const openSimulation = (goal: Goal) => {
    setSelectedGoal(goal);
    setDailySavings('');
    setShowSimulationModal(true);
  };

  const getSimulation = () => {
    if (!selectedGoal || !dailySavings) return null;
    return calculateSavingsSimulation(
      Number(selectedGoal.targetAmount),
      Number(selectedGoal.currentAmount),
      parseInt(dailySavings),
      selectedGoal.deadline
    );
  };

  const getRequiredDaily = (goal: Goal) => {
    if (!goal.deadline) return null;
    return calculateRequiredDailySavings(
      Number(goal.targetAmount),
      Number(goal.currentAmount),
      new Date(goal.deadline)
    );
  };

  const simulation = getSimulation();

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Goals
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
          {activeGoals.length === 0 ? (
            <div className="text-center py-6">
              <Target className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Belum ada goals</p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Buat Goals
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.slice(0, 3).map((goal) => {
                const targetAmount = Number(goal.targetAmount) || 1; // Prevent division by zero
                const progress = (Number(goal.currentAmount) / targetAmount) * 100;
                const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
                const requiredDaily = getRequiredDaily(goal);
                
                return (
                  <div
                    key={goal.id}
                    className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div 
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                          style={{ backgroundColor: goal.color ? `${goal.color}20` : undefined }}
                        >
                          {goal.icon || '🎯'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(Number(goal.currentAmount))} / {formatCurrency(Number(goal.targetAmount))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openSimulation(goal)}
                          className="p-1.5 rounded hover:bg-foreground/20 text-foreground"
                          title="Simulasi"
                        >
                          <Calculator className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-1.5 rounded hover:bg-foreground/20 text-foreground"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <Progress value={Math.min(progress, 100)} className="h-2 mb-2" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {progress.toFixed(0)}%
                      </span>
                      {goal.deadline && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {requiredDaily && requiredDaily > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                          Nabung {formatCurrency(requiredDaily)}/hari untuk tepat waktu
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {activeGoals.length > 3 && (
                <button className="w-full py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors">
                  Lihat {activeGoals.length - 3} lainnya
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Goal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Buat Goals Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Quick Select */}
          <div>
            <label className="text-sm font-medium mb-2 block">Kategori</label>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {goalCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    formData.category === cat.id
                      ? 'border-foreground bg-foreground/10'
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
            <label className="text-sm font-medium">Nama Goals</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: iPhone 16 Pro"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Target (Rp)</label>
            <FormattedNumberInput
              value={formData.targetAmount}
              onChange={(val) => setFormData(prev => ({ ...prev, targetAmount: val }))}
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Sudah Terkumpul (Rp)</label>
            <FormattedNumberInput
              value={formData.currentAmount}
              onChange={(val) => setFormData(prev => ({ ...prev, currentAmount: val }))}
              placeholder="0"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Target Tanggal (opsional)</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Catatan (opsional)</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Catatan tambahan..."
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

      {/* Simulation Modal */}
      <Modal
        isOpen={showSimulationModal}
        onClose={() => setShowSimulationModal(false)}
        title="Simulasi Tabungan"
      >
        {selectedGoal && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: selectedGoal.color ? `${selectedGoal.color}20` : undefined }}
                >
                  {selectedGoal.icon || '🎯'}
                </div>
                <div>
                  <p className="font-medium">{selectedGoal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Sisa: {formatCurrency(Number(selectedGoal.targetAmount) - Number(selectedGoal.currentAmount))}
                  </p>
                </div>
              </div>
              <Progress 
                value={(Number(selectedGoal.currentAmount) / (Number(selectedGoal.targetAmount) || 1)) * 100} 
                className="h-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Berapa yang bisa kamu nabung per hari?</label>
              <FormattedNumberInput
                value={dailySavings}
                onChange={(val) => setDailySavings(val)}
                placeholder="50.000"
                className="mt-1"
              />
            </div>

            {simulation && dailySavings && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-foreground" />
                  Hasil Simulasi
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Tabungan/Hari</p>
                    <p className="font-semibold">{formatCurrency(simulation.dailyAmount)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground">Waktu Pencapaian</p>
                    <p className="font-semibold">
                      {simulation.monthsToGoal > 0 
                        ? `${simulation.monthsToGoal} bulan`
                        : simulation.weeksToGoal > 0
                        ? `${simulation.weeksToGoal} minggu`
                        : `${simulation.daysToGoal} hari`
                      }
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Perkiraan Tercapai</p>
                  <p className="font-semibold">
                    {simulation.targetDate.toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                {selectedGoal.deadline && (
                  <div className="p-2 rounded-lg bg-foreground/10 text-foreground">
                    <p className="text-sm font-medium flex items-center gap-2">
                      {simulation.isOnTrack ? '✅' : '⚠️'}
                      {simulation.isOnTrack 
                        ? 'On track! Kamu bisa mencapai goal tepat waktu.'
                        : 'Perlu nabung lebih untuk mencapai target tepat waktu.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={() => setShowSimulationModal(false)}
              className="w-full"
            >
              Tutup
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
