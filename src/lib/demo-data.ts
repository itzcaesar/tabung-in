// Data placeholder untuk demo Tabung.in

export const demoUser = {
  id: 'demo-user-001',
  name: 'Pengguna Demo',
  email: 'demo@tabung.in',
};

// Brand info for logos
export const brandInfo = {
  // E-Money
  gopay: { name: 'GoPay', color: '#00AA13', initials: 'GP', textColor: '#FFFFFF' },
  ovo: { name: 'OVO', color: '#4C3494', initials: 'OVO', textColor: '#FFFFFF' },
  dana: { name: 'DANA', color: '#108EE9', initials: 'DA', textColor: '#FFFFFF' },
  shopeepay: { name: 'ShopeePay', color: '#EE4D2D', initials: 'SP', textColor: '#FFFFFF' },
  linkaja: { name: 'LinkAja', color: '#E31E25', initials: 'LA', textColor: '#FFFFFF' },
  // Banks
  bca: { name: 'BCA', color: '#0066B3', initials: 'BCA', textColor: '#FFFFFF' },
  mandiri: { name: 'Mandiri', color: '#003D79', initials: 'MDR', textColor: '#FFFFFF' },
  bni: { name: 'BNI', color: '#F15A23', initials: 'BNI', textColor: '#FFFFFF' },
  bri: { name: 'BRI', color: '#0066B3', initials: 'BRI', textColor: '#FFFFFF' },
};

// Virtual Dompet Demo
export const demoDompets = [
  {
    id: 'dompet-001',
    name: 'BCA',
    type: 'rekening',
    provider: 'bca',
    balance: 15750000,
    icon: '🏦',
    color: '#0066B3',
    initials: 'BCA',
    textColor: '#FFFFFF',
  },
  {
    id: 'dompet-002',
    name: 'GoPay',
    type: 'emoney',
    provider: 'gopay',
    balance: 850000,
    icon: '💚',
    color: '#00AA13',
    initials: 'GP',
    textColor: '#FFFFFF',
  },
  {
    id: 'dompet-003',
    name: 'OVO',
    type: 'emoney',
    provider: 'ovo',
    balance: 425000,
    icon: '💜',
    color: '#4C3494',
    initials: 'OVO',
    textColor: '#FFFFFF',
  },
  {
    id: 'dompet-004',
    name: 'DANA',
    type: 'emoney',
    provider: 'dana',
    balance: 320000,
    icon: '💙',
    color: '#108EE9',
    initials: 'DA',
    textColor: '#FFFFFF',
  },
  {
    id: 'dompet-005',
    name: 'Dompet Tunai',
    type: 'tunai',
    provider: null,
    balance: 275000,
    icon: '💵',
    color: '#22C55E',
    initials: 'DT',
    textColor: '#FFFFFF',
  },
];

// Kategori Demo
export const demoKategoris = [
  { id: 'kat-001', name: 'Makanan & Minuman', type: 'pengeluaran', icon: '🍔', color: '#F97316' },
  { id: 'kat-002', name: 'Transportasi', type: 'pengeluaran', icon: '🚗', color: '#3B82F6' },
  { id: 'kat-003', name: 'Belanja', type: 'pengeluaran', icon: '🛒', color: '#EC4899' },
  { id: 'kat-004', name: 'Hiburan', type: 'pengeluaran', icon: '🎬', color: '#8B5CF6' },
  { id: 'kat-005', name: 'Tagihan', type: 'pengeluaran', icon: '📄', color: '#EF4444' },
  { id: 'kat-006', name: 'Kesehatan', type: 'pengeluaran', icon: '💊', color: '#10B981' },
  { id: 'kat-007', name: 'Gaji', type: 'pemasukan', icon: '💰', color: '#22C55E' },
  { id: 'kat-008', name: 'Freelance', type: 'pemasukan', icon: '💻', color: '#06B6D4' },
  { id: 'kat-009', name: 'Investasi', type: 'pemasukan', icon: '📈', color: '#F59E0B' },
];

