import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Disc,
  ExternalLink,
  Play,
  Square,
  Radio,
  Music,
  Volume2,
  Globe,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { useReceiverStore } from '../../store/useReceiverStore';
import { audioEngine } from '../../audio/AudioEngine';

const GREETINGS_LANGUAGES = [
  { id: 'g-en', lang: 'English', text: '"Hello from the children of planet Earth."', spoken: 'Hello from the children of planet Earth.', langCode: 'en-US', era: 'Modern', freq: 261.63 },
  { id: 'g-ru', lang: 'Russian (Русский)', text: '"Здравствуйте! Приветствую вас!"', spoken: 'Здравствуйте! Приветствую вас!', langCode: 'ru-RU', era: 'Modern', freq: 293.66 },
  { id: 'g-fa', lang: 'Persian / Tajik (Форсӣ)', text: '"Dorud bar sakinân-e mawrâ-ye âsemân-hâ."', spoken: 'Greetings to the residents of far skies.', langCode: 'en-US', era: 'Modern / Silk Road', freq: 466.16 },
  { id: 'g-zh', lang: 'Mandarin Chinese', text: '"各位都好吧？我们都很想念你们，有空请到这儿来玩。"', spoken: 'Best wishes from all the people of Earth.', langCode: 'zh-CN', era: 'Modern', freq: 329.63 },
  { id: 'g-es', lang: 'Spanish', text: '"Hola y saludos a todos."', spoken: 'Hola y saludos a todos.', langCode: 'es-ES', era: 'Modern', freq: 349.23 },
  { id: 'g-fr', lang: 'French', text: '"Bonjour tout le monde."', spoken: 'Bonjour tout le monde.', langCode: 'fr-FR', era: 'Modern', freq: 392.0 },
  { id: 'g-ja', lang: 'Japanese', text: '"こんにちは。お元気ですか？"', spoken: 'Konnichiwa. Ogenki desu ka?', langCode: 'ja-JP', era: 'Modern', freq: 440.0 },
  { id: 'g-ar', lang: 'Arabic', text: '"تحياتنا للأصدقاء في النجوم."', spoken: 'Greetings to our friends in the stars.', langCode: 'ar-SA', era: 'Modern', freq: 493.88 },
  { id: 'g-su', lang: 'Sumerian', text: '"Silim-ma hé-me-en (May all be well)."', spoken: 'Silim ma he me en. May all be well.', langCode: 'en-GB', era: 'Ancient (c. 3000 BCE)', freq: 220.0 },
  { id: 'g-ak', lang: 'Akkadian', text: '"Adanniš lu šulmu (May all be very well)."', spoken: 'Adannish lu shulmu. May all be very well with you.', langCode: 'en-GB', era: 'Ancient (c. 2400 BCE)', freq: 246.94 },
  { id: 'g-el', lang: 'Ancient Greek', text: '"Οἵτινές ποτ᾽ ἐστέ, χαίρετε."', spoken: 'Greetings whoever you are. We come in friendship.', langCode: 'el-GR', era: 'Classical', freq: 311.13 },
  { id: 'g-la', lang: 'Latin', text: '"Salvete quicumque estis."', spoken: 'Salvete quicumque estis; bonam erga vos voluntatem habemus.', langCode: 'it-IT', era: 'Classical', freq: 369.99 },
];

const NASA_EARTH_SOUNDS = [
  { id: 's-1', title: 'Volcanoes, Earthquake, Thunder', cat: 'Planetary Geology', freq: 98.0, note: 'G2', audioCategory: 'seismic' },
  { id: 's-2', title: 'Wind, Rain, Ocean Surf', cat: 'Meteorology', freq: 329.6, note: 'E4', audioCategory: 'nature' },
  { id: 's-3', title: 'Crickets, Frogs, Bird Songs & Whale Call', cat: 'Biosphere', freq: 440.0, note: 'A4', audioCategory: 'bio' },
  { id: 's-4', title: 'Chimpanzee, Wild Dog, Wolf Howl', cat: 'Mammalia', freq: 293.6, note: 'D4', audioCategory: 'bio' },
  { id: 's-5', title: 'Footsteps, Heartbeat (Lub-Dub), Laughter', cat: 'Humanity', freq: 146.8, note: 'D3', audioCategory: 'human' },
  { id: 's-6', title: 'Fire, Speech, First Stone Tools', cat: 'Anthropology', freq: 349.2, note: 'F4', audioCategory: 'speech' },
  { id: 's-7', title: 'Apollo Saturn V Rocket Lift-off', cat: 'Aerospace Propulsion', freq: 65.4, note: 'C2', audioCategory: 'tech' },
  { id: 's-8', title: 'Pulsar CP 1919 Radiation Clock', cat: 'Astrophysics', freq: 92.5, note: 'F#2', audioCategory: 'pulsar' },
];

