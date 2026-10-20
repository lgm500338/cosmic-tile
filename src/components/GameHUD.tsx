import React from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Info,
  ChevronLeft,
  Settings,
  Type,
  Trophy,
  CalendarCheck,
  Globe,
} from 'lucide-react';
import { AppLanguage, GameTheme } from '../types/game';
import { TRANSLATIONS } from '../data/translations';

interface GameHUDProps {
  levelNumber: number;
  coins: number;
  earnedFloatingCoins: number;
  remainingTiles: number;
  totalTiles: number;
  isMuted: boolean;
  isVoiceEnabled: boolean;
  showTileText: boolean;
  currentTheme: GameTheme;
  language: AppLanguage;
  canClaimAttendance?: boolean;
  onToggleMute: () => void;
  onToggleVoice: () => void;
  onToggleTileText: () => void;
  onToggleLanguage: () => void;
  onOpenLevels: () => void;
  onOpenBriefing: () => void;
  onOpenSettings: () => void;
  onOpenDailyQuest?: () => void;
  onOpenAttendance?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelNumber,
  coins,
  earnedFloatingCoins,
  remainingTiles,
  totalTiles,
  isMuted,
  isVoiceEnabled,
  showTileText,
  language,
  canClaimAttendance,
  onToggleMute,
  onToggleVoice,
  onToggleTileText,
  onToggleLanguage,
  onOpenLevels,
  onOpenBriefing,
  onOpenSettings,
  onOpenDailyQuest,
  onOpenAttendance,
}) => {
  const t = TRANSLATIONS[language];
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((totalTiles - remainingTiles) / Math.max(totalTiles, 1)) * 100))
  );

  return (
    <header className="w-full max-w-[430px] px-2 pt-1.5 pb-0.5 flex flex-col gap-1 z-20 select-none shrink-0 pointer-events-none">
      {/* Row 1: Left (Back, Settings), Center (Level Title), Right (Coins, Shop, Icons) - Exact layout of image.png */}
      <div className="flex items-center justify-between gap-1 w-full pointer-events-auto">
        {/* Left: Back & Settings (Matching image.png) */}
        <div className="flex items-center gap-[3px] shrink-0">
          <button
            type="button"
            onClick={onOpenLevels}
            className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            title={language === 'ko' ? '스테이지 선택' : 'Select Stage'}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            title={language === 'ko' ? '설정' : 'Settings'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Level Title (Matching image.png '레벨 63') */}
        <button
          type="button"
          onClick={onOpenBriefing}
          className="flex items-center gap-1 px-2 py-1 min-w-0 shrink rounded-xl bg-slate-900/90 border border-amber-400/40 text-white hover:text-amber-300 transition-colors cursor-pointer shadow-sm"
          title={language === 'ko' ? '천체 브리핑 보기' : 'View Celestial Briefing'}
        >
          <span className="text-sm font-black whitespace-nowrap truncate text-amber-300 tracking-tight">
            <span className="hidden min-[400px]:inline">{t.levelText(levelNumber)}</span>
            <span className="min-[400px]:hidden">Lv.{levelNumber}</span>
          </span>
          <Info className="w-3 h-3 text-cyan-400 shrink-0 hidden min-[400px]:block" />
        </button>

        {/* Right: Golden Coin Counter, Shop, & Compact Utilities (Matching image.png) */}
        <div className="flex items-center gap-[3px] shrink-0">
          <div
            className="relative flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/90 border border-amber-400/50 text-amber-300 text-xs font-black shadow-sm"
            title={language === 'ko' ? '보유 코인' : 'Coins'}
          >
            <span className="text-xs leading-none hidden min-[380px]:inline">🪙</span>
            <span className="tabular-nums font-mono text-xs">{coins.toLocaleString()}</span>

            {/* Floating Coin Indicator */}
            {earnedFloatingCoins > 0 && (
              <span className="absolute -bottom-3 right-0 text-[10px] font-black text-amber-300 animate-bounce">
                +{earnedFloatingCoins}
              </span>
            )}
          </div>

          {/* Attendance Notification Ping */}
          {onOpenAttendance && canClaimAttendance && (
            <button
              type="button"
              onClick={onOpenAttendance}
              className="relative w-8 h-8 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              title={t.attendanceSubtitle}
            >
              <CalendarCheck className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-ping" />
            </button>
          )}

          {/* Quick Tile Label Toggle: [Type] */}
          <button
            type="button"
            onClick={onToggleTileText}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
              showTileText
                ? 'bg-amber-400/25 border-amber-400/70 text-amber-300'
                : 'bg-slate-900/90 border-slate-700/80 hover:bg-slate-800 text-slate-400'
            }`}
            title={language === 'ko' ? (showTileText ? '타일 이름 숨기기' : '타일 이름 표시하기') : (showTileText ? 'Hide Tile Labels' : 'Show Tile Labels')}
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            title={t.soundToggle}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Sleek Hairline Progress Bar */}
      <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/30 mt-0.5">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
