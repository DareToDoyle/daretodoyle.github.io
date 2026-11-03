(() => {
  'use strict';

  const CONFIG = window.DOYLE_OS_CONFIG;
  if (!CONFIG || !Array.isArray(CONFIG.apps)) throw new Error('DoyleOS config is missing.');
  const $ = selector => document.querySelector(selector);
  const loginScreen = $('#loginScreen');
  const desktop = $('#desktop');
  const loginForm = $('#loginForm');
  const username = $('#username');
  const password = $('#password');
  const signingText = $('#signingText');
  const progressBar = $('.progress i');
  const iconGrid = $('#iconGrid');
  const windowArea = $('#windowArea');
  const taskButtons = $('#taskButtons');
  const startItems = $('#startItems');
  const startButton = $('#startButton');
  const startMenu = $('#startMenu');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const timeoutIds = new Set();
  let animationFrame = 0;
  let introRun = 0;
  let transitioning = false;
  let zIndex = 5;

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
  function typeValue(input, value, delay, run, done) {
    let position = 0;
    const typeNext = () => {
      if (run !== introRun) return;
      input.value = value.slice(0, ++position);
      if (position < value.length) later(typeNext, delay);
      else later(done, 110);
    };
    typeNext();
  }
  function startIntro() {
    clearTimers();
    const run = introRun;
    username.value = '';
    password.value = '';
    progressBar.style.width = '0%';
    signingText.textContent = 'Preparing login…';
    if (reduceMotion.matches) {
      username.value = CONFIG.login.userName;
      password.value = CONFIG.login.simulatedPassword;
      signingText.textContent = 'Loading desktop…';
      progressBar.style.width = '100%';
      later(() => showDesktop(run), 180);
      return;
    }
    later(() => typeValue(username, CONFIG.login.userName, CONFIG.login.keyDelayMs, run, () => {
      typeValue(password, CONFIG.login.simulatedPassword, CONFIG.login.passwordDelayMs, run, () => loadDesktop(run));
    }), CONFIG.login.startDelayMs);
  }
  function loadDesktop(run = introRun) {
    if (transitioning || run !== introRun) return;
    transitioning = true;
    timeoutIds.forEach(clearTimeout);
    timeoutIds.clear();
    signingText.textContent = 'Opening DoyleOS…';
    const started = performance.now();
    const duration = Math.max(250, CONFIG.login.loadingDurationMs);
    const step = now => {
      if (run !== introRun) return;
      const amount = Math.min(1, (now - started) / duration);
      progressBar.style.width = `${Math.round(amount * 100)}%`;
      if (amount < 1) animationFrame = requestAnimationFrame(step);
      else later(() => showDesktop(run), 100);
    };
    animationFrame = requestAnimationFrame(step);
  }
  function showDesktop(run = introRun) {
    if (run !== introRun && !loginScreen.hidden) return;
    clearTimers();
    loginScreen.hidden = true;
    desktop.hidden = false;
  }
  function replayIntro() {
    closeStartMenu();
    [...document.querySelectorAll('.app-window')].forEach(closeWindow);
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
  function appBody(app) {
    const destination = validDestination(app.url);
    const cta = destination
      ? `<a class="win-button open-link" href="${destination}" target="_blank" rel="noopener noreferrer">↗ &nbsp; ${app.cta}</a>`
      : `<span class="win-button open-link disabled" aria-disabled="true">${app.cta}: Link coming soon</span>`;
    const main = app.id === 'about'
      ? `<div class="about-layout"><div class="pixel-avatar" aria-label="Original pixel-style avatar"><i></i></div><div><h2>${app.heading}</h2><p>${app.description}</p></div></div>`
      : `<h2>${app.heading}</h2><p>${app.description}</p>`;
    return `${main}<div class="app-divider"></div>${cta}`;
  }
  function aboutOsApp() {
    return { id: 'about-os', label: 'About DoyleOS', icon: 'computer', heading: 'DoyleOS 98', description: 'A playful personal link hub by Dare to Doyle, inspired by late-1990s desktop interfaces. DoyleOS is an original website and is not affiliated with or endorsed by Microsoft.', cta: 'Website', url: null };
  }
  function getApp(id) { return id === 'about-os' ? aboutOsApp() : CONFIG.apps.find(app => app.id === id); }
  function focusWindow(win) {
    if (!win?.isConnected) return;
    document.querySelectorAll('.app-window').forEach(item => item.classList.add('inactive'));
    win.classList.remove('inactive', 'minimized');
    win.hidden = false;
    win.style.zIndex = String(++zIndex);
    document.querySelectorAll('.task-button').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-task="${win.dataset.window}"]`)?.classList.add('active');
  }
  function initialPosition(index) {
    const availableWidth = windowArea.clientWidth;
    const width = Math.min(650, Math.max(390, availableWidth - 210));
    const leftBase = Math.max(175, Math.round((availableWidth - width) / 2));
    return { left: Math.min(leftBase + (index % 4) * 24, Math.max(0, availableWidth - width)), top: 38 + (index % 5) * 25, width };
  }
  function openApp(id) {
    const app = getApp(id);
    if (!app) return;
    closeStartMenu();
    let win = document.querySelector(`[data-window="${id}"]`);
    if (win) { focusWindow(win); return; }
    const position = initialPosition(document.querySelectorAll('.app-window').length);
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
    makeDraggable(win);
    focusWindow(win);
  }
  function closeWindow(win) {
    if (!win?.dataset) return;
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
  function buildDesktop() {
    startButton.setAttribute('aria-expanded', 'false');
    CONFIG.apps.forEach(app => {
      const icon = document.createElement('button');
      icon.type = 'button';
      icon.className = 'desktop-icon';
      icon.dataset.app = app.id;
      icon.innerHTML = `<span class="icon-picture">${iconMarkup(app.icon)}</span><span class="icon-name">${app.label}</span>`;
      icon.addEventListener('click', () => {
        document.querySelectorAll('.desktop-icon').forEach(item => item.classList.remove('selected'));
        icon.classList.add('selected');
        openApp(app.id);
      });
      iconGrid.append(icon);
      const item = document.createElement('button');
      item.type = 'button';
      item.innerHTML = `${iconMarkup(app.icon)}<span>${app.label}</span>`;
      item.addEventListener('click', () => openApp(app.id));
      startItems.append(item);
    });
    const about = document.createElement('button');
    about.type = 'button';
    about.className = 'menu-separator';
    about.innerHTML = `${iconMarkup('computer')}<span>About DoyleOS</span>`;
    about.addEventListener('click', () => openApp('about-os'));
    startItems.append(about);
  }
  function updateClock() {
    $('#clock').textContent = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
  }

  loginForm.addEventListener('submit', event => { event.preventDefault(); loadDesktop(); });
  $('#skipButton').addEventListener('click', () => showDesktop(introRun));
  startButton.addEventListener('click', event => { event.stopPropagation(); toggleStartMenu(); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.start-menu, .start-button')) closeStartMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!startMenu.hidden) { closeStartMenu(); startButton.focus(); return; }
    const active = [...document.querySelectorAll('.app-window:not([hidden])')].sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex)).pop();
    if (active) closeWindow(active);
  });
  $('#logoutButton').textContent = '🔄 Restart DoyleOS';
  $('#logoutButton').addEventListener('click', replayIntro);
  addEventListener('resize', () => document.querySelectorAll('.app-window').forEach(clampWindow));
  addEventListener('pagehide', clearTimers);
  buildDesktop();
  updateClock();
  setInterval(updateClock, 15000);
  startIntro();
})();
