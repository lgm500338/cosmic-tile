// ---------------------------------------------------------------------------
// 거리 구간 (지구에서 가까운 곳 → 먼 곳으로 떠나는 우주 여행)
// 한 바퀴 = 300레벨. 301레벨부터는 "두 번째 우주 여행"으로 다시 지구에서 출발한다
// (난이도는 레벨 번호를 따라 계속 올라가므로 두 번째 바퀴가 더 어렵다).
// ---------------------------------------------------------------------------

export const LAP_LENGTH = 300;

export interface ZoneInfo {
  zone: number; // 1~5
  nameKo: string;
  nameEn: string;
  distanceKo: string;
  distanceEn: string;
  /** 바퀴 안에서의 레벨 범위 (1~300) */
  from: number;
  to: number;
  tileIds: string[];
}

export const ZONES: ZoneInfo[] = [
  {
    zone: 1,
    nameKo: '지구 궤도와 내태양계',
    nameEn: 'Earth Orbit & Inner Solar System',
    distanceKo: '0.002 ~ 3 AU',
    distanceEn: '0.002 – 3 AU',
    from: 1,
    to: 50,
    tileIds: [
      'c_sun', 'c_mercury', 'c_venus', 'c_earth', 'c_moon', 'c_mars', 'c_phobos', 'c_deimos',
      'c_ceres', 'c_vesta', 'c_pallas', 'c_psyche', 'c_bennu', 'c_ryugu', 'c_itokawa', 'c_eros',
      'c_dimorphos', 'c_apophis', 'c_iss', 'c_hubble', 'c_jwst', 'c_sputnik', 'c_apollo11',
      'c_kitsat1', 'c_nuri', 'c_danuri', 'c_curiosity', 'c_perseverance', 'c_ingenuity', 'c_parker',
      'c_olympus', 'c_aurora', 'c_eclipse', 'c_vostok', 'c_hayabusa2', 'c_osirisrex', 'c_dart', 'c_didymos',
    ],
  },
  {
    zone: 2,
    nameKo: '거대 가스 행성과 위성',
    nameEn: 'Gas Giants & Their Moons',
    distanceKo: '5 ~ 10 AU',
    distanceEn: '5 – 10 AU',
    from: 51,
    to: 110,
    tileIds: [
      'c_jupiter', 'c_redspot', 'c_io', 'c_europa', 'c_ganymede', 'c_callisto', 'c_amalthea',
      'c_saturn', 'c_pan', 'c_titan', 'c_enceladus', 'c_mimas', 'c_rhea', 'c_iapetus', 'c_dione',
      'c_tethys', 'c_hyperion', 'c_phoebe', 'c_cassini', 'c_sl9', 'c_comet67p', 'c_tempel1',
      'c_hartley2', 'c_rosetta',
      'c_saturnrings', 'c_hexagon', 'c_jupiteraurora', 'c_juno', 'c_galileo', 'c_pioneer10', 'c_clipper',
      'c_lucy', 'c_huygens', 'c_kraken', 'c_prometheus', 'c_pandora', 'c_janus', 'c_daphnis',
    ],
  },
  {
    zone: 3,
    nameKo: '태양계 끝자락',
    nameEn: 'Edge of the Solar System',
    distanceKo: '20 ~ 수만 AU',
    distanceEn: '20 – tens of thousands of AU',
    from: 111,
    to: 170,
    tileIds: [
      'c_uranus', 'c_miranda', 'c_titania', 'c_oberon', 'c_ariel', 'c_umbriel', 'c_neptune', 'c_triton',
      'c_proteus', 'c_nereid', 'c_pluto', 'c_charon', 'c_makemake', 'c_haumea', 'c_eris', 'c_sedna',
      'c_arrokoth', 'c_quaoar', 'c_orcus', 'c_gonggong', 'c_halley', 'c_halebopp', 'c_neowise',
      'c_oumuamua', 'c_borisov', 'c_voyager1', 'c_voyager2', 'c_newhorizons',
      'c_uranusrings', 'c_darkspot', 'c_plutohaze', 'c_nix', 'c_hydra', 'c_varuna', 'c_heliopause',
      'c_oort', 'c_palebluedot', 'c_goldenrecord',
    ],
  },
  {
    zone: 4,
    nameKo: '이웃 별과 외계행성',
    nameEn: 'Neighbouring Stars & Exoplanets',
    distanceKo: '4 ~ 수천 광년',
    distanceEn: '4 – thousands of light-years',
    from: 171,
    to: 240,
    tileIds: [
      'c_proxima', 'c_proximab', 'c_sirius', 'c_procyon', 'c_altair', 'c_vega', 'c_fomalhaut',
      'c_trappist1', 'c_51pegb', 'c_hd189733b', 'c_arcturus', 'c_capella', 'c_aldebaran', 'c_regulus',
      'c_algol', 'c_hyades', 'c_spica', 'c_mira', 'c_canopus', 'c_polaris', 'c_pleiades', 'c_betelgeuse',
      'c_antares', 'c_rigel', 'c_deneb', 'c_pulsar',
      'c_alphacen', 'c_barnard', 'c_siriusb', 'c_epseridani', 'c_albireo', 'c_mizar', 'c_bigdipper',
      'c_orionbelt', 'c_crux', 'c_kepler186f', 'c_kepler452b', 'c_kepler16b', 'c_55cnce', 'c_wasp76b',
    ],
  },
  {
    zone: 5,
    nameKo: '심우주 성운과 은하',
    nameEn: 'Deep-Space Nebulae & Galaxies',
    distanceKo: '천 광년 ~ 130억 광년',
    distanceEn: '1,000 – 13 billion light-years',
    from: 241,
    to: 300,
    tileIds: [
      'c_orion', 'c_horsehead', 'c_crab', 'c_ring', 'c_helix', 'c_catseye', 'c_veil', 'c_pillars',
      'c_carina', 'c_lagoon', 'c_rosette', 'c_northamerica', 'c_trifid', 'c_bubble', 'c_butterfly',
      'c_southernring', 'c_owl', 'c_etacarinae', 'c_casa', 'c_sn1987a', 'c_cygx1', 'c_sgra',
      'c_milkyway', 'c_omegacen', 'c_m13', 'c_jewelbox', 'c_lmc', 'c_smc', 'c_tarantula', 'c_andromeda',
      'c_triangulum', 'c_blackhole', 'c_sombrero', 'c_whirlpool', 'c_cartwheel', 'c_m87', 'c_centaurusa',
      'c_m101', 'c_m82', 'c_antennae', 'c_m64', 'c_quasar',
      'c_hudf', 'c_cmb', 'c_einsteinring', 'c_stephan',
    ],
  },
];