// Transaksi Demo (30 hari terakhir)
export const demoTransaksis = [
  {
    id: 'trx-001',
    type: 'pengeluaran',
    amount: 45000,
    description: 'BreadTalk - Roti & Kopi',
    date: new Date(2025, 10, 29, 10, 30),
    category: demoKategoris[0],
    account: demoDompets[1], // GoPay
  },
  {
    id: 'trx-002',
    type: 'pengeluaran',
    amount: 35000,
    description: 'Grab ke Kantor',
    date: new Date(2025, 10, 29, 8, 15),
    category: demoKategoris[1],
    account: demoDompets[2], // OVO
  },
  {
    id: 'trx-003',
    type: 'pemasukan',
    amount: 8500000,
    description: 'Gaji November',
    date: new Date(2025, 10, 28),
    category: demoKategoris[6],
    account: demoDompets[0], // BCA
  },
  {
    id: 'trx-004',
    type: 'pengeluaran',
    amount: 250000,
    description: 'Belanja Indomaret',
    date: new Date(2025, 10, 28, 19, 45),
    category: demoKategoris[2],
    account: demoDompets[3], // DANA
  },
  {
    id: 'trx-005',
    type: 'pengeluaran',
    amount: 150000,
    description: 'Nonton Bioskop',
    date: new Date(2025, 10, 27, 20, 0),
    category: demoKategoris[3],
    account: demoDompets[1], // GoPay
  },
  {
    id: 'trx-006',
    type: 'pengeluaran',
    amount: 500000,
    description: 'Tagihan Listrik PLN',
    date: new Date(2025, 10, 26),
    category: demoKategoris[4],
    account: demoDompets[0], // BCA
  },
  {
    id: 'trx-007',
    type: 'pengeluaran',
    amount: 125000,
    description: 'Warteg Siang',
    date: new Date(2025, 10, 26, 12, 30),
    category: demoKategoris[0],
    account: demoDompets[4], // Tunai
  },
  {
    id: 'trx-008',
    type: 'pemasukan',
    amount: 2500000,
    description: 'Proyek Website Freelance',
    date: new Date(2025, 10, 25),
    category: demoKategoris[7],
    account: demoDompets[0], // BCA
  },
  {
    id: 'trx-009',
    type: 'pengeluaran',
    amount: 85000,
    description: 'Bensin Motor',
    date: new Date(2025, 10, 25, 7, 30),
    category: demoKategoris[1],
    account: demoDompets[4], // Tunai
  },
  {
    id: 'trx-010',
    type: 'pengeluaran',
    amount: 175000,
    description: 'Apotek - Vitamin',
    date: new Date(2025, 10, 24),
    category: demoKategoris[5],
    account: demoDompets[2], // OVO
  },
  {
    id: 'trx-011',
    type: 'pengeluaran',
    amount: 89000,
    description: 'Kopi Kenangan',
    date: new Date(2025, 10, 24, 15, 0),
    category: demoKategoris[0],
    account: demoDompets[1], // GoPay
  },
  {
    id: 'trx-012',
    type: 'pengeluaran',
    amount: 450000,
    description: 'Groceries Superindo',
    date: new Date(2025, 10, 23),
    category: demoKategoris[2],
    account: demoDompets[0], // BCA
  },
  {
    id: 'trx-013',
    type: 'pengeluaran',
    amount: 28000,
    description: 'Gojek ke Mall',
    date: new Date(2025, 10, 23, 14, 20),
    category: demoKategoris[1],
    account: demoDompets[1], // GoPay
  },
  {
    id: 'trx-014',
    type: 'pengeluaran',
    amount: 199000,
    description: 'Langganan Netflix',
    date: new Date(2025, 10, 22),
    category: demoKategoris[3],
    account: demoDompets[0], // BCA
  },
  {
    id: 'trx-015',
    type: 'pengeluaran',
    amount: 55000,
    description: 'Makan Siang Padang',
    date: new Date(2025, 10, 22, 12, 45),
    category: demoKategoris[0],
    account: demoDompets[4], // Tunai
  },
];

