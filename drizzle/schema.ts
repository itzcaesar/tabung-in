import { pgTable, index, foreignKey, uuid, numeric, text, timestamp, boolean, varchar, integer, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const frekuensiTagihan = pgEnum("frekuensi_tagihan", ['sekali', 'mingguan', 'bulanan', 'tahunan'])
export const jenisDompet = pgEnum("jenis_dompet", ['rekening', 'emoney', 'tunai'])
export const jenisKategori = pgEnum("jenis_kategori", ['pemasukan', 'pengeluaran'])
export const jenisTransaksi = pgEnum("jenis_transaksi", ['pemasukan', 'pengeluaran', 'transfer'])
export const periodeAnggaran = pgEnum("periode_anggaran", ['harian', 'mingguan', 'bulanan', 'tahunan'])
export const statusGoals = pgEnum("status_goals", ['aktif', 'tercapai', 'dibatalkan'])
export const statusTagihan = pgEnum("status_tagihan", ['aktif', 'lunas', 'terlambat', 'nonaktif'])


export const transaksi = pgTable("transaksi", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	idPengguna: uuid("id_pengguna").notNull(),
	idDompet: uuid("id_dompet").notNull(),
	idKategori: uuid("id_kategori"),
	jenis: jenisTransaksi().notNull(),
	jumlah: numeric({ precision: 15, scale:  0 }).notNull(),
	keterangan: text(),
	tanggal: timestamp({ mode: 'string' }).notNull(),
	urlStruk: text("url_struk"),
	dataStruk: text("data_struk"),
	berulang: boolean().default(false),
	idBerulang: uuid("id_berulang"),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
	diperbaruiPada: timestamp("diperbarui_pada", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_transaksi_dompet").using("btree", table.idDompet.asc().nullsLast().op("uuid_ops")),
	index("idx_transaksi_jenis").using("btree", table.jenis.asc().nullsLast().op("enum_ops")),
	index("idx_transaksi_kategori").using("btree", table.idKategori.asc().nullsLast().op("uuid_ops")),
	index("idx_transaksi_pengguna").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops")),
	index("idx_transaksi_pengguna_tanggal").using("btree", table.idPengguna.asc().nullsLast().op("timestamp_ops"), table.tanggal.asc().nullsLast().op("uuid_ops")),
	index("idx_transaksi_tanggal").using("btree", table.tanggal.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.idPengguna],
			foreignColumns: [pengguna.id],
			name: "transaksi_id_pengguna_pengguna_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idDompet],
			foreignColumns: [dompet.id],
			name: "transaksi_id_dompet_dompet_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idKategori],
			foreignColumns: [kategori.id],
			name: "transaksi_id_kategori_kategori_id_fk"
		}).onDelete("set null"),
]);

export const transaksiBerulang = pgTable("transaksi_berulang", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	idPengguna: uuid("id_pengguna").notNull(),
	idDompet: uuid("id_dompet").notNull(),
	idKategori: uuid("id_kategori"),
	jenis: jenisTransaksi().notNull(),
	jumlah: numeric({ precision: 15, scale:  0 }).notNull(),
	keterangan: text(),
	frekuensi: varchar({ length: 20 }).notNull(),
	tanggalBerikutnya: timestamp("tanggal_berikutnya", { mode: 'string' }).notNull(),
	aktif: boolean().default(true),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
	diperbaruiPada: timestamp("diperbarui_pada", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_transaksi_berulang_aktif").using("btree", table.aktif.asc().nullsLast().op("bool_ops")),
	index("idx_transaksi_berulang_pengguna").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops")),
	index("idx_transaksi_berulang_tanggal").using("btree", table.tanggalBerikutnya.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.idPengguna],
			foreignColumns: [pengguna.id],
			name: "transaksi_berulang_id_pengguna_pengguna_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idDompet],
			foreignColumns: [dompet.id],
			name: "transaksi_berulang_id_dompet_dompet_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idKategori],
			foreignColumns: [kategori.id],
			name: "transaksi_berulang_id_kategori_kategori_id_fk"
		}).onDelete("set null"),
]);

export const anggaran = pgTable("anggaran", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	idPengguna: uuid("id_pengguna").notNull(),
	idKategori: uuid("id_kategori"),
	nama: varchar({ length: 100 }).notNull(),
	jumlah: numeric({ precision: 15, scale:  0 }).notNull(),
	periode: periodeAnggaran().notNull(),
	tanggalMulai: timestamp("tanggal_mulai", { mode: 'string' }).notNull(),
	tanggalSelesai: timestamp("tanggal_selesai", { mode: 'string' }),
	aktif: boolean().default(true),
	batasPeringatan: integer("batas_peringatan").default(80),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
	diperbaruiPada: timestamp("diperbarui_pada", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_anggaran_aktif").using("btree", table.aktif.asc().nullsLast().op("bool_ops")),
	index("idx_anggaran_kategori").using("btree", table.idKategori.asc().nullsLast().op("uuid_ops")),
	index("idx_anggaran_pengguna").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.idPengguna],
			foreignColumns: [pengguna.id],
			name: "anggaran_id_pengguna_pengguna_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idKategori],
			foreignColumns: [kategori.id],
			name: "anggaran_id_kategori_kategori_id_fk"
		}).onDelete("cascade"),
]);

export const kategori = pgTable("kategori", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	idPengguna: uuid("id_pengguna").notNull(),
	nama: varchar({ length: 100 }).notNull(),
	jenis: jenisKategori().notNull(),
	ikon: varchar({ length: 50 }),
	warna: varchar({ length: 7 }),
	adalahDefault: boolean("adalah_default").default(false),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_kategori_jenis").using("btree", table.jenis.asc().nullsLast().op("enum_ops")),
	index("idx_kategori_pengguna").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.idPengguna],
			foreignColumns: [pengguna.id],
			name: "kategori_id_pengguna_pengguna_id_fk"
		}).onDelete("cascade"),
]);

