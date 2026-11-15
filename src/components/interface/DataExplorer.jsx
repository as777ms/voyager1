import { useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Radio,
  Play,
  Square,
  Globe,
  Music,
  BarChart3,
} from 'lucide-react';
import { useReceiverStore } from '../../store/useReceiverStore';
import { getSvsLayerForStation } from '../../data/svsLayers';
import { mapValueToMidiChord } from '../../audio/PixelSonifier';
import { audioEngine } from '../../audio/AudioEngine';

export default function DataExplorer() {
  const isOpen = useReceiverStore((s) => s.isDataExplorerOpen);
  const setOpen = useReceiverStore((s) => s.setDataExplorerOpen);
  const setWorldMapOpen = useReceiverStore((s) => s.setWorldMapOpen);
  const setActiveSvsLayerId = useReceiverStore((s) => s.setActiveSvsLayerId);
  const activeStation = useReceiverStore((s) => s.getActiveStation());
  const currentIndex = useReceiverStore((s) => s.currentIndex);
  const setIndex = useReceiverStore((s) => s.setIndex);
  const selectedYear = useReceiverStore((s) => s.selectedYear);
  const invertPitch = useReceiverStore((s) => s.invertPitch);

  const [isSequencePlaying, setIsSequencePlaying] = useState(false);

  const linkedSvs = useMemo(
    () => getSvsLayerForStation(activeStation.id),
    [activeStation.id]
  );

  const mappedChords = useMemo(() => {
    const vals = activeStation.data.map((pt) =>
      typeof pt.value === 'number' ? pt.value : pt.frequency || 50
    );
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const span = Math.max(1e-6, maxVal - minVal);
    return activeStation.data.map((pt) => {
      const raw = typeof pt.value === 'number' ? pt.value : pt.frequency || 50;
      const norm = activeStation.data.length === 1 ? 0.5 : (raw - minVal) / span;
      return mapValueToMidiChord(norm, {
        higherDataLowerPitch: linkedSvs.defaultHigherIsLowerPitch ?? true,
        invertPitch,
      });
    });
  }, [activeStation, linkedSvs, invertPitch]);

  const handleSelectPoint = (idx) => {
    audioEngine.unlockSync();
    audioEngine.stopActiveSequences();
    setIsSequencePlaying(false);
    setIndex(idx);
    const point = activeStation.data[idx];
    audioEngine.playDataPoint(activeStation.id, point, {
      invertPitch,
      year: selectedYear,
    });
  };

  const handlePlaySequence = () => {
    audioEngine.unlockSync();
    if (isSequencePlaying) {
      audioEngine.stopActiveSequences();
      setIsSequencePlaying(false);
      return;
    }

    useReceiverStore.getState().setIsPlaying(false);
    setIsSequencePlaying(true);
    audioEngine.playStationSequence(activeStation, linkedSvs, {
      invertPitch,
      onStep: (idx) => setIndex(idx),
      onComplete: () => setIsSequencePlaying(false),
    });
  };

  const handleOpenLinkedMap = () => {
    audioEngine.unlockSync();
    setActiveSvsLayerId(linkedSvs.id);
    setOpen(false);
    setWorldMapOpen(true);
  };

  return (
    <>
      {/* Mobile Backdrop (< sm) */}
      {isOpen && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-35 sm:hidden pointer-events-auto"
        />
      )}

      <div
        className={`fixed top-12 sm:top-16 right-2 sm:right-4 z-40 pointer-events-auto transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'
        }`}
      >
        <div className="flex items-start">
          {/* Toggle Handle */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playHudPing(840);
              setOpen(!isOpen);
            }}
            aria-label={isOpen ? 'Collapse Data Explorer' : 'Expand Data Explorer'}
            className="-ml-9 sm:-ml-10 p-1.5 sm:p-2 bg-[#0b1325]/95 border border-cyan-500/50 rounded-l-xl text-cyan-300 hover:text-white shadow-xl backdrop-blur-md cursor-pointer mt-3"
          >
            {isOpen ? <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Panel Content */}
          <div className="y2k-window w-[92vw] sm:w-88 md:w-96 max-h-[82vh] flex flex-col rounded-xl shadow-2xl overflow-hidden text-gray-100">
          {/* Header */}
          <div className="p-3.5 border-b border-cyan-500/25 bg-[#071021]/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                NASA OBSERVATION CHART & MATRIX
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold">
                SVS #{linkedSvs.svsId} • {activeStation.data.length} PTS
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold font-mono text-white">
                {activeStation.name}
              </h3>
              <div className="text-[10px] font-mono text-cyan-300/85 mt-0.5">
                {linkedSvs.source} • {linkedSvs.realTimeRange}
              </div>
            </div>

            {/* Interactive Visual Data Melody Bar Chart (Click any bar to hear its chord) */}
            <div className="y2k-lcd p-2.5 rounded-lg border border-cyan-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-300">
                <span className="flex items-center gap-1 text-cyan-300 font-bold uppercase">
                  <BarChart3 className="w-3 h-3" />
                  Interactive Melody Chart (Click Bars):
                </span>
                <span className="text-amber-300 font-bold">
                  {mappedChords[currentIndex]?.chordName} ({mappedChords[currentIndex]?.midiVelocity} vel)
                </span>
              </div>

              <div className="h-16 flex items-end gap-1.5 pt-2 px-1">
                {activeStation.data.map((pt, idx) => {
                  const chord = mappedChords[idx];
                  const isCurrent = idx === currentIndex;
                  const heightPct = Math.max(22, Math.round((chord?.normalized ?? 0.5) * 100));
                  return (
                    <button
                      type="button"
                      key={pt.id}
                      onClick={() => handleSelectPoint(idx)}
                      title={`${pt.location}: ${pt.value} (${chord?.chordName})`}
                      className="flex-1 h-full flex flex-col justify-end items-center gap-1 group cursor-pointer"
                    >
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-t from-amber-500 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                            : 'bg-cyan-500/45 group-hover:bg-cyan-400/80'
                        }`}
                      />
                      <span
                        className={`text-[8px] font-mono leading-none ${
                          isCurrent ? 'text-amber-300 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {chord?.chordName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={handlePlaySequence}
                className={`flex-1 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSequencePlaying
                    ? 'bg-rose-500/25 border border-rose-400 text-rose-200'
                    : 'y2k-aqua-btn text-slate-950'
                }`}
              >
                {isSequencePlaying ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>STOP MELODY</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>PLAY DATA MELODY (C1–A6)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleOpenLinkedMap}
                className="y2k-gold-btn px-2.5 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Globe className="w-3 h-3" />
                <span>SVS MAP</span>
              </button>
            </div>
          </div>

          {/* List of Data Points */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {activeStation.data.map((point, idx) => {
              const isSelected = idx === currentIndex;
              const chord = mappedChords[idx];
              return (
                <button
                  type="button"
                  key={point.id}
                  onClick={() => handleSelectPoint(idx)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'y2k-lcd border-cyan-400/90 shadow-[0_0_15px_rgba(56,189,248,0.28)]'
                      : 'y2k-metal-btn hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-cyan-200">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{point.location}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        LAT {point.latitude > 0 ? `+${point.latitude}°` : `${point.latitude}°`} • LON{' '}
                        {point.longitude > 0 ? `+${point.longitude}°` : `${point.longitude}°`}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono text-amber-300">
                        {point.value}{' '}
                        <span className="text-[10px] font-normal text-slate-400">
                          {activeStation.parameterUnit !== 'Language' ? activeStation.parameterUnit : ''}
                        </span>
                      </div>
                      <div className="text-[9px] font-mono text-cyan-200 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-700/60 mt-1 inline-flex items-center gap-1">
                        <Music className="w-2.5 h-2.5 text-amber-300" />
                        <span>
                          {chord?.chordName} • VEL {chord?.midiVelocity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5 text-[11px] text-slate-300 line-clamp-2 border-t border-slate-800/70 pt-1">
                    {point.notes}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-cyan-500/25 bg-[#050b16] text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>PRESS [E] TO TOGGLE</span>
            <span className="text-cyan-300 font-bold">NASA-IMPACT C1–A6 ENGINE</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
