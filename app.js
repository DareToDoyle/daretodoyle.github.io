const APPS = [
  {
    id: 'about', name: 'About Me.txt', icon: '📄', titleIcon: '📄',
    content: `<div class="about-layout"><div class="portrait" aria-label="Pixel-style portrait">🧔🏻</div><div><h2>Hi, I’m Jacque.</h2><p>Welcome to DoyleOS — my personal corner of the web. Explore my work, interests, social profiles, and projects through a playful desktop inspired by the computers I grew up with.</p></div></div><div class="interest-row"><span>💻 Tech</span><span>🏋️ Fitness</span><span>⚽ Football</span><span>🎮 Gaming</span></div><a class="win-button open-link" href="#projects" data-open="projects">↗ &nbsp; Open Profile</a>`
  },
  {
    id: 'linkedin', name: 'LinkedIn.exe', icon: '💼', titleIcon: 'in',
    content: `<h2>LinkedIn.exe</h2><p>Connect with me professionally, see my experience, and follow what I’m building.</p><a class="win-button open-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer">↗ &nbsp; Open LinkedIn</a>`
  },
  {
    id: 'instagram', name: 'Instagram.exe', icon: '📸', titleIcon: '📸',
    content: `<h2>Instagram.exe</h2><p>A look at life outside the desktop: training, football, travel, and everything in between.</p><a class="win-button open-link" href="https://www.instagram.com" target="_blank" rel="noreferrer">↗ &nbsp; Open Instagram</a>`
  },
  {
    id: 'projects', name: 'Projects', icon: '📁', titleIcon: '📁',
    content: `<h2>Projects</h2><p>A selection of things I’ve designed, built, and shipped.</p><div class="project-list"><article class="project-card"><h3>DoyleOS</h3><p>This interactive portfolio — a nostalgic operating system reimagined for the modern web.</p></article><article class="project-card"><h3>More projects loading…</h3><p>New work will appear here soon.</p></article></div>`
  },
  {
    id: 'fitness', name: 'Fitness Tracker', icon: '🏋️', titleIcon: '🏋️',
    content: `<h2>Fitness Tracker</h2><p>Consistency beats intensity. This area tracks current training goals and personal milestones.</p><div class="project-card"><h3>Current status</h3><p>Program: Strength & conditioning<br>Goal: Get a little better every session<br>Status: In progress…</p></div>`
  },
  {
    id: 'contact', name: 'Contact.exe', icon: '✉️', titleIcon: '✉️',
    content: `<h2>Contact.exe</h2><p>Want to work together, talk about a project, or just say hello?</p><ul class="contact-list"><li>✉️ <a href="mailto:hello@daretodoyle.com">hello@daretodoyle.com</a></li><li>🌐 <a href="https://daretodoyle.com" target="_blank" rel="noreferrer">daretodoyle.com</a></li></ul><a class="win-button open-link" href="mailto:hello@daretodoyle.com">✉ &nbsp; Send a Message</a>`
  }
];

const loginScreen = document.querySelector('#loginScreen');
const desktop = document.querySelector('#desktop');
const loginForm = document.querySelector('#loginForm');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const signingText = document.querySelector('#signingText');
const progressBar = document.querySelector('.progress i');
const iconGrid = document.querySelector('#iconGrid');
const windowArea = document.querySelector('#windowArea');
const taskButtons = document.querySelector('#taskButtons');
const startItems = document.querySelector('#startItems');
const startButton = document.querySelector('#startButton');
const startMenu = document.querySelector('#startMenu');
let zIndex = 5;
let loginTimers = [];

function typeInto(input, text, delay, done) {
  let index = 0;
  const tick = () => {
    input.value = text.slice(0, ++index);
    input.dispatchEvent(new Event('input'));
    if (index < text.length) loginTimers.push(setTimeout(tick, delay));
    else if (done) loginTimers.push(setTimeout(done, 240));
  };
  tick();
}

function beginIntro() {
  loginTimers.push(setTimeout(() => typeInto(username, 'Jacque', 105, () => {
    typeInto(password, 'doyleos1', 90, () => startLogin());
  }), 500));
}

function clearLoginTimers() { loginTimers.forEach(clearTimeout); loginTimers = []; }

function startLogin() {
  clearLoginTimers();
  signingText.textContent = 'Signing in…';
  let progress = 0;
  const timer = setInterval(() => {
    progress += 12.5;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(showDesktop, 280);
    }
  }, 95);
}

function showDesktop() {
  clearLoginTimers();
  loginScreen.hidden = true;
  desktop.hidden = false;
  if (!document.querySelector('[data-window="about"]')) openApp('about');
}

