import { AppLanguage } from '../types/game';

export interface Translations {
  // HUD
  levelText: (lvl: number) => string;
  coins: string;
  dailyQuestBtn: string;
  attendanceBtn: string;
  tileTextToggle: string;
  soundToggle: string;
  voiceToggle: string;
  languageToggle: string;

  // Level Briefing
  briefingBadge: (lvl: number) => string;
  briefingSubtitle: string;
  startExpedition: string;
  discovered: string;

  // Stage Clear
  stageClearTitle: string;
  expeditionProgress: (start: number, end: number, step: number) => string;
  roadmapTitle: string;
  phaseCompleted: string;
  remainingInPhase: (rem: number) => string;
  clearBonus: (coins: number) => string;
  nextLevelBtn: (lvl: number) => string;
  phaseCompleteNextBtn: (lvl: number) => string;
  viewAllQuests: string;
  replayLevel: string;

  // Game Over
  gameOverTitle: string;
  gameOverDesc: string;
  useBoosterUndo: string;
  useBoosterShuffle: string;
  retryLevel: string;

  // Daily Quest
  dailyQuestTitle: string;
  dailyQuestSubtitle: string;
  dailyQuestProgress: (count: number) => string;
  claimAllRewards: string;
  continueExpedition: string;
  claimReward: string;
  claimed: string;
  locked: string;
  finalTreasure: string;
  nextPhaseBadge: (start: number, end: number) => string;

  // Daily Attendance
  attendanceTitle: string;
  attendanceSubtitle: string;
  streakText: (days: number) => string;
  claimToday: string;
  todayClaimed: string;
  dayLabel: (day: number) => string;

  // Booster Bar
  undoName: string;
  wandName: string;
  shuffleName: string;
  undoDesc: string;
  wandDesc: string;
  shuffleDesc: string;

  // Shop Modal
  shopTitle: string;
  shopSubtitle: string;
  freeDailyGift: string;
  freeDailyClaimed: string;
  buyCoins: string;
  buyTools: string;
  close: string;

  // Dock Warnings
  dockWarning: (remaining: number) => string;
  dockCritical: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  ko: {
    // HUD
    levelText: lvl => `레벨 ${lvl}`,
    coins: '코인',
    dailyQuestBtn: '10레벨 원정',
    attendanceBtn: '출석체크',
    tileTextToggle: '타일 글자',
    soundToggle: '효과음',
    voiceToggle: '목소리',
    languageToggle: '한국어',

    // Level Briefing
    briefingBadge: lvl => `레벨 ${lvl} 등장 천체 브리핑`,
    briefingSubtitle: '이번 레벨에 출현하는 천체들의 과학적 특징과 탐사 정보입니다.',
    startExpedition: '탐사 시작하기',
    discovered: '발견:',

    // Stage Clear
    stageClearTitle: '스테이지 클리어!',
    expeditionProgress: (start, end, step) => `오늘 10레벨 원정대: ${start}~${end}단계 (${step}/10)`,
    roadmapTitle: '10레벨 여정 로드맵',
    phaseCompleted: '🎉 10레벨 완주 완료!',
    remainingInPhase: rem => `앞으로 ${rem}개 남음`,
    clearBonus: coins => `클리어 보너스 지급: +${coins} 코인`,
    nextLevelBtn: lvl => `다음 레벨 ${lvl} 도전`,
    phaseCompleteNextBtn: lvl => `10레벨 완주! 레벨 ${lvl} 도전`,
    viewAllQuests: '10레벨 일일도전과제 전체 보기',
    replayLevel: '이 레벨 다시 플레이',

    // Game Over
    gameOverTitle: '슬롯 가득 참!',
    gameOverDesc: '보관함에 더 이상 타일을 넣을 자리가 없습니다.',
    useBoosterUndo: '되돌리기 사용',
    useBoosterShuffle: '타일 섞기 사용',
    retryLevel: '다시 도전하기',

    // Daily Quest
    dailyQuestTitle: '오늘의 10레벨 원정대',
    dailyQuestSubtitle: '매일 10개 레벨씩 도전하고 단계별 우주 탐사 보상을 획득하세요!',
    dailyQuestProgress: count => `진행도: ${count}/10 레벨 클리어`,
    claimAllRewards: '받을 수 있는 보상 모두 받기',
    continueExpedition: '원정 계속하기',
    claimReward: '보상 받기',
    claimed: '수령 완료',
    locked: '잠김',
    finalTreasure: '10레벨 최종 보물',
    nextPhaseBadge: (start, end) => `다음 구간: 레벨 ${start}~${end}`,

    // Daily Attendance
    attendanceTitle: '7일 연속 우주 출석체크',
    attendanceSubtitle: '매일 우주 기지에 출석 도장을 찍고 탐사 보급품을 받으세요!',
    streakText: days => `${days}일 연속 출석 중!`,
    claimToday: '오늘 출석 도장 찍기',
    todayClaimed: '오늘 출석 완료!',
    dayLabel: day => `${day}일차`,

    // Booster Bar
    undoName: '되돌리기',
    wandName: '타일 제거',
    shuffleName: '타일 섞기',
    undoDesc: '마지막으로 가져온 타일을 보드로 되돌립니다.',
    wandDesc: '같은 천체 3개를 보드에서 바로 없애줍니다. 덮여 있는 타일도 가져가요.',
    shuffleDesc: '보드에 남은 타일들의 배치를 무작위로 재배열합니다.',

    // Shop Modal
    shopTitle: '우주 탐사 보급소',
    shopSubtitle: '탐사를 돕는 황금 코인과 부스터를 충전하세요.',
    freeDailyGift: '매일 무료 선물 받기 (+300 코인)',
    freeDailyClaimed: '오늘 수령 완료',
    buyCoins: '코인 충전',
    buyTools: '부스터 구매',
    close: '닫기',

    // Dock Warnings
    dockWarning: remaining => `슬롯 주의! 남은 공간: ${remaining}칸`,
    dockCritical: '보관함이 가득 찼습니다!',
  },

