/**
 * 배포(빌드) 직전에 실행: 레벨별 우주 사진을 받아 폰 배경용으로 변환한다.
 *
 * - 목록: src/data/backgrounds.ts 의 BACKGROUND_PHOTOS
 * - 결과: public/backgrounds/001.webp ~ 100.webp + manifest.json (출처 문구 포함)
 * - 한 번 받은 사진은 node_modules/.cache/cosmic-bg 에 저장 → Vercel이 다음 배포 때 재사용
 * - 어떤 사진을 못 받아도 빌드는 실패하지 않는다 (그 레벨은 코드로 그린 배경이 나옴)
 *
 * 환경변수
 *   SKIP_BACKGROUNDS=1   사진 받기를 건너뜀
 *   BG_MOCK_ORIGIN=...   (테스트용) 모든 주소를 이 서버로 바꿔서 요청
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIST_FILE = path.join(ROOT, 'src/data/backgrounds.ts');
const OUT_DIR = path.join(ROOT, 'public/backgrounds');
const CACHE_DIR = path.join(ROOT, 'node_modules/.cache/cosmic-bg');
const TARGET_HEIGHT = 1600; // 폰 세로 화면에 충분한 높이
const QUALITY = 70;
const CONCURRENCY = 4;

if (process.env.SKIP_BACKGROUNDS === '1') {
  console.log('[backgrounds] SKIP_BACKGROUNDS=1 → 건너뜀');
  process.exit(0);
}

const SOURCES = {
  hubble: {
    label: 'ESA/Hubble',
    page: id => `https://esahubble.org/images/${id}/`,
    files: id => [
      `https://cdn.esahubble.org/archives/images/wallpaper_mobile_qhd_plus/${id}.jpg`,
      `https://cdn.esahubble.org/archives/images/publicationjpg/${id}.jpg`,
      `https://cdn.esahubble.org/archives/images/screen/${id}.jpg`,
    ],
  },
  webb: {
    label: 'ESA/Webb',
    page: id => `https://esawebb.org/images/${id}/`,
    files: id => [
      `https://cdn.esawebb.org/archives/images/publicationjpg/${id}.jpg`,
      `https://cdn.esawebb.org/archives/images/screen/${id}.jpg`,
    ],
  },
  eso: {
    label: 'ESO',
    page: id => `https://www.eso.org/public/images/${id}/`,
    files: id => [
      `https://cdn.eso.org/images/publicationjpg/${id}.jpg`,
      `https://cdn.eso.org/images/screen/${id}.jpg`,
    ],
  },
};

function mockUrl(url) {
  const mock = process.env.BG_MOCK_ORIGIN;
  if (!mock) return url;
  const u = new URL(url);
  return `${mock}/${u.hostname}${u.pathname}`;
}

async function fetchWithTimeout(url, ms = 45000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(mockUrl(url), {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'CosmicTileGame/1.0 (background prefetch; credits shown in app)' },
    });
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|h\d|li|tr|section)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

/** 원본 페이지에서 제목과 출처 문구(Credit)를 뽑는다 */
async function fetchMeta(sourceKey, id) {
  const src = SOURCES[sourceKey];
  const fallback = { title: id, credit: src.label };
  try {
    const res = await fetchWithTimeout(src.page(id), 30000);
    if (!res.ok) return fallback;
    const html = await res.text();
    let title = id;
    const t = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
    if (t) title = htmlToText(t[1]).split('|')[0].trim() || id;

    let credit = '';
    // 1) <div class="credit"> ... </div>
    const block = html.match(/<div[^>]*class="[^"]*credit[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (block) credit = htmlToText(block[1]).replace(/^Credit:\s*/i, '').trim();
    // 2) 본문 텍스트에서 "Credit:" 다음 줄
    if (!credit) {
      const text = htmlToText(html);
      const m = text.match(/Credit:\s*\n?\s*([^\n]{3,400})/i);
      if (m) credit = m[1].trim();
    }
    credit = credit.replace(/\s+/g, ' ').trim();
    if (!credit || credit.length > 400) credit = src.label;
    return { title, credit };
  } catch {
    return fallback;
  }
}

async function downloadFirst(urls) {
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const type = res.headers.get('content-type') || '';
      if (!type.includes('image')) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 10000) continue;
      return buf;
    } catch {
      /* 다음 주소 시도 */
    }
  }
  return null;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('[backgrounds] sharp 가 없어 사진 변환을 건너뜀 (코드 배경으로 대체)');
    return;
  }

  const listSrc = await fs.readFile(LIST_FILE, 'utf8');
  const entries = [...listSrc.matchAll(/\{\s*source:\s*'(\w+)',\s*id:\s*'([^']+)',\s*ko:\s*'([^']+)'\s*\}/g)].map(
    (m, i) => ({ index: i + 1, source: m[1], id: m[2], ko: m[3] })
  );
  if (entries.length === 0) {
    console.warn('[backgrounds] 목록을 찾지 못함');
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(CACHE_DIR, { recursive: true });

  const manifest = [];
  let ok = 0, cached = 0, failed = 0;
  const queue = [...entries];

  async function worker() {
    while (queue.length) {
      const e = queue.shift();
      const num = String(e.index).padStart(3, '0');
      const src = SOURCES[e.source];
      if (!src) continue;
      const cacheImg = path.join(CACHE_DIR, `${e.source}-${e.id}.webp`);
      const cacheMeta = path.join(CACHE_DIR, `${e.source}-${e.id}.json`);
      const outFile = path.join(OUT_DIR, `${num}.webp`);
      try {
        let meta;
        if ((await exists(cacheImg)) && (await exists(cacheMeta))) {
          meta = JSON.parse(await fs.readFile(cacheMeta, 'utf8'));
          cached++;
        } else {
          const buf = await downloadFirst(src.files(e.id));
          if (!buf) throw new Error('download failed');
          const webp = await sharp(buf)
            .rotate()
            .resize({ height: TARGET_HEIGHT, width: TARGET_HEIGHT, fit: 'outside', withoutEnlargement: true })
            .webp({ quality: QUALITY })
            .toBuffer();
          await fs.writeFile(cacheImg, webp);
          meta = await fetchMeta(e.source, e.id);
          await fs.writeFile(cacheMeta, JSON.stringify(meta));
          ok++;
        }
        await fs.copyFile(cacheImg, outFile);
        manifest.push({
          index: e.index,
          file: `backgrounds/${num}.webp`,
          ko: e.ko,
          title: meta.title,
          credit: meta.credit,
          source: src.label,
          page: src.page(e.id),
        });
      } catch (err) {
        failed++;
        console.warn(`[backgrounds] ${num} ${e.source}/${e.id} 실패: ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  manifest.sort((a, b) => a.index - b.index);
  await fs.writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 1));
  console.log(`[backgrounds] 새로 받음 ${ok}, 저장본 사용 ${cached}, 실패 ${failed}, 총 ${manifest.length}장`);
}

main().catch(err => {
  console.warn('[backgrounds] 오류로 건너뜀:', err.message);
  process.exit(0);
});
