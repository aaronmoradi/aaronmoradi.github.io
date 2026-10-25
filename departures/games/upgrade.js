/* Upgrade: slide the seats, merge matching fare classes, climb from standby to the Moon.
   2048 rules on a 4x4 cabin: arrows/WASD or swipe; equal tiles merge into the next class up.
   Miles = points from merges. One undo per flight. Best miles and best class stay in this browser. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const N = 4;
  const store = AM.store;
  // real fare-class codes where they exist (Y, W, J, F), then it gets silly
  const TIERS = {
    2: ['SBY', 'Standby'], 4: ['Y', 'Economy'], 8: ['W', 'Premium'], 16: ['J', 'Business'], 32: ['F', 'First'],
    64: ['R', 'Residence'], 128: ['PVT', 'Private jet'], 256: ['SST', 'Concorde'], 512: ['LEO', 'Low orbit'],
    1024: ['ISS', 'Space station'], 2048: ['MOON', 'The Moon'], 4096: ['MARS', 'Mars'], 8192: ['∞', 'Beyond'],
  };
  const tier = (v) => TIERS[v] || ['∞', 'Beyond'];

  const board = $('#upBoard'), layer = $('#upTiles');
  let grid, tiles, score, best = +store.get('up_best', 0) || 0, bestTile = +store.get('up_tile', 0) || 0, undo, undosLeft, over, won, seq = 0, busy = false;

  for (let i = 0; i < N * N; i++) { const c = document.createElement('i'); c.className = 'up-cell'; $('#upCells').appendChild(c); }

  function newGame() {
    grid = Array.from({ length: N }, () => Array(N).fill(null));
    tiles = []; score = 0; undo = null; undosLeft = 1; over = false; won = false;
    layer.innerHTML = '';
    spawn(); spawn();
    paint();
    $('#upOver').hidden = true;
  }

  function empties() { const e = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!grid[y][x]) e.push([x, y]); return e; }
  function spawn() {
    const e = empties(); if (!e.length) return;
    const [x, y] = e[Math.floor(Math.random() * e.length)];
    const t = { id: ++seq, v: Math.random() < 0.9 ? 2 : 4, x, y, fresh: true };
    grid[y][x] = t; tiles.push(t);
  }

  function tileEl(t) {
    if (!t.el) {
      t.el = document.createElement('div');
      t.el.className = 'up-tile';
      layer.appendChild(t.el);
    }
    const [code, name] = tier(t.v);
    if (t.el._v !== t.v) {
      t.el._v = t.v;
      t.el.dataset.v = t.v;
      t.el.innerHTML = `<b>${code}</b><span>${name}</span><small>${t.v}</small>`;
    }
    t.el.style.setProperty('--x', t.x); t.el.style.setProperty('--y', t.y);
    return t.el;
  }

  function paint() {
    tiles.forEach((t) => {
      const el = tileEl(t);
      if (t.fresh) { el.classList.add('new'); t.fresh = false; setTimeout(() => el.classList.remove('new'), 200); }
    });
    $('#upScore').textContent = score.toLocaleString();
    $('#upBest').textContent = best.toLocaleString();
    const top = Math.max(...tiles.map((t) => t.v));
    $('#upTop').textContent = tier(top)[1];
    $('#upUndo').textContent = `Undo · ${undosLeft}`;
    $('#upUndo').disabled = !undo || !undosLeft;
  }

  function snapshot() { return { vals: grid.map((r) => r.map((t) => (t ? t.v : 0))), score }; }
  function restore(s) {
    layer.innerHTML = ''; tiles = [];
    grid = s.vals.map((r, y) => r.map((v, x) => { if (!v) return null; const t = { id: ++seq, v, x, y }; tiles.push(t); return t; }));
    score = s.score; over = false;
    $('#upOver').hidden = true;
    paint();
  }

  function move(dir) {
    if (busy || over) return;
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][dir];
    const xs = [0, 1, 2, 3], ys = [0, 1, 2, 3];
    if (dx === 1) xs.reverse();
    if (dy === 1) ys.reverse();
    const before = snapshot();
    const merged = new Set(), dying = [];
    let moved = false, gained = 0;
    for (const y of ys) for (const x of xs) {
      const t = grid[y][x];
      if (!t) continue;
      let cx = x, cy = y, into = null;
      for (;;) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) break;
        const o = grid[ny][nx];
        if (!o) { cx = nx; cy = ny; continue; }
        if (o.v === t.v && !merged.has(o)) into = o;
        break;
      }
      if (into) {
        grid[y][x] = null;
        t.x = into.x; t.y = into.y;
        merged.add(into); dying.push(t);
        into.next = into.v * 2;
        gained += into.next;
        moved = true;
      } else if (cx !== x || cy !== y) {
        grid[y][x] = null; grid[cy][cx] = t; t.x = cx; t.y = cy; moved = true;
      }
    }
    if (!moved) { board.animate([{ transform: 'translateX(0)' }, { transform: `translate(${dx * 5}px, ${dy * 5}px)` }, { transform: 'translateX(0)' }], { duration: 140 }); return; }
    undo = before;
    busy = true;
    paint();
    setTimeout(() => {
      dying.forEach((t) => { t.el.remove(); tiles.splice(tiles.indexOf(t), 1); });
      merged.forEach((o) => { o.v = o.next; delete o.next; tileEl(o); o.el.classList.add('pop'); setTimeout(() => o.el.classList.remove('pop'), 200); });
      score += gained;
      if (score > best) { best = score; store.set('up_best', String(best)); }
      const top = Math.max(...tiles.map((t) => t.v));
      if (top > bestTile) { bestTile = top; store.set('up_tile', String(top)); }
      if (gained) $('#upScore').animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 200 });
      if (!won && top >= 2048) { won = true; AM.confetti('party', 200); AM.toast('<span><b>The Moon.</b> Nobody gets upgraded this far. Keep going if you dare.</span>', 6000); }
      else if (top >= 256 && !store.get('up_sst')) { store.set('up_sst', '1'); AM.toast('<span>Concorde. Mach 2, champagne, no line at security.</span>'); }
      spawn();
      paint();
      busy = false;
      if (stuck()) gameOver();
    }, 115);
  }

  function stuck() {
    if (empties().length) return false;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = grid[y][x].v;
      if ((x < N - 1 && grid[y][x + 1].v === v) || (y < N - 1 && grid[y + 1][x].v === v)) return false;
    }
    return true;
  }
  function gameOver() {
    over = true;
    const top = Math.max(...tiles.map((t) => t.v));
    $('#upOverTitle').textContent = 'Cabin full';
    $('#upOverMsg').innerHTML = `You reached <b>${tier(top)[1]}</b> with ${score.toLocaleString()} miles.${score >= best ? '<br>New best.' : ''}`;
    $('#upOver').hidden = false;
    $('#upAgain').focus();
  }

  /* ---------- input ---------- */
  const KEYS = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3, W: 0, D: 1, S: 2, A: 3 };
  addEventListener('keydown', (e) => {
    if (document.querySelector('.term.open') || e.target.closest?.('input, textarea')) return;
    if (e.key in KEYS) { e.preventDefault(); move(KEYS[e.key]); }
  });
  let sw = null;
  board.addEventListener('pointerdown', (e) => { sw = { x: e.clientX, y: e.clientY }; board.setPointerCapture(e.pointerId); });
  board.addEventListener('pointerup', (e) => {
    if (!sw) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    sw = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
  });
  $('#upNew').addEventListener('click', newGame);
  $('#upAgain').addEventListener('click', newGame);
  $('#upUndo').addEventListener('click', () => { if (undo && undosLeft && !busy) { undosLeft--; restore(undo); undo = null; paint(); } });

  // the legend: every class, in order
  $('#upLegend').innerHTML = Object.entries(TIERS).slice(0, 11).map(([v, [c, n]]) => `<span data-v="${v}"><b>${c}</b>${n}</span>`).join('');

  newGame();
})();
