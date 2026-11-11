import React from 'react';
import { Stock } from '../types/stock';
import { Newspaper, Compass, Target, HeartHandshake, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface NewsThreeLineSummaryProps {
  stock: Stock;
}

export const NewsThreeLineSummary: React.FC<NewsThreeLineSummaryProps> = ({ stock }) => {
  const newsItems = stock.newsSummary3Lines ?? [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs h-full flex flex-col justify-between">
      {/* Header: 대제목 바로 아래에 NLP 문구 배치 */}
      <div>
        <div className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-blue-600" />
              <span>뉴스 세 줄 요약</span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            실시간 경제·증권 뉴스 자연어 처리(NLP) 기반 가중치 반영
          </p>
        </div>

        {/* 3-Line News List */}
        <div className="divide-y divide-slate-100 mt-1">
          {newsItems.map((news, idx) => (
            <div key={news.id} className="py-3 flex items-start gap-3 first:pt-2.5 last:pb-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      news.sentiment === 'positive'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : news.sentiment === 'negative'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {news.sentimentLabel}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {news.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {news.summary}
                </p>
                <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-2">
                  <span>{news.source}</span>
                  <span>·</span>
                  <span>{news.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface FinalConclusionCardProps {
  stock: Stock;
}

export const FinalConclusionCard: React.FC<FinalConclusionCardProps> = ({ stock }) => {
  const conclusion = stock.finalConclusion ?? {
    badge: '관망 추천' as const,
    guidance: '기본 투자 가이드를 확인해보세요.',
    targetSupport: '시장 추세를 확인하세요.',
    psychologicalTip: '감정적 매매를 피하고 장기 관점을 유지하세요.'
  };

  // Badge styling
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case '관망 추천':
        return 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-500/20';
      case '분할 매수 추천':
        return 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-500/20';
      case '적극 매수':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-white via-slate-50 to-blue-50/40 rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs relative overflow-hidden">

      {/* Header with Title and Recommendation Badge (불필요한 부제목 문구 완전 삭제 완료) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              AI 최종 분석 결론 & 투자 가이드
            </h3>
          </div>
        </div>

        {/* Distinct Position Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-600">추천 포지션:</span>
          <span
            className={`px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold border ${getBadgeStyle(
              conclusion.badge
            )}`}
          >
            {conclusion.badge}
          </span>
        </div>
      </div>

      {/* Main Guidance Text Block */}
      <div className="mt-4 space-y-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              {conclusion.guidance}
            </div>
          </div>
        </div>

        {/* 3-Column Metric & Mindset Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
            <Target className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">핵심 기술적 지표</span>
              <span className="font-bold text-slate-900">{conclusion.targetSupport}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-emerald-700 font-semibold block">초보 멘탈 케어 팁</span>
              <span className="text-slate-800 font-medium">{conclusion.psychologicalTip}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] text-indigo-700 font-semibold block">패닉셀 방어 원칙</span>
              <span className="text-slate-800 font-medium">시장 급락 시 3일 이내 충동 매도 금지</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Legacy wrapper if imported as NewsSummaryCard
export const NewsSummaryCard: React.FC<{ stock: Stock }> = ({ stock }) => {
  return (
    <div className="space-y-4">
      <NewsThreeLineSummary stock={stock} />
      <FinalConclusionCard stock={stock} />
    </div>
  );
};