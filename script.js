/* =========================================================================
   BIRTHDAY WEBSITE — MAIN SCRIPT
   No GSAP dependency by design: every animation here uses native CSS
   transitions/keyframes or plain canvas, so a slow/blocked CDN can never
   brick the experience. canvas-confetti is the only external animation
   library, and every call to it is guarded in case it fails to load.

   Table of contents:
   1.  Content data (edit text/photos here)
   2.  Loader sequence
   3.  Ambient background canvas (fireflies)
   4.  Intro gate + confetti/fireworks reveal
   5.  Music toggle
   6.  Cursor glow + scroll progress
   7.  Nav active-state tracking
   8.  Hero balloons/stars
   9.  Messages — envelopes
   10. Shared lightbox modal (used by Journey Through Life)
   11. Reasons grid
   12. Gift box interaction
   13. Journey Through Life — timeline build + scroll animation
   14. Final letter — typing effect
   15. Post-credits — fake payment scene
   16. Easter egg (cake clicks)
   17. Scroll reveal utility
   18. Main orchestration / init
   ========================================================================= */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------
   1. CONTENT DATA — edit text, dates, and icon placeholders here later
   ------------------------------------------------------------------------- */
const MESSAGES_DATA = [
  { text: "Thank you for always helping me." },
  { text: "Thank you for making every family gathering more fun." },
  { text: "Your jokes are terrible...\nbut somehow still funny." },
  { text: "A little older.\nStill the same chaos." },
];

const REASONS_DATA = [
  { star: "⭐", text: "Always there when needed" },
  { star: "⭐", text: "Makes everyone laugh" },
  { star: "⭐", text: "Gives the best advice" },
  { star: "⭐", text: "Hardworking" },
  { star: "⭐", text: "Family's biggest supporter" },
  { star: "⭐", text: "Kind-hearted" },
];

/* Journey Through Life — full milestone set, in order.
   icon = emoji placeholder shown in the circular photo node until a real
   photo is dropped in (see file-reading notes at bottom of this file). */
const JOURNEY_DATA = [
  { icon: '<img src="assets/images/journey-01-beginning.jpg" alt="Baby photo">', year: "", title: "The Beginning", caption: "Where every great story began.", desc: "Replace this with the story of the very beginning — where he was born, what the family remembers about those first days." },
  { icon: '<img src="assets/images/journey-02-sisters.jpg" alt="With his sisters">', year: "", title: "Growing Up With His Sisters", caption: "Partners in crime. Family forever.", desc: "A space for the stories of growing up alongside his sisters — the fights, the loyalty, the inside jokes that never died." },
  { icon: '<img src="assets/images/journey-03-graduation.jpg" alt="Graduation day">', year: "", title: "Graduation", caption: "The first big milestone of many.", desc: "The day the hard work started paying off. Add the details of where, what he studied, and how it felt." },
  { icon: '<img src="assets/images/journey-04-friends.jpg" alt="With friends">', year: "", title: "Friends Forever", caption: "Every great adventure needs great friends.", desc: "The friends who became family. Add the names and the memories that belong here." },
  { icon: '<img src="assets/images/journey-05-sneakout.jpg" alt="Adventure with friends">', year: "", title: "Sneak-Out Adventures", caption: "Some stories are better left untold… but this one definitely deserves a place here 😂.", desc: "You know exactly which story goes here. We're not writing it down — he can tell it himself." },
  { icon: '<img src="assets/images/journey-06-firstjob.jpg" alt="First job placement">', year: "", title: "First Job Placement", caption: "Where hard work started turning into dreams.", desc: "The first step into a career — replace with the company, the role, and how proud everyone was." },
  { icon: '<img src="assets/images/journey-07-marriage.jpg" alt="Wedding day">', year: "", title: "Marriage", caption: "The day two beautiful journeys became one.", desc: "The wedding day — add the date, the place, and the moment that summed it all up." },
  { icon: '<img src="assets/images/journey-08-firsthouse.jpg" alt="First house">', year: "", title: "First House", caption: "A home built with dreams and determination.", desc: "The first place that was truly his own. Add the story of how it came together." },
  { icon: '<img src="assets/images/journey-09-firstcar.jpg" alt="First car">', year: "", title: "First Car", caption: "Freedom on four wheels.", desc: "Every great road trip story starts somewhere. This is where his did." },
  { icon: '<img src="assets/images/journey-10-firstchild.jpg" alt="First child">', year: "", title: "First Child", caption: "A whole new chapter began.", desc: "The day everything changed for the better. Add the name and the story of that day." },
  { icon: '<img src="assets/images/journey-11-secondchild.jpg" alt="Second child">', year: "", title: "Second Child", caption: "More laughter.\nMore memories.\nMore love.", desc: "Round two of chaos and joy. Add the name and the story here." },
  { icon: '<img src="assets/images/journey-12-secondhouse.jpg" alt="Second house">', year: "", title: "Second House", caption: "Proof that dreams grow when you never stop believing in them.", desc: "Another milestone, another home. Add the story of how far things have come." },
  { icon: '<img src="assets/images/journey-13-today.jpg" alt="Today">', year: "Today", title: "Today", caption: "The hero of this story...\nand it's still being written.", desc: "And now, here we all are — celebrating another year of the person who's been the constant through every chapter above." },
];

