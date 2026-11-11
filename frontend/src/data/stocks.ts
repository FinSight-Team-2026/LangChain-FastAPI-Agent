import { StockData, StockTerm } from '../types/stock';

export const STOCK_TERMS: StockTerm[] = [
  {
    id: 'panic-sell',
    term: '패닉셀',
    englishTerm: 'Panic Sell',
    category: '심리 매매',
    shortDesc: '공포에 질려 주식을 성급하게 손절하는 행동',
    detailedDesc: '주가가 급락할 때 공포심(Panic)에 휩싸여 이성적인 펀더멘털 분석 없이 보유 주식을 헐값에 급하게 매도해버리는 전형적인 초보 투자자의 심리 현상입니다.',
    beginnerTip: '💡 초보 투자자 팁: 지수가 함께 빠질 때의 급락은 내 종목만의 악재가 아닐 확률이 높습니다. MoodON의 패닉 디펜스 지표를 먼저 확인하세요!',
    exampleScenario: 'KOSPI 지수가 -2.5% 폭락하자 보유한 우량주가 하락하는 것을 보고 바닥에서 투매했다가 다음 날 반등을 놓치는 경우'
  },
  {
    id: 'golden-cross',
    term: '골든크로스',
    englishTerm: 'Golden Cross',
    category: '기술적 분석',
    shortDesc: '단기 이동평균선이 장기선을 상향 돌파하는 강세 신호',
    detailedDesc: '최근 20일 동안의 평균 주가가 60일 또는 120일 동안의 평균 주가를 아래에서 위로 뚫고 올라가는 현상으로, 강력한 중장기 상승 추세 전환을 암시합니다.',
    beginnerTip: '💡 초보 투자자 팁: 골든크로스 발생 후 거래량이 평소 대비 1.5배 이상 동반될 때 신뢰도가 가장 높습니다.',
    exampleScenario: '20일선이 60일선을 상향 돌파하면서 외국인 순매수가 집중될 때 분할 매수로 진입'
  },
  {
    id: 'per-pbr',
    term: 'PER / PBR',
    englishTerm: 'Price to Earnings / Book Value',
    category: '기업 가치 평가',
    shortDesc: '기업이 버는 돈(PER)과 보유 자산(PBR) 대비 주가 수준',
    detailedDesc: 'PER(주가수익비율)은 주가를 1주당 순이익으로 나눈 값이며, PBR(주가순자산비율)은 주가를 1주당 순자산으로 나눈 값입니다. 동종 업계 평균보다 낮으면 저평가로 판단합니다.',
    beginnerTip: '💡 초보 투자자 팁: 단순히 수치가 낮다고 좋은 게 아니라, 지속적인 이익 성장률과 함께 보아야 \'가치주 함정\'을 피할 수 있습니다.',
    exampleScenario: '업종 평균 PER이 25배인 반면, 해당 종목이 14배 수준에 거래될 때 상대적 저평가 매력 부각'
  },
  {
    id: 'dca-buy',
    term: '분할 매수',
    englishTerm: 'Dollar-Cost Averaging',
    category: '매매 전략',
    shortDesc: '한 번에 사지 않고 가격대별로 나누어 사는 분산 투자법',
    detailedDesc: '주가의 최저점을 맞추려 하지 않고 자금을 3~5회로 분할하여 매수함으로써 평균 매수 단가를 낮추고 단기 변동성 위험을 획기적으로 낮추는 리스크 관리 기법입니다.',
    beginnerTip: '💡 초보 투자자 팁: 하락장에 들어갈 때는 매수 간격(예: 3% 하락 시마다)과 비중을 사전에 정해두면 감정 매매를 차단할 수 있습니다.',
    exampleScenario: '100만원을 한 번에 사지 않고 30만원, 30만원, 40만원으로 3차례에 걸쳐 분할 진입'
  },
  {
    id: 'support-resistance',
    term: '지지선 & 저항선',
    englishTerm: 'Support & Resistance',
    category: '차트 분석',
    shortDesc: '주가가 더 떨어지지 않거나 넘기 힘든 심리적 가격 마지노선',
    detailedDesc: '지지선은 매수세가 강해 추가 하락을 방어하는 가격선이며, 저항선은 매도 매물이 쌓여 추가 상승을 막는 가격선입니다.',
    beginnerTip: '💡 초보 투자자 팁: 중요한 지지선이 깨지면 추가 하락 위험이 커지고, 저항선을 돌파하면 새로운 지지선으로 전환됩니다.',
    exampleScenario: '삼성전자가 73,000원의 강력한 지지선에서 세 차례 반등에 성공하는 흐름 확인'
  }
];

