CREATE TYPE "public"."status_goals" AS ENUM('aktif', 'tercapai', 'dibatalkan');--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"nama" varchar(100) NOT NULL,
	"keterangan" text,
	"target_jumlah" numeric(15, 0) NOT NULL,
	"jumlah_terkumpul" numeric(15, 0) DEFAULT '0' NOT NULL,
	"kategori" varchar(50),
	"tenggat" timestamp,
	"prioritas" integer DEFAULT 1,
	"ikon" varchar(50),
	"warna" varchar(7),
	"status" "status_goals" DEFAULT 'aktif' NOT NULL,
	"catatan" text,
	"dibuat_pada" timestamp DEFAULT now() NOT NULL,
	"diperbarui_pada" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_goals_pengguna" ON "goals" USING btree ("id_pengguna");--> statement-breakpoint
CREATE INDEX "idx_goals_status" ON "goals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_goals_tenggat" ON "goals" USING btree ("tenggat");