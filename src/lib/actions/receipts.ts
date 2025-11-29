'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { receipts } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export type ReceiptState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
  data?: {
    merchantName?: string;
    totalAmount?: number;
    date?: string;
    items?: Array<{ name: string; price: number }>;
  };
};

export async function processReceipt(imageUrl: string): Promise<ReceiptState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  try {
    // Store the receipt for processing
    const [receipt] = await db
      .insert(receipts)
      .values({
        userId: session.user.id,
        imageUrl,
        processed: false,
      })
      .returning();

    // In production, you would integrate with an OCR service like:
    // - Google Cloud Vision
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract.js (client-side)
    // 
    // For now, we'll return a placeholder that indicates the receipt was saved
    // and needs external OCR processing
    
    // Simulated OCR response structure
    const ocrResult = {
      merchantName: 'Pending OCR Processing',
      totalAmount: 0,
      date: new Date().toISOString(),
      items: [],
    };

    // Update the receipt with OCR data
    await db
      .update(receipts)
      .set({
        ocrData: JSON.stringify(ocrResult),
        merchantName: ocrResult.merchantName,
        totalAmount: ocrResult.totalAmount.toString(),
        date: new Date(ocrResult.date),
        processed: true,
      })
      .where(eq(receipts.id, receipt.id));

    revalidatePath('/dashboard/receipts');
    return {
      success: true,
      message: 'Receipt uploaded successfully',
      data: ocrResult,
    };
  } catch {
    return { errors: { general: ['Failed to process receipt'] } };
  }
}

export async function linkReceiptToTransaction(
  receiptId: string,
  transactionId: string
): Promise<ReceiptState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  try {
    await db
      .update(receipts)
      .set({ transactionId })
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, session.user.id)));

    revalidatePath('/dashboard/receipts');
    revalidatePath('/dashboard/transactions');
    return { success: true, message: 'Receipt linked to transaction' };
  } catch {
    return { errors: { general: ['Failed to link receipt'] } };
  }
}

export async function deleteReceipt(id: string): Promise<ReceiptState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: { general: ['Unauthorized'] } };
  }

  try {
    await db
      .delete(receipts)
      .where(and(eq(receipts.id, id), eq(receipts.userId, session.user.id)));

    revalidatePath('/dashboard/receipts');
    return { success: true, message: 'Receipt deleted successfully' };
  } catch {
    return { errors: { general: ['Failed to delete receipt'] } };
  }
}
