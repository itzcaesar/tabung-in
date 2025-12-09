'use client';

import { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ExpenseChartProps {
  data: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
}

// Optimize: Memoize component to prevent unnecessary re-renders
export const ExpenseChart = memo(function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      dateLabel: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#71717a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="dateLabel"
            className="fill-muted-foreground"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="fill-muted-foreground"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === 'income' ? 'Pemasukan' : 'Pengeluaran',
            ]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#71717a"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
