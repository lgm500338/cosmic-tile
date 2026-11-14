import { BoardTile, LevelConfig, RoadmapReward, ThemeId, TileThemeItem } from '../types/game';
import { zoneForLevel, zoneOfTile, zoneOfChapter } from '../data/zones';
import { GAME_THEMES } from '../data/themes';

interface SlotPos {
  x: number;
  y: number;
  layer: number;
}

// ---------------------------------------------------------------------------
// 다층 적층 레이아웃 생성기
// 타일 1개 = 1x1 칸. 층마다 반 칸(0.5)씩 엇갈리거나, 같은 자리에 바로 쌓아
// 아래층 타일의 가장자리가 살짝 보이는 "4~5층 쌓인 타일" 구조를 만든다.
// ---------------------------------------------------------------------------

type ShapeFn = (c: number, r: number, W: number, H: number) => boolean;

const SHAPES: Record<string, ShapeFn> = {
  // 꽉 찬 직사각형
  block: () => true,
  // 마름모
  diamond: (c, r, W, H) => {
    const cx = (W - 1) / 2, cy = (H - 1) / 2;
    return Math.abs(c - cx) / (cx + 0.6) + Math.abs(r - cy) / (cy + 0.6) <= 1.05;
  },
  // 원형 은하
  galaxy: (c, r, W, H) => {
    const cx = (W - 1) / 2, cy = (H - 1) / 2;
    return ((c - cx) / (cx + 0.7)) ** 2 + ((r - cy) / (cy + 0.7)) ** 2 <= 1.0;
  },
  // 십자
  cross: (c, r, W, H) => {
    const cx = (W - 1) / 2, cy = (H - 1) / 2;
    return Math.abs(c - cx) <= W / 4 + 0.1 || Math.abs(r - cy) <= H / 4 + 0.1;
  },
  // 나비 (가운데가 잘록)
  butterfly: (c, r, W, H) => {
    const cx = (W - 1) / 2, cy = (H - 1) / 2;
    const dx = Math.abs(c - cx), dy = Math.abs(r - cy);
    return dy <= 0.6 + dx * (H / W) * 1.1 || dx >= cx - 0.1;
  },
  // 쌍둥이 탑
  twin_towers: (c, r, W, H) => {
    const cx = (W - 1) / 2;
    return Math.abs(c - cx) >= 1 || r >= H - 2;
  },
  // 고리 성운 (가운데 구멍)
  ring: (c, r, W, H) => {
    const cx = (W - 1) / 2, cy = (H - 1) / 2;
    const d = ((c - cx) / (cx + 0.6)) ** 2 + ((r - cy) / (cy + 0.6)) ** 2;
    return d <= 1.0 && d >= 0.12;
  },
  // 피라미드
  pyramid: (c, r, W, H) => {
    const cx = (W - 1) / 2;
    return Math.abs(c - cx) <= ((r + 1) / H) * (cx + 0.6);
  },
  // 좌우로 갈라진 두 섬
  twin_islands: (c, _r, W) => Math.abs(c - (W - 1) / 2) >= 0.9,
  // 위아래로 갈라진 판
  split_rows: (_c, r, _W, H) => Math.abs(r - (H - 1) / 2) >= 0.9,
  // 네 귀퉁이 탑 + 가운데 탑
  corners_center: (c, r, W, H) => {
    const cx = (W - 1) / 2, cy = (H - 1) / 2;
    const corner = (c < W * 0.38 || c > W * 0.62 - 1) && (r < H * 0.38 || r > H * 0.62 - 1);
    const center = Math.abs(c - cx) <= 0.6 && Math.abs(r - cy) <= 0.6;
    return corner || center;
  },
  // 작은 탑 여러 개가 흩어진 모양
  towers: (c, r) => c % 3 !== 2 && r % 3 !== 2,
  // 아치 (위가 넓고 아래가 두 기둥)
  arch: (c, r, W) => r < 2 || c < 2 || c >= W - 2,
};

// 레벨마다 돌아가며 나오는 판 모양 순서 (비슷한 모양이 연달아 나오지 않게 섞음)
const SHAPE_ORDER = [
  'diamond', 'twin_islands', 'galaxy', 'towers', 'butterfly', 'split_rows', 'block',
  'corners_center', 'ring', 'arch', 'cross', 'twin_towers', 'pyramid',
];

// 층별 오프셋 패턴: 반 칸 엇갈림, 가로/세로 엇갈림, 바로 위 적층
const OFFSET_PATTERNS: Array<Array<[number, number]>> = [
  [[0, 0], [0.5, 0.5], [0, 0], [0.5, 0.5], [0, 0]],   // 대각 피라미드
  [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0], [0, 0.5]],   // 가로·세로 번갈아
  [[0, 0], [0, 0.5], [0.5, 0], [0, 0.5], [0.5, 0]],   // 세로·가로 번갈아
  [[0, 0], [0, 0], [0.5, 0.5], [0, 0], [0.5, 0.5]],   // 바로 쌓기 + 엇갈림
  [[0, 0], [0.5, 0.5], [0.5, 0.5], [0, 0], [0, 0]],   // 엇갈림 + 바로 쌓기
];

/** 이 레벨부터 '같은 자리 바로 뒤에 다른 타일' 쌓기가 나온다 */
export const SAME_SPOT_STACK_LEVEL = 300;

function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function overlapArea(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const ox = Math.max(0, 1 - Math.abs(a.x - b.x));
  const oy = Math.max(0, 1 - Math.abs(a.y - b.y));
  return ox * oy;
}

interface LayoutSpec {
  W: number;
  H: number;
  layers: number;
  shape: string;
  pattern: number;
}

/** 레벨별 목표: 전체 타일 수 범위, 처음에 눌 수 있는(드러난) 타일 수 범위 */
function getLayoutTarget(levelNum: number) {
  if (levelNum <= 5) return { minN: 24, maxN: 39, minF: 6, maxF: 12, W: [4, 5], H: [4, 5], L: [2, 3] };
  // 가로 칸 수가 많으면 화면에 맞추느라 타일이 작아진다 → 30레벨까지는 가로 최대 5칸, 대신 세로로 더 쌓는다
  if (levelNum <= 9) return { minN: 36, maxN: 57, minF: 10, maxF: 16, W: [5, 5], H: [5, 6], L: [3, 4] };
  if (levelNum <= 19) return { minN: 48, maxN: 75, minF: 12, maxF: 18, W: [5, 5], H: [6, 7], L: [4, 5] };
  if (levelNum <= 30) return { minN: 57, maxN: 84, minF: 12, maxF: 18, W: [5, 5], H: [6, 7], L: [5, 5] };
  if (levelNum <= 60) return { minN: 60, maxN: 90, minF: 12, maxF: 20, W: [5, 6], H: [6, 7], L: [5, 5] };
  // 61레벨~300레벨: 가로가 7칸으로 넓어지면 그 판만 타일이 갑자기 작아진다 → 가로 폭(maxSpanX)을 6칸 폭까지로 묶고 세로로 더 쌓는다
  if (levelNum <= 100) return { minN: 66, maxN: 96, minF: 12, maxF: 20, W: [5, 6], H: [7, 8], L: [5, 5], minLayers: 3, maxSpanX: 5 };
  // 101레벨~: 2~3층으로 얕게 끝나는 판을 막고 4~5층을 꼭 쌓는다 → 뒤쪽 타일이 살짝만 보이는 곳이 생긴다
  if (levelNum <= SAME_SPOT_STACK_LEVEL) return { minN: 69, maxN: 105, minF: 11, maxF: 19, W: [5, 6], H: [7, 8], L: [5, 5], minLayers: 4, maxSpanX: 5 };
  // 300레벨 이후(두 번째 여행~)는 고난도 구간이라 넓은 판(가로 7칸)도 나온다 → 이때는 타일이 조금 작아질 수 있다
  return { minN: 69, maxN: 105, minF: 11, maxF: 19, W: [6, 7], H: [6, 8], L: [5, 5], minLayers: 4 };
}

function buildLayout(spec: LayoutSpec, rand: () => number): SlotPos[] {
  const offsets = OFFSET_PATTERNS[spec.pattern % OFFSET_PATTERNS.length];
  const shapeFn = SHAPES[spec.shape] || SHAPES.block;
  const all: SlotPos[] = [];
  let below: SlotPos[] = [];
  for (let L = 0; L < spec.layers; L++) {
    const [ox, oy] = offsets[L];
    const current: SlotPos[] = [];
    for (let r = 0; r < spec.H; r++) {
      for (let c = 0; c < spec.W; c++) {
        const x = c + ox, y = r + oy;
        if (L === 0) {
          if (shapeFn(c, r, spec.W, spec.H)) current.push({ x, y, layer: 0 });
          continue;
        }
        // 아래층이 완전히 받쳐줄 때만 올린다 (공중에 뜬 타일 방지)
        let support = 0;
        for (const b of below) support += overlapArea({ x, y }, b);
        if (support < 0.99) continue;
        current.push({ x, y, layer: L });
      }
    }
    if (current.length === 0) break;
    all.push(...current);
    below = current;
  }
  // 3의 배수로 맞추기: 맨 위층부터 제거
  while (all.length % 3 !== 0) {
    const topLayer = Math.max(...all.map(s => s.layer));
    const idxs = all.map((s, i) => (s.layer === topLayer ? i : -1)).filter(i => i >= 0);
    all.splice(idxs[Math.floor(rand() * idxs.length)], 1);
  }
  return all;
}

/** 처음 화면에서 그림이 보이는 타일 수 (덮인 넓이 절반 미만) */
function countSeen(slots: SlotPos[]): number {
  let seen = 0;
  for (let i = 0; i < slots.length; i++) {
    let area = 0;
    for (let j = 0; j < slots.length; j++) {
      if (j === i || slots[j].layer <= slots[i].layer) continue;
      area += Math.max(0, 1 - Math.abs(slots[j].x - slots[i].x)) * Math.max(0, 1 - Math.abs(slots[j].y - slots[i].y));
    }
    if (area < 0.5) seen++;
  }
  return seen;
}

function countFree(slots: SlotPos[]): number {
  let free = 0;
  for (let i = 0; i < slots.length; i++) {
    const covered = slots.some((s, j) => {
      if (j === i || s.layer <= slots[i].layer) return false;
      return 1 - Math.abs(s.x - slots[i].x) > 0.05 && 1 - Math.abs(s.y - slots[i].y) > 0.05;
    });
    if (!covered) free++;
  }
  return free;
}

function generateLayoutSlots(levelNum: number, variant = 0): SlotPos[] {
  // 레벨 1~2: 튜토리얼 평면
  if (levelNum === 1) {
    return [0, 1, 2].flatMap(c => [0, 1].map(r => ({ x: c, y: r, layer: 0 })));
  }
  if (levelNum === 2) {
    return [0, 1, 2].flatMap(c => [0, 1, 2].map(r => ({ x: c, y: r, layer: 0 })));
  }

  // 레벨마다 고정된 판 모양 (같은 레벨은 항상 같은 모양)
  const rand = seeded(levelNum * 7919 + 13 + variant * 101);
  const target = getLayoutTarget(levelNum);
  // 같은 모양으로 두 번 실패하면 다음 모양으로 넘어간다
  const baseShapeIdx = levelNum - 6 + Math.floor(variant / 2);
  const minLayers = (target as { minLayers?: number }).minLayers ?? 0;
  const maxSpanX = (target as { maxSpanX?: number }).maxSpanX ?? Infinity;
  const pick = (range: number[]) => range[0] + Math.floor(rand() * (range[1] - range[0] + 1));

  let best: SlotPos[] = [];
  let bestScore = Infinity;
  // 높은 레벨에서 판 모양 때문에 층을 못 쌓으면(작은 탑·갈라진 판 등) 다음 모양으로 넘어간다
  for (let shapeTry = 0; shapeTry < (minLayers ? SHAPE_ORDER.length : 1); shapeTry++) {
  if (shapeTry > 0 && best.length && Math.max(...best.map(s => s.layer)) + 1 >= minLayers) break;
  const shape = levelNum <= 5 ? 'block' : SHAPE_ORDER[(baseShapeIdx + shapeTry) % SHAPE_ORDER.length];
  for (let attempt = 0; attempt < 60; attempt++) {
    const spec: LayoutSpec = {
      W: pick(target.W),
      H: pick(target.H),
      layers: pick(target.L),
      shape,
      // 300레벨 전까지는 같은 자리 바로 뒤에 다른 타일을 숨겨 쌓는 패턴(3·4번)을 쓰지 않는다
      // → 맨 위 타일을 눌렀을 때 바로 뒤에서 예상 못 한 타일이 나오지 않는다 (300레벨부터 고난도 요소로 등장)
      pattern: Math.floor(rand() * (levelNum < SAME_SPOT_STACK_LEVEL ? 3 : OFFSET_PATTERNS.length)),
    };
    const slots = buildLayout(spec, rand);
    const n = slots.length;
    const f = countSeen(slots);
    const layersUsed = Math.max(...slots.map(s => s.layer)) + 1;
    const xs = slots.map(s => s.x);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const score =
      // 가로 폭이 넓으면 화면에 맞추느라 타일이 작아지므로 반드시 피한다
      Math.max(0, spanX - maxSpanX) * 1000 +
      Math.max(0, target.minN - n) * 2 + Math.max(0, n - target.maxN) * 2 +
      Math.max(0, target.minF - f) * 5 + Math.max(0, f - target.maxF) * 5 +
      Math.max(0, target.L[0] - layersUsed) * 10 +
      // 높은 레벨은 최소 층수를 반드시 지키도록 크게 감점
      Math.max(0, minLayers - layersUsed) * 100;
    if (score < bestScore) {
      bestScore = score;
      best = slots;
      if (score === 0) break;
    }
  }
  }
  return best;
}

