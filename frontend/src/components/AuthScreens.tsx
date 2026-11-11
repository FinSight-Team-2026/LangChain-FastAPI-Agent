import React, { useState } from 'react';
import { TrendingUp, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  mode: 'login' | 'signup';
  onSwitchMode: (mode: 'login' | 'signup') => void;
  onSuccess: () => void;
}

export const AuthScreens: React.FC<AuthScreenProps> = ({
  mode,
  onSwitchMode,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('1년 미만 (초보 투자자)');
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' ? 'MoodON 로그인' : 'MoodON 회원가입'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {mode === 'login'
              ? '감정에 휘둘리지 않는 AI 주식 심리 분석을 시작하세요'
              : '패닉셀을 막아주는 안심 주식 투자 파트너'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                이름 / 닉네임
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  autoComplete="off"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-blue-600 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              이메일 주소
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@example.com"
                autoComplete="off"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-blue-600 focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">
                비밀번호
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                >
                  비밀번호 찾기
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                autoComplete="new-password"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-blue-600 focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                투자 경험 수준
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-blue-600 focus:border-blue-600 transition-colors cursor-pointer"
              >
                <option value="1년 미만 (초보 투자자)">1년 미만 (초보 투자자 - 패닉 디펜스 권장)</option>
                <option value="1년 ~ 3년">1년 ~ 3년 (기본 투자자)</option>
                <option value="3년 이상">3년 이상 (숙련 투자자)</option>
              </select>
            </div>
          )}

          {mode === 'signup' && (
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                MoodON 서비스 이용약관 및 개인정보 처리방침에 동의합니다 (필수)
              </span>
            </label>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600">
                로그인 상태 유지
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-block animate-spin mr-1">⌛</span>
            ) : (
              <>
                <span>{mode === 'login' ? '로그인하기' : '회원가입 완료'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-6 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <>
              아직 MoodON 회원이 아니신가요?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('signup')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                로그인
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};