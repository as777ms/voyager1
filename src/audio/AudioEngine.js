import { mapValueToMidiChord } from './PixelSonifier';

/**
 * Note-name to frequency helper (e.g. 'C1' -> 32.70 Hz, 'A4' -> 440 Hz)
 */
const NOTE_OFFSETS = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

function noteToFreq(note) {
  if (typeof note === 'number' && Number.isFinite(note)) return note;
  if (typeof note !== 'string') return 440;
  const m = /^([A-G][#b]?)(-?\d+)$/.exec(note.trim());
  if (!m) return 440;
  const semitone = NOTE_OFFSETS[m[1]] ?? 9;
  const octave = parseInt(m[2], 10);
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Pure W3C Web Audio API Synthesizer Engine for NASA Space Apps "THE RECEIVER" / Earth Jukebox.
 * Uses a single native AudioContext so it never stalls after the first play, never crashes on
 * rapid polyphonic clicks, and works 100% locally without AudioWorklet blobs or external requests.
 */
class SonificationEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.delayNode = null;
    this.delayFeedback = null;
    this.delayWet = null;
    this.analyser = null;
    this.pinkBuffer = null;
    this.brownBuffer = null;

    this.isInitialized = false;
    this.currentVolume = 0.85;
    this.isMuted = false;
    this.activeTimers = new Set();
    this.lastPointCallAt = 0;
    this.lastPointKey = '';
  }

  /**
   * Creates or returns the single native Web Audio API context and master bus.
   */
  ensureCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -14;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.005;
      this.compressor.release.value = 0.18;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.currentVolume;

      // Stereo space echo bus (pure DelayNode + GainNode, zero AudioWorklets)
      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.value = 0.23;
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.value = 0.24;
      this.delayWet = this.ctx.createGain();
      this.delayWet.gain.value = 0.2;

      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.delayWet);
      this.delayWet.connect(this.compressor);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.75;

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.masterGain.connect(this.ctx.destination);

      this.buildNoiseBuffers();
      this.isInitialized = true;
    }
    return this.ctx;
  }

  buildNoiseBuffers() {
    if (!this.ctx) return;
    const sr = this.ctx.sampleRate || 44100;
    const len = sr * 2;

    // 1. Pink Noise Buffer (1/f spectrum for wind, rain, aerosols, thunder crackle)
    this.pinkBuffer = this.ctx.createBuffer(1, len, sr);
    const pinkOut = this.pinkBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkOut[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
      b6 = white * 0.115926;
    }

    // 2. Brown Noise Buffer (deep ocean surf, seismic rumble, Saturn V thrust)
    this.brownBuffer = this.ctx.createBuffer(1, len, sr);
    const brownOut = this.brownBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      brownOut[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = brownOut[i];
      brownOut[i] *= 1.8;
    }
  }

  /**
   * Synchronously unlocks the native AudioContext inside any user click/keydown gesture.
   */
  unlockSync() {
    try {
      const ctx = this.ensureCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
        ctx.resume().catch(() => {});
      }
      // 1-sample silent buffer ensures Linux PipeWire/ALSA & Chromium wake output immediately
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch {
      // Ignore pre-gesture errors
    }
  }

  async init() {
    this.unlockSync();
    return Boolean(this.ctx);
  }

  async ensureReady() {
    const ctx = this.ensureCtx();
    if (!ctx) return false;
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      try {
        await Promise.race([
          ctx.resume(),
          new Promise((resolve) => setTimeout(resolve, 60)),
        ]);
      } catch {
        // Proceed cleanly
      }
    }
    return true;
  }

  getAudioState() {
    return this.ctx?.state || 'suspended';
  }

  stopActiveSequences() {
    this.activeTimers.forEach((id) => clearTimeout(id));
    this.activeTimers.clear();
  }

  scheduleTimer(fn, delayMs) {
    const id = setTimeout(() => {
      this.activeTimers.delete(id);
      fn();
    }, delayMs);
    this.activeTimers.add(id);
    return id;
  }

  setVolume(volume, isMuted = false) {
    const safeVolume =
      typeof volume === 'number' && Number.isFinite(volume)
        ? Math.max(0, Math.min(1, volume))
        : 0.85;
    this.currentVolume = safeVolume;
    this.isMuted = Boolean(isMuted);
    const gainValue = this.isMuted ? 0 : safeVolume;

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setTargetAtTime(gainValue, this.ctx.currentTime, 0.02);
      } catch {
        this.masterGain.gain.value = gainValue;
      }
    }
  }

  mapLongitudeToPan(lon) {
    const safeLon =
      typeof lon === 'number' && Number.isFinite(lon)
        ? Math.max(-180, Math.min(180, lon))
        : 0;
    return safeLon / 180;
  }

  createPanner(pan = 0, startTime = 0) {
    if (!this.ctx || !this.compressor) return null;
    if (typeof this.ctx.createStereoPanner === 'function') {
      const p = this.ctx.createStereoPanner();
      p.pan.setValueAtTime(Math.max(-1, Math.min(1, Number(pan) || 0)), startTime);
      p.connect(this.compressor);
      return p;
    }
    return this.compressor;
  }

  /**
   * Core polyphonic oscillator voice with optional unison detune, BiquadFilter, and space delay send.
   */
  playVoice(
    freqInput,
    {
      type = 'triangle',
      attack = 0.012,
      duration = 0.38,
      amp = 0.45,
      pan = 0,
      detuneCents = 0,
      filterType = null,
      filterFreq = 1800,
      filterSweepTo = null,
      filterQ = 1.2,
      delaySend = 0.15,
      startOffset = 0,
    } = {}
  ) {
    const ctx = this.ensureCtx();
    if (!ctx || this.isMuted) return;

    const freq = Math.max(28, Math.min(9000, noteToFreq(freqInput)));
    const t0 = ctx.currentTime + Math.max(0.002, startOffset);
    const tEnd = t0 + Math.max(0.05, duration);
    const peakGain = Math.max(0.015, Math.min(0.65, amp * 0.38));

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peakGain, t0 + Math.min(attack, duration * 0.45));
    env.gain.exponentialRampToValueAtTime(0.0001, tEnd);

    let dest = this.createPanner(pan, t0);
    if (filterType) {
      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(Math.max(60, Math.min(12000, filterFreq)), t0);
      if (filterSweepTo) {
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(60, Math.min(12000, filterSweepTo)),
          tEnd
        );
      }
      filter.Q.setValueAtTime(filterQ, t0);
      env.connect(filter);
      filter.connect(dest);
    } else {
      env.connect(dest);
    }

    if (delaySend > 0 && this.delayNode) {
      const send = ctx.createGain();
      send.gain.value = delaySend;
      env.connect(send);
      send.connect(this.delayNode);
    }

    const detunes = detuneCents > 0 ? [-detuneCents, detuneCents] : [0];
    detunes.forEach((cents) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (cents !== 0) osc.detune.setValueAtTime(cents, t0);
      osc.connect(env);
      osc.start(t0);
      osc.stop(tEnd + 0.02);
    });
  }

  /**
   * 2-Operator FM Synthesizer Voice (bells, crystalline glaciers, gamelan, lightning strikes, electric piano).
   */
  playFMVoice(
    freqInput,
    {
      modRatio = 2.0,
      modIndex = 120,
      attack = 0.005,
      duration = 0.42,
      amp = 0.45,
      pan = 0,
      delaySend = 0.25,
      startOffset = 0,
    } = {}
  ) {
    const ctx = this.ensureCtx();
    if (!ctx || this.isMuted) return;

    const carrierFreq = Math.max(40, Math.min(8000, noteToFreq(freqInput)));
    const t0 = ctx.currentTime + Math.max(0.002, startOffset);
    const tEnd = t0 + Math.max(0.05, duration);
    const peakGain = Math.max(0.015, Math.min(0.55, amp * 0.34));

    const carrier = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const env = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(carrierFreq, t0);

    mod.type = 'sine';
    mod.frequency.setValueAtTime(carrierFreq * modRatio, t0);

    modGain.gain.setValueAtTime(modIndex, t0);
    modGain.gain.exponentialRampToValueAtTime(1, tEnd);

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peakGain, t0 + Math.min(attack, duration * 0.35));
    env.gain.exponentialRampToValueAtTime(0.0001, tEnd);

    const panner = this.createPanner(pan, t0);
    mod.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(env);
    env.connect(panner);

    if (delaySend > 0 && this.delayNode) {
      const send = ctx.createGain();
      send.gain.value = delaySend;
      env.connect(send);
      send.connect(this.delayNode);
    }

    mod.start(t0);
    carrier.start(t0);
    mod.stop(tEnd + 0.02);
    carrier.stop(tEnd + 0.02);
  }

  /**
   * Sub-bass pitch-dropping membrane drum (Chandra Binary Drum, thunder, seismic, heartbeat).
   */
  playSubDrum(
    startFreq = 135,
    endFreq = 34,
    { duration = 0.28, amp = 0.75, pan = 0, startOffset = 0 } = {}
  ) {
    const ctx = this.ensureCtx();
    if (!ctx || this.isMuted) return;

    const t0 = ctx.currentTime + Math.max(0.002, startOffset);
    const tEnd = t0 + Math.max(0.06, duration);
    const peak = Math.max(0.05, Math.min(0.8, amp * 0.55));

    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(Math.max(40, startFreq), t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(24, endFreq), tEnd);

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, tEnd);

    const panner = this.createPanner(pan, t0);
    osc.connect(env);
    env.connect(panner);
    osc.start(t0);
    osc.stop(tEnd + 0.02);
  }

  /**
   * Filtered Pink or Brown Noise burst (ocean surf, jetstream wind, rain, thunder crackle, Saturn V).
   */
  playNoiseBurst({
    noiseType = 'pink',
    duration = 0.35,
    attack = 0.015,
    amp = 0.45,
    pan = 0,
    filterType = 'bandpass',
    filterFreq = 900,
    filterSweepTo = null,
    filterQ = 2.0,
    startOffset = 0,
  } = {}) {
    const ctx = this.ensureCtx();
    if (!ctx || this.isMuted) return;
    const buffer = noiseType === 'brown' ? this.brownBuffer : this.pinkBuffer;
    if (!buffer) return;

    const t0 = ctx.currentTime + Math.max(0.002, startOffset);
    const tEnd = t0 + Math.max(0.05, Math.min(1.9, duration));
    const peak = Math.max(0.02, Math.min(0.65, amp * 0.45));

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(Math.max(60, Math.min(10000, filterFreq)), t0);
    if (filterSweepTo) {
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(60, Math.min(10000, filterSweepTo)),
        tEnd
      );
    }
    filter.Q.setValueAtTime(filterQ, t0);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + Math.min(attack, duration * 0.4));
    env.gain.exponentialRampToValueAtTime(0.0001, tEnd);

    const panner = this.createPanner(pan, t0);
    src.connect(filter);
    filter.connect(env);
    env.connect(panner);

    src.start(t0, Math.random() * 0.4);
    src.stop(tEnd + 0.02);
  }

  /**
   * Dual-formant vowel synthesizer for Voyager Spoken Greetings & Georgian Choir.
   */
  playFormantSyllable(
    pitchFreq,
    f1 = 520,
    f2 = 1480,
    { duration = 0.18, amp = 0.55, pan = 0, startOffset = 0 } = {}
  ) {
    const ctx = this.ensureCtx();
    if (!ctx || this.isMuted) return;

    const t0 = ctx.currentTime + Math.max(0.002, startOffset);
    const tEnd = t0 + duration;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(Math.max(85, Math.min(900, pitchFreq)), t0);

    const b1 = ctx.createBiquadFilter();
    b1.type = 'bandpass';
    b1.frequency.setValueAtTime(f1, t0);
    b1.Q.setValueAtTime(5.5, t0);

    const b2 = ctx.createBiquadFilter();
    b2.type = 'bandpass';
    b2.frequency.setValueAtTime(f2, t0);
    b2.Q.setValueAtTime(6.5, t0);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(Math.min(0.45, amp * 0.36), t0 + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, tEnd);

    const panner = this.createPanner(pan, t0);
    osc.connect(b1);
    osc.connect(b2);
    b1.connect(env);
    b2.connect(env);
    env.connect(panner);

    osc.start(t0);
    osc.stop(tEnd + 0.02);
  }

  speakGreeting(text, langCode = 'en-US') {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 0.94;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Formant synth already provides melodic voice
    }
  }

  /**
   * Subtle sci-fi UI telemetry ping for camera / sensor buttons.
   */
  playHudPing(freq = 880) {
    this.unlockSync();
    this.playFMVoice(freq, {
      modRatio: 2,
      modIndex: 45,
      attack: 0.003,
      duration: 0.11,
      amp: 0.35,
      pan: 0,
      delaySend: 0.1,
    });
  }

  /**
   * Instant audible verification triad (C4 -> E4 -> G4 -> C5)
   */
  async playTestTone() {
    this.unlockSync();
    await this.ensureReady();

    this.playVoice(261.63, { type: 'triangle', duration: 0.22, amp: 0.65, pan: -0.4, startOffset: 0 });
    this.playVoice(329.63, { type: 'triangle', duration: 0.22, amp: 0.65, pan: 0, startOffset: 0.11 });
    this.playFMVoice(392.0, { modRatio: 2, modIndex: 80, duration: 0.28, amp: 0.7, pan: 0.4, startOffset: 0.22 });
    this.playFMVoice(523.25, { modRatio: 3, modIndex: 90, duration: 0.38, amp: 0.75, pan: 0, startOffset: 0.34 });
    this.playSubDrum(110, 38, { duration: 0.22, amp: 0.6, pan: 0, startOffset: 0 });
  }

  /**
   * Plays a rich station-specific observation sound for all 14 stations & Voyager categories.
   */
  async playDataPoint(stationId, point, options = {}) {
    if (!point || typeof point !== 'object') return;
    this.unlockSync();
    await this.ensureReady();

    // Prevent accidental double-trigger within 50ms from simultaneous click + effect
    const nowMs = performance.now();
    const callKey = `${stationId}:${point.id || point.location || ''}:${options.year || ''}`;
    if (callKey === this.lastPointKey && nowMs - this.lastPointCallAt < 55) {
      return;
    }
    this.lastPointKey = callKey;
    this.lastPointCallAt = nowMs;

    const { invertPitch = false, year = 2026 } = options;
    const pan = this.mapLongitudeToPan(point.longitude);
    const crisisFactor = Math.max(0, Math.min(1, (year - 2010) / 16));

    let rawFreq =
      typeof point.frequency === 'number' && Number.isFinite(point.frequency)
        ? point.frequency
        : 440;
    rawFreq = Math.max(45, Math.min(4000, rawFreq));
    if (invertPitch) {
      rawFreq = Math.max(45, Math.min(4000, (440 * 440) / Math.max(60, rawFreq)));
    }
    const yearFreq = rawFreq * (1 + crisisFactor * 0.08);

    switch (stationId) {
      case 'nightLights':
      case 'urbanSoundscapes': {
        const rawVal = typeof point.value === 'number' ? point.value : 75;
        const amp = Math.min(0.95, Math.max(0.35, rawVal / 100));
        const interval = crisisFactor > 0.65 ? 1.414 : 1.498;
        this.playVoice(yearFreq, {
          type: 'triangle',
          detuneCents: 10,
          duration: 0.45,
          amp,
          pan,
        });
        this.playVoice(yearFreq * interval, {
          type: 'sine',
          duration: 0.42,
          amp: amp * 0.8,
          pan,
          startOffset: 0.05,
        });
        this.playFMVoice(yearFreq * 2, {
          modRatio: 3.01,
          modIndex: 95,
          duration: 0.35,
          amp: amp * 0.65,
          pan,
          startOffset: 0.12,
        });
        if (stationId === 'urbanSoundscapes') {
          this.playNoiseBurst({
            noiseType: 'pink',
            duration: 0.32,
            amp: 0.3,
            pan,
            filterType: 'bandpass',
            filterFreq: 1100,
          });
        }
        break;
      }

      case 'lightning':
      case 'naturalDisasters':
      case 'heavySounds': {
        const amp = Math.min(1.0, 0.65 + crisisFactor * 0.35);
        this.playFMVoice(yearFreq * (stationId === 'heavySounds' ? 2.0 : 3.5), {
          modRatio: 3.5,
          modIndex: 220,
          attack: 0.002,
          duration: 0.24,
          amp: amp * 0.78,
          pan,
        });
        this.playSubDrum(stationId === 'heavySounds' ? 120 : 150, 26, {
          duration: 0.45,
          amp,
          pan,
          startOffset: 0.01,
        });
        if (crisisFactor > 0.35 || stationId === 'heavySounds') {
          this.playSubDrum(95, 24, { duration: 0.38, amp: amp * 0.88, pan, startOffset: 0.18 });
        }
        this.playNoiseBurst({
          noiseType: stationId === 'heavySounds' ? 'brown' : 'pink',
          duration: 0.45 + crisisFactor * 0.25,
          amp: amp * 0.75,
          pan,
          filterType: 'bandpass',
          filterFreq: stationId === 'heavySounds' ? 680 : 1400,
          filterSweepTo: 240,
          startOffset: 0.02,
        });
        break;
      }

      case 'oceanCurrents':
      case 'seaLevel':
      case 'surfaceTemp':
      case 'seaNoise':
      case 'riverFlows':
      case 'weatherPatterns': {
        const temp = typeof point.temperatureC === 'number' ? point.temperatureC : 20;
        const cutoff = Math.max(300, Math.min(3800, 380 + (temp / 30) * 2200 + crisisFactor * 700));
        const thirdRatio = crisisFactor > 0.65 ? 1.189 : 1.25;

        [1, thirdRatio, 1.5].forEach((r, idx) => {
          this.playVoice(yearFreq * r, {
            type: 'sawtooth',
            detuneCents: 12,
            attack: 0.03,
            duration: 0.55,
            amp: 0.6,
            pan,
            filterType: 'lowpass',
            filterFreq: cutoff * 0.6,
            filterSweepTo: cutoff,
            startOffset: idx * 0.03,
          });
        });
        this.playNoiseBurst({
          noiseType: 'brown',
          duration: 0.55,
          attack: 0.06,
          amp: 0.48 + crisisFactor * 0.2,
          pan,
          filterType: 'lowpass',
          filterFreq: 420,
          filterSweepTo: cutoff * 0.5,
        });
        break;
      }

      case 'glacierVelocity': {
        this.playFMVoice(yearFreq * 2, {
          modRatio: 3.01,
          modIndex: 130,
          duration: 0.45,
          amp: 0.78,
          pan,
        });
        this.playFMVoice(yearFreq * 3, {
          modRatio: 2.0,
          modIndex: 110,
          duration: 0.4,
          amp: 0.68,
          pan,
          startOffset: 0.08,
        });
        this.playFMVoice(yearFreq * 4, {
          modRatio: 3.01,
          modIndex: 90,
          duration: 0.35,
          amp: 0.55,
          pan,
          startOffset: 0.16,
        });
        this.playSubDrum(95, 30, {
          duration: 0.35,
          amp: 0.55 + crisisFactor * 0.35,
          pan,
          startOffset: 0.07,
        });
        break;
      }

      case 'fireLocations':
      case 'aerosols': {
        const filterFreq = 520 + crisisFactor * 1300;
        const ratio = crisisFactor > 0.6 ? 1.414 : 1.5;
        this.playVoice(yearFreq, {
          type: 'sawtooth',
          detuneCents: 14,
          duration: 0.48,
          amp: 0.72,
          pan,
          filterType: 'bandpass',
          filterFreq,
          filterSweepTo: filterFreq * 1.6,
          filterQ: 2.5,
        });
        this.playVoice(yearFreq * ratio, {
          type: 'sawtooth',
          duration: 0.44,
          amp: 0.62,
          pan,
          filterType: 'bandpass',
          filterFreq: filterFreq * 1.2,
          startOffset: 0.04,
        });
        this.playNoiseBurst({
          noiseType: 'pink',
          duration: 0.42,
          amp: 0.55 + crisisFactor * 0.25,
          pan,
          filterType: 'bandpass',
          filterFreq: 950,
          filterSweepTo: 2200,
          filterQ: 3.0,
        });
        break;
      }

      case 'co2':
      case 'ozoneLayer':
      case 'relaxingSounds': {
        const ratios =
          stationId === 'relaxingSounds'
            ? [0.5, 1.0, 1.25, 1.5]
            : stationId === 'ozoneLayer'
            ? [1.0, 1.333, 1.5, 2.0]
            : [0.5, 1.0, crisisFactor > 0.65 ? 1.414 : 1.498];
        ratios.forEach((r, idx) => {
          this.playVoice(yearFreq * r, {
            type: 'triangle',
            detuneCents: 10,
            attack: 0.02,
            duration: 0.58,
            amp: 0.64,
            pan,
            filterType: 'lowpass',
            filterFreq: 1600,
            startOffset: stationId === 'ozoneLayer' ? idx * 0.06 : 0,
          });
        });
        if (stationId === 'ozoneLayer') {
          this.playFMVoice(yearFreq * 2.5, {
            modRatio: 2.0,
            modIndex: 110,
            duration: 0.35,
            amp: 0.55,
            pan,
            startOffset: 0.12,
          });
        } else if (stationId === 'relaxingSounds') {
          this.playNoiseBurst({
            noiseType: 'brown',
            duration: 0.6,
            attack: 0.1,
            amp: 0.28,
            pan,
            filterType: 'lowpass',
            filterFreq: 520,
          });
        }
        break;
      }

      case 'forest': {
        [1.0, 1.25, 1.5, 2.0].forEach((r, idx) => {
          this.playVoice(yearFreq * r, {
            type: 'triangle',
            attack: 0.004,
            duration: 0.24,
            amp: 0.8 - idx * 0.1,
            pan,
            startOffset: idx * 0.09,
          });
        });
        this.playFMVoice(yearFreq * 3.5, {
          modRatio: 2.5,
          modIndex: 160,
          attack: 0.005,
          duration: 0.16,
          amp: 0.42,
          pan,
          startOffset: 0.28,
        });
        break;
      }

      case 'voyagerRecord':
      case 'voyagerSounds':
      case 'voyagerMusic':
      case 'voyagerImages': {
        this.playVoyagerCategorySound(point, rawFreq, pan);
        break;
      }

      default: {
        this.playVoice(yearFreq, { type: 'triangle', duration: 0.38, amp: 0.72, pan });
        this.playVoice(yearFreq * 1.5, {
          type: 'sine',
          duration: 0.38,
          amp: 0.6,
          pan,
          startOffset: 0.06,
        });
        break;
      }
    }
  }

  /**
   * Synthesizes distinct multi-layered Voyager Golden Record audio signatures
   * (Seismic, Nature, Biosphere/Whale, Human Heartbeat, Saturn V Rocket, Pulsar CP 1919, World Music, Spoken Greetings).
   */
  playVoyagerCategorySound(point, rawFreq = 261.63, pan = 0) {
    const cat = point.audioCategory || 'speech';

    if (cat === 'seismic') {
      this.playSubDrum(130, 26, { duration: 0.65, amp: 0.95, pan, startOffset: 0 });
      this.playSubDrum(98, 24, { duration: 0.6, amp: 0.85, pan, startOffset: 0.22 });
      this.playNoiseBurst({
        noiseType: 'brown',
        duration: 0.85,
        amp: 0.85,
        pan,
        filterType: 'lowpass',
        filterFreq: 380,
        filterSweepTo: 120,
      });
    } else if (cat === 'nature') {
      this.playNoiseBurst({
        noiseType: 'brown',
        duration: 0.9,
        attack: 0.08,
        amp: 0.72,
        pan,
        filterType: 'lowpass',
        filterFreq: 350,
        filterSweepTo: 1400,
      });
      [1, 1.25, 1.5, 2].forEach((r, idx) => {
        this.playVoice(rawFreq * r, {
          type: 'sine',
          duration: 0.35,
          amp: 0.55,
          pan,
          startOffset: idx * 0.09,
        });
      });
    } else if (cat === 'bio') {
      // Crickets / Bird chirps + Whale call glide
      [2200, 2850, 2450, 3100, 2600].forEach((f, idx) => {
        this.playFMVoice(f, {
          modRatio: 2.4,
          modIndex: 180,
          attack: 0.004,
          duration: 0.11,
          amp: 0.48,
          pan: (idx % 2 === 0 ? -0.35 : 0.35),
          startOffset: idx * 0.11,
        });
      });
      this.playVoice(rawFreq, {
        type: 'triangle',
        detuneCents: 12,
        attack: 0.06,
        duration: 0.75,
        amp: 0.72,
        pan,
        filterType: 'lowpass',
        filterFreq: 420,
        filterSweepTo: 1600,
      });
    } else if (cat === 'human') {
      // Lub-Dub Heartbeat + Warm Human Harmony
      this.playSubDrum(82, 34, { duration: 0.18, amp: 0.92, pan, startOffset: 0 });
      this.playSubDrum(68, 30, { duration: 0.22, amp: 0.78, pan, startOffset: 0.18 });
      this.playSubDrum(82, 34, { duration: 0.18, amp: 0.92, pan, startOffset: 0.58 });
      this.playSubDrum(68, 30, { duration: 0.22, amp: 0.78, pan, startOffset: 0.76 });
      this.playVoice(rawFreq * 1.5, { type: 'triangle', duration: 0.5, amp: 0.55, pan, startOffset: 0.1 });
      this.playVoice(rawFreq * 2.0, { type: 'sine', duration: 0.5, amp: 0.5, pan, startOffset: 0.25 });
    } else if (cat === 'tech') {
      // Apollo Saturn V Lift-off Thrust + Brass Chord
      this.playSubDrum(110, 26, { duration: 0.9, amp: 0.98, pan, startOffset: 0 });
      this.playNoiseBurst({
        noiseType: 'brown',
        duration: 1.0,
        attack: 0.05,
        amp: 0.9,
        pan,
        filterType: 'bandpass',
        filterFreq: 240,
        filterSweepTo: 1800,
        filterQ: 1.4,
      });
      [65.41, 98.0, 130.81, 196.0].forEach((f) => {
        this.playVoice(f, {
          type: 'sawtooth',
          detuneCents: 16,
          attack: 0.05,
          duration: 0.85,
          amp: 0.55,
          pan,
          filterType: 'lowpass',
          filterFreq: 1600,
        });
      });
    } else if (cat === 'pulsar') {
      // Pulsar CP 1919 Rapid Magnetic Clock Ticks
      this.playVoice(92.5, { type: 'sawtooth', duration: 0.85, amp: 0.55, pan, filterType: 'lowpass', filterFreq: 600 });
      for (let i = 0; i < 6; i++) {
        this.playFMVoice(1480, {
          modRatio: 3.0,
          modIndex: 140,
          attack: 0.002,
          duration: 0.07,
          amp: 0.78 - i * 0.06,
          pan: (i % 2 === 0 ? -0.3 : 0.3),
          startOffset: i * 0.13,
        });
      }
    } else if (cat === 'music') {
      const title = String(point.value || point.id || '');
      if (title.includes('Gamelan') || title.includes('gamelan')) {
        this.playVoyagerMusicTrack('gamelan', pan);
      } else if (title.includes('Chakrulo') || title.includes('chakrulo')) {
        this.playVoyagerMusicTrack('chakrulo', pan);
      } else {
        this.playVoyagerMusicTrack('bach', pan);
      }
    } else {
      // Spoken Language Greeting: Unique vowel formant melody + Web Speech API
      const spoken = String(point.spokenText || point.value || 'Hello');
      const seed = spoken.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const vowels = [
        [730, 1090], // 'ah'
        [530, 1840], // 'eh'
        [270, 2290], // 'ee'
        [570, 840],  // 'oh'
        [300, 870],  // 'oo'
      ];
      const ratios = [1.0, 1.125, 1.25, 1.125, 1.333, 1.5];
      ratios.forEach((r, idx) => {
        const [f1, f2] = vowels[(seed + idx) % vowels.length];
        const noteFreq = Math.max(130, Math.min(520, rawFreq * r));
        this.playFormantSyllable(noteFreq, f1, f2, {
          duration: 0.16,
          amp: 0.72,
          pan,
          startOffset: idx * 0.13,
        });
      });
      this.playVoice(rawFreq * 0.5, {
        type: 'triangle',
        duration: 0.7,
        amp: 0.45,
        pan,
      });
      if (point.spokenText) {
        this.speakGreeting(point.spokenText, point.langCode || 'en-US');
      }
    }
  }

  /**
   * Dedicated Voyager Golden Record World Music Synthesizer (8 iconic tracks).
   */
  playVoyagerMusicTrack(trackId, pan = 0) {
    this.unlockSync();
    switch (trackId) {
      case 'gamelan': {
        // Javanese Slendro 5-tone metallophone shimmer
        const notes = [293.66, 336.0, 392.0, 448.0, 523.25, 448.0, 392.0, 587.33];
        notes.forEach((f, idx) => {
          this.playFMVoice(f, {
            modRatio: 2.76,
            modIndex: 130,
            attack: 0.003,
            duration: 0.34,
            amp: 0.74,
            pan: (idx % 2 === 0 ? -0.35 : 0.35),
            startOffset: idx * 0.13,
          });
        });
        this.playSubDrum(98, 49, { duration: 0.5, amp: 0.65, pan: 0, startOffset: 0 });
        break;
      }
      case 'chakrulo': {
        // Georgian 3-part polyphonic vocal drone + soaring tenor melody
        this.playFormantSyllable(146.83, 570, 840, { duration: 1.1, amp: 0.65, pan: -0.3, startOffset: 0 });
        this.playFormantSyllable(220.0, 730, 1090, { duration: 1.1, amp: 0.65, pan: 0.3, startOffset: 0 });
        const melody = [293.66, 329.63, 349.23, 392.0, 440.0, 392.0];
        melody.forEach((f, idx) => {
          this.playFormantSyllable(f, 530, 1840, {
            duration: 0.2,
            amp: 0.8,
            pan: 0,
            startOffset: idx * 0.18,
          });
        });
        break;
      }
      case 'panpipes': {
        // Peruvian Andean Sikuri Panpipes + Bombo Drum
        const pipes = [523.25, 659.25, 587.33, 493.88, 440.0, 392.0, 440.0];
        pipes.forEach((f, idx) => {
          this.playVoice(f, {
            type: 'triangle',
            detuneCents: 14,
            attack: 0.025,
            duration: 0.22,
            amp: 0.72,
            pan: (idx % 2 === 0 ? -0.4 : 0.4),
            startOffset: idx * 0.15,
          });
          this.playNoiseBurst({
            noiseType: 'pink',
            duration: 0.08,
            amp: 0.28,
            pan: 0,
            filterType: 'bandpass',
            filterFreq: f * 2,
            filterQ: 4,
            startOffset: idx * 0.15,
          });
        });
        this.playSubDrum(110, 42, { duration: 0.24, amp: 0.75, pan: 0, startOffset: 0 });
        this.playSubDrum(110, 42, { duration: 0.24, amp: 0.7, pan: 0, startOffset: 0.45 });
        break;
      }
      case 'senegal': {
        // Senegalese Polyrhythmic Talking Drum & Sabar Ensemble
        const hits = [
          { f0: 190, f1: 75, t: 0.0, p: -0.4 },
          { f0: 260, f1: 140, t: 0.14, p: 0.4 },
          { f0: 150, f1: 52, t: 0.28, p: 0.0 },
          { f0: 310, f1: 180, t: 0.42, p: -0.3 },
          { f0: 220, f1: 95, t: 0.56, p: 0.3 },
          { f0: 140, f1: 45, t: 0.70, p: 0.0 },
        ];
        hits.forEach((h) => {
          this.playSubDrum(h.f0, h.f1, { duration: 0.18, amp: 0.85, pan: h.p, startOffset: h.t });
        });
        break;
      }
      case 'navajo': {
        // Navajo Night Chant pentatonic ceremonial vocal + rattle pulse
        const chant = [392.0, 392.0, 329.63, 293.66, 261.63, 293.66, 261.63];
        chant.forEach((f, idx) => {
          this.playFormantSyllable(f, 650, 1200, {
            duration: 0.18,
            amp: 0.78,
            pan: 0,
            startOffset: idx * 0.15,
          });
          this.playNoiseBurst({
            noiseType: 'pink',
            duration: 0.06,
            amp: 0.32,
            pan: 0.25,
            filterType: 'bandpass',
            filterFreq: 3200,
            startOffset: idx * 0.15,
          });
        });
        break;
      }
      case 'beethoven': {
        // Beethoven Symphony No. 5 Fate Motif (G4 - G4 - G4 - Eb4)
        const motif = [
          { f: 392.0, d: 0.15, t: 0.0 },
          { f: 392.0, d: 0.15, t: 0.18 },
          { f: 392.0, d: 0.15, t: 0.36 },
          { f: 311.13, d: 0.65, t: 0.54 },
        ];
        motif.forEach((m) => {
          this.playVoice(m.f, { type: 'sawtooth', detuneCents: 14, duration: m.d, amp: 0.78, pan, filterType: 'lowpass', filterFreq: 2200, startOffset: m.t });
          this.playVoice(m.f * 0.5, { type: 'triangle', duration: m.d, amp: 0.7, pan, startOffset: m.t });
        });
        break;
      }
      case 'berry': {
        // Chuck Berry Johnny B. Goode Rock & Roll Double-Stop Riff
        const riff = [392.0, 440.0, 466.16, 493.88, 587.33, 587.33, 493.88, 587.33];
        riff.forEach((f, idx) => {
          this.playVoice(f, {
            type: 'sawtooth',
            detuneCents: 10,
            attack: 0.004,
            duration: 0.14,
            amp: 0.75,
            pan: (idx % 2 === 0 ? -0.25 : 0.25),
            filterType: 'lowpass',
            filterFreq: 2600,
            startOffset: idx * 0.11,
          });
        });
        break;
      }
      case 'bach':
      default: {
        // J.S. Bach Brandenburg Concerto No. 2 in F Major Baroque Counterpoint
        const bach = [349.23, 440.0, 523.25, 698.46, 587.33, 523.25, 466.16, 523.25];
        bach.forEach((f, idx) => {
          this.playVoice(f, {
            type: 'triangle',
            attack: 0.004,
            duration: 0.16,
            amp: 0.78,
            pan: (idx % 2 === 0 ? -0.3 : 0.3),
            startOffset: idx * 0.11,
          });
          this.playFMVoice(f * 2, {
            modRatio: 2.0,
            modIndex: 45,
            attack: 0.003,
            duration: 0.14,
            amp: 0.42,
            pan: 0,
            startOffset: idx * 0.11,
          });
        });
        break;
      }
    }
  }

  /**
   * Synthesizes a 512-line SSTV scanline sweep + geometric melody for Voyager's 116 Encoded Images.
   */
  playVoyagerEncodedImage(imgId, pan = 0) {
    this.unlockSync();
    // 1977 Voyager analog video raster sync chirp (2.4 kHz -> 1.2 kHz)
    this.playFMVoice(1960, {
      modRatio: 1.5,
      modIndex: 110,
      attack: 0.002,
      duration: 0.08,
      amp: 0.45,
      pan: -0.5,
      startOffset: 0,
    });

    const patterns = {
      'img-circle': [261.63, 329.63, 392.0, 523.25, 392.0, 329.63],
      'img-solar': [130.81, 196.0, 261.63, 392.0, 587.33, 783.99],
      'img-dna': [293.66, 440.0, 349.23, 523.25, 392.0, 587.33],
      'img-earth': [196.0, 246.94, 293.66, 392.0, 493.88, 587.33],
      'img-continents': [110.0, 164.81, 220.0, 277.18, 329.63, 440.0],
      'img-human': [220.0, 261.63, 329.63, 392.0, 440.0, 523.25],
      'img-taj': [261.63, 311.13, 392.0, 466.16, 523.25, 622.25],
      'img-launch': [65.41, 130.81, 196.0, 261.63, 392.0, 523.25],
    };
    const notes = patterns[imgId] || patterns['img-circle'];
    notes.forEach((f, idx) => {
      this.playVoice(f, {
        type: 'triangle',
        attack: 0.006,
        duration: 0.18,
        amp: 0.76,
        pan: pan || ((idx - 2.5) * 0.28),
        startOffset: 0.06 + idx * 0.12,
      });
      this.playFMVoice(f * 2, {
        modRatio: 2.0,
        modIndex: 60,
        attack: 0.004,
        duration: 0.14,
        amp: 0.42,
        pan: 0,
        startOffset: 0.06 + idx * 0.12,
      });
    });
  }

  /**
   * Triggers a distinct musical voice for each of the 12 NASA SVS Map layers.
   */
  triggerLayerVoice(layer, chord, normVal, startOffset = 0, pan = 0) {
    const freqs = chord?.frequencies?.length ? chord.frequencies : [261.63, 329.63, 392.0];
    const amp = Math.max(0.28, Math.min(0.95, chord?.amplitude ?? 0.68));
    const svsId = layer?.svsId;

    if (svsId === '5153' || svsId === '5196' || svsId === '5147') {
      // Carbon Monoxide (#5153), DYAMOND CO2 (#5196) & GEOS Temperature (#5147): Warm analog thermal pad
      const cutoff = 380 + normVal * 2400;
      freqs.forEach((f) => {
        this.playVoice(f, {
          type: 'sawtooth',
          detuneCents: 12,
          attack: 0.02,
          duration: 0.32,
          amp: amp * 0.78,
          pan,
          filterType: 'lowpass',
          filterFreq: cutoff * 0.6,
          filterSweepTo: cutoff,
          startOffset,
        });
      });
    } else if (svsId === '4950' || svsId === '5154') {
      // GEDI Forest Height (#4950) & NOx/Ozone (#5154): Crisp woody Marimba / Glass arpeggio
      this.playVoice(freqs[0], {
        type: 'triangle',
        attack: 0.004,
        duration: 0.22,
        amp: amp * 0.88,
        pan,
        startOffset,
      });
      this.playVoice(freqs[2] || freqs[0] * 1.5, {
        type: 'triangle',
        attack: 0.004,
        duration: 0.22,
        amp: amp * 0.76,
        pan,
        startOffset: startOffset + 0.06,
      });
    } else if (svsId === '3912' || svsId === '5425' || svsId === '5533' || svsId === '5152') {
      // Sea Surface Currents (#3912) & 30-Yr Sea Level (#5533): Fluid swirling ocean pad + crystal FM chime
      const cutoff = 360 + normVal * 2200;
      freqs.slice(0, 2).forEach((f) => {
        this.playVoice(f, {
          type: 'triangle',
          detuneCents: 10,
          duration: 0.34,
          amp: amp * 0.75,
          pan,
          filterType: 'lowpass',
          filterFreq: cutoff,
          startOffset,
        });
      });
      this.playFMVoice(Math.min(2800, freqs[freqs.length - 1] * 1.5), {
        modRatio: 2.0,
        modIndex: 85,
        duration: 0.24,
        amp: amp * 0.58,
        pan,
        startOffset: startOffset + 0.03,
      });
    } else if (svsId === '5669' || svsId === '5151' || svsId === '5148' || svsId === '5072') {
      // GEOS Aerosols (#5669) & Wind/Hurricanes (#5148 / #5072): Bandpass shimmer + cyclonic wind sweep
      const filterFreq = 480 + normVal * 1800;
      freqs.slice(0, 2).forEach((f) => {
        this.playVoice(f, {
          type: 'sawtooth',
          duration: 0.3,
          amp: amp * 0.72,
          pan,
          filterType: 'bandpass',
          filterFreq,
          filterQ: 2.2,
          startOffset,
        });
      });
      if (normVal > 0.22) {
        this.playNoiseBurst({
          noiseType: 'pink',
          duration: 0.22,
          amp: Math.min(0.5, normVal * 0.5),
          pan,
          filterType: 'bandpass',
          filterFreq,
          startOffset,
        });
      }
    } else if (svsId === '5011') {
      // ISS Lightning (#5011): High electric FM strike + crackle
      this.playFMVoice(freqs[0] * 1.5, {
        modRatio: 3.01,
        modIndex: 150,
        attack: 0.002,
        duration: 0.22,
        amp: amp * 0.85,
        pan,
        startOffset,
      });
      if (normVal > 0.35) {
        this.playNoiseBurst({
          noiseType: 'pink',
          duration: 0.16,
          amp: Math.min(0.6, normVal * 0.6),
          pan,
          filterType: 'bandpass',
          filterFreq: 1600,
          startOffset: startOffset + 0.015,
        });
      }
    } else if (svsId === '4960' || svsId === '5149') {
      // Atmospheric River / Precipitation (#4960): Crisp water-drop plucks
      const dropFreq = Math.min(2400, freqs[0] * 1.5);
      this.playVoice(dropFreq, {
        type: 'triangle',
        attack: 0.003,
        duration: 0.16,
        amp: amp * 0.84,
        pan,
        startOffset,
      });
      this.playVoice(dropFreq * 1.33, {
        type: 'sine',
        attack: 0.003,
        duration: 0.16,
        amp: amp * 0.68,
        pan,
        startOffset: startOffset + 0.055,
      });
    } else {
      // #5313 Night Lights: Starry electric-piano city arpeggio
      this.playVoice(freqs[0], {
        type: 'triangle',
        attack: 0.004,
        duration: 0.24,
        amp: amp * 0.82,
        pan,
        startOffset,
      });
      this.playFMVoice(freqs[1] || freqs[0] * 1.25, {
        modRatio: 2.0,
        modIndex: 75,
        duration: 0.26,
        amp: amp * 0.68,
        pan,
        startOffset: startOffset + 0.045,
      });
    }
  }

  /**
   * Plays one scanned canvas longitude slice using NASA-IMPACT C1..A6 MIDI chords + Chandra Binary Drum.
   */
  async playSonifiedColumn(scanResult, layer) {
    if (!scanResult || !layer) return;
    this.unlockSync();
    await this.ensureReady();

    const chord = scanResult.dominantChord;
    const pan = scanResult.pan ?? 0;
    const amp = Math.max(0.28, Math.min(0.95, chord?.amplitude ?? 0.65));

    this.triggerLayerVoice(layer, chord, scanResult.peakNorm ?? 0.5, 0, pan);

    if (scanResult.binaryPulse === 1) {
      this.playSubDrum(125, 34, { duration: 0.18, amp: Math.min(0.85, amp * 0.8), pan, startOffset: 0 });
    }
  }

  /**
   * Plays an immediate single-pixel / cursor probe MIDI chord (C1..A6) with stereo pan.
   */
  async playProbeChord(probeResult, layer) {
    if (!probeResult?.chord || !layer) return;
    this.unlockSync();
    await this.ensureReady();

    const pan = probeResult.pan ?? 0;
    this.triggerLayerVoice(layer, probeResult.chord, probeResult.normalized ?? 0.5, 0, pan);

    if (probeResult.binaryPulse === 1) {
      this.playSubDrum(120, 34, {
        duration: 0.18,
        amp: Math.min(0.8, (probeResult.chord.amplitude ?? 0.65) * 0.75),
        pan,
        startOffset: 0.01,
      });
    }
  }

  /**
   * Sweeps 5 calibration steps across the layer's color legend from Min to Max.
   */
  async playScaleCalibration(layer, options = {}) {
    if (!layer) return;
    this.unlockSync();
    this.stopActiveSequences();
    await this.ensureReady();

    const { invertPitch = false, speak = false } = options;
    if (speak && layer.audioLegendSummary) {
      this.speakGreeting(`${layer.title}. ${layer.audioLegendSummary}`, 'ru-RU');
    }

    const steps = [0.0, 0.25, 0.5, 0.75, 1.0];
    steps.forEach((norm, idx) => {
      const mapped = mapValueToMidiChord(norm, {
        higherDataLowerPitch: layer.defaultHigherIsLowerPitch ?? true,
        invertPitch,
      });
      const pan = (idx - 2) * 0.4;
      this.triggerLayerVoice(layer, mapped, norm, idx * 0.32, pan);
    });
  }

  /**
   * Plays a 6-slice spatial sweep across a selected Country / Region bounding box.
   */
  async playRegionSweep(regionAnalysis, layer) {
    if (!regionAnalysis?.slices?.length || !layer) return;
    this.unlockSync();
    await this.ensureReady();

    regionAnalysis.slices.forEach((slice, idx) => {
      const offset = idx * 0.28;
      const pan = slice.pan ?? 0;
      this.triggerLayerVoice(layer, slice.chord, slice.normalized ?? 0.5, offset, pan);

      if (slice.binaryPulse === 1) {
        const amp = Math.max(0.35, slice.chord?.amplitude ?? 0.7);
        this.playSubDrum(125, 34, {
          duration: 0.18,
          amp: Math.min(0.85, amp * 0.78),
          pan,
          startOffset: offset + 0.01,
        });
      }
    });
  }

  /**
   * Plays every observation point in a station sequentially using NASA-IMPACT C1..A6 chords.
   */
  async playStationSequence(station, svsLayer, options = {}) {
    if (!station?.data?.length || !svsLayer) return;
    this.unlockSync();
    this.stopActiveSequences();
    await this.ensureReady();

    const { invertPitch = false, onStep, onComplete } = options;
    const values = station.data.map((pt) =>
      typeof pt.value === 'number' ? pt.value : pt.frequency || 50
    );
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const span = Math.max(1e-6, maxVal - minVal);

    station.data.forEach((pt, idx) => {
      const raw = typeof pt.value === 'number' ? pt.value : pt.frequency || 50;
      const norm = station.data.length === 1 ? 0.5 : (raw - minVal) / span;
      const chord = mapValueToMidiChord(norm, {
        higherDataLowerPitch: svsLayer.defaultHigherIsLowerPitch ?? true,
        invertPitch,
      });
      const pan = this.mapLongitudeToPan(pt.longitude);

      this.scheduleTimer(() => {
        this.triggerLayerVoice(svsLayer, chord, norm, 0, pan);
        if (onStep) onStep(idx, chord);
        if (idx === station.data.length - 1 && onComplete) {
          this.scheduleTimer(() => onComplete(), 420);
        }
      }, idx * 400);
    });
  }

  /**
   * Interactive audio demonstration for the 5 rules in DecodingKeyModal.
   */
  playDecodingDemo(ruleIndex = 0) {
    this.unlockSync();
    this.stopActiveSequences();

    if (ruleIndex === 0) {
      // 1. Pitch C1..A6 scale demo
      [523.25, 392.0, 261.63, 196.0, 130.81].forEach((f, idx) => {
        this.playVoice(f, { type: 'triangle', duration: 0.24, amp: 0.72, pan: 0, startOffset: idx * 0.18 });
      });
    } else if (ruleIndex === 1) {
      // 2. Stereo Panning West (-1) -> Prime Meridian (0) -> East (+1)
      [-0.9, -0.45, 0, 0.45, 0.9].forEach((p, idx) => {
        this.playFMVoice(329.63 + idx * 55, {
          modRatio: 2,
          modIndex: 80,
          duration: 0.24,
          amp: 0.75,
          pan: p,
          startOffset: idx * 0.2,
        });
      });
    } else if (ruleIndex === 2) {
      // 3. MIDI Velocity 35 -> 127 crescendo
      [0.25, 0.45, 0.7, 0.98].forEach((a, idx) => {
        this.playVoice(293.66, { type: 'sawtooth', duration: 0.22, amp: a, pan: 0, filterType: 'lowpass', filterFreq: 600 + a * 1800, startOffset: idx * 0.22 });
      });
    } else if (ruleIndex === 3) {
      // 4. Chandra Binary Rhythm (0/1 anomaly beat)
      [0, 0.18, 0.36, 0.54, 0.72].forEach((t, idx) => {
        this.playSubDrum(140, 34, { duration: 0.16, amp: idx % 2 === 0 ? 0.9 : 0.55, pan: 0, startOffset: t });
        this.playFMVoice(idx % 2 === 0 ? 587.33 : 440, { duration: 0.12, amp: 0.55, pan: 0, startOffset: t });
      });
    } else {
      // 5. Timbre Comparison: Starry Bell vs Ocean Swell vs Forest Marimba
      this.playFMVoice(523.25, { modRatio: 3.01, modIndex: 120, duration: 0.28, amp: 0.75, pan: -0.5, startOffset: 0 });
      this.playVoice(261.63, { type: 'sawtooth', duration: 0.32, amp: 0.75, pan: 0, filterType: 'lowpass', filterFreq: 900, startOffset: 0.3 });
      this.playVoice(392.0, { type: 'triangle', attack: 0.003, duration: 0.24, amp: 0.85, pan: 0.5, startOffset: 0.62 });
    }
  }

  getWaveform() {
    if (!this.analyser) return new Float32Array(64);
    try {
      const buf = new Float32Array(this.analyser.frequencyBinCount || 64);
      this.analyser.getFloatTimeDomainData(buf);
      return buf;
    } catch {
      return new Float32Array(64);
    }
  }
}

export const audioEngine = new SonificationEngine();
