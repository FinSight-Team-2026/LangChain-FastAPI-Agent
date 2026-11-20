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
  const [allStocksMap, setAllStocksMap] = useState<Record<string, any>>(STOCKS_DATA);

  // 5대 핵심주 퀵 셀렉터용 전체 종목 실시간 시세·감성 일괄 조회
  useEffect(() => {
    let cancelled = false;
    async function fetchAllQuickStocks() {
      const entries = Object.entries(STOCKS_DATA);
      const results = await Promise.allSettled(
        entries.map(async ([key, item]) => {
          const code = item.code;
          const [detailRes, sentRes] = await Promise.allSettled([
            fetch(`${API_BASE}/stocks/${code}/detail`).then((r) => (r.ok ? r.json() : null)),
            fetch(`${API_BASE}/ai/sentiment-stats/${code}`).then((r) => (r.ok ? r.json() : null)),
          ]);
          const detail = detailRes.status === 'fulfilled' ? detailRes.value : null;
          const sent = sentRes.status === 'fulfilled' ? sentRes.value : null;

          const updated = { ...item };
          if (detail) {
            const livePrice = detail.price ?? detail.currentPrice ?? detail.quote?.currentPrice;
            const liveChange = detail.change ?? detail.changePrice ?? detail.quote?.changePrice;
            const liveRate = detail.changePercent ?? detail.changeRate ?? detail.quote?.changeRate;
            if (livePrice != null) {
              updated.price = livePrice;
              updated.quote = { ...(item.quote || {}), currentPrice: livePrice };
            }
            if (liveChange != null) {
              updated.change = liveChange;
              updated.quote = { ...(updated.quote || item.quote || {}), changePrice: liveChange };
            }
            if (liveRate != null) {
              updated.changeRate = liveRate;
              updated.quote = { ...(updated.quote || item.quote || {}), changeRate: liveRate };
            }
            if (detail.sentimentScore != null) updated.sentimentScore = detail.sentimentScore;
          }
          const sScore = sent?.sentimentScore ?? sent?.score;
          if (sScore != null) {
            updated.sentimentScore = sScore;
            updated.sentimentStatus =
              sent?.sentimentStatus || (sScore >= 60 ? '긍정 우세' : sScore <= 40 ? '부정 우세' : '중립');
          }
          return [key, updated] as const;
        })
      );

      if (cancelled) return;
      setAllStocksMap((prev) => {
        const next = { ...prev };
        results.forEach((res) => {
          if (res.status === 'fulfilled') {
            const [k, val] = res.value;
            next[k] = { ...next[k], ...val };
          }
        });
        return next;
      });
    }

    fetchAllQuickStocks();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
        const currentBase = allStocksMap[selectedStockId] || STOCKS_DATA[selectedStockId] || STOCKS_DATA.NAVER;
    setLiveStock(currentBase);

    const code = currentBase.code;
    if (!code) return;

    let cancelled = false;
    async function fetchLiveStockData() {
      const [detailRes, sentRes, newsRes, concRes, pricesRes, sentDailyRes, kospiRes, marketCompareRes] = await Promise.allSettled([
        fetch(`${API_BASE}/stocks/${code}/detail`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/ai/sentiment-stats/${code}`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/stocks/${code}/news?limit=5`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/ai/final-conclusion/${code}`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/stocks/${code}/prices/daily`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/stocks/${code}/sentiment/daily`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/stocks/kospi`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/market/compare/${code}`).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (cancelled) return;

      const detail = detailRes.status === 'fulfilled' ? detailRes.value : null;
      const sent = sentRes.status === 'fulfilled' ? sentRes.value : null;
      const newsData = newsRes.status === 'fulfilled' ? newsRes.value : null;
      const conc = concRes.status === 'fulfilled' ? concRes.value : null;
      const dailyPrices = pricesRes.status === 'fulfilled' ? pricesRes.value : null;
      const dailySentiments = sentDailyRes.status === 'fulfilled' ? sentDailyRes.value : null;
      const kospiData = kospiRes.status === 'fulfilled' ? kospiRes.value : null;
      const marketCompare = marketCompareRes.status === 'fulfilled' ? marketCompareRes.value : null;

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
          const sScore = sent.sentimentScore ?? sent.score;
          if (sScore != null) {
            updated.sentimentScore = sScore;
            updated.sentimentStatus = sScore >= 70 ? '긍정' : sScore >= 45 ? '중립' : '공포';
          }
          const count = sent.totalCount ?? sent.newsCount ?? sent.articleCount;
          if (count != null) {
            (updated as any).analyzedNewsCount = Number(count);
          }
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
            url: item.url || item.link || item.articleUrl || item.originalUrl || item.originallink || item.article_url || '',
          }));
          updated.news = mappedNews;
          updated.newsSummary3Lines = mappedNews.slice(0, 3);
        }

        // 4. AI 최종 결론 및 안심 방어 가이드 반영
        const rawGuidance = conc?.guidance ?? conc?.conclusion;
        if (conc && typeof rawGuidance === 'string' && rawGuidance.trim().length > 0) {
          const badgeMap: Record<string, '관망 추천' | '분할 매수 추천' | '적극 매수'> = {
            positive: '적극 매수',
            bullish: '적극 매수',
            buy: '분할 매수 추천',
            mixed: '분할 매수 추천',
            neutral: '관망 추천',
            negative: '관망 추천',
            bearish: '관망 추천',
          };
          const mappedBadge = badgeMap[String(conc.badge || '').toLowerCase()] || (conc.badge as any) || prev.finalConclusion?.badge || '관망 추천';
          const mc = conc.marketComparison;
          const techSummary = mc && mc.relativeReturn != null
            ? `시장 대비 상대수익률 ${Number(mc.relativeReturn) >= 0 ? '+' : ''}${Number(mc.relativeReturn).toFixed(2)}%p`
            : (Array.isArray(conc.keyFactors) && conc.keyFactors[0] ? conc.keyFactors[0] : prev.finalConclusion?.targetSupport || '주요 지지선 모니터링');

          updated.finalConclusion = {
            badge: mappedBadge,
            guidance: rawGuidance,
            targetSupport: conc.targetSupport || techSummary,
            psychologicalTip: conc.psychologicalTip || prev.finalConclusion?.psychologicalTip || '분할 접근을 권장합니다.',
          };

          if (Array.isArray(conc.keyFactors) && conc.keyFactors.length > 0) {
            updated.panicDefense = {
              ...(prev.panicDefense || {
                isActive: true,
                stockChangePercent: updated.changeRate ?? 0,
                kospiChangePercent: updated.kospiChangePercent ?? 0,
                badgeText: 'AI 분석',
                headline: '',
                recommendation: '',
                defenseType: 'market_rebound',
              }),
              stockChangePercent: updated.changeRate ?? prev.changeRate ?? 0,
              kospiChangePercent: updated.kospiChangePercent ?? prev.kospiChangePercent ?? 0,
              headline: conc.keyFactors[0],
              recommendation: (Array.isArray(conc.riskFactors) && conc.riskFactors[0]) ? conc.riskFactors[0] : (conc.psychologicalTip || prev.panicDefense?.recommendation || ''),
            };
          }
          if (conc.newsCount != null && !(updated as any).analyzedNewsCount) {
            (updated as any).analyzedNewsCount = Number(conc.newsCount);
          }
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

          const kospiByDate = new Map<string, number>();
          if (Array.isArray(marketCompare?.daily)) {
            marketCompare.daily.forEach((d: any) => {
              const raw = String(d.date || '');
              const norm = raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw;
              if (norm && d.kospiIndex != null) kospiByDate.set(norm, Number(d.kospiIndex));
            });
          }
          const latestKospiFromDaily = Array.from(kospiByDate.values()).pop();
          const currentKospi = latestKospiFromDaily ?? (typeof kospiData?.index === 'number' ? kospiData.index : 2540.3);
          updated.kospiIndex = currentKospi;
          if (kospiByDate.size >= 2) {
            const vals = Array.from(kospiByDate.values());
            const prevK = vals[vals.length - 2];
            const lastK = vals[vals.length - 1];
            if (prevK > 0) updated.kospiChangePercent = Number((((lastK - prevK) / prevK) * 100).toFixed(2));
          }

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
              kospiIndex: kospiByDate.get(dStr) ?? currentKospi,
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

        setAllStocksMap((prevMap) => ({
          ...prevMap,
          [selectedStockId]: {
            ...(prevMap[selectedStockId] || {}),
            ...updated,
            sentimentStatus:
              (updated.sentimentScore ?? 50) >= 60
                ? '긍정 우세'
                : (updated.sentimentScore ?? 50) <= 40
                ? '부정 우세'
                : '중립',
          },
        }));

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
            stocksData={allStocksMap}
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
