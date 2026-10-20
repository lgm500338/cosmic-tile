import { BoardTile, LevelConfig, RoadmapReward, ThemeId, TileThemeItem } from '../types/game';
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
  return { minN: 66, maxN: 96, minF: 12, maxF: 20, W: [6, 7], H: [6, 8], L: [5, 5] };
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
  const shape = levelNum <= 5 ? 'block' : SHAPE_ORDER[(levelNum - 6 + Math.floor(variant / 2)) % SHAPE_ORDER.length];
  const pick = (range: number[]) => range[0] + Math.floor(rand() * (range[1] - range[0] + 1));

  let best: SlotPos[] = [];
  let bestScore = Infinity;
  for (let attempt = 0; attempt < 60; attempt++) {
    const spec: LayoutSpec = {
      W: pick(target.W),
      H: pick(target.H),
      layers: pick(target.L),
      shape,
      // 100레벨까지는 바로 위에 똑같이 쌓는 패턴(3·4번)을 쓰지 않는다 → 아래 타일이 항상 일부라도 보임
      pattern: Math.floor(rand() * (levelNum <= 100 ? 3 : OFFSET_PATTERNS.length)),
    };
    const slots = buildLayout(spec, rand);
    const n = slots.length;
    const f = countSeen(slots);
    const layersUsed = Math.max(...slots.map(s => s.layer)) + 1;
    const score =
      Math.max(0, target.minN - n) * 2 + Math.max(0, n - target.maxN) * 2 +
      Math.max(0, target.minF - f) * 5 + Math.max(0, f - target.maxF) * 5 +
      Math.max(0, target.L[0] - layersUsed) * 10;
    if (score < bestScore) {
      bestScore = score;
      best = slots;
      if (score === 0) break;
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
  const open: Array<{ type: string; count: number }> = initialOpen.map(g => ({ ...g }));
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
    for (const t of frontier) {
      // 사라지는 외계인(장애물): 슬롯을 쓰지 않고 언제든 치울 수 있다
      if (obstacles.has(t)) {
        options.push({ tile: t, kind: 'vanish', type: VANISH_TYPE, overlap: 0, w: 3 });
        continue;
      }
      const f = seenAt[t];
      open.forEach((g, idx) => {
        // 묶음을 완성하지 않는 경우엔 슬롯 여유가 있어야 한다
        if (g.count + 1 < 3 && dockCount + 1 > opt.maxOpen) return;
        const ov = overlapsWith(g.type, f, step);
        // 묶음 완성(join)을 선호: 위를 걷어내고 나온 타일로 짝을 맞추는 흐름
        if (ov <= opt.maxVisible - 1) options.push({ tile: t, kind: 'join', type: g.type, overlap: ov, idx, w: 4 + (step - f) * 0.25 });
      });
      // 새 묶음은 슬롯에 한 칸 여유를 남길 때만 연다 (막다른 길 방지)
      if (dockCount + 2 <= opt.maxOpen) {
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
      open.push({ type: choice.type, count: 1 });
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
  const opt = { ...difficulty, maxOpen: 6, preferSingle: true };
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
  if (levelNum < 50) return 3;
  return 6;
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
  // 51레벨부터: 최대 2개, 1개 위주
  return { maxVisible: 2, maxOpen: 6, attempts: 200, preferSingle: true };
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
      description: '지구는 표면의 70%가 액체 상태의 물로 덮여 있는 유일한 생명의 별이며, 달은 지구 지름의 4분의 1 크기로 조석 현상을 일으켜 지구의 자전축을 23.5도로 안정시킵니다.',
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
      description: '화성은 산화철 성분으로 붉게 빛나며 에베레스트 3배 높이의 올림포스 화산이 있습니다. 곁에는 울퉁불퉁한 감자 모양의 두 소행성 위성 포보스와 데이모스가 돕니다.',
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
      description: '화성과 목성 사이 소행성대에서 가장 거대한 왜소행성 세레스는 지하 얼음 바다를, 베스타는 거대한 남극 분화구를, 베누는 다이아몬드형 주사위 형태를 지녔습니다.',
      descriptionEn: 'Dwarf planet Ceres hides a subterranean ocean, rocky Vesta boasts a 22km south pole crater, and diamond-shaped Bennu holds pristine carbonaceous matter.',
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
      description: '목성은 태양계 최대 가스 행성으로 300년 된 대적점이 소용돌이칩니다. 화산 위성 이오, 지하 얼음 바다 위성 유로파, 수성보다 큰 거대 위성 가니메데가 공전합니다.',
      descriptionEn: 'King of planets Jupiter commands the Great Red Spot storm, orbited by volcanic Io, ocean-harboring Europa, and giant Ganymede which is larger than Mercury.',
      tip: '',
      featuredTiles: ['c_jupiter', 'c_io', 'c_europa', 'c_ganymede'],
    },
    tileIds: ['c_jupiter', 'c_io', 'c_europa', 'c_ganymede'],
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
];

/**
 * Procedural Endless Level Generator (Supports Level 1 to 500+)
 * Every level features completely different celestial bodies, unique science briefings,
 * and mixed labeled/unlabeled tiles!
 */
export function generateLevel(levelNum: number, currentThemeId?: ThemeId): {
  tiles: BoardTile[];
  config: LevelConfig;
  themeId: ThemeId;
} {
  const chapterIdx = (levelNum - 1) % CHAPTER_PRESETS.length;
  const chapter = CHAPTER_PRESETS[chapterIdx];

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
    uniqueTypesCount = base + (levelNum % 2);
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

  const pickTiles = (count: number) => {
    const list: TileThemeItem[] = [...chapterTiles];
    let rotIdx = levelNum * 3;
    while (list.length < count && list.length < theme.tiles.length) {
      const candidate = theme.tiles[rotIdx % theme.tiles.length];
      if (!list.some(t => t.id === candidate.id)) list.push(candidate);
      rotIdx++;
    }
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
