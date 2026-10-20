import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppLanguage, TileThemeItem } from '../types/game';
import { CELESTIAL_ENGLISH } from '../data/celestialEnglish';
import { soundManager } from '../utils/audio';
import { AlienFace, AlienKind, ALIEN_TILE_STYLE } from './AlienTile';

interface JellyTileProps {
  item: TileThemeItem;
  isCovered?: boolean;
  isAlien?: boolean; // 외계인이 숨긴 타일
  alienKind?: AlienKind;
  isInDock?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  layer?: number;
  highlightMatch?: boolean;
  showTileText?: boolean;
  language?: AppLanguage;
  isBlockedShaking?: boolean;
  onBlockedClick?: () => void;
}

// 그림마다 실제로 그려진 범위에 맞춘 보기 영역 → 작게 그려진 천체(데이모스·포보스 등)도 타일을 꽉 채운다
const TIGHT_VIEWBOX: Record<string, string> = {
 "mercury": "5.5 5.5 33.0 33.0",
 "venus": "5.5 5.5 33.0 33.0",
 "earth": "5.5 5.5 33.0 33.0",
 "moon": "5.5 5.5 33.0 33.0",
 "iss": "4.5 2.2 35.0 35.0",
 "mars": "5.2 5.0 33.5 33.5",
 "phobos": "9.9 9.5 25.7 25.7",
 "deimos": "12.1 12.0 20.8 20.8",
 "ceres": "6.0 6.0 32.0 32.0",
 "vesta": "9.8 9.8 25.1 25.1",
 "pallas": "6.0 6.0 32.0 32.0",
 "bennu": "6.5 6.5 31.0 31.0",
 "jupiter": "5.5 5.5 33.0 33.0",
 "io": "6.0 6.0 32.0 32.0",
 "europa": "6.0 6.0 32.0 32.0",
 "ganymede": "5.5 5.5 33.0 33.0",
 "saturn": "1.5 1.5 41.0 41.0",
 "titan": "5.5 5.5 33.0 33.0",
 "enceladus": "3.8 6.0 36.5 36.5",
 "mimas": "6.0 6.0 32.0 32.0",
 "uranus": "2.5 2.5 39.0 39.0",
 "neptune": "5.5 5.5 33.0 33.0",
 "triton": "6.0 6.0 32.0 32.0",
 "miranda": "6.0 6.0 32.0 32.0",
 "pluto": "5.5 5.5 33.0 33.0",
 "charon": "5.2 4.5 33.5 33.5",
 "makemake": "6.0 6.0 32.0 32.0",
 "haumea": "0.1 0.1 43.7 43.7",
 "halley": "9.0 2.5 34.5 34.5",
 "oumuamua": "2.6 2.7 38.8 38.8",
 "borisov": "9.5 3.5 32.0 32.0",
 "comet67p": "8.5 9.5 25.5 25.5",
 "orion": "6.5 6.5 31.0 31.0",
 "crab": "7.5 7.5 29.0 29.0",
 "ring": "5.5 5.5 33.0 33.0",
 "helix": "5.5 5.5 33.0 33.0",
 "sun": "4.5 4.5 35.0 35.0",
 "sirius": "4.5 4.5 35.0 35.0",
 "betelgeuse": "5.0 5.0 34.0 34.0",
 "pulsar": "2.5 2.5 39.0 39.0",
 "andromeda": "1.3 1.3 41.4 41.4",
 "blackhole": "2.5 2.5 39.0 39.0",
 "sombrero": "2.5 2.5 39.0 39.0",
 "quasar": "2.5 2.5 39.0 39.0"
};
const vb = (symbolType: string) => TIGHT_VIEWBOX[symbolType] || '0 0 44 44';

// 비슷해 보이던 천체들의 색을 확실히 다르게 (회청색 공 6개, 빨간 공 3개, 노란 공 3개, 주황 공 3개, 혜성 2개)
const SYMBOL_TINT: Record<string, string> = {
  mercury: 'sepia(0.7) saturate(0.9) brightness(0.72)', // 어두운 갈회색
  ceres: 'grayscale(1) brightness(1.3) contrast(1.1)', // 밝은 은백색
  deimos: 'sepia(1) saturate(1.4) hue-rotate(45deg) brightness(0.8)', // 올리브색
  mimas: 'hue-rotate(-35deg) saturate(1.6) brightness(1.2)', // 얼음빛 청록
  ganymede: 'sepia(1) saturate(1.3) hue-rotate(-35deg) brightness(0.7)', // 진한 밤색
  charon: 'grayscale(0.85) brightness(0.95)', // 회색 + 붉은 극관
  moon: 'saturate(0.25) brightness(1.18)', // 크림빛 달
  makemake: 'hue-rotate(-25deg) saturate(0.75) brightness(0.62)', // 적갈색
  mars: 'hue-rotate(24deg) saturate(0.9) brightness(0.88)', // 녹슨 주황색
  betelgeuse: 'hue-rotate(-28deg) saturate(1.2)', // 분홍빛 적색 거성
  venus: 'saturate(0.55) brightness(1.2)', // 연한 크림 노랑
  vesta: 'grayscale(0.75) sepia(0.45) brightness(0.88)', // 회갈색 바위
  miranda: 'grayscale(0.9) brightness(1.15)', // 회백색
  borisov: 'hue-rotate(125deg) saturate(1.3)', // 보라·분홍 혜성
  helix: 'hue-rotate(70deg) saturate(1.2)', // 노랑·보라 고리
};

