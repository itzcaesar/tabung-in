'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { budgets } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

const budgetSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  categoryId: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  period: z.enum(['harian', 'mingguan', 'bulanan', 'tahunan']),
  startDate: z.coerce.date(),
  alertThreshold: z.coerce.number().min(0).max(100).default(80),
});

export type BudgetState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createBudget(
  _prevState: BudgetState,
  formData: FormData
): Promise<BudgetState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  const validatedFields = budgetSchema.safeParse({
    name: formData.get('name'),
    categoryId: formData.get('categoryId') || null,
    amount: formData.get('amount'),
    period: formData.get('period'),
    startDate: formData.get('startDate'),
    alertThreshold: formData.get('alertThreshold') || 80,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await db.insert(budgets).values({
      userId: session.user.id,
      ...validatedFields.data,
      categoryId: validatedFields.data.categoryId || null,
      amount: validatedFields.data.amount.toString(),
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/budgets');
    return { success: true, message: 'Budget created successfully' };
  } catch {
    return { errors: { general: ['Failed to create budget'] } };
  }
}

export async function updateBudget(
  id: string,
  _prevState: BudgetState,
  formData: FormData
): Promise<BudgetState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  const validatedFields = budgetSchema.safeParse({
    name: formData.get('name'),
    categoryId: formData.get('categoryId') || null,
    amount: formData.get('amount'),
    period: formData.get('period'),
    startDate: formData.get('startDate'),
    alertThreshold: formData.get('alertThreshold') || 80,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await db
      .update(budgets)
      .set({
        ...validatedFields.data,
        categoryId: validatedFields.data.categoryId || null,
        amount: validatedFields.data.amount.toString(),
        updatedAt: new Date(),
      })
      .where(and(eq(budgets.id, id), eq(budgets.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/budgets');
    return { success: true, message: 'Budget updated successfully' };
  } catch {
    return { errors: { general: ['Failed to update budget'] } };
  }
}

export async function deleteBudget(id: string): Promise<BudgetState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  try {
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/budgets');
    return { success: true, message: 'Budget deleted successfully' };
  } catch {
    return { errors: { general: ['Failed to delete budget'] } };
  }
}
