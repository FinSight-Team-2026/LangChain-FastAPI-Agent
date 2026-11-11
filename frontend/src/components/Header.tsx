import React from 'react';
<<<<<<< HEAD
import { LayoutDashboard, UserCheck, Lock } from 'lucide-react';
import logoImg from '../assets/images/logo.png';

interface HeaderProps {
  currentTab: 'dashboard' | 'mypage' | 'auth';
  onSelectTab: (tab: 'dashboard' | 'mypage' | 'auth') => void;
  userAvatarUrl?: string;
  isLoggedIn?: boolean;
  userName?: string;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userAvatarUrl = '', 
  isLoggedIn = true,
  userName = '김상원',
  onOpenAuth,
}) => {
  const getLastName = (name: string) => {
    return name.slice(0, 1);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Zone (마우스 호버 시 색상 변화 제거 및 고정) */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus-visible:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-xs transition-colors">
                <img
                  src={logoImg}
                  alt="MoodON 로고"
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 transition-colors">
                  Mood<span className="text-blue-600">ON</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                  흔들리지 않는 투자 습관, MoodON
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links: 대시보드 -> 로그인/회원가입 -> 마이페이지 순서 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center gap-1 sm:gap-2">
              {/* 1. 대시보드 버튼 */}
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'text-blue-600 bg-blue-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                대시보드
              </button>

              {/* 2. 로그인 / 회원가입 버튼 (비로그인 시 노출) */}
              {!isLoggedIn && (
                <button
                  onClick={() => (onOpenAuth ? onOpenAuth('login') : onSelectTab('auth'))}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    currentTab === 'auth'
                      ? 'text-blue-600 bg-blue-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Lock className="w-4 h-4 text-blue-600" />
                  로그인 / 회원가입
                </button>
              )}

              {/* 3. 마이페이지 버튼 (항상 노출) */}
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    onOpenAuth ? onOpenAuth('login') : onSelectTab('auth');
                    return;
                  }
                  onSelectTab('mypage');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'mypage'
                    ? 'text-blue-600 bg-blue-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                마이페이지
              </button>
            </nav>

            {/* 로그인 상태일 때 우측 끝에 프로필 표시 */}
            {isLoggedIn && (
              <>
                <div className="h-5 w-px bg-slate-200 mx-1" aria-hidden="true" />
                <button
                  onClick={() => onSelectTab('mypage')}
                  className="flex items-center gap-2.5 p-1 -m-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group"
                  title={`${userName} 마이페이지 바로가기`}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500/20 bg-blue-50 flex items-center justify-center font-bold text-xs text-blue-700">
                    {getLastName(userName)}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-800 leading-tight">
                    {userName}
                  </span>
                </button>
              </>
            )}

          </div>

=======
import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImage from '../Logo.png';

interface HeaderProps {
  onGoDashboard: () => void;
  onOpenAuth: () => void;
  onOpenMyPage: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoDashboard, onOpenAuth, onOpenMyPage }) => {
  const { currentUser, isLoggedIn, logout, watchlist } = useAuth();
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button onClick={onGoDashboard} className="flex items-center gap-3 text-left group">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-slate-200 shrink-0 group-hover:scale-105 transition-transform bg-slate-50">
            <img src={logoImage} alt="Mood ON 로고" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-slate-900">Mood ON?</span>
            <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">오늘 시장의 실시간 뉴스 리포트</p>
          </div>
        </button>
        <div className="flex items-center gap-3">
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
              <button onClick={onOpenMyPage} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <UserRound className="h-4 w-4" />마이페이지
              </button>
              <button onClick={() => { logout(); onGoDashboard(); }} aria-label="로그아웃" title="로그아웃" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button onClick={onOpenMyPage} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <UserRound className="h-4 w-4" />마이페이지
              </button>
              <button onClick={onOpenAuth} className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
                로그인 / 회원가입
              </button>
            </>
          )}
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
        </div>
      </div>
    </header>
  );
};