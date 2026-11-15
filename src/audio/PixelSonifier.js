/**
 * PixelSonifier.js
 * Implements NASA-IMPACT "From Data to Melody" MIDI chord methodology (C1..A6, velocity 35..127)
 * combined with Chandra RGB-to-Register & Binary Drumming computer-vision analysis on <canvas>.
 */
import {
  CONTINENT_SILHOUETTES,
  extractPixelVisualFeatures,
  matchPixelToNormalizedValue,
  samplePaletteColor,
} from '../data/svsLayers';

const OCTAVE_CHORD_TEMPLATES = [
  { offset: 0, label: 'C', suffix: 'maj', intervals: [0, 4, 7] },
  { offset: 2, label: 'D', suffix: 'min', intervals: [0, 3, 7] },
  { offset: 3, label: 'Eb', suffix: 'maj', intervals: [0, 4, 7] },
  { offset: 5, label: 'F', suffix: 'maj', intervals: [0, 4, 7] },
  { offset: 7, label: 'G', suffix: 'min', intervals: [0, 3, 7] },
  { offset: 9, label: 'A', suffix: 'min', intervals: [0, 3, 7] },
  { offset: 10, label: 'Bb', suffix: 'maj', intervals: [0, 4, 7] },
];

export const NASA_MIDI_CHORD_TABLE = (() => {
  const table = [];
  for (let octave = 1; octave <= 6; octave++) {
    const cMidi = 12 * (octave + 1); // C1 = 24, C4 = 60
    for (const tpl of OCTAVE_CHORD_TEMPLATES) {
      const rootMidi = cMidi + tpl.offset;
      if (rootMidi < 24 || rootMidi > 93) continue; // Strictly C1 (24) through A6 (93)
      const midiNotes = tpl.intervals.map((i) => Math.min(105, rootMidi + i));
      table.push({
        chordName: `${tpl.label}${octave}${tpl.suffix === 'min' ? 'm' : ''}`,
        baseNote: `${tpl.label}${octave}`,
        rootMidi,
        midiNotes,
      });
    }
  }
  return table;
})();

/**
 * Maps normalized pixel intensity [0..1] to NASA-IMPACT MIDI chord (C1..A6)
 * and MIDI velocity [35..127].
 */
export function mapValueToMidiChord(normalizedValue, options = {}) {
  const { higherDataLowerPitch = true, invertPitch = false } = options;
  const clamped = Math.max(0, Math.min(1, Number.isFinite(normalizedValue) ? normalizedValue : 0));

  const useLowForHigh = invertPitch ? !higherDataLowerPitch : higherDataLowerPitch;
  const pitchNorm = useLowForHigh ? 1 - clamped : clamped;

  const maxIdx = NASA_MIDI_CHORD_TABLE.length - 1;
  const chordIdx = Math.round(pitchNorm * maxIdx);
  const entry = NASA_MIDI_CHORD_TABLE[Math.max(0, Math.min(maxIdx, chordIdx))];

  // Velocity strictly 35..127 per NASA-IMPACT methodology
  const midiVelocity = Math.round(35 + clamped * (127 - 35));
  const amplitude = Number((midiVelocity / 127).toFixed(3));
  const frequencies = entry.midiNotes.map((m) =>
    Number((440 * Math.pow(2, (m - 69) / 12)).toFixed(2))
  );

  return {
    chordName: entry.chordName,
    baseNote: entry.baseNote,
    rootMidi: entry.rootMidi,
    midiNotes: entry.midiNotes,
    frequencies,
    midiVelocity,
    amplitude,
    normalized: clamped,
  };
}

export function normalizedToPhysical(normalized, layer) {
  const min = typeof layer?.minVal === 'number' ? layer.minVal : 0;
  const max = typeof layer?.maxVal === 'number' ? layer.maxVal : 100;
  const val = min + Math.max(0, Math.min(1, normalized)) * (max - min);
  const decimals = Math.abs(max - min) <= 35 ? 1 : 0;
  return Number(val.toFixed(decimals));
}

/**
 * Renders real NASA Earth satellite imagery (BlueMarble + active NASA GIBS layer if loaded)
 * over crisp geographic landmasses and calibrated SVS hotspots so countries & anomalies are always clear.
 */
