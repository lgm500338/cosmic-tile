import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppLanguage, BoardTile, TileThemeItem } from '../types/game';
import { JellyTile } from './JellyTile';

interface GameBoardProps {
  tiles: BoardTile[];
  tileThemeMap: Record<string, TileThemeItem>;
  onTileClick: (tile: BoardTile) => void;
  wandSuggestedType: string | null;
  showTileText?: boolean;
  language?: AppLanguage;
  isStageCleared?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  tileThemeMap,
  onTileClick,
  wandSuggestedType,
  showTileText = false,
  language = 'ko',
  isStageCleared = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 380,
    height: 340,
  });

  // Track responsive container dimensions to auto-scale on all screens (especially PC monitors & preview iframe)
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    ro.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Compute board bounds to center dynamically
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (tiles.length === 0) return { minX: 1, maxX: 6, minY: 1, maxY: 6 };
    let mx = Infinity, Mx = -Infinity, my = Infinity, My = -Infinity;
    tiles.forEach(t => {
      if (t.x < mx) mx = t.x;
      if (t.x > Mx) Mx = t.x;
      if (t.y < my) my = t.y;
      if (t.y > My) My = t.y;
    });
    return { minX: mx, maxX: Mx, minY: my, maxY: My };
  }, [tiles]);

  // Exact tile dimensions and spacing factors (Proportioned to fit both 5-row and 7~8 row levels with large, crisp tiles)
  // 타일 실제 크기(md: 62x72)와 격자 간격을 일치시켜 반 칸 엇갈림이 정확히 보이게 한다
  const tileWidth = 62;
  const tileHeight = 72;
  const gridUnitX = 63;
  const gridUnitY = 73;
  // 층이 올라갈수록 위로 살짝 띄워 아래층 타일의 두께(가장자리)가 보이게 한다
  const layerLiftY = 6;
  const maxLayer = useMemo(() => tiles.reduce((m, t) => Math.max(m, t.layer), 0), [tiles]);

  // Safe internal padding
  const paddingX = 12;
  const paddingTop = 12 + maxLayer * layerLiftY;
  const paddingBottom = 12;

  // True board dimensions based on actual tile footprints
  const boardWidth = (maxX - minX) * gridUnitX + tileWidth + paddingX * 2;
  const boardHeight = (maxY - minY) * gridUnitY + tileHeight + paddingTop + paddingBottom;

  // Dynamic scale calculation so board ALWAYS fits snugly inside available container height & width
  const boardScale = useMemo(() => {
    const availableW = containerSize.width > 0 ? containerSize.width : 390;
    const availableH = containerSize.height > 0 ? containerSize.height : 580;

    // Generous clearance margins preventing any overlap
    const maxW = Math.max(availableW - 8, 200);
    const maxH = Math.max(availableH - 8, 200);

    const sX = maxW / boardWidth;
    const sY = maxH / boardHeight;

    // Allow scaling UP to 1.20 when container is spacious (5 rows), or scale DOWN smoothly when tight (7~8 rows)
    const targetScale = Math.min(sX, sY);
    return Math.max(0.4, Math.min(targetScale, 1.15));
  }, [boardWidth, boardHeight, containerSize]);

  // Sort tiles by layer ascending so lower layers render first and higher layers render on top
  const sortedTiles = useMemo(() => {
    return [...tiles].sort((a, b) => {
      if (a.layer !== b.layer) return a.layer - b.layer;
      return a.y - b.y;
    });
  }, [tiles]);

  const activeTilesCount = tiles.filter(t => !t.isCollected).length;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 min-h-0 flex items-center justify-center p-2 overflow-visible z-10"
    >
      {/* Container for tiles with auto-scaling to fit any device or PC screen */}
      <div
        className="relative overflow-visible shrink-0 transition-transform duration-300"
        style={{
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
          transform: `scale(${boardScale})`,
          transformOrigin: 'center center',
        }}
      >
        {sortedTiles.map(tile => {
          if (tile.isCollected) return null;

          const themeItem = tileThemeMap[tile.typeId];
          if (!themeItem) return null;

          // Position relative to board bounding box with safe padding
          // 3D elevation offset (2px X, -2px Y per layer)
          const posX = paddingX + (tile.x - minX) * gridUnitX;
          const posY = paddingTop + (tile.y - minY) * gridUnitY - tile.layer * layerLiftY;

          // Highlight if wand recommended this tile
          const isSuggested = wandSuggestedType === tile.typeId && !tile.isCovered && !tile.isAlien;

          return (
            <div
              key={tile.id}
              data-tile-id={tile.id}
              className="absolute transition-transform duration-200"
              style={{
                left: `${posX}px`,
                top: `${posY}px`,
                zIndex: 10 + tile.layer * 40 + Math.floor(tile.y * 2),
              }}
            >
              {isSuggested && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="absolute -inset-1.5 rounded-2xl bg-amber-400/50 blur-sm pointer-events-none z-0"
                />
              )}
              <JellyTile
                item={themeItem}
                layer={tile.layer}
                isCovered={tile.isCovered}
                isAlien={tile.isAlien}
                onClick={() => onTileClick(tile)}
                size="md"
                showTileText={showTileText}
                language={language}
              />
            </div>
          );
        })}

        {/* Empty state when all tiles cleared and stage clear confirmed */}
        {activeTilesCount === 0 && isStageCleared && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl mb-2"
            >
              ✨
            </motion.div>
            <div className="text-xl font-bold text-amber-300">STAGE CLEAR!</div>
          </div>
        )}
      </div>
    </div>
  );
};
