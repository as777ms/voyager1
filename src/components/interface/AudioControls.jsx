import { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  Globe,
} from 'lucide-react';
import { useReceiverStore } from '../../store/useReceiverStore';
import { getSvsLayerById } from '../../data/svsLayers';
import { audioEngine } from '../../audio/AudioEngine';
import SpectralVisualizer from './SpectralVisualizer';

export default function AudioControls() {
  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const togglePlay = useReceiverStore((s) => s.togglePlay);
  const isMuted = useReceiverStore((s) => s.isMuted);
  const toggleMute = useReceiverStore((s) => s.toggleMute);
  const volume = useReceiverStore((s) => s.volume);
  const setVolume = useReceiverStore((s) => s.setVolume);
  const nextPoint = useReceiverStore((s) => s.nextPoint);
  const prevPoint = useReceiverStore((s) => s.prevPoint);
  const activeStation = useReceiverStore((s) => s.getActiveStation());
  const currentPoint = useReceiverStore((s) => s.getCurrentPoint());
  const currentIndex = useReceiverStore((s) => s.currentIndex);
  const invertPitch = useReceiverStore((s) => s.invertPitch);
  const scanSpeed = useReceiverStore((s) => s.scanSpeed);
  const selectedYear = useReceiverStore((s) => s.selectedYear);
  const getYearTelemetry = useReceiverStore((s) => s.getYearTelemetry);
  const setWorldMapOpen = useReceiverStore((s) => s.setWorldMapOpen);
  const activeSvsLayerId = useReceiverStore((s) => s.activeSvsLayerId);
  const activeSvsLayer = getSvsLayerById(activeSvsLayerId);

  const announceHover = useReceiverStore((s) => s.announceHover);
  const clearHover = useReceiverStore((s) => s.clearHover);

  const [audioState, setAudioState] = useState(() => audioEngine.getAudioState());
  const yearTelemetry = getYearTelemetry();

  useEffect(() => {
    const id = setInterval(() => {
      setAudioState(audioEngine.getAudioState());
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    audioEngine.setVolume(volume, isMuted);
  }, [volume, isMuted]);

  useEffect(() => {
    if (!isPlaying) return;

    if (currentPoint) {
      audioEngine.playDataPoint(activeStation.id, currentPoint, {
        invertPitch,
        year: selectedYear,
      });
    }

    const interval = setInterval(() => {
      nextPoint();
    }, scanSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, activeStation.id, invertPitch, scanSpeed, currentPoint, nextPoint, selectedYear]);

  const handleNext = () => {
    audioEngine.unlockSync();
    nextPoint();
    if (!isPlaying) {
      const nextIdx = (currentIndex + 1) % activeStation.data.length;
      audioEngine.playDataPoint(activeStation.id, activeStation.data[nextIdx], {
        invertPitch,
        year: selectedYear,
      });
    }
  };

  const handlePrev = () => {
    audioEngine.unlockSync();
    prevPoint();
    if (!isPlaying) {
      const prevIdx = (currentIndex - 1 + activeStation.data.length) % activeStation.data.length;
      audioEngine.playDataPoint(activeStation.id, activeStation.data[prevIdx], {
        invertPitch,
        year: selectedYear,
      });
    }
  };

  return (
    <div className="w-full max-w-[820px] xl:max-w-[880px] mx-auto pointer-events-auto">
      <div className="y2k-window rounded-xl overflow-hidden shadow-2xl">
        {/* Top Metallic Bevel Strip */}
        <div className="y2k-titlebar px-3 py-1 flex items-center justify-between text-[9px] font-mono">
          <div
            onMouseEnter={() =>
              announceHover(
                `Instrument: ${activeStation.instrument}, Observation Year ${selectedYear}, Status: ${yearTelemetry.statusLabel}`,
                'layer'
              )
            }
            onMouseLeave={clearHover}
            className="flex items-center gap-1.5 text-cyan-200 font-bold tracking-wider uppercase truncate cursor-default"
          >
            <Radio className="w-3 h-3 text-cyan-300 animate-pulse shrink-0" />
            <span className="truncate">
              {activeStation.instrument} // {selectedYear} ({yearTelemetry.statusLabel})
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => {
                audioEngine.unlockSync();
                audioEngine.playTestTone();
                setAudioState(audioEngine.getAudioState());
              }}
              onMouseEnter={() =>
                announceHover(
                  `Audio synthesis: ${
                    audioState === 'running'
                      ? 'Active. Click to play audio calibration test tone.'
                      : 'Locked. Click to unlock audio context.'
                  }`,
                  'toggle'
                )
              }
              onMouseLeave={clearHover}
              onFocus={() => announceHover('Audio unlock and test tone button', 'toggle')}
              title="Click to unlock Web Audio & play test ping"
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold border cursor-pointer ${
                audioState === 'running'
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  : 'bg-amber-500/25 border-amber-400 text-amber-200 animate-pulse'
              }`}
            >
              {audioState === 'running' ? 'AUDIO: ON (TEST)' : 'TAP: UNLOCK AUDIO'}
            </button>
            <span
              onMouseEnter={() =>
                announceHover(
                  `Latitude ${currentPoint?.latitude?.toFixed(1)} degrees, Longitude ${currentPoint?.longitude?.toFixed(1)} degrees`,
                  'default'
                )
              }
              onMouseLeave={clearHover}
              className="hidden sm:inline cursor-default"
            >
              LAT {currentPoint?.latitude?.toFixed(1)}° / LON {currentPoint?.longitude?.toFixed(1)}°
            </span>
            <span
              onMouseEnter={() =>
                announceHover(
                  `Sonification frequency ${Math.round(currentPoint?.frequency || 440)} Hertz, musical note ${currentPoint?.noteName || 'A4'}`,
                  'default'
                )
              }
              onMouseLeave={clearHover}
              className="text-amber-300 font-bold cursor-default"
            >
              {Math.round(currentPoint?.frequency || 440)}Hz ({currentPoint?.noteName || 'A4'})
            </span>
          </div>
        </div>

        {/* Main Player Deck Body (Responsive flex column on mobile, flex row on tablet/desktop) */}
        <div className="p-1.5 sm:p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
          {/* Top on mobile / Left on desktop: Recessed LCD Telemetry Readout */}
          <div
            onMouseEnter={() =>
              announceHover(
                `Active Station: ${activeStation.name}. Current Telemetry: ${yearTelemetry.displayValue} ${
                  activeStation.parameterUnit !== 'Language' ? activeStation.parameterUnit : ''
                }. Location: ${currentPoint?.location || 'Planetary Surface'}.`,
                'layer'
              )
            }
            onMouseLeave={clearHover}
            className="y2k-lcd px-2 sm:px-2.5 py-1 rounded-lg flex items-center justify-between gap-2 min-w-0 flex-1 cursor-default"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider truncate">
                  {activeStation.name}
                </span>
                <span className="text-[9px] font-mono text-amber-300 shrink-0">
                  • {yearTelemetry.displayValue} {activeStation.parameterUnit !== 'Language' ? activeStation.parameterUnit : ''}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold font-mono text-white truncate">
                {currentPoint?.location || 'Planetary Surface'}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setWorldMapOpen(true)}
                onMouseEnter={() =>
                  announceHover(
                    `World Map Sonifier shortcut W: explore and listen to NASA SVS #${activeSvsLayer.svsId} satellite layers.`,
                    'scan'
                  )
                }
                onMouseLeave={clearHover}
                onFocus={() => announceHover('Open NASA World Map Sonifier, shortcut W', 'scan')}
                title={`Open NASA Worldview EIC Map (SVS #${activeSvsLayer.svsId})`}
                aria-label="Open NASA World Map"
                className="
                  y2k-aqua-btn
                  px-2.5 sm:px-4
                  py-1.5 sm:py-2
                  rounded-md
                  text-[10px] sm:text-xs
                  font-mono font-bold tracking-wider
                  flex items-center justify-center gap-1.5 sm:gap-2
                  shrink-0 cursor-pointer
                  border border-cyan-300/50
                  shadow-[0_0_10px_rgba(34,211,238,0.25)]
                  hover:shadow-[0_0_18px_rgba(34,211,238,0.55)]
                  hover:scale-105
                  active:scale-95
                  transition-all duration-200
                "
              >
                <Globe className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline sm:inline">WORLD MAP</span>
                <span className="xs:hidden sm:hidden">MAP</span>
              </button>
            </div>
          </div>

          {/* Bottom on mobile / Center + Right on desktop: Controls & Volume */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Center: Transport Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrev}
                onMouseEnter={() => announceHover('Previous observation data point', 'default')}
                onMouseLeave={clearHover}
                onFocus={() => announceHover('Previous observation point', 'default')}
                aria-label="Previous Observation Point"
                className="y2k-metal-btn p-1.5 rounded-lg text-slate-200 hover:text-white cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  audioEngine.unlockSync();
                  togglePlay();
                }}
                onMouseEnter={() =>
                  announceHover(
                    isPlaying
                      ? 'Pause sonification scan'
                      : 'Play sonification scan across telemetry points',
                    'sonify'
                  )
                }
                onMouseLeave={clearHover}
                onFocus={() => announceHover(isPlaying ? 'Pause sonification' : 'Play sonification', 'sonify')}
                aria-label={isPlaying ? 'Pause Sonification' : 'Play Sonification'}
                className={`${
                  activeStation.isVoyagerSpecial ? 'y2k-gold-btn' : 'y2k-aqua-btn'
                } px-3 sm:px-3.5 py-1.5 rounded-lg font-mono font-extrabold text-xs tracking-wider flex items-center gap-1.5 cursor-pointer`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNext}
                onMouseEnter={() => announceHover('Next observation data point', 'default')}
                onMouseLeave={clearHover}
                onFocus={() => announceHover('Next observation point', 'default')}
                aria-label="Next Observation Point"
                className="y2k-metal-btn p-1.5 rounded-lg text-slate-200 hover:text-white cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right: Spectrum Analyzer & Volume */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="hidden xl:block y2k-lcd px-1.5 py-0.5 rounded">
                <SpectralVisualizer />
              </div>

              <div className="y2k-metal-btn px-2 py-1 rounded-lg flex items-center gap-1">
                <button
                  onClick={() => {
                    audioEngine.unlockSync();
                    toggleMute();
                  }}
                  onMouseEnter={() => announceHover(isMuted ? 'Unmute audio output' : 'Mute audio output', 'toggle')}
                  onMouseLeave={clearHover}
                  onFocus={() => announceHover(isMuted ? 'Unmute audio' : 'Mute audio', 'toggle')}
                  aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  className="text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    audioEngine.unlockSync();
                    setVolume(parseFloat(e.target.value));
                  }}
                  onMouseEnter={() => announceHover(`Master volume: ${Math.round(volume * 100)} percent`, 'default')}
                  onMouseLeave={clearHover}
                  aria-label="Volume Slider"
                  className="w-12 sm:w-14 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
