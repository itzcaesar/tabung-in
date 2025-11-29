'use client';

import { useState, useCallback } from 'react';
import { ekstrakTeksStruk, parseDataStruk, type DataStruk } from '@/lib/ocr';
import { uploadReceiptImage } from '@/lib/supabase';

interface UseReceiptScannerResult {
  sedangMemindai: boolean;
  progress: number;
  error: string | null;
  dataStruk: DataStruk | null;
  urlGambar: string | null;
  pindaiStruk: (file: File, userId: string) => Promise<void>;
  reset: () => void;
}

export function useReceiptScanner(): UseReceiptScannerResult {
  const [sedangMemindai, setSedangMemindai] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dataStruk, setDataStruk] = useState<DataStruk | null>(null);
  const [urlGambar, setUrlGambar] = useState<string | null>(null);

  const pindaiStruk = useCallback(async (file: File, userId: string) => {
    setSedangMemindai(true);
    setProgress(0);
    setError(null);
    setDataStruk(null);
    setUrlGambar(null);

    try {
      setProgress(5);
      const uploadedUrl = await uploadReceiptImage(file, userId);
      
      if (!uploadedUrl) {
        throw new Error('Gagal mengunggah gambar');
      }
      
      setUrlGambar(uploadedUrl);
      setProgress(10);

      const teksAsli = await ekstrakTeksStruk(file, (ocrProgress) => {
        setProgress(10 + Math.round(ocrProgress * 0.8));
      });

      setProgress(95);

      const parsed = parseDataStruk(teksAsli);
      setDataStruk(parsed);
      
      setProgress(100);
    } catch (err) {
      console.error('Error memindai struk:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memindai struk');
    } finally {
      setSedangMemindai(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSedangMemindai(false);
    setProgress(0);
    setError(null);
    setDataStruk(null);
    setUrlGambar(null);
  }, []);

  return {
    sedangMemindai,
    progress,
    error,
    dataStruk,
    urlGambar,
    pindaiStruk,
    reset,
  };
}
