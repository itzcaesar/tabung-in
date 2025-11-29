import { NextResponse } from 'next/server';
import { getFinancialNews } from '@/lib/services/news';

export const revalidate = 3600; // Cache 1 jam

export async function GET() {
  try {
    const news = await getFinancialNews();
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
