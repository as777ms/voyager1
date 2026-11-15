# THE RECEIVER — NASA Earth Jukebox

> **«An auditory gateway to Earth.»**  
> Интерактивный 3D-интерфейс и сонификатор реального времени для хакатона **NASA Space Apps Challenge**, созданный для задачи **Earth Jukebox** («Земной музыкальный автомат»). Проект переводит спутниковые визуализации **NASA Earth Information Center (EIC)**, данные **NASA SVS** и исторический архив **Voyager Golden Record (1977)** в живое, многоголосное звучание и доступную науку о Земле.

---

## 1. Концепция: как мы закрываем задачу NASA Earth Jukebox

Задача **Earth Jukebox** требует сделать сложную науку о Земле доступной (в том числе для незрячих и слабовидящих пользователей) и увлекательной, **переводя зрение (спутниковые кадры EIC) в динамическую сонификацию в реальном времени**.

Как это реализовано в **THE RECEIVER**:
1. **Live Pixel-to-Sound Сонификация (EIC World Map):** На интерактивной карте мира (`WorldMapModal`) курсор или автоматический **Planetary Scan** считывает реальные цветовые/физические значения пикселей слоёв **NASA SVS** и **NASA GIBS** и в реальном времени преобразует их в высоту тона (MIDI/Hz), тембр, стерео-панораму и ритм (`PixelSonifier.js` + `AudioEngine.js`).
2. **Every Station Begins With a Key:** Перед каждым набором данных пользователь может прослушать калибровочный ключ (`DecodingKeyModal` и кнопка `KEY [D]`): как звучит минимум, середина и максимум шкалы (например, полярный холод vs тепловой купол, чистый воздух vs экстремальный угарный газ, штиль vs ураган 5-й категории).
3. **2010–2026 Crisis Timeline:** Переключатель годов на правой панели меняет интенсивность климатических аномалий (рост CO₂, таяние ледников, лесные пожары, ночные огни городов) — и **звук меняется вместе с данными**.
4. **Voyager Golden Record (1977):** Связывает современное наблюдение за Землёй с легендарным межзвёздным посланием человечества: 55 приветствий Земли, звуки планеты (включая реальные WAV-потоки с Archive.org), все 27 музыкальных произведений Золотой пластинки (локальный синтез + встроенный YouTube-плеер) и 116 закодированных изображений (сканлайн-аудио).

---

## 2. Карта интерфейса: какая сторона и какая кнопка за что отвечает

### Верхний левый угол
* **Панель камер (`CAM 01: SCENE`, `CAM 02: ALIEN`, `CAM 03: DISC`, `CAM 04: HORIZON`)** — плавно переключает ракурс 3D-сцены (общий обзор, пришелец-слушатель, Золотая пластинка Voyager, горизонт Земли).
* **Карточка `THE RECEIVER` (`RECEIVER_CORE_SYS`)** — расположена прямо под блоком камер; показывает статус сигнала (`SIGNAL LOCKED`), живую осциллограмму активности звука и слоган проекта.

### Центр экрана (3D-сцена)
* **Интерактивный 3D-глобус Земли, Пришелец, Спутник и Золотая пластинка Voyager** — сцену можно вращать и приближать мышкой.
* **Плавающие 3D-хотспоты (`Hotspot: Pamir Glacier`, `Hotspot: Thermal Anomaly`, `Hotspot: ISS-LIS Flash`)** — быстрый 1-клик переход на критические точки планеты с немедленным запуском сонификации.

### Нижняя центральная панель (Компактный плеер)
* **Строка статуса (`Instrument // Year // Status`)**:
  * **`AUDIO: ON (TEST)` / `TAP: UNLOCK AUDIO`** — разблокирует Web Audio API в браузере (если автовоспроизведение заблокировано политикой браузера) и воспроизводит тестовый сигнал.
  * **`LAT / LON` и `Hz (Note)`** — текущие координаты и нота сонификации.
