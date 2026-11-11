import React from 'react';
import { BookOpen } from 'lucide-react';

// 주식 초보를 위한 용어 데이터 리스트 (하루에 하나씩 순서대로 갱신)
const stockTerms = [
  {
    title: '패닉셀',
    sub: '(Panic Sell)',
    desc: '공포에 질려 주식을 성급하게 손절하는 행동',
  },
  {
    title: '지지선',
    sub: '(Support Line)',
    desc: '주가가 더 이상 떨어지지 않고 반등할 것으로 기대되는 가격대',
  },
  {
    title: 'PER',
    sub: '(Price Earning Ratio)',
    desc: '주가를 주당순이익으로 나눈 값으로, 기업의 주가 수준을 나타내는 지표',
  },
  {
    title: 'PBR',
    sub: '(Price Book-value Ratio)',
    desc: '주가를 주당순자산가치로 나눈 값으로, 자산 대비 주가 수준을 평가하는 지표',
  },
  {
    title: '시가총액',
    sub: '(Market Capitalization)',
    desc: '발행주식수에 주가를 곱한 값으로, 기업의 전체적인 규모를 뜻함',
  },
];

export const TodayTermBanner: React.FC = () => {
  // 오늘 날짜(일자)를 기반으로 1일에 1개씩 순서대로 인덱스 계산
  const todayIndex = new Date().getDate() % stockTerms.length;
  const currentTerm = stockTerms[todayIndex];

  return (
    <div className="w-full">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">

        {/* 좌측 아이콘 및 용어 정의 영역 */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                오늘의 주식 용어
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base text-slate-900 font-extrabold">{currentTerm.title}</span>
              <span className="text-xs text-slate-700 font-bold">{currentTerm.sub}:</span>
              <span className="text-slate-600 font-medium">{currentTerm.desc}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};