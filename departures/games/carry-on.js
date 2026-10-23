/* Carry-On: pack everything into the bag. Twelve levels, every one solvable.
   Each level is made by cutting the bag into pieces, so there is always a perfect fit.
   Drag items into the bag; tap an item to rotate it; drag it out to take it back. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const store = AM.store;

  const LEVELS = [[4, 3], [4, 4], [5, 4], [5, 5], [6, 4], [6, 5], [6, 6], [7, 5], [7, 6], [7, 7], [8, 6], [8, 7]];
  const COLORS = ['#ff8a2a', '#45b4ff', '#7ad957', '#ffd23f', '#c084fc', '#ff5d73', '#2dd4bf', '#f0abfc', '#a3e635', '#fb923c', '#60a5fa', '#e5e7eb', '#fca5a5', '#fde68a'];
  const ITEMS = { 1: ['🧦', '🔑', '💊'], 2: ['🕶️', '🪥', '🧴', '📱'], 3: ['👟', '📷', '🎧', '🧢'], 4: ['📚', '👕', '🏀', '💻'], 5: ['🧥', '☂️', '🎒', '👖'], 6: ['🛹', '🎸'] };

  /* ---------- seeded randomness so level 7 is always level 7 ---------- */
  function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ---------- cut a W×H bag into pieces of 3–5 cells ---------- */
  function cut(Wd, Hd, rand) {
    const id = Array.from({ length: Hd }, () => Array(Wd).fill(-1));
    const pieces = [];
    const nb = (x, y) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < Wd && b < Hd);
    for (let y = 0; y < Hd; y++) for (let x = 0; x < Wd; x++) {
      if (id[y][x] !== -1) continue;
      const k = pieces.length, cells = [[x, y]], want = rand() < 0.2 ? 3 : rand() < 0.6 ? 4 : 5;
      id[y][x] = k;
      while (cells.length < want) {
        const front = [];
        cells.forEach(([cx, cy]) => nb(cx, cy).forEach(([a, b]) => { if (id[b][a] === -1) front.push([a, b]); }));
        if (!front.length) break;
        const [a, b] = front[Math.floor(rand() * front.length)];
        id[b][a] = k; cells.push([a, b]);
      }
      pieces.push(cells);
    }
    // fold scraps (1–2 cells) into the smallest neighbouring piece
    for (let k = 0; k < pieces.length; k++) {
      const p = pieces[k];
      if (!p || p.length > 2) continue;
      let host = -1;
      p.forEach(([x, y]) => nb(x, y).forEach(([a, b]) => { const o = id[b][a]; if (o !== k && pieces[o] && pieces[o].length + p.length <= 6 && (host === -1 || pieces[o].length < pieces[host].length)) host = o; }));
      if (host === -1) continue;
      p.forEach(([x, y]) => { id[y][x] = host; pieces[host].push([x, y]); });
      pieces[k] = null;
    }
    return pieces.filter(Boolean);
  }

  const norm = (cells) => { const mx = Math.min(...cells.map((c) => c[0])), my = Math.min(...cells.map((c) => c[1])); return cells.map(([x, y]) => [x - mx, y - my]); };
  const rot = (cells) => norm(cells.map(([x, y]) => [-y, x]));
  const dims = (cells) => [Math.max(...cells.map((c) => c[0])) + 1, Math.max(...cells.map((c) => c[1])) + 1];

  /* ---------- level state ---------- */
  let L, Wd, Hd, pieces, board, moves, hints, t0, timer, won;
  const done = (() => { try { return JSON.parse(store.get('co_done')) || {}; } catch { return {}; } })();
  const unlocked = () => Math.min(LEVELS.length, Object.keys(done).length + 1);

  const caseEl = $('#coCase'), trayEl = $('#coTray');
  let C = 48, TS = 0.62;   // cell size in px, tray scale

  function load(level) {
    L = level; [Wd, Hd] = LEVELS[L - 1];
    const rand = rng(L * 7919 + 2332);
    const used = {};
    pieces = cut(Wd, Hd, rand).map((cells, i) => {
      const n = cells.length, pool = ITEMS[Math.min(6, n)];
      const item = pool[(used[n] = (used[n] || 0) + 1) % pool.length];
      const anchor = [Math.min(...cells.map((c) => c[0])), Math.min(...cells.map((c) => c[1]))];
      let shape = norm(cells);
      const sol = { shape, anchor };
      const turns = Math.floor(rand() * 4);
      for (let r = 0; r < turns; r++) shape = rot(shape);
      return { i, shape, sol, color: COLORS[i % COLORS.length], item, at: null, el: null };
    });
    // shuffle the tray order
    for (let i = pieces.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pieces[i], pieces[j]] = [pieces[j], pieces[i]]; }
    board = Array.from({ length: Hd }, () => Array(Wd).fill(null));
    moves = 0; hints = 0; t0 = null; won = false;
    paintHint();
    clearInterval(timer); timer = setInterval(paintClock, 250);
    $('#coWin').hidden = true;
    $('#coLevel').textContent = `Bag ${L} of ${LEVELS.length}`;
    $('#coSize').textContent = `${Wd} × ${Hd} · ${pieces.length} items`;
    layout();
    paintLevels();
    paintClock();
  }

  /* ---------- sizing ---------- */
  function layout() {
    const stageW = $('.co-stage').clientWidth;
    const avail = innerWidth < 860 ? stageW - 24 : Math.min(600, stageW * 0.56);
    // on phones, keep the bag short enough that the tray stays in reach
    const tall = innerWidth < 860 ? Math.floor((innerHeight * 0.34) / Hd) : 64;
    C = Math.max(30, Math.min(64, tall, Math.floor(avail / Wd)));
    TS = innerWidth < 760 ? 0.56 : 0.72;
    caseEl.style.setProperty('--c', C + 'px');
    caseEl.style.width = Wd * C + 'px';
    caseEl.style.height = Hd * C + 'px';
    render();
  }
  addEventListener('resize', () => { clearTimeout(layout.t); layout.t = setTimeout(layout, 120); });

  /* ---------- drawing a piece ---------- */
  function drawPiece(p, c) {
    const el = p.el || (p.el = document.createElement('div'));
    el.className = 'co-piece';
    el.style.setProperty('--pc', p.color);
    const [w, h] = dims(p.shape);
    el.style.width = w * c + 'px'; el.style.height = h * c + 'px';
    const set = new Set(p.shape.map(([x, y]) => x + ',' + y));
    // label goes in the cell closest to the middle of the item
    const mx = p.shape.reduce((s, q) => s + q[0], 0) / p.shape.length, my = p.shape.reduce((s, q) => s + q[1], 0) / p.shape.length;
    let lab = p.shape[0], ld = 1e9;
    p.shape.forEach((q) => { const d = (q[0] - mx) ** 2 + (q[1] - my) ** 2; if (d < ld) { ld = d; lab = q; } });
    el.innerHTML = p.shape.map(([x, y]) => {
      const e = (dx, dy) => set.has((x + dx) + ',' + (y + dy));
      const cls = ['co-cell', e(0, -1) ? '' : 'bt', e(1, 0) ? '' : 'br', e(0, 1) ? '' : 'bb', e(-1, 0) ? '' : 'bl'].join(' ');
      const label = x === lab[0] && y === lab[1] ? `<span style="font-size:${Math.round(c * 0.52)}px">${p.item}</span>` : '';
      return `<i class="${cls}" style="left:${x * c}px;top:${y * c}px;width:${c}px;height:${c}px">${label}</i>`;
    }).join('');
    return el;
  }

  function render() {
    caseEl.querySelectorAll('.co-piece').forEach((e) => e.remove());
    trayEl.innerHTML = '';
    pieces.forEach((p) => {
      if (p.at) {
        const el = drawPiece(p, C);
        el.style.left = p.at[0] * C + 'px'; el.style.top = p.at[1] * C + 'px';
        caseEl.appendChild(el);
      } else {
        const slot = document.createElement('div');
        slot.className = 'co-slot';
        const [w, h] = dims(p.shape);
        slot.style.width = w * C * TS + 'px'; slot.style.height = h * C * TS + 'px';
        slot.appendChild(drawPiece(p, C * TS));
        p.el.style.left = 0; p.el.style.top = 0;
        trayEl.appendChild(slot);
      }
      wire(p);
    });
    const left = pieces.filter((p) => !p.at).length;
    $('#coLeft').textContent = left ? `${left} item${left === 1 ? '' : 's'} to pack` : '';
  }

  /* ---------- fitting ---------- */
  function fits(p, shape, ax, ay) {
    return shape.every(([x, y]) => { const gx = ax + x, gy = ay + y; return gx >= 0 && gy >= 0 && gx < Wd && gy < Hd && (board[gy][gx] === null || board[gy][gx] === p.i); });
  }
  function lift(p) { if (!p.at) return; p.shape.forEach(([x, y]) => { board[p.at[1] + y][p.at[0] + x] = null; }); p.at = null; }
  function drop(p, ax, ay) { p.at = [ax, ay]; p.shape.forEach(([x, y]) => { board[ay + y][ax + x] = p.i; }); }

  /* ---------- drag, drop, tap to rotate ---------- */
  function wire(p) {
    p.el.onpointerdown = (e) => {
      if (won) return;
      e.preventDefault();
      const r = p.el.getBoundingClientRect();
      const scaleNow = p.at ? 1 : TS;
      const g = { x0: e.clientX, y0: e.clientY, ox: (e.clientX - r.left) / scaleNow, oy: (e.clientY - r.top) / scaleNow, moved: false };
      const move = (ev) => {
        if (!g.moved && Math.hypot(ev.clientX - g.x0, ev.clientY - g.y0) < 6) return;
        if (!g.moved) {
          g.moved = true;
          g.from = p.at ? [...p.at] : null;
          lift(p);
          drawPiece(p, C);
          p.el.classList.add('dragging');
          document.body.appendChild(p.el);
        }
        p.el.style.left = ev.clientX - g.ox + 'px';
        p.el.style.top = ev.clientY - g.oy + 'px';
        // nudge the page when dragging near the top or bottom edge
        if (ev.clientY < 70) scrollBy(0, -14); else if (ev.clientY > innerHeight - 70) scrollBy(0, 14);
        ghost(p, ev);
      };
      const up = (ev) => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
        clearGhost();
        if (!g.moved) { turn(p); return; }
        p.el.classList.remove('dragging');
        const spot = target(p, ev);
        if (spot && fits(p, p.shape, spot[0], spot[1])) { drop(p, spot[0], spot[1]); count(); }
        p.el.remove();
        render();
        check();
      };
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    };
  }
  function target(p, ev) {
    const cr = caseEl.getBoundingClientRect();
    const left = parseFloat(p.el.style.left), top = parseFloat(p.el.style.top);
    const ax = Math.round((left - cr.left) / C), ay = Math.round((top - cr.top) / C);
    const [w, h] = dims(p.shape);
    // only snap when the item is actually over the bag
    if (ev.clientX < cr.left - C || ev.clientX > cr.right + C || ev.clientY < cr.top - C || ev.clientY > cr.bottom + C) return null;
    return ax > -w && ay > -h ? [ax, ay] : null;
  }
  function ghost(p, ev) {
    clearGhost();
    const spot = target(p, ev);
    if (!spot) return;
    const ok = fits(p, p.shape, spot[0], spot[1]);
    p.shape.forEach(([x, y]) => {
      const gx = spot[0] + x, gy = spot[1] + y;
      if (gx < 0 || gy < 0 || gx >= Wd || gy >= Hd) return;
      const d = document.createElement('b');
      d.className = 'co-ghost ' + (ok ? 'ok' : 'no');
      d.style.cssText = `left:${gx * C}px;top:${gy * C}px;width:${C}px;height:${C}px`;
      caseEl.appendChild(d);
    });
  }
  function clearGhost() { caseEl.querySelectorAll('.co-ghost').forEach((d) => d.remove()); }

  function turn(p) {
    const next = rot(p.shape);
    if (p.at) {
      const [ax, ay] = p.at;
      lift(p);
      // rotate about the item's middle, nudging it to stay inside the bag if it can
      const [w, h] = dims(p.shape), [nw, nh] = dims(next);
      const cx = ax + Math.round((w - nw) / 2), cy = ay + Math.round((h - nh) / 2);
      const tries = [[cx, cy], [ax, ay], [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
      p.shape = next;
      const ok = tries.find(([x, y]) => fits(p, next, x, y));
      if (ok) drop(p, ok[0], ok[1]);
    } else p.shape = next;
    count();
    render();
    check();
  }

  function count() { moves++; if (!t0) t0 = performance.now(); }

  /* ---------- hint: one item goes exactly where it belongs ---------- */
  const MAX_HINTS = 3;
  const paintHint = () => { const b = $('#coHint'); b.textContent = `Hint · ${MAX_HINTS - hints}`; b.disabled = hints >= MAX_HINTS; };
  $('#coHint').addEventListener('click', () => {
    if (won || hints >= MAX_HINTS) return;
    const wrong = pieces.filter((p) => !(p.at && p.at[0] === p.sol.anchor[0] && p.at[1] === p.sol.anchor[1] && p.shape.join() === p.sol.shape.join()));
    if (!wrong.length) return;
    const p = wrong[Math.floor(Math.random() * wrong.length)];
    lift(p);
    p.shape = p.sol.shape;
    // clear anything sitting in its way
    p.shape.forEach(([x, y]) => { const o = board[p.sol.anchor[1] + y][p.sol.anchor[0] + x]; if (o !== null) lift(pieces.find((q) => q.i === o)); });
    drop(p, p.sol.anchor[0], p.sol.anchor[1]);
    hints++; count(); paintHint();
    render();
    p.el.animate([{ filter: 'brightness(1.8)' }, { filter: 'none' }], { duration: 700 });
    check();
  });
  $('#coReset').addEventListener('click', () => { if (won) return; pieces.forEach(lift); render(); });

  /* ---------- clock, win ---------- */
  const secs = () => (t0 ? Math.floor((performance.now() - t0) / 1000) : 0);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function paintClock() { if (!won) $('#coClock').textContent = fmt(secs()); }

  function check() {
    if (won || pieces.some((p) => !p.at)) return;
    won = true;
    clearInterval(timer);
    const s = secs();
    const prev = done[L];
    if (!hints && (prev === undefined || prev === null || s < prev)) done[L] = s;
    else if (prev === undefined) done[L] = null;   // finished, but with hints: unlocks, no best time
    store.set('co_done', JSON.stringify(done));
    caseEl.classList.add('zipped');
    setTimeout(() => caseEl.classList.remove('zipped'), 900);
    $('#coWinTitle').textContent = L === LEVELS.length ? 'Every bag packed.' : 'Zipped.';
    $('#coWinMsg').textContent = `${fmt(s)} · ${moves} moves${hints ? ` · ${hints} hint${hints === 1 ? '' : 's'}` : ''}${done[L] !== null && done[L] !== undefined ? ` · best ${fmt(done[L])}` : ''}`;
    $('#coNext').hidden = L === LEVELS.length;
    $('#coWin').hidden = false;
    AM.confetti('party', L === LEVELS.length ? 220 : 70);
    if (L >= 6 && !hints) AM.findEgg('carryon');   // the egg wants a clean pack
    paintLevels();
  }
  $('#coNext').addEventListener('click', () => load(Math.min(LEVELS.length, L + 1)));
  $('#coAgain').addEventListener('click', () => load(L));

  function paintLevels() {
    const host = $('#coLevels');
    host.innerHTML = LEVELS.map((_, i) => {
      const n = i + 1, ok = n <= unlocked(), d = done[n];
      return `<button type="button" data-l="${n}"${ok ? '' : ' disabled'}${n === L ? ' aria-current="true"' : ''} title="${d !== undefined ? (d === null ? 'Packed with hints' : 'Best ' + fmt(d)) : ok ? 'Not packed yet' : 'Locked'}">${d !== undefined ? '✓' : ok ? n : '🔒'}</button>`;
    }).join('');
  }
  $('#coLevels').addEventListener('click', (e) => { const b = e.target.closest('button[data-l]'); if (b && !b.disabled) load(+b.dataset.l); });

  load(Math.min(unlocked(), LEVELS.length));
})();
