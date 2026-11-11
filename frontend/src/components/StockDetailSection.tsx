import React from 'react';
import { StockData } from '../types/stock';
import { CoreQuoteCard } from './CoreQuoteCard';
import { YearlyStockChart } from './YearlyStockChart';
import { Sparkles, Layers } from 'lucide-react';

interface StockDetailSectionProps {
  stock: StockData;
}

export const StockDetailSection: React.FC<StockDetailSectionProps> = ({ stock }) => {
  return (
    <section className="space-y-3">
      {/* Section Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{stock.name} 종목 상세 분석</span>
              <span className="text-xs font-semibold text-blue-600">({stock.code})</span>
            </h2>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Grid: Left CoreQuoteCard (5 cols) + Right YearlyStockChart (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 핵심 시세 정보 카드 (5 cols) */}
        <div className="lg:col-span-5 h-full">
          <CoreQuoteCard quote={stock.quote} />
        </div>

        {/* Right: 1년치 상세 주식 차트 (7 cols) */}
        <div className="lg:col-span-7 h-full">
          <YearlyStockChart
            yearlyData={stock.yearlyChartData}
            stockName={stock.name}
            stockCode={stock.code}
            currentPrice={stock.quote.currentPrice}
          />
        </div>
      </div>
    </section>
  );
};
