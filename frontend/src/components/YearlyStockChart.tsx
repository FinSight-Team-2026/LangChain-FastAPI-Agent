import React, { useState } from 'react';
import { YearlyCandlePoint } from '../types/stock';
<<<<<<< HEAD
import { BarChart2, Calendar } from 'lucide-react';
=======
import { BarChart2, TrendingUp, TrendingDown, Layers, Calendar } from 'lucide-react';
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)

interface YearlyStockChartProps {
  yearlyData: YearlyCandlePoint[];
  stockName: string;
  stockCode: string;
  currentPrice: number;
}

export const YearlyStockChart: React.FC<YearlyStockChartProps> = ({
  yearlyData,
  stockName,
  stockCode,
  currentPrice,
}) => {
<<<<<<< HEAD
  const [timeRange, setTimeRange] = useState<'1y' | '6m' | '3m'>('1y');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Filter data based on time range with safety check
=======
  const [chartMode, setChartMode] = useState<'candle' | 'line'>('candle');
  const [timeRange, setTimeRange] = useState<'1y' | '6m' | '3m'>('1y');
  const [showMA, setShowMA] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Filter data based on time range
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
  const filteredData = React.useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return [];
    if (timeRange === '3m') return yearlyData.slice(-4);
    if (timeRange === '6m') return yearlyData.slice(-7);
    return yearlyData; // 1y
  }, [yearlyData, timeRange]);

<<<<<<< HEAD
  // Fallback safe data if filteredData is empty
  const safeData = filteredData.length > 0 ? filteredData : [{
    date: '2026.01',
    label: '26.01',
    open: currentPrice,
    high: currentPrice,
    low: currentPrice,
    close: currentPrice,
    volume: 0
  }];

  // Calculations for prices & volumes
  const allPrices = safeData.flatMap((d) => [d.low, d.high]);
  const minPrice = Math.min(...allPrices) * 0.96;
  const maxPrice = Math.max(...allPrices) * 1.04;
  const maxVolume = Math.max(...safeData.map((d) => d.volume), 1);
=======
  // Calculations for prices & volumes
  const allPrices = filteredData.flatMap((d) => [d.low, d.high]);
  const minPrice = Math.min(...allPrices) * 0.96;
  const maxPrice = Math.max(...allPrices) * 1.04;
  const maxVolume = Math.max(...filteredData.map((d) => d.volume), 1);
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)

  // Chart dimensions
  const svgW = 750;
  const svgH = 320;
  const priceH = 220; // top price area
  const volumeH = 60; // bottom volume area
  const pad = { top: 25, right: 40, bottom: 35, left: 20 };

  const usableW = svgW - pad.left - pad.right;
<<<<<<< HEAD
  const colW = usableW / safeData.length;
=======
  const colW = usableW / filteredData.length;
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)

  const getYPrice = (val: number) => {
    const ratio = (val - minPrice) / (maxPrice - minPrice || 1);
    return pad.top + priceH - ratio * priceH;
  };

  const getYVolume = (val: number) => {
    const ratio = val / maxVolume;
    const base = pad.top + priceH + 15 + volumeH;
    return base - ratio * volumeH;
  };

  // Hover target (or latest)
<<<<<<< HEAD
  const activePoint = hoveredIdx !== null && safeData[hoveredIdx] ? safeData[hoveredIdx] : safeData[safeData.length - 1];

  // 1-Year return calculation
  const startPrice = safeData[0]?.open || currentPrice;
  const returnRate = ((currentPrice - startPrice) / startPrice) * 100;
  const isReturnPositive = returnRate >= 0;

  // Polyline generator for Moving Averages
=======
  const activePoint = hoveredIdx !== null ? filteredData[hoveredIdx] : filteredData[filteredData.length - 1];

  // 1-Year return calculation
  const startPrice = filteredData[0]?.open || currentPrice;
  const returnRate = ((currentPrice - startPrice) / startPrice) * 100;
  const isReturnPositive = returnRate >= 0;

  // Polyline generator for MA & Line Chart
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
  const makeLinePoints = (pts: { x: number; y: number }[]) => {
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  };

<<<<<<< HEAD
  const ma20Points = safeData
=======
  const closeLinePoints = filteredData.map((d, i) => ({
    x: pad.left + i * colW + colW / 2,
    y: getYPrice(d.close),
  }));

  const ma20Points = filteredData
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
    .filter((d) => d.ma20 !== undefined)
    .map((d, i) => ({
      x: pad.left + i * colW + colW / 2,
      y: getYPrice(d.ma20!),
    }));

<<<<<<< HEAD
  const ma60Points = safeData
