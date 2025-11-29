'use client';

import { ReactNode } from 'react';
import { DraggableGrid } from '@/components/dashboard/draggable-grid';
import { DashboardWidgets, WidgetId } from '@/lib/utils/widget-config';

interface DashboardGridClientProps {
  widgets: DashboardWidgets;
  balanceCard: ReactNode;
  statsCard: ReactNode;
  accountsCard: ReactNode;
  chartCard: ReactNode;
  budgetsCard: ReactNode;
  billsCard: ReactNode;
  goalsCard: ReactNode;
  transactionsCard: ReactNode;
  categoriesCard: ReactNode;
}

export function DashboardGridClient({
  widgets,
  balanceCard,
  statsCard,
  accountsCard,
  chartCard,
  budgetsCard,
  billsCard,
  goalsCard,
  transactionsCard,
  categoriesCard,
}: DashboardGridClientProps) {
  const children: Record<WidgetId, ReactNode> = {
    balance: balanceCard,
    stats: statsCard,
    accounts: accountsCard,
    chart: chartCard,
    budgets: budgetsCard,
    bills: billsCard,
    goals: goalsCard,
    transactions: transactionsCard,
    categories: categoriesCard,
  };

  return (
    <DraggableGrid widgets={widgets}>
      {children}
    </DraggableGrid>
  );
}
