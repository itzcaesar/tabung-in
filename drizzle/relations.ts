import { relations } from "drizzle-orm/relations";
import { pengguna, transaksi, dompet, kategori, transaksiBerulang, anggaran, struk, tagihan, goals } from "./schema";

export const transaksiRelations = relations(transaksi, ({one, many}) => ({
	pengguna: one(pengguna, {
		fields: [transaksi.idPengguna],
		references: [pengguna.id]
	}),
	dompet: one(dompet, {
		fields: [transaksi.idDompet],
		references: [dompet.id]
	}),
	kategori: one(kategori, {
		fields: [transaksi.idKategori],
		references: [kategori.id]
	}),
	struks: many(struk),
}));

export const penggunaRelations = relations(pengguna, ({many}) => ({
	transaksis: many(transaksi),
	transaksiBerulangs: many(transaksiBerulang),
	anggarans: many(anggaran),
	kategoris: many(kategori),
	struks: many(struk),
	dompets: many(dompet),
	tagihans: many(tagihan),
	goals: many(goals),
}));

export const dompetRelations = relations(dompet, ({one, many}) => ({
	transaksis: many(transaksi),
	transaksiBerulangs: many(transaksiBerulang),
	pengguna: one(pengguna, {
		fields: [dompet.idPengguna],
		references: [pengguna.id]
	}),
}));

export const kategoriRelations = relations(kategori, ({one, many}) => ({
	transaksis: many(transaksi),
	transaksiBerulangs: many(transaksiBerulang),
	anggarans: many(anggaran),
	pengguna: one(pengguna, {
		fields: [kategori.idPengguna],
		references: [pengguna.id]
	}),
	tagihans: many(tagihan),
}));

export const transaksiBerulangRelations = relations(transaksiBerulang, ({one}) => ({
	pengguna: one(pengguna, {
		fields: [transaksiBerulang.idPengguna],
		references: [pengguna.id]
	}),
	dompet: one(dompet, {
		fields: [transaksiBerulang.idDompet],
		references: [dompet.id]
	}),
	kategori: one(kategori, {
		fields: [transaksiBerulang.idKategori],
		references: [kategori.id]
	}),
}));

export const anggaranRelations = relations(anggaran, ({one}) => ({
	pengguna: one(pengguna, {
		fields: [anggaran.idPengguna],
		references: [pengguna.id]
	}),
	kategori: one(kategori, {
		fields: [anggaran.idKategori],
		references: [kategori.id]
	}),
}));

export const strukRelations = relations(struk, ({one}) => ({
	pengguna: one(pengguna, {
		fields: [struk.idPengguna],
		references: [pengguna.id]
	}),
	transaksi: one(transaksi, {
		fields: [struk.idTransaksi],
		references: [transaksi.id]
	}),
}));

export const tagihanRelations = relations(tagihan, ({one}) => ({
	pengguna: one(pengguna, {
		fields: [tagihan.idPengguna],
		references: [pengguna.id]
	}),
	kategori: one(kategori, {
		fields: [tagihan.idKategori],
		references: [kategori.id]
	}),
}));

export const goalsRelations = relations(goals, ({one}) => ({
	pengguna: one(pengguna, {
		fields: [goals.idPengguna],
		references: [pengguna.id]
	}),
}));