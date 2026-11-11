
import React, { useEffect, useState } from 'react';
import { StockData, NewsItem } from '../types/stock';
import { Newspaper, Compass, Target, HeartHandshake, CheckCircle2, ShieldCheck } from 'lucide-react';


interface NewsThreeLineSummaryProps {
  stock: StockData;
}

export const NewsThreeLineSummary: React.FC<
  NewsThreeLineSummaryProps
> = ({ stock }) => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setNewsList([]);

      try {
        const response = await fetch(
          `/api/ai/news-summary/${stock.code}?limit=5`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setNewsList(
            data.news.map((item: NewsItem & { publishedAt?: string }) => ({
              ...item,
              timeAgo: item.publishedAt
                ? new Date(item.publishedAt).toLocaleString('ko-KR')
                : '',
            }))
          );
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('뉴스를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => controller.abort();
  }, [stock.code]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-blue-600" />
          최근 7일 뉴스 요약
        </h3>
      </div>

      {/* News List */}
      <div className="mt-1 max-h-[315px] divide-y divide-slate-100 overflow-y-auto overscroll-contain pr-2">
        {loading && (
          <p className="py-5 text-sm text-slate-500">
            뉴스를 불러오는 중입니다...
          </p>
        )}

        {error && (
          <p className="py-5 text-sm text-rose-600">
            {error}
          </p>
        )}

        {!loading && !error && newsList.length === 0 && (
          <p className="py-5 text-sm text-slate-500">
            최근 7일간 분석이 완료된 뉴스가 없습니다.
          </p>
        )}

        {!loading && !error && newsList.map((news, idx) => (
          <a
            key={news.id}
            href={/^https?:\/\//i.test(news.url || '') ? news.url ?? undefined : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${news.title} 원문 기사 열기`}
            className={`py-3 flex items-start gap-3 rounded-lg transition-colors ${
              /^https?:\/\//i.test(news.url || '')
                ? 'hover:bg-slate-50 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500'
                : 'cursor-default'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
              {idx + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    news.sentiment === 'positive'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : news.sentiment === 'negative'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {news.sentimentLabel}
                </span>

                <span className="text-xs font-bold text-slate-900">
                  {news.title}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {news.summary}
              </p>

              <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-2">
                {news.source && <span>{news.source}</span>}
                <span>{news.timeAgo}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 mt-auto text-[11px] text-slate-500">
        AI 기반 뉴스 감성 분석 및 3문장 요약
      </div>
    </div>
  );
};

interface FinalConclusionCardProps {
  stock: StockData;
}


export const FinalConclusionCard: React.FC<FinalConclusionCardProps> = ({ stock }) => {
  interface FinalConclusionResponse {
    stockCode: string;
    stockName: string;
    badge: string;
    guidance: string;
    keyFactors: string[];
    riskFactors: string[];
    psychologicalTip: string;
    marketComparison: {
      startDate: string;
      endDate: string;
      stockReturn: number;
      kospiReturn: number;
      relativeReturn: number;
    };
    newsCount: number;
    latestNewsAt: string | null;
    generatedAt: string;
  }

  const [conclusion, setConclusion] = useState<FinalConclusionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchConclusion = async () => {
      setLoading(true);
      setError(null);
      setConclusion(null);

      try {
        const response = await fetch(
          `/api/ai/final-conclusion/${stock.code}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: FinalConclusionResponse = await response.json();

        if (!controller.signal.aborted) {
          setConclusion(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('AI 최종 분석 결과를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchConclusion();

    return () => controller.abort();
  }, [stock.code]);

  const badgeLabels: Record<string, string> = {
    positive: '긍정',
    neutral: '중립',
    negative: '부정',
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'negative':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'neutral':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'positive':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case '관망 추천':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case '분할 매수 추천':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case '적극 매수':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
        Gemini AI가 최종 분석 결과를 불러오는 중입니다...
      </div>
    );
  }

  if (error || !conclusion) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-rose-600">
        {error || '분석 결과가 없습니다.'}
      </div>
    );
  }

  const comparison = conclusion.marketComparison;

  return (
    <div className="w-full bg-gradient-to-br from-white via-slate-50 to-blue-50/40 rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              AI 최종 분석 결론 & 투자 가이드
            </h3>
            <p className="text-xs text-slate-600">
              {stock.name} ({stock.code}) · 최근 7일 뉴스 {conclusion.newsCount}건
            </p>
          </div>
        </div>

        <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${getBadgeStyle(conclusion.badge)}`}>
          {badgeLabels[conclusion.badge] || conclusion.badge || '분석 완료'}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {conclusion.guidance || '종합 분석 내용이 없습니다.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-bold">핵심 분석 요인</span>
            </div>
            {conclusion.keyFactors?.length ? (
              conclusion.keyFactors.map((factor, index) => (
                <p key={index} className="mb-1 text-slate-700">
                  • {factor}
                </p>
              ))
            ) : (
              <p className="text-slate-500">분석 요인이 없습니다.</p>
            )}
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">투자 심리 조언</span>
            </div>
            <p className="text-slate-700">
              {conclusion.psychologicalTip || '제공된 조언이 없습니다.'}
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="font-bold">위험 요인</span>
            </div>
            {conclusion.riskFactors?.length ? (
              conclusion.riskFactors.map((risk, index) => (
                <p key={index} className="mb-1 text-slate-700">
                  • {risk}
                </p>
              ))
            ) : (
              <p className="text-slate-500">위험 요인 정보가 없습니다.</p>
            )}
          </div>
        </div>

        {comparison && (
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              KOSPI 대비 수익률 비교
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              시장 비교 기간: {comparison.startDate} ~ {comparison.endDate} (뉴스 분석 기간: 최근 7일)
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-500">종목 수익률</p>
                <p className="text-sm font-bold">
                  {comparison.stockReturn.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">KOSPI 수익률</p>
                <p className="text-sm font-bold">
                  {comparison.kospiReturn.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">상대 수익률</p>
                <p className="text-sm font-bold text-blue-600">
                  {comparison.relativeReturn > 0 ? '+' : ''}
                  {comparison.relativeReturn.toFixed(2)}%p
                </p>
              </div>
            </div>
          </div>
        )}

        {conclusion.newsCount === 0 && (
          <p className="text-xs text-amber-700">
            분석된 뉴스가 없어 뉴스 기반 판단이 제한될 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
};

// Legacy wrapper if imported as NewsSummaryCard
export const NewsSummaryCard: React.FC<{ stock: StockData }> = ({ stock }) => {
  return (
    <div className="space-y-4">
      <NewsThreeLineSummary stock={stock} />
      <FinalConclusionCard stock={stock} />
    </div>
  );
};