import { Activity, Eye, Keyboard, Database, Disc } from 'lucide-react';
import { useReceiverStore } from '../../store/useReceiverStore';

export default function BottomToolbar() {
  const invertPitch = useReceiverStore((s) => s.invertPitch);
  const setInvertPitch = useReceiverStore((s) => s.setInvertPitch);
  const setAccessibilityModalOpen = useReceiverStore((s) => s.setAccessibilityModalOpen);
  const setDecodingKeyOpen = useReceiverStore((s) => s.setDecodingKeyOpen);
  const isDataExplorerOpen = useReceiverStore((s) => s.isDataExplorerOpen);
  const setDataExplorerOpen = useReceiverStore((s) => s.setDataExplorerOpen);
  const isPlaying = useReceiverStore((s) => s.isPlaying);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-200 pointer-events-auto">
      {/* 1. Real-Time Sonification LCD Status Pill */}
      <div className="y2k-lcd flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md">
        <Activity className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-cyan-300 uppercase">
          DSP: {isPlaying ? 'ONLINE' : 'STANDBY'}
        </span>
      </div>

      {/* 2. Data Explorer Telemetry Drawer Toggle */}
      <button
        onClick={() => setDataExplorerOpen(!isDataExplorerOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all cursor-pointer ${
          isDataExplorerOpen ? 'y2k-aqua-btn font-bold' : 'y2k-metal-btn text-slate-200 hover:text-white'
        }`}
      >
        <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase">
          Telemetry [E]
        </span>
      </button>

      {/* 3. Pitch Polarity Switch toggle */}
      <div className="y2k-metal-btn flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-200 uppercase">
          Invert Pitch
        </span>
        <button
          role="switch"
          aria-checked={invertPitch}
          onClick={() => setInvertPitch(!invertPitch)}
          aria-label="Toggle Pitch Polarity Direction"
          className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer border ${
            invertPitch ? 'bg-cyan-500 border-cyan-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]' : 'bg-slate-950 border-slate-700'
          }`}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
              invertPitch ? 'left-4' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Compact Decoding Key button (< xl screens, since xl+ shows DecodingKeyWidget) */}
      <button
        onClick={() => setDecodingKeyOpen(true)}
        className="xl:hidden y2k-metal-btn flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md hover:text-white transition-all cursor-pointer"
      >
        <Disc className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-200 uppercase">
          Key [D]
        </span>
      </button>

      {/* 4. Accessibility & Controls button */}
      <button
        onClick={() => setAccessibilityModalOpen(true)}
        className="y2k-metal-btn flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md hover:text-white transition-all cursor-pointer"
      >
        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
        <Keyboard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 hidden xs:inline" />
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-200 uppercase">
          A11y / Keys
        </span>
      </button>
    </div>
  );
}
