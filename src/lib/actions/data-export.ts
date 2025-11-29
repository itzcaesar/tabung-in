'use server';

import { db } from '@/lib/db';
import { transactions, accounts, categories, budgets } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type ExportState = {
  success?: boolean;
  error?: string;
  data?: string;
  filename?: string;
};

export type ImportState = {
  success?: boolean;
  error?: string;
  message?: string;
  imported?: number;
  skipped?: number;
};

// Export all transactions to CSV
export async function exportTransactionsToCSV(): Promise<ExportState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Tidak terautentikasi' };
  }

  try {
    const userTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, session.user.id),
      with: { 
        category: true, 
        account: true 
      },
      orderBy: (transactions, { desc }) => [desc(transactions.date)],
    });

    // CSV Header
    const headers = [
      'Tanggal',
      'Jenis',
      'Kategori',
      'Dompet',
      'Jumlah',
      'Keterangan',
      'ID'
    ];

    // CSV Rows
    const rows = userTransactions.map(t => [
      new Date(t.date).toISOString().split('T')[0], // YYYY-MM-DD
      t.type,
      t.category?.name || '-',
      t.account?.name || '-',
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`, // Escape quotes
      t.id
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const filename = `tabung-transaksi-${new Date().toISOString().split('T')[0]}.csv`;

    return { success: true, data: csvContent, filename };
  } catch (error) {
    console.error('Export error:', error);
    return { error: 'Gagal mengekspor data' };
  }
}

// Export all accounts/wallets to CSV
export async function exportAccountsToCSV(): Promise<ExportState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Tidak terautentikasi' };
  }

  try {
    const userAccounts = await db.query.accounts.findMany({
      where: eq(accounts.userId, session.user.id),
    });

    const headers = ['Nama', 'Jenis', 'Penyedia', 'Saldo', 'Mata Uang', 'Aktif', 'ID'];
    
    const rows = userAccounts.map(a => [
      `"${a.name}"`,
      a.type,
      a.provider || '-',
      a.balance,
      a.currency,
      a.isActive ? 'Ya' : 'Tidak',
      a.id
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const filename = `tabung-dompet-${new Date().toISOString().split('T')[0]}.csv`;

    return { success: true, data: csvContent, filename };
  } catch (error) {
    console.error('Export error:', error);
    return { error: 'Gagal mengekspor data' };
  }
}

// Export budgets to CSV
export async function exportBudgetsToCSV(): Promise<ExportState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Tidak terautentikasi' };
  }

  try {
    const userBudgets = await db.query.budgets.findMany({
      where: eq(budgets.userId, session.user.id),
      with: { category: true },
    });

    const headers = ['Nama', 'Kategori', 'Jumlah', 'Periode', 'Tanggal Mulai', 'Aktif', 'ID'];
    
    const rows = userBudgets.map(b => [
      `"${b.name}"`,
      b.category?.name || '-',
      b.amount,
      b.period,
      new Date(b.startDate).toISOString().split('T')[0],
      b.isActive ? 'Ya' : 'Tidak',
      b.id
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const filename = `tabung-anggaran-${new Date().toISOString().split('T')[0]}.csv`;

    return { success: true, data: csvContent, filename };
  } catch (error) {
    console.error('Export error:', error);
    return { error: 'Gagal mengekspor data' };
  }
}

// Export all data to JSON
export async function exportAllDataToJSON(): Promise<ExportState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Tidak terautentikasi' };
  }

  try {
    const [userTransactions, userAccounts, userCategories, userBudgets] = await Promise.all([
      db.query.transactions.findMany({
        where: eq(transactions.userId, session.user.id),
        with: { category: true, account: true },
      }),
      db.query.accounts.findMany({
        where: eq(accounts.userId, session.user.id),
      }),
      db.query.categories.findMany({
        where: eq(categories.userId, session.user.id),
      }),
      db.query.budgets.findMany({
        where: eq(budgets.userId, session.user.id),
        with: { category: true },
      }),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        transactions: userTransactions.map(t => ({
          id: t.id,
          date: t.date,
          type: t.type,
          amount: t.amount,
          description: t.description,
          categoryName: t.category?.name,
          accountName: t.account?.name,
        })),
        accounts: userAccounts.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          provider: a.provider,
          balance: a.balance,
          currency: a.currency,
          isActive: a.isActive,
        })),
        categories: userCategories.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          icon: c.icon,
          color: c.color,
        })),
        budgets: userBudgets.map(b => ({
          id: b.id,
          name: b.name,
          amount: b.amount,
          period: b.period,
          categoryName: b.category?.name,
          startDate: b.startDate,
          isActive: b.isActive,
        })),
      },
      summary: {
        totalTransactions: userTransactions.length,
        totalAccounts: userAccounts.length,
        totalCategories: userCategories.length,
        totalBudgets: userBudgets.length,
      }
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const filename = `tabung-backup-${new Date().toISOString().split('T')[0]}.json`;

    return { success: true, data: jsonContent, filename };
  } catch (error) {
    console.error('Export error:', error);
    return { error: 'Gagal mengekspor data' };
  }
}

// Import transactions from CSV
export async function importTransactionsFromCSV(csvData: string): Promise<ImportState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Tidak terautentikasi' };
  }

  try {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { error: 'File CSV kosong atau tidak valid' };
    }

    // Skip header row
    const dataRows = lines.slice(1);
    
    // Get user's accounts and categories for matching
    const [userAccounts, userCategories] = await Promise.all([
      db.query.accounts.findMany({
        where: eq(accounts.userId, session.user.id),
      }),
      db.query.categories.findMany({
        where: eq(categories.userId, session.user.id),
      }),
    ]);

    let imported = 0;
    let skipped = 0;

    for (const row of dataRows) {
      try {
        // Parse CSV row (handling quoted values)
        const values = parseCSVRow(row);
        
        if (values.length < 5) {
          skipped++;
          continue;
        }

        const [dateStr, type, categoryName, accountName, amountStr, description] = values;

        // Validate type
        if (!['pemasukan', 'pengeluaran', 'transfer'].includes(type)) {
          skipped++;
          continue;
        }

        // Find matching account (required)
        const account = userAccounts.find(a => 
          a.name.toLowerCase() === accountName.toLowerCase().trim()
        );
        
        if (!account) {
          skipped++;
          continue;
        }

        // Find matching category (optional)
        const category = userCategories.find(c => 
          c.name.toLowerCase() === (categoryName || '').toLowerCase().trim()
        );

        // Parse amount
        const amount = Math.abs(parseFloat(amountStr.replace(/[^0-9.-]/g, '')));
        if (isNaN(amount) || amount <= 0) {
          skipped++;
          continue;
        }

        // Parse date
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          skipped++;
          continue;
        }

        // Insert transaction
        await db.insert(transactions).values({
          userId: session.user.id,
          accountId: account.id,
          categoryId: category?.id || null,
          type: type as 'pemasukan' | 'pengeluaran' | 'transfer',
          amount: amount.toString(),
          description: description?.replace(/^"|"$/g, '').replace(/""/g, '"') || null,
          date,
        });

        // Update account balance
        const balanceChange = type === 'pemasukan' ? amount : -amount;
        await db
          .update(accounts)
          .set({
            balance: sql`${accounts.balance} + ${balanceChange}`,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, account.id));

        imported++;
      } catch {
        skipped++;
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');

    return { 
      success: true, 
      message: `Berhasil mengimpor ${imported} transaksi`,
      imported,
      skipped
    };
  } catch (error) {
    console.error('Import error:', error);
    return { error: 'Gagal mengimpor data' };
  }
}

// Helper function to parse CSV row with quoted values
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
