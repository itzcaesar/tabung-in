export type BillFrequency = 'sekali' | 'mingguan' | 'bulanan' | 'tahunan';
export type BillStatus = 'aktif' | 'lunas' | 'terlambat' | 'nonaktif';

export interface CreateBillInput {
  name: string;
  description?: string;
  amount: number;
  dueDate: Date;
  frequency: BillFrequency;
  categoryId?: string;
  reminderDays?: number;
  icon?: string;
  color?: string;
  notes?: string;
  autopay?: boolean;
}

export interface UpdateBillInput extends Partial<CreateBillInput> {
  id: string;
  status?: BillStatus;
  lastPaidDate?: Date;
}

// Predefined bill categories with icons
export const billCategories = [
  { id: 'listrik', name: 'Listrik', icon: '⚡', color: '#FBBF24' },
  { id: 'air', name: 'Air PDAM', icon: '💧', color: '#3B82F6' },
  { id: 'internet', name: 'Internet', icon: '📶', color: '#8B5CF6' },
  { id: 'telepon', name: 'Telepon/HP', icon: '📱', color: '#10B981' },
  { id: 'tv', name: 'TV Kabel/Streaming', icon: '📺', color: '#EF4444' },
  { id: 'asuransi', name: 'Asuransi', icon: '🛡️', color: '#06B6D4' },
  { id: 'kredit', name: 'Cicilan/Kredit', icon: '💳', color: '#F97316' },
  { id: 'sewa', name: 'Sewa/Kos', icon: '🏠', color: '#EC4899' },
  { id: 'pajak', name: 'Pajak', icon: '🏛️', color: '#6366F1' },
  { id: 'pendidikan', name: 'Pendidikan', icon: '📚', color: '#14B8A6' },
  { id: 'gym', name: 'Gym/Fitness', icon: '💪', color: '#F43F5E' },
  { id: 'langganan', name: 'Langganan Lain', icon: '📦', color: '#A855F7' },
  { id: 'lainnya', name: 'Lainnya', icon: '📝', color: '#6B7280' },
];
