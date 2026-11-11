import React, { useState } from 'react';
import { STOCKS_DATA } from './data/stocks';
import { Header } from './components/Header';
import { DesktopDashboard } from './components/DesktopDashboard';
import { MyPage } from './components/MyPage';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'mypage'>('dashboard');
  const [selectedStockId, setSelectedStockId] = useState<string>('NAVER');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const selectedStock = STOCKS_DATA[selectedStockId] || STOCKS_DATA.NAVER;

  const openMyPage = () => {
    if (isLoggedIn) setCurrentTab('mypage');
    else setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      <Header
        onGoDashboard={() => setCurrentTab('dashboard')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMyPage={openMyPage}
      />
      <main className="flex-1">
        {currentTab === 'mypage' && isLoggedIn ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <MyPage onBack={() => setCurrentTab('dashboard')} />
          </div>
        ) : (
          <DesktopDashboard
            selectedStock={selectedStock}
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
