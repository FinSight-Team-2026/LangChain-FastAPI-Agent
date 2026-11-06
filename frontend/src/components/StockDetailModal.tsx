import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Sparkles, BarChart3, Newspaper, ExternalLink } from 'lucide-react';
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

interface StockPrediction {
  stock_code: string;
  as_of_date: string;
  prediction: 'UP' | 'DOWN' | 'NEUTRAL' | 'UNCERTAIN';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  risk_factors: string[];
}

const getLocalDateString = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

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

interface RealtimePriceData {
  closePrice: number;
  change: number;
  changeRate: number;
  volume: number;
  tradingValue: number;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const [newsFilter, setNewsFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // 백엔드 실데이터 상태
  const [realtimePrice, setRealtimePrice] = useState<RealtimePriceData | null>(null);
  const [latestSentiment, setLatestSentiment] = useState<LatestSentiment | null>(null);
  const [dailyHistory, setDailyHistory] = useState<DailySentimentItem[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const predictionAbortRef = useRef<AbortController | null>(null);

  const { isInWatchlist, toggleWatchlist } = useAuth();
  const { showToast } = useToast();

  useEffect(() => () => predictionAbortRef.current?.abort(), []);

  const targetStock = stock as any;
  const stockCode = targetStock?.code || targetStock?.id || '005930';

  useEffect(() => {
    predictionAbortRef.current?.abort();
    setPrediction(null);
    setPredictionError(null);
    setPredictionLoading(false);
    if (!stock) return;

    // 종목 변경 시 이전 종목 잔상 초기화
    setRealtimePrice(null);
    setLatestSentiment(null);
    setDailyHistory([]);
    setNewsList([]);
    setIsLoading(true);
    const API_BASE = 'http://localhost:8080/api/stocks';

    // 1. 실시간 시세 API & 2. 감성/뉴스 데이터 동시 호출
    const safeJson = async (res: Response, fallback: any = null) => {
      if (!res.ok || res.status === 204) return fallback;
      try {
        const text = await res.text();
        return text ? JSON.parse(text) : fallback;
      } catch {
        return fallback;
      }
    };

    Promise.all([
      fetch(`${API_BASE}/${stockCode}/price`).then(res => safeJson(res, null)),
      fetch(`${API_BASE}/${stockCode}/sentiment/latest`).then(res => safeJson(res, null)),
      fetch(`${API_BASE}/${stockCode}/sentiment/daily`).then(res => safeJson(res, [])),
      fetch(`${API_BASE}/${stockCode}/news/summaries?limit=20`).then(res => safeJson(res, []))
    ])
      .then(([priceData, latestData, dailyData, newsData]) => {
        // 실시간 시세 파싱
        if (priceData && priceData.closePrice) {
          const parsedPrice = parseInt(String(priceData.closePrice || '0').replace(/,/g, ''), 10) || 0;
          const parsedChange = parseInt(String(priceData.compareToPreviousClosePrice || priceData.changePrice || '0').replace(/,/g, ''), 10) || 0;
          const parsedChangeRate = parseFloat(priceData.fluctuationsRatio || '0') || 0;
          const rawVolume = priceData.totalVolume || priceData.accumulatedTradingVolume || priceData.volume || '0';
          const parsedVolume = parseInt(String(rawVolume).replace(/,/g, ''), 10) || 0;
          const rawTradingValue = priceData.totalTradeValue || priceData.accumulatedTradingValue || priceData.tradingValue || '0';
          const parsedTradingValue = parseInt(String(rawTradingValue).replace(/,/g, ''), 10) || 0;

          setRealtimePrice({
            closePrice: parsedPrice,
            change: parsedChange,
            changeRate: parsedChangeRate,
            volume: parsedVolume,
            tradingValue: parsedTradingValue
          });
        }

        if (latestData) {
          setLatestSentiment(latestData);
        }

        if (Array.isArray(dailyData) && dailyData.length > 0) {
          const sorted = [...dailyData].reverse();
          setDailyHistory(sorted);
        }

        if (Array.isArray(newsData)) {
          const mappedNews: NewsItem[] = newsData.map((item: any) => ({
            id: item.articleId,
            title: (item.title || '').replace(/<[^>]*>?/g, ''),
            snippet: (item.summary || item.title || '').replace(/<[^>]*>?/g, ''),
            summary: (item.summary || '').replace(/<[^>]*>?/g, ''),
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
        console.error('데이터 조회 실패:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [stock, stockCode]);

  // Prefer the most recent available backend analysis date over the calendar date.
  const predictionDate = latestSentiment?.targetDate || dailyHistory[dailyHistory.length - 1]?.targetDate || getLocalDateString();

  const requestPrediction = async () => {
    if (!stock || !predictionDate || predictionLoading) return;
    predictionAbortRef.current?.abort();
    const controller = new AbortController();
    predictionAbortRef.current = controller;
    setPredictionLoading(true);
    setPrediction(null);
    setPredictionError(null);

    try {
      const url = `http://localhost:8080/api/ai/prediction/${encodeURIComponent(String(stockCode))}?as_of_date=${encodeURIComponent(predictionDate)}`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`예측 API 응답 오류 (HTTP ${response.status})`);
      }
      const result: StockPrediction = await response.json();
      if (!result || !['UP', 'DOWN', 'NEUTRAL', 'UNCERTAIN'].includes(result.prediction)) {
        throw new Error('예측 API 응답 형식이 올바르지 않습니다.');
      }
      if (!controller.signal.aborted) setPrediction(result);
    } catch (error) {
      if (!controller.signal.aborted) {
        setPredictionError(error instanceof Error ? error.message : '예측 요청에 실패했습니다.');
      }
    } finally {
      if (!controller.signal.aborted) setPredictionLoading(false);
    }
  };

  if (!stock) return null;

  const isWatched = isInWatchlist(targetStock.id);

  // 실시간 시세 우선 적용, 없으면 기본 stock 데이터 사용
  const displayPrice = realtimePrice ? realtimePrice.closePrice : (targetStock.price || 0);
  const displayChange = realtimePrice ? realtimePrice.change : (targetStock.change || 0);
  const displayChangeRate = realtimePrice ? realtimePrice.changeRate : (targetStock.changeRate || 0);
  const displayVolume = realtimePrice ? realtimePrice.volume : (targetStock.volume || 0);

  // 분석 데이터 존재 여부 판단
  const hasAnalysisData = Boolean(latestSentiment || (newsList && newsList.length > 0));
  const currentSentimentScore = latestSentiment 
    ? Math.round(latestSentiment.avgScore * 100) 
    : (newsList && newsList.length > 0 ? (targetStock.sentimentScore ?? 50) : null);
  const sentimentMeta = currentSentimentScore !== null ? getSentimentMeta(currentSentimentScore) : { label: '분석 대기', emoji: '⏳' };

  const handleToggleWatchlist = () => {
    const added = toggleWatchlist(targetStock.id);
    if (added) {
      showToast(`${targetStock.name}이(가) 관심 종목에 추가되었습니다.`);
    } else {
      showToast(`${targetStock.name}이(가) 관심 종목에서 제외되었습니다.`, 'info');
    }
  };

  const activeNewsSource = newsList.length > 0 ? newsList : (targetStock.news || []);
  const posCount = activeNewsSource.filter((n: any) => n.sentiment === 'positive' || n.sentiment === '호재').length;
  const neuCount = activeNewsSource.filter((n: any) => n.sentiment === 'neutral' || n.sentiment === '중립').length;
  const negCount = activeNewsSource.filter((n: any) => n.sentiment === 'negative' || n.sentiment === '악재').length;

  const filteredNews = activeNewsSource.filter((item: any) => {
    if (newsFilter === 'all') return true;
    return item.sentiment === newsFilter;
  });

  // 차트 데이터
  const rawChartPoints = dailyHistory.length > 0
    ? dailyHistory.map(d => ({
        price: Math.round(d.avgScore * 100),
        date: d.targetDate
      }))
    : (targetStock.sentimentHistory && targetStock.sentimentHistory.length > 0
        ? targetStock.sentimentHistory.map((p: any) => ({ price: p.price, date: p.date }))
        : []);

  const hasValidChartData = rawChartPoints.length > 0 && rawChartPoints.some((p: any) => p.price != null && !isNaN(p.price));

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
                  {formatPrice(displayPrice)}
                </span>
                <div className={`flex items-baseline gap-1 text-sm font-bold ${getPriceColorClass(displayChangeRate)}`}>
                  <span>{formatChangeAmount(displayChange)}</span>
                  <span>({formatChangeRate(displayChangeRate)})</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 border border-slate-100 bg-slate-50/70 p-3 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">거래량</span>
                <span className="font-bold text-slate-800 num-font">{formatVolume(displayVolume)}</span>
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
                  <span className="text-2xl">{(sentimentMeta as any)?.emoji || '📊'}</span>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">{sentimentMeta.label}</div>
                  <div className="text-xl font-black text-slate-900 num-font">
                    {currentSentimentScore !== null ? `${currentSentimentScore}점` : '-'}
                  </div>
                </div>
              </div>

              {/* Counts */}
              <div className="md:col-span-3 grid grid-cols-3 gap-2">
                <div className="bg-white/80 p-2.5 rounded-xl border border-red-100 flex flex-col items-center">
                  <span className="text-[11px] text-[#F04452] font-semibold">호재(긍정)</span>
                  <span className="text-base font-extrabold text-slate-800 num-font">
                    {latestSentiment ? latestSentiment.positiveCount : (newsList.length > 0 ? posCount : 0)}건
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200 flex flex-col items-center">
                  <span className="text-[11px] text-slate-600 font-semibold">중립</span>
                  <span className="text-base font-extrabold text-slate-800 num-font">
                    {latestSentiment ? latestSentiment.neutralCount : (newsList.length > 0 ? neuCount : 0)}건
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 flex flex-col items-center">
                  <span className="text-[11px] text-[#3182F6] font-semibold">악재(부정)</span>
                  <span className="text-base font-extrabold text-slate-800 num-font">
                    {latestSentiment ? latestSentiment.negativeCount : (newsList.length > 0 ? negCount : 0)}건
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section className="p-5 rounded-2xl border border-slate-200/80 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">AI 주가 방향 예측</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={requestPrediction}
                  disabled={predictionLoading || !predictionDate}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {predictionLoading ? '분석 중...' : 'AI 예측 실행'}
                </button>
              </div>
            </div>

            {predictionError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {predictionError} · Spring Boot(8080) 연결 및 분석 기준일의 데이터 존재 여부를 확인해 주세요.
              </div>
            )}

            {predictionLoading && (
              <p role="status" className="text-xs text-slate-500">주가·뉴스 데이터를 분석하고 AI 결과를 기다리는 중입니다.</p>
            )}

            {prediction && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-500 mb-1">예측 방향</p>
                    <p className={`text-lg font-extrabold ${prediction.prediction === 'UP' ? 'text-red-600' : prediction.prediction === 'DOWN' ? 'text-blue-600' : 'text-slate-700'}`}>
                      {({ UP: '상승 예상', DOWN: '하락 예상', NEUTRAL: '중립', UNCERTAIN: '판단 유보' } as const)[prediction.prediction]}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-900">AI 예측 근거</p>
                  <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">{prediction.reason}</p>
                </div>
                {Array.isArray(prediction.risk_factors) && prediction.risk_factors.length > 0 && (
                  <div className="rounded-xl border border-slate-100 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-900">주요 위험 요인</p>
                    <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-slate-600">
                      {prediction.risk_factors.map((factor, index) => <li key={index}>{factor}</li>)}
                    </ul>
                  </div>
                )}
                <p className="text-[11px] text-slate-400">모델의 판단이며 실제 주가 방향이나 확률을 보장하지 않습니다.</p>
              </div>
            )}
            {!prediction && !predictionLoading && !predictionError && (
              <p className="text-sm text-slate-500">AI가 최근 주가 흐름과 뉴스 감성 분석 결과를 종합하여 주가 방향을 예측합니다.</p>
            )}
          </section>

          {/* Sentiment Trend Chart */}
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">감성 추이 차트 (최근 일별)</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {hasValidChartData && activeHoverPoint && activeHoverPoint.price != null ? `${activeHoverPoint.date}: ${activeHoverPoint.price}점` : ''}
              </span>
            </div>

            <div className="w-full flex justify-center items-center min-h-[180px] overflow-hidden">
              {!hasValidChartData ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <span className="text-2xl mb-1.5">📊</span>
                  <p className="text-xs font-medium">최근 일별 감성 데이터가 없습니다.</p>
                </div>
              ) : (
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

                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
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
              )}
            </div>
          </div>

          {/* News Feed Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">관련 뉴스 & AI 3줄 요약</h3>
              </div>

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