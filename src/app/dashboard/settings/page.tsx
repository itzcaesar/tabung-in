import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { User, Bell, Shield, Palette, Mail, Lock, Trash2, KeyRound, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataExportImport } from '@/components/dashboard/data-export-import';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola akun dan preferensi Anda
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg">Profil</span>
              <p className="text-sm font-normal text-muted-foreground">Informasi akun Anda</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-lg text-foreground">{session.user.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
            <Input
              label="Nama Lengkap"
              defaultValue={session.user.name || ''}
              placeholder="Masukkan nama lengkap"
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{session.user.email || '-'}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
            </div>
            <Button className="w-full sm:w-auto">Simpan Perubahan</Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance Card */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500 text-white">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg">Tampilan</span>
              <p className="text-sm font-normal text-muted-foreground">Sesuaikan tampilan aplikasi</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Tema</p>
                <p className="text-sm text-muted-foreground">
                  Pilih tampilan terang atau gelap
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg">Preferensi</span>
              <p className="text-sm font-normal text-muted-foreground">Pengaturan regional dan format</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <Select label="Format Tanggal">
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
            </Select>
            <Select label="Hari Pertama Minggu">
              <option value="monday">Senin</option>
              <option value="sunday">Minggu</option>
            </Select>
            <Select label="Bahasa">
              <option value="id">Bahasa Indonesia</option>
              <option value="en" disabled>English (Coming Soon)</option>
            </Select>
            <Button className="w-full sm:w-auto">Simpan Preferensi</Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg">Notifikasi</span>
              <p className="text-sm font-normal text-muted-foreground">Atur pemberitahuan</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Bell className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Peringatan Anggaran</p>
                  <p className="text-sm text-muted-foreground">
                    Notifikasi saat mendekati batas anggaran
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ringkasan Mingguan</p>
                  <p className="text-sm text-muted-foreground">
                    Terima email ringkasan pengeluaran mingguan
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg">Keamanan</span>
              <p className="text-sm font-normal text-muted-foreground">Kelola keamanan akun</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors text-left">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Lock className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ubah Kata Sandi</p>
                  <p className="text-sm text-muted-foreground">Perbarui password akun</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border hover:bg-muted/80 transition-colors text-left">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <KeyRound className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">2FA</p>
                  <p className="text-sm text-muted-foreground">Autentikasi dua faktor</p>
                </div>
              </button>
            </div>
            <div className="pt-4 border-t border-border">
              <button className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-left w-full">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-red-500">Hapus Akun</p>
                  <p className="text-sm text-red-400/80">Hapus akun dan semua data secara permanen</p>
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export/Import Section */}
      <DataExportImport />
    </div>
  );
}
