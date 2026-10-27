import React from 'react';

// ---------------------------------------------------------------------------
// 새로 추가한 천체 56종의 타일 그림
// 기존 그림과 같은 방식: 44x44 캔버스, 가운데(22,22)에 크게, 그라데이션 + 위쪽 하이라이트.
// 컴포넌트가 아니라 SVG 요소를 바로 돌려준다 (타일마다 그라데이션 id를 고유하게 바꾸는 처리가
// 요소 트리를 따라 내려가기 때문).
// ---------------------------------------------------------------------------

const lin = (id: string, a: string, b: string, c: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stopColor={a} />
    <stop offset="55%" stopColor={b} />
    <stop offset="100%" stopColor={c} />
  </linearGradient>
);

const rad = (id: string, a: string, b: string, c: string) => (
  <radialGradient id={id} cx="50%" cy="50%" r="50%">
    <stop offset="0%" stopColor={a} />
    <stop offset="45%" stopColor={b} />
    <stop offset="100%" stopColor={c} stopOpacity="0" />
  </radialGradient>
);

const glint = (cx = 17, cy = 13.5, rx = 6, ry = 2.5, op = 0.5) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffffff" opacity={op} />
);

/** 둥근 천체 하나 (위성·왜소행성·별 공통) */
const ball = (id: string, a: string, b: string, c: string, r = 15, cx = 22, cy = 22) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    <defs>{lin(id, a, b, c)}</defs>
  </>
);

/** 빛나는 별 모양 (꼭짓점 수, 바깥/안쪽 반지름) */
const starPoints = (n: number, R: number, r: number, cx = 22, cy = 22, rot = -90) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const rr = i % 2 === 0 ? R : r;
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
};

// 그림마다 실제로 그려진 범위 (타일을 꽉 채우도록)
export const EXTRA_VIEWBOX: Record<string, string> = {
  callisto: '5.5 5.5 33 33', amalthea: '6 6 32 32', rhea: '5.5 5.5 33 33', iapetus: '4 4 36 36',
  dione: '5.5 5.5 33 33', tethys: '5.5 5.5 33 33', hyperion: '6 6 32 32', phoebe: '5.5 5.5 33 33',
  titania: '5 2 34 34', oberon: '5.5 5.5 33 33', ariel: '5.5 5.5 33 33', umbriel: '5.5 5.5 33 33',
  proteus: '6 6 32 32', nereid: '2 6 40 32', eris: '4 4 36 36', sedna: '5.5 5.5 33 33',
  arrokoth: '3 3 38 38', ryugu: '4 4 36 36', itokawa: '3 3 38 38', eros: '3 3 38 38',
  dimorphos: '3 3 38 38', apophis: '3 3 38 38', halebopp: '2 2 40 40', sl9: '2 2 40 40',
  neowise: '2 2 40 40', tempel1: '3 3 38 38', polaris: '3 3 38 38', vega: '3 3 38 38',
  altair: '3 3 38 38', proxima: '4 4 36 36', rigel: '3 3 38 38', antares: '4 4 36 36',
  aldebaran: '4 4 36 36', canopus: '3 3 38 38', arcturus: '3 3 38 38', deneb: '4 3 36 36',
  pleiades: '4 4 36 36', pillars: '4 4 36 36', horsehead: '4 4 36 36', carina: '4 4 36 36',
  lagoon: '3 3 38 38', catseye: '4 4 36 36', veil: '4 4 36 36', milkyway: '3 3 38 38',
  lmc: '4 4 36 36', triangulum: '3 3 38 38', whirlpool: '3 3 38 38', cartwheel: '3 3 38 38',
  sgra: '3 3 38 38', m87: '2 3 40 40', voyager1: '3 3 38 38', hubble: '3 3 38 38',
  jwst: '3 3 38 38', nuri: '4 2 36 40', danuri: '3 3 38 38', newhorizons: '3 3 38 38',
};

