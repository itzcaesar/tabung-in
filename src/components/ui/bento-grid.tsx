import { cn } from '@/lib/utils';
import { type HTMLAttributes, type ReactNode } from 'react';

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  variant?: 'default' | 'featured' | 'accent';
}

export function BentoCard({
  className,
  title,
  description,
  icon,
  colSpan = 1,
  rowSpan = 1,
  variant = 'default',
  children,
  ...props
}: BentoCardProps) {
  const colSpanClasses = {
    1: '',
    2: 'md:col-span-2',
    3: 'md:col-span-2 lg:col-span-3',
    4: 'md:col-span-2 lg:col-span-3 xl:col-span-4',
  };

  const rowSpanClasses = {
    1: '',
    2: 'row-span-2',
    3: 'row-span-3',
  };

  const variantClasses = {
    default: 'bg-card border-border',
    featured: 'bg-gradient-to-br from-muted to-card border-border',
    accent: 'bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border-emerald-500/20 dark:from-emerald-600/20 dark:to-teal-600/20',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 transition-all duration-300',
        'hover:border-foreground/20 hover:shadow-xl hover:shadow-black/5 hover:scale-[1.02]',
        variantClasses[variant],
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 h-full flex flex-col">
        {(icon || title || description) && (
          <div className="mb-4">
            {icon && (
              <div className="mb-3 w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                {icon}
              </div>
            )}
            {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