* **LCD-дисплей станции** — показывает название активной станции, текущее значение параметра и локацию.
* **Кнопка `27 TRACKS`** (золотая) — в 1 клик открывает вкладку **`WORLD MUSIC (27)`** со всеми 27 музыкальными треками Voyager Golden Record.
* **Кнопка `WORLD MAP [W]`** (голубая) — открывает интерактивную карту **NASA Worldview / SVS EIC Sonifier**, где можно водить курсором по планете и «слушать» карту.
* **Транспорт (`SkipBack`, `PLAY / PAUSE`, `SkipForward`)** — запускает/останавливает автоматическое сканирование точек данных или переключает точки вручную.
* **Спектроанализатор (`SPECTRA`) и ползунок громкости / `Mute`**.
* **Нижняя панель инструментов (`BottomToolbar`)**:
  * `DSP` — индикатор состояния аудиодвижка.
  * `TELEMETRY [E]` — открывает таблицу телеметрии (`DataExplorer`) по всем точкам активной станции.
  * `INVERT PITCH` — инвертирует логику высоты тона (полезно для сравнения и доступности).
  * `KEY [D]` — открывает «Ключ декодирования» (Decoding Key), объясняющий соответствие `Высота = Значение`, `Ритм = Интенсивность`, `Панорама = Долгота`.
  * `A11Y / KEYS` — настройки доступности (высокий контраст, уменьшение движения, экранный диктор и список горячих клавиш).

### Правая панель (`EARTH STATIONS.PLS`)
* **Кнопка `ARCHIVE`** (в шапке панели) — открывает полный архив Voyager Golden Record (`Greetings`, `Earth Sounds + Archive.org WAVs`, `World Music 27`, `Images 116`).
* **Баннер `VOYAGER GOLDEN RECORD`** — быстрый переход в архив Voyager.
* **`SECTION 1: VOYAGER RECORD`** — 4 станции Золотой пластинки (`Greetings`, `Earth Sounds`, `Music of Earth`, `Images of Earth`).
* **`SECTION 2: EARTH SIGNALS (2010–2026)`**:
  * **Ползунок `CRISIS TIMELINE LOG (2010–2026)`** — меняет год наблюдений и пересчитывает климатическую аномалию и звуковую экспрессию.
  * **12 научных станций NASA** (`Night Lights`, `Sea Surface Currents`, `Forest Height`, `Glacier Velocity`, `Lightning`, `Fire Locations`, `GEOS Aerosols & PM2.5`, `Carbon Dioxide CO₂`, `Atmospheric River`, `Sea Level 30Yr`, `Surface Air Temp`, `Wind & Cyclones`, `NOx & Ozone O₃`).
* **`SECTION 3: CLASSIFIED / TELEMETRY`** — дополнительные геофизические потоки (`Ocean Trenches & Seismic`, `Major River Flows`).

---

## 3. Оценка проекта глазами Team Lead и Жюри NASA

### Насколько достойно закрываем задачу Earth Jukebox?
**Оценка: высокий уровень готовности (Strong Finalist / Winning Contender).**
* **Сильные стороны:**
  1. **Настоящая, а не декоративная сонификация:** `PixelSonifier.js` + `AudioEngine.js` реально читают пиксели слоёв NASA SVS/GIBS и строят разные синтезаторные голоса под каждый физический феномен (бинарные удары для молний Chandra Binary Beats, маримба для высоты леса GEDI, ветровой фильтр для аэрозолей/ураганов, глубокий бас для CO/CO₂ и жары).
  2. **Полнота данных:** 12+ верифицированных слоёв NASA SVS с палитрами, калибровочными ключами, временной шкалой `2010–2026` и полным комплектом Voyager Golden Record (55 языков, звуки Земли + реальные Archive.org WAVs, 27 песен, 116 изображений).
  3. **Доступность (Accessibility First):** клавиатурная навигация (`Space`, `W`, `E`, `D`, стрелки), инверсия тона, высокий контраст, reduced motion, screen-reader объявления (`ScreenReaderAnnouncer`) и аудио-калибровка шкалы.
  4. **Чистый адаптивный HUD:** интерфейс собран в единую рамку с отступами для любых ноутбуков (`1280×720` — `1920×1080`) и полностью на английском языке для международного жюри.

### Чек-лист Team Lead перед сдачей и выступлением
- [ ] **Проверка звука в браузере (Chrome / Brave / Firefox):** при открытии нажать `TAP: UNLOCK AUDIO` или `PLAY` один раз, чтобы браузер активировал `AudioContext`.
- [ ] **Проверка YouTube и Archive.org в сети хакатона:** если в браузере включён строгий блокировщик (например, Brave Shields), убедиться, что внешние потоки Archive.org WAV / YouTube embed не блокируются (при этом локальный Web Audio синтезатор работает на 100% даже полностью офлайн!).
- [ ] **Проверка на разрешении проектора/ноутбука (`1280×720` и `1920×1080`):** убедиться, что 3D-сцена, `THE RECEIVER`, компактный нижний плеер и правая панель не перекрывают друг друга.
- [ ] **Сборка без ошибок:** прогнать `npm run lint && npm run build`.

