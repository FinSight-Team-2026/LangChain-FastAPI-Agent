import React from 'react';
import { Stock } from '../types/stock';
import { TodayTermBanner } from './TodayTermBanner';
import { StockQuickSelector } from './StockQuickSelector';
import { StockDetailSection } from './StockDetailSection';
import { MultiMetricChart } from './MultiMetricChart';
import { SentimentGaugeCard } from './SentimentGaugeCard';
import { NewsThreeLineSummary, FinalConclusionCard } from './NewsSummaryCard';

interface DesktopDashboardProps {
  selectedStock: Stock;
  onSelectStock: (id: string) => void;
  stocksData?: Record<string, Stock>; // 실시간 5대 종목 데이터 추가
}

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  selectedStock,
  onSelectStock,
  stocksData,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
      
      {/* 1. Top Banner: 오늘의 주식 용어 */}
      <TodayTermBanner />

      {/* 2. 5대 핵심주 퀵 셀렉터 */}
      <StockQuickSelector
        selectedStockId={selectedStock.id}
        onSelectStock={onSelectStock}
        stocksData={stocksData}
      />

      {/* 3. [신규] 종목 상세 분석 섹션 (좌: 핵심 시세 정보 카드 / 우: 1년치 상세 주식 차트) */}
      <StockDetailSection stock={selectedStock} />

      {/* 4. 최근 7일 감성 지수, 주가 & 코스피 지수 통합 차트 (아래로 이동) */}
      <div className="pt-1">
        <MultiMetricChart
          metrics={selectedStock.metrics7d}
          stockName={selectedStock.name}
        />
      </div>

      {/* 5. AI 뉴스 감성 분석 & 패닉 디펜스 + 뉴스 세 줄 요약 (나란히 동일 높이 정렬) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full">
          <SentimentGaugeCard stock={selectedStock} />
        </div>
        <div className="h-full">
          <NewsThreeLineSummary stock={selectedStock} />
        </div>
      </div>

      {/* 6. AI 최종 분석 결론 & 투자 가이드 (하단 가로 전체 너비 확장) */}
      <div className="w-full">
        <FinalConclusionCard stock={selectedStock} />
      </div>

    </div>
  );
};