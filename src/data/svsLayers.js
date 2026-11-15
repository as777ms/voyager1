/**
 * NASA Earth Information Center (EIC) / SVS & GIBS Layer Catalog
 * Maps real NASA SVS visualizations (#5313, #3912, #5669, #5533, #5425, #5196, #5011, #4960, #4950, #5147, #5148, #5149, #5151, #5152, #5153, #5154)
 * with CORS-safe NASA GIBS WMS overlays (EPSG:4326) and calibrated Earth topography fallback.
 */

export const CONTINENT_SILHOUETTES = [
  // North America
  [
    [-168, 66], [-140, 70], [-95, 72], [-78, 62], [-60, 52],
    [-67, 45], [-76, 35], [-81, 25], [-90, 29], [-97, 26],
    [-90, 21], [-84, 10], [-78, 8], [-92, 14], [-105, 20],
    [-115, 32], [-124, 42], [-130, 54], [-152, 60], [-166, 60],
  ],
  // Greenland
  [
    [-55, 60], [-44, 60], [-20, 72], [-18, 81], [-50, 82], [-70, 77], [-56, 68],
  ],
  // South America
  [
    [-78, 9], [-70, 12], [-60, 8], [-50, 1], [-35, -6],
    [-39, -18], [-48, -28], [-58, -38], [-66, -46], [-69, -55],
    [-74, -50], [-72, -35], [-70, -18], [-81, -5], [-79, 2],
  ],
  // Europe
  [
    [-9, 37], [-9, 43], [-2, 43], [-5, 48], [2, 51], [8, 55],
    [10, 58], [5, 61], [16, 69], [28, 71], [45, 68], [58, 65],
    [48, 45], [38, 45], [29, 41], [23, 37], [16, 38], [12, 42], [4, 43], [0, 39], [-5, 36],
  ],
  // Africa
  [
    [-17, 15], [-16, 28], [-6, 36], [10, 37], [25, 32], [33, 31],
    [40, 18], [51, 12], [41, 0], [40, -12], [35, -26], [20, -35],
    [15, -26], [12, -12], [9, 4], [2, 6], [-8, 5], [-15, 11],
  ],
  // Asia (including Tajikistan/Pamir, India, Indochina, Siberia)
  [
    [27, 41], [38, 45], [48, 43], [54, 40], [58, 37], [65, 38], [74, 38],
    [60, 55], [58, 68], [75, 72], [105, 76], [140, 71], [176, 66],
    [160, 55], [142, 52], [135, 44], [129, 35], [122, 38], [121, 30],
    [114, 22], [108, 16], [103, 2], [99, 10], [92, 21], [85, 19],
    [77, 8], [72, 20], [67, 25], [58, 25], [50, 30], [36, 31], [35, 37],
  ],
  // Japan Archipelago
  [
    [130, 32], [135, 34], [140, 36], [142, 41], [145, 44], [140, 44], [137, 37], [131, 34],
  ],
  // Maritime Continent / Indonesia
  [
    [95, 5], [106, -6], [118, -8], [116, -2], [108, 1], [102, 1],
  ],
  // Australia
  [
    [114, -22], [122, -17], [131, -12], [137, -15], [142, -11], [146, -18],
    [153, -28], [150, -37], [138, -35], [128, -32], [115, -34], [113, -26],
  ],
];

export const COUNTRY_REGIONS = [
  { id: 'ALL', label: 'Global Earth', bounds: { minLon: -180, maxLon: 180, minLat: -85, maxLat: 85 } },
  { id: 'Tajikistan', label: 'Tajikistan (Pamir)', bounds: { minLon: 66, maxLon: 76, minLat: 36, maxLat: 42 } },
  { id: 'USA', label: 'United States', bounds: { minLon: -126, maxLon: -66, minLat: 24, maxLat: 50 } },
  { id: 'Brazil', label: 'Brazil / Amazon', bounds: { minLon: -75, maxLon: -35, minLat: -34, maxLat: 6 } },
  { id: 'Japan', label: 'Japan / Pacific', bounds: { minLon: 128, maxLon: 147, minLat: 30, maxLat: 46 } },
  { id: 'Europe', label: 'Europe', bounds: { minLon: -10, maxLon: 38, minLat: 35, maxLat: 62 } },
  { id: 'Africa', label: 'Africa', bounds: { minLon: -18, maxLon: 52, minLat: -35, maxLat: 37 } },
  { id: 'India', label: 'India / Himalaya', bounds: { minLon: 68, maxLon: 97, minLat: 7, maxLat: 36 } },
  { id: 'Atlantic', label: 'Atlantic Hurricane Alley', bounds: { minLon: -85, maxLon: -15, minLat: 8, maxLat: 42 } },
  { id: 'Arctic', label: 'Arctic Cryosphere', bounds: { minLon: -180, maxLon: 180, minLat: 62, maxLat: 85 } },
];

