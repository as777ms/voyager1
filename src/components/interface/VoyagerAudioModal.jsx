import { useEffect, useRef, useState } from 'react';
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
import { VOYAGER_GOLDEN_RECORD_TRACKS } from '../../data/nasaData';
import { VOYAGER_GREETINGS_55 } from '../../data/voyagerGreetings55';
import { audioEngine } from '../../audio/AudioEngine';

const GREETINGS_LANGUAGES = VOYAGER_GREETINGS_55;

const ARCHIVE_WAV_STREAMS = [
  {
    id: 'wav-launch',
    title: 'Voyager-1 Launch Commentary (1977)',
    source: 'Archive.org / NASA Voyager-1 Mission',
    streamUrl: 'https://archive.org/download/Voyager1/Voyager-1_Launch_Commentary.wav',
    detailsUrl: 'https://archive.org/details/Voyager1/Voyager-1_Launch_Commentary.wav',
  },
  {
    id: 'wav-495aab',
    title: 'Voyager Golden Record Telemetry & Audio (495-AAB, 8m10s)',
    source: 'Archive.org / NASA Golden Record',
    streamUrl: 'https://archive.org/download/Voyager1/495-AAB_8min10sec.wav',
    detailsUrl: 'https://archive.org/details/Voyager1/495-AAB_8min10sec.wav',
  },
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

const VOYAGER_WORLD_MUSIC = VOYAGER_GOLDEN_RECORD_TRACKS;

const VOYAGER_ENCODED_IMAGES = [
  {
    id: 'img-circle',
    frame: '#001',
    title: 'Calibration Circle',
    category: '512x512 Aspect Calibration',
    desc: 'Binary reference circle etched on the cover so extraterrestrials can verify 512x512 aspect ratio.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Calibration-circle.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-solar-spectra',
    frame: '#008',
    title: 'Solar Spectra & Chemistry',
    category: 'Astrophysics',
    desc: 'Absorption lines and spectral bands of the Sun establishing terrestrial chemical measurement units.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Voyager_Golden_Record_008._Spectra.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-mercury',
    frame: '#009',
    title: 'Planet Mercury',
    category: 'Solar System',
    desc: 'Orbital survey photograph of the innermost rocky planet of our solar system.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Voyager_golden_record_9_mercury.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-mars',
    frame: '#010',
    title: 'Planet Mars',
    category: 'Solar System',
    desc: 'Mariner orbital imagery showing Martian craters, impact basins, and thin carbon-dioxide atmosphere.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Voyager_golden_record_10_mars.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-jupiter',
    frame: '#011',
    title: 'Planet Jupiter',
    category: 'Gas Giant',
    desc: 'Pioneer 10 full-disk image of Jupiter showing the Great Red Spot and atmospheric storm belts.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Voyager_golden_record_11_jupiter.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-earth',
    frame: '#012',
    title: 'Planet Earth from Orbit',
    category: 'Planetary Science',
    desc: 'Apollo photographic composite of planet Earth showing oceans, cloud systems, and continental landmasses.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Voyager_golden_record_12_earth.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-earth-terminator',
    frame: '#013',
    title: 'Earth & Day-Night Terminator',
    category: 'Planetary Science',
    desc: 'Global view of planet Earth demonstrating orbital day/night diurnal lighting conditions.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Voyager_golden_record_13_earth.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-tetons',
    frame: '#042',
    title: 'The Tetons & Snake River (Ansel Adams)',
    category: 'Biosphere & Landscape',
    desc: 'Iconic photograph representing Earth’s pristine mountain ranges, river valleys, and forests.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Voyager_Golden_Record_042._Snake_River_and_Grand_Tetons.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-supermarket',
    frame: '#076',
    title: 'Supermarket & Food Distribution',
    category: 'Human Civilization',
    desc: 'Photograph demonstrating modern agricultural harvest, commercial distribution, and human food supply.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Voyager_Golden_Record_076._Supermarket.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-eating',
    frame: '#081',
    title: 'Demonstration of Eating & Drinking',
    category: 'Human Physiology',
    desc: 'Photographic documentation of human ingestion, nutrition, and hydration mechanics.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Voyager_Golden_Record_081._Demonstration_of_licking%2C_eating_and_drinking.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-highway',
    frame: '#103',
    title: 'Highway & Transportation Grid',
    category: 'Civilization',
    desc: 'Golden Gate transit network and highway infrastructure showing terrestrial vehicular travel.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Voyager_golden_record_103_highway.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-arecibo',
    frame: '#110',
    title: 'Arecibo Radio Telescope',
    category: 'Interstellar Communication',
    desc: 'The 305-meter radio telescope in Puerto Rico used for radio astronomy and deep space transmission.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Voyager_golden_record_110_arecibo.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-newton',
    frame: '#111',
    title: 'Newton’s "System of the World"',
    category: 'Physics & Science',
    desc: 'Page from Isaac Newton’s Principia Mathematica illustrating planetary orbits and gravitational physics.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Voyager_golden_record_111_systemoftheworld.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-astronaut',
    frame: '#112',
    title: 'Astronaut in Spacewalk',
    category: 'Space Exploration',
    desc: 'Extravehicular activity in low Earth orbit documenting human spaceflight capability.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Voyager_golden_record_112_astronaut.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-launch',
    frame: '#113',
    title: 'Titan-Centaur Launch of Voyager',
    category: 'Space Exploration',
    desc: 'Cape Canaveral liftoff sending the Voyager probes and Golden Record into interstellar space.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Voyager_golden_record_113_launch.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    id: 'img-score',
    frame: '#116',
    title: 'Beethoven String Quartet Score',
    category: 'Human Arts & Music',
    desc: 'Musical manuscript of Cavatina from String Quartet No. 13 in B-flat Major, Op. 130 by Ludwig van Beethoven.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Voyager_golden_record_116_score.gif?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
];

export default function VoyagerAudioModal({ isOpen: propIsOpen, onClose: propOnClose } = {}) {
  const [activeSoundId, setActiveSoundId] = useState(null);
  const [activeYoutubeTrack, setActiveYoutubeTrack] = useState(null);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState(() =>
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis.getVoices() || []
      : []
  );
  const [greetingStatus, setGreetingStatus] = useState(null);
  const modalBodyRef = useRef(null);
  const tourRunIdRef = useRef(0);

  const activeStation = useReceiverStore((s) => s.getActiveStation());
  const storeIsOpen = useReceiverStore((s) => s.isVoyagerModalOpen);
  const activeTab = useReceiverStore((s) => s.voyagerModalTab);
  const setActiveTab = useReceiverStore((s) => s.setVoyagerModalTab);
  const setVoyagerModalOpen = useReceiverStore((s) => s.setVoyagerModalOpen);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;

  const stopAllModalAudio = () => {
    tourRunIdRef.current += 1;
    setIsTourPlaying(false);
    setActiveSoundId(null);
    setGreetingStatus(null);
    audioEngine.stopActiveSequences();
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
    const syncVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices() || []);
    };
    syncVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', syncVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', syncVoices);
    };
  }, []);

  const handleClose = () => {
    stopAllModalAudio();
    setActiveYoutubeTrack(null);
    if (propOnClose) propOnClose();
    setVoyagerModalOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        tourRunIdRef.current += 1;
        setIsTourPlaying(false);
        setActiveSoundId(null);
        setActiveYoutubeTrack(null);
        audioEngine.stopActiveSequences();
        if (propOnClose) propOnClose();
        setVoyagerModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, propOnClose, setVoyagerModalOpen]);

  const playGreetingCard = (item) => {
    tourRunIdRef.current += 1;
    setIsTourPlaying(false);
    setActiveSoundId(item.id);
    const result = audioEngine.playVoyagerGreetingItem(item, {
      onEnded: () => {
        setActiveSoundId((cur) => (cur === item.id ? null : cur));
      },
    });
    setGreetingStatus({
      order: item.order,
      lang: item.lang,
      langCode: item.langCode,
      speaker: item.speaker,
      mode: result.mode,
      voiceName: result.voice?.name || null,
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
    audioEngine.playVoyagerMusicTrack(track.synthStyle || track.id);
  };

  const playImageCard = (img) => {
    audioEngine.unlockSync();
    audioEngine.stopActiveSequences();
    setIsTourPlaying(false);
    setActiveSoundId(img.id);
    audioEngine.playVoyagerEncodedImage(img.id);
  };

  const toggleArchiveWav = (wav) => {
    audioEngine.unlockSync();
    if (activeSoundId === wav.id) {
      stopAllModalAudio();
      setActiveSoundId(null);
      return;
    }
    setIsTourPlaying(false);
    setActiveSoundId(wav.id);
    audioEngine.playStreamUrl(wav.streamUrl, () => setActiveSoundId(null));
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
      const runId = ++tourRunIdRef.current;
      const playStep = (idx) => {
        if (tourRunIdRef.current !== runId) return;
        if (idx >= GREETINGS_LANGUAGES.length) {
          setIsTourPlaying(false);
          setActiveSoundId(null);
          return;
        }
        const item = GREETINGS_LANGUAGES[idx];
        setActiveSoundId(item.id);
        const result = audioEngine.playVoyagerGreetingItem(item, {
          onEnded: () => {
            if (tourRunIdRef.current !== runId) return;
            audioEngine.scheduleTimer(() => playStep(idx + 1), 260);
          },
        });
        setGreetingStatus({
          order: item.order,
          lang: item.lang,
          langCode: item.langCode,
          speaker: item.speaker,
          mode: result.mode,
          voiceName: result.voice?.name || null,
        });
      };
      playStep(0);
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
          audioEngine.playVoyagerMusicTrack(track.synthStyle || track.id, ((idx % 3) - 1) * 0.35);
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
                  <span>WORLD MUSIC ({VOYAGER_WORLD_MUSIC.length})</span>
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
            <div ref={modalBodyRef} className="overflow-y-auto custom-scrollbar p-3.5 sm:p-4 flex-1 space-y-3">
              {activeTab === 'greetings' && (
                <div>
                  <div className="y2k-lcd p-2.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                        <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        GREETINGS IN {GREETINGS_LANGUAGES.length} LANGUAGES (NASA VOYAGER ARCHIVE)
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Every card plays the real 1977 recording of that language from the Golden Record (original speakers, public-domain NASA audio). PLAY ALL runs through all 55 in record order.
                      </div>
                    </div>
                    <a
                      href="https://science.nasa.gov/mission/voyager/golden-record-contents/greetings/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="y2k-gold-btn px-2.5 py-1 font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>NASA.GOV</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {greetingStatus && (
                    <div
                      className={`mb-2.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono flex items-center justify-between gap-2 ${
                        greetingStatus.mode === 'unsupported'
                          ? 'bg-amber-500/10 border-amber-400/40 text-amber-200'
                          : 'bg-emerald-500/10 border-emerald-400/40 text-emerald-200'
                      }`}
                    >
                      <span className="truncate">
                        #{greetingStatus.order} {greetingStatus.lang} ({greetingStatus.langCode}):{' '}
                        {greetingStatus.mode === 'audio'
                          ? `Playing original 1977 Golden Record voice${greetingStatus.speaker ? ` — ${greetingStatus.speaker}` : ''}`
                          : greetingStatus.mode === 'speech'
                          ? `Speaking with browser voice "${greetingStatus.voiceName}"`
                          : 'No matching browser voice or individual audio URL available — listen via full SoundCloud track below'}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {GREETINGS_LANGUAGES.map((item) => {
                      const isCurrent = activeSoundId === item.id;
                      const support = audioEngine.getGreetingPlaybackSupport(item, availableVoices);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => playGreetingCard(item)}
                          className={`text-left p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isCurrent
                              ? 'y2k-lcd border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : 'y2k-metal-btn'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-300">
                              <span className="text-[10px] text-cyan-300/80 shrink-0">#{item.order}</span>
                              <span className="truncate">{item.lang}</span>
                              <span className="text-[9px] text-slate-400 font-normal shrink-0">[{item.era}]</span>
                            </div>
                            <p className="text-[11px] text-white mt-0.5 truncate" title={item.originalText}>
                              {item.originalText}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-[10px] text-slate-300 italic truncate flex-1" title={item.translation}>
                                &ldquo;{item.translation}&rdquo;
                              </p>
                              <span
                                className={`text-[8px] font-mono px-1 py-0.2 rounded border shrink-0 ${
                                  support === 'audio'
                                    ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                                    : support === 'speech'
                                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                                    : 'bg-slate-800/80 border-slate-600 text-slate-400'
                                }`}
                              >
                                {support === 'audio'
                                  ? 'AUDIO'
                                  : support === 'speech'
                                  ? item.langCode
                                  : `NO VOICE (${item.langCode})`}
                              </span>
                            </div>
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
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <a
                        href="https://science.nasa.gov/mission/voyager/golden-record-contents/sounds/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="y2k-aqua-btn px-2.5 py-1 font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <span>NASA SOUNDS</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://science.nasa.gov/mission/voyager/voyager-1/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="y2k-metal-btn px-2.5 py-1 font-mono font-bold text-[10px] rounded-lg text-cyan-200 flex items-center gap-1 cursor-pointer"
                      >
                        <span>VOYAGER-1</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Real Archive.org WAV Streams */}
                  <div className="mb-3 space-y-1.5">
                    <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                      REAL ARCHIVE.ORG WAV STREAMS (DIRECT PLAYBACK)
                    </div>
                    {ARCHIVE_WAV_STREAMS.map((wav) => {
                      const isPlayingWav = activeSoundId === wav.id;
                      return (
                        <div
                          key={wav.id}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            isPlayingWav
                              ? 'y2k-lcd border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : 'bg-slate-900/75 border-amber-500/30'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="text-xs font-mono font-bold text-amber-200 truncate">
                              {wav.title}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {wav.source}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleArchiveWav(wav)}
                              className="y2k-gold-btn px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {isPlayingWav ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                              <span>{isPlayingWav ? 'STOP WAV' : 'PLAY WAV'}</span>
                            </button>
                            <a
                              href={wav.detailsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="y2k-metal-btn px-2 py-1 rounded text-[10px] font-mono text-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              <span>ARCHIVE</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
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
                  <div className="y2k-lcd p-2.5 rounded-lg mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                        <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        ALL {VOYAGER_WORLD_MUSIC.length} GOLDEN RECORD TRACKS — ORIGINAL ARCHIVE + SYNTH
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        Play the original 1977 Archive.org Golden Record WAV stream below, click PLAY for local synthesis, or WATCH / YT for the YouTube recording.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleArchiveWav(ARCHIVE_WAV_STREAMS[1])}
                      className="y2k-gold-btn px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {activeSoundId === ARCHIVE_WAV_STREAMS[1].id ? (
                        <Square className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current" />
                      )}
                      <span>{activeSoundId === ARCHIVE_WAV_STREAMS[1].id ? 'STOP 1977 WAV' : 'PLAY 1977 WAV'}</span>
                    </button>
                  </div>

                  {activeYoutubeTrack && (
                    <div className="sticky top-0 z-20 mb-3 rounded-lg overflow-hidden border border-amber-400/70 bg-black shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
                      <div className="px-2.5 py-1.5 bg-[#0a1326] flex flex-wrap items-center justify-between text-[10px] font-mono border-b border-amber-400/30 gap-2">
                        <span className="text-amber-300 font-bold truncate min-w-0 flex-1">
                          NOW WATCHING #{activeYoutubeTrack.num}: {activeYoutubeTrack.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const idx = VOYAGER_WORLD_MUSIC.findIndex((t) => t.id === activeYoutubeTrack.id);
                              const prevIdx = (idx - 1 + VOYAGER_WORLD_MUSIC.length) % VOYAGER_WORLD_MUSIC.length;
                              stopAllModalAudio();
                              setActiveYoutubeTrack(VOYAGER_WORLD_MUSIC[prevIdx]);
                            }}
                            className="text-slate-200 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                            title="Previous track video"
                          >
                            ‹ PREV
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const idx = VOYAGER_WORLD_MUSIC.findIndex((t) => t.id === activeYoutubeTrack.id);
                              const nextIdx = (idx + 1) % VOYAGER_WORLD_MUSIC.length;
                              stopAllModalAudio();
                              setActiveYoutubeTrack(VOYAGER_WORLD_MUSIC[nextIdx]);
                            }}
                            className="text-slate-200 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer"
                            title="Next track video"
                          >
                            NEXT ›
                          </button>
                          <a
                            href={activeYoutubeTrack.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-200 hover:text-white px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/50 flex items-center gap-1 font-bold"
                          >
                            <span>OPEN ON YOUTUBE</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setActiveYoutubeTrack(null)}
                            className="text-rose-200 hover:text-white px-2 py-0.5 rounded bg-rose-950/70 border border-rose-500/40 cursor-pointer"
                          >
                            CLOSE
                          </button>
                        </div>
                      </div>
                      <div className="relative w-full aspect-video max-h-[240px] sm:max-h-[320px] bg-black">
                        <iframe
                          key={activeYoutubeTrack.youtubeId}
                          className="w-full h-full"
                          src={`https://www.youtube-nocookie.com/embed/${activeYoutubeTrack.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                          title={activeYoutubeTrack.title}
                          frameBorder="0"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <div className="px-2.5 py-1 bg-[#070d1a] flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-800">
                        <span className="truncate">{activeYoutubeTrack.performer}</span>
                        <a
                          href={activeYoutubeTrack.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-300 hover:text-amber-200 underline shrink-0 ml-2"
                        >
                          Video blocked? Open YouTube link ↗
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {VOYAGER_WORLD_MUSIC.map((track) => {
                      const isCurrent = activeSoundId === track.id;
                      const isWatching = activeYoutubeTrack?.id === track.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => playMusicCard(track)}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg transition-all cursor-pointer ${
                            isCurrent || isWatching
                              ? 'y2k-lcd border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : 'y2k-metal-btn'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="text-xs font-bold font-mono text-white truncate">
                              <span className="text-amber-300 mr-1.5">#{track.num}</span>
                              {track.title}
                            </div>
                            <div className="text-[10px] font-mono text-cyan-300/85 truncate mt-0.5">
                              {track.performer}
                            </div>
                            <div className="text-[9px] font-mono text-amber-300/80 mt-0.5">
                              {track.region} • Key: {track.key}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playMusicCard(track);
                              }}
                              className="y2k-gold-btn px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                              title="Play instant local Web Audio motif"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>PLAY</span>
                            </button> */}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                stopAllModalAudio();
                                const nextTrack = isWatching ? null : track;
                                setActiveYoutubeTrack(nextTrack);
                                if (nextTrack && modalBodyRef.current) {
                                  modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                              }}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer ${
                                isWatching ? 'y2k-aqua-btn' : 'y2k-metal-btn text-cyan-300 hover:text-white'
                              }`}
                              title="Open inline YouTube player"
                            >
                              <Radio className="w-3 h-3" />
                              <span>{isWatching ? 'CLOSE' : 'WATCH'}</span>
                            </button>

                            <a
                              href={track.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="y2k-metal-btn px-2 py-1 rounded-md text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1"
                              title="Open on YouTube"
                            >
                              <span>YT</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {VOYAGER_ENCODED_IMAGES.map((img) => {
                      const isCurrent = activeSoundId === img.id;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => playImageCard(img)}
                          className={`text-left p-2 rounded-lg transition-all cursor-pointer flex items-center gap-2.5 ${
                            isCurrent
                              ? 'y2k-lcd border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                              : 'y2k-metal-btn hover:border-cyan-400/50'
                          }`}
                        >
                          {/* Real Analog Encoded Image from Voyager Golden Record */}
                          <div className="relative w-16 h-16 rounded overflow-hidden shrink-0 border border-cyan-500/40 bg-black/80 flex items-center justify-center">
                            {img.imageUrl ? (
                              <img
                                src={img.imageUrl}
                                alt={img.title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-cyan-400/50" />
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[7.5px] font-mono text-cyan-300 text-center py-0.5 leading-none">
                              {img.frame}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-cyan-300">
                              <span className="truncate text-white">{img.title}</span>
                            </div>
                            <div className="text-[9px] font-mono text-cyan-300/80 mt-0.5 truncate">
                              {img.category} • 512 Scanlines
                            </div>
                            <p className="text-[10px] font-mono text-slate-300 mt-0.5 line-clamp-2 leading-tight">
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
