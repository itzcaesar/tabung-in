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
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.coerce.number().positive('Amount must be positive'),
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

    const balanceChange = type === 'income' ? amount : -amount;
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

  try {
    await db
      .update(transactions)
      .set({
        ...validatedFields.data,
        categoryId: validatedFields.data.categoryId || null,
        amount: validatedFields.data.amount.toString(),
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');
    return { success: true, message: 'Transaction updated successfully' };
  } catch {
    return { errors: { general: ['Failed to update transaction'] } };
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
      transaction.type === 'income'
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
