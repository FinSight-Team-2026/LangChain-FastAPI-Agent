import React, { useState } from 'react';
import { Sparkles, ArrowUpDown, ChevronRight, BarChart2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Stock } from '../types/stock';
import { formatPrice, formatChangeRate, getPriceColorClass, getSentimentMeta } from '../utils/formatters';

interface SentimentComparisonProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onBackToWatchlist?: () => void;
}

type SortBy = 'sentimentScore' | 'positiveRatio' | 'changeRate';

export const SentimentComparison: React.FC<SentimentComparisonProps> = ({
  stocks,
  onSelectStock,
  onBackToWatchlist,
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('sentimentScore');

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-500">관심 종목이 없습니다. 먼저 관심 종목을 추가해주세요.</p>
      </div>
    );
  }

  // Sort stocks according to selected criteria
  const sortedStocks = [...stocks].sort((a, b) => {
    if (sortBy === 'sentimentScore') {
      return b.sentimentScore - a.sentimentScore;
    }
    if (sortBy === 'positiveRatio') {
      return b.sentimentBreakdown.positive - a.sentimentBreakdown.positive;
    }
    if (sortBy === 'changeRate') {
      return b.changeRate - a.changeRate;
    }
    return 0;
  });

  // Calculate statistics
  const avgScore = Math.round(stocks.reduce((acc, s) => acc + s.sentimentScore, 0) / stocks.length);
  const bestStock = [...stocks].sort((a, b) => b.sentimentScore - a.sentimentScore)[0];
  const lowestStock = [...stocks].sort((a, b) => a.sentimentScore - b.sentimentScore)[0];

  return (
    <div className="space-y-6">
      {/* Top Comparison Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-blue-500/20 text-blue-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white">관심 종목 AI 감성 비교 분석</h2>
            </div>
            <p className="text-xs text-slate-300">
              보유 및 관심 종목의 뉴스 호재·악재 가중치를 종합하여 AI 감성 점수를 입체적으로 비교합니다.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div className="text-[11px] text-slate-400">평균 감성 점수</div>
              <div className="text-lg font-bold num-font text-white">{avgScore}점</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-[11px] text-slate-400">최고 호재 종목</div>
              <div className="text-xs font-bold text-red-400 truncate max-w-[80px] mx-auto mt-1">
                {bestStock?.name}
              </div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-[11px] text-slate-400">주의 필요 종목</div>
              <div className="text-xs font-bold text-blue-400 truncate max-w-[80px] mx-auto mt-1">
                {lowestStock?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table & Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Sorting Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">감성 점수 및 긍·부정 비율 비교 ({stocks.length}종목)</h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSortBy('sentimentScore')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sortBy === 'sentimentScore'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              감성 점수 높은순
            </button>
            <button
              onClick={() => setSortBy('positiveRatio')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sortBy === 'positiveRatio'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              긍정 뉴스 비율순
            </button>
            <button
              onClick={() => setSortBy('changeRate')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sortBy === 'changeRate'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              당일 주가 상승률순
            </button>
          </div>
        </div>

        {/* Comparative List */}
        <div className="divide-y divide-slate-100">
          {sortedStocks.map((stock, index) => {
            const sentimentMeta = getSentimentMeta(stock.sentimentScore);

            return (
              <div
                key={stock.id}
                onClick={() => onSelectStock(stock)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Rank & Stock info */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span className="w-5 text-center text-xs font-bold text-slate-400 num-font">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {stock.name}
                      </span>
                      <span className="text-xs text-slate-400 num-font">{stock.code}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-800 font-semibold num-font">
                        {formatPrice(stock.price)}
                      </span>
                      <span className={`text-xs font-bold num-font ${getPriceColorClass(stock.changeRate)}`}>
                        {formatChangeRate(stock.changeRate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Visual Score Bar & Distribution */}
                <div className="flex-1 max-w-xl">
                  {/* Score bar */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">감성 점수</span>
                      <span className={`font-bold num-font ${sentimentMeta.textColor}`}>
                        {stock.sentimentScore}점 ({sentimentMeta.label})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      긍정 <span className="text-[#F04452] font-semibold">{stock.sentimentBreakdown.positive}%</span> · 부정 <span className="text-[#3182F6] font-semibold">{stock.sentimentBreakdown.negative}%</span>
                    </div>
                  </div>

                  {/* Multi-segmented stacked bar */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="bg-[#F04452] transition-all"
                      style={{ width: `${stock.sentimentBreakdown.positive}%` }}
                    />
                    <div
                      className="bg-slate-300 transition-all"
                      style={{ width: `${stock.sentimentBreakdown.neutral}%` }}
                    />
                    <div
                      className="bg-[#3182F6] transition-all"
                      style={{ width: `${stock.sentimentBreakdown.negative}%` }}
                    />
                  </div>

                  {/* Top Sentiment Driver Tag */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-400">주요 모멘텀:</span>
                    <span className="text-[11px] text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-xs">
                      {stock.sentimentSummary[0]}
                    </span>
                  </div>
                </div>

                {/* Right: Action */}
                <div className="flex items-center gap-2 justify-end shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-blue-600 group-hover:underline flex items-center gap-0.5">
                      <span>뉴스 분석</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[10px] text-slate-400">{stock.news.length}개 기사 분석됨</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Comparative Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>AI 추천 관전 포인트</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            관심 종목군 전반에서 반도체 및 AI 하드웨어 관련 종목({bestStock?.name})의 뉴스 감성 지수가 압도적으로 우세합니다. 차세대 공급 계약 및 해외 진출 소식이 주가 탄력성을 지지하고 있습니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>리스크 및 모니터링 알림</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            2차전지 및 소재 관련 종목은 업황 불확실성과 전방 고객사 재고 조정 뉴스로 인해 부정적 어조 비중이 다소 높은 상태입니다. 단기 반등 시 거래량 수반 여부를 주의 깊게 관찰해야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
