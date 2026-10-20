import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowRight, RotateCcw, Check, Sparkles, Trophy, Flame } from 'lucide-react';
import { AppLanguage } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { getQuestRewardForLevel } from './DailyQuestModal';
import { soundManager } from '../utils/audio';

interface StageClearModalProps {
  levelNumber: number;
  earnedCoins: number;
  language?: AppLanguage;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenDailyQuest?: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  levelNumber,
  earnedCoins,
  language = 'ko',
  onNextLevel,
  onReplay,
  onOpenDailyQuest,
}) => {
  const t = TRANSLATIONS[language];

  useEffect(() => {
    // 1. Play grand triumphant fanfare
    soundManager.playFanfare();

    // 2. Center celebratory fireworks
    confetti({
      particleCount: 85,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#f43f5e', '#34d399', '#a855f7'],
    });

    // 3. Dual side fanfare cannons after brief delay
    const cannonTimer = setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 65,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#ffd700', '#ff69b4', '#00ffff'],
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 65,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#ffd700', '#ff69b4', '#00ffff'],
      });
    }, 280);

    return () => clearTimeout(cannonTimer);
  }, []);

  // Calculate 10-level phase for current level (e.g. 1~10, 11~20, 21~30...)
  const phaseIndex = Math.floor((levelNumber - 1) / 10);
  const startLvl = phaseIndex * 10 + 1;
  const endLvl = startLvl + 9;

  // 10 level items in this phase
  const phaseLevels = Array.from({ length: 10 }, (_, i) => startLvl + i);

  // How many levels completed in this 10-level daily journey
  const stepInPhase = ((levelNumber - 1) % 10) + 1;
  const remainingInPhase = 10 - stepInPhase;
  const isPhaseCompleted = stepInPhase === 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/94 backdrop-blur-xl animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.84, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 360 }}
        className="w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#152345] via-[#0f1831] to-[#090e1e] border-2 border-amber-400/50 p-5 flex flex-col items-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden text-white"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 inset-x-0 h-32 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

        {/* Fanfare Triumphant Crest */}
        <div className="relative mb-2 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400/20 via-yellow-300/30 to-transparent blur-md pointer-events-none"
          />

          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 300, delay: 0.1 }}
            className="relative z-10 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_4px_16px_rgba(245,158,11,0.6)]"
          >
            <span className="text-base sm:text-lg animate-bounce">🎺</span>
            <span className="tracking-wide uppercase">
              {language === 'ko' ? '팡파레! 레벨 정복!' : 'Fanfare! Victory!'}
            </span>
            <span className="text-base sm:text-lg animate-bounce">🎉</span>
          </motion.div>
        </div>

        {/* 1. Header Title & Badge */}
        <div className="flex items-center gap-1.5 mb-1 text-amber-300">
          <Trophy className="w-5 h-5 text-amber-400 stroke-[2.5]" />
          <h2 className="text-xl font-black tracking-tight text-white">
            {t.stageClearTitle}
          </h2>
          <Sparkles className="w-4 h-4 text-cyan-300" />
        </div>

        {/* 2. Subtitle: 10-Level Daily Roadmap Progress */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-xs font-black text-amber-300 mb-3">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{t.expeditionProgress(startLvl, endLvl, stepInPhase)}</span>
        </div>

        {/* 3. 10-Level Visual Roadmap Track (2 rows of 5 nodes) */}
        <div className="w-full bg-slate-950/75 rounded-2xl p-3 border border-slate-700/80 mb-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2 px-1">
            <span>{t.roadmapTitle}</span>
            <span className="text-amber-300">
              {isPhaseCompleted ? t.phaseCompleted : t.remainingInPhase(remainingInPhase)}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {phaseLevels.map((lvl, index) => {
              const isPast = lvl < levelNumber;
              const isCurrent = lvl === levelNumber;
              const isFinal = index === 9;
              const reward = getQuestRewardForLevel(lvl);

              return (
                <div
                  key={lvl}
                  className={`relative rounded-xl p-1.5 flex flex-col items-center justify-center border text-center transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-b from-amber-400/30 via-yellow-400/20 to-slate-900 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-105 z-10'
                      : isPast
                      ? 'bg-slate-900/80 border-emerald-500/40 opacity-70'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-400">
                    Lv.{lvl}
                  </span>
                  <div className="text-lg leading-tight my-0.5">
                    {isFinal ? '👑' : reward.rewardType === 'coins' ? '🪙' : '🎁'}
                  </div>

                  {isPast && (
                    <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-2 h-2 text-white stroke-[3]" />
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-1.5 -right-1 bg-amber-400 text-slate-950 text-[8px] font-black px-1 rounded-full shadow-sm">
                      {language === 'ko' ? '완료!' : 'Done!'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Earned Coins summary */}
        <div className="w-full bg-amber-500/10 border border-amber-400/30 rounded-xl p-2.5 mb-3 flex items-center justify-center gap-2">
          <span className="text-base">🪙</span>
          <span className="text-xs font-bold text-amber-200">
            {t.clearBonus(earnedCoins)}
          </span>
        </div>

        {/* 5. Buttons */}
        <div className="w-full flex flex-col gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNextLevel}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 cursor-pointer"
          >
            <span>
              {isPhaseCompleted
                ? t.phaseCompleteNextBtn(levelNumber + 1)
                : t.nextLevelBtn(levelNumber + 1)}
            </span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          {onOpenDailyQuest && (
            <button
              type="button"
              onClick={onOpenDailyQuest}
              className="w-full py-2 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{t.viewAllQuests}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReplay}
            className="w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.replayLevel}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