=======
  const ma60Points = filteredData
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
    .filter((d) => d.ma60 !== undefined)
    .map((d, i) => ({
      x: pad.left + i * colW + colW / 2,
      y: getYPrice(d.ma60!),
    }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
<<<<<<< HEAD
      {/* Header with Title and Period Controls */}
=======
      {/* Header with Title and Control Toggles */}
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>최근 1년 주가 흐름 상세 차트</span>
            </h3>
            <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {stockName}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span>기간 수익률:</span>
            <span className={`font-bold tabular-nums ${isReturnPositive ? 'text-rose-600' : 'text-blue-600'}`}>
              {isReturnPositive ? '+' : ''}{returnRate.toFixed(2)}%
            </span>
            <span>·</span>
            <span>연중 고점: {Math.max(...allPrices).toLocaleString()}원</span>
          </div>
        </div>

<<<<<<< HEAD
        {/* Time range buttons only */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTimeRange('3m')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
=======
        {/* Controls: Timeframe + Chart Type + MA Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time range buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTimeRange('3m')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
                timeRange === '3m' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3개월
            </button>
            <button
              onClick={() => setTimeRange('6m')}
<<<<<<< HEAD
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
=======
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
                timeRange === '6m' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6개월
            </button>
            <button
              onClick={() => setTimeRange('1y')}
<<<<<<< HEAD
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
=======
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
                timeRange === '1y' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1년
            </button>
          </div>
<<<<<<< HEAD
=======

          {/* Mode: Candle vs Line */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setChartMode('candle')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartMode === 'candle' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              캔들
            </button>
            <button
              onClick={() => setChartMode('line')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                chartMode === 'line' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              라인
            </button>
          </div>

          {/* MA Toggle */}
          <button
            onClick={() => setShowMA(!showMA)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showMA
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 line-through'
            }`}
          >
            이평선
          </button>
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
        </div>
      </div>

      {/* Active Candle Hover Data Strip */}
      <div className="flex items-center justify-between py-2.5 px-3 my-2 bg-slate-50/80 rounded-xl border border-slate-100 text-xs tabular-nums">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{activePoint.date} 기준</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-[11px]">
          <div>시: <span className="font-semibold text-slate-800">{activePoint.open.toLocaleString()}</span></div>
          <div>고: <span className="font-semibold text-rose-600">{activePoint.high.toLocaleString()}</span></div>
          <div>저: <span className="font-semibold text-blue-600">{activePoint.low.toLocaleString()}</span></div>
          <div>종: <span className="font-bold text-slate-900">{activePoint.close.toLocaleString()}원</span></div>
          <div>거래량: <span className="font-semibold text-slate-700">{activePoint.volume.toLocaleString()}</span></div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Interactive SVG Chart (Candlestick Fixed) */}
      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
=======
      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="yearlyLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
          {/* Price Area Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => {
            const y = pad.top + priceH * r;
            const priceLabel = Math.round(maxPrice - r * (maxPrice - minPrice));
            return (
              <g key={r}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={svgW - pad.right}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={svgW - pad.right + 6}
                  y={y + 3}
<<<<<<< HEAD
                  className="fill-slate-400 text-[10px] tabular-nums"
=======
                  className="fill-slate-500 text-[10px] tabular-nums"
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
                  textAnchor="start"
                >
                  {priceLabel.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Volume baseline divider */}
          <line
            x1={pad.left}
            y1={pad.top + priceH + 15}
            x2={svgW - pad.right}
            y2={pad.top + priceH + 15}
            stroke="#E2E8F0"
            strokeWidth="1"
          />

<<<<<<< HEAD
          {/* Candlesticks Rendering (Fixed) */}
          {safeData.map((d, i) => {
            const xCenter = pad.left + i * colW + colW / 2;
            const isUpCandle = d.close >= d.open;
            const candleColor = isUpCandle ? '#E11D48' : '#2563EB';

            const yHigh = getYPrice(d.high);
            const yLow = getYPrice(d.low);
            const yOpen = getYPrice(d.open);
            const yClose = getYPrice(d.close);

            const candleTop = Math.min(yOpen, yClose);
            const candleBottom = Math.max(yOpen, yClose);
            const candleHeight = Math.max(candleBottom - candleTop, 2);
            const candleW = Math.max(colW * 0.55, 6);

            return (
              <g key={d.date} className="transition-opacity duration-150">
                <line
                  x1={xCenter}
                  y1={yHigh}
                  x2={xCenter}
                  y2={yLow}
                  stroke={candleColor}
                  strokeWidth="1.5"
                />
                <rect
                  x={xCenter - candleW / 2}
                  y={candleTop}
                  width={candleW}
                  height={candleHeight}
                  fill={isUpCandle ? '#E11D48' : '#2563EB'}
                  rx="1.5"
                  className="drop-shadow-2xs"
                />
              </g>
            );
          })}

          {/* Moving Averages (Always Fixed) */}
          {ma20Points.length > 1 && (
            <polyline
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.8"
              points={makeLinePoints(ma20Points)}
            />
          )}
          {ma60Points.length > 1 && (
            <polyline
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="1.8"
              strokeDasharray="3 2"
              points={makeLinePoints(ma60Points)}
            />
          )}

          {/* Lower Volume Bars */}
          {safeData.map((d, i) => {
=======
          {/* Chart Rendering: Candlesticks OR Line */}
          {chartMode === 'candle' ? (
            filteredData.map((d, i) => {
              const xCenter = pad.left + i * colW + colW / 2;
              const isUpCandle = d.close >= d.open;
              const candleColor = isUpCandle ? '#E11D48' : '#2563EB'; // Korean convention: Red=Up, Blue=Down

              const yHigh = getYPrice(d.high);
              const yLow = getYPrice(d.low);
              const yOpen = getYPrice(d.open);
              const yClose = getYPrice(d.close);

              const candleTop = Math.min(yOpen, yClose);
              const candleBottom = Math.max(yOpen, yClose);
              const candleHeight = Math.max(candleBottom - candleTop, 2);
              const candleW = Math.max(colW * 0.55, 6);

              return (
                <g key={d.date} className="transition-opacity duration-150">
                  {/* High - Low Wick */}
                  <line
                    x1={xCenter}
                    y1={yHigh}
                    x2={xCenter}
                    y2={yLow}
                    stroke={candleColor}
                    strokeWidth="1.5"
                  />
                  {/* Candle Body */}
                  <rect
                    x={xCenter - candleW / 2}
                    y={candleTop}
                    width={candleW}
                    height={candleHeight}
                    fill={isUpCandle ? '#E11D48' : '#2563EB'}
                    rx="1.5"
                    className="drop-shadow-2xs"
                  />
                </g>
              );
            })
          ) : (
            <>
              {/* Line Area Fill */}
              <polygon
                points={`${closeLinePoints[0].x},${pad.top + priceH} ${makeLinePoints(closeLinePoints)} ${closeLinePoints[closeLinePoints.length - 1].x},${pad.top + priceH}`}
                fill="url(#yearlyLineGrad)"
              />
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={makeLinePoints(closeLinePoints)}
              />
            </>
          )}

          {/* Moving Averages (20일선 노랑, 60일선 보라) */}
          {showMA && (
            <>
              {ma20Points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.8"
                  points={makeLinePoints(ma20Points)}
                />
              )}
              {ma60Points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="1.8"
                  strokeDasharray="3 2"
                  points={makeLinePoints(ma60Points)}
                />
              )}
            </>
          )}

          {/* Lower Volume Bars */}
          {filteredData.map((d, i) => {
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
            const xCenter = pad.left + i * colW + colW / 2;
            const barW = Math.max(colW * 0.5, 5);
            const yTop = getYVolume(d.volume);
            const base = pad.top + priceH + 15 + volumeH;
            const isUpCandle = d.close >= d.open;

            return (
              <rect
                key={`vol-${d.date}`}
                x={xCenter - barW / 2}
                y={yTop}
                width={barW}
                height={Math.max(base - yTop, 1)}
                fill={isUpCandle ? '#FECDD3' : '#BFDBFE'}
                rx="1"
              />
            );
          })}

          {/* Hover Crosshair */}
          {hoveredIdx !== null && (
            <>
              <line
                x1={pad.left + hoveredIdx * colW + colW / 2}
                y1={pad.top}
                x2={pad.left + hoveredIdx * colW + colW / 2}
                y2={pad.top + priceH + 15 + volumeH}
                stroke="#3B82F6"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <circle
                cx={pad.left + hoveredIdx * colW + colW / 2}
                cy={getYPrice(activePoint.close)}
                r="4.5"
                fill="#2563EB"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </>
          )}

          {/* Invisible interactive hover detection columns */}
<<<<<<< HEAD
          {safeData.map((d, i) => {
=======
          {filteredData.map((d, i) => {
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
            const x = pad.left + i * colW;
            return (
              <rect
                key={`hit-${d.date}`}
                x={x}
                y={pad.top}
                width={colW}
                height={priceH + volumeH + 20}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onTouchStart={() => setHoveredIdx(i)}
              />
            );
          })}

          {/* X Axis Labels */}
<<<<<<< HEAD
          {safeData.map((d, i) => (
=======
          {filteredData.map((d, i) => (
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
            <text
              key={`lbl-${d.date}`}
              x={pad.left + i * colW + colW / 2}
              y={svgH - 8}
              textAnchor="middle"
              className={`text-[10px] font-medium transition-colors ${
<<<<<<< HEAD
                hoveredIdx === i ? 'fill-blue-600 font-bold' : 'fill-slate-400'
=======
                hoveredIdx === i ? 'fill-blue-600 font-bold' : 'fill-slate-500'
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
              }`}
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Chart Legend Footer */}
      <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
            양봉 (상승)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
            음봉 (하락)
          </span>
<<<<<<< HEAD
          <span className="flex items-center gap-1 text-amber-600">
            <span className="w-2.5 h-0.5 bg-amber-500 inline-block" />
            20일선
          </span>
          <span className="flex items-center gap-1 text-indigo-600">
            <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" />
            60일선
          </span>
        </div>

        <span className="text-[10px] text-slate-400">
=======
          {showMA && (
            <>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2.5 h-0.5 bg-amber-500 inline-block" />
                20일선
              </span>
              <span className="flex items-center gap-1 text-indigo-600">
                <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" />
                60일선
              </span>
            </>
          )}
        </div>

        <span className="text-[10px] text-slate-600">
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
          하단 바 차트: 월간 거래량
        </span>
      </div>
    </div>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
