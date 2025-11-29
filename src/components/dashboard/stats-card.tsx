import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  className,
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl md:rounded-2xl bg-card backdrop-blur-xl border border-border p-4 md:p-6',
        'hover:border-foreground/20 hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-1 md:mt-2 text-lg md:text-2xl lg:text-3xl font-bold text-foreground truncate">
            {formatCurrency(value)}
          </p>
          {change !== undefined && (
            <div className="mt-1 md:mt-2 flex items-center gap-1">
              {isPositive && <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />}
              {isNegative && <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />}
              {!isPositive && !isNegative && <Minus className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />}
              <span
                className={cn(
                  'text-xs md:text-sm font-medium',
                  isPositive && 'text-emerald-500',
                  isNegative && 'text-red-500',
                  !isPositive && !isNegative && 'text-muted-foreground'
                )}
              >
                {isPositive && '+'}
                {change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-muted">
            {icon}
          </div>
        )}
      </div>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-foreground/10 to-transparent blur-2xl" />
    </div>
  );
}
