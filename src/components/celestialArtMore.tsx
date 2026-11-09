import React from 'react';

// ---------------------------------------------------------------------------
// 세 번째로 추가한 천체 50종의 타일 그림
// 기존 그림과 같은 방식: 44x44 캔버스, 가운데(22,22)에 크게, 그라데이션 + 위쪽 하이라이트.
// 그라데이션 id는 'gm_' 로 시작 (타일마다 고유하게 바꾸는 처리는 JellyTile 쪽에서 한다)
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

/** 끝까지 진한 구형 그라데이션 (가장자리가 투명해지지 않음) */
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

const ball = (id: string, a: string, b: string, c: string, r = 15, cx = 22, cy = 22) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    <defs>{lin(id, a, b, c)}</defs>
  </>
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

/** 작은 반짝 별 (네 갈래) */
const spark = (cx: number, cy: number, R: number, fill: string, key?: React.Key) => (
  <polygon key={key} points={starPoints(4, R, R * 0.3, cx, cy, -90)} fill={fill} />
);

/** 결정적 난수 (그림이 매번 같게) */
const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

/** 공 모양 성단의 별들 */
const clusterDots = (seed: number, n: number, R: number, colors: string[]) => {
  const r = rng(seed);
  const out: React.ReactElement[] = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 0.7) * R;
    const size = 0.6 + r() * (d < R * 0.4 ? 1.4 : 0.9);
    out.push(<circle key={i} cx={22 + Math.cos(a) * d} cy={22 + Math.sin(a) * d} r={size} fill={colors[i % colors.length]} />);
  }
  return out;
};

const wheel = (cx: number, cy: number, r = 2.6, key?: React.Key) => (
  <g key={key}>
    <circle cx={cx} cy={cy} r={r} fill="#1f2937" />
    <circle cx={cx} cy={cy} r={r * 0.45} fill="#9ca3af" />
  </g>
);

// 그림마다 실제로 그려진 범위 (타일을 꽉 채우도록)
export const MORE_VIEWBOX: Record<string, string> = {
  quaoar: '2 4 40 36', orcus: '3 4 38 38', gonggong: '5 5 34 34', redspot: '5.5 5.5 33 33',
  pan: '3 6 38 32', psyche: '4 5 36 36', hartley2: '2 4 40 36', rosetta: '1 4 42 36',
  spica: '3 3 38 38', regulus: '3 3 38 38', capella: '3 3 38 38', procyon: '3 3 38 38',
  fomalhaut: '2 4 40 36', algol: '4 4 36 36', mira: '2 5 40 34', proximab: '4 3 37 37',
  trappist1: '2 2 40 40', '51pegb': '2 2 40 40', hd189733b: '5.5 5.5 33 33', rosette: '3 3 38 38',
  northamerica: '4 3 36 38', trifid: '4 4 36 36', bubble: '3 3 38 38', butterfly: '2 5 40 34',
  southernring: '3 3 38 38', owl: '5 5 34 34', etacarinae: '3 3 38 38', casa: '3 3 38 38',
  sn1987a: '2 4 40 36', cygx1: '2 5 40 34', centaurusa: '3 3 38 38', smc: '4 5 36 34',
  tarantula: '2 2 40 40', m101: '3 3 38 38', m82: '2 3 40 38', antennae: '3 2 38 40',
  m64: '3 6 38 32', hyades: '3 4 38 36', omegacen: '4 4 36 36', m13: '3 3 38 38',
  jewelbox: '4 3 36 38', voyager2: '2 2 40 40', cassini: '3 2 38 40', parker: '2 2 40 40',
  curiosity: '2 4 40 36', perseverance: '2 4 40 36', ingenuity: '2 4 40 36', sputnik: '2 3 40 38',
  apollo11: '3 3 38 38', kitsat1: '2 4 40 36',
};

