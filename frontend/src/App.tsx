import React, { useState, useEffect } from 'react';
import { STOCKS_DATA } from './data/stocks';
import { Header } from './components/Header';
import { DesktopDashboard } from './components/DesktopDashboard';
import { MyPage } from './components/MyPage';
import { AuthScreens } from './components/AuthScreens';
import { Stock } from './types/stock';

const CODE_MAP: Record<string, string> = {
  'NAVER': '035420',
  '035420': '035420',
  '삼성전자': '005930',
  '005930': '005930',
  '삼성전기': '009150',
  '009150': '009150',
  'SK하이닉스': '000660',
  '000660': '000660',
  '카카오': '035720',
  '035720': '035720',
  '현대차': '005380',
  '005380': '005380',
  'HYUNDAI_MOTORS': '005380'
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'mypage' | 'auth'>('dashboard');
  const [selectedStockId, setSelectedStockId] = useState<string>('035420');

  // 실시간 5대 종목 데이터를 담을 상태 (초기값은 목업)
  const [stocksMap, setStocksMap] = useState<Record<string, Stock>>(STOCKS_DATA);

  const initialStock = stocksMap[selectedStockId] || Object.values(stocksMap)[0];
  const [currentStockData, setCurrentStockData] = useState<Stock>(initialStock);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const userAvatarUrl = '/src/assets/images/avatar_hyunji_hs_1794271999271.jpg';

  // 1. 페이지 로드 시 백엔드 /api/dashboard 호출하여 퀵 셀렉터 실시간 시세 동기화
  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.stocks) {
          const updatedStocks = { ...STOCKS_DATA };
          data.stocks.forEach((summary: any) => {
            // 종목 코드 매칭하여 실시간 가격 및 등락률 덮어쓰기
            Object.keys(updatedStocks).forEach((key) => {
              if (updatedStocks[key].code === summary.stockCode) {
                updatedStocks[key] = {
                  ...updatedStocks[key],
                  sentimentScore: summary.sentimentScore,
                  quote: {
                    ...updatedStocks[key].quote,
                    currentPrice: summary.currentPrice,
                    changeRate: summary.changeRate,
                  }
                };
              }
            });
          });
          setStocksMap(updatedStocks);
        }
      })
      .catch((err) => console.warn('대시보드 API 연동 실패, 목업 유지:', err));
  }, []);

  // 2. 종목 상세 API 연동
  useEffect(() => {
    const code = CODE_MAP[selectedStockId] || selectedStockId;
    if (stocksMap[selectedStockId]) {
      setCurrentStockData(stocksMap[selectedStockId]);
    }

    fetch(`http://localhost:8080/api/stocks/${code}/detail`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data: Stock) => {
        if (data && data.quote) {
          setCurrentStockData(data);
        }
      })
      .catch((err) => {
        console.warn('백엔드 상세 API 연동 실패:', err);
      });
  }, [selectedStockId, stocksMap]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'mypage' && !isLoggedIn) {
            setAuthMode('login');
            setCurrentTab('auth');
            return;
          }
          setCurrentTab(tab);
        }}
        userAvatarUrl={userAvatarUrl}
        isLoggedIn={isLoggedIn}
        userName="김상원"
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setCurrentTab('auth');
        }}
      />

      <main className="flex-1">
        {currentTab === 'mypage' && isLoggedIn ? (
          <MyPage
            onBackToDashboard={() => setCurrentTab('dashboard')}
            userAvatarUrl={userAvatarUrl}
            onWithdrawSuccess={() => { setIsLoggedIn(false); setCurrentTab('dashboard'); }}
          />
        ) : currentTab === 'auth' ? (
          <AuthScreens
            mode={authMode}
            onSwitchMode={(newMode) => setAuthMode(newMode)}
            onSuccess={() => { setIsLoggedIn(true); setCurrentTab('dashboard'); }}
          />
        ) : (
          <DesktopDashboard
            selectedStock={currentStockData}
            onSelectStock={(id) => setSelectedStockId(id)}
            stocksData={stocksMap} // 실시간 데이터 전달
          />
        )}
      </main>
    </div>
  );
}