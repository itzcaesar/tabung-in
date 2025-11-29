import { NewsItem, FinancialTip } from '@/lib/types/news';

// Fallback news jika RSS gagal
const fallbackNews: NewsItem[] = [
  {
    id: '1',
    title: 'Tips Mengelola Keuangan di Akhir Tahun',
    description: 'Pelajari cara mengatur budget dan menabung lebih efektif untuk tahun depan.',
    url: '#',
    source: 'Tabung.in Tips',
    publishedAt: new Date(),
  },
  {
    id: '2',
    title: 'Pentingnya Dana Darurat untuk Stabilitas Finansial',
    description: 'Dana darurat adalah fondasi keuangan yang sehat. Berikut cara membangunnya.',
    url: '#',
    source: 'Tabung.in Tips',
    publishedAt: new Date(),
  },
  {
    id: '3',
    title: 'Cara Bijak Menggunakan E-Wallet',
    description: 'E-wallet memudahkan transaksi, tapi perlu strategi agar tidak boros.',
    url: '#',
    source: 'Tabung.in Tips',
    publishedAt: new Date(),
  },
];

// RSS feeds dari sumber berita finansial Indonesia
const RSS_FEEDS = [
  {
    url: 'https://www.cnbcindonesia.com/rss',
    source: 'CNBC Indonesia',
  },
];

// Parser RSS sederhana
async function parseRSSFeed(feedUrl: string, source: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(feedUrl, { 
      next: { revalidate: 3600 }, // Cache 1 jam
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TabungIn/1.0)',
      },
    });
    
    if (!response.ok) return [];
    
    const xml = await response.text();
    const items: NewsItem[] = [];
    
    // Simple regex parsing untuk RSS
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
    
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      
      const titleMatch = titleRegex.exec(item);
      const linkMatch = linkRegex.exec(item);
      const descMatch = descRegex.exec(item);
      const pubDateMatch = pubDateRegex.exec(item);
      
      if (titleMatch && linkMatch) {
        const title = (titleMatch[1] || titleMatch[2] || '').trim();
        // Filter hanya berita finansial
        if (title.toLowerCase().includes('saham') || 
            title.toLowerCase().includes('rupiah') ||
            title.toLowerCase().includes('investasi') ||
            title.toLowerCase().includes('ekonomi') ||
            title.toLowerCase().includes('bank') ||
            title.toLowerCase().includes('keuangan') ||
            title.toLowerCase().includes('inflasi') ||
            title.toLowerCase().includes('pajak')) {
          items.push({
            id: `${source}-${items.length}-${Date.now()}`,
            title,
            description: (descMatch?.[1] || descMatch?.[2] || '').replace(/<[^>]*>/g, '').trim().slice(0, 120) + '...',
            url: linkMatch[1].trim(),
            source,
            publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
          });
        }
      }
      
      if (items.length >= 5) break;
    }
    
    return items;
  } catch (error) {
    console.error(`Error fetching RSS from ${source}:`, error);
    return [];
  }
}

export async function getFinancialNews(): Promise<NewsItem[]> {
  try {
    const allNews = await Promise.all(
      RSS_FEEDS.map(feed => parseRSSFeed(feed.url, feed.source))
    );
    
    const combinedNews = allNews
      .flat()
      .filter(news => news.title && news.url)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);
    
    if (combinedNews.length === 0) {
      return fallbackNews;
    }
    
    return combinedNews;
  } catch (error) {
    console.error('Error fetching news:', error);
    return fallbackNews;
  }
}

// Tips finansial statis
export const financialTips: FinancialTip[] = [
  {
    id: 'tip1',
    title: '💡 Aturan 50/30/20',
    description: 'Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan.',
  },
  {
    id: 'tip2',
    title: '🎯 Target Tabungan',
    description: 'Tetapkan target tabungan bulanan dan otomatisasi transfer ke rekening tabungan.',
  },
  {
    id: 'tip3',
    title: '📊 Review Mingguan',
    description: 'Luangkan 10 menit setiap minggu untuk review pengeluaran Anda.',
  },
  {
    id: 'tip4',
    title: '🚨 Dana Darurat',
    description: 'Siapkan dana darurat minimal 3-6 bulan pengeluaran bulanan.',
  },
  {
    id: 'tip5',
    title: '💳 Hindari Utang Konsumtif',
    description: 'Gunakan kartu kredit dengan bijak, bayar penuh setiap bulan.',
  },
];
