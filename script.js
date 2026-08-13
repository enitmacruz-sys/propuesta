/* ============================================
   ROMÁNTICA — script.js
   Vanilla JavaScript puro, sin dependencias
   ============================================ */

'use strict';

/* ---- MENSAJES ROMÁNTICOS con emoji al inicio ---- */
const LOVE_MESSAGES = [
  '❤️ Te amo',        '💖 Mi amor',       '🌙 Mi cielo',      '💕 Mi vida',
  '🌎 Mi mundo',      '✨ Siempre tú',     '💗 Eres todo',     '🥰 Mi favorit@',
  '❤️ Te quiero',     '✨ Contigo',        '🌸 Mi felicidad',  '😊 Mi sonrisa',
  '💎 Eres especial', '☀️ Mi sol',         '🌌 Mi universo',   '💕 Amor eterno',
  '❤️ Siempre juntos','💖 Tú y yo',        '💓 Mi corazón',    '🦋 Nunca cambies',
  '💫 Eres mi todo',  '🌟 Mi sueño',       '💍 Para siempre',  '😍 Me haces feliz',
  '💎 Mi tesoro',     '🌈 Sin ti no hay',  '💓 Mi latido',     '🌺 Eres todo',
  '🌹 La razón',      '♾️ Mil veces tú',   '🕊️ Mi calma',      '🔥 Pasión',
  '💙 Mi libertad',   '⭐ Brillas',        '🌟 Estrella mía',  '💜 Mi alegría',
  '🧡 Mi razón',      '💛 Mi luz',         '❤️ Eres todo',     '💖 Mi cielo',
  '🌙 Contigo',       '✨ Siempre',        '💗 Mi universo',   '🥰 Te adoro',
  '💖 Mi vida',       '❤️ Amor',           '🌸 Felicidad',     '💎 Universo',
];

/* ---- FRASES BOTÓN NO ---- */
const NO_MESSAGES = [
  '¿Seguro? 🥺',
  'Piensa otra vez 💗',
  'Creo que quieres decir que sí 😏',
  'Inténtalo otra vez ❤️',
  '¡No te escapes! 😜',
  '¡Sabes que quieres decir sí! 💖',
];

/* ---- ESTADO ---- */
let noAttempts   = 0;
let msgInterval  = null;
let activeMsgCount = 0;
const MAX_MESSAGES = 35;   /* Muchos mensajes simultáneos como en el video */
let proposalStarsData  = [];
let proposalStarsAnimId = null;

/* ---- AUDIO ---- */
let musicStarted = false;
const MUSIC_START_TIME = 52;

function startMusic() {
  if (musicStarted) return;
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  audio.volume = 0.80;
  audio.currentTime = MUSIC_START_TIME;

  const p = audio.play();
  if (p !== undefined) {
    p.then(() => {
      musicStarted = true;
      hideMusicFallback();
    }).catch(() => {
      /* Autoplay bloqueado — mostrar botón fallback */
      musicStarted = false;
      showMusicFallback();
    });
  } else {
    musicStarted = true;
  }
}

function showMusicFallback() {
  const btn = document.getElementById('btn-music-start');
  if (btn) btn.classList.add('visible');
}

function hideMusicFallback() {
  const btn = document.getElementById('btn-music-start');
  if (btn) { btn.classList.remove('visible'); btn.style.display = 'none'; }
}

function bindMusicFallback() {
  const btn = document.getElementById('btn-music-start');
  if (!btn) return;
  function activate() {
    const audio = document.getElementById('bg-music');
    if (!audio) return;
    audio.volume = 0.80;
    audio.currentTime = MUSIC_START_TIME;
    audio.play().then(() => {
      musicStarted = true;
      hideMusicFallback();
    }).catch(() => {});
  }
  btn.addEventListener('click',     activate);
  btn.addEventListener('touchend',  activate, { passive: true });
}

function bindMusicToggle() {
  const btn   = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  if (!btn || !audio) return;
  btn.classList.add('visible');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.muted) {
      audio.muted  = false;
      btn.textContent = '🔊';
    } else {
      audio.muted  = true;
      btn.textContent = '🔇';
    }
  });
  btn.addEventListener('touchstart', (e) => {
    e.stopPropagation();
  }, { passive: true });
}

