#!/usr/bin/env python3
"""Generate the AM-001 (/spec/) sub-pages from one shared header/footer.
Run from the repo root: python3 tools/spec_pages.py"""

HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{title} · AM-001 · Aaron Moradi</title>
  <meta name="robots" content="{robots}" />
  <meta name="theme-color" content="#f2f1ec" />
  <script>document.documentElement.classList.add('js');try{{var t=localStorage.getItem('am_theme');if(t)document.documentElement.dataset.theme=t;if(localStorage.getItem('am_showtime'))document.documentElement.classList.add('showtime')}}catch(e){{}}</script>
  {extra_head}<link rel="stylesheet" href="/spec/spec.css" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png?v=2" />
  <style>{style}</style>
</head>

<body{body_attr}>
  <span class="crop tl"></span><span class="crop tr"></span><span class="crop bl"></span><span class="crop br"></span>
  <div class="gridlines" aria-hidden="true"><div class="wrap"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <header class="doc-head">
    <div class="wrap">
      <div class="top">
        <a class="docno logo" href="/spec/" aria-label="AM-001, Aaron Moradi, home"><span class="reg" aria-hidden="true"></span>AM-001 · Aaron Moradi</a>
        <nav class="index" id="index" aria-label="Sections">
          <a href="/spec/#s1"><b>1.0</b>Ident.</a>
          <a href="/spec/#s2"><b>2.0</b>Assignment</a>
          <a href="/spec/#s3"><b>3.0</b>Service</a>
          <a href="/spec/#s4"><b>4.0</b>Projects</a>
          <a href="/spec/#s5"><b>5.0</b>Measurements</a>
          <a href="/spec/#s6"><b>6.0</b>Contact</a>
          <a href="/spec/map.html"{map_current}><b>SH.2</b>Route map</a>
          <a href="/assets/AaronMoradiResume.pdf" target="_blank" rel="noopener"><b>PDF</b>Resume</a>
        </nav>
        <div class="ctl">
          <button id="gridBtn" aria-pressed="false" title="Show grid (G)">G</button>
          <button data-terminal title="Console (press `)">TTY</button>
          <button data-theme-toggle aria-label="Blueprint mode">☾</button>
          <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="index">☰</button>
        </div>
      </div>
      <div class="readout">
        <div><span>Local time LA</span><b data-la-time>--:--</b></div>
        <div><span>Status</span><b data-status>AT XYZ, SANTA MONICA</b></div>
        <div><span>Rev</span><b data-rev>2026.10</b></div>
        <div><span>Sheet</span><b>{sheet}</b></div>
      </div>
    </div>
  </header>
"""

FOOT = """
  <div class="wrap">
    <div class="titleblock">
      <div><span>Drawn by</span><strong>A. Moradi</strong></div>
      <div><span>Checked</span><strong>A. M.</strong></div>
      <div><span>Rev</span><strong data-rev>2026.10</strong></div>
      <div><span>Sheet</span><strong>{sheet}</strong></div>
      <div><span>Title</span><strong>{block_title}</strong></div>
    </div>
    <div class="foot-row">
      <span>© <span data-year></span> Aaron Moradi · Los Angeles</span>
      <nav aria-label="Footer"><a href="/spec/">Sheet 1</a><a href="/spec/map.html">Sheet 2</a><a href="/assets/AaronMoradiResume.pdf" target="_blank" rel="noopener">Resume</a></nav>
      <a class="egg-meter" href="/spec/vault.html" data-egg-meter hidden></a>
    </div>
  </div>
  {scripts}
