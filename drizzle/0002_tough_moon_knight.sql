CREATE TYPE "public"."frekuensi_tagihan" AS ENUM('sekali', 'mingguan', 'bulanan', 'tahunan');--> statement-breakpoint
CREATE TYPE "public"."status_tagihan" AS ENUM('aktif', 'lunas', 'terlambat', 'nonaktif');--> statement-breakpoint
CREATE TABLE "tagihan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"id_kategori" uuid,
	"nama" varchar(100) NOT NULL,
	"keterangan" text,
	"jumlah" numeric(15, 0) NOT NULL,
	"tanggal_jatuh_tempo" timestamp NOT NULL,
	"frekuensi" "frekuensi_tagihan" DEFAULT 'bulanan' NOT NULL,
	"status" "status_tagihan" DEFAULT 'aktif' NOT NULL,
	"hari_pengingat" integer DEFAULT 3,
	"ikon" varchar(50),
	"warna" varchar(7),
	"tanggal_terakhir_bayar" timestamp,
	"tanggal_jatuh_tempo_berikutnya" timestamp,
	"otomatis_bayar" boolean DEFAULT false,
	"catatan" text,
	"dibuat_pada" timestamp DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_id_kategori_kategori_id_fk" FOREIGN KEY ("id_kategori") REFERENCES "public"."kategori"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tagihan_pengguna" ON "tagihan" USING btree ("id_pengguna");--> statement-breakpoint
CREATE INDEX "idx_tagihan_kategori" ON "tagihan" USING btree ("id_kategori");--> statement-breakpoint
CREATE INDEX "idx_tagihan_status" ON "tagihan" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tagihan_jatuh_tempo" ON "tagihan" USING btree ("tanggal_jatuh_tempo");--> statement-breakpoint
CREATE INDEX "idx_tagihan_pengguna_status" ON "tagihan" USING btree ("id_pengguna","status");