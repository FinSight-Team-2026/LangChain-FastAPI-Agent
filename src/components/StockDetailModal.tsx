import React, { useState } from 'react';
import { X, Star, Sparkles, BarChart3, Newspaper, CheckCircle2 } from 'lucide-react';
import { Stock } from '../types/stock';
import { formatPrice, formatChangeRate, formatChangeAmount, formatVolume, formatTradingValue, getPriceColorClass, getSentimentMeta } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const [newsFilter, setNewsFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [chartPeriod, setChartPeriod] = useState<'1일' | '1주' | '1개월' | '3개월' | '1년'>('1일');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const { isInWatchlist, toggleWatchlist } = useAuth();
  const { showToast } = useToast();

  if (!stock) return null;

  // 타입 충돌 방지를 위한 any 캐스팅
  const targetStock = stock as any;

  const isWatched = isInWatchlist(targetStock.id);
  const sentimentMeta = getSentimentMeta(targetStock.sentimentScore);

  const handleToggleWatchlist = () => {
    const added = toggleWatchlist(targetStock.id);
    if (added) {
      showToast(`${targetStock.name}이(가) 관심 종목에 추가되었습니다.`);
    } else {
      showToast(`${targetStock.name}이(가) 관심 종목에서 제외되었습니다.`, 'info');
    }
  };

  // Filter news
  const filteredNews = (targetStock.news || []).filter((item: any) => {
    if (newsFilter === 'all') return true;
    return item.sentiment === newsFilter;
  });

  // Calculate SVG points for price trend chart
  const history = targetStock.sentimentHistory || [];
  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const prices = history.map((p: any) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.99 : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.01 : 100;

  const points = history.map((point: any, index: number) => {
    const x = paddingX + (index / (history.length - 1 || 1)) * innerWidth;
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
              {targetStock.market}
            </span>
            <span className="text-xs text-slate-500 font-medium">{targetStock.sector}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWatchlist}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isWatched
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span>{isWatched ? '관심종목 등록됨' : '관심종목 추가'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Stock Price Banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{targetStock.name}</h1>
                <span className="text-sm font-semibold text-slate-400 num-font">{targetStock.code}</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 num-font">
                  {formatPrice(targetStock.price)}
                </span>
                <span className={`text-base font-bold num-font ${getPriceColorClass(targetStock.changeRate)}`}>
                  {formatChangeAmount(targetStock.change || 0)} ({formatChangeRate(targetStock.changeRate)})
                </span>
              </div>
            </div>

            {/* Trading Volume & Value Badges */}
            <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 shrink-0">
              <div>
                <span className="text-slate-400 block text-[10px]">오늘 거래량</span>
                <span className="font-bold text-slate-800 num-font">{formatVolume(targetStock.volume)}</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px]">오늘 거래대금</span>
                <span className="font-bold text-slate-800 num-font">{formatTradingValue(targetStock.tradingValue)}</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px]">5일 대비 증가율</span>
                <span className="font-bold text-[#F04452] num-font">+{targetStock.volumeSurgeRate}%</span>
              </div>
            </div>
          </div>

          {/* 1. 주가 추이 차트 섹션 (네이버 증권 스타일 기간 탭 적용) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">주가 추이 그래프</h3>
                  <p className="text-[11px] text-slate-400">실시간 가격 변동 흐름을 확인하세요</p>
                </div>
              </div>

              {/* Period Selector Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['1일', '1주', '1개월', '3개월', '1년'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      chartPeriod === period
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Hover Active Price Tag */}
            {activeHoverPoint && (
              <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl mb-3 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">{activeHoverPoint.date} 기준</span>
                <span className="text-xs font-bold text-blue-600 num-font">
                  주가: {formatPrice(activeHoverPoint.price)}원
                </span>
              </div>
            )}

            {/* Responsive SVG Chart */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[500px] h-[170px] relative">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="naverStyleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3182F6" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#3182F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {[0.25, 0.5, 0.75].map((ratio, idx) => {
                    const y = paddingY + innerHeight * ratio;
                    return (
                      <line
                        key={idx}
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#F1F5F9"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    );
                  })}

                  <path d={areaPath} fill="url(#naverStyleGradient)" />
                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#3182F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {points.map((p: any, index: number) => {
                    const isHovered = hoveredPointIndex === index;
                    return (
                      <g key={index} className="cursor-pointer" onMouseEnter={() => setHoveredPointIndex(index)}>
                        {isHovered && (
                          <line
                            x1={p.x}
                            y1={paddingY}
                            x2={p.x}
                            y2={chartHeight - paddingY}
                            stroke="#3182F6"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        )}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 6 : 4}
                          className="fill-white stroke-blue-600 transition-all"
                          strokeWidth={isHovered ? 3 : 2}
                        />
                        <text
                          x={p.x}
                          y={chartHeight - 8}
                          fontSize="10"
                          fill="#94A3B8"
                          textAnchor="middle"
                          className="num-font font-medium"
                        >
                          {p.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* 2. AI 실시간 감성 진단 & 핵심 포인트 요약 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border ${sentimentMeta.borderColor} ${sentimentMeta.bgColor} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI 실시간 감성 진단</span>
                  </div>
                  <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full text-slate-500 font-medium">
                    뉴스 딥러닝 분석
                  </span>
                </div>

                <div className="mt-4 text-center">
                  <div className={`text-4xl font-black num-font ${sentimentMeta.textColor}`}>
                    {targetStock.sentimentScore}
                    <span className="text-lg font-bold text-slate-500"> / 100</span>
                  </div>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {sentimentMeta.label} <span className="text-xs font-normal text-slate-500">상태</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {sentimentMeta.sublabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5">
                <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                  <span className="text-[#F04452]">긍정 {targetStock.sentimentBreakdown.positive}%</span>
                  <span className="text-slate-500">중립 {targetStock.sentimentBreakdown.neutral}%</span>
                  <span className="text-[#3182F6]">부정 {targetStock.sentimentBreakdown.negative}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden flex">
                  <div className="bg-[#F04452]" style={{ width: `${targetStock.sentimentBreakdown.positive}%` }} />
                  <div className="bg-slate-400" style={{ width: `${targetStock.sentimentBreakdown.neutral}%` }} />
                  <div className="bg-[#3182F6]" style={{ width: `${targetStock.sentimentBreakdown.negative}%` }} />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>AI가 짚어본 오늘의 주요 포인트</span>
                  </div>
                  <span className="text-[10px] text-slate-400">자연어 요약 엔진</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-700">
                  {(targetStock.sentimentSummary || []).map((summary: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{summary}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">연관 키워드:</span>
                {(targetStock.keyDrivers || []).map((driver: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs bg-white text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-100"
                  >
                    #{driver}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Related News List with Horizontal Scroll */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {targetStock.name} 관련 실시간 뉴스 AI 분석 ({filteredNews.length}건)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  주요 경제지의 기사 본문을 분석하여 호재(긍정) 및 악재(부정) 요인을 판별했습니다. (좌우로 스크롤하여 확인)
                </p>
              </div>

              {/* News Filter Segment */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setNewsFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                    newsFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  전체 ({targetStock.news.length})
                </button>
                <button
                  onClick={() => setNewsFilter('positive')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                    newsFilter === 'positive'
                      ? 'bg-white text-red-600 shadow-xs'
                      : 'text-slate-600 hover:text-red-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#F04452]" />
                  <span>긍정</span>
                </button>
                <button
                  onClick={() => setNewsFilter('neutral')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                    newsFilter === 'neutral'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>중립</span>
                </button>
                <button
                  onClick={() => setNewsFilter('negative')}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                    newsFilter === 'negative'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#3182F6]" />
                  <span>부정</span>
                </button>
              </div>
            </div>

            {/* News Articles Horizontal Scroll Container */}
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {filteredNews.map((news: any) => {
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

                        {/* Sentiment Badge */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold num-font ${
                            isPos
                              ? 'bg-red-50 text-[#F04452] border border-red-100'
                              : isNeg
                              ? 'bg-blue-50 text-[#3182F6] border border-blue-100'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isPos ? '긍정' : isNeg ? '부정' : '중립'} {news.sentimentScore}점
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                        {news.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {news.snippet}
                      </p>
                    </div>

                    {/* AI Reasoning Callout */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-start gap-1.5 text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                      <Sparkles className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">AI 감성 근거: </span>
                        <span className="line-clamp-1">{news.sentimentReason}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            실시간 뉴스 감성 분석은 독자적인 금융 특화 자연어 처리 모델을 사용합니다.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};