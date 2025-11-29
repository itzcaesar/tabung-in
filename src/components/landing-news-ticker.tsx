'use client';

import { useEffect, useState } from 'react';
import { Newspaper, TrendingUp, Lightbulb, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  link?: string;
  type: 'news' | 'tip';
}

// Tips keuangan statis untuk landing page
const financialTips: NewsItem[] = [
  { id: 'tip-1', title: 'Mulai dengan mencatat semua pengeluaran harian, sekecil apapun', source: 'Tips', type: 'tip' },
  { id: 'tip-2', title: 'Sisihkan 20% penghasilan untuk tabungan sebelum membayar tagihan lainnya', source: 'Tips', type: 'tip' },
  { id: 'tip-3', title: 'Buat anggaran bulanan dan pantau pengeluaran per kategori', source: 'Tips', type: 'tip' },
  { id: 'tip-4', title: 'Gunakan metode 50/30/20: 50% kebutuhan, 30% keinginan, 20% tabungan', source: 'Tips', type: 'tip' },
  { id: 'tip-5', title: 'Siapkan dana darurat minimal 3-6 bulan pengeluaran', source: 'Tips', type: 'tip' },
  { id: 'tip-6', title: 'Hindari utang konsumtif, prioritaskan utang produktif', source: 'Tips', type: 'tip' },
  { id: 'tip-7', title: 'Review anggaran setiap akhir bulan untuk evaluasi pengeluaran', source: 'Tips', type: 'tip' },
  { id: 'tip-8', title: 'Catat transaksi segera setelah terjadi agar tidak lupa', source: 'Tips', type: 'tip' },
];

export function LandingNewsTicker() {
  const [items, setItems] = useState<NewsItem[]>(financialTips);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch news dari API saat di client
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          if (data.news && data.news.length > 0) {
            const newsItems: NewsItem[] = data.news.slice(0, 5).map((n: { id: string; title: string; source: string; link?: string }) => ({
              id: n.id,
              title: n.title,
              source: n.source,
              link: n.link,
              type: 'news' as const,
            }));
            // Gabungkan tips dan news
            setItems([...financialTips, ...newsItems]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    fetchNews();
  }, []);

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 border-y border-emerald-500/10">
      <div className="mx-auto max-w-7xl">
        <div 
          className="relative overflow-hidden py-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Label */}
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-4 pr-6 bg-gradient-to-r from-background via-background to-transparent">
            <div className="flex items-center gap-2 text-emerald-500">
              <Newspaper className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Tips & Berita</span>
            </div>
          </div>
          
          {/* Scrolling content */}
          <div 
            className="flex items-center gap-8 whitespace-nowrap pl-32 sm:pl-40"
            style={{
              animation: isPaused ? 'none' : 'ticker 80s linear infinite',
            }}
          >
            {duplicatedItems.map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="flex items-center gap-3 text-sm"
              >
                {item.type === 'tip' ? (
                  <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                )}
                {item.link ? (
                  <a 
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <span className="max-w-[300px] truncate">{item.title}</span>
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                ) : (
                  <span className="text-muted-foreground max-w-[300px] truncate">{item.title}</span>
                )}
                <span className="text-xs text-muted-foreground/50 hidden sm:inline">• {item.source}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
      `}</style>
    </div>
  );
}
