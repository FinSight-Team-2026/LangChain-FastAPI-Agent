import React, { useState } from 'react';
import { Header } from './components/Header';
import { RankingSection } from './components/RankingSection';
import { WatchlistSection } from './components/WatchlistSection';
import { SentimentComparison } from './components/SentimentComparison';
import { NewsLabSection } from './components/NewsLabSection';
import { StockDetailModal } from './components/StockDetailModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MOCK_STOCKS, MARKET_INDICES } from './data/mockStocks';
import { Stock } from './types/stock';
import { Sparkles, ArrowUpRight, Flame, Star, ChevronRight } from 'lucide-react';
import { formatPrice, formatChangeRate, getPriceColorClass, getSentimentMeta } from './utils/formatters';

const DashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watchlist' | 'news-lab'>('dashboard');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const { watchlist } = useAuth();
  const watchedStocks = MOCK_STOCKS.filter((s) => watchlist.includes(s.id));

  // Key highlight cards on dashboard
  const topSentimentStock = [...MOCK_STOCKS].sort((a, b) => b.sentimentScore - a.sentimentScore)[0];
  const topSurgeStock = [...MOCK_STOCKS].sort((a, b) => b.volumeSurgeRate - a.volumeSurgeRate)[0];

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#191F28] flex flex-col">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setShowComparison(false);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Highlight Insights Bar on Dashboard tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Market Sentiment Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  오늘의 시장 AI 감성 평균
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-blue-600 num-font">
                    {MARKET_INDICES.aiSentimentAverage}점
                  </span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                    상승 우호적
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  반도체 및 전력기기 업종에 긍정적 기사 집중
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            {/* Top Sentiment Stock Card */}
            <div
              onClick={() => setSelectedStock(topSentimentStock)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all group"
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  AI 감성 1위 종목
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {topSentimentStock.name}
                  </span>
                  <span className="text-xs font-bold text-[#F04452] num-font">
                    {topSentimentStock.sentimentScore}점
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[180px]">
                  {topSentimentStock.sentimentSummary[0]}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#F04452] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            {/* Volume Surge Stock Card */}
            <div
              onClick={() => setSelectedStock(topSurgeStock)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all group"
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  거래량 최대 급증주
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {topSurgeStock.name}
                  </span>
                  <span className="text-xs font-bold text-red-600 num-font">
                    +{topSurgeStock.volumeSurgeRate}% 폭증
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[180px]">
                  {formatPrice(topSurgeStock.price)} ({formatChangeRate(topSurgeStock.changeRate)})
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Real-time Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 상단 TOP 10 Ranking Section */}
            <div className="w-full">
              <RankingSection
                stocks={MOCK_STOCKS}
                onSelectStock={(stock) => setSelectedStock(stock)}
              />
            </div>

            {/* Lower: 내 관심 종목 (너비를 넓혀 가로 스크롤 시 시인성 강화) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">내 관심 종목</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold num-font">
                      {watchedStocks.length}개 종목
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                  </p>
                </div>
              </div>

              {watchedStocks.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Star className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">등록된 관심 종목이 없습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    상단 TOP 10 순위에서 별(★)을 눌러 자주 보는 종목을 관심 종목으로 등록해보세요.
                  </p>
                </div>
              ) : (
                /* 가로 스크롤 컨테이너 (최소 너비를 350px로 키워 정보가 시원하게 보이도록 설정) */
                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  {watchedStocks.map((stock) => {
                    const meta = getSentimentMeta(stock.sentimentScore);
                    const latestNews = stock.news[0];

                    return (
                      <div
                        key={stock.id}
                        onClick={() => setSelectedStock(stock)}
                        className="min-w-[340px] max-w-[360px] p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-slate-50/40 hover:bg-white flex flex-col justify-between shrink-0 group"
                      >
                        <div>
                          {/* Stock header */}
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {stock.name}
                                </span>
                                <span className="text-xs text-slate-400 num-font">{stock.code}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-slate-900 num-font">
                                  {formatPrice(stock.price)}
                                </span>
                                <span className={`text-xs font-semibold num-font ${getPriceColorClass(stock.changeRate)}`}>
                                  {formatChangeRate(stock.changeRate)}
                                </span>
                              </div>
                            </div>

                            {/* Sentiment badge */}
                            <div className={`px-2.5 py-1.5 rounded-xl ${meta.bgColor} text-right shrink-0 border ${meta.borderColor}`}>
                              <span className={`text-sm font-black num-font ${meta.textColor}`}>
                                {stock.sentimentScore}점
                              </span>
                              <div className="text-[10px] font-semibold text-slate-600">{meta.label}</div>
                            </div>
                          </div>

                          {/* Sentiment Ratio Micro Bar */}
                          <div className="my-3.5">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span className="text-[#F04452] font-medium">긍정 {stock.sentimentBreakdown.positive}%</span>
                              <span className="text-slate-500 font-medium">중립 {stock.sentimentBreakdown.neutral}%</span>
                              <span className="text-[#3182F6] font-medium">부정 {stock.sentimentBreakdown.negative}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div className="bg-[#F04452]" style={{ width: `${stock.sentimentBreakdown.positive}%` }} />
                              <div className="bg-slate-300" style={{ width: `${stock.sentimentBreakdown.neutral}%` }} />
                              <div className="bg-[#3182F6]" style={{ width: `${stock.sentimentBreakdown.negative}%` }} />
                            </div>
                          </div>

                          {/* Article Summary Box */}
                          {latestNews && (
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="font-semibold text-slate-600">{latestNews.source}</span>
                                <span className="shrink-0">{latestNews.publishedAt}</span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {latestNews.title}
                              </h5>
                              <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                                {latestNews.snippet}
                              </p>
                            </div>
                          )}

                          {/* AI Reasoning 1-liner */}
                          <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-600 bg-blue-50/50 p-2 rounded-lg">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1 font-medium">{stock.sentimentSummary[0]}</span>
                          </div>
                        </div>

                        {/* Card bottom click prompt */}
                        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:underline">
                          <span>AI 뉴스 상세 분석 보기</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Watchlist & Sentiment Comparison */}
        {activeTab === 'watchlist' && (
          <div>
            {showComparison ? (
              <div className="space-y-4">
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit"
                >
                  <span>← 관심 종목 목록으로 돌아가기</span>
                </button>
                <SentimentComparison
                  stocks={watchedStocks}
                  onSelectStock={(stock) => setSelectedStock(stock)}
                  onBackToWatchlist={() => setShowComparison(false)}
                />
              </div>
            ) : (
              <WatchlistSection
                allStocks={MOCK_STOCKS}
                onSelectStock={(stock) => setSelectedStock(stock)}
                onOpenSearch={() => setIsSearchOpen(true)}
                onViewComparison={() => setShowComparison(true)}
              />
            )}
          </div>
        )}

        {/* Tab 3: AI News Lab */}
        {activeTab === 'news-lab' && (
          <NewsLabSection
            stocks={MOCK_STOCKS}
            onOpenStockModal={(stock) => setSelectedStock(stock)}
          />
        )}
      </main>

      {/* Global Modals */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        stocks={MOCK_STOCKS}
        onSelectStock={(stock) => setSelectedStock(stock)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FinSight</span>
          </div>

         <p className="text-center sm:text-right text-[11px] text-slate-400 max-w-lg leading-relaxed">
  본 서비스는 공공 증권 뉴스 및 미디어 기사를 기반으로 한 알고리즘 분석 결과이며, 투자 권유가 아닙니다.
  <br />
  모든 투자의 손익 책임은 투자자 본인에게 있습니다.
</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardContent />
      </ToastProvider>
    </AuthProvider>
  );
}