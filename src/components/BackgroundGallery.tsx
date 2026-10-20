import React, { useEffect, useState } from 'react';
import { BackgroundManifestEntry } from '../data/backgrounds';

/**
 * 배경 사진 확인용 갤러리 (주소 뒤에 ?bg-gallery 를 붙이면 열림)
 * 배포 후 100장을 한눈에 보고, 사람이 알아볼 수 있게 찍힌 사진 등 쓰면 안 되는 사진을 골라낼 때 사용
 */
export const BackgroundGallery: React.FC = () => {
  const [list, setList] = useState<BackgroundManifestEntry[] | null>(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}backgrounds/manifest.json`)
      .then(r => (r.ok ? r.json() : []))
      .then(setList)
      .catch(() => setList([]));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      <h1 className="text-xl font-black mb-1">배경 사진 갤러리</h1>
      <p className="text-sm text-slate-400 mb-5">
        {list === null ? '불러오는 중…' : `${list.length}장 · 번호 = 레벨`} · 사람이 알아볼 수 있게 찍힌 사진은 상업적으로 쓸 수 없으니 빼야 해요.
      </p>
      {list && list.length === 0 && (
        <p className="text-amber-300 text-sm">사진이 아직 없어요. 배포(빌드)할 때 자동으로 받아져요.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {list?.map(e => (
          <a key={e.index} href={e.page} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
            <img src={`${import.meta.env.BASE_URL}${e.file}`} alt={e.ko} loading="lazy" className="w-full aspect-[9/16] object-cover" />
            <div className="p-2 text-[11px] leading-snug">
              <div className="font-bold">{e.index}. {e.ko}</div>
              <div className="text-slate-400">{e.credit}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
