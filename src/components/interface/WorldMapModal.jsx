import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Globe,
  Play,
  Square,
  Radio,
  Volume2,
  Crosshair,
  Waves,
  Satellite,
  Sparkles,
  GitCompare,
  ExternalLink,
  Activity,
  MapPin,
} from 'lucide-react';
import {
  COUNTRY_REGIONS,
  SVS_LAYERS,
  buildGibsWmsUrl,
  getSvsLayerById,
} from '../../data/svsLayers';
import {
  analyzeCanvasColumn,
  analyzePixelAt,
  analyzeRegionBoundingBox,
  mapValueToMidiChord,
  normalizedToPhysical,
  renderSvsCanvasLayer,
} from '../../audio/PixelSonifier';
import { useReceiverStore } from '../../store/useReceiverStore';
import { audioEngine } from '../../audio/AudioEngine';

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 360;

export default function WorldMapModal() {
  const isWorldMapOpen = useReceiverStore((s) => s.isWorldMapOpen);
  const setWorldMapOpen = useReceiverStore((s) => s.setWorldMapOpen);
  const setStation = useReceiverStore((s) => s.setStation);
  const selectedYear = useReceiverStore((s) => s.selectedYear);
  const setSelectedYear = useReceiverStore((s) => s.setSelectedYear);
  const invertPitch = useReceiverStore((s) => s.invertPitch);
  const activeSvsLayerId = useReceiverStore((s) => s.activeSvsLayerId);
  const setActiveSvsLayerId = useReceiverStore((s) => s.setActiveSvsLayerId);
  const hoverProbeAudio = useReceiverStore((s) => s.isHoverAudioActive);
  const toggleHoverAudio = useReceiverStore((s) => s.toggleHoverAudio);
  const globalAnnounceText = useReceiverStore((s) => s.hoverAnnounceText);

  const canvasRef = useRef(null);
  const baseMapImageRef = useRef(null);
  const dataOverlayImageRef = useRef(null);
  const lastHoverSoundRef = useRef(0);
  const scanXRef = useRef(360);
  const compareTimerRef = useRef(null);

  const activeLayer = useMemo(() => getSvsLayerById(activeSvsLayerId), [activeSvsLayerId]);

  const [selectedRegionId, setSelectedRegionId] = useState('ALL');
  const [useLiveGibs, setUseLiveGibs] = useState(true);
  const [baseMapStatus, setBaseMapStatus] = useState('RELIEF'); // 'BLUE_MARBLE' | 'RELIEF'
  const [overlayStatus, setOverlayStatus] = useState('CALIBRATED'); // 'LIVE' | 'CALIBRATED'
  const [yearOverride, setYearOverride] = useState(null);
  const [audioState, setAudioState] = useState(() => audioEngine.getAudioState());

  const [isScanning, setIsScanning] = useState(false);
  const [scanX, setScanX] = useState(360);
  const [cvReadout, setCvReadout] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  const renderYear = yearOverride ?? selectedYear ?? 2023;
  const effectiveBaseStatus = useLiveGibs ? baseMapStatus : 'RELIEF';
  const effectiveOverlayStatus = useLiveGibs && activeLayer?.gibsLayer ? overlayStatus : 'CALIBRATED';

  const selectedRegion = useMemo(
    () => COUNTRY_REGIONS.find((r) => r.id === selectedRegionId) || COUNTRY_REGIONS[0],
    [selectedRegionId]
  );

  // Periodically keep audio state badge fresh when modal is open
  useEffect(() => {
    if (!isWorldMapOpen) return undefined;
    const id = setInterval(() => {
      setAudioState(audioEngine.getAudioState());
    }, 350);
    return () => clearInterval(id);
  }, [isWorldMapOpen]);

  // Live Audio Reader subtitle state for visual feedback + screen reader
  const [audioReaderText, setAudioReaderText] = useState('');
  const lastHoverSpokenRef = useRef('');

  const announceControl = useCallback(
    (label, actionType = 'default') => {
      if (!hoverProbeAudio) return;
      setAudioReaderText(label);
      useReceiverStore.setState({ announcementText: label });
      if (lastHoverSpokenRef.current === label) return;
      lastHoverSpokenRef.current = label;

      audioEngine.speakHoverCue(label, { rate: 1.15, actionType });
    },
    [hoverProbeAudio]
  );

  const clearHoverControl = useCallback(() => {
    setTimeout(() => {
      lastHoverSpokenRef.current = '';
    }, 140);
  }, []);

  // Cancel comparison timeout safely
  const cancelCompare = useCallback(() => {
    if (compareTimerRef.current) {
      clearTimeout(compareTimerRef.current);
      compareTimerRef.current = null;
    }
    setIsComparing(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsScanning(false);
    cancelCompare();
    setYearOverride(null);
    audioEngine.stopHoverSpeech();
    setWorldMapOpen(false);
  }, [cancelCompare, setWorldMapOpen]);

  useEffect(() => {
    if (!isWorldMapOpen) {
      if (compareTimerRef.current) {
        clearTimeout(compareTimerRef.current);
        compareTimerRef.current = null;
      }
      audioEngine.stopHoverSpeech();
    }
    return () => {
      if (compareTimerRef.current) {
        clearTimeout(compareTimerRef.current);
        compareTimerRef.current = null;
      }
      audioEngine.stopHoverSpeech();
    };
  }, [isWorldMapOpen]);

  const drawCanvas = useCallback(
    (yearVal = renderYear) => {
      if (!canvasRef.current || !activeLayer) return;
      renderSvsCanvasLayer(canvasRef.current, activeLayer, {
        year: yearVal,
        baseMapImage: useLiveGibs ? baseMapImageRef.current : null,
        dataOverlayImage: useLiveGibs ? dataOverlayImageRef.current : null,
      });
    },
    [activeLayer, renderYear, useLiveGibs]
  );

  // Load NASA BlueMarble_NextGeneration once (via CORS-free proxy in dev)
  useEffect(() => {
    if (!isWorldMapOpen || !useLiveGibs) return undefined;
    if (baseMapImageRef.current?.complete && baseMapImageRef.current?.naturalWidth > 0) {
      return undefined;
    }

    let cancelled = false;
    const url = buildGibsWmsUrl('BlueMarble_NextGeneration', null, 'image/jpeg');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      baseMapImageRef.current = img;
      setBaseMapStatus('BLUE_MARBLE');
      drawCanvas(renderYear);
    };
    img.onerror = () => {
      if (cancelled) return;
      baseMapImageRef.current = null;
      setBaseMapStatus('RELIEF');
      drawCanvas(renderYear);
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [isWorldMapOpen, useLiveGibs, drawCanvas, renderYear]);

  // Load active NASA GIBS layer overlay when activeLayer / useLiveGibs changes
  useEffect(() => {
    if (!isWorldMapOpen || !activeLayer || !useLiveGibs || !activeLayer.gibsLayer) {
      dataOverlayImageRef.current = null;
      return undefined;
    }

    dataOverlayImageRef.current = null;
    let cancelled = false;
    const dateStr = activeLayer.gibsDefaultDate || `${Math.min(2024, Math.max(2012, renderYear))}-06-01`;
    const url = buildGibsWmsUrl(activeLayer.gibsLayer, dateStr, 'image/png');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      dataOverlayImageRef.current = img;
      setOverlayStatus('LIVE');
      drawCanvas(renderYear);
    };
    img.onerror = () => {
      if (cancelled) return;
      dataOverlayImageRef.current = null;
      setOverlayStatus('CALIBRATED');
      drawCanvas(renderYear);
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [isWorldMapOpen, activeLayer, useLiveGibs, drawCanvas, renderYear]);

  // Ensure canvas always repaints immediately on layer/year switches
  useEffect(() => {
    if (!isWorldMapOpen) return;
    drawCanvas(renderYear);
  }, [isWorldMapOpen, activeLayer, renderYear, drawCanvas]);

  const readCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d', { willReadFrequently: true });
  }, []);

  // Analyze initial / updated layer center column or region via requestAnimationFrame callback
  useEffect(() => {
    if (!isWorldMapOpen || !activeLayer) return undefined;
    const rafId = requestAnimationFrame(() => {
      const ctx = readCanvasContext();
      if (!ctx) return;
      const summary = analyzeRegionBoundingBox(
        ctx,
        selectedRegion.bounds,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        activeLayer,
        { invertPitch }
      );
      if (summary) {
        setCvReadout({
          sourceLabel: `${selectedRegion.label} (${renderYear})`,
          redPct: summary.redPct,
          greenPct: summary.greenPct,
          bluePct: summary.bluePct,
          hue: summary.hue,
          hex: summary.hex,
          brightnessPct: summary.brightnessPct,
          densityPct: summary.densityPct,
          physicalValue: summary.physicalMean,
          peakValue: summary.physicalPeak,
          unit: activeLayer.unit,
          binaryPulse: summary.binaryPulse,
          chord: summary.overallChord,
          pan: 0,
        });
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [isWorldMapOpen, activeLayer, selectedRegion, renderYear, invertPitch, readCanvasContext]);

  // Planetary left-to-right column scan loop
  useEffect(() => {
    if (!isWorldMapOpen || !isScanning || !activeLayer) return undefined;

    const timer = setInterval(() => {
      const ctx = readCanvasContext();
      if (!ctx) return;

      const nextX = (scanXRef.current + 12) % CANVAS_WIDTH;
      scanXRef.current = nextX;
      setScanX(nextX);

      const colResult = analyzeCanvasColumn(ctx, nextX, CANVAS_WIDTH, CANVAS_HEIGHT, activeLayer, {
        invertPitch,
      });
      if (colResult) {
        setCvReadout({
          sourceLabel: `Scan Lon ${colResult.lon}° (Peak Lat ${colResult.peakLat}°)`,
          redPct: colResult.redPct,
          greenPct: colResult.greenPct,
          bluePct: colResult.bluePct,
          hue: colResult.hue,
          hex: `rgb(${colResult.avgRgb.join(',')})`,
          brightnessPct: colResult.brightnessPct,
          densityPct: colResult.densityPct,
          physicalValue: colResult.physicalMean,
          peakValue: colResult.physicalPeak,
          unit: activeLayer.unit,
          binaryPulse: colResult.binaryPulse,
          chord: colResult.dominantChord,
          pan: colResult.pan,
        });
        audioEngine.playSonifiedColumn(colResult, activeLayer);
      }
    }, 240);

    return () => clearInterval(timer);
  }, [isWorldMapOpen, isScanning, activeLayer, invertPitch, readCanvasContext]);

  const handleSelectLayer = (layer) => {
    audioEngine.unlockSync();
    audioEngine.stopActiveSequences();
    setAudioState(audioEngine.getAudioState());
    cancelCompare();
    setCompareResult(null);
    setActiveSvsLayerId(layer.id);
    if (layer.stationLinkId) {
      setStation(layer.stationLinkId);
    }
    const defaultYr = layer.compareYears?.[1] || 2023;
    setYearOverride(defaultYr);

    // Play immediate signature chord preview for the selected NASA SVS layer
    const previewChord = mapValueToMidiChord(0.65, {
      higherDataLowerPitch: layer.defaultHigherIsLowerPitch ?? true,
      invertPitch,
    });
    audioEngine.playProbeChord(
      {
        pan: 0,
        normalized: 0.65,
        binaryPulse: 1,
        chord: previewChord,
      },
      layer
    );
  };

  const handleProbeAtClientCoords = (clientX, clientY, playAudio = true) => {
    const canvas = canvasRef.current;
    const ctx = readCanvasContext();
    if (!canvas || !ctx || !activeLayer) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    const probe = analyzePixelAt(ctx, x, y, CANVAS_WIDTH, CANVAS_HEIGHT, activeLayer, {
      invertPitch,
    });
    if (!probe) return;

    scanXRef.current = probe.x;
    setScanX(probe.x);
    setCvReadout({
      sourceLabel: `Pixel Probe (${probe.lat}°, ${probe.lon}°)`,
      redPct: probe.redPct,
      greenPct: probe.greenPct,
      bluePct: probe.bluePct,
      hue: probe.hue,
      hex: probe.hex,
      brightnessPct: probe.brightnessPct,
      densityPct: probe.binaryPulse ? 100 : 12,
      physicalValue: probe.physicalValue,
      peakValue: probe.physicalValue,
      unit: probe.unit,
      binaryPulse: probe.binaryPulse,
      chord: probe.chord,
      pan: probe.pan,
    });

    if (playAudio) {
      audioEngine.playProbeChord(probe, activeLayer);
      setAudioState(audioEngine.getAudioState());
    }

    // Blind accessibility: announce hotspot name and value when cursor crosses nearby
    if (hoverProbeAudio && activeLayer.hotspots) {
      const nearbySpot = activeLayer.hotspots.find((spot) => {
        const dLon = Math.abs(spot.lon - probe.lon);
        const dLat = Math.abs(spot.lat - probe.lat);
        return dLon < 10 && dLat < 7;
      });
      if (nearbySpot && lastHoverSpokenRef.current !== nearbySpot.name) {
        lastHoverSpokenRef.current = nearbySpot.name;
        audioEngine.speakHoverCue(
          `Hotspot: ${nearbySpot.name}, ${probe.physicalValue} ${activeLayer.unit}`,
          { rate: 1.15, playPing: false }
        );
      }
    }
  };

  const handleSonifyCountry = () => {
    audioEngine.unlockSync();
    setAudioState(audioEngine.getAudioState());
    setIsScanning(false);
    cancelCompare();

    const ctx = readCanvasContext();
    if (!ctx || !activeLayer) return;

    drawCanvas(renderYear);
    const analysis = analyzeRegionBoundingBox(
      ctx,
      selectedRegion.bounds,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      activeLayer,
      { invertPitch }
    );
    if (!analysis) return;

    setCvReadout({
      sourceLabel: `${selectedRegion.label} Sweep (${renderYear})`,
      redPct: analysis.redPct,
      greenPct: analysis.greenPct,
      bluePct: analysis.bluePct,
      hue: analysis.hue,
      hex: analysis.hex,
      brightnessPct: analysis.brightnessPct,
      densityPct: analysis.densityPct,
      physicalValue: analysis.physicalMean,
      peakValue: analysis.physicalPeak,
      unit: activeLayer.unit,
      binaryPulse: analysis.binaryPulse,
      chord: analysis.overallChord,
      pan: 0,
    });

    audioEngine.playRegionSweep(analysis, activeLayer);
    if (hoverProbeAudio) {
      audioEngine.speakHoverCue(
        `Sonifying ${selectedRegion.label}. Year ${renderYear}. Mean value: ${analysis.physicalMean} ${activeLayer.unit}. Chord: ${analysis.overallChord?.chordName}`,
        { rate: 1.15, playPing: false }
      );
    }
  };

  const handleYearChange = (yr) => {
    audioEngine.unlockSync();
    cancelCompare();
    setCompareResult(null);
    setYearOverride(yr);
    setSelectedYear(yr);
    drawCanvas(yr);

    const ctx = readCanvasContext();
    if (ctx && activeLayer) {
      const analysis = analyzeRegionBoundingBox(
        ctx,
        selectedRegion.bounds,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        activeLayer,
        { invertPitch }
      );
      if (analysis) {
        setCvReadout({
          sourceLabel: `${selectedRegion.label} (${yr})`,
          redPct: analysis.redPct,
          greenPct: analysis.greenPct,
          bluePct: analysis.bluePct,
          hue: analysis.hue,
          hex: analysis.hex,
          brightnessPct: analysis.brightnessPct,
          densityPct: analysis.densityPct,
          physicalValue: analysis.physicalMean,
          peakValue: analysis.physicalPeak,
          unit: activeLayer.unit,
          binaryPulse: analysis.binaryPulse,
          chord: analysis.overallChord,
          pan: 0,
        });
        audioEngine.playRegionSweep(analysis, activeLayer);
        if (hoverProbeAudio) {
          audioEngine.speakHoverCue(
            `Observation year ${yr}. Mean: ${analysis.physicalMean} ${activeLayer.unit}. Brightness: ${analysis.brightnessPct} percent. Chord: ${analysis.overallChord?.chordName}`,
            { rate: 1.15, playPing: true }
          );
        }
      }
    }
  };

  const handleComparePeriods = (customYrA = 2010, customYrB = 2026) => {
    audioEngine.unlockSync();
    setAudioState(audioEngine.getAudioState());
    setIsScanning(false);
    cancelCompare();

    const ctx = readCanvasContext();
    if (!ctx || !activeLayer) return;

    const yrA = Number(customYrA) || 2010;
    const yrB = Number(customYrB) || 2026;
    setIsComparing(true);
    setCompareResult({ phase: 'PERIOD_A', yrA, yrB });

    if (hoverProbeAudio) {
      audioEngine.speakHoverCue(
        `Starting comparison across ${selectedRegion.label}. Playing Period A: year ${yrA} baseline.`,
        { rate: 1.1, playPing: true }
      );
    }

    // Period A render + capture + play
    setYearOverride(yrA);
    setSelectedYear(yrA);
    renderSvsCanvasLayer(canvasRef.current, activeLayer, {
      year: yrA,
      baseMapImage: useLiveGibs ? baseMapImageRef.current : null,
      dataOverlayImage: useLiveGibs ? dataOverlayImageRef.current : null,
    });
    const resA = analyzeRegionBoundingBox(
      ctx,
      selectedRegion.bounds,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      activeLayer,
      { invertPitch }
    );
    if (resA) {
      setCvReadout({
        sourceLabel: `Period A: ${selectedRegion.label} (${yrA})`,
        redPct: resA.redPct,
        greenPct: resA.greenPct,
        bluePct: resA.bluePct,
        hue: resA.hue,
        hex: resA.hex,
        brightnessPct: resA.brightnessPct,
        densityPct: resA.densityPct,
        physicalValue: resA.physicalMean,
        peakValue: resA.physicalPeak,
        unit: activeLayer.unit,
        binaryPulse: resA.binaryPulse,
        chord: resA.overallChord,
        pan: 0,
      });
      audioEngine.playRegionSweep(resA, activeLayer);
    }

    // Period B render + capture + play after 2.35s
    compareTimerRef.current = setTimeout(() => {
      if (!canvasRef.current) return;
      const ctxB = readCanvasContext();
      if (!ctxB) return;

      setYearOverride(yrB);
      setSelectedYear(yrB);
      renderSvsCanvasLayer(canvasRef.current, activeLayer, {
        year: yrB,
        baseMapImage: useLiveGibs ? baseMapImageRef.current : null,
        dataOverlayImage: useLiveGibs ? dataOverlayImageRef.current : null,
      });
      const resB = analyzeRegionBoundingBox(
        ctxB,
        selectedRegion.bounds,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        activeLayer,
        { invertPitch }
      );
      if (resB) {
        setCvReadout({
          sourceLabel: `Period B: ${selectedRegion.label} (${yrB})`,
          redPct: resB.redPct,
          greenPct: resB.greenPct,
          bluePct: resB.bluePct,
          hue: resB.hue,
          hex: resB.hex,
          brightnessPct: resB.brightnessPct,
          densityPct: resB.densityPct,
          physicalValue: resB.physicalMean,
          peakValue: resB.physicalPeak,
          unit: activeLayer.unit,
          binaryPulse: resB.binaryPulse,
          chord: resB.overallChord,
          pan: 0,
        });
        audioEngine.playRegionSweep(resB, activeLayer);
        const bDelta = resB.brightnessPct - (resA?.brightnessPct ?? 0);
        setCompareResult({
          phase: 'DONE',
          yrA,
          yrB,
          regionLabel: selectedRegion.label,
          brightA: resA?.brightnessPct ?? 0,
          brightB: resB.brightnessPct,
          meanA: resA?.physicalMean ?? 0,
          meanB: resB.physicalMean,
          chordA: resA?.overallChord?.chordName ?? '—',
          chordB: resB.overallChord?.chordName ?? '—',
          velA: resA?.overallChord?.midiVelocity ?? 35,
          velB: resB.overallChord?.midiVelocity ?? 35,
        });

        if (hoverProbeAudio) {
          const deltaWord = bDelta >= 0 ? 'increased by' : 'decreased by';
          audioEngine.speakHoverCue(
            `Period B year ${yrB} anomaly. Brightness ${deltaWord} ${Math.abs(bDelta)} percent. Mean value is ${resB.physicalMean} ${activeLayer.unit}. Chord shifted from ${resA?.overallChord?.chordName || 'C4'} to ${resB.overallChord?.chordName || 'G5'}.`,
            { rate: 1.15, playPing: false }
          );
        }
      }
      setIsComparing(false);
    }, 2350);
  };

  const handleStopAllAudioScan = () => {
    setIsScanning(false);
    cancelCompare();
  };

  const handleStopClickColorStop = (stop) => {
    audioEngine.unlockSync();
    setAudioState(audioEngine.getAudioState());
    const chord = mapValueToMidiChord(stop.t, {
      higherDataLowerPitch: activeLayer.defaultHigherIsLowerPitch ?? true,
      invertPitch,
    });
    const probe = {
      pan: 0,
      normalized: stop.t,
      binaryPulse: stop.t >= (activeLayer.binaryThreshold ?? 0.6) ? 1 : 0,
      chord,
    };
    const physVal = normalizedToPhysical(stop.t, activeLayer);
    setCvReadout({
      sourceLabel: `Legend Stop: ${stop.label}`,
      redPct: Math.round((stop.rgb[0] / 255) * 100),
      greenPct: Math.round((stop.rgb[1] / 255) * 100),
      bluePct: Math.round((stop.rgb[2] / 255) * 100),
      hue: 0,
      hex: stop.hex,
      brightnessPct: Math.round(((0.299 * stop.rgb[0] + 0.587 * stop.rgb[1] + 0.114 * stop.rgb[2]) / 255) * 100),
      densityPct: stop.t >= (activeLayer.binaryThreshold ?? 0.6) ? 100 : 15,
      physicalValue: physVal,
      peakValue: physVal,
      unit: activeLayer.unit,
      binaryPulse: probe.binaryPulse,
      chord,
      pan: 0,
    });
    audioEngine.playProbeChord(probe, activeLayer);
    if (hoverProbeAudio) {
      audioEngine.speakHoverCue(
        `Scale stop ${stop.label}. Physical value ${physVal} ${activeLayer.unit}. Chord ${chord.chordName}`,
        { rate: 1.15, playPing: false }
      );
    }
  };

  // Compute SVG percentage coordinates for the selected Country/Region reticle box
  const regionBoxPct = useMemo(() => {
    const b = selectedRegion.bounds;
    const left = ((b.minLon + 180) / 360) * 100;
    const right = ((b.maxLon + 180) / 360) * 100;
    const top = ((90 - b.maxLat) / 180) * 100;
    const bottom = ((90 - b.minLat) / 180) * 100;
    return {
      left: `${Math.max(0, left)}%`,
      top: `${Math.max(0, top)}%`,
      width: `${Math.max(2, right - left)}%`,
      height: `${Math.max(2, bottom - top)}%`,
    };
  }, [selectedRegion]);

  const compareYears = activeLayer?.compareYears || [2012, 2023];

  return (
    <AnimatePresence>
      {isWorldMapOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-3 md:p-4 bg-black/75 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="y2k-window w-full max-w-5xl max-h-[96vh] sm:max-h-[94vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-cyan-500/35"
          >
            {/* 1. Metallic Top Bar + Audio Unlock Pill + Live Satellite Status */}
            <div className="y2k-titlebar px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-cyan-300 shrink-0" />
                <span className="text-[11px] font-mono font-extrabold text-white tracking-wider uppercase truncate">
                  NASA EIC // EARTH JUKEBOX SONIFIER
                </span>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                    effectiveOverlayStatus === 'LIVE' || effectiveBaseStatus === 'BLUE_MARBLE'
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                      : 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                  }`}
                >
                  <Satellite className="w-3 h-3" />
                  {effectiveOverlayStatus === 'LIVE'
                    ? 'LIVE NASA GIBS + BLUE MARBLE'
                    : effectiveBaseStatus === 'BLUE_MARBLE'
                    ? 'NASA BLUE MARBLE + SVS DATA'
                    : 'CALIBRATED EARTH RELIEF'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    audioEngine.unlockSync();
                    audioEngine.playTestTone();
                    setAudioState(audioEngine.getAudioState());
                  }}
                  onMouseEnter={() => announceControl("Unlock and test Web Audio synthesizer", "toggle")}
                  onMouseLeave={clearHoverControl}
                  onFocus={() => announceControl("Unlock and test Web Audio synthesizer", "toggle")}
                  title="Test & Unlock Web Audio Synthesizer"
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
                    audioState === 'running'
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/30'
                      : 'bg-amber-500/25 border-amber-400 text-amber-200 animate-pulse hover:bg-amber-500/35'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{audioState === 'running' ? 'AUDIO: RUNNING (TEST)' : 'UNLOCK / TEST AUDIO'}</span>
                </button>

                <button
                  onClick={() => setUseLiveGibs((v) => !v)}
                  onMouseEnter={() => announceControl(useLiveGibs ? "NASA GIBS satellite imagery feed active. Click to switch to offline relief." : "NASA GIBS satellite imagery feed disabled. Click to enable.", "toggle")}
                  onMouseLeave={clearHoverControl}
                  onFocus={() => announceControl("NASA GIBS satellite imagery feed toggle", "toggle")}
                  className={`y2k-metal-btn px-2 py-1 rounded text-[9px] font-mono font-bold cursor-pointer ${
                    useLiveGibs ? 'text-cyan-200 border-cyan-400/50' : 'text-slate-400'
                  }`}
                  title="Toggle NASA GIBS WMS Satellite Fetch"
                >
                  GIBS: {useLiveGibs ? 'AUTO' : 'OFF'}
                </button>

                <button
                  onClick={handleCloseModal}
                  onMouseEnter={() => announceControl("Close Earth Jukebox Map", "close")}
                  onMouseLeave={clearHoverControl}
                  onFocus={() => announceControl("Close Earth Jukebox Map", "close")}
                  aria-label="Close Earth Jukebox Map"
                  className="y2k-metal-btn p-1 rounded text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-3">
              {/* Audio Reader Live Telemetry Banner (when active) */}
              {hoverProbeAudio && (
                <div className="bg-emerald-950/70 border border-emerald-400/50 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-[10px] font-mono text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                    <span className="font-extrabold uppercase text-emerald-300 shrink-0">AUDIO READER ACTIVE:</span>
                    <span className="truncate text-white font-medium">
                      {audioReaderText || globalAnnounceText || "Hover over any button, scale key, or Earth map pixel..."}
                    </span>
                  </div>
                  <span className="text-[9px] text-emerald-400/90 shrink-0 hidden sm:inline bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-500/30">
                    Dual Web Audio Earcons + Voice
                  </span>
                </div>
              )}

              {/* 2. Eight Official NASA SVS Resource Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {SVS_LAYERS.map((layer) => {
                  const active = layer.id === activeLayer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => handleSelectLayer(layer)}
                      onMouseEnter={() => announceControl(`Dataset: ${layer.shortName}, NASA SVS ${layer.svsId}`, "layer")}
                      onMouseLeave={clearHoverControl}
                      onFocus={() => announceControl(`Dataset: ${layer.shortName}, NASA SVS ${layer.svsId}`, "layer")}
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-cyan-500/25 border-cyan-300 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                          : 'bg-slate-900/75 border-slate-700/80 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                      }`}
                    >
                      <span className="text-cyan-400">#{layer.svsId}</span>
                      <span>{layer.shortName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Dataset Metadata Strip + Direct SVS Link */}
              <div className="bg-slate-950/75 border border-slate-700/80 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{activeLayer.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {activeLayer.source}
                    </span>
                    <span className="text-[9px] font-mono text-amber-300">
                      Range: {activeLayer.realTimeRange} • Active Year: {renderYear}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-300 mt-0.5 leading-snug">
                    {activeLayer.description}
                  </p>
                </div>

                <a
                  href={activeLayer.svsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => announceControl(`External reference: open NASA Scientific Visualization Studio ${activeLayer.svsId} in browser`, "layer")}
                  onMouseLeave={clearHoverControl}
                  onFocus={() => announceControl(`External reference: open NASA SVS ${activeLayer.svsId}`, "layer")}
                  className="y2k-metal-btn px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold text-cyan-300 hover:text-white flex items-center gap-1 shrink-0"
                >
                  <span>NASA SVS #{activeLayer.svsId}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* 3. Jukebox Transport + Country Region Selector + Period Comparison Bar */}
              <div className="bg-slate-900/75 border border-slate-700/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
                {/* Left: Country / Region Bounding Box + Sonify Region */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <label className="text-[9px] font-mono text-cyan-300 uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Region:
                  </label>
                  <select
                    value={selectedRegionId}
                    onMouseEnter={() => announceControl("Select geographic region for sonic analysis", "region")}
                    onMouseLeave={clearHoverControl}
                    onFocus={() => announceControl("Select geographic region for sonic analysis", "region")}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      audioEngine.unlockSync();
                      setSelectedRegionId(nextId);
                      const nextRegion = COUNTRY_REGIONS.find((r) => r.id === nextId) || COUNTRY_REGIONS[0];
                      const ctx = readCanvasContext();
                      if (ctx && activeLayer) {
                        const analysis = analyzeRegionBoundingBox(
                          ctx,
                          nextRegion.bounds,
                          CANVAS_WIDTH,
                          CANVAS_HEIGHT,
                          activeLayer,
                          { invertPitch }
                        );
                        if (analysis) {
                          audioEngine.playRegionSweep(analysis, activeLayer);
                          if (hoverProbeAudio) {
                            announceControl(`Region selected: ${nextRegion.label}. Mean value: ${analysis.physicalMean} ${activeLayer.unit}`, "region");
                          }
                        }
                      }
                    }}
                    className="bg-slate-950 border border-cyan-500/40 rounded-lg px-2 py-1 text-[10px] font-mono text-white cursor-pointer focus:outline-none focus:border-cyan-300"
                  >
                    {COUNTRY_REGIONS.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSonifyCountry}
                    onMouseEnter={() => announceControl("Sonify Region: scans selected territory and plays synthesized multi-octave chord", "sonify")}
                    onMouseLeave={clearHoverControl}
                    onFocus={() => announceControl("Sonify Region", "sonify")}
                    className="y2k-aqua-btn px-3 py-1 rounded-lg text-[10px] font-mono font-extrabold text-slate-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>SONIFY REGION</span>
                  </button>

                  <button
                    onClick={() => handleComparePeriods(2010, 2026)}
                    disabled={isComparing}
                    onMouseEnter={() => announceControl("Compare 2010 baseline against 2026 crisis anomaly: dual-phase sweep measuring delta shift", "compare")}
                    onMouseLeave={clearHoverControl}
                    onFocus={() => announceControl("Compare 2010 baseline against 2026 crisis anomaly", "compare")}
                    className="y2k-gold-btn px-3 py-1 rounded-lg text-[10px] font-mono font-extrabold text-slate-950 flex items-center gap-1 cursor-pointer disabled:opacity-60"
                    title="Compare 2010 baseline vs 2026 crisis anomaly pixels & chords"
                  >
                    <GitCompare className="w-3 h-3" />
                    <span>
                      {isComparing
                        ? `COMPARING ${compareResult?.yrA ?? 2010} ↔ ${compareResult?.yrB ?? 2026}...`
                        : 'COMPARE 2010 ↔ 2026 (16-YR DELTA)'}
                    </span>
                  </button>

                  {compareYears && (compareYears[0] !== 2010 || compareYears[1] !== 2026) && (
                    <button
                      onClick={() => handleComparePeriods(compareYears[0], compareYears[1])}
                      disabled={isComparing}
                      onMouseEnter={() => announceControl(`Compare SVS archive years ${compareYears[0]} against ${compareYears[1]}`, "compare")}
                      onMouseLeave={clearHoverControl}
                      onFocus={() => announceControl(`Compare SVS archive years ${compareYears[0]} against ${compareYears[1]}`, "compare")}
                      className="y2k-metal-btn px-2 py-1 rounded-lg text-[9px] font-mono font-bold text-amber-300 hover:text-white cursor-pointer disabled:opacity-60"
                    >
                      <span>SVS: {compareYears[0]} ↔ {compareYears[1]}</span>
                    </button>
                  )}
                </div>

                {/* Right: Full Planet Scan, Calibrate Scale, Hover Probe, Year Scrub */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => {
                      audioEngine.unlockSync();
                      setAudioState(audioEngine.getAudioState());
                      cancelCompare();
                      setIsScanning((s) => !s);
                    }}
                    onMouseEnter={() => announceControl(isScanning ? "Stop planetary scan" : "Scan Planet: continuous orbital meridian scan from west to east", "scan")}
                    onMouseLeave={clearHoverControl}
                    onFocus={() => announceControl(isScanning ? "Stop scan" : "Scan Planet", "scan")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer ${
                      isScanning
                        ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                        : 'y2k-metal-btn text-cyan-200 hover:text-white'
                    }`}
                  >
                    {isScanning ? <Square className="w-3 h-3 fill-current" /> : <Radio className="w-3 h-3" />}
                    <span>{isScanning ? 'STOP SCAN' : 'SCAN PLANET'}</span>
                  </button>

                  <button
                    onClick={() => {
                      audioEngine.unlockSync();
                      setAudioState(audioEngine.getAudioState());
                      audioEngine.playScaleCalibration(activeLayer, { invertPitch, speak: false });
                    }}
                    onMouseEnter={() => announceControl("Calibrate Key: plays audio spectrum from lowest to highest data value", "calibrate")}
                    onMouseLeave={clearHoverControl}
                    onFocus={() => announceControl("Calibrate Key: plays audio spectrum", "calibrate")}
                    className="y2k-metal-btn px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-amber-200 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Waves className="w-3 h-3" />
                    <span>CALIBRATE KEY</span>
                  </button>

                  <button
                    onClick={toggleHoverAudio}
                    onMouseEnter={() => announceControl(hoverProbeAudio ? "Hover Audio active: announces map coordinates and interface buttons" : "Hover Audio off: click to enable blind accessibility mode", "toggle")}
                    onMouseLeave={clearHoverControl}
                    onFocus={() => announceControl("Hover Audio toggle", "toggle")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer ${
                      hoverProbeAudio
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'y2k-metal-btn text-slate-300 hover:text-white'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>HOVER AUDIO: {hoverProbeAudio ? 'ON' : 'OFF'}</span>
                  </button>

                  <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700 rounded-lg px-2 py-0.5">
                    <span className="text-[9px] font-mono text-cyan-300 font-bold mr-0.5">YEAR:</span>
                    {[2010, 2014, 2018, 2022, 2026].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => handleYearChange(yr)}
                        onMouseEnter={() => announceControl(`Select Observation Year ${yr}`, "year")}
                        onMouseLeave={clearHoverControl}
                        onFocus={() => announceControl(`Select Observation Year ${yr}`, "year")}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                          renderYear === yr
                            ? yr >= 2022
                              ? 'bg-rose-500 text-white font-extrabold shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                              : 'bg-cyan-400 text-slate-950 font-extrabold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Period A vs Period B Delta Banner (when comparison runs) */}
              {compareResult && (
                <div className="bg-amber-950/35 border border-amber-400/50 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                  {compareResult.phase === 'PERIOD_A' ? (
                    <span className="text-amber-200 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Playing Period A ({compareResult.yrA}) across {selectedRegion.label}... switching to {compareResult.yrB} in 2s
                    </span>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3 text-amber-100">
                        <span className="font-bold text-amber-300 uppercase">
                          COMPARE {compareResult.yrA} → {compareResult.yrB} ({compareResult.regionLabel}):
                        </span>
                        <span>
                          Mean: <strong>{compareResult.meanA}</strong> → <strong>{compareResult.meanB}</strong> {activeLayer.unit}
                        </span>
                        <span>
                          Brightness: <strong>{compareResult.brightA}%</strong> → <strong>{compareResult.brightB}%</strong>{' '}
                          ({compareResult.brightB - compareResult.brightA >= 0 ? '+' : ''}
                          {compareResult.brightB - compareResult.brightA}%)
                        </span>
                        <span>
                          Chord: <strong className="text-cyan-300">{compareResult.chordA}</strong> →{' '}
                          <strong className="text-emerald-300">{compareResult.chordB}</strong> (Vel {compareResult.velA} → {compareResult.velB})
                        </span>
                      </div>
                      <button
                        onClick={handleStopAllAudioScan}
                        className="text-[9px] text-amber-300 underline cursor-pointer"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* 4. Interactive NASA Earth Canvas + SVG Overlay + Live CV Formula Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                {/* Left 8 Cols: Earth Pixel Canvas + Non-Destructive Reticle Overlay */}
                <div className="lg:col-span-8 space-y-2">
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-inner">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                      onMouseEnter={() => announceControl("Interactive Earth Canvas: move cursor across pixels to sonify chords in real time", "scan")}
                      onMouseLeave={clearHoverControl}
                      onClick={(e) => {
                        audioEngine.unlockSync();
                        setIsScanning(false);
                        handleProbeAtClientCoords(e.clientX, e.clientY, true);
                      }}
                      onMouseMove={(e) => {
                        if (!hoverProbeAudio) return;
                        const now = performance.now();
                        if (now - lastHoverSoundRef.current < 130) return;
                        lastHoverSoundRef.current = now;
                        audioEngine.unlockSync();
                        handleProbeAtClientCoords(e.clientX, e.clientY, true);
                      }}
                      onTouchStart={(e) => {
                        if (e.touches && e.touches[0]) {
                          audioEngine.unlockSync();
                          setIsScanning(false);
                          handleProbeAtClientCoords(e.touches[0].clientX, e.touches[0].clientY, true);
                        }
                      }}
                      onTouchMove={(e) => {
                        if (e.touches && e.touches[0]) {
                          const now = performance.now();
                          if (now - lastHoverSoundRef.current < 130) return;
                          lastHoverSoundRef.current = now;
                          audioEngine.unlockSync();
                          handleProbeAtClientCoords(e.touches[0].clientX, e.touches[0].clientY, true);
                        }
                      }}
                      className="w-full h-auto block cursor-crosshair select-none touch-none"
                    />

                    {/* Non-Destructive Overlay: Selected Country Reticle + Scanline + Hotspots */}
                    <div className="pointer-events-none absolute inset-0">
                      {selectedRegionId !== 'ALL' && (
                        <div
                          style={regionBoxPct}
                          className="absolute border-2 border-amber-300 bg-amber-300/10 shadow-[0_0_14px_rgba(251,191,36,0.45)] transition-all duration-200"
                        >
                          <span className="absolute -top-4 left-0 bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded text-[8px] font-mono font-extrabold whitespace-nowrap">
                            {selectedRegion.label}
                          </span>
                        </div>
                      )}

                      {/* Active Meridian Scanline */}
                      <div
                        style={{ left: `${(scanX / CANVAS_WIDTH) * 100}%` }}
                        className="absolute top-0 bottom-0 w-0.5 bg-cyan-300/85 shadow-[0_0_8px_rgba(34,211,238,0.9)]"
                      />

                      {/* NASA EIC Hotspots */}
                      {activeLayer.hotspots?.map((spot) => {
                        const leftPct = ((spot.lon + 180) / 360) * 100;
                        const topPct = ((90 - spot.lat) / 180) * 100;
                        return (
                          <div
                            key={spot.name}
                            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                          >
                            <div className="w-2 h-2 rounded-full bg-white border border-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                          </div>
                        );
                      })}
                    </div>

                    <div className="pointer-events-none absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-cyan-100/90 bg-slate-950/65 px-2 py-0.5 rounded">
                      <span>Click anywhere on Earth to probe & play pixel chord</span>
                      <span>EPSG:4326 • {CANVAS_WIDTH}×{CANVAS_HEIGHT}px CV</span>
                    </div>
                  </div>

                  {/* Clickable Colorbar Calibration Key */}
                  <div className="bg-slate-950/75 border border-slate-700/80 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 mb-1.5">
                      <span className="font-bold text-cyan-300 uppercase">
                        Color → Sound Key ({activeLayer.unit}) — Click any stop to hear it:
                      </span>
                      <span className="text-slate-400">{activeLayer.audioLegendSummary}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {activeLayer.paletteStops?.map((stop) => (
                        <button
                          key={stop.label}
                          onClick={() => handleStopClickColorStop(stop)}
                          onMouseEnter={() => announceControl(`Scale Stop: ${stop.label}. Click to hear reference chord.`, "calibrate")}
                          onMouseLeave={clearHoverControl}
                          onFocus={() => announceControl(`Scale Stop: ${stop.label}`, "calibrate")}
                          className="y2k-metal-btn px-2 py-1 rounded-lg flex items-center gap-2 text-left cursor-pointer hover:border-cyan-400/60"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded border border-white/30 shrink-0"
                            style={{ backgroundColor: stop.hex }}
                          />
                          <span className="text-[9px] font-mono text-slate-200 truncate">{stop.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Real-Time Computer-Vision -> Chandra/NASA-IMPACT Formula Readout */}
                <div className="lg:col-span-4 space-y-2.5">
                  <div
                    onMouseEnter={() => announceControl("Computer Vision telemetry: live RGB energy split, brightness, and MIDI chords", "layer")}
                    onMouseLeave={clearHoverControl}
                    className="y2k-lcd rounded-xl p-3 space-y-2.5 border border-cyan-500/35"
                  >
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
                      <span className="text-[10px] font-mono font-extrabold text-cyan-300 uppercase flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        CV → Sound Formula
                      </span>
                      {cvReadout?.hex && (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-slate-300">
                          <span
                            className="w-3 h-3 rounded border border-white/40 inline-block"
                            style={{ backgroundColor: cvReadout.hex }}
                          />
                          {cvReadout.hue}° Hue
                        </span>
                      )}
                    </div>

                    {cvReadout ? (
                      <>
                        <div className="text-[10px] font-mono font-bold text-white truncate">
                          {cvReadout.sourceLabel}
                        </div>

                        {/* RGB Color Channels -> Chandra Register */}
                        <div className="space-y-1 bg-slate-950/65 p-2 rounded-lg border border-slate-800">
                          <div className="flex justify-between text-[9px] font-mono text-slate-300">
                            <span>RGB Energy Split</span>
                            <span className="text-white font-bold">
                              R {cvReadout.redPct}% • G {cvReadout.greenPct}% • B {cvReadout.bluePct}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden flex bg-slate-900">
                            <div style={{ width: `${cvReadout.redPct}%` }} className="bg-rose-500" />
                            <div style={{ width: `${cvReadout.greenPct}%` }} className="bg-emerald-400" />
                            <div style={{ width: `${cvReadout.bluePct}%` }} className="bg-sky-400" />
                          </div>
                        </div>

                        {/* Brightness -> MIDI Velocity (35..127) */}
                        <div className="flex items-center justify-between text-[10px] font-mono bg-slate-950/65 px-2.5 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-300">Brightness → Velocity:</span>
                          <span className="text-amber-300 font-bold">
                            {cvReadout.brightnessPct}% → {cvReadout.chord?.midiVelocity ?? 35}/127
                          </span>
                        </div>

                        {/* Pixel Density -> Chandra Binary Drum */}
                        <div className="flex items-center justify-between text-[10px] font-mono bg-slate-950/65 px-2.5 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-300">Spike Density → Drum:</span>
                          <span
                            className={`font-bold ${
                              cvReadout.binaryPulse === 1 ? 'text-rose-300' : 'text-slate-400'
                            }`}
                          >
                            {cvReadout.densityPct}% → BEAT {cvReadout.binaryPulse}
                          </span>
                        </div>

                        {/* NASA-IMPACT C1..A6 Chord + Stereo Pan */}
                        <div className="bg-cyan-950/40 border border-cyan-400/35 p-2.5 rounded-lg space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-cyan-200">NASA-IMPACT Chord:</span>
                            <span className="text-sm font-extrabold text-white">
                              {cvReadout.chord?.chordName || 'C4maj'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-300">
                            <span>
                              Physical: <strong className="text-amber-300">{cvReadout.physicalValue} {cvReadout.unit}</strong>
                            </span>
                            <span>
                              Stereo Pan:{' '}
                              <strong>
                                {cvReadout.pan < -0.15 ? 'LEFT' : cvReadout.pan > 0.15 ? 'RIGHT' : 'CENTER'}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] font-mono text-slate-400">
                        Select a region or click the Earth map to extract live RGB/Brightness/Chord telemetry.
                      </div>
                    )}
                  </div>

                  {/* Scientific Sonification Methodology Card */}
                  <div className="bg-slate-950/75 border border-slate-700/80 rounded-xl p-2.5 text-[9px] font-mono text-slate-300 space-y-1">
                    <div className="text-cyan-300 font-bold uppercase">
                      How Earth Jukebox Translates Pixels:
                    </div>
                    <p>• NASA GIBS / Blue Marble frames read directly into 2D Canvas RGB arrays.</p>
                    <p>• NASA-IMPACT C1–A6 chords: higher concentration maps to deeper chords & louder MIDI velocity (35–127).</p>
                    <p>• Chandra Binary Drumming triggers rhythmic pulse 1 beats above anomaly threshold.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
