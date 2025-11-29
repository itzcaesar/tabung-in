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
import { GoalsList } from './goals-list';

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
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-foreground" />
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
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-foreground" />
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
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-foreground" />
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
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-foreground" />
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

      {/* Goals List - using client component for interactivity */}
      <GoalsList goals={data.allGoals} />
    </div>
  );
}
