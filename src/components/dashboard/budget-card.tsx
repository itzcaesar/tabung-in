import { formatCurrency, calculatePercentage } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetCardProps {
  name: string;
  spent: number;
  limit: number;
  category?: string;
  icon?: string;
  className?: string;
}

export function BudgetCard({
  name,
  spent,
  limit,
  category,
  className,
}: BudgetCardProps) {
  const percentage = calculatePercentage(spent, limit);
  const remaining = limit - spent;
  const isOverBudget = spent > limit;
  const isNearLimit = percentage >= 80 && !isOverBudget;
  const isHealthy = percentage < 80;

  const StatusIcon = isOverBudget ? TrendingDown : isNearLimit ? AlertTriangle : CheckCircle;
  const statusColor = isOverBudget ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-green-500';
  const statusBg = isOverBudget ? 'bg-red-500/10' : isNearLimit ? 'bg-amber-500/10' : 'bg-green-500/10';
  const borderColor = isOverBudget ? 'border-red-500/30' : isNearLimit ? 'border-amber-500/30' : 'border-green-500/30';

  return (
    <div
      className={cn(
        'relative rounded-xl bg-card border p-5 hover:shadow-lg transition-all duration-200',
        borderColor,
        className
      )}
    >
      {/* Status Badge */}
      <div className={cn(
        'absolute top-3 right-3 p-1.5 rounded-full',
        statusBg
      )}>
        <StatusIcon className={cn('h-4 w-4', statusColor)} />
      </div>

      {/* Header */}
      <div className="mb-4 pr-8">
        <h4 className="font-semibold text-foreground text-lg">{name}</h4>
        {category && (
          <p className="text-sm text-muted-foreground mt-0.5">{category}</p>
        )}
      </div>

      {/* Amount Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(spent)}
          </span>
          <span className="text-sm text-muted-foreground">
            / {formatCurrency(limit)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <Progress 
          value={spent} 
          max={limit} 
          size="lg" 
          className={cn(
            isOverBudget ? '[&>div]:bg-red-500' : 
            isNearLimit ? '[&>div]:bg-amber-500' : 
            '[&>div]:bg-green-500'
          )} 
        />
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-sm font-medium px-2.5 py-1 rounded-lg',
          statusBg,
          statusColor
        )}>
          {percentage.toFixed(0)}% terpakai
        </span>
        <span
          className={cn(
            'text-sm font-medium',
            isOverBudget ? 'text-red-500' : 'text-green-500'
          )}
        >
          {isOverBudget ? (
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Lebih {formatCurrency(Math.abs(remaining))}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Sisa {formatCurrency(remaining)}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
