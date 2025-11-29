CREATE TYPE "public"."jenis_dompet" AS ENUM('rekening', 'emoney', 'tunai');--> statement-breakpoint
CREATE TYPE "public"."jenis_kategori" AS ENUM('pemasukan', 'pengeluaran');--> statement-breakpoint
ALTER TYPE "public"."budget_period" RENAME TO "jenis_transaksi";--> statement-breakpoint
ALTER TYPE "public"."category_type" RENAME TO "periode_anggaran";--> statement-breakpoint
CREATE TABLE "dompet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"nama" varchar(100) NOT NULL,
	"jenis" "jenis_dompet" NOT NULL,
	"penyedia" varchar(50),
	"saldo" numeric(15, 0) DEFAULT '0' NOT NULL,
	"mata_uang" varchar(3) DEFAULT 'IDR' NOT NULL,
	"ikon" varchar(50),
	"warna" varchar(7),
	"aktif" boolean DEFAULT true,
	"dibuat_pada" timestamp DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anggaran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"id_kategori" uuid,
	"nama" varchar(100) NOT NULL,
	"jumlah" numeric(15, 0) NOT NULL,
	"periode" "periode_anggaran" NOT NULL,
	"tanggal_mulai" timestamp NOT NULL,
	"tanggal_selesai" timestamp,
	"aktif" boolean DEFAULT true,
	"batas_peringatan" integer DEFAULT 80,
	"dibuat_pada" timestamp DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kategori" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"nama" varchar(100) NOT NULL,
	"jenis" "jenis_kategori" NOT NULL,
	"ikon" varchar(50),
	"warna" varchar(7),
	"adalah_default" boolean DEFAULT false,
	"dibuat_pada" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "struk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"id_transaksi" uuid,
	"url_gambar" text NOT NULL,
	"data_ocr" text,
	"nama_toko" varchar(255),
	"total" numeric(15, 0),
	"tanggal" timestamp,
	"item" text,
	"diproses" boolean DEFAULT false,
	"dibuat_pada" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaksi_berulang" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"id_dompet" uuid NOT NULL,
	"id_kategori" uuid,
	"jenis" "jenis_transaksi" NOT NULL,
	"jumlah" numeric(15, 0) NOT NULL,
	"keterangan" text,
	"frekuensi" varchar(20) NOT NULL,
	"tanggal_berikutnya" timestamp NOT NULL,
	"aktif" boolean DEFAULT true,
	"dibuat_pada" timestamp DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaksi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"id_dompet" uuid NOT NULL,
	"id_kategori" uuid,
	"jenis" "jenis_transaksi" NOT NULL,
	"jumlah" numeric(15, 0) NOT NULL,
	"keterangan" text,
	"tanggal" timestamp NOT NULL,
	"url_struk" text,
	"data_struk" text,
	"berulang" boolean DEFAULT false,
	"id_berulang" uuid,
	"dibuat_pada" timestamp DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengguna" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"kata_sandi_hash" text NOT NULL,
	"nama" varchar(255),
	"dibuat_pada" timestamp DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp DEFAULT now() NOT NULL,
	"email_terverifikasi" boolean DEFAULT false,
	"kunci_enkripsi" text,
	CONSTRAINT "pengguna_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "accounts" CASCADE;--> statement-breakpoint
