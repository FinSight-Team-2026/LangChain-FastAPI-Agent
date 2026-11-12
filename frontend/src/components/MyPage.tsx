import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Trash2, CheckCircle2, AlertTriangle, Key, Lock } from 'lucide-react';

interface MyPageProps {
  onBackToDashboard: () => void;
  userAvatarUrl?: string;
  onWithdrawSuccess?: () => void;
  userName?: string;
  userEmail?: string;
  onUpdateUser?: (name: string, email: string) => void;
}

const API_BASE_URL = (import.meta.env.VITE_AI_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const MyPage: React.FC<MyPageProps> = ({
  onBackToDashboard,
  userAvatarUrl = '',
  onWithdrawSuccess,
  userName = '',
  userEmail = '',
  onUpdateUser,
}) => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || userName);
  const [email, setEmail] = useState(user?.email || userEmail);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const [saveToast, setSaveToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 회원탈퇴 모달 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawComplete, setWithdrawComplete] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const targetUsername = user?.email || email;

    try {
      const response = await fetch(
        `${API_BASE_URL}/update?username=${encodeURIComponent(targetUsername)}&newNickname=${encodeURIComponent(name.trim())}`
      );
      const resultText = await response.text();
      if (!response.ok || resultText.includes('실패')) {
        setErrorMsg(resultText || '회원정보 수정에 실패했습니다.');
        return;
      }

      if (onUpdateUser) onUpdateUser(name.trim(), targetUsername);
      if (updateUser) updateUser(name.trim(), targetUsername);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {
      setErrorMsg('서버 연결에 실패했습니다.');
    }
  };

  const handleConfirmWithdraw = async () => {
    setWithdrawError(null);
    const targetUsername = user?.email || email;

    if (!withdrawPassword) {
      setWithdrawError('본인 확인을 위해 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/delete?username=${encodeURIComponent(targetUsername)}&password=${encodeURIComponent(withdrawPassword)}`
      );
      const resultText = await response.text();
      if (!response.ok || resultText.includes('실패')) {
        setWithdrawError(resultText || '회원 탈퇴에 실패했습니다.');
        return;
      }

      setWithdrawComplete(true);
      setTimeout(() => {
        logout();
        onBackToDashboard();
      }, 1200);
      setTimeout(() => {
        setShowWithdrawModal(false);
        if (onWithdrawSuccess) onWithdrawSuccess();
      }, 1500);
    } catch {
      setWithdrawError('서버 연결에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-sm">

      {/* 1. 마이페이지 타이틀 영역 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          마이페이지
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          회원정보와 계정 설정을 관리할 수 있어요.
        </p>
      </div>

      {/* 저장 완료 알림 토스트 */}
      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>회원정보가 성공적으로 수정되었습니다!</span>
        </div>
      )}

      {/* 에러 알림 */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-700">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. 회원정보 수정 카드 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">회원정보 수정</h3>
            <p className="text-xs sm:text-sm text-slate-500">닉네임을 변경하여 서버 계정에 반영할 수 있습니다.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">이름 (닉네임)</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">이메일 주소 (아이디)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                readOnly
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-xs shadow-blue-500/20 cursor-pointer"
            >
              변경사항 저장
            </button>
          </div>
        </form>
      </div>

      {/* 3. 보안 안내 카드 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">계정 보안</h3>
            <p className="text-xs sm:text-sm text-slate-500">BCrypt 암호화 및 JWT 인증 적용됨</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-blue-900 leading-relaxed font-medium">
            Spring Boot 인증 서버와 연동되어 있으며, 비밀번호는 BCrypt 단방향 해시로 암호화되어 안전하게 보호됩니다.
          </p>
        </div>
      </div>

      {/* 4. 회원탈퇴 카드 */}
      <div className="bg-white rounded-2xl border border-rose-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">회원탈퇴</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                탈퇴하면 서버 DB의 회원정보와 브라우저의 관심 종목이 모두 삭제됩니다.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setWithdrawPassword('');
              setWithdrawError(null);
              setShowWithdrawModal(true);
            }}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            {withdrawComplete ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">회원탈퇴가 완료되었습니다</h3>
                <p className="text-xs sm:text-sm text-slate-500">그동안 MoodON을 이용해주셔서 감사합니다.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-rose-600 mb-2 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>정말 회원탈퇴를 진행하시겠습니까?</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                  서버 데이터베이스의 모든 계정 정보가 즉시 삭제되며 복구할 수 없습니다. 본인 확인을 위해 비밀번호를 입력해 주세요.
                </p>

                <div className="mb-4">
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={withdrawPassword}
                      onChange={(e) => setWithdrawPassword(e.target.value)}
                      placeholder="현재 비밀번호 입력"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  {withdrawError && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600">{withdrawError}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmWithdraw}
                    className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    탈퇴 확정
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
