import { useState } from 'react';
import { motion } from 'framer-motion';
import { Disc, List, X, Flame, AlertTriangle, Newspaper, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { NASA_STATIONS, TIMELINE_YEARS } from '../../data/nasaData';
import {
  EARTH_SIGNAL_NEWS_CARDS,
  CLASSIFIED_CRISIS_DOSSIERS,
  getDispatchForYear,
} from '../../data/crisisTimelineData';
import { useReceiverStore } from '../../store/useReceiverStore';
import { audioEngine } from '../../audio/AudioEngine';
import voyagerImg from '../../assets/record_voyager.jpeg';

export default function StationsList() {
  const currentStationId = useReceiverStore((s) => s.currentStationId);
  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const selectedYear = useReceiverStore((s) => s.selectedYear);
  const setSelectedYear = useReceiverStore((s) => s.setSelectedYear);
  const setVoyagerModalOpen = useReceiverStore((s) => s.setVoyagerModalOpen);
  const announceHover = useReceiverStore((s) => s.announceHover);
  const clearHover = useReceiverStore((s) => s.clearHover);

  const [isMobileOpen, setMobileOpen] = useState(false);
  const [expandedNewsId, setExpandedNewsId] = useState(EARTH_SIGNAL_NEWS_CARDS[0].id);
  const [selectedDossierId, setSelectedDossierId] = useState(CLASSIFIED_CRISIS_DOSSIERS[0].id);

  const handleYearChange = (yr) => {
    audioEngine.unlockSync();
    setSelectedYear(yr);
    audioEngine.playCrisisTimelineTone(yr);
  };

  const activeDispatch = getDispatchForYear(selectedYear);
  const activeDossier =
    CLASSIFIED_CRISIS_DOSSIERS.find((d) => d.id === selectedDossierId) ||
    CLASSIFIED_CRISIS_DOSSIERS[0];

  const currentStation = NASA_STATIONS.find((s) => s.id === currentStationId) || NASA_STATIONS[0];

  return (
    <>
      {/* Mobile / Tablet Backdrop (< 1024px) */}
      {isMobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-black/65 backdrop-blur-xs z-35 lg:hidden pointer-events-auto transition-opacity"
        />
      )}

      {/* Mobile / Tablet Drawer Toggle Button (< 1024px) */}
      <div className="lg:hidden pointer-events-auto fixed top-2.5 right-2.5 z-50">
        <button
          onClick={() => setMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
          aria-label="Toggle Earth Stations Dashboard"
          className="y2k-window flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white cursor-pointer shadow-lg"
        >
          {isMobileOpen ? (
            <>
              <X className="w-4 h-4 text-cyan-400" />
              <span>CLOSE</span>
            </>
          ) : (
            <>
              <List className="w-4 h-4 text-cyan-400" />
              <span>STATIONS ({NASA_STATIONS.length})</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* Pinned Full-Height Right Dashboard (Adaptive width for all screen sizes) */}
      <aside
        aria-label="Earth Stations Dashboard"
        className={`pointer-events-auto transition-all duration-300 ${
          isMobileOpen
            ? 'fixed inset-y-2 right-2 sm:inset-y-3 sm:right-3 w-[calc(100vw-1rem)] sm:w-[350px] z-40 flex flex-col rounded-xl shadow-2xl'
            : 'hidden lg:flex flex-col w-[280px] xl:w-[320px] 2xl:w-[360px] h-full shrink-0 rounded-xl'
        } y2k-window border border-cyan-500/25 overflow-hidden`}
      >
        {/* Top Window Titlebar */}
        <div className="y2k-titlebar px-3 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-600 border border-blue-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-700 border border-emerald-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />
            </div>
            <h2 className="text-[11px] font-extrabold font-mono tracking-wider text-white uppercase truncate drop-shadow">
              EARTH STATIONS.PLS
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setVoyagerModalOpen(true)}
              onMouseEnter={() => announceHover('Voyager Golden Record full 1977 archive modal', 'layer')}
              onMouseLeave={clearHover}
              onFocus={() => announceHover('Voyager Archive modal', 'layer')}
              className="y2k-gold-btn px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <Disc className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              <span>ARCHIVE</span>
            </button>
          </div>
        </div>

        {/* Scrollable 3-Section Dashboard Body */}
        <div className="p-2.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
          {/* Holographic Voyager Golden Record Banner inside Playlist (as in reference image) */}
          <button
            onClick={() => setVoyagerModalOpen(true)}
            onMouseEnter={() =>
              announceHover(
                'Voyager Golden Record 1977: 55 world greetings, sounds of Earth, 27 songs, and 116 images. Click to explore.',
                'layer'
              )
            }
            onMouseLeave={clearHover}
            onFocus={() => announceHover('Voyager Golden Record archive banner', 'layer')}
            aria-label="Explore the Voyager Golden Record"
  className="
    w-full y2k-lcd rounded-xl p-3
    flex items-center gap-3
    border border-cyan-400/50
    bg-cyan-950/20
    hover:border-amber-400
    hover:bg-cyan-900/30
    hover:shadow-[0_0_20px_rgba(251,191,36,0.18)]
    hover:-translate-y-0.5
    active:translate-y-0
    transition-all duration-300
    cursor-pointer group text-left
  "
>
  {/* Voyager record artwork */}
  <div className="
    relative w-14 h-14 rounded-full overflow-hidden shrink-0
    border-2 border-amber-400/80
    shadow-[0_0_14px_rgba(251,191,36,0.3)]
    bg-black
    group-hover:border-amber-300
    group-hover:shadow-[0_0_20px_rgba(251,191,36,0.55)]
    transition-all duration-300
  ">
    <img
      src={voyagerImg}
      alt="Voyager Golden Record"
      className={`w-full h-full object-cover rounded-full ${
        isPlaying ? 'animate-spin' : ''
      }`}
      style={{ animationDuration: '10s' }}
    />
  </div>

  {/* Text content */}
  <div className="text-left min-w-0 flex-1">
    <div className="
      text-[11px] sm:text-xs font-extrabold font-mono
      text-amber-300 uppercase tracking-wider truncate
      group-hover:text-amber-200 transition-colors
    ">
      VOYAGER GOLDEN RECORD
    </div>

    <div className="
      text-[9px] sm:text-[10px] font-mono
      text-cyan-300/80 mt-1 truncate
    ">
      1977 • MESSAGE TO THE UNIVERSE
    </div>

    {/* Visible CTA */}
    <div className="
      inline-flex items-center gap-1.5 mt-2
      px-2.5 py-1 rounded-md
      bg-amber-400/15 border border-amber-400/50
      text-amber-300 text-[9px] font-bold font-mono
      tracking-widest uppercase
      group-hover:bg-amber-400
      group-hover:text-black
      transition-all duration-300
    ">
      <span>EXPLORE RECORD</span>
      <span className="text-xs">↗</span>
    </div>
  </div>

  {/* Right-side indicator */}
  <div className="
    shrink-0 text-cyan-400/60
    group-hover:text-amber-300
    group-hover:translate-x-1
    transition-all duration-300
  ">
    <span className="text-xl">›</span>
  </div>
</button>

          {/* ── SECTION 1: EARTH SIGNALS (EARTH.SIG 2010–2026) + TIMELINE SLIDER ── */}
          <div>
            <div className="flex items-center justify-between px-1 mb-1.5 border-b border-cyan-500/25 pb-1">
              <span className="text-[10px] font-extrabold font-mono tracking-wider text-cyan-300 uppercase">
                SECTION 1: EARTH SIGNALS
              </span>
              <span className="text-[9px] font-mono text-cyan-400">(EARTH.SIG) 2010–2026</span>
            </div>

            {/* Interactive Crisis & Climate Timeline Bar (2010 -> 2026) */}
            <div className="y2k-lcd p-2 rounded-lg mb-2">
              <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                <span className="text-slate-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>CRISIS TIMELINE LOG:</span>
                </span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded ${
                    selectedYear >= 2022
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : selectedYear >= 2016
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {selectedYear} {selectedYear >= 2022 ? '• ANOMALY' : selectedYear >= 2016 ? '• WARMING' : '• CALM'}
                </span>
              </div>

              <input
                type="range"
                min="2010"
                max="2026"
                step="1"
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                onMouseEnter={() =>
                  announceHover(
                    `Crisis timeline slider: year ${selectedYear}. Shifts planetary anomaly severity and audio pitch.`,
                    'year'
                  )
                }
                onMouseLeave={clearHover}
                aria-label="Crisis Timeline Year Slider 2010 to 2026"
                className="w-full accent-cyan-400 h-1.5 cursor-pointer"
              />

              <div className="flex items-center justify-between mt-1">
                {TIMELINE_YEARS.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => handleYearChange(yr)}
                    onMouseEnter={() => announceHover(`Select crisis observation year ${yr}`, 'year')}
                    onMouseLeave={clearHover}
                    onFocus={() => announceHover(`Select year ${yr}`, 'year')}
                    className={`text-[8px] font-mono px-1 py-0.5 rounded cursor-pointer transition-colors ${
                      selectedYear === yr
                        ? 'bg-cyan-400 text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Year-Synchronized Breaking Planetary Crisis News Card */}
            <div className="y2k-lcd rounded-lg overflow-hidden border border-cyan-500/35 mb-2">
              <div className="relative h-24 w-full bg-black">
                <img
                  src={activeDispatch.image}
                  alt={activeDispatch.headline}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040b16] via-[#040b16]/45 to-transparent" />
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-black/80 border border-cyan-400/50 text-[8px] font-mono font-bold text-cyan-300 uppercase">
                    {activeDispatch.badge}
                  </span>
                </div>
                <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between gap-1">
                  <span className="text-[9px] font-mono font-bold text-amber-300 truncate">
                    {activeDispatch.metric}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <Newspaper className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <h3 className="text-[11px] font-extrabold font-mono text-white leading-snug">
                    {activeDispatch.headline}
                  </h3>
                </div>
                <p className="text-[10px] font-mono text-slate-300 leading-relaxed">
                  {activeDispatch.summary}
                </p>
                <div className="pt-0.5 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-slate-400">SOURCE:</span>
                  <a
                    href={activeDispatch.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300 hover:text-amber-300 underline underline-offset-2 transition-colors"
                  >
                    <span>{activeDispatch.sourceName}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Earth Crisis News Briefings (Click to Read — No Music) */}
            <div className="space-y-1.5">
              {EARTH_SIGNAL_NEWS_CARDS.map((item) => {
                const isExpanded = item.id === expandedNewsId;
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg transition-all overflow-hidden ${
                      isExpanded
                        ? 'y2k-lcd border border-cyan-400/70 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                        : 'y2k-metal-btn'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedNewsId(isExpanded ? null : item.id)}
                      aria-expanded={isExpanded}
                      className="w-full group text-left flex items-center justify-between p-1.5 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-10 h-7 rounded overflow-hidden shrink-0 border border-cyan-500/30 bg-black">
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[6.5px] font-mono text-cyan-300 text-center leading-tight">
                            {item.code}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10.5px] font-bold font-mono text-white truncate group-hover:text-cyan-200">
                            {item.title}
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 ml-1.5 bg-slate-900/90 border border-slate-700 text-cyan-300">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-2 pb-2 pt-1 border-t border-cyan-500/20 space-y-1.5">
                        <p className="text-[9.5px] font-mono text-slate-300 leading-relaxed">
                          {item.newsText}
                        </p>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-cyan-300 hover:text-amber-300 underline underline-offset-2"
                        >
                          <span>Read report: {item.sourceName}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SECTION 3: CLASSIFIED SIGNALS (PLANETARY CRISIS ARCHIVE • 2026) ── */}
          <div>
            <div className="flex items-center justify-between px-1 mb-1.5 border-b border-cyan-500/25 pb-1">
              <span className="text-[10px] font-extrabold font-mono tracking-wider text-orange-300 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                <span>SECTION 2: CRISIS DOSSIERS</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400">2026 REPORTS</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {CLASSIFIED_CRISIS_DOSSIERS.map((dossier) => {
                const isSelected = dossier.id === activeDossier.id;
                return (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={dossier.id}
                    type="button"
                    onClick={() => setSelectedDossierId(dossier.id)}
                    className={`group text-left p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'y2k-lcd border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                        : 'y2k-metal-btn'
                    }`}
                  >
                    <div className="relative w-7 h-7 rounded overflow-hidden shrink-0 border border-cyan-500/30 bg-black">
                      <img
                        src={dossier.image}
                        alt={dossier.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold font-mono text-white truncate">
                        {dossier.title}
                      </div>
                      <div className="text-[8px] font-mono text-cyan-300/80 truncate">
                        {dossier.tag}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Active Dossier News Explanation + Source Link */}
            <div className="mt-2 y2k-lcd p-2 rounded-lg border border-orange-400/30 space-y-1">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="font-bold text-orange-300 uppercase">
                  {activeDossier.code} // {activeDossier.title}
                </span>
                <span className="text-amber-300">{activeDossier.tag}</span>
              </div>
              <p className="text-[9.5px] font-mono text-slate-300 leading-relaxed">
                {activeDossier.explanation}
              </p>
              <a
                href={activeDossier.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[9px] font-mono text-cyan-300 hover:text-amber-300 underline underline-offset-2"
              >
                <span>{activeDossier.sourceLabel}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Docked Status Bar */}
        <div className="px-3 py-2 bg-[#030812] border-t border-cyan-500/30 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
          <span className="truncate">
            ACTIVE: <strong className="text-cyan-300">{currentStation.name}</strong>
          </span>
          <span className="text-amber-300 font-bold shrink-0 ml-2">YR: {selectedYear}</span>
        </div>
      </aside>
    </>
  );
}
