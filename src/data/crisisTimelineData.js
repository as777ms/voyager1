/**
 * Curated Planetary Crisis News Dispatches & Scientific Briefings (2010–2026)
 * Sources:
 * - Global Footprint Network (Earth Overshoot Day): https://overshoot.footprintnetwork.org/
 * - UN Environment Programme (UNEP Nature Crisis): https://www.unep.org/en/facts-about-nature-crisis
 * - Our World in Data (Mass Extinctions): https://ourworldindata.org/mass-extinctions
 * - Timeline of Earth (Deep-Time & Anthropocene): https://en.wikipedia.org/wiki/Timeline_of_Earth
 * - NASA Climate Change & Earth Observatory: https://science.nasa.gov/climate-change/
 */

export const CRISIS_TIMELINE_DISPATCHES = [
  {
    id: 'dispatch-2010',
    minYear: 2010,
    maxYear: 2012,
    badge: 'EARTH OVERSHOOT',
    severity: 'CALM',
    headline: '2010–2012: Humanity Crosses 1.5 Earths of Annual Biocapacity',
    summary:
      'By 2010, global ecological demand exceeded what Earth’s ecosystems could regenerate in a full year by more than 50%. Earth Overshoot Day fell in August, marking persistent carbon and land-use debt.',
    metric: '1.5+ Earths Demand • Aug Overshoot',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=80',
    sourceName: 'Global Footprint Network',
    sourceUrl: 'https://overshoot.footprintnetwork.org/',
  },
  {
    id: 'dispatch-2013',
    minYear: 2013,
    maxYear: 2015,
    badge: 'TIMELINE OF EARTH',
    severity: 'CALM',
    headline: '2013–2015: Atmospheric CO2 Passes 400 ppm & Paris Accord',
    summary:
      'Mauna Loa instruments recorded sustained 400 ppm carbon dioxide—a level unseen in human history on Earth’s geological timeline—prompting the 2015 Paris Climate Agreement to limit warming.',
    metric: '400+ ppm CO2 • Holocene Shift',
    image:
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=700&q=80',
    sourceName: 'Timeline of Earth',
    sourceUrl: 'https://en.wikipedia.org/wiki/Timeline_of_Earth',
  },
  {
    id: 'dispatch-2016',
    minYear: 2016,
    maxYear: 2018,
    badge: 'NASA CLIMATE RECORD',
    severity: 'WARMING',
    headline: '2016–2018: Hottest Years on Record & Polar Ice Retreat',
    summary:
      'Strong El Niño amplification combined with greenhouse warming shattered global surface temperature records, accelerating Arctic sea-ice decline and mass coral bleaching across tropical reefs.',
    metric: '+1.0°C Above Pre-Industrial',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=80',
    sourceName: 'NASA Climate Change',
    sourceUrl: 'https://science.nasa.gov/climate-change/',
  },
  {
    id: 'dispatch-2019',
    minYear: 2019,
    maxYear: 2021,
    badge: 'UNEP NATURE CRISIS',
    severity: 'WARMING',
    headline: '2019–2021: 1 Million Species Threatened & Megafire Surge',
    summary:
      'UN assessments warned that ~1 million animal and plant species face extinction within decades as 75% of terrestrial land and 66% of marine environments have been severely altered by human activity.',
    metric: '1M Species at Risk • 75% Land Altered',
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=700&q=80',
    sourceName: 'UNEP Nature Crisis',
    sourceUrl: 'https://www.unep.org/en/facts-about-nature-crisis',
  },
  {
    id: 'dispatch-2022',
    minYear: 2022,
    maxYear: 2023,
    badge: 'MASS EXTINCTION DATA',
    severity: 'ANOMALY',
    headline: '2022–2023: Biodiversity Loss & Record Ocean Heat Anomalies',
    summary:
      'Extinction rates are tens to hundreds of times higher than the 10-million-year background average. In 2023, global ocean surface temperatures spiked off historic charts, fueling extreme storms and fires.',
    metric: '100x+ Background Extinction Rate',
    image:
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=700&q=80',
    sourceName: 'Our World in Data',
    sourceUrl: 'https://ourworldindata.org/mass-extinctions',
  },
  {
    id: 'dispatch-2024',
    minYear: 2024,
    maxYear: 2026,
    badge: 'TRIPLE PLANETARY CRISIS',
    severity: 'ANOMALY',
    headline: '2024–2026: 1.5°C Threshold Breached & ~1.7 Earths Overshoot',
    summary:
      'Global temperatures temporarily exceeded +1.5°C above pre-industrial levels while Earth Overshoot Day arrived in late July/early August—meaning humanity consumes ~1.7 planets’ worth of ecological resources each year.',
    metric: '1.7 Earths/Yr • +1.5°C Anomaly',
    image:
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=700&q=80',
    sourceName: 'Earth Overshoot & UNEP',
    sourceUrl: 'https://overshoot.footprintnetwork.org/',
  },
];

export function getDispatchForYear(year) {
  return (
    CRISIS_TIMELINE_DISPATCHES.find((d) => year >= d.minYear && year <= d.maxYear) ||
    CRISIS_TIMELINE_DISPATCHES[CRISIS_TIMELINE_DISPATCHES.length - 1]
  );
}

