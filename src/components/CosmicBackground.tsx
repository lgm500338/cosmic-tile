import React, { useEffect, useRef } from 'react';
import { ThemeId } from '../types/game';
import { BackgroundManifestEntry } from '../data/backgrounds';

/**
 * 움직이는 우주 배경 (Canvas) — 레벨마다 다른 "우주 영화의 한 장면"
 *
 * 장면 7가지 (레벨마다 돌아가며):
 *  0 은하수        — 비스듬한 은하수 띠, 흐르는 성운
 *  1 나선 은하      — 기울어진 나선 은하가 천천히 회전
 *  2 고리 행성      — 고리 달린 거대 행성이 아래에서 떠오르며 자전
 *  3 블랙홀        — 빛나는 강착 원반이 회전, 중심의 그림자와 광자 고리
 *  4 별 사이 비행   — 별들이 앞으로 다가오는 느린 비행
 *  5 별의 요람      — 아래에서 솟은 성운 기둥, 가장자리가 빛남
 *  6 가스 행성과 달 — 줄무늬 행성이 자전하고 작은 달이 지나감
 *
 * 색감은 레벨마다 바뀌는 팔레트를 쓰고, 장면 위치도 레벨마다 조금씩 달라진다.
 * 타일이 주인공이므로 장면은 화면 위·아래 가장자리에 두고, 보드가 놓이는 가운데는 어둡게 누른다.
 */

interface CosmicBackgroundProps {
  themeId: ThemeId;
  levelNumber?: number;
  /** 지금 배경으로 쓰는 실제 사진 정보 (출처 표시용). 사진이 아니면 null */
  onPhotoInfo?: (info: BackgroundManifestEntry | null) => void;
}

/* 배포 때 만들어진 사진 목록(manifest.json)을 한 번만 불러온다 */
let manifestPromise: Promise<BackgroundManifestEntry[]> | null = null;
function loadManifest(): Promise<BackgroundManifestEntry[]> {
  if (!manifestPromise) {
    manifestPromise = fetch(`${import.meta.env.BASE_URL}backgrounds/manifest.json`)
      .then(r => (r.ok ? r.json() : []))
      .then(list => (Array.isArray(list) ? list : []))
      .catch(() => []);
  }
  return manifestPromise;
}

// 팔레트 [주색, 보조색, 밝은 빛]
const PALETTES: Array<[string, string, string]> = [
  ['#c2410c', '#be185d', '#fcd9a8'], // 주황·장미
  ['#0e7490', '#1d4ed8', '#c7e3ff'], // 청록·파랑
  ['#b91c1c', '#c2410c', '#ffd2b8'], // 붉은색
  ['#7c3aed', '#0e7490', '#e9ddff'], // 보라·청록
  ['#c2410c', '#a16207', '#ffe2b8'], // 주황·크림
  ['#a16207', '#7c3aed', '#fff0c2'], // 금색·라벤더
  ['#0891b2', '#1e40af', '#cdf3ff'], // 하늘·남색
  ['#4f46e5', '#0e7490', '#dbe4ff'], // 얼음빛 보라
  ['#0f766e', '#4338ca', '#d8fff6'], // 청록·남보라
  ['#be185d', '#0e7490', '#ffd6ec'], // 자홍·청록
  ['#1d4ed8', '#b91c1c', '#e0e8ff'], // 파랑·적색
  ['#6d28d9', '#a16207', '#f1e4ff'], // 보라·금색
];

