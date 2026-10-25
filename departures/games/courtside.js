/* Courtside: a 24-second shootaround.
   Drag back from the ball and let go to shoot (slingshot). Every make adds two seconds to the clock.
   Beyond the arc is worth three. Three makes in a row and you're heating up; five and the ball's on fire (double points).
   Best score stays in this browser. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const cv = $('#ct'), ctx = cv.getContext('2d');
  const W = 1000, H = 600, FLOOR = 540, G = 1500;
  const RIM = { y: 250, front: 806, back: 866 }, BOARD = { x: 878, top: 130, bottom: 285 };
  const ARC_X = 400;                       // spots left of here are threes
  const R = 15;                            // ball radius
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = AM.store;

  let state = 'title', score = 0, best = +store.get('ct_best', 0) || 0, clock = 24, streak = 0, makes = 0, shots = 0;
  let ball, aim = null, spot, flash = null, netK = 0, swish = true, shotId = 0, counted = false;
  const hud = { score: $('#ctScore'), best: $('#ctBest'), clock: $('#ctClock'), heat: $('#ctHeat'), over: $('#ctOver'), title: $('#ctTitle'), msg: $('#ctMsg'), btn: $('#ctBtn') };
  hud.best.textContent = best;

  function newSpot() {
    // drift further out as the score climbs
    const far = Math.min(1, score / 40);
    const x = 560 - Math.random() * (230 + far * 220);
    spot = { x: Math.max(110, x), y: FLOOR - 70 };
    ball = { x: spot.x, y: spot.y, vx: 0, vy: 0, live: false, rest: 0 };
    counted = false; swish = true;
  }

  function reset() { score = 0; clock = 24; streak = 0; makes = 0; shots = 0; newSpot(); paintHud(); }
  function paintHud() {
    hud.score.textContent = score;
    hud.clock.textContent = clock.toFixed(1);
    hud.clock.classList.toggle('low', clock < 5);
    hud.heat.textContent = streak >= 5 ? 'On fire · 2×' : streak >= 3 ? 'Heating up' : '';
  }

  /* ---------- physics ---------- */
  function bounceOff(px, py, rest) {
    const dx = ball.x - px, dy = ball.y - py, d = Math.hypot(dx, dy);
    if (d >= R + 3 || d === 0) return false;
    const nx = dx / d, ny = dy / d, dot = ball.vx * nx + ball.vy * ny;
    if (dot < 0) { ball.vx -= (1 + rest) * dot * nx; ball.vy -= (1 + rest) * dot * ny; }
    ball.x = px + nx * (R + 3.01); ball.y = py + ny * (R + 3.01);
    swish = false;
    return true;
  }
  function step(dt) {
    if (!ball.live) return;
    const py = ball.y;
    ball.vy += G * dt;
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    bounceOff(RIM.front, RIM.y, 0.55);
    bounceOff(RIM.back, RIM.y, 0.55);
    // backboard
    if (ball.x + R > BOARD.x && ball.x < BOARD.x + 10 && ball.y > BOARD.top && ball.y < BOARD.bottom && ball.vx > 0) { ball.x = BOARD.x - R; ball.vx *= -0.6; swish = false; }
    // through the hoop, going down
    if (!counted && py < RIM.y && ball.y >= RIM.y && ball.x > RIM.front + 3 && ball.x < RIM.back - 3 && ball.vy > 0) made();
    // floor
    if (ball.y + R > FLOOR) { ball.y = FLOOR - R; ball.vy *= -0.55; ball.vx *= 0.8; if (Math.abs(ball.vy) < 60) ball.vy = 0; }
    if (ball.vy === 0 && Math.abs(ball.vx) < 20) ball.rest += dt;
    if (ball.x < -60 || ball.x > W + 60 || ball.rest > 0.4 || (counted && ball.y > FLOOR - R - 2)) next();
  }
  function made() {
    counted = true;
    const three = spot.x < ARC_X;
    streak++; makes++;
    const pts = (three ? 3 : 2) * (streak >= 5 ? 2 : 1);
    score += pts;
    clock = Math.min(24, clock + 2);
    netK = 1;
    flash = { text: `${swish ? 'Swish! ' : ''}+${pts}${three ? ' · from deep' : ''}`, k: 1.2 };
    if (streak === 3) AM.toast('<span>Heating up.</span>', 1600);
    if (streak === 5) { AM.toast('<span><b>On fire.</b> Double points until you miss.</span>', 2200); AM.confetti('lakers', 50); }
    if (score >= 24 && !store.get('ct_24')) { store.set('ct_24', '1'); AM.toast('<span>24 points. Mamba mentality.</span>'); AM.confetti('lakers', 90); }
    paintHud();
  }
  function next() {
    if (!counted) { streak = 0; }
    newSpot();
    paintHud();
  }

  /* ---------- input: slingshot ---------- */
  const toWorld = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H }; };
  const launchVel = (a) => {
    let vx = (a.x0 - a.x) * 5.2, vy = (a.y0 - a.y) * 5.2;
    const m = Math.hypot(vx, vy), max = 1350;
    if (m > max) { vx *= max / m; vy *= max / m; }
    return { vx, vy };
  };
  cv.addEventListener('pointerdown', (e) => {
    if (state !== 'play' || ball.live) return;
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    const w = toWorld(e);
    aim = { x0: w.x, y0: w.y, x: w.x, y: w.y };
  });
  cv.addEventListener('pointermove', (e) => { if (aim) { const w = toWorld(e); aim.x = w.x; aim.y = w.y; } });
  const release = () => {
    if (!aim) return;
    const v = launchVel(aim);
    aim = null;
    if (Math.hypot(v.vx, v.vy) < 200) return;     // a tap, not a shot
    ball.vx = v.vx; ball.vy = v.vy; ball.live = true; shots++; shotId++;
  };
  cv.addEventListener('pointerup', release);
  cv.addEventListener('pointercancel', () => { aim = null; });

  /* ---------- drawing ---------- */
  let scale = 1;
  function resize() { const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); scale = cv.width / W; }
  addEventListener('resize', resize);

  function drawCourt() {
    // arena dark, floor in lounge-lit hardwood
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
    g.addColorStop(0, '#0d0b14'); g.addColorStop(1, '#1b1426');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR);
    // crowd lights
    for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(253,185,39,${0.04 + ((i * 37) % 10) / 120})`; ctx.fillRect((i * 97) % W, 40 + ((i * 53) % 160), 3, 3); }
    const f = ctx.createLinearGradient(0, FLOOR, 0, H);
    f.addColorStop(0, '#b9844a'); f.addColorStop(1, '#8a5d30');
    ctx.fillStyle = f; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 46) { ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x - 30, H); ctx.stroke(); }
    // three-point line and paint
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ARC_X, FLOOR + 2); ctx.lineTo(ARC_X - 22, H); ctx.stroke();
    ctx.fillStyle = 'rgba(85,37,131,.55)'; ctx.fillRect(700, FLOOR, 300, H - FLOOR);
    ctx.fillStyle = 'rgba(253,185,39,.9)'; ctx.font = '800 22px "Overpass", sans-serif'; ctx.fillText('LA', 820, FLOOR + 40);
    // stanchion, backboard, rim, net
    ctx.fillStyle = '#2b2e34'; ctx.fillRect(930, BOARD.bottom - 10, 14, FLOOR - BOARD.bottom + 10); ctx.fillRect(BOARD.x + 6, BOARD.top + 60, 60, 10);
    ctx.fillStyle = 'rgba(230,240,255,.9)'; ctx.fillRect(BOARD.x, BOARD.top, 8, BOARD.bottom - BOARD.top);
    ctx.strokeStyle = '#ff6a2a'; ctx.lineWidth = 3; ctx.strokeRect(BOARD.x - 2, RIM.y - 50, 4, 42);
  }
  function drawNet() {
    const sway = netK * Math.sin(performance.now() / 40) * 4;
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.5;
    const depth = 46 + netK * 10;
    for (let i = 0; i <= 5; i++) {
      const x0 = RIM.front + (i * (RIM.back - RIM.front)) / 5, x1 = RIM.front + 10 + (i * (RIM.back - RIM.front - 20)) / 5 + sway;
      ctx.beginPath(); ctx.moveTo(x0, RIM.y); ctx.lineTo(x1, RIM.y + depth); ctx.stroke();
    }
    for (let j = 1; j <= 3; j++) {
      const yy = RIM.y + (depth * j) / 3, inset = (10 * j) / 3;
      ctx.beginPath(); ctx.moveTo(RIM.front + inset + sway * j / 3, yy); ctx.lineTo(RIM.back - inset + sway * j / 3, yy); ctx.stroke();
    }
    ctx.strokeStyle = '#ff6a2a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(RIM.front, RIM.y); ctx.lineTo(RIM.back, RIM.y); ctx.stroke();
  }
  function drawBall(x, y, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = streak >= 5 ? '#ff7a1a' : '#e07a2c';
    if (streak >= 5 && !reduce) { ctx.shadowColor = '#ffb000'; ctx.shadowBlur = 22; }
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-R, 0); ctx.lineTo(R, 0); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.stroke();
    ctx.beginPath(); ctx.arc(-R * 1.25, 0, R * 0.9, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(R * 1.25, 0, R * 0.9, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
    ctx.restore();
  }
  function drawAim() {
    if (!aim) return;
    const v = launchVel(aim);
    // a short preview: enough to judge the angle, not enough to solve the shot
    let x = ball.x, y = ball.y, vx = v.vx, vy = v.vy;
    for (let i = 1; i <= 9; i++) {
      const t = 0.035;
      for (let k = 0; k < 2; k++) { vy += G * t; x += vx * t; y += vy * t; }
      ctx.fillStyle = `rgba(253,185,39,${0.9 - i * 0.09})`;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.setLineDash([4, 6]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(aim.x0, aim.y0); ctx.lineTo(aim.x, aim.y); ctx.stroke(); ctx.setLineDash([]);
  }

  let rot = 0;
  function frame(now) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawCourt();
    // shooter's spot
    if (state === 'play' && !ball.live) { ctx.fillStyle = 'rgba(253,185,39,.35)'; ctx.beginPath(); ctx.ellipse(spot.x, FLOOR + 6, 26, 6, 0, 0, Math.PI * 2); ctx.fill(); }
    // ball behind the front of the rim when it's above and falling through
    drawBall(ball.x, ball.y, rot);
    drawNet();
    drawAim();
    if (flash) {
      ctx.globalAlpha = Math.min(1, flash.k); ctx.fillStyle = '#fdb927'; ctx.font = '900 34px "Overpass", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(flash.text, 640, 170 - (1.2 - flash.k) * 30); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (state === 'play' && !document.hidden) {
      // sub-step for solid rim contact
      for (let i = 0; i < 4; i++) step(dt / 4);
      if (ball.live) rot += ball.vx * dt * 0.02;
      clock -= dt;
      if (clock <= 0) { clock = 0; end(); }
      hud.clock.textContent = clock.toFixed(1);
      hud.clock.classList.toggle('low', clock < 5);
    }
    if (flash) { flash.k -= dt; if (flash.k <= 0) flash = null; }
    netK = Math.max(0, netK - dt * 1.5);
    frame(now);
    requestAnimationFrame(loop);
  }

  function end() {
    state = 'over';
    aim = null;
    const pct = shots ? Math.round((makes / shots) * 100) : 0;
    if (score > best) { best = score; store.set('ct_best', String(best)); hud.best.textContent = best; }
    hud.title.textContent = 'Buzzer';
    hud.msg.innerHTML = `${score} points · ${makes}/${shots} shooting (${pct}%).${score >= best && score > 0 ? '<br><b>New personal best.</b>' : `<br>Best: ${best}.`}`;
    hud.btn.textContent = 'Run it back';
    hud.over.hidden = false;
    hud.btn.focus();
  }
  function start() { reset(); state = 'play'; hud.over.hidden = true; last = performance.now(); }
  hud.btn.addEventListener('click', start);

  // read-only peek for testing: ?debug
  if (/[?&]debug\b/.test(location.search)) window.CT = { get ball() { return ball; }, get score() { return score; }, get state() { return state; }, get makes() { return makes; }, RIM, W, H, G };

  resize();
  newSpot();
  requestAnimationFrame(loop);
})();