export function renderExtraArt(symbolType: string): React.ReactElement | null {
  switch (symbolType) {
    // ===== 목성의 위성 =====
    case 'callisto': // 크레이터가 빽빽한 어두운 밤색 공 + 밝은 점들 + 발할라 고리
      return (
        <>
          {ball('g_callisto', '#a8a29e', '#57534e', '#1c1917')}
          <circle cx="25" cy="24" r="6" fill="none" stroke="#d6d3d1" strokeWidth="1" opacity="0.7" />
          <circle cx="25" cy="24" r="3" fill="#e7e5e4" opacity="0.75" />
          {[[13, 19], [16, 27], [19, 15], [29, 15], [31, 21], [21, 32], [12, 24], [27, 31], [18, 22], [32, 27], [24, 12]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.2 : 0.8} fill="#ffffff" opacity="0.85" />
          ))}
          {glint(17, 13.5, 6, 2.5, 0.35)}
        </>
      );

    case 'amalthea': // 붉은 감자 모양
      return (
        <>
          <path d="M 10 21 Q 11 11 22 11 Q 34 12 34 22 Q 35 32 23 33 Q 9 33 10 21 Z" fill="url(#g_amalthea)" />
          <circle cx="18" cy="20" r="3.5" fill="#7f1d1d" opacity="0.55" />
          <circle cx="27" cy="25" r="2.5" fill="#7f1d1d" opacity="0.5" />
          <ellipse cx="24" cy="16" rx="3" ry="1.5" fill="#fde68a" opacity="0.6" />
          {glint(19, 14, 5, 2, 0.4)}
          <defs>{lin('g_amalthea', '#fb923c', '#dc2626', '#7f1d1d')}</defs>
        </>
      );

    // ===== 토성의 위성 =====
    case 'rhea': // 하얀 얼음 공 + 또렷한 크레이터 테두리
      return (
        <>
          {ball('g_rhea', '#ffffff', '#e2e8f0', '#94a3b8')}
          <circle cx="16" cy="20" r="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
          <circle cx="27" cy="17" r="2.6" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.9" />
          <circle cx="24" cy="28" r="3.4" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.9" />
          <circle cx="31" cy="25" r="1.6" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="17" cy="29" r="1.4" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.7" />
          {glint(18, 12.5, 5, 2, 0.7)}
        </>
      );

    case 'iapetus': // 반은 하얗고 반은 검은 두 얼굴 + 적도 산맥
      return (
        <>
          <circle cx="22" cy="22" r="15.5" fill="url(#g_iap_light)" />
          <path d="M 22 6.5 A 15.5 15.5 0 0 0 22 37.5 Q 14 30 17 22 Q 14 13 22 6.5 Z" fill="url(#g_iap_dark)" />
          <path d="M 6.8 22.5 Q 22 26 37.2 22.5" stroke="#a16207" strokeWidth="2" fill="none" opacity="0.9" />
          <path d="M 6.8 22.5 Q 22 26 37.2 22.5" stroke="#fde68a" strokeWidth="0.7" fill="none" opacity="0.9" />
          {glint(27, 13, 5, 2, 0.7)}
          <defs>
            {lin('g_iap_light', '#ffffff', '#f1f5f9', '#cbd5e1')}
            {lin('g_iap_dark', '#78350f', '#422006', '#1c1917')}
          </defs>
        </>
      );

    case 'dione': // 푸른빛 얼음 공 + 하얀 얼음 절벽 줄무늬
      return (
        <>
          {ball('g_dione', '#e0f2fe', '#7dd3fc', '#0369a1')}
          <path d="M 24 10 Q 30 16 28 22 Q 33 26 31 33" stroke="#ffffff" strokeWidth="1.8" fill="none" opacity="0.95" />
          <path d="M 28 11 Q 34 18 33 24" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.85" />
          <path d="M 21 14 Q 25 20 23 27 Q 26 31 24 35" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.7" />
          <circle cx="14" cy="23" r="2.2" fill="#0c4a6e" opacity="0.45" />
          <circle cx="17" cy="30" r="1.5" fill="#0c4a6e" opacity="0.4" />
          {glint(16, 13.5, 5, 2, 0.55)}
        </>
      );

    case 'tethys': // 분홍빛 얼음 공 + 거대한 오디세우스 크레이터 + 이타카 협곡
      return (
        <>
          {ball('g_tethys', '#fff1f2', '#fbcfe8', '#db2777')}
          <circle cx="16" cy="18" r="6.5" fill="#f9a8d4" stroke="#9d174d" strokeWidth="1.1" opacity="0.95" />
          <circle cx="16" cy="18" r="2" fill="#be185d" opacity="0.6" />
          <path d="M 20 34 Q 26 25 34 16" stroke="#831843" strokeWidth="1.6" fill="none" opacity="0.75" />
          {glint(23, 12, 5, 2, 0.6)}
        </>
      );

    case 'hyperion': // 구멍이 숭숭 뚫린 스펀지
      return (
        <>
          <path d="M 9 20 Q 10 10 21 10 Q 33 9 35 20 Q 36 31 25 34 Q 11 35 9 20 Z" fill="url(#g_hyperion)" />
          {[[15, 17, 2.6], [22, 15, 2], [29, 18, 2.4], [14, 25, 2.2], [21, 22, 2.8], [28, 26, 2.6], [20, 29, 2], [26, 32, 1.4], [32, 23, 1.5], [17, 32, 1.3]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#78350f" stroke="#fde68a" strokeWidth="0.5" opacity="0.85" />
          ))}
          <defs>{lin('g_hyperion', '#fde68a', '#d97706', '#92400e')}</defs>
        </>
      );

    case 'phoebe': // 숯처럼 어두운 공 + 거꾸로 도는 화살표
      return (
        <>
          {ball('g_phoebe', '#64748b', '#334155', '#0f172a')}
          <circle cx="18" cy="20" r="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
          <circle cx="27" cy="27" r="2.6" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.7" />
          <path d="M 33 13 A 15 15 0 0 1 35 22" stroke="#fbbf24" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <polygon points="31.5,12 35,11 33.5,14.6" fill="#fbbf24" />
          {glint(17, 13.5, 5, 2, 0.3)}
        </>
      );

    // ===== 천왕성의 위성 =====
    case 'titania': // 요정 여왕: 분홍 회색 공 + 작은 금관
      return (
        <>
          {ball('g_titania', '#fce7f3', '#c4a1b5', '#6b4a5e', 14, 22, 23.5)}
          <path d="M 13 27 Q 20 22 32 19" stroke="#4a2c3d" strokeWidth="1.5" fill="none" opacity="0.6" />
          <circle cx="26" cy="28" r="2" fill="#4a2c3d" opacity="0.45" />
          <path d="M 15 8.5 L 17 4 L 19.5 7 L 22 3 L 24.5 7 L 27 4 L 29 8.5 Z" fill="#facc15" stroke="#a16207" strokeWidth="0.7" />
          <circle cx="22" cy="6.8" r="0.9" fill="#f43f5e" />
          {glint(17, 15, 5, 2, 0.55)}
        </>
      );

    case 'oberon': // 붉은 밤색 공 + 바닥이 어두운 크레이터
      return (
        <>
          {ball('g_oberon', '#d6b8a6', '#9a6b55', '#4a2a1c')}
          <circle cx="16" cy="19" r="3.4" fill="#e7d3c4" />
          <circle cx="16" cy="19" r="1.8" fill="#2b170f" />
          <circle cx="27" cy="25" r="3" fill="#e7d3c4" />
          <circle cx="27" cy="25" r="1.6" fill="#2b170f" />
          <circle cx="20" cy="30" r="1.8" fill="#e7d3c4" />
          <circle cx="20" cy="30" r="0.9" fill="#2b170f" />
          {glint(18, 13, 5, 2, 0.4)}
        </>
      );

    case 'ariel': // 밝은 청록 얼음 공 + 나란한 골짜기
      return (
        <>
          {ball('g_ariel', '#f0fdfa', '#5eead4', '#0f766e')}
          <path d="M 10 18 Q 22 15 35 20" stroke="#115e59" strokeWidth="1.6" fill="none" opacity="0.7" />
          <path d="M 9 23 Q 22 20 36 25" stroke="#115e59" strokeWidth="1.4" fill="none" opacity="0.6" />
          <path d="M 11 28 Q 22 26 33 30" stroke="#115e59" strokeWidth="1.2" fill="none" opacity="0.5" />
          {glint(17, 12.5, 6, 2.2, 0.7)}
        </>
      );

    case 'umbriel': // 어두운 공 + 반짝이는 고리 무늬(분다)
      return (
        <>
          {ball('g_umbriel', '#64748b', '#334155', '#020617')}
          <circle cx="22" cy="12.5" r="4.2" fill="none" stroke="#fde68a" strokeWidth="2" />
          <circle cx="22" cy="12.5" r="4.2" fill="none" stroke="#ffffff" strokeWidth="0.7" />
          <circle cx="16" cy="25" r="2.2" fill="#020617" opacity="0.7" />
          <circle cx="27" cy="28" r="2.6" fill="#020617" opacity="0.7" />
        </>
      );

    // ===== 해왕성의 위성 =====
    case 'proteus': // 각진 상자 모양
      return (
        <>
          <polygon points="10,16 18,9 31,10 35,20 32,32 20,35 10,29" fill="url(#g_proteus)" stroke="#334155" strokeWidth="1" />
          <circle cx="24" cy="22" r="5" fill="#1e293b" opacity="0.55" />
          <circle cx="15" cy="25" r="2" fill="#1e293b" opacity="0.5" />
          <polyline points="18,9 20,16 31,10" fill="none" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.7" />
          <defs>{lin('g_proteus', '#cbd5e1', '#64748b', '#1e293b')}</defs>
        </>
      );

    case 'nereid': // 작은 공 + 아주 길쭉한 궤도
      return (
        <>
          <ellipse cx="22" cy="22" rx="18.5" ry="8" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="2.5 2" opacity="0.9" transform="rotate(-18 22 22)" />
          <circle cx="13" cy="25" r="3.2" fill="#2563eb" opacity="0.9" />
          {ball('g_nereid', '#f8fafc', '#94a3b8', '#334155', 8.5, 30, 18)}
          <circle cx="28" cy="19" r="1.6" fill="#334155" opacity="0.5" />
          {glint(28, 13.5, 3, 1.2, 0.6)}
        </>
      );

    // ===== 태양계 끝자락 =====
    case 'eris': // 눈처럼 하얀 공 + 작은 위성 디스노미아
      return (
        <>
          <circle cx="20.5" cy="23.5" r="14.5" fill="#e0f2fe" opacity="0.35" />
          {ball('g_eris', '#ffffff', '#e0f2fe', '#7dd3fc', 13, 20.5, 23.5)}
          <circle cx="34" cy="10" r="3.4" fill="#94a3b8" stroke="#ffffff" strokeWidth="0.8" />
          <path d="M 28 6 A 12 12 0 0 1 38 15" stroke="#ffffff" strokeWidth="0.7" fill="none" opacity="0.6" strokeDasharray="1.5 1.5" />
          {glint(16, 16, 5, 2, 0.8)}
        </>
      );

    case 'sedna': // 진한 자줏빛 붉은 공 + 한쪽에 서리 낀 초승달 빛
      return (
        <>
          {ball('g_sedna', '#fda4af', '#be123c', '#4c0519')}
          <path d="M 22 7 A 15 15 0 0 1 22 37 A 11 15 0 0 0 22 7 Z" fill="#ffe4e6" opacity="0.55" />
          <path d="M 9 24 Q 18 20 30 25" stroke="#4c0519" strokeWidth="2.6" fill="none" opacity="0.45" />
          {[[14, 16], [20, 31], [17, 22]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.1" fill="#ffe4e6" opacity="0.9" />
          ))}
          {glint(16, 13, 5, 2, 0.45)}
        </>
      );

    case 'arrokoth': // 두 덩어리가 맞붙은 눈사람
      return (
        <>
          <ellipse cx="16" cy="25.5" rx="10.5" ry="8.5" fill="url(#g_arrokoth)" transform="rotate(-30 16 25.5)" />
          <ellipse cx="26.5" cy="16.5" rx="8" ry="7" fill="url(#g_arrokoth)" transform="rotate(-30 26.5 16.5)" />
          <path d="M 18.5 17.5 Q 22 21.5 25.5 24" stroke="#7c2d12" strokeWidth="1.6" fill="none" opacity="0.55" strokeLinecap="round" />
          <circle cx="14" cy="27" r="2.4" fill="#9a3412" opacity="0.45" />
          <circle cx="28" cy="18" r="1.6" fill="#9a3412" opacity="0.45" />
          {glint(13, 21, 4, 1.6, 0.55)}
          {glint(25, 12.5, 3, 1.3, 0.55)}
          <defs>{lin('g_arrokoth', '#fde3c8', '#d9895b', '#7c3a1a')}</defs>
        </>
      );

    // ===== 지구 가까이 오는 소행성 =====
    case 'ryugu': // 팽이 모양 + 적도 능선 + 착륙 표적
      return (
        <>
          <path d="M 22 6 L 37 22 L 22 38 L 7 22 Z" fill="url(#g_ryugu)" strokeLinejoin="round" />
          <path d="M 7 22 Q 22 25 37 22" stroke="#94a3b8" strokeWidth="1.4" fill="none" />
          <circle cx="17" cy="16" r="1.6" fill="#0f172a" />
          <circle cx="26" cy="29" r="1.8" fill="#0f172a" />
          <circle cx="27" cy="16" r="2.2" fill="#ffffff" />
          <circle cx="27" cy="16" r="1.2" fill="#ef4444" />
          <defs>{lin('g_ryugu', '#94a3b8', '#334155', '#0f172a')}</defs>
        </>
      );

    case 'itokawa': // 땅콩 모양
      return (
        <>
          <path d="M 7 24 Q 6 15 14 14 Q 19 14 21 18 Q 24 16 29 13 Q 38 11 38 21 Q 38 30 29 30 Q 24 30 21 27 Q 18 33 12 32 Q 7 30 7 24 Z" fill="url(#g_itokawa)" />
          <circle cx="13" cy="22" r="1.4" fill="#57534e" opacity="0.7" />
          <circle cx="31" cy="23" r="1.8" fill="#57534e" opacity="0.7" />
          <circle cx="28" cy="17" r="1" fill="#57534e" opacity="0.6" />
          {glint(14, 17, 4, 1.5, 0.6)}
          {glint(30, 15.5, 4, 1.5, 0.6)}
          <defs>{lin('g_itokawa', '#f5f5f4', '#a8a29e', '#57534e')}</defs>
        </>
      );

    case 'eros': // 바나나 모양
      return (
        <>
          <path d="M 6 16 Q 10 9 17 15 Q 22 20 30 19 Q 38 18 38 26 Q 36 33 28 32 Q 18 31 11 26 Q 4 22 6 16 Z" fill="url(#g_eros)" />
          <path d="M 12 20 Q 20 26 30 25" stroke="#78350f" strokeWidth="1.3" fill="none" opacity="0.5" />
          <circle cx="31" cy="27" r="2" fill="#78350f" opacity="0.5" />
          {glint(11, 14.5, 3.5, 1.4, 0.6)}
          <defs>{lin('g_eros', '#fef08a', '#eab308', '#854d0e')}</defs>
        </>
      );

    case 'dimorphos': // 큰 디디모스 + 작은 디모르포스 + 충돌 섬광
      return (
        <>
          {ball('g_didymos', '#e2e8f0', '#94a3b8', '#334155', 11, 16, 25)}
          <circle cx="13" cy="25" r="2" fill="#334155" opacity="0.5" />
          <circle cx="31" cy="13" r="5" fill="#64748b" />
          <polygon points={starPoints(8, 8, 3, 33, 11)} fill="#f97316" opacity="0.95" />
          <polygon points={starPoints(8, 4.5, 2, 33, 11)} fill="#fef08a" />
          {glint(13, 19, 4, 1.6, 0.6)}
        </>
      );

    case 'apophis': // 갈색 바위 + 아래에 가까이 다가온 지구
      return (
        <>
          <path d="M 4 40 A 18 18 0 0 1 22 30 A 18 18 0 0 1 40 40 Z" fill="url(#g_apo_earth)" />
          <path d="M 12 36 Q 17 33 21 35" stroke="#22c55e" strokeWidth="2.2" fill="none" />
          <path d="M 26 18 Q 34 26 38 33" stroke="#fbbf24" strokeWidth="1" fill="none" strokeDasharray="1.6 1.6" opacity="0.9" />
          <path d="M 12 13 Q 14 6 22 7 Q 30 9 29 17 Q 27 24 19 23 Q 11 21 12 13 Z" fill="url(#g_apophis)" />
          <circle cx="18" cy="14" r="1.8" fill="#451a03" opacity="0.6" />
          <circle cx="24" cy="18" r="1.4" fill="#451a03" opacity="0.6" />
          {glint(18, 10, 3.5, 1.4, 0.5)}
          <defs>
            {lin('g_apophis', '#d6b38a', '#92400e', '#451a03')}
            {lin('g_apo_earth', '#7dd3fc', '#2563eb', '#1e3a8a')}
          </defs>
        </>
      );

    // ===== 대혜성 =====
    case 'halebopp': // 파란 이온 꼬리 + 하얀 먼지 꼬리 두 개
      return (
        <>
          <path d="M 18 25 L 40 4 L 34 4 Z" fill="url(#g_hb_ion)" opacity="0.9" />
          <path d="M 18 25 Q 30 20 40 13 Q 34 10 30 6 Q 24 16 18 25 Z" fill="url(#g_hb_dust)" opacity="0.9" />
          <circle cx="16" cy="27" r="8" fill="url(#g_hb_coma)" />
          <circle cx="16" cy="27" r="3.2" fill="#ffffff" />
          <defs>
            {lin('g_hb_ion', '#60a5fa', '#3b82f6', '#1e3a8a')}
            {lin('g_hb_dust', '#ffffff', '#fef9c3', '#fde68a')}
            {rad('g_hb_coma', '#ffffff', '#bae6fd', '#38bdf8')}
          </defs>
        </>
      );

    case 'sl9': // 목성으로 향하는 조각 줄 (진주 목걸이)
      return (
        <>
          <path d="M 28 42 A 20 20 0 0 1 42 28 L 42 42 Z" fill="url(#g_sl9_jup)" />
          <path d="M 31 42 Q 34 34 42 31" stroke="#92400e" strokeWidth="1.4" fill="none" opacity="0.7" />
          <path d="M 35 42 Q 37 37 42 35" stroke="#92400e" strokeWidth="1.2" fill="none" opacity="0.7" />
          {[[7, 6, 2.3], [11.5, 10.5, 2], [16, 15, 2.4], [20.5, 19.5, 1.9], [25, 24, 2.2]].map(([x, y, r], i) => (
            <g key={i}>
              <path d={`M ${x} ${y} L ${x - 6} ${y - 1.5} L ${x - 1.5} ${y - 6} Z`} fill="#fde68a" opacity="0.55" />
              <circle cx={x} cy={y} r={r} fill="#ffffff" stroke="#f59e0b" strokeWidth="0.7" />
            </g>
          ))}
          <defs>{lin('g_sl9_jup', '#fed7aa', '#f59e0b', '#9a3412')}</defs>
        </>
      );

    case 'neowise': // 주황빛으로 휘어진 부채꼴 꼬리
      return (
        <>
          <path d="M 15 28 Q 22 10 40 4 Q 38 14 40 22 Q 26 20 15 28 Z" fill="url(#g_neo_tail)" opacity="0.95" />
          <path d="M 15 28 Q 26 14 41 9" stroke="#fef3c7" strokeWidth="1" fill="none" opacity="0.8" />
          <circle cx="13" cy="30" r="7" fill="url(#g_neo_coma)" />
          <circle cx="13" cy="30" r="2.8" fill="#fffbeb" />
          <defs>
            {lin('g_neo_tail', '#fde68a', '#fb923c', '#c2410c')}
            {rad('g_neo_coma', '#fffbeb', '#fcd34d', '#f59e0b')}
          </defs>
        </>
      );

    case 'tempel1': // 초록 코마 속 핵 + 하얀 분출 부채꼴
      return (
        <>
          <circle cx="22" cy="22" r="16" fill="url(#g_t1_coma)" />
          <path d="M 23 20 L 38 6 L 40 14 Z" fill="#ffffff" opacity="0.9" />
          <path d="M 23 20 L 36 8 L 38 12 Z" fill="#fef9c3" />
          <path d="M 14 21 Q 15 14 22 15 Q 29 16 28 23 Q 27 30 20 29 Q 13 28 14 21 Z" fill="url(#g_tempel1)" />
          <circle cx="19" cy="24" r="1.5" fill="#1c1917" opacity="0.6" />
          <defs>
            {rad('g_t1_coma', '#bbf7d0', '#34d399', '#047857')}
            {lin('g_tempel1', '#a8a29e', '#57534e', '#1c1917')}
          </defs>
        </>
      );

    // ===== 별 =====
    case 'polaris': // 길게 뻗은 네 갈래 길잡이별 + 작은 동반성 두 개
      return (
        <>
          <circle cx="22" cy="22" r="12" fill="url(#g_pol_glow)" />
          <polygon points="22,3 24.5,19.5 41,22 24.5,24.5 22,41 19.5,24.5 3,22 19.5,19.5" fill="url(#g_polaris)" />
          <circle cx="22" cy="22" r="4" fill="#ffffff" />
          <circle cx="33" cy="11" r="1.6" fill="#fef9c3" />
          <circle cx="11.5" cy="32" r="1.2" fill="#fef9c3" />
          <defs>
            {lin('g_polaris', '#fffbeb', '#fde047', '#ca8a04')}
            {rad('g_pol_glow', '#fef9c3', '#fde047', '#facc15')}
          </defs>
        </>
      );

    case 'vega': // 푸른빛 여섯 갈래 별 + 직녀의 분홍 옷감 리본
      return (
        <>
          <path d="M 5 33 Q 13 26 22 31 Q 31 36 39 29" stroke="#f472b6" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M 5 33 Q 13 26 22 31 Q 31 36 39 29" stroke="#fbcfe8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <polygon points={starPoints(6, 16, 6.5, 22, 18)} fill="url(#g_vega)" />
          <circle cx="22" cy="18" r="4" fill="#ffffff" />
          <defs>{lin('g_vega', '#ffffff', '#93c5fd', '#2563eb')}</defs>
        </>
      );

    case 'altair': // 빠른 자전으로 납작한 노란 별 + 회전 화살
      return (
        <>
          <ellipse cx="22" cy="22" rx="17" ry="11" fill="#fde68a" opacity="0.35" />
          <ellipse cx="22" cy="22" rx="14" ry="9.5" fill="url(#g_altair)" />
          <path d="M 7 13 Q 22 4 37 13" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <polygon points="37.8,14.3 38,9.6 34.4,12" fill="#f59e0b" />
          <path d="M 37 31 Q 22 40 7 31" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <polygon points="6.2,29.7 6,34.4 9.6,32" fill="#f59e0b" />
          {glint(18, 17.5, 5, 1.8, 0.75)}
          <defs>{lin('g_altair', '#fffbeb', '#fde047', '#d97706')}</defs>
        </>
      );

    case 'proxima': // 작고 붉은 왜성 + 행성 프록시마 b
      return (
        <>
          <circle cx="20" cy="22" r="15" fill="#ef4444" opacity="0.25" />
          {ball('g_proxima', '#fdba74', '#ef4444', '#7f1d1d', 11.5, 20, 22)}
          <circle cx="16" cy="19" r="2.2" fill="#fde68a" opacity="0.55" />
          <circle cx="24" cy="26" r="1.8" fill="#7f1d1d" opacity="0.5" />
          <path d="M 7 31 Q 22 40 38 29" stroke="#fca5a5" strokeWidth="0.8" fill="none" strokeDasharray="1.5 1.5" />
          <circle cx="36" cy="30.5" r="3.4" fill="url(#g_prox_b)" />
          <defs>{lin('g_prox_b', '#99f6e4', '#14b8a6', '#134e4a')}</defs>
        </>
      );

    case 'rigel': // 푸른 초거성: 둥근 푸른 공 + 빛살
      return (
        <>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            const r1 = 12, r2 = i % 2 === 0 ? 19 : 16;
            return <line key={i} x1={22 + r1 * Math.cos(a)} y1={22 + r1 * Math.sin(a)} x2={22 + r2 * Math.cos(a)} y2={22 + r2 * Math.sin(a)} stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" />;
          })}
          {ball('g_rigel', '#ffffff', '#60a5fa', '#1d4ed8', 11.5)}
          <circle cx="22" cy="22" r="4.5" fill="#ffffff" opacity="0.8" />
        </>
      );

    case 'antares': // 주황빛 붉은 초거성 + 푸른 동반성
      return (
        <>
          <circle cx="20" cy="23" r="16" fill="#f97316" opacity="0.25" />
          {ball('g_antares', '#fdba74', '#ea580c', '#7c2d12', 13.5, 20, 23)}
          <circle cx="15" cy="20" r="3" fill="#fed7aa" opacity="0.5" />
          <circle cx="25" cy="28" r="3.5" fill="#9a3412" opacity="0.45" />
          <circle cx="36" cy="9" r="3" fill="#60a5fa" stroke="#ffffff" strokeWidth="0.8" />
          {glint(16, 15, 5, 2, 0.45)}
        </>
      );

    case 'aldebaran': // 주황 거성 + 뒤쪽 V자 별무리(히아데스)
      return (
        <>
          {[[6, 7], [9.5, 12], [13, 17], [38, 7], [34.5, 12], [31, 17]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="#fde68a" />
          ))}
          <circle cx="22" cy="25" r="14" fill="#fb923c" opacity="0.25" />
          {ball('g_aldebaran', '#fed7aa', '#f97316', '#9a3412', 11.5, 22, 25)}
          <circle cx="22" cy="25" r="3" fill="#fff7ed" opacity="0.6" />
          {glint(18, 19, 4.5, 1.8, 0.55)}
        </>
      );

    case 'canopus': // 한라산 능선 위에 낮게 뜬 노인성
      return (
        <>
          <circle cx="22" cy="16" r="11" fill="#fef9c3" opacity="0.4" />
          <polygon points={starPoints(8, 12, 4.2, 22, 16, -90)} fill="url(#g_canopus)" />
          <circle cx="22" cy="16" r="3.4" fill="#ffffff" />
          <path d="M 3 41 L 3 34 Q 12 30 22 28 Q 32 30 41 34 L 41 41 Z" fill="url(#g_canopus_hill)" />
          <path d="M 18 28.5 Q 22 26.5 26 28.5" stroke="#a7f3d0" strokeWidth="0.8" fill="none" />
          <defs>
            {lin('g_canopus', '#ffffff', '#fef08a', '#eab308')}
            {lin('g_canopus_hill', '#15803d', '#166534', '#052e16')}
          </defs>
        </>
      );

    case 'arcturus': // 주황빛 다섯 갈래 별
      return (
        <>
          <circle cx="22" cy="23" r="13" fill="#fb923c" opacity="0.3" />
          <polygon points={starPoints(5, 18, 7.5, 22, 23)} fill="url(#g_arcturus)" stroke="#9a3412" strokeWidth="0.8" strokeLinejoin="round" />
          <circle cx="22" cy="23" r="3.5" fill="#fff7ed" />
          {glint(18, 14, 3, 1.2, 0.7)}
          <defs>{lin('g_arcturus', '#fed7aa', '#f97316', '#c2410c')}</defs>
        </>
      );

    case 'deneb': // 백조자리 '북십자' 다섯 별, 꼬리의 데네브가 가장 밝게 (타일 안에 쏙 들어가게)
      return (
        <>
          <line x1="22" y1="12" x2="22" y2="36" stroke="#2563eb" strokeWidth="1.8" />
          <line x1="9" y1="22" x2="35" y2="22" stroke="#2563eb" strokeWidth="1.8" />
          <circle cx="22" cy="22" r="2.6" fill="#38bdf8" stroke="#1e3a8a" strokeWidth="0.6" />
          <circle cx="9" cy="22" r="2.3" fill="#38bdf8" stroke="#1e3a8a" strokeWidth="0.6" />
          <circle cx="35" cy="22" r="2.3" fill="#38bdf8" stroke="#1e3a8a" strokeWidth="0.6" />
          <circle cx="22" cy="36" r="2.3" fill="#38bdf8" stroke="#1e3a8a" strokeWidth="0.6" />
          <circle cx="22" cy="12" r="7" fill="#7dd3fc" opacity="0.55" />
          <polygon points={starPoints(4, 7, 2.4, 22, 12)} fill="url(#g_deneb)" stroke="#1d4ed8" strokeWidth="0.6" />
          <circle cx="22" cy="12" r="2.3" fill="#ffffff" />
          <defs>{lin('g_deneb', '#e0f2fe', '#38bdf8', '#1d4ed8')}</defs>
        </>
      );

    case 'pleiades': // 푸른 안개 속 일곱 개의 별(좀생이별)
      return (
        <>
          <ellipse cx="22" cy="22" rx="16" ry="14" fill="url(#g_ple_haze)" />
          {[[15, 13, 3.4], [26, 11, 2.8], [31, 19, 3], [22, 20, 3.8], [12, 24, 2.6], [20, 30, 3], [29, 30, 2.4]].map(([x, y, r], i) => (
            <g key={i}>
              <polygon points={starPoints(4, r * 1.7, r * 0.45, x, y)} fill="#dbeafe" />
              <circle cx={x} cy={y} r={r * 0.55} fill="#ffffff" />
            </g>
          ))}
          <defs>{rad('g_ple_haze', '#93c5fd', '#3b82f6', '#1e3a8a')}</defs>
        </>
      );

    // ===== 성운 =====
    case 'pillars': // 청록빛 하늘 앞 갈색 기둥 세 개
      return (
        <>
          <rect x="5" y="5" width="34" height="34" rx="9" fill="url(#g_pil_sky)" />
          <path d="M 9 39 L 10 20 Q 11 14 14 15 Q 17 16 16 22 L 17 39 Z" fill="url(#g_pil)" />
          <path d="M 18 39 L 19 14 Q 20 7 24 8 Q 27 10 26 16 L 27 39 Z" fill="url(#g_pil)" />
          <path d="M 29 39 L 30 26 Q 31 22 33 23 Q 36 24 35 28 L 35 39 Z" fill="url(#g_pil)" />
          <circle cx="12" cy="10" r="1" fill="#ffffff" />
          <circle cx="33" cy="12" r="1.3" fill="#ffffff" />
          <circle cx="29" cy="18" r="0.8" fill="#fef9c3" />
          <defs>
            {lin('g_pil_sky', '#99f6e4', '#2dd4bf', '#0f766e')}
            {lin('g_pil', '#fdba74', '#b45309', '#451a03')}
          </defs>
        </>
      );

    case 'horsehead': // 붉은 빛 앞 어두운 말머리
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#g_hh_glow)" />
          <path d="M 14 40 L 15 30 Q 13 26 15 22 Q 17 17 20 15 L 20 10 L 23 13 Q 28 13 31 18 Q 34 23 32 26 Q 30 27 28 25 L 27 23 Q 26 28 28 33 L 29 40 Z" fill="#1c1917" />
          <circle cx="25" cy="18" r="0.9" fill="#fda4af" />
          <circle cx="9" cy="12" r="1" fill="#ffffff" />
          <circle cx="35" cy="34" r="1.2" fill="#ffffff" />
          <defs>{rad('g_hh_glow', '#fda4af', '#e11d48', '#881337')}</defs>
        </>
      );

    case 'carina': // 우주 절벽: 푸른 하늘 아래 주황빛 구름 산
      return (
        <>
          <rect x="5" y="5" width="34" height="34" rx="9" fill="url(#g_car_sky)" />
          <path d="M 5 30 Q 9 22 13 25 Q 16 17 21 21 Q 24 14 29 19 Q 33 16 39 22 L 39 30 Q 39 39 30 39 L 14 39 Q 5 39 5 30 Z" fill="url(#g_car_cliff)" />
          <path d="M 8 26 Q 14 22 19 24 Q 25 18 32 21" stroke="#fde68a" strokeWidth="1" fill="none" opacity="0.8" />
          <polygon points={starPoints(4, 3.5, 0.8, 13, 12)} fill="#ffffff" />
          <polygon points={starPoints(4, 2.5, 0.6, 31, 10)} fill="#ffffff" />
          <circle cx="24" cy="9" r="0.9" fill="#ffffff" />
          <defs>
            {lin('g_car_sky', '#7dd3fc', '#3b82f6', '#1e3a8a')}
            {lin('g_car_cliff', '#fdba74', '#c2410c', '#431407')}
          </defs>
        </>
      );

    case 'lagoon': // 분홍 구름 + 가운데 어두운 석호 띠
      return (
        <>
          <ellipse cx="22" cy="22" rx="17" ry="13" fill="url(#g_lagoon)" />
          <circle cx="15" cy="17" r="6" fill="#f9a8d4" opacity="0.6" />
          <circle cx="29" cy="27" r="6" fill="#f472b6" opacity="0.5" />
          <path d="M 6 25 Q 15 18 22 22 Q 30 26 38 18" stroke="#3b0764" strokeWidth="3.4" fill="none" opacity="0.75" strokeLinecap="round" />
          <circle cx="24" cy="18" r="1.8" fill="#ffffff" />
          <circle cx="13" cy="27" r="1" fill="#ffffff" />
          <defs>{rad('g_lagoon', '#fbcfe8', '#ec4899', '#9d174d')}</defs>
        </>
      );

    case 'catseye': // 초록 겹겹 껍질 + 고양이 눈동자
      return (
        <>
          <ellipse cx="22" cy="22" rx="17" ry="11" fill="none" stroke="#2dd4bf" strokeWidth="2" opacity="0.7" transform="rotate(-20 22 22)" />
          <ellipse cx="22" cy="22" rx="14" ry="13" fill="none" stroke="#a78bfa" strokeWidth="1.6" opacity="0.7" transform="rotate(30 22 22)" />
          <ellipse cx="22" cy="22" rx="11" ry="9" fill="url(#g_catseye)" />
          <ellipse cx="22" cy="22" rx="2.6" ry="8" fill="#0f172a" />
          <circle cx="20.5" cy="18.5" r="1.3" fill="#ffffff" />
          <defs>{lin('g_catseye', '#a7f3d0', '#10b981', '#0e7490')}</defs>
        </>
      );

    case 'veil': // 얇은 비단 커튼처럼 물결치는 실
      return (
        <>
          <circle cx="22" cy="22" r="16" fill="#4c1d95" opacity="0.25" />
          <path d="M 8 8 Q 14 16 10 22 Q 6 30 13 37" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 15 6 Q 21 14 17 22 Q 13 30 20 38" stroke="#f472b6" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 22 6 Q 28 14 24 22 Q 20 30 27 38" stroke="#60a5fa" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 29 6 Q 35 14 31 22 Q 27 30 34 38" stroke="#f472b6" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 35 9 Q 39 16 37 22" stroke="#c4b5fd" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      );

    // ===== 은하와 블랙홀 =====
    case 'milkyway': // 막대나선 + '우리는 여기' 노란 점
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#g_mw_glow)" />
          <path d="M 16 19 Q 10 8 22 6 Q 36 6 37 20" stroke="#c4b5fd" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.95" />
          <path d="M 28 25 Q 34 36 22 38 Q 8 38 7 24" stroke="#c4b5fd" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.95" />
          <rect x="14" y="19.5" width="16" height="5" rx="2.5" fill="#fde68a" transform="rotate(25 22 22)" />
          <circle cx="22" cy="22" r="3.2" fill="#ffffff" />
          <circle cx="32" cy="31" r="1.8" fill="#facc15" stroke="#ffffff" strokeWidth="0.7" />
          <defs>{rad('g_mw_glow', '#a78bfa', '#6d28d9', '#1e1b4b')}</defs>
        </>
      );

    case 'lmc': // 떨어져 나온 구름 조각 + 분홍 별 탄생 지역
      return (
        <>
          <path d="M 7 24 Q 6 15 15 14 Q 18 7 27 10 Q 37 11 37 20 Q 39 29 30 31 Q 24 37 16 33 Q 8 32 7 24 Z" fill="url(#g_lmc)" />
          <ellipse cx="21" cy="22" rx="10" ry="3.5" fill="#f8fafc" opacity="0.8" transform="rotate(-20 21 22)" />
          <circle cx="29" cy="15" r="3.2" fill="#f472b6" opacity="0.9" />
          <circle cx="29" cy="15" r="1.3" fill="#ffffff" />
          {[[12, 27], [17, 15], [32, 26], [24, 30]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.9" fill="#ffffff" />
          ))}
          <defs>{lin('g_lmc', '#e0f2fe', '#7dd3fc', '#0369a1')}</defs>
        </>
      );

    case 'triangulum': // 느슨한 푸른 나선 + 삼각형 별자리
      return (
        <>
          <polygon points="22,3 40,36 4,36" fill="none" stroke="#fde68a" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
          <circle cx="22" cy="3.5" r="1.6" fill="#fde68a" />
          <circle cx="39.5" cy="35.5" r="1.6" fill="#fde68a" />
          <circle cx="4.5" cy="35.5" r="1.6" fill="#fde68a" />
          <circle cx="22" cy="24" r="12" fill="url(#g_tri_glow)" />
          <path d="M 22 24 Q 22 14 30 17 Q 35 21 31 28" stroke="#bfdbfe" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M 22 24 Q 22 34 14 31 Q 9 27 13 20" stroke="#bfdbfe" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="24" r="3" fill="#ffffff" />
          <defs>{rad('g_tri_glow', '#93c5fd', '#2563eb', '#1e3a8a')}</defs>
        </>
      );

    case 'whirlpool': // 큰 소용돌이 + 팔 끝의 작은 동반 은하
      return (
        <>
          <circle cx="19" cy="23" r="15" fill="url(#g_wp_glow)" />
          <path d="M 19 23 Q 19 11 30 13 Q 37 16 36 7" stroke="#e0e7ff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 19 23 Q 19 35 8 33 Q 3 29 5 20" stroke="#e0e7ff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M 19 23 Q 28 23 28 30" stroke="#f9a8d4" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M 19 23 Q 10 23 10 16" stroke="#f9a8d4" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.9" />
          <circle cx="19" cy="23" r="3.3" fill="#ffffff" />
          <circle cx="36" cy="7" r="4" fill="#fde68a" />
          <circle cx="36" cy="7" r="1.8" fill="#ffffff" />
          <defs>{rad('g_wp_glow', '#818cf8', '#4338ca', '#1e1b4b')}</defs>
        </>
      );

    case 'cartwheel': // 파란 고리 + 바퀴살 + 노란 중심
      return (
        <>
          <circle cx="22" cy="22" r="15" fill="none" stroke="url(#g_cw_ring)" strokeWidth="4.5" />
          {[[8, 20], [14, 9], [27, 8], [36, 18], [33, 32], [19, 36], [9, 30]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="#f472b6" />
          ))}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(d => {
            const a = (d * Math.PI) / 180;
            return <line key={d} x1={22 + 5 * Math.cos(a)} y1={22 + 5 * Math.sin(a)} x2={22 + 12.5 * Math.cos(a)} y2={22 + 12.5 * Math.sin(a)} stroke="#67e8f9" strokeWidth="1.1" opacity="0.8" />;
          })}
          <circle cx="22" cy="22" r="5" fill="#fbbf24" />
          <circle cx="22" cy="22" r="2.2" fill="#ffffff" />
          <defs>{lin('g_cw_ring', '#a5f3fc', '#22d3ee', '#0e7490')}</defs>
        </>
      );

    case 'sgra': // 분홍빛 고리 그림자 + 주위를 도는 별들의 궤도
      return (
        <>
          <ellipse cx="22" cy="22" rx="18" ry="7" fill="none" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.8" transform="rotate(30 22 22)" />
          <ellipse cx="22" cy="22" rx="17" ry="9" fill="none" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.8" transform="rotate(-40 22 22)" />
          <circle cx="22" cy="22" r="10" fill="none" stroke="url(#g_sgra)" strokeWidth="4.5" />
          <circle cx="22" cy="22" r="7.5" fill="#09090b" />
          <circle cx="16" cy="15" r="2" fill="#fdf4ff" opacity="0.9" />
          <circle cx="29" cy="19" r="1.6" fill="#fdf4ff" opacity="0.8" />
          <circle cx="24" cy="31" r="1.8" fill="#fdf4ff" opacity="0.85" />
          <circle cx="36" cy="13" r="1.4" fill="#ffffff" />
          <circle cx="8" cy="30" r="1.4" fill="#ffffff" />
          <defs>{lin('g_sgra', '#f5d0fe', '#e879f9', '#a21caf')}</defs>
        </>
      );

    case 'm87': // 아래가 밝은 주황 고리(첫 블랙홀 사진) + 푸른 제트
      return (
        <>
          <path d="M 26 18 L 41 4" stroke="#7dd3fc" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
          <path d="M 26 18 L 41 4" stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="21" cy="24" r="13" fill="none" stroke="#9a3412" strokeWidth="6" opacity="0.8" />
          <path d="M 8.5 26 A 13 13 0 0 0 33.5 26" stroke="url(#g_m87)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 10 21 A 12 12 0 0 1 32 21" stroke="#fb923c" strokeWidth="3" fill="none" opacity="0.7" />
          <circle cx="21" cy="24" r="9" fill="#09090b" />
          <defs>{lin('g_m87', '#fef3c7', '#fbbf24', '#ea580c')}</defs>
        </>
      );

    // ===== 탐사선과 우주망원경 =====
    case 'voyager1': // 하얀 접시 안테나 + 금빛 레코드 + 긴 막대
      return (
        <>
          <line x1="22" y1="24" x2="40" y2="34" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="22" y1="24" x2="6" y2="36" stroke="#cbd5e1" strokeWidth="1.2" />
          <circle cx="40" cy="34" r="1.6" fill="#94a3b8" />
          <ellipse cx="22" cy="14" rx="14" ry="8" fill="url(#g_vg_dish)" stroke="#64748b" strokeWidth="1" />
          <ellipse cx="22" cy="14" rx="9" ry="5" fill="none" stroke="#94a3b8" strokeWidth="0.7" />
          <line x1="22" y1="14" x2="22" y2="5" stroke="#475569" strokeWidth="1.2" />
          <rect x="16" y="21" width="12" height="7" rx="1.2" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
          <circle cx="22" cy="31.5" r="4.5" fill="url(#g_vg_gold)" stroke="#a16207" strokeWidth="0.8" />
          <circle cx="22" cy="31.5" r="1.2" fill="#a16207" />
          <defs>
            {lin('g_vg_dish', '#ffffff', '#e2e8f0', '#94a3b8')}
            {lin('g_vg_gold', '#fef08a', '#facc15', '#a16207')}
          </defs>
        </>
      );

    case 'hubble': // 은빛 원통 + 열린 덮개 + 파란 태양전지판 두 장
      return (
        <>
          <g transform="rotate(-35 22 22)">
            <rect x="4" y="9" width="10" height="5" rx="0.8" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.7" />
            <rect x="4" y="30" width="10" height="5" rx="0.8" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.7" />
            <line x1="9" y1="14" x2="9" y2="17" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="9" y1="27" x2="9" y2="30" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="4" y="16" width="32" height="12" rx="5" fill="url(#g_hubble)" stroke="#64748b" strokeWidth="0.8" />
            <line x1="22" y1="16" x2="22" y2="28" stroke="#94a3b8" strokeWidth="0.8" />
            <ellipse cx="36" cy="22" rx="2" ry="6" fill="#1e293b" />
            <path d="M 36 16 L 41 11" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          <defs>{lin('g_hubble', '#ffffff', '#cbd5e1', '#64748b')}</defs>
        </>
      );

    case 'jwst': // 보라 차광막 위 금빛 육각 거울 꽃
      return (
        <>
          <polygon points="22,27 41,33 22,40 3,33" fill="url(#g_jw_shield)" stroke="#c4b5fd" strokeWidth="0.7" />
          <line x1="22" y1="27" x2="22" y2="33" stroke="#94a3b8" strokeWidth="1" />
          {[[22, 15], [16, 11.5], [28, 11.5], [16, 18.5], [28, 18.5], [22, 8], [22, 22]].map(([x, y], i) => {
            const pts = Array.from({ length: 6 }).map((_, k) => {
              const a = ((60 * k + 30) * Math.PI) / 180;
              return `${(x + 3.9 * Math.cos(a)).toFixed(2)},${(y + 3.9 * Math.sin(a)).toFixed(2)}`;
            }).join(' ');
            return <polygon key={i} points={pts} fill="url(#g_jw_gold)" stroke="#92400e" strokeWidth="0.6" />;
          })}
          <circle cx="22" cy="15" r="1" fill="#1c1917" />
          <defs>
            {lin('g_jw_gold', '#fef9c3', '#facc15', '#b45309')}
            {lin('g_jw_shield', '#ddd6fe', '#8b5cf6', '#4c1d95')}
          </defs>
        </>
      );

    case 'nuri': // 하얀 로켓 + 태극 문양 + 주황 불꽃
      return (
        <>
          <path d="M 18 34 Q 22 44 26 34 Z" fill="#f97316" />
          <path d="M 19.5 34 Q 22 40 24.5 34 Z" fill="#fde047" />
          <path d="M 22 3 Q 28 9 28 17 L 28 33 L 16 33 L 16 17 Q 16 9 22 3 Z" fill="url(#g_nuri)" stroke="#64748b" strokeWidth="0.8" />
          <path d="M 16 27 L 11 34 L 16 33 Z" fill="#1d4ed8" />
          <path d="M 28 27 L 33 34 L 28 33 Z" fill="#1d4ed8" />
          <line x1="16" y1="13" x2="28" y2="13" stroke="#94a3b8" strokeWidth="0.7" />
          <circle cx="22" cy="20" r="3.4" fill="#cd2e3a" />
          <path d="M 18.6 20 A 3.4 3.4 0 0 0 25.4 20 A 1.7 1.7 0 0 0 22 20 A 1.7 1.7 0 0 1 18.6 20 Z" fill="#0047a0" />
          <defs>{lin('g_nuri', '#ffffff', '#f1f5f9', '#cbd5e1')}</defs>
        </>
      );

    case 'danuri': // 금빛 탐사선 몸체 + 태양전지판 + 뒤쪽의 달
      return (
        <>
          {ball('g_dan_moon', '#f5f5f4', '#d6d3d1', '#78716c', 10, 31, 31)}
          <circle cx="28" cy="29" r="1.8" fill="#a8a29e" />
          <circle cx="34" cy="34" r="1.3" fill="#a8a29e" />
          <rect x="3" y="12" width="13" height="8" rx="0.8" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.7" />
          <line x1="9.5" y1="12" x2="9.5" y2="20" stroke="#93c5fd" strokeWidth="0.6" />
          <line x1="16" y1="16" x2="18" y2="16" stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="18" y="10" width="11" height="12" rx="1.2" fill="url(#g_danuri)" stroke="#a16207" strokeWidth="0.8" />
          <path d="M 23.5 10 L 23.5 6 M 21 6 L 26 6" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="23.5" cy="16" r="1.8" fill="#1e293b" stroke="#e2e8f0" strokeWidth="0.6" />
          <defs>{lin('g_danuri', '#fef08a', '#eab308', '#a16207')}</defs>
        </>
      );

    case 'newhorizons': // 삼각형 몸체 + 큰 접시 안테나 + 명왕성의 하트
      return (
        <>
          <path d="M 33 36 C 33 33 37 32 37 35.5 C 37 32 41 33 41 36 C 41 39 37 41 37 42 C 37 41 33 39 33 36 Z" fill="#f9a8d4" stroke="#be185d" strokeWidth="0.6" transform="translate(-2 -5)" />
          <polygon points="12,30 30,30 21,20" fill="url(#g_nh_body)" stroke="#a16207" strokeWidth="0.8" />
          <ellipse cx="21" cy="15" rx="12" ry="7" fill="url(#g_nh_dish)" stroke="#64748b" strokeWidth="1" />
          <ellipse cx="21" cy="15" rx="7" ry="4" fill="none" stroke="#94a3b8" strokeWidth="0.7" />
          <line x1="21" y1="15" x2="21" y2="7" stroke="#475569" strokeWidth="1.1" />
          <line x1="12" y1="30" x2="6" y2="35" stroke="#cbd5e1" strokeWidth="1.2" />
          <circle cx="6" cy="35" r="2.6" fill="#475569" stroke="#cbd5e1" strokeWidth="0.7" />
          <defs>
            {lin('g_nh_body', '#fef08a', '#eab308', '#a16207')}
            {lin('g_nh_dish', '#ffffff', '#e2e8f0', '#94a3b8')}
          </defs>
        </>
      );

    default:
      return null;
  }
}
