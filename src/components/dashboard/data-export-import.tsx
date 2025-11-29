'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Database,
  Wallet,
  Receipt,
  PiggyBank,
  X
} from 'lucide-react';
import { 
  exportTransactionsToCSV, 
  exportAccountsToCSV, 
  exportBudgetsToCSV,
  exportAllDataToJSON,
  importTransactionsFromCSV 
} from '@/lib/actions/data-export';

type ExportType = 'transactions' | 'accounts' | 'budgets' | 'all';

export function DataExportImport() {
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type: ExportType) => {
    setExporting(type);
    setMessage(null);
    setImportResult(null);

    try {
      let result;
      
      switch (type) {
        case 'transactions':
          result = await exportTransactionsToCSV();
          break;
        case 'accounts':
          result = await exportAccountsToCSV();
          break;
        case 'budgets':
          result = await exportBudgetsToCSV();
          break;
        case 'all':
          result = await exportAllDataToJSON();
          break;
      }

      if (result.success && result.data && result.filename) {
        const mimeType = type === 'all' ? 'application/json' : 'text/csv';
        downloadFile(result.data, result.filename, mimeType);
        setMessage({ type: 'success', text: `Data berhasil diekspor ke ${result.filename}` });
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal mengekspor data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengekspor' });
    } finally {
      setExporting(null);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Hanya file CSV yang didukung untuk impor transaksi' });
      return;
    }

    setImporting(true);
    setMessage(null);
    setImportResult(null);

    try {
      const content = await file.text();
      const result = await importTransactionsFromCSV(content);

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Impor berhasil' });
        setImportResult({ 
          imported: result.imported || 0, 
          skipped: result.skipped || 0 
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal mengimpor data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat membaca file' });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Banner */}
      {message && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl border bg-foreground/10 border-foreground/20 text-foreground">
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <div>
              <p className="font-medium">{message.text}</p>
              {importResult && (
                <p className="text-sm opacity-80">
                  {importResult.imported} diimpor, {importResult.skipped} dilewati
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={() => { setMessage(null); setImportResult(null); }}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Export Section */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-foreground text-background">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg">Ekspor Data</span>
              <p className="text-sm font-normal text-muted-foreground">
                Download data Anda dalam format CSV atau JSON
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Transactions */}
            <button
              onClick={() => handleExport('transactions')}
              disabled={exporting !== null}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted border border-border hover:bg-muted/80 hover:border-foreground/20 transition-all text-left disabled:opacity-50"
            >
              <div className="p-3 rounded-xl bg-foreground/10">
                {exporting === 'transactions' ? (
                  <Loader2 className="h-5 w-5 text-foreground animate-spin" />
                ) : (
                  <Receipt className="h-5 w-5 text-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Transaksi</p>
                <p className="text-sm text-muted-foreground">Ekspor semua transaksi (CSV)</p>
              </div>
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Export Accounts */}
            <button
              onClick={() => handleExport('accounts')}
              disabled={exporting !== null}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted border border-border hover:bg-muted/80 hover:border-foreground/20 transition-all text-left disabled:opacity-50"
            >
              <div className="p-3 rounded-xl bg-foreground/10">
                {exporting === 'accounts' ? (
                  <Loader2 className="h-5 w-5 text-foreground animate-spin" />
                ) : (
                  <Wallet className="h-5 w-5 text-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Dompet</p>
                <p className="text-sm text-muted-foreground">Ekspor semua dompet (CSV)</p>
              </div>
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Export Budgets */}
            <button
              onClick={() => handleExport('budgets')}
              disabled={exporting !== null}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted border border-border hover:bg-muted/80 hover:border-foreground/20 transition-all text-left disabled:opacity-50"
            >
              <div className="p-3 rounded-xl bg-foreground/10">
                {exporting === 'budgets' ? (
                  <Loader2 className="h-5 w-5 text-foreground animate-spin" />
                ) : (
                  <PiggyBank className="h-5 w-5 text-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Anggaran</p>
                <p className="text-sm text-muted-foreground">Ekspor semua anggaran (CSV)</p>
              </div>
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Export All Data */}
            <button
              onClick={() => handleExport('all')}
              disabled={exporting !== null}
              className="flex items-center gap-4 p-4 rounded-xl bg-foreground/10 border border-foreground/20 hover:border-foreground/40 transition-all text-left disabled:opacity-50"
            >
              <div className="p-3 rounded-xl bg-foreground/20">
                {exporting === 'all' ? (
                  <Loader2 className="h-5 w-5 text-foreground animate-spin" />
                ) : (
                  <Database className="h-5 w-5 text-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Semua Data</p>
                <p className="text-sm text-muted-foreground">Backup lengkap (JSON)</p>
              </div>
              <FileJson className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-foreground text-background">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg">Impor Data</span>
              <p className="text-sm font-normal text-muted-foreground">
                Upload file CSV untuk mengimpor transaksi
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div 
            onClick={handleImportClick}
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-foreground/30 hover:bg-muted/50 transition-all cursor-pointer"
          >
            {importing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-12 w-12 text-foreground animate-spin" />
                <p className="text-foreground font-medium">Mengimpor data...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-2xl bg-foreground/10">
                    <Upload className="h-8 w-8 text-foreground" />
                  </div>
                </div>
                <p className="text-foreground font-medium mb-1">
                  Klik untuk memilih file CSV
                </p>
                <p className="text-sm text-muted-foreground">
                  atau drag & drop file ke sini
                </p>
              </>
            )}
          </div>

          {/* Format Info */}
          <div className="mt-4 p-4 rounded-xl bg-muted border border-muted-foreground/20">
            <p className="text-sm text-foreground">
              <strong>Format CSV yang didukung:</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Tanggal, Jenis, Kategori, Dompet, Jumlah, Keterangan
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              • Tanggal: YYYY-MM-DD (contoh: 2024-12-31)<br/>
              • Jenis: pemasukan, pengeluaran, atau transfer<br/>
              • Nama Dompet harus sama persis dengan dompet yang sudah ada
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
