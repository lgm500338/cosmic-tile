import React from 'react';
import { motion } from 'motion/react';
import { AppLanguage, LevelConfig, TileThemeItem } from '../types/game';
import { Sparkles, Calendar, BookOpen, Orbit } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { CELESTIAL_ENGLISH } from '../data/celestialEnglish';
import { renderTileGraphic } from './JellyTile';
import { uniquifySvgIds } from '../utils/uniqueSvgIds';

interface LevelBriefingModalProps {
  config: LevelConfig;
  tileThemeMap?: Record<string, TileThemeItem>;
  language?: AppLanguage;
  onStart: () => void;
  onClose: () => void;
}

export const LevelBriefingModal: React.FC<LevelBriefingModalProps> = ({
  config,
  tileThemeMap = {},
  language = 'ko',
  onStart,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const { briefing, levelNumber } = config;
  const featuredIds =
    briefing.featuredTiles && briefing.featuredTiles.length > 0
      ? briefing.featuredTiles
      : ['c_mercury', 'c_venus'];

  // Retrieve tile information for each featured body in this level
  const celestialBodies: TileThemeItem[] = featuredIds
    .map(id => tileThemeMap[id])
    .filter((item): item is TileThemeItem => Boolean(item));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 25 }}
        className="w-full max-w-md sm:max-w-lg max-h-[94vh] rounded-[36px] border-2 border-cyan-400/50 p-5 sm:p-6 flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden text-white bg-slate-950"
      >
        {/* Full Cinematic Cosmic Background Art (바탕화면 전체를 덮는 웅장한 우주 & 성운 & 궤도 링) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Deep Space Gradient Base */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1633] via-[#091124] to-[#050814]" />

          {/* Ambient Cosmic Nebula Glowing Clouds */}
          <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-[80px]" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-[85px]" />
          <div className="absolute -bottom-20 inset-x-10 h-60 rounded-full bg-amber-500/15 blur-[90px]" />

          {/* Majestic Planetary Orbital Rings & Celestial Sphere Watermark in the Background */}
          <div className="absolute -right-20 top-16 w-80 h-80 rounded-full border-[1.5px] border-cyan-400/15 -rotate-45" />
          <div className="absolute -right-32 top-8 w-[400px] h-[400px] rounded-full border-[1px] border-cyan-300/10 -rotate-45" />
          <div className="absolute -left-28 -bottom-16 w-72 h-72 rounded-full border-[1.5px] border-amber-300/15 rotate-12" />

          {/* Starfield twinkling sparkles overlay */}
          <div className="absolute top-8 left-12 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]" />
          <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-cyan-200 rounded-full shadow-[0_0_10px_#38bdf8]" />
          <div className="absolute top-48 left-8 w-1 h-1 bg-amber-200 rounded-full shadow-[0_0_6px_#fde047]" />
          <div className="absolute bottom-32 right-10 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
          <div className="absolute bottom-16 left-20 w-1 h-1 bg-indigo-200 rounded-full" />
        </div>

        {/* 1. Header: Chapter Title & Level Badge */}
        <div className="relative z-10 flex flex-col items-center text-center mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[11px] sm:text-xs font-black text-cyan-300 tracking-wide shadow-sm mb-1">
            <Orbit className="w-3.5 h-3.5 text-cyan-300 animate-spin-slow" />
            <span>{t.briefingBadge(levelNumber)}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            {language === 'ko' ? briefing.title : briefing.titleEn || briefing.title}
          </h2>
          <p className="text-[11px] text-cyan-200/80 font-medium mt-0.5">
            {t.briefingSubtitle}
          </p>
        </div>

        {/* 2. Spacious Per-Planet Scientific Fact Cards (바탕화면 전체 적용으로 넉넉해진 공간!) */}
        <div className="relative z-10 flex-1 overflow-y-auto space-y-2.5 mb-4 pr-1 max-h-[58vh] custom-scrollbar">
          {celestialBodies.map(body => {
            const enInfo = CELESTIAL_ENGLISH[body.id];
            const displayName = language === 'ko' ? body.titleKo : (enInfo?.name || body.name);
            // 한국어 모드에서만 영어 이름을 함께 보여주고, 영어 모드에서는 한글을 섞지 않는다
            const secondaryName = language === 'ko' ? body.name : '';
            const category = language === 'ko' ? body.category : (enInfo?.category || body.categoryEn || body.category);
            const discovery = language === 'ko' ? body.discoveryDate : (enInfo?.discoveryDate || body.discoveryDateEn || body.discoveryDate);
            const description = language === 'ko' ? body.description : (enInfo?.description || body.descriptionEn || body.description);
            const factsDetail = language === 'ko' ? body.factsDetail : (enInfo?.factsDetail || body.factsDetailEn || body.factsDetail);

            return (
              <div
                key={body.id}
                className="rounded-2xl p-3.5 bg-slate-900/80 backdrop-blur-md border border-cyan-400/35 hover:border-cyan-300/70 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-all flex items-start gap-3.5 text-left"
              >
                {/* 왼쪽: 게임 속 실제 타일과 똑같은 그림 (보고 바로 알아볼 수 있게) */}
                <div
                  className="relative w-[60px] h-[68px] rounded-2xl flex-shrink-0 border border-[#e2d9c8] bg-gradient-to-b from-[#ffffff] via-[#faf7f0] to-[#f4eee1] flex items-center justify-center shadow-[0_4px_0_rgba(180,160,140,0.9),0_8px_12px_rgba(0,0,0,0.35)] mt-0.5"
                  style={{ boxShadow: 'inset 0 2px 3px rgba(255,255,255,1), inset 0 -3px 4px rgba(180,160,130,0.2), 0 4px 0 rgba(180,160,140,0.9), 0 8px 12px rgba(0,0,0,0.35)' }}
                >
                  <div className="absolute top-1 left-1.5 w-3/4 h-2 rounded-full pointer-events-none opacity-85 bg-gradient-to-b from-white/95 to-white/20" />
                  <div className="relative z-10 flex items-center justify-center">
                    {uniquifySvgIds(renderTileGraphic(body.symbolType, false, body.emoji, 'md'), `_brief_${body.id}`)}
                  </div>
                </div>

                {/* Right: Comprehensive Educational Science Knowledge */}
                <div className="flex-1 min-w-0">
                  {/* Header: Name + English Name + Category Badge */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-base font-black text-amber-300 tracking-tight">
                      {displayName}:
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {secondaryName ? `(${secondaryName})` : ''}
                    </span>
                    {category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-cyan-200">
                        {category}
                      </span>
                    )}
                  </div>

                  {/* Discovery Date or Mission Fact (사용자 요청: 발견날짜/탐사정보) */}
                  {discovery && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 mb-1">
                      <Calendar className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>{discovery}</span>
                    </div>
                  )}

                  {/* Primary Scientific Description */}
                  <p className="text-xs sm:text-[13px] text-slate-100 leading-relaxed font-medium break-keep opacity-95 mb-1">
                    {description}
                  </p>

                  {/* Additional Detailed Science Fact (사용자 요청: 한 줄이라도 더 풍부하게 적는 추가 특징!) */}
                  {factsDetail && (
                    <p className="text-[11px] text-sky-200/90 leading-snug font-medium break-keep border-t border-slate-700/60 pt-1 mt-1 flex items-start gap-1">
                      <BookOpen className="w-3 h-3 text-amber-300 flex-shrink-0 mt-0.5" />
                      <span>{factsDetail}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Bottom Action Button: Large Glossy Green Pill */}
        <motion.button
          type="button"
          onClick={() => {
            onStart();
            onClose();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="relative z-10 w-full py-4 rounded-full bg-gradient-to-b from-[#4ade80] via-[#22c55e] to-[#15803d] border-2 border-[#86efac] text-slate-950 font-black text-base sm:text-lg tracking-wide shadow-[0_8px_24px_rgba(34,197,94,0.45),inset_0_2px_4px_rgba(255,255,255,0.7)] cursor-pointer active:shadow-none flex items-center justify-center gap-2"
        >
          {/* Top gloss glint */}
          <div className="absolute top-1 inset-x-4 h-2.5 rounded-full bg-white/40 pointer-events-none" />
          <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          <span>{t.startExpedition}</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
