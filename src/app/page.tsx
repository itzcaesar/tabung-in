'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  PiggyBank, 
  BarChart3, 
  Shield, 
  Smartphone,
  ScanLine,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Heart,
  Play,
  ChevronDown,
  Sparkles,
  Zap,
  CreditCard,
  LineChart,
  Target,
  Newspaper,
  Calculator,
  CalendarClock,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LandingNewsTicker } from '@/components/landing-news-ticker';
import { formatRupiah, demoStats, demoDompets } from '@/lib/demo-data';

// Brand data with colors and initials
const walletBrands = [
  { name: 'GoPay', color: '#00AA13', initials: 'GP', textColor: '#FFFFFF' },
  { name: 'OVO', color: '#4C3494', initials: 'OVO', textColor: '#FFFFFF' },
  { name: 'DANA', color: '#108EE9', initials: 'DA', textColor: '#FFFFFF' },
  { name: 'ShopeePay', color: '#EE4D2D', initials: 'SP', textColor: '#FFFFFF' },
  { name: 'LinkAja', color: '#E31E25', initials: 'LA', textColor: '#FFFFFF' },
  { name: 'Jenius', color: '#00A8E8', initials: 'J', textColor: '#FFFFFF' },
];

const bankBrands = [
  { name: 'BCA', color: '#0066B3', initials: 'BCA', textColor: '#FFFFFF' },
  { name: 'Mandiri', color: '#003D79', initials: 'MDR', textColor: '#FFFFFF' },
  { name: 'BNI', color: '#F15A23', initials: 'BNI', textColor: '#FFFFFF' },
  { name: 'BRI', color: '#0066B3', initials: 'BRI', textColor: '#FFFFFF' },
];

