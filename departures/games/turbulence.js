/* Turbulence: the red-eye home, through a storm.
   Hold (mouse, touch or space) to climb, let go to descend. Stay between the storm walls,
   pick up the gold miles, watch the lightning. The corridor narrows and speeds up as you go.
   Best distance stays in this browser. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const cv = $('#tb'), ctx = cv.getContext('2d');
  const W = 1000, H = 560, STEP = 24;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = AM.store;

  let state = 'title', best = +store.get('tb_best', 0) || 0;
  let plane, cave, coins, dist, bonus, speed, hold = false, flashK = 0, nextBolt = 3, parts = [], seed = 1;
  const hud = { score: $('#tbScore'), best: $('#tbBest'), over: $('#tbOver'), title: $('#tbTitle'), msg: $('#tbMsg'), btn: $('#tbBtn') };
  hud.best.textContent = best.toLocaleString();

  // smooth wandering corridor: each column is { top, bottom } in world y
  let mid, gapW, drift;
  function column(i) {
    const progress = Math.min(1, i / 900);
    gapW = 270 - progress * 120 + Math.sin(i / 23) * 18;
    drift += (Math.random() - 0.5) * 5 - (mid - H / 2) * 0.004;
    drift = Math.max(-4.5, Math.min(4.5, drift));
    mid = Math.max(gapW / 2 + 30, Math.min(H - gapW / 2 - 30, mid + drift));
    return { top: mid - gapW / 2, bottom: mid + gapW / 2, i };
  }
  function reset() {
    mid = H / 2; drift = 0; gapW = 270;
    cave = []; coins = []; parts = [];
    for (let i = 0; i < W / STEP + 3; i++) cave.push({ top: H / 2 - 160, bottom: H / 2 + 160, i });
    plane = { x: 200, y: H / 2, vy: 0 };
    dist = 0; bonus = 0; speed = 260; flashK = 0;
    paintHud();
  }
  const scoreNow = () => Math.floor(dist / 10) + bonus;
  function paintHud() { hud.score.textContent = scoreNow().toLocaleString(); }

  /* ---------- world ---------- */
  let offset = 0, colIndex = 0;
  function advance(dx) {
    offset += dx;
    while (offset >= STEP) {
      offset -= STEP;
      cave.shift();
      const c = column(++colIndex);
      cave.push(c);
      if (colIndex % 9 === 0 && Math.random() < 0.6) coins.push({ x: W + STEP * 2, y: c.top + 30 + Math.random() * (c.bottom - c.top - 60), got: false, k: 0 });
    }
    coins.forEach((c) => { c.x -= dx; });
    coins = coins.filter((c) => c.x > -30 && !(c.got && c.k > 0.5));
  }
  function wallsAt(x) {
    const f = (x + offset) / STEP, i = Math.floor(f), t = f - i;
    const a = cave[i] || cave[0], b = cave[i + 1] || a;
    return { top: a.top + (b.top - a.top) * t, bottom: a.bottom + (b.bottom - a.bottom) * t };
  }

  function update(dt) {
    speed = Math.min(520, 260 + dist / 90);
    const dx = speed * dt;
    dist += dx;
    advance(dx);
    plane.vy += (hold ? -1450 : 1100) * dt;
    plane.vy = Math.max(-420, Math.min(460, plane.vy));
    plane.y += plane.vy * dt;
    // exhaust
    if (!reduce && Math.random() < 0.7) parts.push({ x: plane.x - 16, y: plane.y + 2, k: 0 });
    parts.forEach((p) => { p.x -= dx + 30 * dt; p.k += dt; });
    parts = parts.filter((p) => p.k < 0.6);
    // coins
    coins.forEach((c) => { if (!c.got && Math.hypot(c.x - plane.x, c.y - plane.y) < 22) { c.got = true; bonus += 50; } if (c.got) c.k += dt; });
    // lightning
    nextBolt -= dt;
    if (nextBolt <= 0) { flashK = 1; nextBolt = 2 + Math.random() * 4; }
    flashK = Math.max(0, flashK - dt * 3);
    // collision: nose, belly and tail against the walls
    for (const [ox, oy] of [[14, 0], [-12, -5], [-12, 6], [0, 6], [0, -6]]) {
      const w = wallsAt(plane.x + ox), y = plane.y + oy;
      if (y < w.top || y > w.bottom) return crash();
    }
    paintHud();
  }

  function crash() {
    state = 'over';
    hold = false;
    const s = scoreNow();
    if (s > best) { best = s; store.set('tb_best', String(best)); hud.best.textContent = best.toLocaleString(); }
    flashK = 1;
    setTimeout(() => {
      if (state !== 'over') return;     // already back in the air
      hud.title.textContent = 'Diverted';
      hud.msg.innerHTML = `${s.toLocaleString()} miles through the storm.${s >= best && s > 0 ? '<br><b>Longest flight yet.</b>' : `<br>Best: ${best.toLocaleString()}.`}`;
      hud.btn.textContent = 'Try the route again';
      hud.over.hidden = false;
      hud.btn.focus();
    }, 700);
  }

  /* ---------- drawing ---------- */
  let scale = 1;
  function resize() { const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); scale = cv.width / W; }
  addEventListener('resize', resize);
  const STARS = Array.from({ length: 70 }, (_, i) => ({ x: (i * 137) % W, y: (i * 89) % H, r: (i % 3) * 0.5 + 0.5 }));

  function draw(now) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#07080d'); g.addColorStop(1, '#141a2a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    STARS.forEach((s) => { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect((s.x - dist * 0.05 % W + W) % W, s.y, s.r, s.r); });
    // storm walls: layered puffs
    const wall = (getY, dir) => {
      for (const [shade, push] of [['#1d2233', 0], ['#2a3047', 10], ['#3a4260', 22]]) {
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.moveTo(-STEP, dir < 0 ? -10 : H + 10);
        cave.forEach((c, i) => { ctx.lineTo(i * STEP - offset, getY(c) + dir * push); });
        ctx.lineTo(W + STEP, dir < 0 ? -10 : H + 10);
        ctx.closePath(); ctx.fill();
        cave.forEach((c, i) => {
          if ((c.i + (dir < 0 ? 0 : 3)) % 3) return;
          ctx.beginPath(); ctx.arc(i * STEP - offset, getY(c) + dir * push, 16 + ((c.i * 7) % 9), 0, Math.PI * 2); ctx.fill();
        });
      }
    };
    wall((c) => c.top, -1);
    wall((c) => c.bottom, 1);
    // coins (miles)
    coins.forEach((c) => {
      ctx.save(); ctx.translate(c.x, c.y - c.k * 40); ctx.globalAlpha = c.got ? 1 - c.k * 2 : 1;
      ctx.rotate(Math.PI / 4); ctx.fillStyle = '#fdb927'; ctx.fillRect(-7, -7, 14, 14); ctx.restore(); ctx.globalAlpha = 1;
      if (c.got) { ctx.fillStyle = '#fdb927'; ctx.font = '700 14px "Overpass Mono", monospace'; ctx.fillText('+50', c.x + 10, c.y - c.k * 40); }
    });
    // exhaust
    parts.forEach((p) => { ctx.fillStyle = `rgba(255,255,255,${0.25 * (1 - p.k / 0.6)})`; ctx.beginPath(); ctx.arc(p.x, p.y, 2 + p.k * 6, 0, Math.PI * 2); ctx.fill(); });
    // the plane: nose follows vertical speed
    ctx.save(); ctx.translate(plane.x, plane.y); ctx.rotate(Math.max(-0.5, Math.min(0.5, plane.vy / 800)));
    ctx.fillStyle = '#f3f2ee';
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(10, -3); ctx.lineTo(-12, -3); ctx.lineTo(-17, -10); ctx.lineTo(-20, -10); ctx.lineTo(-17, 3); ctx.lineTo(10, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c9c5bb'; ctx.beginPath(); ctx.moveTo(2, 1); ctx.lineTo(-8, 1); ctx.lineTo(-13, 10); ctx.lineTo(-9, 10); ctx.closePath(); ctx.fill();
    // nav lights
    ctx.fillStyle = Math.floor(now / 500) % 2 ? '#ff3b30' : '#55ff8a'; ctx.fillRect(-19, -11, 3, 3);
    ctx.restore();
    // lightning
    if (flashK > 0) {
      ctx.fillStyle = `rgba(200,215,255,${flashK * 0.35})`; ctx.fillRect(0, 0, W, H);
      if (flashK > 0.7 && !reduce) {
        ctx.strokeStyle = `rgba(255,255,255,${flashK})`; ctx.lineWidth = 2.5;
        let x = 500 + ((now / 7) % 400), y = 0;
        ctx.beginPath(); ctx.moveTo(x, y);
        while (y < H * 0.6) { x += (Math.random() - 0.5) * 50; y += 30 + Math.random() * 30; ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }
  }

  /* ---------- loop & input ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (state === 'play' && !document.hidden) update(dt);
    else if (state === 'title') { advance(120 * dt); plane.y = H / 2 + Math.sin(now / 600) * 30; }
    else flashK = Math.max(0, flashK - dt * 2);
    draw(now);
    requestAnimationFrame(loop);
  }
  const down = (e) => { if (state === 'play') { hold = true; e && e.preventDefault(); } };
  const up = () => { hold = false; };
  cv.addEventListener('pointerdown', down);
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
  addEventListener('keydown', (e) => {
    if (document.querySelector('.term.open')) return;
    if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); if (state !== 'play' && !e.repeat) start(); else down(); }
  });
  addEventListener('keyup', (e) => { if (e.code === 'Space' || e.key === 'ArrowUp') up(); });
  addEventListener('blur', up);

  function start() { reset(); colIndex = 0; offset = 0; state = 'play'; hud.over.hidden = true; last = performance.now(); }
  hud.btn.addEventListener('click', start);

  // read-only peek for testing: ?debug
  if (/[?&]debug\b/.test(location.search)) window.TB = { get plane() { return plane; }, wallsAt, get state() { return state; }, score: scoreNow };

  resize();
  reset();
  requestAnimationFrame(loop);
})();
