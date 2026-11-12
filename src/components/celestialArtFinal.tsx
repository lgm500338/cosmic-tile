import React from 'react';

// ---------------------------------------------------------------------------
// 네 번째로 추가한 천체 50종의 타일 그림 (150 → 200종)
// 기존 그림과 같은 방식: 44x44 캔버스, 가운데(22,22)에 크게, 진한 그라데이션 + 위쪽 하이라이트.
// 그라데이션 id는 'gf_' 로 시작 (타일마다 고유하게 바꾸는 처리는 JellyTile 쪽에서 한다)
// 같은 레벨에 함께 나와도 헷갈리지 않도록 색·모양을 서로 확실히 다르게 그린다.
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

/** 끝까지 진한 구형 그라데이션 */
const solid = (id: string, a: string, b: string, c: string) => (
  <radialGradient id={id} cx="38%" cy="35%" r="70%">
    <stop offset="0%" stopColor={a} />
    <stop offset="55%" stopColor={b} />
    <stop offset="100%" stopColor={c} />
  </radialGradient>
);

const glint = (cx = 17, cy = 13.5, rx = 6, ry = 2.5, op = 0.5) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffffff" opacity={op} />
);

const starPoints = (n: number, R: number, r: number, cx = 22, cy = 22, rot = -90) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const rr = i % 2 === 0 ? R : r;
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
};

/** 네 갈래 반짝 별 */
const spark = (cx: number, cy: number, R: number, fill: string, key?: React.Key) => (
  <polygon key={key} points={starPoints(4, R, R * 0.3, cx, cy, -90)} fill={fill} />
);

/** 빛나는 별 (번짐 + 네 갈래 + 흰 중심) */
const glowStar = (id: string, cx: number, cy: number, R: number, core: string, mid: string) => (
  <g>
    <circle cx={cx} cy={cy} r={R * 1.6} fill={`url(#${id})`} />
    {spark(cx, cy, R * 1.25, mid)}
    <circle cx={cx} cy={cy} r={R * 0.45} fill={core} />
  </g>
);

/** 결정적 난수 (그림이 매번 같게) */
const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

/** 밤하늘 원판 (별자리·딥스카이 타일 바탕) */
const skyDisk = (id: string, a = '#312e81', b = '#1e1b4b', c = '#020617', r = 18) => (
  <>
    <circle cx="22" cy="22" r={r} fill={`url(#${id})`} />
    <defs>{solid(id, a, b, c)}</defs>
  </>
);

const tinyStars = (seed: number, n: number, R = 16, color = '#e0e7ff') => {
  const r = rng(seed);
  const out: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * R;
    out.push(<circle key={i} cx={22 + Math.cos(a) * d} cy={22 + Math.sin(a) * d} r={0.35 + r() * 0.45} fill={color} opacity={0.5 + r() * 0.5} />);
  }
  return out;
};

// 그림마다 실제로 그려진 범위 (타일을 꽉 채우도록)
export const FINAL_VIEWBOX: Record<string, string> = {
  olympus: '3 3 38 38', aurora: '3 3 38 38', eclipse: '2 2 40 40', vostok: '3 2 38 40',
  hayabusa2: '1 4 42 36', osirisrex: '2 2 40 40', dart: '1 3 42 38', didymos: '3 5 38 34',
  saturnrings: '2 4 40 36', hexagon: '3 3 38 38', jupiteraurora: '3 3 38 38', juno: '2 2 40 40',
  galileo: '3 2 38 40', pioneer10: '3 2 38 40', clipper: '1 5 42 34', lucy: '1 5 42 34',
  huygens: '4 2 36 40', kraken: '4 4 36 36', prometheus: '2 6 40 32', pandora: '3 6 38 32',
  janus: '3 4 38 36', daphnis: '2 4 40 36', uranusrings: '3 3 38 38', darkspot: '4 4 36 36',
  plutohaze: '3 3 38 38', nix: '3 6 38 32', hydra: '6 3 32 38', varuna: '3 3 38 38',
  heliopause: '2 3 40 38', oort: '2 2 40 40', palebluedot: '3 3 38 38', goldenrecord: '3 3 38 38',
  alphacen: '2 3 40 38', barnard: '2 5 40 34', siriusb: '3 3 38 38', epseridani: '2 5 40 34',
  albireo: '2 5 40 34', mizar: '3 3 38 38', bigdipper: '3 3 38 38', orionbelt: '3 3 38 38',
  crux: '3 3 38 38', kepler186f: '3 3 38 38', kepler452b: '3 3 38 38', kepler16b: '2 3 40 38',
  '55cnce': '4 4 36 36', wasp76b: '4 4 36 36', hudf: '3 3 38 38', cmb: '1 7 42 30',
  einsteinring: '3 3 38 38', stephan: '3 3 38 38',
};

