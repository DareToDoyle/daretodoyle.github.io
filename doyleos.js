(() => {
  'use strict';

  const CONFIG = window.DOYLE_OS_CONFIG;
  if (!CONFIG || !Array.isArray(CONFIG.apps)) throw new Error('DoyleOS config is missing.');
  const $ = selector => document.querySelector(selector);
  const loginScreen = $('#loginScreen');
  const desktop = $('#desktop');
  const username = $('#username');
  const password = $('#password');
  const signingText = $('#signingText');
  const progressBar = $('.progress i');
  const progressTrack = $('.progress');
  const loginButton = $('.login-button');
  const iconGrid = $('#iconGrid');
  const windowArea = $('#windowArea');
  const taskButtons = $('#taskButtons');
  const startItems = $('#startItems');
  const startButton = $('#startButton');
  const startMenu = $('#startMenu');
  const cookieConsent = $('#cookieConsent');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  const timeoutIds = new Set();
  let soundContext = null;
  let soundResumePending = false;
  let animationFrame = 0;
  let introRun = 0;
  let transitioning = false;
  let zIndex = 5;
  const ICON_CELL_WIDTH = 140;
  const ICON_CELL_HEIGHT = 102;
  const ICON_STORAGE_KEY = 'doyleos-icon-grid-v1';
  const ANALYTICS_CONSENT_KEY = 'doyleos-analytics-consent-v1';
  const SETTINGS_STORAGE_KEY = 'doyleos-settings-v1';
  const SETTINGS_DEFAULTS = Object.freeze({ wallpaper: 'd2d', darkMode: false, crt: true, pixel: true, cursor: 'classic' });
  const MEDIA_PLAYER_APP = Object.freeze({
    id: 'media-player',
    label: CONFIG.mediaPlayer?.appName || 'Doyle Media Player',
    icon: 'media'
  });
  const DESKTOP_APPS = CONFIG.mediaPlayer?.enabled === true ? [...CONFIG.apps, MEDIA_PLAYER_APP] : [...CONFIG.apps];
  const iconSlots = new Map(DESKTOP_APPS.map((app, index) => [app.id, { col: 0, row: index }]));

  function readSystemSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
      return {
        wallpaper: ['d2d', 'hills', 'midnight'].includes(saved?.wallpaper) ? saved.wallpaper : SETTINGS_DEFAULTS.wallpaper,
        darkMode: typeof saved?.darkMode === 'boolean' ? saved.darkMode : SETTINGS_DEFAULTS.darkMode,
        crt: typeof saved?.crt === 'boolean' ? saved.crt : SETTINGS_DEFAULTS.crt,
        pixel: typeof saved?.pixel === 'boolean' ? saved.pixel : SETTINGS_DEFAULTS.pixel,
        cursor: ['classic', 'crosshair', 'hand'].includes(saved?.cursor) ? saved.cursor : SETTINGS_DEFAULTS.cursor,
      };
    } catch { return { ...SETTINGS_DEFAULTS }; }
  }

  let systemSettings = readSystemSettings();

  function applySystemSettings(persist = true) {
    const root = document.documentElement;
    root.classList.remove('wallpaper-d2d', 'wallpaper-hills', 'wallpaper-midnight', 'theme-light', 'theme-dark', 'effects-crt', 'effects-pixel', 'cursor-classic', 'cursor-crosshair', 'cursor-hand');
    root.classList.add(`wallpaper-${systemSettings.wallpaper}`);
    root.classList.add(systemSettings.darkMode ? 'theme-dark' : 'theme-light');
    root.classList.toggle('effects-crt', systemSettings.crt);
    root.classList.toggle('effects-pixel', systemSettings.pixel);
    root.classList.add(`cursor-${systemSettings.cursor}`);
    if (persist) {
      try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(systemSettings)); } catch { /* Preferences remain active for this page. */ }
    }
  }

  applySystemSettings(false);

  window.dataLayer = window.dataLayer || [];
  const gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag = gtag;

  function readAnalyticsConsent() {
    try { return localStorage.getItem(ANALYTICS_CONSENT_KEY); } catch { return null; }
  }

  function loadAnalytics(sendPageView = false) {
    if (!/^G-[A-Z0-9]+$/.test(CONFIG.analytics.measurementId)) return;
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
    if (sendPageView) {
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: location.href,
        page_path: `${location.pathname}${location.search}`,
      });
    }
  }

  function showAnalyticsChoices() {
    closeStartMenu();
    cookieConsent.hidden = false;
    $('#allowAnalyticsButton').focus();
  }

  function hideAnalyticsChoices() { cookieConsent.hidden = true; }

  function setAnalyticsConsent(choice) {
    try { localStorage.setItem(ANALYTICS_CONSENT_KEY, choice); } catch { /* Choice remains active for this page. */ }
    if (choice === 'granted') {
      loadAnalytics(true);
      hideAnalyticsChoices();
      return;
    }
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    hideAnalyticsChoices();
  }

  const iconMarkup = type => `<span class="retro-icon icon-${type}" aria-hidden="true"><i></i><b></b></span>`;
  function later(callback, delay) {
    const id = setTimeout(() => { timeoutIds.delete(id); callback(); }, delay);
    timeoutIds.add(id);
    return id;
  }
  function clearTimers() {
    timeoutIds.forEach(clearTimeout);
    timeoutIds.clear();
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    introRun += 1;
    transitioning = false;
  }
  function requestSoundContext() {
    if (CONFIG.login.soundEffects?.enabled === false || !AudioContextConstructor) return null;
    if (!soundContext) soundContext = new AudioContextConstructor();
    if (soundContext.state === 'suspended' && !soundResumePending) {
      soundResumePending = true;
      soundContext.resume().catch(() => {}).finally(() => { soundResumePending = false; });
    }
    return soundContext;
  }
  function runningSoundContext() {
    const context = requestSoundContext();
    return context?.state === 'running' ? context : null;
  }
  function playNoiseImpact(context, options) {
    const start = context.currentTime + (options.delay || 0);
    const frameCount = Math.max(2, Math.ceil(context.sampleRate * options.duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const samples = buffer.getChannelData(0);
    const decayFrames = Math.max(1, context.sampleRate * options.decay);
    for (let index = 0; index < frameCount; index += 1) {
      const envelope = Math.exp(-index / decayFrames);
      samples[index] = ((Math.random() * 2) - 1) * envelope;
    }
    samples[0] = 1;

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = options.filterType;
    filter.frequency.setValueAtTime(options.frequency, start);
    filter.Q.setValueAtTime(options.q || 0.8, start);
    gain.gain.setValueAtTime(options.volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(start);
    source.stop(start + options.duration);
  }
  function playKeyClick(position, character) {
    const context = runningSoundContext();
    if (!context) return;
    const volume = Math.max(0, Math.min(1, Number(CONFIG.login.soundEffects?.keyboardVolume) || 0.42));
    const variation = (position * 41 + character.charCodeAt(0) * 17) % 240;
    playNoiseImpact(context, {
      duration: 0.018,
      decay: 0.005,
      filterType: 'highpass',
      frequency: 1900 + variation,
      q: 0.7,
      volume
    });
    playNoiseImpact(context, {
      delay: 0.003,
      duration: 0.06,
      decay: 0.021,
      filterType: 'bandpass',
      frequency: 620 + (variation * 0.45),
      q: 0.7,
      volume: volume * 0.68
    });
  }
  function playMouseClick(releasing = false) {
    const context = runningSoundContext();
    if (!context) return;
    const volume = Math.max(0, Math.min(1, Number(CONFIG.login.soundEffects?.mouseVolume) || 0.52));
    playNoiseImpact(context, {
      duration: releasing ? 0.016 : 0.022,
      decay: releasing ? 0.004 : 0.006,
      filterType: 'highpass',
      frequency: releasing ? 2500 : 1750,
      q: 0.9,
      volume: volume * (releasing ? 0.58 : 1)
    });
    playNoiseImpact(context, {
      delay: releasing ? 0.002 : 0.003,
      duration: releasing ? 0.034 : 0.055,
      decay: releasing ? 0.011 : 0.02,
      filterType: 'bandpass',
      frequency: releasing ? 980 : 540,
      q: 0.8,
      volume: volume * (releasing ? 0.34 : 0.65)
    });
  }
  function playUiClick() {
    const context = requestSoundContext();
    if (!context) return;
    const play = () => {
      playMouseClick();
      setTimeout(() => playMouseClick(true), 65);
    };
    if (context.state === 'running') play();
    else context.resume().then(play).catch(() => {});
  }
  function playAppTransition(opening) {
    const context = requestSoundContext();
    if (!context) return;
    if (context.state !== 'running') {
      context.resume().then(() => playAppTransition(opening)).catch(() => {});
      return;
    }
    const volume = Math.max(0, Math.min(1, Number(CONFIG.login.soundEffects?.appVolume) || 0.18));
    const frequencies = opening ? [392, 587.33] : [587.33, 392];
    const transitionStart = context.currentTime;
    frequencies.forEach((frequency, index) => {
      const start = transitionStart + (index * 0.105);
      const end = start + 0.28;
      const tone = context.createOscillator();
      const accent = context.createOscillator();
      const toneGain = context.createGain();
      const accentGain = context.createGain();

      tone.type = 'sine';
      tone.frequency.setValueAtTime(frequency, start);
      accent.type = 'triangle';
      accent.frequency.setValueAtTime(frequency * 2, start);

      toneGain.gain.setValueAtTime(0.0001, start);
      toneGain.gain.linearRampToValueAtTime(volume * 0.5, start + 0.012);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, end);
      accentGain.gain.setValueAtTime(0.0001, start);
      accentGain.gain.linearRampToValueAtTime(volume * 0.08, start + 0.008);
      accentGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

      tone.connect(toneGain).connect(context.destination);
      accent.connect(accentGain).connect(context.destination);
      tone.start(start);
      accent.start(start);
      tone.stop(end);
      accent.stop(end);
    });
  }
  function playWelcomeChime() {
    const context = runningSoundContext();
    if (!context) return;
    const volume = Math.max(0, Math.min(1, Number(CONFIG.login.soundEffects?.welcomeVolume) || 0.22));
    const chimeStart = context.currentTime;
    const notes = [
      { frequency: 523.25, delay: 0, duration: 0.72, level: 0.42 },
      { frequency: 659.25, delay: 0.18, duration: 0.76, level: 0.38 },
      { frequency: 783.99, delay: 0.37, duration: 0.82, level: 0.36 },
      { frequency: 1046.5, delay: 0.58, duration: 0.82, level: 0.46 }
    ];
    notes.forEach(note => {
      const start = chimeStart + note.delay;
      const end = start + note.duration;
      const fundamental = context.createOscillator();
      const shimmer = context.createOscillator();
      const fundamentalGain = context.createGain();
      const shimmerGain = context.createGain();

      fundamental.type = 'sine';
      fundamental.frequency.setValueAtTime(note.frequency, start);
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(note.frequency * 2, start);

      fundamentalGain.gain.setValueAtTime(0.0001, start);
      fundamentalGain.gain.linearRampToValueAtTime(volume * note.level, start + 0.025);
      fundamentalGain.gain.exponentialRampToValueAtTime(0.0001, end);
      shimmerGain.gain.setValueAtTime(0.0001, start);
      shimmerGain.gain.linearRampToValueAtTime(volume * note.level * 0.14, start + 0.018);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + (note.duration * 0.72));

      fundamental.connect(fundamentalGain).connect(context.destination);
      shimmer.connect(shimmerGain).connect(context.destination);
      fundamental.start(start);
      shimmer.start(start);
      fundamental.stop(end);
      shimmer.stop(end);
    });
  }
  function typeValue(input, value, delay, run, done) {
    let position = 0;
    const rhythm = [1, .78, 1.16, .9, 1.28, .84];
    document.querySelectorAll('#loginForm input').forEach(field => field.classList.remove('is-typing'));
    input.classList.add('is-typing');
    input.focus({ preventScroll: true });
    const typeNext = () => {
      if (run !== introRun) return;
      input.value = value.slice(0, ++position);
      playKeyClick(position, value[position - 1]);
      if (position < value.length) {
        later(typeNext, Math.round(delay * rhythm[(position - 1) % rhythm.length]));
      } else {
        input.classList.remove('is-typing');
        done();
      }
    };
    typeNext();
  }
  function pressSignIn(run, done) {
    if (run !== introRun || transitioning) return;
    signingText.textContent = 'Signing in…';
    loginButton.classList.add('is-pressed');
    loginButton.setAttribute('aria-pressed', 'true');
    playMouseClick();
    later(() => {
      if (run !== introRun) return;
      loginButton.classList.remove('is-pressed');
      loginButton.setAttribute('aria-pressed', 'false');
      playMouseClick(true);
      playWelcomeChime();
      done();
    }, CONFIG.login.buttonPressDurationMs);
  }
  function startIntro() {
    clearTimers();
    document.documentElement.classList.add('doyleos-booting');
    loginScreen.setAttribute('aria-busy', 'true');
    loginScreen.classList.remove('reduced-loading');
    const run = introRun;
    username.value = '';
    password.value = '';
    loginButton.classList.remove('is-pressed');
    loginButton.setAttribute('aria-pressed', 'false');
    document.querySelectorAll('#loginForm input').forEach(field => field.classList.remove('is-typing'));
    progressBar.style.width = '0%';
    progressTrack.setAttribute('aria-valuenow', '0');
    signingText.textContent = 'Preparing login…';
    requestSoundContext();
    later(() => typeValue(username, CONFIG.login.userName, CONFIG.login.keyDelayMs, run, () => {
      later(() => typeValue(password, CONFIG.login.simulatedPassword, CONFIG.login.passwordDelayMs, run, () => {
        password.blur();
        later(() => pressSignIn(run, () => loadDesktop(run)), CONFIG.login.beforeLoadingDelayMs);
      }), CONFIG.login.betweenFieldsDelayMs);
    }), CONFIG.login.startDelayMs);
  }
  function loadDesktop(run = introRun) {
    if (transitioning || run !== introRun) return;
    transitioning = true;
    timeoutIds.forEach(clearTimeout);
    timeoutIds.clear();
    signingText.textContent = 'Opening DoyleOS…';
    const duration = Math.max(250, CONFIG.login.loadingDurationMs);
    const blockCount = reduceMotion.matches ? 4 : 14;
    const stepDuration = duration / blockCount;
    let completedBlocks = 0;
    const advanceProgress = () => {
      if (run !== introRun) return;
      completedBlocks += 1;
      const completedPercent = Math.round((completedBlocks / blockCount) * 100);
      progressBar.style.width = `${completedPercent}%`;
      progressTrack.setAttribute('aria-valuenow', String(completedPercent));
      if (completedBlocks < blockCount) {
        later(advanceProgress, stepDuration);
        return;
      }
      signingText.textContent = 'DoyleOS ready.';
      later(() => showDesktop(run), 280);
    };
    later(advanceProgress, stepDuration);
  }
  function showDesktop(run = introRun) {
    if (run !== introRun && !loginScreen.hidden) return;
    clearTimers();
    document.querySelectorAll('#loginForm input').forEach(field => field.classList.remove('is-typing'));
    loginScreen.hidden = true;
    loginScreen.removeAttribute('aria-busy');
    desktop.hidden = false;
    document.documentElement.classList.remove('doyleos-booting');
    layoutDesktopIcons();
    if (readAnalyticsConsent() === null) showAnalyticsChoices();
  }
  function replayIntro() {
    closeStartMenu();
    [...document.querySelectorAll('.app-window')].forEach(win => closeWindow(win, true));
    desktop.hidden = true;
    loginScreen.hidden = false;
    startIntro();
  }
  function validDestination(url) {
    if (typeof url !== 'string' || !url.trim()) return null;
    try {
      const parsed = new URL(url, location.href);
      return parsed.protocol === 'https:' || parsed.protocol === 'mailto:' ? parsed.href : null;
    } catch { return null; }
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function validArtwork(url) {
    if (typeof url !== 'string' || !url.trim()) return null;
    try {
      const parsed = new URL(url, location.href);
      return parsed.protocol === 'https:' || parsed.origin === location.origin ? parsed.href : null;
    } catch { return null; }
  }

  function mediaSongs() {
    const librarySongs = Array.isArray(CONFIG.mediaPlayer?.songs) ? CONFIG.mediaPlayer.songs : [];
    const usedIds = new Set();
    return librarySongs.map((song, index) => {
      const requestedId = typeof song?.id === 'string' && song.id.trim() ? song.id.trim() : `song-${index + 1}`;
      let id = requestedId;
      let suffix = 2;
      while (usedIds.has(id)) id = `${requestedId}-${suffix++}`;
      usedIds.add(id);
      return {
        id,
        title: typeof song?.title === 'string' && song.title.trim() ? song.title.trim() : `Untitled track ${index + 1}`,
        artist: typeof song?.artist === 'string' && song.artist.trim() ? song.artist.trim() : 'Unknown artist',
        previewId: /^\d+$/.test(String(song?.previewId || '')) ? String(song.previewId) : '',
        artwork: typeof song?.artwork === 'string' ? song.artwork.trim() : '',
        year: song?.year ? String(song.year) : '',
        note: typeof song?.note === 'string' ? song.note.trim() : ''
      };
    });
  }

  function mediaArtwork(song, compact = false) {
    const artwork = validArtwork(song?.artwork);
    const label = song ? `${song.title} artwork` : 'Music artwork';
    return artwork
      ? `<img src="${escapeHtml(artwork)}" alt="${escapeHtml(label)}" loading="lazy">`
      : `<span class="media-artwork-fallback${compact ? ' compact' : ''}" aria-hidden="true">&#9835;</span>`;
  }

  function mediaPlayerBody() {
    const songs = mediaSongs();
    const library = songs.length
      ? songs.map(song => {
        const playable = Boolean(song.previewId);
        return `<button type="button" class="media-library-track" data-media-track="${escapeHtml(song.id)}"${playable ? '' : ' disabled'} aria-label="${escapeHtml(playable ? `Play ${song.title} by ${song.artist}` : `${song.title} is unavailable`)}">
          <span class="media-track-thumb">${mediaArtwork(song, true)}</span>
          <span class="media-track-copy"><strong>${escapeHtml(song.title)}</strong><span>${escapeHtml(song.artist)}</span></span>
          <span class="media-track-state">${playable ? '&#9654;' : 'Preview unavailable'}</span>
        </button>`;
      }).join('')
      : `<div class="media-empty-library">No favourite songs yet. Add tracks in <code>config.js</code>.</div>`;
    const equaliserBars = Array.from({ length: 18 }, (_, index) => `<i style="--bar:${index}"></i>`).join('');
    const waveDots = Array.from({ length: 24 }, (_, index) => `<i style="--dot:${index}"></i>`).join('');
    return `<div class="media-player" data-media-player>
      <div class="media-menubar" aria-hidden="true"><span>File</span><span>View</span><span>Play</span><span>Help</span></div>
      <div class="media-player-layout">
        <section class="media-now-playing" aria-labelledby="mediaNowPlayingTitle">
          <div class="media-status"><span class="media-status-light"></span><span data-media-status>Starting player...</span></div>
          <div class="media-feature">
            <div class="media-record-stage">
              <div class="media-record">
                <div class="media-record-label" data-media-artwork>${mediaArtwork(null)}</div>
                <i class="media-record-spindle" aria-hidden="true"></i>
              </div>
              <i class="media-tonearm" aria-hidden="true"></i>
            </div>
            <div class="media-track-details">
              <span class="media-kicker" id="mediaNowPlayingTitle">NOW PLAYING</span>
              <h2 data-media-title>Select a song</h2>
              <p class="media-artist" data-media-artist>My favourite songs</p>
              <p class="media-year" data-media-year hidden></p>
              <p class="media-note" data-media-note hidden></p>
            </div>
          </div>
          <div class="media-visualiser" aria-label="Live visualisation of the playing audio">
            <div class="media-equaliser" aria-hidden="true">${equaliserBars}</div>
            <div class="media-wave" aria-hidden="true">${waveDots}</div>
            <span>LIVE AUDIO VISUALISER</span>
          </div>
          <div class="media-transport" aria-label="Music controls">
            <button class="media-skip-button" type="button" data-media-previous aria-label="Previous favourite song">&#9198;</button>
            <button class="media-play-button" type="button" data-media-toggle disabled><span data-media-play-icon>&#9654;</span><span data-media-play-label>Starting...</span></button>
            <button class="media-skip-button" type="button" data-media-next aria-label="Next favourite song">&#9197;</button>
          </div>
          <audio data-media-audio crossorigin="anonymous" preload="metadata"></audio>
          <div class="media-time" data-media-time aria-live="off">0:00 / 0:30</div>
          <p class="media-third-party">30-second audio previews are supplied by Deezer through SayaMusicAPI. The record and visualiser respond to the actual preview audio.</p>
        </section>
        <aside class="media-library" aria-labelledby="mediaLibraryTitle">
          <div class="media-library-heading"><span id="mediaLibraryTitle">MY FAVOURITE SONGS</span><small>${songs.length} songs</small></div>
          <div class="media-library-list">${library}</div>
        </aside>
      </div>
    </div>`;
  }

  function bindMediaPlayer(win) {
    const songs = mediaSongs();
    const playableSongs = songs.filter(song => song.previewId);
    const root = win.querySelector('[data-media-player]');
    if (!root) return;
    let selectedId = '';
    let destroyed = false;
    let aborter = null;
    let audioContext = null;
    let analyser = null;
    let sourceNode = null;
    let animationFrame = 0;
    let loadToken = 0;
    const wantsAutoplay = CONFIG.mediaPlayer?.autoplay === true;
    const audio = root.querySelector('[data-media-audio]');
    const status = root.querySelector('[data-media-status]');
    const playButton = root.querySelector('[data-media-toggle]');
    const playIcon = root.querySelector('[data-media-play-icon]');
    const playLabel = root.querySelector('[data-media-play-label]');
    const record = root.querySelector('.media-record');
    const timeLabel = root.querySelector('[data-media-time]');
    const bars = [...root.querySelectorAll('.media-equaliser i')];
    const waveDots = [...root.querySelectorAll('.media-wave i')];

    const formatTime = value => {
      const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    };

    const resetVisualiser = () => {
      bars.forEach(bar => { bar.style.transform = 'scaleY(.08)'; });
      waveDots.forEach(dot => { dot.style.transform = 'translateY(0)'; });
    };

    const drawVisualiser = () => {
      if (destroyed || audio.paused || !analyser) return;
      const frequency = new Uint8Array(analyser.frequencyBinCount);
      const waveform = new Uint8Array(analyser.fftSize);
      analyser.getByteFrequencyData(frequency);
      analyser.getByteTimeDomainData(waveform);
      bars.forEach((bar, index) => {
        const start = Math.floor(index * frequency.length / bars.length);
        const end = Math.max(start + 1, Math.floor((index + 1) * frequency.length / bars.length));
        let total = 0;
        for (let bin = start; bin < end; bin += 1) total += frequency[bin];
        bar.style.transform = `scaleY(${Math.max(.08, total / (end - start) / 255).toFixed(3)})`;
      });
      waveDots.forEach((dot, index) => {
        const sample = waveform[Math.floor(index * (waveform.length - 1) / Math.max(1, waveDots.length - 1))];
        dot.style.transform = `translateY(${((sample - 128) / 128 * 28).toFixed(1)}px)`;
      });
      animationFrame = requestAnimationFrame(drawVisualiser);
    };

    const ensureAudioGraph = async () => {
      if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new Error('Web Audio is not supported by this browser.');
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = .72;
        sourceNode = audioContext.createMediaElementSource(audio);
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      if (audioContext.state === 'suspended') await audioContext.resume();
    };

    const showPlaybackState = (playing, buffering = false) => {
      root.classList.toggle('is-playing', playing);
      root.classList.toggle('is-buffering', buffering);
      record.style.animationPlayState = playing ? 'running' : 'paused';
      playIcon.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
      playLabel.textContent = playing ? 'Pause' : 'Play';
      status.textContent = buffering ? 'Buffering...' : (playing ? 'Now playing' : 'Ready - press Play');
      cancelAnimationFrame(animationFrame);
      if (playing) animationFrame = requestAnimationFrame(drawVisualiser);
      else resetVisualiser();
    };

    const selectSong = async (song, playAfterLoad = true) => {
      if (!song) return;
      root.querySelector('[data-media-title]').textContent = song.title;
      root.querySelector('[data-media-artist]').textContent = song.artist;
      const year = root.querySelector('[data-media-year]');
      year.textContent = song.year;
      year.hidden = !song.year;
      const note = root.querySelector('[data-media-note]');
      note.textContent = song.note;
      note.hidden = !song.note;
      root.querySelector('[data-media-artwork]').innerHTML = mediaArtwork(song);
      root.querySelectorAll('[data-media-track]').forEach(button => button.classList.toggle('selected', button.dataset.mediaTrack === song.id));
      selectedId = song.id;
      aborter?.abort();
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      showPlaybackState(false, false);
      timeLabel.textContent = '0:00 / 0:30';
      if (!song.previewId) {
        status.textContent = 'Preview unavailable';
        playButton.disabled = true;
        return;
      }
      const token = ++loadToken;
      aborter = new AbortController();
      playButton.disabled = true;
      status.textContent = 'Loading preview...';
      try {
        const base = String(CONFIG.mediaPlayer?.previewApiBase || '').replace(/\/$/, '');
        const endpoint = `${base}/v1/media/stream?source=deezer&id=${encodeURIComponent(song.previewId)}`;
        const response = await fetch(endpoint, { signal: aborter.signal, referrerPolicy: 'no-referrer' });
        if (!response.ok) throw new Error(`Preview service returned ${response.status}.`);
        const payload = await response.json();
        const streamUrl = new URL(payload?.data?.streamUrl || '');
        const trustedHost = streamUrl.protocol === 'https:' && (streamUrl.hostname === 'cdnt-preview.dzcdn.net' || streamUrl.hostname.endsWith('.dzcdn.net'));
        if (!payload?.ok || !trustedHost) throw new Error('Preview service returned an invalid audio URL.');
        if (destroyed || token !== loadToken) return;
        audio.src = streamUrl.href;
        audio.load();
        playButton.disabled = false;
        status.textContent = playAfterLoad ? 'Starting preview...' : 'Ready - press Play';
        if (playAfterLoad) {
          try { await ensureAudioGraph(); await audio.play(); }
          catch { status.textContent = 'Ready - press Play'; }
        }
      } catch (error) {
        if (error.name === 'AbortError' || destroyed || token !== loadToken) return;
        status.textContent = 'Preview unavailable';
        playButton.disabled = true;
      }
    };

    root.querySelectorAll('[data-media-track]').forEach(button => button.addEventListener('click', () => {
      selectSong(songs.find(song => song.id === button.dataset.mediaTrack), true);
    }));
    const moveTrack = direction => {
      if (!playableSongs.length) return;
      const currentIndex = Math.max(0, playableSongs.findIndex(song => song.id === selectedId));
      selectSong(playableSongs[(currentIndex + direction + playableSongs.length) % playableSongs.length], true);
    };
    root.querySelector('[data-media-previous]').addEventListener('click', () => moveTrack(-1));
    root.querySelector('[data-media-next]').addEventListener('click', () => moveTrack(1));
    root.querySelectorAll('.media-skip-button').forEach(button => { button.disabled = playableSongs.length < 2; });
    playButton.addEventListener('click', () => {
      if (!audio.src) return;
      if (audio.paused) {
        status.textContent = 'Starting preview...';
        ensureAudioGraph().then(() => audio.play()).catch(() => { status.textContent = 'Playback could not start'; });
      } else audio.pause();
    });

    const favourite = playableSongs.find(song => song.id === CONFIG.mediaPlayer?.defaultTrackId) || playableSongs[0] || songs[0];
    audio.addEventListener('play', () => showPlaybackState(true, false));
    audio.addEventListener('pause', () => showPlaybackState(false, false));
    audio.addEventListener('waiting', () => showPlaybackState(false, true));
    audio.addEventListener('playing', () => showPlaybackState(true, false));
    audio.addEventListener('timeupdate', () => { timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 30)}`; });
    audio.addEventListener('ended', () => moveTrack(1));
    audio.addEventListener('error', () => {
      if (!destroyed && audio.src) { showPlaybackState(false, false); status.textContent = 'Audio preview could not be played'; }
    });
    resetVisualiser();
    selectSong(favourite, wantsAutoplay);

    win._doyleMediaCleanup = () => {
      destroyed = true;
      loadToken += 1;
      aborter?.abort();
      cancelAnimationFrame(animationFrame);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      root.classList.remove('is-playing', 'is-buffering');
      sourceNode?.disconnect();
      analyser?.disconnect();
      audioContext?.close();
      sourceNode = null;
      analyser = null;
      audioContext = null;
    };
  }

  function systemSpecsRows() {
    const platform = navigator.userAgentData?.platform || navigator.platform || 'Not exposed';
    const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB approximate` : 'Not exposed';
    const rows = [
      ['Operating system', `${CONFIG.brand.name} v${CONFIG.brand.version}`],
      ['Platform', platform],
      ['Screen', `${screen.width} × ${screen.height} pixels`],
      ['Viewport', `${innerWidth} × ${innerHeight} pixels`],
      ['Pixel ratio', `${devicePixelRatio}×`],
      ['Colour depth', `${screen.colorDepth}-bit`],
      ['CPU threads', navigator.hardwareConcurrency || 'Not exposed'],
      ['Device memory', memory],
      ['Language', navigator.language || 'Not exposed'],
      ['Connection', navigator.onLine ? 'Online' : 'Offline'],
    ];
    return rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('');
  }

  function settingsBody() {
    const checked = condition => condition ? ' checked' : '';
    return `<div class="settings-app">
      <div class="settings-tabs" role="tablist" aria-label="Settings categories">
        <button type="button" class="active" role="tab" aria-selected="true" data-settings-tab="display">Display</button>
        <button type="button" role="tab" aria-selected="false" data-settings-tab="appearance">Appearance</button>
        <button type="button" role="tab" aria-selected="false" data-settings-tab="effects">Effects</button>
        <button type="button" role="tab" aria-selected="false" data-settings-tab="mouse">Mouse</button>
        <button type="button" role="tab" aria-selected="false" data-settings-tab="system">System</button>
      </div>

      <section class="settings-panel active" role="tabpanel" data-settings-panel="display">
        <h2>Display Properties</h2>
        <p>Choose a desktop wallpaper. These backgrounds are original DoyleOS themes.</p>
        <div class="wallpaper-options">
          <label><input type="radio" name="wallpaper" value="d2d"${checked(systemSettings.wallpaper === 'd2d')}><span class="wallpaper-preview wallpaper-preview--d2d"><i></i></span><strong>D2D Teal</strong></label>
          <label><input type="radio" name="wallpaper" value="hills"${checked(systemSettings.wallpaper === 'hills')}><span class="wallpaper-preview wallpaper-preview--hills"></span><strong>Green Hills</strong></label>
          <label><input type="radio" name="wallpaper" value="midnight"${checked(systemSettings.wallpaper === 'midnight')}><span class="wallpaper-preview wallpaper-preview--midnight"></span><strong>Midnight Grid</strong></label>
        </div>
      </section>

      <section class="settings-panel" role="tabpanel" data-settings-panel="appearance" hidden>
        <h2>Appearance</h2>
        <label class="settings-check"><input type="checkbox" name="darkMode"${checked(systemSettings.darkMode)}><span><strong>Dark mode</strong><small>Use a darker colour scheme for windows, menus, and controls.</small></span></label>
      </section>

      <section class="settings-panel" role="tabpanel" data-settings-panel="effects" hidden>
        <h2>Effects</h2>
        <label class="settings-check"><input type="checkbox" name="crt"${checked(systemSettings.crt)}><span><strong>CRT scanlines and icon wobble</strong><small>Add moving scanlines and a subtle old-monitor drift to desktop icons.</small></span></label>
        <label class="settings-check"><input type="checkbox" name="pixel"${checked(systemSettings.pixel)}><span><strong>Pixel effects</strong><small>Use bitmap-style type, hard rendering, and desktop dithering.</small></span></label>
      </section>

      <section class="settings-panel" role="tabpanel" data-settings-panel="mouse" hidden>
        <h2>Mouse</h2>
        <div class="cursor-options">
          <label><input type="radio" name="cursor" value="classic"${checked(systemSettings.cursor === 'classic')}><span class="cursor-sample">↖</span><strong>Classic arrow</strong></label>
          <label><input type="radio" name="cursor" value="crosshair"${checked(systemSettings.cursor === 'crosshair')}><span class="cursor-sample">＋</span><strong>Pixel crosshair</strong></label>
          <label><input type="radio" name="cursor" value="hand"${checked(systemSettings.cursor === 'hand')}><span class="cursor-sample">☝</span><strong>Retro hand</strong></label>
        </div>
      </section>

      <section class="settings-panel" role="tabpanel" data-settings-panel="system" hidden>
        <h2>System</h2>
        <div class="system-about">${iconMarkup('computer')}<div><strong>${escapeHtml(CONFIG.brand.name)}</strong><span>${escapeHtml(CONFIG.brand.subtitle)} · Version ${escapeHtml(CONFIG.brand.version)}</span></div></div>
        <table class="system-specs"><tbody>${systemSpecsRows()}</tbody></table>
        <h3>Credits</h3>
        <p>Concept, branding, and direction by DareToDoyle. DoyleOS is an original HTML, CSS, and JavaScript experience inspired by late-1990s personal computers. D2D logo supplied by DareToDoyle.</p>
        <p class="system-local-note">Specs are calculated locally in your browser and are not sent by the Settings app.</p>
      </section>

      <div class="settings-footer"><button type="button" class="win-button" data-reset-settings>Restore defaults</button><span>Changes are saved automatically.</span></div>
    </div>`;
  }

  function bindSettingsControls(win) {
    const tabs = [...win.querySelectorAll('[data-settings-tab]')];
    const panels = [...win.querySelectorAll('[data-settings-panel]')];
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(item => { item.classList.toggle('active', item === tab); item.setAttribute('aria-selected', String(item === tab)); });
      panels.forEach(panel => { const active = panel.dataset.settingsPanel === tab.dataset.settingsTab; panel.classList.toggle('active', active); panel.hidden = !active; });
    }));
    win.querySelector('.settings-app').addEventListener('change', event => {
      const field = event.target;
      if (field.name === 'wallpaper') systemSettings.wallpaper = field.value;
      if (field.name === 'darkMode') systemSettings.darkMode = field.checked;
      if (field.name === 'crt') systemSettings.crt = field.checked;
      if (field.name === 'pixel') systemSettings.pixel = field.checked;
      if (field.name === 'cursor') systemSettings.cursor = field.value;
      applySystemSettings();
    });
    win.querySelector('[data-reset-settings]').addEventListener('click', () => {
      systemSettings = { ...SETTINGS_DEFAULTS };
      applySystemSettings();
      closeWindow(win);
      openApp('settings');
    });
  }

  function privacyBody() {
    const legal = CONFIG.legal;
    return `<div class="legal-notice">
      <h2>Privacy &amp; Cookies</h2>
      <p class="legal-updated">Last updated: ${legal.lastUpdated}</p>
      <p>This notice explains how ${legal.operatorName} handles information on this website. It does not cover external sites opened from desktop links.</p>

      <h3>What DoyleOS collects</h3>
      <p>DoyleOS does not provide accounts, accept real login credentials, or submit the animated username and password anywhere. The sign-in screen is a visual effect only. There are no contact forms or hidden profile fields in this site.</p>

      <h3>Local preferences</h3>
      <p>The desktop stores icon positions, display preferences, effects, cursor choice, and your analytics choice in your browser's local storage so they can be restored on the same device. These preferences stay in your browser and are not used by ${legal.operatorName} to identify you. You can remove them by clearing this site's browser data.</p>

      <h3>Google Analytics</h3>
      <p>This site uses Google Analytics 4 to understand visits and improve the experience. The Google tag loads with analytics storage denied. Analytics cookies and full measurement remain blocked until you choose <strong>Allow analytics</strong>; before that choice, Google may receive limited cookieless consent and measurement signals.</p>
      <p>When enabled, Google Analytics may process information such as page views, approximate location derived from IP address, browser and device details, session information, and interactions with the site. Google Analytics uses first-party identifiers such as the <code>_ga</code> cookie to distinguish visits and sessions.</p>
      <p>Advertising storage, Google Signals, and ad-personalisation features are disabled in this implementation.</p>

      <h3>Audio previews and external music links</h3>
      <p>When you open Doyle Media Player, it requests configured 30-second Deezer preview audio through the third-party SayaMusicAPI service. Cover artwork is loaded from Deezer's image service. Those providers may receive technical request data such as your IP address, browser, and device information. DoyleOS does not store your listening history, selected song, playback state, or account details.</p>

      <h3>Consent and your choices</h3>
      <p>You can allow analytics, continue with essential storage only, or change your choice at any time. Choosing essential only keeps analytics storage denied. You can also clear this site's cookies and local storage through your browser.</p>
      <button class="win-button privacy-settings-button" type="button" data-action="analytics-settings">Change analytics choice</button>
      <div class="legal-links">
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>
        <a href="https://support.google.com/analytics/answer/11593727" target="_blank" rel="noopener noreferrer">Google Analytics data collection</a>
        <a href="https://www.deezer.com/legal/personal-datas" target="_blank" rel="noopener noreferrer">Deezer Privacy Policy</a>
        <a href="https://github.com/shnwazdev/sayamusicapi" target="_blank" rel="noopener noreferrer">SayaMusicAPI source</a>
      </div>

      <h3>Changes to this notice</h3>
      <p>This notice may be updated when the site's features, advertising setup, or legal requirements change. The date above shows the latest revision.</p>
    </div>`;
  }
  function appBody(app) {
    if (app.id === 'privacy') return privacyBody();
    if (app.id === 'settings') return settingsBody();
    if (app.id === 'media-player') return mediaPlayerBody();
    const destination = validDestination(app.url);
    const cta = app.id === 'about'
      ? `<button class="win-button open-link" type="button" data-action="close-app">${app.cta}</button>`
      : destination
        ? `<a class="win-button open-link" href="${destination}" target="_blank" rel="noopener noreferrer">↗ &nbsp; ${app.cta}</a>`
        : `<span class="win-button open-link disabled" aria-disabled="true">${app.cta}: Link coming soon</span>`;
    const main = app.id === 'about'
      ? `<div class="about-layout"><img class="about-photo" src="about-photo.png" alt="Jacque taking a mirror selfie in a lift"><div><h2>${app.heading}</h2><p>${app.description}</p></div></div>`
      : `<h2>${app.heading}</h2><p>${app.description}</p>`;
    return `${main}<div class="app-divider"></div>${cta}`;
  }
  function aboutOsApp() {
    return { id: 'about-os', label: 'About DoyleOS', icon: 'computer', heading: 'DoyleOS 98', description: 'A playful personal link hub by DareToDoyle, inspired by late-1990s desktop interfaces. DoyleOS is an original website and is not affiliated with or endorsed by Microsoft.', cta: 'Website', url: null };
  }
  function privacyApp() {
    return { id: 'privacy', label: 'Privacy & Cookies', icon: 'document' };
  }
  function settingsApp() {
    return { id: 'settings', label: 'Settings', icon: 'settings' };
  }
  function getApp(id) {
    if (id === 'about-os') return aboutOsApp();
    if (id === 'privacy') return privacyApp();
    if (id === 'settings') return settingsApp();
    if (id === 'media-player' && CONFIG.mediaPlayer?.enabled === true) return MEDIA_PLAYER_APP;
    return CONFIG.apps.find(app => app.id === id);
  }
  function focusWindow(win) {
    if (!win?.isConnected) return;
    document.querySelectorAll('.app-window').forEach(item => item.classList.add('inactive'));
    win.classList.remove('inactive', 'minimized');
    win.hidden = false;
    win.style.zIndex = String(++zIndex);
    document.querySelectorAll('.task-button').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-task="${win.dataset.window}"]`)?.classList.add('active');
  }
  function initialPosition(index, preferredWidth = 650) {
    const availableWidth = windowArea.clientWidth;
    const width = Math.min(preferredWidth, Math.max(390, availableWidth - 210));
    const leftBase = Math.max(175, Math.round((availableWidth - width) / 2));
    return { left: Math.min(leftBase + (index % 4) * 24, Math.max(0, availableWidth - width)), top: 38 + (index % 5) * 25, width };
  }
  function openApp(id) {
    const app = getApp(id);
    if (!app) return;
    closeStartMenu();
    let win = document.querySelector(`[data-window="${id}"]`);
    if (win) { focusWindow(win); return; }
    const position = initialPosition(document.querySelectorAll('.app-window').length, id === 'media-player' ? 920 : 650);
    win = document.createElement('section');
    win.className = 'app-window';
    win.dataset.window = id;
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', app.label);
    Object.assign(win.style, { left: `${position.left}px`, top: `${position.top}px`, width: `${position.width}px` });
    win.innerHTML = `<div class="title-bar"><span class="window-title">${iconMarkup(app.icon)}<span>${app.label}</span></span><span class="window-controls"><button type="button" data-action="min" aria-label="Minimise ${app.label}">_</button><button type="button" data-action="max" aria-label="Maximise or restore ${app.label}">□</button><button type="button" data-action="close" aria-label="Close ${app.label}">×</button></span></div><div class="window-content">${appBody(app)}</div>`;
    windowArea.append(win);
    const task = document.createElement('button');
    task.type = 'button';
    task.className = 'win-button task-button active';
    task.dataset.task = id;
    task.innerHTML = `${iconMarkup(app.icon)}<span>${app.label}</span>`;
    task.addEventListener('click', () => win.hidden ? focusWindow(win) : (win.classList.contains('inactive') ? focusWindow(win) : minimiseWindow(win)));
    taskButtons.append(task);
    win.addEventListener('pointerdown', () => focusWindow(win));
    win.querySelector('[data-action="close"]').addEventListener('click', () => closeWindow(win));
    win.querySelector('[data-action="min"]').addEventListener('click', () => minimiseWindow(win));
    win.querySelector('[data-action="max"]').addEventListener('click', () => toggleMaximise(win));
    win.querySelector('[data-action="close-app"]')?.addEventListener('click', () => closeWindow(win));
    win.querySelector('[data-action="analytics-settings"]')?.addEventListener('click', showAnalyticsChoices);
    if (id === 'settings') bindSettingsControls(win);
    if (id === 'media-player') bindMediaPlayer(win);
    makeDraggable(win);
    focusWindow(win);
    playAppTransition(true);
  }
  function closeWindow(win, silent = false) {
    if (!win?.dataset) return;
    if (!silent) playAppTransition(false);
    if (win.dataset.window === 'media-player') {
      win._doyleMediaCleanup?.();
      win.querySelectorAll('iframe').forEach(frame => { frame.src = 'about:blank'; frame.remove(); });
    }
    document.querySelector(`[data-task="${win.dataset.window}"]`)?.remove();
    win.remove();
    const remaining = [...document.querySelectorAll('.app-window:not([hidden])')];
    if (remaining.length) focusWindow(remaining.sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex)).pop());
  }
  function minimiseWindow(win) {
    win.classList.add('minimized', 'inactive');
    win.hidden = true;
    document.querySelector(`[data-task="${win.dataset.window}"]`)?.classList.remove('active');
  }
  function toggleMaximise(win) {
    if (matchMedia('(max-width: 650px)').matches) return;
    if (win.dataset.maximized === 'true') {
      Object.assign(win.style, JSON.parse(win.dataset.restoreBounds));
      win.dataset.maximized = 'false';
    } else {
      win.dataset.restoreBounds = JSON.stringify({ left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height });
      Object.assign(win.style, { left: '4px', top: '4px', width: 'calc(100% - 8px)', height: 'calc(100% - 8px)' });
      win.dataset.maximized = 'true';
    }
    focusWindow(win);
  }
  function clampWindow(win) {
    if (matchMedia('(max-width: 650px)').matches || win.dataset.maximized === 'true') return;
    const maxLeft = Math.max(0, windowArea.clientWidth - Math.min(win.offsetWidth, windowArea.clientWidth));
    const maxTop = Math.max(0, windowArea.clientHeight - 38);
    win.style.left = `${Math.max(0, Math.min(win.offsetLeft, maxLeft))}px`;
    win.style.top = `${Math.max(0, Math.min(win.offsetTop, maxTop))}px`;
  }
  function makeDraggable(win) {
    const bar = win.querySelector('.title-bar');
    let drag = null;
    bar.addEventListener('pointerdown', event => {
      if (event.target.closest('button') || matchMedia('(max-width: 650px), (pointer: coarse)').matches || win.dataset.maximized === 'true') return;
      drag = { x: event.clientX, y: event.clientY, left: win.offsetLeft, top: win.offsetTop };
      bar.setPointerCapture(event.pointerId);
    });
    bar.addEventListener('pointermove', event => {
      if (!drag || !bar.hasPointerCapture(event.pointerId)) return;
      win.style.left = `${drag.left + event.clientX - drag.x}px`;
      win.style.top = `${drag.top + event.clientY - drag.y}px`;
      clampWindow(win);
    });
    bar.addEventListener('pointerup', () => { drag = null; });
    bar.addEventListener('pointercancel', () => { drag = null; });
  }
  function closeStartMenu() {
    startMenu.hidden = true;
    startMenu.querySelector('[data-programs-menu]')?.setAttribute('hidden', '');
    startMenu.querySelector('[data-programs-toggle]')?.setAttribute('aria-expanded', 'false');
    startButton.classList.remove('active');
    startButton.setAttribute('aria-expanded', 'false');
  }
  function toggleStartMenu() {
    const opening = startMenu.hidden;
    startMenu.hidden = !opening;
    startButton.classList.toggle('active', opening);
    startButton.setAttribute('aria-expanded', String(opening));
    if (opening) startMenu.querySelector('button')?.focus();
  }

  function restoreIconSlots() {
    try {
      const saved = JSON.parse(localStorage.getItem(ICON_STORAGE_KEY));
      DESKTOP_APPS.forEach(app => {
        const slot = saved?.[app.id];
        if (Number.isInteger(slot?.col) && slot.col >= 0 && Number.isInteger(slot?.row) && slot.row >= 0) {
          iconSlots.set(app.id, { col: slot.col, row: slot.row });
        }
      });
    } catch {
      // Storage may be unavailable; the default grid remains fully functional.
    }
  }

  function saveIconSlots() {
    try { localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(Object.fromEntries(iconSlots))); } catch { /* Optional preference only. */ }
  }

  function layoutDesktopIcons() {
    if (matchMedia('(max-width: 650px)').matches || !iconGrid.clientWidth) return;
    const maxCol = Math.max(0, Math.floor((iconGrid.clientWidth - 130) / ICON_CELL_WIDTH));
    const maxRow = Math.max(0, Math.floor((iconGrid.clientHeight - 92) / ICON_CELL_HEIGHT));
    const claimed = new Set();
    DESKTOP_APPS.forEach(app => {
      const requested = iconSlots.get(app.id) || { col: 0, row: 0 };
      let col = Math.min(requested.col, maxCol);
      let row = Math.min(requested.row, maxRow);
      let key = `${col}:${row}`;
      if (claimed.has(key)) {
        outer: for (let nextRow = 0; nextRow <= maxRow; nextRow += 1) {
          for (let nextCol = 0; nextCol <= maxCol; nextCol += 1) {
            const candidate = `${nextCol}:${nextRow}`;
            if (!claimed.has(candidate)) { col = nextCol; row = nextRow; key = candidate; break outer; }
          }
        }
      }
      claimed.add(key);
      iconSlots.set(app.id, { col, row });
      const icon = iconGrid.querySelector(`[data-app="${app.id}"]`);
      if (icon) { icon.style.left = `${col * ICON_CELL_WIDTH}px`; icon.style.top = `${row * ICON_CELL_HEIGHT}px`; }
    });
    saveIconSlots();
  }

  function enableIconDragging(icon, appId) {
    let drag = null;
    const finishDrag = (event, cancelled = false) => {
      if (!drag) return;
      if (icon.hasPointerCapture(event.pointerId)) icon.releasePointerCapture(event.pointerId);
      icon.classList.remove('dragging');
      if (!drag.moved || cancelled) { layoutDesktopIcons(); drag = null; return; }

      const maxCol = Math.max(0, Math.floor((iconGrid.clientWidth - icon.offsetWidth) / ICON_CELL_WIDTH));
      const maxRow = Math.max(0, Math.floor((iconGrid.clientHeight - icon.offsetHeight) / ICON_CELL_HEIGHT));
      const target = {
        col: Math.max(0, Math.min(maxCol, Math.round(icon.offsetLeft / ICON_CELL_WIDTH))),
        row: Math.max(0, Math.min(maxRow, Math.round(icon.offsetTop / ICON_CELL_HEIGHT))),
      };
      const occupying = [...iconSlots.entries()].find(([id, slot]) => id !== appId && slot.col === target.col && slot.row === target.row);
      if (occupying) iconSlots.set(occupying[0], drag.origin);
      iconSlots.set(appId, target);
      icon.dataset.suppressClick = 'true';
      window.setTimeout(() => { icon.dataset.suppressClick = 'false'; }, 250);
      drag = null;
      layoutDesktopIcons();
    };

    icon.addEventListener('pointerdown', event => {
      if (matchMedia('(max-width: 650px)').matches || event.button !== 0) return;
      const origin = iconSlots.get(appId) || { col: 0, row: 0 };
      drag = { pointerX: event.clientX, pointerY: event.clientY, left: icon.offsetLeft, top: icon.offsetTop, origin: { ...origin }, moved: false };
      icon.setPointerCapture(event.pointerId);
    });
    icon.addEventListener('pointermove', event => {
      if (!drag || !icon.hasPointerCapture(event.pointerId)) return;
      const deltaX = event.clientX - drag.pointerX;
      const deltaY = event.clientY - drag.pointerY;
      if (!drag.moved && Math.hypot(deltaX, deltaY) < 6) return;
      drag.moved = true;
      icon.classList.add('dragging');
      icon.style.left = `${Math.max(0, Math.min(iconGrid.clientWidth - icon.offsetWidth, drag.left + deltaX))}px`;
      icon.style.top = `${Math.max(0, Math.min(iconGrid.clientHeight - icon.offsetHeight, drag.top + deltaY))}px`;
    });
    icon.addEventListener('pointerup', event => finishDrag(event));
    icon.addEventListener('pointercancel', event => finishDrag(event, true));
  }
  function buildDesktop() {
    startButton.setAttribute('aria-expanded', 'false');
    restoreIconSlots();
    DESKTOP_APPS.forEach(app => {
      const icon = document.createElement('button');
      icon.type = 'button';
      icon.className = 'desktop-icon';
      icon.dataset.app = app.id;
      icon.innerHTML = `<span class="icon-picture">${iconMarkup(app.icon)}</span><span class="icon-name">${app.label}</span>`;
      icon.addEventListener('click', () => {
        if (icon.dataset.suppressClick === 'true') { icon.dataset.suppressClick = 'false'; return; }
        document.querySelectorAll('.desktop-icon').forEach(item => item.classList.remove('selected'));
        icon.classList.add('selected');
        openApp(app.id);
      });
      enableIconDragging(icon, app.id);
      iconGrid.append(icon);
    });
    const programs = document.createElement('div');
    programs.className = 'start-programs';
    const programItems = DESKTOP_APPS.map(app => `<button type="button" role="menuitem" data-program-app="${escapeHtml(app.id)}">${iconMarkup(app.icon)}<span>${escapeHtml(app.label)}</span></button>`).join('');
    programs.innerHTML = `<button type="button" data-programs-toggle aria-haspopup="menu" aria-expanded="false">${iconMarkup('folder')}<span>Programs</span><b aria-hidden="true">&#9654;</b></button><div class="programs-menu" role="menu" aria-label="Programs" data-programs-menu hidden>${programItems}</div>`;
    const programsToggle = programs.querySelector('[data-programs-toggle]');
    const programsMenu = programs.querySelector('[data-programs-menu]');
    programsToggle.addEventListener('click', () => {
      const opening = programsMenu.hidden;
      programsMenu.hidden = !opening;
      programsToggle.setAttribute('aria-expanded', String(opening));
      if (opening) programsMenu.querySelector('button')?.focus();
    });
    programsMenu.querySelectorAll('[data-program-app]').forEach(button => {
      button.addEventListener('click', () => openApp(button.dataset.programApp));
    });
    startItems.append(programs);
    const about = document.createElement('button');
    about.type = 'button';
    about.className = 'menu-separator';
    about.innerHTML = `${iconMarkup('computer')}<span>About DoyleOS</span>`;
    about.addEventListener('click', () => openApp('about-os'));
    startItems.append(about);
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.innerHTML = `${iconMarkup('settings')}<span>Settings</span>`;
    settings.addEventListener('click', () => openApp('settings'));
    startItems.append(settings);
    const privacy = document.createElement('button');
    privacy.type = 'button';
    privacy.innerHTML = `${iconMarkup('document')}<span>Privacy &amp; Cookies</span>`;
    privacy.addEventListener('click', () => openApp('privacy'));
    startItems.append(privacy);
  }
  function updateClock() {
    $('#clock').textContent = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
  }

  startButton.addEventListener('click', event => { event.stopPropagation(); toggleStartMenu(); });
  document.addEventListener('click', event => {
    const control = event.target.closest('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [role="button"]');
    if (control && !loginScreen.contains(control)) playUiClick();
  });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.start-menu, .start-button')) closeStartMenu(); });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '_', '0'].includes(event.key)) {
      event.preventDefault();
      return;
    }
    if (event.key !== 'Escape') return;
    if (!cookieConsent.hidden) { setAnalyticsConsent('denied'); return; }
    if (!startMenu.hidden) { closeStartMenu(); startButton.focus(); return; }
    const active = [...document.querySelectorAll('.app-window:not([hidden])')].sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex)).pop();
    if (active) closeWindow(active);
  });
  $('#logoutButton').textContent = '🔄 Restart DoyleOS';
  $('#logoutButton').addEventListener('click', replayIntro);
  $('#allowAnalyticsButton').addEventListener('click', () => setAnalyticsConsent('granted'));
  $('#declineAnalyticsButton').addEventListener('click', () => setAnalyticsConsent('denied'));
  $('#privacyDetailsButton').addEventListener('click', () => {
    hideAnalyticsChoices();
    openApp('privacy');
  });
  addEventListener('resize', () => {
    document.querySelectorAll('.app-window').forEach(clampWindow);
    layoutDesktopIcons();
  });
  addEventListener('pagehide', clearTimers);
  document.addEventListener('wheel', event => {
    if (event.ctrlKey) event.preventDefault();
  }, { passive: false });
  document.addEventListener('gesturestart', event => event.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', event => event.preventDefault(), { passive: false });
  if (readAnalyticsConsent() === 'granted') loadAnalytics();
  buildDesktop();
  layoutDesktopIcons();
  updateClock();
  setInterval(updateClock, 15000);
  startIntro();
})();