const VOYAGER_WORLD_MUSIC = [
  { id: 'bach', title: 'J.S. Bach — Brandenburg Concerto No. 2 (First Movement)', region: 'Germany / Baroque Counterpoint', key: 'F Major' },
  { id: 'gamelan', title: 'Court Gamelan — "Kinds of Flowers" (Puspawarna)', region: 'Java, Indonesia / Slendro Scale', key: 'Slendro 5-Tone' },
  { id: 'chakrulo', title: 'Georgian Folk Choir — "Chakrulo"', region: 'Caucasus / 3-Part Vocal Polyphony', key: 'Dorian Drone' },
  { id: 'panpipes', title: 'Andean Panpipes & Drum — "Casa"', region: 'Peru / Sikuri Wind Ensemble', key: 'E Minor Pentatonic' },
  { id: 'senegal', title: 'Senegalese Percussion — Recorded by Charles Duvelle', region: 'West Africa / Polyrhythmic Talking Drum', key: 'Polyrhythm' },
  { id: 'navajo', title: 'Navajo Night Chant — Ceremonial Vocal', region: 'North America / Indigenous Chant', key: 'C Pentatonic' },
  { id: 'beethoven', title: 'L. van Beethoven — Symphony No. 5 (First Movement)', region: 'Austria / Fate Motif', key: 'C Minor' },
  { id: 'berry', title: 'Chuck Berry — "Johnny B. Goode"', region: 'United States / Rock & Roll Riff', key: 'Bb Blues' },
];

const VOYAGER_ENCODED_IMAGES = [
  { id: 'img-circle', frame: '#001', title: 'Calibration Circle', category: '512x512 Aspect Calibration', desc: 'Binary reference circle etched on the cover so extraterrestrials can align scanlines.' },
  { id: 'img-solar', frame: '#004', title: 'Solar System & Planetary Diameters', category: 'Astrophysics Diagram', desc: 'Mathematical table of Sun and planets by mass, density, and orbital distance.' },
  { id: 'img-earth', frame: '#006', title: 'Full Earth from Orbit (Apollo)', category: 'Planetary Photograph', desc: 'Color composite encoded as 3 sequential R-G-B monochrome scanline frames.' },
  { id: 'img-dna', frame: '#012', title: 'DNA Double Helix Structure', category: 'Molecular Biology', desc: 'Deoxyribonucleic acid replication diagram showing terrestrial genetic code.' },
  { id: 'img-human', frame: '#019', title: 'Human Anatomy & Silhouette', category: 'Anthropology', desc: 'Frank Drake & Carl Sagan anatomical diagrams of human organs and life cycle.' },
  { id: 'img-continents', frame: '#029', title: 'Continental Drift (Pangaea → Now)', category: 'Plate Tectonics', desc: 'Three-era map of Earth’s crust from 1.5 billion years ago to present continents.' },
  { id: 'img-taj', frame: '#095', title: 'Human Architecture & Mountain Bridges', category: 'Civilization', desc: 'Engineering landmarks, suspension bridges, and alpine mountain roads.' },
  { id: 'img-launch', frame: '#111', title: 'Titan-Centaur Launch of Voyager', category: 'Space Exploration', desc: 'Cape Canaveral liftoff sending the Golden Record into interstellar space.' },
];

