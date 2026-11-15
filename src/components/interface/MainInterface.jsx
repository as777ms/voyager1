import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Radio } from 'lucide-react';
import StationsList from './StationsList';
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

  // Interactive Floating Hotspots in Center Space / Earth Horizon (positioned cleanly over Earth, clear of the satellite)
  const floatingHotspots = [
    {
      id: 'hs-glacier',
      stationId: 'glacierVelocity',
      title: 'Hotspot: Pamir Glacier',
      metric: 'Ice Velocity: 142.5 m/yr (TJ)',
      posClass: 'top-[32%] left-[53%]',
    },
    {
      id: 'hs-aerosol',
      stationId: 'fireLocations',
      title: 'Hotspot: Thermal Anomaly',
      metric: 'Fire Radiative: +465 MW',
      posClass: 'top-[52%] left-[49%]',
    },
    {
      id: 'hs-lightning',
      stationId: 'lightning',
      title: 'Hotspot: ISS-LIS Flash',
      metric: 'Lightning Activity: Peak',
      posClass: 'top-[70%] left-[45%]',
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
    <>
    <div
      className={`fixed inset-0 pointer-events-none z-30 p-2 sm:p-3 lg:p-4 xl:p-5 flex h-full w-full overflow-hidden select-none ${
        highContrast ? 'contrast-125' : ''
      }`}
    >
      <ScreenReaderAnnouncer />

      {/* Outer Framed HUD Container (Clean margins & subtle sci-fi bezel for all laptop sizes) */}
      <div className="flex flex-1 h-full w-full min-w-0 gap-2.5 lg:gap-3.5 rounded-xl sm:rounded-2xl border border-cyan-500/20 p-1.5 sm:p-2.5 lg:p-3 shadow-[inset_0_0_24px_rgba(6,182,212,0.06)]">
        {/* ── LEFT & CENTER MAIN WORKSPACE ───────────────────────── */}
        <div className="flex-1 flex flex-col justify-between p-1 sm:p-1.5 relative h-full min-w-0">
        {/* 1. TOP SYSTEM BAR + CAMERA SELECTOR + VOYAGER HEADER */}
        <div className="flex flex-col gap-1.5 w-full z-20">
          {/* Top Framed OS Header Bar (Matches Reference Image) */}
       

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

        {/* 2. MIDDLE OVERLAYS: Compact THE RECEIVER Card (Top-Left next to Alien) & Floating Earth Hotspots */}
        <div className="relative flex-1 w-full pointer-events-none">
          {/* THE RECEIVER Card positioned directly under the top-left camera bar */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-2 md:mt-0 md:absolute md:left-0 md:top-2 w-full max-w-[310px] sm:w-[310px] pointer-events-auto y2k-window rounded-xl overflow-hidden"
          >
            <div className="y2k-titlebar px-3.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-cyan-200">
              <span className="font-bold tracking-wider">RECEIVER_CORE_SYS</span>
              <span className="text-emerald-300">● SIGNAL LOCKED</span>
            </div>

            <div className="p-3.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold font-mono tracking-wider text-white uppercase drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]">
                  THE RECEIVER
                </h1>

                <svg
                  className="w-16 h-5 text-cyan-400 stroke-current shrink-0"
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

              <p className="text-xs sm:text-sm italic text-cyan-300 font-sans">
                An auditory gateway to Earth.
              </p>
            </div>
          </motion.div>

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

        {/* 3. BOTTOM WORKSPACE ROW: Clean, Lightweight Audio Deck + Bottom Toolbar */}
        <div className="flex flex-col gap-2 w-full z-20">
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

        {/* ── FAR-RIGHT FULL-HEIGHT DOCKED DASHBOARD (3 Sections) ── */}
        <StationsList />
      </div>

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
    </>
  );
}
