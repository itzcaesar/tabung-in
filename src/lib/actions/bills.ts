'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { bills, categories } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { CreateBillInput, UpdateBillInput, BillFrequency, BillStatus } from '@/lib/utils/bills';

export async function createBill(input: CreateBillInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const [newBill] = await db.insert(bills).values({
      userId: session.user.id,
      name: input.name,
      description: input.description,
      amount: input.amount.toString(),
      dueDate: input.dueDate,
      frequency: input.frequency,
      categoryId: input.categoryId,
      reminderDays: input.reminderDays || 3,
      icon: input.icon,
      color: input.color,
      notes: input.notes,
      isAutoPay: input.autopay || false,
      nextDueDate: calculateNextDueDate(input.dueDate, input.frequency),
      status: 'aktif',
    }).returning();

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/bills');
    
    return { success: true, bill: newBill };
  } catch (error) {
    console.error('Error creating bill:', error);
    return { error: 'Failed to create bill' };
  }
}

export async function updateBill(input: UpdateBillInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.amount) updateData.amount = input.amount.toString();
    if (input.dueDate) updateData.dueDate = input.dueDate;
    if (input.frequency) updateData.frequency = input.frequency;
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
    if (input.reminderDays !== undefined) updateData.reminderDays = input.reminderDays;
    if (input.icon !== undefined) updateData.icon = input.icon;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.status) updateData.status = input.status;
    if (input.lastPaidDate) updateData.lastPaidDate = input.lastPaidDate;

    const [updatedBill] = await db.update(bills)
      .set(updateData)
      .where(and(
        eq(bills.id, input.id),
        eq(bills.userId, session.user.id)
      ))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/bills');
    
    return { success: true, bill: updatedBill };
  } catch (error) {
    console.error('Error updating bill:', error);
    return { error: 'Failed to update bill' };
  }
}

export async function deleteBill(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await db.delete(bills).where(and(
      eq(bills.id, id),
      eq(bills.userId, session.user.id)
    ));

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/bills');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting bill:', error);
    return { error: 'Failed to delete bill' };
  }
}

export async function markBillAsPaid(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    // Get current bill
    const [currentBill] = await db.select()
      .from(bills)
      .where(and(
        eq(bills.id, id),
        eq(bills.userId, session.user.id)
      ));

    if (!currentBill) {
      return { error: 'Bill not found' };
    }

    const now = new Date();
    let newStatus: BillStatus = 'aktif';
    let nextDueDate = currentBill.nextDueDate;

    // If one-time bill, mark as completed
    if (currentBill.frequency === 'sekali') {
      newStatus = 'lunas';
    } else {
      // Calculate next due date for recurring bills
      nextDueDate = calculateNextDueDate(
        currentBill.dueDate,
        currentBill.frequency as BillFrequency
      );
    }

    const [updatedBill] = await db.update(bills)
      .set({
        status: newStatus,
        lastPaidDate: now,
        nextDueDate,
        updatedAt: now,
      })
      .where(and(
        eq(bills.id, id),
        eq(bills.userId, session.user.id)
      ))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/bills');
    
    return { success: true, bill: updatedBill };
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    return { error: 'Failed to mark bill as paid' };
  }
}

export async function getBills() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const userBills = await db.query.bills.findMany({
      where: eq(bills.userId, session.user.id),
      with: { category: true },
      orderBy: [asc(bills.dueDate)],
    });

    return userBills;
  } catch (error) {
    console.error('Error fetching bills:', error);
    return [];
  }
}

export async function getUpcomingBills(days: number = 7) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const upcomingBills = await db.select()
      .from(bills)
      .where(and(
        eq(bills.userId, session.user.id),
        eq(bills.status, 'aktif'),
        gte(bills.dueDate, now),
        lte(bills.dueDate, futureDate)
      ))
      .orderBy(asc(bills.dueDate));

    return upcomingBills;
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    return [];
  }
}

export async function getOverdueBills() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const now = new Date();

    // Update status for overdue bills
    await db.update(bills)
      .set({ status: 'terlambat' })
      .where(and(
        eq(bills.userId, session.user.id),
        eq(bills.status, 'aktif'),
        lte(bills.dueDate, now)
      ));

    const overdueBills = await db.select()
      .from(bills)
      .where(and(
        eq(bills.userId, session.user.id),
        eq(bills.status, 'terlambat')
      ))
      .orderBy(asc(bills.dueDate));

    return overdueBills;
  } catch (error) {
    console.error('Error fetching overdue bills:', error);
    return [];
  }
}

function calculateNextDueDate(currentDueDate: Date, frequency: BillFrequency): Date {
  const nextDate = new Date(currentDueDate);
  
  switch (frequency) {
    case 'mingguan':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'bulanan':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'tahunan':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'sekali':
    default:
      // No next date for one-time bills
      break;
  }
  
  return nextDate;
}
