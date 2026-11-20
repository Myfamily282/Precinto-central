class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.muted = window.localStorage.getItem('precinto_muted') === '1';
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('precinto_muted', this.muted ? '1' : '0');
    }
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.08, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public click() {
    this.tone(520, 0.06, 'triangle', 0.05);
  }

  public cardFlip() {
    this.tone(380, 0.09, 'sine', 0.07);
    this.tone(570, 0.12, 'sine', 0.06, 0.05);
  }

  public chatPop() {
    this.tone(660, 0.07, 'sine', 0.045);
  }

  public spotFound() {
    this.tone(587.33, 0.1, 'triangle', 0.08);
    this.tone(880, 0.18, 'triangle', 0.08, 0.07);
  }

  public errorThud() {
    this.tone(175, 0.14, 'sawtooth', 0.06);
    this.tone(130, 0.16, 'sawtooth', 0.05, 0.06);
  }

  public voteCast() {
    this.tone(440, 0.08, 'sine', 0.07);
    this.tone(659.25, 0.14, 'sine', 0.07, 0.06);
  }

  public revealSuccess() {
    this.tone(523.25, 0.14, 'triangle', 0.08);
    this.tone(659.25, 0.14, 'triangle', 0.08, 0.1);
    this.tone(783.99, 0.25, 'triangle', 0.09, 0.2);
  }

  public revealAlert() {
    this.tone(330, 0.16, 'sawtooth', 0.06);
    this.tone(293.66, 0.18, 'sawtooth', 0.06, 0.12);
    this.tone(246.94, 0.28, 'sawtooth', 0.07, 0.24);
  }

  public folderOpen(isImpostor: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Soft paper-rustle filtered noise burst for folder cover opening
    const duration = 0.26;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.35;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + duration);
    filter.Q.value = 1.1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(ctx.currentTime);

    // Subtle stamp / role reveal accent
    if (isImpostor) {
      this.tone(196, 0.14, 'triangle', 0.07, 0.32);
      this.tone(155.56, 0.24, 'triangle', 0.07, 0.44);
    } else {
      this.tone(392, 0.12, 'triangle', 0.06, 0.32);
      this.tone(523.25, 0.22, 'triangle', 0.07, 0.43);
    }
  }

  /** Chalk-on-slate scratch & ceramic tap for Chalkboard buttons */
  public chalkWrite() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Crisp dry chalk tap
    this.tone(1480, 0.032, 'triangle', 0.055, 0);
    this.tone(2150, 0.04, 'sine', 0.04, 0.015);

    // Gritty chalk stroke across slate
    const duration = 0.17;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      // Slightly grainy envelope mimicking chalk friction
      const grain = 0.65 + 0.35 * Math.sin(progress * Math.PI * 14);
      const env = Math.sin(progress * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * grain;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(3400, now + duration);
    filter.Q.value = 3.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  /** Soft felt-eraser swipe on chalkboard */
  public chalkErase() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.32;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(620, now);
    filter.frequency.exponentialRampToValueAtTime(1250, now + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(540, now + duration);
    filter.Q.value = 0.9;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.095, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  /** Warm wooden desk / panel tap */
  public woodTap() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(125, now + 0.055);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /** Corkboard thumbtack pin sound when pinning a clue */
  public pinTack() {
    this.woodTap();
    this.tone(920, 0.045, 'sine', 0.06, 0.015);
    this.tone(1320, 0.055, 'triangle', 0.04, 0.03);
  }

  /** Soft pencil/pen scratch when adding a detective note */
  public noteWrite() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 0.11;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.6;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1750, now);
    filter.Q.value = 2.0;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  /** Metallic vault keypad / dial click for Safe Cracker minigame */
  public safeDialClick() {
    this.tone(1180, 0.03, 'square', 0.032, 0);
    this.tone(1740, 0.045, 'triangle', 0.05, 0.01);
  }

  /** Vault dial backspace latch */
  public safeBackspace() {
    this.tone(620, 0.035, 'triangle', 0.05, 0);
    this.tone(410, 0.05, 'triangle', 0.045, 0.025);
  }

  /** Heavy metallic vault unlock chime */
  public safeUnlock() {
    this.tone(320, 0.09, 'triangle', 0.07, 0);
    this.tone(523.25, 0.14, 'triangle', 0.08, 0.08);
    this.tone(783.99, 0.24, 'sine', 0.08, 0.18);
  }

  /** Crisp archive tab switch */
  public tabSwitch() {
    this.tone(460, 0.04, 'triangle', 0.045, 0);
    this.tone(640, 0.06, 'sine', 0.04, 0.025);
  }

  /** Mechanical switch click for settings toggles */
  public toggleSwitch() {
    this.tone(720, 0.03, 'triangle', 0.055, 0);
    this.tone(540, 0.04, 'sine', 0.04, 0.02);
  }
}

export const soundFX = new SoundEngine();
