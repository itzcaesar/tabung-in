'use client';

import { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
}

const COLORS = [
  '#18181b',
  '#3f3f46',
  '#52525b',
  '#71717a',
  '#a1a1aa',
  '#10b981',
  '#ef4444',
  '#f59e0b',
];

// Optimize: Memoize component to prevent unnecessary re-renders
export const CategoryBreakdown = memo(function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || COLORS[index % COLORS.length],
      percentage: total > 0 ? item.value / total : 0,
    }));
  }, [data, total]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <p className="text-muted-foreground">Belum ada data pengeluaran</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Tambah pengeluaran untuk melihat rincian</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="w-[180px] h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Pengeluaran']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2">
        {chartData.slice(0, 5).map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-sm text-foreground/80 truncate">{item.name}</span>
            <span className="text-sm font-medium text-foreground">
              {formatPercent(item.percentage)}
            </span>
          </div>
        ))}
        {chartData.length > 5 && (
          <p className="text-sm text-muted-foreground">+{chartData.length - 5} lainnya</p>
        )}
      </div>
    </div>
  );
});