const TILE_ZONE: Record<string, number> = {};
for (const z of ZONES) for (const id of z.tileIds) TILE_ZONE[id] = z.zone;

export function zoneOfTile(id: string): number {
  return TILE_ZONE[id] || 5;
}

/** 레벨 → 몇 번째 바퀴(1부터), 바퀴 안의 위치(1~300), 구간 정보 */
export function zoneForLevel(level: number): { lap: number; posInLap: number; zone: ZoneInfo; posInZone: number } {
  const lv = Math.max(1, level);
  const lap = Math.floor((lv - 1) / LAP_LENGTH) + 1;
  const posInLap = ((lv - 1) % LAP_LENGTH) + 1;
  const zone = ZONES.find(z => posInLap >= z.from && posInLap <= z.to) || ZONES[ZONES.length - 1];
  return { lap, posInLap, zone, posInZone: posInLap - zone.from };
}

/** 챕터의 구간: 등장 천체가 가장 많이 속한 구간 (같으면 첫 천체의 구간) */
export function zoneOfChapter(tileIds: string[]): number {
  const count: Record<number, number> = {};
  for (const id of tileIds) count[zoneOfTile(id)] = (count[zoneOfTile(id)] || 0) + 1;
  let best = zoneOfTile(tileIds[0]);
  let bestN = count[best] || 0;
  for (const [z, n] of Object.entries(count)) {
    if (n > bestN) {
      best = Number(z);
      bestN = n;
    }
  }
  return best;
}
