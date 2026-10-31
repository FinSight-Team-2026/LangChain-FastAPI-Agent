import React, { useState } from 'react';
import { X, Sparkles, User, Lock, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, signup, quickDemoLogin } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }

    if (mode === 'login') {
      login(email, name || undefined);
      showToast(`${email.split('@')[0]}님, 환영합니다!`);
    } else {
      if (!name) {
        showToast('이름을 입력해주세요.', 'error');
        return;
      }
      signup(email, name);
      showToast(`${name}님의 회원가입이 완료되었습니다!`);
    }
    onClose();
  };

  const handleDemo = () => {
    quickDemoLogin();
    showToast('김토스 님의 체험 계정으로 로그인되었습니다.');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'login' ? 'FinSent 로그인' : 'FinSent 회원가입'}
              </h3>
              <p className="text-[11px] text-slate-500">나만의 주식 관심 종목 및 AI 뉴스 리포트</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-6 pt-4 space-y-5">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Quick 1-click Demo Login Option */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-blue-950">간편 체험 모드</div>
                <div className="text-[11px] text-blue-800/80 mt-0.5">
                  회원가입 없이 1초 만에 테스트 계정(김토스 님)으로 로그인하고 관심종목 기능을 사용해보세요.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemo}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>체험 계정으로 바로 시작하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium absolute">또는</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">이름</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">이메일 주소</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
            >
              {mode === 'login' ? '로그인하기' : '무료 회원가입 완료'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          개인정보 및 관심 종목 정보는 브라우저 로컬 저장소에 안전하게 유지됩니다.
        </div>
      </div>
    </div>
  );
};