const SCENE_COUNT = 7;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rand: () => number) {
  return (rand() + rand() + rand() + rand() - 2) / 2;
}
function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}
function softBlob(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number) {
  const rg = g.createRadialGradient(x, y, 0, x, y, r);
  rg.addColorStop(0, rgba(color, a));
  rg.addColorStop(1, rgba(color, 0));
  g.fillStyle = rg;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

/* ------------------------------------------------------------------ */
/* 정적인 하늘 바탕 (한 번만 그림)                                       */
/* ------------------------------------------------------------------ */
function paintSky(w: number, h: number, pal: [string, string, string], rand: () => number, bandStrength: number) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d')!;
  const [main, sub, light] = pal;

  const base = g.createLinearGradient(0, 0, w * 0.3, h);
  base.addColorStop(0, '#05060f');
  base.addColorStop(0.5, '#080a1c');
  base.addColorStop(1, '#04050c');
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);

  g.globalCompositeOperation = 'lighter';
  // 넓은 성운 빛
  softBlob(g, w * (0.15 + rand() * 0.3), h * (0.1 + rand() * 0.25), Math.max(w, h) * 0.5, main, 0.16);
  softBlob(g, w * (0.55 + rand() * 0.35), h * (0.6 + rand() * 0.3), Math.max(w, h) * 0.55, sub, 0.14);

  // 은하수 띠
  if (bandStrength > 0) {
    const angle = -0.5 - rand() * 0.5;
    const cx = w * 0.5, cy = h * 0.5;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const nx = -dy, ny = dx;
    const len = Math.hypot(w, h) * 0.75;
    const bw = Math.min(w, h) * 0.22;
    for (let i = 0; i < 240 * bandStrength; i++) {
      const t = (rand() * 2 - 1) * len;
      const off = gauss(rand) * bw * 0.8;
      const x = cx + dx * t + nx * off, y = cy + dy * t + ny * off;
      const centerBoost = 1 - Math.min(1, Math.abs(t / len) * 1.1);
      const color = rand() < 0.55 ? light : rand() < 0.5 ? main : sub;
      softBlob(g, x, y, bw * (0.25 + rand() * 0.6), color, (0.02 + centerBoost * 0.035) * bandStrength);
    }
    for (let i = 0; i < 2400 * bandStrength; i++) {
      const t = (rand() * 2 - 1) * len;
      const off = gauss(rand) * bw * 0.7;
      const s = rand() < 0.97 ? 0.5 + rand() * 0.7 : 1.2 + rand();
      g.fillStyle = `rgba(255,255,255,${0.15 + rand() * 0.45})`;
      g.fillRect(cx + dx * t + nx * off, cy + dy * t + ny * off, s, s);
    }
    // 암흑 먼지대
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 80 * bandStrength; i++) {
      const t = (rand() * 2 - 1) * len * 0.85;
      const off = gauss(rand) * bw * 0.18 + Math.sin(t / 90) * bw * 0.12;
      const x = cx + dx * t + nx * off, y = cy + dy * t + ny * off;
      const r = bw * (0.08 + rand() * 0.18);
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, 'rgba(3,4,10,0.35)');
      rg.addColorStop(1, 'rgba(3,4,10,0)');
      g.fillStyle = rg;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = 'lighter';
  }

  // 흩뿌린 잔별
  for (let i = 0; i < 1000; i++) {
    const s = rand() < 0.95 ? 0.6 + rand() * 0.6 : 1.4;
    g.fillStyle = `rgba(${200 + rand() * 55},${210 + rand() * 45},255,${0.12 + rand() * 0.4})`;
    g.fillRect(rand() * w, rand() * h, s, s);
  }
  g.globalCompositeOperation = 'source-over';
  return c;
}

/** 천천히 떠다니는 성운 구름 한 장 (투명) */
function paintClouds(size: number, pal: [string, string, string], rand: () => number) {
  const c = makeCanvas(size, size);
  const g = c.getContext('2d')!;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const color = i % 3 === 0 ? pal[2] : i % 2 ? pal[0] : pal[1];
    softBlob(g, size * (0.2 + rand() * 0.6), size * (0.2 + rand() * 0.6), size * (0.08 + rand() * 0.2), color, 0.05 + rand() * 0.05);
  }
  return c;
}

