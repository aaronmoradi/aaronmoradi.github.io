/* Tower: air traffic control at LAX.
   Drag from an aircraft to draw its route. Bring each one to its own runway:
   jets (orange) to 25L, props (blue) to 25R, helicopters (green) to the pad.
   Two aircraft that touch end the shift. Traffic builds the longer you last. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  // landscape on wide screens, portrait on phones; the field is laid out from W and H
  const PORTRAIT = matchMedia('(max-width: 640px)').matches;
  const W = PORTRAIT ? 520 : 1000, H = PORTRAIT ? 760 : 640;
  const cv = $('#tw'), ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  /* ---------- the field ---------- */
  const ANG = -0.27;                               // runways run roughly east-west, like LAX's 25s
  const DIR = { x: Math.cos(ANG), y: Math.sin(ANG) };
  function runway(id, cx, cy, len, wid, color, label) {
    const a = { x: cx - DIR.x * len / 2, y: cy - DIR.y * len / 2 }, b = { x: cx + DIR.x * len / 2, y: cy + DIR.y * len / 2 };
    return { id, cx, cy, len, wid, color, label, ends: [a, b] };
  }
  const RUNWAYS = PORTRAIT ? [
    runway('A', 285, 440, 260, 22, '#ff8a2a', ['07L', '25R']),
    runway('B', 250, 290, 180, 16, '#45b4ff', ['07R', '25L']),
  ] : [
    runway('A', 545, 385, 330, 22, '#ff8a2a', ['07L', '25R']),
    runway('B', 500, 250, 220, 16, '#45b4ff', ['07R', '25L']),
  ];
  const PAD = PORTRAIT ? { id: 'H', x: 400, y: 610, r: 28, color: '#7ad957' } : { id: 'H', x: 815, y: 505, r: 28, color: '#7ad957' };
  cv.parentElement.style.aspectRatio = `${W} / ${H}`;
  const TYPES = {
    jet:  { v: 40, size: 13, color: '#ff8a2a', target: 'A', name: 'Jet' },
    prop: { v: 30, size: 10, color: '#45b4ff', target: 'B', name: 'Prop' },
    heli: { v: 21, size: 10, color: '#7ad957', target: 'H', name: 'Helicopter' },
  };
  const ZONE_R = 36;

  /* ---------- state ---------- */
  let planes = [], incoming = [], booms = [], state = 'title', score = 0, t = 0, nextSpawn = 0, seq = 0, drag = null, hover = null;
  let best = +AM.store.get('tw_best', 0) || 0;
  const hud = { score: $('#twScore'), best: $('#twBest'), overlay: $('#twOverlay'), title: $('#twTitle'), msg: $('#twMsg'), btn: $('#twBtn') };
  hud.best.textContent = best;

  function reset() {
    planes = []; incoming = []; booms = []; score = 0; t = 0; nextSpawn = 1.2; seq = 0; drag = null;
    hud.score.textContent = '0';
  }

  /* ---------- spawning ---------- */
  function pickType() {
    const r = Math.random();
    if (t > 35 && r < 0.22) return 'heli';
    return r < 0.58 ? 'jet' : 'prop';
  }
  function queueSpawn() {
    // choose an edge point well away from aircraft already arriving there
    for (let tries = 0; tries < 12; tries++) {
      const edge = Math.floor(Math.random() * 4);
      const along = 0.12 + Math.random() * 0.76;
      const p = [{ x: along * W, y: -24 }, { x: W + 24, y: along * H }, { x: along * W, y: H + 24 }, { x: -24, y: along * H }][edge];
      if (planes.some((q) => dist(q, p) < 120) || incoming.some((q) => dist(q, p) < 120)) continue;
      incoming.push({ ...p, edge, type: pickType(), in: 2.2 });
      return;
    }
  }
  function launch(s) {
    const T = TYPES[s.type];
    const aim = { x: W / 2 + (Math.random() - 0.5) * W * 0.42, y: H / 2 + (Math.random() - 0.5) * H * 0.4 };
    planes.push({ id: ++seq, x: s.x, y: s.y, a: Math.atan2(aim.y - s.y, aim.x - s.x), type: s.type, v: T.v, size: T.size, color: T.color, target: T.target, path: [], dest: null, st: 'fly', entered: false, k: 0, warn: false });
  }

  /* ---------- update ---------- */
  function turnToward(p, ang, rate, dt) {
    let d = ((ang - p.a + Math.PI) % TAU + TAU) % TAU - Math.PI;
    const m = rate * dt;
    p.a += Math.max(-m, Math.min(m, d));
  }
  function update(dt) {
    t += dt;
    nextSpawn -= dt;
    if (nextSpawn <= 0) { queueSpawn(); nextSpawn = Math.max(1.7, 5.6 - t * 0.035) * (0.75 + Math.random() * 0.5); }
    incoming.forEach((s) => { s.in -= dt; if (s.in <= 0) launch(s); });
    incoming = incoming.filter((s) => s.in > 0);

    for (const p of planes) {
      if (p.st === 'fly') {
        if (p.path.length) {
          const q = p.path[0];
          turnToward(p, Math.atan2(q.y - p.y, q.x - p.x), 9, dt);
          const step = p.v * dt, d = dist(p, q);
          if (d <= step + 0.5) { p.x = q.x; p.y = q.y; p.path.shift(); }
          else { p.x += Math.cos(Math.atan2(q.y - p.y, q.x - p.x)) * step; p.y += Math.sin(Math.atan2(q.y - p.y, q.x - p.x)) * step; }
          if (!p.path.length && p.dest) touchdown(p);
        } else {
          p.x += Math.cos(p.a) * p.v * dt;
          p.y += Math.sin(p.a) * p.v * dt;
          // bounce gently off the edge of the radar
          const m = 26;
          if (p.entered && (p.x < m || p.x > W - m || p.y < m || p.y > H - m)) turnToward(p, Math.atan2(H / 2 - p.y, W / 2 - p.x), 1.6, dt);
        }
        if (!p.entered && p.x > 10 && p.x < W - 10 && p.y > 10 && p.y < H - 10) p.entered = true;
      } else if (p.st === 'land') {
        // roll down the runway (or settle on the pad), slowing, then clear
        p.k += dt;
        if (p.dest.id === 'H') {
          p.x += (PAD.x - p.x) * Math.min(1, dt * 3); p.y += (PAD.y - p.y) * Math.min(1, dt * 3);
          if (p.k > 1.3) p.st = 'gone';
        } else {
          const rw = p.dest.rw, from = rw.ends[p.dest.end], to = rw.ends[1 - p.dest.end];
          const ux = (to.x - from.x) / rw.len, uy = (to.y - from.y) / rw.len;
          p.a = Math.atan2(uy, ux);
          p.roll = (p.roll || 0) + p.v * dt * Math.max(0.25, 1 - p.k * 0.45);
          p.x = from.x + ux * p.roll; p.y = from.y + uy * p.roll;
          if (p.roll > rw.len * 0.8) p.st = 'gone';
        }
      }
    }
    const before = planes.length;
    planes = planes.filter((p) => p.st !== 'gone');
    if (planes.length < before) {
      score += before - planes.length;
      hud.score.textContent = score;
      hud.score.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 260 });
      if (score === 10) AM.findEgg('tower');
      if (score === 25) AM.toast('<span><b>25 landings.</b> LAX would like to offer you a job.</span>');
    }

    // separation
    const air = planes.filter((p) => p.st === 'fly' && p.entered);
    air.forEach((p) => { p.warn = false; });
    for (let i = 0; i < air.length; i++) for (let j = i + 1; j < air.length; j++) {
      const a = air[i], b = air[j], d = dist(a, b);
      if (d < 58) { a.warn = b.warn = true; }
      if (d < (a.size + b.size) * 0.85) return crash(a, b);
    }
    booms.forEach((b) => { b.k += dt; });
    booms = booms.filter((b) => b.k < 1.6);
  }

  function touchdown(p) {
    p.st = 'land'; p.k = 0;
    if (p.dest.id !== 'H') { p.roll = 0; const e = p.dest.rw.ends[p.dest.end]; p.x = e.x; p.y = e.y; }
  }

  function crash(a, b) {
    booms.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, k: 0 });
    a.dead = b.dead = true;
    state = 'over';
    if (score > best) { best = score; AM.store.set('tw_best', String(best)); hud.best.textContent = best; }
    setTimeout(() => {
      hud.title.textContent = 'Loss of separation';
      hud.msg.innerHTML = `${score} landing${score === 1 ? '' : 's'} before the incident.${score >= best && score > 0 ? '<br><b>New personal best.</b>' : `<br>Best: ${best}.`}`;
      hud.btn.textContent = 'Start a new shift';
      hud.overlay.hidden = false;
      hud.btn.focus();
    }, 900);
  }

  /* ---------- where a route ends ---------- */
  function zoneAt(pt, type) {
    const want = TYPES[type].target;
    if (want === 'H') return dist(pt, PAD) < PAD.r + 14 ? { id: 'H' } : null;
    for (const rw of RUNWAYS) {
      if (rw.id !== want) continue;
      for (let e = 0; e < 2; e++) if (dist(pt, rw.ends[e]) < ZONE_R) return { id: rw.id, rw, end: e };
    }
    return null;
  }
  function wrongZone(pt, type) {
    const want = TYPES[type].target;
    if (want !== 'H' && dist(pt, PAD) < PAD.r + 14) return true;
    return RUNWAYS.some((rw) => rw.id !== want && rw.ends.some((e) => dist(pt, e) < ZONE_R));
  }

  /* ---------- input ---------- */
  const toWorld = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  cv.addEventListener('pointerdown', (e) => {
    if (state !== 'play') return;
    const w = toWorld(e);
    let pick = null, pd = 46;
    planes.forEach((p) => { if (p.st === 'fly' && dist(p, w) < pd) { pd = dist(p, w); pick = p; } });
    if (!pick) return;
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    pick.path = []; pick.dest = null;
    drag = { p: pick, last: { x: pick.x, y: pick.y } };
  });
  cv.addEventListener('pointermove', (e) => {
    const w = toWorld(e);
    hover = w;
    if (!drag) return;
    const p = drag.p;
    if (p.st !== 'fly') { drag = null; return; }
    if (dist(w, drag.last) >= 9) {
      if (p.dest) return;                                  // already locked onto a runway
      p.path.push(w); drag.last = w;
      const z = zoneAt(w, p.type);
      if (z) {
        p.dest = z;
        if (z.id !== 'H') p.path.push({ ...z.rw.ends[z.end] });
        else p.path.push({ x: PAD.x, y: PAD.y });
      }
    }
  });
  const endDrag = () => {
    if (!drag) return;
    const p = drag.p;
    if (!p.dest && p.path.length && wrongZone(p.path[p.path.length - 1], p.type)) {
      AM.toast(`<span>${TYPES[p.type].name}s land on the ${p.type === 'heli' ? 'helipad' : p.type === 'jet' ? 'orange runway' : 'blue runway'}.</span>`, 2600);
    }
    drag = null;
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('pointerleave', () => { hover = null; });

  /* ---------- drawing ---------- */
  let scale = 1, dpr = 1;
  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    scale = (r.width * dpr) / W;
  }
  addEventListener('resize', resize);

  function drawField(now) {
    ctx.fillStyle = '#0b0d10'; ctx.fillRect(0, 0, W, H);
    // the Pacific, off the west end
    ctx.fillStyle = '#0c1824';
    const cx = PORTRAIT ? 0.62 : 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(120 * cx, 0); ctx.bezierCurveTo(95 * cx, H * .25, 150 * cx, H * .47, 105 * cx, H * .66); ctx.bezierCurveTo(80 * cx, H * .81, 120 * cx, H * .94, 90 * cx, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1b3550'; ctx.font = '600 12px "Overpass Mono", monospace'; ctx.save(); ctx.translate(PORTRAIT ? 30 : 40, H * 0.52); ctx.rotate(-Math.PI / 2); ctx.fillText('PACIFIC', 0, 0); ctx.restore();
    // grid and range rings
    ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(120,200,255,.07)';
    [120, 240, 360, 480, 600].forEach((r) => { ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, TAU); ctx.stroke(); });
    // sweep
    if (!reduce) {
      const sa = (now / 1000) * 0.9 % TAU;
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = `rgba(110,220,170,${0.05 * (1 - i / 18)})`;
        ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.arc(W / 2, H / 2, 900, sa - (i + 1) * 0.03, sa - i * 0.03); ctx.closePath(); ctx.fill();
      }
    }
    // runways
    const dragging = drag?.p;
    RUNWAYS.forEach((rw) => {
      ctx.save(); ctx.translate(rw.cx, rw.cy); ctx.rotate(ANG);
      ctx.fillStyle = '#23262c'; ctx.fillRect(-rw.len / 2, -rw.wid / 2, rw.len, rw.wid);
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.setLineDash([12, 10]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-rw.len / 2 + 30, 0); ctx.lineTo(rw.len / 2 - 30, 0); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = rw.color;
      ctx.fillRect(-rw.len / 2, -rw.wid / 2, 6, rw.wid); ctx.fillRect(rw.len / 2 - 6, -rw.wid / 2, 6, rw.wid);
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '700 10px "Overpass Mono", monospace'; ctx.textAlign = 'center';
      ctx.save(); ctx.translate(-rw.len / 2 + 20, 0); ctx.rotate(Math.PI / 2); ctx.fillText(rw.label[0], 0, 4); ctx.restore();
      ctx.save(); ctx.translate(rw.len / 2 - 20, 0); ctx.rotate(-Math.PI / 2); ctx.fillText(rw.label[1], 0, 4); ctx.restore();
      ctx.restore();
      const live = dragging && dragging.target === rw.id;
      rw.ends.forEach((e) => {
        ctx.strokeStyle = rw.color; ctx.globalAlpha = live ? 0.95 : 0.28; ctx.lineWidth = live ? 2 : 1.2; ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.arc(e.x, e.y, ZONE_R, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      });
    });
    // helipad
    const liveH = dragging && dragging.target === 'H';
    ctx.fillStyle = '#23262c'; ctx.beginPath(); ctx.arc(PAD.x, PAD.y, PAD.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAD.color; ctx.lineWidth = liveH ? 3 : 2; ctx.globalAlpha = liveH ? 1 : 0.7; ctx.beginPath(); ctx.arc(PAD.x, PAD.y, PAD.r - 4, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = PAD.color; ctx.font = '800 22px "Overpass", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('H', PAD.x, PAD.y + 8);
    // tower
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.font = '600 10px "Overpass Mono", monospace'; ctx.fillText('LAX TWR', PORTRAIT ? 330 : 640, PORTRAIT ? 530 : 470);
    ctx.textAlign = 'left';
  }

  function drawPlane(p, now) {
    const s = p.size * (p.st === 'land' ? Math.max(0.55, 1 - (p.k || 0) * 0.35) : 1);
    if (p.path.length) {
      ctx.strokeStyle = p.color; ctx.globalAlpha = 0.65; ctx.lineWidth = 2; ctx.setLineDash([3, 6]); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); p.path.forEach((q) => ctx.lineTo(q.x, q.y)); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      if (p.dest) { const e = p.path[p.path.length - 1]; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(e.x, e.y, 4, 0, TAU); ctx.fill(); }
    }
    if (p.warn && p.st === 'fly') {
      ctx.strokeStyle = (Math.floor(now / 180) % 2) ? '#ff4a3d' : 'rgba(255,74,61,.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, 29, 0, TAU); ctx.stroke();
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(s / 10, s / 10);
    ctx.fillStyle = p.color; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.2;
    if (p.type === 'heli') {
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 5.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillRect(-16, -1.2, 9, 2.4);
      ctx.save(); ctx.rotate(reduce ? 0.6 : now / 45); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(13, 0); ctx.moveTo(0, -13); ctx.lineTo(0, 13); ctx.stroke(); ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(12, 0); ctx.lineTo(8, -2); ctx.lineTo(2, -2); ctx.lineTo(-3, -11); ctx.lineTo(-6, -11); ctx.lineTo(-3, -2);
      ctx.lineTo(-9, -2); ctx.lineTo(-12, -6); ctx.lineTo(-14, -6); ctx.lineTo(-12, 0);
      ctx.lineTo(-14, 6); ctx.lineTo(-12, 6); ctx.lineTo(-9, 2); ctx.lineTo(-3, 2); ctx.lineTo(-6, 11); ctx.lineTo(-3, 11); ctx.lineTo(2, 2); ctx.lineTo(8, 2);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }

  function drawIncoming(now) {
    incoming.forEach((s) => {
      const x = Math.max(14, Math.min(W - 14, s.x)), y = Math.max(14, Math.min(H - 14, s.y));
      const blink = Math.floor(now / 250) % 2;
      ctx.fillStyle = TYPES[s.type].color; ctx.globalAlpha = blink ? 0.95 : 0.4;
      const ang = [Math.PI / 2, Math.PI, -Math.PI / 2, 0][s.edge];
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.globalAlpha = 1;
    });
  }

  function drawBooms() {
    booms.forEach((b) => {
      const r = 10 + b.k * 70;
      ctx.strokeStyle = `rgba(255,74,61,${Math.max(0, 1 - b.k / 1.6)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x, b.y, r * 0.55, 0, TAU); ctx.stroke();
    });
  }

  function frame(now) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawField(now);
    planes.filter((p) => p.st === 'land').forEach((p) => drawPlane(p, now));
    planes.filter((p) => p.st === 'fly').forEach((p) => drawPlane(p, now));
    drawIncoming(now);
    drawBooms();
  }

  /* ---------- loop ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state === 'play' && !document.hidden) update(dt);
    else if (state === 'over') { booms.forEach((b) => { b.k += dt; }); }
    frame(now);
    requestAnimationFrame(loop);
  }

  function start() {
    reset();
    state = 'play';
    hud.overlay.hidden = true;
    last = performance.now();
  }
  hud.btn.addEventListener('click', start);
  addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && state !== 'play' && !document.querySelector('.term.open') && document.activeElement === document.body) { e.preventDefault(); start(); } });

  // read-only peek for testing: /departures/tower.html?debug
  if (/[?&]debug\b/.test(location.search)) window.TOWER = { get planes() { return planes; }, get state() { return state; }, get score() { return score; }, RUNWAYS, PAD, W, H };

  resize();
  // a couple of aircraft drifting behind the title card
  launch({ x: 120, y: 120, type: 'jet' }); launch({ x: 880, y: 160, type: 'prop' });
  planes.forEach((p) => { p.entered = true; });
  const idle = setInterval(() => { if (state !== 'title') return clearInterval(idle); planes.forEach((p) => { p.x += Math.cos(p.a) * 1.2; p.y += Math.sin(p.a) * 1.2; if (p.x < 40 || p.x > W - 40 || p.y < 40 || p.y > H - 40) p.a += 0.08; }); }, 50);
  requestAnimationFrame(loop);
})();
