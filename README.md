# THE RECEIVER — NASA Earth Jukebox

<div align="center">

[![NASA Space Apps Challenge 2026](https://img.shields.io/badge/NASA_Space_Apps-Earth_Jukebox-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)](https://www.spaceappschallenge.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Native_DSP-purple?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)



<p align="center">
  <strong>«Hear Earth. Decode the Signal.»</strong><br>
  <em>An interstellar auditory gateway translating 16 years of NASA Earth observations (2010–2026) and the 1977 Voyager Golden Record into living, real-time sound.</em>
</p>

</div>

---

## 🌌 Overview

**THE RECEIVER** is an interactive 3D WebGL experience and real-time multi-channel sonification suite developed for the **NASA Space Apps Challenge** (**Earth Jukebox** challenge).

The project inverts humanity's classic space narrative:  
In 1977, NASA launched Voyager 1 and 2 carrying the **Golden Record**—humankind's outbound greeting card to the stars.  
**THE RECEIVER asks:** *What if an extraterrestrial intelligence intercepted the Golden Record and tuned their listening array toward Earth today?*

Instead of an idyllic, static world, the celestial listener detects the planet's evolving environmental telemetry over the past 16 years (**2010–2026**). Visual satellite datasets from the **NASA Earth Information Center (EIC)** and **NASA Scientific Visualization Studio (SVS)** are transformed through computer vision into dynamic musical chords, stereo panning, and rhythmic percussion—creating an emotional and scientifically accurate auditory portal to our changing home.

```
                       [ INTERSTELLAR DEEP SPACE ]
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
        1977 VOYAGER GOLDEN RECORD       2010–2026 EARTH OBSERVATIONS
      (Humankind's Outbound Signal)       (Planet's Inbound Telemetry)
      • 55 World Language Greetings       • 12 Official NASA SVS Datasets
      • 27 Archival Music Traditions      • Live NASA GIBS Satellite Rasters
      • 116 Encoded Analog Images         • 16-Year Crisis Anomaly Delta
                   │                               │
                   └───────────────┬───────────────┘
                                   ▼
                    THE RECEIVER DSP AUDIO ENGINE
       • Computer Vision Matrix → NASA-IMPACT MIDI Chords (C1–A6)
       • Anomaly Density Detection → Chandra X-Ray Binary Drumming
       • Universal Dual-Engine Audio Reader (Web Audio Earcons + Voice)
```

---

## ✨ Key Features

### 🛰️ Real-Time NASA EIC World Map Sonifier (`WORLD MAP [W]`)
* **Computer Vision on 2D Canvas**: Real-time pixel analysis across an equirectangular ($720 \times 360$ px, EPSG:4326) global projection.
* **NASA-IMPACT Chord Mapping**: Direct translation of raw pixel luminance and optical density into 6 octaves of harmonic chords ($C_1$ to $A_6$) and dynamic MIDI velocities ($35$ to $127$).
* **Chandra Binary Drumming**: Threshold-activated percussive sub-impulses triggered by high-energy anomalies (wildfires, optical lightning bursts, category 5 cyclone eyes).
* **Binaural Spatial Panning**: True longitude-to-stereo localization (Western Hemisphere maps left, Eastern Hemisphere maps right).
* **Planetary Meridian Sweep (`SCAN PLANET`)**: An orbital scanline traverses from west to east, converting the entire globe into a continuous planetary vinyl record.

### 📈 16-Year Crisis Timeline Comparison (2010 vs 2026)
* **A/B Acoustic Delta**: Compare baseline planetary conditions (2010) against modern crisis anomalies (2026) across 13 global geographic tipping points.
* **Instant Delta Telemetry**: Quantifies shifts in chord register (e.g., $D_2\text{m} \to A_4\text{m}$), optical brightness percentage, and physical units with real-time audio playback.
* **13 Geographic Focus Zones**: Tajikistan (Pamir Glaciers), Brazil (Amazon Basin), Arctic Cryosphere, Antarctica, Atlantic Hurricane Alley, United States, Europe, India, East Asia, and more.

### 🪐 Interactive 3D Orbit (WebGL / Three.js)
* **High-Fidelity 3D Earth**: Realistic axial tilt, atmospheric shader halo, and 3D floating hotspots that sonify geographic locations on click.
* **Celestial Observer (The Alien)**: Interactive 3D listener entity tracking satellite orbits.
* **Voyager Disc Turntable**: 3D interactive Golden Record with rotational physics and tracking tonearm.
* **4 Cinematic Camera Presets**: `CAM 01: SCENE`, `CAM 02: ALIEN`, `CAM 03: DISC`, `CAM 04: HORIZON` with responsive framing across phones, tablets, and wide monitors.

### 💿 Complete 1977 Voyager Golden Record Archive
* **55 World Language Greetings**: All 55 verified official NASA greetings with original transcriptions, English translations, BCP-47 language codes, and historic 1977 audio streams.
* **27 World Music Traditions**: Complete catalog from Bach and Chuck Berry to Navajo night chants, with local Web Audio synth playback, original Archive.org WAV streams, and integrated YouTube players.
* **116 Encoded Analog Images**: Historic Apollo and Voyager calibration scans, diagrams, and photography with scanline sound sonification.

### ♿ Universal Accessibility (A11y First)
* **Global Hover Audio Reader (`HOVER [H]`)**: Master 1-click toggle for visually impaired researchers. Hovering or focusing (`Tab`) on any button, camera preset, station, or map coordinate speaks its function and plays a tuned Web Audio earcon.
* **Dual-Engine Architecture**: Operates via Web Speech API with automatic fallback to pure W3C Web Audio earcons (`playEarcon`) on systems without native TTS packages (e.g., minimal Linux distributions).
* **Live Visual Telemetry Banner**: Floating HUD subtitles `[AUDIO READER ACTIVE: ...]` duplicating spoken audio in real time.
* **Multi-Modal Adaptations**: Keyboard-first navigation, pitch polarity inversion (`Invert Pitch`), high-contrast rendering, and reduced motion toggles.

---

## 🎮 Interface Map & Controls

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [CAM 01] [CAM 02] [CAM 03] [CAM 04]             EARTH STATION: NIGHT LIGHTS │
│                                                                             │
│ ┌──────────────────────┐                                                    │
│ │ RECEIVER_CORE_SYS    │                     3D CELESTIAL SCENE             │
│ │ ● SIGNAL LOCKED      │           (Interactive Earth, Alien & Turntable)   │
│ │ THE RECEIVER         │                                                    │
│ │ An auditory gateway. │                  [Hotspot: Pamir Glacier]          │
│ └──────────────────────┘                                                    │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ LCD: Station Telemetry Readout [WORLD MAP] │ [◄◄] [PLAY/PAUSE] [►►] │VOL│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│      [HOVER (H)]  [DSP: ONLINE]  [TELEMETRY (E)]  [INVERT]  [KEY (D)]  [A11Y]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

* **`HOVER [H]`**: Master toggle for the global audio reader.
* **`WORLD MAP [W]`**: Opens the NASA EIC World Map Sonifier canvas.
* **`TELEMETRY [E]`**: Toggles the raw telemetry drawer and interactive melody bar chart.
* **`KEY [D]`**: Opens the Voyager Decoding Matrix explaining physical wave mappings.
* **`A11Y`**: Opens universal accessibility settings and keyboard shortcut guides.
* **`AUDIO: ON (TEST)` / `TAP: UNLOCK AUDIO`**: Unlocks browser audio context and plays a test tone.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :---: | :--- |
| <kbd>Space</kbd> | Toggle sonification scan (**Play / Pause**) |
| <kbd>→</kbd> / <kbd>←</kbd> | Advance to **Next / Previous** data observation point |
| <kbd>H</kbd> | Toggle **Global Hover Audio Reader** (Voice + Earcons) |
| <kbd>W</kbd> | Toggle **NASA EIC World Map Sonifier** modal |
| <kbd>E</kbd> / <kbd>T</kbd> | Toggle **Data Explorer** drawer and melody chart |
| <kbd>D</kbd> | Toggle **Voyager Decoding Matrix** modal |
| <kbd>M</kbd> | **Mute / Unmute** master audio output |
| <kbd>C</kbd> | Cycle through **3D Camera Presets** (Scene $\to$ Alien $\to$ Disc $\to$ Horizon) |
| <kbd>1</kbd> – <kbd>7</kbd> | Instant shortcut to active Earth stations |
| <kbd>Esc</kbd> | Close all open modals and return to 3D orbit |

---

## 🔬 Scientific Datasets & Data Sources

All sonifications are mapped to authenticated scientific repositories from the **NASA Earth Information Center (EIC)** and **NASA Scientific Visualization Studio (SVS)**:

| Dataset ID | Scientific Mission & Instrument | Physical Metric | Scale Range |
| :--- | :--- | :--- | :--- |
| **NASA SVS #5313** | Suomi NPP VIIRS Day/Night Band | Nighttime Lights & Urban Grids | 0 – 140 nW/cm²/sr |
| **NASA SVS #5153** | Terra MOPITT & GEOS-FP Plumes | Carbon Monoxide Wildfires (CO) | 0 – 480 ppbv |
| **NASA SVS #3912** | ECCO2 & MUR GHRSST Altimetry | Sea Surface Currents & Temperatures | -2°C – +34°C |
| **NASA SVS #5669** | Suomi NPP OMPS Aerosol Suite | Aerosols & Particulate Matter (PM2.5) | 0 – 5.5 UVAI |
| **NASA SVS #5196** | Aqua AIRS Free Troposphere Model | DYAMOND Carbon Dioxide (CO₂) | 385 – 430 ppm |
| **NASA SVS #5011** | ISS-LIS Spaceborne Optical Sensor | Global Lightning Flash Density | 0 – 65 flashes/km²/yr |
| **NASA SVS #4960** | GPM IMERG Microwave Constellation| Precipitation & Atmospheric Rivers | 0 – 45 mm/hr |
| **NASA SVS #4950** | ISS GEDI Spaceborne Lidar | Forest Canopy Height & Biomass | 0 – 62 m |
| **NASA SVS #5533** | Sentinel-6, Jason-1/2/3, TOPEX | 30 Years of Sea Level Anomalies | -180 – +220 mm |
| **NASA SVS #5147** | GEOS-FP Atmosphere Reanalysis | Global Surface Air Temperature | -45°C – +48°C |
| **NASA SVS #5148** | GEOS-FP Near-Surface Wind Vector | Tropical Cyclones & Wind Speed | 0 – 68 m/s (Cat 5) |
| **NASA SVS #5154** | Aura OMI UV/Visible Spectrometer | Nitrogen Dioxide (NO₂) & Ozone (O₃) | 0 – 24 × 10¹⁵ mol/cm² |

* **NASA GIBS WMS**: EPSG:4326 Equirectangular raster imagery (`BlueMarble_NextGeneration`, `VIIRS_Black_Marble_Nighttime_Lights_2016`, `MOPITT_CO_Monthly_Total_Column_Day`, `GHRSST_L4_MUR_Sea_Surface_Temperature`, etc.).
* **NASA Voyager Archives**: Historic audio streams and telemetry sourced from [NASA Voyager Official Repository](https://science.nasa.gov/mission/voyager/) and [Archive.org](https://archive.org/details/Voyager1).

---

## 🎵 Sonification Physics & Mathematics

The audio synthesis pipeline is implemented in [`src/audio/PixelSonifier.js`](src/audio/PixelSonifier.js) and [`src/audio/AudioEngine.js`](src/audio/AudioEngine.js) using the native **W3C Web Audio API**:

### 1. Optical Luminance Calculation
$$L = 0.299 \cdot R + 0.587 \cdot G + 0.114 \cdot B$$

### 2. Velocity Mapping (NASA-IMPACT Standard)
Normalized intensity maps directly to standard MIDI velocity dynamics ($35$ to $127$):
$$\text{Velocity} = 35 + \text{NormalizedIntensity} \times (127 - 35)$$

### 3. Harmonic Pitch Scale (MIDI $C_1$ to $A_6$)
Frequencies are calculated from MIDI notes $m \in [24 \dots 93]$ across 6 octaves:
$$f(m) = 440 \times 2^{\frac{m - 69}{12}} \text{ Hz}$$

### 4. Chandra X-Ray Binary Drumming
Whenever pixel anomaly spike density surpasses the layer's calibrated threshold ($\text{Density} \ge 0.56$), a percussive sub-impulse fires, introducing a rhythmic heartbeat for extreme phenomena.

### 5. Longitude Panning
$$\text{Pan} = \frac{\text{Longitude}}{180} \in [-1.0 \dots +1.0]$$

---

## 🛠️ Technology Stack

| Layer | Tools & Libraries | Purpose |
| :--- | :--- | :--- |
| **UI Framework** | React 19 (`^19.3.1`) | High-performance reactive state & component tree |
| **Tooling & Build** | Vite (`^8.3.6`) | Sub-second HMR and production bundling |
| **3D Graphics** | Three.js + React Three Fiber / Drei | WebGL globe, orbital satellites, and vinyl turntable |
| **Audio Core** | Native W3C Web Audio API + Tone.js | Modular polyphonic DSP synthesis, earcons, spatial panning |
| **State Store** | Zustand (`^5.1.0`) | Lightweight, centralized telemetry store |
| **Styling & Motion** | Tailwind CSS v4 + Framer Motion | Cybernetic HUD aesthetic, responsive layouts, fluid modals |
| **Icons** | Lucide React | Clean, scalable aerospace iconography |
| **Code Quality** | ESLint (`^10.14.0`) | Zero errors, zero warnings static verification |

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/the-receiver.git
cd the-receiver

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:5173` to explore.

### Production Build & Linting

```bash
# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📱 Responsive Device Support

THE RECEIVER features an adaptive layout calibrated for:
* **Mobile Phones** ($320\text{px} \dots 640\text{px}$): Stacked audio deck, touch canvas controls, compact mobile camera bar (`CAM 01–04`), and touch-dismissible drawers.
* **Tablets & Phablets** ($640\text{px} \dots 1024\text{px}$): Dual-pane responsive view with visible 3D hotspots.
* **Laptops & Desktops** ($1280\times720 \dots 1920\times1080$): Full HUD frame with integrated spectrogram, side dashboard, and camera controls.
* **Ultra-Wide & 4K Displays** ($> 1920\text{px}$): High-density telemetry displays with uncompressed layouts.


---

<div align="center">
  <sub>Built with passion for the NASA Space Apps Challenge 2026 • Earth Jukebox Challenge</sub><br>
  <sub><strong>«In every transmission from Earth, the music continues.»</strong></sub>
</div>
