import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { BoardTile, DockTile, ThemeId, BoosterType, LevelConfig, AppLanguage } from './types/game';
import { GAME_THEMES } from './data/themes';
import { soundManager } from './utils/audio';
import { generateLevel, recalculateOcclusion, getRoadmapRewardForLevel, reshuffleBoardSolvable, ALIEN_DEEP_LEVEL } from './utils/levelGenerator';
import { AlienFlyAway } from './components/AlienTile';
import { CosmicBackground } from './components/CosmicBackground';
import { GameHUD } from './components/GameHUD';
import { GameBoard } from './components/GameBoard';
import { CollectionDock } from './components/CollectionDock';
import { BoosterBar } from './components/BoosterBar';
import { StageClearModal } from './components/StageClearModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelModal } from './components/LevelModal';
import { SettingsModal } from './components/SettingsModal';
import { BOOSTER_PRICES } from './data/boosterPrices';
import { BackgroundManifestEntry } from './data/backgrounds';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelBriefingModal } from './components/LevelBriefingModal';
import { PsychologicalBanner } from './components/PsychologicalBanner';
import { ParticleShower, VoiceCalloutWord } from './components/ParticleShower';
import { GoldStream } from './components/GoldStream';
import { DailyQuestModal, QuestRewardItem, getQuestRewardForLevel } from './components/DailyQuestModal';
import { DailyAttendanceModal, AttendanceReward } from './components/DailyAttendanceModal';

