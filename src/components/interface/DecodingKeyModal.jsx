import { X, Volume2, Music, Activity, Compass, Disc, Play } from 'lucide-react';
import { useReceiverStore } from '../../store/useReceiverStore';
import { getSvsLayerById } from '../../data/svsLayers';
import { audioEngine } from '../../audio/AudioEngine';

export default function DecodingKeyModal() {
  const isOpen = useReceiverStore((s) => s.isDecodingKeyOpen);
  const setOpen = useReceiverStore((s) => s.setDecodingKeyOpen);
  const activeStation = useReceiverStore((s) => s.getActiveStation());
  const activeSvsLayerId = useReceiverStore((s) => s.activeSvsLayerId);
  const activeSvsLayer = getSvsLayerById(activeSvsLayerId);

  if (!isOpen) return null;

  const decodingMappings = [
    {
      property: 'PITCH — NASA-IMPACT MIDI CHORDS (C1–A6)',
      icon: <Music className="w-5 h-5 text-cyan-400" />,
      meaning: 'Data Value Intensity & Geographic Latitude',
      explanation:
        'Per NASA-IMPACT From Data to Melody methodology, pixel/colorbar values map to ordered tonal chords from C1 to A6 (higher anomalies descend into deep low chords by default, reversible in Accessibility).',
      datasetContext: `Active SVS #${activeSvsLayer.svsId} (${activeSvsLayer.title}): ${activeSvsLayer.audioLegendSummary}`,
    },
    {
      property: 'PANNING (Stereo Field)',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      meaning: 'Planetary Longitude (-180° W to +180° E)',
      explanation:
        'Signals from the Pacific & Americas emerge in the left channel (-1.0 to -0.2); Prime Meridian (Europe/Africa) at dead center (0.0); Asia/Oceania move into the right channel (+0.2 to +1.0).',
      datasetContext: 'Allows the alien listener to orient longitude purely via binaural audio localization.',
    },
    {
      property: 'VOLUME & MIDI VELOCITY (35–127)',
      icon: <Volume2 className="w-5 h-5 text-emerald-400" />,
      meaning: `Physical Magnitude (${activeSvsLayer.unit})`,
      explanation:
        'Pixel color intensity scales MIDI velocity cleanly between 35 (baseline) and 127 (peak event), plus Chandra Binary Drumming pulses (1/0) trigger rhythmic percussion above anomaly thresholds.',
      datasetContext: `Range calibrated for SVS #${activeSvsLayer.svsId}: ${activeSvsLayer.minVal} to ${activeSvsLayer.maxVal} ${activeSvsLayer.unit}.`,
    },
    {
      property: 'RHYTHM & TEMPO',
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      meaning: 'Event Frequency & Convective Pulse',
      explanation:
        'Scanning playhead advances across planetary telemetry. Burst frequency corresponds to flashes per minute or kinetic current turbulence.',
      datasetContext: 'Rapid polyrhythms indicate dense human clusters or rapid electrical storm discharge rates.',
    },
    {
      property: 'TIMBRE & TEXTURE',
      icon: <Disc className="w-5 h-5 text-rose-400" />,
      meaning: 'Environmental Phenomenon Category',
      explanation:
        'Polyphonic sine harmonics = Artificial Night Lights; Dual-layer explosive transient & crackle = Atmospheric Lightning; Filtered FM aquatic swells = Oceanic Thermohaline Currents.',
      datasetContext: 'Differentiates atmospheric, oceanic, and anthropogenic Earth systems without language.',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="decoding-key-title"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[95vw] sm:max-w-2xl bg-[#0f1420] border-2 border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden text-gray-100 max-h-[88vh] flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Disc className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <h2 id="decoding-key-title" className="text-xl font-bold font-mono tracking-wide text-cyan-300">
                VOYAGER DECODING MATRIX
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Extraterrestrial Acoustic Interpretation Protocol • NASA Space Apps
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close Decoding Key"
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto custom-scrollbar my-4 pr-1 space-y-3 flex-1">
          <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-800/40 text-xs text-cyan-200 font-mono">
            <strong>TRANSMISSION NOTICE:</strong> The alien listener does not possess human language. The Voyager disc translates Earth observations through physical properties of acoustic waves:
          </div>

          {decodingMappings.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-800/80 border border-gray-700/60 shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold font-mono text-cyan-300 truncate">
                      {item.property}
                    </h3>
                    <div className="text-xs text-amber-400/90 font-mono font-semibold truncate">
                      {item.meaning}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => audioEngine.playDecodingDemo(index)}
                  className="y2k-aqua-btn px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>HEAR DEMO</span>
                </button>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed pl-11">
                {item.explanation}
              </p>

              <div className="mt-2 text-[11px] text-gray-400 pl-11 font-mono border-t border-gray-800/80 pt-1.5">
                <span className="text-cyan-400 font-semibold">Active Context:</span> {item.datasetContext}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
          <span>Active Station: <strong className="text-amber-400">{activeStation.name}</strong></span>
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-cyan-600/30 border border-cyan-500/50 hover:bg-cyan-500/40 rounded-lg text-cyan-300 transition-colors cursor-pointer"
          >
            ACKNOWLEDGE & RETURN
          </button>
        </div>
      </div>
    </div>
  );
}
