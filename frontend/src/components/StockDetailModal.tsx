import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, BarChart3, Newspaper, CheckCircle2, ExternalLink } from 'lucide-react';
import { Stock } from '../types/stock';
import { formatPrice, formatChangeRate, formatChangeAmount, formatVolume, formatTradingValue, getPriceColorClass, getSentimentMeta } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
}

interface LatestSentiment {
  dailyId: number;
  stockCode: string;
  targetDate: string;
  totalArticles: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  avgScore: number;
}

interface DailySentimentItem {
  dailyId: number;
  stockCode: string;
  targetDate: string;
  avgScore: number;
}

interface NewsItem {
  id: number;
  title: string;
  snippet: string;
  summary: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  source: string;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const [newsFilter, setNewsFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [chartPeriod, setChartPeriod] = useState<'1일' | '1주' | '1개월' | '3개월' | '1년'>('1일');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // 백엔드 실데이터 상태
  const [latestSentiment, setLatestSentiment] = useState<LatestSentiment | null>(null);
  const [dailyHistory, setDailyHistory] = useState<DailySentimentItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { isInWatchlist, toggleWatchlist } = useAuth();
  const { showToast } = useToast();

  const targetStock = stock as any;
  const stockCode = targetStock?.code || targetStock?.id || '005930';

  useEffect(() => {
    if (!stock) return;

    setIsLoading(true);
    const API_BASE = 'http://localhost:8080/api/stocks';

    Promise.all([
      fetch(`${API_BASE}/${stockCode}/sentiment/latest`).then(res => res.ok ? res.json() : null),
      fetch(`${API_BASE}/${stockCode}/sentiment/daily`).then(res => res.ok ? res.json() : []),
      fetch(`${API_BASE}/${stockCode}/news/summaries?limit=20`).then(res => res.ok ? res.json() : [])
    ])
      .then(([latestData, dailyData, newsData]) => {
        if (latestData) {
          setLatestSentiment(latestData);
        }

        if (Array.isArray(dailyData) && dailyData.length > 0) {
          // 일자 오름차순 정렬 (차트 좌->우 시간 흐름)
          const sorted = [...dailyData].reverse();
          setDailyHistory(sorted);
        }

        if (Array.isArray(newsData)) {
          const mappedNews: NewsItem[] = newsData.map((item: any) => ({
            id: item.articleId,
            title: item.title,
            snippet: item.summary || item.title,
            summary: item.summary || '',
            url: item.url,
            publishedAt: item.publishedAt || '',
            sentiment: (item.label || 'neutral').toLowerCase() as any,
            sentimentScore: Math.round((item.score ?? 0) * 100) / 100,
            source: '네이버 뉴스'
          }));
          setNewsList(mappedNews);
        }
      })
      .catch((err) => {
        console.error('백엔드 데이터 조회 실패:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [stock, stockCode]);

  if (!stock) return null;

  const isWatched = isInWatchlist(targetStock.id);

  // 최신 점수 바인딩: 백엔드 최신 avgScore 우선, 없을 경우 기존값 폴백
  const currentSentimentScore = latestSentiment ? Math.round(latestSentiment.avgScore * 100) : (targetStock.sentimentScore ?? 50);
  const sentimentMeta = getSentimentMeta(currentSentimentScore);

  const handleToggleWatchlist = () => {
    const added = toggleWatchlist(targetStock.id);
    if (added) {
      showToast(`${targetStock.name}이(가) 관심 종목에 추가되었습니다.`);
    } else {
      showToast(`${targetStock.name}이(가) 관심 종목에서 제외되었습니다.`, 'info');
    }
  };

  // 뉴스 필터링
  const activeNewsSource = newsList.length > 0 ? newsList : (targetStock.news || []);

  // 실제 로딩된 뉴스 기사 기반 감성 건수 계산 (백엔드 통계 폴백)
  const posCount = activeNewsSource.filter((n: any) => n.sentiment === 'positive' || n.sentiment === '호재').length;
  const neuCount = activeNewsSource.filter((n: any) => n.sentiment === 'neutral' || n.sentiment === '중립').length;
  const negCount = activeNewsSource.filter((n: any) => n.sentiment === 'negative' || n.sentiment === '악재').length;

  const filteredNews = activeNewsSource.filter((item: any) => {
    if (newsFilter === 'all') return true;
    return item.sentiment === newsFilter;
  });

  // 차트 데이터 바인딩: 백엔드 30일 시계열 데이터 매핑
  const rawChartPoints = dailyHistory.length > 0
    ? dailyHistory.map(d => ({
        price: Math.round(d.avgScore * 100),
        date: d.targetDate
      }))
    : (targetStock.sentimentHistory && targetStock.sentimentHistory.length > 1
        ? targetStock.sentimentHistory.map((p: any, idx: number, arr: any[]) => {
            if (p.price <= 100) return p;
            const baseScore = currentSentimentScore || 75;
            const firstPrice = arr[0].price || p.price;
            const diffRatio = (p.price - firstPrice) / (firstPrice || 1);
            const variation = Math.round(diffRatio * 40) + ((idx % 2 === 0 ? 3 : -2));
            const calculated = Math.min(95, Math.max(30, baseScore + variation));
            return { price: calculated, date: p.date };
          })
        : [
            { price: Math.max(30, currentSentimentScore - 8), date: '10.24' },
            { price: Math.max(30, currentSentimentScore - 5), date: '10.25' },
            { price: Math.max(30, currentSentimentScore - 12), date: '10.26' },
            { price: Math.max(30, currentSentimentScore + 2), date: '10.27' },
            { price: Math.max(30, currentSentimentScore - 3), date: '10.28' },
            { price: currentSentimentScore, date: '10.29' }
          ]);

  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const prices = rawChartPoints.map((p: any) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) - 5 : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) + 5 : 100;

  const points = rawChartPoints.map((point: any, index: number) => {
    const x = paddingX + (index / (rawChartPoints.length - 1 || 1)) * innerWidth;
    const y = chartHeight - paddingY - ((point.price - minPrice) / (maxPrice - minPrice || 1)) * innerHeight;
    return { x, y, ...point };
  });

  const svgPath = points.reduce((acc: string, p: any, i: number) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaPath = points.length > 0 ? `${svgPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z` : '';

  const activeHoverPoint = hoveredPointIndex !== null && points[hoveredPointIndex] ? points[hoveredPointIndex] : points[points.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold">
              {targetStock.market || 'KOSPI'}
            </span>
            <span className="text-xs text-slate-500 font-medium">{targetStock.sector || '종목 상세'}</span>
            <span className="text-xs font-mono text-slate-400">({stockCode})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWatchlist}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isWatched
                  ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span>{isWatched ? '관심 종목' : '관심 추가'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Main Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{targetStock.name}</h2>
                <span className="text-xs text-slate-400 font-mono">{stockCode}</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-3xl font-extrabold text-slate-900 num-font tracking-tight">
                  {formatPrice(targetStock.price || 0)}
                </span>
                <div className={`flex items-baseline gap-1 text-sm font-bold ${getPriceColorClass(targetStock.changeRate || 0)}`}>
                  <span>{formatChangeAmount(targetStock.change || 0)}</span>
                  <span>({formatChangeRate(targetStock.changeRate || 0)})</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 border border-slate-100 bg-slate-50/70 p-3 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">거래량</span>
                <span className="font-bold text-slate-800 num-font">{formatVolume(targetStock.volume || 0)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">거래대금</span>
                <span className="font-bold text-slate-800 num-font">{formatTradingValue(targetStock.tradingValue || 0)}</span>
              </div>
            </div>
          </div>

          {/* Sentiment Gauge & Breakdown */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">실시간 AI 뉴스 감성 진단</h3>
              </div>
              {latestSentiment && (
                <span className="text-[11px] text-slate-400 font-mono">
                  기준일: {latestSentiment.targetDate} (총 {latestSentiment.totalArticles}건 분석)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-xs border border-slate-100">
                  <span className="text-2xl">{sentimentMeta.emoji || '📊'}</span>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">{sentimentMeta.label}</div>
                  <div className="text-xl font-black text-slate-900 num-font">{currentSentimentScore}점</div>
                </div>
              </div>

              {/* Counts */}
              <div className="md:col-span-3 grid grid-cols-3 gap-2">
                <div className="bg-white/80 p-2.5 rounded-xl border border-red-100 flex flex-col items-center">
                  <span className="text-[11px] text-[#F04452] font-semibold">호재(긍정)</span>
                  <span className="text-base font-extrabold text-slate-800 num-font">
                    {latestSentiment?.positiveCount ?? (posCount > 0 ? posCount : (targetStock.positiveCount ?? 0))}건
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200 flex flex-col items-center">
                  <span className="text-[11px] text-slate-600 font-semibold">중립</span>
                  <span className="text-base font-extrabold text-slate-800 num-font">
                    {latestSentiment?.neutralCount ?? (neuCount > 0 ? neuCount : (targetStock.neutralCount ?? 0))}건
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 flex flex-col items-center">
                  <span className="text-[11px] text-[#3182F6] font-semibold">악재(부정)</span>
                  <span className="text-base font-extrabold text-slate-800 num-font">
                    {latestSentiment?.negativeCount ?? (negCount > 0 ? negCount : (targetStock.negativeCount ?? 0))}건
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Trend Chart */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">감성 추이 차트 (최근 일별)</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {activeHoverPoint ? `${activeHoverPoint.date}: ${activeHoverPoint.price}점` : ''}
              </span>
            </div>

            <div className="w-full flex justify-center overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full max-w-[600px] h-[180px] overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3182F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3182F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Base reference line at 0 */}
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY - ((0 - minPrice) / (maxPrice - minPrice || 1)) * innerHeight}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY - ((0 - minPrice) / (maxPrice - minPrice || 1)) * innerHeight}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                />

                {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
                {svgPath && <path d={svgPath} fill="none" stroke="#3182F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                {points.map((p: any, idx: number) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPointIndex === idx ? 5 : 3}
                    className="fill-white stroke-[#3182F6] stroke-2 cursor-pointer transition-all hover:r-6"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* News Feed Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">관련 뉴스 & AI 3줄 요약</h3>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['all', 'positive', 'neutral', 'negative'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setNewsFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                      newsFilter === tab
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'all' ? '전체' : tab === 'positive' ? '호재' : tab === 'negative' ? '악재' : '중립'}
                  </button>
                ))}
              </div>
            </div>

            {/* News Articles Horizontal Scroll Container */}
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {filteredNews.length === 0 ? (
                <div className="w-full text-center py-8 text-xs text-slate-400">
                  {isLoading ? '뉴스 및 감성 데이터를 불러오는 중입니다...' : '조건에 해당하는 뉴스가 없습니다.'}
                </div>
              ) : (
                filteredNews.map((news: any) => {
                  const isPos = news.sentiment === 'positive';
                  const isNeg = news.sentiment === 'negative';

                  return (
                    <div
                      key={news.id}
                      className="min-w-[320px] max-w-[340px] p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all shrink-0 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-700">{news.source}</span>
                            <span>·</span>
                            <span>{news.publishedAt}</span>
                          </div>

                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold num-font ${
                              isPos
                                ? 'bg-red-50 text-[#F04452] border border-red-100'
                                : isNeg
                                ? 'bg-blue-50 text-[#3182F6] border border-blue-100'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isPos ? '긍정' : isNeg ? '부정' : '중립'} {news.sentimentScore}
                          </span>
                        </div>

                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link block"
                        >
                          <h4 className="text-xs font-bold text-slate-900 group-hover/link:text-blue-600 transition-colors line-clamp-2 mb-1.5 flex items-start gap-1">
                            <span>{news.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-slate-400 group-hover/link:text-blue-600 mt-0.5" />
                          </h4>
                        </a>

                        {/* Gemini 3-line summary */}
                        <div className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line bg-white/70 p-2.5 rounded-lg border border-slate-100 line-clamp-4">
                          {news.snippet}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>Gemini AI 요약 완료</span>
                        </div>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline"
                        >
                          원문 보기 →
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
