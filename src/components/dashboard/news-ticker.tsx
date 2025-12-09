'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { NewsItem } from '@/lib/types/news';

interface NewsTickerProps {
  className?: string;
}

export function NewsTicker({ className = '' }: NewsTickerProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function fetchNews() {
      try {
        const response = await fetch('/api/news');
        if (response.ok && mounted) {
          const data = await response.json();
          setNews(data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    }
    
    fetchNews();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Only show news in ticker
  const tickerItems = news.map((item, i) => ({
    id: `news-${i}`,
    type: 'news' as const,
    content: item.title,
    url: item.url,
    source: item.source,
  }));

  if (tickerItems.length === 0) {
    return null;
  }

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/10 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center py-2">
        {/* Label */}
        <div className="flex-shrink-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 z-10">
          <TrendingUp className="h-3 w-3" />
          INFO
        </div>
        
        {/* Ticker Container */}
        <div className="flex-1 overflow-hidden">
          <div 
            className={`flex whitespace-nowrap ${isPaused ? '' : 'animate-ticker'}`}
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span 
                key={`${item.id}-${index}`}
                className="inline-flex items-center gap-2 px-6"
              >
                {item.url ? (
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-primary transition-colors group"
                  >
                    <span className="text-sm text-foreground/80 group-hover:text-primary">{item.content}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <span className="text-sm text-foreground/80">{item.content}</span>
                )}
                {item.source && (
                  <span className="text-xs text-muted-foreground">— {item.source}</span>
                )}
                <span className="text-muted-foreground/50 mx-4">•</span>
              </span>
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
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
