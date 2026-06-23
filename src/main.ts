import './style.css';

// ══════════════════════════════════════════════════════════════════════
//  CANVAS-BASED CONFETTI ENGINE (no DOM per-particle = zero lag)
// ══════════════════════════════════════════════════════════════════════

interface TacoColors {
  shell: string;
  meat: string;
  lettuce: string;
  tomato: string;
}

const SHELL_COLORS = ['#F5B041', '#E6A32E', '#D4941F', '#F0C050'];
const MEAT_COLORS = ['#A0522D', '#8B4513', '#7B3F00'];
const LETTUCE_COLORS = ['#4CAF50', '#66BB6A', '#43A047'];
const TOMATO_COLORS = ['#E53935', '#EF5350', '#D32F2F'];

function randomColors(): TacoColors {
  return {
    shell: SHELL_COLORS[Math.floor(Math.random() * SHELL_COLORS.length)],
    meat: MEAT_COLORS[Math.floor(Math.random() * MEAT_COLORS.length)],
    lettuce: LETTUCE_COLORS[Math.floor(Math.random() * LETTUCE_COLORS.length)],
    tomato: TOMATO_COLORS[Math.floor(Math.random() * TOMATO_COLORS.length)],
  };
}

// Pre-render taco sprites to offscreen canvases
const SPRITE_BASE = 96;
const SPRITE_COUNT = 16;
const sprites: HTMLCanvasElement[] = [];

function drawTacoToCanvas(target: HTMLCanvasElement, colors: TacoColors) {
  const ctx = target.getContext('2d')!;
  const s = SPRITE_BASE / 32;

  ctx.clearRect(0, 0, SPRITE_BASE, SPRITE_BASE);
  ctx.save();
  ctx.scale(s, s);

  // Shell fill
  ctx.beginPath();
  ctx.moveTo(4, 22);
  ctx.quadraticCurveTo(6, 10, 16, 10);
  ctx.quadraticCurveTo(26, 10, 28, 22);
  ctx.closePath();
  ctx.fillStyle = colors.shell;
  ctx.globalAlpha = 0.3;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.shell;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Meat
  ctx.beginPath();
  ctx.moveTo(6, 20);
  ctx.quadraticCurveTo(11, 13, 16, 13);
  ctx.quadraticCurveTo(21, 13, 26, 20);
  ctx.closePath();
  ctx.fillStyle = colors.meat;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Lettuce
  ctx.beginPath();
  ctx.moveTo(7, 18);
  ctx.quadraticCurveTo(11, 15, 16, 15);
  ctx.quadraticCurveTo(21, 15, 25, 18);
  ctx.closePath();
  ctx.fillStyle = colors.lettuce;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Tomatoes
  ctx.fillStyle = colors.tomato;
  ctx.beginPath();
  ctx.arc(11, 17, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(17, 16, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 17.5, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Shell outline
  ctx.beginPath();
  ctx.moveTo(5, 21);
  ctx.quadraticCurveTo(7, 11, 16, 11);
  ctx.quadraticCurveTo(25, 11, 27, 21);
  ctx.strokeStyle = colors.shell;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.restore();
}

function initSprites() {
  for (let i = 0; i < SPRITE_COUNT; i++) {
    const c = document.createElement('canvas');
    c.width = SPRITE_BASE;
    c.height = SPRITE_BASE;
    drawTacoToCanvas(c, randomColors());
    sprites.push(c);
  }
}

// ── Canvas setup ─────────────────────────────────────────────────────
const canvas = document.createElement('canvas');
canvas.id = 'confetti-canvas';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ── Particle data (plain arrays, no DOM) ─────────────────────────────
const MAX_PARTICLES = 500;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  spriteIdx: number;
  life: number;
  maxLife: number;
}

let particles: Particle[] = [];
let animating = false;

function spawnTacoConfetti(originX: number, originY: number): number {
  const count = 8 + Math.floor(Math.random() * 53);

  for (let i = 0; i < count; i++) {
    const size = 8 + Math.floor(Math.random() * 65);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
    const speedMul = 1 - (size - 8) / 130;
    const speed = (5 + Math.random() * 12) * (0.5 + speedMul * 0.8);

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      size,
      spriteIdx: Math.floor(Math.random() * SPRITE_COUNT),
      life: 0,
      maxLife: 60 + Math.floor(Math.random() * 50),
    });
  }

  // Cull oldest if over cap
  while (particles.length > MAX_PARTICLES) {
    particles.shift();
  }

  if (!animating) {
    animating = true;
    requestAnimationFrame(tick);
  }

  return count;
}