  en: {
    // HUD
    levelText: lvl => `Level ${lvl}`,
    coins: 'Coins',
    dailyQuestBtn: '10-Lvl Quest',
    attendanceBtn: 'Check-in',
    tileTextToggle: 'Tile Text',
    soundToggle: 'Sound FX',
    voiceToggle: 'Voice',
    languageToggle: 'English',

    // Level Briefing
    briefingBadge: lvl => `Level ${lvl} Celestial Briefing`,
    briefingSubtitle: 'Scientific facts and discoveries for celestial bodies in this level.',
    startExpedition: 'Start Expedition',
    discovered: 'Discovered:',

    // Stage Clear
    stageClearTitle: 'Stage Cleared!',
    expeditionProgress: (start, end, step) => `Daily 10-Level Expedition: Lvl ${start}~${end} (${step}/10)`,
    roadmapTitle: '10-Level Journey Roadmap',
    phaseCompleted: '🎉 10-Level Journey Complete!',
    remainingInPhase: rem => `${rem} more to complete`,
    clearBonus: coins => `Stage Clear Bonus: +${coins} Coins`,
    nextLevelBtn: lvl => `Play Level ${lvl}`,
    phaseCompleteNextBtn: lvl => `Expedition Done! Start Level ${lvl}`,
    viewAllQuests: 'View 10-Level Daily Quests',
    replayLevel: 'Replay This Level',

    // Game Over
    gameOverTitle: 'Dock Full!',
    gameOverDesc: 'No more empty slots available in your collection dock.',
    useBoosterUndo: 'Use Undo Booster',
    useBoosterShuffle: 'Use Shuffle Booster',
    retryLevel: 'Try Again',

    // Daily Quest
    dailyQuestTitle: "Today's 10-Level Expedition",
    dailyQuestSubtitle: 'Conquer 10 levels every day to claim exclusive celestial rewards!',
    dailyQuestProgress: count => `Progress: ${count}/10 Levels Cleared`,
    claimAllRewards: 'Claim All Available Rewards',
    continueExpedition: 'Continue Expedition',
    claimReward: 'Claim',
    claimed: 'Claimed',
    locked: 'Locked',
    finalTreasure: '10-Level Grand Treasure',
    nextPhaseBadge: (start, end) => `Next Phase: Lvl ${start}~${end}`,

    // Daily Attendance
    attendanceTitle: '7-Day Space Check-in',
    attendanceSubtitle: 'Check in daily to receive cosmic supplies and booster items!',
    streakText: days => `${days}-Day Check-in Streak!`,
    claimToday: 'Stamp Today & Claim',
    todayClaimed: 'Checked in Today!',
    dayLabel: day => `Day ${day}`,

    // Booster Bar
    undoName: 'Undo',
    wandName: 'Magic Wand',
    shuffleName: 'Shuffle',
    undoDesc: 'Return the most recent tile from your dock back to the board.',
    wandDesc: 'Instantly removes a set of 3 matching tiles, even ones that are covered.',
    shuffleDesc: 'Re-arranges all remaining tiles on the board randomly.',

    // Shop Modal
    shopTitle: 'Cosmic Supply Station',
    shopSubtitle: 'Restock your Golden Coins and powerful booster items.',
    freeDailyGift: 'Daily Free Supply (+300 Coins)',
    freeDailyClaimed: 'Claimed for Today',
    buyCoins: 'Coin Packs',
    buyTools: 'Booster Packs',
    close: 'Close',

    // Dock Warnings
    dockWarning: remaining => `Warning! Only ${remaining} slots remaining`,
    dockCritical: 'Dock is completely full!',
  },
};
