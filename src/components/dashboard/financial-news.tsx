'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, ExternalLink, Lightbulb, RefreshCw, TrendingUp } from 'lucide-react';
import { NewsItem } from '@/lib/types/news';
import { financialTips } from '@/lib/constants/tips';

interface FinancialNewsProps {
  initialNews?: NewsItem[];
}

export function FinancialNews({ initialNews = [] }: FinancialNewsProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'tips'>('tips');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const hasFetchedRef = useRef(initialNews.length > 0);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchNews();
    }
  }, []);

  // Rotate tips setiap 8 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % financialTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}h lalu`;
    if (diffHours > 0) return `${diffHours}j lalu`;
    return 'Baru';
  };

  const currentTip = financialTips[currentTipIndex];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Info Finansial
          </CardTitle>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                activeTab === 'tips'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              Tips
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                activeTab === 'news'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              Berita
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {activeTab === 'tips' ? (
          <div className="space-y-3">
            {/* Featured Tip */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{currentTip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {currentTip.description}
                  </p>
                </div>
              </div>
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-4">
                {financialTips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTipIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentTipIndex
                        ? 'w-4 bg-primary'
                        : 'w-1.5 bg-primary/30 hover:bg-primary/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : news.length > 0 ? (
              <>
                {news.slice(0, 3).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(item.publishedAt)}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
                <button
                  onClick={fetchNews}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Tidak ada berita</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