// Anggaran Demo
export const demoAnggarans = [
  {
    id: 'ang-001',
    name: 'Makanan Bulanan',
    amount: 2000000,
    spent: 1250000,
    period: 'bulanan',
    category: demoKategoris[0],
  },
  {
    id: 'ang-002',
    name: 'Transportasi',
    amount: 800000,
    spent: 520000,
    period: 'bulanan',
    category: demoKategoris[1],
  },
  {
    id: 'ang-003',
    name: 'Hiburan',
    amount: 500000,
    spent: 349000,
    period: 'bulanan',
    category: demoKategoris[3],
  },
  {
    id: 'ang-004',
    name: 'Belanja',
    amount: 1000000,
    spent: 700000,
    period: 'bulanan',
    category: demoKategoris[2],
  },
];

// Struk Demo (hasil scan OCR)
export const demoStruks = [
  {
    id: 'struk-001',
    merchantName: 'BreadTalk',
    totalAmount: 43500,
    date: new Date(2025, 10, 29),
    items: [
      { name: 'Flosss', qty: 1, price: 18500 },
      { name: 'Cheese Stick', qty: 1, price: 15000 },
      { name: 'Americano', qty: 1, price: 10000 },
    ],
    imageUrl: '/demo/receipt-breadtalk.jpg',
    processed: true,
  },
  {
    id: 'struk-002',
    merchantName: 'Indomaret',
    totalAmount: 87500,
    date: new Date(2025, 10, 28),
    items: [
      { name: 'Aqua 600ml', qty: 2, price: 7000 },
      { name: 'Indomie Goreng', qty: 5, price: 17500 },
      { name: 'Teh Pucuk 350ml', qty: 3, price: 15000 },
      { name: 'Roti Tawar Sari Roti', qty: 1, price: 18000 },
      { name: 'Susu Ultra 250ml', qty: 3, price: 30000 },
    ],
    imageUrl: '/demo/receipt-indomaret.jpg',
    processed: true,
  },
];

// Statistik Dashboard Demo
export const demoStats = {
  totalSaldo: 17620000,
  pemasukanBulanIni: 11000000,
  pengeluaranBulanIni: 2186000,
  tabunganBulanIni: 8814000,
  jumlahTransaksi: 15,
  jumlahDompet: 5,
};

// Data Chart (7 hari terakhir)
export const demoChartData = [
  { date: '2025-11-23', income: 0, expense: 227000 },
  { date: '2025-11-24', income: 0, expense: 264000 },
  { date: '2025-11-25', income: 2500000, expense: 85000 },
  { date: '2025-11-26', income: 0, expense: 625000 },
  { date: '2025-11-27', income: 0, expense: 150000 },
  { date: '2025-11-28', income: 8500000, expense: 250000 },
  { date: '2025-11-29', income: 0, expense: 80000 },
];

// Breakdown Kategori (untuk pie chart)
export const demoCategoryBreakdown = [
  { name: 'Makanan & Minuman', value: 527000, color: '#F97316' },
  { name: 'Transportasi', value: 148000, color: '#3B82F6' },
  { name: 'Belanja', value: 700000, color: '#EC4899' },
  { name: 'Hiburan', value: 349000, color: '#8B5CF6' },
  { name: 'Tagihan', value: 500000, color: '#EF4444' },
  { name: 'Kesehatan', value: 175000, color: '#10B981' },
];

// Helper: format currency
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper: get total balance
export function getTotalBalance(): number {
  return demoDompets.reduce((sum, d) => sum + d.balance, 0);
}

// Helper: get recent transactions
export function getRecentTransactions(limit: number = 5) {
  return demoTransaksis
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

// E-Money providers yang didukung
export const emoneyProviders = [
  { id: 'gopay', name: 'GoPay', color: '#00AA13', icon: '💚' },
  { id: 'ovo', name: 'OVO', color: '#4C3494', icon: '💜' },
  { id: 'dana', name: 'DANA', color: '#108EE9', icon: '💙' },
  { id: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D', icon: '🧡' },
  { id: 'linkaja', name: 'LinkAja', color: '#E31E25', icon: '❤️' },
  { id: 'isaku', name: 'iSaku', color: '#FF6B00', icon: '🔶' },
  { id: 'sakuku', name: 'Sakuku BCA', color: '#0060AF', icon: '💳' },
];
