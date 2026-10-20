import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, AlertTriangle, Layers, Zap } from 'lucide-react';
import { AppLanguage } from '../types/game';

interface HowToPlayModalProps {
  language?: AppLanguage;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ language = 'ko', onClose }) => {
  const isEn = language === 'en';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="w-full max-w-md max-h-[88vh] rounded-3xl bg-slate-900 border border-slate-700/80 p-5 flex flex-col shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isEn ? 'How to Play & Game Guide' : '게임 방법 & 특징 가이드'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEn ? 'Google Play Store Global Edition Triple Tile Puzzle' : '구글 플레이스토어 / 토스 미니앱 출시 규격 트리플 타일 퍼즐'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto pr-1 flex flex-col gap-3">
          {/* Point 1: 3-Match */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                {isEn ? '1. Match 3 Identical Tiles!' : '1. 동일한 젤리 3개를 모으세요!'}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                {isEn
                  ? 'Tap tiles on the board to move them into your 7-slot dock. When 3 identical tiles gather, they match and burst with satisfying sounds and sparkles!'
                  : '보드에서 젤리를 탭하면 아래 바구니(7칸 슬롯)로 이동합니다. 같은 종류의 젤리 3개가 모이면 상쾌한 사운드와 함께 팡! 터지며 제거됩니다.'}
              </div>
            </div>
          </div>

          {/* Point 2: Occlusion */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                {isEn ? '2. Uncover Obscured Layers' : '2. 덮여있는 어두운 타일 풀기'}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                {isEn
                  ? 'Tiles covered by higher layers are locked in shade. Clear the upper tiles first to unlock and illuminate lower ones.'
                  : '다른 타일에 일부라도 덮여있는 젤리는 어둡게 잠겨 있습니다. 위에 올려진 젤리를 먼저 수집하여 아래 젤리를 밝게 해제하세요.'}
              </div>
            </div>
          </div>

          {/* Point 3: Danger */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                {isEn ? '3. Avoid Full Dock (Game Over)' : '3. 바구니가 다 차면 게임 오버!'}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                {isEn
                  ? 'If all 7 dock slots are full without any 3-match, the expedition fails. Use Undo, Remove, or Shuffle boosters in emergencies!'
                  : '7개의 바구니 슬롯이 꽉 차고 3개 매치를 만들 수 없으면 실패합니다. 위기 상황에는 되돌리기, 타일 제거, 섞기 부스터를 활용하세요.'}
              </div>
            </div>
          </div>

          {/* Point 4: Differentiator - Jelly & World Themes */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-400/40 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 mb-0.5">
                {isEn ? '✨ Cosmic Odyssey & Porcelain Jelly Tiles' : '✨ 나만의 차별화: 탱글 젤리 & 우주·판타지 세계관'}
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed">
                {isEn ? (
                  <>
                    • <strong>Tactile Jelly Animation</strong>: Dynamic bounce, realistic drop shadows, and synthesized audio frequencies.<br />
                    • <strong>Cosmic Science Exploration</strong>: 44 real celestial bodies with discovery dates and astrophysical encyclopedic facts!
                  </>
                ) : (
                  <>
                    • <strong>말랑말랑 3D 젤리 텍스처</strong>: 누를 때마다 탄성 있게 찌그러지고 통통 튀는 Web Audio 기반 촉각 젤리 반응.<br />
                    • <strong>44종 천체 과학 탐사</strong>: 행성, 위성, 혜성, 펄서, 블랙홀의 실제 발견 연도와 천체물리학 백과사전 제공!
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          {isEn ? 'Got it! Start Playing' : '확인하고 게임 즐기기'}
        </button>
      </motion.div>
    </div>
  );
};
