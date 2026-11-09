import React from 'react';
import { CELESTIAL_TILES } from '../data/themes';
import { JellyTile } from './JellyTile';

/**
 * 천체 타일 확인용 갤러리 (주소 뒤에 ?tile-gallery 를 붙이면 열림)
 * 게임에 나오는 천체 타일 전부를 번호·이름과 함께 한눈에 본다.
 */
export const TileGallery: React.FC = () => {
  const tiles = CELESTIAL_TILES.filter(t => t.id.startsWith('c_'));
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      <h1 className="text-xl font-black mb-1">천체 타일 갤러리</h1>
      <p className="text-sm text-slate-400 mb-5">{tiles.length}종</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {tiles.map((t, i) => (
          <div key={t.id} className="flex flex-col items-center gap-1">
            <JellyTile item={t} size="lg" />
            <div className="text-[10px] text-center leading-tight text-slate-300">
              {i + 1}. {t.titleKo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
