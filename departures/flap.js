/* Split-flap engine for the Departures design.
   Each cell has four layers: a static top half (next char), a static bottom half (current char),
   a falling top leaf (current char) and a landing bottom leaf (next char). One "step" flips the
   cell to the next character in the drum; a cell walks the drum until it reaches its target. */
window.Flap = (() => {
  'use strict';
  const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:'&-/·!?";
  const STEP_MS = 64;          // one flap; matches --flap in departures.css
  const MAX_STEPS = 9;         // longest walk through the drum before landing
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const norm = (c) => (DRUM.includes(c) ? c : ' ');

  /* ---------- optional mechanical clack (Web Audio, generated, no files) ---------- */
  let sound = false, ctx = null, last = 0;
  function clack() {
    if (!sound) return;
    const now = performance.now();
    if (now - last < 14) return;   // dozens of flaps land together; one click per tick is plenty
    last = now;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const n = Math.floor(ctx.sampleRate * 0.014);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
      const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 1800 + Math.random() * 1400; bp.Q.value = 1.2; g.gain.value = 0.18;
      src.connect(bp).connect(g).connect(ctx.destination); src.start();
    } catch { /* audio unavailable */ }
  }

  function makeCell(ch) {
    const el = document.createElement('span');
    el.className = 'cell';
    el.innerHTML = '<span class="h t"><i></i></span><span class="h b"><i></i></span><span class="leaf lt"><i></i></span><span class="leaf lb"><i></i></span>';
    el._i = [...el.querySelectorAll('i')];
    el._l = [...el.querySelectorAll('.leaf')];
    paint(el, ch);
    return el;
  }
  function paint(el, ch) { el._c = ch; el._i.forEach((i) => { i.textContent = ch; }); }

  // Web Animations keep this off the layout path: hundreds of cells can flip at once without jank.
  const FALL = [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)', filter: 'brightness(.55)' }];
  const LAND = [{ transform: 'rotateX(90deg)', filter: 'brightness(1.5)' }, { transform: 'rotateX(0deg)' }];
  function step(el, next) {
    const [t, b, lt, lb] = el._i, [fl, ld] = el._l;
    t.textContent = next; b.textContent = el._c; lt.textContent = el._c; lb.textContent = next;
    fl.style.visibility = ld.style.visibility = 'visible';
    const half = STEP_MS / 2;
    const a1 = fl.animate(FALL, { duration: half, easing: 'ease-in', fill: 'forwards' });
    const a2 = ld.animate(LAND, { duration: half, delay: half, easing: 'ease-out', fill: 'both' });
    return a2.finished.then(() => {
      paint(el, next);
      fl.style.visibility = ld.style.visibility = '';
      a1.cancel(); a2.cancel();
      clack();
    });
  }

  async function flipTo(el, target, delay) {
    target = norm(target);
    el._target = target;
    if (reduce) { paint(el, target); return; }
    await new Promise((r) => setTimeout(r, delay));
    let from = DRUM.indexOf(el._c);
    const to = DRUM.indexOf(target);
    let dist = (to - from + DRUM.length) % DRUM.length;
    if (dist > MAX_STEPS) { from = (to - MAX_STEPS + DRUM.length) % DRUM.length; paint(el, DRUM[from]); dist = MAX_STEPS; }
    for (let k = 1; k <= dist; k++) {
      if (el._target !== target) return;            // a newer flip took over this cell
      await step(el, DRUM[(from + k) % DRUM.length]);
    }
  }

  /* A row of `len` cells inside `host`. set(text) flips it to the new text. */
  function row(host, len, initial = '') {
    host.classList.add('flaps');
    host.setAttribute('aria-hidden', 'true');
    const cells = Array.from({ length: len }, () => makeCell(' '));
    host.replaceChildren(...cells);
    const api = {
      cells,
      set(text, { stagger = 28, jitter = 60 } = {}) {
        const s = String(text).toUpperCase().padEnd(len).slice(0, len);
        return Promise.all(cells.map((c, i) => flipTo(c, s[i], i * stagger + Math.random() * jitter)));
      },
    };
    if (initial) api.set(initial);
    return api;
  }

  return {
    row,
    setSound(on) { sound = on; if (on) { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch {} } },
    get sound() { return sound; },
    reduce,
  };
})();
