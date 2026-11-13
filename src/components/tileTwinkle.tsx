import React from 'react';

// ---------------------------------------------------------------------------
// 별·밤하늘 타일이 은은하게 반짝이게 하는 겹그림
// 허리띠·북두칠성처럼 "진한 바탕 + 밝은 별" 느낌을 별 타일들에 더한다.
// 원래 그림 위, 별 자리마다 빛 번짐 + 네 갈래 반짝임 + 흰 중심을 겹쳐 두고
// 별마다 다른 박자로 천천히 밝아졌다 어두워진다 (어지럽지 않게 느리게).
// 좌표는 원래 그림과 같은 44x44 기준: [x, y, 크기, 번짐 색]
// ---------------------------------------------------------------------------

type Star = [number, number, number, string];

const Y = '#fde047'; // 노란 별빛
const G = '#facc15'; // 금빛
const O = '#fb923c'; // 주황
const B = '#7dd3fc'; // 푸른 별빛
const W = '#f8fafc'; // 하얀 별빛

export const TWINKLE_STARS: Record<string, Star[]> = {
  // 이미 예쁜 두 타일도 같이 반짝이게
  bigdipper: [[6, 13, 2.3, Y], [12.5, 15, 2.3, Y], [18, 19, 2.3, Y], [23, 23, 2.3, Y], [24, 31, 2.3, Y], [35, 32, 2.3, Y], [37, 23, 2.3, Y]],
  orionbelt: [[11, 29.5, 3.2, B], [22, 22, 3.5, B], [33, 14.5, 3, B]],
  crux: [[22, 7, 2.2, W], [22, 37, 3, W], [11, 19, 2.5, W], [32, 23, 2.2, W]],

  // 노란·금빛 별
  sun: [[30.5, 12.5, 3, Y], [13, 31, 2.2, Y]],
  polaris: [[22, 22, 4.2, Y], [33, 11, 1.8, Y], [11.5, 32, 1.5, Y]],
  altair: [[18, 17.5, 2.8, Y], [29, 26, 1.8, Y]],
  arcturus: [[22, 23, 3.6, O]],
  capella: [[17.5, 20, 3, G], [27, 24.5, 2.6, G]],
  procyon: [[30, 25, 3.8, G], [22, 6, 1.8, W], [6, 36, 1.8, O], [38.5, 16, 1.4, B]],
  canopus: [[22, 16, 3.8, Y]],
  omegacen: [[22, 22, 3.6, G], [15, 15, 1.6, Y], [29, 16, 1.4, Y], [17, 29, 1.5, Y], [30, 28, 1.3, Y]],
  alphacen: [[16, 21, 4.4, Y], [30, 25, 3, O], [37.5, 8, 1.5, '#f87171']],
  albireo: [[14.5, 23, 4.3, G], [32, 19, 3.4, B]],

  // 밤하늘 바탕의 밝은 별들
  mizar: [[13, 27, 3.8, B], [23, 21, 1.6, W], [26.5, 13, 2, W], [31.8, 10.5, 1.6, B]],
  deneb: [[22, 12, 3, B], [22, 22, 1.8, B], [9, 22, 1.6, B], [35, 22, 1.6, B], [22, 36, 1.6, B]],
  pleiades: [[15, 13, 2.6, B], [26, 11, 2.2, B], [31, 19, 2.3, B], [22, 20, 2.9, B], [12, 24, 2, B], [20, 30, 2.3, B], [29, 30, 1.9, B]],
  hyades: [[6, 9, 1.9, G], [11, 16.5, 1.9, G], [16, 24, 1.9, G], [22, 33, 1.9, G], [28, 24, 1.9, G], [33, 16.5, 1.9, G], [38, 9, 2.6, O]],
  jewelbox: [[22, 7, 1.8, B], [14, 16, 1.8, B], [30, 16, 1.8, B], [10, 27, 1.8, B], [22, 22, 2, '#f87171'], [34, 27, 1.8, B], [17, 35, 1.8, B], [27, 35, 1.8, B]],
  einsteinring: [[22, 22, 2.6, G], [13, 13, 1.6, B], [31, 13, 1.4, B]],
  hudf: [[17, 16, 1.9, Y], [11, 31, 1.4, W], [32, 10, 1.4, W], [27, 22, 1.3, B], [33, 33, 1.3, W]],

  // 빛나는 것들
  sirius: [[22, 22, 4.6, B]],
  vega: [[22, 18, 4, B]],
  pulsar: [[22, 22, 4.6, B]],
  quasar: [[22, 22, 4.2, G]],
  eclipse: [[30.5, 14, 3.4, W]],
};

const sparkPoints = (cx: number, cy: number, R: number) => {
  const r = R * 0.28;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const rr = i % 2 === 0 ? R : r;
    const a = ((-90 + i * 45) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
};

/** 별 타일이면 반짝이는 겹그림을, 아니면 null */
export function renderTwinkle(symbolType: string): React.ReactElement | null {
  const stars = TWINKLE_STARS[symbolType];
  if (!stars) return null;
  const colors = Array.from(new Set(stars.map(s => s[3])));
  const gid = (c: string) => `tw_${symbolType}_${c.replace('#', '')}`;

  return (
    <g className="tw-layer" pointerEvents="none">
      <defs>
        {colors.map(c => (
          <radialGradient key={c} id={gid(c)} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor={c} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {stars.map(([x, y, r, c], i) => {
        // 별마다 다른 박자 (같은 타일 안에서도, 겹치지 않게 흩어 둔다)
        const dur = 2.6 + ((i * 7 + symbolType.length) % 5) * 0.45;
        const delay = -(((i * 1.37 + symbolType.length * 0.31) % dur));
        return (
          <g key={i} className="tw-star" style={{ animationDuration: `${dur}s`, animationDelay: `${delay.toFixed(2)}s` }}>
            <circle cx={x} cy={y} r={r * 2.6} fill={`url(#${gid(c)})`} />
            <polygon points={sparkPoints(x, y, r * 1.9)} fill="#ffffff" opacity="0.9" />
            <circle cx={x} cy={y} r={r * 0.42} fill="#ffffff" />
          </g>
        );
      })}
    </g>
  );
}
