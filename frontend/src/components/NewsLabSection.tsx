import React, { useMemo, useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Stock } from '../types/stock';
import { formatPrice, formatChangeRate, getPriceColorClass, getSentimentMeta } from '../utils/formatters';

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
  const [currentId, setCurrentId] = useState<string>(selectedStockId || stocks[0]?.id || '');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  const currentStock = useMemo(
    () => stocks.find((stock) => stock.id === currentId) || stocks[0],
    [currentId, stocks]
  );

  if (!currentStock) return null;

  const quote = currentStock.quote ?? { currentPrice: 0, changeRate: 0 };
  const sentimentMeta = getSentimentMeta(currentStock.sentimentScore);
  const filteredNews = (currentStock.newsSummary3Lines ?? []).filter((item) => {
    if (sentimentFilter === 'all') return true;
    return item.sentiment === sentimentFilter;
  });

  const history = currentStock.metrics7d ?? [];
  const points = history.map((point, index) => {
    const x = history.length <= 1 ? 40 : 40 + (index / (history.length - 1)) * 480;
    const y = 130 - (point.sentimentScore / 100) * 110;
    return { x, y, ...point };
  });

  const svgPath = points.reduce((acc, point, index) => {
    return `${acc} ${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="space-y-6">
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
              주요 종목의 뉴스 감성을 종합적으로 확인하고 투자 판단을 보조합니다.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold self-start sm:self-auto">
            총 {stocks.length}개 분석 대상 종목
          </span>
        </div>

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
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <span>{stock.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{currentStock.name}</h3>
                <span className="text-xs text-slate-400">{currentStock.code}</span>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-slate-900">{formatPrice(Number(quote.currentPrice ?? 0))}</div>
                <div className={`text-xs font-semibold ${getPriceColorClass(Number(quote.changeRate ?? 0))}`}>
                  {formatChangeRate(Number(quote.changeRate ?? 0))}
                </div>
              </div>
            </div>

            <div className="my-6 text-center">
              <div className="inline-block p-4 rounded-2xl bg-slate-50 border border-slate-100 w-full">
                <span className="text-xs font-medium text-slate-400 block mb-1">AI 종합 뉴스 감성 지수</span>
                <div className={`text-5xl font-black ${sentimentMeta.textColor}`}>
                  {currentStock.sentimentScore}
                  <span className="text-xl font-bold text-slate-400"> / 100</span>
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">{sentimentMeta.label} 구간</div>
                <div className="text-xs text-slate-500 mt-0.5">{sentimentMeta.sublabel}</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-[#F04452]">긍정 {currentStock.sentimentBreakdown.positive}%</span>
                <span className="text-slate-400">중립 {currentStock.sentimentBreakdown.neutral}%</span>
                <span className="text-[#3182F6]">부정 {currentStock.sentimentBreakdown.negative}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-[#F04452]" style={{ width: `${currentStock.sentimentBreakdown.positive}%` }} />
                <div className="bg-slate-300" style={{ width: `${currentStock.sentimentBreakdown.neutral}%` }} />
                <div className="bg-[#3182F6]" style={{ width: `${currentStock.sentimentBreakdown.negative}%` }} />
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

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">7일 감성 추이</h3>
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                {(['all', 'positive', 'neutral', 'negative'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSentimentFilter(filter)}
                    className={`px-2 py-1 rounded-full border ${
                      sentimentFilter === filter
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {filter === 'all' ? '전체' : filter === 'positive' ? '호재' : filter === 'neutral' ? '중립' : '리스크'}
                  </button>
                ))}
              </div>
            </div>

            <svg viewBox="0 0 560 150" className="w-full h-36">
              <path d={svgPath} fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">핵심 뉴스 요약</h3>
              <span className="text-xs text-slate-500">{filteredNews.length}건</span>
            </div>

            <div className="space-y-3">
              {filteredNews.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <span className="text-[10px] rounded-full bg-white px-2 py-0.5 border border-slate-200 text-slate-600">
                      {item.sentimentLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