export default function VoyagerAudioModal({ isOpen: propIsOpen, onClose: propOnClose } = {}) {
  const [activeTab, setActiveTab] = useState('greetings'); // 'greetings' | 'nasaSounds' | 'worldMusic'
  const [activeSoundId, setActiveSoundId] = useState(null);
  const [isTourPlaying, setIsTourPlaying] = useState(false);

  const activeStation = useReceiverStore((s) => s.getActiveStation());
  const storeIsOpen = useReceiverStore((s) => s.isVoyagerModalOpen);
  const setVoyagerModalOpen = useReceiverStore((s) => s.setVoyagerModalOpen);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;

  const stopAllModalAudio = () => {
    setIsTourPlaying(false);
    audioEngine.stopActiveSequences();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleClose = () => {
    stopAllModalAudio();
    if (propOnClose) propOnClose();
    setVoyagerModalOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        audioEngine.stopActiveSequences();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (propOnClose) propOnClose();
        setVoyagerModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, propOnClose, setVoyagerModalOpen]);

  const playGreetingCard = (item) => {
    audioEngine.unlockSync();
    audioEngine.stopActiveSequences();
    setIsTourPlaying(false);
    setActiveSoundId(item.id);
    audioEngine.playDataPoint('voyagerRecord', {
      id: item.id,
      frequency: item.freq,
      noteName: 'C4',
      longitude: 0,
      audioCategory: 'speech',
      spokenText: item.spoken,
      langCode: item.langCode,
    });
  };

  const playSoundPreview = (snd) => {
    audioEngine.unlockSync();
    audioEngine.stopActiveSequences();
    setIsTourPlaying(false);
    setActiveSoundId(snd.id);
    audioEngine.playDataPoint('voyagerSounds', {
      id: snd.id,
      frequency: snd.freq,
      noteName: snd.note,
      longitude: 0,
      audioCategory: snd.audioCategory,
    });
  };

  const playMusicCard = (track) => {
    audioEngine.unlockSync();
    audioEngine.stopActiveSequences();
    setIsTourPlaying(false);
    setActiveSoundId(track.id);
    audioEngine.playVoyagerMusicTrack(track.id);
  };

  const playImageCard = (img) => {
    audioEngine.unlockSync();
    audioEngine.stopActiveSequences();
    setIsTourPlaying(false);
    setActiveSoundId(img.id);
    audioEngine.playVoyagerEncodedImage(img.id);
  };

  const handleToggleTour = () => {
    audioEngine.unlockSync();
    if (isTourPlaying) {
      stopAllModalAudio();
      return;
    }

    audioEngine.stopActiveSequences();
    setIsTourPlaying(true);

    if (activeTab === 'greetings') {
      GREETINGS_LANGUAGES.forEach((item, idx) => {
        audioEngine.scheduleTimer(() => {
          setActiveSoundId(item.id);
          audioEngine.playDataPoint('voyagerRecord', {
            id: item.id,
            frequency: item.freq,
            noteName: 'C4',
            longitude: ((idx % 5) - 2) * 55,
            audioCategory: 'speech',
            spokenText: item.spoken,
            langCode: item.langCode,
          });
          if (idx === GREETINGS_LANGUAGES.length - 1) {
            audioEngine.scheduleTimer(() => setIsTourPlaying(false), 1100);
          }
        }, idx * 1250);
      });
    } else if (activeTab === 'nasaSounds') {
      NASA_EARTH_SOUNDS.forEach((snd, idx) => {
        audioEngine.scheduleTimer(() => {
          setActiveSoundId(snd.id);
          audioEngine.playDataPoint('voyagerSounds', {
            id: snd.id,
            frequency: snd.freq,
            noteName: snd.note,
            longitude: ((idx % 5) - 2) * 55,
            audioCategory: snd.audioCategory,
          });
          if (idx === NASA_EARTH_SOUNDS.length - 1) {
            audioEngine.scheduleTimer(() => setIsTourPlaying(false), 1100);
          }
        }, idx * 1200);
      });
    } else if (activeTab === 'encodedImages') {
      VOYAGER_ENCODED_IMAGES.forEach((img, idx) => {
        audioEngine.scheduleTimer(() => {
          setActiveSoundId(img.id);
          audioEngine.playVoyagerEncodedImage(img.id, ((idx % 3) - 1) * 0.35);
          if (idx === VOYAGER_ENCODED_IMAGES.length - 1) {
            audioEngine.scheduleTimer(() => setIsTourPlaying(false), 1100);
          }
        }, idx * 1200);
      });
    } else {
      VOYAGER_WORLD_MUSIC.forEach((track, idx) => {
        audioEngine.scheduleTimer(() => {
          setActiveSoundId(track.id);
          audioEngine.playVoyagerMusicTrack(track.id, ((idx % 3) - 1) * 0.35);
          if (idx === VOYAGER_WORLD_MUSIC.length - 1) {
            audioEngine.scheduleTimer(() => setIsTourPlaying(false), 1200);
          }
        }, idx * 1350);
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="voyager-modal-title"
          className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="y2k-window relative w-full max-w-[96vw] sm:max-w-2xl rounded-xl overflow-hidden text-slate-100 max-h-[88vh] flex flex-col"
          >
            {/* Title Bar */}
            <div className="y2k-titlebar px-3.5 py-2 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close Window"
                    className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-red-300 via-red-500 to-red-700 border border-red-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] cursor-pointer"
                  />
                  <span className="w-3 h-3 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 border border-amber-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />
                  <span className="w-3 h-3 rounded-full bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-600 border border-emerald-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />
                </div>

                <div className="h-3.5 w-[1px] bg-cyan-400/30 mx-0.5" />

                <Disc className="w-4 h-4 text-amber-300 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
                <h2 id="voyager-modal-title" className="text-xs sm:text-sm font-bold font-mono tracking-wider text-white uppercase truncate drop-shadow">
                  VOYAGER_ARCHIVE.EXE — GOLDEN RECORD (1977)
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Voyager Archive Modal"
                className="y2k-metal-btn px-2.5 py-1 rounded text-[11px] font-mono font-bold text-slate-100 hover:text-white cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EXIT</span>
              </button>
            </div>

            {/* 3 Tabs + Play All Tour + Test Local Audio */}
            <div className="px-3.5 pt-2.5 pb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => {
                    stopAllModalAudio();
                    setActiveTab('greetings');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    activeTab === 'greetings'
                      ? 'y2k-gold-btn'
                      : 'y2k-metal-btn text-slate-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>GREETINGS (55)</span>
                </button>

                <button
                  onClick={() => {
                    stopAllModalAudio();
                    setActiveTab('nasaSounds');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    activeTab === 'nasaSounds'
                      ? 'y2k-aqua-btn'
                      : 'y2k-metal-btn text-slate-300 hover:text-white'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>SOUNDS OF EARTH</span>
                </button>

                <button
                  onClick={() => {
                    stopAllModalAudio();
                    setActiveTab('worldMusic');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    activeTab === 'worldMusic'
                      ? 'y2k-gold-btn'
                      : 'y2k-metal-btn text-slate-300 hover:text-white'
                  }`}
                >
                  <Music className="w-3 h-3" />
                  <span>WORLD MUSIC (8)</span>
                </button>

                <button
                  onClick={() => {
                    stopAllModalAudio();
                    setActiveTab('encodedImages');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    activeTab === 'encodedImages'
                      ? 'y2k-aqua-btn'
                      : 'y2k-metal-btn text-slate-300 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>IMAGES (116)</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleTour}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer border ${
                    isTourPlaying
                      ? 'bg-rose-500/25 border-rose-400 text-rose-200'
                      : 'y2k-aqua-btn text-slate-950'
                  }`}
                >
                  {isTourPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isTourPlaying ? 'STOP TOUR' : 'PLAY ALL'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioEngine.unlockSync();
                    audioEngine.playTestTone();
                  }}
                  className="y2k-lcd px-2 py-1 rounded text-[10px] font-mono text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Test local Web Audio synthesizer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>TEST</span>
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div className="overflow-y-auto custom-scrollbar p-3.5 sm:p-4 flex-1 space-y-3">
              {activeTab === 'greetings' && (
                <div>
                  <div className="y2k-lcd p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                        <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        GREETINGS IN 55 LANGUAGES (LOCAL SYNTH + SOUNDCLOUD)
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Click any language card below for instant local vocal-formant + speech synthesis (works even if Brave blocks SoundCloud).
                      </div>
                    </div>
                    <a
                      href="https://soundcloud.com/flying-classroom/greetings-in-55-languages"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="y2k-gold-btn px-2.5 py-1 font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>SOUNDCLOUD</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {GREETINGS_LANGUAGES.map((item) => {
                      const isCurrent = activeSoundId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => playGreetingCard(item)}
                          className={`text-left p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isCurrent
                              ? 'y2k-lcd border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : 'y2k-metal-btn'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-300">
                              <span className="truncate">{item.lang}</span>
                              <span className="text-[9px] text-slate-400 font-normal shrink-0">[{item.era}]</span>
                            </div>
                            <p className="text-[11px] text-slate-200 italic mt-0.5 truncate">
                              {item.text}
                            </p>
                          </div>
                          <div className="y2k-gold-btn w-7 h-7 rounded-md flex items-center justify-center shrink-0">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-lg overflow-hidden border border-cyan-500/30 bg-black shadow-inner">
                    <iframe
                      width="100%"
                      height="110"
                      scrolling="no"
                      frameBorder="no"
                      allow="autoplay"
                      loading="lazy"
                      title="Greetings in 55 Languages"
                      src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/flying-classroom/greetings-in-55-languages&color=%23f59e0b&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'nasaSounds' && (
                <div>
                  <div className="y2k-lcd p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        NASA JPL SOUNDS OF EARTH — MULTI-VOICE SYNTHESIS
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Click any card below to synthesize geological, biological, human heartbeat, Saturn V, and pulsar signatures.
                      </div>
                    </div>
                    <a
                      href="https://science.nasa.gov/mission/voyager/golden-record-contents/sounds/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="y2k-aqua-btn px-2.5 py-1 font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>NASA ARCHIVE</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-2">
                    {NASA_EARTH_SOUNDS.map((snd) => {
                      const isCurrent = activeSoundId === snd.id;
                      return (
                        <div
                          key={snd.id}
                          onClick={() => playSoundPreview(snd)}
                          className={`flex items-center justify-between p-2.5 rounded-lg transition-all cursor-pointer ${
                            isCurrent
                              ? 'y2k-lcd border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                              : 'y2k-metal-btn'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="text-xs font-bold font-mono text-white truncate">
                              {snd.title}
                            </div>
                            <div className="text-[10px] font-mono text-cyan-300/80 mt-0.5">
                              {snd.cat} • Carrier: {snd.note} ({Math.round(snd.freq)}Hz) • Mode: {snd.audioCategory.toUpperCase()}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playSoundPreview(snd);
                            }}
                            className="y2k-aqua-btn px-3 py-1.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>PLAY</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'worldMusic' && (
                <div>
                  <div className="y2k-lcd p-2.5 rounded-lg mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                      <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      90 MINUTES OF HUMANITY&apos;S GREATEST MUSIC — INTERACTIVE MOTIFS
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      Click any masterpiece from Carl Sagan&apos;s 1977 Golden Record selection to hear its musical motif synthesized live.
                    </div>
                  </div>

                  <div className="space-y-2">
                    {VOYAGER_WORLD_MUSIC.map((track) => {
                      const isCurrent = activeSoundId === track.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => playMusicCard(track)}
                          className={`flex items-center justify-between p-2.5 rounded-lg transition-all cursor-pointer ${
                            isCurrent
                              ? 'y2k-lcd border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : 'y2k-metal-btn'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="text-xs font-bold font-mono text-white truncate">
                              {track.title}
                            </div>
                            <div className="text-[10px] font-mono text-amber-300/85 mt-0.5">
                              {track.region} • Scale/Key: {track.key}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playMusicCard(track);
                            }}
                            className="y2k-gold-btn px-3 py-1.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>PLAY</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'encodedImages' && (
                <div>
                  <div className="y2k-lcd p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        116 ENCODED IMAGES OF EARTH — 512-LINE SSTV AUDIO SYNTHESIS
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Each image on the Golden Record was etched as 512 vertical audio scanlines (8ms per line). Click any frame to decode its scanline audio!
                      </div>
                    </div>
                    <a
                      href="https://science.nasa.gov/mission/voyager/golden-record-contents/images/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="y2k-aqua-btn px-2.5 py-1 font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>NASA IMAGES</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {VOYAGER_ENCODED_IMAGES.map((img) => {
                      const isCurrent = activeSoundId === img.id;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => playImageCard(img)}
                          className={`text-left p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isCurrent
                              ? 'y2k-lcd border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                              : 'y2k-metal-btn'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-cyan-300">
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/40 text-[9px] text-amber-300 shrink-0">
                                {img.frame}
                              </span>
                              <span className="truncate text-white">{img.title}</span>
                            </div>
                            <div className="text-[9px] font-mono text-cyan-300/80 mt-0.5">
                              {img.category} • 512x512 Scanline Groove
                            </div>
                            <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">
                              {img.desc}
                            </p>
                          </div>
                          <div className="y2k-aqua-btn w-7 h-7 rounded-md flex items-center justify-center shrink-0">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-3.5 py-2 bg-[#050b16] border-t border-cyan-500/30 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
              <span>
                CHANNEL: <strong className="text-amber-400">{activeStation.name}</strong>
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="y2k-metal-btn px-4 py-1 text-slate-100 rounded font-mono text-xs font-bold cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
