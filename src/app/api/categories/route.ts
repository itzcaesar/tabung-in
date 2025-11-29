import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    // Get both user-specific categories and default categories (null userId)
    const userCategories = await db.query.categories.findMany({
      where: eq(categories.userId, session.user.id),
    });

    // Also get default categories
    const defaultCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, ''));

    const allCategories = [...userCategories, ...defaultCategories];

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([], { status: 200 });
  }
}
