#!/usr/bin/env python3
"""Generate the Departures (/departures/) sub-pages from one shared header/footer.
Run from the repo root: python3 tools/departures_pages.py"""

ICONS = open("departures/index.html").read().split('<svg width="0" height="0"', 1)[1].split("</svg>", 1)[0]
ICONS = '<svg width="0" height="0"' + ICONS + "</svg>"

HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{title} · Departures · Aaron Moradi</title>
  <meta name="robots" content="{robots}" />
  <meta name="theme-color" content="#0a0a0b" />
  <script>document.documentElement.classList.add('js');try{{if(localStorage.getItem('am_showtime'))document.documentElement.classList.add('showtime')}}catch(e){{}}</script>
  {extra_head}<link rel="stylesheet" href="/departures/departures.css" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png?v=2" />
  <style>{style}</style>
  {icons}
</head>

<body{body_attr}>
  <header class="topbar">
    <div class="wrap in">
      <a class="mark logo" href="/departures/" aria-label="Aaron Moradi, home"><span class="code">AM</span>Aaron Moradi</a>
      <nav class="topnav" id="topnav" aria-label="Main">
        <a href="/departures/#departures">Departures</a>
        <a href="/departures/#info">Information</a>
        <a href="/departures/#gates">Gates</a>
        <a href="/departures/map.html"{map_cur}>Route map</a>
        <a href="/departures/#pass">Boarding pass</a>
        <a href="/assets/AaronMoradiResume.pdf" target="_blank" rel="noopener">Resume</a>
      </nav>
      <div class="tools">
        <button class="tbtn" data-terminal title="Gate agent (press `)">Agent</button>
        <button class="tbtn menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="topnav">☰</button>
      </div>
    </div>
  </header>
"""

FOOT = """
  <footer class="arrivals" style="padding-top:30px">
    <div class="wrap">
      <div class="foot-row">
        <span>© <span data-year></span> Aaron Moradi</span>
        <nav aria-label="Footer"><a href="/departures/">Departures</a><a href="/departures/map.html">Route map</a><a href="/assets/AaronMoradiResume.pdf" target="_blank" rel="noopener">Resume</a></nav>
        <a class="egg-meter" href="/departures/vault.html" data-egg-meter hidden></a>
      </div>
    </div>
  </footer>
  {before}<script src="/departures/flap.js"></script>
  <script src="/departures/departures-skin.js"></script>
  <script src="/js/main.js"></script>{after}
