export interface DailyMetric {
  day: string; // e.g. "11.03", "11.04", ...
  fullDate: string; // "2026.11.03"
  sentimentScore: number; // 0 ~ 100
  stockPrice: number; // KRW
  kospiIndex: number; // Point (e.g. 2540.2)
}

export interface NewsItem {
  id: string;
  title: string;
  url?: string | null;
  source: string;
  timeAgo: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentLabel: '호재' | '이슈' | '리스크';
  summary: string;
}

export interface PanicDefenseInfo {
  isActive: boolean;
  stockChangePercent: number;
  kospiChangePercent: number;
  badgeText: string;
  headline: string;
  recommendation: string;
  defenseType: 'market_drop' | 'firm_divergence' | 'bullish_rally' | 'market_rebound';
}

export interface StockQuote {
  code: string;
  name: string;
  englishName: string;
  currentPrice: number;
  changePrice: number;
  changeRate: number; // e.g. -2.13 or 1.77
  high52w: number;
  low52w: number;
  volume: number; // 주
  tradingValue: number; // 억원
  marketCap: number; // 조원 or 억원
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  prevClosePrice: number;
  foreignOwnership: number; // %
  per: number;
  pbr: number;
}

export interface YearlyCandlePoint {
  date: string; // e.g. "2025.12"
  label: string; // e.g. "'25.12"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma60?: number;
}

export interface StockData {
  id: string;
  name: string;
  code: string;
  category: string;
  quote: StockQuote;
  sentimentScore: number;
  sentimentStatus: '긍정' | '매우 긍정' | '중립' | '주의' | '공포';
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  metrics7d: DailyMetric[];
  yearlyChartData: YearlyCandlePoint[];
  panicDefense: PanicDefenseInfo;
  newsSummary3Lines: NewsItem[];
  finalConclusion: {
    badge: '관망 추천' | '분할 매수 추천' | '적극 매수' | '리스크 관리';
    guidance: string;
    targetSupport: string;
    psychologicalTip: string;
  };
}

export interface StockTerm {
  id: string;
  term: string;
  englishTerm: string;
  category: string;
  shortDesc: string;
  detailedDesc: string;
  beginnerTip: string;
  exampleScenario: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  watchlist: string[];
  joinedDate: string;
}