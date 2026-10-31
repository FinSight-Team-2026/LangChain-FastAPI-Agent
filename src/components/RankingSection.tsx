import React, { useState } from 'react';
import { Flame, Star, ChevronRight } from 'lucide-react';
import { Stock } from '../types/stock';
import { formatPrice, formatChangeRate, formatTradingValue, getPriceColorClass, getSentimentMeta } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

type RankingCriterion = 'value' | 'marketCap';

interface RankingSectionProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
}

export const RankingSection: React.FC<RankingSectionProps> = ({ stocks, onSelectStock }) => {
  const [criterion, setCriterion] = useState<RankingCriterion>('value');
  const { isInWatchlist, toggleWatchlist } = useAuth();
  const { showToast } = useToast();

  // Sort stocks based on active criterion (거래대금 또는 시가총액순)
  const sortedStocks = [...stocks].sort((a, b) => {
    switch (criterion) {
      case 'value':
        return b.tradingValue - a.tradingValue;
      case 'marketCap':
        return (b.marketCap || 0) - (a.marketCap || 0);
      default:
        return 0;
    }
  }).slice(0, 10);

  const handleToggleWatchlist = (e: React.MouseEvent, stock: Stock) => {
    e.stopPropagation();
    const added = toggleWatchlist(stock.id);
    if (added) {
      showToast(`${stock.name}이(가) 관심 종목에 추가되었습니다.`);
    } else {
      showToast(`${stock.name}이(가) 관심 종목에서 제외되었습니다.`, 'info');
    }
  };

  const getMetricDisplay = (stock: Stock) => {
    switch (criterion) {
      case 'value':
        return {
          label: '거래대금',
          value: formatTradingValue(stock.tradingValue),
        };
      case 'marketCap':
        return {
          label: '시가총액',
          value: stock.marketCap ? `${(stock.marketCap / 10000).toLocaleString()}조 원` : '정보 없음',
        };
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-100 text-[#F04452]">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">실시간 시장 TOP 10</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                실시간 집계
              </span>
            </div>
          </div>

          {/* Ranking Criteria Segmented Controls (거래대금, 시가총액 2개 버튼만 노출) */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCriterion('value')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                criterion === 'value'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              거래대금
            </button>
            <button
              onClick={() => setCriterion('marketCap')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                criterion === 'marketCap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              시가총액
            </button>
          </div>
        </div>
      </div>

      {/* Stocks Ranking List */}
      <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 no-scrollbar">
        {sortedStocks.map((stock, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          const metric = getMetricDisplay(stock);
          const isWatched = isInWatchlist(stock.id);
          const sentimentMeta = getSentimentMeta(stock.sentimentScore);

          return (
            <div
              key={stock.id}
              onClick={() => onSelectStock(stock)}
              className="group px-4 sm:px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors"
            >
              {/* Rank & Stock Info */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Rank Number */}
                <span
                  className={`w-6 text-center font-bold text-base num-font shrink-0 ${
                    isTop3 ? 'text-blue-600 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  {rank}
                </span>

                {/* Stock Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {stock.name}
                    </span>
                    <span className="text-[11px] text-slate-400 num-font shrink-0">
                      {stock.code}
                    </span>
                    <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                      {stock.market}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="truncate max-w-[140px] sm:max-w-none">{stock.sector}</span>
                  </div>
                </div>
              </div>

              {/* Numbers: Metric & Price & AI Sentiment */}
              <div className="flex items-center gap-3 sm:gap-6 shrink-0 text-right">
                {/* Active Metric */}
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 num-font">
                    {metric.value}
                  </div>
                  <div className="text-[11px] text-slate-400">{metric.label}</div>
                </div>

                {/* Price & Change */}
                <div className="min-w-[85px] sm:min-w-[100px]">
                  <div className="font-bold text-sm sm:text-base text-slate-900 num-font">
                    {formatPrice(stock.price)}
                  </div>
                  <div className={`text-xs font-semibold num-font ${getPriceColorClass(stock.changeRate)}`}>
                    {formatChangeRate(stock.changeRate)}
                  </div>
                </div>

                {/* AI Sentiment Preview Pill */}
                <div className="hidden lg:flex items-center gap-2 min-w-[120px] justify-end">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className={`text-xs font-bold ${sentimentMeta.textColor} num-font`}>
                        {stock.sentimentScore}점
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{sentimentMeta.label}</div>
                  </div>
                  {/* Micro Sentiment meter */}
                  <div className="w-8 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#F04452]"
                      style={{ width: `${stock.sentimentBreakdown.positive}%` }}
                    />
                    <div
                      className="bg-[#3182F6]"
                      style={{ width: `${stock.sentimentBreakdown.negative}%` }}
                    />
                  </div>
                </div>

                {/* Watchlist Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleWatchlist(e, stock)}
                  title={isWatched ? '관심종목에서 제거' : '관심종목에 추가'}
                  className={`p-2 rounded-xl transition-all ${
                    isWatched
                      ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                      : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isWatched ? 'fill-amber-400' : ''}`} />
                </button>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors hidden sm:block" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Hint */}
      <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-6">
        <span>* 종목을 클릭하면 상세한 AI 뉴스 분석 및 감성 추이 차트를 확인할 수 있습니다.</span>
        <span className="hidden sm:inline text-slate-400">데이터 주기: 1분 단위 실시간 반영</span>
      </div>
    </section>
  );
};