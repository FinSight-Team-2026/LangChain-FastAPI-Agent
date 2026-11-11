import React, { useState } from 'react';
import { DailyMetric } from '../types/stock';
import { Activity, Info, Eye } from 'lucide-react';

interface MultiMetricChartProps {
  metrics: DailyMetric[];
  stockName: string;
  compact?: boolean;
}

export const MultiMetricChart: React.FC<MultiMetricChartProps> = ({
  metrics = [],
  stockName,
  compact = false,
}) => {
  // 안전한 기본 데이터 방어 처리
  const safeMetrics = metrics && metrics.length > 0 ? metrics : [
    { day: '00.00', fullDate: '2026.01.01', sentimentScore: 50, stockPrice: 0, kospiIndex: 2500 }
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(safeMetrics.length - 1);
  const [visibleSeries, setVisibleSeries] = useState({
    sentiment: true,
    price: true,
    kospi: true,
  });

  // Min and Max calculations for normalized scaling
  const sentimentScores = safeMetrics.map((m) => m.sentimentScore);
  const stockPrices = safeMetrics.map((m) => m.stockPrice);
  const kospiIndexes = safeMetrics.map((m) => m.kospiIndex);

  const minSentiment = Math.min(...sentimentScores, 50);
  const maxSentiment = Math.max(...sentimentScores, 100);

  const minPrice = Math.min(...stockPrices) * 0.98;
  const maxPrice = Math.max(...stockPrices) * 1.02;

  const minKospi = Math.min(...kospiIndexes) * 0.99;
  const maxKospi = Math.max(...kospiIndexes) * 1.01;

  // Chart viewBox dimensions
  const width = 800;
  const height = compact ? 220 : 300;
  const padding = { top: 25, right: 35, bottom: 35, left: 35 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Coordinate mappers
  const getX = (idx: number) => {
    if (safeMetrics.length <= 1) return padding.left;
    return padding.left + (idx / (safeMetrics.length - 1)) * chartW;
  };

  const getYNorm = (val: number, min: number, max: number) => {
    const ratio = (val - min) / (max - min || 1);
    return padding.top + chartH - ratio * chartH;
  };

  const sentimentPoints = safeMetrics.map((m, i) => ({
    x: getX(i),
    y: getYNorm(m.sentimentScore, minSentiment, maxSentiment),
    val: m.sentimentScore,
  }));

  const pricePoints = safeMetrics.map((m, i) => ({
    x: getX(i),
    y: getYNorm(m.stockPrice, minPrice, maxPrice),
    val: m.stockPrice,
  }));

  const kospiPoints = safeMetrics.map((m, i) => ({
    x: getX(i),
    y: getYNorm(m.kospiIndex, minKospi, maxKospi),
    val: m.kospiIndex,
  }));

  // Path generators
  const makeLinePath = (pts: { x: number; y: number }[]) => {
    return pts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  };

  const makeAreaPath = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return '';
    const line = makeLinePath(pts);
    const bottomY = padding.top + chartH;
    // 오타 수정 완료 (pts.length - 1)
    return `${line} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`;
  };

  const activeMetric = hoveredIndex !== null && safeMetrics[hoveredIndex] ? safeMetrics[hoveredIndex] : safeMetrics[safeMetrics.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              최근 7일 감성 지수, 주가 & 코스피 지수
            </h3>
            <span className="text-xs text-blue-600 bg-blue-50 font-semibold px-2 py-0.5 rounded-md border border-blue-100">
              {stockName} 통합 뷰
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            AI 뉴스 감성 점수와 실제 주가 흐름 및 KOSPI 시장 지수를 동기화 분석합니다.
          </p>
        </div>

        {/* Series Toggles & Timeframe */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setVisibleSeries((s) => ({ ...s, sentiment: !s.sentiment }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                visibleSeries.sentiment
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 line-through'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              AI 감성 (점)
            </button>

            <button
              onClick={() => setVisibleSeries((s) => ({ ...s, price: !s.price }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                visibleSeries.price
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 line-through'
              }`}
            >
              <span className="w-2.5 h-0.5 bg-amber-500 inline-block border-t border-dashed border-amber-600" />
              주가 (원)
            </button>

            <button
              onClick={() => setVisibleSeries((s) => ({ ...s, kospi: !s.kospi }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                visibleSeries.kospi
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 line-through'
              }`}
            >
              <span className="w-2.5 h-0.5 bg-slate-400 inline-block border-t border-dotted border-slate-500" />
              KOSPI (pt)
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Metrics Highlight Strip */}
      <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50/70 rounded-xl px-3 my-2 border border-slate-100">
        <div className="text-left">
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>AI 감성 지수</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-blue-700 tabular-nums">
            {activeMetric.sentimentScore}점
            <span className="text-[11px] font-normal text-slate-600 ml-1">
              ({activeMetric.sentimentScore >= 70 ? '긍정' : activeMetric.sentimentScore >= 50 ? '중립' : '공포'})
            </span>
          </div>
        </div>

        <div className="text-left border-x border-slate-200 px-3">
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-500" />
            <span>{stockName} 주가</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-amber-700 tabular-nums">
            {activeMetric.stockPrice.toLocaleString()}원
          </div>
        </div>

        <div className="text-left pl-1">
          <div className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="w-2 h-0.5 bg-slate-500 border-t border-dotted border-slate-700" />
            <span>코스피 지수</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-700 tabular-nums">
            {activeMetric.kospiIndex.toFixed(1)} pt
          </div>
        </div>
      </div>

      {/* SVG Multi-Line Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartH * ratio;
            return (
              <line
                key={ratio}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* 1. AI Sentiment Score: Blue Line with Area Fill */}
          {visibleSeries.sentiment && (
            <>
              <path
                d={makeAreaPath(sentimentPoints)}
                fill="url(#sentimentGradient)"
              />
              <path
                d={makeLinePath(sentimentPoints)}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* 2. Stock Price: Orange Dashed Line */}
          {visibleSeries.price && (
            <path
              d={makeLinePath(pricePoints)}
              fill="none"
              stroke="#F97316"
              strokeWidth="2.2"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 3. KOSPI Index: Grey Dotted Line */}
          {visibleSeries.kospi && (
            <path
              d={makeLinePath(kospiPoints)}
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
              strokeDasharray="2 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Crosshair & Synchronized Data Dots */}
          {hoveredIndex !== null && sentimentPoints[hoveredIndex] && pricePoints[hoveredIndex] && kospiPoints[hoveredIndex] && (
            <>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + chartH}
                stroke="#3B82F6"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {visibleSeries.sentiment && (
                <circle
                  cx={sentimentPoints[hoveredIndex].x}
                  cy={sentimentPoints[hoveredIndex].y}
                  r="5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="drop-shadow-xs"
                />
              )}

              {visibleSeries.price && (
                <circle
                  cx={pricePoints[hoveredIndex].x}
                  cy={pricePoints[hoveredIndex].y}
                  r="4.5"
                  fill="#F97316"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="drop-shadow-xs"
                />
              )}

              {visibleSeries.kospi && (
                <circle
                  cx={kospiPoints[hoveredIndex].x}
                  cy={kospiPoints[hoveredIndex].y}
                  r="4.5"
                  fill="#64748B"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="drop-shadow-xs"
                />
              )}
            </>
          )}

          {/* Invisible interactive hover hit areas */}
          {safeMetrics.map((m, idx) => {
            const x = getX(idx);
            const colWidth = chartW / safeMetrics.length;
            return (
              <rect
                key={m.day || idx}
                x={x - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={chartH + padding.bottom}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onTouchStart={() => setHoveredIndex(idx)}
              />
            );
          })}

          {/* X Axis Labels (Dates) */}
          {safeMetrics.map((m, idx) => (
            <text
              key={m.day || idx}
              x={getX(idx)}
              y={height - 8}
              textAnchor="middle"
              className={`text-[11px] font-medium transition-colors ${
                hoveredIndex === idx ? 'fill-blue-600 font-bold' : 'fill-slate-500'
              }`}
            >
              {m.day}
            </text>
          ))}
        </svg>

        {/* Synchronized Tooltip Card */}
        {hoveredIndex !== null && activeMetric && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-900/90 text-white rounded-lg px-2.5 py-1.5 shadow-md backdrop-blur-xs text-xs z-20"
            style={{
              left: `${Math.min(Math.max((getX(hoveredIndex) / width) * 100, 15), 85)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-200 text-[10px] border-b border-slate-700 pb-0.5 mb-1">
              {activeMetric.fullDate}
            </div>
            <div className="space-y-0.5 text-[11px] tabular-nums">
              <div className="flex justify-between gap-3 text-blue-300">
                <span>AI 감성:</span>
                <span className="font-bold">{activeMetric.sentimentScore}점</span>
              </div>
              <div className="flex justify-between gap-3 text-amber-300">
                <span>주가:</span>
                <span className="font-bold">{activeMetric.stockPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between gap-3 text-slate-300">
                <span>코스피:</span>
                <span className="font-bold">{activeMetric.kospiIndex.toFixed(1)}pt</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="pt-2 text-center text-[11px] text-slate-600 flex items-center justify-center gap-4 flex-wrap">
        <span>🔵 파란색 실선 + 면: AI 감성 지수 (0~100)</span>
        <span>🟠 주황색 점선: {stockName} 주가</span>
        <span>⚪ 회색 점선: KOSPI 지수</span>
      </div>
    </div>
  );
};