const LETTER_TEXT = `Dear Mama,

There's no version of my life that makes sense without you in it — teasing me one minute, showing up for me the next.

You've watched me grow up, mess up, and somehow still believe in me through all of it. That means more than I've ever said out loud.

So today, just for once, I wanted to say it properly.`;

const PAYMENT_CHIPS = ["🍕 Pizza", "🍦 Ice Cream", "🍰 Cake", "☕ Coffee", "🍔 Burger", "🍟 Fries", "Unlimited Family Time ❤️"];

/* -------------------------------------------------------------------------
   2. LOADER SEQUENCE
   ------------------------------------------------------------------------- */
function runLoader(){
  return new Promise((resolve) => {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loaderFill');
    const pct = document.getElementById('loaderPct');
    let progress = 0;
    const duration = REDUCED_MOTION ? 300 : 1800;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = 100 / steps;

    const interval = setInterval(() => {
      progress = Math.min(100, progress + increment * (0.6 + Math.random() * 0.8));
      fill.style.width = progress + '%';
      pct.textContent = Math.floor(progress) + '%';
      if (progress >= 100){
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add('hidden');
          resolve();
        }, 280);
      }
    }, stepTime);
  });
}

/* -------------------------------------------------------------------------
   3. AMBIENT BACKGROUND CANVAS — fireflies, fixed behind all content
   ------------------------------------------------------------------------- */
