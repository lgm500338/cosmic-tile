import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Play, Compass } from 'lucide-react';
import { AppLanguage } from '../types/game';
import { getRoadmapRewardForLevel } from '../utils/levelGenerator';

interface LevelModalProps {
  currentLevel: number;
  highestUnlockedLevel: number;
  language?: AppLanguage;
  onSelectLevel: (levelNum: number) => void;
  onClose: () => void;
}

export const LevelModal: React.FC<LevelModalProps> = ({
  currentLevel,
  highestUnlockedLevel,
  language = 'ko',
  onSelectLevel,
  onClose,
}) => {
  // Allow browsing in blocks of 20 levels up to 500
  const [page, setPage] = useState<number>(() => Math.floor((currentLevel - 1) / 20));

  const startLevel = page * 20 + 1;
  const endLevel = Math.min(500, startLevel + 19);
  const levels = Array.from({ length: endLevel - startLevel + 1 }, (_, i) => startLevel + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="w-full max-w-md max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-700/80 p-5 flex flex-col shadow-2xl relative text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold mb-0.5">
              <Compass className="w-4 h-4" />
              <span>{language === 'ko' ? '500레벨 대은하 탐사 지도' : '500-Level Galaxy Star Map'}</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {language === 'ko' ? '스테이지 선택' : 'Select Stage'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Page / Range navigation */}
        <div className="flex items-center justify-between bg-slate-950/70 rounded-2xl p-1.5 mb-3 border border-slate-800 shrink-0">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {language === 'ko' ? '◀ 이전 구역' : '◀ Prev Area'}
          </button>
          <span className="text-xs font-bold text-amber-300">
            Lv.{startLevel} ~ Lv.{endLevel}
          </span>
          <button
            type="button"
            disabled={endLevel >= 500}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {language === 'ko' ? '다음 구역 ▶' : 'Next Area ▶'}
          </button>
        </div>

        {/* Level Grid */}
        <div className="overflow-y-auto pr-1 flex-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {levels.map(lvl => {
            const isUnlocked = lvl <= highestUnlockedLevel;
            const isCurrent = lvl === currentLevel;
            const reward = getRoadmapRewardForLevel(lvl);

            return (
              <button
                key={lvl}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl);
                    onClose();
                  }
                }}
                className={`
                  relative rounded-2xl p-2 flex flex-col items-center justify-between gap-1 transition-all border text-center h-20
                  ${
                    !isUnlocked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-40 cursor-not-allowed'
                      : isCurrent
                      ? 'bg-gradient-to-b from-sky-950 to-slate-900 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105 cursor-pointer'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer'
                  }
                `}
              >
                {/* Level number */}
                <div className="flex items-center justify-center">
                  {isUnlocked ? (
                    <span className="text-xs font-black text-white">
                      Lv.{lvl}
                    </span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                {/* Reward preview icon */}
                <div className="text-base leading-none">
                  {reward.rewardType === 'coins' ? '🪙' : reward.rewardType === 'undo' ? '↩️' : '🪄'}
                </div>

                {isCurrent && (
                  <div className="flex items-center gap-0.5 text-[9px] font-black text-cyan-300">
                    <Play className="w-2 h-2 fill-cyan-300" />
                    <span>{language === 'ko' ? '진행중' : 'Now'}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
