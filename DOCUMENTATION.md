# Tabung.in - Codebase Documentation

This document provides comprehensive documentation for the Tabung.in personal finance tracker application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Authentication](#authentication)
7. [Core Features](#core-features)
8. [API Routes](#api-routes)
9. [Server Actions](#server-actions)
10. [Components](#components)
11. [Hooks](#hooks)
12. [Utilities](#utilities)
13. [Testing](#testing)
14. [Configuration Files](#configuration-files)
15. [Deployment](#deployment)

---

## Overview

**Tabung.in** is a comprehensive personal finance management application built for Indonesian users. The name "Tabung" means "save" in Indonesian, reflecting the app's core purpose of helping users track, manage, and grow their savings.

### Key Features

- 📊 **Dashboard** - Real-time financial overview with customizable widgets
- 💳 **Multi-Account Management** - Support for bank accounts, e-wallets (GoPay, OVO, DANA, etc.), and cash
- 📝 **Transaction Tracking** - Record income, expenses, and transfers
- 💰 **Budget Management** - Create budgets with customizable periods and alerts
- 🎯 **Financial Goals** - Set and track savings goals
- 📅 **Bill Reminders** - Never miss a payment with bill tracking
- 🧾 **Receipt Scanning (OCR)** - Scan receipts and auto-extract transaction data
- 📈 **Reports & Analytics** - Visual charts and category breakdowns
- 📰 **Financial News** - Stay updated with Indonesian financial news
- 🌙 **Dark/Light Mode** - Theme support for comfortable viewing
- 📤 **Data Export/Import** - CSV export for backup and analysis

---

## Architecture

The application follows a modern Next.js 16 App Router architecture with:

- **Server Components** - For data fetching and SEO optimization
- **Client Components** - For interactive UI elements
- **Server Actions** - For form submissions and mutations
- **Middleware** - For authentication and route protection

### Data Flow

```
User Request → Middleware (Auth) → Page Component → Server Actions → Database → Response
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Drizzle ORM** | Type-safe SQL ORM |
| **PostgreSQL** | Primary database |
| **NextAuth.js v5** | Authentication |
| **Zod** | Schema validation |
| **Recharts** | Data visualization |
| **Tesseract.js** | OCR for receipt scanning |
| **react-grid-layout** | Draggable dashboard widgets |
| **Vitest** | Unit testing |
| **Playwright** | End-to-end testing |

---

## Project Structure

```
tabung-in/
├── drizzle/                    # Database migrations and schema
│   ├── schema.ts               # Generated schema from migrations
│   ├── relations.ts            # Table relations
│   ├── meta/                   # Migration metadata
│   └── *.sql                   # SQL migration files
│
├── e2e/                        # End-to-end tests (Playwright)
│   └── home.spec.ts
│
├── public/                     # Static assets
│
├── src/
│   ├── middleware.ts           # Auth middleware
│   │
│   ├── __tests__/              # Unit tests
│   │   ├── setup.ts            # Test setup
│   │   ├── components/         # Component tests
│   │   └── lib/                # Utility tests
│   │
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   │
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── api/                # API routes
│   │   │   ├── accounts/
│   │   │   ├── auth/
│   │   │   ├── categories/
│   │   │   └── news/
│   │   │
│   │   ├── dashboard/          # Main app pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── accounts/
│   │   │   ├── bills/
│   │   │   ├── budgets/
│   │   │   ├── goals/
│   │   │   ├── receipts/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── transactions/
│   │   │
│   │   └── demo/               # Demo page
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── session-provider.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── landing-news-ticker.tsx
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── bills-widget.tsx
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── budget-card.tsx
│   │   │   ├── category-breakdown.tsx
│   │   │   ├── dashboard-grid-client.tsx
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── data-export-import.tsx
│   │   │   ├── draggable-grid.tsx
│   │   │   ├── expense-chart.tsx
│   │   │   ├── financial-news.tsx
│   │   │   ├── goals-widget.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── news-ticker.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── transaction-list.tsx
│   │   │   ├── widget-settings.tsx
│   │   │   └── widget-wrapper.tsx
│   │   │
│   │   └── ui/                 # Reusable UI components
│   │       ├── bento-grid.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── modal.tsx
│   │       ├── progress.tsx
│   │       └── select.tsx
│   │
│   ├── hooks/
│   │   └── use-receipt-scanner.ts
│   │
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── demo-data.ts        # Demo data for landing page
│   │   ├── ocr.ts              # Receipt OCR processing
│   │   ├── supabase.ts         # Supabase client (if used)
│   │   ├── utils.ts            # Utility functions
│   │   │
│   │   ├── actions/            # Server actions
│   │   │   ├── accounts.ts
│   │   │   ├── auth.ts
│   │   │   ├── bills.ts
│   │   │   ├── budgets.ts
│   │   │   ├── data-export.ts
│   │   │   ├── goals.ts
│   │   │   ├── preferences.ts
│   │   │   ├── receipts.ts
│   │   │   └── transactions.ts
│   │   │
│   │   ├── constants/          # Constants
│   │   │   ├── bills.ts
│   │   │   ├── goals.ts
│   │   │   └── tips.ts
│   │   │
│   │   ├── db/                 # Database
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   │
│   │   ├── services/           # External services
│   │   │   └── news.ts
│   │   │
│   │   ├── types/              # TypeScript types
│   │   │   └── news.ts
│   │   │
│   │   └── utils/              # Utility modules
│   │       ├── bills.ts
│   │       ├── goals.ts
│   │       └── widget-config.ts
│   │
│   └── types/
│       └── next-auth.d.ts      # NextAuth type extensions
│
├── drizzle.config.ts           # Drizzle ORM config
├── eslint.config.mjs           # ESLint config
├── next.config.ts              # Next.js config
├── package.json
├── playwright.config.ts        # E2E test config
├── postcss.config.mjs          # PostCSS config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── vercel.json                 # Vercel deployment config
└── vitest.config.ts            # Vitest config
```

---

## Database Schema

The database uses PostgreSQL with Drizzle ORM. All table and column names use Indonesian language (Bahasa Indonesia).

### Tables Overview

#### `pengguna` (Users)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | VARCHAR(255) | Unique email |
| `kata_sandi_hash` | TEXT | Hashed password |
| `nama` | VARCHAR(255) | User name |
| `dibuat_pada` | TIMESTAMP | Created at |
| `diperbarui_pada` | TIMESTAMP | Updated at |
| `email_terverifikasi` | BOOLEAN | Email verified |
| `kunci_enkripsi` | TEXT | Encryption key |

#### `dompet` (Accounts/Wallets)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `id_pengguna` | UUID | Foreign key to users |
| `nama` | VARCHAR(100) | Account name |
| `jenis` | ENUM | Type: `rekening`, `emoney`, `tunai` |
| `penyedia` | VARCHAR(50) | Provider (e.g., GoPay, BCA) |
| `saldo` | DECIMAL(15,0) | Balance |
| `mata_uang` | VARCHAR(3) | Currency (default: IDR) |
| `ikon` | VARCHAR(50) | Icon |
| `warna` | VARCHAR(7) | Color hex |
| `aktif` | BOOLEAN | Is active |

#### `transaksi` (Transactions)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `id_pengguna` | UUID | Foreign key to users |
| `id_dompet` | UUID | Foreign key to accounts |
| `id_kategori` | UUID | Foreign key to categories |
| `jenis` | ENUM | Type: `pemasukan`, `pengeluaran`, `transfer` |
| `jumlah` | DECIMAL(15,0) | Amount |
| `keterangan` | TEXT | Description |
| `tanggal` | TIMESTAMP | Date |
| `url_struk` | TEXT | Receipt URL |
| `data_struk` | TEXT | Receipt OCR data |
| `berulang` | BOOLEAN | Is recurring |
| `id_berulang` | UUID | Recurring transaction ID |

#### `kategori` (Categories)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `id_pengguna` | UUID | Foreign key to users |
| `nama` | VARCHAR(100) | Category name |
| `jenis` | ENUM | Type: `pemasukan`, `pengeluaran` |
| `ikon` | VARCHAR(50) | Icon |
| `warna` | VARCHAR(7) | Color hex |
| `adalah_default` | BOOLEAN | Is default category |

#### `anggaran` (Budgets)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `id_pengguna` | UUID | Foreign key to users |
| `id_kategori` | UUID | Foreign key to categories |
| `nama` | VARCHAR(100) | Budget name |
| `jumlah` | DECIMAL(15,0) | Budget amount |
| `periode` | ENUM | Period: `harian`, `mingguan`, `bulanan`, `tahunan` |
| `tanggal_mulai` | TIMESTAMP | Start date |
| `tanggal_selesai` | TIMESTAMP | End date |
| `aktif` | BOOLEAN | Is active |
| `batas_peringatan` | INTEGER | Alert threshold (%) |

#### `tagihan` (Bills)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `id_pengguna` | UUID | Foreign key to users |
| `id_kategori` | UUID | Foreign key to categories |
| `nama` | VARCHAR(100) | Bill name |
| `keterangan` | TEXT | Description |
| `jumlah` | DECIMAL(15,0) | Amount |
| `tanggal_jatuh_tempo` | TIMESTAMP | Due date |
| `frekuensi` | ENUM | Frequency: `sekali`, `mingguan`, `bulanan`, `tahunan` |
| `status` | ENUM | Status: `aktif`, `lunas`, `terlambat`, `nonaktif` |
| `hari_pengingat` | INTEGER | Reminder days before due |
| `otomatis_bayar` | BOOLEAN | Auto-pay enabled |

#### `goals` (Savings Goals)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `id_pengguna` | UUID | Foreign key to users |
| `nama` | VARCHAR(100) | Goal name |
| `keterangan` | TEXT | Description |
| `target_jumlah` | DECIMAL(15,0) | Target amount |
| `jumlah_terkumpul` | DECIMAL(15,0) | Current amount |
| `kategori` | VARCHAR(50) | Category |
| `tenggat` | TIMESTAMP | Deadline |
| `prioritas` | INTEGER | Priority |
| `status` | ENUM | Status: `aktif`, `tercapai`, `dibatalkan` |

#### `struk` (Receipts)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `id_pengguna` | UUID | Foreign key to users |
| `id_transaksi` | UUID | Foreign key to transactions |
| `url_gambar` | TEXT | Image URL |
| `data_ocr` | TEXT | OCR data |
| `nama_toko` | VARCHAR(255) | Store name |
| `total` | DECIMAL(15,0) | Total amount |
| `tanggal` | TIMESTAMP | Receipt date |
| `item` | TEXT | Items JSON |
| `diproses` | BOOLEAN | Is processed |

### Enums

```typescript
// Account types
jenisDompet: 'rekening' | 'emoney' | 'tunai'

// Transaction types
jenisTransaksi: 'pemasukan' | 'pengeluaran' | 'transfer'

// Category types
jenisKategori: 'pemasukan' | 'pengeluaran'

// Budget periods
periodeAnggaran: 'harian' | 'mingguan' | 'bulanan' | 'tahunan'

// Bill frequencies
frekuensiTagihan: 'sekali' | 'mingguan' | 'bulanan' | 'tahunan'

// Bill statuses
statusTagihan: 'aktif' | 'lunas' | 'terlambat' | 'nonaktif'

// Goal statuses
statusGoals: 'aktif' | 'tercapai' | 'dibatalkan'
```

---

## Authentication

Authentication is handled by **NextAuth.js v5** with credentials provider.

### Configuration (`src/lib/auth.ts`)

```typescript
// Key features:
- Credentials provider with email/password
- JWT session strategy
- Password hashing with bcryptjs (12 rounds)
- Protected route callbacks
- Session user ID injection
```

### Middleware (`src/middleware.ts`)

The middleware handles route protection:

- `/dashboard/*` routes require authentication
- `/login` and `/register` redirect to dashboard if already authenticated
- API routes and static files are excluded from middleware

### Auth Flow

1. **Registration**: User submits form → Validate with Zod → Hash password → Insert to DB → Redirect to login
2. **Login**: User submits credentials → Validate → Compare hash → Create JWT session → Redirect to dashboard
3. **Session**: JWT token stored in cookie → Validated on each request → User ID extracted for queries

---

## Core Features

### 1. Dashboard

The dashboard provides a real-time overview of user finances with draggable, customizable widgets.

**Widgets available:**
- Balance overview (total, income, expenses)
- Account cards (wallets/bank accounts)
- Expense chart (bar chart visualization)
- Budget progress cards
- Bill reminders
- Goals progress
- Recent transactions
- Category breakdown
- Financial news ticker

**Customization:**
- Drag and drop widget positioning
- Enable/disable individual widgets
- Persistent layout (stored in user preferences)

### 2. Account Management

Supports three types of accounts:
- **Rekening (Bank Account)**: BCA, Mandiri, BNI, BRI, etc.
- **E-Money**: GoPay, OVO, DANA, ShopeePay, LinkAja
- **Tunai (Cash)**: Physical cash

Each account tracks:
- Name and type
- Provider (for e-wallets)
- Current balance
- Currency
- Active status

### 3. Transaction Tracking

Record financial activities:
- **Pemasukan (Income)**: Salary, freelance, etc.
- **Pengeluaran (Expense)**: Shopping, bills, etc.
- **Transfer**: Between accounts

Features:
- Category assignment
- Date selection
- Receipt attachment
- Recurring transaction support

### 4. Budget Management

Create spending budgets:
- Daily, weekly, monthly, or yearly periods
- Category-specific budgets
- Alert thresholds (default 80%)
- Progress tracking

### 5. Bills & Reminders

Track recurring bills:
- Due date tracking
- Frequency (one-time, weekly, monthly, yearly)
- Reminder days configuration
- Status management (active, paid, overdue)

### 6. Savings Goals

Set financial goals:
- Target amount
- Current progress
- Deadline
- Priority levels
- Status tracking

### 7. Receipt Scanning (OCR)

Scan physical receipts using Tesseract.js:
- Indonesian text recognition
- Auto-extract: store name, date, total
- Item parsing
- Link to transactions

### 8. Data Export/Import

- Export transactions to CSV
- Export accounts to CSV
- Import from CSV (with validation)

---

## API Routes

Located in `src/app/api/`:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | ALL | NextAuth handlers |
| `/api/accounts` | GET, POST | Account CRUD |
| `/api/categories` | GET, POST | Category CRUD |
| `/api/news` | GET | Financial news feed |

---

## Server Actions

Located in `src/lib/actions/`:

### `auth.ts`
- `register(formData)` - User registration
- `login(formData)` - User login
- `logout()` - User logout

### `accounts.ts`
- `createAccount(formData)` - Create new account
- `updateAccount(id, formData)` - Update account
- `deleteAccount(id)` - Delete account

### `transactions.ts`
- `createTransaction(formData)` - Create transaction
- `updateTransaction(id, formData)` - Update transaction
- `deleteTransaction(id)` - Delete transaction

### `budgets.ts`
- `createBudget(formData)` - Create budget
- `updateBudget(id, formData)` - Update budget
- `deleteBudget(id)` - Delete budget

### `bills.ts`
- `createBill(input)` - Create bill
- `updateBill(input)` - Update bill
- `deleteBill(id)` - Delete bill
- `markBillAsPaid(id)` - Mark bill as paid
- `getUpcomingBills()` - Get upcoming bills

### `goals.ts`
- `createGoal(input)` - Create goal
- `updateGoal(id, input)` - Update goal
- `deleteGoal(id)` - Delete goal
- `addGoalProgress(id, amount)` - Add progress to goal

### `receipts.ts`
- `processReceipt(imageUrl)` - Process receipt with OCR
- `linkReceiptToTransaction(receiptId, transactionId)` - Link receipt

### `preferences.ts`
- `getUserPreferences()` - Get user preferences
- `updateDashboardWidgets(widgets)` - Save widget layout
- `updatePreferences(prefs)` - Update all preferences

### `data-export.ts`
- `exportTransactionsToCSV()` - Export transactions
- `exportAccountsToCSV()` - Export accounts
- `importTransactionsFromCSV(data)` - Import transactions

---

## Components

### UI Components (`src/components/ui/`)

| Component | Description |
|-----------|-------------|
| `Button` | Styled button with variants |
| `Card` | Card container with header/content |
| `Input` | Form input with label and error |
| `Select` | Dropdown select component |
| `Modal` | Modal dialog |
| `Progress` | Progress bar |
| `BentoGrid` | Grid layout for widgets |

### Dashboard Components (`src/components/dashboard/`)

| Component | Description |
|-----------|-------------|
| `DashboardHeader` | Page header with user info |
| `Sidebar` | Navigation sidebar |
| `BottomNav` | Mobile bottom navigation |
| `MobileNav` | Mobile navigation menu |
| `DraggableGrid` | Drag-and-drop widget grid |
| `DashboardGridClient` | Client wrapper for grid |
| `WidgetWrapper` | Widget container with actions |
| `WidgetSettings` | Widget configuration modal |
| `StatsCard` | Statistics display card |
| `ExpenseChart` | Bar chart for expenses |
| `CategoryBreakdown` | Pie chart by category |
| `TransactionList` | Recent transactions list |
| `BudgetCard` | Budget progress card |
| `BillsWidget` | Upcoming bills widget |
| `GoalsWidget` | Goals progress widget |
| `FinancialNews` | News feed component |
| `NewsTicker` | Scrolling news ticker |
| `DataExportImport` | Export/import controls |

---

## Hooks

### `useReceiptScanner` (`src/hooks/use-receipt-scanner.ts`)

Custom hook for receipt scanning functionality:

```typescript
const {
  isScanning,
  progress,
  result,
  error,
  scanReceipt,
  reset
} = useReceiptScanner();
```

---

## Utilities

### `src/lib/utils.ts`

Core utility functions:

- `cn(...classes)` - Merge Tailwind classes
- `formatCurrency(amount)` - Format to IDR currency
- `formatDate(date)` - Format date for display
- `formatDateShort(date)` - Short date format
- `formatPercent(value)` - Format percentage
- `getMonthRange(date)` - Get month start/end dates
- `calculatePercentage(current, total)` - Calculate percentage

### `src/lib/ocr.ts`

OCR processing for receipts:

- `ekstrakTeksStruk(image, onProgress)` - Extract text from receipt image
- `parseDataStruk(text)` - Parse extracted text to structured data
- `ekstrakNamaToko(lines)` - Extract store name
- `ekstrakTanggal(text)` - Extract date
- `ekstrakTotal(text)` - Extract total amount
- `ekstrakItems(lines)` - Extract line items

### `src/lib/utils/widget-config.ts`

Dashboard widget configuration:

- Widget IDs and types
- Default layout configuration
- Widget visibility settings

### `src/lib/utils/bills.ts`

Bill-related utilities:

- Due date calculations
- Status determination
- Next due date calculation

### `src/lib/utils/goals.ts`

Goal-related utilities:

- Progress calculations
- Deadline status
- Priority handling

---

## Testing

### Unit Tests (Vitest)

Located in `src/__tests__/`:

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

Configuration in `vitest.config.ts`:
- Uses jsdom environment
- React plugin support
- Path aliases configured
- Coverage reporting

### E2E Tests (Playwright)

Located in `e2e/`:

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

Configuration in `playwright.config.ts`:
- Tests across Chrome, Firefox, Safari
- Mobile viewport testing
- Auto-starts dev server

---

## Configuration Files

### `drizzle.config.ts`

```typescript
{
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL }
}
```

### `next.config.ts`

Next.js configuration for React 19 and app router.

### `tailwind.config.ts` / `postcss.config.mjs`

Tailwind CSS v4 configuration with custom theme.

### `vercel.json`

Vercel deployment configuration.

---

## Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
AUTH_SECRET=your-secret-key
AUTH_URL=https://your-domain.com

# Optional: Supabase (if used for storage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Database Migrations

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema directly (dev)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Build & Deploy

```bash
# Build
npm run build

# Start production server
npm run start
```

### Vercel Deployment

The app is configured for Vercel deployment. Push to main branch triggers automatic deployment.

---

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run typecheck` | Run TypeScript check |
| `npm run test` | Run unit tests (watch) |
| `npm run test:run` | Run unit tests (once) |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run db:generate` | Generate DB migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Open Drizzle Studio |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

## License

MIT License - See LICENSE file for details.