export const SVS_LAYERS = [
  {
    id: 'svs-5313',
    svsId: '5313',
    svsUrl: 'https://svs.gsfc.nasa.gov/5313/',
    stationLinkId: 'nightLights',
    title: 'Night Lights (2012–2023 EIC)',
    shortName: 'Night Lights',
    source: 'NASA SVS #5313 / Suomi NPP VIIRS Black Marble',
    realTimeRange: '2012–2023 (Verified SVS Archive)',
    compareYears: [2012, 2023],
    unit: 'nW/cm²/sr',
    minVal: 0,
    maxVal: 140,
    timbreProfile: 'nightBells',
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.56,
    gibsLayer: 'VIIRS_Black_Marble_Nighttime_Lights_2016',
    gibsDefaultDate: '2016-01-01',
    description:
      'EIC Change in Night Lights (2012–2023): тёмный фон = океаны и леса, золотой/фиолетовый = рост городов и энергосетей.',
    audioLegendSummary:
      'Тёмно-синий фон звучит тихо; яркие огни мегаполисов запускают звёздное пианино и ритмическую плотность.',
    paletteStops: [
      { t: 0.0, rgb: [8, 14, 34], hex: '#080e22', label: 'Dark Sky (0)' },
      { t: 0.35, rgb: [128, 78, 28], hex: '#804e1c', label: 'Towns (40)' },
      { t: 0.72, rgb: [242, 168, 52], hex: '#f2a834', label: 'Metro (95)' },
      { t: 1.0, rgb: [255, 245, 190], hex: '#fff5be', label: 'Megacity (140)' },
    ],
    hotspots: [
      { lat: 40.7, lon: -74, radius: 14, strength: 0.96, name: 'US Eastern Seaboard' },
      { lat: 50.5, lon: 8, radius: 17, strength: 0.93, name: 'Western Europe' },
      { lat: 30.0, lon: 31.2, radius: 9, strength: 0.92, name: 'Nile Delta' },
      { lat: 38.5, lon: 68.8, radius: 9, strength: 0.78, name: 'Dushanbe, Tajikistan' },
      { lat: 28.6, lon: 77.2, radius: 18, strength: 0.95, name: 'Northern India' },
      { lat: 35.6, lon: 139.7, radius: 13, strength: 0.98, name: 'Tokyo Bay, Japan' },
    ],
  },
  {
    id: 'svs-5153',
    svsId: '5153',
    svsUrl: 'https://svs.gsfc.nasa.gov/5153/',
    stationLinkId: 'fireLocations',
    title: 'Carbon Monoxide (CO) & Air Quality',
    shortName: 'CO Plumes',
    source: 'NASA SVS #5153 / GMAO GEOS-FP & Terra MOPITT',
    realTimeRange: 'GEOS-FP Synoptic + MOPITT (2000–Present)',
    compareYears: [2012, 2024],
    unit: 'ppbv',
    minVal: 40,
    maxVal: 450,
    timbreProfile: 'co2Heavy',
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.65,
    gibsLayer: 'MOPITT_CO_Monthly_Total_Column_Day',
    gibsDefaultDate: '2024-06-01',
    description:
      'Угарный газ от лесных пожаров Амазонии, Африки и промышленных шлейфов Азии (SVS #5153 / Air Quality #5533).',
    audioLegendSummary:
      'Красные очаги CO дают глубокий плотный бас (C1–E2) и высокую громкость (velocity 100–127).',
    paletteStops: [
      { t: 0.0, rgb: [255, 245, 195], hex: '#fff5c3', label: 'Baseline (40)' },
      { t: 0.35, rgb: [253, 187, 74], hex: '#fdbb4a', label: 'Moderate (150)' },
      { t: 0.7, rgb: [230, 75, 32], hex: '#e64b20', label: 'Plume (290)' },
      { t: 1.0, rgb: [135, 12, 18], hex: '#870c12', label: 'Extreme (450)' },
    ],
    hotspots: [
      { lat: -8, lon: -58, radius: 24, strength: 0.95, name: 'Amazon Biomass Burning' },
      { lat: -4, lon: 22, radius: 28, strength: 0.96, name: 'Central Africa Fires' },
      { lat: 34, lon: 114, radius: 24, strength: 0.89, name: 'East Asia Basin' },
      { lat: 38.5, lon: 68.8, radius: 11, strength: 0.56, name: 'Tajikistan Valley' },
      { lat: 37, lon: -119, radius: 15, strength: 0.8, name: 'California Wildfire' },
    ],
  },
  {
    id: 'svs-3912',
    svsId: '3912',
    svsUrl: 'https://svs.gsfc.nasa.gov/3912/',
    stationLinkId: 'oceanCurrents',
    title: 'Sea Surface Currents & Perpetual Ocean',
    shortName: 'Ocean Currents',
    source: 'NASA SVS #3912 / #5425 Perpetual Ocean 2 (ECCO2)',
    realTimeRange: 'ECCO2 2005–2023 + Sea Surface Thermal',
    compareYears: [2012, 2023],
    unit: '°C / m·s⁻¹',
    minVal: -2,
    maxVal: 32,
    timbreProfile: 'thermalPad',
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.7,
    gibsLayer: 'GHRSST_L4_MUR_Sea_Surface_Temperature',
    gibsDefaultDate: '2024-06-01',
    description:
      'Западные пограничные течения (Гольфстрим, Куросио) и температура поверхности океана (SVS #3912 и #5425).',
    audioLegendSummary:
      'Полярная вода звучит высокими ледяными тонами, тёплые экваториальные течения открывают мягкий глубокий фильтр.',
    paletteStops: [
      { t: 0.0, rgb: [18, 66, 178], hex: '#1242b2', label: 'Polar (-2°C)' },
      { t: 0.35, rgb: [44, 178, 220], hex: '#2cb2dc', label: 'Cool (10°C)' },
      { t: 0.68, rgb: [246, 200, 76], hex: '#f6c84c', label: 'Warm (22°C)' },
      { t: 1.0, rgb: [188, 34, 24], hex: '#bc2218', label: 'Tropical Core (32°C)' },
    ],
    hotspots: [
      { lat: 35, lon: -70, radius: 18, strength: 0.88, name: 'Gulf Stream Thermal Core' },
      { lat: 28, lon: 132, radius: 17, strength: 0.86, name: 'Kuroshio Boundary Current' },
      { lat: 0, lon: 120, radius: 28, strength: 0.94, name: 'Indo-Pacific Warm Pool' },
      { lat: -58, lon: -65, radius: 22, strength: 0.14, name: 'Drake Passage Cold Belt' },
    ],
  },
  {
    id: 'svs-5669',
    svsId: '5669',
    svsUrl: 'https://svs.gsfc.nasa.gov/5669/',
    stationLinkId: 'aerosols',
    title: 'GEOS Aerosols & PM2.5 (Dust & Smoke)',
    shortName: 'GEOS Aerosols',
    source: 'NASA SVS #5669 / #5151 GMAO GEOS & OMPS',
    realTimeRange: 'GEOS Aerosol Reanalysis (2010–2025)',
    compareYears: [2012, 2024],
    unit: 'µg/m³',
    minVal: 2,
    maxVal: 180,
    timbreProfile: 'aerosolWind',
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.6,
    gibsLayer: 'OMPS_Aerosol_Index',
    gibsDefaultDate: '2024-06-01',
    description:
      'Пылевые шлейфы Сахары и Кызылкума/Таджикистана, дым пожаров и морской аэрозоль (SVS #5669 / #5151).',
    audioLegendSummary:
      'Многослойный аэрозольный синт: концентрация пыли меняет частоту полосового ветрового фильтра и шум.',
    paletteStops: [
      { t: 0.0, rgb: [248, 242, 214], hex: '#f8f2d6', label: 'Clear (2)' },
      { t: 0.35, rgb: [242, 180, 96], hex: '#f2b460', label: 'Haze (50)' },
      { t: 0.7, rgb: [212, 102, 34], hex: '#d46622', label: 'Dust/Smoke (115)' },
      { t: 1.0, rgb: [120, 38, 10], hex: '#78260a', label: 'Severe (180)' },
    ],
    hotspots: [
      { lat: 20, lon: 5, radius: 28, strength: 0.96, name: 'Sahara Dust Transport' },
      { lat: 39, lon: 64, radius: 17, strength: 0.85, name: 'Central Asia / Tajikistan Dust' },
      { lat: 27, lon: 78, radius: 19, strength: 0.91, name: 'Indo-Gangetic Haze' },
      { lat: 56, lon: -115, radius: 16, strength: 0.78, name: 'Boreal Wildfire Smoke' },
    ],
  },
  {
    id: 'svs-5196',
    svsId: '5196',
    svsUrl: 'https://svs.gsfc.nasa.gov/5196/',
    stationLinkId: 'co2',
    title: 'DYAMOND Global Carbon Dioxide (CO₂)',
    shortName: 'DYAMOND CO₂',
    source: 'NASA SVS #5196 / GEOS DYAMOND Simulation',
    realTimeRange: 'DYAMOND High-Res CO₂ Simulation (2020–2024)',
    compareYears: [2012, 2024],
    unit: 'ppm',
    minVal: 392,
    maxVal: 432,
    timbreProfile: 'co2Heavy',
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.64,
    gibsLayer: 'AIRS_CO2_Monthly_Free_Troposphere_Day',
    gibsDefaultDate: '2024-06-01',
    description:
      'Динамика глобального CO₂: накопление в северном полушарии и сезонное «дыхание» лесов Земли (SVS #5196).',
    audioLegendSummary:
      'Высокая концентрация CO₂ сгущает гармоники в низком регистре (C1–F3) — «дыхание планеты».',
    paletteStops: [
      { t: 0.0, rgb: [72, 138, 212], hex: '#488ad4', label: '392 ppm' },
      { t: 0.4, rgb: [244, 212, 128], hex: '#f4d480', label: '408 ppm' },
      { t: 0.75, rgb: [224, 96, 48], hex: '#e06030', label: '422 ppm' },
      { t: 1.0, rgb: [148, 22, 34], hex: '#941622', label: '432 ppm' },
    ],
    hotspots: [
      { lat: 36, lon: 116, radius: 26, strength: 0.95, name: 'East Asia Industrial Dome' },
      { lat: 48, lon: 12, radius: 22, strength: 0.87, name: 'European Corridor' },
      { lat: 41, lon: -84, radius: 22, strength: 0.88, name: 'North America' },
      { lat: 38.5, lon: 68.8, radius: 13, strength: 0.66, name: 'Central Asia Transit' },
    ],
  },
  {
    id: 'svs-5011',
    svsId: '5011',
    svsUrl: 'https://svs.gsfc.nasa.gov/5011/',
    stationLinkId: 'lightning',
    title: 'Lightning Events Detected from ISS (2017–2023)',
    shortName: 'ISS Lightning',
    source: 'NASA SVS #5011 / ISS-LIS Optical Sensor',
    realTimeRange: '2017–2023 (ISS-LIS Verified Period)',
    compareYears: [2017, 2023],
    unit: 'flashes/km²/yr',
    minVal: 0,
    maxVal: 160,
    timbreProfile: 'binaryRain',
    binaryDrummingPrimary: true,
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.48,
    gibsLayer: null,
    gibsDefaultDate: '2023-06-01',
    description:
      'Оптические вспышки молний с борта МКС (2017–2023). Точечная перкуссионная сонификация: вспышка = удар (Chandra Binary Beats).',
    audioLegendSummary:
      'Спокойные зоны = 0 (тишина); грозовые кластеры Маракайбо, Конго и Гималаев выбивают бинарный удар = 1.',
    paletteStops: [
      { t: 0.0, rgb: [10, 14, 38], hex: '#0a0e26', label: '0 Flashes' },
      { t: 0.35, rgb: [86, 44, 158], hex: '#562c9e', label: 'Moderate (45)' },
      { t: 0.72, rgb: [192, 82, 232], hex: '#c052e8', label: 'Supercell (110)' },
      { t: 1.0, rgb: [255, 240, 155], hex: '#fff09b', label: 'Catatumbo Peak (160)' },
    ],
    hotspots: [
      { lat: 9.8, lon: -71.5, radius: 13, strength: 0.99, name: 'Lake Maracaibo Hotspot' },
      { lat: -1, lon: 22, radius: 22, strength: 0.96, name: 'Congo Basin Supercell' },
      { lat: 26, lon: 88, radius: 15, strength: 0.88, name: 'Himalayan Foothills' },
      { lat: 38.5, lon: 70.5, radius: 9, strength: 0.54, name: 'Pamir Mountain Storms' },
    ],
  },
  {
    id: 'svs-4960',
    svsId: '4960',
    svsUrl: 'https://svs.gsfc.nasa.gov/4960/',
    stationLinkId: 'weatherPatterns',
    title: 'Atmospheric River & Precipitation (IMERG)',
    shortName: 'Atmos. River',
    source: 'NASA SVS #4960 / #5149 GPM IMERG',
    realTimeRange: 'GPM IMERG (2014–Present)',
    compareYears: [2015, 2024],
    unit: 'mm/hr',
    minVal: 0,
    maxVal: 35,
    timbreProfile: 'binaryRain',
    binaryDrummingPrimary: true,
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.45,
    gibsLayer: 'IMERG_Precipitation_Rate',
    gibsDefaultDate: '2024-06-01',
    description:
      'Потоки атмосферной влаги и осадков (SVS #4960 / #5149): капельная мелодия + Chandra Binary Drumming на ливнях.',
    audioLegendSummary:
      'Лёгкий дождь звучит высокими каплями, ливневые фронты включают бинарный перкуссионный ритм.',
    paletteStops: [
      { t: 0.0, rgb: [16, 32, 62], hex: '#10203e', label: 'Dry (0 mm/hr)' },
      { t: 0.35, rgb: [38, 162, 74], hex: '#26a24a', label: 'Rain (10)' },
      { t: 0.7, rgb: [164, 232, 62], hex: '#a4e83e', label: 'Heavy (24)' },
      { t: 1.0, rgb: [248, 224, 92], hex: '#f8e05c', label: 'River Plume (35)' },
    ],
    hotspots: [
      { lat: 35, lon: -135, radius: 18, strength: 0.9, name: 'Pacific Atmospheric River' },
      { lat: 14, lon: 94, radius: 20, strength: 0.94, name: 'Bay of Bengal Monsoon' },
      { lat: -3, lon: -62, radius: 22, strength: 0.91, name: 'Amazon Rainband' },
      { lat: 39.0, lon: 71.5, radius: 10, strength: 0.58, name: 'Pamir Orographic Rain' },
    ],
  },
  {
    id: 'svs-4950',
    svsId: '4950',
    svsUrl: 'https://svs.gsfc.nasa.gov/4950/',
    stationLinkId: 'forest',
    title: 'GEDI Forest Canopy Height & NOx',
    shortName: 'Forest Canopy',
    source: 'NASA SVS #4950 GEDI Lidar / MODIS NDVI',
    realTimeRange: 'ISS GEDI (2019–2023) & MODIS (2000–Present)',
    compareYears: [2019, 2023],
    unit: 'meters (m)',
    minVal: 0,
    maxVal: 65,
    timbreProfile: 'noxMarimba',
    defaultHigherIsLowerPitch: false, // Higher forest canopy = richer higher organic marimba
    binaryThreshold: 0.62,
    gibsLayer: 'MODIS_Terra_NDVI_8Day',
    gibsDefaultDate: '2024-06-01',
    description:
      'Высота лесного полога по лидару GEDI на МКС (SVS #4950): чем выше деревья (Амазония, Конго, Калифорния), тем богаче маримба.',
    audioLegendSummary:
      'Пустыни = мягкий фон; тропические и секвойные леса до 65 м рождают органичную деревянную маримбу.',
    paletteStops: [
      { t: 0.0, rgb: [188, 174, 134], hex: '#bcae86', label: 'Arid (0m)' },
      { t: 0.35, rgb: [132, 202, 92], hex: '#84ca5c', label: 'Savanna (18m)' },
      { t: 0.7, rgb: [34, 148, 56], hex: '#229438', label: 'Rainforest (42m)' },
      { t: 1.0, rgb: [8, 76, 28], hex: '#084c1c', label: 'Giant Canopy (65m)' },
    ],
    hotspots: [
      { lat: -4, lon: -63, radius: 22, strength: 0.96, name: 'Amazon Canopy' },
      { lat: 0.5, lon: 20, radius: 18, strength: 0.92, name: 'Congo Basin Forest' },
      { lat: 41.2, lon: -124, radius: 10, strength: 0.95, name: 'California Redwoods' },
      { lat: 1.5, lon: 114, radius: 15, strength: 0.9, name: 'Borneo Dipterocarp' },
    ],
  },
  {
    id: 'svs-5533',
    svsId: '5533',
    svsUrl: 'https://svs.gsfc.nasa.gov/5533/',
    stationLinkId: 'seaLevel',
    title: '30 Years of Sea Surface Height (El Niño & Sea Level)',
    shortName: 'Sea Level 30Yr',
    source: 'NASA SVS #5533 / TOPEX, Jason-3 & Sentinel-6',
    realTimeRange: '1993–2023 (30-Year Altimetry Record)',
    compareYears: [2010, 2023],
    unit: 'cm (SSH)',
    minVal: -15,
    maxVal: 25,
    timbreProfile: 'thermalPad',
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.68,
    gibsLayer: null,
    gibsDefaultDate: '2023-11-01',
    description:
      '30 лет измерений уровня Мирового океана (SVS #5533): волны Кельвина Эль-Ниньо в Тихом океане и глобальный подъём воды (+10.1 см).',
    audioLegendSummary:
      'Положительные аномалии уровня моря и тёплый язык Эль-Ниньо звучат глубоким океаническим хором (C2–G3).',
    paletteStops: [
      { t: 0.0, rgb: [22, 54, 156], hex: '#16369c', label: 'La Niña (-15cm)' },
      { t: 0.4, rgb: [64, 182, 224], hex: '#40b6e0', label: 'Mean SSH (0cm)' },
      { t: 0.72, rgb: [248, 192, 62], hex: '#f8c03e', label: 'Thermal Rise (+12cm)' },
      { t: 1.0, rgb: [198, 28, 36], hex: '#c61c24', label: 'El Niño Peak (+25cm)' },
    ],
    hotspots: [
      { lat: 0, lon: -115, radius: 26, strength: 0.98, name: 'Equatorial Pacific El Niño Tongue' },
      { lat: 34, lon: -72, radius: 16, strength: 0.86, name: 'US East Coast Sea Level Hotspot' },
      { lat: -6, lon: 106, radius: 18, strength: 0.89, name: 'Indonesian Throughflow' },
      { lat: 24, lon: 126, radius: 17, strength: 0.84, name: 'Western Pacific Warm Pool' },
    ],
  },
  {
    id: 'svs-5147',
    svsId: '5147',
    svsUrl: 'https://svs.gsfc.nasa.gov/5147/',
    stationLinkId: 'surfaceTemp',
    title: 'GEOS-FP Global Surface Air Temperature',
    shortName: 'GEOS Temp',
    source: 'NASA SVS #5147 / GMAO GEOS-FP Assimilation',
    realTimeRange: 'GEOS-FP Real-Time Atmospheric Analysis',
    compareYears: [2012, 2026],
    unit: '°C',
    minVal: -25,
    maxVal: 48,
    timbreProfile: 'thermalPad',
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.72,
    gibsLayer: 'AIRS_L3_Surface_Air_Temperature_Daily_Day',
    gibsDefaultDate: '2024-06-01',
    description:
      'Приземная температура воздуха GEOS-FP (SVS #5147 из галереи NASA): экстремальные волны жары в Азии, Сахаре и Америке.',
    audioLegendSummary:
      'Ледяные полюса звучат высокими кристаллами (A5–A6); раскалённые пустыни и тепловые купола уходят в густой бас (C1–G2).',
    paletteStops: [
      { t: 0.0, rgb: [38, 88, 198], hex: '#2658c6', label: 'Freeze (-25°C)' },
      { t: 0.35, rgb: [244, 196, 78], hex: '#f4c44e', label: 'Temperate (15°C)' },
      { t: 0.7, rgb: [216, 68, 24], hex: '#d84418', label: 'Heatwave (35°C)' },
      { t: 1.0, rgb: [92, 12, 14], hex: '#5c0c0e', label: 'Extreme (48°C)' },
    ],
    hotspots: [
      { lat: 24, lon: 46, radius: 24, strength: 0.98, name: 'Arabian & Sahara Thermal Dome' },
      { lat: 28, lon: 74, radius: 20, strength: 0.95, name: 'Thar & South Asia Heatwave' },
      { lat: 37.8, lon: 68.8, radius: 12, strength: 0.84, name: 'Khatlon & Amu Darya Basin (TJ)' },
      { lat: 36, lon: -116, radius: 16, strength: 0.91, name: 'Mojave / Southwestern US' },
    ],
  },
  {
    id: 'svs-5148',
    svsId: '5148',
    svsUrl: 'https://svs.gsfc.nasa.gov/5148/',
    stationLinkId: 'naturalDisasters',
    title: 'GEOS-FP Near-Surface Wind & Hurricane Plots (#5072)',
    shortName: 'Wind / Cyclones',
    source: 'NASA SVS #5148 & #5072 / GMAO GEOS-FP & NHC',
    realTimeRange: 'Hurricane Season Wind Speed + GEOS Synoptic',
    compareYears: [2012, 2025],
    unit: 'km/h',
    minVal: 0,
    maxVal: 260,
    timbreProfile: 'aerosolWind',
    binaryDrummingPrimary: true,
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.58,
    gibsLayer: null,
    gibsDefaultDate: '2024-09-01',
    description:
      'Приземная скорость ветра GEOS-FP (#5148) и графики ветра атлантических ураганов (#5072): циклоны, тайфуны и струйные течения.',
    audioLegendSummary:
      'Штиль звучит мягко; вихри ураганов Категории 5 включают свистящий ветровой фильтр и ударный пульс.',
    paletteStops: [
      { t: 0.0, rgb: [12, 20, 68], hex: '#0c1444', label: 'Calm (0 km/h)' },
      { t: 0.35, rgb: [32, 92, 232], hex: '#205ce8', label: 'Gale (75 km/h)' },
      { t: 0.72, rgb: [72, 234, 152], hex: '#48ea98', label: 'Storm (165 km/h)' },
      { t: 1.0, rgb: [252, 238, 84], hex: '#fcee54', label: 'Cat-5 Eyewall (260)' },
    ],
    hotspots: [
      { lat: 22, lon: -68, radius: 19, strength: 0.98, name: 'Atlantic Hurricane Alley (#5072)' },
      { lat: 18, lon: 132, radius: 21, strength: 0.97, name: 'Western Pacific Super Typhoon' },
      { lat: -52, lon: 40, radius: 28, strength: 0.89, name: 'Southern Ocean Roaring Fifties' },
      { lat: 38.8, lon: 72.2, radius: 10, strength: 0.72, name: 'Pamir High-Altitude Jet' },
    ],
  },
  {
    id: 'svs-5154',
    svsId: '5154',
    svsUrl: 'https://svs.gsfc.nasa.gov/5154/',
    stationLinkId: 'ozoneLayer',
    title: 'Nitrogen Oxides (NOx) & Surface Ozone (#5152)',
    shortName: 'NOx & Ozone O₃',
    source: 'NASA SVS #5154 & #5152 / GMAO GEOS Composition',
    realTimeRange: 'GEOS-CF Atmospheric Chemistry (2018–Present)',
    compareYears: [2018, 2025],
    unit: 'ppbv',
    minVal: 5,
    maxVal: 120,
    timbreProfile: 'noxMarimba',
    defaultHigherIsLowerPitch: true,
    binaryThreshold: 0.62,
    gibsLayer: null,
    gibsDefaultDate: '2024-06-01',
    description:
      'Оксиды азота NOx (#5154, зелёная палитра) и приземный озон O₃ (#5152, фиолетовая палитра) над индустриальными коридорами и морскими путями.',
    audioLegendSummary:
      'Чистая атмосфера звучит прозрачно; фотохимические шлейфы NOx/O₃ создают плотный стеклянно-металлический резонанс.',
    paletteStops: [
      { t: 0.0, rgb: [232, 244, 234], hex: '#e8f4ea', label: 'Clean (5 ppbv)' },
      { t: 0.35, rgb: [112, 218, 124], hex: '#70da7c', label: 'Shipping/Roads (38)' },
      { t: 0.7, rgb: [24, 152, 54], hex: '#189836', label: 'Urban NOx (78)' },
      { t: 1.0, rgb: [98, 42, 184], hex: '#622ab8', label: 'O₃ Smog Peak (120)' },
    ],
    hotspots: [
      { lat: 35, lon: 118, radius: 22, strength: 0.96, name: 'East China Megacity Corridor' },
      { lat: 51, lon: 6, radius: 18, strength: 0.89, name: 'Rhine-Ruhr & English Channel' },
      { lat: 25, lon: 54, radius: 16, strength: 0.91, name: 'Persian Gulf Petrochemical Node' },
      { lat: 38.6, lon: 68.8, radius: 10, strength: 0.68, name: 'Dushanbe-Tursunzoda Corridor' },
    ],
  },
];