/**
 * 가림 판정: 더 높은 층의 타일과 조금이라도 겹치면 가려진 것으로 본다.
 * (반 칸 엇갈림 구조에서는 겹침이 최소 25%라 눈으로 봐도 분명하다)
 */
export function isTileCoveredBy(tileA: BoardTile, tileB: BoardTile): boolean {
  if (tileB.isCollected) return false;
  if (tileB.layer <= tileA.layer) return false;
  const ox = 1 - Math.abs(tileB.x - tileA.x);
  const oy = 1 - Math.abs(tileB.y - tileA.y);
  return ox > 0.05 && oy > 0.05;
}

export function recalculateOcclusion(tiles: BoardTile[]): BoardTile[] {
  return tiles.map(tile => {
    if (tile.isCollected) return { ...tile, isCovered: false };
    const isCovered = tiles.some(
      other => other.id !== tile.id && !other.isCollected && isTileCoveredBy(tile, other)
    );
    return { ...tile, isCovered };
  });
}

/**
 * 난이도 규칙이 들어간 "반드시 풀 수 있는" 천체 배치
 *
 * 1) 맨 위부터 하나씩 걷어내는 정답 순서를 만든다 (각 타일이 언제 드러나고 언제 치워지는지 기록).
 * 2) 그 순서대로 타일에 천체를 배정하되,
 *    - 같은 천체가 "동시에 보이는" 개수를 maxVisible 이하로 제한한다
 *      (쉬운 레벨 2개, 높은 레벨은 가능한 한 1개).
 *    - 정답 순서대로 누를 때 슬롯에 쌓이는 타일은 maxOpen개 이하 → 슬롯 7칸이 절대 넘치지 않는다.
 * 3) 여러 번 시도해서 "같은 천체가 겹쳐 보이는 경우"가 가장 적은 배치를 고른다.
 */
interface AssignOptions {
  maxVisible: number; // 같은 천체가 동시에 보일 수 있는 최대 개수
  maxOpen: number; // 정답 순서에서 슬롯에 동시에 쌓일 수 있는 최대 타일 수 (7칸 중) — 클수록 어려움
  attempts: number;
  preferSingle?: boolean; // true면 같은 천체가 1개만 보이는 배치를 최대한 우선 (어려움)
  preferTriple?: boolean; // true면 같은 천체가 2~3개 함께 보이는 배치를 선호 (쉬움)
  groupWindow?: number; // 한 묶음을 연 뒤 이 걸음 안에 3개를 완성 → 위 타일 한두 개만 걷으면 짝 3개가 보인다
}

const SEEN_THRESHOLD = 0.5;

function buildCoverGraph(slots: SlotPos[]) {
  const n = slots.length;
  const uppers: number[][] = Array.from({ length: n }, () => []); // i를 덮는 타일들
  const lowers: number[][] = Array.from({ length: n }, () => []); // i가 덮는 타일들
  const lowerArea: number[][] = Array.from({ length: n }, () => []); // lowers[j][k]를 덮는 넓이
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j || slots[j].layer <= slots[i].layer) continue;
      const ox = 1 - Math.abs(slots[j].x - slots[i].x);
      const oy = 1 - Math.abs(slots[j].y - slots[i].y);
      if (ox > 0.05 && oy > 0.05) {
        uppers[i].push(j);
        lowers[j].push(i);
        lowerArea[j].push(ox * oy);
      }
    }
  }
  return { uppers, lowers, lowerArea };
}

function tryAssign(
  slots: SlotPos[],
  graph: { uppers: number[][]; lowers: number[][]; lowerArea: number[][] },
  quota: Map<string, number>,
  opt: AssignOptions,
  rand: () => number,
  initialOpen: Array<{ type: string; count: number }> = [],
  obstacles: Set<number> = new Set()
): { types: string[]; overlapScore: number } | null {
  const n = slots.length;
  const remainingUppers = graph.uppers.map(u => u.length);
  // "그림이 보이는" 시점: 덮인 넓이가 절반 미만이 되는 순간 (눌 수 없어도 플레이어 눈에는 보임)
  const coveredArea = new Array(n).fill(0);
  for (let j = 0; j < n; j++) graph.lowers[j].forEach((low, k) => (coveredArea[low] += graph.lowerArea[j][k]));
  const seenAt = new Array(n).fill(-1);
  for (let i = 0; i < n; i++) if (coveredArea[i] < SEEN_THRESHOLD) seenAt[i] = 0;
  const frontier: number[] = [];
  for (let i = 0; i < n; i++) if (remainingUppers[i] === 0) frontier.push(i);

  const left = new Map(quota);
  const intervals = new Map<string, Array<[number, number]>>(); // 천체별 "보이는 구간"
  // 섞기할 때는 슬롯에 이미 들어 있는 천체가 '진행 중인 묶음'으로 시작한다
  const open: Array<{ type: string; count: number; openedAt: number }> = initialOpen.map(g => ({ ...g, openedAt: 0 }));
  const types: string[] = new Array(n).fill('');
  let overlapScore = 0;

  const overlapsWith = (type: string, f: number, r: number) => {
    let c = 0;
    for (const [a, b] of intervals.get(type) || []) if (a <= r && f <= b) c++;
    return c;
  };

  // 정답 순서를 한 칸씩 만들어가며, "어느 타일을 치울지"와 "무슨 천체를 줄지"를 함께 고른다
  for (let step = 0; step < n; step++) {
    type Option = { tile: number; kind: 'join' | 'new' | 'vanish'; type: string; overlap: number; idx?: number; w: number };
    const options: Option[] = [];
    const dockCount = open.reduce((sum, g) => sum + g.count, 0);
    // 오래 열려 있는 묶음이 있으면 그 묶음부터 채운다 (짝이 멀리 숨지 않게)
    let dueIdx = -1;
    if (opt.groupWindow) {
      open.forEach((g, idx) => {
        if (step - g.openedAt >= opt.groupWindow! && (dueIdx < 0 || g.openedAt < open[dueIdx].openedAt)) dueIdx = idx;
      });
    }
    for (const t of frontier) {
      // 사라지는 외계인(장애물): 슬롯을 쓰지 않고 언제든 치울 수 있다
      if (obstacles.has(t)) {
        options.push({ tile: t, kind: 'vanish', type: VANISH_TYPE, overlap: 0, w: 3 });
        continue;
      }
      const f = seenAt[t];
      open.forEach((g, idx) => {
        if (dueIdx >= 0 && idx !== dueIdx) return;
        // 묶음을 완성하지 않는 경우엔 슬롯 여유가 있어야 한다
        if (g.count + 1 < 3 && dockCount + 1 > opt.maxOpen) return;
        const ov = overlapsWith(g.type, f, step);
        // 묶음 완성(join)을 선호: 위를 걷어내고 나온 타일로 짝을 맞추는 흐름
        if (ov <= opt.maxVisible - 1) options.push({ tile: t, kind: 'join', type: g.type, overlap: ov, idx, w: 4 + (step - f) * 0.25 });
      });
      // 새 묶음은 슬롯에 한 칸 여유를 남길 때만 연다 (막다른 길 방지)
      if (dueIdx < 0 && dockCount + 2 <= opt.maxOpen) {
        for (const [type, q] of left) {
          if (q <= 0 || open.some(g => g.type === type)) continue;
          const ov = overlapsWith(type, f, step);
          if (ov <= opt.maxVisible - 1) options.push({ tile: t, kind: 'new', type, overlap: ov, w: 0.5 + q * 0.5 + (step - f) * 0.15 });
        }
      }
    }
    if (options.length === 0) return null;

    const best = Math.min(...options.map(o => o.overlap));
    // 쉬운 레벨은 2개가 같이 보이는 것도 자연스럽게 허용, 어려운 레벨은 1개만 보이는 쪽을 우선
    const pool = opt.preferSingle ? options.filter(o => o.overlap === best) : options;
    // 쉬운 구간: 이미 보이는 같은 천체와 함께 보이게 되는 선택(겹침 1~2)에 가중치
    const weightOf = (o: Option) => (opt.preferTriple ? o.w * (1 + o.overlap * 2.5) : o.w);
    const total = pool.reduce((sum, o) => sum + weightOf(o), 0);
    let roll = rand() * total;
    let choice = pool[pool.length - 1];
    for (const o of pool) {
      roll -= weightOf(o);
      if (roll <= 0) { choice = o; break; }
    }
    overlapScore += choice.overlap;

    const t = choice.tile;
    types[t] = choice.type;
    if (choice.kind === 'vanish') {
      frontier.splice(frontier.indexOf(t), 1);
      graph.lowers[t].forEach((low, k) => {
        remainingUppers[low]--;
        coveredArea[low] -= graph.lowerArea[t][k];
        if (seenAt[low] < 0 && coveredArea[low] < SEEN_THRESHOLD) seenAt[low] = step + 1;
        if (remainingUppers[low] === 0) frontier.push(low);
      });
      continue;
    }
    if (!intervals.has(choice.type)) intervals.set(choice.type, []);
    intervals.get(choice.type)!.push([seenAt[t], step]);
    if (choice.kind === 'new') {
      left.set(choice.type, (left.get(choice.type) || 0) - 1);
      open.push({ type: choice.type, count: 1, openedAt: step });
    } else {
      const g = open[choice.idx!];
      g.count++;
      if (g.count === 3) open.splice(choice.idx!, 1);
    }

    // 타일 치우기 → 아래 타일 드러남
    frontier.splice(frontier.indexOf(t), 1);
    graph.lowers[t].forEach((low, k) => {
      remainingUppers[low]--;
      coveredArea[low] -= graph.lowerArea[t][k];
      if (seenAt[low] < 0 && coveredArea[low] < SEEN_THRESHOLD) seenAt[low] = step + 1;
      if (remainingUppers[low] === 0) frontier.push(low);
    });
  }
  if (open.length > 0) return null;
  return { types, overlapScore };
}

function assignSolvableTypes(
  slots: SlotPos[],
  quota: Map<string, number>,
  opt: AssignOptions,
  rand: () => number,
  strict: boolean,
  budgetMs: number,
  initialOpen: Array<{ type: string; count: number }> = [],
  obstacles: Set<number> = new Set()
): string[] | null {
  const graph = buildCoverGraph(slots);
  const started = Date.now();
  const relaxSteps = strict ? 1 : 4;
  for (let relax = 0; relax < relaxSteps; relax++) {
    const o = { ...opt, maxVisible: opt.maxVisible + relax };
    for (let a = 0; a < o.attempts; a++) {
      if (Date.now() - started > budgetMs * (relax + 1)) break;
      const res = tryAssign(slots, graph, quota, o, rand, initialOpen, obstacles);
      if (res) return res.types;
    }
  }
  if (strict) return null;
  // 최후의 안전장치: 규칙 없이 정답 순서만 보장
  const res = tryAssign(slots, graph, quota, { maxVisible: 99, maxOpen: 6, attempts: 1 }, rand, initialOpen, obstacles);
  return res ? res.types : null;
}

/**
 * 풀 수 있게 다시 섞기 (섞기 부스터)
 * 남은 보드 타일 위치는 그대로 두고 천체만 다시 배치한다.
 * 슬롯에 이미 들어 있는 천체는 "진행 중인 묶음"으로 보고, 그것까지 포함해 정답 순서가 존재하도록 만든다.
 */
