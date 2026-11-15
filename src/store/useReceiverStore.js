import { create } from 'zustand';
import { NASA_STATIONS } from '../data/nasaData';
import { getSvsLayerForStation } from '../data/svsLayers';
import { audioEngine } from '../audio/AudioEngine';

export const useReceiverStore = create((set, get) => ({
  // Active Station & Data Point
  currentStationId: 'voyagerRecord',
  currentIndex: 0,

  // Crisis & Climate Timeline (2010 -> 2026)
  selectedYear: 2026,

  // Receiver Sensor Mode (Left Vertical Camera Stack)
  sensorMode: 'optical', // 'optical' | 'thermal' | 'radar' | 'seismic' | 'acoustic'

  // Playback
  isPlaying: false,
  isMuted: false,
  volume: 0.8,
  scanSpeed: 2400,

  // 3D Scene Controls
  cameraPreset: 'overview', // 'overview' | 'alien' | 'ufo' | 'disc' | 'earth'
  isUserControllingCamera: false,

  // Audio Engine status
  isAudioStarted: false,
  visualIntensity: 0,

  // Interface Modals
  isDecodingKeyOpen: false,
  isAccessibilityModalOpen: false,
  isDataExplorerOpen: false,
  isWorldMapOpen: false,
  isVoyagerModalOpen: false,
  voyagerModalTab: 'greetings',
  activeSvsLayerId: 'svs-5153',

  // Accessibility & Global Hover Audio Reader
  invertPitch: false,
  highContrast: false,
  reducedMotion: false,
  announcementText: 'System ready. The Receiver — An auditory gateway to Earth initialized.',
  isHoverAudioActive: false,
  hoverAnnounceText: '',
  lastHoverSpoken: '',

  // Selectors
  getActiveStation: () => {
    const { currentStationId } = get();
    return NASA_STATIONS.find((s) => s.id === currentStationId) || NASA_STATIONS[0];
  },

  getCurrentPoint: () => {
    const station = get().getActiveStation();
    const { currentIndex } = get();
    const safeIdx = Math.max(0, Math.min(station.data.length - 1, currentIndex));
    return station.data[safeIdx] || station.data[0];
  },

  // Compute year-adjusted telemetry & crisis anomaly index (0.0 in 2010 -> 1.0 in 2026)
  getYearTelemetry: () => {
    const { selectedYear } = get();
    const station = get().getActiveStation();
    const point = get().getCurrentPoint();
    const progress = Math.max(0, Math.min(1, (selectedYear - 2010) / 16));
    const anomalyIndex = station.isVoyagerSpecial ? 0 : progress;

    let displayValue = point?.value;
    if (typeof point?.value === 'number' && !station.isVoyagerSpecial) {
      const delta = (station.yearTrend || 0) * (selectedYear - 2026);
      displayValue = +(point.value + delta).toFixed(1);
    }

    const statusLabel = station.isVoyagerSpecial
      ? 'ARCHIVAL 1977'
      : progress < 0.35
      ? 'NOMINAL (CALM)'
      : progress < 0.75
      ? 'ELEVATED DRIFT'
      : 'CRISIS ANOMALY';

    return {
      selectedYear,
      progress,
      anomalyIndex,
      displayValue,
      statusLabel,
    };
  },

  // Actions
  setStation: (stationId) => {
    const station = NASA_STATIONS.find((s) => s.id === stationId);
    if (!station) return;
    const linkedSvs = getSvsLayerForStation(stationId);
    set({
      currentStationId: stationId,
      currentIndex: 0,
      activeSvsLayerId: linkedSvs.id,
      announcementText: `Switched to ${station.name}. Linked dataset SVS #${linkedSvs.svsId}.`,
    });
  },

  setSelectedYear: (year) => {
    const safeYear = typeof year === 'number' && Number.isFinite(year)
      ? Math.max(2010, Math.min(2026, Math.round(year)))
      : 2026;
    set({
      selectedYear: safeYear,
      announcementText: `Timeline calibrated to year ${safeYear}.`,
    });
  },

  setSensorMode: (mode) => {
    set({ sensorMode: mode });
  },

  setIndex: (index) => {
    const station = get().getActiveStation();
    if (!station || !station.data.length) return;
    const safeNum = (typeof index === 'number' && Number.isFinite(index)) ? Math.floor(index) : 0;
    const safeIndex = ((safeNum % station.data.length) + station.data.length) % station.data.length;
    const point = station.data[safeIndex];
    set({
      currentIndex: safeIndex,
      announcementText: `Observation at ${point.location}. Value: ${point.value} ${station.parameterUnit}.`,
    });
  },

  nextPoint: () => {
    const { currentIndex } = get();
    get().setIndex(currentIndex + 1);
  },

  prevPoint: () => {
    const { currentIndex } = get();
    get().setIndex(currentIndex - 1);
  },

  setIsPlaying: (isPlaying) => {
    set({
      isPlaying: Boolean(isPlaying),
      announcementText: isPlaying ? 'Sonification transmission active.' : 'Sonification transmission paused.',
    });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    get().setIsPlaying(!isPlaying);
  },

  setVolume: (volume) => {
    const safeVolume = (typeof volume === 'number' && Number.isFinite(volume))
      ? Math.max(0, Math.min(1, volume))
      : 0.8;
    set({ volume: safeVolume, isMuted: safeVolume === 0 });
  },

  toggleMute: () => {
    const { isMuted } = get();
    set({ isMuted: !isMuted });
  },

  setCameraPreset: (cameraPreset) => {
    const validPresets = ['overview', 'alien', 'disc', 'earth'];
    const safePreset = validPresets.includes(cameraPreset) ? cameraPreset : 'overview';
    set({ cameraPreset: safePreset, isUserControllingCamera: false });
  },

  setDecodingKeyOpen: (isOpen) => set({ isDecodingKeyOpen: Boolean(isOpen) }),
  setAccessibilityModalOpen: (isOpen) => set({ isAccessibilityModalOpen: Boolean(isOpen) }),
  setDataExplorerOpen: (isOpen) => set({ isDataExplorerOpen: Boolean(isOpen) }),
  setWorldMapOpen: (isOpen) => set({ isWorldMapOpen: Boolean(isOpen) }),
  setVoyagerModalOpen: (isOpen, tab) =>
    set((s) => ({
      isVoyagerModalOpen: Boolean(isOpen),
      voyagerModalTab: tab || s.voyagerModalTab,
    })),
  setVoyagerModalTab: (tab) => set({ voyagerModalTab: tab }),
  setActiveSvsLayerId: (layerId) => set({ activeSvsLayerId: layerId }),
  closeAllModals: () => set({
    isDecodingKeyOpen: false,
    isAccessibilityModalOpen: false,
    isWorldMapOpen: false,
    isVoyagerModalOpen: false,
  }),
  setAudioStarted: (isAudioStarted) => set({ isAudioStarted: Boolean(isAudioStarted) }),

  setInvertPitch: (invertPitch) => set({ invertPitch: Boolean(invertPitch) }),
  setHighContrast: (highContrast) => set({ highContrast: Boolean(highContrast) }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion: Boolean(reducedMotion) }),

  setVisualIntensity: (intensity) => {
    const safe = (typeof intensity === 'number' && Number.isFinite(intensity))
      ? Math.max(0, Math.min(1, intensity))
      : 0;
    set({ visualIntensity: safe });
  },

  // Global Hover Audio Reader actions
  toggleHoverAudio: () => {
    const next = !get().isHoverAudioActive;
    audioEngine.unlockSync();
    if (next) {
      const welcome = 'Audio Reader Activated: Hover over any button or section to hear functions and telemetry.';
      audioEngine.speakHoverCue(welcome, { rate: 1.15, actionType: 'toggle' });
      set({
        isHoverAudioActive: true,
        hoverAnnounceText: welcome,
        lastHoverSpoken: welcome,
        announcementText: welcome,
      });
    } else {
      audioEngine.stopHoverSpeech();
      audioEngine.playEarcon('toggle');
      set({
        isHoverAudioActive: false,
        hoverAnnounceText: '',
        lastHoverSpoken: '',
        announcementText: 'Audio Reader Deactivated.',
      });
    }
  },

  setHoverAudioActive: (isActive) => {
    set({ isHoverAudioActive: Boolean(isActive) });
  },

  announceHover: (label, actionType = 'default') => {
    if (!get().isHoverAudioActive || !label) return;
    if (get().lastHoverSpoken === label) return;

    set({
      hoverAnnounceText: label,
      lastHoverSpoken: label,
      announcementText: label,
    });
    audioEngine.speakHoverCue(label, { rate: 1.15, actionType });
  },

  clearHover: () => {
    setTimeout(() => {
      set({ lastHoverSpoken: '' });
    }, 120);
  },
}));
