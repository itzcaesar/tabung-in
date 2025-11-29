'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type GoalStatus = 'aktif' | 'tercapai' | 'dibatalkan';

export interface CreateGoalInput {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  category?: string;
  deadline?: Date;
  priority?: number;
  icon?: string;
  color?: string;
  notes?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  status?: GoalStatus;
}

export async function createGoal(input: CreateGoalInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const [newGoal] = await db.insert(goals).values({
      userId: session.user.id,
      name: input.name,
      description: input.description,
      targetAmount: input.targetAmount.toString(),
      currentAmount: (input.currentAmount || 0).toString(),
      category: input.category,
      deadline: input.deadline,
      priority: input.priority || 1,
      icon: input.icon,
      color: input.color,
      notes: input.notes,
    }).returning();

    revalidatePath('/dashboard');
    return { success: true, goal: newGoal };
  } catch (error) {
    console.error('Error creating goal:', error);
    return { success: false, error: 'Failed to create goal' };
  }
}

export async function updateGoal(id: string, input: UpdateGoalInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.targetAmount !== undefined) updateData.targetAmount = input.targetAmount.toString();
    if (input.currentAmount !== undefined) updateData.currentAmount = input.currentAmount.toString();
    if (input.category !== undefined) updateData.category = input.category;
    if (input.deadline !== undefined) updateData.deadline = input.deadline;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.icon !== undefined) updateData.icon = input.icon;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const [updatedGoal] = await db
      .update(goals)
      .set(updateData)
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, goal: updatedGoal };
  } catch (error) {
    console.error('Error updating goal:', error);
    return { success: false, error: 'Failed to update goal' };
  }
}

// Tambah progress ke goal
export async function addGoalProgress(id: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get current goal
    const goal = await db.query.goals.findFirst({
      where: and(eq(goals.id, id), eq(goals.userId, session.user.id)),
    });

    if (!goal) {
      return { success: false, error: 'Goal not found' };
    }

    const newAmount = Number(goal.currentAmount) + amount;
    const isComplete = newAmount >= Number(goal.targetAmount);

    const [updatedGoal] = await db
      .update(goals)
      .set({
        currentAmount: newAmount.toString(),
        status: isComplete ? 'tercapai' : 'aktif',
        updatedAt: new Date(),
      })
      .where(eq(goals.id, id))
      .returning();

    revalidatePath('/dashboard');
    return { success: true, goal: updatedGoal, isComplete };
  } catch (error) {
    console.error('Error adding progress:', error);
    return { success: false, error: 'Failed to add progress' };
  }
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)));

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { success: false, error: 'Failed to delete goal' };
  }
}

export async function getGoals(status?: GoalStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const conditions = [eq(goals.userId, session.user.id)];
    if (status) {
      conditions.push(eq(goals.status, status));
    }

    const userGoals = await db.query.goals.findMany({
      where: and(...conditions),
      orderBy: [desc(goals.priority), desc(goals.createdAt)],
    });

    return userGoals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
}

export async function getActiveGoals() {
  return getGoals('aktif');
}
