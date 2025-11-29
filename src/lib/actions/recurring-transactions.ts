'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { recurringTransactions, transactions, accounts } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, lte, sql } from 'drizzle-orm';

const recurringTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional().nullable(),
  type: z.enum(['pemasukan', 'pengeluaran']),
  amount: z.coerce.number()
    .positive('Jumlah harus lebih dari 0')
    .max(Number.MAX_SAFE_INTEGER, 'Jumlah terlalu besar'),
  description: z.string().optional(),
  frequency: z.enum(['harian', 'mingguan', 'bulanan', 'tahunan']),
  nextDate: z.coerce.date(),
});

export type RecurringTransactionState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createRecurringTransaction(
  _prevState: RecurringTransactionState,
  formData: FormData
): Promise<RecurringTransactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  const validatedFields = recurringTransactionSchema.safeParse({
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId') || null,
    type: formData.get('type'),
    amount: formData.get('amount'),
    description: formData.get('description'),
    frequency: formData.get('frequency'),
    nextDate: formData.get('nextDate'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { accountId, categoryId, type, amount, description, frequency, nextDate } = validatedFields.data;

  try {
    await db.insert(recurringTransactions).values({
      userId: session.user.id,
      accountId,
      categoryId: categoryId || null,
      type,
      amount: amount.toString(),
      description,
      frequency,
      nextDate,
      isActive: true,
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/recurring');
    return { success: true, message: 'Transaksi berulang berhasil dibuat' };
  } catch {
    return { errors: { general: ['Gagal membuat transaksi berulang'] } };
  }
}

export async function updateRecurringTransaction(
  id: string,
  _prevState: RecurringTransactionState,
  formData: FormData
): Promise<RecurringTransactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  const validatedFields = recurringTransactionSchema.safeParse({
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId') || null,
    type: formData.get('type'),
    amount: formData.get('amount'),
    description: formData.get('description'),
    frequency: formData.get('frequency'),
    nextDate: formData.get('nextDate'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await db
      .update(recurringTransactions)
      .set({
        ...validatedFields.data,
        categoryId: validatedFields.data.categoryId || null,
        amount: validatedFields.data.amount.toString(),
        updatedAt: new Date(),
      })
      .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/recurring');
    return { success: true, message: 'Transaksi berulang berhasil diperbarui' };
  } catch {
    return { errors: { general: ['Gagal memperbarui transaksi berulang'] } };
  }
}

export async function deleteRecurringTransaction(id: string): Promise<RecurringTransactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  try {
    await db
      .delete(recurringTransactions)
      .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/recurring');
    return { success: true, message: 'Transaksi berulang berhasil dihapus' };
  } catch {
    return { errors: { general: ['Gagal menghapus transaksi berulang'] } };
  }
}

export async function toggleRecurringTransaction(id: string, isActive: boolean): Promise<RecurringTransactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  try {
    await db
      .update(recurringTransactions)
      .set({ isActive, updatedAt: new Date() })
      .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/recurring');
    return { success: true, message: isActive ? 'Transaksi berulang diaktifkan' : 'Transaksi berulang dinonaktifkan' };
  } catch {
    return { errors: { general: ['Gagal mengubah status transaksi berulang'] } };
  }
}

export async function getRecurringTransactions() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const result = await db.query.recurringTransactions.findMany({
      where: eq(recurringTransactions.userId, session.user.id),
      with: {
        account: true,
        category: true,
      },
      orderBy: (rt, { asc }) => [asc(rt.nextDate)],
    });
    return result;
  } catch {
    return [];
  }
}

// Helper function to calculate next occurrence date
function calculateNextDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case 'harian':
      next.setDate(next.getDate() + 1);
      break;
    case 'mingguan':
      next.setDate(next.getDate() + 7);
      break;
    case 'bulanan':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'tahunan':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
}

// Process due recurring transactions - called by cron job or API route
export async function processRecurringTransactions(): Promise<{ processed: number; errors: string[] }> {
  const now = new Date();
  const errors: string[] = [];
  let processed = 0;

  try {
    // Find all active recurring transactions that are due
    const dueTransactions = await db.query.recurringTransactions.findMany({
      where: and(
        eq(recurringTransactions.isActive, true),
        lte(recurringTransactions.nextDate, now)
      ),
    });

    for (const recurring of dueTransactions) {
      try {
        // Create the actual transaction
        await db.insert(transactions).values({
          userId: recurring.userId,
          accountId: recurring.accountId,
          categoryId: recurring.categoryId,
          type: recurring.type,
          amount: recurring.amount,
          description: `[Otomatis] ${recurring.description || 'Transaksi berulang'}`,
          date: new Date(recurring.nextDate),
          isRecurring: true,
          recurringId: recurring.id,
        });

        // Update account balance
        const balanceChange = recurring.type === 'pemasukan' 
          ? Number(recurring.amount) 
          : -Number(recurring.amount);
        
        await db
          .update(accounts)
          .set({
            balance: sql`${accounts.balance} + ${balanceChange}`,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, recurring.accountId));

        // Calculate and set next occurrence
        const nextDate = calculateNextDate(new Date(recurring.nextDate), recurring.frequency);
        
        await db
          .update(recurringTransactions)
          .set({
            nextDate,
            updatedAt: new Date(),
          })
          .where(eq(recurringTransactions.id, recurring.id));

        processed++;
      } catch (error) {
        errors.push(`Failed to process recurring transaction ${recurring.id}: ${error}`);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/recurring');

    return { processed, errors };
  } catch (error) {
    return { processed: 0, errors: [`Failed to fetch recurring transactions: ${error}`] };
  }
}
