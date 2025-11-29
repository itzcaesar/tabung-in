import { pgTable, uuid, varchar, text, decimal, timestamp, boolean, integer, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum types - menggunakan bahasa Indonesia untuk nilai
export const jenisKategoriEnum = pgEnum('jenis_kategori', ['pemasukan', 'pengeluaran']);
export const jenisTransaksiEnum = pgEnum('jenis_transaksi', ['pemasukan', 'pengeluaran', 'transfer']);
export const periodeAnggaranEnum = pgEnum('periode_anggaran', ['harian', 'mingguan', 'bulanan', 'tahunan']);
export const jenisDompetEnum = pgEnum('jenis_dompet', ['rekening', 'emoney', 'tunai']);
export const frekuensiTagihanEnum = pgEnum('frekuensi_tagihan', ['sekali', 'mingguan', 'bulanan', 'tahunan']);
export const statusTagihanEnum = pgEnum('status_tagihan', ['aktif', 'lunas', 'terlambat', 'nonaktif']);
export const statusGoalsEnum = pgEnum('status_goals', ['aktif', 'tercapai', 'dibatalkan']);

// Tabel Pengguna
export const users = pgTable('pengguna', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('kata_sandi_hash').notNull(),
  name: varchar('nama', { length: 255 }),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
  updatedAt: timestamp('diperbarui_pada').defaultNow().notNull(),
  emailVerified: boolean('email_terverifikasi').default(false),
  encryptionKey: text('kunci_enkripsi'),
}, (table) => [
  index('idx_pengguna_email').on(table.email),
]);

// Tabel Kategori
export const categories = pgTable('kategori', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('nama', { length: 100 }).notNull(),
  type: jenisKategoriEnum('jenis').notNull(),
  icon: varchar('ikon', { length: 50 }),
  color: varchar('warna', { length: 7 }),
  isDefault: boolean('adalah_default').default(false),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_kategori_pengguna').on(table.userId),
  index('idx_kategori_jenis').on(table.type),
]);

// Tabel Dompet (Accounts)
export const accounts = pgTable('dompet', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('nama', { length: 100 }).notNull(),
  type: jenisDompetEnum('jenis').notNull(),
  provider: varchar('penyedia', { length: 50 }), // gopay, ovo, dana, dll (untuk emoney)
  balance: decimal('saldo', { precision: 15, scale: 0 }).default('0').notNull(), // Tanpa desimal untuk IDR
  currency: varchar('mata_uang', { length: 3 }).default('IDR').notNull(),
  icon: varchar('ikon', { length: 50 }),
  color: varchar('warna', { length: 7 }),
  isActive: boolean('aktif').default(true),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
  updatedAt: timestamp('diperbarui_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_dompet_pengguna').on(table.userId),
  index('idx_dompet_jenis').on(table.type),
  index('idx_dompet_aktif').on(table.isActive),
]);

// Tabel Transaksi
export const transactions = pgTable('transaksi', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('id_dompet').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: uuid('id_kategori').references(() => categories.id, { onDelete: 'set null' }),
  type: jenisTransaksiEnum('jenis').notNull(),
  amount: decimal('jumlah', { precision: 15, scale: 0 }).notNull(), // Tanpa desimal untuk IDR
  description: text('keterangan'),
  date: timestamp('tanggal').notNull(),
  receiptUrl: text('url_struk'),
  receiptData: text('data_struk'),
  isRecurring: boolean('berulang').default(false),
  recurringId: uuid('id_berulang'),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
  updatedAt: timestamp('diperbarui_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_transaksi_pengguna').on(table.userId),
  index('idx_transaksi_dompet').on(table.accountId),
  index('idx_transaksi_kategori').on(table.categoryId),
  index('idx_transaksi_tanggal').on(table.date),
  index('idx_transaksi_jenis').on(table.type),
  index('idx_transaksi_pengguna_tanggal').on(table.userId, table.date),
]);

// Tabel Anggaran
export const budgets = pgTable('anggaran', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid('id_kategori').references(() => categories.id, { onDelete: 'cascade' }),
  name: varchar('nama', { length: 100 }).notNull(),
  amount: decimal('jumlah', { precision: 15, scale: 0 }).notNull(),
  period: periodeAnggaranEnum('periode').notNull(),
  startDate: timestamp('tanggal_mulai').notNull(),
  endDate: timestamp('tanggal_selesai'),
  isActive: boolean('aktif').default(true),
  alertThreshold: integer('batas_peringatan').default(80),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
  updatedAt: timestamp('diperbarui_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_anggaran_pengguna').on(table.userId),
  index('idx_anggaran_kategori').on(table.categoryId),
  index('idx_anggaran_aktif').on(table.isActive),
]);

// Tabel Struk
export const receipts = pgTable('struk', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }),
  transactionId: uuid('id_transaksi').references(() => transactions.id, { onDelete: 'set null' }),
  imageUrl: text('url_gambar').notNull(),
  ocrData: text('data_ocr'),
  merchantName: varchar('nama_toko', { length: 255 }),
  totalAmount: decimal('total', { precision: 15, scale: 0 }),
  date: timestamp('tanggal'),
  items: text('item'),
  processed: boolean('diproses').default(false),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_struk_pengguna').on(table.userId),
  index('idx_struk_transaksi').on(table.transactionId),
  index('idx_struk_diproses').on(table.processed),
]);

