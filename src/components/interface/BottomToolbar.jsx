import { Activity, Eye, Keyboard, Database, Disc, Volume2, ExternalLink } from 'lucide-react';
import { useReceiverStore } from '../../store/useReceiverStore';

export default function BottomToolbar() {
  const invertPitch = useReceiverStore((s) => s.invertPitch);
  const setInvertPitch = useReceiverStore((s) => s.setInvertPitch);
  const setAccessibilityModalOpen = useReceiverStore((s) => s.setAccessibilityModalOpen);
  const setDecodingKeyOpen = useReceiverStore((s) => s.setDecodingKeyOpen);
  const isDataExplorerOpen = useReceiverStore((s) => s.isDataExplorerOpen);
  const setDataExplorerOpen = useReceiverStore((s) => s.setDataExplorerOpen);
  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const isHoverAudioActive = useReceiverStore((s) => s.isHoverAudioActive);
  const toggleHoverAudio = useReceiverStore((s) => s.toggleHoverAudio);
  const announceHover = useReceiverStore((s) => s.announceHover);
  const clearHover = useReceiverStore((s) => s.clearHover);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs font-mono text-slate-200 pointer-events-auto">
      {/* 0. Global Hover Audio Reader Toggle Button */}
      <button
        onClick={toggleHoverAudio}
        onMouseEnter={() =>
          announceHover(
            isHoverAudioActive
              ? 'Audio Reader active: click to disable'
              : 'Audio Reader off: click to enable hover speech and earcon cues across all sections',
            'toggle'
          )
        }
        onMouseLeave={clearHover}
        onFocus={() => announceHover('Audio Reader toggle button, shortcut H', 'toggle')}
        aria-pressed={isHoverAudioActive}
        title="Toggle Global Hover Audio Reader [H]"
        className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-all cursor-pointer border ${
          isHoverAudioActive
            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.45)] font-bold'
            : 'y2k-metal-btn text-slate-300 hover:text-white'
        }`}
      >
        <Volume2
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
            isHoverAudioActive ? 'text-emerald-300 animate-pulse' : 'text-slate-400'
          }`}
        />
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wide uppercase">
          HOVER [H]
        </span>
      </button>

      {/* 1. Real-Time Sonification LCD Status Pill */}
      <div
        onMouseEnter={() =>
          announceHover(
            `DSP audio synthesizer status is ${isPlaying ? 'Online and playing' : 'Standby'}`,
            'default'
          )
        }
        onMouseLeave={clearHover}
        className="y2k-lcd flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md cursor-default"
      >
        <Activity
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
            isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
          }`}
        />
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wider text-cyan-300 uppercase">
          DSP: {isPlaying ? 'ONLINE' : 'STANDBY'}
        </span>
      </div>

      {/* 2. Data Explorer Telemetry Drawer Toggle */}
      <button
        onClick={() => setDataExplorerOpen(!isDataExplorerOpen)}
        onMouseEnter={() =>
          announceHover('Telemetry Drawer shortcut E: opens observation data table and melody chart', 'layer')
        }
        onMouseLeave={clearHover}
        onFocus={() => announceHover('Telemetry Drawer shortcut E', 'layer')}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-all cursor-pointer ${
          isDataExplorerOpen ? 'y2k-aqua-btn font-bold' : 'y2k-metal-btn text-slate-200 hover:text-white'
        }`}
      >
        <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wide uppercase">
          <span className="hidden xs:inline">Telemetry</span> [E]
        </span>
      </button>

      {/* 3. Pitch Polarity Switch toggle */}
      <div
        onMouseEnter={() =>
          announceHover(
            `Invert pitch polarity is currently ${invertPitch ? 'Enabled' : 'Disabled'}`,
            'toggle'
          )
        }
        onMouseLeave={clearHover}
        className="y2k-metal-btn flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md"
      >
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wide text-slate-200 uppercase">
          Invert
        </span>
        <button
          role="switch"
          aria-checked={invertPitch}
          onClick={() => setInvertPitch(!invertPitch)}
          onFocus={() => announceHover('Toggle pitch polarity direction', 'toggle')}
          aria-label="Toggle Pitch Polarity Direction"
          className={`w-7 sm:w-8 h-3.5 sm:h-4 rounded-full transition-colors relative cursor-pointer border ${
            invertPitch ? 'bg-cyan-500 border-cyan-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]' : 'bg-slate-950 border-slate-700'
          }`}
        >
          <div
            className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
              invertPitch ? 'left-3.5 sm:left-4' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Compact Decoding Key button */}
      <button
        onClick={() => setDecodingKeyOpen(true)}
        onMouseEnter={() =>
          announceHover('Decoding Key shortcut D: open matrix explaining pitch, rhythm, pan and timbre', 'calibrate')
        }
        onMouseLeave={clearHover}
        onFocus={() => announceHover('Decoding Key shortcut D', 'calibrate')}
        className="y2k-metal-btn flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md hover:text-white transition-all cursor-pointer"
      >
        <Disc className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wide text-slate-200 uppercase">
          Key [D]
        </span>
      </button>

      {/* 4. Accessibility & Controls button */}
      <button
        onClick={() => setAccessibilityModalOpen(true)}
        onMouseEnter={() =>
          announceHover('Accessibility and keyboard shortcuts settings menu', 'default')
        }
        onMouseLeave={clearHover}
        onFocus={() => announceHover('Accessibility menu', 'default')}
        className="y2k-metal-btn flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md hover:text-white transition-all cursor-pointer"
      >
        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
        <Keyboard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 hidden xs:inline" />
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wide text-slate-200 uppercase">
          A11y
        </span>
      </button>

      {/* 5. GitHub Repository Link */}
      <a
        href="https://github.com/as777ms/voyager1"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() =>
          announceHover('Open project open-source repository on GitHub: as777ms/voyager1', 'default')
        }
        onMouseLeave={clearHover}
        onFocus={() => announceHover('GitHub repository link', 'default')}
        title="View Codebase on GitHub (as777ms/voyager1)"
        className="y2k-metal-btn flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md hover:text-white transition-all cursor-pointer group"
      >
        <svg
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 group-hover:text-cyan-300 transition-colors shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wide text-slate-200 group-hover:text-cyan-200 uppercase">
          GitHub
        </span>
        <ExternalLink className="w-2.5 h-2.5 text-cyan-400 opacity-70 group-hover:opacity-100 hidden sm:inline" />
      </a>
    </div>
  );
}
