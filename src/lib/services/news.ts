import { NewsItem } from '@/lib/types/news';

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
    
    // Optimized: Compile regexes once and use more efficient matching
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    // Financial keywords set for faster lookup
    const financialKeywords = new Set(['saham', 'rupiah', 'investasi', 'ekonomi', 'bank', 'keuangan', 'inflasi', 'pajak']);
    
    for (const itemMatch of itemMatches) {
      if (items.length >= 5) break; // Early exit when we have enough items
      
      const item = itemMatch[1];
      
      // Extract all fields in a single pass through the item
      const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/);
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      const descMatch = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/);
      const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1].trim();
        const titleLower = title.toLowerCase();
        
        // Optimized: Check if any financial keyword exists in title using for-of
        let isFinancial = false;
        for (const keyword of financialKeywords) {
          if (titleLower.includes(keyword)) {
            isFinancial = true;
            break;
          }
        }
        
        if (isFinancial) {
          // Sanitize description: remove all HTML tags properly and decode entities
          let cleanDesc = '';
          if (descMatch) {
            // Replace HTML tags iteratively until none remain
            let text = descMatch[1];
            let prevText;
            do {
              prevText = text;
              text = text.replace(/<[^>]*>/g, '');
            } while (text !== prevText);
            cleanDesc = text.trim().slice(0, 120) + '...';
          }
          
          items.push({
            id: `${source}-${items.length}-${Date.now()}`,
            title,
            description: cleanDesc,
            url: linkMatch[1].trim(),
            source,
            publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
          });
        }
      }
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
