import { X, Eye, Keyboard } from 'lucide-react';
import { useReceiverStore } from '../../store/useReceiverStore';

export default function AccessibilityModal() {
  const isOpen = useReceiverStore((s) => s.isAccessibilityModalOpen);
  const setOpen = useReceiverStore((s) => s.setAccessibilityModalOpen);

  const invertPitch = useReceiverStore((s) => s.invertPitch);
  const setInvertPitch = useReceiverStore((s) => s.setInvertPitch);

  const highContrast = useReceiverStore((s) => s.highContrast);
  const setHighContrast = useReceiverStore((s) => s.setHighContrast);

  const reducedMotion = useReceiverStore((s) => s.reducedMotion);
  const setReducedMotion = useReceiverStore((s) => s.setReducedMotion);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Toggle Sonification Play / Pause' },
    { key: '→ / ←', desc: 'Next / Previous Data Observation' },
    { key: '1 to 7', desc: 'Switch Earth Station / Voyager Record' },
    { key: 'D', desc: 'Toggle Voyager Decoding Matrix' },
    { key: 'E', desc: 'Toggle Data Explorer Sidebar' },
    { key: 'M', desc: 'Mute / Unmute Audio Output' },
    { key: 'C', desc: 'Cycle 3D Camera Views' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[95vw] sm:max-w-lg bg-[#0f1420] border-2 border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden text-gray-100 max-h-[88vh] flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Eye className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 id="accessibility-title" className="text-xl font-bold font-mono tracking-wide text-cyan-300">
                ACCESSIBILITY & CONTROL
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Multimodal sonification adaptation & keyboard telemetry
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close Accessibility Settings"
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings switches */}
        <div className="overflow-y-auto custom-scrollbar my-4 space-y-3 flex-1 pr-1">
          {/* Invert Pitch */}
          <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div className="pr-4">
              <div className="text-sm font-bold font-mono text-white">Invert Pitch Direction</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Reverses frequency mapping so polar latitudes produce higher registers and equatorial values descend.
              </div>
            </div>
            <button
              onClick={() => setInvertPitch(!invertPitch)}
              role="switch"
              aria-checked={invertPitch}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                invertPitch ? 'bg-cyan-500' : 'bg-gray-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  invertPitch ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* High Contrast */}
          <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div className="pr-4">
              <div className="text-sm font-bold font-mono text-white">High Contrast Interface</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Enhances text clarity, panel borders, and focus rings for maximum legibility.
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              role="switch"
              aria-checked={highContrast}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                highContrast ? 'bg-cyan-500' : 'bg-gray-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  highContrast ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
            <div className="pr-4">
              <div className="text-sm font-bold font-mono text-white">Reduced Motion</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Slows 3D rotations and suspends bobbing camera trajectories.
              </div>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              role="switch"
              aria-checked={reducedMotion}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                reducedMotion ? 'bg-cyan-500' : 'bg-gray-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  reducedMotion ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Keyboard Shortcuts table */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-300 mb-3">
              <Keyboard className="w-4 h-4" />
              KEYBOARD SHORTCUTS
            </div>
            <div className="space-y-2">
              {shortcuts.map((sc, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">{sc.desc}</span>
                  <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-amber-300 font-bold">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-800 flex justify-end">
          <button
            onClick={() => setOpen(false)}
            className="px-5 py-2 bg-cyan-600/30 border border-cyan-500/50 hover:bg-cyan-500/40 rounded-lg text-cyan-300 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            CONFIRM SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
}
