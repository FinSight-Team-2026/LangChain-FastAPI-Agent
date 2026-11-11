import React from 'react';
import { Stock } from '../types/stock';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface SentimentGaugeCardProps {
  stock: Stock;
}

export const SentimentGaugeCard: React.FC<SentimentGaugeCardProps> = ({ stock }) => {
  const quote = stock.quote ?? {};
  const panicDefense = stock.panicDefense ?? {
    isActive: false,
    stockChangePercent: 0,
    kospiChangePercent: 0,
    badgeText: '정보 없음',
    headline: '안심 방어 가이드를 확인해보세요.',
    recommendation: '데이터가 아직 준비되지 않았습니다.',
    defenseType: 'market_rebound',
  };
  const score = stock.sentimentScore;

  // Circular gauge calculations
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  // Gauge color tone
  const getGaugeColor = (val: number) => {
    if (val >= 75) return '#2563EB'; // vibrant blue
    if (val >= 60) return '#3B82F6'; // soft blue
    if (val >= 40) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      
      {/* Header (패닉 시뮬레이터 버튼 완전 삭제됨) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI 뉴스 감성 분석 & 패닉 디펜스</span>
          </h3>
        </div>
      </div>

      {/* Main Gauge & Sentiment Section */}
      <div className="py-4 flex flex-col sm:flex-row items-center justify-around gap-6">
        
        {/* Circular SVG Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90">
            {/* Background track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Value stroke */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={getGaugeColor(score)}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Score Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {score}점
            </span>
            <span
              className={`text-xs font-bold mt-0.5 ${
                score >= 70 ? 'text-blue-600' : score >= 50 ? 'text-slate-600' : 'text-amber-600'
              }`}
            >
              {stock.sentimentStatus}
            </span>
          </div>
        </div>

        {/* Sentiment Breakdown bars */}
        <div className="flex-1 w-full max-w-xs space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>실시간 뉴스 감성 비율</span>
            <span className="text-slate-600 font-normal">최근 24시간 언론 기사 328건 분석</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span className="text-blue-600 font-semibold">긍정 뉴스</span>
              <span className="font-bold tabular-nums text-blue-700">{stock.sentimentBreakdown.positive}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${stock.sentimentBreakdown.positive}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span className="text-slate-600 font-medium">중립 / 사실 보도</span>
              <span className="font-bold tabular-nums text-slate-700">{stock.sentimentBreakdown.neutral}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 rounded-full transition-all duration-500"
                style={{ width: `${stock.sentimentBreakdown.neutral}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span className="text-rose-600 font-medium">부정 / 우려</span>
              <span className="font-bold tabular-nums text-rose-700">{stock.sentimentBreakdown.negative}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${stock.sentimentBreakdown.negative}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Panic Defense Card (원리보기 및 중간 막대 | 제거, 쉬운 한글 표현 적용) */}
      <div className="mt-2 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white rounded-xl p-3.5 sm:p-4 border border-blue-200/90 relative shadow-2xs">
        
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-blue-900">
              AI 안심 방어 가이드
            </span>
          </div>
        </div>

        {/* Highlight Box */}
        <div className="mt-2.5 p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 tabular-nums">
            <span className="text-blue-700">
              {stock.name}: {Number(quote.changeRate ?? stock.changeRate ?? 0) >= 0 ? '+' : ''}{Number(quote.changeRate ?? stock.changeRate ?? 0).toFixed(1)}%
            </span>
            <span className="text-slate-700">
              KOSPI: {Number(panicDefense.kospiChangePercent ?? 0) >= 0 ? '+' : ''}{Number(panicDefense.kospiChangePercent ?? 0).toFixed(1)}%
            </span>
          </div>

          <div className="mt-2 text-xs sm:text-sm font-bold text-blue-900 leading-snug">
            {panicDefense.headline}
          </div>

          {panicDefense.recommendation && (
            <div className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
              💡 {panicDefense.recommendation}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};