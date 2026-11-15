import { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { audioEngine } from '../../audio/AudioEngine';
import { useReceiverStore } from '../../store/useReceiverStore';

export default function SciFiLoader({ onEnter }) {
  const { progress, item, loaded, total } = useProgress();
  const [isReady, setIsReady] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const setAudioStarted = useReceiverStore((s) => s.setAudioStarted);

  // Smooth integer progress percentage
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const target = Math.round(progress);
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < target) return prev + 1;
        if (target >= 100 && prev >= 99) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        return prev;
      });
    }, 15);
    return () => clearInterval(interval);
  }, [progress]);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => setIsReady(true), 300);
      return () => clearTimeout(t);
    }
  }, [progress]);

  const handleEnter = async () => {
    audioEngine.unlockSync();
    try {
      await audioEngine.init();
      setAudioStarted(true);
    } catch (e) {
      console.warn('AudioContext initialization note:', e);
    }
    setFadingOut(true);
    setTimeout(() => {
      onEnter?.();
    }, 400);
  };

  // Calculate discrete blocks for authentic Win2K progress bar (total 20 blocks)
  const totalBlocks = 20;
  const filledBlocks = Math.floor((displayProgress / 100) * totalBlocks);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d14] text-gray-200 transition-opacity duration-500 font-mono ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background subtle retro grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Windows 2000s / Y2K Minimalist Aerospace Window Frame */}
      <div className="relative z-10 w-full max-w-md bg-[#161c28] border-2 border-t-slate-500 border-l-slate-500 border-b-slate-900 border-r-slate-900 shadow-2xl p-1 select-none">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-[#0a2569] to-[#1e4a9e] text-white text-xs font-bold tracking-wide">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-none inline-block" />
            <span className="truncate">NASA JPL Telemetry — [Voyager Record System]</span>
          </div>
          {/* Classic Window Controls */}
          <div className="flex items-center gap-1 text-[10px] shrink-0 font-sans">
            <button tabIndex={-1} aria-label="Minimize" className="w-4 h-4 bg-[#232d42] border border-slate-400 text-slate-300 flex items-center justify-center leading-none">_</button>
            <button tabIndex={-1} aria-label="Maximize" className="w-4 h-4 bg-[#232d42] border border-slate-400 text-slate-300 flex items-center justify-center leading-none">□</button>
            <button tabIndex={-1} aria-label="Close" className="w-4 h-4 bg-[#232d42] border border-slate-400 text-slate-300 flex items-center justify-center leading-none">✕</button>
          </div>
        </div>

        {/* Window Body */}
        <div className="p-4 space-y-4 text-xs bg-[#121620] border border-slate-800 m-1">
          {/* System description */}
          <div className="border-b border-slate-800 pb-3">
            <div className="text-white font-bold text-sm tracking-wide">THE RECEIVER v2.6</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              NASA Space Apps 2026 • Earth Observation Sonification Pipeline
            </div>
          </div>

          {/* Telemetry Stream Diagnostics checklist */}
          <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-[#090c12] p-2.5 border border-slate-800 rounded-none">
            <div className="text-slate-400 mb-1 border-b border-slate-800/80 pb-1">
              SYSTEM INITIALIZATION PROTOCOL:
            </div>
            <div className="flex items-center justify-between">
              <span>3D Canvas Pipeline</span>
              <span className="text-cyan-400">[READY]</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Planetary Geometry (earth.glb)</span>
              <span className={displayProgress > 30 ? 'text-emerald-400' : 'text-amber-400'}>
                {displayProgress > 30 ? '[MOUNTED]' : '[DOWNLINKING]'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Observer Entity (alien.glb)</span>
              <span className={displayProgress > 65 ? 'text-emerald-400' : 'text-slate-500'}>
                {displayProgress > 65 ? '[MOUNTED]' : '[WAITING]'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Orbital Craft (ufo.glb)</span>
              <span className={displayProgress > 90 ? 'text-emerald-400' : 'text-slate-500'}>
                {displayProgress > 90 ? '[MOUNTED]' : '[WAITING]'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Audio Synthesis Engine (Tone.js)</span>
              <span className={isReady ? 'text-emerald-400' : 'text-slate-500'}>
                {isReady ? '[READY]' : '[STANDBY]'}
              </span>
            </div>
          </div>

          {/* Authentic Win2K Segmented Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Telemetry Downlink:</span>
              <span className="text-white font-bold">{displayProgress}%</span>
            </div>

            <div className="h-5 p-0.5 bg-[#080b11] border-2 border-t-slate-800 border-l-slate-800 border-b-slate-600 border-r-slate-600 flex gap-0.5">
              {Array.from({ length: totalBlocks }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 transition-colors duration-100 ${
                    i < filledBlocks ? 'bg-[#0a4699]' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>

            <div className="text-[10px] text-slate-500 truncate">
              {item ? `Payload: ${item.split('/').pop()} (${loaded}/${total || 3})` : 'Awaiting data packets...'}
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2 flex justify-end">
            <button
              disabled={!isReady}
              onClick={handleEnter}
              className={`px-5 py-2 text-xs font-bold tracking-wider uppercase transition-all border-2 ${
                isReady
                  ? 'bg-[#1e2a42] text-white border-t-slate-400 border-l-slate-400 border-b-slate-900 border-r-slate-900 active:border-t-slate-900 active:border-l-slate-900 active:border-b-slate-400 active:border-r-slate-400 hover:bg-[#283756] cursor-pointer'
                  : 'bg-[#151922] text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
              {isReady ? 'ENTER TRANSMISSION [ENTER]' : 'INITIALIZING...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