// Custom rich vector graphic renderer for all 44 distinct celestial bodies
export const renderTileGraphic = (symbolType: string, _isCovered: boolean = false, emoji: string = '✨', size: 'sm' | 'md' | 'lg' = 'md') => {
  // Retain identical vibrant colors whether in front or behind (user request 9: 타일 뒤에 있을 때 색이 달라지지 않도록 동일 유지)
  // 색을 진하고 또렷하게 (채도·명암 강화) + 타일에서 떠 보이는 그림자
  const filterStyle = 'saturate(1.9) contrast(1.25) drop-shadow(0 3px 4px rgba(0,0,0,0.38))';

  const baseSvg = size === 'sm' ? 'w-[30px] h-[30px] transition-transform' : 'w-[54px] h-[54px] sm:w-[58px] sm:h-[58px] transition-transform';

  switch (symbolType) {
    // --- 1. 수성과 금성 ---
    case 'mercury':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_mercury)" />
          <circle cx="16" cy="18" r="3" fill="#64748b" opacity="0.75" />
          <circle cx="26" cy="24" r="3.8" fill="#64748b" opacity="0.65" />
          <circle cx="20" cy="29" r="2" fill="#64748b" opacity="0.75" />
          <circle cx="27" cy="15" r="1.8" fill="#64748b" opacity="0.65" />
          <ellipse cx="17" cy="14" rx="7" ry="3" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_mercury" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'venus':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_venus)" />
          <path d="M 8 18 Q 22 22 36 17" stroke="#fef08a" strokeWidth="2.5" fill="none" opacity="0.85" />
          <path d="M 7 24 Q 22 28 37 23" stroke="#b45309" strokeWidth="2.8" fill="none" opacity="0.75" />
          <path d="M 11 29 Q 22 33 33 30" stroke="#fef08a" strokeWidth="2" fill="none" opacity="0.6" />
          <ellipse cx="17" cy="14" rx="7" ry="3" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_venus" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
        </svg>
      );

    // --- 2. 지구와 달, ISS ---
    case 'earth':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_earth)" />
          <path d="M 14 16 Q 19 13 22 17 Q 24 22 19 25 Q 14 23 14 16 Z" fill="#22c55e" opacity="0.9" />
          <path d="M 23 20 Q 28 17 31 22 Q 29 27 25 28 Z" fill="#16a34a" opacity="0.9" />
          <path d="M 17 28 Q 22 29 24 33 Q 19 36 17 28 Z" fill="#22c55e" opacity="0.85" />
          <path d="M 9 20 Q 18 22 27 18" stroke="#ffffff" strokeWidth="1.8" fill="none" opacity="0.55" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_earth" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'moon':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_moon)" />
          <circle cx="17" cy="17" r="3.2" fill="#d97706" opacity="0.4" />
          <circle cx="26" cy="20" r="2.2" fill="#d97706" opacity="0.35" />
          <circle cx="20" cy="27" r="4" fill="#d97706" opacity="0.4" />
          <circle cx="27" cy="28" r="2" fill="#d97706" opacity="0.3" />
          <ellipse cx="16" cy="14" rx="6" ry="3" fill="#ffffff" opacity="0.6" />
          <defs>
            <linearGradient id="grad_moon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="60%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'iss':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Main Module Truss */}
          <rect x="18" y="20" width="8" height="4" rx="1" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
          {/* Solar Arrays Left & Right */}
          <rect x="6" y="16" width="10" height="12" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          <line x1="6" y1="22" x2="16" y2="22" stroke="#bae6fd" strokeWidth="0.8" />
          <line x1="11" y1="16" x2="11" y2="28" stroke="#bae6fd" strokeWidth="0.8" />
          <rect x="28" y="16" width="10" height="12" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          <line x1="28" y1="22" x2="38" y2="22" stroke="#bae6fd" strokeWidth="0.8" />
          <line x1="33" y1="16" x2="33" y2="28" stroke="#bae6fd" strokeWidth="0.8" />
          {/* Antenna */}
          <line x1="22" y1="20" x2="22" y2="13" stroke="#e2e8f0" strokeWidth="1.2" />
          <circle cx="22" cy="13" r="1.5" fill="#f43f5e" />
        </svg>
      );

    // --- 3. 화성, 포보스, 데이모스 ---
    case 'mars':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_mars)" />
          {/* Dark Maria & Canyons */}
          <path d="M 11 20 Q 18 24 23 20 Q 30 22 34 19 Q 32 26 22 28 Q 12 25 11 20 Z" fill="#881337" opacity="0.65" />
          {/* Olympus Mons volcano dot */}
          <circle cx="16" cy="18" r="2.8" fill="#fda4af" opacity="0.8" stroke="#9f1239" strokeWidth="0.8" />
          {/* North Polar Ice Cap */}
          <ellipse cx="22" cy="9" rx="7" ry="2.5" fill="#ffffff" opacity="0.9" />
          <ellipse cx="17" cy="14" rx="6" ry="2.5" fill="#ffffff" opacity="0.35" />
          <defs>
            <linearGradient id="grad_mars" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'phobos':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Irregular Potato Shape */}
          <path
            d="M 12 18 Q 15 10 26 12 Q 35 15 34 26 Q 31 34 20 33 Q 9 30 12 18 Z"
            fill="url(#grad_phobos)"
            stroke="#57534e"
            strokeWidth="1"
          />
          {/* Giant Stickney Crater */}
          <circle cx="18" cy="20" r="5" fill="#44403c" opacity="0.85" />
          <circle cx="27" cy="26" r="2.5" fill="#44403c" opacity="0.75" />
          <circle cx="28" cy="16" r="2" fill="#44403c" opacity="0.7" />
          <ellipse cx="20" cy="15" rx="5" ry="2" fill="#ffffff" opacity="0.35" />
          <defs>
            <linearGradient id="grad_phobos" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a8a29e" />
              <stop offset="100%" stopColor="#57534e" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'deimos':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Smooth lumpy dusty asteroid */}
          <path
            d="M 14 20 Q 16 12 25 14 Q 33 17 31 25 Q 29 32 20 31 Q 12 28 14 20 Z"
            fill="url(#grad_deimos)"
          />
          <circle cx="22" cy="19" r="2.8" fill="#52525b" opacity="0.5" />
          <circle cx="18" cy="24" r="2" fill="#52525b" opacity="0.4" />
          <circle cx="26" cy="25" r="1.8" fill="#52525b" opacity="0.4" />
          <ellipse cx="19" cy="16" rx="4" ry="1.8" fill="#ffffff" opacity="0.4" />
          <defs>
            <linearGradient id="grad_deimos" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d4d4d8" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>
          </defs>
        </svg>
      );

    // --- 4. 소행성대: 세레스, 베스타, 팔라스, 베누 ---
    case 'ceres':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_ceres)" />
          {/* Occator Crater Bright Salt Spot (신비로운 하얀 소금점) */}
          <circle cx="20" cy="19" r="3.2" fill="#ffffff" opacity="0.95" />
          <circle cx="20" cy="19" r="1.8" fill="#f8fafc" />
          <circle cx="26" cy="26" r="2.2" fill="#475569" opacity="0.5" />
          <circle cx="15" cy="25" r="2" fill="#475569" opacity="0.5" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.5" />
          <defs>
            <linearGradient id="grad_ceres" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'vesta':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Irregular Rocky Protoplanet */}
          <path
            d="M 12 18 Q 18 10 28 12 Q 35 18 33 27 Q 29 34 19 33 Q 9 27 12 18 Z"
            fill="url(#grad_vesta)"
          />
          {/* Massive Rheasilvia South Pole Crater */}
          <ellipse cx="23" cy="27" rx="7" ry="3.5" fill="#451a03" opacity="0.75" />
          <circle cx="23" cy="27" r="1.5" fill="#f59e0b" opacity="0.8" />
          <path d="M 14 19 Q 22 22 29 18" stroke="#78350f" strokeWidth="1.5" fill="none" opacity="0.6" />
          <ellipse cx="20" cy="14" rx="5" ry="2" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_vesta" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'pallas':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_pallas)" />
          <circle cx="16" cy="18" r="3.5" fill="#3b0764" opacity="0.75" />
          <circle cx="26" cy="24" r="3" fill="#3b0764" opacity="0.7" />
          <circle cx="20" cy="29" r="2.2" fill="#3b0764" opacity="0.7" />
          <ellipse cx="17" cy="14" rx="6" ry="2.5" fill="#ffffff" opacity="0.4" />
          <defs>
            <linearGradient id="grad_pallas" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="60%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'bennu':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Diamond faceted spinning asteroid */}
          <polygon points="22,8 34,18 31,31 22,36 13,31 10,18" fill="url(#grad_bennu)" stroke="#0f766e" strokeWidth="1" />
          <polygon points="22,8 34,18 22,23" fill="#2dd4bf" opacity="0.6" />
          <polygon points="10,18 22,8 22,23" fill="#14b8a6" opacity="0.8" />
          <polygon points="10,18 22,23 13,31" fill="#0d9488" opacity="0.9" />
          <polygon points="34,18 31,31 22,23" fill="#042f2e" opacity="0.5" />
          <defs>
            <linearGradient id="grad_bennu" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#115e59" />
            </linearGradient>
          </defs>
        </svg>
      );

    // --- 5. 목성과 갈릴레이 위성들 ---
    case 'jupiter':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_jupiter)" />
          {/* Banded Gas Belts */}
          <path d="M 7 14 Q 22 17 37 14" stroke="#c2410c" strokeWidth="3" fill="none" opacity="0.85" />
          <path d="M 7 19 Q 22 22 37 19" stroke="#fed7aa" strokeWidth="2" fill="none" opacity="0.9" />
          <path d="M 7 24 Q 22 27 37 24" stroke="#9a3412" strokeWidth="3.2" fill="none" opacity="0.85" />
          <path d="M 7 29 Q 22 31 37 29" stroke="#c2410c" strokeWidth="2.5" fill="none" opacity="0.8" />
          {/* Great Red Spot (대적점) */}
          <ellipse cx="27" cy="25" rx="4" ry="2.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.8" />
          <ellipse cx="17" cy="12" rx="6" ry="2.5" fill="#ffffff" opacity="0.4" />
          <defs>
            <linearGradient id="grad_jupiter" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'io':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_io)" />
          {/* Active Sulfur Volcanoes (화산 폭발 분화구) */}
          <circle cx="16" cy="18" r="3" fill="#b91c1c" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="26" cy="23" r="3.5" fill="#c2410c" stroke="#fef08a" strokeWidth="1" />
          <circle cx="20" cy="28" r="2.2" fill="#b91c1c" />
          {/* Eruption plume glow */}
          <circle cx="16" cy="18" r="1.2" fill="#fef08a" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.5" />
          <defs>
            <linearGradient id="grad_io" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'europa':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_europa)" />
          {/* Lineae Reddish Fractured Ice Cracks (얼음 균열선) */}
          <path d="M 8 16 Q 18 20 25 15 Q 31 18 36 24" stroke="#b45309" strokeWidth="1.2" fill="none" opacity="0.75" />
          <path d="M 12 28 Q 20 22 28 26 Q 34 22 36 17" stroke="#9a3412" strokeWidth="1.2" fill="none" opacity="0.75" />
          <path d="M 17 11 Q 22 22 19 33" stroke="#b45309" strokeWidth="1.1" fill="none" opacity="0.65" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.6" />
          <defs>
            <linearGradient id="grad_europa" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="60%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'ganymede':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_ganymede)" />
          <path d="M 10 18 Q 22 14 34 18 Q 28 26 18 25 Z" fill="#334155" opacity="0.7" />
          <circle cx="24" cy="28" r="3.5" fill="#1e293b" opacity="0.6" />
          <circle cx="15" cy="29" r="2.5" fill="#1e293b" opacity="0.5" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_ganymede" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
        </svg>
      );

    // --- 6. 토성과 고리의 위성들 ---
    case 'saturn':
    case 'saturn_h':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Back Ring */}
          <ellipse cx="22" cy="22" rx="19" ry="6.5" fill="none" stroke="url(#ring_grad)" strokeWidth="3.8" strokeDasharray="30 40" strokeDashoffset="15" />
          {/* Planet Body */}
          <circle cx="22" cy="22" r="11" fill="url(#saturn_body)" />
          {/* Surface bands */}
          <path d="M 12 20 Q 22 22 32 20" stroke="#fde047" strokeWidth="1.2" fill="none" opacity="0.7" />
          <path d="M 12 24 Q 22 26 32 24" stroke="#d97706" strokeWidth="1.4" fill="none" opacity="0.7" />
          {/* Front Ring */}
          <ellipse cx="22" cy="22" rx="19" ry="6.5" fill="none" stroke="url(#ring_grad)" strokeWidth="3.8" strokeDasharray="40 30" strokeDashoffset="-10" />
          <ellipse cx="18" cy="15" rx="5" ry="2" fill="#ffffff" opacity="0.5" />
          <defs>
            <linearGradient id="saturn_body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="ring_grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'titan':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Dense Orange Nitrogen Smog Atmosphere */}
          <circle cx="22" cy="22" r="15" fill="url(#grad_titan)" />
          {/* Methane Lake on top */}
          <path d="M 16 14 Q 22 17 28 14 Q 25 18 19 18 Z" fill="#451a03" opacity="0.6" />
          <ellipse cx="17" cy="12" rx="6" ry="2.5" fill="#ffffff" opacity="0.5" />
          <defs>
            <linearGradient id="grad_titan" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'enceladus':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_enceladus)" />
          {/* South Polar Tiger Stripe Geysers (얼음 간헐천 분출) */}
          <path d="M 17 32 L 14 39" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <path d="M 22 34 L 22 41" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" opacity="0.95" />
          <path d="M 27 32 L 30 39" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.75" />
          <defs>
            <linearGradient id="grad_enceladus" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'mimas':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_mimas)" />
          {/* Giant Herschel Crater "Death Star Eye" */}
          <circle cx="18" cy="19" r="6" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
          <circle cx="18" cy="19" r="1.8" fill="#94a3b8" />
          <circle cx="27" cy="26" r="2.5" fill="#475569" opacity="0.6" />
          <ellipse cx="23" cy="12" rx="5" ry="2" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_mimas" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>
        </svg>
      );

    // --- 7. 천왕성과 해왕성, 트리톤, 미란다 ---
    case 'uranus':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Vertical Faint Ring */}
          <ellipse cx="22" cy="22" rx="6" ry="18" fill="none" stroke="#67e8f9" strokeWidth="1.5" opacity="0.7" />
          <circle cx="22" cy="22" r="12" fill="url(#grad_uranus)" />
          <ellipse cx="19" cy="15" rx="5" ry="2" fill="#ffffff" opacity="0.55" />
          <defs>
            <linearGradient id="grad_uranus" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'neptune':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_neptune)" />
          {/* Great Dark Spot storm */}
          <ellipse cx="25" cy="20" rx="4" ry="2.5" fill="#1e1b4b" opacity="0.8" />
          {/* White cirrus storm clouds */}
          <path d="M 12 16 Q 19 18 27 15" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.85" />
          <path d="M 16 26 Q 24 29 32 26" stroke="#bae6fd" strokeWidth="1.5" fill="none" opacity="0.8" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_neptune" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'triton':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_triton)" />
          {/* Dark Nitrogen Geyser plumes */}
          <path d="M 15 28 L 13 23" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <path d="M 26 27 L 28 21" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.6" />
          <defs>
            <linearGradient id="grad_triton" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="50%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'miranda':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_miranda)" />
          {/* Verona Rupes 20km sheer cliff chevron lines */}
          <path d="M 10 20 L 22 28 L 34 19" stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 12 15 L 22 23 L 32 14" stroke="#475569" strokeWidth="1.5" fill="none" opacity="0.7" />
          <ellipse cx="18" cy="13" rx="5" ry="2" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_miranda" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
        </svg>
      );

    // --- 8. 카이퍼 벨트: 명왕성, 카론, 마케마케, 하우메아 ---
    case 'pluto':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="url(#grad_pluto)" />
          {/* Sputnik Planitia Giant Cream-White Heart Glacier (하트 모양 빙하) */}
          <path
            d="M 23 18 C 23 15 20 13 17 14 C 14 15 13 18 13 21 C 13 26 21 30 23 31 C 25 30 33 26 33 21 C 33 18 32 15 29 14 C 26 13 23 15 23 18 Z"
            fill="#fffbeb"
            stroke="#fef3c7"
            strokeWidth="0.8"
            opacity="0.95"
          />
          <ellipse cx="17" cy="12" rx="5" ry="2" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_pluto" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'charon':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_charon)" />
          {/* Mordor Macula Reddish North Pole Cap */}
          <ellipse cx="22" cy="10" rx="9" ry="4" fill="#991b1b" opacity="0.85" />
          <circle cx="17" cy="25" r="2.8" fill="#334155" opacity="0.6" />
          <circle cx="26" cy="23" r="3.2" fill="#334155" opacity="0.5" />
          <ellipse cx="18" cy="14" rx="5" ry="2" fill="#ffffff" opacity="0.4" />
          <defs>
            <linearGradient id="grad_charon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'makemake':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="14.5" fill="url(#grad_makemake)" />
          <circle cx="16" cy="19" r="2.8" fill="#450a0a" opacity="0.6" />
          <circle cx="26" cy="24" r="3.5" fill="#450a0a" opacity="0.55" />
          <ellipse cx="17" cy="13" rx="6" ry="2.5" fill="#ffffff" opacity="0.45" />
          <defs>
            <linearGradient id="grad_makemake" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'haumea':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Rapid spinning Rugby Ball Ellipsoid (길쭉한 럭비공 왜소행성) */}
          <ellipse cx="22" cy="22" rx="18" ry="11" fill="url(#grad_haumea)" transform="rotate(-15 22 22)" />
          {/* Ring */}
          <ellipse cx="22" cy="22" rx="20" ry="4" fill="none" stroke="#bae6fd" strokeWidth="1" opacity="0.65" transform="rotate(-15 22 22)" />
          <ellipse cx="18" cy="18" rx="6" ry="2" fill="#ffffff" opacity="0.6" transform="rotate(-15 22 22)" />
          <defs>
            <linearGradient id="grad_haumea" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>
        </svg>
      );

    // --- 9. 혜성과 성간 천체 ---
    case 'halley':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Long blue gas ion tail */}
          <path d="M 26 18 Q 38 10 42 6 L 36 26 Z" fill="url(#tail_halley)" opacity="0.75" />
          <circle cx="18" cy="26" r="7.5" fill="url(#grad_halley)" />
          <circle cx="16" cy="24" r="2" fill="#ffffff" opacity="0.8" />
          <defs>
            <linearGradient id="grad_halley" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="tail_halley" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'oumuamua':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Elongated Cigar Shaped Interstellar Rock */}
          <ellipse cx="22" cy="22" rx="18" ry="5.5" fill="url(#grad_oumuamua)" transform="rotate(-35 22 22)" />
          <circle cx="16" cy="26" r="1.5" fill="#450a0a" transform="rotate(-35 22 22)" />
          <circle cx="26" cy="18" r="1.5" fill="#450a0a" transform="rotate(-35 22 22)" />
          <defs>
            <linearGradient id="grad_oumuamua" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'borisov':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <path d="M 24 20 L 40 8 L 32 30 Z" fill="#34d399" opacity="0.6" />
          <circle cx="18" cy="24" r="7" fill="url(#grad_borisov)" />
          <defs>
            <linearGradient id="grad_borisov" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'comet67p':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Rubber ducky two-lobed comet */}
          <circle cx="18" cy="24" r="8" fill="#44403c" />
          <circle cx="27" cy="18" r="5.5" fill="#57534e" />
          <ellipse cx="22" cy="20" rx="3" ry="5" fill="#292524" />
          <circle cx="16" cy="22" r="1.5" fill="#1c1917" />
        </svg>
      );

    // --- 10. 성운들 ---
    case 'orion':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Pink Glowing Nebula Clouds */}
          <circle cx="19" cy="20" r="11" fill="#ec4899" opacity="0.75" />
          <circle cx="26" cy="23" r="10" fill="#a855f7" opacity="0.8" />
          <circle cx="22" cy="26" r="9" fill="#f43f5e" opacity="0.75" />
          {/* Newborn stars */}
          <circle cx="22" cy="22" r="2" fill="#ffffff" />
          <circle cx="17" cy="17" r="1.2" fill="#fef08a" />
          <circle cx="28" cy="25" r="1.5" fill="#ffffff" />
        </svg>
      );

    case 'crab':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="13" fill="#f97316" opacity="0.7" />
          <path d="M 12 14 Q 22 22 32 12 M 10 26 Q 22 22 34 26 M 15 32 Q 22 18 29 32" stroke="#06b6d4" strokeWidth="1.8" fill="none" opacity="0.85" />
          <circle cx="22" cy="22" r="3" fill="#ffffff" />
        </svg>
      );

    case 'ring':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <ellipse cx="22" cy="22" rx="15" ry="12" fill="none" stroke="#06b6d4" strokeWidth="5" opacity="0.9" />
          <ellipse cx="22" cy="22" rx="15" ry="12" fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.8" />
          <circle cx="22" cy="22" r="2" fill="#ffffff" />
        </svg>
      );

    case 'helix':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15" fill="none" stroke="#ef4444" strokeWidth="4" opacity="0.85" />
          <circle cx="22" cy="22" r="10" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.9" />
          <circle cx="22" cy="22" r="3" fill="#ffffff" />
        </svg>
      );

    // --- 11. 항성의 일생: 태양, 시리우스, 베텔게우스, 펄서 ---
    case 'sun':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Corona Rays */}
          <circle cx="22" cy="22" r="16" fill="#fde047" opacity="0.4" />
          <circle cx="22" cy="22" r="13" fill="url(#grad_sun)" />
          {/* Solar flares */}
          <path d="M 22 6 L 24 9 L 20 9 Z" fill="#ef4444" />
          <path d="M 38 22 L 35 24 L 35 20 Z" fill="#ef4444" />
          <path d="M 22 38 L 20 35 L 24 35 Z" fill="#ef4444" />
          <circle cx="19" cy="18" r="1.5" fill="#78350f" />
          <circle cx="25" cy="24" r="1.8" fill="#78350f" />
          <ellipse cx="17" cy="15" rx="5" ry="2" fill="#ffffff" opacity="0.6" />
          <defs>
            <linearGradient id="grad_sun" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'sirius':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <polygon points="22,6 26,18 38,22 26,26 22,38 18,26 6,22 18,18" fill="url(#grad_sirius)" />
          <circle cx="22" cy="22" r="5" fill="#ffffff" />
          <defs>
            <linearGradient id="grad_sirius" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'betelgeuse':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="15.5" fill="url(#grad_betelgeuse)" />
          <circle cx="16" cy="18" r="4" fill="#fb7185" opacity="0.6" />
          <circle cx="27" cy="24" r="5" fill="#fb7185" opacity="0.5" />
          <ellipse cx="17" cy="12" rx="6" ry="2.5" fill="#ffffff" opacity="0.5" />
          <defs>
            <linearGradient id="grad_betelgeuse" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'pulsar':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Twin energetic beam cones */}
          <polygon points="22,22 10,4 34,4" fill="#38bdf8" opacity="0.75" />
          <polygon points="22,22 10,40 34,40" fill="#38bdf8" opacity="0.75" />
          <circle cx="22" cy="22" r="8" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
        </svg>
      );

    // --- 12. 은하와 블랙홀 ---
    case 'andromeda':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Spiral Galaxy Arms */}
          <ellipse cx="22" cy="22" rx="17" ry="9" fill="url(#grad_andromeda)" transform="rotate(-30 22 22)" />
          <circle cx="22" cy="22" r="4.5" fill="#ffffff" />
          <defs>
            <linearGradient id="grad_andromeda" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'blackhole':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          {/* Accretion Disk */}
          <ellipse cx="22" cy="22" rx="18" ry="7" fill="none" stroke="url(#bh_acc)" strokeWidth="4" />
          <ellipse cx="22" cy="22" rx="18" ry="7" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.9" />
          {/* Pure Black Event Horizon */}
          <circle cx="22" cy="22" r="8.5" fill="#000000" stroke="#f97316" strokeWidth="1.2" />
          <defs>
            <linearGradient id="bh_acc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'sombrero':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <circle cx="22" cy="22" r="8" fill="#ffffff" opacity="0.9" />
          <ellipse cx="22" cy="22" rx="18" ry="4" fill="#e2e8f0" opacity="0.75" />
          {/* Dark dust lane */}
          <path d="M 5 22 Q 22 24 39 22" stroke="#292524" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'quasar':
      return (
        <svg viewBox={vb(symbolType)} className={baseSvg} style={{ filter: (SYMBOL_TINT[symbolType] ? SYMBOL_TINT[symbolType] + ' ' : '') + filterStyle, overflow: 'visible' }}>
          <line x1="22" y1="4" x2="22" y2="40" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
          <circle cx="22" cy="22" r="9" fill="#facc15" />
          <circle cx="22" cy="22" r="4" fill="#ffffff" />
        </svg>
      );

    default:
      return (
        <span className="text-3xl leading-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] select-none">
          {emoji}
        </span>
      );
  }
};

