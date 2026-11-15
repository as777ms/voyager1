import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Radio, Crosshair, Cpu, Eye, Radar, Waves } from 'lucide-react';
import StationsList from './StationsList';
import DecodingKeyWidget from './DecodingKeyWidget';
import BottomToolbar from './BottomToolbar';
import AudioControls from './AudioControls';
import DataExplorer from './DataExplorer';
import DecodingKeyModal from './DecodingKeyModal';
import WorldMapModal from './WorldMapModal';
import VoyagerAudioModal from './VoyagerAudioModal';
import AccessibilityModal from '../accessibility/AccessibilityModal';
import ScreenReaderAnnouncer from '../accessibility/ScreenReaderAnnouncer';
import { useReceiverStore } from '../../store/useReceiverStore';
import { audioEngine } from '../../audio/AudioEngine';

export default function MainInterface() {
  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const togglePlay = useReceiverStore((s) => s.togglePlay);
  const nextPoint = useReceiverStore((s) => s.nextPoint);
  const prevPoint = useReceiverStore((s) => s.prevPoint);
  const setStation = useReceiverStore((s) => s.setStation);
  const toggleMute = useReceiverStore((s) => s.toggleMute);
  const isDecodingKeyOpen = useReceiverStore((s) => s.isDecodingKeyOpen);
  const setDecodingKeyOpen = useReceiverStore((s) => s.setDecodingKeyOpen);
  const isDataExplorerOpen = useReceiverStore((s) => s.isDataExplorerOpen);
  const setDataExplorerOpen = useReceiverStore((s) => s.setDataExplorerOpen);
  const isWorldMapOpen = useReceiverStore((s) => s.isWorldMapOpen);
  const setWorldMapOpen = useReceiverStore((s) => s.setWorldMapOpen);
  const closeAllModals = useReceiverStore((s) => s.closeAllModals);
  const cameraPreset = useReceiverStore((s) => s.cameraPreset);
  const setCameraPreset = useReceiverStore((s) => s.setCameraPreset);
  const sensorMode = useReceiverStore((s) => s.sensorMode);
  const setSensorMode = useReceiverStore((s) => s.setSensorMode);
  const selectedYear = useReceiverStore((s) => s.selectedYear);
  const invertPitch = useReceiverStore((s) => s.invertPitch);
  const highContrast = useReceiverStore((s) => s.highContrast);
  const activeStation = useReceiverStore((s) => s.getActiveStation());

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
        return;
      }
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        audioEngine.unlockSync();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        audioEngine.unlockSync();
        nextPoint();
        if (!useReceiverStore.getState().isPlaying) {
          const state = useReceiverStore.getState();
          const pt = state.getCurrentPoint();
          audioEngine.playDataPoint(state.currentStationId, pt, {
            invertPitch: state.invertPitch,
            year: state.selectedYear,
          });
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevPoint();
        if (!useReceiverStore.getState().isPlaying) {
          const state = useReceiverStore.getState();
          const pt = state.getCurrentPoint();
          audioEngine.playDataPoint(state.currentStationId, pt, {
            invertPitch: state.invertPitch,
            year: state.selectedYear,
          });
        }
      } else if (e.key === '1') setStation('voyagerRecord');
      else if (e.key === '2') setStation('nightLights');
      else if (e.key === '3') setStation('lightning');
      else if (e.key === '4') setStation('oceanCurrents');
      else if (e.key === '5') setStation('glacierVelocity');
      else if (e.key === '6') setStation('fireLocations');
      else if (e.key === '7') setStation('forest');
      else if (e.key === 'd' || e.key === 'D') setDecodingKeyOpen(!isDecodingKeyOpen);
      else if (e.key === 'e' || e.key === 'E' || e.key === 't' || e.key === 'T') {
        setDataExplorerOpen(!isDataExplorerOpen);
      } else if (e.key === 'w' || e.key === 'W') setWorldMapOpen(!isWorldMapOpen);
      else if (e.key === 'm' || e.key === 'M') toggleMute();
      else if (e.key === 'c' || e.key === 'C') {
        const presets = ['overview', 'alien', 'disc', 'earth'];
        const currentIdx = presets.indexOf(cameraPreset);
        setCameraPreset(presets[(currentIdx + 1) % presets.length]);
      }
    };

    const handleGestureUnlock = () => {
      audioEngine.unlockSync();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handleGestureUnlock, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handleGestureUnlock);
    };
  }, [
    togglePlay,
    nextPoint,
    prevPoint,
    setStation,
    isDecodingKeyOpen,
    setDecodingKeyOpen,
    isDataExplorerOpen,
    setDataExplorerOpen,
    isWorldMapOpen,
    setWorldMapOpen,
    closeAllModals,
    toggleMute,
    cameraPreset,
    setCameraPreset,
  ]);

  const cameraButtons = [
    { id: 'overview', label: 'CAM 01: SCENE' },
    { id: 'alien', label: 'CAM 02: ALIEN' },
    { id: 'disc', label: 'CAM 03: DISC' },
    { id: 'earth', label: 'CAM 04: HORIZON' },
  ];

  // Vertical Sensor / Camera Pods next to the Alien
  const sensorPods = [
    { id: 'optical', label: 'OPT-CAM', preset: 'overview', icon: Camera },
    { id: 'thermal', label: 'IR-SCAN', preset: 'alien', icon: Eye },
    { id: 'radar', label: 'SAR-POD', preset: 'overview', icon: Radar },
    { id: 'seismic', label: 'GEO-SNS', preset: 'earth', icon: Crosshair },
    { id: 'acoustic', label: 'WAV-REC', preset: 'disc', icon: Waves },
  ];

  // Interactive Floating Hotspots in Center Space / Earth Horizon
  const floatingHotspots = [
    {
      id: 'hs-glacier',
      stationId: 'glacierVelocity',
      title: 'Hotspot: Pamir Glacier',
      metric: 'Ice Velocity: 142.5 m/yr (TJ)',
      posClass: 'top-[38%] left-[48%]',
    },
    {
      id: 'hs-aerosol',
      stationId: 'fireLocations',
      title: 'Hotspot: Thermal Anomaly',
      metric: 'Fire Radiative: +465 MW',
      posClass: 'top-[55%] left-[44%]',
    },
    {
      id: 'hs-lightning',
      stationId: 'lightning',
      title: 'Hotspot: ISS-LIS Flash',
      metric: 'Lightning Activity: Peak',
      posClass: 'top-[70%] left-[42%]',
    },
  ];

  const handleHotspotClick = (stationId) => {
    setStation(stationId);
    useReceiverStore.setState({ isPlaying: true });
    const st = useReceiverStore.getState().getActiveStation();
    if (st && st.data[0]) {
      audioEngine.playDataPoint(stationId, st.data[0], {
        invertPitch,
        year: selectedYear,
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-30 flex h-full w-full overflow-hidden select-none ${
        highContrast ? 'contrast-125' : ''
      }`}
    >
      <ScreenReaderAnnouncer />

      {/* ── LEFT & CENTER MAIN WORKSPACE ───────────────────────── */}
      <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-3.5 relative h-full min-w-0">
        {/* 1. TOP SYSTEM BAR + CAMERA SELECTOR + VOYAGER HEADER */}
        <div className="flex flex-col gap-1.5 w-full z-20">
          {/* Top Framed OS Header Bar (Matches Reference Image) */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="y2k-window rounded-lg px-3 py-1.5 flex items-center justify-between pointer-events-auto mr-[132px] lg:mr-0"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-600 border border-blue-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85)]" />
              <span className="text-xs sm:text-sm font-extrabold font-mono tracking-wider text-white uppercase drop-shadow">
                SPACE APPS CHALLENGE <span className="text-cyan-300">2026</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-cyan-300/90 tracking-widest uppercase">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>VOYAGER OS // BUILD 7884.DP</span>
            </div>

            <button
              onClick={() => setWorldMapOpen(true)}
              className="y2k-aqua-btn px-2.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer hidden sm:flex items-center gap-1"
            >
              <span>WORLDVIEW MAP [W]</span>
            </button>
          </motion.div>

          {/* Sub-row: Camera Selector Pills (Left) & Active Golden Record Title (Right-Center) */}
          <div className="flex items-center justify-between gap-2">
            <div className="hidden sm:flex items-center gap-1 y2k-window p-1 rounded-lg pointer-events-auto">
              <Camera className="w-3.5 h-3.5 text-cyan-400 mx-1 shrink-0" />
              {cameraButtons.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => {
                    audioEngine.playHudPing(740);
                    setCameraPreset(cam.id);
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    cameraPreset === cam.id
                      ? 'y2k-aqua-btn'
                      : 'y2k-metal-btn text-slate-300 hover:text-white'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            {/* Right-Center Header above Golden Record */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-black/55 border border-amber-400/35 backdrop-blur-md mr-6">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-200 uppercase">
                EARTH STATION: {activeStation.name}
              </span>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE OVERLAYS: Vertical Sensor Pods (Left of Center) & Floating Earth Hotspots */}
        <div className="relative flex-1 w-full pointer-events-none">
          {/* Vertical Receiver Sensor / Camera Stack next to the Alien (Matches Reference Image) */}
          <div className="hidden md:flex flex-col gap-1.5 absolute left-[195px] lg:left-[230px] top-4 pointer-events-auto y2k-window p-1.5 rounded-xl">
            
            {sensorPods.map((pod) => {
              const Icon = pod.icon;
              const isSelected = sensorMode === pod.id;
              return (
                <button
                  key={pod.id}
                  onClick={() => {
                    audioEngine.playHudPing(920);
                    setSensorMode(pod.id);
                    setCameraPreset(pod.preset);
                  }}
                  title={`Switch Receiver Sensor: ${pod.label}`}
                  className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'y2k-lcd border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.35)]'
                      : 'y2k-metal-btn text-slate-300 hover:text-white'
                  }`}

                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[7px] font-mono font-bold tracking-tighter">
                    {pod.label}
                  </span>
                </button>
              );
            })}
          </div>


          {/* ///now im thinking about it  */}

          {/* Floating Interactive Hotspot Labels over Center Space / Earth */}
          <div className="hidden xl:block">
            {floatingHotspots.map((hs) => {
              const isCurrent = activeStation.id === hs.stationId;
              return (
                <button
                  key={hs.id}
                  onClick={() => handleHotspotClick(hs.stationId)}
                  className={`absolute ${hs.posClass} pointer-events-auto text-left px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isCurrent
                      ? 'y2k-lcd border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                      : 'bg-[#071122]/85 border border-cyan-500/40 hover:border-cyan-300 backdrop-blur-md'
                  }`}
                >
                  <div className="text-[9px] font-mono text-slate-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>{hs.title}</span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-cyan-300">
                    {hs.metric}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. BOTTOM WORKSPACE ROW: Equal-Width Left Stack (THE RECEIVER + DECODING KEY) & Right Controls */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-end justify-between gap-2.5 w-full z-20">
          {/* Bottom-Left Equal-Width Stack (w-full sm:w-[310px]) directly beneath the Alien & UFO */}
          <div className="flex flex-col gap-2 w-full sm:w-[310px] shrink-0 pointer-events-auto">
            {/* Panel 1: THE RECEIVER (Exact same width sm:w-[310px] as DecodingKeyWidget below it) */}
            <div className="y2k-window w-full sm:w-[310px] rounded-xl overflow-hidden">
              <div className="y2k-titlebar px-3 py-1 flex items-center justify-between text-[9px] font-mono text-cyan-200">
                <span className="font-bold tracking-wider">RECEIVER_CORE_SYS</span>
                <span className="text-emerald-300">● SIGNAL LOCKED</span>
              </div>

              <div className="p-2.5 sm:p-3">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h1 className="text-lg sm:text-xl font-extrabold font-mono tracking-wider text-white uppercase drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]">
                    THE RECEIVER
                  </h1>

                  <svg
                    className="w-16 h-4 text-cyan-400 stroke-current shrink-0"
                    viewBox="0 0 100 24"
                    fill="none"
                  >
                    <path
                      d="M0 12H20L28 3L36 21L44 8L52 16L60 12H100"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={isPlaying ? 'animate-pulse' : ''}
                    />
                  </svg>
                </div>

                {/* Updated Subtitle as requested ("An auditory gateway to Earth.") */}
                <p className="text-xs italic text-cyan-300 font-sans">
                  An auditory gateway to Earth.
                </p>
              </div>
            </div>

            {/* Panel 2: THE DECODING KEY (Exact same width sm:w-[310px] on xl+ screens) */}
            <div className="hidden xl:block">
              <DecodingKeyWidget />
            </div>
          </div>

          {/* Bottom-Center/Right: Audio Deck + Bottom Toolbar */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <AudioControls />
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex justify-center">
                <BottomToolbar />
              </div>
              <div className="y2k-lcd px-2.5 py-1 rounded text-right hidden 2xl:block shrink-0">
                <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase">
                  HEAR EARTH.
                </div>
                <div className="text-[10px] font-mono font-extrabold text-amber-300 uppercase">
                  DECODE THE SIGNAL.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAR-RIGHT FULL-HEIGHT DOCKED DASHBOARD (3 Sections) ── */}
      <StationsList />

      {/* Collapsible Full Data Explorer Drawer */}
      <div className="pointer-events-auto">
        <DataExplorer />
      </div>

      {/* Modals */}
      <div className="pointer-events-auto">
        <DecodingKeyModal />
        <WorldMapModal />
        <VoyagerAudioModal />
        <AccessibilityModal />
      </div>
    </div>
  );
}
