'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

const accountSchema = z.object({
  name: z.string().min(1, 'Nama dompet wajib diisi'),
  type: z.enum(['rekening', 'emoney', 'tunai']),
  provider: z.string().optional().nullable(),
  balance: z.coerce.number().default(0),
  currency: z.string().default('IDR'),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
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
    return { errors: { general: ['Tidak terautentikasi'] } };
  }

  const validatedFields = accountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    provider: formData.get('provider') || undefined,
    balance: formData.get('balance') || 0,
    currency: formData.get('currency') || 'IDR',
    icon: formData.get('icon'),
    color: formData.get('color'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await db.insert(accounts).values({
      userId: session.user.id,
      name: validatedFields.data.name,
      type: validatedFields.data.type,
      provider: validatedFields.data.provider || null,
      balance: validatedFields.data.balance.toString(),
      currency: validatedFields.data.currency,
      icon: validatedFields.data.icon || null,
      color: validatedFields.data.color || null,
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/accounts');
    return { success: true, message: 'Dompet berhasil dibuat' };
  } catch (error) {
    console.error('[createAccount] Error:', error);
    return { errors: { general: ['Gagal membuat dompet'] } };
  }
}

export async function updateAccount(
  id: string,
  _prevState: AccountState,
  formData: FormData
): Promise<AccountState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Tidak terautentikasi'] } };
  }

  const validatedFields = accountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    provider: formData.get('provider') || undefined,
    balance: formData.get('balance') || 0,
    currency: formData.get('currency') || 'IDR',
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
        name: validatedFields.data.name,
        type: validatedFields.data.type,
        provider: validatedFields.data.provider || null,
        balance: validatedFields.data.balance.toString(),
        currency: validatedFields.data.currency,
        icon: validatedFields.data.icon,
        color: validatedFields.data.color,
        updatedAt: new Date(),
      })
      .where(and(eq(accounts.id, id), eq(accounts.userId, session.user.id)));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/accounts');
    return { success: true, message: 'Dompet berhasil diperbarui' };
  } catch {
    return { errors: { general: ['Gagal memperbarui dompet'] } };
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