export function reshuffleBoardSolvable(tiles: BoardTile[], dockTypeIds: string[], levelNum: number): BoardTile[] {
  const remaining = tiles.filter(t => !t.isCollected);
  if (remaining.length === 0) return tiles;
  const slots: SlotPos[] = remaining.map(t => ({ x: t.x, y: t.y, layer: t.layer }));
  // 사라지는 외계인은 그대로 두고(장애물), 천체만 다시 배치한다
  const obstacles = new Set(remaining.map((t, i) => (t.typeId === VANISH_TYPE ? i : -1)).filter(i => i >= 0));

  // 천체별 개수: 보드 + 슬롯은 항상 3의 배수
  const boardCount = new Map<string, number>();
  remaining.forEach(t => {
    if (t.typeId !== VANISH_TYPE) boardCount.set(t.typeId, (boardCount.get(t.typeId) || 0) + 1);
  });
  const dockCount = new Map<string, number>();
  dockTypeIds.forEach(id => dockCount.set(id, (dockCount.get(id) || 0) + 1));

  const initialOpen: Array<{ type: string; count: number }> = [];
  const quota = new Map<string, number>();
  for (const [type, bc] of boardCount) {
    const dc = (dockCount.get(type) || 0) % 3;
    let rest = bc;
    if (dc > 0) {
      initialOpen.push({ type, count: dc });
      rest -= 3 - dc;
    }
    if (rest > 0) quota.set(type, Math.floor(rest / 3));
  }

  const difficulty = getDifficulty(levelNum);
  // 섞기는 슬롯 여유를 최대로(6칸) 보고 정답 순서를 찾는다
  const opt = { ...difficulty, maxOpen: 6, preferSingle: true, groupWindow: difficulty.groupWindow ? 5 : undefined };
  const types =
    assignSolvableTypes(slots, quota, opt, Math.random, true, 80, initialOpen, obstacles) ||
    assignSolvableTypes(slots, quota, opt, Math.random, false, 80, initialOpen, obstacles);
  if (!types) return tiles;

  const byId = new Map(remaining.map((t, i) => [t.id, types[i]]));
  return recalculateOcclusion(tiles.map(t => (byId.has(t.id) ? { ...t, typeId: byId.get(t.id)! } : t)));
}

/**
 * 외계인 침공 (15레벨부터) — 외계인 3종
 *  ① cover   덮개 외계인: 누르면 외계인만 사라지고 그 자리에 천체가 드러난다 (슬롯 안 씀) — 가장 많음
 *  ② vanish  사라지는 외계인: 밑에 천체가 없는 장애물. 누르면 그냥 사라진다 (슬롯 안 씀)
 *  ③ mystery 정체불명 외계인: 누르면 슬롯으로 올라가면서 정체가 드러난다
 *  - 15~20레벨: 처음부터 누를 수 있는 위층 타일에만
 *  - 21레벨~: 아래층에 깔린 타일에도
 * ②는 판을 만들 때 장애물 칸으로 따로 넣고, 그걸 포함해 '반드시 풀 수 있는 판'을 계산한다.
 */
export const ALIEN_START_LEVEL = 15;
export const ALIEN_DEEP_LEVEL = 21;
export const VANISH_TYPE = 'alien_vanish';

function vanishCount(levelNum: number): number {
  if (levelNum < ALIEN_START_LEVEL) return 0;
  // 그냥 사라지기만 하는 남색 UFO는 재미 요소가 적어서 많이 넣지 않는다
  return 3;
}

/** 사라지는 외계인(장애물) 자리 고르기 — 15~20레벨은 처음부터 보이는 위층 칸에서만 */
function pickObstacles(slots: SlotPos[], levelNum: number): Set<number> {
  const k = vanishCount(levelNum);
  if (k === 0) return new Set();
  const topOnly = levelNum < ALIEN_DEEP_LEVEL;
  const idx = slots.map((_, i) => i).filter(i => {
    if (!topOnly) return true;
    return !slots.some((s, j) => j !== i && s.layer > slots[i].layer && 1 - Math.abs(s.x - slots[i].x) > 0.05 && 1 - Math.abs(s.y - slots[i].y) > 0.05);
  });
  const chosen = idx.sort(() => Math.random() - 0.5).slice(0, k);
  return chosen.length === k ? new Set(chosen) : new Set();
}

function assignAliens(tiles: BoardTile[], levelNum: number): BoardTile[] {
  if (levelNum < ALIEN_START_LEVEL) return tiles;
  const topOnly = levelNum < ALIEN_DEEP_LEVEL;
  const pool = tiles.filter(t => t.typeId !== VANISH_TYPE && (topOnly ? !t.isCovered : true));
  const n = tiles.length;
  // 덮개 외계인이 가장 많이 나온다
  const coverN = topOnly ? 5 : Math.max(5, Math.round(n * (levelNum < 50 ? 0.12 : 0.14)));
  const mysteryN = topOnly ? 1 : Math.max(2, Math.round(n * (levelNum < 50 ? 0.03 : 0.04)));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  // 물음표 외계인을 먼저 고르고(자리가 모자라도 빠지지 않게), 나머지로 덮개 외계인을 채운다
  const mystery = new Set(shuffled.slice(0, mysteryN).map(t => t.id));
  const cover = new Set(shuffled.slice(mysteryN, mysteryN + coverN).map(t => t.id));
  return tiles.map(t => {
    if (t.typeId === VANISH_TYPE) return { ...t, isAlien: true, alienKind: 'vanish' as const };
    if (cover.has(t.id)) return { ...t, isAlien: true, alienKind: 'cover' as const };
    if (mystery.has(t.id)) return { ...t, isAlien: true, alienKind: 'mystery' as const };
    return t;
  });
}

/** 레벨별 난이도 규칙 */
function getDifficulty(levelNum: number): AssignOptions {
  if (levelNum <= 2) return { maxVisible: 3, maxOpen: 3, attempts: 1 };
  // 1~50레벨: 같은 천체 3개가 한눈에 보이는 경우를 일부러 만든다 (찾는 재미)
  if (levelNum <= 9) return { maxVisible: 3, maxOpen: 4, attempts: 200, preferTriple: true };
  if (levelNum <= 50) return { maxVisible: 3, maxOpen: 5, attempts: 200, preferTriple: true };
  // 51레벨부터: 처음엔 3개가 다 보이지 않아도, 위 타일을 한두 개 걷어내면 짝 3개가 모이게
  if (levelNum < HARD_START_LEVEL) return { maxVisible: 3, maxOpen: 5, attempts: 300, preferTriple: true, groupWindow: 3 };
  // 200레벨~: 같은 천체 3개가 한꺼번에 보이지 않게(최대 2개), 짝이 조금 더 깊이 숨는다
  if (levelNum < 250) return { maxVisible: 3, maxOpen: 5, attempts: 300, preferSingle: true, groupWindow: 4 };
  // 250레벨~: 짝이 더 깊이 숨고 슬롯을 더 오래 써야 한다
  if (levelNum < 300) return { maxVisible: 3, maxOpen: 6, attempts: 300, preferSingle: true, groupWindow: 5 };
  // 300레벨~(두 번째 여행부터): 같은 천체가 1개만 보이는 배치를 최대한 우선
  return { maxVisible: 3, maxOpen: 6, attempts: 300, preferSingle: true, groupWindow: 6 };
}

/** 이 레벨부터 난이도가 한 단계 더 올라간다 (천체 종류 추가 + 같은 천체 동시 노출 줄이기) */
export const HARD_START_LEVEL = 200;

/** 200레벨부터 한 판에 나오는 천체 종류를 더 늘린다 → 같은 그림이 덜 반복되어 짝 찾기가 어려워진다 */
function extraTypesForLevel(levelNum: number): number {
  if (levelNum < HARD_START_LEVEL) return 0;
  if (levelNum < 250) return 3;
  if (levelNum < 300) return 5;
  return 6;
}

export interface ChapterPreset {
  chapterTitle: string;
  chapterTitleEn?: string;
  defaultFailureRate: number;
  briefing: {
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    tip: string;
    tipEn?: string;
    featuredTiles: string[];
  };
  tileIds: string[];
}

