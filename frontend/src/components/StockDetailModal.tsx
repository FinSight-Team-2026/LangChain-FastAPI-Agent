import React, { useState, useEffect } from 'react';
import { X, Star, BarChart3, Newspaper } from 'lucide-react';
import { Stock } from '../types/stock';
import {
  formatPrice,
  formatChangeRate,
  formatChangeAmount,
  formatVolume,
  formatTradingValue,
  getPriceColorClass,
  getSentimentMeta
} from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

const API_BASE = 'http://localhost:8080/api/stocks';

interface DailySentimentItem {
  dailyId: number;
  stockCode: string;
  targetDate: string;
  avgScore: number;
}

interface StockPriceItem {
  priceId: number;
  stockCode: string;
  tradeDate: string;
  closePrice: number;
}

interface NewsItem {
  id: number | string;
  title: string;
  snippet: string;
  summary: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  source: string;
}

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  // 1. 모든 React Hook은 조건문(if)보다 상단에 선언
  const [newsFilter, setNewsFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const { isInWatchlist, toggleWatchlist } = useAuth();
  const { showToast } = useToast();

  const [dailyHistory, setDailyHistory] = useState<DailySentimentItem[]>([]);
  const [dailyPrices, setDailyPrices] = useState<StockPriceItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [latestSentiment, setLatestSentiment] = useState<any>(null);
  const [realtimePrice, setRealtimePrice] = useState<{
    closePrice: number;
    change: number;
    changeRate: number;
    volume: number;
    tradingValue: number;
  } | null>(null);

  // 종목 코드 추출 (모든 프로퍼티 지원)
  const targetStock = stock as any;
  const stockCode = String(
    targetStock?.stockCode ||
    targetStock?.code ||
    targetStock?.id ||
    targetStock?.itemCode ||
    ''
  ).trim();

  const safeJson = async (res: Response, fallback: any) => {
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : fallback;
    } catch {
      return fallback;
    }
  };

  console.log('@@ Modal stock prop:', stock);
  console.log('@@ Modal stockCode:', stockCode);

  useEffect(() => {
    if (!stockCode) return;

    Promise.all([
      fetch(`${API_BASE}/${stockCode}/price`).then(res => safeJson(res, null)),
      fetch(`${API_BASE}/${stockCode}/sentiment/latest`).then(res => safeJson(res, null)),
      fetch(`${API_BASE}/${stockCode}/sentiment/daily`).then(res => safeJson(res, [])),
      fetch(`${API_BASE}/${stockCode}/news/summaries?limit=20`).then(res => safeJson(res, [])),
      fetch(`${API_BASE}/${stockCode}/prices/daily`).then(res => safeJson(res, []))
    ])
      .then(([priceData, latestData, dailyData, newsData, pricesData]) => {
        // 1. 실시간 시세
        if (priceData) {
          const rawPrice = priceData.closePrice || priceData.nowPrice || priceData.stockPrice || targetStock?.currentPrice || '0';
          const parsedPrice = parseInt(String(rawPrice).replace(/,/g, ''), 10) || 0;

          const rawChange = priceData.compareToPreviousClosePrice 
            || priceData.compareToPreviousPrice?.amount 
            || priceData.changePrice 
            || targetStock?.changeAmount 
            || '0';
          const parsedChange = parseInt(String(rawChange).replace(/,/g, ''), 10) || 0;

          const rawRate = priceData.fluctuationsRatio || priceData.changeRate || targetStock?.changeRate || '0';
          const parsedChangeRate = parseFloat(String(rawRate).replace(/,/g, '')) || 0;

          const rawVolume = priceData.totalVolume || priceData.accumulatedTradingVolume || priceData.volume || targetStock?.tradingVolume || '0';
          const parsedVolume = parseInt(String(rawVolume).replace(/,/g, ''), 10) || 0;

          const rawValue = priceData.totalTradeValue || priceData.accumulatedTradingValue || priceData.tradingValue || targetStock?.tradingValue || '0';
          const parsedTradingValue = parseInt(String(rawValue).replace(/,/g, ''), 10) || 0;

          if (parsedPrice > 0) {
            setRealtimePrice({
              closePrice: parsedPrice,
              change: parsedChange,
              changeRate: parsedChangeRate,
              volume: parsedVolume,
              tradingValue: parsedTradingValue
            });
          }
        }

        // 2. 최신 감성
        if (latestData) {
          setLatestSentiment(latestData);
        }

        // 3. 일별 감성 (날짜 오름차순 정렬)
        if (Array.isArray(dailyData) && dailyData.length > 0) {
          const sorted = [...dailyData].sort((a, b) => 
            String(a.targetDate || '').localeCompare(String(b.targetDate || ''))
          );
          setDailyHistory(sorted);
        }

        // 4. 일별 주가 (날짜 오름차순 정렬)
        if (Array.isArray(pricesData) && pricesData.length > 0) {
          const sortedPrices = [...pricesData].sort((a, b) => 
            String(a.tradeDate || '').localeCompare(String(b.tradeDate || ''))
          );
          setDailyPrices(sortedPrices);
        }

        // 5. 뉴스 목록
        if (Array.isArray(newsData)) {
          const mappedNews: NewsItem[] = newsData.map((item: any) => ({
            id: item.articleId || item.id || Math.random(),
            title: (item.title || '').replace(/<[^>]*>?/g, ''),
            snippet: (item.summary || item.title || '').replace(/<[^>]*>?/g, ''),
            summary: (item.summary || '').replace(/<[^>]*>?/g, ''),
            url: item.url || '#',
            publishedAt: item.publishedAt || '',
            sentiment: (item.label || 'neutral').toLowerCase() as 'positive' | 'neutral' | 'negative',
            sentimentScore: Math.round((item.score ?? 0) * 100) / 100,
            source: '네이버 뉴스'
          }));
          setNewsList(mappedNews);
        }
      })
      .catch(err => console.error('데이터 조회 실패:', err));
  }, [stockCode, stock]);

  // Hook 선언 후 stock null 체크
  if (!stock) return null;

  const isWatched = isInWatchlist ? isInWatchlist(stockCode) : false;

  const normalizeScore = (score: number | undefined | null) => {
    if (score === undefined || score === null || isNaN(score)) return 50;
    if (score >= -1 && score <= 1) {
      return Math.round((score + 1) * 50);
    }
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const currentScore = latestSentiment ? normalizeScore(latestSentiment.avgScore) : (targetStock.sentimentScore ?? 50);
  const sentimentMeta = getSentimentMeta(currentScore);

  const displayPrice = Number(realtimePrice?.closePrice ?? targetStock.currentPrice ?? targetStock.price ?? 0);
  const displayChange = Number(realtimePrice?.change ?? targetStock.changeAmount ?? 0);
  const displayChangeRate = Number(realtimePrice?.changeRate ?? targetStock.changeRate ?? 0);
  const displayVolume = Number(realtimePrice?.volume ?? targetStock.tradingVolume ?? targetStock.volume ?? 0);
  const displayTradingValue = Number(realtimePrice?.tradingValue ?? targetStock.tradingValue ?? 0);

  const handleToggleWatchlist = async () => {
    if (!toggleWatchlist) return;
    const added = await toggleWatchlist(stockCode, targetStock.name);
    if (added) {
      showToast?.(`${targetStock.name}이(가) 관심 종목에 추가되었습니다.`);
    } else {
      showToast?.(`${targetStock.name}이(가) 관심 종목에서 제외되었습니다.`, 'info');
    }
  };

  const currentNewsSource: NewsItem[] = newsList.length > 0 ? newsList : (targetStock.news || []);
  const filteredNews = currentNewsSource.filter((item: NewsItem) => {
    if (newsFilter === 'all') return true;
    return item.sentiment === newsFilter;
  });

  // --- 차트 좌표 계산 ---
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const priceMap = new Map(
    dailyPrices.map(p => [String(p.tradeDate).slice(0, 10), Number(p.closePrice)])
  );

  const dateSet = new Set<string>();
  dailyHistory.forEach(d => { if (d.targetDate) dateSet.add(String(d.targetDate).slice(0, 10)); });
  dailyPrices.forEach(p => { if (p.tradeDate) dateSet.add(String(p.tradeDate).slice(0, 10)); });

  const allDates = Array.from(dateSet).sort().slice(-7);

  const rawChartPoints = allDates.map(date => {
    const sentItem = dailyHistory.find(d => String(d.targetDate).slice(0, 10) === date);
    const score = sentItem ? normalizeScore(sentItem.avgScore) : 50;
    const price = priceMap.get(date) ?? null;
    return {
      date,
      sentiment: score,
      stockPrice: price
    };
  });

  const validPrices = rawChartPoints
    .map(p => p.stockPrice)
    .filter((p): p is number => p !== null && !isNaN(p) && p > 0);

  const minStockPrice = validPrices.length > 0 ? Math.min(...validPrices) * 0.98 : 50000;
  const maxStockPrice = validPrices.length > 0 ? Math.max(...validPrices) * 1.02 : 70000;
  const priceRange = maxStockPrice - minStockPrice === 0 ? 1 : maxStockPrice - minStockPrice;

  const sentimentPoints = rawChartPoints.map((p, idx) => {
    const x = rawChartPoints.length <= 1
      ? paddingX + innerWidth / 2
      : paddingX + (idx / (rawChartPoints.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - (p.sentiment / 100) * innerHeight;
    return { ...p, x, y };
  });

  const stockPoints = rawChartPoints.map((p, idx) => {
    const x = rawChartPoints.length <= 1
      ? paddingX + innerWidth / 2
      : paddingX + (idx / (rawChartPoints.length - 1)) * innerWidth;
    const y = p.stockPrice !== null
      ? chartHeight - paddingY - ((p.stockPrice - minStockPrice) / priceRange) * innerHeight
      : null;
    return { ...p, x, y };
  });

  const sentimentSvgPath = sentimentPoints.length > 0
    ? sentimentPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaPath = sentimentPoints.length > 0
    ? `${sentimentSvgPath} L ${sentimentPoints[sentimentPoints.length - 1].x} ${chartHeight - paddingY} L ${sentimentPoints[0].x} ${chartHeight - paddingY} Z`
    : '';

  const validStockPoints = stockPoints.filter((p): p is typeof p & { y: number } => p.y !== null && !isNaN(p.y));
  const stockSvgPath = validStockPoints.length > 1
    ? validStockPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden my-8">
        
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{targetStock.name}</h2>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stockCode}</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {targetStock.market || 'KOSPI'}
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {formatPrice(displayPrice)}
                </span>
                <span className={`text-base font-semibold ${getPriceColorClass(displayChangeRate)}`}>
                  {formatChangeAmount(displayChange)} ({formatChangeRate(displayChangeRate)})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWatchlist}
              className={`p-2.5 rounded-xl border transition-colors ${
                isWatched
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-500 dark:border-yellow-900/50 dark:bg-yellow-950/30'
                  : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400'
              }`}
            >
              <Star className={`w-5 h-5 ${isWatched ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-100px)] overflow-y-auto">
          {/* 거래 정보 요약 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">거래량</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{formatVolume(displayVolume)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">거래대금</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{formatTradingValue(displayTradingValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">감성 온도</p>
              <p className={`text-sm font-semibold mt-0.5 ${sentimentMeta?.textColor || ''}`}>{currentScore}점 ({sentimentMeta?.label || '보통'})</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">당일 분석 기사</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{latestSentiment?.totalArticles ?? currentNewsSource.length}건</p>
            </div>
          </div>

          {/* 7일 감성 & 주가 차트 */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">최근 7일 감성 지수 & 주가 추이</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3182F6]" />
                  AI 감성 점수
                </span>
                <span className="flex items-center gap-1.5 font-medium text-orange-500">
                  <span className="w-2.5 h-0.5 bg-[#F97316] border border-[#F97316]" />
                  주가(종가)
                </span>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto">
              {rawChartPoints.length === 0 ? (
                <div className="flex items-center justify-center h-44 text-sm text-gray-400">
                  표시할 최근 7일 데이터가 없습니다.
                </div>
              ) : (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3182F6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3182F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {[0, 50, 100].map(val => {
                    const y = chartHeight - paddingY - (val / 100) * innerHeight;
                    return (
                      <g key={`guide-${val}`}>
                        <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#E5E7EB" strokeDasharray="3 3" />
                        <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-gray-400 font-mono">
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
                  {sentimentSvgPath && (
                    <path d={sentimentSvgPath} fill="none" stroke="#3182F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}

                  {stockSvgPath && (
                    <path d={stockSvgPath} fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />
                  )}

                  {validStockPoints.map((p, idx) => (
                    <circle key={`stock-pt-${idx}`} cx={p.x} cy={p.y} r={3} className="fill-white stroke-[#F97316] stroke-2 pointer-events-none" />
                  ))}

                  {sentimentPoints.map((p, idx) => (
                    <circle
                      key={`sentiment-pt-${idx}`}
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPointIndex === idx ? 5 : 3.5}
                      className="fill-white stroke-[#3182F6] stroke-2 cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                  ))}

                  {sentimentPoints.map((p, idx) => (
                    <text key={`label-${idx}`} x={p.x} y={chartHeight - 8} textAnchor="middle" className="text-[10px] fill-gray-400 font-mono">
                      {p.date ? p.date.slice(5) : ''}
                    </text>
                  ))}
                </svg>
              )}

              {/* 툴팁 */}
              {hoveredPointIndex !== null && sentimentPoints[hoveredPointIndex] && (
                <div
                  className="absolute pointer-events-none bg-gray-900/90 text-white rounded-lg px-2.5 py-1.5 text-xs shadow-lg transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${(sentimentPoints[hoveredPointIndex].x / chartWidth) * 100}%`,
                    top: `${(sentimentPoints[hoveredPointIndex].y / chartHeight) * 100}%`
                  }}
                >
                  <p className="font-semibold text-gray-300">{sentimentPoints[hoveredPointIndex].date}</p>
                  <p className="text-blue-300">감성: {sentimentPoints[hoveredPointIndex].sentiment}점</p>
                  {sentimentPoints[hoveredPointIndex].stockPrice && (
                    <p className="text-orange-300">주가: {formatPrice(sentimentPoints[hoveredPointIndex].stockPrice!)}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 뉴스 피드 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">뉴스 및 감성 분석 피드</h3>
              </div>
              <div className="flex gap-1">
                {(['all', 'positive', 'neutral', 'negative'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setNewsFilter(filter)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                      newsFilter === filter
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {filter === 'all' && '전체'}
                    {filter === 'positive' && '긍정'}
                    {filter === 'neutral' && '중립'}
                    {filter === 'negative' && '부정'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredNews.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">조건에 해당하는 뉴스가 없습니다.</p>
              ) : (
                filteredNews.map((item: NewsItem) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 border border-gray-100 dark:border-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</h4>
                      <span className="text-[11px] text-gray-400 shrink-0">{item.publishedAt ? item.publishedAt.slice(0, 10) : ''}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{item.snippet || item.summary}</p>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};