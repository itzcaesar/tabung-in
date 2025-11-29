import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { User, Bell, Shield, Palette, Database } from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola akun dan preferensi Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-foreground" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input
              label="Nama"
              defaultValue={session.user.name || ''}
              placeholder="Nama Anda"
            />
            <Input
              label="Email"
              type="email"
              defaultValue={session.user.email || ''}
              disabled
            />
            <Button>Simpan Perubahan</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-foreground" />
            Preferensi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Select label="Format Tanggal">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </Select>
            <Select label="Hari Pertama Minggu">
              <option value="monday">Senin</option>
              <option value="sunday">Minggu</option>
            </Select>
            <Button>Simpan Preferensi</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-foreground" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
              <div>
                <p className="font-medium text-foreground">Peringatan Anggaran</p>
                <p className="text-sm text-muted-foreground">
                  Dapatkan notifikasi saat mendekati batas anggaran
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
              <div>
                <p className="font-medium text-foreground">Ringkasan Mingguan</p>
                <p className="text-sm text-muted-foreground">
                  Terima email ringkasan pengeluaran mingguan
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-foreground" />
            Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="secondary">Ubah Kata Sandi</Button>
            <Button variant="secondary">Aktifkan Autentikasi Dua Faktor</Button>
            <div className="pt-4 border-t border-border">
              <Button variant="destructive">Hapus Akun</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-foreground" />
            Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="secondary">Ekspor Semua Data</Button>
            <Button variant="secondary">Impor Transaksi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