function tick() {
  const gravity = 0.22;
  const drag = 0.985;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life++;

    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
      continue;
    }

    p.vy += gravity;
    p.vx *= drag;
    p.vy *= drag;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;

    // Skip if off-screen
    if (p.x < -p.size || p.x > w + p.size || p.y > h + p.size) {
      particles.splice(i, 1);
      continue;
    }

    const progress = p.life / p.maxLife;
    const alpha = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    const half = p.size / 2;
    ctx.drawImage(sprites[p.spriteIdx], -half, -half, p.size, p.size);
    ctx.restore();
  }

  if (particles.length > 0) {
    requestAnimationFrame(tick);
  } else {
    animating = false;
  }
}

// ══════════════════════════════════════════════════════════════════════
//  LEADERBOARD API
// ══════════════════════════════════════════════════════════════════════

interface LeaderboardEntry {
  name: string;
  score: number;
  clicks: number;
  date: string;
}

let cachedLeaderboard: LeaderboardEntry[] = [];
let leaderboardLoading = true;

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard');
    if (res.ok) {
      cachedLeaderboard = await res.json();
      return cachedLeaderboard;
    }
  } catch { /* fallback */ }
  return cachedLeaderboard;
}

async function postScore(name: string, score: number, clicks: number): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, clicks }),
    });
    if (res.ok) {
      cachedLeaderboard = await res.json();
      return cachedLeaderboard;
    }
  } catch { /* fallback */ }
  return cachedLeaderboard;
}

// ══════════════════════════════════════════════════════════════════════
//  GAME STATE
// ══════════════════════════════════════════════════════════════════════

const GAME_DURATION = 30;

let gameState: 'idle' | 'playing' | 'ended' = 'idle';
let totalTacos = 0;
let totalClicks = 0;
let timeLeft = GAME_DURATION;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let lastEntryName = '';
let lastEntryScore = -1;

// ══════════════════════════════════════════════════════════════════════
//  SVG ICONS (inline, for the button and modal only)
// ══════════════════════════════════════════════════════════════════════

const tacoIcon = `<svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 22C4 22 6 10 16 10C26 10 28 22 28 22" stroke="#F5B041" stroke-width="2.5" stroke-linecap="round" fill="#F5B041" fill-opacity="0.2"/>
  <path d="M6 20C8 16 12 13 16 13C20 13 24 16 26 20" fill="#A0522D" opacity="0.8"/>
  <path d="M7 18C7 18 10 15 16 15C22 15 25 18 25 18" fill="#4CAF50" opacity="0.8"/>
  <circle cx="11" cy="17" r="1.5" fill="#E53935"/>
  <circle cx="17" cy="16" r="1.2" fill="#E53935"/>
  <circle cx="22" cy="17.5" r="1.3" fill="#E53935"/>
  <path d="M5 21C5 21 7 11 16 11C25 11 27 21 27 21" stroke="#F5B041" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`;

const trophyIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 8H32V20C32 24.4183 28.4183 28 24 28C19.5817 28 16 24.4183 16 20V8Z" fill="#F5B041" fill-opacity="0.2" stroke="#F5B041" stroke-width="2"/>
  <path d="M16 12H10C10 12 9 12 9 14C9 18 12 20 16 20" stroke="#F5B041" stroke-width="2" stroke-linecap="round"/>
  <path d="M32 12H38C38 12 39 12 39 14C39 18 36 20 32 20" stroke="#F5B041" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 28V32H28V28" stroke="#F5B041" stroke-width="2"/>
  <path d="M18 32H30V34C30 35.1046 29.1046 36 28 36H20C18.8954 36 18 35.1046 18 34V32Z" fill="#F5B041" fill-opacity="0.3" stroke="#F5B041" stroke-width="2"/>
  <path d="M24 20V16M21 18L24 16L27 18" stroke="#F5B041" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// ══════════════════════════════════════════════════════════════════════
