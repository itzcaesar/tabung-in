'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, Receipt, PiggyBank, BarChart3, Shield, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
              <Wallet className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-bold text-foreground">Tabung.in</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Mulai Sekarang</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Kelola Keuanganmu</span>
            <br />
            <span className="text-foreground">Dengan Lebih Cerdas</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lacak pengeluaran, scan struk belanja, atur anggaran, dan visualisasikan
            perjalanan keuanganmu dengan dashboard yang indah.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Coba Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Lihat Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Receipt className="h-6 w-6 text-muted-foreground" />}
              title="Scan Struk Otomatis"
              description="Foto struk belanjamu dan biarkan AI mengekstrak detailnya secara otomatis."
            />
            <FeatureCard
              icon={<PiggyBank className="h-6 w-6 text-muted-foreground" />}
              title="Anggaran Cerdas"
              description="Atur anggaran per kategori dan dapatkan peringatan sebelum melebihi batas."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-muted-foreground" />}
              title="Laporan Visual"
              description="Grafik dan insight yang indah untuk memahami pola pengeluaranmu."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-muted-foreground" />}
              title="Cepat & Responsif"
              description="Dibangun dengan teknologi modern untuk update instan dan sinkronisasi real-time."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-muted-foreground" />}
              title="Keamanan Terjamin"
              description="Datamu dienkripsi dan dilindungi dengan keamanan tingkat enterprise."
            />
            <FeatureCard
              icon={<Wallet className="h-6 w-6 text-muted-foreground" />}
              title="Multi Rekening"
              description="Lacak tunai, kartu, dan investasi semua dalam satu tempat."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Tabung.in. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privasi
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Ketentuan
            </Link>
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl bg-card backdrop-blur-xl border border-border p-6 transition-all duration-300 hover:border-foreground/20 hover:bg-muted">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
