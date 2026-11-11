import React, { useState } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import logoImage from '../Logo.png';

interface AuthModalProps { isOpen: boolean; onClose: () => void; }

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { showToast('이메일과 비밀번호를 입력해주세요.', 'error'); return; }
    if (mode === 'signup' && !name.trim()) { showToast('이름을 입력해주세요.', 'error'); return; }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        // 기존 Spring Boot 계약: GET /login?username=...&password=...
        const response = await fetch(`http://localhost:8080/login?username=${encodeURIComponent(email.trim())}&password=${encodeURIComponent(password)}`);
        const resultText = await response.text();
        if (!response.ok || resultText.includes('실패')) { showToast(resultText || '로그인 실패', 'error'); return; }
        login(email.trim());
        showToast(`${email.trim().split('@')[0]}님, 환영합니다!`);
      } else {
        const response = await fetch('http://localhost:8080/signup', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email.trim(), password, name: name.trim() }),
        });
        const resultText = await response.text();
        if (!response.ok || resultText.includes('실패')) { showToast(resultText || '회원가입 실패', 'error'); return; }
        signup(email.trim(), name.trim());
        showToast(`${name.trim()}님의 회원가입이 완료되었습니다!`);
      }
      setPassword('');
      onClose();
    } catch (error) {
      console.error(error);
      showToast('서버 통신 중 오류가 발생했습니다.', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="로그인 및 회원가입">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-slate-200 bg-slate-50"><img src={logoImage} alt="Mood ON 로고" className="w-full h-full object-cover" /></div>
            <h3 className="text-base font-bold text-slate-900">{mode === 'login' ? 'Mood ON? 로그인' : 'Mood ON? 회원가입'}</h3>
          </div>
          <button onClick={onClose} aria-label="닫기" className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 pt-4 space-y-5">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>로그인</button>
            <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>회원가입</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">이름</span><span className="relative block"><User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" /><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500" required /></span></label>}
            <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">이메일 주소</span><span className="relative block"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="investor@example.com" className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500" required /></span></label>
            <label className="block"><span className="block text-xs font-semibold text-slate-700 mb-1">비밀번호</span><span className="relative block"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-blue-500" required /></span></label>
            <button type="submit" disabled={submitting} className="w-full mt-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50">{submitting ? '처리 중...' : mode === 'login' ? '로그인하기' : '무료 회원가입 완료'}</button>
          </form>
        </div>
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">로그인 정보는 현재 브라우저에서 유지됩니다.</div>
      </div>
    </div>
  );
};
