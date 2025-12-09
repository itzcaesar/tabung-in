import Tesseract from 'tesseract.js';

export interface DataStruk {
  namaToko: string | null;
  tanggal: string | null;
  total: number | null;
  items: ItemStruk[];
  teksAsli: string;
}

export interface ItemStruk {
  nama: string;
  jumlah: number;
  harga: number;
}

// Cache the Tesseract worker for better performance across multiple scans
let workerInstance: Tesseract.Worker | null = null;

async function getWorker(): Promise<Tesseract.Worker> {
  if (!workerInstance) {
    workerInstance = await Tesseract.createWorker('ind+eng');
  }
  return workerInstance;
}

export async function ekstrakTeksStruk(
  sumberGambar: File | string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const worker = await getWorker();
  
  const result = await worker.recognize(sumberGambar, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  return result.data.text;
}

// Cleanup function for when the worker is no longer needed
export async function terminateWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
}

export function parseDataStruk(teksAsli: string): DataStruk {
  const baris = teksAsli.split('\n').filter((line) => line.trim());

  const namaToko = ekstrakNamaToko(baris);
  const tanggal = ekstrakTanggal(teksAsli);
  const total = ekstrakTotal(teksAsli);
  const items = ekstrakItems(baris);

  return {
    namaToko,
    tanggal,
    total,
    items,
    teksAsli,
  };
}

function ekstrakNamaToko(baris: string[]): string | null {
  for (const line of baris.slice(0, 3)) {
    const cleaned = line.trim();
    if (
      cleaned.length > 2 &&
      !cleaned.match(/^\d+/) &&
      !cleaned.match(/jl\.|jln\.|street|alamat/i)
    ) {
      return cleaned;
    }
  }
  return null;
}

function ekstrakTanggal(teks: string): string | null {
  const polaTanggal = [
    // Format: 10 May 19 atau 10 May 2019
    /(\d{1,2})\s+(jan|feb|mar|apr|may|mei|jun|jul|aug|agu|sep|oct|okt|nov|dec|des)[a-z]*\s+(\d{2,4})/i,
    // Format: 10/05/2019 atau 10-05-2019
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    // Format: 2019/05/10 atau 2019-05-10
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // Format: 10/05/19
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})\b/,
  ];

  for (const pola of polaTanggal) {
    const match = teks.match(pola);
    if (match) {
      return match[0];
    }
  }
  return null;
}

function ekstrakTotal(teks: string): number | null {
  const polaTotal = [
    /total\s*[:\.]?\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
    /grand\s*total\s*[:\.]?\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
    /jumlah\s*[:\.]?\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
    /bayar\s*[:\.]?\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
    /(?:rp\.?|idr)\s*([\d.,]+)\s*$/im,
  ];

  let maxAmount = 0;

  for (const pola of polaTotal) {
    const match = teks.match(pola);
    if (match) {
      const amount = parseAngkaIndonesia(match[1]);
      if (amount > maxAmount) {
        maxAmount = amount;
      }
    }
  }

  return maxAmount > 0 ? maxAmount : null;
}

// Optimize: Compile skip patterns once
const SKIP_PATTERNS = [
  /^(total|subtotal|sub\s*total|tax|pajak|ppn|diskon|discount|tunai|cash|kembalian|change|payment|debit|credit|kartu|card|thank|please|closed|check\s*no|pos\d*|\-{3,}|={3,})/i,
  /^(ruko|jl\.|jln\.|alamat|telp|phone|fax|www\.|http|\.com|@)/i,
];

function ekstrakItems(baris: string[]): ItemStruk[] {
  const items: ItemStruk[] = [];

  // Optimize: Compile patterns once outside the loop
  const patterns = [
    // Format: 1 Bread Butter Pudding 11,500 atau 1 Bread Butter Pudding 11.500
    /^(\d+)\s+(.+?)\s+([\d][.\d]*[,.]?\d{3})$/,
    // Format: Bread Butter Pudding 1 x 11,500
    /^(.+?)\s+(\d+)\s*[xX]\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
    // Format: Bread Butter Pudding    11,500 (nama dan harga dipisah spasi)
    /^([A-Za-z][A-Za-z\s]+[A-Za-z])\s{2,}([\d][.\d]*[,.]?\d{3})$/,
    // Format: Item Name @ 11,500
    /^(.+?)\s*@\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
    // Format sederhana: Item Name 11500 atau Item Name 11.500
    /^([A-Za-z][A-Za-z\s]{2,})\s+([\d][.\d]*[,.]?\d{3})$/,
  ];

  for (const line of baris) {
    const cleaned = line.trim();

    // Skip baris yang bukan item - optimize: check length first (fastest check)
    if (cleaned.length < 4) continue;
    
    // Optimize: Use some() for early exit
    if (SKIP_PATTERNS.some(pattern => pattern.test(cleaned))) {
      continue;
    }

    // Coba setiap pattern
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        // Cek apakah format "jumlah nama harga" atau "nama harga"
        if (match.length === 4) {
          // Format: jumlah nama harga
          const jumlah = parseInt(match[1]);
          const nama = match[2].trim();
          const harga = parseAngkaIndonesia(match[3]);
          
          if (nama.length > 1 && harga > 0 && harga < 10000000 && jumlah > 0 && jumlah < 100) {
            items.push({ nama, jumlah, harga });
            break;
          }
        } else if (match.length === 3) {
          // Format: nama harga
          const nama = match[1].trim();
          const harga = parseAngkaIndonesia(match[2]);
          
          if (nama.length > 1 && harga > 0 && harga < 10000000) {
            items.push({ nama, jumlah: 1, harga });
            break;
          }
        }
      }
    }
  }

  return items;
}

function parseAngkaIndonesia(str: string): number {
  const cleaned = str.replace(/[.,]/g, '');
  return parseInt(cleaned) || 0;
}
