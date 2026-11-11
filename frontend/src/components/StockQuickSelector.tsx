import React from 'react';
import { STOCKS_DATA } from '../data/stocks';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockQuickSelectorProps {
  selectedStockId: string;
  onSelectStock: (stockId: string) => void;
}

export const StockQuickSelector: React.FC<StockQuickSelectorProps> = ({
  selectedStockId,
  onSelectStock,
}) => {
  const stockList = Object.values(STOCKS_DATA);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <span>주요 분석 종목 퀵 셀렉터</span>
<<<<<<< HEAD
          <span className="text-slate-600 font-normal">· 5대 핵심주</span>
        </h2>
=======
        </h2>
        <span className="text-[11px] text-slate-600 hidden sm:inline">
          종목을 선택하면 7일 감성 지수와 패닉 디펜스 지표가 자동 갱신됩니다
        </span>
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        {stockList.map((stock) => {
          const isSelected = selectedStockId === stock.id;
          const isUp = stock.quote.changeRate >= 0;

          return (
            <button
              key={stock.id}
              onClick={() => onSelectStock(stock.id)}
              className={`flex-1 min-w-[130px] sm:min-w-[155px] p-2.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-blue-900' : 'text-slate-800'
                  }`}
                >
                  {stock.name}
                </span>
                <span className="text-[10px] text-slate-600 tabular-nums">
                  {stock.code}
                </span>
              </div>

              <div className="mt-1 flex items-baseline justify-between gap-1">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums">
                  {stock.quote.currentPrice.toLocaleString()}원
                </span>

                <span
                  className={`flex items-center text-[11px] sm:text-xs font-semibold tabular-nums ${
                    isUp ? 'text-rose-600' : 'text-blue-600'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                  )}
                  {isUp ? '+' : ''}
                  {stock.quote.changeRate.toFixed(2)}%
                </span>
              </div>

              {/* Status Indicator */}
              <div className="mt-1 flex items-center justify-between text-[10px]">
                <span className="text-slate-600">감성 {stock.sentimentScore}점</span>
                {stock.panicDefense.isActive ? (
                  <span className="font-semibold text-amber-600">
                    패닉 디펜스
                  </span>
                ) : (
                  <span
                    className={
                      isSelected ? 'text-blue-600 font-medium' : 'text-slate-600'
                    }
                  >
                    {stock.sentimentStatus}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
