import { formatCurrency, calculatePercentage } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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

  return (
    <div
      className={cn(
        'rounded-xl bg-card border border-border p-4 hover:border-foreground/20 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-foreground">{name}</h4>
          {category && <p className="text-sm text-muted-foreground">{category}</p>}
        </div>
        <span
          className={cn(
            'text-sm font-medium px-2 py-1 rounded-lg',
            isOverBudget
              ? 'bg-red-500/20 text-red-500'
              : percentage >= 80
              ? 'bg-amber-500/20 text-amber-500'
              : 'bg-emerald-500/20 text-emerald-500'
          )}
        >
          {percentage.toFixed(0)}%
        </span>
      </div>

      <Progress value={spent} max={limit} size="md" className="mb-3" />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {formatCurrency(spent)} dari {formatCurrency(limit)}
        </span>
        <span
          className={cn(
            'font-medium',
            isOverBudget ? 'text-red-500' : 'text-emerald-500'
          )}
        >
          {isOverBudget ? 'Lebih ' : ''}
          {formatCurrency(Math.abs(remaining))}
          {!isOverBudget && ' tersisa'}
        </span>
      </div>
    </div>
  );
}
