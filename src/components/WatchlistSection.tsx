import React from 'react';
import { Star, Plus, Sparkles, TrendingUp, TrendingDown, ArrowRight, Trash2, Newspaper } from 'lucide-react';
import { Stock } from '../types/stock';
import { formatPrice, formatChangeRate, getPriceColorClass, getSentimentMeta } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface WatchlistSectionProps {
  allStocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onOpenSearch: () => void;
  onViewComparison: () => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  allStocks,
  onSelectStock,
  onOpenSearch,
  onViewComparison,
}) => {
  const { watchlist, removeFromWatchlist, addToWatchlist } = useAuth();
  const { showToast } = useToast();

  const watchedStocks = allStocks.filter((s) => watchlist.includes(s.id));

  const handleRemove = (e: React.MouseEvent, stock: Stock) => {
    e.stopPropagation();
    removeFromWatchlist(stock.id);
    showToast(`${stock.name}이(가) 관심 종목에서 삭제되었습니다.`, 'info');
  };

  const handleQuickAdd = (stock: Stock) => {
    addToWatchlist(stock.id);
    showToast(`${stock.name}이(가) 관심 종목에 추가되었습니다.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">내 관심 종목</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold num-font">
              {watchedStocks.length}개 종목
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            관심 등록한 종목들의 실시간 호재·악재 뉴스와 AI 감성 점수를 한눈에 확인하세요.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {watchedStocks.length > 1 && (
            <button
              onClick={onViewComparison}
              className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>종목 간 감성 비교 차트</span>
            </button>
          )}
          <button
            onClick={onOpenSearch}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>종목 추가</span>
          </button>
        </div>
      </div>

      {/* If Empty */}
      {watchedStocks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">등록된 관심 종목이 없습니다</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            자주 확인하는 주식을 관심 종목으로 등록하고 AI가 매일 요약하는 뉴스 감성 분석을 받아보세요.
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
            {allStocks.slice(0, 4).map((s) => (
              <button
                key={s.id}
                onClick={() => handleQuickAdd(s)}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3 h-3 text-slate-400" />
                <span>{s.name} 추가</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Grid of Watchlist Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {watchedStocks.map((stock) => {
            const sentimentMeta = getSentimentMeta(stock.sentimentScore);

            return (
              <div
                key={stock.id}
                onClick={() => onSelectStock(stock)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Stock title & delete */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                          {stock.name}
                        </span>
                        <span className="text-xs text-slate-400 num-font">{stock.code}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                          {stock.market}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{stock.sector}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, stock)}
                        title="관심 종목에서 삭제"
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price & Sentiment Score Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-slate-900 num-font">
                        {formatPrice(stock.price)}
                      </div>
                      <div className={`text-xs font-semibold num-font ${getPriceColorClass(stock.changeRate)}`}>
                        {formatChangeRate(stock.changeRate)}
                      </div>
                    </div>

                    {/* AI Sentiment Gauge Pill */}
                    <div className={`px-3 py-2 rounded-xl ${sentimentMeta.bgColor} border ${sentimentMeta.borderColor} text-right`}>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs text-slate-500 font-medium">AI 감성점수</span>
                        <span className={`text-sm font-extrabold num-font ${sentimentMeta.textColor}`}>
                          {stock.sentimentScore}점
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700">
                        {sentimentMeta.label} <span className="font-normal text-slate-500">({stock.sentimentBreakdown.positive}% 긍정)</span>
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Ratio Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-medium">
                      <span className="text-[#F04452]">긍정 {stock.sentimentBreakdown.positive}%</span>
                      <span className="text-slate-400">중립 {stock.sentimentBreakdown.neutral}%</span>
                      <span className="text-[#3182F6]">부정 {stock.sentimentBreakdown.negative}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-[#F04452] transition-all"
                        style={{ width: `${stock.sentimentBreakdown.positive}%` }}
                        title={`긍정 ${stock.sentimentBreakdown.positive}%`}
                      />
                      <div
                        className="bg-slate-300 transition-all"
                        style={{ width: `${stock.sentimentBreakdown.neutral}%` }}
                        title={`중립 ${stock.sentimentBreakdown.neutral}%`}
                      />
                      <div
                        className="bg-[#3182F6] transition-all"
                        style={{ width: `${stock.sentimentBreakdown.negative}%` }}
                        title={`부정 ${stock.sentimentBreakdown.negative}%`}
                      />
                    </div>
                  </div>

                  {/* Latest News Article & Summary */}
                  {stock.news.length > 0 && (
                    <div className="mt-3.5 bg-slate-50/90 rounded-xl p-3.5 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Newspaper className="w-3.5 h-3.5 text-blue-600" />
                          <span>최신 기사 요약</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-600">{stock.news[0].source}</span>
                          <span>·</span>
                          <span>{stock.news[0].publishedAt}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-bold num-font ${
                              stock.news[0].sentiment === 'positive'
                                ? 'bg-red-50 text-[#F04452]'
                                : stock.news[0].sentiment === 'negative'
                                ? 'bg-blue-50 text-[#3182F6]'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {stock.news[0].sentiment === 'positive' ? '호재' : stock.news[0].sentiment === 'negative' ? '악재' : '중립'} {stock.news[0].sentimentScore}점
                          </span>
                        </div>
                      </div>

                      {/* Article Title */}
                      <div className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {stock.news[0].title}
                      </div>

                      {/* Article Summary Snippet */}
                      <p className="text-xs text-slate-600 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-slate-100">
                        {stock.news[0].snippet}
                      </p>

                      {/* AI Sentiment Reason */}
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700">AI 요약 분석: </span>
                          <span>{stock.news[0].sentimentReason}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Comprehensive Bullet Summary */}
                  <div className="mt-2.5 px-3 py-2 bg-blue-50/50 rounded-xl border border-blue-100/60">
                    <div className="text-[11px] font-bold text-blue-900 mb-1 flex items-center gap-1">
                      <span>핵심 모멘텀</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {stock.sentimentSummary.slice(0, 2).map((summary, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold shrink-0">·</span>
                          <span className="line-clamp-1">{summary}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:text-blue-700">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {stock.keyDrivers.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span>AI 상세 분석 보기</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