function focusWindow(win) {
  document.querySelectorAll('.app-window').forEach(el => el.classList.add('inactive'));
  win.classList.remove('inactive', 'minimized');
  win.style.display = '';
  win.style.zIndex = ++zIndex;
  document.querySelectorAll('.task-button').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-task="${win.dataset.window}"]`)?.classList.add('active');
}

function openApp(id) {
  const app = APPS.find(item => item.id === id);
  if (!app) return;
  let win = document.querySelector(`[data-window="${id}"]`);
  if (win) { focusWindow(win); return; }
  win = document.createElement('section');
  win.className = 'app-window';
  win.dataset.window = id;
  const offset = document.querySelectorAll('.app-window').length * 25;
  win.style.left = `clamp(175px, calc(50% - 260px + ${offset}px), calc(100% - 680px))`;
  win.style.top = `${70 + offset}px`;
  win.innerHTML = `<div class="title-bar"><span class="window-title"><span>${app.titleIcon}</span> ${app.name}</span><span class="window-controls"><button type="button" data-action="min" aria-label="Minimize">_</button><button type="button" data-action="max" aria-label="Maximize">□</button><button type="button" data-action="close" aria-label="Close">×</button></span></div><div class="window-content">${app.content}</div>`;
  windowArea.append(win);
  const task = document.createElement('button');
  task.className = 'win-button task-button active';
  task.dataset.task = id;
  task.innerHTML = `${app.titleIcon} &nbsp; ${app.name}`;
  task.addEventListener('click', () => {
    if (win.classList.contains('minimized')) focusWindow(win);
    else if (!win.classList.contains('inactive')) minimizeWindow(win);
    else focusWindow(win);
  });
  taskButtons.append(task);
  win.addEventListener('pointerdown', () => focusWindow(win));
  win.querySelector('[data-action="close"]').addEventListener('click', () => closeWindow(win));
  win.querySelector('[data-action="min"]').addEventListener('click', () => minimizeWindow(win));
  win.querySelector('[data-action="max"]').addEventListener('click', () => toggleMaximize(win));
  win.querySelectorAll('[data-open]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); openApp(link.dataset.open); }));
  makeDraggable(win);
  focusWindow(win);
}

function closeWindow(win) {
  document.querySelector(`[data-task="${win.dataset.window}"]`)?.remove();
  win.remove();
  const last = [...document.querySelectorAll('.app-window')].pop();
  if (last) focusWindow(last);
}

function minimizeWindow(win) {
  win.classList.add('minimized', 'inactive');
  win.style.display = 'none';
  document.querySelector(`[data-task="${win.dataset.window}"]`)?.classList.remove('active');
}

function toggleMaximize(win) {
  if (win.dataset.maximized === 'true') {
    win.style.cssText = win.dataset.restoreStyle || '';
    win.dataset.maximized = 'false';
  } else {
    win.dataset.restoreStyle = win.getAttribute('style') || '';
    win.style.inset = '5px'; win.style.width = 'auto'; win.style.height = 'auto';
    win.dataset.maximized = 'true';
  }
  focusWindow(win);
}

function makeDraggable(win) {
  const bar = win.querySelector('.title-bar');
  let startX, startY, startLeft, startTop;
  bar.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || innerWidth <= 650 || win.dataset.maximized === 'true') return;
    startX = event.clientX; startY = event.clientY;
    startLeft = win.offsetLeft; startTop = win.offsetTop;
    bar.setPointerCapture(event.pointerId);
  });
  bar.addEventListener('pointermove', event => {
    if (!bar.hasPointerCapture(event.pointerId)) return;
    win.style.left = `${Math.max(0, Math.min(startLeft + event.clientX - startX, windowArea.clientWidth - win.offsetWidth))}px`;
    win.style.top = `${Math.max(0, Math.min(startTop + event.clientY - startY, windowArea.clientHeight - 40))}px`;
  });
}

function buildDesktop() {
  APPS.forEach(app => {
    const icon = document.createElement('button');
    icon.type = 'button'; icon.className = 'desktop-icon'; icon.dataset.app = app.id;
    icon.innerHTML = `<span class="icon-picture" aria-hidden="true">${app.icon}</span><span class="icon-name">${app.name}</span>`;
    icon.addEventListener('click', () => {
      document.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
      icon.classList.add('selected');
      if (innerWidth <= 650 || matchMedia('(pointer: coarse)').matches) openApp(app.id);
    });
    icon.addEventListener('dblclick', () => openApp(app.id));
    icon.addEventListener('keydown', event => { if (event.key === 'Enter') openApp(app.id); });
    iconGrid.append(icon);
    const item = document.createElement('button');
    item.type = 'button'; item.innerHTML = `${app.icon} &nbsp; ${app.name}`;
    item.addEventListener('click', () => { openApp(app.id); startMenu.hidden = true; startButton.classList.remove('active'); });
    startItems.append(item);
  });
}

function updateClock() {
  document.querySelector('#clock').textContent = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

loginForm.addEventListener('submit', event => { event.preventDefault(); startLogin(); });
document.querySelector('#skipButton').addEventListener('click', showDesktop);
startButton.addEventListener('click', event => { event.stopPropagation(); startMenu.hidden = !startMenu.hidden; startButton.classList.toggle('active', !startMenu.hidden); });
document.addEventListener('click', event => { if (!event.target.closest('.start-menu') && !event.target.closest('.start-button')) { startMenu.hidden = true; startButton.classList.remove('active'); } });
document.querySelector('#logoutButton').addEventListener('click', () => { desktop.hidden = true; loginScreen.hidden = false; username.value = ''; password.value = ''; progressBar.style.width = '0'; signingText.textContent = 'Ready.'; startMenu.hidden = true; beginIntro(); });

buildDesktop();
updateClock();
setInterval(updateClock, 15000);
beginIntro();
