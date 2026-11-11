import React, { useEffect, useState } from 'react';
import { BookOpen, Info, X, Sparkles } from 'lucide-react';

interface TodayTerm {
  date: string;
  term: string;
  description: string;
  source: string;
}

interface TodayTermBannerProps {
  compact?: boolean;
}

const API_BASE_URL = (import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:8001').replace(/\/$/, '');

export const TodayTermBanner: React.FC<TodayTermBannerProps> = ({ compact = false }) => {
  const [term, setTerm] = useState<TodayTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadTerm = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/terms/today`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: TodayTerm = await response.json();
        setTerm(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('오늘의 주식 용어 조회 실패:', err);
        setError('오늘의 주식 용어를 불러오지 못했습니다.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadTerm();
    return () => controller.abort();
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50/60 to-white border border-blue-200/80 rounded-xl shadow-xs p-3.5 sm:p-4 transition-all">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                  오늘의 주식 용어
                </span>
                {term && (
                  <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                    {term.date}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                {loading ? (
                  <span className="text-sm text-slate-600">용어를 불러오는 중...</span>
                ) : error ? (
                  <span role="alert" className="text-sm text-red-600">{error}</span>
                ) : term ? (
                  <>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      {term.term}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 font-semibold">
                      {term.description}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              disabled={!term}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-50/80 border border-blue-200 rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Info className="w-3.5 h-3.5" />
              상세 해설
            </button>
          </div>
        </div>
        {!compact && term && (
          <div className="mt-2.5 pt-2 border-t border-blue-100/80 flex items-center gap-2 text-xs text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <p className="break-words">출처: {term.source}</p>
          </div>
        )}
      </section>

      {showDetailModal && term && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" aria-labelledby="today-term-title" className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowDetailModal(false)}
              aria-label="상세 해설 닫기"
              className="absolute top-4 right-4 p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>MoodON 초보 투자 백과 · {term.date}</span>
            </div>
            <h3 id="today-term-title" className="text-xl font-bold text-slate-900">{term.term}</h3>
            <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
              <div className="text-xs font-semibold text-blue-800 mb-1">핵심 개념 정의</div>
              <p className="text-sm text-slate-800 leading-relaxed">{term.description}</p>
            </div>
            <div className="mt-4 text-xs text-slate-600 break-words">출처: {term.source}</div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
