# Tabung.in 💰

Aplikasi manajemen keuangan pribadi untuk orang Indonesia yang membantu kamu mengatur uang dengan lebih cerdas.

## ✨ Fitur Utama

- 📸 **Scan Struk OCR** - Foto struk belanja, AI otomatis mendeteksi detail transaksi
- 💳 **Multi-Akun** - Kelola GoPay, OVO, DANA, ShopeePay, bank, dan dompet lainnya
- 📊 **Anggaran Cerdas** - Atur budget per kategori dengan tracking real-time
- 📈 **Laporan Visual** - Grafik dan chart interaktif untuk analisis keuangan
- 🎯 **Target Tabungan** - Buat dan pantau progress goals finansial kamu
- 🔔 **Reminder Tagihan** - Notifikasi otomatis untuk tagihan berulang
- 📰 **Berita Finansial** - Update terkini seputar ekonomi dan investasi
- 🌙 **Dark Mode** - Nyaman untuk mata di malam hari

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** NextAuth v5
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** TailwindCSS + shadcn/ui
- **OCR:** Tesseract.js
- **Charts:** Recharts
- **Storage:** Supabase
- **Testing:** Vitest + Playwright

## 🚀 Getting Started

1. **Clone repository**
   ```bash
   git clone https://github.com/itzcaesar/tabung-in.git
   cd tabung-in
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` dan isi dengan kredensial kamu:
   - `DATABASE_URL` - PostgreSQL connection string
   - `AUTH_SECRET` - Generate dengan `openssl rand -base64 32`
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

4. **Setup database**
   ```bash
   npm run db:push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run db:studio    # Open Drizzle Studio
```

## 🌐 Deployment

Deploy ke Vercel dengan satu klik:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/itzcaesar/tabung-in)

**Environment variables untuk production:**
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Made with ❤️ for Indonesia