/** 빛나는 별 스프라이트 */
function paintStarSprite(size: number) {
  const c = makeCanvas(size, size);
  const g = c.getContext('2d')!;
  const r = size / 2;
  const rg = g.createRadialGradient(r, r, 0, r, r, r);
  rg.addColorStop(0, 'rgba(255,255,255,1)');
  rg.addColorStop(0.15, 'rgba(255,255,255,0.8)');
  rg.addColorStop(0.4, 'rgba(200,220,255,0.18)');
  rg.addColorStop(1, 'rgba(200,220,255,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, size, size);
  // 가는 십자 빛줄기
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.fillRect(r - 0.5, r * 0.15, 1, size * 0.85);
  g.fillRect(r * 0.15, r - 0.5, size * 0.85, 1);
  return c;
}

/* ------------------------------------------------------------------ */
/* 장면별 큰 피사체 스프라이트                                            */
/* ------------------------------------------------------------------ */
function paintSpiralGalaxy(S: number, pal: [string, string, string], rand: () => number) {
  const c = makeCanvas(S, S);
  const g = c.getContext('2d')!;
  const R = S / 2;
  g.globalCompositeOperation = 'lighter';
  softBlob(g, R, R, R * 0.95, pal[1], 0.12);
  softBlob(g, R, R, R * 0.5, pal[0], 0.15);
  const arms = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < 5200; i++) {
    const rr = Math.pow(rand(), 0.7);
    const arm = Math.floor(rand() * arms);
    const ang = rr * Math.PI * 3.2 + (arm * Math.PI * 2) / arms + gauss(rand) * (0.45 - rr * 0.2);
    const x = R + Math.cos(ang) * rr * R * 0.95;
    const y = R + Math.sin(ang) * rr * R * 0.95;
    const color = rr < 0.25 ? pal[2] : rand() < 0.5 ? pal[1] : mix(pal[0], '#ffffff', 0.4);
    if (rand() < 0.08) softBlob(g, x, y, R * (0.03 + rand() * 0.05), color, 0.12);
    g.fillStyle = rgba(color, 0.35 + rand() * 0.5);
    const s = rand() < 0.9 ? 1 : 2;
    g.fillRect(x, y, s, s);
  }
  // 밝은 중심핵
  softBlob(g, R, R, R * 0.22, pal[2], 0.7);
  softBlob(g, R, R, R * 0.08, '#ffffff', 0.9);
  return c;
}