// Tabel Transaksi Berulang
export const recurringTransactions = pgTable('transaksi_berulang', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('id_dompet').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: uuid('id_kategori').references(() => categories.id, { onDelete: 'set null' }),
  type: jenisTransaksiEnum('jenis').notNull(),
  amount: decimal('jumlah', { precision: 15, scale: 0 }).notNull(),
  description: text('keterangan'),
  frequency: varchar('frekuensi', { length: 20 }).notNull(),
  nextDate: timestamp('tanggal_berikutnya').notNull(),
  isActive: boolean('aktif').default(true),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
  updatedAt: timestamp('diperbarui_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_transaksi_berulang_pengguna').on(table.userId),
  index('idx_transaksi_berulang_aktif').on(table.isActive),
  index('idx_transaksi_berulang_tanggal').on(table.nextDate),
]);

// Tabel Tagihan
export const bills = pgTable('tagihan', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid('id_kategori').references(() => categories.id, { onDelete: 'set null' }),
  name: varchar('nama', { length: 100 }).notNull(),
  description: text('keterangan'),
  amount: decimal('jumlah', { precision: 15, scale: 0 }).notNull(),
  dueDate: timestamp('tanggal_jatuh_tempo').notNull(),
  frequency: frekuensiTagihanEnum('frekuensi').notNull().default('bulanan'),
  status: statusTagihanEnum('status').notNull().default('aktif'),
  reminderDays: integer('hari_pengingat').default(3), // Remind X days before
  icon: varchar('ikon', { length: 50 }),
  color: varchar('warna', { length: 7 }),
  lastPaidDate: timestamp('tanggal_terakhir_bayar'),
  nextDueDate: timestamp('tanggal_jatuh_tempo_berikutnya'),
  isAutoPay: boolean('otomatis_bayar').default(false),
  notes: text('catatan'),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
  updatedAt: timestamp('diperbarui_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_tagihan_pengguna').on(table.userId),
  index('idx_tagihan_kategori').on(table.categoryId),
  index('idx_tagihan_status').on(table.status),
  index('idx_tagihan_jatuh_tempo').on(table.dueDate),
  index('idx_tagihan_pengguna_status').on(table.userId, table.status),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  accounts: many(accounts),
  transactions: many(transactions),
  budgets: many(budgets),
  receipts: many(receipts),
  recurringTransactions: many(recurringTransactions),
  bills: many(bills),
  goals: many(goals),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] }),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  user: one(users, { fields: [receipts.userId], references: [users.id] }),
  transaction: one(transactions, { fields: [receipts.transactionId], references: [transactions.id] }),
}));

export const billsRelations = relations(bills, ({ one }) => ({
  user: one(users, { fields: [bills.userId], references: [users.id] }),
  category: one(categories, { fields: [bills.categoryId], references: [categories.id] }),
}));

export const recurringTransactionsRelations = relations(recurringTransactions, ({ one }) => ({
  user: one(users, { fields: [recurringTransactions.userId], references: [users.id] }),
  account: one(accounts, { fields: [recurringTransactions.accountId], references: [accounts.id] }),
  category: one(categories, { fields: [recurringTransactions.categoryId], references: [categories.id] }),
}));

// Tabel Goals (Target Tabungan)
export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('nama', { length: 100 }).notNull(),
  description: text('keterangan'),
  targetAmount: decimal('target_jumlah', { precision: 15, scale: 0 }).notNull(),
  currentAmount: decimal('jumlah_terkumpul', { precision: 15, scale: 0 }).default('0').notNull(),
  category: varchar('kategori', { length: 50 }), // gadget, kendaraan, liburan, dll
  deadline: timestamp('tenggat'),
  priority: integer('prioritas').default(1), // 1-5
  icon: varchar('ikon', { length: 50 }),
  color: varchar('warna', { length: 7 }),
  status: statusGoalsEnum('status').notNull().default('aktif'),
  notes: text('catatan'),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
  updatedAt: timestamp('diperbarui_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_goals_pengguna').on(table.userId),
  index('idx_goals_status').on(table.status),
  index('idx_goals_tenggat').on(table.deadline),
]);

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

// Tabel Preferensi Pengguna (untuk kustomisasi widget dashboard)
export const userPreferences = pgTable('preferensi_pengguna', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('id_pengguna').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  // Widget configuration stored as JSON string
  dashboardWidgets: text('widget_dashboard'), // JSON: { widgetId: { enabled: boolean, order: number, size: 'small' | 'medium' | 'large' } }
  theme: varchar('tema', { length: 20 }).default('system'), // system, light, dark
  currency: varchar('mata_uang', { length: 3 }).default('IDR'),
  language: varchar('bahasa', { length: 5 }).default('id'),
  createdAt: timestamp('dibuat_pada').defaultNow().notNull(),
  updatedAt: timestamp('diperbarui_pada').defaultNow().notNull(),
}, (table) => [
  index('idx_preferensi_pengguna').on(table.userId),
]);

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));
