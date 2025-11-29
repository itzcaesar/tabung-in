export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
}

export interface FinancialTip {
  id: string;
  title: string;
  description: string;
}
