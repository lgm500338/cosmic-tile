import React from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Check, Lock, Gift, Sparkles, ChevronRight, Trophy, Flame } from 'lucide-react';
import { AppLanguage } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { soundManager } from '../utils/audio';

export interface QuestRewardItem {
  level: number;
  rewardType: 'coins' | 'undo' | 'shuffle' | 'wand' | 'mega_chest';
  coinAmount: number;
  boosterUndo?: number;
  boosterShuffle?: number;
  boosterWand?: number;
  label: string;
  labelEn?: string;
}

interface DailyQuestModalProps {
  currentLevel: number;
  highestUnlockedLevel: number;
  claimedLevelRewards: number[];
  language?: AppLanguage;
  onClaimReward: (reward: QuestRewardItem) => void;
  onClaimAllAvailable: () => void;
  onStartLevel: (level: number) => void;
  onClose: () => void;
}

export function getQuestRewardForLevel(lvl: number, lang: AppLanguage = 'ko'): QuestRewardItem {
  const stepInTen = ((lvl - 1) % 10) + 1; // 1 to 10

  if (stepInTen === 10) {
    return {
      level: lvl,
      rewardType: 'mega_chest',
      coinAmount: 1000,
      boosterUndo: 2,
      boosterShuffle: 2,
      boosterWand: 2,
      label: lang === 'ko' ? '10레벨 완주 대형 보물상자' : '10-Level Grand Treasure Chest',
      labelEn: '10-Level Grand Treasure Chest',
    };
  }

  switch (stepInTen) {
    case 1:
      return { level: lvl, rewardType: 'coins', coinAmount: 100, label: lang === 'ko' ? '100 코인' : '100 Coins', labelEn: '100 Coins' };
    case 2:
      return { level: lvl, rewardType: 'undo', coinAmount: 50, boosterUndo: 1, label: lang === 'ko' ? '되돌리기 1개' : 'Undo x1', labelEn: 'Undo x1' };
    case 3:
      return { level: lvl, rewardType: 'coins', coinAmount: 150, label: lang === 'ko' ? '150 코인' : '150 Coins', labelEn: '150 Coins' };
    case 4:
      return { level: lvl, rewardType: 'shuffle', coinAmount: 50, boosterShuffle: 1, label: lang === 'ko' ? '셔플 1개' : 'Shuffle x1', labelEn: 'Shuffle x1' };
    case 5:
      return { level: lvl, rewardType: 'wand', coinAmount: 100, boosterWand: 1, label: lang === 'ko' ? '타일 제거 1개 + 100코인' : 'Remove x1 + 100 Coins', labelEn: 'Remove x1 + 100 Coins' };
    case 6:
      return { level: lvl, rewardType: 'coins', coinAmount: 200, label: lang === 'ko' ? '200 코인' : '200 Coins', labelEn: '200 Coins' };
    case 7:
      return { level: lvl, rewardType: 'undo', coinAmount: 50, boosterUndo: 2, label: lang === 'ko' ? '되돌리기 2개' : 'Undo x2', labelEn: 'Undo x2' };
    case 8:
      return { level: lvl, rewardType: 'coins', coinAmount: 250, label: lang === 'ko' ? '250 코인' : '250 Coins', labelEn: '250 Coins' };
    case 9:
      return { level: lvl, rewardType: 'shuffle', coinAmount: 50, boosterShuffle: 2, label: lang === 'ko' ? '셔플 2개' : 'Shuffle x2', labelEn: 'Shuffle x2' };
    default:
      return { level: lvl, rewardType: 'coins', coinAmount: 100, label: lang === 'ko' ? '100 코인' : '100 Coins', labelEn: '100 Coins' };
  }
}