export const STOCKS_DATA: Record<string, StockData> = {
  NAVER: {
    id: 'NAVER',
    name: 'NAVER',
    code: '035420',
    category: '인터넷 / 플랫폼',
    quote: {
      code: '035420',
      name: 'NAVER',
      englishName: 'NAVER Corp.',
      currentPrice: 218500,
      changePrice: 3800,
      changeRate: 1.77,
      high52w: 232000,
      low52w: 158100,
      volume: 924180,
      tradingValue: 2019, // 억원
      marketCap: 354720, // 억원 (35조 4,720억)
      openPrice: 215000,
      highPrice: 220000,
      lowPrice: 214000,
      prevClosePrice: 214700,
      foreignOwnership: 48.24,
      per: 21.4,
      pbr: 1.35
    },
    sentimentScore: 78,
    sentimentStatus: '긍정',
    sentimentBreakdown: {
      positive: 74,
      neutral: 18,
      negative: 8
    },
    metrics7d: [
      { day: '11.03', fullDate: '2026.11.03', sentimentScore: 65, stockPrice: 210000, kospiIndex: 2542.8 },
      { day: '11.04', fullDate: '2026.11.04', sentimentScore: 68, stockPrice: 212500, kospiIndex: 2551.4 },
      { day: '11.05', fullDate: '2026.11.05', sentimentScore: 72, stockPrice: 213000, kospiIndex: 2548.1 },
      { day: '11.06', fullDate: '2026.11.06', sentimentScore: 70, stockPrice: 214000, kospiIndex: 2555.9 },
      { day: '11.07', fullDate: '2026.11.07', sentimentScore: 75, stockPrice: 214700, kospiIndex: 2562.3 },
      { day: '11.08', fullDate: '2026.11.08', sentimentScore: 76, stockPrice: 216000, kospiIndex: 2568.7 },
      { day: '11.09', fullDate: '2026.11.09 (오늘)', sentimentScore: 78, stockPrice: 218500, kospiIndex: 2574.5 }
    ],
    yearlyChartData: [
      { date: '2025.11', label: "'25.11", open: 182000, high: 188000, low: 175000, close: 184500, volume: 820000, ma20: 181000, ma60: 179000 },
      { date: '2025.12', label: "'25.12", open: 185000, high: 194000, low: 178000, close: 191000, volume: 950000, ma20: 186000, ma60: 181000 },
      { date: '2026.01', label: "'26.01", open: 192000, high: 201000, low: 188000, close: 198500, volume: 1100000, ma20: 193000, ma60: 185000 },
      { date: '2026.02', label: "'26.02", open: 199000, high: 205000, low: 192000, close: 194000, volume: 890000, ma20: 196000, ma60: 188000 },
      { date: '2026.03', label: "'26.03", open: 193000, high: 198000, low: 165000, close: 168000, volume: 1450000, ma20: 185000, ma60: 186000 },
      { date: '2026.04', label: "'26.04", open: 167000, high: 174000, low: 158100, close: 162000, volume: 1320000, ma20: 172000, ma60: 182000 },
      { date: '2026.05', label: "'26.05", open: 163000, high: 179000, low: 161000, close: 175000, volume: 980000, ma20: 169000, ma60: 178000 },
      { date: '2026.06', label: "'26.06", open: 176000, high: 189000, low: 173000, close: 186000, volume: 1040000, ma20: 176000, ma60: 175000 },
      { date: '2026.07', label: "'26.07", open: 187000, high: 203000, low: 185000, close: 199000, volume: 1180000, ma20: 188000, ma60: 176000 },
      { date: '2026.08', label: "'26.08", open: 200000, high: 218000, low: 195000, close: 212000, volume: 1250000, ma20: 198000, ma60: 180000 },
      { date: '2026.09', label: "'26.09", open: 213000, high: 226000, low: 208000, close: 215000, volume: 1120000, ma20: 208000, ma60: 186000 },
      { date: '2026.10', label: "'26.10", open: 216000, high: 232000, low: 211000, close: 214700, volume: 1380000, ma20: 214000, ma60: 195000 },
      { date: '2026.11', label: "'26.11", open: 215000, high: 220000, low: 210000, close: 218500, volume: 924180, ma20: 217000, ma60: 202000 },
    ],
    panicDefense: {
      isActive: false,
      stockChangePercent: 1.77,
      kospiChangePercent: 0.42,
      badgeText: '견조한 시장 상회',
      headline: '시장 지수 대비 +1.35%p 초과 상승 흐름 유지 중',
      recommendation: '플랫폼 AI 신규 솔루션 수주 호재로 외국인 매수세가 탄탄하게 유입되고 있습니다.',
      defenseType: 'bullish_rally'
    },
    newsSummary3Lines: [
      {
        id: 'n-1',
        title: '네이버웹툰 글로벌 유료 이용자(ARPPU) 분기 최고치 경신 및 나스닥 랠리',
        source: '한국경제',
        timeAgo: '1시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '북미 및 유럽 시장 웹툰 IP 유료화 성공과 애니메이션화 프로젝트 흥행으로 콘텐츠 매출이 전년 동기 대비 28% 성장했습니다.'
      },
      {
        id: 'n-2',
        title: '엔터프라이즈 AI 플랫폼 \'클로바 스튜디오\' 공공·금융 수주 40% 급증',
        source: '매일경제',
        timeAgo: '3시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '보안성을 강화한 온프레미스 AI 수요가 늘면서 네이버클라우드의 B2B AI 사업 매출 기여도가 본격적으로 확대되고 있습니다.'
      },
      {
        id: 'n-3',
        title: '도착보장 풀필먼트 수수료 모델 안착으로 커머스 마진율 1.8%p 개선',
        source: '연합인포맥스',
        timeAgo: '5시간 전',
        sentiment: 'neutral',
        sentimentLabel: '이슈',
        summary: '쿠팡과의 물류 경쟁 속에서 입점 브랜드 풀필먼트 서비스 만족도가 높아지며 커머스 수익성이 안정 궤도에 진입했습니다.'
      }
    ],
    finalConclusion: {
      badge: '분할 매수 추천',
      guidance: '주요 저항선인 220,000원 돌파를 목전에 두고 기관 및 외국인 수급이 안정적입니다. 단기 급등 후 숨고르기 발생 시 215,000원 부근에서 2~3회 분할 매수로 접근하는 전략이 유리합니다.',
      targetSupport: '지지선 213,000원 / 목표 저항선 230,000원',
      psychologicalTip: '고점 추격 매수보다는 장중 눌림목을 활용한 계획적 분할 매수가 수익률을 극대화합니다.'
    }
  },

  SAMSUNG_ELEC: {
    id: 'SAMSUNG_ELEC',
    name: '삼성전자',
    code: '005930',
    category: '반도체 / IT',
    quote: {
      code: '005930',
      name: '삼성전자',
      englishName: 'Samsung Electronics',
      currentPrice: 73400,
      changePrice: -1600,
      changeRate: -2.13,
      high52w: 88800,
      low52w: 55900,
      volume: 14821500,
      tradingValue: 10912, // 억원 (1조 912억)
      marketCap: 4381820, // 억원 (438조 1,820억)
      openPrice: 74500,
      highPrice: 74800,
      lowPrice: 73100,
      prevClosePrice: 75000,
      foreignOwnership: 53.42,
      per: 14.8,
      pbr: 1.18
    },
    sentimentScore: 62,
    sentimentStatus: '중립',
    sentimentBreakdown: {
      positive: 45,
      neutral: 35,
      negative: 20
    },
    metrics7d: [
      { day: '11.03', fullDate: '2026.11.03', sentimentScore: 74, stockPrice: 76200, kospiIndex: 2595.0 },
      { day: '11.04', fullDate: '2026.11.04', sentimentScore: 71, stockPrice: 75800, kospiIndex: 2588.4 },
      { day: '11.05', fullDate: '2026.11.05', sentimentScore: 68, stockPrice: 75200, kospiIndex: 2580.1 },
      { day: '11.06', fullDate: '2026.11.06', sentimentScore: 66, stockPrice: 74800, kospiIndex: 2574.6 },
      { day: '11.07', fullDate: '2026.11.07', sentimentScore: 65, stockPrice: 75000, kospiIndex: 2571.2 },
      { day: '11.08', fullDate: '2026.11.08', sentimentScore: 63, stockPrice: 75000, kospiIndex: 2568.0 },
      { day: '11.09', fullDate: '2026.11.09 (오늘)', sentimentScore: 62, stockPrice: 73400, kospiIndex: 2520.5 }
    ],
    yearlyChartData: [
      { date: '2025.11', label: "'25.11", open: 71000, high: 74500, low: 69500, close: 72800, volume: 12500000, ma20: 71800, ma60: 70500 },
      { date: '2025.12', label: "'25.12", open: 73000, high: 78500, low: 72000, close: 77500, volume: 14200000, ma20: 74200, ma60: 71800 },
      { date: '2026.01', label: "'26.01", open: 78000, high: 82000, low: 76500, close: 80500, volume: 16800000, ma20: 78500, ma60: 73500 },
      { date: '2026.02', label: "'26.02", open: 81000, high: 84000, low: 78000, close: 79200, volume: 13400000, ma20: 80100, ma60: 75200 },
      { date: '2026.03', label: "'26.03", open: 79500, high: 88800, low: 78500, close: 86500, volume: 22100000, ma20: 82500, ma60: 77800 },
      { date: '2026.04', label: "'26.04", open: 86000, high: 87500, low: 81000, close: 83200, volume: 15300000, ma20: 84800, ma60: 79500 },
      { date: '2026.05', label: "'26.05", open: 83500, high: 85500, low: 76000, close: 77800, volume: 17200000, ma20: 82100, ma60: 80200 },
      { date: '2026.06', label: "'26.06", open: 78000, high: 81500, low: 75000, close: 79800, volume: 13900000, ma20: 79000, ma60: 80500 },
      { date: '2026.07', label: "'26.07", open: 80000, high: 83000, low: 77500, close: 81200, volume: 14800000, ma20: 80500, ma60: 80800 },
      { date: '2026.08', label: "'26.08", open: 81500, high: 82000, low: 55900, close: 68500, volume: 29800000, ma20: 74500, ma60: 78500 },
      { date: '2026.09', label: "'26.09", open: 69000, high: 76000, low: 67000, close: 74200, volume: 18500000, ma20: 72000, ma60: 76200 },
      { date: '2026.10', label: "'26.10", open: 74500, high: 77200, low: 73000, close: 75000, volume: 15100000, ma20: 74600, ma60: 75800 },
      { date: '2026.11', label: "'26.11", open: 74500, high: 76200, low: 73100, close: 73400, volume: 14821500, ma20: 74200, ma60: 75100 },
    ],
    panicDefense: {
      isActive: true,
      stockChangePercent: -2.13,
      kospiChangePercent: -2.85,
      badgeText: '💡 패닉 디펜스 발동: 시장 동반 하락',
      headline: '삼성전자: -2.1% | KOSPI: -2.8%',
      recommendation: '💡 시장 동반 하락: 종목 개별 악재가 아닌 시장 전체 하락장 영향입니다. 안심하세요.',
      defenseType: 'market_drop'
    },
    newsSummary3Lines: [
      {
        id: 'n-s1',
        title: '엔비디아 차세대 HBM3E 12단 납품 퀄 테스트 최종 승인 임박',
        source: '서울경제',
        timeAgo: '45분 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '주요 AI 가속기 탑재를 위한 HBM3E 양산 테스트가 마무리 단계에 진입하여 4분기 공급 기대감이 확대되고 있습니다.'
      },
      {
        id: 'n-s2',
        title: '글로벌 금리 불확실성 여파로 KOSPI -2.8% 급락… 외국인 선물 순매도 출회',
        source: '매일경제',
        timeAgo: '2시간 전',
        sentiment: 'neutral',
        sentimentLabel: '이슈',
        summary: '미국 국채 금리 급등과 환율 변동성으로 코스피 지수가 급락하며 대형주 전반에 기계적인 패시브 매도 물량이 쏟아졌습니다.'
      },
      {
        id: 'n-s3',
        title: '파운드리 2나노 차세대 수주 로드맵 발표 및 모바일 AP 엑시노스 탑재 확대',
        source: '연합뉴스',
        timeAgo: '4시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '최첨단 2나노 공정 수주 가시화와 갤럭시 S시리즈 자체 칩 탑재율 확대로 파운드리 적자 폭이 점진적으로 축소될 전망입니다.'
      }
    ],
    finalConclusion: {
      badge: '관망 추천',
      guidance: '현재의 주가 하락은 삼성전자 자체의 펀더멘털 악화가 아닌, 코스피 지수(-2.8%) 급락에 따른 \'시장 동반 하락\'입니다. 공포감에 기인한 패닉셀은 손실을 확정지을 뿐이므로, 73,000원 지지선 방어를 확인하며 차분히 관망하는 것이 현명합니다.',
      targetSupport: '강력 지지선 73,000원 / 반등 저항선 76,000원',
      psychologicalTip: '지수 하락장에서 우량주를 헐값에 파는 실수를 막으세요. 시장이 진정되면 가장 먼저 반등할 기초 체력을 갖추고 있습니다.'
    }
  },

  SAMSUNG_MECH: {
    id: 'SAMSUNG_MECH',
    name: '삼성전기',
    code: '009150',
    category: '전자부품 / MLCC',
    quote: {
      code: '009150',
      name: '삼성전기',
      englishName: 'Samsung Electro-Mechanics',
      currentPrice: 146200,
      changePrice: 1200,
      changeRate: 0.83,
      high52w: 168000,
      low52w: 121500,
      volume: 412800,
      tradingValue: 602,
      marketCap: 109200,
      openPrice: 145000,
      highPrice: 147500,
      lowPrice: 144500,
      prevClosePrice: 145000,
      foreignOwnership: 34.15,
      per: 16.2,
      pbr: 1.42
    },
    sentimentScore: 71,
    sentimentStatus: '긍정',
    sentimentBreakdown: {
      positive: 68,
      neutral: 22,
      negative: 10
    },
    metrics7d: [
      { day: '11.03', fullDate: '2026.11.03', sentimentScore: 64, stockPrice: 142000, kospiIndex: 2542.8 },
      { day: '11.04', fullDate: '2026.11.04', sentimentScore: 66, stockPrice: 143500, kospiIndex: 2551.4 },
      { day: '11.05', fullDate: '2026.11.05', sentimentScore: 69, stockPrice: 144000, kospiIndex: 2548.1 },
      { day: '11.06', fullDate: '2026.11.06', sentimentScore: 70, stockPrice: 144800, kospiIndex: 2555.9 },
      { day: '11.07', fullDate: '2026.11.07', sentimentScore: 68, stockPrice: 145000, kospiIndex: 2562.3 },
      { day: '11.08', fullDate: '2026.11.08', sentimentScore: 70, stockPrice: 145000, kospiIndex: 2568.7 },
      { day: '11.09', fullDate: '2026.11.09 (오늘)', sentimentScore: 71, stockPrice: 146200, kospiIndex: 2574.5 }
    ],
    yearlyChartData: [
      { date: '2025.11', label: "'25.11", open: 135000, high: 142000, low: 131000, close: 138000, volume: 380000, ma20: 136000, ma60: 133000 },
      { date: '2025.12', label: "'25.12", open: 138500, high: 146000, low: 135000, close: 143000, volume: 420000, ma20: 140000, ma60: 136000 },
      { date: '2026.01', label: "'26.01", open: 144000, high: 153000, low: 141000, close: 149500, volume: 490000, ma20: 146000, ma60: 139000 },
      { date: '2026.02', label: "'26.02", open: 150000, high: 158000, low: 146000, close: 152000, volume: 460000, ma20: 150000, ma60: 142000 },
      { date: '2026.03', label: "'26.03", open: 153000, high: 168000, low: 149000, close: 164000, volume: 680000, ma20: 157000, ma60: 146000 },
      { date: '2026.04', label: "'26.04", open: 163000, high: 166000, low: 148000, close: 151000, volume: 510000, ma20: 158000, ma60: 149000 },
      { date: '2026.05', label: "'26.05", open: 150000, high: 154000, low: 138000, close: 141000, volume: 430000, ma20: 148000, ma60: 150000 },
      { date: '2026.06', label: "'26.06", open: 141500, high: 147000, low: 136000, close: 144500, volume: 390000, ma20: 143000, ma60: 148000 },
      { date: '2026.07', label: "'26.07", open: 145000, high: 149000, low: 139000, close: 146000, volume: 410000, ma20: 145000, ma60: 146000 },
      { date: '2026.08', label: "'26.08", open: 146000, high: 148000, low: 121500, close: 136000, volume: 620000, ma20: 142000, ma60: 145000 },
      { date: '2026.09', label: "'26.09", open: 137000, high: 144000, low: 133000, close: 141000, volume: 380000, ma20: 139000, ma60: 143000 },
      { date: '2026.10', label: "'26.10", open: 142000, high: 147500, low: 139500, close: 145000, volume: 405000, ma20: 143000, ma60: 142000 },
      { date: '2026.11', label: "'26.11", open: 145000, high: 147500, low: 142000, close: 146200, volume: 412800, ma20: 145500, ma60: 142500 },
    ],
    panicDefense: {
      isActive: false,
      stockChangePercent: 0.83,
      kospiChangePercent: 0.22,
      badgeText: '수급 안정세',
      headline: '전장 및 AI 서버용 고부가 MLCC 비중 확대로 안정적 흐름',
      recommendation: '실적 개선 기대감이 유지되고 있어 단기 급변동 위험이 제한적입니다.',
      defenseType: 'market_rebound'
    },
    newsSummary3Lines: [
      {
        id: 'n-m1',
        title: 'AI 가속기용 FC-BGA 반도체 기판 라인 가동률 92% 돌파',
        source: '머니투데이',
        timeAgo: '2시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '글로벌 클라우드 고객사향 서버용 기판 납품이 본격화되며 고부가 제품 믹스 개선세가 뚜렷합니다.'
      },
      {
        id: 'n-m2',
        title: '전기차 전장화 가속에 전장용 고신뢰성 MLCC 수주 호조',
        source: '한국경제',
        timeAgo: '4시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: 'ADAS 및 자율주행 모듈용 고온·고압 특수 MLCC 수요가 증가하여 자동차 전장 매출 비중이 30%를 넘어섰습니다.'
      },
      {
        id: 'n-m3',
        title: 'IT 세트 수요 회복 지연에 따른 범용 MLCC 단가 인상 제한적',
        source: '이데일리',
        timeAgo: '6시간 전',
        sentiment: 'neutral',
        sentimentLabel: '이슈',
        summary: '소비자 가전용 저가형 부품의 경우 가격 협상력이 다소 둔화되었으나 고부가 전장 제품이 실적을 방어하고 있습니다.'
      }
    ],
    finalConclusion: {
      badge: '관망 추천',
      guidance: 'MLCC 및 반도체 기판 턴어라운드가 확인되었으나 150,000원 선에 중기 매물벽이 두텁습니다. 145,000원 지지력을 확인한 뒤 매수 타이밍을 조율하는 관망 전략을 권장합니다.',
      targetSupport: '지지선 143,500원 / 저항선 152,000원',
      psychologicalTip: '단기 박스권 횡보 구간에서는 섣부른 조급함보다 저항선 돌파 여부를 차분히 관찰하는 인내심이 필요합니다.'
    }
  },

  HYUNDAI_MOTORS: {
    id: 'HYUNDAI_MOTORS',
    name: '현대차',
    code: '005380',
    category: '자동차 / 모빌리티',
    quote: {
      code: '005380',
      name: '현대차',
      englishName: 'Hyundai Motor',
      currentPrice: 242500,
      changePrice: -2500,
      changeRate: -1.02,
      high52w: 298000,
      low52w: 173000,
      volume: 680240,
      tradingValue: 1652,
      marketCap: 508630,
      openPrice: 245000,
      highPrice: 246500,
      lowPrice: 241500,
      prevClosePrice: 245000,
      foreignOwnership: 39.85,
      per: 5.8,
      pbr: 0.65
    },
    sentimentScore: 75,
    sentimentStatus: '긍정',
    sentimentBreakdown: {
      positive: 71,
      neutral: 21,
      negative: 8
    },
    metrics7d: [
      { day: '11.03', fullDate: '2026.11.03', sentimentScore: 78, stockPrice: 248000, kospiIndex: 2542.8 },
      { day: '11.04', fullDate: '2026.11.04', sentimentScore: 76, stockPrice: 246000, kospiIndex: 2551.4 },
      { day: '11.05', fullDate: '2026.11.05', sentimentScore: 74, stockPrice: 245000, kospiIndex: 2548.1 },
      { day: '11.06', fullDate: '2026.11.06', sentimentScore: 75, stockPrice: 245500, kospiIndex: 2555.9 },
      { day: '11.07', fullDate: '2026.11.07', sentimentScore: 76, stockPrice: 246000, kospiIndex: 2562.3 },
      { day: '11.08', fullDate: '2026.11.08', sentimentScore: 77, stockPrice: 245000, kospiIndex: 2568.7 },
      { day: '11.09', fullDate: '2026.11.09 (오늘)', sentimentScore: 75, stockPrice: 242500, kospiIndex: 2574.5 }
    ],
    yearlyChartData: [
      { date: '2025.11', label: "'25.11", open: 185000, high: 198000, low: 178000, close: 194000, volume: 590000, ma20: 188000, ma60: 182000 },
      { date: '2025.12', label: "'25.12", open: 195000, high: 215000, low: 192000, close: 209000, volume: 740000, ma20: 201000, ma60: 189000 },
      { date: '2026.01', label: "'26.01", open: 210000, high: 238000, low: 205000, close: 232000, volume: 920000, ma20: 218000, ma60: 198000 },
      { date: '2026.02', label: "'26.02", open: 234000, high: 265000, low: 228000, close: 258000, volume: 1100000, ma20: 242000, ma60: 212000 },
      { date: '2026.03', label: "'26.03", open: 260000, high: 298000, low: 254000, close: 288000, volume: 1450000, ma20: 271000, ma60: 232000 },
      { date: '2026.04', label: "'26.04", open: 286000, high: 292000, low: 262000, close: 271000, volume: 980000, ma20: 279000, ma60: 248000 },
      { date: '2026.05', label: "'26.05", open: 270000, high: 279000, low: 251000, close: 256000, volume: 820000, ma20: 267000, ma60: 254000 },
      { date: '2026.06', label: "'26.06", open: 258000, high: 266000, low: 248000, close: 262000, volume: 760000, ma20: 261000, ma60: 258000 },
      { date: '2026.07', label: "'26.07", open: 263000, high: 274000, low: 256000, close: 268000, volume: 840000, ma20: 265000, ma60: 262000 },
      { date: '2026.08', label: "'26.08", open: 266000, high: 269000, low: 173000, close: 238000, volume: 1320000, ma20: 252000, ma60: 259000 },
      { date: '2026.09', label: "'26.09", open: 240000, high: 254000, low: 232000, close: 248000, volume: 710000, ma20: 244000, ma60: 255000 },
      { date: '2026.10', label: "'26.10", open: 249000, high: 256000, low: 242000, close: 245000, volume: 690000, ma20: 246000, ma60: 252000 },
      { date: '2026.11', label: "'26.11", open: 245000, high: 248000, low: 241500, close: 242500, volume: 680240, ma20: 244000, ma60: 248000 },
    ],
    panicDefense: {
      isActive: false,
      stockChangePercent: -1.02,
      kospiChangePercent: -0.65,
      badgeText: '건전한 밸류에이션 지지',
      headline: '저PBR(0.65배) 및 고배당(4%대) 매력으로 하방 경직성 확보',
      recommendation: '단기 조정 시 238,000원 구간에서 안정적인 매수 기회가 형성됩니다.',
      defenseType: 'firm_divergence'
    },
    newsSummary3Lines: [
      {
        id: 'n-h1',
        title: '인도 법인 증시 상장 자금 유입 및 인도 2공장 가동 준비 박차',
        source: '조선비즈',
        timeAgo: '1시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '인도법인 IPO 성공으로 조달한 4조 원대 현금을 바탕으로 현지 전기차·SUV 라인업을 강화합니다.'
      },
      {
        id: 'n-h2',
        title: '하이브리드(HEV) 판매 비중 22% 돌파… 수익성 캐시카우 역할 톡톡',
        source: '헤럴드경제',
        timeAgo: '3시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '글로벌 전기차 캐즘(일시적 둔화) 속에서 고수익 하이브리드 모델이 판매 성장을 견인하고 있습니다.'
      },
      {
        id: 'n-h3',
        title: '미국 대선 이후 관세 불확실성 및 글로벌 완성차 할인 경쟁 우려',
        source: '연합뉴스',
        timeAgo: '5시간 전',
        sentiment: 'negative',
        sentimentLabel: '리스크',
        summary: '북미 인센티브 증가와 무역 통상 정책 변동성으로 인한 단기 관망 심리가 주가 상단을 누르고 있습니다.'
      }
    ],
    finalConclusion: {
      badge: '분할 매수 추천',
      guidance: '주주환원 정책 강화와 연 4%를 상회하는 배당 매력이 탄탄한 안전마진을 제공합니다. 240,000원 초반 지지선 근처에서 중장기 배당 및 밸류업 목적의 분할 매수를 추천합니다.',
      targetSupport: '지지선 238,000원 / 저항선 255,000원',
      psychologicalTip: '고배당 대형주는 가격이 떨어질수록 배당 수익률이 상승하는 안전판이 있습니다. 차분하게 분할 진입하세요.'
    }
  },

  SK_HYNIX: {
    id: 'SK_HYNIX',
    name: 'SK하이닉스',
    code: '000660',
    category: '반도체 / AI 메모리',
    quote: {
      code: '000660',
      name: 'SK하이닉스',
      englishName: 'SK hynix',
      currentPrice: 189400,
      changePrice: 6200,
      changeRate: 3.38,
      high52w: 248500,
      low52w: 115000,
      volume: 3420100,
      tradingValue: 6420,
      marketCap: 1378830,
      openPrice: 184500,
      highPrice: 191000,
      lowPrice: 184000,
      prevClosePrice: 183200,
      foreignOwnership: 54.91,
      per: 11.2,
      pbr: 1.85
    },
    sentimentScore: 86,
    sentimentStatus: '매우 긍정',
    sentimentBreakdown: {
      positive: 84,
      neutral: 12,
      negative: 4
    },
    metrics7d: [
      { day: '11.03', fullDate: '2026.11.03', sentimentScore: 78, stockPrice: 178000, kospiIndex: 2542.8 },
      { day: '11.04', fullDate: '2026.11.04', sentimentScore: 80, stockPrice: 181000, kospiIndex: 2551.4 },
      { day: '11.05', fullDate: '2026.11.05', sentimentScore: 82, stockPrice: 182500, kospiIndex: 2548.1 },
      { day: '11.06', fullDate: '2026.11.06', sentimentScore: 83, stockPrice: 181800, kospiIndex: 2555.9 },
      { day: '11.07', fullDate: '2026.11.07', sentimentScore: 84, stockPrice: 183200, kospiIndex: 2562.3 },
      { day: '11.08', fullDate: '2026.11.08', sentimentScore: 85, stockPrice: 185000, kospiIndex: 2568.7 },
      { day: '11.09', fullDate: '2026.11.09 (오늘)', sentimentScore: 86, stockPrice: 189400, kospiIndex: 2574.5 }
    ],
    yearlyChartData: [
      { date: '2025.11', label: "'25.11", open: 122000, high: 134000, low: 115000, close: 131000, volume: 2900000, ma20: 124000, ma60: 119000 },
      { date: '2025.12', label: "'25.12", open: 132000, high: 148000, low: 129000, close: 144500, volume: 3400000, ma20: 136000, ma60: 125000 },
      { date: '2026.01', label: "'26.01", open: 146000, high: 165000, low: 142000, close: 161000, volume: 4100000, ma20: 151000, ma60: 132000 },
      { date: '2026.02', label: "'26.02", open: 162000, high: 178000, low: 158000, close: 172000, volume: 3800000, ma20: 165000, ma60: 141000 },
      { date: '2026.03', label: "'26.03", open: 174000, high: 215000, low: 171000, close: 208000, volume: 5600000, ma20: 188000, ma60: 155000 },
      { date: '2026.04', label: "'26.04", open: 206000, high: 248500, low: 198000, close: 236000, volume: 6200000, ma20: 218000, ma60: 172000 },
      { date: '2026.05', label: "'26.05", open: 235000, high: 242000, low: 202000, close: 212000, volume: 4500000, ma20: 224000, ma60: 186000 },
      { date: '2026.06', label: "'26.06", open: 214000, high: 228000, low: 195000, close: 218000, volume: 3900000, ma20: 216000, ma60: 195000 },
      { date: '2026.07', label: "'26.07", open: 220000, high: 236000, low: 210000, close: 225000, volume: 4200000, ma20: 221000, ma60: 204000 },
      { date: '2026.08', label: "'26.08", open: 223000, high: 226000, low: 154000, close: 171000, volume: 7800000, ma20: 198000, ma60: 206000 },
      { date: '2026.09', label: "'26.09", open: 172000, high: 186000, low: 165000, close: 179000, volume: 3900000, ma20: 176000, ma60: 201000 },
      { date: '2026.10', label: "'26.10", open: 180000, high: 188000, low: 176000, close: 183200, volume: 3600000, ma20: 181000, ma60: 196000 },
      { date: '2026.11', label: "'26.11", open: 184500, high: 191000, low: 178000, close: 189400, volume: 3420100, ma20: 186000, ma60: 192000 },
    ],
    panicDefense: {
      isActive: false,
      stockChangePercent: 3.38,
      kospiChangePercent: 0.85,
      badgeText: 'AI 랠리 주도',
      headline: 'HBM3E 글로벌 독점 공급 프리미엄 및 사상 최대 실적 모멘텀',
      recommendation: '빅테크 기업들의 AI 데이터센터 투자 확대의 직접 수혜를 받으며 기관 매수세 집중',
      defenseType: 'bullish_rally'
    },
    newsSummary3Lines: [
      {
        id: 'n-sk1',
        title: '세계 최초 12단 적층 HBM3E 공급 본격 출하… 2025년 생산 물량 완판',
        source: '블룸버그',
        timeAgo: '1시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '엔비디아 블랙웰 아키텍처에 탑재될 차세대 HBM 전량을 선점 공급하며 시장 점유율 1위를 굳혔습니다.'
      },
      {
        id: 'n-sk2',
        title: '서버용 eSSD(기업용 SSD) 및 DDR5 가격 상승세에 3분기 어닝 서프라이즈',
        source: '한국경제',
        timeAgo: '2시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: 'AI 데이터센터 전력 효율 개선을 위한 초고용량 eSSD 수요가 폭증하며 낸드 부문 흑자 규모가 급증했습니다.'
      },
      {
        id: 'n-sk3',
        title: '미국 인디애나 첨단 패키징 공장 착공 및 현지 반도체 보조금 확정',
        source: '매일경제',
        timeAgo: '4시간 전',
        sentiment: 'positive',
        sentimentLabel: '호재',
        summary: '미국 현지 후공정 R&D 기지 구축을 위한 연방 보조금 수령으로 장기 세제 혜택과 글로벌 네트워크가 강화되었습니다.'
      }
    ],
    finalConclusion: {
      badge: '적극 매수',
      guidance: 'AI 반도체 시장에서의 기술 독점력과 실적 가시성이 가장 확실한 종목입니다. 190,000원 안착 시 추가 랠리가 유력하므로 단기 눌림목 발생 시 적극적인 비중 확대를 추천합니다.',
      targetSupport: '지지선 184,000원 / 저항선 205,000원',
      psychologicalTip: '강세 종목의 상승 랠리에서는 섣부른 조기 매도보다 추세가 살아있는 동안 비중을 유지하는 전략이 유효합니다.'
    }
  }
};
