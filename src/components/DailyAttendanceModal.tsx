import React from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CalendarCheck, Gift, Check, Sparkles, Star } from 'lucide-react';
import { AppLanguage } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { soundManager } from '../utils/audio';

export interface AttendanceReward {
  day: number;
  label: string;
  labelEn: string;
  coins: number;
  undo?: number;
  shuffle?: number;
  wand?: number;
  icon: string;
}

export const ATTENDANCE_SCHEDULE: AttendanceReward[] = [
  { day: 1, label: '150 코인', labelEn: '150 Coins', coins: 150, icon: '🪙' },
  { day: 2, label: '되돌리기 2개 + 100 코인', labelEn: 'Undo x2 + 100 Coins', coins: 100, undo: 2, icon: '↩️' },
  { day: 3, label: '셔플 2개 + 150 코인', labelEn: 'Shuffle x2 + 150 Coins', coins: 150, shuffle: 2, icon: '🔀' },
  { day: 4, label: '타일 제거 2개 + 200 코인', labelEn: 'Remove x2 + 200 Coins', coins: 200, wand: 2, icon: '🪄' },
  { day: 5, label: '250 코인 + 되돌리기 2개', labelEn: '250 Coins + Undo x2', coins: 250, undo: 2, icon: '🎁' },
  { day: 6, label: '전 부스터 1세트 + 300 코인', labelEn: 'All Boosters x2 + 300 Coins', coins: 300, undo: 2, shuffle: 2, wand: 2, icon: '🚀' },
  { day: 7, label: '우주 대보물상자 (1000 코인 + 부스터 3종)', labelEn: 'Cosmic Mega Chest (1000 Coins + 3 Boosters)', coins: 1000, undo: 3, shuffle: 3, wand: 3, icon: '👑' },
];

interface DailyAttendanceModalProps {
  currentDayStreak: number;
  canClaimToday: boolean;
  language?: AppLanguage;
  onClaim: (reward: AttendanceReward) => void;
  onClose: () => void;
}

export const DailyAttendanceModal: React.FC<DailyAttendanceModalProps> = ({
  currentDayStreak,
  canClaimToday,
  language = 'ko',
  onClaim,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const activeDay = canClaimToday
    ? ((currentDayStreak) % 7) + 1
    : ((currentDayStreak - 1) % 7) + 1;

  const handleClaimToday = () => {
    const todayReward = ATTENDANCE_SCHEDULE[(activeDay - 1) % 7];
    soundManager.playArcadeFanfare(2);
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#fbbf24', '#f43f5e', '#34d399', '#a855f7'],
      });
    } catch {
      // ignore
    }
    onClaim(todayReward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 25 }}
        className="w-full max-w-md rounded-[32px] bg-gradient-to-b from-[#162447] via-[#101935] to-[#090e21] border-2 border-cyan-400/50 p-5 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden text-white"
      >
        {/* Top ambient cyan glow */}
        <div className="absolute -top-16 inset-x-0 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/30">
              <CalendarCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-400/20 px-2 py-0.5 rounded-full border border-cyan-400/40">
                  {t.attendanceBtn}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {t.streakText(currentDayStreak)}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                {t.attendanceTitle}
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

        {/* Subtitle / streak banner */}
        <p className="relative z-10 text-xs text-slate-300 mb-4 px-1">
          {language === 'ko' ? (
            <>매일 출석하고 무료 코인과 부스터를 받아가세요! 7일차에는 <strong className="text-amber-300 font-extrabold">우주 대보물상자</strong>가 열립니다.</>
          ) : (
            <>Check in daily for free coins and boosters! On Day 7, the <strong className="text-amber-300 font-extrabold">Cosmic Mega Chest</strong> unlocks!</>
          )}
        </p>

        {/* 7-Day Attendance Grid (Days 1 to 6 in 3x2, Day 7 as large epic card) */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mb-3">
          {ATTENDANCE_SCHEDULE.slice(0, 6).map(item => {
            const isPassed = !canClaimToday
              ? item.day <= currentDayStreak
              : item.day < activeDay;
            const isToday = canClaimToday && item.day === activeDay;
            const itemLabel = language === 'ko' ? item.label : item.labelEn;

            return (
              <div
                key={item.day}
                className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-center text-center border transition-all ${
                  isToday
                    ? 'bg-gradient-to-b from-cyan-400/30 via-sky-500/20 to-slate-900 border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-102 ring-2 ring-cyan-400/60'
                    : isPassed
                    ? 'bg-slate-900/80 border-emerald-500/40 opacity-70'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 mb-1">
                  {t.dayLabel(item.day)}
                </span>
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-[10px] font-extrabold text-amber-300 line-clamp-1">
                  {itemLabel}
                </span>

                {/* Stamped checkmark */}
                {isPassed && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                )}

                {isToday && (
                  <div className="absolute -top-1.5 -right-1 bg-cyan-400 text-slate-950 text-[9px] font-black px-1.5 rounded-full shadow-sm animate-pulse">
                    {language === 'ko' ? '오늘!' : 'Today!'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Day 7 Epic Reward Card */}
        {(() => {
          const day7 = ATTENDANCE_SCHEDULE[6];
          const isPassed = !canClaimToday
            ? 7 <= currentDayStreak
            : 7 < activeDay;
          const isToday = canClaimToday && activeDay === 7;
          const day7Label = language === 'ko' ? day7.label : day7.labelEn;

          return (
            <div
              className={`relative z-10 w-full rounded-2xl p-3 border mb-4 flex items-center justify-between gap-3 ${
                isToday
                  ? 'bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-600/30 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)] ring-2 ring-amber-400'
                  : isPassed
                  ? 'bg-slate-900/80 border-emerald-500/40 opacity-75'
                  : 'bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-slate-900 border-amber-400/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">👑</div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-300">
                      {language === 'ko' ? 'Day 7 최종 보상' : 'Day 7 Grand Reward'}
                    </span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-xs font-extrabold text-white mt-0.5">
                    {day7Label}
                  </p>
                </div>
              </div>

              {isPassed ? (
                <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.claimed}</span>
                </div>
              ) : (
                <span className="text-[11px] text-amber-400/80 font-bold">
                  {language === 'ko' ? '7일 완주' : '7-Day Goal'}
                </span>
              )}
            </div>
          );
        })()}

        {/* Action Button */}
        {canClaimToday ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClaimToday}
            className="relative z-10 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(56,189,248,0.4)] cursor-pointer animate-bounce"
          >
            <Gift className="w-5 h-5" />
            <span>{language === 'ko' ? `오늘의 Day ${activeDay} 출석 보상 받기!` : `Claim Day ${activeDay} Check-in Reward!`}</span>
          </motion.button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-full py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'ko'
                ? `오늘 출석 완료 (내일 Day ${((currentDayStreak) % 7) + 1} 보상이 기다려요!)`
                : `Checked In Today! (Day ${((currentDayStreak) % 7) + 1} awaits tomorrow!)`}
            </span>
          </button>
        )}
      </motion.div>
    </div>
  );
};