/* ============================================
   INICIALIZACIÓN
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initLetterStars();
  initProposalStars();
  initParticles();
  bindButtons();
  bindOpenLetter();
  bindMusicFallback();
});

/* Evitar salto de dt cuando la pestaña vuelve a estar visible */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) lastFrameTime = performance.now();
});

/* ============================================
   PANTALLA 0 — CARTA: ESTRELLAS Y LÓGICA
   ============================================ */
function initLetterStars() {
  const canvas = document.getElementById('letter-stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const stars = [];
  for (let i = 0; i < 140; i++) {
    stars.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.007 + 0.003,
      dir: Math.random() > 0.5 ? 1 : -1,
      color: pickStarColor(),
    });
  }

  let animId;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;
    stars.forEach(s => {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1)   { s.alpha = 1;   s.dir = -1; }
      if (s.alpha <= 0.1) { s.alpha = 0.1; s.dir =  1; }
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    animId = requestAnimationFrame(draw);
  }
  animId = requestAnimationFrame(draw);
}

function bindOpenLetter() {
  const btnOpen  = document.getElementById('btn-open');
  const envelope = document.getElementById('envelope');
  if (!btnOpen) return;

  function openLetter() {
    btnOpen.disabled = true;
    btnOpen.style.opacity = '0.5';

    /* 1. Arrancar música (gesto del usuario) */
    startMusic();

    /* 2. Abrir la tapa del sobre */
    envelope.classList.add('opening');

    /* 3. Transición a pantalla de propuesta después de la animación */
    setTimeout(() => {
      showProposalScreen();
    }, 1400);
  }

  btnOpen.addEventListener('click',      openLetter);
  /* pointerup funciona en touch Y mouse, y no bloquea el audio en iOS */
  btnOpen.addEventListener('pointerup',  openLetter);
}

function showProposalScreen() {
  const screenLetter   = document.getElementById('screen-letter');
  const screenProposal = document.getElementById('screen-proposal');

  screenLetter.classList.remove('active');
  screenLetter.classList.add('fade-out');

  setTimeout(() => {
    screenLetter.style.display = 'none';
    screenProposal.classList.add('active');
  }, 700);
}

/* ============================================
   CANVAS: ESTRELLAS PANTALLA 1
   ============================================ */
function initProposalStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  proposalStarsData = [];
  for (let i = 0; i < 160; i++) {
    proposalStarsData.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.003,
      dir: Math.random() > 0.5 ? 1 : -1,
      color: pickStarColor(),
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;
    proposalStarsData.forEach(s => {
      s.alpha += s.speed * s.dir;
      if (s.alpha >= 1)   { s.alpha = 1;   s.dir = -1; }
      if (s.alpha <= 0.1) { s.alpha = 0.1; s.dir =  1; }
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (s.r > 1.2) {
        const g = ctx.createRadialGradient(s.x*W, s.y*H, 0, s.x*W, s.y*H, s.r*3);
        g.addColorStop(0, 'rgba(255,180,220,0.3)');
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    });
    proposalStarsAnimId = requestAnimationFrame(draw);
  }
  proposalStarsAnimId = requestAnimationFrame(draw);
}

function pickStarColor() {
  const c = ['#ffffff','#ffe0f0','#ffb3d9','#e8b4f8','#c084fc','#f9a8d4','#fde68a','#a78bfa'];
  return c[Math.floor(Math.random() * c.length)];
}

/* ============================================
   PARTÍCULAS FLOTANTES PANTALLA 1
   ============================================ */
function initParticles() {
  const container = document.getElementById('particles-proposal');
  if (!container) return;
  const emojis = ['✨','💫','⭐','🌟','💖','💕'];
  for (let i = 0; i < 22; i++) createProposalParticle(container, emojis, true);
  setInterval(() => {
    if (document.getElementById('screen-proposal').classList.contains('active')) {
      createProposalParticle(container, emojis, false);
    }
  }, 900);
}

