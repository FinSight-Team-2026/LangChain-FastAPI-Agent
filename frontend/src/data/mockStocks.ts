import { Stock } from '../types/stock';

export const MOCK_STOCKS: Stock[] = [
  {
    id: '005930',
    code: '005930',
    name: '삼성전자',
    market: 'KOSPI',
    sector: '반도체 및 전자부품',
    price: 74800,
    change: 1900,
    changeRate: 2.61,
    volume: 24890120,
    tradingValue: 18600, // 1조 8,600억원
    volumeSurgeRate: 84.5,
    valueSurgeRate: 91.2,
    sentimentScore: 78,
    sentimentLabel: '긍정',
    sentimentBreakdown: { positive: 72, neutral: 18, negative: 10 },
    sentimentSummary: [
      '엔비디아 HBM3E 공급 퀄 테스트 최종 승인 임박 소식으로 기대감 고조',
      '외국인 및 기관 투자가의 대규모 동반 순매수세 3거래일 연속 유입',
      '파운드리 수주 개선 및 차세대 메모리 가격 반등 전망 우세'
    ],
    keyDrivers: ['HBM3E 공급 임박', '외국인 순매수', '메모리 가격 반등', '파운드리 실적 개선'],
    sentimentHistory: [
      { date: '10.23', score: 62, price: 71200 },
      { date: '10.24', score: 65, price: 71900 },
      { date: '10.25', score: 60, price: 71500 },
      { date: '10.26', score: 68, price: 72300 },
      { date: '10.27', score: 71, price: 73100 },
      { date: '10.28', score: 75, price: 73900 },
      { date: '10.29', score: 78, price: 74800 },
    ],
    news: [
      {
        id: 'n-005930-1',
        title: '"엔비디아 HBM 공급 가시권"… 삼성전자 외국인 매수세 폭발',
        source: '한국경제',
        publishedAt: '25분 전',
        snippet: '삼성전자가 주요 글로벌 AI 칩셋 제조사향 차세대 HBM 테스트의 최종 단계를 통과했다는 증권가 보고서에 수급이 집중되고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 88,
        sentimentReason: 'HBM 공급 확정 가능성 및 대형 고객사 확보 모멘텀 부각',
        keywords: ['HBM3E', '엔비디아', '외국인 순매수']
      },
      {
        id: 'n-005930-2',
        title: '삼성전자 4분기 실적 컨센서스 상향… D램 판가 상승 지속',
        source: '매일경제',
        publishedAt: '1시간 전',
        snippet: '글로벌 IT 세트 수요 회복과 함께 서버용 고부가 D램 평균 판매단가(ASP)가 예상치를 상회하며 수익성 개선이 가속화될 전망입니다.',
        sentiment: 'positive',
        sentimentScore: 82,
        sentimentReason: 'D램 ASP 상승에 따른 4분기 영업이익 개선 전망',
        keywords: ['D램 판가', '영업이익', '컨센서스']
      },
      {
        id: 'n-005930-3',
        title: '반도체 수출 호조 지속 속 미중 기술 제재 향방은 변수',
        source: '연합뉴스',
        publishedAt: '3시간 전',
        snippet: '수출 호조세는 긍정적이나 미국의 대중 반도체 장비 및 첨단 AI 반도체 규제 불확실성은 여전히 투자 심리에 관망세를 부여합니다.',
        sentiment: 'neutral',
        sentimentScore: 50,
        sentimentReason: '수출 호조와 대외 정치적 규제 리스크가 공존',
        keywords: ['반도체 수출', '대중 규제', '관망세']
      },
      {
        id: 'n-005930-4',
        title: '글로벌 스마트폰 출하량 일시 정체… 파운드리 가동률 점진 회복',
        source: '머니투데이',
        publishedAt: '5시간 전',
        snippet: '스마트폰 수요 회복 지연으로 시스템LSI 부문은 다소 더딘 회복세를 보이고 있으나, 전장용 주문 확대로 하방 경직성을 확보했습니다.',
        sentiment: 'neutral',
        sentimentScore: 48,
        sentimentReason: '스마트폰 수요 둔화 vs 전장 주문 확대의 상쇄 효과',
        keywords: ['스마트폰', '파운드리', '시스템LSI']
      }
    ]
  },
  {
    id: '000660',
    code: '000660',
    name: 'SK하이닉스',
    market: 'KOSPI',
    sector: '반도체 및 전자부품',
    price: 198500,
    change: 8500,
    changeRate: 4.47,
    volume: 8120400,
    tradingValue: 16100, // 1조 6,100억원
    volumeSurgeRate: 112.4,
    valueSurgeRate: 124.8,
    sentimentScore: 89,
    sentimentLabel: '매우 긍정',
    sentimentBreakdown: { positive: 85, neutral: 10, negative: 5 },
    sentimentSummary: [
      'HBM 시장 독점적 지위 유지 및 세계 최초 HBM3E 12단 양산 출하 개시',
      '사상 최대 분기 영업이익 달성 기대감 및 글로벌 IB들의 목표주가 일제 상향',
      'AI 가속기 수요 폭증에 따른 장기 수주 잔고 사상 최대치 갱신'
    ],
    keyDrivers: ['HBM 독점력', '사상 최대 실적', 'HBM3E 12단 양산', '목표주가 상향'],
    sentimentHistory: [
      { date: '10.23', score: 79, price: 186000 },
      { date: '10.24', score: 81, price: 188500 },
      { date: '10.25', score: 80, price: 187000 },
      { date: '10.26', score: 84, price: 191000 },
      { date: '10.27', score: 86, price: 193500 },
      { date: '10.28', score: 87, price: 195000 },
      { date: '10.29', score: 89, price: 198500 },
    ],
    news: [
      {
        id: 'n-000660-1',
        title: 'SK하이닉스, HBM3E 12단 출하로 글로벌 AI 생태계 주도권 공고화',
        source: '서울경제',
        publishedAt: '12분 전',
        snippet: 'SK하이닉스가 12단 적층 HBM3E를 세계 최초로 공급하기 시작하며 경쟁사 대비 기술 격차를 1년 이상 벌렸다는 평가를 받고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 94,
        sentimentReason: '압도적인 기술 우위와 HBM 시장 1등 프리미엄 확인',
        keywords: ['HBM3E 12단', '기술격차', '세계 최초']
      },
      {
        id: 'n-000660-2',
        title: '골드만삭스, SK하이닉스 목표주가 25만원 제시… "영업이익률 40% 돌파 가능"',
        source: '조선비즈',
        publishedAt: '48분 전',
        snippet: '글로벌 투자은행들이 일제히 고부가가치 AI 메모리 수익성을 근거로 목표주가를 대폭 상향 조정하고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 91,
        sentimentReason: '글로벌 투자은행(IB)의 적극적 매수 추천 및 실적 상향',
        keywords: ['골드만삭스', '목표가 25만원', '영업이익률']
      },
      {
        id: 'n-000660-3',
        title: '美 테크 빅테크 AI CapEx 확대 지속… SK하이닉스 최대 수혜 전망',
        source: '이데일리',
        publishedAt: '2시간 전',
        snippet: 'MS, 구글, 메타 등 빅테크 기업들이 AI 인프라 투자를 내년에도 대폭 늘리겠다고 발표함에 따라 HBM 수혜가 가속화되고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 88,
        sentimentReason: '빅테크 AI 투자 확대로 인한 지속적 수주 증가',
        keywords: ['CapEx', '빅테크', 'AI 인프라']
      }
    ]
  },
  {
    id: '196170',
    code: '196170',
    name: '알테오젠',
    market: 'KOSDAQ',
    sector: '바이오 의약품',
    price: 382000,
    change: 18500,
    changeRate: 5.09,
    volume: 1450200,
    tradingValue: 5500, // 5,500억원
    volumeSurgeRate: 142.0,
    valueSurgeRate: 158.4,
    sentimentScore: 85,
    sentimentLabel: '매우 긍정',
    sentimentBreakdown: { positive: 80, neutral: 14, negative: 6 },
    sentimentSummary: [
      '키트루다 SC 제형 글로벌 임상 3상 성공적 마무리 및 마일스톤 유입 본격화',
      '추가 글로벌 빅파마와의 피하주사(SC) 플랫폼 독점 기술이전 협상 기대',
      '코스닥 대장주 등극 후 코스피 이전 상장 모멘텀 급부상'
    ],
    keyDrivers: ['키트루다SC', '빅파마 기술이전', '코스피 이전상장', '마일스톤 유입'],
    sentimentHistory: [
      { date: '10.23', score: 74, price: 350000 },
      { date: '10.24', score: 76, price: 358000 },
      { date: '10.25', score: 79, price: 362000 },
      { date: '10.26', score: 81, price: 368000 },
      { date: '10.27', score: 82, price: 371000 },
      { date: '10.28', score: 84, price: 375000 },
      { date: '10.29', score: 85, price: 382000 },
    ],
    news: [
      {
        id: 'n-196170-1',
        title: '알테오젠, 머크 키트루다SC 승인 가시화… "로열티 수천억원 유입 눈앞"',
        source: '바이오스펙테이터',
        publishedAt: '35분 전',
        snippet: '머크(MSD)의 블록버스터 면역항암제 키트루다의 피하주사형 개발이 순항하면서 본격적인 로열티 수익 모델이 시작됩니다.',
        sentiment: 'positive',
        sentimentScore: 92,
        sentimentReason: '세계 1위 항암제 SC 변경에 따른 천문학적 로열티 기대',
        keywords: ['머크', '키트루다SC', '로열티']
      },
      {
        id: 'n-196170-2',
        title: '코스닥 시총 1위 알테오젠, 코스피 이전상장 검토 소식에 투심 집중',
        source: '한국경제TV',
        publishedAt: '2시간 전',
        snippet: '코스닥 시장 시가총액 1위에 안착한 알테오젠이 코스피 이전 상장을 긍정적으로 검토한다는 소식이 전해졌습니다.',
        sentiment: 'positive',
        sentimentScore: 84,
        sentimentReason: '기관 및 패시브 펀드 수급 유입 기대',
        keywords: ['코스피 이전', '패시브 자금', '시총 1위']
      }
    ]
  },
  {
    id: '012450',
    code: '012450',
    name: '한화에어로스페이스',
    market: 'KOSPI',
    sector: '방위산업 및 우주항공',
    price: 364000,
    change: 13000,
    changeRate: 3.70,
    volume: 980400,
    tradingValue: 3560,
    volumeSurgeRate: 95.3,
    valueSurgeRate: 104.2,
    sentimentScore: 82,
    sentimentLabel: '매우 긍정',
    sentimentBreakdown: { positive: 76, neutral: 17, negative: 7 },
    sentimentSummary: [
      '루마니아 및 중동 지역 K9 자주포 및 천무 대규모 추가 수출 계약 체결',
      '국내외 방위력 증강 기조에 힘입은 30조 원 규모 수주 잔고의 고수익 인도 시작',
      '우주항공 복합체 재편에 따른 장기 성장 펀더멘털 강화'
    ],
    keyDrivers: ['K9 대규모 수출', '30조 수주잔고', '방산 수출 다변화', '천무 수출'],
    sentimentHistory: [
      { date: '10.23', score: 70, price: 341000 },
      { date: '10.24', score: 72, price: 345000 },
      { date: '10.25', score: 75, price: 350000 },
      { date: '10.26', score: 76, price: 352000 },
      { date: '10.27', score: 78, price: 356000 },
      { date: '10.28', score: 80, price: 359000 },
      { date: '10.29', score: 82, price: 364000 },
    ],
    news: [
      {
        id: 'n-012450-1',
        title: '한화에어로, 유럽 이어 중동서도 천무·K9 러브콜 쇄도',
        source: '파이낸셜뉴스',
        publishedAt: '1시간 전',
        snippet: '방산 수주 잔고가 30조 원을 돌파하며 향후 4~5년간 견고한 영업이익 성장이 보장되었습니다.',
        sentiment: 'positive',
        sentimentScore: 87,
        sentimentReason: '수주 잔고 확장 및 고마진 방산 수출 비중 증가',
        keywords: ['K9 자주포', '천무', '유럽 방산']
      }
    ]
  },
  {
    id: '003230',
    code: '003230',
    name: '삼양식품',
    market: 'KOSPI',
    sector: '음식료품 (K-푸드)',
    price: 585000,
    change: 22000,
    changeRate: 3.91,
    volume: 380200,
    tradingValue: 2220,
    volumeSurgeRate: 110.5,
    valueSurgeRate: 118.0,
    sentimentScore: 86,
    sentimentLabel: '매우 긍정',
    sentimentBreakdown: { positive: 81, neutral: 14, negative: 5 },
    sentimentSummary: [
      '미국 월마트 및 코스트코 전점 입점에 따른 불닭볶음면 품절 대란 지속',
      '밀양 제2공장 신설에 따른 공급 능력(CAPA) 대폭 확대 예정',
      '유럽 및 남미 등 신흥 수출 채널 다변화로 이익 체력 구조적 도약'
    ],
    keyDrivers: ['불닭 신드롬', '미국 유통망 확대', '밀양 2공장 증설', '해외 매출 비중 80%'],
    sentimentHistory: [
      { date: '10.23', score: 75, price: 540000 },
      { date: '10.24', score: 77, price: 549000 },
      { date: '10.25', score: 79, price: 558000 },
      { date: '10.26', score: 82, price: 567000 },
      { date: '10.27', score: 84, price: 572000 },
      { date: '10.28', score: 85, price: 579000 },
      { date: '10.29', score: 86, price: 585000 },
    ],
    news: [
      {
        id: 'n-003230-1',
        title: '불닭의 질주는 멈추지 않는다… 삼양식품, 3분기 어닝 서프라이즈 확실시',
        source: '머니투데이',
        publishedAt: '40분 전',
        snippet: '미국 현지 대형 유통업체 침투율이 상승하며 판가와 물량이 동반 성장하는 골디락스 구간에 진입했습니다.',
        sentiment: 'positive',
        sentimentScore: 90,
        sentimentReason: '미국 시장 점유율 급증 및 어닝 서프라이즈 가시화',
        keywords: ['불닭볶음면', '어닝서프라이즈', '미국 수출']
      }
    ]
  },
  {
    id: '005380',
    code: '005380',
    name: '현대차',
    market: 'KOSPI',
    sector: '자동차 및 운송장비',
    price: 243500,
    change: 1500,
    changeRate: 0.62,
    volume: 1250300,
    tradingValue: 3040,
    volumeSurgeRate: 35.2,
    valueSurgeRate: 41.5,
    sentimentScore: 68,
    sentimentLabel: '긍정',
    sentimentBreakdown: { positive: 60, neutral: 28, negative: 12 },
    sentimentSummary: [
      '하이브리드(HEV) 차량 판매 급증으로 전기차 캐즘(일시적 수요 둔화) 방어 성공',
      '인도 법인 상장 성공에 따른 대규모 현금 유입 및 자사주 매입·소각 등 주주환원',
      '미국 대선 이후 관세 및 친환경차 보조금 축소 가능성에 대한 불확실성 상존'
    ],
    keyDrivers: ['하이브리드 호조', '인도법인 상장', '주주환원 확대', '미국 관세 우려'],
    sentimentHistory: [
      { date: '10.23', score: 66, price: 239000 },
      { date: '10.24', score: 67, price: 241000 },
      { date: '10.25', score: 65, price: 240000 },
      { date: '10.26', score: 67, price: 241500 },
      { date: '10.27', score: 68, price: 242000 },
      { date: '10.28', score: 69, price: 243000 },
      { date: '10.29', score: 68, price: 243500 },
    ],
    news: [
      {
        id: 'n-005380-1',
        title: '현대차, 하이브리드 전략 적중… 글로벌 수익성 견고 유지',
        source: '중앙일보',
        publishedAt: '2시간 전',
        snippet: '전기차 둔화 속에서도 하이브리드 라인업 확대로 역대급 수익성을 지속하고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 75,
        sentimentReason: 'HEV 믹스 개선에 따른 마진 방어',
        keywords: ['하이브리드', '영업이익', '믹스개선']
      },
      {
        id: 'n-005380-2',
        title: '美 통상 압박과 전기차 보조금 변수… 완성차 업계 긴장',
        source: '연합뉴스',
        publishedAt: '6시간 전',
        snippet: '미국 정권 변화에 따른 수입차 관세 및 IRA 보조금 축소 시나리오에 대비한 현지 생산 증설이 요구됩니다.',
        sentiment: 'neutral',
        sentimentScore: 46,
        sentimentReason: '미국 무역 통상 리스크 불확실성 존재',
        keywords: ['미국 관세', 'IRA 보조금', '현지 생산']
      }
    ]
  },
  {
    id: '373220',
    code: '373220',
    name: 'LG에너지솔루션',
    market: 'KOSPI',
    sector: '전기·전자 (2차전지)',
    price: 391500,
    change: -5500,
    changeRate: -1.39,
    volume: 520100,
    tradingValue: 2040,
    volumeSurgeRate: -15.4,
    valueSurgeRate: -12.1,
    sentimentScore: 48,
    sentimentLabel: '중립',
    sentimentBreakdown: { positive: 38, neutral: 35, negative: 27 },
    sentimentSummary: [
      '글로벌 완성차 메이커들의 전기차 전환 속도 조절로 배터리 출하량 회복 지연',
      'ESS(에너지저장장치) 수주 확대로 전기차 부진 일부 상쇄 추진',
      '리튬 등 핵심 광물 가격 하향 안정화로 판가 하락 압력 점진적 해소 국면'
    ],
    keyDrivers: ['전기차 캐즘', 'ESS 수주 확대', '광물가 안정', '유럽 수요 둔화'],
    sentimentHistory: [
      { date: '10.23', score: 52, price: 402000 },
      { date: '10.24', score: 51, price: 398000 },
      { date: '10.25', score: 49, price: 395000 },
      { date: '10.26', score: 47, price: 392000 },
      { date: '10.27', score: 48, price: 394000 },
      { date: '10.28', score: 49, price: 397000 },
      { date: '10.29', score: 48, price: 391500 },
    ],
    news: [
      {
        id: 'n-373220-1',
        title: 'LG엔솔, 북미 ESS 사업 가속… "전기차 공백 채운다"',
        source: '전자신문',
        publishedAt: '3시간 전',
        snippet: '미국 전력망 시장을 겨냥한 대용량 LFP ESS 배터리 공급 계약을 잇따라 체결하며 사업 포트폴리오를 다변화하고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 68,
        sentimentReason: 'ESS 부문의 고성장으로 전기차 수요 둔화 보완',
        keywords: ['ESS', 'LFP 배터리', '북미 전력망']
      },
      {
        id: 'n-373220-2',
        title: '유럽 전기차 보조금 축소 여파… 배터리 3사 공장 가동률 보수적 운용',
        source: '뉴스1',
        publishedAt: '7시간 전',
        snippet: '유럽 주요국의 친환경차 지원 축소로 인한 배터리 재고 조정 기간이 길어지고 있다는 분석입니다.',
        sentiment: 'negative',
        sentimentScore: 32,
        sentimentReason: '유럽 시장 판매 둔화 및 가동률 하락 부담',
        keywords: ['유럽 보조금', '가동률', '재고 조정']
      }
    ]
  },
  {
    id: '035420',
    code: '035420',
    name: 'NAVER',
    market: 'KOSPI',
    sector: '인터넷 및 소프트웨어',
    price: 178500,
    change: 4100,
    changeRate: 2.35,
    volume: 1340000,
    tradingValue: 2380,
    volumeSurgeRate: 68.2,
    valueSurgeRate: 74.0,
    sentimentScore: 73,
    sentimentLabel: '긍정',
    sentimentBreakdown: { positive: 65, neutral: 25, negative: 10 },
    sentimentSummary: [
      '생성형 AI 하이퍼클로바X의 B2B 솔루션 및 공공·금융 수주 가시화',
      '서치피드 및 클립(숏폼) 도입에 따른 체류시간 증가와 디지털 광고 단가 회복',
      '네이버플러스 멤버십 혜택 강화로 커머스 거래액 반등'
    ],
    keyDrivers: ['생성형AI B2B', '숏폼 클립 성장', '광고 회복', '멤버십 강화'],
    sentimentHistory: [
      { date: '10.23', score: 63, price: 171000 },
      { date: '10.24', score: 65, price: 172500 },
      { date: '10.25', score: 67, price: 174000 },
      { date: '10.26', score: 69, price: 175000 },
      { date: '10.27', score: 71, price: 176500 },
      { date: '10.28', score: 72, price: 177000 },
      { date: '10.29', score: 73, price: 178500 },
    ],
    news: [
      {
        id: 'n-035420-1',
        title: '네이버, 공공·금융권 AI 수주 잇따라… "소버린 AI 경쟁력 입증"',
        source: '디지털데일리',
        publishedAt: '1시간 전',
        snippet: '자체 개발한 거대언어모델(LLM) 하이퍼클로바X를 활용한 온프레미스 AI 구축 사업이 실질 매출로 연결되고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 84,
        sentimentReason: '소버린 AI 시장 선점 및 B2B 매출 실적 시현',
        keywords: ['하이퍼클로바X', '소버린AI', 'B2B 클라우드']
      }
    ]
  },
  {
    id: '247540',
    code: '247540',
    name: '에코프로비엠',
    market: 'KOSDAQ',
    sector: '화학 (2차전지 소재)',
    price: 168200,
    change: -4200,
    changeRate: -2.44,
    volume: 890400,
    tradingValue: 1510,
    volumeSurgeRate: -8.3,
    valueSurgeRate: -11.0,
    sentimentScore: 42,
    sentimentLabel: '부정',
    sentimentBreakdown: { positive: 30, neutral: 32, negative: 38 },
    sentimentSummary: [
      '양극재 판가 하락에 따른 재고평가손실 우려 및 3분기 실적 눈높이 하향',
      '전방 전기차 고객사들의 배터리 재고 조정 지속으로 주문 회복 지연',
      '차세대 NCMX 및 나트륨 이온 배터리 신소재 개발로 중장기 모멘텀 모색'
    ],
    keyDrivers: ['양극재 판가 하락', '재고평가손실', '전기차 둔화', '신소재 개발'],
    sentimentHistory: [
      { date: '10.23', score: 49, price: 176000 },
      { date: '10.24', score: 47, price: 174000 },
      { date: '10.25', score: 45, price: 172000 },
      { date: '10.26', score: 43, price: 170500 },
      { date: '10.27', score: 44, price: 171000 },
      { date: '10.28', score: 43, price: 170000 },
      { date: '10.29', score: 42, price: 168200 },
    ],
    news: [
      {
        id: 'n-247540-1',
        title: '에코프로비엠, 양극재 출하량 반등 시점 4분기 이후로 순연 전망',
        source: '헤럴드경제',
        publishedAt: '2시간 전',
        snippet: '유럽 완성차 업체들의 수요 둔화 여파로 양극재 가동률 회복 시점이 예상보다 지연되고 있습니다.',
        sentiment: 'negative',
        sentimentScore: 35,
        sentimentReason: '가동률 부진 및 판가 압박에 따른 실적 둔화',
        keywords: ['양극재', '가동률', '출하량 순연']
      }
    ]
  },
  {
    id: '068270',
    code: '068270',
    name: '셀트리온',
    market: 'KOSPI',
    sector: '의약품 (바이오시밀러)',
    price: 194000,
    change: 3200,
    changeRate: 1.68,
    volume: 910200,
    tradingValue: 1760,
    volumeSurgeRate: 54.1,
    valueSurgeRate: 60.3,
    sentimentScore: 76,
    sentimentLabel: '긍정',
    sentimentBreakdown: { positive: 69, neutral: 21, negative: 10 },
    sentimentSummary: [
      '미국 시장에 출시된 짐펜트라(램시마SC) 3대 PBM 전원 처방집 등재 완료',
      '합병 후 무형자산 상각비 축소로 영업이익률 30%대 재진입 기대',
      '후속 바이오시밀러(스텔라라, 아일리아 시밀러) 유럽 허가 순항'
    ],
    keyDrivers: ['짐펜트라 PBM 등재', '합병 시너지', '영업이익률 개선', '후속 파이프라인'],
    sentimentHistory: [
      { date: '10.23', score: 68, price: 187000 },
      { date: '10.24', score: 70, price: 189000 },
      { date: '10.25', score: 71, price: 190000 },
      { date: '10.26', score: 73, price: 191500 },
      { date: '10.27', score: 74, price: 192000 },
      { date: '10.28', score: 75, price: 193000 },
      { date: '10.29', score: 76, price: 194000 },
    ],
    news: [
      {
        id: 'n-068270-1',
        title: '셀트리온 짐펜트라, 美 시장 처방 궤도 안착… 4분기 매출 가속',
        source: '한국경제',
        publishedAt: '1시간 전',
        snippet: '대형 처방약급여관리업체(PBM) 등재가 완료됨에 따라 미국 현지 의사 처방 건수가 가파르게 늘고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 86,
        sentimentReason: '미국 시장 PBM 커버리지 80% 확보로 직판 성공적 안착',
        keywords: ['짐펜트라', 'PBM 등재', '미국 직판']
      }
    ]
  },
  {
    id: '035720',
    code: '035720',
    name: '카카오',
    market: 'KOSPI',
    sector: '인터넷 및 서비스',
    price: 38750,
    change: 450,
    changeRate: 1.17,
    volume: 2100400,
    tradingValue: 810,
    volumeSurgeRate: 22.1,
    valueSurgeRate: 26.5,
    sentimentScore: 56,
    sentimentLabel: '중립',
    sentimentBreakdown: { positive: 45, neutral: 38, negative: 17 },
    sentimentSummary: [
      '새로운 AI 메이트 서비스 카나나(Kanana) 공개 및 대화형 AI 생태계 구축',
      '비핵심 계열사 정리 및 경영 지배구조 개편을 통한 경영 효율화 추진',
      '사법 리스크 완화 여부 및 카카오톡 탭 개편의 실질적 광고 수익화는 과제'
    ],
    keyDrivers: ['카나나(AI 메이트)', '계열사 효율화', '톡비즈 반등', '사법 리스크'],
    sentimentHistory: [
      { date: '10.23', score: 50, price: 37500 },
      { date: '10.24', score: 52, price: 37900 },
      { date: '10.25', score: 53, price: 38100 },
      { date: '10.26', score: 55, price: 38300 },
      { date: '10.27', score: 54, price: 38200 },
      { date: '10.28', score: 55, price: 38400 },
      { date: '10.29', score: 56, price: 38750 },
    ],
    news: [
      {
        id: 'n-035720-1',
        title: '카카오, 새 AI 서비스 \'카나나\' 공개… "그룹 대화 맥락까지 기억"',
        source: '동아일보',
        publishedAt: '2시간 전',
        snippet: '카카오가 연례 컨퍼런스에서 차세대 대화형 AI 에이전트 카나나의 주요 기능을 시연하며 혁신 신호탄을 쐈습니다.',
        sentiment: 'positive',
        sentimentScore: 72,
        sentimentReason: '신규 AI 플랫폼 공개로 인한 모멘텀 형성',
        keywords: ['카나나', 'AI 에이전트', '이프카카오']
      }
    ]
  },
  {
    id: '267260',
    code: '267260',
    name: 'HD현대일렉트릭',
    market: 'KOSPI',
    sector: '전력기기 및 중전기',
    price: 342000,
    change: 16500,
    changeRate: 5.07,
    volume: 720500,
    tradingValue: 2440,
    volumeSurgeRate: 135.8,
    valueSurgeRate: 148.9,
    sentimentScore: 91,
    sentimentLabel: '매우 긍정',
    sentimentBreakdown: { positive: 88, neutral: 9, negative: 3 },
    sentimentSummary: [
      '북미 AI 데이터센터 전력 소비 폭증으로 초고압 변압기 공급 부족 극심',
      '2028~2029년 납기 물량까지 수주 완료, 계약 가격 프리미엄 지속 확대',
      '울산 및 미국 앨라배마 공장 증설 효과로 분기별 사상 최대 영업이익률 갱신'
    ],
    keyDrivers: ['AI 전력망 슈퍼사이클', '초고압 변압기 쇼티지', '2029년 수주 완료', '영업이익률 20% 돌파'],
    sentimentHistory: [
      { date: '10.23', score: 81, price: 312000 },
      { date: '10.24', score: 83, price: 318000 },
      { date: '10.25', score: 85, price: 323000 },
      { date: '10.26', score: 87, price: 328000 },
      { date: '10.27', score: 88, price: 331000 },
      { date: '10.28', score: 89, price: 335000 },
      { date: '10.29', score: 91, price: 342000 },
    ],
    news: [
      {
        id: 'n-267260-1',
        title: '변압기가 없어서 못 판다… HD현대일렉트릭, 판가 30% 뛰어도 주문 폭주',
        source: '한국경제',
        publishedAt: '18분 전',
        snippet: '글로벌 빅테크의 AI 데이터센터 구축 붐으로 전력기기 납기가 4년 이상 밀리며 판매자 우위 시장이 굳어졌습니다.',
        sentiment: 'positive',
        sentimentScore: 96,
        sentimentReason: '압도적인 초고압 변압기 쇼티지와 판가 상승 수혜',
        keywords: ['초고압 변압기', '쇼티지', '빅테크 전력망']
      }
    ]
  },
  {
    id: '259960',
    code: '259960',
    name: '크래프톤',
    market: 'KOSPI',
    sector: '게임 소프트웨어',
    price: 347000,
    change: 9500,
    changeRate: 2.81,
    volume: 450100,
    tradingValue: 1540,
    volumeSurgeRate: 88.0,
    valueSurgeRate: 94.5,
    sentimentScore: 80,
    sentimentLabel: '긍정',
    sentimentBreakdown: { positive: 74, neutral: 18, negative: 8 },
    sentimentSummary: [
      '배틀그라운드(PUBG) IP의 지속적인 트래픽 갱신과 글로벌 라이브 서비스 매출 확대',
      '신작 다크앤다커 모바일 및 인조이(inZOI) 출시 기대감 글로벌 확산',
      '스케일업 더 크리에이티브 전략을 통한 글로벌 개발 스튜디오 지분 투자 결실'
    ],
    keyDrivers: ['배틀그라운드 트래픽', '신작 인조이 기대감', '다크앤다커 모바일', '안정적 현금흐름'],
    sentimentHistory: [
      { date: '10.23', score: 71, price: 328000 },
      { date: '10.24', score: 73, price: 331000 },
      { date: '10.25', score: 74, price: 334000 },
      { date: '10.26', score: 76, price: 337000 },
      { date: '10.27', score: 77, price: 340000 },
      { date: '10.28', score: 78, price: 342000 },
      { date: '10.29', score: 80, price: 347000 },
    ],
    news: [
      {
        id: 'n-259960-1',
        title: '크래프톤 인생 시뮬레이션 \'인조이\', 스팀 위시리스트 글로벌 1위 질주',
        source: '게임메카',
        publishedAt: '1시간 전',
        snippet: '차세대 실사 그래픽 시뮬레이션 게임 인조이가 글로벌 게이머들 사이에서 선풍적인 반응을 얻고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 88,
        sentimentReason: '글로벌 기대작의 높은 흥행 가시성',
        keywords: ['인조이', '스팀 위시리스트', '배틀그라운드']
      }
    ]
  },
  {
    id: '000270',
    code: '000270',
    name: '기아',
    market: 'KOSPI',
    sector: '자동차 및 운송장비',
    price: 99400,
    change: 800,
    changeRate: 0.81,
    volume: 1680900,
    tradingValue: 1670,
    volumeSurgeRate: 41.2,
    valueSurgeRate: 46.0,
    sentimentScore: 71,
    sentimentLabel: '긍정',
    sentimentBreakdown: { positive: 64, neutral: 26, negative: 10 },
    sentimentSummary: [
      'RV 및 하이브리드 중심의 고수익 판매 믹스로 10%대 높은 영업이익률 수성',
      'EV3의 유럽 본격 수출 개시 및 보급형 전기차 라인업 선제적 안착',
      '주주환원 정책의 일환으로 5,000억 원 규모 자사주 매입 및 전량 소각'
    ],
    keyDrivers: ['영업이익률 10%', 'EV3 유럽 출시', '자사주 소각', 'RV 판매 호조'],
    sentimentHistory: [
      { date: '10.23', score: 66, price: 96800 },
      { date: '10.24', score: 67, price: 97400 },
      { date: '10.25', score: 68, price: 97900 },
      { date: '10.26', score: 69, price: 98300 },
      { date: '10.27', score: 70, price: 98600 },
      { date: '10.28', score: 70, price: 98900 },
      { date: '10.29', score: 71, price: 99400 },
    ],
    news: [
      {
        id: 'n-000270-1',
        title: '기아 EV3, 유럽 현지 호평 쇄도… "가성비와 주행거리 모두 잡았다"',
        source: '오토타임즈',
        publishedAt: '3시간 전',
        snippet: '합리적인 가격대의 소형 전기차 EV3가 독일 및 영국 등 유럽 주요국에서 사전 계약 호조를 기록하고 있습니다.',
        sentiment: 'positive',
        sentimentScore: 79,
        sentimentReason: '유럽 시장 신차 사이클 본격화 및 긍정적 미디어 리뷰',
        keywords: ['EV3', '유럽 수출', '보급형 EV']
      }
    ]
  },
  {
    id: '005490',
    code: '005490',
    name: 'POSCO홀딩스',
    market: 'KOSPI',
    sector: '철강 및 2차전지 소재',
    price: 345500,
    change: -1500,
    changeRate: -0.43,
    volume: 480200,
    tradingValue: 1650,
    volumeSurgeRate: 5.4,
    valueSurgeRate: 7.2,
    sentimentScore: 51,
    sentimentLabel: '중립',
    sentimentBreakdown: { positive: 42, neutral: 41, negative: 17 },
    sentimentSummary: [
      '중국 경기 부양책 발표에 따른 철강재 가격 반등 기대감 형성',
      '리튬 수산화물 생산 공장 준공에도 불구하고 리튬 현물가 약세로 실적 기여 지연',
      '고부가가치 친환경 모터코어 및 에너지용 강재 판매 비중 확대로 수익성 방어'
    ],
    keyDrivers: ['중국 경기부양책', '철강가 반등 기대', '리튬 가격 약세', '친환경 강재'],
    sentimentHistory: [
      { date: '10.23', score: 48, price: 342000 },
      { date: '10.24', score: 50, price: 344000 },
      { date: '10.25', score: 51, price: 346000 },
      { date: '10.26', score: 53, price: 348000 },
      { date: '10.27', score: 52, price: 347000 },
      { date: '10.28', score: 51, price: 346000 },
      { date: '10.29', score: 51, price: 345500 },
    ],
    news: [
      {
        id: 'n-005490-1',
        title: '중국 부동산 부양책 약발 받나… 포스코, 철강 수급 개선 기대감',
        source: '이투데이',
        publishedAt: '4시간 전',
        snippet: '중국 정부의 재정 지출 확대와 인프라 투자 발표로 아시아 역내 열연 및 후판 유통가격이 바닥을 다지는 흐름입니다.',
        sentiment: 'neutral',
        sentimentScore: 58,
        sentimentReason: '중국발 부양 기대와 실질 수요 회복 확인 사이의 관망세',
        keywords: ['중국 부양책', '철강 유통가', '인프라 투자']
      }
    ]
  }
];

export const MARKET_INDICES = {
  kospi: {
    value: 2612.45,
    change: 18.20,
    changeRate: 0.70
  },
  kosdaq: {
    value: 746.80,
    change: 4.15,
    changeRate: 0.56
  },
  aiSentimentAverage: 71.4 // 전체 시장 AI 뉴스 감성 지수
};