export function getSvsLayerById(id) {
  return SVS_LAYERS.find((l) => l.id === id || l.svsId === id) || SVS_LAYERS[0];
}

const STATION_TO_SVS_MAP = {
  voyagerRecord: 'svs-5313',
  voyagerSounds: 'svs-4960',
  voyagerMusic: 'svs-5011',
  voyagerImages: 'svs-3912',
  nightLights: 'svs-5313',
  urbanSoundscapes: 'svs-5313',
  fireLocations: 'svs-5153',
  aerosols: 'svs-5669',
  co2: 'svs-5196',
  seaLevel: 'svs-5533',
  surfaceTemp: 'svs-5147',
  forest: 'svs-4950',
  lightning: 'svs-5011',
  glacierVelocity: 'svs-3912',
  oceanCurrents: 'svs-3912',
  seaNoise: 'svs-5533',
  naturalDisasters: 'svs-5148',
  weatherPatterns: 'svs-4960',
  riverFlows: 'svs-4960',
  relaxingSounds: 'svs-4950',
  heavySounds: 'svs-5148',
  ozoneLayer: 'svs-5154',
};

export function getSvsLayerForStation(stationId) {
  const svsId = STATION_TO_SVS_MAP[stationId] || 'svs-5313';
  return getSvsLayerById(svsId);
}

