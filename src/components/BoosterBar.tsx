import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Shuffle, Wand2 } from 'lucide-react';
import { AppLanguage, BoosterType } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { BOOSTER_PRICES } from '../data/boosterPrices';

interface BoosterBarProps {
  boosterCounts: Record<BoosterType, number>;
  onUseBooster: (type: BoosterType) => void;
  canUndo: boolean;
  coins: number;
  language?: AppLanguage;
}

type BarBooster = 'undo' | 'wand' | 'shuffle';

/**
 * 부스터 3종: 되돌리기 · 타일 제거 · 섞기
 * - 보유 개수가 있으면 빨간 배지에 개수 표시
 * - 다 쓰면 노란 배지에 코인 가격 표시 → 누르면 코인으로 바로 사용
 * - 코인도 모자라면 흐리게 표시
 */
export const BoosterBar: React.FC<BoosterBarProps> = ({
  boosterCounts,
  onUseBooster,
  canUndo,
  coins,
  language = 'ko',
}) => {
  const t = TRANSLATIONS[language];

  const items: Array<{ type: BarBooster; icon: React.ReactNode; title: string; label: string; enabled: boolean }> = [
    {
      type: 'undo',
      icon: <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />,
      title: t.undoDesc,
      label: language === 'ko' ? '되돌리기' : 'Undo',
      enabled: canUndo,
    },
    {
      type: 'wand',
      icon: <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />,
      title: t.wandDesc,
      label: language === 'ko' ? '타일 제거' : 'Remove',
      enabled: true,
    },
    {
      type: 'shuffle',
      icon: <Shuffle className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />,
      title: t.shuffleDesc,
      label: language === 'ko' ? '섞기' : 'Shuffle',
      enabled: true,
    },
  ];

  return (
    <div className="w-full max-w-[420px] px-8 pt-1 pb-1.5 flex items-start justify-center gap-7 sm:gap-9 z-20 select-none shrink-0">
      {items.map(item => {
        const owned = boosterCounts[item.type] || 0;
        const price = BOOSTER_PRICES[item.type];
        const affordable = owned > 0 || coins >= price;
        const active = item.enabled && affordable;
        return (
          <div key={item.type} className="flex flex-col items-center gap-1.5">
            <motion.button
              type="button"
              onClick={() => item.enabled && onUseBooster(item.type)}
              disabled={!item.enabled}
              whileHover={active ? { scale: 1.08 } : {}}
              whileTap={active ? { scale: 0.92 } : {}}
              className={`
                relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center
                bg-slate-900/95 border-2 border-slate-500 shadow-[0_4px_16px_rgba(0,0,0,0.5)]
                transition-all duration-200
                ${active ? 'cursor-pointer hover:border-amber-400 active:shadow-none' : 'opacity-40 grayscale cursor-not-allowed shadow-none'}
              `}
              title={item.title}
              aria-label={item.label}
            >
              {item.icon}
              {owned > 0 ? (
                <div className="absolute -bottom-1.5 bg-rose-600 border border-white text-white font-black text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md shadow-md min-w-[20px] text-center tabular-nums leading-none">
                  {owned}
                </div>
              ) : (
                <div className="absolute -bottom-1.5 bg-amber-400 border border-amber-100 text-slate-900 font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-md text-center tabular-nums leading-none flex items-center gap-0.5 whitespace-nowrap">
                  <span className="text-[9px]">🪙</span>
                  <span>{price}</span>
                </div>
              )}
            </motion.button>
            <span className="text-[10px] font-bold text-slate-300/80 leading-none mt-1">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};