export const DailyQuestModal: React.FC<DailyQuestModalProps> = ({
  currentLevel,
  highestUnlockedLevel,
  claimedLevelRewards,
  language = 'ko',
  onClaimReward,
  onClaimAllAvailable,
  onStartLevel,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  // Calculate which 10-level phase player is on (e.g. 1~10, 11~20, 21~30...)
  const activeLevel = Math.max(currentLevel, highestUnlockedLevel);
  // 지금 깬 레벨이면 다음 레벨을, 아직 진행 중이면 그 레벨을 시작한다
  const playLevel = highestUnlockedLevel > currentLevel && currentLevel + 1 <= highestUnlockedLevel ? Math.max(currentLevel, highestUnlockedLevel) : currentLevel;
  const phaseIndex = Math.floor((activeLevel - 1) / 10);
  const startLevel = phaseIndex * 10 + 1;
  const endLevel = startLevel + 9;

  // The 10 levels in this current journey
  const phaseLevels = Array.from({ length: 10 }, (_, i) => startLevel + i);

  // Completed in this phase
  const completedInPhase = phaseLevels.filter(lvl => highestUnlockedLevel > lvl).length;
  const progressPercent = Math.round((completedInPhase / 10) * 100);

  // Unclaimed available rewards
  const unclaimedLevels = phaseLevels.filter(
    lvl => highestUnlockedLevel > lvl && !claimedLevelRewards.includes(lvl)
  );

  const handleClaim = (item: QuestRewardItem) => {
    soundManager.playCoin();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#38bdf8', '#34d399'],
      });
    } catch {
      // ignore
    }
    onClaimReward(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 25 }}
        className="w-full max-w-md max-h-[92vh] rounded-[32px] bg-gradient-to-b from-[#111e3b] via-[#0d162c] to-[#080d1b] border-2 border-amber-400/50 p-5 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden text-white"
      >
        {/* Top ambient gold glow */}
        <div className="absolute -top-16 inset-x-0 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Trophy className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                  {language === 'ko' ? '하루 10레벨 로드맵' : '10-Level Roadmap'}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {language === 'ko' ? `${startLevel}~${endLevel}단계` : `Lvl ${startLevel}~${endLevel}`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                {t.dailyQuestTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 10-Level Objective Banner */}
        <div className="relative z-10 w-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-400/40 rounded-2xl p-3 mb-3">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1 text-amber-200">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              {language === 'ko' ? (
                <>오늘의 목표: <strong className="text-white font-extrabold">{endLevel}레벨 달성</strong></>
              ) : (
                <>Today's Goal: <strong className="text-white font-extrabold">Reach Level {endLevel}</strong></>
              )}
            </span>
            <span className="text-amber-300 font-black tabular-nums">
              {completedInPhase} / 10 ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-amber-400/30 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-300 font-medium mt-1.5 flex items-center justify-between">
            <span>
              {completedInPhase === 10
                ? (language === 'ko' ? '🎉 축하합니다! 오늘의 10레벨 원정대를 완주했습니다!' : '🎉 Congratulations! You completed today’s 10-level expedition!')
                : (language === 'ko' ? `10레벨 대형 보물상자까지 앞으로 ${10 - completedInPhase}개 레벨!` : `${10 - completedInPhase} more levels to the Grand Treasure Chest!`)}
            </span>
            {unclaimedLevels.length > 0 && (
              <button
                type="button"
                onClick={onClaimAllAvailable}
                className="text-[11px] font-black text-emerald-300 underline hover:text-emerald-200 cursor-pointer"
              >
                {language === 'ko' ? `모두 받기 (${unclaimedLevels.length}개)` : `Claim All (${unclaimedLevels.length})`}
              </button>
            )}
          </p>
        </div>

        {/* 10-Level Visual Roadmap Track */}
        <div className="relative z-10 flex-1 overflow-y-auto pr-1 space-y-2 mb-3 max-h-[46vh] custom-scrollbar">
          {phaseLevels.map((lvl, index) => {
            const reward = getQuestRewardForLevel(lvl, language);
            const isCompleted = highestUnlockedLevel > lvl;
            const isClaimed = claimedLevelRewards.includes(lvl);
            const isCurrent = playLevel === lvl;
            const isLocked = !isCompleted && !isCurrent;
            const isMegaFinal = index === 9; // 10th level

            return (
              <motion.div
                key={lvl}
                whileHover={{ scale: isLocked ? 1 : 1.01 }}
                className={`relative rounded-2xl p-3 border transition-all flex items-center justify-between gap-3 ${
                  isMegaFinal
                    ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                    : isCurrent
                    ? 'bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.3)] ring-1 ring-cyan-400/50'
                    : isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-65'
                }`}
              >
                {/* Left: Step number & Target Level */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                      isMegaFinal
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                        : isCompleted
                        ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 font-black animate-pulse'
                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-slate-500" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-white">
                        {language === 'ko' ? `레벨 ${lvl}` : `Level ${lvl}`}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 animate-bounce">
                          {language === 'ko' ? '도전 중!' : 'Active!'}
                        </span>
                      )}
                      {isMegaFinal && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                          {language === 'ko' ? '👑 최종 목표' : '👑 Final Goal'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                      {isMegaFinal ? '🎁' : '🪙'} {reward.label}
                    </p>
                  </div>
                </div>

                {/* Right Action Button */}
                <div>
                  {isClaimed ? (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.claimed}</span>
                    </div>
                  ) : isCompleted ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClaim(reward)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/30 flex items-center gap-1 cursor-pointer animate-bounce"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{t.claimReward}!</span>
                    </motion.button>
                  ) : isCurrent ? (
                    <button
                      type="button"
                      onClick={() => {
                        onStartLevel(lvl);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1 cursor-pointer hover:brightness-110"
                    >
                      <span>{language === 'ko' ? '플레이' : 'Play'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-[11px] text-slate-500 font-medium">
                      {t.locked}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <motion.button
          type="button"
          onClick={() => {
            onStartLevel(playLevel);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="relative z-10 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(251,191,36,0.35)] cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>{language === 'ko' ? `레벨 ${playLevel} 탐사 시작하기` : `Start Level ${playLevel}`}</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
