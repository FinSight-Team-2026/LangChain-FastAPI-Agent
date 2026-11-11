import React, { useState } from 'react';
import { Sparkles, Newspaper, TrendingUp, TrendingDown, ArrowUpRight, Filter, ChevronRight, BarChart3, CheckCircle2 } from 'lucide-react';
import { Stock, SentimentType } from '../types/stock';
import { formatPrice, formatChangeRate, formatChangeAmount, getPriceColorClass, getSentimentMeta } from '../utils/formatters';

interface NewsLabSectionProps {
  stocks: Stock[];
  selectedStockId?: string;
  onOpenStockModal: (stock: Stock) => void;
}

export const NewsLabSection: React.FC<NewsLabSectionProps> = ({
  stocks,
  selectedStockId,
  onOpenStockModal,
}) => {
  const [currentId, setCurrentId] = useState<string>(selectedStockId || stocks[0]?.id || '005930');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentType>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const currentStock = stocks.find((s) => s.id === currentId) || stocks[0];
  if (!currentStock) return null;

  const sentimentMeta = getSentimentMeta(currentStock.sentimentScore);

  const filteredNews = currentStock.news.filter((item) => {
    if (sentimentFilter === 'all') return true;
    return item.sentiment === sentimentFilter;
  });

  // 7-day Chart calculations
  const history = currentStock.sentimentHistory;
  const chartWidth = 560;
  const chartHeight = 150;
  const paddingX = 40;
  const paddingY = 20;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;
  const minScore = 20;
  const maxScore = 100;

  const points = history.map((point, index) => {
    const x = paddingX + (index / (history.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - ((point.score - minScore) / (maxScore - minScore)) * innerHeight;
    return { x, y, ...point };
  });

  const svgPath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaPath = `${svgPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;
  const activeHoverPoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : points[points.length - 1];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">AI 실시간 뉴스 분석실</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              증권사 리포트와 주요 언론사 뉴스를 실시간 수집하고 자연어 감성 분석 모델로 긍정·부정 강도를 산출합니다.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold self-start sm:self-auto">
            총 {stocks.length}개 분석 대상 종목
          </span>
        </div>

        {/* Stock Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 pt-3">
          {stocks.map((stock) => {
            const isSelected = stock.id === currentStock.id;
            const meta = getSentimentMeta(stock.sentimentScore);

            return (
              <button
                key={stock.id}
                onClick={() => {
                  setCurrentId(stock.id);
                  setSentimentFilter('all');
                  setHoveredPointIndex(null);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <span>{stock.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold num-font ${
                    isSelected ? 'bg-white/20 text-white' : meta.textColor
                  }`}
                >
                  {stock.sentimentScore}점
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stock Sentiment Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Score Meter & Diagnostic */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{currentStock.name}</h3>
                <span className="text-xs text-slate-400 num-font">{currentStock.code} · {currentStock.market}</span>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-slate-900 num-font">
                  {formatPrice(currentStock.price)}
                </div>
                <div className={`text-xs font-semibold num-font ${getPriceColorClass(currentStock.changeRate)}`}>
                  {formatChangeRate(currentStock.changeRate)}
                </div>
              </div>
            </div>

            {/* Score Big Display */}
            <div className="my-6 text-center">
              <div className="inline-block p-4 rounded-2xl bg-slate-50 border border-slate-100 w-full">
                <span className="text-xs font-medium text-slate-400 block mb-1">AI 종합 뉴스 감성 지수</span>
                <div className={`text-5xl font-black num-font ${sentimentMeta.textColor}`}>
                  {currentStock.sentimentScore}
                  <span className="text-xl font-bold text-slate-400"> / 100</span>
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {sentimentMeta.label} 구간
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {sentimentMeta.sublabel}
                </div>
              </div>
            </div>

            {/* Sentiment Meter Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#F04452]">긍정 {currentStock.sentimentBreakdown.positive}%</span>
                <span className="text-slate-400">중립 {currentStock.sentimentBreakdown.neutral}%</span>
                <span className="text-[#3182F6]">부정 {currentStock.sentimentBreakdown.negative}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-[#F04452]"
                  style={{ width: `${currentStock.sentimentBreakdown.positive}%` }}
                />
                <div
                  className="bg-slate-300"
                  style={{ width: `${currentStock.sentimentBreakdown.neutral}%` }}
                />
                <div
                  className="bg-[#3182F6]"
                  style={{ width: `${currentStock.sentimentBreakdown.negative}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenStockModal(currentStock)}
            className="w-full mt-6 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{currentStock.name} 전체 차트 및 상세 분석 열기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right 2 cols: AI 3-Point Summary & 7-Day Trend Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI 3-line summary card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">오늘의 AI 뉴스 3줄 요약</h4>
            </div>
            <div className="space-y-2">
              {currentStock.sentimentSummary.map((summary, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{summary}</p>
                </div>
              ))}
            </div>

            {/* Keyword tags */}
            <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">주요 모멘텀 키워드:</span>
              {currentStock.keyDrivers.map((driver, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md"
                >
                  #{driver}
                </span>
              ))}
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-900">최근 7일간 감성 추이 곡선</h4>
              </div>
              <div className="text-xs font-semibold text-blue-600 num-font bg-blue-50 px-2.5 py-1 rounded-lg">
                {activeHoverPoint.date}: {activeHoverPoint.score}점 ({formatPrice(activeHoverPoint.price)})
              </div>
            </div>

            {/* SVG Chart */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[440px] h-[130px]">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
                  <defs>
                    <linearGradient id="newsLabGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3182F6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3182F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide lines */}
                  {[30, 60, 90].map((score) => {
                    const y = chartHeight - paddingY - ((score - minScore) / (maxScore - minScore)) * innerHeight;
                    return (
                      <line
                        key={score}
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#F1F5F9"
                        strokeWidth="1"
                      />
                    );
                  })}

                  <path d={areaPath} fill="url(#newsLabGrad)" />
                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#3182F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {points.map((p, idx) => (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPointIndex === idx ? 5 : 3.5}
                        className="fill-white stroke-blue-600"
                        strokeWidth="2"
                      />
                      <text
                        x={p.x}
                        y={chartHeight - 4}
                        fontSize="9"
                        fill="#94A3B8"
                        textAnchor="middle"
                        className="num-font"
                      >
                        {p.date}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related News List with Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {currentStock.name} 실시간 뉴스 분석 목록 ({filteredNews.length}건)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              각 기사별 긍정·부정 감성 점수와 AI가 평가한 핵심 이유를 제공합니다.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setSentimentFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sentimentFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 ({currentStock.news.length})
            </button>
            <button
              onClick={() => setSentimentFilter('positive')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                sentimentFilter === 'positive'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-red-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F04452]" />
              <span>긍정</span>
            </button>
            <button
              onClick={() => setSentimentFilter('neutral')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                sentimentFilter === 'neutral'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>중립</span>
            </button>
            <button
              onClick={() => setSentimentFilter('negative')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                sentimentFilter === 'negative'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#3182F6]" />
              <span>부정</span>
            </button>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-3">
          {filteredNews.map((news) => {
            const isPos = news.sentiment === 'positive';
            const isNeg = news.sentiment === 'negative';

            return (
              <div
                key={news.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/40 hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700">{news.source}</span>
                      <span>·</span>
                      <span>{news.publishedAt}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                      {news.title}
                    </h4>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold num-font shrink-0 ${
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

                <p className="text-xs text-slate-600 leading-relaxed">
                  {news.snippet}
                </p>

                {/* AI Reason & Keywords */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-semibold text-slate-800">판단 이유:</span>
                    <span className="text-slate-600 text-[11px]">{news.sentimentReason}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {news.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
