import React, { useEffect, useState } from 'react';
import { StockData } from '../types/stock';
import { Sparkles } from 'lucide-react';

interface SentimentStatsResponse {
  stockCode: string;
  totalCount: number;
  sentimentScore: number | null;
  sentimentStatus: string;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface SentimentGaugeCardProps {
  stock: StockData;
}

export const SentimentGaugeCard: React.FC<SentimentGaugeCardProps> = ({ stock }) => {
  const [stats, setStats] = useState<SentimentStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setStats(null);
    setLoading(true);
    setStatsError(false);

    fetch(`/api/ai/sentiment-stats/${encodeURIComponent(stock.code)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<SentimentStatsResponse>;
      })
      .then((data) => {
        if (!controller.signal.aborted) setStats(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error('감성 통계 조회 실패:', error);
          setStatsError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [stock.code]);

  const hasData = !loading && !statsError && stats !== null && stats.totalCount > 0 && stats.sentimentScore !== null;
  const score = hasData ? stats.sentimentScore! : 0;
  const breakdown = hasData ? stats.sentimentBreakdown : { positive: 0, neutral: 0, negative: 0 };
  const status = loading ? '분석 결과 불러오는 중' : statsError ? '조회 실패' : hasData ? stats.sentimentStatus : '분석 데이터 없음';

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
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI 뉴스 감성 분석</span>
          </h3>
        </div>
      </div>

      {/* Main Gauge & Sentiment Section */}
      <div className="pt-6 pb-4 flex flex-col items-center gap-7">
        
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
              stroke={hasData ? getGaugeColor(score) : "#CBD5E1"}
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
              {hasData ? `${score}점` : '—'}
            </span>
            <span
              className={`text-xs font-bold mt-0.5 ${
                score >= 70 ? 'text-blue-600' : score >= 50 ? 'text-slate-600' : 'text-amber-600'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Sentiment Breakdown bars */}
        <div className="w-full space-y-3">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>최근 7일 뉴스 감성 비율</span>
            <span className="text-slate-600 font-normal">{loading ? '불러오는 중...' : statsError ? '조회 실패' : `분석 완료 뉴스 ${stats?.totalCount ?? 0}건`}</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span className="text-blue-600 font-semibold">긍정 뉴스</span>
              <span className="font-bold tabular-nums text-blue-700">{breakdown.positive}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.positive}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span className="text-slate-600 font-medium">중립 / 사실 보도</span>
              <span className="font-bold tabular-nums text-slate-700">{breakdown.neutral}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.neutral}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span className="text-rose-600 font-medium">부정 / 우려</span>
              <span className="font-bold tabular-nums text-rose-700">{breakdown.negative}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.negative}%` }}
              />
            </div>
          </div>
        </div>

      </div>


    </div>
  );
};
