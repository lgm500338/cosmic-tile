import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Globe,
  Type,
  RotateCcw,
  BookOpen,
  Settings as SettingsIcon,
  Check,
  Sparkles,
} from 'lucide-react';
import { AppLanguage } from '../types/game';

interface SettingsModalProps {
  language: AppLanguage;
  isMuted: boolean;
  isVoiceEnabled: boolean;
  showTileText: boolean;
  onToggleMute: () => void;
  onToggleVoice: () => void;
  onToggleTileText: () => void;
  onToggleLanguage: () => void;
  onRestartLevel: () => void;
  onOpenHowToPlay: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  language,
  isMuted,
  isVoiceEnabled,
  showTileText,
  onToggleMute,
  onToggleVoice,
  onToggleTileText,
  onToggleLanguage,
  onRestartLevel,
  onOpenHowToPlay,
  onClose,
}) => {
  const isKo = language === 'ko';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        className="w-full max-w-[390px] rounded-3xl bg-slate-900/95 border border-slate-700/80 p-5 flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md">
              <SettingsIcon className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {isKo ? '게임 설정' : 'Game Settings'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isKo ? '오디오, 조작 및 게임 환경을 설정하세요' : 'Configure audio and game preferences'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Groups */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Group 1: Sound & Audio */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider px-1">
              {isKo ? '🔊 오디오 & 사운드' : '🔊 Audio & Sound'}
            </span>

            {/* SFX / Sound Effects Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isMuted ? 'bg-rose-500/15 text-rose-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {isKo ? '효과음 (SFX)' : 'Sound Effects'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isKo ? '타일 터치, 매칭 팡파레 효과음' : 'Tile taps, match fanfare sounds'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleMute}
                className={`relative w-12 h-6.5 rounded-full transition-colors cursor-pointer p-0.5 ${
                  !isMuted ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <motion.div
                  animate={{ x: !isMuted ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-5.5 h-5.5 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  {!isMuted ? (
                    <Check className="w-3 h-3 text-cyan-600 stroke-[3]" />
                  ) : (
                    <X className="w-3 h-3 text-slate-400 stroke-[3]" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>

          {/* Group 2: Display & Language */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider px-1">
              {isKo ? '🌐 디스플레이 & 언어' : '🌐 Display & Language'}
            </span>

            {/* Language Selector */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-300">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {isKo ? '게임 언어' : 'Language'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isKo ? '한국어 / English 원터치 전환' : 'Toggle between Korean and English'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleLanguage}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-xs font-black text-indigo-200 transition-transform active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <span>{isKo ? '🇰🇷 한국어' : '🇺🇸 English'}</span>
                <span className="text-[10px] text-indigo-400 font-normal">
                  ({isKo ? '변경' : 'Switch'})
                </span>
              </button>
            </div>

            {/* Tile Labels (Text vs Pure Illustration) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${showTileText ? 'bg-amber-400/15 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {isKo ? '천체 이름 라벨 표시' : 'Show Tile Labels'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {showTileText
                      ? isKo
                        ? '모든 타일에 이름 표기 중'
                        : 'Labels shown on all tiles'
                      : isKo
                      ? '일러스트 위주로 깔끔하게 보기'
                      : 'Clean aesthetic (illustrations only)'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTileText}
                className={`relative w-12 h-6.5 rounded-full transition-colors cursor-pointer p-0.5 ${
                  showTileText ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <motion.div
                  animate={{ x: showTileText ? 22 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="w-5.5 h-5.5 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  {showTileText ? (
                    <Check className="w-3 h-3 text-cyan-600 stroke-[3]" />
                  ) : (
                    <X className="w-3 h-3 text-slate-400 stroke-[3]" />
                  )}
                </motion.div>
              </button>
            </div>
          </div>

          {/* Group 3: Game Actions */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider px-1">
              {isKo ? '🎮 게임 플레이 & 가이드' : '🎮 Gameplay & Guide'}
            </span>

            {/* How to Play Guide Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHowToPlay();
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {isKo ? '게임 방법 및 룰 안내' : 'How to Play & Rules'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isKo ? '3-매칭 규칙, 3종 부스터 사용법' : 'Learn match-3 rules & booster powers'}
                  </div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold px-2 py-1 rounded-lg bg-emerald-500/10">
                {isKo ? '보기' : 'View'}
              </span>
            </button>

            {/* Restart Current Level Button */}
            <button
              type="button"
              onClick={() => {
                onRestartLevel();
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-rose-950/30 border border-rose-900/60 hover:border-rose-700 hover:bg-rose-900/40 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-rose-200">
                    {isKo ? '현재 스테이지 다시하기' : 'Restart Current Stage'}
                  </div>
                  <div className="text-[11px] text-rose-300/70">
                    {isKo ? '타일 배치를 처음 상태로 재시작합니다' : 'Reset the current board to try again'}
                  </div>
                </div>
              </div>
              <span className="text-xs text-rose-400 font-bold px-2 py-1 rounded-lg bg-rose-500/10">
                {isKo ? '재시작' : 'Restart'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Space Odyssey 3-Match</span>
          </div>
          <span className="font-mono text-slate-400">v1.2.0</span>
        </div>
      </motion.div>
    </div>
  );
};
