import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy } from 'lucide-react';

interface PsychologicalBannerProps {
  text: string;
  onDismiss: () => void;
  language?: 'ko' | 'en';
}

export const PsychologicalBanner: React.FC<PsychologicalBannerProps> = ({ text, onDismiss, language = 'ko' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <div
        onClick={onDismiss}
        className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[1px] cursor-pointer select-none"
      >
        {/* Oval green challenge banner directly on top of board tiles (첫 번째 사진 기준) */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          className="relative w-full max-w-[340px] px-6 py-6 rounded-[48px] bg-gradient-to-b from-[#2e7d32] via-[#1b5e20] to-[#0f3d14] border-[4px] border-[#86efac] shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.7)] text-center flex flex-col items-center"
        >
          {/* Top gloss glint */}
          <div className="absolute top-2 inset-x-8 h-3 rounded-full bg-white/35 pointer-events-none" />

          {/* Leaf / decorative top icon */}
          <div className="w-10 h-10 rounded-full bg-[#4ade80] border-2 border-white flex items-center justify-center -mt-9 mb-2 shadow-md">
            <Trophy className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>

          {/* Title: 행성 미션 (사진 1의 '블라인드 카드' 위치) */}
          <h3 className="text-2xl font-black text-white tracking-tight mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {language === 'ko' ? '행성 탐사 미션' : 'Planet Mission'}
          </h3>

          {/* Body: "3% 플레이어가 실패했습니다. 이겨 보세요!" (사진 1 기준) */}
          <p className="text-sm sm:text-base font-extrabold text-[#fef08a] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] px-2 mb-2">
            {text}
          </p>

          <span className="text-[11px] font-bold text-emerald-200 opacity-90">
            {language === 'ko' ? '탭하여 퍼즐 시작 ⚡' : 'Tap to start ⚡'}
          </span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
