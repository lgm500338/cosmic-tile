import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export type VoiceCalloutWord = 'great' | 'excellent' | 'perfect' | 'unbelievable';

interface ParticleShowerProps {
  id: number;
  comboCount: number;
  callout?: VoiceCalloutWord;
}

export const ParticleShower: React.FC<ParticleShowerProps> = ({ id, comboCount, callout }) => {
  // Determine callout word based on combo if not explicitly passed
  const activeCallout: VoiceCalloutWord =
    callout ||
    (comboCount === 1
      ? 'great'
      : comboCount === 2
      ? 'excellent'
      : comboCount === 3
      ? 'perfect'
      : 'unbelievable');

  // Vibrant arcade theme per callout
  const theme = useMemo(() => {
    switch (activeCallout) {
      case 'excellent':
        return {
          title: 'EXCELLENT!',
          koText: '엑설런트!',
          emoji: '⚡',
          gradientText: 'from-cyan-300 via-sky-400 to-blue-500',
          strokeColor: '#0c4a6e',
          glowColor: 'rgba(56, 189, 248, 0.95)',
          badgeBg: 'bg-cyan-500/25 border-cyan-400',
          badgeText: 'text-cyan-300',
        };
      case 'perfect':
        return {
          title: 'PERFECT!',
          koText: '퍼펙트!',
          emoji: '🔥',
          gradientText: 'from-amber-300 via-orange-400 to-rose-500',
          strokeColor: '#7c2d12',
          glowColor: 'rgba(249, 115, 22, 0.95)',
          badgeBg: 'bg-orange-500/25 border-orange-400',
          badgeText: 'text-orange-300',
        };
      case 'unbelievable':
        return {
          title: 'UNBELIEVABLE!',
          koText: '언빌리버블!',
          emoji: '👑',
          gradientText: 'from-fuchsia-300 via-purple-400 to-amber-300',
          strokeColor: '#4a044e',
          glowColor: 'rgba(217, 70, 239, 0.95)',
          badgeBg: 'bg-fuchsia-500/25 border-fuchsia-400',
          badgeText: 'text-fuchsia-300',
        };
      case 'great':
      default:
        return {
          title: 'GREAT!',
          koText: '그레잇!',
          emoji: '🌟',
          gradientText: 'from-yellow-200 via-amber-400 to-orange-500',
          strokeColor: '#78350f',
          glowColor: 'rgba(251, 191, 36, 0.95)',
          badgeBg: 'bg-amber-500/25 border-amber-400',
          badgeText: 'text-amber-300',
        };
    }
  }, [activeCallout]);

  // Generate 48 cascading particles streaming down from top to bottom
  const particles = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      left: 4 + ((i * 7.5) % 92),
      size: 22 + (i % 4) * 8,
      delay: (i * 0.02) % 0.35,
      duration: 1.1 + (i % 3) * 0.25,
      rotation: -180 + ((i * 47) % 360),
      driftX: -35 + ((i * 19) % 70),
      type: i % 3,
    }));
  }, [id]);

  const earnedCoins = 3 * Math.max(1, comboCount);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden select-none flex flex-col items-center">
      {/* 1. Dramatic Comic Action Burst & Popping Voice Announcer Banner */}
      <div className="absolute top-20 sm:top-24 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          key={`voice-pop-${id}`}
          initial={{ scale: 0.1, y: 30, rotate: -8, opacity: 0 }}
          animate={{
            scale: [0.1, 1.45, 0.92, 1.12, 1],
            y: [30, -10, 0],
            rotate: [-8, 6, -3, 1, 0],
            opacity: 1,
          }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{
            duration: 0.6,
            times: [0, 0.35, 0.65, 0.85, 1],
            ease: 'easeOut',
          }}
          className="relative flex flex-col items-center justify-center"
        >
          {/* Radial Pulsing Comic Starburst Backdrop */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.6, 1.3], opacity: [0, 0.85, 0.6] }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 rounded-full blur-3xl pointer-events-none -z-10"
            style={{ backgroundColor: theme.glowColor }}
          />

          {/* Side Pop Stars */}
          <motion.div
            initial={{ scale: 0, x: 0 }}
            animate={{ scale: [0, 1.4, 1], x: -75, rotate: -25 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="absolute left-0 text-3xl sm:text-4xl filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.9)]"
          >
            ⭐
          </motion.div>
          <motion.div
            initial={{ scale: 0, x: 0 }}
            animate={{ scale: [0, 1.4, 1], x: 75, rotate: 25 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="absolute right-0 text-3xl sm:text-4xl filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.9)]"
          >
            ✨
          </motion.div>

          {/* Main Voice Pop Text (e.g. "GREAT!", "EXCELLENT!", "PERFECT!") */}
          <div className="relative px-6 py-2">
            <h1
              className={`
                text-5xl sm:text-6xl md:text-7xl font-black italic tracking-wide uppercase
                bg-gradient-to-b ${theme.gradientText} bg-clip-text text-transparent
                filter drop-shadow-[0_6px_18px_rgba(0,0,0,0.9)]
              `}
              style={{
                WebkitTextStroke: `3px ${theme.strokeColor}`,
                textShadow: `0 0 35px ${theme.glowColor}, 0 6px 12px rgba(0,0,0,0.9)`,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {theme.title}
            </h1>
          </div>

          {/* Subtitle Pill with Voice Word in Korean + Combo Counter */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.35 }}
            className={`
              mt-1 px-4 py-1 rounded-full backdrop-blur-md border-2
              ${theme.badgeBg} ${theme.badgeText}
              flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.6)]
            `}
          >
            <span className="text-sm">{theme.emoji}</span>
            <span className="text-xs sm:text-sm font-black tracking-wide">
              {theme.koText} 콤보 x{comboCount}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-300">
              +{earnedCoins} 🪙
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* 2. Cascading Shower of Jellies, Golden Stars & Confetti Streamers (Photo 5) */}
      {particles.map(p => (
        <motion.div
          key={`particle-${id}-${p.id}`}
          initial={{
            y: -50,
            x: 0,
            opacity: 1,
            rotate: 0,
            scale: 0.6,
          }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 80 : 850,
            x: p.driftX,
            opacity: [1, 1, 1, 0.9, 0],
            rotate: p.rotation,
            scale: [0.6, 1.2, 0.95],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="absolute flex items-center justify-center filter drop-shadow-md"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        >
          {p.type === 0 ? (
            // Translucent glowing jelly orb
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-500 border border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center text-xs font-bold text-white">
              🫧
            </div>
          ) : p.type === 1 ? (
            // 3D Golden Star
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-600 border border-yellow-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_0_12px_rgba(251,191,36,0.8)] flex items-center justify-center text-sm font-black text-amber-950">
              ⭐
            </div>
          ) : (
            // Metallic holographic confetti streamer
            <div
              className="w-3.5 h-8 rounded-sm shadow-md"
              style={{
                background: `linear-gradient(135deg, ${
                  ['#38bdf8', '#f43f5e', '#a855f7', '#fbbf24', '#34d399'][p.id % 5]
                } 0%, #ffffff 100%)`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};
