import { motion } from 'framer-motion';
import { Music, Activity, MoveHorizontal, Disc, Globe } from 'lucide-react';
import { useReceiverStore } from '../../store/useReceiverStore';

export default function DecodingKeyWidget() {
  const setDecodingKeyOpen = useReceiverStore((s) => s.setDecodingKeyOpen);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => setDecodingKeyOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setDecodingKeyOpen(true)}
      aria-label="View Full Decoding Matrix"
      className="y2k-window w-full sm:w-[310px] rounded-xl overflow-hidden cursor-pointer transition-all group pointer-events-auto"
    >
      {/* 2000s Aqua / Royale Metallic Mini Titlebar */}
      <div className="y2k-titlebar px-3 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 border border-amber-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />
          <Disc className="w-3 h-3 text-amber-300" />
          <span className="text-[10px] font-extrabold font-mono tracking-wider text-white uppercase drop-shadow">
            DECODING_MATRIX_KEY
          </span>
        </div>
        <span className="text-[9px] font-mono text-cyan-200 bg-black/40 px-1.5 rounded border border-cyan-400/30">
          [D] OPEN
        </span>
      </div>

      {/* Body */}
      <div className="p-2.5 flex items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-300 font-sans mb-1.5 leading-tight">
            Every station begins with a key — so you can hear the data.
          </p>

          <div className="y2k-lcd p-1.5 rounded space-y-0.5 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-100">
              <Music className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
              <span className="truncate">Pitch → Latitude / Value</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-100">
              <Activity className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span className="truncate">Rhythm → Intensity / Speed</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-100">
              <MoveHorizontal className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span className="truncate">Pan → Longitude / Stereo</span>
            </div>
          </div>
        </div>

        {/* Right: Recessed Radar Globe Scope */}
        <div className="y2k-lcd relative w-12 h-12 rounded-full flex items-center justify-center shrink-0">
          <Globe className="w-6 h-6 text-cyan-400/80 group-hover:scale-110 transition-transform" strokeWidth={1.3} />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
        </div>
      </div>
    </motion.div>
  );
}
