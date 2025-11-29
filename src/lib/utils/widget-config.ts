import type { Layout } from 'react-grid-layout';

// Widget types available in the dashboard
export type WidgetId = 
  | 'stats'
  | 'chart'
  | 'accounts'
  | 'transactions'
  | 'budgets'
  | 'bills'
  | 'goals'
  | 'news'
  | 'categories'
  | 'balance'
  | 'insights';

export type WidgetSize = 'small' | 'medium' | 'large';

// Grid layout position for each widget
export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetConfig {
  enabled: boolean;
  layout: WidgetLayout;
}

export interface DashboardWidgets {
  [key: string]: WidgetConfig;
}

// Convert to react-grid-layout format
export function toGridLayout(widgets: DashboardWidgets): Layout[] {
  return Object.entries(widgets)
    .filter(([_, config]) => config.enabled)
    .map(([id, config]) => ({
      i: id,
      x: config.layout.x,
      y: config.layout.y,
      w: config.layout.w,
      h: config.layout.h,
      minW: config.layout.minW,
      minH: config.layout.minH,
      maxW: config.layout.maxW,
      maxH: config.layout.maxH,
    }));
}

// Convert from react-grid-layout format back to DashboardWidgets
export function fromGridLayout(layout: Layout[], currentWidgets: DashboardWidgets): DashboardWidgets {
  const updatedWidgets = { ...currentWidgets };
  
  layout.forEach((item) => {
    if (updatedWidgets[item.i]) {
      updatedWidgets[item.i] = {
        ...updatedWidgets[item.i],
        layout: {
          ...updatedWidgets[item.i].layout,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        },
      };
    }
  });
  
  return updatedWidgets;
}

// Grid columns
export const GRID_COLS = 12;
export const GRID_ROW_HEIGHT = 80;

// Default widget configuration with grid layout
export const defaultWidgetConfig: DashboardWidgets = {
  balance: { 
    enabled: true, 
    layout: { x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 } 
  },
  stats: { 
    enabled: true, 
    layout: { x: 0, y: 2, w: 12, h: 2, minW: 6, minH: 2, maxH: 3 } 
  },
  accounts: { 
    enabled: true, 
    layout: { x: 0, y: 4, w: 5, h: 4, minW: 3, minH: 3 } 
  },
  chart: { 
    enabled: true, 
    layout: { x: 5, y: 4, w: 7, h: 4, minW: 4, minH: 3 } 
  },
  budgets: { 
    enabled: true, 
    layout: { x: 0, y: 8, w: 12, h: 3, minW: 6, minH: 2 } 
  },
  bills: { 
    enabled: true, 
    layout: { x: 0, y: 11, w: 4, h: 4, minW: 3, minH: 3 } 
  },
  goals: { 
    enabled: true, 
    layout: { x: 4, y: 11, w: 4, h: 4, minW: 3, minH: 3 } 
  },
  news: { 
    enabled: true, 
    layout: { x: 8, y: 11, w: 4, h: 4, minW: 3, minH: 3 } 
  },
  transactions: { 
    enabled: true, 
    layout: { x: 0, y: 15, w: 6, h: 4, minW: 4, minH: 3 } 
  },
  categories: { 
    enabled: true, 
    layout: { x: 6, y: 15, w: 6, h: 4, minW: 4, minH: 3 } 
  },
  insights: { 
    enabled: true, 
    layout: { x: 0, y: 19, w: 12, h: 4, minW: 4, minH: 3 } 
  },
};

// Widget metadata for UI
export const widgetMetadata: Record<WidgetId, { name: string; description: string; icon: string }> = {
  balance: { 
    name: 'Total Saldo', 
    description: 'Kartu saldo total dengan ringkasan keuangan',
    icon: '💰'
  },
  stats: { 
    name: 'Statistik', 
    description: 'Ringkasan saldo, pemasukan, dan pengeluaran',
    icon: '📊'
  },
  chart: { 
    name: 'Grafik Pengeluaran', 
    description: 'Visualisasi pengeluaran mingguan',
    icon: '📈'
  },
  accounts: { 
    name: 'Dompet', 
    description: 'Daftar semua dompet dan saldo',
    icon: '💳'
  },
  transactions: { 
    name: 'Transaksi Terakhir', 
    description: 'Riwayat transaksi terbaru',
    icon: '💸'
  },
  budgets: { 
    name: 'Anggaran', 
    description: 'Status anggaran bulanan',
    icon: '📋'
  },
  bills: { 
    name: 'Tagihan', 
    description: 'Tagihan yang akan jatuh tempo',
    icon: '🔔'
  },
  goals: { 
    name: 'Target Tabungan', 
    description: 'Progress target tabungan',
    icon: '🎯'
  },
  news: { 
    name: 'Berita Finansial', 
    description: 'Berita dan tips keuangan terkini',
    icon: '📰'
  },
  categories: { 
    name: 'Kategori Pengeluaran', 
    description: 'Breakdown pengeluaran per kategori',
    icon: '🏷️'
  },
  insights: { 
    name: 'Wawasan Keuangan', 
    description: 'Tips dan insight cerdas berdasarkan data keuanganmu',
    icon: '✨'
  },
};
