'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { transactions, accounts } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';

const transactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional().nullable(),
  type: z.enum(['pemasukan', 'pengeluaran', 'transfer']),
  amount: z.coerce.number()
    .positive('Jumlah harus lebih dari 0')
    .max(Number.MAX_SAFE_INTEGER, 'Jumlah terlalu besar'),
  description: z.string().optional(),
  date: z.coerce.date(),
});

export type TransactionState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createTransaction(
  _prevState: TransactionState,
  formData: FormData
): Promise<TransactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  const validatedFields = transactionSchema.safeParse({
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId') || null,
    type: formData.get('type'),
    amount: formData.get('amount'),
    description: formData.get('description'),
    date: formData.get('date'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { accountId, categoryId, type, amount, description, date } = validatedFields.data;

  try {
    await db.insert(transactions).values({
      userId: session.user.id,
      accountId,
      categoryId: categoryId || null,
      type,
      amount: amount.toString(),
      description,
      date,
    });

    const balanceChange = type === 'pemasukan' ? amount : -amount;
    await db
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${balanceChange}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, accountId));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    return { success: true, message: 'Transaction created successfully' };
  } catch {
    return { errors: { general: ['Failed to create transaction'] } };
  }
}

export async function updateTransaction(
  id: string,
  _prevState: TransactionState,
  formData: FormData
): Promise<TransactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  const validatedFields = transactionSchema.safeParse({
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId') || null,
    type: formData.get('type'),
    amount: formData.get('amount'),
    description: formData.get('description'),
    date: formData.get('date'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { accountId, type, amount } = validatedFields.data;

  try {
    // Fetch old transaction to reverse balance
    const oldTransaction = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.userId, session.user.id)),
    });

    if (!oldTransaction) {
      return { errors: { general: ['Transaksi tidak ditemukan'] } };
    }

    const oldAmount = Number(oldTransaction.amount);
    const oldAccountId = oldTransaction.accountId;
    const oldType = oldTransaction.type;

    // Calculate balance changes
    // 1. Reverse old transaction effect on old account
    const oldReversal = oldType === 'pemasukan' ? -oldAmount : oldAmount;
    
    // 2. Apply new transaction effect on new account
    const newEffect = type === 'pemasukan' ? amount : -amount;

    // Update transaction record
    await db
      .update(transactions)
      .set({
        ...validatedFields.data,
        categoryId: validatedFields.data.categoryId || null,
        amount: amount.toString(),
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)));

    // Update balances
    if (oldAccountId === accountId) {
      // Same account: apply net change
      const netChange = newEffect + oldReversal;
      if (netChange !== 0) {
        await db
          .update(accounts)
          .set({
            balance: sql`${accounts.balance} + ${netChange}`,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, accountId));
      }
    } else {
      // Different accounts: reverse old, apply new
      // Reverse on old account
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${oldReversal}`,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, oldAccountId));

      // Apply on new account
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${newEffect}`,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, accountId));
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/accounts');
    return { success: true, message: 'Transaksi berhasil diperbarui' };
  } catch {
    return { errors: { general: ['Gagal memperbarui transaksi'] } };
  }
}

export async function deleteTransaction(id: string): Promise<TransactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  try {
    const transaction = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.userId, session.user.id)),
    });

    if (!transaction) {
      return { errors: { general: ['Transaction not found'] } };
    }

    const balanceChange =
      transaction.type === 'pemasukan'
        ? -Number(transaction.amount)
        : Number(transaction.amount);

    await db.delete(transactions).where(eq(transactions.id, id));

    await db
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${balanceChange}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, transaction.accountId));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    return { success: true, message: 'Transaction deleted successfully' };
  } catch {
    return { errors: { general: ['Failed to delete transaction'] } };
  }
}

export async function createTransactionFromReceipt(data: {
  accountId: string;
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
}): Promise<TransactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Tidak terautentikasi'] } };
  }

  try {
    // Validasi account exists dan milik user
    const account = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, data.accountId), eq(accounts.userId, session.user.id)),
    });

    if (!account) {
      return { errors: { general: ['Dompet tidak ditemukan'] } };
    }

    // Parse date
    const transactionDate = data.date ? new Date(data.date) : new Date();

    await db.insert(transactions).values({
      userId: session.user.id,
      accountId: data.accountId,
      type: 'pengeluaran',
      amount: data.amount.toString(),
      description: data.description,
      date: transactionDate,
      receiptUrl: data.receiptUrl || null,
    });

    // Update account balance
    await db
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} - ${data.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, data.accountId));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/receipts');
    return { success: true, message: 'Transaksi berhasil disimpan' };
  } catch (error) {
    console.error('Error creating transaction from receipt:', error);
    return { errors: { general: ['Gagal menyimpan transaksi'] } };
  }
}
