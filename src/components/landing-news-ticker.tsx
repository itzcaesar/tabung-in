'use client';

import { useEffect, useState } from 'react';
import { Newspaper, TrendingUp, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  link?: string;
}

export function LandingNewsTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch news dari API saat di client
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const newsItems: NewsItem[] = data.map((n: { id: string; title: string; source: string; url?: string }) => ({
              id: n.id,
              title: n.title,
              source: n.source,
              link: n.url,
            }));
            setItems(newsItems);
          }
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    fetchNews();
  }, []);

  // Don't render if no news
  if (items.length === 0) {
    return null;
  }

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
          {/* Label */}
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-4 pr-6">
            <div className="flex items-center gap-2 text-emerald-500">
              <Newspaper className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Berita</span>
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
                <TrendingUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
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
