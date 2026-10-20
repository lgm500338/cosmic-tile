import React from 'react';
import { motion } from 'motion/react';
import { TileThemeItem } from '../types/game';

export type AlienKind = 'cover' | 'vanish' | 'mystery';

/** 외계인 3종의 타일 색 (일반 하얀 천체 타일과 확실히 구분되게) */
export const ALIEN_TILE_STYLE: Record<AlienKind, { bg: string; border: string; shadow: string }> = {
  // ① 덮개 외계인: 보라 타일
  cover: {
    bg: 'bg-gradient-to-b from-[#8b5cf6] via-[#6d28d9] to-[#4c1d95]',
    border: 'border-[#a78bfa]',
    shadow: 'inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 5px rgba(30,10,60,0.45)',
  },
  // ② 사라지는 외계인: 남색 밤하늘 타일 위 분홍 UFO
  vanish: {
    bg: 'bg-gradient-to-b from-[#1e3a8a] via-[#172554] to-[#0b1230]',
    border: 'border-[#f472b6]',
    shadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -3px 5px rgba(0,0,0,0.5)',
  },
  // ③ 정체불명 외계인: 청록 타일 위 파란 외계인 + 물음표
  mystery: {
    bg: 'bg-gradient-to-b from-[#2dd4bf] via-[#0d9488] to-[#115e59]',
    border: 'border-[#99f6e4]',
    shadow: 'inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 5px rgba(4,47,46,0.5)',
  },
};

/** 사라지는 외계인은 밑에 천체가 없으므로 이름표 등에 쓸 자리표시 항목 */
export const VANISH_PLACEHOLDER: TileThemeItem = {
  id: 'alien_vanish',
  name: 'UFO',
  titleKo: 'UFO',
  emoji: '🛸',
  primaryColor: '#f472b6',
  glowColor: '#f472b6',
  textColor: '#ffffff',
  badgeBg: '#f472b6',
  symbolType: 'alien_vanish',
};

const shadowStyle = { overflow: 'visible' as const, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))' };

/** ① 덮개 외계인: 초록 얼굴 */
const CoverFace: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="8 2 84 92" className={className} style={shadowStyle}>
    <defs>
      <radialGradient id="alienHead" cx="40%" cy="30%" r="75%">
        <stop offset="0" stopColor="#ecfccb" />
        <stop offset="0.55" stopColor="#84cc16" />
        <stop offset="1" stopColor="#3f6212" />
      </radialGradient>
      <radialGradient id="alienEye" cx="35%" cy="30%" r="70%">
        <stop offset="0" stopColor="#334155" />
        <stop offset="1" stopColor="#020617" />
      </radialGradient>
    </defs>
    <line x1="38" y1="20" x2="30" y2="6" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
    <circle cx="30" cy="6" r="4.5" fill="#fde047" />
    <line x1="62" y1="20" x2="70" y2="6" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
    <circle cx="70" cy="6" r="4.5" fill="#fde047" />
    <path d="M50 16 C 76 16 90 36 86 56 C 82 76 64 92 50 92 C 36 92 18 76 14 56 C 10 36 24 16 50 16 Z" fill="url(#alienHead)" stroke="#365314" strokeWidth="2" />
    <ellipse cx="34" cy="52" rx="13" ry="17" transform="rotate(-28 34 52)" fill="url(#alienEye)" />
    <ellipse cx="66" cy="52" rx="13" ry="17" transform="rotate(28 66 52)" fill="url(#alienEye)" />
    <ellipse cx="30" cy="45" rx="4" ry="5.5" fill="#fff" opacity="0.9" />
    <ellipse cx="62" cy="45" rx="4" ry="5.5" fill="#fff" opacity="0.9" />
    <path d="M42 77 Q50 82 58 77" stroke="#365314" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <ellipse cx="38" cy="26" rx="10" ry="4" fill="#fff" opacity="0.35" />
  </svg>
);