DROP TABLE "budgets" CASCADE;--> statement-breakpoint
DROP TABLE "categories" CASCADE;--> statement-breakpoint
DROP TABLE "receipts" CASCADE;--> statement-breakpoint
DROP TABLE "recurring_transactions" CASCADE;--> statement-breakpoint
DROP TABLE "transactions" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "transaksi_berulang" ALTER COLUMN "jenis" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transaksi" ALTER COLUMN "jenis" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."jenis_transaksi";--> statement-breakpoint
CREATE TYPE "public"."jenis_transaksi" AS ENUM('pemasukan', 'pengeluaran', 'transfer');--> statement-breakpoint
ALTER TABLE "transaksi_berulang" ALTER COLUMN "jenis" SET DATA TYPE "public"."jenis_transaksi" USING "jenis"::"public"."jenis_transaksi";--> statement-breakpoint
ALTER TABLE "transaksi" ALTER COLUMN "jenis" SET DATA TYPE "public"."jenis_transaksi" USING "jenis"::"public"."jenis_transaksi";--> statement-breakpoint
ALTER TABLE "anggaran" ALTER COLUMN "periode" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."periode_anggaran";--> statement-breakpoint
CREATE TYPE "public"."periode_anggaran" AS ENUM('harian', 'mingguan', 'bulanan', 'tahunan');--> statement-breakpoint
ALTER TABLE "anggaran" ALTER COLUMN "periode" SET DATA TYPE "public"."periode_anggaran" USING "periode"::"public"."periode_anggaran";--> statement-breakpoint
ALTER TABLE "dompet" ADD CONSTRAINT "dompet_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anggaran" ADD CONSTRAINT "anggaran_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anggaran" ADD CONSTRAINT "anggaran_id_kategori_kategori_id_fk" FOREIGN KEY ("id_kategori") REFERENCES "public"."kategori"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kategori" ADD CONSTRAINT "kategori_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "struk" ADD CONSTRAINT "struk_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "struk" ADD CONSTRAINT "struk_id_transaksi_transaksi_id_fk" FOREIGN KEY ("id_transaksi") REFERENCES "public"."transaksi"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi_berulang" ADD CONSTRAINT "transaksi_berulang_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi_berulang" ADD CONSTRAINT "transaksi_berulang_id_dompet_dompet_id_fk" FOREIGN KEY ("id_dompet") REFERENCES "public"."dompet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi_berulang" ADD CONSTRAINT "transaksi_berulang_id_kategori_kategori_id_fk" FOREIGN KEY ("id_kategori") REFERENCES "public"."kategori"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_dompet_dompet_id_fk" FOREIGN KEY ("id_dompet") REFERENCES "public"."dompet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_kategori_kategori_id_fk" FOREIGN KEY ("id_kategori") REFERENCES "public"."kategori"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_dompet_pengguna" ON "dompet" USING btree ("id_pengguna");--> statement-breakpoint
CREATE INDEX "idx_dompet_jenis" ON "dompet" USING btree ("jenis");--> statement-breakpoint
CREATE INDEX "idx_dompet_aktif" ON "dompet" USING btree ("aktif");--> statement-breakpoint
CREATE INDEX "idx_anggaran_pengguna" ON "anggaran" USING btree ("id_pengguna");--> statement-breakpoint
CREATE INDEX "idx_anggaran_kategori" ON "anggaran" USING btree ("id_kategori");--> statement-breakpoint
CREATE INDEX "idx_anggaran_aktif" ON "anggaran" USING btree ("aktif");--> statement-breakpoint
CREATE INDEX "idx_kategori_pengguna" ON "kategori" USING btree ("id_pengguna");--> statement-breakpoint
CREATE INDEX "idx_kategori_jenis" ON "kategori" USING btree ("jenis");--> statement-breakpoint
CREATE INDEX "idx_struk_pengguna" ON "struk" USING btree ("id_pengguna");--> statement-breakpoint
CREATE INDEX "idx_struk_transaksi" ON "struk" USING btree ("id_transaksi");--> statement-breakpoint
CREATE INDEX "idx_struk_diproses" ON "struk" USING btree ("diproses");--> statement-breakpoint
CREATE INDEX "idx_transaksi_berulang_pengguna" ON "transaksi_berulang" USING btree ("id_pengguna");--> statement-breakpoint
CREATE INDEX "idx_transaksi_berulang_aktif" ON "transaksi_berulang" USING btree ("aktif");--> statement-breakpoint
CREATE INDEX "idx_transaksi_berulang_tanggal" ON "transaksi_berulang" USING btree ("tanggal_berikutnya");--> statement-breakpoint
CREATE INDEX "idx_transaksi_pengguna" ON "transaksi" USING btree ("id_pengguna");--> statement-breakpoint
CREATE INDEX "idx_transaksi_dompet" ON "transaksi" USING btree ("id_dompet");--> statement-breakpoint
CREATE INDEX "idx_transaksi_kategori" ON "transaksi" USING btree ("id_kategori");--> statement-breakpoint
CREATE INDEX "idx_transaksi_tanggal" ON "transaksi" USING btree ("tanggal");--> statement-breakpoint
CREATE INDEX "idx_transaksi_jenis" ON "transaksi" USING btree ("jenis");--> statement-breakpoint
CREATE INDEX "idx_transaksi_pengguna_tanggal" ON "transaksi" USING btree ("id_pengguna","tanggal");--> statement-breakpoint
CREATE INDEX "idx_pengguna_email" ON "pengguna" USING btree ("email");--> statement-breakpoint
DROP TYPE "public"."transaction_type";