export function renderSvsCanvasLayer(
  canvas,
  layer,
  { year = 2024, baseMapImage = null, dataOverlayImage = null } = {}
) {
  if (!canvas || !layer) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const clampedYear = Math.max(2010, Math.min(2026, Number(year) || 2024));
  // Normalized year scale: 0.0 at 2010 baseline, 1.0 at 2026 crisis anomaly
  const yearProgress = (clampedYear - 2010) / (2026 - 2010);
  // Anomaly scale: baseline 2010 (0.58) -> 2018 (1.05) -> 2026 crisis anomaly (1.52)
  const anomalyScale = 0.58 + yearProgress * 0.94;

  // 1. Base Real World Map (NASA BlueMarble_NextGeneration if loaded, else crisp Earth relief)
  ctx.clearRect(0, 0, w, h);
  if (baseMapImage && baseMapImage.complete && baseMapImage.naturalWidth > 0) {
    ctx.drawImage(baseMapImage, 0, 0, w, h);
    // Darken slightly so EIC data overlays pop like NASA Hyperwall
    ctx.fillStyle = 'rgba(4, 10, 24, 0.34)';
    ctx.fillRect(0, 0, w, h);
  } else {
    // Rich dark ocean gradient + shaded continents + graticule
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#091a36');
    bgGrad.addColorStop(0.5, '#040d1e');
    bgGrad.addColorStop(1, '#081832');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle lat/lon grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 0.7;
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = ((90 - lat) / 180) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let lon = -120; lon <= 120; lon += 60) {
      const x = ((lon + 180) / 360) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    drawContinentFills(ctx, w, h, 'rgba(30, 64, 98, 0.78)', 'rgba(125, 211, 252, 0.55)', 1.0);
  }

  // 2. If live NASA GIBS scientific raster is available, composite it with year-aware radiometric modulation
  if (dataOverlayImage && dataOverlayImage.complete && dataOverlayImage.naturalWidth > 0) {
    ctx.save();
    // Radiometric contrast & saturation modulation across epochs
    const rasterAlpha = Math.max(0.60, Math.min(0.92, 0.65 + yearProgress * 0.25));
    ctx.globalAlpha = rasterAlpha;

    if (clampedYear >= 2022) {
      ctx.filter = 'saturate(1.35) contrast(1.20) brightness(1.15)';
    } else if (clampedYear <= 2014) {
      ctx.filter = 'saturate(0.75) contrast(0.88) brightness(0.84)';
    } else {
      ctx.filter = 'none';
    }

    ctx.drawImage(dataOverlayImage, 0, 0, w, h);
    ctx.filter = 'none';
    ctx.restore();
  }

  // 3. Composite calibrated NASA SVS plume overlays & anomaly hotspots transparently
  const hotspots = layer.hotspots || [];
  ctx.save();
  for (const hs of hotspots) {
    const cx = ((hs.lon + 180) / 360) * w;
    const cy = ((90 - hs.lat) / 180) * h;
    // Radius expands as anomalies and urbanization spread across epochs (2010 -> 2026)
    const radPx = Math.max(12, (hs.radius / 180) * h * (1.05 + yearProgress * 0.85));
    // Plume intensity scales with year anomaly
    const adjStrength = Math.max(0.08, Math.min(1.0, hs.strength * anomalyScale));

    const [rPeak, gPeak, bPeak] = samplePaletteColor(adjStrength, layer);
    const [rMid, gMid, bMid] = samplePaletteColor(adjStrength * 0.52, layer);

    const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, radPx);
    grad.addColorStop(0, `rgba(${rPeak}, ${gPeak}, ${bPeak}, 0.90)`);
    grad.addColorStop(0.5, `rgba(${rMid}, ${gMid}, ${bMid}, 0.55)`);
    grad.addColorStop(1, `rgba(${rMid}, ${gMid}, ${bMid}, 0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radPx, 0, Math.PI * 2);
    ctx.fill();
  }

  // Atmospheric warming/anomaly tint across the planetary disk for recent crisis years
  if (clampedYear >= 2022) {
    const crisisAlpha = 0.05 + (clampedYear - 2022) * 0.025; // 0.05 to 0.15
    ctx.fillStyle = `rgba(239, 68, 68, ${crisisAlpha.toFixed(3)})`;
    ctx.fillRect(0, 0, w, h);
  } else if (clampedYear <= 2013) {
    ctx.fillStyle = 'rgba(14, 165, 233, 0.05)';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();

  // Crisp continent outlines over top for unmistakable readability
  drawContinentFills(ctx, w, h, 'transparent', 'rgba(186, 230, 253, 0.48)', 1.0);
}

function drawContinentFills(ctx, w, h, fillColor, strokeColor, lineWidth) {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = fillColor;
  for (const poly of CONTINENT_SILHOUETTES) {
    if (!poly.length) continue;
    ctx.beginPath();
    poly.forEach(([lon, lat], idx) => {
      const x = ((lon + 180) / 360) * w;
      const y = ((90 - lat) / 180) * h;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    if (fillColor !== 'transparent') ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Analyzes one vertical pixel column at X on the NASA canvas.
 */
export function analyzeCanvasColumn(ctx, x, width, height, layer, options = {}) {
  if (!ctx || width <= 0 || height <= 0 || !layer) return null;
  const safeX = Math.max(0, Math.min(width - 1, Math.round(x)));

  let columnData;
  try {
    columnData = ctx.getImageData(safeX, 0, 1, height).data;
  } catch {
    return null;
  }

  let peakVal = 0;
  let peakY = Math.floor(height / 2);
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let brightSum = 0;
  let normSum = 0;
  let supraThresholdPixels = 0;
  const threshold = typeof layer.binaryThreshold === 'number' ? layer.binaryThreshold : 0.6;

  const step = 2;
  let totalSamples = 0;
  for (let py = 0; py < height; py += step) {
    const idx = py * 4;
    const r = columnData[idx];
    const g = columnData[idx + 1];
    const b = columnData[idx + 2];

    const norm = matchPixelToNormalizedValue(r, g, b, layer);
    const bright = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    rSum += r;
    gSum += g;
    bSum += b;
    brightSum += bright;
    normSum += norm;
    totalSamples++;

    if (norm >= threshold) supraThresholdPixels++;
    if (norm > peakVal) {
      peakVal = norm;
      peakY = py;
    }
  }

  if (totalSamples === 0) return null;

  const meanNorm = normSum / totalSamples;
  const avgR = Math.round(rSum / totalSamples);
  const avgG = Math.round(gSum / totalSamples);
  const avgB = Math.round(bSum / totalSamples);
  const cv = extractPixelVisualFeatures(avgR, avgG, avgB, layer);

  const lon = Number((((safeX / width) * 360) - 180).toFixed(1));
  const peakLat = Number((90 - (peakY / height) * 180).toFixed(1));
  const pan = Math.max(-1, Math.min(1, (safeX / width) * 2 - 1));

  const binaryDensity = supraThresholdPixels / totalSamples;
  const binaryPulse = binaryDensity > 0.04 || peakVal >= threshold ? 1 : 0;

  const dominantChord = mapValueToMidiChord(peakVal * 0.65 + meanNorm * 0.35, {
    higherDataLowerPitch: layer.defaultHigherIsLowerPitch ?? true,
    invertPitch: options.invertPitch,
  });

  return {
    x: safeX,
    lon,
    peakLat,
    pan,
    avgRgb: [avgR, avgG, avgB],
    brightnessPct: Math.round((brightSum / totalSamples) * 100),
    densityPct: Math.round(binaryDensity * 100),
    redPct: cv.redPct,
    greenPct: cv.greenPct,
    bluePct: cv.bluePct,
    hue: cv.hue,
    meanNorm,
    peakNorm: peakVal,
    physicalMean: normalizedToPhysical(meanNorm, layer),
    physicalPeak: normalizedToPhysical(peakVal, layer),
    binaryPulse,
    dominantChord,
  };
}

/**
 * Analyzes an entire selected Country/Region bounding box on the canvas
 * into a 6-step spatial sweep for country sonification & A/B year comparison.
 */
export function analyzeRegionBoundingBox(ctx, bounds, width, height, layer, options = {}) {
  if (!ctx || !bounds || !layer) return null;
  const x0 = Math.max(0, Math.floor(((bounds.minLon + 180) / 360) * width));
  const x1 = Math.min(width - 1, Math.ceil(((bounds.maxLon + 180) / 360) * width));
  const y0 = Math.max(0, Math.floor(((90 - bounds.maxLat) / 180) * height));
  const y1 = Math.min(height - 1, Math.ceil(((90 - bounds.minLat) / 180) * height));

  const bw = Math.max(4, x1 - x0);
  const bh = Math.max(4, y1 - y0);

  let regionPixels;
  try {
    regionPixels = ctx.getImageData(x0, y0, bw, bh).data;
  } catch {
    return null;
  }

  const slices = [];
  const sliceCount = 6;
  const threshold = typeof layer.binaryThreshold === 'number' ? layer.binaryThreshold : 0.6;

  let totalNorm = 0;
  let peakNorm = 0;
  let totalBright = 0;
  let supraCount = 0;
  let totalCount = 0;
  let rTotal = 0;
  let gTotal = 0;
  let bTotal = 0;

  for (let s = 0; s < sliceCount; s++) {
    const sx0 = Math.floor((s / sliceCount) * bw);
    const sx1 = Math.max(sx0 + 1, Math.floor(((s + 1) / sliceCount) * bw));

    let sPeak = 0;
    let sSum = 0;
    let sCount = 0;
    let sSupra = 0;

    for (let y = 0; y < bh; y += 2) {
      for (let x = sx0; x < sx1; x += 2) {
        const idx = (y * bw + x) * 4;
        const r = regionPixels[idx];
        const g = regionPixels[idx + 1];
        const b = regionPixels[idx + 2];
        const norm = matchPixelToNormalizedValue(r, g, b, layer);
        const bright = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        sSum += norm;
        sCount++;
        if (norm > sPeak) sPeak = norm;
        if (norm >= threshold) sSupra++;

        rTotal += r;
        gTotal += g;
        bTotal += b;
        totalBright += bright;
        totalNorm += norm;
        totalCount++;
        if (norm > peakNorm) peakNorm = norm;
        if (norm >= threshold) supraCount++;
      }
    }

    const sliceNorm = sCount ? Math.min(1, sPeak * 0.6 + (sSum / sCount) * 0.4) : 0.2;
    const centerLon = bounds.minLon + ((s + 0.5) / sliceCount) * (bounds.maxLon - bounds.minLon);
    slices.push({
      sliceIndex: s,
      pan: Math.max(-1, Math.min(1, centerLon / 180)),
      normalized: sliceNorm,
      binaryPulse: sSupra > 0 ? 1 : 0,
      chord: mapValueToMidiChord(sliceNorm, {
        higherDataLowerPitch: layer.defaultHigherIsLowerPitch ?? true,
        invertPitch: options.invertPitch,
      }),
    });
  }

  if (totalCount === 0) return null;

  const avgNorm = totalNorm / totalCount;
  const avgR = Math.round(rTotal / totalCount);
  const avgG = Math.round(gTotal / totalCount);
  const avgB = Math.round(bTotal / totalCount);
  const cv = extractPixelVisualFeatures(avgR, avgG, avgB, layer);
  const overallChord = mapValueToMidiChord(peakNorm * 0.55 + avgNorm * 0.45, {
    higherDataLowerPitch: layer.defaultHigherIsLowerPitch ?? true,
    invertPitch: options.invertPitch,
  });

  return {
    slices,
    overallChord,
    avgRgb: [avgR, avgG, avgB],
    hex: `#${[avgR, avgG, avgB].map((c) => c.toString(16).padStart(2, '0')).join('')}`,
    redPct: cv.redPct,
    greenPct: cv.greenPct,
    bluePct: cv.bluePct,
    hue: cv.hue,
    brightnessPct: Math.round((totalBright / totalCount) * 100),
    densityPct: Math.round((supraCount / totalCount) * 100),
    physicalMean: normalizedToPhysical(avgNorm, layer),
    physicalPeak: normalizedToPhysical(peakNorm, layer),
    meanNorm: avgNorm,
    peakNorm,
    binaryPulse: supraCount / totalCount > 0.04 ? 1 : 0,
  };
}

