import React from 'react';
import { StockQuote } from '../types/stock';
import { TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';

interface CoreQuoteCardProps {
  quote: StockQuote;
}

export const CoreQuoteCard: React.FC<CoreQuoteCardProps> = ({ quote }) => {
  const isUp = quote.changeRate >= 0;

  // 52W range progress calculation (0 to 100%)
  const range52w = quote.high52w - quote.low52w;
  const current52wPos = range52w > 0 ? ((quote.currentPrice - quote.low52w) / range52w) * 100 : 50;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Top Header: Stock Code & Market Status */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/80">
              {quote.code}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {quote.englishName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>실시간 정규장</span>
          </div>
        </div>

        {/* Current Price & Rate Change */}
        <div className="py-4 border-b border-slate-100">
          <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
            <span>현재가 (KRW)</span>
            <span className="text-[11px] text-slate-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              15:30 장마감 기준
            </span>
          </div>

          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {quote.currentPrice.toLocaleString()}
              <span className="text-lg font-bold text-slate-700 ml-1">원</span>
            </span>

            <div
              className={`flex items-center text-sm sm:text-base font-extrabold tabular-nums px-2.5 py-1 rounded-lg ${
                isUp
                  ? 'text-rose-600 bg-rose-50 border border-rose-100'
                  : 'text-blue-600 bg-blue-50 border border-blue-100'
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-4 h-4 mr-1 inline stroke-[2.5]" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1 inline stroke-[2.5]" />
              )}
              <span>
                {isUp ? '+' : ''}
                {quote.changePrice.toLocaleString()}원 ({isUp ? '+' : ''}
                {quote.changeRate.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* 52-Week High & Low Range Bar */}
        <div className="py-3.5 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>
              52주 최저 <strong className="text-slate-800 font-bold tabular-nums">{quote.low52w.toLocaleString()}원</strong>
            </span>
            <span className="font-semibold text-blue-600">
              52주 위치 {current52wPos.toFixed(1)}%
            </span>
            <span>
              52주 최고 <strong className="text-slate-800 font-bold tabular-nums">{quote.high52w.toLocaleString()}원</strong>
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(current52wPos, 4), 100)}%` }}
            />
          </div>
        </div>

        {/* Core Price Metrics Grid (시가, 고가, 저가) */}
        <div className="grid grid-cols-3 gap-2.5 py-3">
          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block">시가</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 tabular-nums">
              {quote.openPrice.toLocaleString()}원
            </span>
          </div>

          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-rose-500 font-medium block">고가</span>
            <span className="text-xs sm:text-sm font-bold text-rose-600 tabular-nums">
              {quote.highPrice.toLocaleString()}원
            </span>
          </div>

          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] text-blue-500 font-medium block">저가</span>
            <span className="text-xs sm:text-sm font-bold text-blue-600 tabular-nums">
              {quote.lowPrice.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* Volume & Previous Close Footer Strip */}
      <div className="pt-3 border-t border-slate-100 mt-1 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[11px] text-slate-500 block">거래량 (누적)</span>
          <span className="font-extrabold text-slate-900 tabular-nums">
            {quote.volume.toLocaleString()}주
          </span>
          <span className="text-[10px] text-slate-500 block tabular-nums">
            거래대금 약 {quote.tradingValue.toLocaleString()}억
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-500 block">전일 종가</span>
          <span className="font-extrabold text-slate-800 tabular-nums">
            {quote.prevClosePrice.toLocaleString()}원
          </span>
          <span className="text-[10px] text-slate-500 block">
            시총 {(quote.marketCap / 10000).toFixed(1)}조 원
          </span>
        </div>
      </div>
    </div>
  );
};