export const JellyTile: React.FC<JellyTileProps> = ({
  item,
  isCovered = false,
  isAlien = false,
  alienKind = 'cover',
  isInDock = false,
  onClick,
  size = 'md',
  layer = 0,
  highlightMatch = false,
  showTileText = false,
  language = 'ko',
  isBlockedShaking = false,
  onBlockedClick,
}) => {
  const [localShake, setLocalShake] = useState(false);
  const isShaking = isBlockedShaking || localShake;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCovered) {
      soundManager.playBlocked();
      setLocalShake(true);
      setTimeout(() => setLocalShake(false), 380);
      if (onBlockedClick) {
        onBlockedClick();
      }
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const sizeClasses = {
    sm: 'w-[36px] h-[44px] text-xs',
    md: 'w-[62px] h-[72px] text-base',
    lg: 'w-[70px] h-[82px] text-lg',
  }[size];

  // Natural physical drop shadow based on layer elevation (Photo 4)
  const elevationShadow = isCovered
    ? 'shadow-[0_3px_6px_rgba(0,0,0,0.38)]'
    : isInDock
    ? 'shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
    : [
        'shadow-[0_3px_0_rgba(180,160,140,0.85),0_6px_8px_rgba(0,0,0,0.22)]',
        'shadow-[0_4px_0_rgba(180,160,140,0.9),0_8px_12px_rgba(0,0,0,0.28)]',
        'shadow-[0_5px_0_rgba(170,150,130,0.95),0_10px_16px_rgba(0,0,0,0.32)]',
        'shadow-[0_6px_0_rgba(160,140,120,1.0),0_12px_20px_rgba(0,0,0,0.36)]',
        'shadow-[0_7px_0_rgba(150,130,110,1.0),0_14px_24px_rgba(0,0,0,0.4)]',
      ][Math.min(layer, 4)];

  // Strictly follow user's `showTileText` setting!
  // When false (default): NEVER show label on any tile (pure clean illustration, 0 text labels).
  // When true: Show label on all active tiles with labelText.
  const labelText = language === 'en'
    ? (item.shortLabelEn || CELESTIAL_ENGLISH[item.id]?.shortLabel || item.name.slice(0, 3).toUpperCase())
    : item.shortLabel;
  const shouldShowLabel = Boolean(showTileText) && Boolean(labelText) && size !== 'sm' && !isCovered && !isAlien;

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={!isCovered && !isInDock ? { scale: 1.05, y: -2 } : {}}
      whileTap={
        isCovered
          ? { scale: 0.96 }
          : {
              scaleX: 1.15,
              scaleY: 0.85,
              y: 2,
              transition: { type: 'spring', stiffness: 500, damping: 15 },
            }
      }
      animate={
        isShaking
          ? {
              x: [0, -7, 7, -6, 6, -3, 3, 0],
              rotate: [0, -4, 4, -3, 3, -1, 1, 0],
              transition: { duration: 0.35, ease: 'easeInOut' },
            }
          : highlightMatch
          ? {
              scale: [1, 1.25, 0.95, 1.1, 0],
              opacity: [1, 1, 1, 0.8, 0],
              rotate: [0, -8, 8, -4, 0],
              transition: { duration: 0.25 },
            }
          : { scale: 1, opacity: 1, x: 0, rotate: 0 }
      }
      className={`
        relative select-none flex flex-col items-center justify-center
        rounded-2xl outline-none transition-all duration-200
        ${sizeClasses}
        ${elevationShadow}
        ${
          isCovered
            ? 'cursor-pointer active:brightness-95'
            : 'cursor-pointer active:shadow-none'
        }
      `}
      style={{
        touchAction: 'manipulation',
      }}
    >
      {/* 1. Cream Ivory / Porcelain Ceramic Substrate Block (일관된 고품격 포슬린 타일 - 덮여있어도 색상 변형 없음) */}
      <div
        className={`absolute inset-0 rounded-2xl border transition-all duration-300 ${
          isAlien
            ? `${ALIEN_TILE_STYLE[alienKind].bg} ${ALIEN_TILE_STYLE[alienKind].border}`
            : 'bg-gradient-to-b from-[#ffffff] via-[#faf7f0] to-[#f4eee1] border-[#e2d9c8]'
        }`}
        style={{
          boxShadow: isAlien
            ? ALIEN_TILE_STYLE[alienKind].shadow
            : 'inset 0 2px 3px rgba(255,255,255,1), inset 0 -3px 4px rgba(180,160,130,0.2)',
        }}
      />

      {/* 2. Top Porcelain Glint Reflection */}
      <div
        className="absolute top-1 left-1.5 w-3/4 h-2 rounded-full pointer-events-none opacity-85"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 100%)',
        }}
      />

      {/* 3. Center Illustration: Maximized size so pictures are clear & prominent! */}
      <div
        className={`
          relative z-10 flex flex-col items-center justify-center transition-transform duration-200
          ${shouldShowLabel ? '-mt-1' : ''}
          opacity-100
        `}
      >
        {isAlien ? (
          <AlienFace kind={alienKind} className={size === 'sm' ? 'w-[30px] h-[30px]' : 'w-[52px] h-[52px] sm:w-[56px] sm:h-[56px]'} />
        ) : (
          renderTileGraphic(item.symbolType, isCovered, item.emoji, size)
        )}

        {/* Mixed small subtle 2-3 char planet name (한 레벨에 글이 있는 것과 없는 것이 함께 등장!) */}
        {shouldShowLabel && (
          <span className="text-[8px] sm:text-[8.5px] font-black tracking-tight text-slate-900 bg-white/80 px-1.5 py-[1px] rounded-full border border-slate-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.18)] mt-[-2px] leading-tight select-none">
            {labelText}
          </span>
        )}
      </div>
    </motion.button>
  );
};