const faqs = [
  {
    question: 'Apakah Tabung.in gratis?',
    answer: 'Ya, 100% gratis selamanya. Tidak ada biaya tersembunyi atau langganan premium.'
  },
  {
    question: 'Bagaimana cara kerja scan struk?',
    answer: 'Foto struk belanjamu, AI OCR akan otomatis mendeteksi detail transaksi. Tinggal konfirmasi dan simpan.'
  },
  {
    question: 'Apakah data saya aman?',
    answer: 'Ya, semua data terenkripsi dan tidak pernah dibagikan ke pihak ketiga.'
  },
  {
    question: 'Apakah terhubung ke rekening bank?',
    answer: 'Tidak. Ini aplikasi pencatatan manual, lebih aman karena tidak perlu akses ke akun aslimu.'
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-background">
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-2.5 px-4 text-sm">
        <span className="font-medium">🎉 Tabung.in sudah tersedia!</span>
        <span className="mx-2 hidden sm:inline">·</span>
        <span className="hidden sm:inline">100% Gratis untuk semua orang Indonesia</span>
        <Link href="/register" className="ml-2 underline underline-offset-2 hover:no-underline font-medium">
          Daftar Sekarang →
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
              <Wallet className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-bold text-foreground">Tabung.in</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Demo</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Mulai Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl"></div>
        </div>
        
        {/* Floating Brand Logos - Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* GoPay */}
          <div className="absolute top-[18%] left-[10%] animate-float-slow">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00AED6] rounded-2xl blur-xl opacity-40"></div>
              <div className="relative h-14 w-14 rounded-2xl bg-[#00AED6] flex items-center justify-center text-white font-bold text-sm opacity-40">GP</div>
            </div>
          </div>
          {/* OVO */}
          <div className="absolute top-[22%] right-[15%] animate-float-medium">
            <div className="relative">
              <div className="absolute inset-0 bg-[#4C3494] rounded-xl blur-xl opacity-50"></div>
              <div className="relative h-12 w-12 rounded-xl bg-[#4C3494] flex items-center justify-center text-white font-bold text-xs opacity-45">OVO</div>
            </div>
          </div>
          {/* DANA */}
          <div className="absolute top-[45%] left-[6%] animate-float-fast">
            <div className="relative">
              <div className="absolute inset-0 bg-[#108EE9] rounded-2xl blur-xl opacity-35"></div>
              <div className="relative h-16 w-16 rounded-2xl bg-[#108EE9] flex items-center justify-center text-white font-bold text-sm opacity-35">DA</div>
            </div>
          </div>
          {/* ShopeePay */}
          <div className="absolute top-[55%] right-[10%] animate-float-slow">
            <div className="relative">
              <div className="absolute inset-0 bg-[#EE4D2D] rounded-2xl blur-xl opacity-40"></div>
              <div className="relative h-14 w-14 rounded-2xl bg-[#EE4D2D] flex items-center justify-center text-white font-bold text-xs opacity-40">SP</div>
            </div>
          </div>
          {/* BCA */}
          <div className="absolute top-[30%] left-[18%] animate-float-medium">
            <div className="relative">
              <div className="absolute inset-0 bg-[#003D79] rounded-xl blur-xl opacity-35"></div>
              <div className="relative h-12 w-12 rounded-xl bg-[#003D79] flex items-center justify-center text-white font-bold text-xs opacity-35">BCA</div>
            </div>
          </div>
          {/* Mandiri */}
          <div className="absolute top-[65%] left-[12%] animate-float-fast">
            <div className="relative">
              <div className="absolute inset-0 bg-[#003366] rounded-xl blur-xl opacity-40"></div>
              <div className="relative h-11 w-11 rounded-xl bg-[#003366] flex items-center justify-center text-white font-bold text-[10px] opacity-40">MDR</div>
            </div>
          </div>
          {/* BNI */}
          <div className="absolute top-[38%] right-[18%] animate-float-slow">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F15A22] rounded-xl blur-xl opacity-45"></div>
              <div className="relative h-12 w-12 rounded-xl bg-[#F15A22] flex items-center justify-center text-white font-bold text-xs opacity-45">BNI</div>
            </div>
          </div>
          {/* BRI */}
          <div className="absolute top-[50%] left-[20%] animate-float-medium">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00529C] rounded-xl blur-xl opacity-35"></div>
              <div className="relative h-12 w-12 rounded-xl bg-[#00529C] flex items-center justify-center text-white font-bold text-xs opacity-35">BRI</div>
            </div>
          </div>
          {/* LinkAja */}
          <div className="absolute top-[70%] right-[20%] animate-float-fast">
            <div className="relative">
              <div className="absolute inset-0 bg-[#E31E25] rounded-lg blur-xl opacity-40"></div>
              <div className="relative h-10 w-10 rounded-lg bg-[#E31E25] flex items-center justify-center text-white font-bold text-[10px] opacity-40">LA</div>
            </div>
          </div>
          {/* Jenius */}
          <div className="absolute top-[42%] right-[6%] animate-float-slow">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00B5AD] rounded-2xl blur-xl opacity-35"></div>
              <div className="relative h-14 w-14 rounded-2xl bg-[#00B5AD] flex items-center justify-center text-white font-bold text-sm opacity-35">J</div>
            </div>
          </div>
          {/* Jago */}
          <div className="absolute top-[12%] right-[22%] animate-float-medium">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFCD00] rounded-xl blur-xl opacity-45"></div>
              <div className="relative h-11 w-11 rounded-xl bg-[#FFCD00] flex items-center justify-center text-black font-bold text-xs opacity-45">JG</div>
            </div>
          </div>
          {/* CIMB */}
          <div className="absolute top-[60%] left-[5%] animate-float-fast">
            <div className="relative">
              <div className="absolute inset-0 bg-[#EC1C24] rounded-lg blur-xl opacity-35"></div>
              <div className="relative h-10 w-10 rounded-lg bg-[#EC1C24] flex items-center justify-center text-white font-bold text-[9px] opacity-35">CIMB</div>
            </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm mb-8 border border-emerald-500/20">
            <Sparkles className="h-4 w-4" />
            <span>Aplikasi Keuangan #1 untuk Indonesia</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-foreground drop-shadow-[0_0_25px_rgba(255,255,255,0.15)] dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.2)]">Kelola Uangmu.</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]">Raih Tujuanmu.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Satu dashboard untuk semua e-wallet, bank, dan uang tunai. Lacak pengeluaran dan atur anggaran dengan mudah.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto gap-2 hover:bg-muted transition-all">
                <Play className="h-5 w-5" />
                Lihat Demo
              </Button>
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span>Gratis Selamanya</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              <span>Data Terenkripsi</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-500" />
              <span>Tanpa Iklan</span>
            </div>
          </div>
        </div>
      </section>

      {/* News Ticker */}
      <LandingNewsTicker />

      {/* Dashboard Preview */}
      <section className="pb-20 px-6 pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50"></div>
            
            {/* Dashboard Card */}
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
                  <p className="text-2xl font-bold text-foreground">{formatRupiah(demoStats.totalSaldo)}</p>
                  <p className="text-xs text-emerald-500 mt-1">+12% dari bulan lalu</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 border border-blue-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Pemasukan</p>
                  <p className="text-2xl font-bold text-emerald-500">{formatRupiah(demoStats.pemasukanBulanIni)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-4 border border-red-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-500">{formatRupiah(demoStats.pengeluaranBulanIni)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Dompet Aktif</p>
                  <p className="text-2xl font-bold text-foreground">{demoDompets.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Terhubung</p>
                </div>
              </div>
              
              {/* Wallet List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Dompet Digital</p>
                  {demoDompets.slice(0, 3).map((dompet) => (
                    <div key={dompet.id} className="flex items-center justify-between bg-muted/50 hover:bg-muted rounded-xl p-4 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-md"
                          style={{ backgroundColor: dompet.color, color: dompet.textColor || '#FFFFFF' }}
                        >
                          {dompet.initials}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{dompet.name}</p>
                          <p className="text-xs text-muted-foreground">{dompet.type === 'emoney' ? 'E-Money' : dompet.type === 'rekening' ? 'Rekening' : 'Tunai'}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">{formatRupiah(dompet.balance)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Transaksi Terakhir</p>
                  <div className="space-y-2">
                    {[
                      { desc: 'Kopi Kenangan', amount: -45000, category: 'Makanan' },
                      { desc: 'Gaji November', amount: 8500000, category: 'Pemasukan' },
                      { desc: 'Grab ke Kantor', amount: -35000, category: 'Transportasi' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                        <div>
                          <p className="font-medium text-foreground">{tx.desc}</p>
                          <p className="text-xs text-muted-foreground">{tx.category}</p>
                        </div>
                        <p className={`font-semibold ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {tx.amount > 0 ? '+' : ''}{formatRupiah(Math.abs(tx.amount))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Wallets */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Dukung Semua Dompet Digital
            </h2>
            <p className="text-muted-foreground">E-wallet dan bank populer Indonesia</p>
          </div>
          
          {/* Brand Logos */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[...walletBrands, ...bankBrands].map((brand) => (
              <div
                key={brand.name}
                className="flex items-center gap-3 bg-card border border-border px-5 py-3 rounded-2xl hover:scale-105 hover:shadow-lg hover:border-foreground/20 transition-all duration-300"
              >
                <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-md"
                  style={{ backgroundColor: brand.color, color: brand.textColor }}
                >
                  {brand.initials}
                </div>
                <span className="font-medium text-foreground">{brand.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 bg-card border border-dashed border-border px-5 py-3 rounded-2xl">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-500 text-white text-lg">
                💵
              </div>
              <span className="font-medium text-foreground">Uang Tunai</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground/60 max-w-2xl mx-auto">
            ⚠️ Tabung.in tidak berafiliasi dengan perusahaan-perusahaan di atas. Semua merek dagang adalah milik masing-masing perusahaan.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Fitur Unggulan
            </h2>
            <p className="text-muted-foreground">Semua yang kamu butuhkan untuk mengelola keuangan</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ScanLine className="h-6 w-6" />}
              title="Scan Struk OCR"
              description="Foto struk dan AI akan mengekstrak detail transaksi otomatis. Mendukung format struk Indonesia."
              color="emerald"
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Multi Dompet"
              description="Kelola GoPay, OVO, DANA, rekening bank, dan tunai dalam satu dashboard yang rapi."
              color="blue"
            />
            <FeatureCard
              icon={<PiggyBank className="h-6 w-6" />}
              title="Anggaran Cerdas"
              description="Atur batas pengeluaran per kategori dan dapatkan peringatan sebelum over budget."
              color="purple"
            />
            <FeatureCard
              icon={<LineChart className="h-6 w-6" />}
              title="Laporan Visual"
              description="Grafik interaktif untuk memahami kemana uangmu pergi setiap hari, minggu, dan bulan."
              color="amber"
            />
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Goals & Simulasi"
              description="Tetapkan target tabungan dan simulasi berapa lama untuk mencapainya dengan nabung harian."
              color="rose"
            />
            <FeatureCard
              icon={<CalendarClock className="h-6 w-6" />}
              title="Pengingat Tagihan"
              description="Catat tagihan bulanan dan dapatkan reminder sebelum jatuh tempo."
              color="cyan"
            />
            <FeatureCard
              icon={<Newspaper className="h-6 w-6" />}
              title="Berita Finansial"
              description="Update tips keuangan dan berita finansial terkini langsung di dashboard."
              color="emerald"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Privasi Terjamin"
              description="Data terenkripsi, tanpa iklan, tanpa penjualan data. Keuanganmu adalah rahasiamu."
              color="amber"
            />
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section id="demo" className="py-20 px-6 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Lihat Tabung.in Beraksi
            </h2>
            <p className="text-muted-foreground">Coba demo interaktif tanpa perlu daftar</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Features List */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Dashboard Lengkap</h3>
                  <p className="text-muted-foreground text-sm">Lihat total saldo, pemasukan, pengeluaran dalam satu tampilan</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <ScanLine className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Scan Struk Otomatis</h3>
                  <p className="text-muted-foreground text-sm">Foto struk dan AI akan input transaksi otomatis</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Laporan Visual</h3>
                  <p className="text-muted-foreground text-sm">Grafik interaktif untuk analisis keuangan bulanan</p>
                </div>
              </div>
              
              <Link href="/demo">
                <Button size="lg" className="mt-4 w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Coba Demo Sekarang
                </Button>
              </Link>
            </div>
            
            {/* Mini Preview Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground">Total Saldo</p>
                  <p className="text-lg font-bold text-foreground">{formatRupiah(demoStats.totalSaldo)}</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                  <p className="text-xs text-muted-foreground">Pengeluaran</p>
                  <p className="text-lg font-bold text-red-500">{formatRupiah(demoStats.pengeluaranBulanIni)}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Dompet</p>
              <div className="space-y-2">
                {demoDompets.slice(0, 3).map((dompet) => (
                  <div key={dompet.id} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: dompet.color, color: dompet.textColor || '#FFFFFF' }}
                      >
                        {dompet.initials}
                      </div>
                      <span className="text-sm font-medium text-foreground">{dompet.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatRupiah(dompet.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">FAQ</h2>
            <p className="text-muted-foreground">Pertanyaan umum tentang Tabung.in</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-2xl overflow-hidden bg-card">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mulai Kelola Keuanganmu
          </h2>
          <p className="text-muted-foreground mb-8">
            Gratis selamanya. Tanpa kartu kredit.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 group shadow-lg shadow-primary/25">
              Daftar Gratis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                  <Wallet className="h-5 w-5 text-background" />
                </div>
                <span className="text-xl font-bold text-foreground">Tabung.in</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Aplikasi pencatatan keuangan pribadi untuk orang Indonesia. Kelola semua dompet digital dan rekening bankmu dalam satu dashboard.
              </p>
              <p className="text-sm text-muted-foreground">
                Pertanyaan? Email kami di{' '}
                <a href="mailto:hello@tabung.in" className="text-foreground hover:underline">hello@tabung.in</a>
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">Demo</Link></li>
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Syarat & Ketentuan</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="border-t border-border pt-8">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center leading-relaxed">
                <strong>⚠️ Disclaimer:</strong> Tabung.in adalah aplikasi pencatatan keuangan independen dan <strong>TIDAK berafiliasi</strong> dengan GoPay, OVO, DANA, ShopeePay, LinkAja, Jenius, BCA, Mandiri, BNI, BRI, atau perusahaan lainnya. Semua merek dagang adalah milik masing-masing perusahaan.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                &copy; {new Date().getFullYear()} Tabung.in. Dibuat dengan <Heart className="inline h-4 w-4 text-red-500" /> di Indonesia.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Open source project untuk edukasi dan penggunaan pribadi.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'cyan';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white',
    blue: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white',
    purple: 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white',
    amber: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white',
    rose: 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white',
    cyan: 'bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white',
  };

  return (
    <div className="group rounded-2xl bg-card border border-border p-6 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}


