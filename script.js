/* ===== CONFIG ===== */
const CONFIG = {
  CA: '0xb200000000000000000000a873a273d0b513dc01',
  CHAIN: 'base',
  X: 'https://x.com/pumpe_base',
  TG: ''
};

(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CA_RE = /^0x[a-fA-F0-9]{40}$/;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;
  const damp = (touch || narrow) ? 0.45 : 1;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGSAP && !reduce;
  if (!animate) document.documentElement.classList.add('no-anim');

  // testing hook: ?ca=0x...
  try { const q = new URLSearchParams(location.search).get('ca'); if (q) CONFIG.CA = q; } catch (e) {}

  /* ===== Links & CA ===== */
  const validCA = () => CA_RE.test(CONFIG.CA);
  function links() {
    const ca = validCA() ? CONFIG.CA : '0xb200000000000000000000a873a273d0b513dc01';
    return {
      buy: 'https://app.uniswap.org/swap?chain=' + CONFIG.CHAIN + '&outputCurrency=' + ca,
      chart: 'https://dexscreener.com/' + CONFIG.CHAIN + '/' + ca,
      x: CONFIG.X,
      tg: CONFIG.TG
    };
  }
  function applyConfig() {
    const L = links();
    $$('[data-link]').forEach(a => {
      const k = a.getAttribute('data-link');
      if (L[k]) a.setAttribute('href', L[k]); else a.removeAttribute('href');
    });
    $$('[data-ca]').forEach(el => { el.textContent = validCA() ? CONFIG.CA : '0xb200000000000000000000a873a273d0b513dc01'; });
    const frame = $('#dexFrame'), ov = $('#tvOverlay');
    if (validCA()) {
      const src = 'https://dexscreener.com/base/' + CONFIG.CA + '?embed=1&theme=dark&trades=0&info=0';
      if (frame.getAttribute('src') !== src) frame.setAttribute('src', src);
      ov.hidden = true; ov.style.display = 'none';
    } else {
      frame.removeAttribute('src'); ov.hidden = false; ov.style.display = '';
    }
  }
  window.PUMPE_setCA = function (ca) { CONFIG.CA = ca; applyConfig(); };
  applyConfig();

  /* ===== Toast + Copy ===== */
  const toast = $('#toast'); let tT;
  function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tT); tT = setTimeout(() => toast.classList.remove('show'), 2200); }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove(); return ok;
  }
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const text = validCA() ? CONFIG.CA : '0xb200000000000000000000a873a273d0b513dc01';
    let ok = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; } } catch (e) {}
    if (!ok) ok = fallbackCopy(text);
    window.__lastCopied = text;
    if (!validCA()) say('CA is 0xb200000000000000000000a873a273d0b513dc01. Check our X for launch.');
    else say(ok ? 'CA copied. Treat secured.' : 'Copy failed. Select it manually.');
  }));

  /* ===== Confetti (cartoon candy) ===== */
  const cv = $('#confetti'), cx = cv.getContext('2d'); let parts = [], raf = 0;
  function sizeCv() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
  sizeCv(); addEventListener('resize', sizeCv);
  const COLS = ['#ff7a18', '#0052FF', '#ff4fa3', '#7dff5a', '#ffd23f', '#a77bff'];
  function burst(x, y, n) {
    if (reduce) return;
    n = Math.round(n * (narrow ? 0.5 : 1));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 6 + Math.random() * 12;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 8, r: 7 + Math.random() * 7, c: COLS[i % COLS.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, t: Math.random() < .5 ? 0 : 1, life: 0 });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    const d = devicePixelRatio; cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => {
      p.vy += .45; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
      cx.save(); cx.translate(p.x * d, p.y * d); cx.rotate(p.rot); cx.scale(d, d);
      cx.lineWidth = 2.5; cx.strokeStyle = '#120a22'; cx.fillStyle = p.c;
      if (p.t === 0) { // wrapped candy
        cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * .7, 0, 0, 7); cx.fill(); cx.stroke();
        cx.beginPath(); cx.moveTo(-p.r, 0); cx.lineTo(-p.r * 1.8, -p.r * .6); cx.lineTo(-p.r * 1.8, p.r * .6); cx.closePath(); cx.fill(); cx.stroke();
        cx.beginPath(); cx.moveTo(p.r, 0); cx.lineTo(p.r * 1.8, -p.r * .6); cx.lineTo(p.r * 1.8, p.r * .6); cx.closePath(); cx.fill(); cx.stroke();
      } else { // candy corn
        cx.beginPath(); cx.moveTo(0, -p.r * 1.2); cx.lineTo(p.r, p.r); cx.lineTo(-p.r, p.r); cx.closePath(); cx.fillStyle = '#ffd23f'; cx.fill(); cx.stroke();
        cx.fillStyle = '#ff7a18'; cx.fillRect(-p.r * .75, p.r * .1, p.r * 1.5, p.r * .55);
      }
      cx.restore();
    });
    parts = parts.filter(p => p.y < innerHeight + 60 && p.life < 260);
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!parts.length) cx.clearRect(0, 0, cv.width, cv.height);
  }

  /* ===== Lenis ===== */
  let lenis = null;
  if (animate && !touch && !narrow && typeof window.Lenis !== 'undefined') {
    try {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
      lenis.stop();
    } catch (e) { lenis = null; }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const t = id.length > 1 && $(id); if (!t) return;
    e.preventDefault(); closeBag();
    if (lenis) lenis.scrollTo(t, { offset: -10 }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ===== Mobile candy bag menu ===== */
  const bagBtn = $('#bagBtn'), bag = $('#bagSheet');
  function closeBag() { bag.hidden = true; bagBtn.setAttribute('aria-expanded', 'false'); }
  bagBtn.addEventListener('click', () => { const o = bag.hidden; bag.hidden = !o; bagBtn.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBag(); });

  /* ===== Intro ===== */
  const intro = $('#intro');
  function enter(trick) {
    const finish = () => {
      intro.classList.add('gone'); document.body.classList.remove('is-locked');
      if (lenis) lenis.start(); if (hasGSAP) ScrollTrigger.refresh(); heroIn();
    };
    if (trick && !reduce) {
      const boo = $('#boo'); boo.style.display = 'flex';
      if (animate) gsap.fromTo('#boo img', { scale: .2, rotation: -20 }, { scale: 1, rotation: 0, duration: .45, ease: 'back.out(3)' });
      setTimeout(() => {
        boo.style.display = 'none'; finish(); burst(innerWidth / 2, innerHeight / 2, 60);
      }, 1300);
    } else {
      if (animate) gsap.to(intro, { opacity: 0, duration: .5, onComplete: finish }); else finish();
      burst(innerWidth / 2, innerHeight * .55, 110);
    }
  }
  function showAsk() { const a = $('#introAsk'); a.classList.add('show'); a.style.opacity = 1; a.style.transform = 'none'; $('#btnTreat').focus({ preventScroll: true }); }
  let opened = false;
  function openDoor() {
    if (opened) return; opened = true;
    if (!animate) { $('#door').style.transform = 'perspective(900px) rotateY(-100deg)'; const f = $('.intro-frog'); f.style.opacity = 1; f.style.transform = 'translate(-50%,0) scale(1)'; showAsk(); return; }
    const tl = gsap.timeline();
    tl.to('#door', { rotateY: -108, duration: 1.1, ease: 'power2.inOut' })
      .to('.intro-frog', { opacity: 1, y: 0, yPercent: 0, xPercent: 0, transform: 'translate(-50%,0) scale(1)', duration: .6, ease: 'back.out(2.2)' }, '-=.45')
      .fromTo('#introAsk', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .4, onComplete: showAsk });
  }
  if (!hasGSAP) { // static fallback: no intro at all
    intro.classList.add('gone'); document.body.classList.remove('is-locked');
  } else if (reduce) {
    openDoor();
  } else {
    const tl = gsap.timeline({ delay: .5 });
    tl.to('.k1', { opacity: 1, scale: 1.2, duration: .15, yoyo: true, repeat: 1 })
      .to('#door', { x: -4, duration: .05, yoyo: true, repeat: 3 }, '<')
      .to('.k2', { opacity: 1, scale: 1.2, duration: .15, yoyo: true, repeat: 1 }, '+=.25')
      .to('#door', { x: 4, duration: .05, yoyo: true, repeat: 3 }, '<')
      .to(['.k1', '.k2'], { opacity: 0, duration: .3 })
      .add(openDoor, '+=.1');
  }
  $('#doorbell').addEventListener('click', () => { openDoor(); });
  $('#btnTreat').addEventListener('click', () => enter(false));
  $('#btnTrick').addEventListener('click', () => enter(true));
  $('#introSkip').addEventListener('click', () => { opened = true; enter(false); });

  /* ===== Pause-offscreen helper ===== */
  function whenVisible(el, on, off) {
    if (!('IntersectionObserver' in window)) { on(); return; }
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? on() : off()), { rootMargin: '100px' }).observe(el);
  }

  /* ===== Hero: windows light up, boil filter ===== */
  const wins = $$('.street-svg .win');
  wins.forEach((w, i) => { if (i % 2 === 0) w.classList.add('lit'); });
  let winT = 0;
  if (!reduce) whenVisible($('#hero'), () => { if (!winT) winT = setInterval(() => { const w = wins[Math.floor(Math.random() * wins.length)]; w.classList.toggle('lit'); }, 700); }, () => { clearInterval(winT); winT = 0; });
  else wins.forEach(w => w.classList.add('lit'));

  const noise = $('#boilNoise');
  $$('.drip-title, .frog-main, .giant-bucket, .tv-body').forEach(el => el.classList.add('boil'));
  if (!reduce) {
    let seed = 1, bT = 0;
    const startB = () => { if (!bT) bT = setInterval(() => { seed = (seed % 4) + 1; noise.setAttribute('seed', seed); }, 150); };
    const stopB = () => { clearInterval(bT); bT = 0; };
    document.addEventListener('visibilitychange', () => document.hidden ? stopB() : startB());
    startB();
  }

  function heroIn() {
    if (!animate) return;
    gsap.from('.hero-copy > *', { y: 40 * damp, opacity: 0, stagger: .08, duration: .7, ease: 'back.out(1.6)', clearProps: 'all' });
    gsap.from('.frog-main', { y: 120 * damp, rotation: -8, opacity: 0, duration: .9, ease: 'back.out(1.8)', clearProps: 'opacity' });
  }

  /* ===== Floating cartoon ghosts + sparkles ===== */
  const GHOST = '<svg viewBox="0 0 60 70"><path d="M5 65V30a25 25 0 0 1 50 0v35l-8-6-8 6-8-6-8 6-8-6z" fill="#fff" stroke="#120a22" stroke-width="4" stroke-linejoin="round"/><ellipse cx="22" cy="30" rx="4" ry="6" fill="#120a22"/><ellipse cx="38" cy="30" rx="4" ry="6" fill="#120a22"/><ellipse cx="30" cy="44" rx="5" ry="4" fill="#120a22"/></svg>';
  const SPARK = '<svg viewBox="0 0 30 30"><path d="M15 0c2 9 6 13 15 15-9 2-13 6-15 15-2-9-6-13-15-15 9-2 13-6 15-15z" fill="#ffd23f" stroke="#120a22" stroke-width="2"/></svg>';
  function sprinkle(sec, list) {
    const els = list.map(([html, l, t, w]) => { const d = document.createElement('div'); d.className = 'floaty'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = html; Object.assign(d.style, { left: l, top: t, width: w + 'px' }); sec.appendChild(d); return d; });
    if (!animate) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
    els.forEach((e, i) => tl.to(e, { y: (i % 2 ? -26 : 22) * damp, x: (i % 2 ? 12 : -10) * damp, rotation: i % 2 ? 8 : -8, duration: 2.4 + i * .3, ease: 'sine.inOut' }, 0));
    whenVisible(sec, () => tl.play(), () => tl.pause());
  }
  sprinkle($('#hero'), [[GHOST, '6%', '16%', 54], [GHOST, '46%', '70%', 40], [SPARK, '58%', '22%', 26], [SPARK, '88%', '58%', 22]]);
  sprinkle($('#party'), [[GHOST, '8%', '30%', 60], [GHOST, '86%', '70%', 46], [SPARK, '20%', '12%', 30], [SPARK, '76%', '10%', 24], [SPARK, '12%', '64%', 22]]);
  sprinkle($('#tv'), [[GHOST, '4%', '20%', 46], [SPARK, '92%', '30%', 26]]);

  /* ===== Street: frog walks door to door ===== */
  const walker = $('#walker'), wrap = $('.street-wrap'), path = $('#walkPath'), psvg = $('.path-svg');
  const doors = $$('[data-door]');
  function placeWalker(p) {
    const len = path.getTotalLength(), pt = path.getPointAtLength(len * p);
    const w = psvg.getBoundingClientRect().width, h = wrap.offsetHeight;
    const x = (pt.x / 400 - .5) * w, y = (pt.y / 2000) * h - walker.offsetHeight * .5;
    walker.style.transform = 'translate(' + x + 'px,' + Math.max(0, Math.min(h - walker.offsetHeight, y)) + 'px)';
  }
  if (animate) {
    ScrollTrigger.create({ trigger: wrap, start: 'top 55%', end: 'bottom 55%', scrub: true, onUpdate: s => placeWalker(s.progress) });
    placeWalker(0);
    doors.forEach(d => ScrollTrigger.create({ trigger: d, start: 'top 62%', onEnter: () => { d.classList.add('open'); const r = d.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 18); }, onLeaveBack: () => d.classList.remove('open') }));
    $$('.tdoor-leaf').forEach(l => l.style.transition = 'transform .9s cubic-bezier(.5,1.6,.5,1)');
  } else {
    doors.forEach(d => d.classList.add('open')); walker.style.display = 'none';
  }

  /* ===== Meme Bucket gallery ===== */
  const MEMES = [
    ['m01', 'Green candles only'], ['m02', 'Carved the chart'], ['m03', 'Scariest movie'], ['m04', 'Brewing based'], ['m05', 'Nobody knows I hold'],
    ['m06', 'Waiting for the moon'], ['m07', 'Based party'], ['m08', 'Heavy bags'], ['m09', 'Next stop: moon'], ['m10', 'Rug cemetery']
  ];
  const pile = $('#pile'), bucketBtn = $('#giantBucket'), left = $('#bucketLeft');
  let order = MEMES.map((m, i) => i); const pulled = [];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  function pull(quiet) {
    if (!order.length) { say('Bucket is empty. Happy Halloween.'); return; }
    const i = order.shift(); pulled.push(i);
    const [f, cap] = MEMES[i];
    const fig = document.createElement('figure'); fig.className = 'meme-card'; fig.tabIndex = 0; fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Open meme: ' + cap);
    fig.style.setProperty('--r', ((Math.random() * 8) - 4).toFixed(1) + 'deg');
    fig.innerHTML = '<img src="assets/memes/' + f + '.webp" alt="PUMPE meme: ' + cap + '" loading="lazy" width="900" height="900"><figcaption>' + cap + '</figcaption>';
    const idx = pulled.length - 1;
    fig.addEventListener('click', () => openLB(idx));
    fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(idx); } });
    pile.prepend(fig);
    left.textContent = order.length;
    if (!order.length) $('#pullBtn').disabled = $('#dumpBtn').disabled = true;
    if (animate && !quiet) {
      const b = bucketBtn.getBoundingClientRect(), c = fig.getBoundingClientRect();
      gsap.from(fig, { x: (b.left + b.width / 2) - (c.left + c.width / 2), y: (b.top + 60) - (c.top + c.height / 2), scale: .2, rotation: -40, duration: .75, ease: 'back.out(1.4)' });
      burst(b.left + b.width / 2, b.top + 80, 14);
    }
  }
  function shakeAndPull() {
    bucketBtn.classList.remove('shake'); void bucketBtn.offsetWidth; bucketBtn.classList.add('shake');
    setTimeout(() => pull(false), reduce ? 0 : 280);
  }
  bucketBtn.addEventListener('click', shakeAndPull);
  $('#pullBtn').addEventListener('click', shakeAndPull);
  $('#dumpBtn').addEventListener('click', () => { let k = 0; const n = order.length; const go = () => { if (k++ < n) { pull(false); setTimeout(go, reduce ? 0 : 120); } }; go(); });
  // drag-to-shake
  let drag = null;
  bucketBtn.addEventListener('pointerdown', e => { drag = { x: e.clientX, moves: 0 }; });
  addEventListener('pointermove', e => { if (!drag) return; if (Math.abs(e.clientX - drag.x) > 40) { drag.x = e.clientX; if (++drag.moves === 3) { shakeAndPull(); drag.moves = 0; } } });
  addEventListener('pointerup', () => { drag = null; });
  pull(true); pull(true); pull(true);

  /* lightbox */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'); let cur = 0, lastFocus = null;
  function showLB() { const [f, cap] = MEMES[pulled[cur]]; lbImg.src = 'assets/memes/' + f + '.webp'; lbImg.alt = 'PUMPE meme: ' + cap; lbCap.textContent = cap + '  (' + (cur + 1) + '/' + pulled.length + ')'; }
  function openLB(i) { cur = i; lastFocus = document.activeElement; showLB(); lb.hidden = false; if (lenis) lenis.stop(); $('.lb-close').focus(); }
  function closeLB() { lb.hidden = true; if (lenis) lenis.start(); if (lastFocus) lastFocus.focus(); }
  $('.lb-close').addEventListener('click', closeLB);
  $('.lb-prev').addEventListener('click', () => { cur = (cur - 1 + pulled.length) % pulled.length; showLB(); });
  $('.lb-next').addEventListener('click', () => { cur = (cur + 1) % pulled.length; showLB(); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') $('.lb-prev').click();
    if (e.key === 'ArrowRight') $('.lb-next').click();
  });

  /* ===== Nav active state ===== */
  const navLinks = $$('#candyNav a');
  const secs = navLinks.map(a => $(a.getAttribute('href')));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const i = secs.indexOf(e.target); navLinks.forEach((a, k) => a.classList.toggle('active', k === i)); } }), { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => s && io.observe(s));
  }

  /* ===== Scroll reveals (sticker slap) ===== */
  if (animate) {
    gsap.registerPlugin(ScrollTrigger);
    $$('.comic-h').forEach(h => gsap.from(h, { scale: .6, rotation: -6, opacity: 0, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: h, start: 'top 88%', once: true } }));
    gsap.from('.pose-st', { y: 60 * damp, rotation: 5, opacity: 0, stagger: .07, duration: .6, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.sticker-sheet', start: 'top 80%', once: true } });
    gsap.from('.panel', { y: 50 * damp, opacity: 0, stagger: .12, duration: .55, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.comic-strip', start: 'top 82%', once: true } });
    gsap.from('.nutrition', { rotation: -12, x: -60 * damp, opacity: 0, duration: .8, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.label-wrap', start: 'top 80%', once: true } });
    gsap.from('.wrapper-card', { x: 80 * damp, opacity: 0, stagger: .12, duration: .6, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.wrappers', start: 'top 85%', once: true } });
    gsap.from('.tv', { y: 80 * damp, rotation: 3, opacity: 0, duration: .8, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.tv', start: 'top 85%', once: true } });
    gsap.from('.ghost-img', { y: 60 * damp, opacity: 0, duration: .9, scrollTrigger: { trigger: '.ghost-card', start: 'top 80%', once: true } });
    const pt = gsap.timeline({ scrollTrigger: { trigger: '#party', start: 'top 70%', once: true } });
    pt.from('.party-moon', { scale: .4, opacity: 0, duration: 1, ease: 'back.out(1.4)' })
      .from('.p-frog', { y: 200, duration: .7, ease: 'back.out(1.7)' }, '-=.5')
      .from('.p-ghost', { y: 200, opacity: 0, duration: .7, ease: 'back.out(1.7)' }, '-=.5')
      .from('.p-broom', { x: 300, opacity: 0, duration: .9, ease: 'power3.out' }, '-=.4');
    const bob = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
    bob.to('.p-ghost', { y: -18 * damp, duration: 1.8, ease: 'sine.inOut' }, 0).to('.p-broom', { y: -24 * damp, x: -10 * damp, duration: 2.2, ease: 'sine.inOut' }, 0).to('.frog-main', { y: -10 * damp, duration: 2, ease: 'sine.inOut' }, 0);
    whenVisible($('#party'), () => bob.play(), () => bob.pause());
    // hero parallax on houses
    if (!touch) gsap.to('.houses', { y: 60, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    addEventListener('load', () => ScrollTrigger.refresh());
  }
})();