export function renderMoreArt(symbolType: string): React.ReactElement | null {
  switch (symbolType) {
    // ===== 해왕성 너머의 왜소행성 =====
    case 'quaoar': // 붉은 얼음 공 + 아주 멀리 떨어진 얇은 고리 + 작은 위성
      return (
        <>
          <ellipse cx="22" cy="22" rx="19" ry="6" fill="none" stroke="#fda4af" strokeWidth="1.4" opacity="0.85" transform="rotate(-14 22 22)" />
          <circle cx="22" cy="22" r="10.5" fill="url(#gm_quaoar)" />
          <path d="M 3.4 26.5 A 19 6 -14 0 0 40.6 17.5" fill="none" stroke="#fecdd3" strokeWidth="1.6" transform="rotate(0 22 22)" opacity="0.95" />
          <circle cx="18" cy="19" r="2" fill="#7f1d1d" opacity="0.4" />
          <circle cx="25" cy="25" r="1.5" fill="#7f1d1d" opacity="0.4" />
          <circle cx="36" cy="9" r="2.2" fill="#fca5a5" />
          {glint(19, 15.5, 4, 1.6, 0.5)}
          <defs>{solid('gm_quaoar', '#fda4af', '#dc2626', '#7f1d1d')}</defs>
        </>
      );

    case 'orcus': // 어두운 남회색 공 + 얼음 무늬 + 큰 위성 반스
      return (
        <>
          <circle cx="19" cy="23" r="14" fill="url(#gm_orcus)" />
          <path d="M 9 20 Q 14 17 19 20 Q 23 23 28 20" stroke="#e0f2fe" strokeWidth="1.4" fill="none" opacity="0.6" />
          <circle cx="15" cy="27" r="2.4" fill="#e0f2fe" opacity="0.35" />
          <circle cx="23" cy="30" r="1.6" fill="#e0f2fe" opacity="0.35" />
          <circle cx="35" cy="11" r="5.5" fill="url(#gm_vanth)" />
          {glint(14, 14.5, 5, 2, 0.4)}
          <defs>
            {solid('gm_orcus', '#94a3b8', '#334155', '#0f172a')}
            {solid('gm_vanth', '#e7e5e4', '#a8a29e', '#57534e')}
          </defs>
        </>
      );

    case 'gonggong': // 아주 붉은 공 + 얼룩 + 작은 위성 샹류
      return (
        <>
          {ball('gm_gonggong', '#f87171', '#b91c1c', '#450a0a', 15.5)}
          <path d="M 7 22 Q 14 18 22 23 Q 30 28 37 22" stroke="#450a0a" strokeWidth="3" fill="none" opacity="0.55" />
          <path d="M 9 29 Q 18 26 27 31" stroke="#fca5a5" strokeWidth="1.4" fill="none" opacity="0.6" />
          <circle cx="27" cy="15" r="3.4" fill="#450a0a" opacity="0.5" />
          <circle cx="14" cy="17" r="1.8" fill="#450a0a" opacity="0.45" />
          <circle cx="15" cy="31" r="2" fill="#fecaca" opacity="0.35" />
          <circle cx="34" cy="33" r="1.8" fill="#fecaca" />
          {glint(17, 13, 6, 2.4, 0.45)}
        </>
      );

    // ===== 거대 행성의 비밀 =====
    case 'redspot': // 목성 줄무늬 위의 큰 붉은 소용돌이
      return (
        <>
          <circle cx="22" cy="22" r="16" fill="url(#gm_rs_body)" />
          <clipPath id="gm_rs_clip"><circle cx="22" cy="22" r="16" /></clipPath>
          <g clipPath="url(#gm_rs_clip)">
            <rect x="4" y="10" width="36" height="3" fill="#b45309" opacity="0.7" />
            <rect x="4" y="16" width="36" height="2.4" fill="#fef3c7" opacity="0.7" />
            <rect x="4" y="31" width="36" height="3" fill="#b45309" opacity="0.7" />
          </g>
          <ellipse cx="22" cy="24.5" rx="10" ry="6.5" fill="url(#gm_rs_spot)" stroke="#fde68a" strokeWidth="1" />
          <path d="M 15 24.5 Q 18 20 23 21 Q 28 22 27 25.5 Q 25 28 21 27 Q 18.5 26 20 24.3" stroke="#fecaca" strokeWidth="1.2" fill="none" />
          {glint(17, 11, 6, 2, 0.4)}
          <defs>
            {lin('gm_rs_body', '#fde68a', '#f59e0b', '#92400e')}
            {solid('gm_rs_spot', '#f87171', '#dc2626', '#7f1d1d')}
          </defs>
        </>
      );

    case 'pan': // 만두(라비올리) 모양: 둥근 몸통 + 적도의 납작한 테두리
      return (
        <>
          <path d="M 4 23 Q 22 18 40 23 Q 22 27 4 23 Z" fill="#fde68a" stroke="#ca8a04" strokeWidth="0.8" />
          <ellipse cx="22" cy="22.5" rx="11" ry="9.5" fill="url(#gm_pan)" />
          <path d="M 5 23 Q 22 19.5 39 23" stroke="#fef9c3" strokeWidth="1.2" fill="none" />
          <circle cx="18" cy="18" r="1.4" fill="#a16207" opacity="0.5" />
          <circle cx="26" cy="27" r="1.1" fill="#a16207" opacity="0.5" />
          {glint(19, 15.5, 4.5, 1.6, 0.55)}
          <defs>{solid('gm_pan', '#fef3c7', '#d97706', '#78350f')}</defs>
        </>
      );

    // ===== 소행성·혜성 탐사 =====
    case 'psyche': // 금속빛 감자 모양 소행성 + 반짝이는 금속 점
      return (
        <>
          <path d="M 7 22 Q 6 11 18 8 Q 31 6 37 16 Q 40 28 30 35 Q 18 39 10 32 Q 7 28 7 22 Z" fill="url(#gm_psyche)" stroke="#334155" strokeWidth="0.8" />
          <circle cx="17" cy="23" r="4" fill="#475569" opacity="0.5" />
          <circle cx="28" cy="26" r="2.6" fill="#475569" opacity="0.5" />
          <path d="M 12 14 Q 20 10 30 13" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.8" strokeLinecap="round" />
          {spark(31, 18, 3, '#ffffff')}
          {spark(13, 29, 2.2, '#e2e8f0')}
          <defs>{lin('gm_psyche', '#f1f5f9', '#94a3b8', '#334155')}</defs>
        </>
      );

    case 'hartley2': // 땅콩 모양 핵 + 양 끝에서 뿜는 하얀 분출
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gm_h2_glow)" />
          <path d="M 30 15 L 40 8" stroke="#ecfeff" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
          <path d="M 30 15 L 39 15" stroke="#ecfeff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
          <path d="M 13 29 L 5 35" stroke="#ecfeff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <g transform="rotate(-35 22 22)">
            <ellipse cx="14.5" cy="22" rx="6.5" ry="5.5" fill="url(#gm_h2)" />
            <ellipse cx="29" cy="22" rx="7.5" ry="6.2" fill="url(#gm_h2)" />
            <rect x="16" y="19" width="12" height="6" fill="url(#gm_h2)" />
          </g>
          {glint(25, 15, 3.5, 1.4, 0.5)}
          <defs>
            {lin('gm_h2', '#a8a29e', '#57534e', '#1c1917')}
            {rad('gm_h2_glow', '#99f6e4', '#14b8a6', '#0f766e')}
          </defs>
        </>
      );

    case 'rosetta': // 아주 긴 파란 태양전지판 두 장 + 금빛 몸체 + 뒤의 혜성
      return (
        <>
          <path d="M 28 30 Q 32 26 37 28 Q 41 32 37 36 Q 31 38 28 30 Z" fill="#57534e" />
          <g transform="rotate(-18 22 22)">
            <rect x="1" y="19.5" width="16" height="5" rx="0.6" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.6" />
            <rect x="27" y="19.5" width="16" height="5" rx="0.6" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.6" />
            <line x1="5" y1="19.5" x2="5" y2="24.5" stroke="#93c5fd" strokeWidth="0.5" />
            <line x1="9" y1="19.5" x2="9" y2="24.5" stroke="#93c5fd" strokeWidth="0.5" />
            <line x1="13" y1="19.5" x2="13" y2="24.5" stroke="#93c5fd" strokeWidth="0.5" />
            <line x1="31" y1="19.5" x2="31" y2="24.5" stroke="#93c5fd" strokeWidth="0.5" />
            <line x1="35" y1="19.5" x2="35" y2="24.5" stroke="#93c5fd" strokeWidth="0.5" />
            <line x1="39" y1="19.5" x2="39" y2="24.5" stroke="#93c5fd" strokeWidth="0.5" />
            <rect x="16.5" y="16" width="11" height="12" rx="1" fill="url(#gm_rosetta)" stroke="#92400e" strokeWidth="0.7" />
            <ellipse cx="22" cy="14.5" rx="4.5" ry="1.6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
          </g>
          <defs>{lin('gm_rosetta', '#fef08a', '#f59e0b', '#b45309')}</defs>
        </>
      );

    // ===== 밝은 별들 =====
    case 'spica': // 바짝 붙어 도는 푸른 별 두 개
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gm_spica_glow)" />
          <polygon points={starPoints(4, 17, 2.6, 18, 21)} fill="#dbeafe" opacity="0.9" />
          <circle cx="18" cy="21" r="6.5" fill="url(#gm_spica)" />
          <circle cx="28" cy="25" r="4.2" fill="url(#gm_spica)" />
          <circle cx="16.5" cy="19.5" r="2.2" fill="#ffffff" />
          <circle cx="27.3" cy="24.2" r="1.4" fill="#ffffff" />
          <ellipse cx="23" cy="23" rx="11" ry="4" fill="none" stroke="#93c5fd" strokeWidth="0.8" strokeDasharray="1.6 1.6" transform="rotate(20 23 23)" />
          <defs>
            {solid('gm_spica', '#ffffff', '#60a5fa', '#1d4ed8')}
            {rad('gm_spica_glow', '#bfdbfe', '#3b82f6', '#1e3a8a')}
          </defs>
        </>
      );

    case 'regulus': // 빠른 자전으로 납작한 푸른 흰 별 + 사자의 왕관
      return (
        <>
          <circle cx="22" cy="25" r="16" fill="url(#gm_reg_glow)" />
          <ellipse cx="22" cy="26" rx="13" ry="9.5" fill="url(#gm_regulus)" />
          <ellipse cx="22" cy="26" rx="13" ry="2" fill="#ffffff" opacity="0.35" />
          <path d="M 13 13 L 15 6 L 18.5 10.5 L 22 4 L 25.5 10.5 L 29 6 L 31 13 Z" fill="url(#gm_reg_crown)" stroke="#a16207" strokeWidth="0.7" />
          <circle cx="22" cy="9" r="1.2" fill="#f43f5e" />
          {glint(18, 21, 5, 1.8, 0.6)}
          <defs>
            {solid('gm_regulus', '#ffffff', '#93c5fd', '#2563eb')}
            {rad('gm_reg_glow', '#dbeafe', '#60a5fa', '#1e40af')}
            {lin('gm_reg_crown', '#fef9c3', '#facc15', '#ca8a04')}
          </defs>
        </>
      );

    case 'capella': // 노란 거성 둘 + 작은 붉은 별 둘
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gm_cap_glow)" />
          <polygon points={starPoints(6, 17, 7, 22, 22, -90)} fill="#fef3c7" opacity="0.6" />
          <circle cx="17.5" cy="20" r="7" fill="url(#gm_capella)" />
          <circle cx="27" cy="24.5" r="6" fill="url(#gm_capella2)" />
          <circle cx="35" cy="34" r="1.8" fill="#ef4444" />
          <circle cx="38" cy="31" r="1.4" fill="#ef4444" />
          {glint(15.5, 16.5, 3.2, 1.3, 0.75)}
          <defs>
            {solid('gm_capella', '#fffbeb', '#facc15', '#b45309')}
            {solid('gm_capella2', '#fef3c7', '#f59e0b', '#9a3412')}
            {rad('gm_cap_glow', '#fef08a', '#eab308', '#a16207')}
          </defs>
        </>
      );

    case 'procyon': // 흰노란 별 + 작은 백색왜성 + 겨울 대삼각형
      return (
        <>
          <polygon points="22,6 38,36 6,36" fill="none" stroke="#fde68a" strokeWidth="1" strokeDasharray="2 1.6" opacity="0.8" />
          <circle cx="6" cy="36" r="2.2" fill="#f97316" />
          <circle cx="22" cy="6" r="2.2" fill="#e0f2fe" />
          <circle cx="30" cy="25" r="12" fill="url(#gm_pro_glow)" />
          <polygon points={starPoints(5, 12, 5, 30, 25)} fill="url(#gm_procyon)" />
          <circle cx="30" cy="25" r="3.8" fill="#ffffff" />
          <circle cx="38.5" cy="16" r="1.5" fill="#ffffff" stroke="#bae6fd" strokeWidth="0.6" />
          <defs>
            {lin('gm_procyon', '#fffbeb', '#fcd34d', '#d97706')}
            {rad('gm_pro_glow', '#fef3c7', '#fbbf24', '#b45309')}
          </defs>
        </>
      );

    case 'fomalhaut': // 하얀 별 + 비스듬한 주황 먼지 고리
      return (
        <>
          <ellipse cx="22" cy="22" rx="19" ry="9" fill="none" stroke="url(#gm_fom_ring)" strokeWidth="4" transform="rotate(-25 22 22)" />
          <ellipse cx="22" cy="22" rx="19" ry="9" fill="none" stroke="#fef3c7" strokeWidth="0.7" transform="rotate(-25 22 22)" opacity="0.9" />
          <circle cx="22" cy="22" r="9" fill="url(#gm_fom_glow)" />
          <polygon points={starPoints(4, 11, 2.6)} fill="#ffffff" />
          <circle cx="22" cy="22" r="3.6" fill="#ffffff" />
          <defs>
            {lin('gm_fom_ring', '#fdba74', '#ea580c', '#9a3412')}
            {rad('gm_fom_glow', '#ffffff', '#fde68a', '#f59e0b')}
          </defs>
        </>
      );

    case 'algol': // 밝은 별을 어두운 짝별이 반쯤 가리는 "깜빡이는 눈"
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gm_alg_glow)" />
          <circle cx="19" cy="22" r="11" fill="url(#gm_algol)" />
          <circle cx="28" cy="20" r="9" fill="url(#gm_alg_dark)" />
          <circle cx="15" cy="19" r="2.6" fill="#ffffff" opacity="0.9" />
          <path d="M 6 34 Q 22 40 38 34" stroke="#c4b5fd" strokeWidth="1" fill="none" strokeDasharray="1.6 1.6" />
          <defs>
            {solid('gm_algol', '#ffffff', '#c4b5fd', '#6d28d9')}
            {solid('gm_alg_dark', '#4c1d95', '#2e1065', '#0f0a1f')}
            {rad('gm_alg_glow', '#ddd6fe', '#8b5cf6', '#4c1d95')}
          </defs>
        </>
      );

    case 'mira': // 붉은 거성 + 뒤로 길게 남긴 혜성 같은 꼬리
      return (
        <>
          <path d="M 28 15 Q 12 16 2 26 Q 14 22 28 29 Z" fill="url(#gm_mira_tail)" opacity="0.9" />
          <path d="M 26 18 Q 14 20 6 25" stroke="#fecaca" strokeWidth="0.8" fill="none" opacity="0.7" />
          <circle cx="29" cy="22" r="9.5" fill="url(#gm_mira_glow)" />
          <circle cx="29" cy="22" r="7.5" fill="url(#gm_mira)" />
          <circle cx="27" cy="20" r="2" fill="#fee2e2" />
          <defs>
            {solid('gm_mira', '#fecaca', '#ef4444', '#7f1d1d')}
            {rad('gm_mira_glow', '#fca5a5', '#dc2626', '#7f1d1d')}
            <linearGradient id="gm_mira_tail" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>
        </>
      );

    // ===== 외계행성 =====
    case 'proximab': // 붉은 별빛을 받는 바위 행성 + 구석의 작은 붉은 왜성
      return (
        <>
          <circle cx="35" cy="9" r="6" fill="url(#gm_pxb_star_glow)" />
          <circle cx="35" cy="9" r="3" fill="#fca5a5" />
          <circle cx="20" cy="25" r="14" fill="url(#gm_proximab)" />
          <path d="M 9 22 Q 15 19 21 23 Q 27 27 33 24" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.45" />
          <circle cx="16" cy="30" r="2.6" fill="#7c2d12" opacity="0.4" />
          <path d="M 10 33 A 14 14 0 0 0 33 31" stroke="#1c1917" strokeWidth="5" fill="none" opacity="0.35" />
          {glint(25, 16, 5, 1.8, 0.45)}
          <defs>
            <radialGradient id="gm_proximab" cx="70%" cy="25%" r="80%">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="50%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#431407" />
            </radialGradient>
            {rad('gm_pxb_star_glow', '#fecaca', '#ef4444', '#991b1b')}
          </defs>
        </>
      );

    case 'trappist1': // 작고 붉은 별 + 둘러선 행성 일곱 개
      return (
        <>
          {[7, 9.5, 12, 14.5, 16.5, 18.5, 20].map((r, i) => (
            <circle key={`o${i}`} cx="22" cy="22" r={r} fill="none" stroke="#fca5a5" strokeWidth="0.35" opacity="0.5" />
          ))}
          <circle cx="22" cy="22" r="7" fill="url(#gm_tr_glow)" />
          <circle cx="22" cy="22" r="4.2" fill="url(#gm_trappist)" />
          {[
            [7, 20], [9.5, 75], [12, 150], [14.5, 215], [16.5, 290], [18.5, 340], [20, 115],
          ].map(([r, deg], i) => {
            const a = (deg * Math.PI) / 180;
            const colors = ['#fb923c', '#fbbf24', '#60a5fa', '#34d399', '#38bdf8', '#a78bfa', '#e2e8f0'];
            return <circle key={i} cx={22 + Math.cos(a) * r} cy={22 + Math.sin(a) * r} r={i === 2 || i === 3 ? 2.1 : 1.8} fill={colors[i]} stroke="#1e1b4b" strokeWidth="0.4" />;
          })}
          <defs>
            {solid('gm_trappist', '#fecaca', '#ef4444', '#991b1b')}
            {rad('gm_tr_glow', '#fca5a5', '#dc2626', '#7f1d1d')}
          </defs>
        </>
      );

    case '51pegb': // 별 바로 곁에서 달궈진 주황빛 가스 행성
      return (
        <>
          <circle cx="10" cy="10" r="8.5" fill="url(#gm_51_star)" />
          <circle cx="10" cy="10" r="4.5" fill="#fffbeb" />
          <circle cx="26" cy="26" r="13" fill="url(#gm_51pegb)" />
          <clipPath id="gm_51_clip"><circle cx="26" cy="26" r="13" /></clipPath>
          <g clipPath="url(#gm_51_clip)">
            <path d="M 12 22 Q 26 19 40 22" stroke="#fef08a" strokeWidth="1.6" fill="none" opacity="0.7" />
            <path d="M 12 28 Q 26 25 40 28" stroke="#7c2d12" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M 12 33 Q 26 30 40 33" stroke="#fde68a" strokeWidth="1.2" fill="none" opacity="0.6" />
          </g>
          <path d="M 16 34 A 13 13 0 0 0 38 31" stroke="#431407" strokeWidth="4" fill="none" opacity="0.4" />
          <defs>
            {rad('gm_51_star', '#ffffff', '#fde047', '#f97316')}
            <radialGradient id="gm_51pegb" cx="25%" cy="25%" r="85%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>
          </defs>
        </>
      );

    case 'hd189733b': // 짙은 파란 행성 + 옆으로 휘몰아치는 바람
      return (
        <>
          {ball('gm_hd189', '#7dd3fc', '#2563eb', '#172554', 16)}
          <clipPath id="gm_hd_clip"><circle cx="22" cy="22" r="16" /></clipPath>
          <g clipPath="url(#gm_hd_clip)" strokeLinecap="round" fill="none">
            <path d="M 4 15 Q 18 12 30 15" stroke="#bae6fd" strokeWidth="1.4" opacity="0.8" />
            <path d="M 10 21 Q 24 18 40 21" stroke="#e0f2fe" strokeWidth="1" opacity="0.7" />
            <path d="M 4 27 Q 16 24 34 27" stroke="#93c5fd" strokeWidth="1.6" opacity="0.7" />
            <path d="M 12 33 Q 24 30 38 33" stroke="#bae6fd" strokeWidth="1" opacity="0.6" />
          </g>
          {glint(16, 12, 5, 2, 0.5)}
        </>
      );

    // ===== 성운 =====
    case 'rosette': // 분홍 꽃잎 고리 + 가운데 빈 구멍의 푸른 별들
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gm_rose)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((d, i) => (
            <ellipse key={i} cx="22" cy="10" rx="5.5" ry="6.5" fill="#be185d" opacity="0.55" transform={`rotate(${d} 22 22)`} />
          ))}
          <circle cx="22" cy="22" r="7.5" fill="#1e1b4b" opacity="0.85" />
          <circle cx="20" cy="20" r="1.4" fill="#bfdbfe" />
          <circle cx="24.5" cy="23" r="1.8" fill="#ffffff" />
          <circle cx="21" cy="25" r="1" fill="#93c5fd" />
          <circle cx="25" cy="19.5" r="0.9" fill="#bfdbfe" />
          <defs>{rad('gm_rose', '#fda4af', '#ec4899', '#831843')}</defs>
        </>
      );

    case 'northamerica': // 북아메리카 대륙 모양의 붉은 구름
      return (
        <>
          <rect x="4" y="3" width="36" height="38" rx="6" fill="#1e1b4b" opacity="0.0" />
          <path
            d="M 9 8 Q 15 5 22 7 Q 30 5 36 9 Q 38 13 33 15 Q 30 17 31 21 Q 29 25 25 26 Q 22 28 22 32 Q 21 37 18 39 Q 17 34 14 31 Q 10 27 10 22 Q 7 17 9 13 Q 6 10 9 8 Z"
            fill="url(#gm_na)"
          />
          <path d="M 25 15 Q 28 18 26 21" stroke="#450a0a" strokeWidth="2.4" fill="none" opacity="0.55" strokeLinecap="round" />
          <path d="M 12 11 Q 18 9 24 11" stroke="#fecaca" strokeWidth="1" fill="none" opacity="0.6" />
          {spark(33, 33, 2.6, '#ffffff')}
          <circle cx="36" cy="27" r="0.9" fill="#ffffff" />
          <defs>{lin('gm_na', '#fca5a5', '#dc2626', '#7f1d1d')}</defs>
        </>
      );

    case 'trifid': // 세 갈래 검은 먼지 띠로 나뉜 붉은 성운 + 위쪽 푸른 구름
      return (
        <>
          <circle cx="22" cy="10" r="10" fill="url(#gm_tri_blue)" />
          <circle cx="22" cy="24" r="13.5" fill="url(#gm_trifid)" />
          <path d="M 22 24 L 22 10.5" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 22 24 L 10 32" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 22 24 L 34 31" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="22" cy="24" r="2" fill="#ffffff" />
          <defs>
            {solid('gm_trifid', '#fda4af', '#e11d48', '#831843')}
            {rad('gm_tri_blue', '#bfdbfe', '#3b82f6', '#1e3a8a')}
          </defs>
        </>
      );

    case 'bubble': // 투명한 푸른 비눗방울 + 안쪽의 무거운 별 + 아래 붉은 구름
      return (
        <>
          <path d="M 3 36 Q 10 28 18 33 Q 26 27 33 33 Q 39 30 41 37 L 41 41 L 3 41 Z" fill="#b91c1c" opacity="0.7" />
          <circle cx="22" cy="20" r="15" fill="url(#gm_bubble)" />
          <circle cx="22" cy="20" r="15" fill="none" stroke="#e0f2fe" strokeWidth="1.4" />
          <path d="M 12 12 Q 16 7 22 6.5" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.85" />
          <circle cx="25" cy="22" r="3.6" fill="url(#gm_bub_star)" />
          <circle cx="25" cy="22" r="1.6" fill="#ffffff" />
          <defs>
            <radialGradient id="gm_bubble" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
              <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.95" />
            </radialGradient>
            {rad('gm_bub_star', '#ffffff', '#fde68a', '#f59e0b')}
          </defs>
        </>
      );

    case 'butterfly': // 양쪽으로 펼친 날개 + 가운데 뜨거운 별
      return (
        <>
          <path d="M 22 22 Q 12 8 4 12 Q 1 22 4 32 Q 12 36 22 22 Z" fill="url(#gm_bf_l)" />
          <path d="M 22 22 Q 32 8 40 12 Q 43 22 40 32 Q 32 36 22 22 Z" fill="url(#gm_bf_r)" />
          <path d="M 22 22 Q 13 15 7 17" stroke="#fde68a" strokeWidth="1" fill="none" opacity="0.8" />
          <path d="M 22 22 Q 31 15 37 17" stroke="#fde68a" strokeWidth="1" fill="none" opacity="0.8" />
          <path d="M 22 22 Q 13 29 7 28" stroke="#f9a8d4" strokeWidth="0.8" fill="none" opacity="0.8" />
          <path d="M 22 22 Q 31 29 37 28" stroke="#f9a8d4" strokeWidth="0.8" fill="none" opacity="0.8" />
          <ellipse cx="22" cy="22" rx="2" ry="5" fill="#7c2d12" />
          <circle cx="22" cy="22" r="2.2" fill="#ffffff" />
          <defs>
            <linearGradient id="gm_bf_l" x1="1" y1="0.5" x2="0" y2="0.5">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient id="gm_bf_r" x1="0" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
          </defs>
        </>
      );

    case 'southernring': // 주황 바깥 껍질 + 청록 안쪽 고리 + 가운데 두 별
      return (
        <>
          <ellipse cx="22" cy="22" rx="18" ry="15" fill="url(#gm_sr_out)" />
          <ellipse cx="22" cy="22" rx="12.5" ry="10.5" fill="none" stroke="#fb923c" strokeWidth="1.6" opacity="0.9" />
          <ellipse cx="22" cy="22" rx="10" ry="8.5" fill="url(#gm_sr_in)" />
          <ellipse cx="22" cy="22" rx="10" ry="8.5" fill="none" stroke="#99f6e4" strokeWidth="1" />
          <circle cx="20.5" cy="22" r="2" fill="#ffffff" />
          <circle cx="24.5" cy="22.5" r="1.2" fill="#fde68a" />
          <defs>
            {rad('gm_sr_out', '#fdba74', '#ea580c', '#7c2d12')}
            {solid('gm_sr_in', '#ccfbf1', '#14b8a6', '#134e4a')}
          </defs>
        </>
      );

    case 'owl': // 둥근 청록 원반 + 어두운 올빼미 눈 두 개
      return (
        <>
          <circle cx="22" cy="22" r="16" fill="url(#gm_owl)" />
          <circle cx="22" cy="22" r="16" fill="none" stroke="#5eead4" strokeWidth="1" opacity="0.8" />
          <ellipse cx="16" cy="19.5" rx="4.5" ry="5.5" fill="#042f2e" transform="rotate(-15 16 19.5)" />
          <ellipse cx="28" cy="19.5" rx="4.5" ry="5.5" fill="#042f2e" transform="rotate(15 28 19.5)" />
          <circle cx="16.8" cy="20" r="1.3" fill="#fde68a" />
          <circle cx="27.2" cy="20" r="1.3" fill="#fde68a" />
          <path d="M 20.5 27 L 22 30 L 23.5 27 Z" fill="#f59e0b" />
          {glint(17, 10.5, 5, 1.6, 0.4)}
          <defs>{solid('gm_owl', '#99f6e4', '#0d9488', '#134e4a')}</defs>
        </>
      );

    // ===== 거대한 별의 폭발 =====
    case 'etacarinae': // 땅콩 모양 호문쿨루스 성운 + 적도의 치마 + 가운데 별
      return (
        <>
          <ellipse cx="22" cy="22" rx="19" ry="3" fill="#fde68a" opacity="0.6" transform="rotate(-35 22 22)" />
          <ellipse cx="15" cy="15" rx="9" ry="10" fill="url(#gm_eta)" transform="rotate(-35 15 15)" />
          <ellipse cx="29" cy="29" rx="9" ry="10" fill="url(#gm_eta)" transform="rotate(-35 29 29)" />
          <circle cx="22" cy="22" r="4" fill="url(#gm_eta_core)" />
          <polygon points={starPoints(4, 9, 1.6)} fill="#ffffff" opacity="0.95" />
          <defs>
            {solid('gm_eta', '#fed7aa', '#ea580c', '#7c2d12')}
            {rad('gm_eta_core', '#ffffff', '#fef3c7', '#fbbf24')}
          </defs>
        </>
      );

    case 'casa': // 조각조각 흩어지는 알록달록한 폭발 껍질
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gm_casa_glow)" />
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const r1 = 9 + (i % 3);
            const r2 = 15 + (i % 2) * 2;
            const colors = ['#f472b6', '#34d399', '#60a5fa', '#fbbf24'];
            return (
              <line key={i} x1={22 + Math.cos(a) * r1} y1={22 + Math.sin(a) * r1} x2={22 + Math.cos(a + 0.12) * r2} y2={22 + Math.sin(a + 0.12) * r2}
                stroke={colors[i % 4]} strokeWidth="2.2" strokeLinecap="round" />
            );
          })}
          <circle cx="22" cy="22" r="10" fill="none" stroke="#f9a8d4" strokeWidth="2" opacity="0.8" />
          <circle cx="22" cy="22" r="1.4" fill="#ffffff" />
          <defs>{rad('gm_casa_glow', '#e9d5ff', '#a855f7', '#3b0764')}</defs>
        </>
      );

    case 'sn1987a': // 빛나는 구슬 고리 + 위아래 희미한 고리 + 가운데 잔해
      return (
        <>
          <ellipse cx="22" cy="14" rx="13" ry="5" fill="none" stroke="#fca5a5" strokeWidth="0.9" opacity="0.6" />
          <ellipse cx="22" cy="30" rx="13" ry="5" fill="none" stroke="#fca5a5" strokeWidth="0.9" opacity="0.6" />
          <ellipse cx="22" cy="22" rx="16" ry="8" fill="none" stroke="#fde68a" strokeWidth="1.2" opacity="0.7" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <circle key={i} cx={22 + Math.cos(a) * 16} cy={22 + Math.sin(a) * 8} r={i % 2 ? 1.4 : 2} fill={i % 3 ? '#fef9c3' : '#ffffff'} />;
          })}
          <ellipse cx="22" cy="22" rx="4" ry="3" fill="url(#gm_sn87)" />
          <defs>{solid('gm_sn87', '#fef3c7', '#f97316', '#9a3412')}</defs>
        </>
      );

    // ===== 블랙홀과 전파 은하 =====
    case 'cygx1': // 큰 푸른 별에서 가스를 빨아들이는 블랙홀 원반
      return (
        <>
          <circle cx="12" cy="20" r="10" fill="url(#gm_cyg_star)" />
          <path d="M 19 18 Q 26 14 30 21" stroke="#93c5fd" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.85" />
          <ellipse cx="32" cy="24" rx="10" ry="3.6" fill="url(#gm_cyg_disk)" transform="rotate(-18 32 24)" />
          <circle cx="32" cy="24" r="3.2" fill="#000000" />
          <circle cx="32" cy="24" r="3.2" fill="none" stroke="#fde68a" strokeWidth="0.6" />
          <line x1="35" y1="15" x2="29" y2="33" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.8" />
          {glint(9, 15, 3.6, 1.4, 0.7)}
          <defs>
            {solid('gm_cyg_star', '#ffffff', '#60a5fa', '#1e3a8a')}
            <radialGradient id="gm_cyg_disk" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
          </defs>
        </>
      );

    case 'centaurusa': // 둥근 금빛 은하 + 가로지르는 검은 먼지 띠 + 푸른 제트
      return (
        <>
          <path d="M 22 22 L 34 4" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
          <path d="M 22 22 L 10 40" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <circle cx="22" cy="22" r="14" fill="url(#gm_cena)" />
          <path d="M 7 25 Q 15 18 22 23 Q 30 28 37 20" stroke="#292524" strokeWidth="4.6" fill="none" strokeLinecap="round" />
          <path d="M 8 24 Q 15 18 22 22.5 Q 30 27 36 20" stroke="#ea580c" strokeWidth="0.9" fill="none" opacity="0.8" />
          <circle cx="22" cy="22" r="2" fill="#ffffff" opacity="0.9" />
          <defs>{solid('gm_cena', '#fef3c7', '#f59e0b', '#92400e')}</defs>
        </>
      );

    // ===== 이웃 은하 =====
    case 'smc': // 작은 보랏빛 구름 덩어리 + 반짝이는 별들
      return (
        <>
          <path d="M 7 24 Q 6 14 16 12 Q 21 6 29 10 Q 38 12 37 21 Q 39 30 30 32 Q 22 38 15 33 Q 6 32 7 24 Z" fill="url(#gm_smc)" />
          <path d="M 12 24 Q 20 18 32 20" stroke="#ede9fe" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
          {clusterDots(11, 16, 12, ['#ffffff', '#ddd6fe', '#f5d0fe'])}
          <circle cx="27" cy="26" r="2" fill="#f472b6" opacity="0.9" />
          <defs>{solid('gm_smc', '#c4b5fd', '#7c3aed', '#3b0764')}</defs>
        </>
      );

    case 'tarantula': // 거미 다리처럼 뻗은 분홍 가스 + 가운데 빛나는 별무리
      return (
        <>
          <circle cx="22" cy="22" r="13" fill="url(#gm_tar)" />
          {[20, 65, 110, 155, 200, 245, 290, 335].map((d, i) => {
            const a = (d * Math.PI) / 180;
            const b = ((d + 22) * Math.PI) / 180;
            return (
              <path key={i} d={`M ${22 + Math.cos(a) * 6} ${22 + Math.sin(a) * 6} Q ${22 + Math.cos(a) * 14} ${22 + Math.sin(a) * 14} ${22 + Math.cos(b) * 19} ${22 + Math.sin(b) * 19}`}
                stroke="#f472b6" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            );
          })}
          <circle cx="22" cy="22" r="5" fill="#be185d" />
          {clusterDots(5, 9, 3.6, ['#ffffff', '#bfdbfe'])}
          <defs>{rad('gm_tar', '#fbcfe8', '#db2777', '#500724')}</defs>
        </>
      );

    // ===== 모양이 특별한 은하 =====
    case 'm101': // 정면에서 본 바람개비: 여러 갈래의 푸른 팔
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gm_m101_glow)" />
          {[0, 72, 144, 216, 288].map((d, i) => (
            <path key={i} d="M 22 22 Q 22 12 31 10 Q 37 9 39 14" stroke="#bfdbfe" strokeWidth="2.4" fill="none" strokeLinecap="round" transform={`rotate(${d} 22 22)`} />
          ))}
          {[36, 108, 180, 252, 324].map((d, i) => (
            <circle key={`k${i}`} cx="32" cy="12" r="1.2" fill="#f9a8d4" transform={`rotate(${d} 22 22)`} />
          ))}
          <circle cx="22" cy="22" r="4" fill="#fef9c3" />
          <circle cx="22" cy="22" r="2" fill="#ffffff" />
          <defs>{rad('gm_m101_glow', '#93c5fd', '#2563eb', '#172554')}</defs>
        </>
      );

    case 'm82': // 옆에서 본 시가 모양 은하 + 위아래로 뿜는 붉은 가스
      return (
        <>
          <g transform="rotate(-25 22 22)">
            <path d="M 22 20 Q 16 10 18 3" stroke="#ef4444" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
            <path d="M 22 20 Q 27 10 25 3" stroke="#f87171" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.9" />
            <path d="M 22 24 Q 16 34 18 41" stroke="#ef4444" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
            <path d="M 22 24 Q 27 34 25 41" stroke="#f87171" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.9" />
            <ellipse cx="22" cy="22" rx="18" ry="5" fill="url(#gm_m82)" />
            <path d="M 8 22.5 Q 22 20 36 22.5" stroke="#44403c" strokeWidth="1.4" fill="none" opacity="0.75" />
            <ellipse cx="22" cy="22" rx="4" ry="2" fill="#ffffff" opacity="0.9" />
          </g>
          <defs>{lin('gm_m82', '#fef3c7', '#d6d3d1', '#78716c')}</defs>
        </>
      );

    case 'antennae': // 부딪힌 두 은하 + 곤충 더듬이처럼 휘어진 긴 꼬리
      return (
        <>
          <path d="M 18 18 Q 10 10 8 3" stroke="#bfdbfe" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M 26 26 Q 36 32 38 41" stroke="#bfdbfe" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="8" cy="3" r="1.6" fill="#e0f2fe" />
          <circle cx="38" cy="41" r="1.6" fill="#e0f2fe" />
          <ellipse cx="18" cy="19" rx="8" ry="6" fill="url(#gm_ant)" transform="rotate(30 18 19)" />
          <ellipse cx="26.5" cy="25.5" rx="8" ry="6" fill="url(#gm_ant)" transform="rotate(-20 26.5 25.5)" />
          {[[15, 23], [23, 17], [28, 29], [21, 26], [31, 22]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.4} fill="#f472b6" />
          ))}
          <circle cx="17" cy="18" r="1.6" fill="#fef9c3" />
          <circle cx="27" cy="26" r="1.6" fill="#fef9c3" />
          <defs>{solid('gm_ant', '#fde68a', '#f59e0b', '#9a3412')}</defs>
        </>
      );

    case 'm64': // 비스듬한 나선 + 중심 앞의 짙은 "멍든 눈"
      return (
        <>
          <ellipse cx="22" cy="22" rx="19" ry="11" fill="url(#gm_m64)" transform="rotate(-20 22 22)" />
          <ellipse cx="22" cy="22" rx="13" ry="7" fill="none" stroke="#e7e5e4" strokeWidth="1" opacity="0.6" transform="rotate(-20 22 22)" />
          <circle cx="22" cy="22" r="4.6" fill="#fef3c7" />
          <path d="M 15 19 Q 22 16 29 19.5 Q 26 21 22 20.5 Q 18 20.5 15 19 Z" fill="#1c1917" opacity="0.92" />
          <defs>{rad('gm_m64', '#e7e5e4', '#78716c', '#1c1917')}</defs>
        </>
      );

    // ===== 성단 =====
    case 'hyades': // 황소 얼굴의 V자 별무리 + 앞쪽의 붉은 별(알데바란)
      return (
        <>
          <path d="M 6 9 L 22 33 L 38 9" stroke="#fde68a" strokeWidth="0.8" fill="none" strokeDasharray="1.6 1.6" opacity="0.7" />
          {[[6, 9], [11, 16.5], [16, 24], [22, 33], [28, 24], [33, 16.5]].map(([x, y], i) => (
            <polygon key={i} points={starPoints(5, 3.4, 1.4, x, y)} fill="url(#gm_hya)" />
          ))}
          <circle cx="38" cy="9" r="5" fill="url(#gm_hya_red)" />
          <circle cx="38" cy="9" r="2.4" fill="#fed7aa" />
          <defs>
            {lin('gm_hya', '#fffbeb', '#fcd34d', '#d97706')}
            {rad('gm_hya_red', '#fdba74', '#ea580c', '#9a3412')}
          </defs>
        </>
      );

    case 'omegacen': // 금빛 별 천만 개가 공처럼 뭉친 구상 성단
      return (
        <>
          <circle cx="22" cy="22" r="17" fill="url(#gm_omc)" />
          {clusterDots(7, 70, 16, ['#fef3c7', '#fde68a', '#ffffff', '#fdba74'])}
          <circle cx="22" cy="22" r="4" fill="#ffffff" opacity="0.85" />
          <defs>{rad('gm_omc', '#fde68a', '#d97706', '#78350f')}</defs>
        </>
      );

    case 'm13': // 푸른 흰 별 공 + 다가오는 전파 메시지 물결
      return (
        <>
          <circle cx="24" cy="24" r="14" fill="url(#gm_m13)" />
          <g transform="translate(2 2)">{clusterDots(13, 45, 13, ['#ffffff', '#e0f2fe', '#fef9c3'])}</g>
          <path d="M 4 12 A 9 9 0 0 1 12 4" stroke="#facc15" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 4 17 A 13 13 0 0 1 17 4" stroke="#facc15" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
          <path d="M 4 7.5 A 4 4 0 0 1 7.5 4" stroke="#facc15" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <defs>{rad('gm_m13', '#e0f2fe', '#38bdf8', '#0c4a6e')}</defs>
        </>
      );

    case 'jewelbox': // 푸른 보석 별들 사이의 붉은 보석 하나
      return (
        <>
          {[[22, 7], [14, 16], [30, 16], [10, 27], [22, 22], [34, 27], [17, 35], [27, 35]].map(([x, y], i) => (
            <polygon key={i} points={`${x},${y - 4.2} ${x + 3.4},${y} ${x},${y + 4.2} ${x - 3.4},${y}`} fill={i === 4 ? 'url(#gm_jb_red)' : 'url(#gm_jb_blue)'} stroke="#ffffff" strokeWidth="0.5" />
          ))}
          <circle cx="21" cy="20.6" r="0.9" fill="#ffffff" />
          <circle cx="21" cy="5.6" r="0.9" fill="#ffffff" />
          <defs>
            {lin('gm_jb_blue', '#e0f2fe', '#38bdf8', '#1d4ed8')}
            {lin('gm_jb_red', '#fecaca', '#ef4444', '#991b1b')}
          </defs>
        </>
      );

    // ===== 탐사선 =====
    case 'voyager2': // 하얀 접시 안테나 + 긴 막대 + 뒤의 푸른 해왕성
      return (
        <>
          <circle cx="32" cy="32" r="10" fill="url(#gm_v2_nep)" />
          <path d="M 25 30 Q 32 28 39 30" stroke="#bfdbfe" strokeWidth="0.8" fill="none" opacity="0.7" />
          <line x1="20" y1="20" x2="4" y2="36" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="20" y1="20" x2="38" y2="6" stroke="#cbd5e1" strokeWidth="0.8" />
          <rect x="16" y="20" width="8" height="5" fill="#92400e" stroke="#fbbf24" strokeWidth="0.6" />
          <path d="M 9 14 Q 20 22 31 14 Q 20 9 9 14 Z" fill="url(#gm_v2_dish)" stroke="#94a3b8" strokeWidth="0.7" />
          <line x1="20" y1="14" x2="20" y2="9" stroke="#e2e8f0" strokeWidth="0.8" />
          <circle cx="4" cy="36" r="1.6" fill="#94a3b8" />
          <defs>
            {lin('gm_v2_dish', '#ffffff', '#e2e8f0', '#94a3b8')}
            {solid('gm_v2_nep', '#93c5fd', '#2563eb', '#1e3a8a')}
          </defs>
        </>
      );

    case 'cassini': // 금박 원통 몸체 + 위쪽 큰 접시 + 뒤의 토성
      return (
        <>
          <circle cx="34" cy="34" r="6" fill="url(#gm_cas_sat)" />
          <ellipse cx="34" cy="34" rx="10" ry="2.4" fill="none" stroke="#fde68a" strokeWidth="1.1" transform="rotate(-15 34 34)" />
          <ellipse cx="20" cy="9" rx="10" ry="4" fill="url(#gm_cas_dish)" stroke="#94a3b8" strokeWidth="0.7" />
          <rect x="15" y="11" width="10" height="20" rx="2" fill="url(#gm_cassini)" stroke="#92400e" strokeWidth="0.7" />
          <line x1="15" y1="18" x2="25" y2="18" stroke="#92400e" strokeWidth="0.6" />
          <line x1="15" y1="24" x2="25" y2="24" stroke="#92400e" strokeWidth="0.6" />
          <line x1="25" y1="15" x2="38" y2="10" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="13.5" cy="25" r="2.6" fill="#a16207" stroke="#fde68a" strokeWidth="0.6" />
          <path d="M 17 31 L 20 37 L 23 31 Z" fill="#475569" />
          <defs>
            {lin('gm_cassini', '#fef08a', '#eab308', '#a16207')}
            {lin('gm_cas_dish', '#ffffff', '#e2e8f0', '#94a3b8')}
            {solid('gm_cas_sat', '#fef3c7', '#f59e0b', '#92400e')}
          </defs>
        </>
      );

    case 'parker': // 태양 앞의 하얀 방패(열 차폐막) + 뒤로 숨은 몸체
      return (
        <>
          <circle cx="10" cy="10" r="8.5" fill="url(#gm_pk_sun)" />
          <circle cx="10" cy="10" r="4.5" fill="#fffbeb" />
          <g transform="rotate(45 24 24)">
            <rect x="21" y="25" width="6" height="11" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="0.6" />
            <rect x="15" y="29" width="5" height="3" fill="#1d4ed8" />
            <rect x="28" y="29" width="5" height="3" fill="#1d4ed8" />
            <ellipse cx="24" cy="23" rx="10" ry="3" fill="url(#gm_pk_shield)" stroke="#e2e8f0" strokeWidth="0.7" />
          </g>
          <defs>
            {rad('gm_pk_sun', '#ffffff', '#fbbf24', '#ea580c')}
            {lin('gm_pk_shield', '#ffffff', '#f1f5f9', '#cbd5e1')}
          </defs>
        </>
      );

    case 'curiosity': // 주황 화성 땅 위의 바퀴 여섯 개 로버 + 카메라 기둥
      return (
        <>
          <path d="M 2 34 Q 14 31 24 33 Q 34 35 42 32 L 42 40 L 2 40 Z" fill="#c2410c" />
          <rect x="9" y="20" width="24" height="8" rx="1.5" fill="url(#gm_cur)" stroke="#78350f" strokeWidth="0.7" />
          <line x1="13" y1="20" x2="13" y2="10" stroke="#e5e7eb" strokeWidth="1.4" />
          <rect x="10" y="7" width="7" height="4" rx="1" fill="#e5e7eb" stroke="#6b7280" strokeWidth="0.6" />
          <circle cx="12" cy="9" r="0.9" fill="#1f2937" />
          <circle cx="15" cy="9" r="0.9" fill="#1f2937" />
          <path d="M 33 23 L 38 19 L 40 22" stroke="#e5e7eb" strokeWidth="1.2" fill="none" />
          <rect x="27" y="16" width="5" height="4" fill="#9ca3af" />
          {[11, 21, 31].map((x, i) => wheel(x, 31, 2.8, i))}
          <defs>{lin('gm_cur', '#fde68a', '#d97706', '#92400e')}</defs>
        </>
      );

    case 'perseverance': // 하얀 로버 + 로봇 팔 + 시료 관
      return (
        <>
          <path d="M 2 34 Q 12 32 22 34 Q 32 36 42 33 L 42 40 L 2 40 Z" fill="#991b1b" />
          <rect x="8" y="20" width="24" height="8" rx="1.5" fill="url(#gm_per)" stroke="#475569" strokeWidth="0.7" />
          <line x1="28" y1="20" x2="28" y2="9" stroke="#f8fafc" strokeWidth="1.4" />
          <rect x="24.5" y="6" width="7" height="4" rx="1" fill="#f8fafc" stroke="#64748b" strokeWidth="0.6" />
          <circle cx="26.5" cy="8" r="0.9" fill="#1e293b" />
          <circle cx="29.5" cy="8" r="0.9" fill="#1e293b" />
          <path d="M 8 23 L 4 18 L 6 14" stroke="#f8fafc" strokeWidth="1.3" fill="none" />
          <rect x="35" y="12" width="2.6" height="9" rx="1.3" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.5" />
          <rect x="35" y="12" width="2.6" height="3" rx="1.3" fill="#f59e0b" />
          <rect x="12" y="16" width="10" height="4" rx="1" fill="#1d4ed8" opacity="0.85" />
          {[10, 20, 30].map((x, i) => wheel(x, 31, 2.8, i))}
          <defs>{lin('gm_per', '#ffffff', '#e2e8f0', '#94a3b8')}</defs>
        </>
      );

    case 'ingenuity': // 위아래 두 날개 회전날개 + 작은 몸체 + 다리 넷
      return (
        <>
          <path d="M 2 37 Q 22 33 42 37 L 42 41 L 2 41 Z" fill="#c2410c" />
          <ellipse cx="22" cy="7" rx="19" ry="1.8" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
          <ellipse cx="22" cy="11" rx="19" ry="1.8" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.5" transform="rotate(8 22 11)" />
          <line x1="22" y1="6" x2="22" y2="20" stroke="#94a3b8" strokeWidth="1.4" />
          <rect x="14" y="3.5" width="16" height="2.4" rx="0.6" fill="#1e293b" />
          <rect x="16" y="19" width="12" height="9" rx="1.5" fill="url(#gm_ing)" stroke="#92400e" strokeWidth="0.6" />
          <path d="M 17 28 L 10 36 M 27 28 L 34 36 M 19 28 L 16 36 M 25 28 L 28 36" stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round" />
          <defs>{lin('gm_ing', '#fef3c7', '#fbbf24', '#b45309')}</defs>
        </>
      );

    case 'sputnik': // 반짝이는 은빛 공 + 뒤로 뻗은 긴 안테나 넷
      return (
        <>
          <line x1="18" y1="22" x2="2" y2="38" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="18" y1="24" x2="7" y2="41" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="20" y1="25" x2="15" y2="41" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="16" y1="21" x2="2" y2="31" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="24" cy="17" r="11" fill="url(#gm_sputnik)" stroke="#64748b" strokeWidth="0.7" />
          <path d="M 13.5 17.5 Q 24 21 34.5 17.5" stroke="#94a3b8" strokeWidth="0.8" fill="none" />
          <path d="M 36 9 Q 39 12 39 16" stroke="#facc15" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M 38 5 Q 43 10 42.5 17" stroke="#facc15" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
          {glint(20, 11, 5, 2.2, 0.8)}
          <defs>{solid('gm_sputnik', '#ffffff', '#cbd5e1', '#475569')}</defs>
        </>
      );

    case 'apollo11': // 회색 달 위의 금빛 착륙선 "이글" + 작은 지구
      return (
        <>
          <circle cx="36" cy="8" r="4" fill="url(#gm_a11_earth)" />
          <path d="M 3 35 Q 22 31 41 35 L 41 41 L 3 41 Z" fill="#a8a29e" />
          <circle cx="12" cy="37" r="1.4" fill="#78716c" />
          <circle cx="32" cy="38" r="1.1" fill="#78716c" />
          <path d="M 17 9 L 27 9 L 30 14 L 28 19 L 16 19 L 14 14 Z" fill="url(#gm_a11_top)" stroke="#475569" strokeWidth="0.6" />
          <rect x="18" y="11.5" width="3" height="2.4" fill="#1e293b" />
          <polygon points="13,19 31,19 33,27 11,27" fill="url(#gm_a11_gold)" stroke="#92400e" strokeWidth="0.6" />
          <path d="M 12 26 L 6 34 M 32 26 L 38 34 M 15 27 L 13 34 M 29 27 L 31 34" stroke="#d6d3d1" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 4 34 L 8 34 M 36 34 L 40 34" stroke="#d6d3d1" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="22" y1="9" x2="22" y2="4" stroke="#e2e8f0" strokeWidth="0.8" />
          <defs>
            {lin('gm_a11_top', '#f8fafc', '#cbd5e1', '#64748b')}
            {lin('gm_a11_gold', '#fef08a', '#eab308', '#a16207')}
            {solid('gm_a11_earth', '#bae6fd', '#2563eb', '#14532d')}
          </defs>
        </>
      );

    case 'kitsat1': // 작은 상자 위성 + 파란 태양전지판 + 태극 문양
      return (
        <>
          <rect x="2" y="17" width="11" height="10" rx="0.6" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.6" />
          <rect x="31" y="17" width="11" height="10" rx="0.6" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="0.6" />
          <line x1="7.5" y1="17" x2="7.5" y2="27" stroke="#93c5fd" strokeWidth="0.5" />
          <line x1="36.5" y1="17" x2="36.5" y2="27" stroke="#93c5fd" strokeWidth="0.5" />
          <line x1="13" y1="22" x2="15" y2="22" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="29" y1="22" x2="31" y2="22" stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="15" y="12" width="14" height="20" rx="1.5" fill="url(#gm_kit)" stroke="#64748b" strokeWidth="0.7" />
          <circle cx="22" cy="22" r="5" fill="#cd2e3a" />
          <path d="M 17 22 A 5 5 0 0 0 27 22 A 2.5 2.5 0 0 0 22 22 A 2.5 2.5 0 0 1 17 22 Z" fill="#0047a0" />
          <line x1="22" y1="12" x2="22" y2="5" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="22" cy="5" r="1.2" fill="#e2e8f0" />
          <line x1="19" y1="32" x2="17" y2="38" stroke="#e2e8f0" strokeWidth="0.9" />
          <line x1="25" y1="32" x2="27" y2="38" stroke="#e2e8f0" strokeWidth="0.9" />
          <defs>{lin('gm_kit', '#ffffff', '#e2e8f0', '#94a3b8')}</defs>
        </>
      );

    default:
      return null;
  }
}
