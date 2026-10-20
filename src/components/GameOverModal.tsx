import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, RotateCcw, HeartHandshake } from 'lucide-react';
import { AppLanguage } from '../types/game';

interface GameOverModalProps {
  levelNumber: number;
  userCoins: number;
  reviveCost: number;
  freeReviveAvailable: boolean;
  language?: AppLanguage;
  onRevive: () => void;
  onRetry: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  levelNumber,
  userCoins,
  reviveCost,
  freeReviveAvailable,
  language = 'ko',
  onRevive,
  onRetry,
}) => {
  const canAffordRevive = freeReviveAvailable || userCoins >= reviveCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 350 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-red-500/30 p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
      >
        {/* Danger Ambient Glow */}
        <div className="absolute -top-16 inset-x-0 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Danger Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-3">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-tight mb-1">
          {language === 'ko' ? '슬롯이 가득 찼어요!' : 'Slots are Full!'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {language === 'ko'
            ? '보관함에 타일이 모두 차서 더 이상 담을 수 없습니다.'
            : 'Your collection dock is completely filled.'}
        </p>

        {/* Revive Offer Card */}
        <div className="w-full bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-5 text-left">
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              {language === 'ko' ? '기사회생 부활 찬스' : 'Second Chance Revive'}
            </span>
            {freeReviveAvailable && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {language === 'ko' ? '무료' : 'FREE'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {language === 'ko'
              ? '슬롯에서 최근 담긴 타일 3개를 제거하고 게임을 바로 이어갑니다.'
              : 'Clears 3 recent tiles from your dock to keep playing right away.'}
          </p>
          <button
            type="button"
            onClick={onRevive}
            disabled={!canAffordRevive}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              canAffordRevive
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            {freeReviveAvailable ? (
              <span>{language === 'ko' ? '무료 부활하고 계속하기' : 'Free Revive & Continue'}</span>
            ) : (
              <span>
                {language === 'ko'
                  ? `부활하기 (${reviveCost} 코인)`
                  : `Revive (${reviveCost} Coins)`}
              </span>
            )}
          </button>
        </div>

        {/* Retry Button */}
        <button
          type="button"
          onClick={onRetry}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{language === 'ko' ? '처음부터 다시하기' : 'Try Again from Start'}</span>
        </button>
      </motion.div>
    </div>
  );
};
