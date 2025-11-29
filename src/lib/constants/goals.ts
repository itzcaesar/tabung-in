// Goal categories with icons and colors
export const goalCategories = [
  { id: 'gadget', name: 'Gadget', icon: '📱', color: '#3B82F6' },
  { id: 'laptop', name: 'Laptop/PC', icon: '💻', color: '#6366F1' },
  { id: 'kendaraan', name: 'Kendaraan', icon: '🚗', color: '#EF4444' },
  { id: 'motor', name: 'Motor', icon: '🏍️', color: '#F97316' },
  { id: 'liburan', name: 'Liburan', icon: '✈️', color: '#06B6D4' },
  { id: 'rumah', name: 'Rumah', icon: '🏠', color: '#10B981' },
  { id: 'pendidikan', name: 'Pendidikan', icon: '📚', color: '#8B5CF6' },
  { id: 'nikah', name: 'Pernikahan', icon: '💒', color: '#EC4899' },
  { id: 'darurat', name: 'Dana Darurat', icon: '🛡️', color: '#FBBF24' },
  { id: 'investasi', name: 'Investasi', icon: '📈', color: '#14B8A6' },
  { id: 'kesehatan', name: 'Kesehatan', icon: '🏥', color: '#F43F5E' },
  { id: 'fashion', name: 'Fashion', icon: '👗', color: '#A855F7' },
  { id: 'hobi', name: 'Hobi', icon: '🎮', color: '#22C55E' },
  { id: 'lainnya', name: 'Lainnya', icon: '🎯', color: '#6B7280' },
];

export type GoalCategory = typeof goalCategories[number];
