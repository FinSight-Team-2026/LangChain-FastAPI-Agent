import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// src 폴더 안에 있는 Logo.png를 안전하게 불러옵니다
import logoImage from '../Logo.png'; 
// 만약 src/assets 폴더 안에 넣으셨다면 위 경로를 import logoImage from '../assets/Logo.png'; 로 수정해주세요!

interface HeaderProps {
  activeTab: 'dashboard' | 'watchlist' | 'news-lab';
  setActiveTab: (tab: 'dashboard' | 'watchlist' | 'news-lab') => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  setActiveTab,
  onOpenAuth,
}) => {
  const { currentUser, isLoggedIn, logout, watchlist } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 text-left group"
          >
            {/* 불러온 Logo.png를 동그랗게 적용 */}
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-slate-200 shrink-0 group-hover:scale-105 transition-transform bg-slate-50">
              <img 
                src={logoImage} 
                alt="Mood ON 로고" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900">Mood ON?</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">오늘 시장의 실시간 뉴스 리포트</p>
            </div>
          </button>
        </div>

        {/* Right Action: Auth Only */}
        <div className="flex items-center gap-3">
          {/* User Auth Button */}
          {isLoggedIn && currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400">관심 {watchlist.length}개 종목</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="로그아웃"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm hover:shadow"
            >
              로그인 / 회원가입
            </button>
          )}
        </div>
      </div>
    </header>
  );
};