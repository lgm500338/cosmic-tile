export type ThemeId = 'cosmic' | 'fantasy' | 'cyber';
export type AppLanguage = 'ko' | 'en';

export interface TileThemeItem {
  id: string;
  name: string;
  titleKo: string;
  shortLabel?: string; // 2-3 characters (e.g., '화성', '목성', '타이탄')
  shortLabelEn?: string; // 2-3 characters in EN (e.g., 'MAR', 'JUP', 'TIT')
  showLabel?: boolean;
  emoji: string;
  primaryColor: string;
  glowColor: string;
  textColor: string;
  badgeBg: string;
  symbolType: string;
  similarGroup?: string;
  description?: string;
  descriptionEn?: string;
  discoveryDate?: string;
  discoveryDateEn?: string;
  category?: string;
  categoryEn?: string;
  factsDetail?: string;
  factsDetailEn?: string;
}

export interface GameTheme {
  id: ThemeId;
  name: string;
  nameKo: string;
  subtitle: string;
  accentColor: string;
  backgroundClass: string;
  dockBg: string;
  tiles: TileThemeItem[];
}

export interface BoardTile {
  id: string;
  typeId: string;
  layer: number;
  x: number; // grid x, can be fractional (0, 0.5, 1, 1.5...)
  y: number; // grid y, can be fractional
  isCovered: boolean;
  isCollected: boolean;
  /** 외계인이 숨긴 타일: 누르기 전에는 어떤 천체인지 보이지 않는다 */
  isAlien?: boolean;
}

export interface DockTile {
  instanceId: string;
  typeId: string;
  originalTileId: string;
}

export type BoosterType = 'undo' | 'wand' | 'shuffle' | 'slot';

export interface LevelConfig {
  levelNumber: number;
  name: string;
  nameEn?: string;
  chapterTitle: string;
  chapterTitleEn?: string;
  themeId: ThemeId;
  failureRateText: string; // e.g. "75%가 이 레벨에서 실패했습니다. 증명해 보세요!"
  failureRateTextEn?: string; // e.g. "75% players failed this level. Beat the odds!"
  briefing: {
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    tip: string;
    tipEn?: string;
    featuredTiles: string[];
  };
  uniqueTypesCount: number;
  totalTriplets: number;
  layoutPattern: 'flower' | 'butterfly' | 'star' | 'pyramid' | 'cross' | 'twin_towers' | 'diamond' | 'galaxy' | 'tutorial_grid';
  maxLayers: number;
}

export interface RoadmapReward {
  level: number;
  rewardType: 'coins' | 'undo' | 'wand' | 'shuffle';
  amount: number;
  label: string;
}