function createProposalParticle(container, emojis, initial) {
  const el = document.createElement('span');
  el.classList.add('particle');
  const isEmoji = Math.random() > 0.45;
  if (isEmoji) {
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.fontSize = (Math.random() * 14 + 10) + 'px';
    el.style.background = 'none';
    el.style.borderRadius = '0';
    el.style.width = 'auto';
    el.style.height = 'auto';
  } else {
    const size = Math.random() * 3 + 1;
    el.style.width  = size + 'px';
    el.style.height = size + 'px';
    el.style.background = `radial-gradient(circle, ${pickStarColor()}, transparent)`;
    el.style.boxShadow = `0 0 ${size*3}px ${pickStarColor()}`;
  }
  el.style.left   = Math.random() * 100 + 'vw';
  el.style.bottom = (initial ? Math.random() * 100 : -5) + 'vh';
  const dur = Math.random() * 8 + 6;
  el.style.animationDuration = dur + 's';
  el.style.animationDelay   = initial ? -(Math.random() * dur) + 's' : '0s';
  el.style.opacity = '0';
  container.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

/* ============================================
   BOTONES
   ============================================ */
function bindButtons() {
  const btnYes = document.getElementById('btn-yes');
  const btnNo  = document.getElementById('btn-no');
  btnYes.addEventListener('click',      acceptProposal);
  btnYes.addEventListener('touchstart', e => { e.preventDefault(); acceptProposal(); }, { passive: false });
  btnNo.addEventListener('mouseenter',  moveNoButton);
  btnNo.addEventListener('touchstart',  e => { e.preventDefault(); moveNoButton(); }, { passive: false });
  btnNo.addEventListener('click',       moveNoButton);
}

/* ============================================
   BOTÓN NO — MOVIMIENTO ESQUIVO
   ============================================ */
function moveNoButton() {
  noAttempts++;
  const btn     = document.getElementById('btn-no');
  const btnRect = btn.getBoundingClientRect();
  let dx = (Math.random() - 0.5) * 200;
  let dy = (Math.random() - 0.5) * 120;
  const margin = 20;
  const newLeft = btnRect.left + dx;
  const newTop  = btnRect.top  + dy;
  if (newLeft < margin) dx += margin - newLeft;
  if (newLeft + btnRect.width > window.innerWidth - margin)
    dx -= (newLeft + btnRect.width) - (window.innerWidth - margin);
  if (newTop < margin) dy += margin - newTop;
  if (newTop + btnRect.height > window.innerHeight - margin)
    dy -= (newTop + btnRect.height) - (window.innerHeight - margin);
  const cur   = btn.style.transform || 'translate(0px,0px)';
  const match = cur.match(/translate\(([^,]+),\s*([^)]+)\)/);
  const cx    = match ? parseFloat(match[1]) : 0;
  const cy    = match ? parseFloat(match[2]) : 0;
  btn.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
  btn.style.transform  = `translate(${cx + dx}px, ${cy + dy}px)`;
  const msgEl = document.getElementById('no-message');
  msgEl.textContent = NO_MESSAGES[Math.min(noAttempts - 1, NO_MESSAGES.length - 1)];
  msgEl.classList.add('visible');
}

/* ============================================
   ACEPTAR PROPUESTA
   ============================================ */
function acceptProposal() {
  const btnYes = document.getElementById('btn-yes');
  const btnNo  = document.getElementById('btn-no');
  btnYes.disabled = true;
  btnNo.disabled  = true;
  btnYes.classList.add('accepting');
  createHeartExplosion(btnYes);
  setTimeout(showLoveScreen, 800);
}

/* ============================================
   EXPLOSIÓN DE CORAZONES
   ============================================ */
