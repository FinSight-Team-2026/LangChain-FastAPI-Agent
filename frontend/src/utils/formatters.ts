export const formatPrice = (price: number): string => {
  return (price || 0).toLocaleString('ko-KR') + '원';
};

export const formatNumber = (num: number): string => {
  return (num || 0).toLocaleString('ko-KR');
};

export const formatVolume = (volume: number): string => {
  if (!volume) return '0주';
  if (volume >= 100000000) {
    return `${(volume / 100000000).toFixed(1)}억 주`;
  }
  if (volume >= 10000) {
    return `${Math.floor(volume / 10000).toLocaleString('ko-KR')}만 주`;
  }
  return `${volume.toLocaleString('ko-KR')}주`;
};

// 원(₩) 단위 또는 억 단위 모두 자동 판별해 깔끔하게 표기
export const formatTradingValue = (value: number): string => {
  if (!value) return '0원';
  
  // 10억 원 이상 큰 금액(원 단위로 들어온 경우) -> 억 단위로 환산
  let inUk = value;
  if (value > 1000000000) {
    inUk = Math.floor(value / 100000000);
  }

  if (inUk >= 10000) {
    const jo = Math.floor(inUk / 10000);
    const uk = inUk % 10000;
    return uk > 0 ? `${jo}조 ${uk.toLocaleString('ko-KR')}억` : `${jo}조 원`;
  }
  return `${inUk.toLocaleString('ko-KR')}억 원`;
};

export const formatChangeRate = (rate: number): string => {
  if (rate > 0) return `+${rate.toFixed(2)}%`;
  if (rate < 0) return `${rate.toFixed(2)}%`;
  return '0.00%';
};

export const formatChangeAmount = (change: number): string => {
  if (change > 0) return `▲ ${change.toLocaleString('ko-KR')}`;
  if (change < 0) return `▼ ${Math.abs(change).toLocaleString('ko-KR')}`;
  return `- 0`;
};

export const getPriceColorClass = (changeRate: number): string => {
  if (changeRate > 0) return 'text-[#F04452]';
  if (changeRate < 0) return 'text-[#3182F6]';
  return 'text-slate-500';
};

export const getPriceBgClass = (changeRate: number): string => {
  if (changeRate > 0) return 'bg-rose-50 text-[#F04452]';
  if (changeRate < 0) return 'bg-blue-50 text-[#3182F6]';
  return 'bg-slate-100 text-slate-600';
};

export const getSentimentMeta = (score: number) => {
  if (score >= 80) {
    return {
      label: '매우 긍정',
      sublabel: '강한 상승 모멘텀 신호',
      textColor: 'text-[#E12B38]',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badgeBg: 'bg-red-100/80 text-red-700',
      barColor: 'bg-[#F04452]'
    };
  } else if (score >= 65) {
    return {
      label: '긍정',
      sublabel: '우호적인 뉴스 비중 우세',
      textColor: 'text-[#F04452]',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      badgeBg: 'bg-rose-100/80 text-rose-700',
      barColor: 'bg-[#F04452]'
    };
  } else if (score >= 45) {
    return {
      label: '중립',
      sublabel: '호재 및 악재 혼재 관망세',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      badgeBg: 'bg-slate-100 text-slate-700',
      barColor: 'bg-slate-400'
    };
  } else if (score >= 30) {
    return {
      label: '부정',
      sublabel: '단기 차익 매물 및 우려 부각',
      textColor: 'text-[#3182F6]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badgeBg: 'bg-blue-100/80 text-blue-700',
      barColor: 'bg-[#3182F6]'
    };
  } else {
    return {
      label: '매우 부정',
      sublabel: '강한 하방 압력 및 악재 집중',
      textColor: 'text-[#1B64DA]',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      badgeBg: 'bg-sky-100/80 text-sky-800',
      barColor: 'bg-[#1B64DA]'
    };
  }
};
