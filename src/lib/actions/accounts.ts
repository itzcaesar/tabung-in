'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  balance: z.coerce.number().default(0),
  currency: z.string().default('USD'),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type AccountState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createAccount(
  _prevState: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  const validatedFields = accountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    balance: formData.get('balance') || 0,
    currency: formData.get('currency') || 'USD',
    icon: formData.get('icon'),
    color: formData.get('color'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await db.insert(accounts).values({
      userId: session.user.id,
      ...validatedFields.data,
      balance: validatedFields.data.balance.toString(),
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/accounts');
    return { success: true, message: 'Account created successfully' };
  } catch {
    return { errors: { general: ['Failed to create account'] } };
  }
}

export async function updateAccount(
  id: string,
  _prevState: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  const validatedFields = accountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    balance: formData.get('balance') || 0,
    currency: formData.get('currency') || 'USD',
    icon: formData.get('icon'),
    color: formData.get('color'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await db
      .update(accounts)
      .set({
        ...validatedFields.data,
        balance: validatedFields.data.balance.toString(),
        updatedAt: new Date(),
      })
      .where(and(eq(accounts.id, id), eq(accounts.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/accounts');
    return { success: true, message: 'Account updated successfully' };
  } catch {
    return { errors: { general: ['Failed to update account'] } };
  }
}

export async function deleteAccount(id: string): Promise<AccountState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  try {
    await db
      .delete(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/accounts');
    return { success: true, message: 'Account deleted successfully' };
  } catch {
    return { errors: { general: ['Failed to delete account'] } };
  }
}