export const struk = pgTable("struk", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	idPengguna: uuid("id_pengguna").notNull(),
	idTransaksi: uuid("id_transaksi"),
	urlGambar: text("url_gambar").notNull(),
	dataOcr: text("data_ocr"),
	namaToko: varchar("nama_toko", { length: 255 }),
	total: numeric({ precision: 15, scale:  0 }),
	tanggal: timestamp({ mode: 'string' }),
	item: text(),
	diproses: boolean().default(false),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_struk_diproses").using("btree", table.diproses.asc().nullsLast().op("bool_ops")),
	index("idx_struk_pengguna").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops")),
	index("idx_struk_transaksi").using("btree", table.idTransaksi.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.idPengguna],
			foreignColumns: [pengguna.id],
			name: "struk_id_pengguna_pengguna_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idTransaksi],
			foreignColumns: [transaksi.id],
			name: "struk_id_transaksi_transaksi_id_fk"
		}).onDelete("set null"),
]);

export const pengguna = pgTable("pengguna", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	kataSandiHash: text("kata_sandi_hash").notNull(),
	nama: varchar({ length: 255 }),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
	diperbaruiPada: timestamp("diperbarui_pada", { mode: 'string' }).defaultNow().notNull(),
	emailTerverifikasi: boolean("email_terverifikasi").default(false),
	kunciEnkripsi: text("kunci_enkripsi"),
}, (table) => [
	index("idx_pengguna_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("pengguna_email_unique").on(table.email),
]);

export const dompet = pgTable("dompet", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	idPengguna: uuid("id_pengguna").notNull(),
	nama: varchar({ length: 100 }).notNull(),
	jenis: jenisDompet().notNull(),
	penyedia: varchar({ length: 50 }),
	saldo: numeric({ precision: 15, scale:  0 }).default('0').notNull(),
	mataUang: varchar("mata_uang", { length: 3 }).default('IDR').notNull(),
	ikon: varchar({ length: 50 }),
	warna: varchar({ length: 7 }),
	aktif: boolean().default(true),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
	diperbaruiPada: timestamp("diperbarui_pada", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_dompet_aktif").using("btree", table.aktif.asc().nullsLast().op("bool_ops")),
	index("idx_dompet_jenis").using("btree", table.jenis.asc().nullsLast().op("enum_ops")),
	index("idx_dompet_pengguna").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.idPengguna],
			foreignColumns: [pengguna.id],
			name: "dompet_id_pengguna_pengguna_id_fk"
		}).onDelete("cascade"),
]);

export const tagihan = pgTable("tagihan", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	idPengguna: uuid("id_pengguna").notNull(),
	idKategori: uuid("id_kategori"),
	nama: varchar({ length: 100 }).notNull(),
	keterangan: text(),
	jumlah: numeric({ precision: 15, scale:  0 }).notNull(),
	tanggalJatuhTempo: timestamp("tanggal_jatuh_tempo", { mode: 'string' }).notNull(),
	frekuensi: frekuensiTagihan().default('bulanan').notNull(),
	status: statusTagihan().default('aktif').notNull(),
	hariPengingat: integer("hari_pengingat").default(3),
	ikon: varchar({ length: 50 }),
	warna: varchar({ length: 7 }),
	tanggalTerakhirBayar: timestamp("tanggal_terakhir_bayar", { mode: 'string' }),
	tanggalJatuhTempoBerikutnya: timestamp("tanggal_jatuh_tempo_berikutnya", { mode: 'string' }),
	otomatisBayar: boolean("otomatis_bayar").default(false),
	catatan: text(),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
	diperbaruiPada: timestamp("diperbarui_pada", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_tagihan_jatuh_tempo").using("btree", table.tanggalJatuhTempo.asc().nullsLast().op("timestamp_ops")),
	index("idx_tagihan_kategori").using("btree", table.idKategori.asc().nullsLast().op("uuid_ops")),
	index("idx_tagihan_pengguna").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops")),
	index("idx_tagihan_pengguna_status").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_tagihan_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.idPengguna],
			foreignColumns: [pengguna.id],
			name: "tagihan_id_pengguna_pengguna_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.idKategori],
			foreignColumns: [kategori.id],
			name: "tagihan_id_kategori_kategori_id_fk"
		}).onDelete("set null"),
]);

export const goals = pgTable("goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	idPengguna: uuid("id_pengguna").notNull(),
	nama: varchar({ length: 100 }).notNull(),
	keterangan: text(),
	targetJumlah: numeric("target_jumlah", { precision: 15, scale:  0 }).notNull(),
	jumlahTerkumpul: numeric("jumlah_terkumpul", { precision: 15, scale:  0 }).default('0').notNull(),
	kategori: varchar({ length: 50 }),
	tenggat: timestamp({ mode: 'string' }),
	prioritas: integer().default(1),
	ikon: varchar({ length: 50 }),
	warna: varchar({ length: 7 }),
	status: statusGoals().default('aktif').notNull(),
	catatan: text(),
	dibuatPada: timestamp("dibuat_pada", { mode: 'string' }).defaultNow().notNull(),
	diperbaruiPada: timestamp("diperbarui_pada", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_goals_pengguna").using("btree", table.idPengguna.asc().nullsLast().op("uuid_ops")),
	index("idx_goals_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_goals_tenggat").using("btree", table.tenggat.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.idPengguna],
			foreignColumns: [pengguna.id],
			name: "goals_id_pengguna_pengguna_id_fk"
		}).onDelete("cascade"),
]);