export function renderFinalArt(symbolType: string): React.ReactElement | null {
  switch (symbolType) {
    // ================= 1구간: 지구 궤도와 내태양계 =================
    case 'olympus': // 위에서 내려다본 붉은 화성 위 거대한 방패 화산 + 분화구
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gf_oly_mars)" />
          <circle cx="22" cy="22" r="12" fill="url(#gf_oly_shield)" stroke="#7f1d1d" strokeWidth="1.2" />
          <circle cx="22" cy="22" r="8" fill="none" stroke="#fdba74" strokeWidth="0.8" opacity="0.7" />
          <ellipse cx="21" cy="21.5" rx="4.2" ry="3.4" fill="#7c2d12" />
          <ellipse cx="23.4" cy="22.8" rx="2.4" ry="2" fill="#5a1d0b" />
          <ellipse cx="20" cy="20.5" rx="1.8" ry="1.3" fill="#9a3412" />
          {glint(16, 11.5, 6, 2.2, 0.4)}
          <defs>
            {solid('gf_oly_mars', '#fb923c', '#c2410c', '#7c2d12')}
            {solid('gf_oly_shield', '#fed7aa', '#f97316', '#b45309')}
          </defs>
        </>
      );

    case 'aurora': // 밤하늘 원판 안 초록·분홍 빛 커튼 + 산 그림자
      return (
        <>
          <circle cx="22" cy="22" r="18" fill="url(#gf_aur_sky)" />
          {tinyStars(11, 14, 15)}
          <path d="M 6 22 Q 10 8 15 18 Q 19 6 24 16 Q 29 5 33 15 Q 37 9 39 18 L 39 28 Q 30 24 22 27 Q 14 30 5 27 Z" fill="url(#gf_aur_green)" opacity="0.95" />
          <path d="M 9 15 Q 14 6 18 13 Q 23 3 28 11 Q 33 4 36 12" stroke="#f0abfc" strokeWidth="1.6" fill="none" opacity="0.8" />
          <path d="M 4 32 L 11 25 L 16 30 L 22 23 L 28 29 L 33 25 L 40 32 L 40 34 Q 22 44 4 34 Z" fill="#0f172a" />
          <defs>
            {solid('gf_aur_sky', '#1e3a8a', '#172554', '#020617')}
            <linearGradient id="gf_aur_green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="45%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#065f46" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </>
      );

    case 'eclipse': // 검은 달 + 하얀·금빛 코로나 + 다이아몬드 반지 반짝임
      return (
        <>
          <circle cx="22" cy="22" r="19" fill="url(#gf_ecl_corona)" />
          <path d="M 22 2 L 23.5 12 L 20.5 12 Z M 22 42 L 23.5 32 L 20.5 32 Z M 2 22 L 12 20.5 L 12 23.5 Z M 42 22 L 32 20.5 L 32 23.5 Z" fill="#fef9c3" opacity="0.85" />
          <path d="M 8 8 L 15.5 13.5 L 13.5 15.5 Z M 36 36 L 28.5 30.5 L 30.5 28.5 Z M 36 8 L 30.5 15.5 L 28.5 13.5 Z M 8 36 L 13.5 28.5 L 15.5 30.5 Z" fill="#fde68a" opacity="0.7" />
          <circle cx="22" cy="22" r="11.5" fill="#fffbeb" />
          <circle cx="22" cy="22" r="10.5" fill="url(#gf_ecl_moon)" />
          {spark(30.5, 14, 4.5, '#ffffff')}
          <circle cx="30.5" cy="14" r="1.3" fill="#ffffff" />
          <defs>
            {rad('gf_ecl_corona', '#ffffff', '#fcd34d', '#f59e0b')}
            {solid('gf_ecl_moon', '#334155', '#0f172a', '#000000')}
          </defs>
        </>
      );

    case 'vostok': // 은빛 공 캡슐 (해치 하나 + 띠) + 아래 원뿔 모듈 + 비스듬한 안테나 하나
      return (
        <>
          <polygon points="13,27 31,27 35,40 9,40" fill="url(#gf_vos_cone)" stroke="#475569" strokeWidth="0.7" />
          <line x1="9" y1="40" x2="35" y2="40" stroke="#334155" strokeWidth="1.4" />
          <path d="M 11 33 H 33" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="15" y="25" width="14" height="3" rx="1" fill="#64748b" />
          <circle cx="22" cy="15" r="11" fill="url(#gf_vos_ball)" stroke="#475569" strokeWidth="0.7" />
          <path d="M 11.2 17 Q 22 21 32.8 17" stroke="#94a3b8" strokeWidth="1.1" fill="none" />
          <path d="M 12 11 Q 22 14.5 32 11" stroke="#94a3b8" strokeWidth="0.6" fill="none" opacity="0.7" />
          <circle cx="26" cy="13" r="3.4" fill="#475569" stroke="#e2e8f0" strokeWidth="0.9" />
          <circle cx="26" cy="13" r="1.9" fill="#1e3a8a" />
          <line x1="15" y1="6.5" x2="9" y2="1" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" />
          <circle cx="9" cy="1.2" r="0.9" fill="#e2e8f0" />
          {glint(17.5, 9, 4.5, 1.8, 0.75)}
          <defs>
            {solid('gf_vos_ball', '#ffffff', '#cbd5e1', '#64748b')}
            {lin('gf_vos_cone', '#e2e8f0', '#94a3b8', '#475569')}
          </defs>
        </>
      );

    case 'hayabusa2': // 금빛 상자 + 양옆 파란 태양전지판 + 아래 시료 채취 뿔 + 위 원반 안테나
      return (
        <>
          <rect x="1.5" y="17" width="12" height="10" rx="0.6" fill="url(#gf_hay_panel)" stroke="#93c5fd" strokeWidth="0.6" />
          <rect x="30.5" y="17" width="12" height="10" rx="0.6" fill="url(#gf_hay_panel)" stroke="#93c5fd" strokeWidth="0.6" />
          <path d="M 5.5 17 V 27 M 9.5 17 V 27 M 34.5 17 V 27 M 38.5 17 V 27" stroke="#93c5fd" strokeWidth="0.5" />
          <line x1="13.5" y1="22" x2="15" y2="22" stroke="#cbd5e1" strokeWidth="1.3" />
          <line x1="29" y1="22" x2="30.5" y2="22" stroke="#cbd5e1" strokeWidth="1.3" />
          <rect x="15" y="14" width="14" height="15" rx="1.2" fill="url(#gf_hay_gold)" stroke="#92400e" strokeWidth="0.7" />
          <path d="M 15.5 18 H 28.5 M 15.5 24 H 28.5" stroke="#b45309" strokeWidth="0.5" opacity="0.7" />
          <polygon points="20.5,29 23.5,29 22.8,39 21.2,39" fill="#d6d3d1" stroke="#78716c" strokeWidth="0.5" />
          <ellipse cx="22" cy="39.5" rx="2.4" ry="1" fill="#a8a29e" />
          <ellipse cx="22" cy="10" rx="6" ry="2.4" fill="url(#gf_hay_dish)" stroke="#64748b" strokeWidth="0.6" />
          <line x1="22" y1="12.4" x2="22" y2="14" stroke="#94a3b8" strokeWidth="1" />
          <defs>
            {lin('gf_hay_panel', '#60a5fa', '#1d4ed8', '#1e3a8a')}
            {lin('gf_hay_gold', '#fef08a', '#eab308', '#a16207')}
            {lin('gf_hay_dish', '#ffffff', '#e2e8f0', '#94a3b8')}
          </defs>
        </>
      );

    case 'osirisrex': // 하얀 몸통 + 아래로 뻗은 긴 팔 + 회색 소행성 표면에 닿는 순간
      return (
        <>
          <path d="M 2 37 Q 22 31 42 37 L 42 42 L 2 42 Z" fill="url(#gf_osx_rock)" />
          <circle cx="9" cy="37.5" r="1.6" fill="#44403c" />
          <circle cx="33" cy="38" r="2" fill="#44403c" />
          <circle cx="25" cy="39.5" r="1.1" fill="#57534e" />
          <rect x="2" y="9" width="9" height="6" rx="0.5" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="0.5" transform="rotate(-18 6.5 12)" />
          <rect x="33" y="9" width="9" height="6" rx="0.5" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="0.5" transform="rotate(18 37.5 12)" />
          <line x1="10.5" y1="13" x2="15" y2="14" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="29" y1="14" x2="33.5" y2="13" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="15" y="9" width="14" height="13" rx="1.4" fill="url(#gf_osx_body)" stroke="#64748b" strokeWidth="0.7" />
          <ellipse cx="22" cy="7" rx="5.5" ry="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.6" />
          <path d="M 22 22 L 25 28 L 23 34" stroke="#e2e8f0" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="23" cy="35" rx="3" ry="1.4" fill="url(#gf_osx_head)" stroke="#92400e" strokeWidth="0.5" />
          <path d="M 18 35 Q 16 32 17 30 M 28 35 Q 30 32 29 30" stroke="#d6d3d1" strokeWidth="0.8" fill="none" opacity="0.8" />
          {glint(19, 12, 3.5, 1.4, 0.7)}
          <defs>
            {lin('gf_osx_body', '#ffffff', '#e2e8f0', '#94a3b8')}
            {lin('gf_osx_head', '#fef3c7', '#f59e0b', '#b45309')}
            {lin('gf_osx_rock', '#a8a29e', '#57534e', '#292524')}
          </defs>
        </>
      );

    case 'dart': // 길쭉한 청록 날개 탐사선이 주황빛 소행성에 부딪히는 섬광
      return (
        <>
          <circle cx="33" cy="30" r="9" fill="url(#gf_dart_rock)" />
          <circle cx="36" cy="33" r="1.6" fill="#78350f" opacity="0.6" />
          <circle cx="31" cy="34" r="1" fill="#78350f" opacity="0.6" />
          {spark(27, 24, 8, '#fde047')}
          <circle cx="27" cy="24" r="3.2" fill="#ffffff" />
          <circle cx="27" cy="24" r="5.5" fill="url(#gf_dart_flash)" />
          <g transform="rotate(38 14 14)">
            <rect x="0" y="12" width="9" height="4" rx="2" fill="url(#gf_dart_wing)" stroke="#5eead4" strokeWidth="0.5" />
            <rect x="19" y="12" width="9" height="4" rx="2" fill="url(#gf_dart_wing)" stroke="#5eead4" strokeWidth="0.5" />
            <rect x="10" y="10.5" width="8" height="7" rx="1" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.6" />
            <line x1="9" y1="14" x2="10" y2="14" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="18" y1="14" x2="19" y2="14" stroke="#cbd5e1" strokeWidth="1" />
          </g>
          <path d="M 3 2 L 11 9 M 1 7 L 8 12" stroke="#99f6e4" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <defs>
            {solid('gf_dart_rock', '#fdba74', '#c2410c', '#7c2d12')}
            {rad('gf_dart_flash', '#ffffff', '#fef08a', '#facc15')}
            {lin('gf_dart_wing', '#5eead4', '#0d9488', '#134e4a')}
          </defs>
        </>
      );

    case 'didymos': // 회색 팽이 모양 소행성 (적도가 불룩) + 작은 위성 디모르포스
      return (
        <>
          <path d="M 4 24 Q 9 12 19 9 Q 25 8 30 11 Q 35 16 36 24 Q 30 33 20 35 Q 10 33 4 24 Z" fill="url(#gf_did_body)" stroke="#44403c" strokeWidth="0.7" />
          <path d="M 4 24 Q 20 28 36 24" stroke="#d6d3d1" strokeWidth="1.3" fill="none" opacity="0.8" />
          <circle cx="14" cy="18" r="2" fill="#57534e" opacity="0.6" />
          <circle cx="25" cy="29" r="1.6" fill="#57534e" opacity="0.6" />
          <circle cx="28" cy="17" r="1.2" fill="#57534e" opacity="0.6" />
          <ellipse cx="39" cy="10" rx="3" ry="2.4" fill="url(#gf_did_moon)" stroke="#44403c" strokeWidth="0.5" />
          <path d="M 33 6 A 10 6 0 0 1 42 14" stroke="#e7e5e4" strokeWidth="0.6" fill="none" strokeDasharray="1.4 1.4" opacity="0.7" />
          {glint(16, 13, 5, 1.8, 0.45)}
          <defs>
            {solid('gf_did_body', '#d6d3d1', '#78716c', '#292524')}
            {solid('gf_did_moon', '#e7e5e4', '#a8a29e', '#57534e')}
          </defs>
        </>
      );

    // ================= 2구간: 목성과 토성 =================
    case 'saturnrings': // 고리 자체를 크게: 금빛·베이지 띠 여러 겹 + 카시니 간극 + 반짝이는 얼음 알갱이
      return (
        <>
          <ellipse cx="22" cy="22" rx="20" ry="11" fill="none" stroke="url(#gf_rng_a)" strokeWidth="4" />
          <ellipse cx="22" cy="22" rx="15" ry="8" fill="none" stroke="url(#gf_rng_b)" strokeWidth="4.5" />
          <ellipse cx="22" cy="22" rx="10.5" ry="5.4" fill="none" stroke="#d6b98c" strokeWidth="2" opacity="0.7" />
          <ellipse cx="22" cy="22" rx="7.5" ry="3.8" fill="url(#gf_rng_planet)" />
          <ellipse cx="22" cy="22" rx="17.6" ry="9.5" fill="none" stroke="#1c1917" strokeWidth="0.9" opacity="0.8" />
          {spark(9, 15, 1.6, '#ffffff')}
          {spark(35, 29, 1.8, '#ffffff')}
          {spark(31, 13, 1.2, '#fef3c7')}
          <defs>
            {lin('gf_rng_a', '#fef3c7', '#eab308', '#a16207')}
            {lin('gf_rng_b', '#fffbeb', '#f59e0b', '#b45309')}
            {solid('gf_rng_planet', '#fde68a', '#d97706', '#78350f')}
          </defs>
        </>
      );

    case 'hexagon': // 북극에서 본 토성: 푸른 육각형 띠 + 가운데 소용돌이
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gf_hex_pole)" />
          <polygon points="22,10 32.4,16 32.4,28 22,34 11.6,28 11.6,16" fill="url(#gf_hex_in)" stroke="#bae6fd" strokeWidth="1.8" strokeLinejoin="round" />
          <polygon points="22,14 28.9,18 28.9,26 22,30 15.1,26 15.1,18" fill="none" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.7" strokeLinejoin="round" />
          <path d="M 22 22 m -5 0 a 5 5 0 1 1 5 5 a 3 3 0 1 1 -3 -3" stroke="#e0f2fe" strokeWidth="1.2" fill="none" />
          <circle cx="22" cy="22" r="1.8" fill="#0c4a6e" />
          {glint(15, 10, 5, 1.8, 0.4)}
          <defs>
            {solid('gf_hex_pole', '#fde68a', '#d4a24c', '#78350f')}
            {solid('gf_hex_in', '#38bdf8', '#1d4ed8', '#172554')}
          </defs>
        </>
      );

    case 'jupiteraurora': // 어두운 목성 극지방 + 크게 빛나는 보라·청록 오로라 고리
      return (
        <>
          <circle cx="22" cy="24" r="16" fill="url(#gf_jau_planet)" />
          <path d="M 7 28 Q 22 31 37 28 M 9 33 Q 22 36 35 33" stroke="#a16207" strokeWidth="1.4" fill="none" opacity="0.5" />
          <ellipse cx="22" cy="14" rx="12" ry="6" fill="url(#gf_jau_glow)" />
          <ellipse cx="22" cy="14" rx="9" ry="4" fill="none" stroke="#c4b5fd" strokeWidth="2.4" />
          <ellipse cx="22" cy="14" rx="9" ry="4" fill="none" stroke="#5eead4" strokeWidth="0.9" />
          <ellipse cx="22" cy="13" rx="4" ry="1.6" fill="none" stroke="#f0abfc" strokeWidth="0.9" opacity="0.9" />
          <defs>
            {solid('gf_jau_planet', '#78716c', '#44403c', '#1c1917')}
            {rad('gf_jau_glow', '#e9d5ff', '#a855f7', '#7c3aed')}
          </defs>
        </>
      );

    case 'juno': // 가운데 육각 몸통 + 120도로 뻗은 긴 파란 태양전지판 3장
      return (
        <>
          {[-90, 30, 150].map((deg, i) => (
            <g key={i} transform={`rotate(${deg} 22 22)`}>
              <rect x="27" y="19" width="15" height="6" rx="0.8" fill="url(#gf_juno_panel)" stroke="#bfdbfe" strokeWidth="0.6" />
              <path d="M 32 19 V 25 M 37 19 V 25" stroke="#bfdbfe" strokeWidth="0.5" />
              <line x1="26" y1="22" x2="27" y2="22" stroke="#cbd5e1" strokeWidth="1.2" />
            </g>
          ))}
          <polygon points="22,15.5 27.6,18.8 27.6,25.2 22,28.5 16.4,25.2 16.4,18.8" fill="url(#gf_juno_body)" stroke="#64748b" strokeWidth="0.7" />
          <circle cx="22" cy="22" r="3.6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
          <circle cx="22" cy="22" r="1.2" fill="#94a3b8" />
          <defs>
            {lin('gf_juno_panel', '#93c5fd', '#2563eb', '#1e3a8a')}
            {lin('gf_juno_body', '#fef3c7', '#d97706', '#78350f')}
          </defs>
        </>
      );

    case 'galileo': // 위쪽 금빛 우산살 안테나 + 아래 몸통 + 옆으로 뻗은 막대
      return (
        <>
          <path d="M 7 15 Q 22 1 37 15 Z" fill="url(#gf_glo_umb)" stroke="#92400e" strokeWidth="0.7" />
          {[10, 14.5, 19, 22, 25, 29.5, 34].map((x, i) => (
            <line key={i} x1="22" y1="7" x2={x} y2="15" stroke="#78350f" strokeWidth="0.5" opacity="0.8" />
          ))}
          <line x1="22" y1="15" x2="22" y2="19" stroke="#cbd5e1" strokeWidth="1.4" />
          <rect x="15" y="19" width="14" height="10" rx="1.2" fill="url(#gf_glo_body)" stroke="#475569" strokeWidth="0.7" />
          <path d="M 15 24 H 29" stroke="#1e293b" strokeWidth="0.6" />
          <line x1="29" y1="25" x2="40" y2="33" stroke="#cbd5e1" strokeWidth="1.1" strokeLinecap="round" />
          <line x1="15" y1="25" x2="4" y2="33" stroke="#cbd5e1" strokeWidth="1.1" strokeLinecap="round" />
          <rect x="38" y="31" width="4" height="4" rx="0.6" fill="#64748b" />
          <rect x="2" y="31" width="4" height="4" rx="0.6" fill="#64748b" />
          <polygon points="18,29 26,29 24,36 20,36" fill="url(#gf_glo_probe)" stroke="#7c2d12" strokeWidth="0.5" />
          <path d="M 21 36 L 22 41 L 23 36" stroke="#e2e8f0" strokeWidth="0.8" fill="none" />
          <defs>
            {lin('gf_glo_umb', '#fef08a', '#eab308', '#854d0e')}
            {lin('gf_glo_body', '#64748b', '#334155', '#0f172a')}
            {lin('gf_glo_probe', '#fdba74', '#c2410c', '#7c2d12')}
          </defs>
        </>
      );

    case 'pioneer10': // 정면을 향한 커다란 하얀 접시 안테나 + 뒤로 뻗은 두 막대 + 금속판
      return (
        <>
          <line x1="10" y1="30" x2="3" y2="41" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="34" y1="30" x2="41" y2="41" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="1" y="38" width="5" height="4" rx="0.6" fill="#78716c" />
          <rect x="38" y="38" width="5" height="4" rx="0.6" fill="#78716c" />
          <rect x="16" y="27" width="12" height="8" rx="1" fill="url(#gf_pio_body)" stroke="#475569" strokeWidth="0.6" />
          <rect x="19" y="29.5" width="6" height="3.4" rx="0.3" fill="url(#gf_pio_plaque)" stroke="#a16207" strokeWidth="0.4" />
          <circle cx="22" cy="16" r="14" fill="url(#gf_pio_dish)" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="22" cy="16" r="9.5" fill="none" stroke="#cbd5e1" strokeWidth="0.6" />
          <path d="M 12 9 L 22 16 L 32 9 M 22 16 L 22 3" stroke="#94a3b8" strokeWidth="0.7" />
          <circle cx="22" cy="16" r="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.6" />
          {glint(15, 8.5, 5, 2, 0.8)}
          <defs>
            {solid('gf_pio_dish', '#ffffff', '#e5e7eb', '#9ca3af')}
            {lin('gf_pio_body', '#cbd5e1', '#64748b', '#334155')}
            {lin('gf_pio_plaque', '#fef08a', '#eab308', '#a16207')}
          </defs>
        </>
      );

    case 'clipper': // 아주 긴 남색 날개 두 장 + 가운데 몸통·접시 + 구석의 금 간 유로파
      return (
        <>
          <circle cx="35" cy="34" r="6" fill="url(#gf_euc_europa)" />
          <path d="M 30 32 Q 35 34 40 31 M 32 37 L 38 35" stroke="#b45309" strokeWidth="0.7" fill="none" opacity="0.8" />
          <rect x="1" y="16" width="16" height="7" rx="0.6" fill="url(#gf_euc_panel)" stroke="#a5b4fc" strokeWidth="0.6" />
          <rect x="27" y="16" width="16" height="7" rx="0.6" fill="url(#gf_euc_panel)" stroke="#a5b4fc" strokeWidth="0.6" />
          <path d="M 5 16 V 23 M 9 16 V 23 M 13 16 V 23 M 31 16 V 23 M 35 16 V 23 M 39 16 V 23 M 1 19.5 H 17 M 27 19.5 H 43" stroke="#a5b4fc" strokeWidth="0.4" opacity="0.8" />
          <line x1="17" y1="19.5" x2="19" y2="19.5" stroke="#cbd5e1" strokeWidth="1.3" />
          <line x1="25" y1="19.5" x2="27" y2="19.5" stroke="#cbd5e1" strokeWidth="1.3" />
          <rect x="19" y="13" width="6" height="15" rx="1.2" fill="url(#gf_euc_body)" stroke="#64748b" strokeWidth="0.6" />
          <ellipse cx="22" cy="11" rx="5" ry="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
          <defs>
            {lin('gf_euc_panel', '#6366f1', '#312e81', '#1e1b4b')}
            {lin('gf_euc_body', '#ffffff', '#cbd5e1', '#64748b')}
            {solid('gf_euc_europa', '#fffbeb', '#e7d3b0', '#a8865b')}
          </defs>
        </>
      );

    case 'lucy': // 양옆 커다란 동그란 태양전지판 두 장 + 가운데 작은 몸통
      return (
        <>
          <circle cx="9" cy="22" r="8.5" fill="url(#gf_luc_panel)" stroke="#5eead4" strokeWidth="0.7" />
          <circle cx="35" cy="22" r="8.5" fill="url(#gf_luc_panel)" stroke="#5eead4" strokeWidth="0.7" />
          {[9, 35].map(cx => (
            <g key={cx} stroke="#99f6e4" strokeWidth="0.45" opacity="0.8">
              <line x1={cx} y1="13.5" x2={cx} y2="30.5" />
              <line x1={cx - 6} y1="16" x2={cx + 6} y2="28" />
              <line x1={cx + 6} y1="16" x2={cx - 6} y2="28" />
              <line x1={cx - 8.5} y1="22" x2={cx + 8.5} y2="22" />
            </g>
          ))}
          <line x1="17.5" y1="22" x2="26.5" y2="22" stroke="#cbd5e1" strokeWidth="1.3" />
          <rect x="18" y="17" width="8" height="10" rx="1" fill="url(#gf_luc_body)" stroke="#92400e" strokeWidth="0.6" />
          <ellipse cx="22" cy="15" rx="4" ry="1.6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
          <defs>
            {solid('gf_luc_panel', '#2dd4bf', '#0f766e', '#134e4a')}
            {lin('gf_luc_body', '#fef3c7', '#f59e0b', '#92400e')}
          </defs>
        </>
      );

    case 'huygens': // 주황 안개 속 줄무늬 낙하산 + 줄에 매달린 둥근 착륙선
      return (
        <>
          <circle cx="22" cy="24" r="17" fill="url(#gf_huy_haze)" />
          <path d="M 7 16 Q 22 -2 37 16 Q 33 13 29.5 16 Q 26 12 22 16 Q 18 12 14.5 16 Q 11 13 7 16 Z" fill="url(#gf_huy_chute)" stroke="#9a3412" strokeWidth="0.6" />
          <path d="M 14.5 16 Q 18 6 22 5 M 29.5 16 Q 26 6 22 5" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.7" />
          <path d="M 7 16 L 20 32 M 14.5 16 L 21 32 M 29.5 16 L 23 32 M 37 16 L 24 32" stroke="#fef3c7" strokeWidth="0.55" />
          <ellipse cx="22" cy="34.5" rx="6" ry="3" fill="url(#gf_huy_lander)" stroke="#475569" strokeWidth="0.6" />
          <ellipse cx="22" cy="33.3" rx="3" ry="1" fill="#f8fafc" opacity="0.8" />
          <defs>
            {rad('gf_huy_haze', '#fdba74', '#ea580c', '#9a3412')}
            {lin('gf_huy_chute', '#fef2f2', '#f87171', '#b91c1c')}
            {lin('gf_huy_lander', '#e2e8f0', '#94a3b8', '#334155')}
          </defs>
        </>
      );

    case 'kraken': // 주황빛 타이탄 북극에 검푸른 메탄 바다
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gf_krk_titan)" />
          <path d="M 12 10 Q 17 6 23 9 Q 28 7 31 12 Q 29 17 32 21 Q 27 26 22 22 Q 18 26 14 22 Q 9 18 12 10 Z" fill="url(#gf_krk_sea)" stroke="#bae6fd" strokeWidth="0.6" />
          <path d="M 25 26 Q 29 25 30 29 Q 27 32 24 30 Z" fill="#1e3a8a" />
          <path d="M 9 27 Q 11 25 13 27 Q 12 29 9 27 Z" fill="#1e3a8a" />
          <path d="M 15 13 Q 19 15 22 13 M 18 18 Q 22 20 26 17" stroke="#93c5fd" strokeWidth="0.7" fill="none" opacity="0.8" />
          {glint(28, 11, 4, 1.4, 0.55)}
          <defs>
            {solid('gf_krk_titan', '#fdba74', '#d97706', '#7c2d12')}
            {solid('gf_krk_sea', '#3b82f6', '#1e3a8a', '#0b1739')}
          </defs>
        </>
      );

    case 'prometheus': // 길쭉한 호박색 감자 위성 + 비틀린 F 고리 줄기
      return (
        <>
          <path d="M 1 30 Q 12 24 22 30 Q 32 36 43 28" stroke="#fde68a" strokeWidth="1.3" fill="none" opacity="0.9" />
          <path d="M 1 33 Q 13 27 22 32.5 Q 31 38 43 31" stroke="#fef3c7" strokeWidth="0.7" fill="none" opacity="0.6" />
          <path d="M 7 18 Q 9 10 19 10 Q 31 9 37 15 Q 40 21 33 25 Q 22 28 12 25 Q 5 23 7 18 Z" fill="url(#gf_prm_body)" stroke="#78350f" strokeWidth="0.7" />
          <path d="M 12 13 Q 22 17 33 13" stroke="#fde68a" strokeWidth="0.8" fill="none" opacity="0.6" />
          <circle cx="15" cy="19" r="2.2" fill="#92400e" opacity="0.55" />
          <circle cx="27" cy="21" r="1.6" fill="#92400e" opacity="0.55" />
          {glint(17, 12.5, 5, 1.6, 0.5)}
          <defs>{solid('gf_prm_body', '#fef9c3', '#eab308', '#854d0e')}</defs>
        </>
      );

    case 'pandora': // 둥그스름한 청회색 위성 (먼지로 매끈) + 고리 한 줄
      return (
        <>
          <ellipse cx="22" cy="22" rx="20" ry="4" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.65" transform="rotate(-8 22 22)" />
          <ellipse cx="22" cy="21.5" rx="14" ry="12" fill="url(#gf_pnd_body)" stroke="#334155" strokeWidth="0.7" />
          <circle cx="16" cy="18" r="3.6" fill="#64748b" opacity="0.4" />
          <circle cx="27" cy="25" r="2.6" fill="#64748b" opacity="0.4" />
          <circle cx="25" cy="15" r="1.8" fill="#64748b" opacity="0.35" />
          <path d="M 2.5 25 A 20 4 -8 0 0 41.5 19" stroke="#f8fafc" strokeWidth="1.3" fill="none" opacity="0.9" />
          {glint(17, 13.5, 5, 1.8, 0.55)}
          <defs>{solid('gf_pnd_body', '#e2e8f0', '#94a3b8', '#334155')}</defs>
        </>
      );

    case 'janus': // 크고 작은 회색 위성 둘 + 자리를 바꾸는 화살표
      return (
        <>
          <path d="M 8 12 A 17 12 0 0 1 34 8" stroke="#fbbf24" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <polygon points="34,8 29.5,6 31.5,11" fill="#fbbf24" />
          <path d="M 36 32 A 17 12 0 0 1 10 36" stroke="#fbbf24" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <polygon points="10,36 14.5,38 12.5,33" fill="#fbbf24" />
          <ellipse cx="15" cy="24" rx="9.5" ry="8" fill="url(#gf_jan_a)" stroke="#44403c" strokeWidth="0.6" />
          <circle cx="12" cy="22" r="2" fill="#57534e" opacity="0.5" />
          <circle cx="18" cy="27" r="1.5" fill="#57534e" opacity="0.5" />
          <ellipse cx="32" cy="20" rx="6.5" ry="5.5" fill="url(#gf_jan_b)" stroke="#44403c" strokeWidth="0.6" />
          <circle cx="33" cy="21" r="1.4" fill="#57534e" opacity="0.5" />
          {glint(12, 19, 3.5, 1.3, 0.5)}
          <defs>
            {solid('gf_jan_a', '#e7e5e4', '#a8a29e', '#44403c')}
            {solid('gf_jan_b', '#f5f5f4', '#d6d3d1', '#57534e')}
          </defs>
        </>
      );

    case 'daphnis': // 위·아래 금빛 고리 띠 사이 틈 + 가장자리 물결 + 가운데 작은 위성
      return (
        <>
          <path d="M 2 4 H 42 V 16 Q 37 16 34 19 Q 31 16 26 16 Q 22 13 18 16 Q 13 16 10 19 Q 7 16 2 16 Z" fill="url(#gf_dap_ring)" />
          <path d="M 2 40 H 42 V 28 Q 37 28 34 25 Q 31 28 26 28 Q 22 31 18 28 Q 13 28 10 25 Q 7 28 2 28 Z" fill="url(#gf_dap_ring)" />
          <path d="M 2 8 H 42 M 2 12 H 42 M 2 32 H 42 M 2 36 H 42" stroke="#fffbeb" strokeWidth="0.6" opacity="0.6" />
          <circle cx="22" cy="22" r="4.5" fill="url(#gf_dap_moon)" stroke="#78350f" strokeWidth="0.5" />
          <path d="M 17.6 22 Q 22 24.5 26.4 22" stroke="#fde68a" strokeWidth="0.7" fill="none" />
          {glint(20.5, 20, 1.8, 0.8, 0.7)}
          <defs>
            {lin('gf_dap_ring', '#fef3c7', '#eab308', '#a16207')}
            {solid('gf_dap_moon', '#fef3c7', '#d6b98c', '#78350f')}
          </defs>
        </>
      );

    // ================= 3구간: 태양계 끝자락 =================
    case 'uranusrings': // 옆으로 누운 청록 천왕성 + 세로로 선 가는 고리들
      return (
        <>
          <g transform="rotate(-78 22 22)">
            <ellipse cx="22" cy="22" rx="19" ry="6.5" fill="none" stroke="#0e7490" strokeWidth="1.2" />
            <ellipse cx="22" cy="22" rx="16.5" ry="5.4" fill="none" stroke="#67e8f9" strokeWidth="0.8" />
            <ellipse cx="22" cy="22" rx="14.5" ry="4.6" fill="none" stroke="#155e75" strokeWidth="0.7" />
          </g>
          <circle cx="22" cy="22" r="10.5" fill="url(#gf_urr_planet)" />
          <g transform="rotate(-78 22 22)">
            <path d="M 3 22 A 19 6.5 0 0 0 41 22" stroke="#22d3ee" strokeWidth="1.4" fill="none" />
            <path d="M 5.5 22 A 16.5 5.4 0 0 0 38.5 22" stroke="#a5f3fc" strokeWidth="0.9" fill="none" />
          </g>
          {glint(18, 16, 4, 1.6, 0.55)}
          <defs>{solid('gf_urr_planet', '#cffafe', '#22d3ee', '#0e7490')}</defs>
        </>
      );

    case 'darkspot': // 짙푸른 해왕성 + 크고 검은 타원 폭풍 + 옆의 하얀 구름
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gf_gds_planet)" />
          <path d="M 6 15 Q 22 12 38 15 M 5 29 Q 22 32 39 29" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.5" />
          <ellipse cx="20" cy="22" rx="10" ry="6" fill="url(#gf_gds_spot)" transform="rotate(-10 20 22)" />
          <ellipse cx="20" cy="22" rx="10" ry="6" fill="none" stroke="#1e3a8a" strokeWidth="0.8" transform="rotate(-10 20 22)" />
          <path d="M 11 17 Q 18 13 28 15" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.95" />
          <path d="M 29 27 Q 33 25 35 27" stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.9" />
          {glint(15, 10, 4.5, 1.6, 0.45)}
          <defs>
            {solid('gf_gds_planet', '#60a5fa', '#1d4ed8', '#172554')}
            {solid('gf_gds_spot', '#1e3a8a', '#0b1739', '#020617')}
          </defs>
        </>
      );

    case 'plutohaze': // 뒤에서 햇빛을 받은 검은 명왕성 + 둘레의 푸른 안개 고리
      return (
        <>
          <circle cx="22" cy="22" r="19" fill="url(#gf_phz_glow)" />
          <circle cx="22" cy="22" r="15.5" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
          <circle cx="22" cy="22" r="16.8" fill="none" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.8" />
          <circle cx="22" cy="22" r="18" fill="none" stroke="#bae6fd" strokeWidth="0.5" opacity="0.6" />
          <circle cx="22" cy="22" r="14.5" fill="url(#gf_phz_body)" />
          <path d="M 12 30 Q 16 26 20 29 Q 25 25 30 29" stroke="#334155" strokeWidth="1" fill="none" opacity="0.8" />
          <defs>
            {rad('gf_phz_glow', '#0ea5e9', '#0369a1', '#0c4a6e')}
            {solid('gf_phz_body', '#334155', '#0f172a', '#020617')}
          </defs>
        </>
      );

    case 'nix': // 길쭉한 붉은빛 회색 감자 + 커다란 붉은 크레이터
      return (
        <>
          <path d="M 5 22 Q 6 12 18 10 Q 32 8 38 16 Q 41 24 33 30 Q 20 35 10 31 Q 4 28 5 22 Z" fill="url(#gf_nix_body)" stroke="#57534e" strokeWidth="0.7" />
          <ellipse cx="25" cy="18" rx="5" ry="3.6" fill="url(#gf_nix_crater)" stroke="#7f1d1d" strokeWidth="0.6" />
          <circle cx="13" cy="24" r="2" fill="#78716c" opacity="0.6" />
          <circle cx="31" cy="26" r="1.5" fill="#78716c" opacity="0.6" />
          {glint(14, 14, 5, 1.8, 0.5)}
          <defs>
            {solid('gf_nix_body', '#e7e5e4', '#a8a29e', '#44403c')}
            {solid('gf_nix_crater', '#fca5a5', '#dc2626', '#7f1d1d')}
          </defs>
        </>
      );

    case 'hydra': // 아주 하얀 눈사람 모양 (두 덩어리) 얼음 위성
      return (
        <>
          <circle cx="24" cy="29" r="10.5" fill="url(#gf_hyd_ice)" stroke="#7dd3fc" strokeWidth="0.7" />
          <circle cx="19" cy="13.5" r="8" fill="url(#gf_hyd_ice)" stroke="#7dd3fc" strokeWidth="0.7" />
          <path d="M 13 20 Q 21 23 29 20" stroke="#bae6fd" strokeWidth="1" fill="none" opacity="0.8" />
          <circle cx="27" cy="32" r="2" fill="#bae6fd" opacity="0.8" />
          <circle cx="22" cy="15" r="1.4" fill="#bae6fd" opacity="0.8" />
          {glint(16, 10, 3.5, 1.5, 0.9)}
          {glint(20, 24, 4, 1.5, 0.8)}
          <defs>{solid('gf_hyd_ice', '#ffffff', '#e0f2fe', '#7dd3fc')}</defs>
        </>
      );

    case 'varuna': // 빨리 돌아 길쭉해진 짙은 자줏빛 갈색 달걀(비스듬히) + 회전 화살표
      return (
        <>
          <ellipse cx="22" cy="22" rx="9" ry="16" fill="url(#gf_var_body)" stroke="#3b0a1a" strokeWidth="0.7" transform="rotate(35 22 22)" />
          <path d="M 13 13 Q 20 22 31 31" stroke="#f9a8d4" strokeWidth="0.8" fill="none" opacity="0.35" />
          <circle cx="18" cy="24" r="2" fill="#3b0a1a" opacity="0.5" />
          <circle cx="26" cy="18" r="1.5" fill="#3b0a1a" opacity="0.5" />
          <path d="M 4 30 A 18 8 0 0 0 38 34" stroke="#f0abfc" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <polygon points="38,34 33.5,35 37,30" fill="#f0abfc" />
          {glint(15, 13, 3.6, 1.5, 0.45)}
          <defs>{solid('gf_var_body', '#be7a8a', '#7f1d3a', '#2a0612')}</defs>
        </>
      );

    case 'heliopause': // 보라빛 물방울 모양 비눗방울 경계 + 가운데 태양 + 경계를 넘는 보이저
      return (
        <>
          <path d="M 22 4 Q 40 6 40 22 Q 40 38 22 40 Q 8 40 3 30 Q 0 22 3 14 Q 8 4 22 4 Z" fill="url(#gf_hel_bubble)" stroke="#c4b5fd" strokeWidth="1.6" />
          <path d="M 22 9 Q 35 10 35 22 Q 35 34 22 35 Q 11 35 8 26 Q 6 18 10 13 Q 14 9 22 9 Z" fill="none" stroke="#a78bfa" strokeWidth="0.7" strokeDasharray="1.6 1.4" opacity="0.8" />
          <circle cx="21" cy="22" r="4.5" fill="url(#gf_hel_sun)" />
          <circle cx="21" cy="22" r="2.2" fill="#fffbeb" />
          <path d="M 25 18 L 38 7" stroke="#fde68a" strokeWidth="0.7" strokeDasharray="1 1.2" />
          {spark(38.5, 6.5, 2.4, '#ffffff')}
          <defs>
            {rad('gf_hel_bubble', '#4c1d95', '#6d28d9', '#a78bfa')}
            {rad('gf_hel_sun', '#fff7ed', '#facc15', '#f97316')}
          </defs>
        </>
      );

    case 'oort': // 가운데 작은 태양 + 공 껍질처럼 둘러싼 수많은 얼음 알갱이
      return (
        <>
          <circle cx="22" cy="22" r="19" fill="url(#gf_oor_shell)" />
          {(() => {
            const r = rng(77);
            const out: React.ReactElement[] = [];
            for (let i = 0; i < 70; i++) {
              const a = r() * Math.PI * 2;
              const d = 11 + r() * 8;
              out.push(<circle key={i} cx={22 + Math.cos(a) * d} cy={22 + Math.sin(a) * d} r={0.45 + r() * 0.6} fill={i % 3 === 0 ? '#ffffff' : '#a5f3fc'} />);
            }
            return out;
          })()}
          <circle cx="22" cy="22" r="10" fill="none" stroke="#67e8f9" strokeWidth="0.5" strokeDasharray="1 1.5" opacity="0.6" />
          <circle cx="22" cy="22" r="3.5" fill="url(#gf_oor_sun)" />
          <circle cx="22" cy="22" r="1.5" fill="#ffffff" />
          <defs>
            {rad('gf_oor_shell', '#164e63', '#0e7490', '#22d3ee')}
            {rad('gf_oor_sun', '#fffbeb', '#facc15', '#f59e0b')}
          </defs>
        </>
      );

    case 'palebluedot': // 어두운 우주 속 비스듬한 햇빛 줄기들 + 아주 작은 푸른 점
      return (
        <>
          <circle cx="22" cy="22" r="18" fill="url(#gf_pbd_sky)" />
          <path d="M 4 12 L 40 26 L 40 31 L 4 17 Z" fill="#c2410c" opacity="0.45" />
          <path d="M 4 19 L 40 33 L 40 36 L 6 24 Z" fill="#ea580c" opacity="0.35" />
          <path d="M 6 7 L 38 20 L 38 22 L 6 9.5 Z" fill="#9a3412" opacity="0.5" />
          <circle cx="25" cy="25" r="4.5" fill="none" stroke="#bae6fd" strokeWidth="0.6" strokeDasharray="1.2 1.2" />
          <circle cx="25" cy="25" r="1.8" fill="#60a5fa" />
          <circle cx="24.6" cy="24.6" r="0.7" fill="#e0f2fe" />
          <defs>{solid('gf_pbd_sky', '#292524', '#0c0a09', '#000000')}</defs>
        </>
      );

    case 'goldenrecord': // 금빛 음반 + 홈 + 가운데 그림 설명판
      return (
        <>
          <circle cx="22" cy="22" r="18" fill="url(#gf_grc_disc)" stroke="#78350f" strokeWidth="0.8" />
          {[16, 14, 12, 10].map(r => (
            <circle key={r} cx="22" cy="22" r={r} fill="none" stroke="#a16207" strokeWidth="0.45" opacity="0.8" />
          ))}
          <circle cx="22" cy="22" r="7" fill="url(#gf_grc_label)" stroke="#92400e" strokeWidth="0.5" />
          <circle cx="22" cy="22" r="1" fill="#1c1917" />
          <path d="M 17.5 19 L 20 19 M 17.5 25 L 20 25 M 24 19 L 26.5 19 M 24 25 L 26.5 25" stroke="#78350f" strokeWidth="0.6" />
          <path d="M 22 15.5 V 17.5 M 22 26.5 V 28.5" stroke="#78350f" strokeWidth="0.6" />
          <path d="M 9 13 Q 15 7 23 6" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.6" strokeLinecap="round" />
          <defs>
            {solid('gf_grc_disc', '#fef9c3', '#eab308', '#854d0e')}
            {solid('gf_grc_label', '#fffbeb', '#fde68a', '#ca8a04')}
          </defs>
        </>
      );

    // ================= 4구간: 이웃 별과 외계행성 =================
    case 'alphacen': // 노란 별 A(크게) + 주황 별 B + 멀리 작은 붉은 프록시마
      return (
        <>
          {glowStar('gf_acn_a', 16, 21, 8.5, '#ffffff', '#fde047')}
          {glowStar('gf_acn_b', 30, 25, 5.5, '#fff7ed', '#fb923c')}
          <circle cx="37.5" cy="8" r="2.2" fill="#ef4444" />
          <circle cx="37.5" cy="8" r="3.6" fill="#ef4444" opacity="0.3" />
          <defs>
            {rad('gf_acn_a', '#fffbeb', '#fde047', '#eab308')}
            {rad('gf_acn_b', '#fff7ed', '#fb923c', '#ea580c')}
          </defs>
        </>
      );

    case 'barnard': // 빠르게 달리는 붉은 왜성 + 뒤로 늘어진 속도선
      return (
        <>
          <path d="M 2 15 H 18 M 4 22 H 16 M 2 29 H 18" stroke="#fca5a5" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
          <path d="M 7 18.5 H 15 M 7 25.5 H 15" stroke="#f87171" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
          <circle cx="28" cy="22" r="14" fill="url(#gf_bar_glow)" />
          <circle cx="28" cy="22" r="10" fill="url(#gf_bar_star)" />
          <circle cx="25" cy="20" r="1.6" fill="#7f1d1d" opacity="0.45" />
          <circle cx="31" cy="25" r="1.2" fill="#7f1d1d" opacity="0.45" />
          {glint(25, 16, 4, 1.6, 0.5)}
          <defs>
            {rad('gf_bar_glow', '#fecaca', '#ef4444', '#b91c1c')}
            {solid('gf_bar_star', '#fca5a5', '#dc2626', '#7f1d1d')}
          </defs>
        </>
      );

    case 'siriusb': // 커다란 푸른 시리우스(뒤) + 그 앞에 아주 작고 하얗게 빛나는 백색왜성
      return (
        <>
          <circle cx="30" cy="14" r="11" fill="url(#gf_srb_big)" />
          <circle cx="30" cy="14" r="6" fill="#dbeafe" opacity="0.9" />
          <circle cx="15" cy="29" r="10" fill="url(#gf_srb_halo)" />
          {spark(15, 29, 8.5, '#e0f2fe')}
          <circle cx="15" cy="29" r="2.8" fill="#ffffff" />
          <circle cx="15" cy="29" r="4.4" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.8" />
          <defs>
            {rad('gf_srb_big', '#ffffff', '#60a5fa', '#1d4ed8')}
            {rad('gf_srb_halo', '#ffffff', '#bae6fd', '#38bdf8')}
          </defs>
        </>
      );

    case 'epseridani': // 주황 별 + 비스듬한 먼지 원반 + 원반 위 작은 행성
      return (
        <>
          <ellipse cx="22" cy="22" rx="20" ry="7" fill="none" stroke="url(#gf_eps_disk)" strokeWidth="3.5" transform="rotate(-15 22 22)" />
          <circle cx="22" cy="22" r="9" fill="url(#gf_eps_star)" />
          <circle cx="22" cy="22" r="4" fill="#fff7ed" />
          <path d="M 2.6 27.2 A 20 7 -15 0 0 41.4 16.8" stroke="url(#gf_eps_disk)" strokeWidth="3.5" fill="none" transform="rotate(0 22 22)" />
          <circle cx="36" cy="14" r="2.6" fill="url(#gf_eps_planet)" />
          <defs>
            {lin('gf_eps_disk', '#fde68a', '#d97706', '#78350f')}
            {solid('gf_eps_star', '#fed7aa', '#f97316', '#c2410c')}
            {solid('gf_eps_planet', '#e9d5ff', '#a78bfa', '#5b21b6')}
          </defs>
        </>
      );

    case 'albireo': // 금빛 별과 푸른 별이 나란히 (하늘의 보석)
      return (
        <>
          {glowStar('gf_alb_gold', 14.5, 23, 8, '#fffbeb', '#facc15')}
          {glowStar('gf_alb_blue', 32, 19, 6, '#eff6ff', '#60a5fa')}
          <defs>
            {rad('gf_alb_gold', '#fef9c3', '#f59e0b', '#d97706')}
            {rad('gf_alb_blue', '#dbeafe', '#3b82f6', '#1d4ed8')}
          </defs>
        </>
      );

    case 'mizar': // 하얀 별 미자르 + 작은 알코르 + 손잡이 달린 돋보기 속 쌍둥이 미자르 A·B
      return (
        <>
          {glowStar('gf_miz_a', 13, 27, 7, '#ffffff', '#e2e8f0')}
          <circle cx="23" cy="21" r="1.8" fill="#f1f5f9" />
          <circle cx="23" cy="21" r="3.2" fill="#e2e8f0" opacity="0.3" />
          <line x1="35.5" y1="18.5" x2="41" y2="24" stroke="#a16207" strokeWidth="3" strokeLinecap="round" />
          <circle cx="29" cy="12" r="8.5" fill="url(#gf_miz_lens)" stroke="#cbd5e1" strokeWidth="1.8" />
          {spark(26.5, 13, 3, '#ffffff')}
          {spark(31.8, 10.5, 2.4, '#bae6fd')}
          <path d="M 23.5 8 Q 26 5.5 29 5.2" stroke="#ffffff" strokeWidth="0.9" fill="none" opacity="0.7" />
          <defs>
            {rad('gf_miz_a', '#ffffff', '#cbd5e1', '#94a3b8')}
            {solid('gf_miz_lens', '#1e3a8a', '#172554', '#020617')}
          </defs>
        </>
      );

    case 'bigdipper': // 남색 밤하늘에 금빛 일곱 별을 이은 국자
      return (
        <>
          {skyDisk('gf_dip_sky')}
          {tinyStars(5, 10, 16)}
          <polyline points="6,13 12.5,15 18,19 23,23 24,31 35,32 37,23 23,23" fill="none" stroke="#fde68a" strokeWidth="0.9" opacity="0.8" strokeLinejoin="round" />
          {[[6, 13], [12.5, 15], [18, 19], [23, 23], [24, 31], [35, 32], [37, 23]].map(([x, y], i) => (
            <g key={i}>
              {spark(x, y, 2.7, '#fde047')}
              <circle cx={x} cy={y} r="1.1" fill="#ffffff" />
            </g>
          ))}
        </>
      );

    case 'orionbelt': // 비스듬히 한 줄로 늘어선 푸른 세 별
      return (
        <>
          {skyDisk('gf_blt_sky', '#1e3a8a', '#172554', '#020617')}
          {tinyStars(9, 10, 16)}
          <line x1="10" y1="30" x2="34" y2="14" stroke="#93c5fd" strokeWidth="0.6" opacity="0.5" />
          {glowStar('gf_blt_s', 11, 29.5, 4, '#ffffff', '#93c5fd')}
          {glowStar('gf_blt_s', 22, 22, 4.4, '#ffffff', '#93c5fd')}
          {glowStar('gf_blt_s', 33, 14.5, 3.8, '#ffffff', '#93c5fd')}
          <defs>{rad('gf_blt_s', '#e0f2fe', '#3b82f6', '#1d4ed8')}</defs>
        </>
      );

    case 'crux': // 짙은 청록 밤하늘에 네 별이 이루는 십자가
      return (
        <>
          {skyDisk('gf_crx_sky', '#0f766e', '#134e4a', '#021412')}
          {tinyStars(13, 9, 16)}
          <path d="M 22 6 L 22 37 M 11 19 L 32 23" stroke="#a7f3d0" strokeWidth="0.7" opacity="0.55" />
          {[[22, 6, 3.4], [22, 37, 4], [11, 19, 3.2], [32, 23, 2.8]].map(([x, y, r], i) => (
            <g key={i}>
              {spark(x, y, r, '#ffffff')}
              <circle cx={x} cy={y} r={r * 0.4} fill="#ecfeff" />
            </g>
          ))}
          <circle cx="27" cy="28" r="1" fill="#ffffff" />
        </>
      );

    case 'kepler186f': // 붉은 빛을 받은 지구 닮은 행성 + 구석의 붉은 왜성
      return (
        <>
          <circle cx="38" cy="7" r="7" fill="url(#gf_k186_star)" />
          <circle cx="20" cy="24" r="15" fill="url(#gf_k186_ocean)" />
          <path d="M 9 18 Q 13 14 18 17 Q 20 22 15 24 Q 10 23 9 18 Z M 22 27 Q 28 24 32 29 Q 30 35 24 34 Q 20 31 22 27 Z" fill="url(#gf_k186_land)" />
          <path d="M 7 29 Q 14 31 19 29" stroke="#fecaca" strokeWidth="1.1" fill="none" opacity="0.7" />
          <circle cx="20" cy="24" r="15" fill="url(#gf_k186_tint)" />
          {glint(26, 14, 4.5, 1.6, 0.45)}
          <defs>
            {rad('gf_k186_star', '#fecaca', '#ef4444', '#b91c1c')}
            {solid('gf_k186_ocean', '#60a5fa', '#1e40af', '#172554')}
            {lin('gf_k186_land', '#a16207', '#7c2d12', '#450a0a')}
            <radialGradient id="gf_k186_tint" cx="85%" cy="15%" r="90%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
        </>
      );

    case 'kepler452b': // 초록·황토 대륙과 구름 띠의 큰 행성 + 노란 해
      return (
        <>
          <circle cx="6" cy="7" r="5.5" fill="url(#gf_k452_sun)" />
          <circle cx="23" cy="23" r="16" fill="url(#gf_k452_ocean)" />
          <path d="M 12 14 Q 19 10 24 15 Q 22 21 16 21 Q 10 19 12 14 Z M 26 24 Q 33 21 36 27 Q 32 34 26 32 Q 23 28 26 24 Z M 12 29 Q 16 27 18 31 Q 15 34 12 29 Z" fill="url(#gf_k452_land)" />
          <path d="M 8 22 Q 18 18 30 20 Q 36 21 38 19" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.75" strokeLinecap="round" />
          <path d="M 13 35 Q 22 37 32 33" stroke="#ffffff" strokeWidth="1.1" fill="none" opacity="0.6" strokeLinecap="round" />
          {glint(17, 12, 5, 1.8, 0.45)}
          <defs>
            {rad('gf_k452_sun', '#fffbeb', '#facc15', '#f59e0b')}
            {solid('gf_k452_ocean', '#5eead4', '#0d9488', '#134e4a')}
            {lin('gf_k452_land', '#bef264', '#65a30d', '#854d0e')}
          </defs>
        </>
      );

    case 'kepler16b': // 뒤에 뜬 두 개의 해(주황·빨강) + 반쯤 그림자 진 행성
      return (
        <>
          <circle cx="11" cy="10" r="8" fill="url(#gf_k16_a)" />
          <circle cx="11" cy="10" r="4" fill="#fff7ed" />
          <circle cx="33" cy="8" r="5.5" fill="url(#gf_k16_b)" />
          <circle cx="33" cy="8" r="2.6" fill="#fee2e2" />
          <circle cx="22" cy="28" r="13" fill="url(#gf_k16_planet)" />
          <path d="M 22 15 A 13 13 0 0 1 22 41 A 7 13 0 0 0 22 15 Z" fill="#1c1917" opacity="0.55" />
          <path d="M 11 24 Q 22 22 33 25 M 10 31 Q 21 33 34 30" stroke="#fde68a" strokeWidth="0.9" fill="none" opacity="0.55" />
          <defs>
            {rad('gf_k16_a', '#fff7ed', '#fb923c', '#ea580c')}
            {rad('gf_k16_b', '#fee2e2', '#f87171', '#dc2626')}
            {solid('gf_k16_planet', '#fde68a', '#b45309', '#451a03')}
          </defs>
        </>
      );

    case '55cnce': // 검은 바위 + 빛나는 용암 균열 + 다이아몬드 반짝임
      return (
        <>
          <circle cx="22" cy="22" r="16" fill="url(#gf_55e_rock)" />
          <path d="M 9 15 L 16 19 L 14 25 L 21 28 L 27 23 L 34 26 M 16 19 L 23 14 L 30 17 M 21 28 L 19 35 M 27 23 L 29 12" stroke="#fb923c" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 9 15 L 16 19 L 14 25 L 21 28 L 27 23 L 34 26" stroke="#fef08a" strokeWidth="0.5" fill="none" />
          <polygon points="30,30 33,33 30,37 27,33" fill="#e9d5ff" stroke="#ffffff" strokeWidth="0.5" />
          <polygon points="13,30 15,32 13,34.5 11,32" fill="#ddd6fe" stroke="#ffffff" strokeWidth="0.4" />
          {spark(31, 10, 2.6, '#ffffff')}
          {glint(16, 11.5, 4.5, 1.5, 0.35)}
          <defs>{solid('gf_55e_rock', '#6b21a8', '#3b0764', '#0c0414')}</defs>
        </>
      );

    case 'wasp76b': // 낮은 이글거리는 주황, 밤은 어둡고 은빛 철 빗방울
      return (
        <>
          <circle cx="22" cy="22" r="16" fill="url(#gf_w76_day)" />
          <path d="M 22 6 A 16 16 0 0 1 22 38 A 9 16 0 0 0 22 6 Z" fill="url(#gf_w76_night)" />
          <path d="M 8 16 Q 14 14 19 16 M 7 25 Q 13 27 18 25" stroke="#fde68a" strokeWidth="1" fill="none" opacity="0.7" />
          {[[28, 13], [33, 18], [27, 21], [32, 26], [26, 29], [31, 32]].map(([x, y], i) => (
            <path key={i} d={`M ${x} ${y - 2.2} Q ${x + 1.3} ${y} ${x} ${y + 1} Q ${x - 1.3} ${y} ${x} ${y - 2.2} Z`} fill="#e2e8f0" stroke="#ffffff" strokeWidth="0.3" />
          ))}
          {glint(14, 11, 4.5, 1.6, 0.45)}
          <defs>
            {solid('gf_w76_day', '#fde047', '#f97316', '#b91c1c')}
            {lin('gf_w76_night', '#334155', '#1e293b', '#020617')}
          </defs>
        </>
      );

    // ================= 5구간: 우주의 가장 깊은 곳 =================
    case 'hudf': // 검은 하늘 조각 가득 알록달록 작은 은하들
      return (
        <>
          <rect x="4" y="4" width="36" height="36" rx="5" fill="url(#gf_hudf_bg)" stroke="#475569" strokeWidth="0.8" />
          {(() => {
            const r = rng(2004);
            const cols = ['#fde68a', '#fca5a5', '#93c5fd', '#f9a8d4', '#ffffff', '#fdba74', '#c4b5fd'];
            const out: React.ReactElement[] = [];
            for (let i = 0; i < 26; i++) {
              const x = 7 + r() * 30;
              const y = 7 + r() * 30;
              const s = 0.6 + r() * 1.8;
              const rot = Math.floor(r() * 180);
              out.push(<ellipse key={i} cx={x} cy={y} rx={s * 1.6} ry={s * (0.5 + r() * 0.6)} fill={cols[i % cols.length]} opacity={0.75 + r() * 0.25} transform={`rotate(${rot} ${x} ${y})`} />);
            }
            return out;
          })()}
          <g transform="rotate(-25 17 16)">
            <ellipse cx="17" cy="16" rx="5" ry="2.4" fill="#fde68a" opacity="0.9" />
            <circle cx="17" cy="16" r="1.2" fill="#ffffff" />
          </g>
          <g transform="rotate(30 29 29)">
            <ellipse cx="29" cy="29" rx="4.2" ry="2.6" fill="none" stroke="#93c5fd" strokeWidth="1" />
            <circle cx="29" cy="29" r="1" fill="#e0f2fe" />
          </g>
          <defs>{solid('gf_hudf_bg', '#1e1b4b', '#0b0a1f', '#000000')}</defs>
        </>
      );

    case 'cmb': // 타원 모양 하늘 지도에 파랑·노랑·빨강 얼룩
      return (
        <>
          <ellipse cx="22" cy="22" rx="20" ry="11" fill="url(#gf_cmb_base)" stroke="#1e293b" strokeWidth="0.9" />
          {(() => {
            const r = rng(1965);
            const cols = ['#ef4444', '#f97316', '#facc15', '#38bdf8', '#2563eb', '#f97316'];
            const out: React.ReactElement[] = [];
            for (let i = 0; i < 46; i++) {
              const a = r() * Math.PI * 2;
              const d = Math.sqrt(r());
              const x = 22 + Math.cos(a) * d * 18;
              const y = 22 + Math.sin(a) * d * 9.2;
              out.push(<circle key={i} cx={x} cy={y} r={0.9 + r() * 1.8} fill={cols[i % cols.length]} opacity={0.75} />);
            }
            return out;
          })()}
          <ellipse cx="22" cy="22" rx="20" ry="11" fill="none" stroke="#f8fafc" strokeWidth="0.6" opacity="0.6" />
          <defs>{solid('gf_cmb_base', '#fde68a', '#fb923c', '#2563eb')}</defs>
        </>
      );

    case 'einsteinring': // 가운데 노란 은하 + 둘레를 감싼 푸른 빛 고리
      return (
        <>
          {skyDisk('gf_ein_sky', '#1e293b', '#0f172a', '#020617')}
          {tinyStars(21, 8, 16)}
          <circle cx="22" cy="22" r="12" fill="none" stroke="url(#gf_ein_ring)" strokeWidth="4" />
          <circle cx="22" cy="22" r="12" fill="none" stroke="#e0f2fe" strokeWidth="0.9" />
          <path d="M 13 13 A 12 12 0 0 1 31 13" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.8" />
          <circle cx="22" cy="22" r="6" fill="url(#gf_ein_gal)" />
          <circle cx="22" cy="22" r="2.2" fill="#fffbeb" />
          <defs>
            {lin('gf_ein_ring', '#7dd3fc', '#2563eb', '#a78bfa')}
            {rad('gf_ein_gal', '#fffbeb', '#facc15', '#d97706')}
          </defs>
        </>
      );

    case 'stephan': // 모여 있는 다섯 은하 (넷은 금빛, 하나는 앞쪽의 푸른 은하)
      return (
        <>
          {skyDisk('gf_stq_sky', '#3b0764', '#1e1b4b', '#020617')}
          {tinyStars(1877, 8, 16)}
          {[[14, 15, 6, 3.2, -30], [27, 13, 5, 2.6, 20], [30, 26, 5.5, 3, -50], [19, 27, 4.5, 2.5, 40]].map(([x, y, rx, ry, rot], i) => (
            <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
              <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#gf_stq_gold)" />
              <circle cx={x} cy={y} r={ry * 0.5} fill="#fffbeb" />
            </g>
          ))}
          <g transform="rotate(-15 10 30)">
            <ellipse cx="10" cy="30" rx="4.5" ry="3.2" fill="url(#gf_stq_blue)" />
            <circle cx="10" cy="30" r="1.2" fill="#eff6ff" />
          </g>
          <path d="M 18 18 Q 24 20 26 15 M 27 23 Q 24 25 22 26" stroke="#f0abfc" strokeWidth="0.7" fill="none" opacity="0.7" />
          <defs>
            {rad('gf_stq_gold', '#fef9c3', '#fbbf24', '#d97706')}
            {rad('gf_stq_blue', '#dbeafe', '#60a5fa', '#2563eb')}
          </defs>
        </>
      );

    default:
      return null;
  }
}
