import React from 'react';
import { StockQuote } from '../types/stock';
import { TrendingUp, TrendingDown, DollarSign, Layers, BarChart2, ShieldAlert } from 'lucide-react';

interface StockQuoteCardProps {
  quote: StockQuote;
}

export const StockQuoteCard: React.FC<StockQuoteCardProps> = ({ quote }) => {
  const isUp = quote.changeRate >= 0;

  // 52W range progress calculation (0 to 100%)
  const range52w = quote.high52w - quote.low52w;
  const current52wPos = range52w > 0 ? ((quote.currentPrice - quote.low52w) / range52w) * 100 : 50;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      
      {/* Title & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>시세 정보</span>
          </h3>
          <span className="text-xs font-semibold text-slate-600">
            {quote.name} ({quote.code})
          </span>
        </div>
        <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          정규장 실시간
        </span>
      </div>

      {/* Primary Price Summary Row */}
      <div className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-slate-100">
        <div>
          <div className="text-xs text-slate-600 mb-0.5 font-medium">현재가 (KRW)</div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {quote.currentPrice.toLocaleString()}원
            </span>
            <div
              className={`flex items-center text-sm sm:text-base font-bold tabular-nums ${
                isUp ? 'text-rose-600' : 'text-blue-600'
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-4 h-4 mr-1 inline" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1 inline" />
              )}
              <span>
                {isUp ? '+' : ''}
                {quote.changePrice.toLocaleString()}원 ({isUp ? '+' : ''}
                {quote.changeRate.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 sm:text-right">
          <div>전일 종가: <span className="font-semibold text-slate-800 tabular-nums">{quote.prevClosePrice.toLocaleString()}원</span></div>
          <div className="mt-0.5">외국인 소진율: <span className="font-semibold text-slate-800 tabular-nums">{quote.foreignOwnership}%</span></div>
        </div>
      </div>

      {/* 52-Week High/Low Interactive Visual Gauge */}
      <div className="py-3 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
          <span>52주 최저 <strong className="text-slate-800 tabular-nums">{quote.low52w.toLocaleString()}원</strong></span>
          <span className="font-semibold text-blue-700">52주 가격 위치 ({current52wPos.toFixed(1)}%)</span>
          <span>52주 최고 <strong className="text-slate-800 tabular-nums">{quote.high52w.toLocaleString()}원</strong></span>
        </div>
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-rose-400 rounded-full"
            style={{ width: `${Math.min(Math.max(current52wPos, 5), 100)}%` }}
          />
        </div>
      </div>

      {/* Detailed Quote Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <div className="text-[11px] text-slate-600">시가 / 종가</div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 tabular-nums">
            {quote.openPrice.toLocaleString()}원
          </div>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <div className="text-[11px] text-slate-600">당일 고가 / 저가</div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 tabular-nums">
            <span className="text-rose-600">{quote.highPrice.toLocaleString()}</span> /{' '}
            <span className="text-blue-600">{quote.lowPrice.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <div className="text-[11px] text-slate-600">거래량 / 거래대금</div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 tabular-nums">
            {quote.volume.toLocaleString()}주
          </div>
          <div className="text-[10px] text-slate-600 tabular-nums">
            약 {quote.tradingValue.toLocaleString()}억 원
          </div>
        </div>

        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          <div className="text-[11px] text-slate-600">시가총액 / PER·PBR</div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 tabular-nums">
            {(quote.marketCap / 10000).toFixed(1)}조 원
          </div>
          <div className="text-[10px] text-slate-600 tabular-nums">
            PER {quote.per}배 · PBR {quote.pbr}배
          </div>
        </div>
      </div>
    </div>
  );
};
