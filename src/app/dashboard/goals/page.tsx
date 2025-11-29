import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { goalCategories } from '@/lib/constants/goals';

async function getGoalsData(userId: string) {
  const allGoals = await db.query.goals.findMany({
    where: eq(goals.userId, userId),
    orderBy: [desc(goals.createdAt)],
  });

  const activeGoals = allGoals.filter(g => g.status === 'aktif');
  const completedGoals = allGoals.filter(g => g.status === 'tercapai');
  
  const totalTarget = activeGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const totalCollected = activeGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);

  return {
    allGoals,
    activeGoals,
    completedGoals,
    totalTarget,
    totalCollected,
  };
}

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getGoalsData(session.user.id);
  const overallProgress = data.totalTarget > 0 
    ? Math.round((data.totalCollected / data.totalTarget) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tetapkan target tabungan dan lacak progressmu
          </p>
        </div>
        <Link href="/dashboard/goals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Goal
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goals Aktif</p>
                <p className="text-2xl font-bold">{data.activeGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goals Tercapai</p>
                <p className="text-2xl font-bold">{data.completedGoals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Target</p>
                <p className="text-xl font-bold">{formatCurrency(data.totalTarget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-xl font-bold">{overallProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      {data.totalTarget > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progress Keseluruhan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(data.totalCollected)} dari {formatCurrency(data.totalTarget)}
                </span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Goals Aktif</h2>
        
        {data.activeGoals.length === 0 ? (
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
            {data.activeGoals.map((goal) => {
              const progress = Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
              const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
              const categoryInfo = goalCategories.find(c => c.id === goal.category);
              
              // Calculate days remaining
              let daysRemaining = null;
              if (goal.deadline) {
                const deadline = new Date(goal.deadline);
                const now = new Date();
                daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              }

              return (
                <Card key={goal.id} className="hover:border-primary/30 transition-colors">
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
                      {daysRemaining !== null && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          daysRemaining < 0 ? 'bg-red-500/10 text-red-500' :
                          daysRemaining < 30 ? 'bg-amber-500/10 text-amber-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {daysRemaining < 0 ? 'Terlambat' : `${daysRemaining} hari`}
                        </span>
                      )}
                    </div>

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
                        <span className="font-medium text-emerald-500">{formatCurrency(Number(goal.currentAmount))}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sisa</span>
                        <span className="font-medium">{formatCurrency(remaining)}</span>
                      </div>

                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-bold">{formatCurrency(Number(goal.targetAmount))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {data.completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Goals Tercapai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.completedGoals.map((goal) => {
              const categoryInfo = goalCategories.find(c => c.id === goal.category);
              
              return (
                <Card key={goal.id} className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-lg bg-emerald-500/20"
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.name}</h3>
                        <p className="text-xs text-emerald-500">Tercapai!</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-center text-emerald-500">
                      {formatCurrency(Number(goal.targetAmount))}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