function paintBandStrip(w: number, h: number, pal: [string, string, string], rand: () => number, gas: boolean) {
  // 행성 표면 줄무늬 (가로로 이어지는 텍스처, 폭 w의 주기)
  const c = makeCanvas(w * 2, h);
  const g = c.getContext('2d')!;
  const colors = gas
    ? [mix(pal[0], '#f5e6c8', 0.45), mix(pal[1], '#f5e6c8', 0.5), mix(pal[0], '#3b2a1a', 0.3), '#f1e3c6', mix(pal[1], '#ffffff', 0.25)]
    : [mix(pal[1], '#9fb7d8', 0.4), mix(pal[0], '#d8c7a3', 0.5), mix(pal[1], '#1b2440', 0.35), '#cfd9e8'];
  let y = 0;
  while (y < h) {
    const bh = h * (0.03 + rand() * 0.09);
    g.fillStyle = colors[Math.floor(rand() * colors.length)];
    g.fillRect(0, y, w * 2, bh + 1);
    y += bh;
  }
  // 소용돌이·물결 무늬 (주기적으로 반복되게 두 번 그림)
  for (let i = 0; i < 70; i++) {
    const x = rand() * w, yy = rand() * h, rx = w * (0.02 + rand() * 0.06), ry = h * (0.008 + rand() * 0.02);
    const col = rgba(colors[Math.floor(rand() * colors.length)], 0.5);
    for (const ox of [0, w]) {
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(x + ox, yy, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  if (gas) {
    // 대적점 같은 큰 폭풍
    const x = w * (0.2 + rand() * 0.6), yy = h * (0.55 + rand() * 0.2);
    for (const ox of [0, w]) {
      g.fillStyle = rgba(mix(pal[0], '#7a2e12', 0.4), 0.85);
      g.beginPath();
      g.ellipse(x + ox, yy, w * 0.07, h * 0.045, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  return c;
}

function paintPlanetShade(R: number, pal: [string, string, string]) {
  // 구의 입체감: 빛 받는 면 + 그림자 면 + 가장자리 대기
  const c = makeCanvas(R * 2, R * 2);
  const g = c.getContext('2d')!;
  const lg = g.createRadialGradient(R * 0.55, R * 0.55, R * 0.1, R, R, R * 1.05);
  lg.addColorStop(0, 'rgba(255,255,255,0.18)');
  lg.addColorStop(0.45, 'rgba(0,0,0,0)');
  lg.addColorStop(0.8, 'rgba(0,0,10,0.55)');
  lg.addColorStop(1, 'rgba(0,0,10,0.9)');
  g.fillStyle = lg;
  g.beginPath();
  g.arc(R, R, R, 0, Math.PI * 2);
  g.fill();
  const rim = g.createRadialGradient(R, R, R * 0.86, R, R, R);
  rim.addColorStop(0, rgba(pal[2], 0));
  rim.addColorStop(1, rgba(pal[2], 0.35));
  g.fillStyle = rim;
  g.beginPath();
  g.arc(R, R, R, 0, Math.PI * 2);
  g.fill();
  return c;
}

function paintRings(R: number, pal: [string, string, string], rand: () => number) {
  const W = R * 4.6, H = R * 4.6;
  const c = makeCanvas(W, H);
  const g = c.getContext('2d')!;
  const cx = W / 2, cy = H / 2;
  for (let r = R * 1.25; r < R * 2.25; r += 1.5) {
    const a = 0.08 + rand() * 0.35 * (rand() < 0.15 ? 0.1 : 1);
    g.strokeStyle = rgba(rand() < 0.5 ? mix(pal[2], '#e8dcc0', 0.5) : mix(pal[0], '#e8dcc0', 0.6), a);
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.stroke();
  }
  return c;
}

function paintAccretionDisk(S: number, pal: [string, string, string], rand: () => number) {
  const c = makeCanvas(S, S);
  const g = c.getContext('2d')!;
  const R = S / 2;
  g.globalCompositeOperation = 'lighter';
  softBlob(g, R, R, R, pal[0], 0.18);
  // 안쪽이 가장 뜨겁게 빛나는 원반 (고리 모양 빛)
  const ring = g.createRadialGradient(R, R, R * 0.3, R, R, R);
  ring.addColorStop(0, 'rgba(255,245,225,0)');
  ring.addColorStop(0.04, 'rgba(255,236,200,0.9)');
  ring.addColorStop(0.2, 'rgba(255,190,120,0.55)');
  ring.addColorStop(0.55, rgba(mix(pal[0], '#ff9a3c', 0.5), 0.3));
  ring.addColorStop(1, rgba(pal[0], 0));
  g.fillStyle = ring;
  g.beginPath();
  g.arc(R, R, R, 0, Math.PI * 2);
  g.arc(R, R, R * 0.3, 0, Math.PI * 2, true);
  g.fill();
  const hot = ['#ffffff', '#ffe7c2', '#ffc37a', mix(pal[0], '#ffb35c', 0.5), pal[2]];
  for (let i = 0; i < 900; i++) {
    const rr = R * (0.32 + Math.pow(rand(), 1.8) * 0.66);
    const a0 = rand() * Math.PI * 2;
    const len = 0.2 + rand() * 1.2;
    const col = hot[Math.min(hot.length - 1, Math.floor(((rr / R - 0.32) / 0.66) * hot.length + rand()))];
    g.strokeStyle = rgba(col, 0.09 + rand() * 0.16);
    g.lineWidth = 1 + rand() * 2.5;
    g.beginPath();
    g.arc(R, R, rr, a0, a0 + len);
    g.stroke();
  }
  return c;
}

function paintPillars(w: number, h: number, pal: [string, string, string], rand: () => number) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d')!;
  const count = 3;
  const pillars: Array<{ x: number; top: number; width: number }> = [];
  for (let i = 0; i < count; i++) {
    pillars.push({ x: w * (0.15 + i * 0.33 + (rand() - 0.5) * 0.12), top: h * (0.15 + rand() * 0.45), width: w * (0.07 + rand() * 0.06) });
  }
  // 1) 가장자리 빛 (뒤에서 비추는 별빛)
  g.globalCompositeOperation = 'lighter';
  for (const p of pillars) {
    for (let y = p.top; y < h; y += 6) {
      const k = (y - p.top) / (h - p.top);
      const ww = p.width * (0.55 + k * 1.2);
      const xx = p.x + Math.sin(y / 40 + p.x) * ww * 0.25;
      softBlob(g, xx, y - 6, ww * 0.9, pal[2], 0.06);
      softBlob(g, xx, y, ww * 1.5, pal[0], 0.04);
    }
    softBlob(g, p.x, p.top, p.width * 2, pal[2], 0.5);
  }
  // 2) 어두운 먼지 기둥
  g.globalCompositeOperation = 'source-over';
  for (const p of pillars) {
    for (let y = p.top + 4; y < h + 20; y += 5) {
      const k = (y - p.top) / (h - p.top);
      const ww = p.width * (0.5 + k * 1.15);
      const xx = p.x + Math.sin(y / 40 + p.x) * ww * 0.25 + (rand() - 0.5) * ww * 0.2;
      const rg = g.createRadialGradient(xx, y, 0, xx, y, ww * 0.85);
      rg.addColorStop(0, 'rgba(6,5,14,0.55)');
      rg.addColorStop(1, 'rgba(6,5,14,0)');
      g.fillStyle = rg;
      g.fillRect(xx - ww, y - ww, ww * 2, ww * 2);
    }
  }
  return c;
}

/* ------------------------------------------------------------------ */

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ levelNumber = 1, onPhotoInfo }) => {
  const onPhotoInfoRef = useRef(onPhotoInfo);
  onPhotoInfoRef.current = onPhotoInfo;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const level = Math.max(1, levelNumber);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scene = (level - 1) % SCENE_COUNT;
    const pal = PALETTES[(level * 5 + Math.floor((level - 1) / SCENE_COUNT)) % PALETTES.length];
    // 기기의 "애니메이션 줄이기" 설정이 켜져 있어도 멈추지 않고, 조금 더 느리게만 움직인다
    const prefersReduced =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reduceMotion = false;
    const motionScale = prefersReduced ? 0.6 : 1;

    // 1~100레벨: 실제 우주 사진 (있으면). 사진이 뜨면 코드 배경에서 부드럽게 바뀐다
    let photo: HTMLImageElement | null = null;
    let photoAlpha = 0;
    let cancelled = false;
    onPhotoInfoRef.current?.(null);
    loadManifest().then(list => {
      if (cancelled) return;
      const entry = list.find(e => e.index === level);
      if (!entry) return;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (cancelled) return;
        photo = img;
        onPhotoInfoRef.current?.(entry);
      };
      img.src = `${import.meta.env.BASE_URL}${entry.file}`;
    });

    let W = 0, H = 0, dpr = 1;
    let sky: HTMLCanvasElement, clouds: HTMLCanvasElement, starSprite: HTMLCanvasElement;
    let hero: HTMLCanvasElement | null = null; // 장면의 주인공 스프라이트
    let hero2: HTMLCanvasElement | null = null;
    let hero3: HTMLCanvasElement | null = null;
    let heroX = 0, heroY = 0, heroSize = 0, tilt = 0, flip = 1;
    let twinkles: Array<{ x: number; y: number; s: number; ph: number; sp: number }> = [];
    let flyStars: Array<{ x: number; y: number; z: number }> = [];

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(window.innerWidth * dpr);
      H = Math.round(window.innerHeight * dpr);
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const rand = seeded(level * 977 + 31);
      flip = rand() < 0.5 ? 1 : -1; // 장면을 좌우로 뒤집어 레벨마다 다르게
      const m = Math.min(W, H);
      sky = paintSky(W * 1.2, H * 1.2, pal, rand, scene === 0 ? 1 : scene === 4 ? 0 : 0.35);
      clouds = paintClouds(Math.max(W, H) * 0.9, pal, rand);
      starSprite = paintStarSprite(Math.round(18 * dpr));
      hero = hero2 = hero3 = null;

      switch (scene) {
        case 1: // 나선 은하 — 위쪽 구석
          heroSize = m * (1.25 + rand() * 0.25);
          hero = paintSpiralGalaxy(heroSize, pal, rand);
          heroX = W * (flip > 0 ? 0.78 : 0.22);
          heroY = H * (0.12 + rand() * 0.06);
          tilt = (flip > 0 ? -1 : 1) * (0.35 + rand() * 0.3);
          break;
        case 2: // 고리 행성 — 아래에서 떠오름
          heroSize = m * (0.42 + rand() * 0.1); // 반지름
          hero = paintBandStrip(heroSize * 2, heroSize * 2, pal, rand, true);
          hero2 = paintPlanetShade(heroSize, pal);
          hero3 = paintRings(heroSize, pal, rand);
          heroX = W * (flip > 0 ? 0.18 : 0.82);
          heroY = H * 0.98;
          tilt = (flip > 0 ? -1 : 1) * (0.25 + rand() * 0.15);
          break;
        case 3: // 블랙홀 — 위쪽
          heroSize = m * (1.7 + rand() * 0.2);
          hero = paintAccretionDisk(heroSize, pal, rand);
          heroX = W * (0.5 + flip * 0.08);
          heroY = H * (0.9 + rand() * 0.03);
          tilt = (flip > 0 ? 1 : -1) * (0.12 + rand() * 0.12);
          break;
        case 4: // 별 사이 비행
          flyStars = Array.from({ length: 340 }, () => ({ x: rand() * 2 - 1, y: rand() * 2 - 1, z: rand() }));
          break;
        case 5: // 별의 요람 — 아래쪽 성운 기둥
          hero = paintPillars(W * 1.1, H * 0.62, pal, rand);
          break;
        case 6: // 가스 행성과 달 — 위쪽 구석
          heroSize = m * (0.36 + rand() * 0.08);
          hero = paintBandStrip(heroSize * 2, heroSize * 2, pal, rand, true);
          hero2 = paintPlanetShade(heroSize, pal);
          heroX = W * (flip > 0 ? 0.92 : 0.08);
          heroY = H * (0.1 + rand() * 0.04);
          tilt = (flip > 0 ? 1 : -1) * 0.2;
          break;
        default:
          break;
      }

      twinkles = Array.from({ length: 60 }, () => ({
        x: rand() * W, y: rand() * H, s: (0.5 + rand() * 0.9) * dpr, ph: rand() * Math.PI * 2, sp: 0.5 + rand() * 1.3,
      }));
    };
    build();

    let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShootAt = performance.now() + 5000 + Math.random() * 6000;

    const drawPlanet = (t: number, cx: number, cy: number, R: number, spin: number, withRings: boolean) => {
      if (!hero || !hero2) return;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      // 고리 뒤쪽 절반
      if (withRings && hero3) {
        ctx.save();
        ctx.scale(1, 0.24);
        ctx.beginPath();
        ctx.rect(-hero3.width / 2, -hero3.height / 2, hero3.width, hero3.height / 2);
        ctx.clip();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(hero3, -hero3.width / 2, -hero3.height / 2);
        ctx.restore();
      }
      // 대기 빛
      const glow = ctx.createRadialGradient(0, 0, R * 0.95, 0, 0, R * 1.25);
      glow.addColorStop(0, rgba(pal[2], 0.28));
      glow.addColorStop(1, rgba(pal[2], 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.25, 0, Math.PI * 2);
      ctx.fill();
      // 자전하는 표면
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.clip();
      const period = hero.width / 2;
      const off = (t * spin) % period;
      ctx.drawImage(hero, -R - off, -R);
      ctx.drawImage(hero2, -R, -R);
      ctx.restore();
      // 고리 앞쪽 절반
      if (withRings && hero3) {
        ctx.save();
        ctx.scale(1, 0.24);
        ctx.beginPath();
        ctx.rect(-hero3.width / 2, 0, hero3.width, hero3.height / 2);
        ctx.clip();
        ctx.drawImage(hero3, -hero3.width / 2, -hero3.height / 2);
        ctx.restore();
      }
      ctx.restore();
    };

    let raf = 0;
    let last = 0;
    let prevNow = performance.now();
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (document.hidden) { prevNow = now; return; }
      if (now - last < 33) return; // 약 30fps
      last = now;
      const dt = Math.min(0.1, (now - prevNow) / 1000);
      prevNow = now;
      const t = (now / 1000) * motionScale;
      if (photo && photoAlpha < 1) photoAlpha = Math.min(1, photoAlpha + dt / 1.2);

      if (photoAlpha < 1) {

      // 1) 바탕 하늘: 아주 천천히 흐름
      const mx = sky.width - W, my = sky.height - H;
      ctx.drawImage(sky, -(mx / 2 + Math.sin(t * 0.1) * mx * 0.45), -(my / 2 + Math.cos(t * 0.08) * my * 0.45));

      // 2) 성운 구름: 바탕과 다른 속도로 흘러 깊이감
      ctx.globalCompositeOperation = 'lighter';
      const cs = clouds.width;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(clouds, W * 0.5 - cs / 2 + Math.sin(t * 0.15) * W * 0.14, H * 0.45 - cs / 2 + Math.cos(t * 0.12) * H * 0.07);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // 3) 장면의 주인공
      switch (scene) {
        case 1: {
          if (!hero) break;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(heroX + Math.sin(t * 0.03) * W * 0.02, heroY);
          ctx.rotate(tilt);
          ctx.scale(1, 0.42);
          ctx.rotate(t * 0.035 * flip);
          ctx.globalAlpha = 1;
          ctx.drawImage(hero, -hero.width / 2, -hero.height / 2);
          ctx.restore();
          break;
        }
        case 2: {
          const rise = reduceMotion ? 0 : (Math.sin(t * 0.025) * 0.5 + 0.5) * heroSize * 0.25;
          drawPlanet(t, heroX, heroY - rise, heroSize, 6 * dpr, true);
          break;
        }
        case 3: {
          if (!hero) break;
          const R = hero.width / 2;
          const hx = heroX, hy = heroY;
          // 원반 뒤쪽 (위 절반)
          const disk = (front: boolean) => {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.translate(hx, hy);
            ctx.rotate(tilt);
            ctx.beginPath();
            if (front) ctx.rect(-R, 0, R * 2, R); else ctx.rect(-R, -R, R * 2, R);
            ctx.clip();
            ctx.scale(1, 0.26);
            ctx.rotate(t * 0.12 * flip);
            ctx.drawImage(hero!, -R, -R);
            ctx.drawImage(hero!, -R, -R); // 두 번 겹쳐 더 밝게
            ctx.restore();
          };
          disk(false);
          // 중력 렌즈로 휘어 보이는 원반 (중심 위로 아치)
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(hx, hy);
          ctx.rotate(tilt);
          const arc = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 0.42);
          arc.addColorStop(0, rgba('#ffd9a0', 0));
          arc.addColorStop(0.55, rgba('#ffd9a0', 0.32));
          arc.addColorStop(1, rgba(pal[0], 0));
          ctx.fillStyle = arc;
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.42, Math.PI, 0);
          ctx.fill();
          ctx.restore();
          // 사건의 지평선 그림자 + 광자 고리
          ctx.save();
          ctx.translate(hx, hy);
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = 'rgba(255,230,190,0.75)';
          ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.205, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          disk(true);
          break;
        }
        case 4: {
          // 별 사이를 천천히 날아감
          const cx = W / 2, cy = H * 0.45, f = Math.max(W, H) * 0.5;
          ctx.globalCompositeOperation = 'lighter';
          const speed = reduceMotion ? 0 : 0.06;
          for (const s of flyStars) {
            const pz = s.z;
            s.z -= speed * dt;
            if (s.z <= 0.02) { s.z = 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; continue; }
            const x1 = cx + (s.x / pz) * f, y1 = cy + (s.y / pz) * f;
            const x2 = cx + (s.x / s.z) * f, y2 = cy + (s.y / s.z) * f;
            const b = Math.min(1, (1 - s.z) * 1.6 + 0.35);
            ctx.strokeStyle = `rgba(225,235,255,${b})`;
            ctx.lineWidth = Math.min(2.2, Math.max(0.8, (1 - s.z) * 2.4)) * dpr;
            ctx.beginPath();
            // 빛줄기 길이는 최대 화면의 6%로 제한
            let sx = (x2 - x1) * 5, sy = (y2 - y1) * 5;
            const len = Math.hypot(sx, sy), maxLen = Math.min(W, H) * 0.06;
            if (len > maxLen) { sx *= maxLen / len; sy *= maxLen / len; }
            ctx.moveTo(x2 - sx, y2 - sy);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            // 별 머리 (빛나는 점)
            const hs = (2 + (1 - s.z) * 7) * dpr;
            ctx.globalAlpha = b;
            ctx.drawImage(starSprite, x2 - hs / 2, y2 - hs / 2, hs, hs);
            ctx.globalAlpha = 1;
          }
          ctx.globalCompositeOperation = 'source-over';
          break;
        }
        case 5: {
          if (!hero) break;
          const sway = Math.sin(t * 0.04) * W * 0.02;
          ctx.drawImage(hero, -W * 0.05 + sway, H - hero.height + Math.sin(t * 0.03) * H * 0.01);
          break;
        }
        case 6: {
          drawPlanet(t, heroX + Math.sin(t * 0.02) * W * 0.01, heroY, heroSize, 5 * dpr, false);
          // 작은 달이 행성 앞을 천천히 지나감
          const orbit = t * 0.05;
          const mxp = heroX + Math.cos(orbit) * heroSize * 1.6 * -flip;
          const myp = heroY + Math.sin(orbit) * heroSize * 0.45 + heroSize * 0.3;
          const mr = heroSize * 0.12;
          const mg = ctx.createRadialGradient(mxp - mr * 0.4, myp - mr * 0.4, mr * 0.1, mxp, myp, mr);
          mg.addColorStop(0, '#e7e5e4');
          mg.addColorStop(0.7, '#78716c');
          mg.addColorStop(1, '#1c1917');
          ctx.fillStyle = mg;
          ctx.beginPath();
          ctx.arc(mxp, myp, mr, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        default:
          break;
      }

      } // 코드 배경 끝

      // 실제 사진: 영화 카메라처럼 천천히 다가가며 흐른다 (켄 번스 효과)
      if (photo && photoAlpha > 0) {
        const iw = photo.naturalWidth, ih = photo.naturalHeight;
        const zoom = 1.08 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.12));
        const s0 = Math.max(W / iw, H / ih) * zoom;
        const dw = iw * s0, dh = ih * s0;
        const mxp = (dw - W) / 2, myp = (dh - H) / 2;
        const px = Math.sin(t * 0.09) * mxp * 0.85;
        const py = Math.cos(t * 0.07) * myp * 0.85;
        ctx.globalAlpha = photoAlpha;
        ctx.drawImage(photo, (W - dw) / 2 + px, (H - dh) / 2 + py, dw, dh);
        // 타일이 주인공이 되도록 사진을 살짝 어둡게
        ctx.fillStyle = 'rgba(3,4,12,0.32)';
        ctx.fillRect(0, 0, W, H);
        // 사진 위로 흐르는 옅은 성운 빛
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = photoAlpha * 0.35;
        const cs2 = clouds.width;
        ctx.drawImage(clouds, W * 0.5 - cs2 / 2 + Math.sin(t * 0.15) * W * 0.14, H * 0.45 - cs2 / 2 + Math.cos(t * 0.12) * H * 0.07);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

      // 4) 반짝이는 별
      ctx.globalCompositeOperation = 'lighter';
      for (const s of twinkles) {
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        const size = starSprite.width * (0.35 + s.s * 0.25);
        ctx.globalAlpha = a * 0.85;
        ctx.drawImage(starSprite, s.x - size / 2, s.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      // 5) 가끔 지나가는 별똥별
      if (!reduceMotion) {
        if (!shooting && now > nextShootAt) {
          shooting = {
            x: (0.2 + Math.random() * 0.7) * W, y: Math.random() * 0.3 * H,
            vx: -(6 + Math.random() * 4) * dpr, vy: (2.5 + Math.random() * 2) * dpr, life: 1,
          };
        }
        if (shooting) {
          const s = shooting;
          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 18, s.y - s.vy * 18);
          grad.addColorStop(0, `rgba(255,255,255,${0.85 * s.life})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4 * dpr;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 18, s.y - s.vy * 18);
          ctx.stroke();
          s.x += s.vx; s.y += s.vy; s.life -= 0.025;
          if (s.life <= 0) { shooting = null; nextShootAt = now + 10000 + Math.random() * 12000; }
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      // 6) 타일이 돋보이도록: 보드 자리(가운데)를 어둡게, 가장자리는 비네트
      const v = ctx.createRadialGradient(W / 2, H * 0.53, Math.min(W, H) * 0.12, W / 2, H * 0.53, Math.max(W, H) * 0.72);
      v.addColorStop(0, 'rgba(4,5,12,0.5)');
      v.addColorStop(0.5, 'rgba(4,5,12,0.25)');
      v.addColorStop(1, 'rgba(2,3,8,0.45)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(draw);

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [level]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 bg-[#05060f]">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
};
