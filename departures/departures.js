/* "Departures" page behaviour: hero board, departures list, clock, sound, route, boarding pass. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const LA = 'America/Los_Angeles';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- sound toggle (off by default; remembered) ---------- */
  const soundBtns = $$('[data-sound]');
  const paintSound = () => soundBtns.forEach((b) => { b.textContent = Flap.sound ? 'Sound: on' : 'Sound: off'; b.setAttribute('aria-pressed', String(Flap.sound)); });
  soundBtns.forEach((b) => b.addEventListener('click', () => { Flap.setSound(!Flap.sound); AM.store.set('dep_sound', Flap.sound ? '1' : '0'); paintSound(); }));
  paintSound();

  /* ---------- live clock flaps (LA time) ---------- */
  const clockHost = $('#clock');
  if (clockHost) {
    const clock = Flap.row(clockHost, 5);
    let shown = '';
    const tick = () => {
      const t = new Date().toLocaleTimeString('en-GB', { timeZone: LA, hour: '2-digit', minute: '2-digit' });
      if (t !== shown) { shown = t; clock.set(t, { stagger: 40, jitter: 20 }); }
    };
    tick();
    setInterval(tick, 5000);
  }

  /* ---------- hero: name, title, rotating ticker ---------- */
  const nameHost = $('#nameFlaps');
  if (nameHost) {
    const name = Flap.row(nameHost, 12);
    const sub = Flap.row($('#subFlaps'), 24);
    const tick = Flap.row($('#tickerFlaps'), 30);
    const lines = [
      'NOW AT XYZ · SANTA MONICA',
      'B.S. COMPUTER SCIENCE · 2025',
      "SYRACUSE '25 · CUM LAUDE",
      'BORN AND RAISED IN LOS ANGELES',
      'PROFESSIONAL · CREATIVE',
      'DETERMINED · PERSONABLE',
    ];
    (async () => {
      await sleep(250);
      await name.set('AARON MORADI', { stagger: 55, jitter: 90 });
      sub.set('ASSISTANT CHIEF OF STAFF', { stagger: 22 });
      let i = 0;
      await tick.set(lines[0]);
      setInterval(() => { i = (i + 1) % lines.length; tick.set(lines[i], { stagger: 18 }); }, 5200);
    })();
  }

  /* ---------- departures list ---------- */
  const list = $('#depList');
  if (list) {
    const F = window.DEP_FLIGHTS;
    const mq = matchMedia('(max-width: 760px)');
    let built = null, flipped = false;
    function build() {
      const narrow = mq.matches;
      const spec = narrow
        ? { cols: [['time', 4], ['short', 12], ['status', 8]], via: ['viaS', 24], labels: ['Time', 'Carrier', 'Status'] }
        : { cols: [['time', 4], ['city', 12], ['carrier', 17], ['status', 11]], via: ['via', 44], labels: ['Time', 'Destination', 'Carrier', 'Status'] };
      list.style.setProperty('--cols', spec.cols.map(([, n]) => `calc(${n} * (var(--dw) + 2px) - 2px)`).join(' ') + ' 1fr');
      $('#depLabels').style.setProperty('--cols', list.style.getPropertyValue('--cols'));
      $('#depLabels').innerHTML = spec.labels.map((l) => `<span>${l}</span>`).join('') + '<span></span>';
      list.innerHTML = '';
      const rows = F.map((f) => {
        const r = document.createElement('div');
        r.className = 'dep-row' + (f.now ? ' now' : '');
        r.setAttribute('role', 'row');
        const segs = spec.cols.map(([k, n]) => {
          const s = document.createElement('span');
          if (k === 'status') { s.className = 'status ' + (f.tone || 'dim'); }
          r.appendChild(s);
          return { k, row: Flap.row(s, n) };
        });
        const tail = document.createElement('span');
        if (f.now) tail.innerHTML = '<span class="live-dot" title="Current"></span>';
        r.appendChild(tail);
        const via = document.createElement('span');
        via.className = 'via';
        r.appendChild(via);
        const viaRow = Flap.row(via, spec.via[1]);
        // screen readers get the row as plain text
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = `${f.time}, ${f.city}, ${f.carrier}, ${f.status}. ${f.via}`;
        r.appendChild(sr);
        list.appendChild(r);
        return { f, segs, viaRow };
      });
      built = { rows, spec };
      if (flipped) flipAll(true);
    }
    async function flipAll(fast) {
      flipped = true;
      for (const { f, segs, viaRow } of built.rows) {
        segs.forEach(({ k, row }) => row.set(f[k], { stagger: fast ? 6 : 22 }));
        viaRow.set(f[built.spec.via[0]], { stagger: fast ? 4 : 14 });
        if (!fast) await sleep(260);
      }
    }
    build();
    mq.addEventListener?.('change', build);
    new IntersectionObserver((es, io) => es.forEach((e) => { if (e.isIntersecting) { flipAll(false); io.disconnect(); } }), { threshold: .25 }).observe(list);
  }

  /* ---------- route: dotted US + great-circle arcs + flying plane ---------- */
  const svg = $('#routeSvg');
  if (svg) {
    const US = [[-124.7,48.4],[-124,46.3],[-124.1,43.7],[-124.4,42],[-124.2,40.4],[-123,38],[-122.4,37.2],[-121.9,36.3],[-120.6,34.6],[-118.5,34],[-117.2,32.6],[-114.7,32.7],[-111.1,31.3],[-108.2,31.3],[-108.2,31.8],[-106.5,31.8],[-104.9,30.6],[-104.4,29.6],[-103.2,29],[-102.4,29.8],[-101.4,29.8],[-100.3,28.3],[-99.5,27.5],[-97.4,25.9],[-97.4,27.4],[-96.6,28.4],[-94.7,29.4],[-93.8,29.7],[-92,29.6],[-90.5,29.1],[-89.2,29.2],[-89.6,30.2],[-88,30.4],[-86.5,30.4],[-85.3,29.7],[-84,30],[-82.8,28.2],[-82.6,27],[-81.7,25.9],[-80.9,25.1],[-80.4,25.2],[-80,26.7],[-80.6,28.5],[-81.3,30.5],[-81.1,31.9],[-79.9,32.7],[-78.5,33.8],[-77,34.6],[-75.5,35.3],[-76,36.9],[-75.6,37.9],[-75,38.8],[-74,40],[-73.9,40.6],[-72,41],[-70,41.7],[-70.6,42.7],[-70.2,43.7],[-68.5,44.3],[-67,44.8],[-67.8,47.1],[-69.2,47.4],[-70.9,45.3],[-71.5,45],[-74.8,45],[-76.4,44.2],[-76.8,43.6],[-79.1,43.3],[-79,42.8],[-80.5,42],[-82.5,41.6],[-83.1,42],[-82.4,43],[-82.5,44.5],[-83.4,45.8],[-84.7,46.5],[-88,47.5],[-89.6,48],[-90.8,48.2],[-94.8,49.4],[-95.2,49],[-123,49],[-124.7,48.4]];
    const inside = (lon, lat) => { let h = false; for (let i = 0, j = US.length - 1; i < US.length; j = i++) { const [xi, yi] = US[i], [xj, yj] = US[j]; if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) h = !h; } return h; };
    const K = 11.4, KX = K * Math.cos(38 * Math.PI / 180);
    const px = (lon) => 30 + (lon + 125) * KX, py = (lat) => 34 + (50 - lat) * K;
    let dots = '';
    for (let lat = 49.5; lat > 24; lat -= .8) for (let lon = -125; lon < -66; lon += 1) if (inside(lon, lat)) dots += `<rect x="${px(lon).toFixed(1)}" y="${py(lat).toFixed(1)}" width="2.4" height="2.4"/>`;
    const lax = [px(-118.41), py(33.94)], syr = [px(-76.11), py(43.11)];
    const up = [(lax[0] + syr[0]) / 2, Math.min(lax[1], syr[1]) - 120], down = [(lax[0] + syr[0]) / 2, Math.min(lax[1], syr[1]) - 40];
    svg.innerHTML = `
      <g fill="#3a3a3e">${dots}</g>
      <path id="legOut" d="M${lax} Q${up} ${syr}" fill="none" stroke="var(--sign)" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/>
      <path id="legBack" d="M${syr} Q${down} ${lax}" fill="none" stroke="var(--amber)" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round" opacity=".7"/>
      <g font-family="Overpass, sans-serif" font-weight="900" font-size="20" fill="var(--glyph)">
        <rect x="${lax[0] - 7}" y="${lax[1] - 7}" width="14" height="14" fill="var(--sign)"/><text x="${lax[0] - 18}" y="${lax[1] + 32}">LAX</text>
        <rect x="${syr[0] - 7}" y="${syr[1] - 7}" width="14" height="14" fill="var(--sign)"/><text x="${syr[0] - 18}" y="${syr[1] + 32}">SYR</text>
      </g>
      <g id="plane"><path d="M-12 -2 L4 -2 L12 0 L4 2 L-12 2 Z M-2 -2 L-8 -11 L-4 -11 L4 -2 Z M-2 2 L-8 11 L-4 11 L4 2 Z M-12 -2 L-15 -6 L-12 -6 L-8 -2 Z M-12 2 L-15 6 L-12 6 L-8 2 Z" fill="var(--glyph)"/>
        <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1;0;0" keyTimes="0;.45;.5;.95;1" calcMode="linear"><mpath href="#legOut"/></animateMotion></g>`;
    if (Flap.reduce) $('#plane', svg).remove();
  }

  /* ---------- boarding pass: seat 24A egg, date, tear on submit ---------- */
  $$('[data-today]').forEach((el) => { el.textContent = new Date().toLocaleDateString('en-US', { timeZone: LA, day: '2-digit', month: 'short' }).toUpperCase(); });
  const seat = $('#seat');
  if (seat) {
    let n = 0;
    seat.addEventListener('click', () => {
      n++;
      seat.animate([{ transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 180 });
      if (n === 8) { AM.findEgg('mamba'); AM.confetti('lakers', 90); }
      if (n === 24) { AM.confetti('lakers', 220); AM.toast('<span><b>Now boarding</b> seats 8 and 24. Mamba forever.</span>'); }
    });
  }
  const form = $('#passForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      if (form.dataset.sent) return;
      e.preventDefault();
      form.dataset.sent = '1';
      $('#pass').classList.add('torn');
      setTimeout(() => form.submit(), Flap.reduce ? 0 : 750);
    });
  }
})();
