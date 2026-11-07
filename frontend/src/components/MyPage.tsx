import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface MyPageProps {
  onBack: () => void;
}

export const MyPage: React.FC<MyPageProps> = ({ onBack }) => {
  const { currentUser, watchlist, updateProfile, deleteAccount } = useAuth();
  const { showToast } = useToast();
  
  // 백엔드 UserController 규격(username, newNickname)에 맞추기 위해 name을 닉네임으로 사용합니다.
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [password, setPassword] = useState(''); // 회원탈퇴 시 필요한 비밀번호 입력용
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setName(currentUser?.name ?? '');
    setEmail(currentUser?.email ?? '');
  }, [currentUser]);

  // 1. 회원 정보 수정 (백엔드 /update 연동)
  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      showToast('이름과 이메일을 모두 입력해주세요.', 'error');
      return;
    }

    try {
      // 현재 로그인한 사용자의 email(username)을 기준으로 백엔드 /update 호출
      const targetUsername = currentUser?.email || trimmedEmail;
      const response = await fetch(
        `http://localhost:8080/update?username=${encodeURIComponent(targetUsername)}&newNickname=${encodeURIComponent(trimmedName)}`
      );

      const resultText = await response.text();
      if (!response.ok || resultText.includes('실패')) {
        showToast(resultText || '회원정보 수정 실패', 'error');
        return;
      }

      updateProfile(trimmedName, trimmedEmail);
      showToast('회원정보가 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('서버 통신 중 오류가 발생했습니다.', 'error');
    }
  };

  // 2. 회원 탈퇴 (백엔드 /delete 연동)
  const handleDeleteAccount = async () => {
    try {
      const targetUsername = currentUser?.email || email;
      
      // 백엔드 탈퇴 API는 password를 요구하므로 간단한 확인용 비밀번호를 받거나 처리합니다.
      // 여기서는 예시로 비밀번호 입력창 값을 넘기도록 처리합니다.
      const response = await fetch(
        `http://localhost:8080/delete?username=${encodeURIComponent(targetUsername)}&password=${encodeURIComponent(password)}`
      );

      const resultText = await response.text();
      if (!response.ok || resultText.includes('실패')) {
        showToast(resultText || '회원탈퇴 실패 (비밀번호를 확인해주세요)', 'error');
        return;
      }

      deleteAccount();
      showToast('회원탈퇴가 완료되었습니다.');
      onBack();
    } catch (error) {
      console.error('Failed to delete account:', error);
      showToast('서버 통신 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="대시보드로 돌아가기"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">마이페이지</h1>
          <p className="mt-1 text-sm text-slate-500">회원정보와 계정 설정을 관리할 수 있어요.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">회원정보 수정</h2>
            <p className="mt-0.5 text-xs text-slate-500">이름과 이메일 주소를 변경할 수 있습니다.</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">이름 (닉네임)</span>
            <span className="relative block">
              <UserRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={50}
                required
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-hidden transition-colors focus:border-blue-500"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">이메일 주소 (아이디)</span>
            <span className="relative block">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-hidden transition-colors focus:border-blue-500"
              />
            </span>
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-400">관심 종목 {watchlist.length}개</p>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              변경사항 저장
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-2xs sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-slate-900">회원탈퇴</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              탈퇴하면 계정 정보가 DB에서 완전히 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            {!isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="mt-4 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
              >
                회원탈퇴
              </button>
            ) : (
              <div className="mt-4 space-y-3 rounded-xl bg-rose-50 p-4">
                <p className="text-sm font-bold text-rose-800">정말 탈퇴하시겠어요? 비밀번호를 입력해주세요.</p>
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm outline-hidden focus:border-rose-500"
                  required
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-rose-700"
                  >
                    탈퇴하고 정보 삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};