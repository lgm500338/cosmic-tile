/**
 * Web Audio API & Deep Masculine Arcade Voice Announcer
 * "GREAT!", "EXCELLENT!", "PERFECT!", "UNBELIEVABLE!"
 * Modeled after Candy Crush / Royal Match deep baritone male voice.
 * Plus tactile ice shatter, water bubble pops (왁뿌볼), and golden coin clinks!
 */

export type VoiceCalloutType = 'great' | 'excellent' | 'perfect' | 'unbelievable' | 'clear';

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true;
  private speechVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Default to unmuted so sound works out of the box!
    const savedMute = localStorage.getItem('jelly_match_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    } else {
      this.isMuted = false;
    }

    const savedVoice = localStorage.getItem('jelly_voice_enabled');
    if (savedVoice !== null) {
      this.isVoiceEnabled = savedVoice === 'true';
    } else {
      this.isVoiceEnabled = true;
    }

    if (typeof window !== 'undefined') {
      // Auto-unlock AudioContext on first user interaction
      const unlock = () => {
        this.resumeContext();
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });

      // Cache voices
      if ('speechSynthesis' in window) {
        const updateVoices = () => {
          this.speechVoices = window.speechSynthesis.getVoices();
        };
        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = updateVoices;
        }
      }
    }
  }

  public resumeContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private getReadyContext(): AudioContext | null {
    this.resumeContext();
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('jelly_match_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.playSquish();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleVoice(): boolean {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    localStorage.setItem('jelly_voice_enabled', String(this.isVoiceEnabled));
    return this.isVoiceEnabled;
  }

  public getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  /**
   * Synthesized Deep Arcade Brass Horn (Baritone fanfare chord)
   * Guaranteed rich masculine boom in Web Audio on any device/browser
   */
  public playArcadeFanfare(intensity: number = 1) {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.01;
      const baseFreqs = [116.54, 174.61, 233.08, 293.66, 349.23];
      const duration = 0.38 + intensity * 0.06;

      baseFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.015);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, now);
        filter.frequency.exponentialRampToValueAtTime(1600, now + 0.06);
        filter.frequency.exponentialRampToValueAtTime(450, now + duration);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.015);
        osc.stop(now + duration + 0.05);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Deep masculine arcade announcer voice (Candy Crush / Royal Match style)
   * High-fidelity human-like natural neural voice without robotic distortion.
   */
  public speak(phrase: VoiceCalloutType) {
    if (this.isMuted) return;

    // 1. Always play the deep brass fanfare in Web Audio
    const intensityMap: Record<VoiceCalloutType, number> = {
      great: 1,
      excellent: 2,
      perfect: 3,
      unbelievable: 4,
      clear: 3,
    };
    this.playArcadeFanfare(intensityMap[phrase] || 1);

    // 2. Play Speech Synthesis if available and enabled
    if (!this.isVoiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Ensure voices are freshly loaded if initially empty
      if (this.speechVoices.length === 0) {
        this.speechVoices = window.speechSynthesis.getVoices();
      }

      // CANCEL ANY PENDING/PREVIOUS SPEECH TO PREVENT QUEUE PILE-UP!
      window.speechSynthesis.cancel();

      const phraseMap: Record<VoiceCalloutType, string> = {
        great: 'Great!',
        excellent: 'Excellent!',
        perfect: 'Perfect!',
        unbelievable: 'Unbelievable!',
        clear: 'Level Clear!',
      };

      const text = phraseMap[phrase] || 'Great!';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      // Deep resonant masculine baritone pitch (0.72-0.75 gives a heavy, authoritative deep male tone)
      utterance.pitch = 0.72;
      utterance.rate = 0.96;
      utterance.volume = 1.0;

      // STRICT MALE VOICE FILTERING (Completely blacklist female voices, specifically 'Google US English' which is female!)
      if (this.speechVoices.length > 0) {
        const isFemaleVoice = (name: string): boolean => {
          const n = name.toLowerCase();
          return (
            n.includes('google us english') || // Chrome default female voice!
            n.includes('female') ||
            n.includes('zira') ||
            n.includes('samantha') ||
            n.includes('victoria') ||
            n.includes('karen') ||
            n.includes('jenny') ||
            n.includes('aria') ||
            n.includes('sara') ||
            n.includes('eva') ||
            n.includes('anna') ||
            n.includes('helen') ||
            n.includes('susan') ||
            n.includes('linda') ||
            n.includes('cathy') ||
            n.includes('hazel') ||
            n.includes('fiona')
          );
        };

        // Priority 1: Explicitly verified deep male natural voices
        const verifiedMaleVoice = this.speechVoices.find(v => {
          const n = v.name.toLowerCase();
          const l = v.lang.toLowerCase();
          if (isFemaleVoice(n)) return false;
          const isEn = l.startsWith('en');
          return (
            isEn &&
            (n.includes('google uk english male') ||
              n.includes('guy') ||
              n.includes('ryan') ||
              n.includes('david') ||
              n.includes('mark') ||
              n.includes('daniel') ||
              n.includes('alex') ||
              n.includes('fred') ||
              n.includes('george') ||
              n.includes('tom') ||
              n.includes('oliver') ||
              n.includes('andrew') ||
              n.includes('brian') ||
              n.includes('male'))
          );
        });

        // Priority 2: Any English voice that is NOT female
        const nonFemaleEnVoice = this.speechVoices.find(v => {
          const n = v.name.toLowerCase();
          const l = v.lang.toLowerCase();
          return l.startsWith('en') && !isFemaleVoice(n);
        });

        const selectedVoice = verifiedMaleVoice || nonFemaleEnVoice;
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Small 15ms delay after cancel to ensure clean browser audio channel transition
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          // ignore
        }
      }, 15);
    } catch {
      // Ignore
    }
  }

  /**
   * Stop all ongoing voices immediately (on stage clear, restart, or game over)
   */
  public stopVoice() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Golden Coin chime sound (when matching 3 tiles and earning 3 coins)
   */
  public playCoin() {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.01;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.06); // E6

      osc2.frequency.setValueAtTime(1975.53, now); // B6
      osc2.frequency.setValueAtTime(2637.02, now + 0.06); // E7

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.34);
      osc2.stop(now + 0.34);
    } catch {
      // ignore
    }
  }

  /**
   * Jelly Squish & Plop (when tapping a tile)
   */
  public playSquish() {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Ice Breaking / Crystal Shatter Sound (얼음 깨지는 소리)
   */
  public playIceBreak() {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.01;
      const bufferSize = Math.floor(ctx.sampleRate * 0.09);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4200, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      const crystalNotes = [1760, 2637, 3520];
      crystalNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.015);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.25);

        g.gain.setValueAtTime(0.24, now + idx * 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        osc.connect(g);
        g.connect(ctx.destination);

        osc.start(now + idx * 0.015);
        osc.stop(now + 0.3);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Water Bubble Pop / 왁뿌볼 소리
   */
  public playWaterBubble() {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // ignore
    }
  }

  /**
   * Match-3 Sequence with Sound Variety, Coin Clink, and Deep Voice
   */
  public playMatch(comboLevel: number = 1) {
    if (this.isMuted) return;

    this.playCoin();

    if (comboLevel % 2 === 1) {
      this.playWaterBubble();
    } else {
      this.playIceBreak();
    }

    // 콤보 음성(기계음 TTS)은 뺐다: 앱 안 브라우저에서 잘 안 나오고 소리가 어색해서. 효과음과 화면 문구만 사용
  }

  public playWhoosh() {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // ignore
    }
  }

  /**
   * Blocked / Locked Tile tactile sound feedback
   * Playful wooden thud indicating the tile cannot be extracted because it's occluded
   */
  public playBlocked() {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.005;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.16);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.16);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }

  /**
   * Triumphant Royal Brass Fanfare for Level Completion
   * Plays a majestic, uplifting fanfare flourish with brass overtone chords and bell chimes
   */
  public playFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.01;

      // 1. Triumphant Brass Fanfare notes: C4 -> E4 -> G4 -> C5 -> G4 -> C5 (Sustained grand finish)
      const brassNotes = [
        { f: 261.63, start: 0.0, dur: 0.12 }, // C4
        { f: 329.63, start: 0.13, dur: 0.12 }, // E4
        { f: 392.00, start: 0.26, dur: 0.14 }, // G4
        { f: 523.25, start: 0.42, dur: 0.18 }, // C5
        { f: 392.00, start: 0.62, dur: 0.12 }, // G4
        { f: 523.25, start: 0.76, dur: 0.65 }, // C5 (Big sustained finale)
      ];

      brassNotes.forEach(note => {
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.f, now + note.start);

        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(note.f * 2, now + note.start);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(note.f * 2, now + note.start);
        filter.Q.setValueAtTime(1.5, now + note.start);

        const startTime = now + note.start;
        const endTime = startTime + note.dur;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.24, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(endTime + 0.05);
        oscHarmonic.start(startTime);
        oscHarmonic.stop(endTime + 0.05);
      });

      // 2. Sparkling Celebration Bell Chimes in higher octave
      const bellPitches = [1046.50, 1318.51, 1567.98, 2093.00];
      bellPitches.forEach((pitch, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, now + 0.76 + i * 0.08);

        const bellStart = now + 0.76 + i * 0.08;
        gain.gain.setValueAtTime(0.14, bellStart);
        gain.gain.exponentialRampToValueAtTime(0.0001, bellStart + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(bellStart);
        osc.stop(bellStart + 0.55);
      });

    } catch {
      // ignore
    }
  }

  public playVictory() {
    this.playFanfare();
  }

  public playDefeat() {
    if (this.isMuted) return;
    try {
      const ctx = this.getReadyContext();
      if (!ctx) return;

      const now = ctx.currentTime + 0.01;
      const notes = [440, 392, 349.23, 293.66];
      let t = now;
      notes.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.22);
        t += 0.14;
      });
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundController();
