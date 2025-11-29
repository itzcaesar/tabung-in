'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  TrendingUp,
  Wallet,
  Target,
  Receipt,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { FinancialInsight } from '@/lib/services/insights';

interface Props {
  insights: FinancialInsight[];
}

const typeIcons = {
  warning: AlertTriangle,
  success: CheckCircle2,
  tip: Lightbulb,
  info: Info,
};

const typeColors = {
  warning: 'text-amber-500 bg-amber-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
  tip: 'text-blue-500 bg-blue-500/10',
  info: 'text-purple-500 bg-purple-500/10',
};

const categoryIcons = {
  spending: Wallet,
  budget: Target,
  savings: TrendingUp,
  trend: TrendingUp,
  bill: Receipt,
  general: Lightbulb,
};

export function InsightsWidget({ insights }: Props) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Wawasan Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Belum ada wawasan saat ini.</p>
            <p className="text-sm mt-2">Tambahkan lebih banyak transaksi untuk mendapatkan insight.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Wawasan Keuangan
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {insights.length} insight
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 5).map((insight) => {
          const TypeIcon = typeIcons[insight.type];
          const CategoryIcon = categoryIcons[insight.category];
          const colorClass = typeColors[insight.type];
          
          return (
            <div 
              key={insight.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                <TypeIcon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {insight.description}
                </p>
                
                {insight.actionable && (
                  <Link href={insight.actionable.href}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 h-7 px-2 text-xs"
                    >
                      {insight.actionable.label}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {insights.length > 5 && (
          <Link href="/dashboard/insights">
            <Button variant="outline" size="sm" className="w-full mt-2">
              Lihat Semua Insight ({insights.length})
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
