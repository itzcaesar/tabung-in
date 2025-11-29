'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Progress } from '@/components/ui/progress';
import { Modal } from '@/components/ui/modal';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { goalCategories } from '@/lib/constants/goals';
import { updateGoal, deleteGoal, addGoalProgress } from '@/lib/actions/goals';
import Link from 'next/link';

interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetAmount: string;
  currentAmount: string;
  category: string | null;
  deadline: Date | null;
  priority: number | null;
  status: 'aktif' | 'tercapai' | 'dibatalkan';
  icon: string | null;
  color: string | null;
}

interface Props {
  goals: Goal[];
}

export function GoalsList({ goals }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [addProgressGoal, setAddProgressGoal] = useState<Goal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const activeGoals = goals.filter(g => g.status === 'aktif');
  const completedGoals = goals.filter(g => g.status === 'tercapai');

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteGoal(id);
      setDeleteConfirm(null);
    });
  };

  const handleAddProgress = (goal: Goal) => {
    const amount = parseFloat(progressAmount);
    if (isNaN(amount) || amount <= 0) return;

    startTransition(async () => {
      await addGoalProgress(goal.id, amount);
      setAddProgressGoal(null);
      setProgressAmount('');
    });
  };

  const handleMarkComplete = (goal: Goal) => {
    startTransition(async () => {
      await updateGoal(goal.id, { status: 'tercapai' });
      setActiveMenu(null);
    });
  };

  const getDaysRemaining = (deadline: Date | null) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Goals Aktif</h2>
        
        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada goals</p>
              <Link href="/dashboard/goals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Goal Pertama
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((goal) => {
              const progress = Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
              const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
              const categoryInfo = goalCategories.find(c => c.id === goal.category);
              const daysRemaining = getDaysRemaining(goal.deadline);

              return (
                <Card key={goal.id} className="hover:border-primary/30 transition-colors relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${categoryInfo?.color || '#6366f1'}20` }}
                        >
                          {categoryInfo?.icon || '🎯'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{goal.name}</h3>
                          <p className="text-xs text-muted-foreground">{categoryInfo?.name || 'Lainnya'}</p>
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <div className="relative">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => setActiveMenu(activeMenu === goal.id ? null : goal.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        
                        {activeMenu === goal.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-popover border rounded-lg shadow-lg z-10 py-1">
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                              onClick={() => {
                                setAddProgressGoal(goal);
                                setActiveMenu(null);
                              }}
                            >
                              <TrendingUp className="h-4 w-4" />
                              Tambah Progress
                            </button>
                            <Link href={`/dashboard/goals/${goal.id}/edit`}>
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
                              onClick={() => handleMarkComplete(goal)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Tandai Selesai
                            </button>
                            <button
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground"
                              onClick={() => {
                                setDeleteConfirm(goal.id);
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

                    {daysRemaining !== null && (
                      <span className="text-xs px-2 py-1 rounded-full inline-block mb-3 bg-muted text-muted-foreground">
                        {daysRemaining < 0 ? `Terlambat ${Math.abs(daysRemaining)} hari` : `${daysRemaining} hari lagi`}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Terkumpul</span>
                        <span className="font-medium text-foreground">{formatCurrency(Number(goal.currentAmount))}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sisa</span>
                        <span className="font-medium">{formatCurrency(remaining)}</span>
                      </div>

                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-bold">{formatCurrency(Number(goal.targetAmount))}</span>
                      </div>

                      {/* Quick Add Progress Button */}
                      <Button 
                        className="w-full mt-2" 
                        size="sm"
                        onClick={() => setAddProgressGoal(goal)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Tabungan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-muted-foreground">Goals Tercapai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => {
              const categoryInfo = goalCategories.find(c => c.id === goal.category);
              
              return (
                <Card key={goal.id} className="border-foreground/20 bg-foreground/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-lg bg-foreground/20"
                      >
                        <CheckCircle2 className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.name}</h3>
                        <p className="text-xs text-foreground">Tercapai! 🎉</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-center text-foreground">
                      {formatCurrency(Number(goal.targetAmount))}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Progress Modal */}
      <Modal
        isOpen={!!addProgressGoal}
        onClose={() => {
          setAddProgressGoal(null);
          setProgressAmount('');
        }}
        title="Tambah Tabungan"
      >
        {addProgressGoal && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="font-semibold">{addProgressGoal.name}</p>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-muted-foreground">Sisa target:</span>
                <span className="font-medium">
                  {formatCurrency(Number(addProgressGoal.targetAmount) - Number(addProgressGoal.currentAmount))}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Jumlah Tabungan (Rp)</label>
              <FormattedNumberInput
                placeholder="100.000"
                value={progressAmount}
                onChange={(val) => setProgressAmount(val)}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setAddProgressGoal(null);
                  setProgressAmount('');
                }}
              >
                Batal
              </Button>
              <Button 
                className="flex-1"
                onClick={() => handleAddProgress(addProgressGoal)}
                disabled={isPending || !progressAmount}
              >
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Goal?"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus goal ini? 
            Progress tabungan yang sudah tercatat akan hilang.
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