</body>
</html>
"""

def page(path, *, title, body, style="", robots="noindex", body_attr="", extra_head="", before="", after="", map_cur=""):
    html = HEAD.format(title=title, robots=robots, extra_head=extra_head, style=style, body_attr=body_attr, map_cur=map_cur, icons=ICONS)
    html += body + FOOT.format(before=(before + "\n  " if before else ""), after=("\n  " + after if after else ""))
    open(path, "w").write(html)
    print("wrote", path)

ZONE = """<div class="zone-head"><div class="pict"><svg aria-hidden="true"><use href="#{icon}"/></svg></div><div class="txt"><h2>{h}</h2><p>{p}</p></div></div>"""

# ------------------------------------------------------------------ route map
page("departures/map.html", title="Route map", map_cur=' aria-current="page"',
  extra_head='<link rel="stylesheet" href="/vendor/leaflet-1.9.4/leaflet.css" />\n  ',
  style="""
    .rm { display: grid; grid-template-columns: 330px 1fr; background: var(--housing); border: 1px solid #000; }
    .rm aside { padding: 16px; display: flex; flex-direction: column; gap: 14px; border-right: 1px solid #000; }
    #map { height: 620px; width: 100%; background: #111; }
    #map .leaflet-tile-pane { filter: grayscale(1) invert(1) brightness(.78) contrast(1.15); }
    .pin { width: 28px; height: 28px; display: grid; place-items: center; background: var(--sign); color: var(--sign-ink); font: 900 13px var(--sans); box-shadow: 0 0 0 2px #000; }
    .pin.active { background: var(--glyph); }
    .pin.secret { background: #111; color: inherit; outline: 2px dashed var(--sign); font-size: 15px; }
    .pin.me { background: var(--amber); }
    .leaflet-div-icon { background: transparent; border: 0; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { border-radius: 0; background: var(--sign); color: var(--sign-ink); box-shadow: 0 10px 30px rgba(0,0,0,.6); }
    .leaflet-popup-content { margin: 12px 14px; font: 15px/1.45 var(--sans); }
    .leaflet-popup-content h3 { margin: 0 0 4px; font: 900 24px/1 var(--sans); }
    .leaflet-popup-content p { margin: 0; }
    .leaflet-container a.leaflet-popup-close-button { color: var(--sign-ink); }
    .pop-when { font: 800 11px var(--sans); letter-spacing: .14em; text-transform: uppercase; }
    .leaflet-bar { border: 0 !important; } .leaflet-bar a { background: var(--sign); color: var(--sign-ink); border-radius: 0 !important; border-bottom: 1px solid #000 !important; }
    .leaflet-control-attribution { background: rgba(0,0,0,.7) !important; color: var(--dim); font: 10px var(--mono); }
    .leaflet-control-attribution a { color: var(--glyph); }
    .chapters { list-style: none; margin: 0; padding: 0; }
    .chapter { width: 100%; display: grid; grid-template-columns: 34px 1fr; gap: 0 10px; text-align: left; background: none; border: 0; border-top: 1px solid #000; box-shadow: inset 0 1px 0 rgba(255,255,255,.03); padding: 10px 0; cursor: pointer; color: var(--glyph); font: inherit; }
    .chapter .k { grid-row: span 2; font: 900 15px var(--mono); color: var(--sign); }
    .chapter .t { font: 800 18px/1.1 var(--sans); text-transform: uppercase; }
    .chapter .w { font: 600 12px var(--mono); color: var(--dim); text-transform: uppercase; }
    .chapter.active, .chapter:hover { background: var(--sign); color: var(--sign-ink); }
    .chapter.active .k, .chapter:hover .k, .chapter.active .w, .chapter:hover .w { color: var(--sign-ink); }
    .rm .tbtn { border-color: #333; }
    .rm .stat { font: 600 13px var(--mono); color: var(--dim); text-transform: uppercase; }
    .rm .stat b { color: var(--amber); }
    @media (max-width: 860px) { .rm { grid-template-columns: 1fr; } .rm aside { order: 2; border-right: 0; border-top: 1px solid #000; } #map { height: 60vh; } }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + ZONE.format(icon="i-route", h="Route map", p="Flight AM 2332 · every stop") + """
      <div class="rm">
        <aside>
          <div style="display:flex;gap:4px;flex-wrap:wrap"><button class="tbtn" id="tourBtn">▶ Fly the route</button><button class="tbtn" id="overviewBtn">All stops</button><button class="tbtn" id="meBtn" title="Uses your location once; never stored">Distance to me</button></div>
          <div class="stat"><b id="statPlaces">6</b> stops · LAX ⇄ SYR <b id="statMiles">—</b> mi</div>
          <ol class="chapters" id="chapters"></ol>
          <p class="stat" style="margin:auto 0 0">Two unlisted stops appear only on final approach over downtown LA.</p>
        </aside>
        <div id="map" role="region" aria-label="Interactive map"></div>
      </div>
    </div>
  </main>
""",
  before='<script src="/vendor/leaflet-1.9.4/leaflet.js"></script>',
  after='<script src="/js/map.js"></script>')

# ------------------------------------------------------------------ lost & found (vault)
page("departures/vault.html", title="Lost & Found", robots="noindex, nofollow", body_attr=' data-egg="vault"',
  style="""
    .lf .row { display: grid; grid-template-columns: auto auto 1fr auto; gap: 14px; align-items: center; padding: 10px 0 8px; border-bottom: 1px solid #000; box-shadow: 0 1px 0 rgba(255,255,255,.03); }
    .lf .cell { --cw: 17px; --ch: 26px; }
    .lf .no .cell { color: var(--dim); }
    .lf .hint { font: 600 13px/1.35 var(--mono); color: var(--dim); text-transform: uppercase; }
    .lf .claimed .cell { color: var(--green); }
    .lf .open .cell { color: var(--amber); }
    .lf .flaps { --gap: 2px; }
    .lf-sum { display: flex; flex-wrap: wrap; gap: 10px 22px; margin: 0 0 16px; font: 600 14px var(--mono); color: var(--dim); text-transform: uppercase; }
    .lf-sum b { color: var(--sign); }
    .lf .icon { font-size: 20px; width: 28px; text-align: center; }
    @media (max-width: 760px) { .lf .row { grid-template-columns: auto 1fr auto; } .lf .no { display: none; } .lf .cell { --cw: 11px; --ch: 18px; } .lf .hint { grid-column: 1 / -1; } }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + ZONE.format(icon="i-bag", h="Lost &amp; Found", p="Thirteen items left on this site") + """
      <p style="max-width:62ch;color:#c9c5bb;margin:0 0 22px">Thirteen things are hidden around this site. Each one you find is claimed here. Unclaimed items show a hint. Your claims are kept in this browser only.</p>
      <div class="board lf">
        <div class="lf-sum"><span>Claimed <b id="nClaimed">0</b> / 13</span><span id="rankLine">Status: new arrival</span></div>
        <div id="lfRows"></div>
      </div>
      <p style="margin-top:18px"><button class="tbtn" id="resetBtn">Clear all claims</button></p>
    </div>
  </main>
""",
  after="""<script>
  (() => {
    const host = document.getElementById('lfRows'), narrow = matchMedia('(max-width: 760px)').matches;
    const RANKS = [[0, 'new arrival'], [3, 'frequent flyer'], [6, 'silver status'], [9, 'gold status'], [12, 'platinum'], [13, 'lifetime first class']];
    let rows = [];
    function build() {
      host.innerHTML = '';
      rows = AM.EGGS.map((e, i) => {
        const r = document.createElement('div'); r.className = 'row';
        r.innerHTML = `<span class="no"></span><span class="icon"></span><span class="name"></span><span class="st"></span><span class="hint" style="grid-column:2 / -1"></span>`;
        host.appendChild(r);
        return { e, r, no: Flap.row(r.querySelector('.no'), 2), name: Flap.row(r.querySelector('.name'), narrow ? 16 : 22), st: Flap.row(r.querySelector('.st'), 9) };
      });
    }
    function render() {
      const f = AM.foundEggs(); let n = 0;
      rows.forEach(({ e, r, no, name, st }, i) => {
        const got = f.has(e.id); if (got) n++;
        r.querySelector('.st').className = 'st ' + (got ? 'claimed' : 'open');
        r.querySelector('.icon').textContent = got ? e.icon : '';
        r.querySelector('.hint').textContent = got ? '' : e.hint;
        no.set(String(i + 1).padStart(2, '0'));
        name.set(got ? e.name : '? ? ? ? ?', { stagger: 14 });
        st.set(got ? 'CLAIMED' : 'UNCLAIMED', { stagger: 14 });
      });
      document.getElementById('nClaimed').textContent = n;
      document.getElementById('rankLine').textContent = 'Status: ' + RANKS.filter(([m]) => n >= m).pop()[1];
    }
    build(); render();
    addEventListener('am:egg', render);
    document.getElementById('resetBtn').addEventListener('click', () => { if (!confirm('Clear every claim?')) return; AM.resetEggs(); render(); });
  })();
  </script>""")

# ------------------------------------------------------------------ flight cancelled (404 stand-in)
page("departures/cancelled.html", title="Flight cancelled", body_attr=' data-egg="lost"',
  style="""
    .cx .cell { --cw: clamp(16px, 4.2vw, 46px); --ch: clamp(26px, 6.4vw, 70px); }
    .cx .flaps { --gap: clamp(2px, .4vw, 4px); }
    .cx .red .cell { color: #ff5a45; }
    .cx .line { margin: 0 0 10px; }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      <div class="board cx">
        <div class="board-head"><span class="title"><svg aria-hidden="true"><use href="#i-dep"/></svg>Departures · Error 404</span><span>Gate —</span></div>
        <div class="line" id="cx1"></div>
        <div class="line red" id="cx2"></div>
        <div class="board-foot"><span id="cxPath"></span><span>We apologize for the inconvenience</span></div>
      </div>
      <p style="max-width:60ch;color:#c9c5bb;margin:24px 0 18px">The flight you were trying to board isn't on the schedule. Here are your rebooking options:</p>
      <ul class="signs"><li><a href="/departures/"><svg aria-hidden="true"><use href="#i-dep"/></svg>Back to Departures</a></li><li><a href="/departures/map.html"><svg aria-hidden="true"><use href="#i-route"/></svg>Route map</a></li><li><a class="alt" href="/404.html"><svg aria-hidden="true"><use href="#i-gate"/></svg>Shoot hoops while you wait</a></li></ul>
    </div>
  </main>
""",
  after="""<script>
  (() => {
    document.getElementById('cxPath').textContent = 'Requested: ' + location.pathname;
    const a = Flap.row(document.getElementById('cx1'), 14), b = Flap.row(document.getElementById('cx2'), 14);
    a.set('FLIGHT AM 404', { stagger: 40 }).then(() => b.set('CANCELLED', { stagger: 40 }));
  })();
  </script>""")

# ------------------------------------------------------------------ unclaimed baggage (forgotten page)
page("departures/luggage.html", title="Unclaimed baggage", body_attr=' data-egg="forgotten"',
  style="""
    .claim { display: grid; grid-template-columns: 1fr minmax(0, 420px); gap: clamp(26px, 5vw, 60px); align-items: center; }
    .claim p { color: #c9c5bb; max-width: 52ch; }
    .tag { position: relative; background: #f4efe0; color: #111; padding: 64px 26px 26px; clip-path: polygon(14% 0, 86% 0, 100% 9%, 100% 100%, 0 100%, 0 9%); transform: rotate(-4deg); box-shadow: 0 30px 40px rgba(0,0,0,.5); }
    .tag::before { content: ""; position: absolute; top: 18px; left: 50%; width: 22px; height: 22px; margin-left: -11px; border-radius: 50%; background: var(--night); box-shadow: inset 0 0 0 4px #c9c3b0; }
    .tag .band { background: var(--sign); color: #111; font: 900 15px var(--sans); letter-spacing: .14em; text-transform: uppercase; padding: 8px 12px 6px; margin: 0 -26px 18px; display: flex; justify-content: space-between; }
    .tag .orig { background: #fff; border: 1px solid #bbb; padding: 14px 16px; font-family: "Times New Roman", serif; }
    .tag .orig h3 { font-size: 20px; margin: 0 0 8px; font-weight: bold; }
    .tag .orig h4 { font-size: 26px; margin: 0; font-weight: bold; line-height: 1.15; }
    .tag dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 16px 0 0; font: 600 13px var(--mono); text-transform: uppercase; }
    .tag dt { color: #6a665c; }
    .tag dd { margin: 0; }
    .tag .bars { height: 46px; margin-top: 16px; background: repeating-linear-gradient(90deg, #111 0 2px, transparent 2px 4px, #111 4px 5px, transparent 5px 8px, #111 8px 11px, transparent 11px 12px); }
    @media (max-width: 860px) { .claim { grid-template-columns: 1fr; } }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + ZONE.format(icon="i-bag", h="Unclaimed baggage", p="Carousel 0 · since Sep 6, 2025") + """
      <div class="claim">
        <div>
          <p>This bag has been going around the carousel since the very first night this site existed. Inside: the first draft of an About page, two lines long, never finished.</p>
          <p>It's been tagged and kept exactly as it was found. The real About section is at <a href="/departures/#info" style="color:var(--sign)">Information</a>, and the original file still lives at <a href="/about.html" style="color:var(--sign)">/about.html</a>.</p>
          <ul class="signs" style="margin-top:20px"><li><a href="/departures/#info"><svg aria-hidden="true"><use href="#i-info"/></svg>Information desk</a></li></ul>
        </div>
        <div class="tag">
          <div class="band"><span>Unclaimed</span><span>AM 0</span></div>
          <div class="orig"><h3>This is my about page test</h3><h4>I completely forgot about this...</h4></div>
          <dl><dt>Item</dt><dd>about.html</dd><dt>Checked</dt><dd>Sep 6, 2025 · 1:35 AM</dd><dt>Origin</dt><dd>Commit 60f8306</dd><dt>Status</dt><dd>Preserved</dd></dl>
          <div class="bars" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  </main>
""")