export const CHAPTER_PRESETS: ChapterPreset[] = [
  // 1. 내행성 (수성과 금성)
  {
    chapterTitle: '수성과 금성',
    chapterTitleEn: 'Mercury & Venus',
    defaultFailureRate: 1,
    briefing: {
      title: '수성과 금성',
      titleEn: 'Mercury & Venus',
      description: '수성은 대기가 없어 낮과 밤의 표면 온도차가 600도에 달하며, 금성은 두꺼운 이산화탄소 대기의 강력한 온실효과로 태양계에서 가장 뜨거운 460도를 유지합니다.',
      descriptionEn: 'Mercury has virtually no atmosphere causing extreme 600°C temperature shifts, while Venus has a super-dense CO2 greenhouse atmosphere reaching 460°C.',
      tip: '',
      featuredTiles: ['c_mercury', 'c_venus'],
    },
    tileIds: ['c_mercury', 'c_venus'],
  },
  // 2. 지구와 달
  {
    chapterTitle: '지구와 달',
    chapterTitleEn: 'Earth & Moon',
    defaultFailureRate: 3,
    briefing: {
      title: '지구와 달',
      titleEn: 'Earth & Moon',
      description: '지구는 약 46억 년 전 태어나 표면의 약 71%가 바다로 덮인 생명의 별이며, 달은 지구 지름의 4분의 1 크기로 조석 현상을 일으켜 지구의 자전축을 23.5도로 안정시킵니다.',
      descriptionEn: 'Earth is our water world home holding vibrant life, accompanied by the Moon whose gravitational tides stabilize Earth’s 23.5° axial tilt.',
      tip: '',
      featuredTiles: ['c_earth', 'c_moon', 'c_iss'],
    },
    tileIds: ['c_earth', 'c_moon', 'c_iss'],
  },
  // 3. 붉은 화성과 위성들
  {
    chapterTitle: '화성과 위성들',
    chapterTitleEn: 'Mars & Its Moons',
    defaultFailureRate: 5,
    briefing: {
      title: '화성과 위성들',
      titleEn: 'Mars & Its Moons',
      description: '화성은 산화철 성분으로 붉게 빛나며 에베레스트의 약 2.5배 높이인 올림포스 화산이 있습니다. 곁에는 울퉁불퉁한 감자 모양의 두 소행성 위성 포보스와 데이모스가 돕니다.',
      descriptionEn: 'Mars shines red with iron oxide soil and hosts Olympus Mons, the solar system’s tallest volcano, orbited by asteroid-like potato moons Phobos and Deimos.',
      tip: '',
      featuredTiles: ['c_mars', 'c_phobos', 'c_deimos'],
    },
    tileIds: ['c_mars', 'c_phobos', 'c_deimos'],
  },
  // 4. 소행성대의 보물들
  {
    chapterTitle: '소행성대의 보물들',
    chapterTitleEn: 'Asteroid Belt Treasures',
    defaultFailureRate: 9,
    briefing: {
      title: '소행성대의 보물들',
      titleEn: 'Asteroid Belt Treasures',
      description: '화성과 목성 사이 소행성대에서 가장 거대한 왜소행성 세레스는 땅속 소금물 층을, 베스타는 거대한 남극 분화구를, 베누는 다이아몬드형 주사위 형태를 지녔습니다.',
      descriptionEn: 'Dwarf planet Ceres may hide deep brine reservoirs, rocky Vesta boasts a 22km south pole crater, and diamond-shaped Bennu holds pristine carbonaceous matter.',
      tip: '',
      featuredTiles: ['c_ceres', 'c_vesta', 'c_pallas', 'c_bennu'],
    },
    tileIds: ['c_ceres', 'c_vesta', 'c_pallas', 'c_bennu'],
  },
  // 5. 목성과 갈릴레이 위성들
  {
    chapterTitle: '목성과 갈릴레이 위성',
    chapterTitleEn: 'Jupiter & Galilean Moons',
    defaultFailureRate: 18,
    briefing: {
      title: '목성과 갈릴레이 위성',
      titleEn: 'Jupiter & Galilean Moons',
      description: '목성은 태양계 최대 가스 행성으로 수백 년 동안 이어져 온 대적점이 소용돌이칩니다. 화산 위성 이오, 지하 얼음 바다 위성 유로파, 수성보다 큰 거대 위성 가니메데, 크레이터로 뒤덮인 칼리스토가 공전합니다.',
      descriptionEn: 'King of planets Jupiter commands the Great Red Spot storm, orbited by volcanic Io, ocean-harboring Europa, giant Ganymede which is larger than Mercury, and cratered Callisto.',
      tip: '',
      featuredTiles: ['c_jupiter', 'c_io', 'c_europa', 'c_ganymede', 'c_callisto'],
    },
    tileIds: ['c_jupiter', 'c_io', 'c_europa', 'c_ganymede', 'c_callisto'],
  },
  // 6. 토성과 고리의 위성들
  {
    chapterTitle: '토성과 고리의 위성들',
    chapterTitleEn: 'Saturn & Ring Worlds',
    defaultFailureRate: 28,
    briefing: {
      title: '토성과 고리의 위성들',
      titleEn: 'Saturn & Ring Worlds',
      description: '토성은 얼음 알갱이로 된 아름다운 수평 고리를 가졌습니다. 주황빛 메탄 대기를 품은 타이탄, 남극에서 얼음 간헐천을 뿜는 엔셀라두스, 데스스타 분화구를 가진 미마스가 있습니다.',
      descriptionEn: 'Saturn dazzles with crystalline ice rings, accompanied by methane-shrouded Titan, geyser-spewing Enceladus, and Death Star-lookalike Mimas.',
      tip: '',
      featuredTiles: ['c_saturn', 'c_titan', 'c_enceladus', 'c_mimas'],
    },
    tileIds: ['c_saturn', 'c_titan', 'c_enceladus', 'c_mimas'],
  },
  // 토성의 얼음 위성들
  {
    chapterTitle: '토성의 얼음 위성들',
    chapterTitleEn: 'Icy Moons of Saturn',
    defaultFailureRate: 34,
    briefing: {
      title: '토성의 얼음 위성들',
      titleEn: 'Icy Moons of Saturn',
      description: '토성 곁에는 하얀 얼음 위성들이 줄지어 돕니다. 크레이터로 뒤덮인 레아, 두 얼굴의 이아페투스, 얼음 절벽 줄무늬의 디오네, 거대한 크레이터를 지닌 테티스를 만나 보세요.',
      descriptionEn: 'Saturn is circled by icy white moons: cratered Rhea, two-faced Iapetus, cliff-streaked Dione, and Tethys with its giant crater.',
      tip: '',
      featuredTiles: ['c_rhea', 'c_iapetus', 'c_dione', 'c_tethys'],
    },
    tileIds: ['c_rhea', 'c_iapetus', 'c_dione', 'c_tethys'],
  },
  // 7. 천왕성과 해왕성
  {
    chapterTitle: '천왕성과 해왕성',
    chapterTitleEn: 'Uranus & Neptune',
    defaultFailureRate: 39,
    briefing: {
      title: '천왕성과 해왕성',
      titleEn: 'Uranus & Neptune',
      description: '천왕성은 자전축이 98도 누워 완전히 누운 채 공전하는 민트빛 얼음 행성이며, 해왕성은 시속 2,100km의 태양계에서 가장 빠른 초음속 폭풍이 몰아치는 푸른 거인입니다.',
      descriptionEn: 'Mint-blue Uranus spins on its side with a 98° tilt, while deep blue Neptune whips supersonic 2,100 km/h storm winds across its icy atmosphere.',
      tip: '',
      featuredTiles: ['c_uranus', 'c_neptune', 'c_triton', 'c_miranda'],
    },
    tileIds: ['c_uranus', 'c_neptune', 'c_triton', 'c_miranda'],
  },
  // 천왕성의 셰익스피어 위성들
  {
    chapterTitle: '천왕성의 셰익스피어 위성들',
    chapterTitleEn: 'Uranus’s Shakespearean Moons',
    defaultFailureRate: 45,
    briefing: {
      title: '천왕성의 셰익스피어 위성들',
      titleEn: 'Uranus’s Shakespearean Moons',
      description: '천왕성의 위성들은 셰익스피어와 포프의 작품 속 인물 이름을 가졌습니다. 요정 여왕 티타니아와 요정 왕 오베론, 공기의 요정 아리엘, 어두운 움브리엘이 함께 돕니다.',
      descriptionEn: 'The moons of Uranus are named after characters from Shakespeare and Pope: fairy queen Titania, fairy king Oberon, airy Ariel, and dark Umbriel.',
      tip: '',
      featuredTiles: ['c_titania', 'c_oberon', 'c_ariel', 'c_umbriel'],
    },
    tileIds: ['c_titania', 'c_oberon', 'c_ariel', 'c_umbriel'],
  },
  // 모양도 궤도도 독특한 위성들
  {
    chapterTitle: '모양도 궤도도 독특한 위성들',
    chapterTitleEn: 'Odd-Shaped & Odd-Orbit Moons',
    defaultFailureRate: 50,
    briefing: {
      title: '모양도 궤도도 독특한 위성들',
      titleEn: 'Odd-Shaped & Odd-Orbit Moons',
      description: '모든 위성이 둥글지는 않습니다. 붉은 감자 아말테아, 스펀지 같은 히페리온, 거꾸로 도는 포이베, 각진 프로테우스, 아주 길쭉한 궤도를 도는 네레이드처럼 개성 넘치는 위성들입니다.',
      descriptionEn: 'Not every moon is round: red potato Amalthea, sponge-like Hyperion, backward-orbiting Phoebe, boxy Proteus, and Nereid on its stretched-out orbit.',
      tip: '',
      featuredTiles: ['c_amalthea', 'c_hyperion', 'c_phoebe', 'c_proteus', 'c_nereid'],
    },
    tileIds: ['c_amalthea', 'c_hyperion', 'c_phoebe', 'c_proteus', 'c_nereid'],
  },
  // 8. 카이퍼 벨트와 왜소행성
  {
    chapterTitle: '카이퍼 벨트와 왜소행성',
    chapterTitleEn: 'Kuiper Belt & Dwarf Worlds',
    defaultFailureRate: 52,
    briefing: {
      title: '카이퍼 벨트와 왜소행성',
      titleEn: 'Kuiper Belt & Dwarf Worlds',
      description: '해왕성 너머 명왕성은 하트 모양의 거대한 질소 빙하 스푸트니크 평원을 품고 있으며, 하우메아는 4시간 만에 자전하여 럭비공처럼 길쭉한 형태를 띱니다.',
      descriptionEn: 'Beyond Neptune lies Pluto with its heart-shaped nitrogen glacier Sputnik Planitia, and rugby-shaped Haumea spinning in just 4 hours.',
      tip: '',
      featuredTiles: ['c_pluto', 'c_charon', 'c_makemake', 'c_haumea'],
    },
    tileIds: ['c_pluto', 'c_charon', 'c_makemake', 'c_haumea'],
  },
  // 태양계의 끝자락
  {
    chapterTitle: '태양계의 끝자락',
    chapterTitleEn: 'Edge of the Solar System',
    defaultFailureRate: 58,
    briefing: {
      title: '태양계의 끝자락',
      titleEn: 'Edge of the Solar System',
      description: '해왕성 너머 아주 먼 곳에는 명왕성보다 무거운 에리스, 1만 년 넘게 걸려 태양을 도는 세드나, 눈사람 모양의 아로코스가 있습니다. 뉴호라이즌스호가 이곳까지 날아갔습니다.',
      descriptionEn: 'Far beyond Neptune lie Eris, more massive than Pluto, Sedna on its 11,000-year orbit, and snowman-shaped Arrokoth, visited by New Horizons.',
      tip: '',
      featuredTiles: ['c_eris', 'c_sedna', 'c_arrokoth', 'c_newhorizons'],
    },
    tileIds: ['c_eris', 'c_sedna', 'c_arrokoth', 'c_newhorizons'],
  },
  // 지구 가까이 오는 소행성
  {
    chapterTitle: '지구 가까이 오는 소행성',
    chapterTitleEn: 'Near-Earth Asteroids',
    defaultFailureRate: 62,
    briefing: {
      title: '지구 가까이 오는 소행성',
      titleEn: 'Near-Earth Asteroids',
      description: '탐사선이 직접 찾아가 흙을 가져온 류구와 이토카와, 처음으로 착륙한 에로스, 일부러 부딪쳐 길을 바꾼 디모르포스, 2029년 지구 가까이 지나갈 아포피스를 만나 보세요.',
      descriptionEn: 'Meet Ryugu and Itokawa, whose soil was brought to Earth, Eros, the first asteroid landed on, Dimorphos, nudged by DART, and Apophis, passing close in 2029.',
      tip: '',
      featuredTiles: ['c_ryugu', 'c_itokawa', 'c_eros', 'c_dimorphos', 'c_apophis'],
    },
    tileIds: ['c_ryugu', 'c_itokawa', 'c_eros', 'c_dimorphos', 'c_apophis'],
  },
  // 9. 신비한 혜성과 성간 방문자
  {
    chapterTitle: '신비한 혜성과 성간 방문자',
    chapterTitleEn: 'Comets & Interstellar Visitors',
    defaultFailureRate: 65,
    briefing: {
      title: '신비한 혜성과 성간 방문자',
      titleEn: 'Comets & Interstellar Visitors',
      description: '76년 주기로 푸른 꼬리를 흩날리는 핼리혜성과 외계 항성계에서 우리 은하계를 찾아온 최초의 시가 모양 성간 천체 오무아무아, 보리소프 혜성이 신비로운 궤도를 그립니다.',
      descriptionEn: 'Halley’s Comet glides on its 76-year cosmic loop, while alien messengers ‘Oumuamua and 2I/Borisov journey from deep interstellar space.',
      tip: '',
      featuredTiles: ['c_halley', 'c_oumuamua', 'c_borisov', 'c_comet67p'],
    },
    tileIds: ['c_halley', 'c_oumuamua', 'c_borisov', 'c_comet67p'],
  },
  // 밤하늘을 수놓은 대혜성
  {
    chapterTitle: '밤하늘을 수놓은 대혜성',
    chapterTitleEn: 'Great Comets',
    defaultFailureRate: 68,
    briefing: {
      title: '밤하늘을 수놓은 대혜성',
      titleEn: 'Great Comets',
      description: '1년 반 동안 맨눈으로 보였던 헤일-밥 혜성, 목성에 부딪친 슈메이커-레비 9, 2020년 여름 하늘의 니오와이즈, 탐사선이 속을 들여다본 템펠 1 혜성 이야기입니다.',
      descriptionEn: 'Hale-Bopp, visible for a year and a half, Shoemaker-Levy 9, which struck Jupiter, NEOWISE of summer 2020, and Tempel 1, probed by Deep Impact.',
      tip: '',
      featuredTiles: ['c_halebopp', 'c_sl9', 'c_neowise', 'c_tempel1'],
    },
    tileIds: ['c_halebopp', 'c_sl9', 'c_neowise', 'c_tempel1'],
  },
  // 10. 성운과 별들의 요람
  {
    chapterTitle: '성운과 별들의 요람',
    chapterTitleEn: 'Nebulae & Stellar Nurseries',
    defaultFailureRate: 78,
    briefing: {
      title: '성운과 별들의 요람',
      titleEn: 'Nebulae & Stellar Nurseries',
      description: '오리온 성운은 새로운 아기 별들이 태어나는 분홍빛 발광 요람이며, 게성운은 1,000년 전 초신성 폭발이 남긴 거미줄 같은 찬란한 가스 필라멘트입니다.',
      descriptionEn: 'The Orion Nebula glows as a luminous star factory, while the Crab Nebula weaves intricate gossamer filaments from an ancient supernova.',
      tip: '',
      featuredTiles: ['c_orion', 'c_crab', 'c_ring', 'c_helix'],
    },
    tileIds: ['c_orion', 'c_crab', 'c_ring', 'c_helix'],
  },
  // 별이 태어나는 성운
  {
    chapterTitle: '별이 태어나는 성운',
    chapterTitleEn: 'Where Stars Are Born',
    defaultFailureRate: 80,
    briefing: {
      title: '별이 태어나는 성운',
      titleEn: 'Where Stars Are Born',
      description: '독수리 성운의 창조의 기둥, 말 머리 모양의 암흑 성운, 우주 절벽이 있는 용골자리 성운, 분홍빛 석호 성운에서 지금도 새로운 별들이 태어나고 있습니다.',
      descriptionEn: 'New stars are being born in the Pillars of Creation, the Horsehead Nebula, the Carina Nebula with its Cosmic Cliffs, and the pink Lagoon Nebula.',
      tip: '',
      featuredTiles: ['c_pillars', 'c_horsehead', 'c_carina', 'c_lagoon'],
    },
    tileIds: ['c_pillars', 'c_horsehead', 'c_carina', 'c_lagoon'],
  },
  // 별이 남긴 마지막 숨결
  {
    chapterTitle: '별이 남긴 마지막 숨결',
    chapterTitleEn: 'A Star’s Final Breath',
    defaultFailureRate: 84,
    briefing: {
      title: '별이 남긴 마지막 숨결',
      titleEn: 'A Star’s Final Breath',
      description: '별은 수명을 다하면 가스 껍질을 우주로 내보냅니다. 고양이 눈을 닮은 행성상 성운과 초신성 폭발이 남긴 비단 커튼 같은 베일 성운을 만나 보세요.',
      descriptionEn: 'When stars die they shed their gas into space: see the Cat’s Eye planetary nebula and the silky Veil Nebula left by a supernova.',
      tip: '',
      featuredTiles: ['c_catseye', 'c_veil'],
    },
    tileIds: ['c_catseye', 'c_veil'],
  },
  // 11. 항성의 일생과 펄서
  {
    chapterTitle: '항성의 일생과 펄서',
    chapterTitleEn: 'Stellar Lives & Pulsars',
    defaultFailureRate: 88,
    briefing: {
      title: '항성의 일생과 펄서',
      titleEn: 'Stellar Lives & Pulsars',
      description: '우리 태양부터 밤하늘 가장 밝은 시리우스, 태양 700배 크기의 적색초거성 베텔게우스, 초당 수백 회 회전하며 감마선 빔을 쏘는 초고밀도 중성자별 펄서까지 탐사합니다.',
      descriptionEn: 'From our glowing Sun to brilliant Sirius, gargantuan red supergiant Betelgeuse, and rapidly spinning magnetized pulsars beaming gamma rays.',
      tip: '',
      featuredTiles: ['c_sun', 'c_sirius', 'c_betelgeuse', 'c_pulsar'],
    },
    tileIds: ['c_sun', 'c_sirius', 'c_betelgeuse', 'c_pulsar'],
  },
  // 견우와 직녀, 여름밤의 별
  {
    chapterTitle: '견우와 직녀, 여름밤의 별',
    chapterTitleEn: 'Summer Stars: The Weaver & the Cowherd',
    defaultFailureRate: 90,
    briefing: {
      title: '견우와 직녀, 여름밤의 별',
      titleEn: 'Summer Stars: The Weaver & the Cowherd',
      description: '은하수를 사이에 둔 직녀성과 견우성, 그리고 백조자리 꼬리의 데네브가 여름의 대삼각형을 이룹니다. 북반구 하늘에서 가장 밝은 아크투루스도 함께 빛납니다.',
      descriptionEn: 'Vega and Altair face each other across the Milky Way and form the Summer Triangle with Deneb, while Arcturus shines brightest in the northern sky.',
      tip: '',
      featuredTiles: ['c_vega', 'c_altair', 'c_deneb', 'c_arcturus'],
    },
    tileIds: ['c_vega', 'c_altair', 'c_deneb', 'c_arcturus'],
  },
  // 겨울밤의 별과 좀생이별
  {
    chapterTitle: '겨울밤의 별과 좀생이별',
    chapterTitleEn: 'Winter Stars & the Pleiades',
    defaultFailureRate: 92,
    briefing: {
      title: '겨울밤의 별과 좀생이별',
      titleEn: 'Winter Stars & the Pleiades',
      description: '오리온자리의 푸른 리겔, 황소의 붉은 눈 알데바란, 보석 같은 좀생이별, 그리고 제주에서 보면 오래 산다는 노인성까지 겨울 하늘의 별들입니다.',
      descriptionEn: 'Winter brings blue Rigel, Aldebaran the Bull’s red eye, the jewel-like Pleiades, and Canopus, the Star of Longevity seen from Jeju.',
      tip: '',
      featuredTiles: ['c_rigel', 'c_aldebaran', 'c_pleiades', 'c_canopus'],
    },
    tileIds: ['c_rigel', 'c_aldebaran', 'c_pleiades', 'c_canopus'],
  },
  // 길잡이별과 이웃 별
  {
    chapterTitle: '길잡이별과 이웃 별',
    chapterTitleEn: 'Guide Star & Neighbor Stars',
    defaultFailureRate: 93,
    briefing: {
      title: '길잡이별과 이웃 별',
      titleEn: 'Guide Star & Neighbor Stars',
      description: '오래전부터 길을 알려 준 북극성, 태양 다음으로 가장 가까운 프록시마 센타우리, 전갈자리의 붉은 심장 안타레스를 만나 보세요.',
      descriptionEn: 'Meet Polaris, the age-old guide star, Proxima Centauri, our nearest stellar neighbor, and Antares, the red heart of the Scorpion.',
      tip: '',
      featuredTiles: ['c_polaris', 'c_proxima', 'c_antares'],
    },
    tileIds: ['c_polaris', 'c_proxima', 'c_antares'],
  },
  // 12. 은하와 시공간의 블랙홀
  {
    chapterTitle: '은하와 시공간의 블랙홀',
    chapterTitleEn: 'Galaxies & Black Holes',
    defaultFailureRate: 95,
    briefing: {
      title: '은하와 시공간의 블랙홀',
      titleEn: 'Galaxies & Black Holes',
      description: '1조 개의 별을 품은 나선 은하 안드로메다와 빛조차 탈출할 수 없는 시공간의 끝 블랙홀, 거대한 제트를 뿜는 우주에서 가장 밝은 은하핵 퀘이사를 만납니다.',
      descriptionEn: 'Marvel at Andromeda’s 1 trillion stars, peer into supermassive black hole event horizons, and witness blazing relativistic quasar jets.',
      tip: '',
      featuredTiles: ['c_andromeda', 'c_blackhole', 'c_sombrero', 'c_quasar'],
    },
    tileIds: ['c_andromeda', 'c_blackhole', 'c_sombrero', 'c_quasar'],
  },
  // 우리은하와 이웃 은하
  {
    chapterTitle: '우리은하와 이웃 은하',
    chapterTitleEn: 'Our Galaxy & Its Neighbors',
    defaultFailureRate: 96,
    briefing: {
      title: '우리은하와 이웃 은하',
      titleEn: 'Our Galaxy & Its Neighbors',
      description: '태양계가 사는 우리은하와 그 곁을 도는 대마젤란은하, 이웃 삼각형자리 은하, 소용돌이치는 소용돌이 은하, 수레바퀴 모양의 고리 은하까지 은하 여행을 떠나 보세요.',
      descriptionEn: 'Tour our Milky Way, its companion the Large Magellanic Cloud, the Triangulum Galaxy, the swirling Whirlpool, and the ring-shaped Cartwheel.',
      tip: '',
      featuredTiles: ['c_milkyway', 'c_lmc', 'c_triangulum', 'c_whirlpool', 'c_cartwheel'],
    },
    tileIds: ['c_milkyway', 'c_lmc', 'c_triangulum', 'c_whirlpool', 'c_cartwheel'],
  },
  // 블랙홀을 사진으로 찍다
  {
    chapterTitle: '블랙홀을 사진으로 찍다',
    chapterTitleEn: 'Photographing Black Holes',
    defaultFailureRate: 97,
    briefing: {
      title: '블랙홀을 사진으로 찍다',
      titleEn: 'Photographing Black Holes',
      description: '2019년 인류는 처음으로 M87 은하 중심의 블랙홀을 사진으로 찍었고, 2022년에는 우리은하 한가운데의 궁수자리 A*의 모습도 공개했습니다.',
      descriptionEn: 'In 2019 humanity photographed a black hole for the first time, in galaxy M87, and in 2022 revealed Sagittarius A* at the heart of our own galaxy.',
      tip: '',
      featuredTiles: ['c_sgra', 'c_m87'],
    },
    tileIds: ['c_sgra', 'c_m87'],
  },
  // 우주를 바라본 탐사선과 망원경
  {
    chapterTitle: '우주를 바라본 탐사선과 망원경',
    chapterTitleEn: 'Probes & Space Telescopes',
    defaultFailureRate: 97,
    briefing: {
      title: '우주를 바라본 탐사선과 망원경',
      titleEn: 'Probes & Space Telescopes',
      description: '태양계 바깥까지 날아간 보이저 1호, 30년 넘게 우주를 찍어 온 허블, 금빛 거울로 먼 우주를 보는 제임스 웹 우주망원경이 인류의 눈이 되어 주었습니다.',
      descriptionEn: 'Voyager 1, now beyond the Sun’s bubble, Hubble, imaging the cosmos for over 30 years, and the golden-mirrored James Webb have been humanity’s eyes.',
      tip: '',
      featuredTiles: ['c_voyager1', 'c_hubble', 'c_jwst'],
    },
    tileIds: ['c_voyager1', 'c_hubble', 'c_jwst'],
  },
  // 한국의 우주 도전
  {
    chapterTitle: '한국의 우주 도전',
    chapterTitleEn: 'Korea’s Space Journey',
    defaultFailureRate: 97,
    briefing: {
      title: '한국의 우주 도전',
      titleEn: 'Korea’s Space Journey',
      description: '1992년 우리별 1호로 첫 인공위성을 가졌고, 우리 기술로 만든 누리호가 위성을 궤도에 올렸으며, 한국 최초의 달 탐사선 다누리는 달 궤도에서 달을 관측해 왔습니다. 다음 꿈은 무엇일까요?',
      descriptionEn: 'Korea got its first satellite, KITSAT-1, in 1992; its own Nuri rocket put satellites into orbit; and Danuri, Korea’s first lunar probe, has been observing the Moon from orbit. What will be next?',
      tip: '',
      featuredTiles: ['c_kitsat1', 'c_nuri', 'c_danuri'],
    },
    tileIds: ['c_kitsat1', 'c_nuri', 'c_danuri', 'c_moon'],
  },
  // 해왕성 너머의 붉은 얼음 세계
  {
    chapterTitle: '해왕성 너머의 붉은 얼음 세계',
    chapterTitleEn: 'Red Ice Worlds Beyond Neptune',
    defaultFailureRate: 97,
    briefing: {
      title: '해왕성 너머의 붉은 얼음 세계',
      titleEn: 'Red Ice Worlds Beyond Neptune',
      description: '해왕성 바깥 차가운 카이퍼 벨트에는 고리를 두른 콰오아, 명왕성의 짝꿍 같은 오르쿠스, 새빨간 공공처럼 아직 잘 알려지지 않은 얼음 세계들이 떠 있습니다.',
      descriptionEn: 'In the cold Kuiper Belt beyond Neptune drift little-known ice worlds: ringed Quaoar, Orcus, Pluto’s opposite twin, and the deep red Gonggong.',
      tip: '',
      featuredTiles: ['c_quaoar', 'c_orcus', 'c_gonggong'],
    },
    tileIds: ['c_quaoar', 'c_orcus', 'c_gonggong'],
  },
  // 거대 행성의 비밀
  {
    chapterTitle: '거대 행성의 비밀',
    chapterTitleEn: 'Secrets of the Giant Planets',
    defaultFailureRate: 97,
    briefing: {
      title: '거대 행성의 비밀',
      titleEn: 'Secrets of the Giant Planets',
      description: '목성에는 지구보다 큰 폭풍 대적점이 수백 년째 소용돌이치고, 토성의 고리 틈에서는 만두처럼 생긴 작은 위성 판이 길을 청소하고 있습니다.',
      descriptionEn: 'On Jupiter a storm larger than Earth has swirled for centuries, while in a gap in Saturn’s rings the dumpling-shaped moon Pan sweeps its path clear.',
      tip: '',
      featuredTiles: ['c_redspot', 'c_pan', 'c_jupiter', 'c_saturn'],
    },
    tileIds: ['c_redspot', 'c_pan', 'c_jupiter', 'c_saturn'],
  },
  // 탐사선이 찾아간 소행성과 혜성
  {
    chapterTitle: '탐사선이 찾아간 소행성과 혜성',
    chapterTitleEn: 'Asteroids & Comets Up Close',
    defaultFailureRate: 97,
    briefing: {
      title: '탐사선이 찾아간 소행성과 혜성',
      titleEn: 'Asteroids & Comets Up Close',
      description: '로제타호는 10년을 날아 혜성에 착륙선을 내렸고, 하틀리 2 혜성은 땅콩 모양 핵에서 얼음을 뿜었습니다. 금속 소행성 프시케에는 지금 탐사선이 날아가고 있습니다.',
      descriptionEn: 'Rosetta flew ten years to drop a lander on a comet, Hartley 2 sprayed ice from its peanut-shaped core, and a probe is now on its way to the metal asteroid Psyche.',
      tip: '',
      featuredTiles: ['c_rosetta', 'c_hartley2', 'c_psyche', 'c_comet67p'],
    },
    tileIds: ['c_rosetta', 'c_hartley2', 'c_psyche', 'c_comet67p'],
  },
  // 봄 밤의 왕과 보석
  {
    chapterTitle: '봄 밤의 왕과 보석',
    chapterTitleEn: 'Kings & Jewels of the Spring Sky',
    defaultFailureRate: 97,
    briefing: {
      title: '봄 밤의 왕과 보석',
      titleEn: 'Kings & Jewels of the Spring Sky',
      description: '봄 밤에는 사자자리의 심장 레굴루스와 처녀자리의 푸른 보석 스피카가 빛납니다. 주황빛 아르크투루스와 함께 봄의 별들을 찾아보세요.',
      descriptionEn: 'Spring nights bring Regulus, the heart of the Lion, and Spica, Virgo’s blue jewel. Find them together with orange Arcturus.',
      tip: '',
      featuredTiles: ['c_regulus', 'c_spica', 'c_arcturus'],
    },
    tileIds: ['c_regulus', 'c_spica', 'c_arcturus'],
  },
  // 겨울 밤의 대삼각형
  {
    chapterTitle: '겨울 밤의 대삼각형',
    chapterTitleEn: 'The Winter Triangle',
    defaultFailureRate: 97,
    briefing: {
      title: '겨울 밤의 대삼각형',
      titleEn: 'The Winter Triangle',
      description: '겨울 밤하늘에서는 시리우스·베텔게우스·프로키온이 커다란 삼각형을 그립니다. 머리 위에서는 노란 별 카펠라가 반짝입니다.',
      descriptionEn: 'In winter Sirius, Betelgeuse and Procyon draw a great triangle in the sky, while yellow Capella sparkles overhead.',
      tip: '',
      featuredTiles: ['c_procyon', 'c_capella', 'c_sirius', 'c_betelgeuse'],
    },
    tileIds: ['c_procyon', 'c_capella', 'c_sirius', 'c_betelgeuse'],
  },
  // 깜빡이는 가을 별
  {
    chapterTitle: '깜빡이는 가을 별',
    chapterTitleEn: 'Winking Stars of Autumn',
    defaultFailureRate: 97,
    briefing: {
      title: '깜빡이는 가을 별',
      titleEn: 'Winking Stars of Autumn',
      description: '가을 하늘에는 외로이 빛나는 포말하우트, 2.87일마다 어두워지는 알골, 1년 가까운 주기로 나타났다 사라지는 미라처럼 밝기가 달라지는 별들이 있습니다.',
      descriptionEn: 'Autumn skies hold lonely Fomalhaut, Algol which dims every 2.87 days, and Mira which appears and vanishes over nearly a year.',
      tip: '',
      featuredTiles: ['c_fomalhaut', 'c_algol', 'c_mira'],
    },
    tileIds: ['c_fomalhaut', 'c_algol', 'c_mira'],
  },
  // 다른 별의 행성들
  {
    chapterTitle: '다른 별의 행성들',
    chapterTitleEn: 'Worlds Around Other Stars',
    defaultFailureRate: 97,
    briefing: {
      title: '다른 별의 행성들',
      titleEn: 'Worlds Around Other Stars',
      description: '1995년 처음 발견된 태양 닮은 별의 행성 이후, 지금까지 6,000개가 넘는 외계행성이 확인되었습니다. 가장 가까운 프록시마 b부터 파란 행성까지 만나 보세요.',
      descriptionEn: 'Since the first planet around a Sun-like star was found in 1995, more than 6,000 exoplanets have been confirmed. Meet them, from nearby Proxima b to a deep blue world.',
      tip: '',
      featuredTiles: ['c_51pegb', 'c_proximab', 'c_trappist1', 'c_hd189733b'],
    },
    tileIds: ['c_51pegb', 'c_proximab', 'c_trappist1', 'c_hd189733b'],
  },
  // 별이 태어나는 꽃밭
  {
    chapterTitle: '별이 태어나는 꽃밭',
    chapterTitleEn: 'Flower Beds of Newborn Stars',
    defaultFailureRate: 97,
    briefing: {
      title: '별이 태어나는 꽃밭',
      titleEn: 'Flower Beds of Newborn Stars',
      description: '가스와 먼지 구름 속에서 새 별이 태어나면, 그 빛과 바람이 구름을 깎아 장미, 대륙, 세 갈래 꽃, 비눗방울 같은 모양을 만듭니다.',
      descriptionEn: 'When new stars are born inside clouds of gas and dust, their light and winds carve the clouds into roses, continents, three-petalled flowers and bubbles.',
      tip: '',
      featuredTiles: ['c_rosette', 'c_northamerica', 'c_trifid', 'c_bubble'],
    },
    tileIds: ['c_rosette', 'c_northamerica', 'c_trifid', 'c_bubble'],
  },
  // 별이 남긴 마지막 숨결
  {
    chapterTitle: '별이 남긴 마지막 숨결',
    chapterTitleEn: 'Last Breaths of Stars',
    defaultFailureRate: 97,
    briefing: {
      title: '별이 남긴 마지막 숨결',
      titleEn: 'Last Breaths of Stars',
      description: '태양 같은 별은 마지막에 바깥 가스를 부드럽게 내보내며, 그 가스가 나비 날개, 고리, 올빼미 얼굴 같은 "행성상 성운"이 됩니다.',
      descriptionEn: 'Sun-like stars gently puff off their outer gas at the end of their lives, forming “planetary nebulae” shaped like butterfly wings, rings and owl faces.',
      tip: '',
      featuredTiles: ['c_butterfly', 'c_southernring', 'c_owl', 'c_helix'],
    },
    tileIds: ['c_butterfly', 'c_southernring', 'c_owl', 'c_helix'],
  },
  // 거대한 별의 대폭발
  {
    chapterTitle: '거대한 별의 대폭발',
    chapterTitleEn: 'Giant Stars That Explode',
    defaultFailureRate: 97,
    briefing: {
      title: '거대한 별의 대폭발',
      titleEn: 'Giant Stars That Explode',
      description: '아주 무거운 별은 마지막에 초신성으로 폭발합니다. 1987년에는 이웃 은하의 초신성이 맨눈으로 보였고, 에타 카리나는 언젠가 폭발할 별로 주목받고 있습니다.',
      descriptionEn: 'Very massive stars end their lives as supernovae. In 1987 one in a neighbouring galaxy was visible to the naked eye, and Eta Carinae is watched as a star that will one day explode.',
      tip: '',
      featuredTiles: ['c_etacarinae', 'c_casa', 'c_sn1987a', 'c_crab'],
    },
    tileIds: ['c_etacarinae', 'c_casa', 'c_sn1987a', 'c_crab'],
  },
  // 블랙홀을 찾아서
  {
    chapterTitle: '블랙홀을 찾아서',
    chapterTitleEn: 'Hunting for Black Holes',
    defaultFailureRate: 97,
    briefing: {
      title: '블랙홀을 찾아서',
      titleEn: 'Hunting for Black Holes',
      description: '블랙홀은 보이지 않지만, 곁의 별에서 가스를 빨아들이거나 은하보다 긴 제트를 뿜으며 자신이 있다는 신호를 보냅니다.',
      descriptionEn: 'Black holes are invisible, but they give themselves away by pulling gas from a nearby star or shooting jets longer than a whole galaxy.',
      tip: '',
      featuredTiles: ['c_cygx1', 'c_centaurusa', 'c_blackhole'],
    },
    tileIds: ['c_cygx1', 'c_centaurusa', 'c_blackhole'],
  },
  // 우리 은하의 작은 이웃
  {
    chapterTitle: '우리 은하의 작은 이웃',
    chapterTitleEn: 'Our Galaxy’s Little Neighbours',
    defaultFailureRate: 97,
    briefing: {
      title: '우리 은하의 작은 이웃',
      titleEn: 'Our Galaxy’s Little Neighbours',
      description: '남반구 밤하늘에는 두 개의 마젤란 은하가 구름처럼 떠 있습니다. 대마젤란 은하의 타란툴라 성운은 이웃 은하들 가운데 별이 가장 활발히 태어나는 곳입니다.',
      descriptionEn: 'Two Magellanic Clouds float like clouds in the southern sky. The Tarantula Nebula in the larger one is the busiest star nursery among our neighbour galaxies.',
      tip: '',
      featuredTiles: ['c_smc', 'c_tarantula', 'c_lmc'],
    },
    tileIds: ['c_smc', 'c_tarantula', 'c_lmc'],
  },
  // 모양이 특별한 은하들
  {
    chapterTitle: '모양이 특별한 은하들',
    chapterTitleEn: 'Galaxies with Unusual Shapes',
    defaultFailureRate: 97,
    briefing: {
      title: '모양이 특별한 은하들',
      titleEn: 'Galaxies with Unusual Shapes',
      description: '은하는 바람개비처럼 펼쳐지기도 하고, 시가처럼 옆으로 보이기도 하며, 서로 부딪혀 더듬이를 뻗거나 먼지 띠로 멍든 눈처럼 보이기도 합니다.',
      descriptionEn: 'Galaxies may spread like pinwheels, look like cigars seen edge-on, crash together and sprout antennae, or wear a dust lane like a black eye.',
      tip: '',
      featuredTiles: ['c_m101', 'c_m82', 'c_antennae', 'c_m64'],
    },
    tileIds: ['c_m101', 'c_m82', 'c_antennae', 'c_m64'],
  },
  // 별들의 무리, 성단
  {
    chapterTitle: '별들의 무리, 성단',
    chapterTitleEn: 'Star Clusters',
    defaultFailureRate: 97,
    briefing: {
      title: '별들의 무리, 성단',
      titleEn: 'Star Clusters',
      description: '별은 혼자가 아니라 무리 지어 태어납니다. 젊은 별이 느슨하게 모인 산개 성단과 오래된 별 수십만 개가 공처럼 뭉친 구상 성단을 만나 보세요.',
      descriptionEn: 'Stars are born in groups. Meet loose open clusters of young stars and globular clusters, balls of hundreds of thousands of ancient stars.',
      tip: '',
      featuredTiles: ['c_hyades', 'c_omegacen', 'c_m13', 'c_jewelbox'],
    },
    tileIds: ['c_hyades', 'c_omegacen', 'c_m13', 'c_jewelbox'],
  },
  // 행성으로 떠난 긴 여행
  {
    chapterTitle: '행성으로 떠난 긴 여행',
    chapterTitleEn: 'Long Voyages to the Planets',
    defaultFailureRate: 97,
    briefing: {
      title: '행성으로 떠난 긴 여행',
      titleEn: 'Long Voyages to the Planets',
      description: '보이저 2호는 네 거대 행성을 모두 찾아갔고, 카시니호는 13년 동안 토성을 지켰으며, 파커 탐사선은 태양의 대기 속으로 뛰어들었습니다.',
      descriptionEn: 'Voyager 2 visited all four giant planets, Cassini watched over Saturn for 13 years, and the Parker probe dived into the Sun’s atmosphere.',
      tip: '',
      featuredTiles: ['c_voyager2', 'c_cassini', 'c_parker'],
    },
    tileIds: ['c_voyager2', 'c_cassini', 'c_parker'],
  },
  // 화성 탐사대
  {
    chapterTitle: '화성 탐사대',
    chapterTitleEn: 'The Mars Explorers',
    defaultFailureRate: 97,
    briefing: {
      title: '화성 탐사대',
      titleEn: 'The Mars Explorers',
      description: '화성에서는 로버 큐리오시티와 퍼서비어런스가 옛 호수와 강의 흔적을 찾고 있고, 작은 헬리콥터 인저뉴어티는 다른 행성의 하늘을 처음으로 날았습니다.',
      descriptionEn: 'On Mars the rovers Curiosity and Perseverance search for traces of ancient lakes and rivers, and the little helicopter Ingenuity made the first flight in another planet’s sky.',
      tip: '',
      featuredTiles: ['c_curiosity', 'c_perseverance', 'c_ingenuity', 'c_mars'],
    },
    tileIds: ['c_curiosity', 'c_perseverance', 'c_ingenuity', 'c_mars'],
  },
  // 우주 시대를 연 순간
  {
    chapterTitle: '우주 시대를 연 순간',
    chapterTitleEn: 'Moments That Opened the Space Age',
    defaultFailureRate: 97,
    briefing: {
      title: '우주 시대를 연 순간',
      titleEn: 'Moments That Opened the Space Age',
      description: '1957년 스푸트니크 1호가 첫 인공위성으로 지구를 돌았고, 12년 뒤 아폴로 11호의 두 우주비행사가 달에 첫발을 내디뎠습니다.',
      descriptionEn: 'In 1957 Sputnik 1 became the first satellite to circle Earth, and twelve years later two Apollo 11 astronauts took the first steps on the Moon.',
      tip: '',
      featuredTiles: ['c_sputnik', 'c_apollo11', 'c_moon'],
    },
    tileIds: ['c_sputnik', 'c_apollo11', 'c_moon'],
  },  // 지구 하늘의 빛 쇼
  {
    chapterTitle: '지구 하늘의 빛 쇼',
    chapterTitleEn: 'Light Shows in Earth’s Sky',
    defaultFailureRate: 97,
    briefing: {
      title: '지구 하늘의 빛 쇼',
      titleEn: 'Light Shows in Earth’s Sky',
      description: '극지방의 밤하늘에는 초록빛 오로라 커튼이 춤추고, 달이 태양을 완전히 가리는 순간에는 낮이 밤처럼 어두워지며 하얀 코로나가 드러납니다.',
      descriptionEn: 'Green curtains of aurora dance over the poles, and when the Moon fully covers the Sun, day turns to night and the white corona appears.',
      tip: '',
      featuredTiles: ['c_aurora', 'c_eclipse', 'c_sun', 'c_moon'],
    },
    tileIds: ['c_aurora', 'c_eclipse', 'c_sun', 'c_moon'],
  },
  // 처음 우주로 간 사람
  {
    chapterTitle: '처음 우주로 간 사람',
    chapterTitleEn: 'The First Human in Space',
    defaultFailureRate: 97,
    briefing: {
      title: '처음 우주로 간 사람',
      titleEn: 'The First Human in Space',
      description: '1961년 유리 가가린은 보스토크 1호를 타고 108분 동안 지구를 한 바퀴 돌았습니다. 지금은 우주정거장에서 사람들이 일 년 내내 살고 있습니다.',
      descriptionEn: 'In 1961 Yuri Gagarin circled the Earth for 108 minutes aboard Vostok 1. Today people live aboard a space station all year round.',
      tip: '',
      featuredTiles: ['c_vostok', 'c_sputnik', 'c_iss', 'c_earth'],
    },
    tileIds: ['c_vostok', 'c_sputnik', 'c_iss', 'c_earth'],
  },
  // 화성의 거대한 화산
  {
    chapterTitle: '화성의 거대한 화산',
    chapterTitleEn: 'The Giant Volcano of Mars',
    defaultFailureRate: 97,
    briefing: {
      title: '화성의 거대한 화산',
      titleEn: 'The Giant Volcano of Mars',
      description: '화성에는 에베레스트산보다 두 배 넘게 높은 올림푸스 산이 솟아 있습니다. 붉은 땅 위에서는 로버들이 오늘도 바퀴 자국을 남기고 있습니다.',
      descriptionEn: 'Olympus Mons, more than twice as tall as Everest, rises on Mars, where rovers are still leaving wheel tracks in the red soil.',
      tip: '',
      featuredTiles: ['c_olympus', 'c_mars', 'c_curiosity'],
    },
    tileIds: ['c_olympus', 'c_mars', 'c_curiosity'],
  },
  // 소행성에 다녀온 탐사선
  {
    chapterTitle: '소행성에 다녀온 탐사선',
    chapterTitleEn: 'Probes That Visited Asteroids',
    defaultFailureRate: 97,
    briefing: {
      title: '소행성에 다녀온 탐사선',
      titleEn: 'Probes That Visited Asteroids',
      description: '하야부사2와 오시리스-렉스는 소행성의 돌을 지구로 가져왔고, 다트는 소행성 디모르포스에 부딪혀 그 길을 바꾸는 데 성공했습니다.',
      descriptionEn: 'Hayabusa2 and OSIRIS-REx brought asteroid rocks back to Earth, and DART crashed into Dimorphos and successfully changed its path.',
      tip: '',
      featuredTiles: ['c_hayabusa2', 'c_osirisrex', 'c_dart', 'c_didymos'],
    },
    tileIds: ['c_hayabusa2', 'c_osirisrex', 'c_dart', 'c_didymos'],
  },
  // 목성을 찾아간 탐사선
  {
    chapterTitle: '목성을 찾아간 탐사선',
    chapterTitleEn: 'Probes That Visited Jupiter',
    defaultFailureRate: 97,
    briefing: {
      title: '목성을 찾아간 탐사선',
      titleEn: 'Probes That Visited Jupiter',
      description: '파이어니어 10호가 처음 목성을 가까이서 찍었고, 갈릴레오호가 처음 목성 궤도를 돌았으며, 주노는 지금 목성의 극지방 위를 날며 거대한 오로라를 지켜보고 있습니다.',
      descriptionEn: 'Pioneer 10 took the first close-up of Jupiter, Galileo was first to orbit it, and Juno now flies over its poles watching giant auroras.',
      tip: '',
      featuredTiles: ['c_pioneer10', 'c_galileo', 'c_juno', 'c_jupiteraurora'],
    },
    tileIds: ['c_pioneer10', 'c_galileo', 'c_juno', 'c_jupiteraurora'],
  },
  // 얼음 바다와 트로이 소행성을 향해
  {
    chapterTitle: '얼음 바다와 트로이 소행성을 향해',
    chapterTitleEn: 'Toward Icy Oceans and Trojan Asteroids',
    defaultFailureRate: 97,
    briefing: {
      title: '얼음 바다와 트로이 소행성을 향해',
      titleEn: 'Toward Icy Oceans and Trojan Asteroids',
      description: '유로파 클리퍼는 얼음 밑 바다가 있는 유로파로, 루시는 목성 궤도의 트로이 소행성들로 긴 여행을 떠났습니다.',
      descriptionEn: 'Europa Clipper is on its way to Europa and its hidden ocean, and Lucy to the Trojan asteroids that share Jupiter’s orbit.',
      tip: '',
      featuredTiles: ['c_clipper', 'c_lucy', 'c_europa'],
    },
    tileIds: ['c_clipper', 'c_lucy', 'c_europa'],
  },
  // 토성 고리의 비밀
  {
    chapterTitle: '토성 고리의 비밀',
    chapterTitleEn: 'Secrets of Saturn’s Rings',
    defaultFailureRate: 97,
    briefing: {
      title: '토성 고리의 비밀',
      titleEn: 'Secrets of Saturn’s Rings',
      description: '토성의 고리는 대부분 얼음 조각입니다. 양치기 위성 프로메테우스와 판도라는 가느다란 고리를 붙잡고, 작은 다프니스는 고리에 물결을 만듭니다.',
      descriptionEn: 'Saturn’s rings are mostly ice. Shepherd moons Prometheus and Pandora hold a thin ring in place, while tiny Daphnis makes waves.',
      tip: '',
      featuredTiles: ['c_saturnrings', 'c_prometheus', 'c_pandora', 'c_daphnis'],
    },
    tileIds: ['c_saturnrings', 'c_prometheus', 'c_pandora', 'c_daphnis'],
  },
  // 토성의 신기한 날씨
  {
    chapterTitle: '토성의 신기한 날씨',
    chapterTitleEn: 'Saturn’s Strange Weather',
    defaultFailureRate: 97,
    briefing: {
      title: '토성의 신기한 날씨',
      titleEn: 'Saturn’s Strange Weather',
      description: '토성 북극에는 육각형 모양의 바람이 불고, 위성 야누스와 에피메테우스는 4년마다 서로 자리를 바꿉니다.',
      descriptionEn: 'A six-sided wind blows around Saturn’s north pole, and the moons Janus and Epimetheus swap places every four years.',
      tip: '',
      featuredTiles: ['c_hexagon', 'c_janus', 'c_saturn'],
    },
    tileIds: ['c_hexagon', 'c_janus', 'c_saturn'],
  },
  // 타이탄에 내려앉다
  {
    chapterTitle: '타이탄에 내려앉다',
    chapterTitleEn: 'Landing on Titan',
    defaultFailureRate: 97,
    briefing: {
      title: '타이탄에 내려앉다',
      titleEn: 'Landing on Titan',
      description: '하위헌스는 낙하산을 펴고 타이탄의 짙은 주황빛 대기를 뚫고 내려갔습니다. 타이탄의 북극에는 물이 아닌 메탄으로 된 바다 크라켄이 있습니다.',
      descriptionEn: 'Huygens parachuted through Titan’s thick orange air. Near Titan’s north pole lies Kraken Mare, a sea made of methane, not water.',
      tip: '',
      featuredTiles: ['c_huygens', 'c_kraken', 'c_titan', 'c_cassini'],
    },
    tileIds: ['c_huygens', 'c_kraken', 'c_titan', 'c_cassini'],
  },
  // 푸른 얼음 거인의 비밀
  {
    chapterTitle: '푸른 얼음 거인의 비밀',
    chapterTitleEn: 'Secrets of the Blue Ice Giants',
    defaultFailureRate: 97,
    briefing: {
      title: '푸른 얼음 거인의 비밀',
      titleEn: 'Secrets of the Blue Ice Giants',
      description: '옆으로 누운 천왕성에는 가느다란 고리 13개가 있고, 해왕성에는 지구만 한 검은 폭풍이 나타났다가 사라졌습니다.',
      descriptionEn: 'Sideways Uranus has 13 thin rings, and on Neptune an Earth-sized dark storm appeared and then vanished.',
      tip: '',
      featuredTiles: ['c_uranusrings', 'c_darkspot', 'c_uranus', 'c_neptune'],
    },
    tileIds: ['c_uranusrings', 'c_darkspot', 'c_uranus', 'c_neptune'],
  },
  // 명왕성의 푸른 하늘
  {
    chapterTitle: '명왕성의 푸른 하늘',
    chapterTitleEn: 'Pluto’s Blue Sky',
    defaultFailureRate: 97,
    briefing: {
      title: '명왕성의 푸른 하늘',
      titleEn: 'Pluto’s Blue Sky',
      description: '뉴호라이즌스가 뒤돌아 찍은 명왕성은 푸른 안개에 싸여 있었습니다. 곁에는 작은 위성 닉스와 히드라가 돌고, 더 멀리에는 길쭉한 바루나가 있습니다.',
      descriptionEn: 'Looking back, New Horizons saw Pluto wrapped in blue haze, with little moons Nix and Hydra nearby and egg-shaped Varuna farther out.',
      tip: '',
      featuredTiles: ['c_plutohaze', 'c_nix', 'c_hydra', 'c_varuna'],
    },
    tileIds: ['c_plutohaze', 'c_nix', 'c_hydra', 'c_varuna'],
  },
  // 태양계의 가장 바깥
  {
    chapterTitle: '태양계의 가장 바깥',
    chapterTitleEn: 'The Outermost Solar System',
    defaultFailureRate: 97,
    briefing: {
      title: '태양계의 가장 바깥',
      titleEn: 'The Outermost Solar System',
      description: '태양에서 불어오는 바람은 태양권계면에서 멈추고, 그보다 훨씬 먼 곳에는 혜성들의 고향인 오르트 구름이 태양계를 감싸고 있다고 여겨집니다.',
      descriptionEn: 'The Sun’s wind stops at the heliopause, and far beyond, the Oort Cloud — home of comets — is thought to wrap the Solar System.',
      tip: '',
      featuredTiles: ['c_heliopause', 'c_oort', 'c_voyager1'],
    },
    tileIds: ['c_heliopause', 'c_oort', 'c_voyager1'],
  },
  // 보이저가 남긴 선물
  {
    chapterTitle: '보이저가 남긴 선물',
    chapterTitleEn: 'Voyager’s Gifts',
    defaultFailureRate: 97,
    briefing: {
      title: '보이저가 남긴 선물',
      titleEn: 'Voyager’s Gifts',
      description: '보이저 1호는 60억 km 밖에서 뒤돌아 창백한 푸른 점이 된 지구를 찍었습니다. 보이저호에는 한국어 인사가 담긴 골든 레코드도 실려 있습니다.',
      descriptionEn: 'From 6 billion km away Voyager 1 turned and photographed Earth as a pale blue dot. It also carries a Golden Record that includes a Korean greeting.',
      tip: '',
      featuredTiles: ['c_palebluedot', 'c_goldenrecord', 'c_voyager2'],
    },
    tileIds: ['c_palebluedot', 'c_goldenrecord', 'c_voyager2'],
  },
  // 태양의 가장 가까운 이웃
  {
    chapterTitle: '태양의 가장 가까운 이웃',
    chapterTitleEn: 'The Sun’s Nearest Neighbours',
    defaultFailureRate: 97,
    briefing: {
      title: '태양의 가장 가까운 이웃',
      titleEn: 'The Sun’s Nearest Neighbours',
      description: '알파 센타우리는 태양에서 가장 가까운 별 무리이고, 바너드 별은 하늘에서 가장 빨리 움직입니다. 시리우스 곁에는 지구만 한 하얀 별이 숨어 있습니다.',
      descriptionEn: 'Alpha Centauri is the Sun’s nearest star system, Barnard’s Star moves fastest across the sky, and a tiny white star hides beside Sirius.',
      tip: '',
      featuredTiles: ['c_alphacen', 'c_barnard', 'c_siriusb', 'c_epseridani'],
    },
    tileIds: ['c_alphacen', 'c_barnard', 'c_siriusb', 'c_epseridani'],
  },
  // 별자리 길잡이
  {
    chapterTitle: '별자리 길잡이',
    chapterTitleEn: 'Star Pattern Guides',
    defaultFailureRate: 97,
    briefing: {
      title: '별자리 길잡이',
      titleEn: 'Star Pattern Guides',
      description: '북두칠성의 국자 끝을 따라가면 북극성이 보이고, 남반구에서는 남십자성이 남쪽을 알려 줍니다. 오리온의 허리띠에는 푸른 별 셋이 나란히 빛납니다.',
      descriptionEn: 'Follow the Big Dipper’s pointer stars to Polaris; in the south, the Southern Cross shows the way. Three blue stars shine in Orion’s Belt.',
      tip: '',
      featuredTiles: ['c_bigdipper', 'c_mizar', 'c_orionbelt', 'c_crux', 'c_albireo'],
    },
    tileIds: ['c_bigdipper', 'c_mizar', 'c_orionbelt', 'c_crux', 'c_albireo'],
  },
  // 케플러가 찾은 행성들
  {
    chapterTitle: '케플러가 찾은 행성들',
    chapterTitleEn: 'Worlds Found by Kepler',
    defaultFailureRate: 97,
    briefing: {
      title: '케플러가 찾은 행성들',
      titleEn: 'Worlds Found by Kepler',
      description: '케플러 우주망원경은 별빛이 살짝 어두워지는 순간을 찾아 수천 개의 행성을 발견했습니다. 그중에는 해가 두 개 뜨는 행성도 있습니다.',
      descriptionEn: 'The Kepler space telescope found thousands of planets by spotting stars dim ever so slightly — including one with two suns.',
      tip: '',
      featuredTiles: ['c_kepler186f', 'c_kepler452b', 'c_kepler16b'],
    },
    tileIds: ['c_kepler186f', 'c_kepler452b', 'c_kepler16b'],
  },
  // 불타는 외계 행성
  {
    chapterTitle: '불타는 외계 행성',
    chapterTitleEn: 'Scorching Alien Worlds',
    defaultFailureRate: 97,
    briefing: {
      title: '불타는 외계 행성',
      titleEn: 'Scorching Alien Worlds',
      description: '어떤 외계 행성은 별에 너무 가까워 용암처럼 뜨겁습니다. WASP-76b에서는 철로 된 비가 내릴 수 있다고 여겨집니다.',
      descriptionEn: 'Some exoplanets hug their stars so closely they are lava-hot — and on WASP-76b, iron may even fall as rain.',
      tip: '',
      featuredTiles: ['c_55cnce', 'c_wasp76b', 'c_hd189733b'],
    },
    tileIds: ['c_55cnce', 'c_wasp76b', 'c_hd189733b'],
  },
  // 우주의 가장 깊은 곳
  {
    chapterTitle: '우주의 가장 깊은 곳',
    chapterTitleEn: 'The Deepest Universe',
    defaultFailureRate: 97,
    briefing: {
      title: '우주의 가장 깊은 곳',
      titleEn: 'The Deepest Universe',
      description: '허블은 작은 하늘 조각에서 1만 개의 은하를 찾았고, 우주 배경 복사는 우주가 아기였을 때의 빛입니다. 무거운 은하는 빛을 휘어 고리를 만듭니다.',
      descriptionEn: 'Hubble found 10,000 galaxies in a tiny patch of sky, the cosmic background glow is light from the baby universe, and heavy galaxies bend light into rings.',
      tip: '',
      featuredTiles: ['c_hudf', 'c_cmb', 'c_einsteinring', 'c_stephan'],
    },
    tileIds: ['c_hudf', 'c_cmb', 'c_einsteinring', 'c_stephan'],
  },
];