function createHeartExplosion(originEl) {
  const rect = originEl.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  const hearts = ['❤️','💖','💕','💗','💘','💝','🌹','✨'];
  const COUNT  = 32;
  for (let i = 0; i < COUNT; i++) {
    const el  = document.createElement('span');
    el.classList.add('heart-particle');
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    const angle    = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.4;
    const distance = Math.random() * 200 + 80;
    const tx       = Math.cos(angle) * distance;
    const ty       = Math.sin(angle) * distance - Math.random() * 60;
    const rot      = (Math.random() - 0.5) * 720;
    const duration = Math.random() * 0.6 + 0.8;
    const size     = Math.random() * 18 + 14;
    el.style.cssText = `
      left:${cx}px; top:${cy}px; font-size:${size}px;
      --tx:${tx}px; --ty:${ty}px; --rot:${rot}deg; --duration:${duration}s;
      animation-delay:${Math.random() * 0.15}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

/* ============================================
   MOSTRAR PANTALLA DE AMOR
   ============================================ */
function showLoveScreen() {
  const screenProposal = document.getElementById('screen-proposal');
  const screenLove     = document.getElementById('screen-love');
  if (proposalStarsAnimId) cancelAnimationFrame(proposalStarsAnimId);
  screenProposal.classList.remove('active');
  screenProposal.classList.add('fade-out');
  setTimeout(() => {
    screenProposal.style.display = 'none';
    screenLove.classList.add('active');
    startMessageField();
    bindLoveScreenDrag(screenLove);
    bindMusicToggle();
  }, 400);
}

/* ============================================
   ARRASTRE / TOUCH → GIRO INTERACTIVO
   ============================================ */
function bindLoveScreenDrag(el) {

  function onDragStart(x, y) {
    isDragging = true;
    dragLastX  = x;
    dragLastY  = y;
    /* Resetear lastFrameTime para evitar salto de dt tras pausa */
    lastFrameTime = performance.now();
  }

  function onDragMove(x, y) {
    if (!isDragging) return;
    const dx = x - dragLastX;
    const dy = y - dragLastY;
    dragLastX = x;
    dragLastY = y;
    /* Impulso proporcional al gesto — se frena solo por FRICTION */
    velY += dx * DRAG_SCALE;
    velX += dy * DRAG_SCALE * 0.4;
  }

  function onDragEnd() {
    isDragging = false;
    lastFrameTime = performance.now();  /* resync tras soltar */
  }

  /* ---- MOUSE ---- */
  el.addEventListener('mousedown', (e) => {
    onDragStart(e.clientX, e.clientY);
    el.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove',  (e) => onDragMove(e.clientX, e.clientY));
  window.addEventListener('mouseup',    ()  => { onDragEnd(); el.style.cursor = ''; });

  /* ---- TOUCH ---- */
  el.addEventListener('touchstart', (e) => {
    onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    onDragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener('touchend',  onDragEnd);
}

/* ============================================================
   CAMPO 3D DE MENSAJES — Motor de partículas con proyección
   perspectiva real. El espacio gira en 3 ejes; los textos
   permanecen horizontales y legibles en todo momento.
   ============================================================ */

const MSG_COUNT = 70;           /* balance densidad/rendimiento */
let   msgNodes3d = [];          /* elementos DOM               */
let   msgParts   = [];          /* datos 3D de cada partícula  */
let   fieldAnimId = null;
let   lastFrameTime = 0;

/* Ángulos de rotación global del espacio (radianes) */
let   rotY = 0;   /* eje Y — giro horizontal principal  */
let   rotX = 0;   /* eje X — inclinación suave           */
let   rotZ = 0;   /* eje Z — ligero bamboleo             */

/* Velocidades de rotación BASE (rad/frame a 60fps) */
const ROT_Y_SPEED = 0.0018;   /* ~30s por vuelta completa   */

/* Velocidad actual — se suma la inercia del arrastre */
let   velY = ROT_Y_SPEED;     /* velocidad Y actual          */
let   velX = 0;               /* velocidad X actual (arrastre) */

/* Inercia: el impulso se frena gradualmente */
const FRICTION   = 0.92;      /* multiplicador por frame     */
const DRAG_SCALE = 0.008;     /* píxeles de arrastre → rad   */

/* Estado del puntero para arrastre */
let   isDragging  = false;
let   dragLastX   = 0;
let   dragLastY   = 0;

/* Distancia focal de perspectiva (px virtuales) */
const FOCAL = 500;

/* Radio máximo del espacio 3D en px virtuales */
const SPACE_R = 380;

/* Colores — mayoría blanco/crema */
const MSG_COLORS_3D = [
  '#ffffff', '#ffffff', '#ffffff', '#ffffff',
  '#fff0f5', '#fff5e6', '#f0f0ff', '#ffe8f5',
];

const FIELD_MESSAGES = [
  '❤️ Amor eterno',    '💖 Mi amor',        '✨ Brillas',
  '🌙 Mi cielo',       '☀️ Mi sol',          '🌎 Mi mundo',
  '🌌 Universo',       '💕 Mi vida',         '💎 Eres especial',
  '❤️ Eres todo',      '✨ Siempre tú',      '💗 Mi corazón',
  '🌈 Mi alegría',     '💕 Contigo',         '💖 Mi felicidad',
  '🦋 Libertad',       '❤️ Siempre juntos',  '🥰 Mi favorit@',
  '💞 Me haces feliz', '💡 Mi luz',          '🕊️ Mi calma',
  '💗 Para siempre',   '🌸 Mi flor',         '💓 Latido',
  '🌟 Estrella mía',   '💙 Mi libertad',     '🧡 Mi razón',
  '💛 Mi sol',         '💜 Mi alegría',      '🔥 Pasión',
  '⭐ Brillas',        '💖 Te adoro',        '❤️ Te quiero',
  '✨ Siempre',        '💗 Mi universo',     '🥰 Eres todo',
  '💖 Mi vida',        '❤️ Amor',            '🌸 Felicidad',
  '💎 Universo',       '🌙 Contigo',         '🌺 Mi razón',
  '💕 Tú y yo',        '❤️ Mi latido',       '✨ Brillo',
  '💗 Pasión',         '🌟 Mi estrella',     '💖 Siempre',
];

/* ----------------------------------------------------------
   Inicializar el campo 3D
   ---------------------------------------------------------- */
function startMessageField() {
  const container = document.getElementById('messages-container');
  if (!container) return;

  /* Cancelar loop previo si existe */
  if (fieldAnimId) { cancelAnimationFrame(fieldAnimId); fieldAnimId = null; }

  /* Limpiar contenedor */
  while (container.firstChild) container.removeChild(container.firstChild);

  msgNodes3d = [];
  msgParts   = [];
  rotY = 0; rotX = 0; rotZ = 0;

  const PI2 = Math.PI * 2;

  for (let i = 0; i < MSG_COUNT; i++) {
    /* --- Posición 3D inicial distribuida uniformemente en una esfera
           usando distribución de Fibonacci para evitar clusters ---  */
    const golden  = Math.PI * (3 - Math.sqrt(5));   /* ángulo áureo  */
    const yNorm   = 1 - (i / (MSG_COUNT - 1)) * 2;  /* -1 … +1       */
    const radius  = Math.sqrt(1 - yNorm * yNorm);
    const theta   = golden * i;

    /* Distribuir en distintos radios para llenar el espacio (no solo superficie) */
    const rScale  = Math.cbrt(Math.random()) * SPACE_R;   /* cúbico = uniforme en volumen */

    const x0 = Math.cos(theta) * radius * rScale;
    const y0 = yNorm * rScale;
    const z0 = Math.sin(theta) * radius * rScale;

    /* Cada partícula tiene además un movimiento propio suave (derive) */
    const driftSpeed = (Math.random() * 0.0004 + 0.0001);
    const driftAngle = Math.random() * PI2;
    const driftAxis  = Math.random() * PI2;

    /* Texto y color */
    const text  = FIELD_MESSAGES[i % FIELD_MESSAGES.length];
    const color = MSG_COLORS_3D[Math.floor(Math.random() * MSG_COLORS_3D.length)];

    /* --- Elemento DOM --- */
    const el = document.createElement('div');
    el.classList.add('love-msg');
    el.textContent = text;
    el.style.color = color;
    /* Tamaño base — lo escala la proyección */
    el.style.fontSize = '14px';
    /* Oculto hasta que el motor lo posicione */
    el.style.opacity = '0';

    container.appendChild(el);
    msgNodes3d.push(el);
    msgParts.push({
      x: x0, y: y0, z: z0,
      driftSpeed, driftAngle, driftAxis,
      driftTime: Math.random() * 100,
      color,                              /* guardado para el loop */
    });
  }

  lastFrameTime = performance.now();
  fieldAnimId   = requestAnimationFrame(animateField3D);
}

/* ----------------------------------------------------------
   Loop principal del motor 3D — optimizado para 60fps
   Sin sort(), sin toFixed(), sin filter:blur() por frame
   ---------------------------------------------------------- */
function animateField3D(now) {
  lastFrameTime = now;

  /* Rotación automática base */
  rotY += ROT_Y_SPEED;

  /* Inercia del arrastre — decae a cero */
  velY *= FRICTION;
  velX *= FRICTION;
  rotY += velY;
  rotX += velX;
  /* Bamboleo suave en X */
  rotX += (Math.sin(now * 0.00008) * 0.15 - rotX) * 0.008;
  rotZ  =  Math.sin(now * 0.00005) * 0.05;

  /* Precomputar trig — una sola vez por frame */
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

  const cx = window.innerWidth  * 0.5;
  const cy = window.innerHeight * 0.5;

  /* Avanzar tiempo de deriva global (más barato que por-partícula con dt) */
  const t = now * 0.001;

  for (let i = 0; i < msgParts.length; i++) {
    const p  = msgParts[i];
    const el = msgNodes3d[i];

    /* Deriva individual — sin multiplicar dt, usa tiempo absoluto */
    const da = p.driftAngle;
    const ds = p.driftAxis;
    const wx = p.x + Math.cos(t * p.driftSpeed * 100 + da) * 12;
    const wy = p.y + Math.sin(t * p.driftSpeed * 70  + ds) * 8;
    const wz = p.z + Math.cos(t * p.driftSpeed * 50  + ds) * 10;

    /* Rotación Y */
    const rx1 = wx * cosY - wz * sinY;
    const rz1 = wx * sinY + wz * cosY;

    /* Rotación X */
    const ry2 = wy  * cosX - rz1 * sinX;
    const rz2 = wy  * sinX + rz1 * cosX;

    /* Rotación Z */
    const rx3 = rx1 * cosZ - ry2 * sinZ;
    const ry3 = rx1 * sinZ + ry2 * cosZ;

    /* Proyección perspectiva */
    const zProj = rz2 + FOCAL;
    if (zProj < 50) {
      el.style.opacity = '0';
      continue;
    }

    const scale   = FOCAL / zProj;
    const screenX = cx + rx3 * scale;
    const screenY = cy + ry3 * scale;

    /* Escala visual 0.3 … 1.8 */
    const s = scale < 0.167 ? 0.3 : scale > 1.0 ? 1.8 : scale * 1.8;

    /* Opacidad 0.1 … 1 */
    const op = scale < 0.072 ? 0.1 : scale > 0.714 ? 1.0 : scale * 1.4;

    /* zIndex entero — evita el sort() */
    const zi = (zProj * 0.1) | 0;

    /* Aplicar — un solo style.cssText minimiza reflows */
    el.style.cssText =
      'position:absolute;left:0;top:0;' +
      'font-family:Georgia,serif;font-weight:800;white-space:nowrap;' +
      'pointer-events:none;' +
      'color:' + p.color + ';' +
      'font-size:14px;' +
      'opacity:' + op + ';' +
      'z-index:' + zi + ';' +
      'transform:translate(' + (screenX | 0) + 'px,' + (screenY | 0) + 'px) scale(' + (s * 100 | 0) / 100 + ') translate(-50%,-50%);' +
      'text-shadow:0 0 8px rgba(255,255,255,0.8),0 1px 2px rgba(0,0,0,.95);';
  }

  fieldAnimId = requestAnimationFrame(animateField3D);
}

/* ============================================
   LIMPIEZA DE PARTÍCULAS
   ============================================ */
function cleanupParticles(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
}
