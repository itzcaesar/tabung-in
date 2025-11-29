'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  Settings,
  LogOut,
  ScanLine,
  PiggyBank,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { logout } from '@/lib/actions/auth';
import { useState } from 'react';

const moreNavItems = [
  { href: '/dashboard/budgets', label: 'Anggaran', icon: PiggyBank },
  { href: '/dashboard/receipts', label: 'Scan Struk', icon: ScanLine },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Beranda';
    if (pathname.includes('/transactions')) return 'Transaksi';
    if (pathname.includes('/accounts')) return 'Dompet';
    if (pathname.includes('/budgets')) return 'Anggaran';
    if (pathname.includes('/receipts')) return 'Scan Struk';
    if (pathname.includes('/reports')) return 'Laporan';
    if (pathname.includes('/settings')) return 'Pengaturan';
    return 'Dashboard';
  };

  return (
    <>
      {/* Top Header - Mobile Only */}
      <header className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <Wallet className="h-4 w-4 text-background" />
            </div>
            <span className="text-base font-semibold text-foreground">{getPageTitle()}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <nav
        className={cn(
          'fixed top-14 right-0 z-40 h-[calc(100vh-3.5rem)] w-72 bg-card border-l border-border transform transition-transform duration-200 lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* More Menu Items */}
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 mb-2">
              Menu Lainnya
            </p>
            <div className="space-y-1">
              {moreNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-4">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                Keluar
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
}
