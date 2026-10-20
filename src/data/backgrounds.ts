/**
 * 레벨별 실제 우주 사진 배경 (1~100레벨)
 *
 * 출처: ESA/Hubble, ESA/Webb, ESO — 모두 CC BY 4.0 (상업적 사용 가능, 출처 표기 필수)
 *  - 사진마다 원래 출처 문구(촬영자/기관)를 화면에 그대로 표시해야 한다.
 *  - 사람이 알아볼 수 있게 찍힌 사진은 상업적으로 쓸 수 없다 → 배포 후 갤러리(?bg-gallery)에서 한 번 확인할 것.
 *
 * 실제 이미지 파일은 배포(빌드) 때 scripts/fetch-backgrounds.mjs 가 받아서
 * public/backgrounds/{번호}.webp 와 manifest.json(출처 문구 포함)으로 만든다.
 * 사진이 없거나 못 불러오면 코드로 그린 우주 배경이 대신 나온다.
 */
export type BgSource = 'hubble' | 'webb' | 'eso';

export interface BackgroundPhoto {
  source: BgSource;
  id: string; // 각 기관 사이트의 이미지 ID
  ko: string; // 화면에 보여줄 한국어 이름
}

export const BACKGROUND_PHOTOS: BackgroundPhoto[] = [
  { source: 'hubble', id: 'heic0601a', ko: '오리온 성운' },
  { source: 'eso', id: 'potw1217a', ko: '달과 은하수의 아치' },
  { source: 'hubble', id: 'heic1814a', ko: '화성과 토성' },
  { source: 'eso', id: 'potw1222a', ko: 'ALMA 위의 남쪽 은하수' },
  { source: 'hubble', id: 'heic2017a', ko: '목성과 유로파' },
  { source: 'hubble', id: 'heic1917a', ko: '토성' },
  { source: 'webb', id: 'weic2602a', ko: '천왕성' },
  { source: 'hubble', id: 'heic1307a', ko: '말머리 성운 (적외선)' },
  { source: 'eso', id: 'potw1504a', ko: '밤하늘을 가로지르는 혜성' },
  { source: 'webb', id: 'weic2205a', ko: '카리나 성운의 우주 절벽' },
  { source: 'hubble', id: 'heic0515a', ko: '게 성운' },
  { source: 'hubble', id: 'heic1502a', ko: '안드로메다 은하' },
  { source: 'hubble', id: 'heic1501a', ko: '창조의 기둥' },
  { source: 'eso', id: 'ann13016a', ko: 'ALMA와 마젤란 은하' },
  { source: 'hubble', id: 'heic1608a', ko: '거품 성운' },
  { source: 'webb', id: 'weic2216b', ko: '창조의 기둥 (제임스웹)' },
  { source: 'hubble', id: 'heic0506a', ko: '소용돌이 은하 M51' },
  { source: 'eso', id: 'potw1221a', ko: '달빛 아래 얼음 기둥' },
  { source: 'hubble', id: 'heic1808a', ko: '석호 성운' },
  { source: 'webb', id: 'potm2208a', ko: '유령 은하 M74' },
  { source: 'hubble', id: 'heic0910h', ko: '나비 성운' },
  { source: 'eso', id: 'uhd_img4255pc_bt_cc', ko: '라실라 천문대 위의 은하수' },
  { source: 'hubble', id: 'heic2007a', ko: '별 탄생의 태피스트리' },
  { source: 'webb', id: 'weic2411a', ko: '말머리 성운 (제임스웹)' },
  { source: 'hubble', id: 'opo0328a', ko: '솜브레로 은하' },
  { source: 'hubble', id: 'heic1509a', ko: '웨스테르룬드 2 성단' },
  { source: 'eso', id: 'potw1150a', ko: 'ALMA의 밤하늘' },
  { source: 'webb', id: 'weic2601a', ko: '나선 성운 (제임스웹)' },
  { source: 'hubble', id: 'heic1007a', ko: '신비의 산' },
  { source: 'hubble', id: 'heic0604a', ko: '시가 은하 M82' },
  { source: 'hubble', id: 'heic1708a', ko: '목성의 소용돌이 구름' },
  { source: 'eso', id: 'yb_vlt_milkyway', ko: '거대 망원경과 은하수' },
  { source: 'webb', id: 'weic2417a', ko: '게 성운 (제임스웹)' },
  { source: 'hubble', id: 'heic1105a', ko: '타란툴라 성운' },
  { source: 'hubble', id: 'heic0602a', ko: '바람개비 은하' },
  { source: 'eso', id: 'eso1238a', ko: '토르의 투구 성운' },
  { source: 'webb', id: 'weic2407a', ko: '삼각형자리 은하의 NGC 604' },
  { source: 'hubble', id: 'heic1310a', ko: '고리 성운' },
  { source: 'hubble', id: 'heic1520a', ko: '베일 성운' },
  { source: 'eso', id: 'eso0932a', ko: '은하수 파노라마' },
  { source: 'hubble', id: 'heic0817a', ko: '페르세우스 은하 NGC 1275' },
  { source: 'webb', id: 'weic2513a', ko: '고양이 발 성운' },
  { source: 'hubble', id: 'heic0910i', ko: '스테판의 오중주' },
  { source: 'hubble', id: 'opo0006a', ko: '카리나 성운의 빛과 그림자' },
  { source: 'eso', id: 'eso1250a', ko: '카리나 성운 전경' },
  { source: 'webb', id: 'weic2520a', ko: '궁수자리 B2' },
  { source: 'hubble', id: 'heic1518a', ko: '쌍둥이 제트 성운' },
  { source: 'hubble', id: 'heic2105a', ko: '용골자리 AG별' },
  { source: 'eso', id: 'potw1216a', ko: 'APEX 망원경과 밤하늘' },
  { source: 'webb', id: 'weic2425a', ko: 'NGC 602 성단' },
  { source: 'hubble', id: 'heic1110a', ko: '센타우루스 A' },
  { source: 'hubble', id: 'heic0715a', ko: '폭발하듯 태어나는 별무리' },
  { source: 'eso', id: 'eso0934a', ko: '파라날의 별 풍경' },
  { source: 'webb', id: 'weic2415a', ko: '뱀자리 성운' },
  { source: 'hubble', id: 'heic1406a', ko: '원숭이 머리 성운' },
  { source: 'hubble', id: 'opo0028a', ko: '스피로그래프 성운' },
  { source: 'eso', id: 'eso1723a', ko: '오리온 성운과 성단' },
  { source: 'webb', id: 'weic2616a', ko: '사자 성운' },
  { source: 'hubble', id: 'heic1302a', ko: '나선 은하 M106' },
  { source: 'hubble', id: 'heic1104a', ko: '솜털 나선 은하 NGC 2841' },
  { source: 'eso', id: 'ann14045a', ko: 'ALMA와 우리 은하의 중심' },
  { source: 'webb', id: 'weic2420a', ko: '서로 끌어당기는 은하 Arp 142' },
  { source: 'hubble', id: 'heic0506b', ko: '독수리 성운의 첨탑' },
  { source: 'hubble', id: 'heic1410a', ko: '목성의 대적점' },
  { source: 'eso', id: 'eso0936a', ko: '석호 성운 전경' },
  { source: 'webb', id: 'weic2427a', ko: '솜브레로 은하 (제임스웹)' },
  { source: 'hubble', id: 'heic2018b', ko: '나선 은하 NGC 2525' },
  { source: 'hubble', id: 'heic0910e', ko: '카리나 성운 (허블 WFC3)' },
  { source: 'eso', id: 'eso0930a', ko: '삼렬 성운' },
  { source: 'webb', id: 'weic2518a', ko: '피스미스 24 성단' },
  { source: 'hubble', id: 'heic1305a', ko: '나선 은하 M77' },
  { source: 'hubble', id: 'heic0910s', ko: '막대 나선 은하 NGC 6217' },
  { source: 'eso', id: 'potw1322a', ko: '라실라 위의 세 행성' },
  { source: 'webb', id: 'weic2612a', ko: '시가 은하 (제임스웹)' },
  { source: 'hubble', id: 'potw2050a', ko: '상대성의 고리' },
  { source: 'hubble', id: 'heic1907a', ko: '남쪽 하늘의 게 성운' },
  { source: 'eso', id: 'eso1105a', ko: '반사 성운 M78' },
  { source: 'webb', id: 'potm2510a', ko: '붉은 거미 성운' },
  { source: 'hubble', id: 'opo0010a', ko: '오리온자리의 반사 성운' },
  { source: 'hubble', id: 'heic0707a', ko: '극한의 별 탄생' },
  { source: 'eso', id: 'eso0925a', ko: '오메가 성운' },
  { source: 'webb', id: 'weic2330a', ko: '카시오페이아 A 초신성 잔해' },
  { source: 'hubble', id: 'heic0905a', ko: '먼지 띠를 두른 은하 NGC 7049' },
  { source: 'hubble', id: 'heic0706a', ko: '별의 요람 NGC 1672' },
  { source: 'eso', id: 'potw1119a', ko: '월식과 밤하늘' },
  { source: 'webb', id: 'weic2426a', ko: '춤추는 은하 IC 2163과 NGC 2207' },
  { source: 'hubble', id: 'heic1914a', ko: '목성의 빛깔' },
  { source: 'hubble', id: 'heic2011a', ko: '행성상 성운 NGC 6302와 NGC 7027' },
  { source: 'eso', id: 'eso1424a', ko: '삼각형자리 은하' },
  { source: 'webb', id: 'weic2506a', ko: '허빅-아로 49/50' },
  { source: 'hubble', id: 'heic1814b', ko: '토성과 고리' },
  { source: 'hubble', id: 'opo0501a', ko: '막대 나선 은하 NGC 1300' },
  { source: 'eso', id: 'eso0949a', ko: '불꽃 성운' },
  { source: 'webb', id: 'weic2218a', ko: '창조의 기둥 (중적외선)' },
  { source: 'hubble', id: 'potw1714a', ko: '천왕성의 오로라' },
  { source: 'hubble', id: 'heic1712a', ko: '은하 NGC 1512와 NGC 1510' },
  { source: 'eso', id: 'yb_vlt_moon_cnn_cc', ko: '파라날 하늘의 천체 만남' },
  { source: 'webb', id: 'weic2620a', ko: '별의 요람 NGC 7129' },
  { source: 'hubble', id: 'opo1438b', ko: '나선 은하 M81' },
  { source: 'eso', id: 'eso0846a', ko: '우리 은하의 중심' },
];

export const SOURCE_INFO: Record<BgSource, { label: string; page: (id: string) => string; files: (id: string) => string[] }> = {
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

/** 배포 때 만들어지는 manifest.json 한 줄 */
export interface BackgroundManifestEntry {
  index: number; // 1부터 (= 레벨)
  file: string; // 'backgrounds/001.webp'
  ko: string;
  title: string; // 원래 영어 제목
  credit: string; // 원래 출처 문구 그대로
  source: string; // 'ESA/Hubble' 등
  page: string; // 원본 페이지 주소
}
