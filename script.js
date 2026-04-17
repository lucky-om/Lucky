/* ============================================================
   LUCKY'S 19TH BIRTHDAY — script.js
   Pure functionality for auto-play and visual magic.
   ============================================================ */

/* ---- 1. SCROLL REVEAL ------------------------------------ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

// Animations will be triggered on button click, not DOMContentLoaded.
/* ---- 2. STAR FIELD --------------------------------------- */
const starsField = document.getElementById('starsField');
for (let i = 0; i < 35; i++) { // Kept light for performance
  const star = document.createElement('div');
  star.classList.add('star-dot');
  star.style.cssText = `
    left: ${Math.random() * 100}%;
    top: ${Math.random() * 100}%;
    --dur: ${2 + Math.random() * 3}s;
    width: ${2 + Math.random() * 4}px;
    height: ${2 + Math.random() * 4}px;
    animation-delay: ${Math.random() * 3}s;
    background: ${Math.random() > 0.6 ? '#f59e0b' : '#f9a8d4'};
  `;
  starsField.appendChild(star);
}

/* ---- 3. BACKGROUND FLOATERS ------------------------------ */
const floatersWrap = document.getElementById('floatersWrap');
const floaterEmojis = ['🌻', '🎈', '✨', '💫', '🎉']; // Minimal set

function spawnFloater() {
  if (document.hidden) return; // Save resources
  const el = document.createElement('div');
  el.classList.add('floater');
  el.textContent = floaterEmojis[Math.floor(Math.random() * floaterEmojis.length)];
  el.style.cssText = `
    left: ${Math.random() * 100}%;
    font-size: ${1.2 + Math.random() * 1}rem;
    animation-duration: ${10 + Math.random() * 6}s;
  `;
  floatersWrap.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

function startFloaters() {
  setInterval(spawnFloater, 3000); // Slow and elegant pace
}

/* ---- 4. CONFETTI BURST ----------------------------------- */
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

const COLORS = ['#f472b6', '#c084fc', '#fbbf24', '#f9a8d4', '#fde68a', '#ec4899', '#ffffff'];
const SHAPES = ['circle', 'rect'];

class Confetti {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x = Math.random() * W;
    this.y = initial ? Math.random() * H : -20;
    this.r = 4 + Math.random() * 6;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.vy = 1.0 + Math.random() * 2.0;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.rot = Math.random() * 360;
    this.rotV = (Math.random() - 0.5) * 3;
    this.opacity = 0.6 + Math.random() * 0.4;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.rotV;
    if (this.y > H + 20) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rot * Math.PI) / 180);
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-this.r, -this.r / 2, this.r * 2, this.r);
    }
    ctx.restore();
  }
}

const pieces = [];
function animateConfetti() {
  ctx.clearRect(0, 0, W, H);
  pieces.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateConfetti);
}

function startConfetti() {
  // Spawn modest confetti only when user enters
  for (let i = 0; i < 40; i++) pieces.push(new Confetti());
  animateConfetti();
}

/* ---- 5. ALWAYS-ON HAPPY BIRTHDAY MUSIC ------------------- */
let audioCtx = null;
let isPlaying = false;

// Basic synth note values
const notes = {
  G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99
};

const melody = [
  ['G4', 0.75, 0.7], ['G4', 0.25, 0.6], ['A4', 1, 0.7], ['G4', 1, 0.7], ['C5', 1, 0.7], ['B4', 2, 0.7],
  ['G4', 0.75, 0.7], ['G4', 0.25, 0.6], ['A4', 1, 0.7], ['G4', 1, 0.7], ['D5', 1, 0.7], ['C5', 2, 0.7],
  ['G4', 0.75, 0.7], ['G4', 0.25, 0.6], ['G5', 1, 0.7], ['E5', 1, 0.7], ['C5', 1, 0.7], ['B4', 1, 0.7], ['A4', 2, 0.7],
  ['F5', 0.75, 0.7], ['F5', 0.25, 0.6], ['E5', 1, 0.7], ['C5', 1, 0.7], ['D5', 1, 0.7], ['C5', 2.5, 0.7]
];

function triggerMusic() {
  if (isPlaying) return;
  isPlaying = true;

  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const bpm = 82;
  const beatDuration = 60 / bpm;
  let startTime = audioCtx.currentTime + 0.1;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);

  // Soft echo
  const delay = audioCtx.createDelay(0.5);
  delay.delayTime.value = 0.15;
  const feedback = audioCtx.createGain();
  feedback.gain.value = 0.25;
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(masterGain);

  function schedulePlayback() {
    let t = startTime;
    melody.forEach(([noteName, dur, vol]) => {
      if (!notes[noteName]) { t += dur * beatDuration; return; }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[noteName], t);

      const noteDur = dur * beatDuration;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol * 0.5, t + 0.04);
      gain.gain.setValueAtTime(vol * 0.5, t + noteDur * 0.7);
      gain.gain.linearRampToValueAtTime(0, t + noteDur * 0.95);

      osc.connect(gain);
      gain.connect(masterGain);
      gain.connect(delay);

      osc.start(t);
      osc.stop(t + noteDur + 0.05);

      t += noteDur;
    });

    const totalDuration = melody.reduce((s, [, d]) => s + d * beatDuration, 0);
    // Continuous loop silently in background
    setTimeout(() => {
      if (isPlaying) {
        startTime = audioCtx.currentTime + 0.05;
        schedulePlayback();
      }
    }, (totalDuration - 0.5) * 1000);
  }

  schedulePlayback();
}


/* ---- 6. INTRO OVERLAY ("OPEN ME") ------------------------ */
const introOverlay = document.getElementById('introOverlay');
const startBtn = document.getElementById('startBtn');
const body = document.body;

startBtn.addEventListener('click', () => {
  // Hide splash screen
  introOverlay.classList.add('hidden');
  body.classList.remove('no-scroll');

  // Trigger purely automatic features
  triggerMusic();
  startConfetti();
  startFloaters();

  // Start revealing elements smoothly only after the veil drops!
  setTimeout(() => {
    const els = document.querySelectorAll('.reveal, .reveal-up, .reveal-pop, .reveal-fade, .reveal-card');
    els.forEach(el => revealObserver.observe(el));
  }, 300); // Slight delay for maximum effect
});

/* ENJOY DEVELOPING AND BROWSING! */

/* ---- 8. POLAROID MOBILE SCROLL EFFECTS ------------------- */
const polaroidObserver = new IntersectionObserver((entries) => {
  // Only apply auto-hover effects on mobile screens
  if (window.innerWidth > 500) return; 

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('mobile-hover');
    } else {
      entry.target.classList.remove('mobile-hover');
    }
  });
}, { threshold: 0.6 }); // Triggers when 60% of the polaroid is visible

setTimeout(() => {
  document.querySelectorAll('.polaroid').forEach(p => polaroidObserver.observe(p));
}, 500);
