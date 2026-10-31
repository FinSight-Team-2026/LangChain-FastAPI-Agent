export interface Stock {
  id: string;
  code: string;
  name: string;
  market: 'KOSPI' | 'KOSDAQ';
  sector: string;
  price: number;
  change: number;             
  changeRate: number;
  volume: number;
  tradingValue: number;
  volumeSurgeRate: number;
  valueSurgeRate: number;
  marketCap?: number;
  sentimentScore: number;
  sentimentLabel: string;      
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sentimentSummary: string[];
  keyDrivers: string[];        
  sentimentHistory: Array<{   
    date: string;
    score: number;
    price: number;
  }>;
  news: Array<{
    id: string;
    title: string;
    source: string;
    publishedAt: string;
    snippet: string;
    sentiment: 'positive' | 'neutral' | 'negative' | string;
    sentimentScore: number;    
    sentimentReason: string;  
    keywords: string[];       
    url?: string;             
  }>;
}