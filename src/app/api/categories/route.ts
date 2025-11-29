import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq, or, isNull } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // Return only default categories for unauthenticated users
      const defaultCategories = await db.query.categories.findMany({
        where: isNull(categories.userId),
      });
      return NextResponse.json({ categories: defaultCategories }, { status: 200 });
    }

    // Get both user-specific categories and default categories (null userId)
    const allCategories = await db.query.categories.findMany({
      where: or(
        eq(categories.userId, session.user.id),
        isNull(categories.userId)
      ),
    });

    return NextResponse.json({ categories: allCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
