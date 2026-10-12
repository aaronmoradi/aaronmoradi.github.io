/* "The Shoebox" page behaviour. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const LA = 'America/Los_Angeles';
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A slightly wobbly pen line, so nothing looks ruler-straight.
  const wobble = (x1, y1, x2, y2, amp = 2.2) => {
    const mx = (x1 + x2) / 2 + (Math.random() - .5) * amp * 2, my = (y1 + y2) / 2 + (Math.random() - .5) * amp * 2;
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };

  /* ---------- red-pen underline under every title ---------- */
  $$('.title').forEach((t) => {
    t.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M1 6 C 20 ${2 + Math.random() * 3}, 45 ${7 + Math.random() * 2}, 70 ${4 + Math.random() * 2} S 92 5, 99 ${3 + Math.random() * 3}"/></svg>`);
  });

  /* ---------- hand-drawn LA clock ---------- */
  const clock = $('#laClock');
  if (clock) {
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2, r1 = i % 3 ? 40 : 36, r2 = 44;
      return `<path d="${wobble(50 + Math.sin(a) * r1, 50 - Math.cos(a) * r1, 50 + Math.sin(a) * r2, 50 - Math.cos(a) * r2, .6)}"/>`;
    }).join('');
    clock.innerHTML = `<circle cx="50" cy="50" r="47" style="stroke-width:2.6"/>${ticks}
      <path id="hh" d="M50 50 L50 28" style="stroke-width:4"/><path id="mh" d="M50 50 L50 16" style="stroke-width:2.6"/><circle cx="50" cy="50" r="2.5" style="fill:currentColor"/>`;
    const paint = () => {
      const [h, m] = new Date().toLocaleTimeString('en-US', { timeZone: LA, hour12: false, hour: '2-digit', minute: '2-digit' }).split(':').map(Number);
      $('#hh', clock).setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} 50 50)`);
      $('#mh', clock).setAttribute('transform', `rotate(${m * 6} 50 50)`);
      const t = new Date().toLocaleTimeString('en-US', { timeZone: LA, hour: 'numeric', minute: '2-digit' });
      $$('[data-la-time]').forEach((el) => { el.textContent = t; });
    };
    paint();
    setInterval(paint, 20000);
  }

  /* ---------- "Est. L.A." sticker: 8 taps (or 24) ---------- */
  const sticker = $('#estSticker');
  if (sticker) {
    let taps = 0;
    sticker.addEventListener('click', () => {
      taps++;
      sticker.style.setProperty('--r', `${10 + taps * 45}deg`);
      if (taps === 8) { AM.findEgg('mamba'); AM.confetti('lakers', 90); }
      if (taps === 24) { AM.confetti('lakers', 240); AM.toast('8 <i>and</i> 24. <b>Mamba forever.</b>'); }
    });
  }

  /* ---------- cassette J-card → Spotify ---------- */
  const player = $('#spotify-player');
  $$('.jcard button[data-track]').forEach((b) => b.addEventListener('click', () => {
    player.src = `https://open.spotify.com/embed/track/${b.dataset.track}?utm_source=generator&theme=0`;
    $$('.jcard button[data-track]').forEach((x) => x.classList.toggle('on', x === b));
  }));

  /* ---------- visitor tally marks + exact count stamp ---------- */
  const tally = $('#tally');
  if (tally) {
    const draw = (n) => {
      const groups = Math.min(Math.ceil(n / 5), 6);
      let left = Math.min(n, 30), html = '';
      for (let g = 0; g < groups; g++) {
        const k = Math.min(5, left); left -= k;
        let d = '';
        for (let i = 0; i < Math.min(k, 4); i++) d += wobble(6 + i * 9, 6 + Math.random() * 3, 5 + i * 9 + Math.random() * 2, 34 + Math.random() * 3, 1);
        if (k === 5) d += wobble(1, 30, 40, 9, 1.5);
        html += `<svg viewBox="0 0 44 40" aria-hidden="true"><path d="${d}"/></svg>`;
      }
      tally.innerHTML = html;
    };
    draw(30);
    fetch('https://api.counterapi.dev/v2/aaron-moradis-team-3783/ronmo/up')
      .then((r) => r.json())
      .then((d) => {
        const n = d?.data?.up_count ?? d?.count ?? d?.data?.count;
        if (typeof n === 'number') { $('#countStamp').textContent = `No. ${n.toLocaleString()}`; draw(n); }
      })
      .catch(() => {});
  }

  /* ---------- postcard: postmark, then send ---------- */
  const card = $('#postcardForm');
  if (card) {
    card.addEventListener('submit', (e) => {
      if (card.dataset.sent) return;
      e.preventDefault();
      $('.postmark', card.closest('.postcard')).classList.add('stamped');
      card.dataset.sent = '1';
      setTimeout(() => card.submit(), reduce ? 0 : 650);
    });
  }

  /* ---------- pen-drawn route on the torn atlas page ---------- */
  const atlas = $('#atlasSvg');
  if (atlas) {
    const US = [[-124.7,48.4],[-124,46.3],[-124.1,43.7],[-124.4,42],[-124.2,40.4],[-123,38],[-122.4,37.2],[-121.9,36.3],[-120.6,34.6],[-118.5,34],[-117.2,32.6],[-114.7,32.7],[-111.1,31.3],[-108.2,31.3],[-108.2,31.8],[-106.5,31.8],[-104.9,30.6],[-104.4,29.6],[-103.2,29],[-102.4,29.8],[-101.4,29.8],[-100.3,28.3],[-99.5,27.5],[-97.4,25.9],[-97.4,27.4],[-96.6,28.4],[-94.7,29.4],[-93.8,29.7],[-92,29.6],[-90.5,29.1],[-89.2,29.2],[-89.6,30.2],[-88,30.4],[-86.5,30.4],[-85.3,29.7],[-84,30],[-82.8,28.2],[-82.6,27],[-81.7,25.9],[-80.9,25.1],[-80.4,25.2],[-80,26.7],[-80.6,28.5],[-81.3,30.5],[-81.1,31.9],[-79.9,32.7],[-78.5,33.8],[-77,34.6],[-75.5,35.3],[-76,36.9],[-75.6,37.9],[-75,38.8],[-74,40],[-73.9,40.6],[-72,41],[-70,41.7],[-70.6,42.7],[-70.2,43.7],[-68.5,44.3],[-67,44.8],[-67.8,47.1],[-69.2,47.4],[-70.9,45.3],[-71.5,45],[-74.8,45],[-76.4,44.2],[-76.8,43.6],[-79.1,43.3],[-79,42.8],[-80.5,42],[-82.5,41.6],[-83.1,42],[-82.4,43],[-82.5,44.5],[-83.4,45.8],[-84.7,46.5],[-88,47.5],[-89.6,48],[-90.8,48.2],[-94.8,49.4],[-95.2,49],[-123,49],[-124.7,48.4]];
    const K = 9.6, KX = K * Math.cos(38 * Math.PI / 180);
    const px = (lon) => 16 + (lon + 125) * KX, py = (lat) => 20 + (50 - lat) * K;
    const outline = US.map(([lon, lat], i) => `${i ? 'L' : 'M'}${(px(lon) + (Math.random() - .5)).toFixed(1)} ${(py(lat) + (Math.random() - .5)).toFixed(1)}`).join(' ');
    const la = [px(-118.24), py(34.05)], syr = [px(-76.13), py(43.04)];
    const c = [(la[0] + syr[0]) / 2, Math.min(la[1], syr[1]) - 95];
    atlas.innerHTML = `
      <path d="${outline}" fill="none" stroke="#6d6253" stroke-width="1.6" stroke-linejoin="round" opacity=".7"/>
      <path id="route" d="M${la} Q${c} ${syr}" fill="none" stroke="#c2362b" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 0"/>
      <circle cx="${la[0]}" cy="${la[1]}" r="6" fill="none" stroke="#23336b" stroke-width="2.5"/>
      <circle cx="${syr[0]}" cy="${syr[1]}" r="6" fill="none" stroke="#23336b" stroke-width="2.5"/>
      <text class="lbl" x="${la[0] - 8}" y="${la[1] + 34}">home</text>
      <text class="lbl" x="${syr[0] - 70}" y="${syr[1] + 34}">school!</text>
      <text class="lbl" x="${(la[0] + 2 * c[0] + syr[0]) / 4 - 40}" y="${(la[1] + 2 * c[1] + syr[1]) / 4 + 30}" style="fill:#23336b">2,332 mi</text>`;
    const route = $('#route', atlas);
    const len = route.getTotalLength();
    route.style.strokeDasharray = `${len}`;
    route.style.strokeDashoffset = reduce ? 0 : len;
    new IntersectionObserver((es, io) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      route.style.transition = 'stroke-dashoffset 2.4s ease-in-out';
      route.style.strokeDashoffset = 0;
      io.disconnect();
    }), { threshold: .4 }).observe(atlas);
  }

  /* ---------- Showtime: sweep a purple & gold highlighter across the page ---------- */
  let wasShowtime = document.documentElement.classList.contains('showtime');
  addEventListener('am:theme', () => {
    const now = document.documentElement.classList.contains('showtime');
    if (now && !wasShowtime && !reduce) {
      const s = document.createElement('div');
      s.className = 'sweep';
      document.body.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    }
    wasShowtime = now;
  });

  /* ---------- lamp switch label + "last glued in" ---------- */
  const lamp = () => $$('[data-theme-toggle]').forEach((b) => {
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    b.textContent = dark ? '💡 lamp off' : '💡 lamp on';
  });
  lamp();
  // main.js paints its own icon on DOMContentLoaded; repaint after it
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lamp);
  addEventListener('am:theme', lamp);
  const glued = new Date(document.lastModified);
  $$('[data-glued]').forEach((el) => { el.textContent = isNaN(glued) ? '' : glued.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); });
})();
