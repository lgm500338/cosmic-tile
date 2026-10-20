import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, DockTile, TileThemeItem } from '../types/game';
import { JellyTile } from './JellyTile';
import { TRANSLATIONS } from '../data/translations';

interface CollectionDockProps {
  dockTiles: DockTile[];
  maxSlots: number;
  tileThemeMap: Record<string, TileThemeItem>;
  matchingIds: string[];
  language?: AppLanguage;
  onTileClick?: (dockIndex: number) => void;
}

export const CollectionDock: React.FC<CollectionDockProps> = ({
  dockTiles,
  maxSlots,
  tileThemeMap,
  matchingIds,
  language = 'ko',
  onTileClick,
}) => {
  const isDanger = dockTiles.length >= maxSlots - 1;
  const isCritical = dockTiles.length >= maxSlots;
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full max-w-[420px] px-3 pt-1 pb-0.5 flex flex-col items-center shrink-0 z-20 select-none">
      {/* Danger alert badge when almost full */}
      {isDanger && (
        <motion.div
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-1 text-[10px] font-bold text-amber-300 flex items-center gap-1 animate-pulse"
        >
          <span>⚠️</span>
          <span>{isCritical ? t.dockCritical : t.dockWarning(maxSlots - dockTiles.length)}</span>
        </motion.div>
      )}

      {/* The 7 (or 8) slot bar container: Exact match to image.png dark blue container */}
      <div
        className={`
          relative w-full h-[52px] sm:h-[56px]
          rounded-xl p-1 flex items-center justify-start gap-1
          bg-[#172535]/95 backdrop-blur-md
          border transition-all duration-300
          ${
            isCritical
              ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-bounce'
              : isDanger
              ? 'border-amber-400/80 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
              : 'border-[#2d4661]/90 shadow-[0_6px_20px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.08)]'
          }
        `}
      >
        {/* Background recessed empty slot sockets (7 rounded rectangles matching image.png) */}
        <div className="absolute inset-1 grid grid-flow-col auto-cols-fr gap-1 pointer-events-none">
          {Array.from({ length: maxSlots }).map((_, idx) => (
            <div
              key={`slot-bg-${idx}`}
              className="w-full h-full rounded-lg bg-[#0e1724]/90 border border-[#1b2b3d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800/60" />
            </div>
          ))}
        </div>

        {/* Occupied tiles in dock */}
        <div className="relative z-10 w-full h-full flex items-center justify-start gap-1">
          <AnimatePresence mode="popLayout">
            {dockTiles.map((dockTile, index) => {
              const themeItem = tileThemeMap[dockTile.typeId];
              const isClearing = matchingIds.includes(dockTile.instanceId);

              if (!themeItem) return null;

              return (
                <motion.div
                  key={dockTile.instanceId}
                  layout
                  initial={{ scale: 0.3, y: 30, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{
                    scale: 1.35,
                    opacity: 0,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.22 },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 25,
                  }}
                  className="flex-1 flex items-center justify-center max-w-[44px]"
                >
                  <JellyTile
                    item={themeItem}
                    size="sm"
                    isInDock={true}
                    highlightMatch={isClearing}
                    language={language}
                    onClick={() => onTileClick && onTileClick(index)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
