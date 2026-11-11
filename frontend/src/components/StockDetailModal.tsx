import React, { useState, useEffect } from 'react';
import { X, BarChart3, Newspaper, ShieldAlert } from 'lucide-react';
import { Stock, DailyMetric, NewsItem, PanicDefenseInfo } from '../types/stock';
import {
  formatPrice,
  formatChangeRate,
  formatChangeAmount,
  formatVolume,
  formatTradingValue,
  getPriceColorClass,
  getSentimentMeta
} from '../utils/formatters';

const API_BASE = 'http://localhost:8080/api/stocks';

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const [newsFilter, setNewsFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // 백엔드 /api/stocks/{code}/detail 응답 상태
  const [detailData, setDetailData] = useState<Stock | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const targetStock = stock as any;
  const stockCode = String(
    targetStock?.stockCode ||
    targetStock?.code ||
    targetStock?.id ||
    targetStock?.itemCode ||
    ''
  ).trim();

  useEffect(() => {
    if (!stockCode) return;

    setIsLoading(true);
    fetch(`${API_BASE}/${stockCode}/detail`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Stock) => {
        setDetailData(data);
      })
      .catch((err) => {
        console.error('종목 상세 데이터 조회 실패:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [stockCode]);

  if (!stock) return null;

  // 1. 단일 DTO 기준 시세 및 감성 데이터 바인딩
  const quote = detailData?.quote;
  const displayPrice = Number(quote?.currentPrice ?? targetStock.currentPrice ?? targetStock.price ?? 0);
  const displayChange = Number(quote?.changePrice ?? targetStock.changeAmount ?? 0);
  const displayChangeRate = Number(quote?.changeRate ?? targetStock.changeRate ?? 0);
  const displayVolume = Number(quote?.volume ?? targetStock.tradingVolume ?? 0);
  const displayTradingValue = Number(quote?.tradingValue ?? targetStock.tradingValue ?? 0);

  const currentScore = detailData?.sentimentScore ?? targetStock.sentimentScore ?? 50;
  const sentimentMeta = getSentimentMeta(currentScore);

  // 2. 7일 메트릭 차트 데이터 바인딩
  const metrics: DailyMetric[] = detailData?.metrics7d ?? [];
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const validPrices = metrics
    .map((m) => m.stockPrice)
    .filter((p): p is number => p !== null && !isNaN(p) && p > 0);

  const minStockPrice = validPrices.length > 0 ? Math.min(...validPrices) * 0.98 : 50000;
  const maxStockPrice = validPrices.length > 0 ? Math.max(...validPrices) * 1.02 : 70000;
  const priceRange = maxStockPrice - minStockPrice === 0 ? 1 : maxStockPrice - minStockPrice;

  const sentimentPoints = metrics.map((m, idx) => {
    const x = metrics.length <= 1
      ? paddingX + innerWidth / 2
      : paddingX + (idx / (metrics.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - (m.sentimentScore / 100) * innerHeight;
    return { ...m, x, y };
  });

  const stockPoints = metrics.map((m, idx) => {
    const x = metrics.length <= 1
      ? paddingX + innerWidth / 2
      : paddingX + (idx / (metrics.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - ((m.stockPrice - minStockPrice) / priceRange) * innerHeight;
    return { ...m, x, y };
  });

  const sentimentSvgPath = sentimentPoints.length > 0
    ? sentimentPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaPath = sentimentPoints.length > 0
    ? `${sentimentSvgPath} L ${sentimentPoints[sentimentPoints.length - 1].x} ${chartHeight - paddingY} L ${sentimentPoints[0].x} ${chartHeight - paddingY} Z`
    : '';

  const stockSvgPath = stockPoints.length > 1
    ? stockPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  // 3. 뉴스 데이터 바인딩
  const newsList: NewsItem[] = detailData?.newsSummary3Lines ?? targetStock.newsSummary3Lines ?? [];
  const filteredNews = newsList.filter((item) => {
    if (newsFilter === 'all') return true;
    return item.sentiment === newsFilter;
  });

  // 4. 패닉 방어 가이드
  const panicDefense: PanicDefenseInfo | undefined = detailData?.panicDefense;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden my-8">
        
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {detailData?.name || targetStock.name}
                </h2>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stockCode}</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {detailData?.category || 'KOSPI 대형주'}
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
              <p className="text-xs text-gray-500 dark:text-gray-400">감성 상태</p>
              <p className={`text-sm font-semibold mt-0.5 ${sentimentMeta?.textColor || ''}`}>
                {currentScore}점 ({detailData?.sentimentStatus || sentimentMeta?.label || '보통'})
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">핵심 뉴스</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{newsList.length}건 요약</p>
            </div>
          </div>

          {/* 패닉 방어 가이드 배너 (백엔드 panicDefense 연동) */}
          {panicDefense && panicDefense.isActive && (
            <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                    {panicDefense.badgeText}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{panicDefense.headline}</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{panicDefense.recommendation}</p>
              </div>
            </div>
          )}

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
              {metrics.length === 0 ? (
                <div className="flex items-center justify-center h-44 text-sm text-gray-400">
                  {isLoading ? '최근 7일 지표 로딩 중...' : '표시할 7일 데이터가 없습니다.'}
                </div>
              ) : (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3182F6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3182F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {[0, 50, 100].map((val) => {
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

                  {stockPoints.map((p, idx) => (
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
                      {p.day || (p.fullDate ? p.fullDate.slice(5) : '')}
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
                  <p className="font-semibold text-gray-300">{sentimentPoints[hoveredPointIndex].fullDate}</p>
                  <p className="text-blue-300">감성: {sentimentPoints[hoveredPointIndex].sentimentScore}점</p>
                  <p className="text-orange-300">주가: {formatPrice(sentimentPoints[hoveredPointIndex].stockPrice)}</p>
                  <p className="text-gray-400 text-[10px]">KOSPI: {sentimentPoints[hoveredPointIndex].kospiIndex}</p>
                </div>
              )}
            </div>
          </div>

          {/* 3줄 요약 뉴스 피드 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI 3줄 핵심 뉴스 요약</h3>
              </div>
              <div className="flex gap-1">
                {(['all', 'positive', 'neutral', 'negative'] as const).map((filter) => (
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
                    {filter === 'positive' && '호재'}
                    {filter === 'neutral' && '이슈'}
                    {filter === 'negative' && '리스크'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredNews.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">조건에 해당하는 뉴스가 없습니다.</p>
              ) : (
                filteredNews.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.sentiment === 'positive'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                            : item.sentiment === 'negative'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {item.sentimentLabel}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</h4>
                      </div>
                      <span className="text-[11px] text-gray-400 shrink-0">{item.timeAgo} · {item.source}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5">{item.summary}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 최종 대응 가이드 & 멘탈 케어 팁 */}
          {detailData?.finalConclusion && (
            <div className="p-4 bg-gray-100/70 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                  {detailData.finalConclusion.badge}
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {detailData.finalConclusion.targetSupport}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {detailData.finalConclusion.guidance}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                💡 멘토 Tip: {detailData.finalConclusion.psychologicalTip}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};