//  DOM / RENDER
// ══════════════════════════════════════════════════════════════════════

const app = document.getElementById('app')!;

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderLeaderboardRows(entries: LeaderboardEntry[]): string {
  if (leaderboardLoading && entries.length === 0) {
    return `<div class="leaderboard-loading">${Array.from({ length: 6 }, () => '<div class="skeleton-row"></div>').join('')}</div>`;
  }
  if (entries.length === 0) {
    return '<p class="leaderboard-empty">No scores yet. Be the first!</p>';
  }

  return `<ul class="leaderboard-list">${entries.map((e, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const isHighlight = e.score === lastEntryScore && e.name === lastEntryName;
    const youTag = isHighlight ? `<span class="lb-you">you</span>` : '';
    return `
      <li class="leaderboard-row${isHighlight ? ' highlight' : ''}">
        <span class="lb-rank ${rankClass}">${i + 1}</span>
        <span class="lb-name">${escapeHtml(e.name)}${youTag}</span>
        <span class="lb-clicks">${e.clicks} clicks</span>
        <span class="lb-score">${e.score.toLocaleString()}</span>
      </li>
    `;
  }).join('')}</ul>`;
}

function render() {
  const entries = cachedLeaderboard;

  app.innerHTML = `
    <div class="hero">
      <h1 class="title">Taco Frenzy</h1>
      <p class="subtitle">Smash the button for 30 seconds. Launch as many tacos as you can. Compete for the top spot.</p>

      <div class="timer-container${gameState === 'playing' ? ' visible' : ''}" id="timer-container">
        <div class="timer-label">
          <span>Time remaining</span>
          <span class="timer-value" id="timer-value">${timeLeft.toFixed(1)}s</span>
        </div>
        <div class="timer-track">
          <div class="timer-fill" id="timer-fill" style="width: ${(timeLeft / GAME_DURATION) * 100}%"></div>
        </div>
      </div>

      <button class="hello-btn" id="taco-btn" aria-label="Press for taco confetti"${gameState === 'ended' ? ' disabled' : ''}>
        ${tacoIcon}
        <span>${gameState === 'idle' ? 'Start Clicking' : gameState === 'playing' ? 'Keep Going!' : "Time's Up"}</span>
      </button>

      <div class="stats-row${totalTacos > 0 ? ' visible' : ''}" id="stats-row">
        <div class="stat-item">
          <span class="stat-value" id="stat-tacos">${totalTacos.toLocaleString()}</span>
          <span class="stat-label">Tacos</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" id="stat-clicks">${totalClicks}</span>
          <span class="stat-label">Clicks</span>
        </div>
      </div>

      <button class="play-again-btn${gameState === 'ended' ? ' visible' : ''}" id="play-again">Play Again</button>
    </div>

    <div class="leaderboard" id="leaderboard">
      <div class="leaderboard-header">
        <span class="leaderboard-title"><span class="live-dot"></span> Global Leaderboard</span>
        <span class="leaderboard-subtitle">Top 50 all-time</span>
      </div>
      <div id="leaderboard-body">
        ${renderLeaderboardRows(entries)}
      </div>
    </div>

    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-icon">${trophyIcon}</div>
        <h2 class="modal-heading">Time's up!</h2>
        <p class="modal-score" id="modal-score">${totalTacos.toLocaleString()}</p>
        <p class="modal-score-label">tacos launched in 30 seconds</p>
        <div class="modal-input-group">
          <input class="modal-input" id="name-input" type="text" placeholder="Your name" maxlength="24" autocomplete="off" />
          <button class="modal-submit" id="modal-submit">Save</button>
        </div>
        <button class="modal-skip" id="modal-skip">Skip</button>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const btn = document.getElementById('taco-btn') as HTMLButtonElement;
  const playAgain = document.getElementById('play-again') as HTMLButtonElement;
  const nameInput = document.getElementById('name-input') as HTMLInputElement;
  const modalSubmit = document.getElementById('modal-submit') as HTMLButtonElement;
  const modalSkip = document.getElementById('modal-skip') as HTMLButtonElement;

  btn.addEventListener('click', handleClick);
  playAgain.addEventListener('click', resetGame);
  modalSubmit.addEventListener('click', () => submitScore(nameInput.value.trim()));
  modalSkip.addEventListener('click', () => closeModal());

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitScore(nameInput.value.trim());
    }
  });
}

function handleClick() {
  if (gameState === 'ended') return;

  if (gameState === 'idle') {
    gameState = 'playing';
    startTimer();
    const timerContainer = document.getElementById('timer-container');
    timerContainer?.classList.add('visible');
    const btn = document.getElementById('taco-btn');
    if (btn) btn.querySelector('span')!.textContent = 'Keep Going!';
  }

  const btn = document.getElementById('taco-btn')!;
  const rect = btn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const launched = spawnTacoConfetti(centerX, centerY);
  totalTacos += launched;
  totalClicks++;

  // In-place update (no full re-render)
  const statTacos = document.getElementById('stat-tacos');
  const statClicks = document.getElementById('stat-clicks');
  const statsRow = document.getElementById('stats-row');

  if (statTacos) statTacos.textContent = totalTacos.toLocaleString();
  if (statClicks) statClicks.textContent = String(totalClicks);
  if (statsRow) statsRow.classList.add('visible');
}

function startTimer() {
  timeLeft = GAME_DURATION;
  const startTime = Date.now();

  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    timeLeft = Math.max(0, GAME_DURATION - elapsed);

    const timerValue = document.getElementById('timer-value');
    const timerFill = document.getElementById('timer-fill');
    const pct = (timeLeft / GAME_DURATION) * 100;

    if (timerValue) {
      timerValue.textContent = `${timeLeft.toFixed(1)}s`;
      timerValue.className = 'timer-value' + (timeLeft <= 5 ? ' critical' : timeLeft <= 10 ? ' urgent' : '');
    }
    if (timerFill) {
      timerFill.style.width = `${pct}%`;
      timerFill.className = 'timer-fill' + (timeLeft <= 5 ? ' critical' : timeLeft <= 10 ? ' urgent' : '');
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 50);
}

function endGame() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  gameState = 'ended';

  const btn = document.getElementById('taco-btn') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.querySelector('span')!.textContent = "Time's Up";
  }

  const playAgain = document.getElementById('play-again');
  if (playAgain) playAgain.classList.add('visible');

  const modalScore = document.getElementById('modal-score');
  if (modalScore) modalScore.textContent = totalTacos.toLocaleString();

  setTimeout(() => {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
      modal.classList.add('open');
      const input = document.getElementById('name-input') as HTMLInputElement;
      if (input) input.focus();
    }
  }, 600);
}

async function submitScore(name: string) {
  if (!name) name = 'Anonymous';
  lastEntryScore = totalTacos;
  lastEntryName = name;

  // Post to server
  await postScore(name, totalTacos, totalClicks);

  closeModal();
  render();
}

function closeModal() {
  const modal = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('open');
}

function resetGame() {
  gameState = 'idle';
  totalTacos = 0;
  totalClicks = 0;
  timeLeft = GAME_DURATION;
  lastEntryScore = -1;
  lastEntryName = '';

  particles = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  render();
}

// ══════════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════════

initSprites();
render();

// Load leaderboard from server
fetchLeaderboard().then(() => {
  leaderboardLoading = false;
  const body = document.getElementById('leaderboard-body');
  if (body) {
    body.innerHTML = renderLeaderboardRows(cachedLeaderboard);
  }
});
