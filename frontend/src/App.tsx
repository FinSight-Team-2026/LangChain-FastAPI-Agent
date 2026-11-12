import React, { useState, useEffect } from 'react';
import { STOCKS_DATA } from './data/stocks';
import { Header } from './components/Header';
import { DesktopDashboard } from './components/DesktopDashboard';
import { MyPage } from './components/MyPage';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

const API_BASE = 'http://localhost:8080/api';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'mypage'>('dashboard');
  const [selectedStockId, setSelectedStockId] = useState<string>('NAVER');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isLoggedIn, user } = useAuth();

  const baseStock = STOCKS_DATA[selectedStockId] || STOCKS_DATA.NAVER;
  const [liveStock, setLiveStock] = useState<any>(baseStock);

  useEffect(() => {
    const currentBase = STOCKS_DATA[selectedStockId] || STOCKS_DATA.NAVER;
    setLiveStock(currentBase);

    const code = currentBase.code;
    if (!code) return;

    let cancelled = false;
    async function fetchLiveStockData() {
      const [detailRes, sentRes, newsRes, concRes, pricesRes, sentDailyRes, kospiRes] = await Promise.allSettled([
        fetch(`${API_BASE}/stocks/${code}/detail`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/ai/sentiment-stats/${code}`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/stocks/${code}/news?limit=5`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/ai/final-conclusion/${code}`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/stocks/${code}/prices/daily`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/stocks/${code}/sentiment/daily`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/stocks/kospi`).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (cancelled) return;

      const detail = detailRes.status === 'fulfilled' ? detailRes.value : null;
      const sent = sentRes.status === 'fulfilled' ? sentRes.value : null;
      const newsData = newsRes.status === 'fulfilled' ? newsRes.value : null;
      const conc = concRes.status === 'fulfilled' ? concRes.value : null;
      const dailyPrices = pricesRes.status === 'fulfilled' ? pricesRes.value : null;
      const dailySentiments = sentDailyRes.status === 'fulfilled' ? sentDailyRes.value : null;
      const kospiData = kospiRes.status === 'fulfilled' ? kospiRes.value : null;

      setLiveStock((prev: any) => {
        const updated = { ...prev };

        // 1. 실시간 상세 시세 반영
        if (detail) {
          const livePrice = detail.price ?? detail.currentPrice ?? detail.quote?.currentPrice;
          const liveChange = detail.change ?? detail.changePrice ?? detail.quote?.changePrice;
          const liveRate = detail.changePercent ?? detail.changeRate ?? detail.quote?.changeRate;

          if (livePrice != null) {
            updated.price = livePrice;
            updated.quote = { ...(prev.quote || {}), currentPrice: livePrice };
          }
          if (liveChange != null) {
            updated.change = liveChange;
            updated.quote = { ...(updated.quote || prev.quote || {}), changePrice: liveChange };
          }
          if (liveRate != null) {
            updated.changeRate = liveRate;
            updated.quote = { ...(updated.quote || prev.quote || {}), changeRate: liveRate };
          }
          if (detail.sentimentScore != null) updated.sentimentScore = detail.sentimentScore;
        }

        // 2. AI 감성 통계 반영
        if (sent) {
          const b = sent.breakdown || sent;
          if (b.positive != null) {
            updated.sentimentBreakdown = {
              positive: b.positive ?? prev.sentimentBreakdown?.positive ?? 50,
              neutral: b.neutral ?? prev.sentimentBreakdown?.neutral ?? 30,
              negative: b.negative ?? prev.sentimentBreakdown?.negative ?? 20,
            };
          }
          if (sent.score != null) updated.sentimentScore = sent.score;
        }

        // 3. AI 뉴스 요약 반영
        const rawNews = newsData?.news || newsData?.items;
        if (Array.isArray(rawNews) && rawNews.length > 0) {
          const mappedNews = rawNews.map((item: any, idx: number) => ({
            id: String(item.id ?? idx + 1),
            title: item.title || '관련 뉴스',
            source: item.press || item.source || '뉴스',
            timeAgo: item.timeAgo || item.publishedAt || '최근',
            sentiment: item.sentiment || 'neutral',
            sentimentLabel:
              item.sentimentLabel ||
              (item.sentiment === 'positive' ? '호재' : item.sentiment === 'negative' ? '리스크' : '이슈'),
            summary: item.summary || item.description || '',
          }));
          updated.news = mappedNews;
          updated.newsSummary3Lines = mappedNews.slice(0, 3);
        }

        // 4. AI 최종 결론 반영
        if (conc && typeof conc.conclusion === 'string' && conc.conclusion.trim().length > 0) {
          updated.finalConclusion = {
            badge: conc.badge || prev.finalConclusion?.badge || '관망 추천',
            guidance: conc.conclusion,
            targetSupport: conc.targetSupport || prev.finalConclusion?.targetSupport || '주요 지지선 모니터링',
            psychologicalTip: conc.psychologicalTip || prev.finalConclusion?.psychologicalTip || '분할 접근을 권장합니다.',
          };
        }

        // 5. DB 일별 주가 + 일별 감성 데이터로 차트 곡선(metrics7d & yearlyChartData) 실데이터 교체
        if (Array.isArray(dailyPrices) && dailyPrices.length > 0) {
          const sortedAsc = [...dailyPrices].sort((a, b) =>
            String(a.tradeDate).localeCompare(String(b.tradeDate))
          );

          const sentMap = new Map<string, number>();
          if (Array.isArray(dailySentiments)) {
            dailySentiments.forEach((s: any) => {
              if (s.targetDate != null && s.avgScore != null) {
                // avgScore(-1.0 ~ +1.0) -> 0 ~ 100 스케일 변환
                const normalized = Math.round(Math.max(0, Math.min(100, (Number(s.avgScore) + 1) * 50)));
                sentMap.set(String(s.targetDate), normalized);
              }
            });
          }

          const currentKospi = typeof kospiData?.index === 'number' ? kospiData.index : 2540.3;

          // 최근 7거래일 통합 차트 (metrics7d) - DB 실측 포인트 간 선형 보간 적용
          const recent7 = sortedAsc.slice(-7);
          const knownSorted = Array.from(sentMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
          const todayScore = updated.sentimentScore ?? (knownSorted.length > 0 ? knownSorted[knownSorted.length - 1][1] : 60);

          const getInterpolatedScore = (dateStr: string, idx: number, total: number) => {
            if (idx === total - 1 && updated.sentimentScore != null) return updated.sentimentScore;
            if (sentMap.has(dateStr)) return sentMap.get(dateStr)!;
            if (knownSorted.length === 0) return todayScore;

            let prevEntry: [string, number] | null = null;
            let nextEntry: [string, number] | null = null;
            for (const entry of knownSorted) {
              if (entry[0] < dateStr) prevEntry = entry;
              else if (entry[0] > dateStr && !nextEntry) nextEntry = entry;
            }
            if (prevEntry && nextEntry) {
              const t0 = new Date(prevEntry[0]).getTime();
              const t1 = new Date(nextEntry[0]).getTime();
              const tc = new Date(dateStr).getTime();
              const ratio = t1 > t0 ? (tc - t0) / (t1 - t0) : 0.5;
              return Math.round(prevEntry[1] + (nextEntry[1] - prevEntry[1]) * ratio);
            }
            if (prevEntry) return prevEntry[1];
            if (nextEntry) return nextEntry[1];
            return todayScore;
          };

          updated.metrics7d = recent7.map((p: any, idx: number) => {
            const dStr = String(p.tradeDate || '');
            const parts = dStr.split('-');
            const dayLabel = parts.length === 3 ? `${parts[1]}.${parts[2]}` : dStr;
            const fullDate = dStr.replace(/-/g, '.');
            return {
              day: dayLabel,
              fullDate,
              sentimentScore: getInterpolatedScore(dStr, idx, recent7.length),
              stockPrice: Number(p.closePrice ?? updated.price ?? 0),
              kospiIndex: currentKospi,
            };
          });

          // 1년/전체 일별 캔들 차트 (yearlyChartData)
          updated.yearlyChartData = sortedAsc.map((p: any) => {
            const dStr = String(p.tradeDate || '');
            const parts = dStr.split('-');
            const shortLabel = parts.length === 3 ? `${parts[1]}.${parts[2]}` : dStr;
            return {
              date: dStr.replace(/-/g, '.'),
              label: shortLabel,
              open: Number(p.openPrice ?? p.closePrice ?? 0),
              high: Number(p.highPrice ?? p.closePrice ?? 0),
              low: Number(p.lowPrice ?? p.closePrice ?? 0),
              close: Number(p.closePrice ?? 0),
              volume: Number(p.volume ?? 0),
            };
          });
        }

        return updated;
      });
    }

    fetchLiveStockData();
    return () => {
      cancelled = true;
    };
  }, [selectedStockId]);

  const openMyPage = () => {
    if (isLoggedIn) setCurrentTab('mypage');
    else setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'mypage') {
            openMyPage();
          } else if (tab === 'dashboard') {
            setCurrentTab('dashboard');
          }
        }}
        isLoggedIn={isLoggedIn}
        userName={user?.name || '사용자'}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      <main className="flex-1">
        {currentTab === 'mypage' && isLoggedIn ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <MyPage onBackToDashboard={() => setCurrentTab('dashboard')} />
          </div>
        ) : (
          <DesktopDashboard
            selectedStock={liveStock}
            onSelectStock={(id) => setSelectedStockId(id)}
          />
        )}
      </main>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-extrabold text-slate-900">Mood <span className="text-blue-600">ON?</span></span>
          <span>본 서비스의 분석 지표는 투자 참고용이며 최종 투자 결정 및 책임은 투자자 본인에게 있습니다.</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