export default function App() {
  // Theme state
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('jelly_theme_id') as ThemeId) || 'cosmic';
  });

  // Current Level (supports 1 to 500+)
  const [levelNumber, setLevelNumber] = useState<number>(() => {
    const saved = localStorage.getItem('jelly_level_num');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('jelly_unlocked_lvl');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Coins balance
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('jelly_user_coins');
    return saved ? parseInt(saved, 10) : 1250;
  });

  // Floating +3 coins indicator on HUD
  const [floatingCoins, setFloatingCoins] = useState<number>(0);

  // Boosters inventory (3 main boosters: Undo, Shuffle, Wand)
  const [boosters, setBoosters] = useState<Record<BoosterType, number>>(() => {
    try {
      const saved = localStorage.getItem('jelly_user_boosters');
      return saved ? JSON.parse(saved) : { undo: 5, wand: 2, shuffle: 3, slot: 1 };
    } catch {
      return { undo: 5, wand: 2, shuffle: 3, slot: 1 };
    }
  });

  // Daily Attendance Tracking
  const [attendanceStreak, setAttendanceStreak] = useState<number>(() => {
    const saved = localStorage.getItem('jelly_attendance_streak');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [lastAttendanceDate, setLastAttendanceDate] = useState<string>(() => {
    return localStorage.getItem('jelly_last_attendance_date') || '';
  });

  const [lastClaimDate, setLastClaimDate] = useState<string>(() => {
    return localStorage.getItem('jelly_daily_claim_date') || '';
  });

  // 10-Level Daily Quest Claimed Rewards
  const [claimedLevelRewards, setClaimedLevelRewards] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('jelly_claimed_quest_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const canClaimAttendance = lastAttendanceDate !== todayStr;

  // Board & Dock State
  const [boardTiles, setBoardTiles] = useState<BoardTile[]>([]);
  const [dockTiles, setDockTiles] = useState<DockTile[]>([]);
  const [moveHistory, setMoveHistory] = useState<{ tileId: string; dockInstanceId: string }[]>([]);
  const [maxSlots] = useState<number>(7);

  // 천체 이름 표시: 기본 켜짐 (아이들이 이름을 자연스럽게 익히도록), T 버튼으로 끌 수 있음
  const [showTileText, setShowTileText] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jelly_show_tile_text') !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleTileText = () => {
    setShowTileText(prev => {
      const next = !prev;
      localStorage.setItem('jelly_show_tile_text', String(next));
      return next;
    });
  };

  // Language state for global Google Play Store support ('ko' | 'en')
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('jelly_app_language');
    if (saved === 'ko' || saved === 'en') return saved;
    return typeof navigator !== 'undefined' && navigator.language?.startsWith('ko') ? 'ko' : 'en';
  });

  const handleToggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next: AppLanguage = prev === 'ko' ? 'en' : 'ko';
      localStorage.setItem('jelly_app_language', next);
      return next;
    });
  }, []);

  // Combo & Audio
  const [combo, setCombo] = useState<number>(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => soundManager.getVoiceEnabled());

  // Interactive Modals
  const [showStageClear, setShowStageClear] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showLevelModal, setShowLevelModal] = useState<boolean>(false);
  // 지금 배경 사진 정보 (출처 표시: CC BY 4.0 조건)
  const [photoInfo, setPhotoInfo] = useState<BackgroundManifestEntry | null>(null);

  // 외계인이 날아가는 효과 위치
  const [alienFly, setAlienFly] = useState<{ id: number; x: number; y: number; kind: 'cover' | 'vanish' | 'mystery' } | null>(null);

  // 부스터 안내 토스트 (예: 코인 부족)
  const [boosterToast, setBoosterToast] = useState<string | null>(null);
  const boosterToastTimer = useRef<number | null>(null);
  const showBoosterToast = (msg: string, ms = 1800) => {
    setBoosterToast(msg);
    if (boosterToastTimer.current) window.clearTimeout(boosterToastTimer.current);
    boosterToastTimer.current = window.setTimeout(() => setBoosterToast(null), ms);
  };
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showBriefingModal, setShowBriefingModal] = useState<boolean>(true);
  const [showDailyQuestModal, setShowDailyQuestModal] = useState<boolean>(false);
  const [showDailyAttendanceModal, setShowDailyAttendanceModal] = useState<boolean>(false);

  // Psychological Challenge Banner ("75%가 이 레벨에서 실패했습니다")
  const [psychologicalBannerText, setPsychologicalBannerText] = useState<string | null>(null);

  // Waterfall Particle Shower (Photo 5 effect on match-3)
  const [goldStream, setGoldStream] = useState<{ id: number; x: number; y: number; combo: number; label: string } | null>(null);
  const [showerTrigger, setShowerTrigger] = useState<{
    id: number;
    combo: number;
    callout?: VoiceCalloutWord;
  } | null>(null);
  const showerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Visual highlights
  const [matchingIds, setMatchingIds] = useState<string[]>([]);
  const clearingIdsRef = useRef<Set<string>>(new Set());
  const [wandSuggestedType, setWandSuggestedType] = useState<string | null>(null);
  const [freeReviveUsed, setFreeReviveUsed] = useState<boolean>(false);

  // Mobile Frame View Mode
  const isMobileFrameMode = false;

  // Level config
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);

  // Theme map lookup
  const currentTheme = GAME_THEMES[themeId] || GAME_THEMES.cosmic;
  const tileThemeMap = useMemo(() => {
    const map: Record<string, (typeof currentTheme.tiles)[0]> = {};
    currentTheme.tiles.forEach(t => {
      map[t.id] = t;
    });
    return map;
  }, [currentTheme]);

  // Save persistent state
  useEffect(() => {
    localStorage.setItem('jelly_theme_id', themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem('jelly_user_coins', String(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('jelly_user_boosters', JSON.stringify(boosters));
  }, [boosters]);

  useEffect(() => {
    localStorage.setItem('jelly_unlocked_lvl', String(highestUnlockedLevel));
  }, [highestUnlockedLevel]);

  useEffect(() => {
    localStorage.setItem('jelly_claimed_quest_rewards', JSON.stringify(claimedLevelRewards));
  }, [claimedLevelRewards]);

  useEffect(() => {
    localStorage.setItem('jelly_attendance_streak', String(attendanceStreak));
  }, [attendanceStreak]);

  useEffect(() => {
    localStorage.setItem('jelly_last_attendance_date', lastAttendanceDate);
  }, [lastAttendanceDate]);

  // Handle claiming 10-level daily quest reward
  const handleClaimQuestReward = (reward: QuestRewardItem) => {
    if (claimedLevelRewards.includes(reward.level)) return;

    setClaimedLevelRewards(prev => [...prev, reward.level]);

    if (reward.coinAmount > 0) {
      setCoins(c => c + reward.coinAmount);
      setFloatingCoins(reward.coinAmount);
      setTimeout(() => setFloatingCoins(0), 1500);
    }

    setBoosters(prev => ({
      ...prev,
      undo: prev.undo + (reward.boosterUndo || 0),
      shuffle: prev.shuffle + (reward.boosterShuffle || 0),
      wand: prev.wand + (reward.boosterWand || 0),
    }));
  };

  // Handle claiming all available unlocked quest rewards
  const handleClaimAllAvailableQuestRewards = () => {
    const phaseIndex = Math.floor((levelNumber - 1) / 10);
    const startLevel = phaseIndex * 10 + 1;
    const phaseLevels = Array.from({ length: 10 }, (_, i) => startLevel + i);

    let totalCoins = 0;
    let addUndo = 0;
    let addShuffle = 0;
    let addWand = 0;
    const newlyClaimed: number[] = [];

    phaseLevels.forEach(lvl => {
      if (highestUnlockedLevel > lvl && !claimedLevelRewards.includes(lvl)) {
        const item = getQuestRewardForLevel(lvl);
        totalCoins += item.coinAmount || 0;
        addUndo += item.boosterUndo || 0;
        addShuffle += item.boosterShuffle || 0;
        addWand += item.boosterWand || 0;
        newlyClaimed.push(lvl);
      }
    });

    if (newlyClaimed.length > 0) {
      soundManager.playArcadeFanfare(2);
      setClaimedLevelRewards(prev => [...prev, ...newlyClaimed]);
      setCoins(c => c + totalCoins);
      setFloatingCoins(totalCoins);
      setTimeout(() => setFloatingCoins(0), 1500);
      setBoosters(prev => ({
        ...prev,
        undo: prev.undo + addUndo,
        shuffle: prev.shuffle + addShuffle,
        wand: prev.wand + addWand,
      }));
    }
  };

  // Handle claiming daily attendance check-in
  const handleClaimAttendance = (reward: AttendanceReward) => {
    setLastAttendanceDate(todayStr);
    setAttendanceStreak(prev => prev + 1);

    if (reward.coins > 0) {
      setCoins(c => c + reward.coins);
      setFloatingCoins(reward.coins);
      setTimeout(() => setFloatingCoins(0), 1500);
    }

    setBoosters(prev => ({
      ...prev,
      undo: prev.undo + (reward.undo || 0),
      shuffle: prev.shuffle + (reward.shuffle || 0),
      wand: prev.wand + (reward.wand || 0),
    }));
  };

  // Initialize or restart level
  const initLevel = useCallback(
    (lvlNum: number, targetThemeId?: ThemeId, autoShowBriefing: boolean = true) => {
      soundManager.stopVoice();
      const activeTheme = targetThemeId || themeId;
      const { tiles, config } = generateLevel(lvlNum, activeTheme);

      setBoardTiles(tiles);
      setDockTiles([]);
      setMoveHistory([]);
      setMatchingIds([]);
      clearingIdsRef.current.clear();
      setWandSuggestedType(null);
      setFreeReviveUsed(false);
      setShowStageClear(false);
      setShowGameOver(false);
      setCombo(0);
      setLevelConfig(config);
      setLevelNumber(lvlNum);
      localStorage.setItem('jelly_level_num', String(lvlNum));
      setPsychologicalBannerText(null);

      // Show educational planetary briefing before starting every level!
      if (autoShowBriefing) {
        setShowBriefingModal(true);
      } else {
        setPsychologicalBannerText(config.failureRateText);
      }
    },
    [themeId]
  );

  // Load level on start once
  const isInitialMount = useRef(true);
  // 도전과제 창을 닫으면 다음 레벨 브리핑을 띄워야 하는지
  const pendingBriefingRef = useRef(false);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      initLevel(levelNumber, undefined, true);
    }
  }, [levelNumber, initLevel]);

  // 슬롯에 들어간 타일은 다시 보드로 돌아가지 않는다 (되돌리기는 부스터로만)

  // Handle tile click on board
  const handleBoardTileClick = (tile: BoardTile) => {
    if (tile.isCovered || tile.isCollected || showGameOver || showStageClear) return;

    // Ensure audio context is alive immediately on click
    soundManager.resumeContext();

    // ① 덮개 외계인: 외계인만 사라지고 그 자리에 천체가 드러난다 / ② 사라지는 외계인: 통째로 사라진다 (둘 다 슬롯 안 씀)
    if (tile.isAlien && (tile.alienKind === 'cover' || tile.alienKind === 'vanish')) {
      const el = document.querySelector(`[data-tile-id="${tile.id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setAlienFly({ id: Date.now(), x: r.left + r.width / 2, y: r.top + r.height / 2, kind: tile.alienKind });
        window.setTimeout(() => setAlienFly(null), 900);
      }
      soundManager.playWhoosh();
      const kind = tile.alienKind;
      setBoardTiles(prev =>
        recalculateOcclusion(
          prev.map(b =>
            b.id !== tile.id
              ? b
              : kind === 'cover'
              ? { ...b, isAlien: false, alienKind: undefined }
              : { ...b, isCollected: true }
          )
        )
      );
      return;
    }

    if (dockTiles.length >= maxSlots) {
      soundManager.playDefeat();
      setShowGameOver(true);
      return;
    }

    soundManager.playSquish();

    const instanceId = `dock-${tile.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newDockTile: DockTile = {
      instanceId,
      typeId: tile.typeId,
      originalTileId: tile.id,
    };

    setDockTiles(prevDock => {
      if (prevDock.length >= maxSlots) return prevDock;

      const sameTypeIndex = prevDock.findIndex(t => t.typeId === tile.typeId);
      if (sameTypeIndex !== -1) {
        let lastIndex = sameTypeIndex;
        for (let i = sameTypeIndex; i < prevDock.length; i++) {
          if (prevDock[i].typeId === tile.typeId) {
            lastIndex = i;
          }
        }
        return [
          ...prevDock.slice(0, lastIndex + 1),
          newDockTile,
          ...prevDock.slice(lastIndex + 1),
        ];
      }
      return [...prevDock, newDockTile];
    });

    // 외계인 타일: 누르는 순간 외계인이 날아간다
    if (tile.isAlien) {
      const el = document.querySelector(`[data-tile-id="${tile.id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setAlienFly({ id: Date.now(), x: r.left + r.width / 2, y: r.top + r.height / 2, kind: tile.alienKind || 'cover' });
        window.setTimeout(() => setAlienFly(null), 900);
      }
    }

    setBoardTiles(prevBoard => {
      // 한 번 정체가 드러난 타일은 되돌리기로 보드에 돌아와도 천체로 보인다
      const updated = prevBoard.map(b => (b.id === tile.id ? { ...b, isCollected: true, isAlien: false, alienKind: undefined } : b));
      return recalculateOcclusion(updated);
    });

    setMoveHistory(prev => [...prev, { tileId: tile.id, dockInstanceId: instanceId }]);
  };

  // Automated 3-Match detection & resolution (Guaranteed to catch and pop any 3 identical tiles in dock)
  useEffect(() => {
    if (showGameOver || showStageClear) return;

    // Group dock tiles by typeId
    const counts: Record<string, DockTile[]> = {};
    dockTiles.forEach(dt => {
      if (!counts[dt.typeId]) counts[dt.typeId] = [];
      counts[dt.typeId].push(dt);
    });

    // Find any type with 3 or more tiles that are NOT already scheduled for removal
    const matchType = Object.keys(counts).find(type => {
      const eligible = counts[type].filter(t => !clearingIdsRef.current.has(t.instanceId));
      return eligible.length >= 3;
    });

    if (matchType) {
      const matched = counts[matchType]
        .filter(t => !clearingIdsRef.current.has(t.instanceId))
        .slice(0, 3);
      const matchInstanceIds = matched.map(m => m.instanceId);

      // Synchronously mark as clearing in ref
      matchInstanceIds.forEach(id => clearingIdsRef.current.add(id));

      // Visual pop animation
      setMatchingIds(prev => Array.from(new Set([...prev, ...matchInstanceIds])));

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        setCombo(0);
      }, 4500);

      soundManager.playMatch(nextCombo);

      const earnedCoins = 3 * nextCombo;
      setCoins(c => c + earnedCoins);
      setFloatingCoins(earnedCoins);
      setTimeout(() => setFloatingCoins(0), 1200);

      // 맞춘 3개 타일 자리에서 황금 줄기가 쏟아진다 (화면 전체 폭죽 대신)
      const matchedIdx = matched.map(m => dockTiles.findIndex(d => d.instanceId === m.instanceId)).filter(i => i >= 0);
      const midIdx = matchedIdx.length ? matchedIdx.reduce((a, b) => a + b, 0) / matchedIdx.length : 3;
      const bar = document.getElementById('collection-dock-bar');
      let sx = window.innerWidth / 2, sy = 140;
      if (bar) {
        const r = bar.getBoundingClientRect();
        const inner = r.width - 8;
        sx = r.left + 4 + (midIdx + 0.5) * (inner / maxSlots);
        sy = r.bottom - 6;
      }
      const label = nextCombo === 1 ? 'GREAT!' : nextCombo === 2 ? 'EXCELLENT!' : nextCombo === 3 ? 'PERFECT!' : 'UNBELIEVABLE!';
      setGoldStream({ id: Date.now(), x: sx, y: sy, combo: nextCombo, label });
      if (showerTimerRef.current) clearTimeout(showerTimerRef.current);
      showerTimerRef.current = setTimeout(() => setGoldStream(null), 1500);

      // Independent removal: NEVER cancelled by re-renders!
      setTimeout(() => {
        setDockTiles(prev => prev.filter(t => !matchInstanceIds.includes(t.instanceId)));
        setMatchingIds(prev => prev.filter(id => !matchInstanceIds.includes(id)));
        matchInstanceIds.forEach(id => clearingIdsRef.current.delete(id));
      }, 260);
    } else {
      // Check full dock capacity defeat (only count active tiles not currently clearing)
      const activeTiles = dockTiles.filter(t => !clearingIdsRef.current.has(t.instanceId));
      if (activeTiles.length >= maxSlots) {
        const defeatTimer = setTimeout(() => {
          setDockTiles(latestDock => {
            const activeNow = latestDock.filter(t => !clearingIdsRef.current.has(t.instanceId));
            const checkCounts: Record<string, number> = {};
            activeNow.forEach(d => {
              checkCounts[d.typeId] = (checkCounts[d.typeId] || 0) + 1;
            });
            const hasMatch = Object.values(checkCounts).some(c => c >= 3);
            if (activeNow.length >= maxSlots && !hasMatch && !showGameOver && !showStageClear) {
              soundManager.playDefeat();
              setShowGameOver(true);
            }
            return latestDock;
          });
        }, 300);
        return () => clearTimeout(defeatTimer);
      }
    }
  }, [dockTiles, maxSlots, showGameOver, showStageClear, combo]);

  // Victory handler
  const handleVictory = useCallback(() => {
    soundManager.stopVoice();
    soundManager.playVictory();
    soundManager.playFanfare();
    setDockTiles([]);
    setMatchingIds([]);
    clearingIdsRef.current.clear();

    // Reward for completing the level
    const reward = getRoadmapRewardForLevel(levelNumber);
    if (reward.rewardType === 'coins') {
      setCoins(c => c + reward.amount);
    } else {
      const bType = reward.rewardType as BoosterType;
      setBoosters(b => ({ ...b, [bType]: b[bType] + reward.amount }));
    }

    const stageClearCoins = 50 + Math.min(levelNumber * 5, 200);
    setCoins(c => c + stageClearCoins);

    setHighestUnlockedLevel(prev => Math.max(prev, levelNumber + 1));
    setShowStageClear(true);
  }, [levelNumber]);

  // Automated Victory Detector: Triggers ONLY when board is empty AND dock is completely empty
  useEffect(() => {
    if (boardTiles.length === 0 || showStageClear || showGameOver) return;

    // 사라지는 외계인(장애물)은 남아 있어도 클리어로 본다
    const remainingBoardCount = boardTiles.filter(t => !t.isCollected && t.alienKind !== 'vanish').length;
    // Both board and dock must be completely cleared with no pending match animations
    if (remainingBoardCount === 0 && dockTiles.length === 0 && clearingIdsRef.current.size === 0) {
      const victoryTimer = setTimeout(() => {
        handleVictory();
      }, 350);
      return () => clearTimeout(victoryTimer);
    }
  }, [boardTiles, dockTiles, showStageClear, showGameOver, handleVictory]);

  // Booster handlers
  // 보유한 부스터가 있으면 1개 사용, 없으면 코인으로 바로 결제 (상점 없음)
  const payForBooster = (type: 'undo' | 'wand' | 'shuffle'): boolean => {
    if (boosters[type] > 0) {
      setBoosters(b => ({ ...b, [type]: b[type] - 1 }));
      return true;
    }
    const price = BOOSTER_PRICES[type];
    if (coins >= price) {
      soundManager.playCoin();
      setCoins(c => c - price);
      return true;
    }
    soundManager.playBlocked();
    showBoosterToast(
      language === 'ko'
        ? `코인이 부족해요 (🪙 ${price} 필요)`
        : `Not enough coins (🪙 ${price} needed)`
    );
    return false;
  };

  const handleUseBooster = (type: BoosterType) => {
    switch (type) {
      case 'undo': {
        if (dockTiles.length === 0 || moveHistory.length === 0) return;
        const lastMove = moveHistory[moveHistory.length - 1];
        if (!dockTiles.some(d => d.instanceId === lastMove.dockInstanceId)) return;
        if (!payForBooster('undo')) return;
        soundManager.playWhoosh();

        setDockTiles(prev => prev.filter(d => d.instanceId !== lastMove.dockInstanceId));
        setMoveHistory(prev => prev.slice(0, -1));

        setBoardTiles(prev => {
          const restored = prev.map(t =>
            t.id === lastMove.tileId ? { ...t, isCollected: false } : t
          );
          return recalculateOcclusion(restored);
        });
        break;
      }

      case 'shuffle': {
        const uncollected = boardTiles.filter(t => !t.isCollected);
        if (uncollected.length < 2) return;
        // 슬롯이 이미 막힌 상태(어떤 천체도 7칸 안에 3개를 못 채움)면 섞어도 소용없으니 코인을 쓰지 않는다
        const counts: Record<string, number> = {};
        dockTiles.forEach(d => (counts[d.typeId] = (counts[d.typeId] || 0) + 1));
        const minNeed = Math.min(3, ...Object.values(counts).map(c => 3 - c));
        if (dockTiles.length > 0 && dockTiles.length + minNeed > maxSlots) {
          soundManager.playBlocked();
          showBoosterToast(
            language === 'ko'
              ? '슬롯이 막혀서 섞어도 풀 수 없어요. 되돌리기나 타일 제거를 써보세요'
              : 'The dock is blocked. Try Undo or Remove instead.'
          );
          return;
        }
        if (!payForBooster('shuffle')) return;
        soundManager.playWhoosh();

        // 남은 타일을 "반드시 풀 수 있게" 다시 배치 (슬롯에 든 천체까지 고려)
        setBoardTiles(reshuffleBoardSolvable(boardTiles, dockTiles.map(d => d.typeId), levelNumber));
        break;
      }

      case 'wand': {
        // 타일 제거: 같은 천체 3개를 보드(덮인 타일 포함)와 슬롯에서 바로 없앤다
        const remaining = boardTiles.filter(t => !t.isCollected && t.alienKind !== 'vanish');
        if (remaining.length === 0 && dockTiles.length === 0) return;

        // 대상 천체: 슬롯에 가장 많이 쌓인 천체 → 없으면 지금 누를 수 있는 타일 중 하나
        const dockCount: Record<string, number> = {};
        dockTiles.forEach(d => (dockCount[d.typeId] = (dockCount[d.typeId] || 0) + 1));
        let targetType = Object.keys(dockCount).sort((a, b) => dockCount[b] - dockCount[a])[0];
        if (!targetType) {
          const free = remaining.filter(t => !t.isCovered);
          targetType = (free[0] || remaining[0])?.typeId;
        }
        if (!targetType) return;
        if (!payForBooster('wand')) return;
        soundManager.playWhoosh();
        soundManager.playMatch(1);

        const fromDock = dockTiles.filter(d => d.typeId === targetType).slice(0, 3);
        const needFromBoard = 3 - fromDock.length;
        // 보드에서는 위층(잘 보이는) 타일부터 가져간다
        const boardTargets = remaining
          .filter(t => t.typeId === targetType)
          .sort((a, b) => b.layer - a.layer || Number(a.isCovered) - Number(b.isCovered))
          .slice(0, needFromBoard)
          .map(t => t.id);
        const removedDockIds = new Set(fromDock.map(d => d.instanceId));

        setWandSuggestedType(targetType);
        setTimeout(() => setWandSuggestedType(null), 600);
        setDockTiles(prev => prev.filter(d => !removedDockIds.has(d.instanceId)));
        setMoveHistory(prev => prev.filter(m => !removedDockIds.has(m.dockInstanceId)));
        setBoardTiles(prev =>
          recalculateOcclusion(prev.map(t => (boardTargets.includes(t.id) ? { ...t, isCollected: true } : t)))
        );
        break;
      }
    }
  };

  // Revive from Game Over
  const handleRevive = () => {
    soundManager.playMatch(2);
    const tilesToRestore = dockTiles.slice(-3);
    const restoredTileIds = tilesToRestore.map(t => t.originalTileId);

    setDockTiles(prev => prev.slice(0, -3));
    setBoardTiles(prev => {
      const restored = prev.map(t =>
        restoredTileIds.includes(t.id) ? { ...t, isCollected: false } : t
      );
      return recalculateOcclusion(restored);
    });

    if (!freeReviveUsed) {
      setFreeReviveUsed(true);
    } else {
      setCoins(c => Math.max(0, c - 100));
    }

    setShowGameOver(false);
  };

  // Claim Daily Toss-style Gift
  const canClaimDaily = lastClaimDate !== todayStr;
  const handleClaimDailyBonus = () => {
    if (!canClaimDaily) return;
    soundManager.playVictory();
    setCoins(c => c + 300);
    setLastClaimDate(todayStr);
    localStorage.setItem('jelly_daily_claim_date', todayStr);
  };

  // Toggle Mute & Voice
  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleToggleVoice = () => {
    const nextVoice = soundManager.toggleVoice();
    setIsVoiceEnabled(nextVoice);
  };

  const remainingTilesCount = boardTiles.filter(t => !t.isCollected && t.alienKind !== 'vanish').length;
  const totalTilesCount = boardTiles.filter(t => t.alienKind !== 'vanish').length;

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 font-sans ${currentTheme.backgroundClass}`}
    >
      <CosmicBackground themeId={themeId} levelNumber={levelNumber} onPhotoInfo={setPhotoInfo} />

      {/* Waterfall Particle Shower & Golden Combo Banner (Fixed z-[100] top layer) */}
      {alienFly && <AlienFlyAway id={alienFly.id} x={alienFly.x} y={alienFly.y} kind={alienFly.kind} />}
      {goldStream && (
        <GoldStream id={goldStream.id} x={goldStream.x} y={goldStream.y} comboCount={goldStream.combo} label={goldStream.label} />
      )}
      {showerTrigger && (
        <ParticleShower
          id={showerTrigger.id}
          comboCount={showerTrigger.combo}
          callout={showerTrigger.callout}
        />
      )}

      {/* Main Container: 390x844 smartphone ratio or responsive */}
      <main
        className={`
          relative z-10 flex flex-col items-center justify-between
          ${
            isMobileFrameMode
              ? 'w-full max-w-[440px] h-[95vh] max-h-[880px] rounded-[42px] border-[6px] border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden bg-slate-950/75 backdrop-blur-sm'
              : 'w-full max-w-[460px] h-[100dvh] max-h-[100dvh] justify-between py-1 overflow-hidden'
          }
        `}
      >

        {/* Psychological Failure Rate Banner ("75%가 이 레벨에서 실패했습니다") */}
        {psychologicalBannerText && (
          <PsychologicalBanner
            language={language}
            text={psychologicalBannerText}
            onDismiss={() => setPsychologicalBannerText(null)}
          />
        )}

        {/* 1. Header HUD (Level, Coins, Quests, Attendance, Settings) */}
        <GameHUD
          levelNumber={levelNumber}
          coins={coins}
          earnedFloatingCoins={floatingCoins}
          remainingTiles={remainingTilesCount}
          totalTiles={totalTilesCount}
          isMuted={isMuted}
          isVoiceEnabled={isVoiceEnabled}
          showTileText={showTileText}
          currentTheme={currentTheme}
          language={language}
          canClaimAttendance={canClaimAttendance}
          onToggleMute={handleToggleMute}
          onToggleVoice={handleToggleVoice}
          onToggleTileText={handleToggleTileText}
          onToggleLanguage={handleToggleLanguage}
          onOpenLevels={() => setShowLevelModal(true)}
          onOpenBriefing={() => setShowBriefingModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenDailyQuest={() => setShowDailyQuestModal(true)}
          onOpenAttendance={() => setShowDailyAttendanceModal(true)}
        />

        {/* 2. 7-Slot Collection Dock (Directly below HUD, matching image.png) */}
        <CollectionDock
          dockTiles={dockTiles}
          maxSlots={maxSlots}
          tileThemeMap={tileThemeMap}
          matchingIds={matchingIds}
          language={language}
        />

        {/* 3. Interactive Multilayered Game Board (Maximized hero playing field) */}
        <GameBoard
          tiles={boardTiles}
          tileThemeMap={tileThemeMap}
          onTileClick={handleBoardTileClick}
          wandSuggestedType={wandSuggestedType}
          showTileText={showTileText}
          language={language}
          isStageCleared={showStageClear}
        />

        {/* 4. Booster Controls Bar (Undo, Wand, Shuffle with red badges floating at bottom) */}
        <BoosterBar
          boosterCounts={boosters}
          onUseBooster={handleUseBooster}
          canUndo={dockTiles.length > 0 && moveHistory.length > 0}
          coins={coins}
          language={language}
        />

        {/* 배경 사진 이름과 출처 (사진마다 원래 출처 문구를 그대로 표시해야 함) */}
        {photoInfo && (
          <a
            href={photoInfo.page}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-[420px] px-4 pb-1 text-center text-[9px] leading-tight text-slate-400/80 truncate shrink-0"
            title={`${photoInfo.title} — ${photoInfo.credit}`}
          >
            📷 {language === 'ko' ? photoInfo.ko : photoInfo.title} · {photoInfo.credit}
            {photoInfo.credit.includes(photoInfo.source) ? '' : ` (${photoInfo.source})`}
          </a>
        )}

        {/* 부스터 안내 토스트 */}
        {boosterToast && (
          <div className="pointer-events-none absolute bottom-28 inset-x-0 flex justify-center z-50">
            <div className="px-4 py-2 rounded-full bg-slate-900/95 border border-amber-400/50 text-amber-200 text-sm font-bold shadow-lg">
              {boosterToast}
            </div>
          </div>
        )}
      </main>

      {/* Interactive Modals */}
      {showStageClear && (
        <StageClearModal
          levelNumber={levelNumber}
          earnedCoins={50 + Math.min(levelNumber * 5, 200)}
          language={language}
          onNextLevel={() => {
            const nextLvl = levelNumber + 1;
            setShowStageClear(false);
            // 11·21·31레벨 등 새 10레벨 구간이 시작될 때: 먼저 다음 레벨을 준비해 두고 도전과제 창을 띄운다
            // (예전에는 레벨을 바꾸지 않고 창만 띄워서 "레벨 10 계속하기"로 되돌아가는 버그가 있었음)
            if ((nextLvl - 1) % 10 === 0 && nextLvl > 1) {
              initLevel(nextLvl, undefined, false);
              setPsychologicalBannerText(null);
              pendingBriefingRef.current = true;
              setShowDailyQuestModal(true);
            } else {
              initLevel(nextLvl, undefined, true);
            }
          }}
          onReplay={() => {
            setShowStageClear(false);
            initLevel(levelNumber, undefined, false);
          }}
          onOpenDailyQuest={() => setShowDailyQuestModal(true)}
        />
      )}

      {/* 10-Level Daily Quest Roadmap Modal (1-10, 11-20, 21-30...) */}
      {showDailyQuestModal && (
        <DailyQuestModal
          currentLevel={levelNumber}
          highestUnlockedLevel={highestUnlockedLevel}
          claimedLevelRewards={claimedLevelRewards}
          language={language}
          onClaimReward={handleClaimQuestReward}
          onClaimAllAvailable={handleClaimAllAvailableQuestRewards}
          onStartLevel={targetLvl => {
            setShowDailyQuestModal(false);
            pendingBriefingRef.current = false;
            if (targetLvl === levelNumber && !showStageClear) {
              // 이미 준비된 레벨이면 판을 새로 만들지 않고 브리핑만 띄운다
              setShowBriefingModal(true);
            } else {
              initLevel(targetLvl, undefined, true);
            }
          }}
          onClose={() => {
            setShowDailyQuestModal(false);
            if (pendingBriefingRef.current) {
              pendingBriefingRef.current = false;
              setShowBriefingModal(true);
            }
          }}
        />
      )}

      {/* Daily 7-Day Attendance Check-in Modal */}
      {showDailyAttendanceModal && (
        <DailyAttendanceModal
          currentDayStreak={attendanceStreak}
          canClaimToday={canClaimAttendance}
          language={language}
          onClaim={handleClaimAttendance}
          onClose={() => setShowDailyAttendanceModal(false)}
        />
      )}

      {showGameOver && (
        <GameOverModal
          levelNumber={levelNumber}
          userCoins={coins}
          reviveCost={100}
          freeReviveAvailable={!freeReviveUsed}
          language={language}
          onRevive={handleRevive}
          onRetry={() => initLevel(levelNumber)}
        />
      )}

      {showBriefingModal && levelConfig && (
        <LevelBriefingModal
          config={levelConfig}
          tileThemeMap={tileThemeMap}
          language={language}
          onStart={() => {
            setShowBriefingModal(false);
            // 외계인 규칙이 처음 등장하거나 바뀌는 레벨에서 한 번 안내
            try {
              const hasAlien = boardTiles.some(t => t.isAlien);
              const key = levelNumber >= ALIEN_DEEP_LEVEL ? 'jelly_alien_intro_deep' : 'jelly_alien_intro_top';
              if (hasAlien && localStorage.getItem(key) !== '1') {
                localStorage.setItem(key, '1');
                window.setTimeout(() => showBoosterToast(
                  levelNumber >= ALIEN_DEEP_LEVEL
                    ? (language === 'ko' ? '👽 외계인이 아래층 천체까지 숨기기 시작했어요!' : '👽 Aliens now hide tiles in lower layers too!')
                    : (language === 'ko'
                        ? '👽 외계인 침공! 초록: 누르면 천체가 드러나요 · UFO: 누르면 사라져요 · 물음표: 정체를 몰라요'
                        : '👽 Alien invasion! Green: reveals a body · UFO: vanishes · ?: unknown until tapped'),
                  5200
                ), 2200);
              }
            } catch {
              /* ignore */
            }
            setPsychologicalBannerText(language === 'en' ? (levelConfig.failureRateTextEn || levelConfig.failureRateText) : levelConfig.failureRateText);
          }}
          onClose={() => {
            setShowBriefingModal(false);
            setPsychologicalBannerText(language === 'en' ? (levelConfig.failureRateTextEn || levelConfig.failureRateText) : levelConfig.failureRateText);
          }}
        />
      )}

      {/* Settings Modal (Audio, Language, Tile Text, How to Play, Restart) */}
      {showSettingsModal && (
        <SettingsModal
          language={language}
          isMuted={isMuted}
          isVoiceEnabled={isVoiceEnabled}
          showTileText={showTileText}
          onToggleMute={handleToggleMute}
          onToggleVoice={handleToggleVoice}
          onToggleTileText={handleToggleTileText}
          onToggleLanguage={handleToggleLanguage}
          onRestartLevel={() => initLevel(levelNumber, undefined, false)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showLevelModal && (
        <LevelModal
          currentLevel={levelNumber}
          highestUnlockedLevel={highestUnlockedLevel}
          language={language}
          onSelectLevel={lvl => initLevel(lvl)}
          onClose={() => setShowLevelModal(false)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal
          language={language}
          onClose={() => setShowHowToPlay(false)}
        />
      )}
    </div>
  );
}
