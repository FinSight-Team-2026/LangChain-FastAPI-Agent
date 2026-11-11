<<<<<<< HEAD
import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Trash2, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

interface MyPageProps {
  onBackToDashboard: () => void;
  userAvatarUrl?: string;
  onWithdrawSuccess?: () => void;
  userName?: string;
  userEmail?: string;
  onUpdateUser?: (name: string, email: string) => void;
}

export const MyPage: React.FC<MyPageProps> = ({
  onBackToDashboard,
  userAvatarUrl = '',
  onWithdrawSuccess,
  userName = '', // 기본값을 빈 값으로 변경
  userEmail = '', // 기본값을 빈 값으로 변경
  onUpdateUser,
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [saveToast, setSaveToast] = useState(false);

  // 회원탈퇴 모달 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawComplete, setWithdrawComplete] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(name, email);
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleConfirmWithdraw = () => {
    setWithdrawComplete(true);
    setTimeout(() => {
      setShowWithdrawModal(false);
      if (onWithdrawSuccess) onWithdrawSuccess();
    }, 1500);
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

      {/* 2. 회원정보 수정 카드 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">회원정보 수정</h3>
            <p className="text-xs sm:text-sm text-slate-500">이름과 이메일 주소를 변경할 수 있습니다.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">이름</label>
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
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">이메일 주소</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-600 transition-colors"
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

      {/* 3. 비밀번호 변경 안내 카드 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">비밀번호 변경</h3>
            <p className="text-xs sm:text-sm text-slate-500">계정 보안을 위한 비밀번호 관리</p>
          </div>
        </div>

        <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            현재 로그인은 브라우저에 저장되는 데모 방식이며 서버 인증 기능이 없습니다. 비밀번호를 안전하게 검증·변경할 수 있도록 인증 서버 연결 후 이용할 수 있습니다.
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
                탈퇴하면 이 브라우저에 저장된 회원정보와 내 관심 종목이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
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
                <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                  브라우저에 저장된 모든 사용자 데이터 및 설정이 즉시 삭제되며 복구할 수 없습니다.
                </p>
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
=======
import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface MyPageProps { onBack: () => void; }

export const MyPage: React.FC<MyPageProps> = ({ onBack }) => {
  const { currentUser, watchlist, updateProfile, deleteAccount } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [password, setPassword] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setName(currentUser?.name ?? ''); }, [currentUser?.name]);

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!currentUser?.email || !trimmedName) { showToast('이름을 입력해주세요.', 'error'); return; }
    setBusy(true);
    try {
      // 기존 /update API는 newNickname만 수정하므로 이메일은 읽기 전용으로 표시
      const response = await fetch(`http://localhost:8080/update?username=${encodeURIComponent(currentUser.email)}&newNickname=${encodeURIComponent(trimmedName)}`);
      const resultText = await response.text();
      if (!response.ok || resultText.includes('실패')) { showToast(resultText || '회원정보 수정 실패', 'error'); return; }
      updateProfile(trimmedName, currentUser.email);
      showToast('회원정보가 수정되었습니다.');
    } catch (error) { console.error(error); showToast('서버 통신 중 오류가 발생했습니다.', 'error'); }
    finally { setBusy(false); }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser?.email || !password) { showToast('비밀번호를 입력해주세요.', 'error'); return; }
    setBusy(true);
    try {
      const response = await fetch(`http://localhost:8080/delete?username=${encodeURIComponent(currentUser.email)}&password=${encodeURIComponent(password)}`);
      const resultText = await response.text();
      if (!response.ok || resultText.includes('실패')) { showToast(resultText || '회원탈퇴 실패 (비밀번호를 확인해주세요)', 'error'); return; }
      deleteAccount();
      showToast('회원탈퇴가 완료되었습니다.');
      onBack();
    } catch (error) { console.error(error); showToast('서버 통신 중 오류가 발생했습니다.', 'error'); }
    finally { setBusy(false); }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="대시보드로 돌아가기" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /></button>
        <div><h1 className="text-xl font-black text-slate-900">마이페이지</h1><p className="mt-1 text-sm text-slate-500">회원정보와 계정 설정을 관리할 수 있어요.</p></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><UserRound className="h-5 w-5" /></div>
          <div><h2 className="font-bold text-slate-900">회원정보 수정</h2><p className="mt-0.5 text-xs text-slate-500">이름(닉네임)을 변경할 수 있습니다.</p></div>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">이름 (닉네임)</span><span className="relative block"><UserRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500" /></span></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">이메일 주소 (아이디)</span><span className="relative block"><Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="email" value={currentUser?.email ?? ''} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-500" /></span><span className="text-[11px] text-slate-400">현재 서버 API는 이메일 변경을 지원하지 않습니다.</span></label>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1"><p className="text-xs text-slate-400">관심 종목 {watchlist.length}개</p><button type="submit" disabled={busy} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">변경사항 저장</button></div>
        </form>
      </div>
      <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-2xs sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle className="h-5 w-5" /></div>
          <div className="flex-1"><h2 className="font-bold text-slate-900">회원탈퇴</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">탈퇴하면 계정 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
            {!isConfirmingDelete ? <button type="button" onClick={() => setIsConfirmingDelete(true)} className="mt-4 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50">회원탈퇴</button> :
              <div className="mt-4 space-y-3 rounded-xl bg-rose-50 p-4"><p className="text-sm font-bold text-rose-800">정말 탈퇴하시겠어요? 비밀번호를 입력해주세요.</p><input type="password" placeholder="비밀번호 확인" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm" /><div className="flex flex-wrap gap-2"><button type="button" disabled={busy || !password} onClick={handleDeleteAccount} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50">탈퇴하고 정보 삭제</button><button type="button" onClick={() => { setIsConfirmingDelete(false); setPassword(''); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">취소</button></div></div>}
>>>>>>> 32d06f6 (feat: AI 분석 파이프라인 및 주식 용어 기능 통합)
          </div>
        </div>
      )}

    </div>
  );
};
