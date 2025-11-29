import { NextResponse } from 'next/server';
import { processRecurringTransactions } from '@/lib/actions/recurring-transactions';

// This endpoint can be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// Recommended: Run daily at midnight
export async function GET(request: Request) {
  // Verify cron secret for security (set CRON_SECRET in env)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processRecurringTransactions();
    
    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to process recurring transactions:', error);
    return NextResponse.json(
      { error: 'Failed to process recurring transactions' },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: Request) {
  return GET(request);
}
