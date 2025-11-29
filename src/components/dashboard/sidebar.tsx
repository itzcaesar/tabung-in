'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  ScanLine,
  ChevronLeft,
  ChevronRight,
  Target,
  CalendarClock,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { logout } from '@/lib/actions/auth';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/dashboard/recurring', label: 'Berulang', icon: RefreshCw },
  { href: '/dashboard/accounts', label: 'Dompet', icon: Wallet },
  { href: '/dashboard/budgets', label: 'Anggaran', icon: PiggyBank },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/bills', label: 'Tagihan', icon: CalendarClock },
  { href: '/dashboard/receipts', label: 'Scan Struk', icon: ScanLine },
  { href: '/dashboard/reports', label: 'Laporan', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "hidden lg:block fixed left-0 top-0 z-40 h-screen bg-card/50 backdrop-blur-xl border-r border-border transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-border px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground flex-shrink-0">
              <Wallet className="h-5 w-5 text-background" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold text-foreground">Tabung.in</span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-4 h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-1 p-3", collapsed && "px-2")}>
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                  collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn("border-t border-border p-3 space-y-2", collapsed && "px-2")}>
          {!collapsed && (
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-2">
              <ThemeToggle />
            </div>
          )}
          <form action={logout}>
            <button
              type="submit"
              title={collapsed ? 'Keluar' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-red-500/10 hover:text-red-500',
                collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && 'Keluar'}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