/**
 * Probes an exact (x, y) pixel under the cursor on the NASA EIC/SVS canvas.
 */
export function analyzePixelAt(ctx, x, y, width, height, layer, options = {}) {
  if (!ctx || width <= 0 || height <= 0 || !layer) return null;
  const px = Math.max(0, Math.min(width - 1, Math.round(x)));
  const py = Math.max(0, Math.min(height - 1, Math.round(y)));

  let pixel;
  try {
    pixel = ctx.getImageData(px, py, 1, 1).data;
  } catch {
    return null;
  }

  const [r, g, b] = pixel;
  const cv = extractPixelVisualFeatures(r, g, b, layer);
  const norm = cv.normalized;
  const physicalValue = normalizedToPhysical(norm, layer);
  const lon = Number((((px / width) * 360) - 180).toFixed(1));
  const lat = Number((90 - (py / height) * 180).toFixed(1));
  const pan = Math.max(-1, Math.min(1, (px / width) * 2 - 1));
  const threshold = typeof layer.binaryThreshold === 'number' ? layer.binaryThreshold : 0.6;

  const chord = mapValueToMidiChord(norm, {
    higherDataLowerPitch: layer.defaultHigherIsLowerPitch ?? true,
    invertPitch: options.invertPitch,
  });

  return {
    x: px,
    y: py,
    lat,
    lon,
    pan,
    rgb: [r, g, b],
    hex: `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`,
    redPct: cv.redPct,
    greenPct: cv.greenPct,
    bluePct: cv.bluePct,
    hue: cv.hue,
    brightnessPct: Math.round(cv.brightness * 100),
    normalized: norm,
    physicalValue,
    unit: layer.unit,
    binaryPulse: norm >= threshold ? 1 : 0,
    chord,
  };
}
