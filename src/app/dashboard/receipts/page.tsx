'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Select } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Modal } from '@/components/ui/modal';
import { ScanLine, Upload, Image as ImageIcon, Check, X, Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useReceiptScanner } from '@/hooks/use-receipt-scanner';
import { createTransactionFromReceipt } from '@/lib/actions/transactions';

interface Account {
  id: string;
  name: string;
  type: string;
}

export default function ReceiptsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    namaToko: '',
    tanggal: '',
    total: 0,
  });
  const {
    sedangMemindai,
    progress,
    error,
    dataStruk,
    urlGambar,
    pindaiStruk,
    reset,
  } = useReceiptScanner();

  // Fetch user accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch('/api/accounts');
        if (res.ok) {
          const data = await res.json();
          setAccounts(data);
          if (data.length > 0) {
            setSelectedAccountId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
      }
    }
    if (session?.user?.id) {
      fetchAccounts();
    }
  }, [session?.user?.id]);

  // Update edited data when dataStruk changes
  useEffect(() => {
    if (dataStruk) {
      setEditedData({
        namaToko: dataStruk.namaToko || '',
        tanggal: dataStruk.tanggal || '',
        total: dataStruk.total || 0,
      });
    }
  }, [dataStruk]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon unggah file gambar');
      return;
    }

    if (!session?.user?.id) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    await pindaiStruk(file, session.user.id);
  }, [session?.user?.id, pindaiStruk]);

  const handleSaveTransaction = async () => {
    if (!selectedAccountId) {
      alert('Pilih dompet terlebih dahulu');
      return;
    }

    setSaving(true);
    try {
      const result = await createTransactionFromReceipt({
        accountId: selectedAccountId,
        description: editedData.namaToko || 'Pembelian',
        amount: editedData.total,
        date: editedData.tanggal || new Date().toISOString(),
        receiptUrl: urlGambar || undefined,
      });

      if (result.success) {
        setShowSaveModal(false);
        reset();
        router.push('/dashboard/transactions');
      } else {
        alert(result.errors?.general?.[0] || 'Gagal menyimpan transaksi');
      }
    } catch (err) {
      console.error('Error saving transaction:', err);
      alert('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Scan Struk</h1>
        <p className="text-muted-foreground mt-1">
          Unggah struk untuk mengekstrak detail transaksi secara otomatis
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-muted-foreground" />
            Unggah Struk
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dataStruk ? (
            <div
              className={cn(
                'relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200',
                dragActive
                  ? 'border-foreground/50 bg-muted'
                  : 'border-border hover:border-foreground/30',
                sedangMemindai && 'pointer-events-none'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={sedangMemindai}
              />
              <div className="flex flex-col items-center text-center">
                {sedangMemindai ? (
                  <>
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ScanLine className="h-8 w-8 text-muted-foreground animate-pulse" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      Memproses struk...
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Mengekstrak teks dengan OCR
                    </p>
                    <div className="w-full max-w-xs">
                      <Progress value={progress} max={100} size="md" />
                      <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
                    </div>
                  </>
                ) : error ? (
                  <>
                    <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                      <X className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      Gagal memproses
                    </p>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={reset} variant="secondary">
                      Coba Lagi
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      Letakkan struk di sini
                    </p>
                    <p className="text-muted-foreground mb-4">
                      atau klik untuk memilih file
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      <span>Mendukung JPG, PNG, HEIC</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Struk berhasil dipindai</span>
                </div>
                <Button onClick={reset} variant="secondary" size="sm">
                  Scan Struk Baru
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Preview */}
                {urlGambar && (
                  <div className="rounded-xl border border-border overflow-hidden bg-muted/50 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={urlGambar}
                      alt="Struk yang dipindai"
                      className="max-w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        console.error('Gagal memuat gambar:', urlGambar);
                        e.currentTarget.src = '';
                        e.currentTarget.alt = 'Gagal memuat gambar';
                      }}
                    />
                  </div>
                )}

                {/* Extracted Data */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nama Toko</label>
                    <Input
                      value={editedData.namaToko}
                      onChange={(e) => setEditedData(prev => ({ ...prev, namaToko: e.target.value }))}
                      placeholder="Nama toko tidak terdeteksi"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Tanggal</label>
                    <Input
                      value={editedData.tanggal}
                      onChange={(e) => setEditedData(prev => ({ ...prev, tanggal: e.target.value }))}
                      placeholder="Tanggal tidak terdeteksi"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Total</label>
                    <FormattedNumberInput
                      value={String(editedData.total)}
                      onChange={(val) => setEditedData(prev => ({ ...prev, total: Number(val) }))}
                      placeholder="Total tidak terdeteksi"
                    />
                  </div>

                  {/* Items */}
                  {dataStruk.items.length > 0 && (
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Item ({dataStruk.items.length})
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {dataStruk.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted"
                          >
                            <div>
                              <p className="font-medium text-foreground">{item.nama}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.jumlah}x
                              </p>
                            </div>
                            <p className="font-medium text-foreground">
                              {formatCurrency(item.harga)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" onClick={() => setShowSaveModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Simpan sebagai Transaksi
                  </Button>
                </div>
              </div>

              {/* Raw Text (collapsible) */}
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Lihat teks asli
                </summary>
                <pre className="mt-2 p-4 rounded-lg bg-muted text-muted-foreground whitespace-pre-wrap text-xs overflow-x-auto">
                  {dataStruk.teksAsli}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      {!dataStruk && (
        <Card>
          <CardHeader>
            <CardTitle>Cara Kerja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-foreground">1</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">Unggah</h3>
                <p className="text-sm text-muted-foreground">
                  Foto atau unggah gambar struk belanja kamu
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-foreground">2</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">Ekstrak</h3>
                <p className="text-sm text-muted-foreground">
                  AI membaca struk dan mengekstrak toko, tanggal, dan item
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-foreground">3</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">Simpan</h3>
                <p className="text-sm text-muted-foreground">
                  Periksa detail dan simpan sebagai transaksi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Transaction Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Simpan Transaksi"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Pilih Dompet</label>
            {accounts.length > 0 ? (
              <Select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada dompet.{' '}
                <a href="/dashboard/accounts/new" className="text-foreground underline">
                  Buat dompet baru
                </a>
              </p>
            )}
          </div>

          <div className="p-4 rounded-lg bg-muted space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toko</span>
              <span className="font-medium text-foreground">{editedData.namaToko || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal</span>
              <span className="font-medium text-foreground">{editedData.tanggal || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-foreground">{formatCurrency(editedData.total)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowSaveModal(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveTransaction}
              disabled={saving || !selectedAccountId || accounts.length === 0}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