/** ② 사라지는 외계인: 분홍 UFO와 그 안의 작은 외계인 */
const VanishUfo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="2 8 96 84" className={className} style={shadowStyle}>
    <defs>
      <linearGradient id="ufoBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fbcfe8" />
        <stop offset="0.5" stopColor="#ec4899" />
        <stop offset="1" stopColor="#9d174d" />
      </linearGradient>
      <radialGradient id="ufoDome" cx="40%" cy="30%" r="80%">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="1" stopColor="#67e8f9" stopOpacity="0.55" />
      </radialGradient>
      <linearGradient id="ufoBeam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fde68a" stopOpacity="0.8" />
        <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M36 60 L64 60 L76 92 L24 92 Z" fill="url(#ufoBeam)" />
    <ellipse cx="50" cy="40" rx="20" ry="18" fill="url(#ufoDome)" stroke="#a5f3fc" strokeWidth="1.5" />
    <circle cx="50" cy="40" r="8" fill="#a3e635" />
    <ellipse cx="46.5" cy="39" rx="2.4" ry="3.2" fill="#0f172a" />
    <ellipse cx="53.5" cy="39" rx="2.4" ry="3.2" fill="#0f172a" />
    <ellipse cx="50" cy="54" rx="44" ry="13" fill="url(#ufoBody)" stroke="#831843" strokeWidth="2" />
    <ellipse cx="50" cy="50" rx="30" ry="5" fill="#fff" opacity="0.3" />
    {[18, 34, 50, 66, 82].map(x => (
      <circle key={x} cx={x} cy={57} r={3.2} fill="#fde047" stroke="#a16207" strokeWidth="0.8" />
    ))}
  </svg>
);

/** ③ 정체불명 외계인: 파란 외계인 + 물음표 */
const MysteryFace: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="8 0 84 96" className={className} style={shadowStyle}>
    <defs>
      <radialGradient id="mysHead" cx="40%" cy="30%" r="75%">
        <stop offset="0" stopColor="#e0f2fe" />
        <stop offset="0.55" stopColor="#38bdf8" />
        <stop offset="1" stopColor="#075985" />
      </radialGradient>
    </defs>
    <path d="M50 24 C 74 24 86 42 84 60 C 82 78 66 92 50 92 C 34 92 18 78 16 60 C 14 42 26 24 50 24 Z" fill="url(#mysHead)" stroke="#0c4a6e" strokeWidth="2" />
    <ellipse cx="50" cy="56" rx="16" ry="14" fill="#0f172a" />
    <ellipse cx="45" cy="51" rx="5" ry="4" fill="#fff" opacity="0.9" />
    <path d="M42 80 Q50 85 58 80" stroke="#0c4a6e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    {/* 머리 위 큰 물음표 */}
    <text x="50" y="22" textAnchor="middle" fontSize="28" fontWeight="900" fill="#fde047" stroke="#92400e" strokeWidth="1.6" fontFamily="system-ui, sans-serif">?</text>
  </svg>
);

export const AlienFace: React.FC<{ kind?: AlienKind; className?: string }> = ({ kind = 'cover', className }) =>
  kind === 'vanish' ? <VanishUfo className={className} /> : kind === 'mystery' ? <MysteryFace className={className} /> : <CoverFace className={className} />;

/** 외계인을 눌렀을 때: 빙글 돌며 위로 날아가 사라진다 */
export const AlienFlyAway: React.FC<{ id: number; x: number; y: number; kind?: AlienKind }> = ({ id, x, y, kind = 'cover' }) => (
  <div className="fixed inset-0 pointer-events-none z-[95]">
    <motion.div
      key={id}
      initial={{ x: x - 24, y: y - 24, scale: 1, rotate: 0, opacity: 1 }}
      animate={
        kind === 'vanish'
          ? { x: x - 24 + 140, y: y - 24 - 260, scale: 0.3, rotate: -20, opacity: 0 }
          : { x: x - 24 + 60, y: y - 24 - 220, scale: 0.4, rotate: 300, opacity: 0 }
      }
      transition={{ duration: 0.85, ease: [0.3, 0, 0.7, 1] }}
      className="absolute left-0 top-0 w-12 h-12"
    >
      <AlienFace kind={kind} className="w-12 h-12" />
    </motion.div>
  </div>
);