/**
 * Builds a CORS-free URL (using Vite proxy '/nasa-gibs' during dev) for NASA GIBS WMS GetMap PNG/JPEG.
 */
export function buildGibsWmsUrl(layerName, dateStr = null, format = 'image/png') {
  if (!layerName) return null;
  const origin =
    typeof import.meta !== 'undefined' && import.meta.env?.DEV
      ? '/nasa-gibs'
      : 'https://gibs.earthdata.nasa.gov';
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    VERSION: '1.3.0',
    LAYERS: layerName,
    CRS: 'EPSG:4326',
    BBOX: '-90,-180,90,180',
    WIDTH: '720',
    HEIGHT: '360',
    FORMAT: format,
  });
  if (dateStr) params.set('TIME', dateStr);
  return `${origin}/wms/epsg4326/best/wms.cgi?${params.toString()}`;
}

/**
 * Extracts explicit Computer Vision RGB + HSV/HSL + Brightness breakdown from any RGB pixel.
 * Directly aligns with Chandra RGB-to-Register + NASA-IMPACT mapping rules.
 */
export function extractPixelVisualFeatures(r, g, b, layer) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  const brightness = 0.299 * rn + 0.587 * gn + 0.114 * bn;
  const saturation = max === 0 ? 0 : delta / max;

  let hue = 0;
  if (delta > 1e-5) {
    if (max === rn) hue = (((gn - bn) / delta) % 6) * 60;
    else if (max === gn) hue = ((bn - rn) / delta + 2) * 60;
    else hue = ((rn - gn) / delta + 4) * 60;
    if (hue < 0) hue += 360;
  }

  const paletteIntensity = matchPixelToNormalizedValue(r, g, b, layer);

  return {
    brightness,
    saturation,
    hue: Math.round(hue),
    redPct: Math.round(rn * 100),
    greenPct: Math.round(gn * 100),
    bluePct: Math.round(bn * 100),
    normalized: paletteIntensity,
  };
}

