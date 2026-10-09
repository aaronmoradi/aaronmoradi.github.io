/* Home page: typing effect, LA clock + sky, Spotify, visitors, projects, dot map. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('[data-egg-total]').forEach((el) => { el.textContent = AM.EGGS.length; });

  /* ---------- typing effect ---------- */
  const typedEl = $('.typed');
  if (typedEl) {
    const words = JSON.parse(typedEl.dataset.words);
    let w = 0, i = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, i) || ' ';
      let delay = deleting ? 45 : 95;
      if (!deleting && i === word.length) { deleting = true; delay = 1600; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(tick, delay);
    };
    if (reduceMotion) typedEl.textContent = words[0]; else tick();
  }

  /* ---------- LA clock + sky that follows LA time ---------- */
  const SKIES = [
    { from: 0,  label: 'LA is asleep 🌙',          sky: 'radial-gradient(circle at 40% 35%, #6f74d8, #2b2f77 45%, #0b1026 70%)' },
    { from: 5,  label: 'Sunrise in LA 🌅',          sky: 'radial-gradient(circle at 50% 60%, #ffd3a5, #ff8a80 45%, #9b6bd6 75%)' },
    { from: 7,  label: 'Morning in LA ☀️',          sky: 'radial-gradient(circle at 50% 40%, #fff1a8, #ffd36b 35%, #7cc6ff 70%)' },
    { from: 11, label: 'Sunny afternoon in LA 😎',  sky: 'radial-gradient(circle at 50% 40%, #fff6c9, #8fd3ff 40%, #3a8dde 72%)' },
    { from: 16, label: 'Golden hour in LA 🌇',      sky: 'radial-gradient(circle at 50% 55%, #ffe08a, #ff9a3c 40%, #f2541b 70%)' },
    { from: 19, label: 'Dusk in LA 🌆',             sky: 'radial-gradient(circle at 50% 60%, #ff9a8b, #c86dd7 40%, #3023ae 72%)' },
    { from: 21, label: 'Night in LA 🌃',            sky: 'radial-gradient(circle at 40% 35%, #8a8ff0, #3a3f9e 40%, #0b1026 72%)' },
  ];
  const clock = $('#laClock');
  const label = $('#skyLabel');
  const orb = $('#skyOrb');
  function paintClock() {
    const now = new Date();
    if (clock) clock.textContent = now.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' });
    const h = Number(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hourCycle: 'h23' }));
    const phase = [...SKIES].reverse().find((s) => h >= s.from);
    if (label) label.textContent = phase.label;
    if (orb) orb.style.setProperty('--sky', phase.sky);
  }
  paintClock();
  setInterval(paintClock, 15000);

  /* ---------- sticker: 8 taps (or 24) ---------- */
  const sticker = $('#sticker');
  if (sticker) {
    let taps = 0, spin = 12;
    sticker.addEventListener('click', () => {
      taps++;
      spin += 45;
      sticker.style.transform = `rotate(${spin}deg) scale(${1 + Math.min(taps, 8) * 0.02})`;
      if (taps === 8) { AM.findEgg('mamba'); AM.confetti('lakers', 80); }
      if (taps === 24) { AM.confetti('lakers', 240); AM.toast('💜💛 8 <i>and</i> 24. Mamba forever.'); }
    });
  }

  /* ---------- Spotify ---------- */
  const player = $('#spotify-player');
  $$('.song-btn').forEach((btn) => btn.addEventListener('click', () => {
    player.src = `https://open.spotify.com/embed/track/${btn.dataset.track}?utm_source=generator&theme=0`;
    $$('.song-btn').forEach((b) => b.classList.toggle('active-song', b === btn));
  }));

  /* ---------- visitor counter ---------- */
  const visits = $('#visit-count');
  if (visits) {
    fetch('https://api.counterapi.dev/v2/aaron-moradis-team-3783/ronmo/up')
      .then((r) => r.json())
      .then((d) => {
        const n = d?.data?.up_count ?? d?.count ?? d?.data?.count;
        visits.textContent = typeof n === 'number' ? n.toLocaleString() : '∞';
      })
      .catch(() => { visits.textContent = '∞'; });
  }

  /* ---------- project filters + tilt ---------- */
  const filterBtns = $$('.filters button');
  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.toggle('active', b === btn));
    const f = btn.dataset.filter;
    $$('.project').forEach((card) => {
      card.classList.toggle('hidden', !(f === '*' || card.dataset.tags.split(' ').includes(f)));
    });
  }));
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    $$('.project').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- dot map of the US for the map teaser ---------- */
  const svg = $('#usDots');
  if (svg) {
    // Very simplified outline of the lower 48 as [lon, lat]
    const US = [[-124.7,48.4],[-124,46.3],[-124.1,43.7],[-124.4,42],[-124.2,40.4],[-123,38],[-122.4,37.2],[-121.9,36.3],[-120.6,34.6],[-118.5,34],[-117.2,32.6],[-114.7,32.7],[-111.1,31.3],[-108.2,31.3],[-108.2,31.8],[-106.5,31.8],[-104.9,30.6],[-104.4,29.6],[-103.2,29],[-102.4,29.8],[-101.4,29.8],[-100.3,28.3],[-99.5,27.5],[-97.4,25.9],[-97.4,27.4],[-96.6,28.4],[-94.7,29.4],[-93.8,29.7],[-92,29.6],[-90.5,29.1],[-89.2,29.2],[-89.6,30.2],[-88,30.4],[-86.5,30.4],[-85.3,29.7],[-84,30],[-82.8,28.2],[-82.6,27],[-81.7,25.9],[-80.9,25.1],[-80.4,25.2],[-80,26.7],[-80.6,28.5],[-81.3,30.5],[-81.1,31.9],[-79.9,32.7],[-78.5,33.8],[-77,34.6],[-75.5,35.3],[-76,36.9],[-75.6,37.9],[-75,38.8],[-74,40],[-73.9,40.6],[-72,41],[-70,41.7],[-70.6,42.7],[-70.2,43.7],[-68.5,44.3],[-67,44.8],[-67.8,47.1],[-69.2,47.4],[-70.9,45.3],[-71.5,45],[-74.8,45],[-76.4,44.2],[-76.8,43.6],[-79.1,43.3],[-79,42.8],[-80.5,42],[-82.5,41.6],[-83.1,42],[-82.4,43],[-82.5,44.5],[-83.4,45.8],[-84.7,46.5],[-88,47.5],[-89.6,48],[-90.8,48.2],[-94.8,49.4],[-95.2,49],[-123,49],[-124.7,48.4]];
    const inside = (lon, lat) => {
      let hit = false;
      for (let i = 0, j = US.length - 1; i < US.length; j = i++) {
        const [xi, yi] = US[i], [xj, yj] = US[j];
        if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
      }
      return hit;
    };
    const K = 11.4, KX = K * Math.cos(38 * Math.PI / 180);
    const px = (lon) => 32 + (lon + 125) * KX;
    const py = (lat) => 34 + (50 - lat) * K;
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('fill', 'currentColor');
    g.setAttribute('opacity', '.28');
    for (let lat = 49.5; lat > 24; lat -= 0.95) {
      for (let lon = -125; lon < -66; lon += 1.2) {
        if (!inside(lon, lat)) continue;
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', px(lon).toFixed(1));
        c.setAttribute('cy', py(lat).toFixed(1));
        c.setAttribute('r', '2.6');
        g.appendChild(c);
      }
    }
    svg.style.color = 'var(--bg)';
    svg.appendChild(g);

    const la = [px(-118.24), py(34.05)];
    const syr = [px(-76.13), py(43.04)];
    const ctrl = [(la[0] + syr[0]) / 2, Math.min(la[1], syr[1]) - 110];
    svg.insertAdjacentHTML('beforeend', `
      <path class="route" d="M${la} Q${ctrl} ${syr}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>
      <g fill="var(--accent)">
        <circle cx="${la[0]}" cy="${la[1]}" r="7"/><circle cx="${la[0]}" cy="${la[1]}" r="14" opacity=".25"/>
        <circle cx="${syr[0]}" cy="${syr[1]}" r="7"/><circle cx="${syr[0]}" cy="${syr[1]}" r="14" opacity=".25"/>
      </g>
      <g font-family="JetBrains Mono, monospace" font-size="13" font-weight="600" fill="var(--bg)">
        <text x="${la[0] + 14}" y="${la[1] + 26}">LOS ANGELES</text>
        <text x="${syr[0] - 40}" y="${syr[1] + 30}">SYRACUSE</text>
      </g>`);
  }
})();