/**
 * Procedural Endless Level Generator (Supports Level 1 to 500+)
 * Every level features completely different celestial bodies, unique science briefings,
 * and mixed labeled/unlabeled tiles!
 */
const zoneChapterCache: Record<number, ChapterPreset[]> = {};
function chaptersOfZone(zone: number): ChapterPreset[] {
  if (!zoneChapterCache[zone]) {
    const list = CHAPTER_PRESETS.filter(c => zoneOfChapter(c.tileIds) === zone);
    zoneChapterCache[zone] = list.length > 0 ? list : CHAPTER_PRESETS;
  }
  return zoneChapterCache[zone];
}

export function generateLevel(levelNum: number, currentThemeId?: ThemeId): {
  tiles: BoardTile[];
  config: LevelConfig;
  themeId: ThemeId;
} {
  // 거리 구간: 지구에서 가까운 천체 → 먼 천체 순으로 여행 (300레벨 한 바퀴, 301레벨부터 두 번째 여행)
  const zoneInfo = zoneForLevel(levelNum);
  const zoneChapters = chaptersOfZone(zoneInfo.zone.zone);
  // 구간의 첫 레벨은 늘 그 구간의 첫 챕터, 두 번째 여행부터는 챕터 순서를 조금씩 바꾼다
  const chapterOffset = zoneInfo.posInZone === 0 ? 0 : zoneInfo.posInZone + (zoneInfo.lap - 1) * 5;
  const chapter = zoneChapters[chapterOffset % zoneChapters.length];

  const chapterTitle = chapter.chapterTitle;
  const failRate =
    levelNum <= 12
      ? chapter.defaultFailureRate
      : Math.min(97, 60 + Math.floor(Math.sqrt(levelNum) * 2.5));
  const failureRateText = `${failRate}% 플레이어가 실패했습니다. 이겨 보세요!`;

  const briefing = chapter.briefing;

  // Layout patterns cycle
  const patterns: LevelConfig['layoutPattern'][] = [
    'cross',
    'butterfly',
    'flower',
    'pyramid',
    'twin_towers',
    'star',
    'diamond',
    'galaxy',
  ];

  // User Requirement 9:
  // "그리고 한 레벨에 가지수가 4개면 너무 작은거 같아, 적어도 7개 이상은 되어야 할것 같아, 그래야 지겹지 않아"
  let uniqueTypesCount: number;
  if (levelNum === 1) {
    uniqueTypesCount = 2; // 수성 & 금성 (튜토리얼)
  } else if (levelNum === 2) {
    uniqueTypesCount = 3; // 지구, 달, ISS (튜토리얼)
  } else if (levelNum === 3) {
    uniqueTypesCount = 4; // 화성, 포보스, 데이모스, 세레스
  } else if (levelNum === 4) {
    uniqueTypesCount = 5; // 세레스, 베스타, 팔라스, 베누, 화성
  } else if (levelNum === 5) {
    uniqueTypesCount = 6; // 목성, 이오, 유로파, 가니메데, 세레스, 달
  } else {
    // 6단계부터는 항상 적어도 7개 이상의 천체 등장! (7~9종류)
    // 6~9: 7종, 10~19: 8~9종, 20~39: 9~10종, 40+: 10~11종
    // 종류가 많아야 "같은 천체는 한 번에 1~2개만 보이기" 규칙을 지킬 수 있다
    const base = levelNum < 10 ? 8 : levelNum < 20 ? 10 : levelNum < 40 ? 13 : 15;
    uniqueTypesCount = base + (levelNum % 2) + extraTypesForLevel(levelNum);
  }

  const layoutPattern: LevelConfig['layoutPattern'] =
    levelNum <= 2 ? 'tutorial_grid' : patterns[(levelNum - 1) % patterns.length];

  const themeId = currentThemeId || 'cosmic';
  const theme = GAME_THEMES[themeId] || GAME_THEMES.cosmic;

  // SELECT THE DEDICATED DISTINCT CELESTIAL BODIES FOR THIS SPECIFIC LEVEL!
  // Always include the chapter's primary celestial bodies, and supplement with related catalog bodies
  const chapterTiles = chapter.tileIds
    .map(id => theme.tiles.find(t => t.id === id))
    .filter((t): t is TileThemeItem => Boolean(t));

  // 판을 먼저 만들고, 처음 보이는 타일 수에 맞춰 천체 종류 수를 정한다
  // (같은 천체가 한 번에 보이는 개수를 제한하려면 종류가 충분해야 함)
  const baseTypesCount = uniqueTypesCount;
  let slots: SlotPos[] = [];
  let tripletCount = 0;
  let obstacles: Set<number> = new Set();
  const prepareLayout = (variant: number) => {
    slots = generateLayoutSlots(levelNum, variant);
    obstacles = pickObstacles(slots, levelNum);
    // 사라지는 외계인 칸은 천체가 아니므로 3개 묶음 수에서 뺀다 (장애물은 3의 배수 개)
    tripletCount = (slots.length - obstacles.size) / 3;
    uniqueTypesCount = baseTypesCount;
    if (levelNum > 2) {
      const cap = getDifficulty(levelNum).maxVisible;
      uniqueTypesCount = Math.max(uniqueTypesCount, Math.ceil(countSeen(slots) / cap) + 2);
    }
    uniqueTypesCount = Math.min(uniqueTypesCount, tripletCount);
  };
  prepareLayout(0);

  // 챕터 천체 + 같은 구간의 천체로 채운다 (모자라면 바로 앞 구간 → 그래도 모자라면 전체)
  const zoneNum = zoneInfo.zone.zone;
  const zonePool = theme.tiles.filter(t => zoneOfTile(t.id) === zoneNum);
  const prevPool = theme.tiles.filter(t => zoneOfTile(t.id) === zoneNum - 1);
  const pickTiles = (count: number) => {
    const list: TileThemeItem[] = [...chapterTiles];
    const fillFrom = (pool: TileThemeItem[], start: number) => {
      for (let k = 0; k < pool.length && list.length < count; k++) {
        const candidate = pool[(start + k) % pool.length];
        if (!list.some(t => t.id === candidate.id)) list.push(candidate);
      }
    };
    fillFrom(zonePool, levelNum * 7);
    fillFrom(prevPool, levelNum * 5);
    fillFrom(theme.tiles, levelNum * 3);
    return list;
  };
  // 천체별 3개 묶음 개수: 모든 천체가 최소 1묶음, 나머지는 고르게 배분
  const makeQuota = (list: TileThemeItem[]) => {
    const quota = new Map<string, number>();
    for (let t = 0; t < tripletCount; t++) {
      const id = list[t % list.length].id;
      quota.set(id, (quota.get(id) || 0) + 1);
    }
    return quota;
  };

  let availableTiles = pickTiles(uniqueTypesCount);
  let tileTypeIds: string[] | null = null;
  if (levelNum <= 2) {
    tileTypeIds = slots
      .map((_, i) => availableTiles[Math.floor(i / 3) % availableTiles.length].id)
      .sort(() => Math.random() - 0.5);
  } else {
    // 규칙(같은 천체 동시 노출 제한)을 못 지키면: 천체 종류를 늘려보고, 그래도 안 되면 같은 모양으로 판을 다시 짠다
    const difficulty = getDifficulty(levelNum);
    for (let variant = 0; variant < 4 && !tileTypeIds; variant++) {
      if (variant > 0) prepareLayout(variant);
      for (let extra = 0; extra <= 8 && !tileTypeIds; extra += 4) {
        availableTiles = pickTiles(Math.min(uniqueTypesCount + extra, tripletCount));
        tileTypeIds = assignSolvableTypes(slots, makeQuota(availableTiles), difficulty, Math.random, true, 35, [], obstacles);
      }
    }
    if (!tileTypeIds) {
      tileTypeIds = assignSolvableTypes(slots, makeQuota(availableTiles), difficulty, Math.random, false, 60, [], obstacles)!;
    }
  }
  const totalTiles = slots.length;

  const rawTiles: BoardTile[] = slots.map((slot, index) => ({
    id: `tile-${levelNum}-${index}-${Date.now() % 10000}`,
    typeId: tileTypeIds[index],
    layer: slot.layer,
    x: slot.x,
    y: slot.y,
    isCovered: false,
    isCollected: false,
  }));

  const tilesWithOcclusion = assignAliens(recalculateOcclusion(rawTiles), levelNum);

  const levelBriefing = {
    ...briefing,
    featuredTiles: availableTiles.slice(0, 6).map(t => t.id),
  };

  const config: LevelConfig = {
    levelNumber: levelNum,
    name: `레벨 ${levelNum}`,
    nameEn: `Level ${levelNum}`,
    chapterTitle,
    chapterTitleEn: chapter.chapterTitleEn || chapterTitle,
    themeId,
    failureRateText,
    failureRateTextEn: `${failRate}% of players failed this level. Beat the odds!`,
    briefing: levelBriefing,
    zone: {
      zone: zoneInfo.zone.zone,
      lap: zoneInfo.lap,
      nameKo: zoneInfo.zone.nameKo,
      nameEn: zoneInfo.zone.nameEn,
      distanceKo: zoneInfo.zone.distanceKo,
      distanceEn: zoneInfo.zone.distanceEn,
      isFirstLevel: zoneInfo.posInZone === 0,
    },
    uniqueTypesCount,
    totalTriplets: tripletCount,
    layoutPattern,
    maxLayers: Math.max(...slots.map(sl => sl.layer)) + 1,
  };

  return {
    tiles: tilesWithOcclusion,
    config,
    themeId,
  };
}

/**
 * Roadmap Rewards Generator (Level 1 to 500+)
 */
export function getRoadmapRewardForLevel(lvl: number): RoadmapReward {
  const cycle = (lvl - 1) % 8;
  switch (cycle) {
    case 0:
      return { level: lvl, rewardType: 'undo', amount: 1, label: '되돌리기 x1' };
    case 1:
      return { level: lvl, rewardType: 'wand', amount: 1, label: '타일 제거 x1' };
    case 2:
      return { level: lvl, rewardType: 'shuffle', amount: 1, label: '타일 섞기 x1' };
    case 3:
      return { level: lvl, rewardType: 'coins', amount: 50, label: '황금 코인 x50' };
    case 4:
      return { level: lvl, rewardType: 'coins', amount: 100, label: '황금 코인 x100' };
    case 5:
      return { level: lvl, rewardType: 'undo', amount: 2, label: '되돌리기 x2' };
    case 6:
      return { level: lvl, rewardType: 'wand', amount: 2, label: '타일 제거 x2' };
    default:
      return { level: lvl, rewardType: 'coins', amount: 200, label: '황금 코인 x200' };
  }
}