/**
 * Matches a canvas pixel RGB tuple against a layer's ordered paletteStops
 * using segment projection in RGB space to reconstruct normalized physical intensity [0..1].
 */
export function matchPixelToNormalizedValue(r, g, b, layer) {
  const stops = layer?.paletteStops;
  if (!stops || stops.length < 2) {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  let bestT = 0;
  let minDistSq = Infinity;

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const c = stops[i + 1];
    const vx = c.rgb[0] - a.rgb[0];
    const vy = c.rgb[1] - a.rgb[1];
    const vz = c.rgb[2] - a.rgb[2];
    const lenSq = vx * vx + vy * vy + vz * vz;

    let segProj = 0;
    if (lenSq > 1e-6) {
      segProj = ((r - a.rgb[0]) * vx + (g - a.rgb[1]) * vy + (b - a.rgb[2]) * vz) / lenSq;
      segProj = Math.max(0, Math.min(1, segProj));
    }

    const px = a.rgb[0] + vx * segProj;
    const py = a.rgb[1] + vy * segProj;
    const pz = a.rgb[2] + vz * segProj;
    const distSq = (r - px) ** 2 + (g - py) ** 2 + (b - pz) ** 2;

    if (distSq < minDistSq) {
      minDistSq = distSq;
      bestT = a.t + (c.t - a.t) * segProj;
    }
  }

  return Math.max(0, Math.min(1, bestT));
}

export function samplePaletteColor(t, layer) {
  const stops = layer?.paletteStops;
  if (!stops || stops.length === 0) return [56, 189, 248];
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped <= stops[0].t) return stops[0].rgb;
  if (clamped >= stops[stops.length - 1].t) return stops[stops.length - 1].rgb;

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (clamped >= a.t && clamped <= b.t) {
      const f = (clamped - a.t) / Math.max(1e-6, b.t - a.t);
      return [
        Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * f),
        Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * f),
        Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * f),
      ];
    }
  }
  return stops[0].rgb;
}
