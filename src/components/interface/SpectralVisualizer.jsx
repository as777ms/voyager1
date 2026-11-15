import { useRef, useEffect } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { useReceiverStore } from '../../store/useReceiverStore';

export default function SpectralVisualizer() {
  const canvasRef = useRef();
  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const activeStation = useReceiverStore((s) => s.getActiveStation());
  const setVisualIntensity = useReceiverStore((s) => s.setVisualIntensity);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const waveform = audioEngine.getWaveform();
      let maxAmp = 0;

      // Draw cyber waveform
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = activeStation.color || '#38bdf8';

      const sliceWidth = width / waveform.length;
      let x = 0;

      for (let i = 0; i < waveform.length; i++) {
        const v = isPlaying ? waveform[i] : Math.sin(Date.now() * 0.003 + i * 0.2) * 0.04;
        const amp = Math.abs(v);
        if (amp > maxAmp) maxAmp = amp;

        const y = (v * height * 0.45) + (height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();

      // Send normalized intensity to store for 3D reactive glow
      setVisualIntensity(Math.min(1.0, maxAmp * 2.5));

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, activeStation, setVisualIntensity]);

  return (
    <div className="relative w-36 sm:w-48 h-9 bg-gray-950/70 border border-cyan-500/25 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
      <canvas
        ref={canvasRef}
        width={192}
        height={36}
        className="w-full h-full block"
      />
      <div className="absolute top-1 left-2 text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest pointer-events-none">
        SPECTRA
      </div>
    </div>
  );
}
