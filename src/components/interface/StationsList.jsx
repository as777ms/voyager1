import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Disc, List, X, Globe, Flame, AlertTriangle } from 'lucide-react';
import { NASA_STATIONS, TIMELINE_YEARS } from '../../data/nasaData';
import { useReceiverStore } from '../../store/useReceiverStore';
import { audioEngine } from '../../audio/AudioEngine';
import voyagerImg from '../../assets/record_voyager.jpeg';

export default function StationsList() {
  const currentStationId = useReceiverStore((s) => s.currentStationId);
  const setStation = useReceiverStore((s) => s.setStation);
  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const togglePlay = useReceiverStore((s) => s.togglePlay);
  const selectedYear = useReceiverStore((s) => s.selectedYear);
  const setSelectedYear = useReceiverStore((s) => s.setSelectedYear);
  const invertPitch = useReceiverStore((s) => s.invertPitch);
  const setWorldMapOpen = useReceiverStore((s) => s.setWorldMapOpen);
  const setVoyagerModalOpen = useReceiverStore((s) => s.setVoyagerModalOpen);

  const [isMobileOpen, setMobileOpen] = useState(false);

  const handleStationClick = (stationId) => {
    audioEngine.unlockSync();
    audioEngine.stopActiveSequences();

    if (currentStationId === stationId) {
      const nextPlaying = !isPlaying;
      togglePlay();
      if (nextPlaying) {
        const pt = useReceiverStore.getState().getCurrentPoint();
        audioEngine.playDataPoint(stationId, pt, {
          invertPitch,
          year: selectedYear,
        });
      }
      return;
    }

    setStation(stationId);
    useReceiverStore.setState({ isPlaying: true });
    const targetStation = NASA_STATIONS.find((s) => s.id === stationId);
    if (targetStation?.data?.[0]) {
      audioEngine.playDataPoint(stationId, targetStation.data[0], {
        invertPitch,
        year: selectedYear,
      });
    }
  };

  const handleYearChange = (yr) => {
    audioEngine.unlockSync();
    setSelectedYear(yr);
    const state = useReceiverStore.getState();
    const pt = state.getCurrentPoint();
    audioEngine.playDataPoint(state.currentStationId, pt, {
      invertPitch,
      year: yr,
    });
  };

  const voyagerStations = NASA_STATIONS.filter((s) => s.section === 'voyager');
  const earthSignalStations = NASA_STATIONS.filter((s) => s.section === 'earthSignals');
  const classifiedStations = NASA_STATIONS.filter((s) => s.section === 'classified');

  const currentStation = NASA_STATIONS.find((s) => s.id === currentStationId) || NASA_STATIONS[0];

  return (
    <>
      {/* Mobile / Tablet Drawer Toggle Button (< 1024px) */}
      <div className="lg:hidden pointer-events-auto fixed top-2.5 right-2.5 z-50">
        <button
          onClick={() => setMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
          aria-label="Toggle Earth Stations Dashboard"
          className="y2k-window flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white cursor-pointer"
        >
          {isMobileOpen ? (
            <>
              <X className="w-4 h-4 text-cyan-400" />
              <span>CLOSE</span>
            </>
          ) : (
            <>
              <List className="w-4 h-4 text-cyan-400" />
              <span>STATIONS ({NASA_STATIONS.length})</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* Pinned Full-Height Right Dashboard (Docked top-0 to bottom-0 on Desktop) */}
      <aside
        aria-label="Earth Stations Dashboard"
        className={`pointer-events-auto transition-all duration-300 ${
          isMobileOpen
            ? 'fixed inset-y-0 right-0 w-[90vw] sm:w-[370px] z-40 flex flex-col'
            : 'hidden lg:flex flex-col w-[350px] xl:w-[380px] h-full shrink-0'
        } y2k-window rounded-none lg:rounded-l-xl border-r-0 border-y-0 overflow-hidden`}
      >
        {/* Top Window Titlebar */}
        <div className="y2k-titlebar px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-600 border border-blue-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-700 border border-emerald-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />
            </div>
            <h2 className="text-[11px] font-extrabold font-mono tracking-wider text-white uppercase truncate drop-shadow">
              EARTH STATIONS.PLS
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setWorldMapOpen(true)}
              title="Open NASA Worldview Telemetry Map"
              className="y2k-aqua-btn px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3 h-3" />
              <span>WORLD MAP</span>
            </button>
            <button
              onClick={() => setVoyagerModalOpen(true)}
              className="y2k-gold-btn px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Disc className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              <span>ARCHIVE</span>
            </button>
          </div>
        </div>

        {/* Scrollable 3-Section Dashboard Body */}
        <div className="p-2.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
          {/* Holographic Voyager Golden Record Banner inside Playlist (as in reference image) */}
          <button
            onClick={() => setVoyagerModalOpen(true)}
            className="w-full y2k-lcd rounded-lg p-2 flex items-center gap-3 border border-cyan-400/35 hover:border-amber-400/70 transition-all cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-cyan-400/70 shadow-[0_0_12px_rgba(56,189,248,0.45)] bg-black">
              <img
                src={voyagerImg}
                alt="Voyager Golden Record"
                className={`w-full h-full object-cover rounded-full ${isPlaying ? 'animate-spin' : ''}`}
                style={{ animationDuration: '10s' }}
              />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="text-[10px] font-extrabold font-mono text-amber-300 uppercase tracking-wider truncate">
                VOYAGER GOLDEN RECORD
              </div>
              <div className="text-[9px] font-mono text-cyan-300/90 truncate">
                1977 INTERSTELLAR MESSAGE • CLICK TO OPEN
              </div>
            </div>
          </button>

          {/* ── SECTION 1: VOYAGER RECORD (VOYAGER.REC) ── */}
          <div>
            <div className="flex items-center justify-between px-1 mb-1.5 border-b border-cyan-500/25 pb-1">
              <span className="text-[10px] font-extrabold font-mono tracking-wider text-amber-300 uppercase">
                SECTION 1: VOYAGER RECORD
              </span>
              <span className="text-[9px] font-mono text-slate-400">(VOYAGER.REC)</span>
            </div>

            <div className="space-y-1.5">
              {voyagerStations.map((station) => {
                const isActive = station.id === currentStationId;
                return (
                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    key={station.id}
                    onClick={() => {
                      handleStationClick(station.id);
                      if (window.innerWidth < 1024) setMobileOpen(false);
                    }}
                    className={`w-full group text-left flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'y2k-lcd border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'y2k-metal-btn'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-11 h-7 rounded overflow-hidden shrink-0 border border-amber-500/40 bg-black">
                        <img
                          src={station.thumbnail}
                          alt={station.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold font-mono text-white truncate group-hover:text-amber-200">
                          {station.name}
                        </div>
                        <div className="text-[9px] font-mono text-amber-300/80 truncate">
                          {station.subtitle}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ml-1.5 ${
                        isActive ? 'y2k-gold-btn' : 'bg-slate-900/90 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {isActive && isPlaying ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── SECTION 2: EARTH SIGNALS (EARTH.SIG 2010–2026) + TIMELINE SLIDER ── */}
          <div>
            <div className="flex items-center justify-between px-1 mb-1.5 border-b border-cyan-500/25 pb-1">
              <span className="text-[10px] font-extrabold font-mono tracking-wider text-cyan-300 uppercase">
                SECTION 2: EARTH SIGNALS
              </span>
              <span className="text-[9px] font-mono text-cyan-400">(EARTH.SIG) 2010–2026</span>
            </div>

            {/* Interactive Crisis & Climate Timeline Bar (2010 -> 2026) */}
            <div className="y2k-lcd p-2 rounded-lg mb-2">
              <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>CRISIS TIMELINE LOG:</span>
                </span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded ${
                    selectedYear >= 2022
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : selectedYear >= 2016
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {selectedYear} {selectedYear >= 2022 ? '• ANOMALY' : selectedYear >= 2016 ? '• WARMING' : '• CALM'}
                </span>
              </div>

              <input
                type="range"
                min="2010"
                max="2026"
                step="1"
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                aria-label="Crisis Timeline Year Slider 2010 to 2026"
                className="w-full accent-cyan-400 h-1.5 cursor-pointer"
              />

              <div className="flex items-center justify-between mt-1">
                {TIMELINE_YEARS.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => handleYearChange(yr)}
                    className={`text-[8px] font-mono px-1 py-0.5 rounded cursor-pointer transition-colors ${
                      selectedYear === yr
                        ? 'bg-cyan-400 text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              {earthSignalStations.map((station) => {
                const isActive = station.id === currentStationId;
                return (
                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    key={station.id}
                    onClick={() => {
                      handleStationClick(station.id);
                      if (window.innerWidth < 1024) setMobileOpen(false);
                    }}
                    className={`w-full group text-left flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'y2k-lcd border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                        : 'y2k-metal-btn'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-10 h-7 rounded overflow-hidden shrink-0 border border-cyan-500/30 bg-black">
                        <img
                          src={station.thumbnail}
                          alt={station.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/75 text-[7px] font-mono text-cyan-300 text-center leading-tight">
                          {station.code}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold font-mono text-white truncate group-hover:text-cyan-200">
                          {station.name}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 truncate">
                          {station.subtitle}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ml-1.5 ${
                        isActive ? 'y2k-aqua-btn' : 'bg-slate-900/90 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {isActive && isPlaying ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── SECTION 3: CLASSIFIED SIGNALS (EARTH.DIS • 2026 CURRENT) ── */}
          <div>
            <div className="flex items-center justify-between px-1 mb-1.5 border-b border-cyan-500/25 pb-1">
              <span className="text-[10px] font-extrabold font-mono tracking-wider text-orange-300 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                <span>SECTION 3: CLASSIFIED SIGNALS</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400">2026 CURRENT</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {classifiedStations.map((station) => {
                const isActive = station.id === currentStationId;
                return (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={station.id}
                    onClick={() => {
                      handleStationClick(station.id);
                      if (window.innerWidth < 1024) setMobileOpen(false);
                    }}
                    className={`group text-left p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'y2k-lcd border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                        : 'y2k-metal-btn'
                    }`}
                  >
                    <div className="relative w-7 h-7 rounded overflow-hidden shrink-0 border border-cyan-500/30 bg-black">
                      <img
                        src={station.thumbnail}
                        alt={station.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold font-mono text-white truncate">
                        {station.name}
                      </div>
                      <div className="text-[8px] font-mono text-cyan-300/80 truncate">
                        ({station.code})
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Docked Status Bar */}
        <div className="px-3 py-2 bg-[#030812] border-t border-cyan-500/30 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
          <span className="truncate">
            ACTIVE: <strong className="text-cyan-300">{currentStation.name}</strong>
          </span>
          <span className="text-amber-300 font-bold shrink-0 ml-2">YR: {selectedYear}</span>
        </div>
      </aside>
    </>
  );
}
