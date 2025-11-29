'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Smartphone,
  Banknote,
} from 'lucide-react';
import {
  demoDompets,
  demoTransaksis,
  demoAnggarans,
  demoStats,
  demoChartData,
  demoCategoryBreakdown,
  formatRupiah,
  getRecentTransactions,
} from '@/lib/demo-data';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DemoPage() {
  const recentTransactions = getRecentTransactions(5);

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-foreground text-background py-2 px-4 text-center text-sm">
        🎯 Mode Demo - Data ini adalah contoh untuk demonstrasi fitur Tabung.in
        <Link href="/register" className="ml-2 underline font-medium">
          Daftar untuk mulai
        </Link>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                <Wallet className="h-5 w-5 text-background" />
              </div>
              <span className="text-xl font-bold text-foreground">Tabung.in</span>
            </Link>
            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Selamat Datang, Pengguna Demo! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ini adalah tampilan dashboard dengan data contoh
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-muted-foreground text-sm">Total Saldo</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {formatRupiah(demoStats.totalSaldo)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-muted-foreground text-sm">Pemasukan</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-emerald-500">
                +{formatRupiah(demoStats.pemasukanBulanIni)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-muted-foreground text-sm">Pengeluaran</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-red-500">
                -{formatRupiah(demoStats.pengeluaranBulanIni)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-muted-foreground text-sm">Tabungan</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-purple-500">
                {formatRupiah(demoStats.tabunganBulanIni)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Virtual Dompet */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Virtual Dompet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoDompets.map((dompet) => (
                <div
                  key={dompet.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Brand Logo/Initials */}
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-md"
                      style={{ 
                        backgroundColor: dompet.color,
                        color: dompet.textColor || '#FFFFFF'
                      }}
                    >
                      {dompet.initials}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{dompet.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {dompet.type === 'emoney' ? 'E-Money' : dompet.type === 'rekening' ? 'Rekening Bank' : 'Tunai'}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">{formatRupiah(dompet.balance)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Aktivitas 7 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart data={demoChartData} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaksi Terbaru */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaksi Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentTransactions.map((trx) => (
                <div
                  key={trx.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50"
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      trx.type === 'pemasukan' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}
                  >
                    {trx.type === 'pemasukan' ? (
                      <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{trx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {trx.category?.name} · {trx.account?.name}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      trx.type === 'pemasukan' ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {trx.type === 'pemasukan' ? '+' : '-'}
                    {formatRupiah(trx.amount)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kategori Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown data={demoCategoryBreakdown} />
            </CardContent>
          </Card>
        </div>

        {/* Anggaran */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Anggaran Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {demoAnggarans.map((anggaran) => {
                const percentage = (anggaran.spent / (anggaran.amount || 1)) * 100;
                const isOverBudget = percentage > 100;
                const isWarning = percentage > 80;
                return (
                  <div
                    key={anggaran.id}
                    className="p-4 rounded-xl bg-muted/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{anggaran.category?.icon}</span>
                        <span className="font-medium text-foreground">{anggaran.name}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isOverBudget
                            ? 'bg-red-500/20 text-red-500'
                            : isWarning
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-emerald-500/20 text-emerald-500'
                        }`}
                      >
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatRupiah(anggaran.spent)}
                      </span>
                      <span className="text-foreground font-medium">
                        {formatRupiah(anggaran.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-foreground text-background">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Tertarik dengan Tabung.in?</h2>
            <p className="text-background/70 mb-6">
              Daftar sekarang dan mulai kelola keuanganmu dengan lebih baik!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Daftar Gratis
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-background hover:text-background hover:bg-background/10"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