export const EARTH_SIGNAL_NEWS_CARDS = [
  {
    id: 'news-overshoot',
    code: 'OVERSHOOT',
    title: 'Earth Overshoot Day: Ecological Deficit',
    subtitle: 'Humanity consumes ~1.7 Earths of biocapacity every year',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80',
    newsText:
      'Since the early 1970s, humanity has been in ecological overshoot—extracting timber, fisheries, crops, and emitting CO2 faster than forests and oceans can absorb or regenerate. Moving the date back by 6 days each year would restore balance before 2050.',
    sourceName: 'Global Footprint Network',
    sourceUrl: 'https://overshoot.footprintnetwork.org/',
  },
  {
    id: 'news-unep-nature',
    code: 'UNEP.BIO',
    title: 'UN Nature Crisis: 1 Million Species Threatened',
    subtitle: '75% of land & 66% of oceans significantly altered',
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80',
    newsText:
      'UNEP reports that up to 1 million species are threatened with extinction, 85% of wetlands have been lost since 1700, and 3.2 billion people are already affected by land degradation—driven by land conversion, overexploitation, climate change, and pollution.',
    sourceName: 'UNEP Factsheet',
    sourceUrl: 'https://www.unep.org/en/facts-about-nature-crisis',
  },
  {
    id: 'news-extinctions',
    code: 'EXTINCT.6',
    title: 'Are We Entering a Sixth Mass Extinction?',
    subtitle: 'Vertebrate & amphibian populations declining rapidly',
    image:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=500&q=80',
    newsText:
      'Earth experienced five major mass extinctions over the last 500 million years (losing 75%+ of species). Our World in Data shows current extinction rates are far above natural background rates, with amphibians and freshwater species hit hardest.',
    sourceName: 'Our World in Data',
    sourceUrl: 'https://ourworldindata.org/mass-extinctions',
  },
  {
    id: 'news-earth-timeline',
    code: 'GEO.TIME',
    title: 'Timeline of Earth: 4.54 Billion Years to Now',
    subtitle: 'From Great Oxidation to the Anthropocene spike',
    image:
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=500&q=80',
    newsText:
      'Across 4.54 billion years, Earth’s biosphere survived snowball glaciations and asteroid impacts. What distinguishes the modern era is speed: industrial carbon emissions and habitat fragmentation are reshaping planetary systems within a single human lifetime.',
    sourceName: 'Timeline of Earth',
    sourceUrl: 'https://en.wikipedia.org/wiki/Timeline_of_Earth',
  },
  {
    id: 'news-cryosphere',
    code: 'ICE.MELT',
    title: 'Glacier Retreat & Sea-Level Acceleration',
    subtitle: 'Polar ice sheets losing hundreds of gigatons per year',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=500&q=80',
    newsText:
      'NASA GRACE and ICESat-2 satellite gravity and laser measurements confirm accelerating mass loss across Greenland, Antarctica, and mountain glaciers from the Andes to the Pamirs—threatening freshwater security for over a billion people.',
    sourceName: 'NASA Science',
    sourceUrl: 'https://science.nasa.gov/climate-change/',
  },
];

export const CLASSIFIED_CRISIS_DOSSIERS = [
  {
    id: 'dossier-overshoot',
    code: 'FOOTPRINT',
    title: 'Earth Overshoot',
    tag: '1.7x Planet Demand',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    explanation:
      'Tracks the exact calendar date when humanity’s annual resource consumption exceeds Earth’s yearly capacity to regenerate ecosystems and absorb CO2.',
    sourceUrl: 'https://overshoot.footprintnetwork.org/',
    sourceLabel: 'overshoot.footprintnetwork.org',
  },
  {
    id: 'dossier-unep',
    code: 'UNEP.2026',
    title: 'Nature Crisis',
    tag: '1M Species at Risk',
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    explanation:
      'UN Environment Programme synthesis of the Triple Planetary Crisis: climate disruption, biodiversity collapse, and chemical/plastic pollution.',
    sourceUrl: 'https://www.unep.org/en/facts-about-nature-crisis',
    sourceLabel: 'unep.org/facts-about-nature-crisis',
  },
  {
    id: 'dossier-extinction',
    code: 'BIO.LOSS',
    title: 'Mass Extinctions',
    tag: 'Big 5 vs Today',
    image:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=400&q=80',
    explanation:
      'Compares fossil-record extinction pulses (Ordovician through Cretaceous–Paleogene) with modern IUCN Red List extinction rates across vertebrates and plants.',
    sourceUrl: 'https://ourworldindata.org/mass-extinctions',
    sourceLabel: 'ourworldindata.org/mass-extinctions',
  },
  {
    id: 'dossier-geotime',
    code: '4.54 GA',
    title: 'Earth Timeline',
    tag: 'Deep-Time Log',
    image:
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=400&q=80',
    explanation:
      'Chronicles Earth’s geological and biological milestones—from oceans and photosynthesis to the Holocene stability that enabled human civilization.',
    sourceUrl: 'https://en.wikipedia.org/wiki/Timeline_of_Earth',
    sourceLabel: 'wikipedia.org/wiki/Timeline_of_Earth',
  },
];