</body>
</html>
"""

BASE_SCRIPTS = '<script src="/spec/spec-skin.js"></script>\n  <script src="/js/main.js"></script>\n  <script src="/spec/spec.js"></script>'

def page(path, *, title, sheet, block_title, body, style="", robots="noindex", body_attr="", extra_head="", scripts_before="", scripts_after="", map_current=""):
    html = HEAD.format(title=title, robots=robots, extra_head=extra_head, style=style, body_attr=body_attr, map_current=map_current, sheet=sheet)
    html += body
    html += FOOT.format(sheet=sheet, block_title=block_title,
                        scripts=(scripts_before + "\n  " if scripts_before else "") + BASE_SCRIPTS + ("\n  " + scripts_after if scripts_after else ""))
    open(path, "w").write(html)
    print("wrote", path)

# ---------------------------------------------------------------- Sheet 2: route map
page("spec/map.html", title="Sheet 2 · Route map", sheet="2 of 5", block_title="Route map", map_current=' aria-current="page"',
  extra_head='<link rel="stylesheet" href="/vendor/leaflet-1.9.4/leaflet.css" />\n  ',
  style="""
    .schem { width: 100%; height: auto; display: block; border-top: 2px solid var(--ink); border-bottom: 1px solid var(--ink); }
    .schem .ln { fill: none; stroke-width: 9; stroke-linecap: square; stroke-linejoin: miter; }
    .schem .st { fill: var(--paper); stroke: var(--ink); stroke-width: 3; }
    .schem .ix { fill: var(--paper); stroke: var(--ink); stroke-width: 4; }
    .schem .now { fill: var(--ink); }
    .schem text { fill: var(--ink); font-family: var(--sans); }
    .schem .nm { font-size: 17px; font-weight: 800; font-stretch: 62%; text-transform: uppercase; letter-spacing: .03em; }
    .schem .yr { font: 12px var(--mono); fill: var(--muted); }
    .schem .dist { font: 13px var(--mono); fill: var(--muted); }
    .schem g.stn { cursor: pointer; }
    .schem g.stn:hover .st { fill: var(--ink); }
    .geo { display: grid; grid-template-columns: 300px 1fr; border-top: 2px solid var(--ink); border-bottom: 1px solid var(--ink); }
    .geo aside { border-right: 1px solid var(--ink); padding: 12px 14px 14px 0; display: flex; flex-direction: column; gap: 12px; }
    #map { height: 520px; width: 100%; background: var(--paper); }
    #map .leaflet-tile-pane { filter: grayscale(1) contrast(1.05); }
    #map.dark-tiles .leaflet-tile-pane { filter: grayscale(1) invert(1) contrast(.9) brightness(.85) sepia(.3) hue-rotate(180deg); }
    .pin { width: 26px; height: 26px; display: grid; place-items: center; background: var(--paper); color: var(--ink); border: 2px solid var(--ink); font: 12px var(--mono); }
    .pin.active { background: var(--ink); color: var(--paper); }
    .pin.secret { border-style: dashed; border-color: var(--line-dod); font-size: 13px; }
    .pin.me { border-color: var(--line-syr); }
    .leaflet-div-icon { background: transparent; border: 0; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { border-radius: 0; background: var(--paper); color: var(--ink); box-shadow: none; border: 2px solid var(--ink); }
    .leaflet-popup-content { margin: 12px 14px; font: 14px/1.45 var(--sans); }
    .leaflet-popup-content h3 { margin: 0 0 4px; font: 800 22px/1 var(--sans); font-stretch: 62%; text-transform: uppercase; }
    .leaflet-popup-content p { margin: 0; }
    .pop-when { font: 11px var(--mono); color: var(--muted); text-transform: uppercase; }
    .leaflet-bar { border: 2px solid var(--ink) !important; } .leaflet-bar a { background: var(--paper); color: var(--ink); }
    .leaflet-control-attribution { background: var(--paper) !important; color: var(--muted); font: 10px var(--mono); }
    .chapters { list-style: none; margin: 0; padding: 0; border-top: 2px solid var(--ink); }
    .chapter { width: 100%; display: grid; grid-template-columns: 46px 1fr; gap: 0 8px; text-align: left; background: none; border: 0; border-bottom: 1px solid var(--hair); padding: 8px 0; cursor: pointer; color: inherit; font: inherit; }
    .chapter .k { grid-row: span 2; font: 12px var(--mono); color: var(--muted); }
    .chapter .t { font: 800 17px/1.1 var(--sans); font-stretch: 62%; text-transform: uppercase; }
    .chapter .w { font: 11px var(--mono); color: var(--muted); }
    .chapter.active, .chapter:hover { background: var(--ink); color: var(--paper); }
    .chapter.active .k, .chapter.active .w, .chapter:hover .k, .chapter:hover .w { color: var(--paper); }
    .geo .ctl button { font-size: 11px; }
    @media (max-width: 860px) { .geo { grid-template-columns: 1fr; } .geo aside { border-right: 0; } #map { height: 60vh; } }
  """,
  body="""
  <main class="wrap">
    <section class="sec">
      <div class="sec-no">SH.2</div>
      <div class="sec-title"><h2>Route map</h2><p>Every station on the record, as a schematic (Fig. 2.1) and to scale (Fig. 2.2). Leg distances are great-circle, computed from coordinates at page load.</p></div>
      <div class="sec-body">
        <figure class="fig reveal">
          <svg class="schem" viewBox="0 0 1000 380" role="img" aria-label="Schematic transit-style diagram of Aaron's life: a Los Angeles line through Santa Monica, Westwood, Hollywood and Los Angeles; a branch to Calabasas; and a Syracuse line east to Barnes Center and Syracuse University.">
            <path class="ln" d="M120 280 L580 280" stroke="var(--line-la)"/>
            <path class="ln" d="M120 280 L120 200 L70 150" stroke="var(--line-pa)"/>
            <path class="ln" d="M580 280 L680 180 L940 180" stroke="var(--line-syr)"/>
            <text class="dist" x="700" y="166">2,332 mi</text>
            <g class="stn" data-id="santamonica"><circle class="ix" cx="120" cy="280" r="15"/><circle class="now" cx="120" cy="280" r="6"/><text class="nm" x="92" y="322">Santa Monica</text><text class="yr" x="92" y="340">XYZ · 2025–now</text></g>
            <g class="stn" data-id="calabasas"><circle class="st" cx="70" cy="150" r="10"/><text class="nm" x="90" y="146">Calabasas</text><text class="yr" x="90" y="163">PlanetArt · 2024</text></g>
            <g class="stn" data-id="westwood"><circle class="st" cx="270" cy="280" r="10"/><text class="nm" x="244" y="322">Westwood</text><text class="yr" x="244" y="340">Diddy Riese · 2022</text></g>
            <g class="stn" data-id="hollywood"><circle class="st" cx="420" cy="280" r="10"/><text class="nm" x="392" y="246">Hollywood</text><text class="yr" x="392" y="228">Tea &amp; Coffee · 2019</text></g>
            <g class="stn" data-id="la"><circle class="ix" cx="580" cy="280" r="18"/><text class="nm" x="552" y="322">Los Angeles</text><text class="yr" x="552" y="340">Home · interchange</text></g>
            <g class="stn" data-id="syracuse"><circle class="st" cx="810" cy="180" r="10"/><text class="nm" x="782" y="222">Barnes Center</text><text class="yr" x="782" y="240">Guest Services · 2022–25</text></g>
            <g class="stn" data-id="syracuse"><circle class="ix" cx="940" cy="180" r="15"/><text class="nm" x="868" y="140">Syracuse Univ.</text><text class="yr" x="868" y="122">B.S. CS · 2025</text></g>
          </svg>
          <div class="legend"><span><span class="swatch" style="--c:var(--line-la)"></span>Los Angeles line</span><span><span class="swatch" style="--c:var(--line-syr)"></span>Syracuse line</span><span><span class="swatch" style="--c:var(--line-pa)"></span>PlanetArt branch</span><span>◎ interchange · ● current station</span></div>
          <figcaption><b>Fig. 2.1</b> Schematic. Not to scale. Select a station to locate it in Fig. 2.2.</figcaption>
        </figure>

        <table class="spec compact reveal" style="margin:34px 0">
          <thead><tr><th>Leg</th><th>From</th><th>To</th><th class="num">Miles</th></tr></thead>
          <tbody id="legs"></tbody>
          <tfoot><tr><th colspan="3" style="border-top:2px solid var(--ink)">Total, in order of service</th><td class="num" id="legTotal" style="border-top:2px solid var(--ink)">—</td></tr></tfoot>
        </table>

        <figure class="fig reveal" id="geo">
          <div class="geo">
            <aside>
              <div class="ctl"><button id="tourBtn">▶ Tour</button><button id="overviewBtn">Extents</button><button id="meBtn" title="Uses your location once; never stored">Locate me</button></div>
              <table class="spec compact"><tbody><tr><th>Stations</th><td class="num" id="statPlaces">6</td></tr><tr><th>LA ↔ SYR</th><td class="num"><span id="statMiles">—</span> mi</td></tr></tbody></table>
              <ol class="chapters" id="chapters"></ol>
              <p class="mono" style="font-size:11px;color:var(--muted);margin:auto 0 0">Two stations are omitted from the schematic. They resolve only at high zoom over downtown LA.</p>
            </aside>
            <div id="map" role="region" aria-label="Interactive map"></div>
          </div>
          <figcaption><b>Fig. 2.2</b> Geographic. OpenStreetMap contributors.</figcaption>
        </figure>
      </div>
    </section>
  </main>
""",
  scripts_before='<script src="/vendor/leaflet-1.9.4/leaflet.js"></script>',
  scripts_after="""<script src="/js/map.js"></script>
  <script>
  (() => {
    const P = { la: ['Los Angeles', 34.0522, -118.2437], hollywood: ['Hollywood', 34.0983, -118.3267], syracuse: ['Syracuse', 43.0377, -76.134], westwood: ['Westwood', 34.063, -118.4472], calabasas: ['Calabasas', 34.1446, -118.6448], santamonica: ['Santa Monica', 34.0195, -118.4912] };
    const order = ['la', 'hollywood', 'syracuse', 'westwood', 'calabasas', 'santamonica'];
    const rad = (d) => d * Math.PI / 180;
    const mi = (a, b) => { const h = Math.sin(rad(b[1] - a[1]) / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(rad(b[2] - a[2]) / 2) ** 2; return 2 * 3958.8 * Math.asin(Math.sqrt(h)); };
    let total = 0;
    document.getElementById('legs').innerHTML = order.slice(1).map((k, i) => {
      const a = P[order[i]], b = P[k], d = mi(a, b); total += d;
      return `<tr><th>L.${i + 1}</th><td>${a[0]}</td><td>${b[0]}</td><td class="num">${Math.round(d).toLocaleString()}</td></tr>`;
    }).join('');
    document.getElementById('legTotal').textContent = Math.round(total).toLocaleString();
    // schematic stations jump to the same chapter in the geographic view
    document.querySelectorAll('.schem g.stn').forEach((g) => g.addEventListener('click', () => {
      document.getElementById('geo').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => document.querySelector(`.chapter[data-id="${g.dataset.id}"]`)?.click(), 450);
    }));
  })();
  </script>""")

# ---------------------------------------------------------------- NCR-404
page("spec/ncr.html", title="NCR-404 · Nonconformance report", sheet="NCR-404", block_title="Nonconformance report", body_attr=' data-egg="lost"',
  style="""
    .plot { position: relative; border: 2px solid var(--ink); }
    #range { display: block; width: 100%; height: 460px; touch-action: none; cursor: crosshair; }
    .read { position: absolute; left: 12px; top: 10px; font: 12px var(--mono); background: var(--paper); border: 1px solid var(--ink); padding: 6px 9px; pointer-events: none; }
    .verdict { position: absolute; right: 12px; top: 10px; font: 800 26px/1 var(--sans); font-stretch: 62%; text-transform: uppercase; padding: 6px 10px; border: 3px solid currentColor; opacity: 0; transform: rotate(-4deg); transition: opacity .15s; pointer-events: none; }
    .verdict.on { opacity: 1; }
    .verdict.pass { color: var(--line-pa); } .verdict.fail { color: var(--red); }
    .log-wrap { max-height: 260px; overflow-y: auto; border-bottom: 1px solid var(--ink); }
    @media (max-width: 600px) { #range { height: 380px; } }
  """,
  body="""
  <main class="wrap">
    <section class="sec">
      <div class="sec-no">404</div>
      <div class="sec-title"><h2>Nonconformance report</h2><p>Requested sheet does not exist in the drawing set. While a disposition is pending, the ballistics range is open: drag back from the projectile, release to fire. Five consecutive passes are within tolerance.</p></div>
      <div class="sec-body">
        <table class="spec compact reveal" style="margin-bottom:24px">
          <tbody>
            <tr><th>NCR</th><td class="mono">404</td></tr>
            <tr><th>Item</th><td class="mono" id="reqPath">—</td></tr>
            <tr><th>Finding</th><td>Sheet not found in AM-001.</td></tr>
            <tr><th>Disposition</th><td><a href="/spec/">Return to Sheet 1</a> · <a href="/spec/map.html">Sheet 2</a></td></tr>
          </tbody>
        </table>
        <figure class="fig">
          <div class="plot"><canvas id="range" aria-label="Ballistics range: drag back from the projectile and release to fire at the hoop"></canvas><div class="read" id="read">θ —° · v₀ — · streak 0</div><div class="verdict" id="verdict">Pass</div></div>
          <figcaption><b>Fig. N.1</b> Ballistics range. Grid at 50 px. Last trajectory retained.</figcaption>
        </figure>
        <table class="spec compact" style="margin-top:24px"><thead><tr><th>Shot</th><th class="num">θ</th><th class="num">v₀</th><th class="num">Streak</th><th class="num">Result</th></tr></thead></table>
        <div class="log-wrap"><table class="spec compact"><tbody id="log"><tr><td class="mono" style="color:var(--muted)">No shots logged.</td></tr></tbody></table></div>
      </div>
    </section>
  </main>
""",
  scripts_after="""<script>
  (() => {
    document.getElementById('reqPath').textContent = location.pathname;
    const cv = document.getElementById('range'), ctx = cv.getContext('2d');
    const $ = (id) => document.getElementById(id);
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const R = 12, G = 0.38, RIM = 64;
    let W, H, hoop = {}, ball, drag = null, fly = false, t0 = 0, scored = false, trace = [], last = [], shots = 0, streak = 0, theta = 0, v0 = 0;
    function resize() { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); place(true); reset(); }
    function place(first) { hoop.x = W - Math.max(30, W * .06); hoop.y = first ? H * .38 : H * (.25 + Math.random() * .3); }
    function reset() { const x = Math.max(60, W * (.1 + Math.random() * .2)); ball = { x, y: H - R - 30, vx: 0, vy: 0 }; fly = false; scored = false; trace = []; }
    function bounce(p) { const dx = ball.x - p.x, dy = ball.y - p.y, d = Math.hypot(dx, dy); if (d < R + 4 && d > 0) { const nx = dx / d, ny = dy / d, k = ball.vx * nx + ball.vy * ny; if (k < 0) { ball.vx -= 1.75 * k * nx; ball.vy -= 1.75 * k * ny; } ball.x = p.x + nx * (R + 4); ball.y = p.y + ny * (R + 4); } }
    function step() {
      const py = ball.y; ball.vy += G; ball.x += ball.vx; ball.y += ball.vy; trace.push([ball.x, ball.y]);
      bounce({ x: hoop.x - RIM, y: hoop.y }); bounce({ x: hoop.x - 2, y: hoop.y });
      if (ball.x + R > hoop.x && ball.x < hoop.x + 8 && ball.y > hoop.y - 90 && ball.y < hoop.y + 14 && ball.vx > 0) { ball.x = hoop.x - R; ball.vx *= -.6; }
      if (ball.y + R > H - 30) { ball.y = H - 30 - R; ball.vy *= -.55; ball.vx *= .8; }
      if (ball.x - R < 0) { ball.x = R; ball.vx *= -.6; }
      if (!scored && py < hoop.y && ball.y >= hoop.y && ball.x > hoop.x - RIM + R * .4 && ball.x < hoop.x - R * .4) { scored = true; }
      if ((Math.abs(ball.vy) < .8 && ball.y + R >= H - 31 && Math.abs(ball.vx) < .4) || ball.x - R > W || performance.now() - t0 > 6000) finish();
    }
    function finish() {
      shots++; streak = scored ? streak + 1 : 0; last = trace.slice();
      const v = $('verdict'); v.textContent = scored ? 'Pass' : 'Fail'; v.className = 'verdict on ' + (scored ? 'pass' : 'fail'); clearTimeout(finish.t); finish.t = setTimeout(() => v.classList.remove('on'), 900);
      const log = $('log'); if (shots === 1) log.innerHTML = '';
      log.insertAdjacentHTML('afterbegin', `<tr><th>S.${String(shots).padStart(3, '0')}</th><td class="num">${theta.toFixed(1)}°</td><td class="num">${v0.toFixed(1)}</td><td class="num">${streak}</td><td class="num" style="color:${scored ? 'var(--line-pa)' : 'var(--red)'}">${scored ? 'PASS' : 'FAIL'}</td></tr>`);
      if (streak === 5) { AM.findEgg('hoops'); AM.confetti('party', 120); }
      if (scored) place(false); reset(); readout();
    }
    function vel() { const k = .13, mx = 22; let vx = (drag.sx - drag.x) * k, vy = (drag.sy - drag.y) * k; const m = Math.hypot(vx, vy); if (m > mx) { vx *= mx / m; vy *= mx / m; } return { vx, vy }; }
    function readout() { $('read').textContent = `θ ${theta ? theta.toFixed(1) : '—'}° · v₀ ${v0 ? v0.toFixed(1) : '—'} · streak ${streak}`; }
    function draw() {
      const ink = css('--ink'), hair = css('--hair'), muted = css('--muted'), red = css('--red');
      ctx.clearRect(0, 0, W, H); ctx.font = '10px "Fragment Mono", monospace';
      ctx.strokeStyle = hair; ctx.lineWidth = 1; ctx.fillStyle = muted;
      for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H - 30); ctx.stroke(); if (x) ctx.fillText(x, x + 3, H - 18); }
      for (let y = H - 30; y > 0; y -= 50) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); ctx.fillText(H - 30 - y, 3, y - 3); }
      ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, H - 30); ctx.lineTo(W, H - 30); ctx.stroke();
      ctx.fillStyle = ink; ctx.fillRect(hoop.x, hoop.y - 90, 6, 104); ctx.fillRect(hoop.x + 6, hoop.y - 40, 3, H);
      ctx.strokeStyle = red; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(hoop.x - RIM, hoop.y); ctx.lineTo(hoop.x, hoop.y); ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = muted; ctx.beginPath(); for (let i = 0; i <= 4; i++) { ctx.moveTo(hoop.x - RIM + RIM * i / 4, hoop.y); ctx.lineTo(hoop.x - RIM + RIM * .2 + RIM * .6 * i / 4, hoop.y + 40); } ctx.stroke();
      const dots = (pts, c) => { ctx.fillStyle = c; pts.forEach(([x, y], i) => { if (i % 3 === 0) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); } }); };
      dots(last, muted); dots(trace, ink);
      if (drag) { const v = vel(); let x = ball.x, y = ball.y, vy = v.vy; ctx.setLineDash([4, 4]); ctx.strokeStyle = ink; ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < 40; i++) { vy += G; x += v.vx; y += vy; ctx.lineTo(x, y); } ctx.stroke(); ctx.setLineDash([]); }
      ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, 7); ctx.fill();
      ctx.strokeStyle = css('--paper'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ball.x - R, ball.y); ctx.lineTo(ball.x + R, ball.y); ctx.moveTo(ball.x, ball.y - R); ctx.lineTo(ball.x, ball.y + R); ctx.stroke();
    }
    const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.addEventListener('pointerdown', (e) => { if (fly) return; const p = pt(e); drag = { sx: p.x, sy: p.y, x: p.x, y: p.y }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', (e) => { if (!drag) return; const p = pt(e); drag.x = p.x; drag.y = p.y; const v = vel(); theta = Math.atan2(-v.vy, v.vx) * 180 / Math.PI; v0 = Math.hypot(v.vx, v.vy); readout(); });
    cv.addEventListener('pointerup', () => { if (!drag) return; const v = vel(); drag = null; if (Math.hypot(v.vx, v.vy) < 2) return; ball.vx = v.vx; ball.vy = v.vy; fly = true; t0 = performance.now(); });
    addEventListener('resize', resize); resize();
    let lt = performance.now(), acc = 0;
    (function loop(now) { acc += Math.min(now - lt, 100); lt = now; while (acc >= 1000 / 60) { if (fly) step(); acc -= 1000 / 60; } draw(); requestAnimationFrame(loop); })(lt);
  })();
  </script>""")

# ---------------------------------------------------------------- Appendix E
page("spec/vault.html", title="Appendix E · Inspection checklist", sheet="App. E", block_title="Appendix E: inspection checklist", robots="noindex, nofollow", body_attr=' data-egg="vault"',
  style="""
    .chk td, .chk th { vertical-align: middle; }
    .chk tr.open td { background: repeating-linear-gradient(-45deg, transparent 0 6px, var(--hair-2) 6px 8px); color: var(--muted); }
    .chk .st { font: 12px var(--mono); }
    .chk tr.done .st { color: var(--line-pa); }
    .chk tr.open .st { color: var(--red); }
    .stamp { position: fixed; left: 50%; top: 46%; z-index: 120; pointer-events: none; display: none; border: 6px solid var(--red); color: var(--red); padding: 14px 30px; font: 800 clamp(40px, 7vw, 86px)/1 var(--sans); font-stretch: 62%; text-transform: uppercase; letter-spacing: .06em; mix-blend-mode: multiply; }
    .stamp.on { display: block; animation: thud .45s cubic-bezier(.2, 1.3, .4, 1) forwards; }
    @keyframes thud { from { transform: translate(-50%, -50%) rotate(-8deg) scale(2); opacity: 0; } to { transform: translate(-50%, -50%) rotate(-8deg) scale(1); opacity: .85; } }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 2px solid var(--ink); margin-bottom: 26px; }
    .summary div { padding: 12px 12px 12px 0; border-bottom: 1px solid var(--hair); }
    .summary b { display: block; font: 800 48px/.9 var(--sans); font-stretch: 62%; }
    .summary span { font: 11px var(--mono); color: var(--muted); text-transform: uppercase; }
  """,
  body="""
  <main class="wrap">
    <section class="sec">
      <div class="sec-no">E</div>
      <div class="sec-title"><h2>Appendix E · Inspection checklist</h2><p>Thirteen items are concealed across AM-001. Items pass inspection when found. Records are kept in this browser only.</p></div>
      <div class="sec-body">
        <div class="summary"><div><b id="nDone">0</b><span>Items passed</span></div><div><b id="nOpen">13</b><span>Items open</span></div><div><b id="pct">0%</b><span>Inspection complete</span></div></div>
        <table class="spec compact chk">
          <thead><tr><th>ID</th><th>Item</th><th>Status</th><th class="num">First found</th></tr></thead>
          <tbody id="rows"></tbody>
        </table>
        <p style="margin-top:22px"><button class="btn ghost" id="resetBtn">Void all inspections</button></p>
      </div>
    </section>
  </main>
  <div class="stamp" id="stamp" aria-hidden="true">Inspected · A.M.</div>