### Чек-лист Жюри NASA (критерии оценки)
1. **Impact & Accessibility:** Понимает ли незрячий или неподготовленный пользователь *что именно* он слышит? → Да, через `KEY [D]` и голосовую/звуковую калибровку шкалы на карте.
2. **Scientific Accuracy:** Используются ли реальные миссии и визуализации NASA? → Да, привязка к конкретным ID **NASA SVS** (`#5313`, `#5153`, `#3912`, `#5669`, `#5196`, `#5011`, `#4960`, `#4950`, `#5533`, `#5147`, `#5148`, `#5154`) и **NASA GIBS**.
3. **Creativity & Storytelling:** Есть ли эмоциональная связь с аудиторией? → Да, контраст между «космическим слушателем» 1977 года (Voyager Golden Record) и тревогой за меняющуюся Землю (`2010–2026`).

### Перспективные доработки (Roadmap после хакатона)
1. **Экспорт MIDI / WAV сонификации** — чтобы композиторы и учёные могли скачивать звуковую дорожку выбранного региона.
2. **Live NASA GIBS Proxy / Backend Cache** — серверное кэширование спутниковых тайлов на выбранную дату без CORS-ограничений браузера.
3. **Screen Reader Audio Tour Mode** — полностью голосовой гид по всем 12 слоям NASA EIC без использования мыши.

---

## 4. Использованные научные ресурсы и источники данных

* **NASA Earth Information Center (EIC) & Scientific Visualization Studio (SVS):**
  * `SVS #5313` — Night Lights (Suomi NPP VIIRS Black Marble)
  * `SVS #5153` — Carbon Monoxide (CO) & Air Quality (GEOS-FP / Terra MOPITT)
  * `SVS #3912` / `#5425` — Sea Surface Currents & Perpetual Ocean 2 (ECCO2)
  * `SVS #5669` / `#5151` — GEOS Aerosols & PM2.5 (Dust & Smoke)
  * `SVS #5196` — DYAMOND Global Carbon Dioxide (CO₂)
  * `SVS #5011` — Lightning Events Detected from ISS (ISS-LIS)
  * `SVS #4960` / `#5149` — Atmospheric River & Precipitation (GPM IMERG)
  * `SVS #4950` — GEDI Forest Canopy Height & Biomass Lidar
  * `SVS #5533` — 30 Years of Sea Surface Height (TOPEX, Jason-3, Sentinel-6)
  * `SVS #5147` — GEOS-FP Global Surface Air Temperature
  * `SVS #5148` / `#5072` — Near-Surface Wind & Hurricane Plots
  * `SVS #5154` / `#5152` — Nitrogen Oxides (NOx) & Surface Ozone (O₃)
* **NASA GIBS (Global Imagery Browse Services):** слои спутниковой телеметрии Земли.
* **NASA Voyager Golden Record & Voyager-1:**
  * [NASA Voyager Golden Record — Sounds of Earth](https://science.nasa.gov/mission/voyager/golden-record-contents/sounds/)
  * [NASA Voyager-1 Mission Overview](https://science.nasa.gov/mission/voyager/voyager-1/)
  * [Archive.org — Voyager-1 Launch Commentary WAV](https://archive.org/details/Voyager1/Voyager-1_Launch_Commentary.wav)
  * [Archive.org — Voyager Golden Record 495-AAB (8m10s) WAV](https://archive.org/details/Voyager1/495-AAB_8min10sec.wav)

---

## 5. Технологический стек и инструменты разработки

| Категория | Инструмент / Библиотека | Версия |
| :--- | :--- | :--- |
| **Frontend Framework** | React + React DOM | `^19.3.1` |
| **Сборщик (Bundler)** | Vite + `@vitejs/plugin-react` | `^8.3.6` / `^6.1.2` |
| **3D-графика и сцена** | Three.js, `@react-three/fiber`, `@react-three/drei` | `^0.187.0` / `^9.8.2` / `^10.7.9` |
| **Звук и сонификация** | Чистый **W3C Web Audio API**, **Web Speech API**, HTML5 Audio Stream + Tone.js | Нативный API / `^15.1.22` |
| **State Management** | Zustand | `^5.1.0` |
| **Стилизация и UI** | Tailwind CSS (`@tailwindcss/vite`), Framer Motion, Lucide React | `^4.3.5` / `^14.14.0` / `^1.73.0` |
| **Контроль качества** | ESLint + `eslint-plugin-react-hooks` | `^10.14.0` |

### Быстрый запуск проекта локально
```bash
npm install
npm run dev
```

### Проверка кода и продакшн-сборка
```bash
npm run lint && npm run build
```
