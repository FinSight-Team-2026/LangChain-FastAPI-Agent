import React, { useState, useEffect } from 'react';
import { STOCKS_DATA } from './data/stocks';
import { Header } from './components/Header';
import { DesktopDashboard } from './components/DesktopDashboard';
import { MyPage } from './components/MyPage';
import { AuthScreens } from './components/AuthScreens';
import { Stock } from './types/stock';

// 종목 키 매핑 (ID 또는 종목명 대응)
const CODE_MAP: Record<string, string> = {
  'NAVER': '035420',
  '035420': '035420',
  '삼성전자': '005930',
  '005930': '005930',
  'SK하이닉스': '000660',
  '000660': '000660',
  '카카오': '035720',
  '035720': '035720',
  '현대차': '005380',
  '005380': '005380'
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'mypage' | 'auth'>('dashboard');
  const [selectedStockId, setSelectedStockId] = useState<string>('035420'); // 기본값 NAVER 종목코드

  // 백엔드 실데이터 상태 (초기값은 목업 fallback)
  const initialStock = STOCKS_DATA[selectedStockId] || STOCKS_DATA['NAVER'] || Object.values(STOCKS_DATA)[0];
  const [currentStockData, setCurrentStockData] = useState<Stock>(initialStock);

  // 로그인/회원가입 상태
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const userAvatarUrl = '/src/assets/images/avatar_hyunji_hs_1794271999271.jpg';

  // 백엔드 /api/stocks/{code}/detail 연동
  useEffect(() => {
    const code = CODE_MAP[selectedStockId] || selectedStockId;
    fetch(`http://localhost:8080/api/stocks/${code}/detail`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data: Stock) => {
        setCurrentStockData(data);
      })
      .catch((err) => {
        console.warn('백엔드 상세 API 연동 실패, 로컬 목업 유지:', err);
      });
  }, [selectedStockId]);

  const handleWithdrawSuccess = () => {
    setIsLoggedIn(false);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      {/* Global Fintech Navigation Header */}
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

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'mypage' && isLoggedIn ? (
          <MyPage
            onBackToDashboard={() => setCurrentTab('dashboard')}
            userAvatarUrl={userAvatarUrl}
            onWithdrawSuccess={handleWithdrawSuccess}
          />
        ) : currentTab === 'auth' ? (
          <AuthScreens
            mode={authMode}
            onSwitchMode={(newMode) => setAuthMode(newMode)}
            onSuccess={() => {
              setIsLoggedIn(true);
              setCurrentTab('dashboard');
            }}
          />
        ) : (
          /* 대시보드 단독 화면 (Desktop Dashboard) */
          <DesktopDashboard
            selectedStock={currentStockData}
            onSelectStock={(id) => setSelectedStockId(id)}
          />
        )}
      </main>
    </div>
  );
}