function initAmbientCanvas(){
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, fireflies = [];

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = window.innerWidth < 700 ? 14 : 26;
  for (let i = 0; i < count; i++){
    fireflies.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2,
      baseAlpha: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.3,
      driftX: (Math.random() - 0.5) * 0.4,
      driftY: (Math.random() - 0.5) * 0.4,
      hue: Math.random() > 0.5 ? '96,165,250' : '37,99,235',
    });
  }

  let t = 0;
  function draw(){
    if (REDUCED_MOTION){ return; }
    t += 0.016;
    ctx.clearRect(0, 0, w, h);
    fireflies.forEach((f) => {
      f.x += f.driftX;
      f.y += f.driftY;
      if (f.x < -10) f.x = w + 10;
      if (f.x > w + 10) f.x = -10;
      if (f.y < -10) f.y = h + 10;
      if (f.y > h + 10) f.y = -10;
      const alpha = f.baseAlpha * (0.4 + 0.6 * Math.abs(Math.sin(t * f.speed + f.phase)));
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
      grad.addColorStop(0, `rgba(${f.hue},${alpha})`);
      grad.addColorStop(1, `rgba(${f.hue},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 6, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* -------------------------------------------------------------------------
   4. INTRO GATE — particles, open surprise → confetti/fireworks → reveal
   ------------------------------------------------------------------------- */
function initIntroParticles(){
  const container = document.getElementById('introParticles');
  if (REDUCED_MOTION) return;
  const count = window.innerWidth < 700 ? 18 : 32;
  for (let i = 0; i < count; i++){
    const p = document.createElement('div');
    p.className = 'p';
    const size = 2 + Math.random() * 3;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-10px';
    p.style.animationDuration = (8 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    container.appendChild(p);
  }
}

function fireConfettiBurst(){
  if (typeof confetti !== 'function') return;
  const colors = ['#2563eb', '#60a5fa', '#dbeafe', '#ffffff'];
  confetti({
    particleCount: 140,
    spread: 90,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors,
  });
  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors });
  }, 250);
}

function runFireworks(durationMs){
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');
  let w, h;
  function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  canvas.style.opacity = '1';

  const colors = ['#2563eb', '#60a5fa', '#dbeafe', '#ffffff', '#93c5fd'];
  let particles = [];

  function spawnFirework(){
    const x = w * (0.2 + Math.random() * 0.6);
    const y = h * (0.2 + Math.random() * 0.35);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = 36;
    for (let i = 0; i < count; i++){
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        color,
        size: 2 + Math.random() * 1.5,
      });
    }
  }

  let spawnTimer = setInterval(spawnFirework, 450);
  spawnFirework();

  let raf;
  function loop(){
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.025;
      p.life -= p.decay;
    });
    particles = particles.filter(p => p.life > 0);
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(loop);
  }
  loop();

  setTimeout(() => {
    clearInterval(spawnTimer);
    setTimeout(() => {
      cancelAnimationFrame(raf);
      canvas.style.opacity = '0';
      ctx.clearRect(0, 0, w, h);
    }, 900);
  }, durationMs);
}

/* -------------------------------------------------------------------------
   5. MUSIC TOGGLE
   ------------------------------------------------------------------------- */
function initMusicToggle(){
  const audio = document.getElementById('bgMusic');
  const navBtn = document.getElementById('musicToggleNav');
  let playing = false;

  function setIcon(){
    navBtn.textContent = playing ? '🔊' : '🔈';
    navBtn.setAttribute('aria-pressed', String(playing));
  }

  navBtn.addEventListener('click', () => {
    if (playing){
      audio.pause();
      playing = false;
    } else {
      audio.volume = 0.35;
      audio.play().catch(() => { /* autoplay restrictions — user can retry */ });
      playing = true;
    }
    setIcon();
  });
}

/* -------------------------------------------------------------------------
   6. CURSOR GLOW + SCROLL PROGRESS
   ------------------------------------------------------------------------- */
function initCursorGlow(){
  const glow = document.getElementById('cursorGlow');
  if (window.matchMedia('(hover: none)').matches) return;
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

function initScrollProgress(){
  const fill = document.getElementById('scrollProgressFill');
  function update(){
    const scrollTop = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    fill.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* -------------------------------------------------------------------------
   7. NAV — active link tracking via IntersectionObserver
   ------------------------------------------------------------------------- */
function initNavActiveState(){
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  function setActive(id){
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

/* -------------------------------------------------------------------------
   8. HERO — floating balloons + twinkling stars
   ------------------------------------------------------------------------- */
function initHeroDecor(){
  const balloonsContainer = document.getElementById('heroBalloons');
  const starsContainer = document.getElementById('heroStars');
  const balloonEmojis = ['🎈', '🎈', '🎈'];

  const balloonCount = window.innerWidth < 700 ? 5 : 9;
  for (let i = 0; i < balloonCount; i++){
    const b = document.createElement('span');
    b.className = 'balloon';
    b.textContent = balloonEmojis[i % balloonEmojis.length];
    b.style.left = (Math.random() * 92) + '%';
    b.style.animationDuration = (10 + Math.random() * 8) + 's';
    b.style.animationDelay = (Math.random() * 10) + 's';
    b.style.fontSize = (2 + Math.random() * 1.4) + 'rem';
    balloonsContainer.appendChild(b);
  }

  const starCount = window.innerWidth < 700 ? 20 : 40;
  for (let i = 0; i < starCount; i++){
    const s = document.createElement('span');
    s.className = 'star';
    s.textContent = '✦';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.fontSize = (0.5 + Math.random() * 0.8) + 'rem';
    s.style.animationDuration = (2 + Math.random() * 3) + 's';
    s.style.animationDelay = (Math.random() * 4) + 's';
    starsContainer.appendChild(s);
  }
}

/* -------------------------------------------------------------------------
   9. MESSAGES — build envelopes, toggle open on click
   ------------------------------------------------------------------------- */
function buildEnvelopes(){
  const grid = document.getElementById('envelopesGrid');
  MESSAGES_DATA.forEach((msg, i) => {
    const env = document.createElement('div');
    env.className = 'envelope reveal-up';
    env.setAttribute('role', 'button');
    env.setAttribute('tabindex', '0');
    env.setAttribute('aria-label', `Open message ${i + 1}`);
    env.innerHTML = `
      <div class="envelope-body">
        <div class="envelope-letter">${msg.text}</div>
        <div class="envelope-flap"></div>
        <div class="envelope-seal">💌</div>
        <div class="envelope-label">Tap to open</div>
      </div>
    `;
    function openEnvelope(){
      const wasOpen = env.classList.contains('open');
      if (!wasOpen) burstMiniConfetti(env);
      env.classList.toggle('open');
    }
    env.addEventListener('click', openEnvelope);
    env.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openEnvelope(); }
    });
    grid.appendChild(env);
  });
}

function burstMiniConfetti(el){
  if (typeof confetti !== 'function' || REDUCED_MOTION) return;
  const rect = el.getBoundingClientRect();
  confetti({
    particleCount: 30,
    spread: 60,
    startVelocity: 22,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
    colors: ['#2563eb', '#60a5fa', '#dbeafe'],
    scalar: 0.7,
  });
}

/* -------------------------------------------------------------------------
   10. (Memories section removed — shared lightbox below now only serves
       the Journey Through Life timeline.)
   ------------------------------------------------------------------------- */
function closeMemoryLightbox(){
  const lightbox = document.getElementById('memoryLightbox');
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initMemoryLightboxControls(){
  document.getElementById('memoryLightboxClose').addEventListener('click', closeMemoryLightbox);
  document.getElementById('memoryLightboxBackdrop').addEventListener('click', closeMemoryLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMemoryLightbox();
  });
}

/* -------------------------------------------------------------------------
   11. REASONS GRID
   ------------------------------------------------------------------------- */
function buildReasons(){
  const grid = document.getElementById('reasonsGrid');
  REASONS_DATA.forEach((reason) => {
    const card = document.createElement('div');
    card.className = 'reason-card reveal-up';
    card.innerHTML = `
      <span class="reason-star">${reason.star}</span>
      <h3>${reason.text}</h3>
    `;
    grid.appendChild(card);
  });
}

/* -------------------------------------------------------------------------
   12. GIFT BOX INTERACTION
   ------------------------------------------------------------------------- */
function initGiftBox(){
  const btn = document.getElementById('openGiftBtn');
  const box = document.getElementById('giftBox');
  const balloonsRise = document.getElementById('giftBalloons');
  let opened = false;

  btn.addEventListener('click', () => {
    if (opened) return;
    opened = true;

    box.classList.add('shaking');

    setTimeout(() => {
      box.classList.remove('shaking');
      box.classList.add('opened');
      fireConfettiBurst();
      btn.classList.add('is-hidden');
      releaseGiftBalloons(balloonsRise);
    }, 1500);
  });
}

function releaseGiftBalloons(container){
  if (REDUCED_MOTION) return;
  const emojis = ['🎈', '🎈', '🎉', '🎈'];
  for (let i = 0; i < 10; i++){
    const b = document.createElement('span');
    b.className = 'balloon rising';
    b.textContent = emojis[i % emojis.length];
    b.style.left = (5 + Math.random() * 85) + '%';
    b.style.fontSize = (1.6 + Math.random() * 1.2) + 'rem';
    b.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    b.style.animationDelay = (Math.random() * 1.2) + 's';
    container.appendChild(b);
  }
  setTimeout(() => { container.innerHTML = ''; }, 5500);
}

/* -------------------------------------------------------------------------
   13. JOURNEY THROUGH LIFE — build timeline, scroll-driven glow line,
       alternating sides on desktop, horizontal swipe on mobile.
   ------------------------------------------------------------------------- */
function buildJourney(){
  const track = document.getElementById('journeyTrack');
  JOURNEY_DATA.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = `journey-item ${i % 2 === 1 ? 'right' : ''}`;
    el.innerHTML = `
      <div class="journey-card" role="button" tabindex="0" aria-label="Open story: ${item.title}">
        <div class="journey-node"></div>
        <div class="journey-photo">${item.icon}</div>
        ${item.year ? `<span class="journey-year">${item.year}</span>` : ''}
        <h3 class="journey-title">${item.title}</h3>
        <p class="journey-caption">${item.caption}</p>
        <span class="journey-tap-hint">Tap to read the story</span>
      </div>
    `;
    const card = el.querySelector('.journey-card');
    card.addEventListener('click', () => openJourneyLightbox(item));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openJourneyLightbox(item); }
    });
    track.appendChild(el);
  });
}

function openJourneyLightbox(item){
  const lightbox = document.getElementById('memoryLightbox');
  document.getElementById('lightboxPhoto').innerHTML = item.icon;
  document.getElementById('lightboxDate').textContent = item.year || '';
  document.getElementById('lightboxTitle').textContent = item.title;
  document.getElementById('lightboxCaption').textContent = item.caption;
  document.getElementById('lightboxCaption').style.display = 'block';
  document.getElementById('lightboxDesc').textContent = item.desc;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/* Scroll-driven reveal + glowing fill line + finale celebration */
function initJourneyScroll(){
  const items = Array.from(document.querySelectorAll('.journey-item'));
  const fill = document.getElementById('journeyLineFill');
  const finale = document.getElementById('journeyFinale');
  const isDesktop = () => window.innerWidth >= 860;
  let finaleTriggered = false;

  const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        const idx = items.indexOf(entry.target);
        const pct = ((idx + 1) / items.length) * 100;
        if (isDesktop() && fill){ fill.style.height = pct + '%'; }
      }
    });
  }, { threshold: 0.4 });
  items.forEach(it => itemObserver.observe(it));

  const finaleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        if (!finaleTriggered){
          finaleTriggered = true;
          fireConfettiBurst();
        }
      }
    });
  }, { threshold: 0.5 });
  if (finale) finaleObserver.observe(finale);
}

/* -------------------------------------------------------------------------
   14. FINAL LETTER — typing effect, triggered on scroll into view.
       Also schedules the post-credits reveal 3s after the letter finishes.
   ------------------------------------------------------------------------- */
function initLetterTyping(){
  const el = document.getElementById('letterBody');
  const closing = document.querySelector('.letter-closing');
  const sign = document.querySelector('.letter-sign');
  let typed = false;

  function typeText(){
    if (typed) return;
    typed = true;

    if (REDUCED_MOTION){
      el.textContent = LETTER_TEXT;
      closing.classList.add('visible');
      sign.classList.add('visible');
      schedulePostCredits();
      return;
    }

    const chars = LETTER_TEXT.split('');
    let i = 0;
    el.innerHTML = '<span class="typed-cursor">&nbsp;</span>';
    const cursor = el.querySelector('.typed-cursor');

    function typeNext(){
      if (i < chars.length){
        cursor.insertAdjacentText('beforebegin', chars[i]);
        i++;
        const char = chars[i - 1];
        const delay = char === '\n' ? 160 : (char === '.' ? 100 : 10 + Math.random() * 14);
        setTimeout(typeNext, delay);
      } else {
        cursor.remove();
        closing.classList.add('visible');
        setTimeout(() => {
          sign.classList.add('visible');
          schedulePostCredits();
        }, 400);
      }
    }
    typeNext();
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) typeText();
    });
  }, { threshold: 0.4 });
  observer.observe(document.querySelector('.letter-paper'));
}

/* Wait 3 seconds after the letter finishes, then reveal the post-credits
   scene (hidden attribute removed, section fades in). Only runs once. */
let postCreditsScheduled = false;
function schedulePostCredits(){
  if (postCreditsScheduled) return;
  postCreditsScheduled = true;
  setTimeout(() => {
    const section = document.getElementById('postcredits');
    section.hidden = false;
    requestAnimationFrame(() => section.classList.add('is-visible'));
  }, 3000);
}

/* -------------------------------------------------------------------------
   15. POST-CREDITS — fake payment scene
   Sequence on click of QR or "Scan to Pay":
     0.0s — coins float up, status shows "Processing..."
     2.0s — "Payment Failed ❌"
     3.0s — reason line replaces it
     4.0s — "Accepted Payment Methods" chips animate in
     ~5.5s — final message fades in + one last confetti/balloon moment
     ~8s  — cross-fade to closing card ("Happy Birthday, Mama ❤️ / Made by PILLu")
   ------------------------------------------------------------------------- */
function initPostCreditsPayment(){
  const qrImage = document.getElementById('qrImage');
  const payBtn = document.getElementById('payBtn');
  const coinsRise = document.getElementById('coinsRise');
  const status = document.getElementById('paymentStatus');
  const chipsWrap = document.getElementById('paymentChips');
  const chipsRow = document.getElementById('chipsRow');
  const finalMsg = document.getElementById('paymentFinal');
  const endCard = document.getElementById('postcreditsEnd');
  let triggered = false;

  function spawnCoins(){
    if (REDUCED_MOTION) return;
    for (let i = 0; i < 12; i++){
      const coin = document.createElement('span');
      coin.className = 'coin';
      coin.textContent = '🪙';
      coin.style.left = (Math.random() * 90) + '%';
      coin.style.animationDelay = (Math.random() * 0.6) + 's';
      coinsRise.appendChild(coin);
    }
    setTimeout(() => { coinsRise.innerHTML = ''; }, 3000);
  }

  function runSequence(){
    if (triggered) return;
    triggered = true;

    spawnCoins();
    status.textContent = 'Processing payment...';
    status.className = 'payment-status';

    setTimeout(() => {
      status.textContent = 'Payment Failed ❌';
      status.className = 'payment-status fail';
    }, 2000);

    setTimeout(() => {
      status.textContent = "Reason: Family members aren't allowed to pay with money.";
      status.className = 'payment-status reason';
    }, 3000);

    setTimeout(() => {
      chipsWrap.hidden = false;
      requestAnimationFrame(() => chipsWrap.classList.add('show'));
      PAYMENT_CHIPS.forEach((label, i) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = label;
        chip.style.animationDelay = (i * 0.12) + 's';
        chipsRow.appendChild(chip);
      });
    }, 4000);

    setTimeout(() => {
      finalMsg.hidden = false;
      requestAnimationFrame(() => finalMsg.classList.add('show'));
      fireConfettiBurst();
    }, 5600);

    setTimeout(() => {
      const inner = document.getElementById('postcreditsInner');
      inner.style.transition = 'opacity 0.6s ease';
      inner.style.opacity = '0';
      endCard.hidden = false;
      requestAnimationFrame(() => endCard.classList.add('show'));
    }, 8200);
  }

  qrImage.addEventListener('click', runSequence);
  payBtn.addEventListener('click', runSequence);
}

/* -------------------------------------------------------------------------
   16. EASTER EGG — 5 clicks on floating cake = secret fireworks
   ------------------------------------------------------------------------- */
function initEasterEgg(){
  const cake = document.getElementById('floatingCake');
  const toast = document.getElementById('easterToast');
  let clicks = 0;
  let resetTimer;

  cake.addEventListener('click', () => {
    clicks++;
    cake.classList.remove('shake');
    void cake.offsetWidth;
    cake.classList.add('shake');

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { clicks = 0; }, 2500);

    if (clicks >= 5){
      clicks = 0;
      fireConfettiBurst();
      if (!REDUCED_MOTION) runFireworks(2500);
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3200);
    }
  });
}

/* -------------------------------------------------------------------------
   17. SCROLL REVEAL UTILITY
   ------------------------------------------------------------------------- */
function initScrollReveal(){
  const targets = document.querySelectorAll('.reveal-up');
  if (REDUCED_MOTION){
    targets.forEach(t => t.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(t => observer.observe(t));
}

function staggerReveal(selector){
  document.querySelectorAll(selector).forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = (i * 0.08) + 's';
    });
  });
}

/* -------------------------------------------------------------------------
   18. MAIN ORCHESTRATION
   ------------------------------------------------------------------------- */
function revealMainExperience(){
  const main = document.getElementById('mainExperience');
  const floatingCake = document.getElementById('floatingCake');

  main.style.display = 'block';
  floatingCake.style.display = 'flex';

  if (REDUCED_MOTION){
    main.style.opacity = '1';
  } else {
    main.style.transition = 'opacity 1.1s ease';
    requestAnimationFrame(() => { main.style.opacity = '1'; });
  }

  initScrollReveal();
  initJourneyScroll();
  initLetterTyping();
  initNavActiveState();
}

function handleOpenSurprise(){
  const introGate = document.getElementById('introGate');
  const btn = document.getElementById('openSurpriseBtn');
  btn.disabled = true;

  fireConfettiBurst();

  const audio = document.getElementById('bgMusic');
  const navMusicBtn = document.getElementById('musicToggleNav');
  audio.volume = 0.35;
  audio.play().then(() => {
    navMusicBtn.textContent = '🔊';
    navMusicBtn.setAttribute('aria-pressed', 'true');
  }).catch(() => { /* user can press the music button manually */ });

  if (!REDUCED_MOTION) runFireworks(3000);

  const waitTime = REDUCED_MOTION ? 400 : 1600;
  setTimeout(() => {
    introGate.classList.add('fading');
    setTimeout(() => {
      introGate.style.display = 'none';
      revealMainExperience();
      document.getElementById('home').scrollIntoView({ behavior: 'auto' });
    }, 950);
  }, waitTime);
}

/* -------------------------------------------------------------------------
   INIT — runs on DOM ready
   ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  buildEnvelopes();
  buildReasons();
  buildJourney();
  staggerReveal('.envelopes-grid');
  staggerReveal('.reasons-grid');

  initHeroDecor();
  initIntroParticles();
  initAmbientCanvas();
  initCursorGlow();
  initScrollProgress();
  initMusicToggle();
  initGiftBox();
  initMemoryLightboxControls();
  initPostCreditsPayment();
  initEasterEgg();

  document.getElementById('openSurpriseBtn').addEventListener('click', handleOpenSurprise);

  await runLoader();

  if (!REDUCED_MOTION){
    const introTargets = [
      { el: '.intro-eyebrow', delay: 200 },
      { el: '.intro-title', delay: 400 },
      { el: '.intro-sub', delay: 700 },
      { el: '.btn-glow', delay: 1000 },
    ];
    introTargets.forEach(({ el, delay }) => {
      const node = document.querySelector(el);
      if (!node) return;
      node.style.transition = 'opacity 0.85s ease, transform 0.85s cubic-bezier(.2,.8,.2,1)';
      node.style.transform = 'translateY(16px)';
      setTimeout(() => {
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
      }, delay);
    });
  } else {
    document.querySelectorAll('.intro-eyebrow, .intro-title, .intro-sub, .btn-glow').forEach(el => {
      el.style.opacity = '1';
    });
  }
});
