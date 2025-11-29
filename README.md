# Tabung.in 💰

> *"Tabung"* means *"save"* in Indonesian — your personal finance companion built for Indonesians.

A comprehensive personal finance management application that helps you track expenses, manage budgets, set savings goals, and gain insights into your spending habits. Built with modern web technologies and designed specifically for Indonesian users.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)

## ✨ Features

### 📊 Smart Dashboard
Customizable dashboard with draggable widgets showing your complete financial overview at a glance.

### 💳 Multi-Account Management
- **Bank Accounts** - BCA, Mandiri, BNI, BRI, and more
- **E-Wallets** - GoPay, OVO, DANA, ShopeePay, LinkAja
- **Cash** - Track physical cash

### 📝 Transaction Tracking
Record income, expenses, and transfers with category assignment and receipt attachments.

### 💰 Budget Management
Create daily, weekly, monthly, or yearly budgets with customizable alert thresholds.

### 🎯 Savings Goals
Set financial goals with deadlines, track progress, and prioritize what matters most.

### 📅 Bill Reminders
Never miss a payment with bill tracking and configurable reminders.

### 🧾 Receipt Scanning (OCR)
Scan receipts using AI-powered OCR to automatically extract transaction details.

### 📈 Reports & Analytics
Visual charts and category breakdowns to understand your spending patterns.

### 📰 Financial News
Stay updated with Indonesian financial news integrated into your dashboard.

### 🌙 Dark/Light Mode
Comfortable viewing experience with theme support.

### 📤 Data Export
Export your data to CSV for backup or external analysis.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Utility-first styling |
| **Drizzle ORM** | Type-safe database queries |
| **PostgreSQL** | Relational database |
| **NextAuth.js v5** | Authentication |
| **Zod** | Schema validation |
| **Recharts** | Data visualization |
| **Tesseract.js** | OCR for receipts |
| **react-grid-layout** | Draggable widgets |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itzcaesar/tabung-in.git
   cd tabung-in
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/tabungin
   AUTH_SECRET=your-secret-key
   AUTH_URL=http://localhost:3000
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
tabung-in/
├── drizzle/              # Database migrations
├── e2e/                  # End-to-end tests
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Main app pages
│   │   └── demo/         # Demo page
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard-specific
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core libraries
│   │   ├── actions/      # Server actions
│   │   ├── db/           # Database schema
│   │   ├── services/     # External services
│   │   └── utils/        # Utilities
│   └── types/            # TypeScript types
└── [config files]
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run unit tests (watch mode) |
| `npm run test:run` | Run unit tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## 📚 Documentation

For detailed documentation about the codebase, architecture, and API reference, see [DOCUMENTATION.md](./DOCUMENTATION.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for Indonesian users
- Inspired by the need for better personal finance tools in Indonesia
- Thanks to all contributors and the open-source community

---

<p align="center">
  <strong>Tabung.in</strong> - Kelola keuanganmu dengan bijak 🇮🇩
</p>