""",
  scripts_after="""<script>
  (() => {
    let stamped = false;
    function render() {
      const found = AM.foundEggs(), dates = AM.foundDates();
      const n = AM.EGGS.filter((e) => found.has(e.id)).length;
      document.getElementById('rows').innerHTML = AM.EGGS.map((e) => {
        const f = found.has(e.id), d = dates[e.id] ? new Date(dates[e.id]).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (f ? 'on record' : '—');
        return `<tr class="${f ? 'done' : 'open'}"><th>${e.icon}</th><td>${f ? '<b>' + e.name + '</b>' : e.hint}</td><td class="st">${f ? 'PASS' : 'OPEN'}</td><td class="num mono" style="font-size:12px">${d}</td></tr>`;
      }).join('');
      document.getElementById('nDone').textContent = n;
      document.getElementById('nOpen').textContent = AM.EGGS.length - n;
      document.getElementById('pct').textContent = Math.round(n / AM.EGGS.length * 100) + '%';
      if (n === AM.EGGS.length && !stamped) { stamped = true; const s = document.getElementById('stamp'); s.classList.add('on'); setTimeout(() => s.classList.remove('on'), 3500); }
    }
    render();
    addEventListener('am:egg', render);
    document.getElementById('resetBtn').addEventListener('click', () => { if (!confirm('Void every inspection record?')) return; AM.resetEggs(); stamped = false; render(); });
  })();
  </script>""")

# ---------------------------------------------------------------- Rev. 0
page("spec/rev0.html", title="Rev. 0 · Superseded draft", sheet="Rev. 0", block_title="Superseded draft", body_attr=' data-egg="forgotten"',
  style="""
    .draft { position: relative; max-width: 720px; margin: 10px 0 0; padding: 40px 34px 90px; border: 1px solid var(--ink); background: #fff; color: #000; overflow: hidden; }
    .draft h2 { font: bold 24px "Times New Roman", serif; margin: 0 0 14px; }
    .draft h1 { font: bold 32px "Times New Roman", serif; margin: 0; }
    .band { position: absolute; left: -60px; right: -60px; top: 58%; transform: rotate(-12deg); background: var(--red); color: #fff; text-align: center; font: 800 32px/1 var(--sans); font-stretch: 62%; letter-spacing: .3em; padding: 10px 0 8px; opacity: .88; }
    .red-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
    .red-layer path, .red-layer ellipse { fill: none; stroke: var(--red); stroke-width: 2.5; stroke-linecap: round; }
    .red-layer text { fill: var(--red); font: 13px var(--mono); }
    .red-layer .draw { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); animation: ink 1s ease forwards; animation-delay: var(--d); }
    .red-layer text.draw { opacity: 0; animation: fadein .4s ease forwards; animation-delay: var(--d); }
    @keyframes ink { to { stroke-dashoffset: 0; } }
    @keyframes fadein { to { opacity: 1; } }
  """,
  body="""
  <main class="wrap">
    <section class="sec">
      <div class="sec-no">R.0</div>
      <div class="sec-title"><h2>Superseded draft</h2><p>about.html, first committed 2025-09-06 01:35 PT (60f8306, message "Updatesw="). Retained for the record with redlines. Original still served at <a href="/about.html">/about.html</a>.</p></div>
      <div class="sec-body">
        <figure class="fig">
          <div class="draft" id="draft">
            <h2 id="l1">This is my about page test</h2>
            <h1 id="l2">I completely forgot about this...</h1>
            <div class="band">Superseded</div>
            <svg class="red-layer" id="red" aria-hidden="true"></svg>
          </div>
          <figcaption><b>Fig. R.1</b> Rev. 0 with redlines. Superseded by Rev. 2026.10, <a href="/spec/">Sheet 1</a>.</figcaption>
        </figure>
      </div>
    </section>
  </main>
""",
  scripts_after="""<script>
  (() => {
    // redlines are placed against the real text boxes so they land on the words at any width
    const draft = document.getElementById('draft'), svg = document.getElementById('red');
    function draw() {
      const b = draft.getBoundingClientRect(), r1 = document.getElementById('l1').getBoundingClientRect(), r2 = document.getElementById('l2').getBoundingClientRect();
      const L = (r) => ({ x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height });
      const a = L(r1), c = L(r2);
      // measure the actual text width, not the block width
      const tw = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect().width; };
      const w1 = tw(document.getElementById('l1')), w2 = tw(document.getElementById('l2'));
      svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
      svg.innerHTML = `
        <path class="draw" style="--len:${w1 + 20};--d:.2s" d="M${a.x - 6} ${a.y + a.h / 2 + 2} L${a.x + w1 + 8} ${a.y + a.h / 2 - 2}"/>
        <text class="draw" style="--d:.9s" x="${Math.min(a.x + w1 + 16, b.width - 190)}" y="${a.y + a.h / 2 + 4}">← "test"? see Sheet 1</text>
        <ellipse class="draw" style="--len:420;--d:1.2s" cx="${c.x + w2 * 0.44}" cy="${c.y + c.h / 2}" rx="${w2 * 0.17}" ry="${c.h / 1.5}"/>
        <path class="draw" style="--len:140;--d:1.9s" d="M${c.x + w2 * 0.44} ${c.y + c.h + 10} q 10 40 60 46"/>
        <text class="draw" style="--d:2.3s" x="${c.x + w2 * 0.44 + 66}" y="${c.y + c.h + 60}">remembered. rewritten as §1.0–6.0</text>`;
    }
    draw(); addEventListener('resize', draw); document.fonts?.ready.then(draw);
  })();
  </script>""")
