#!/usr/bin/env python3
"""Generate the Departures (/departures/) sub-pages from one shared header/footer.
Run from the repo root: python3 tools/departures_pages.py"""

ICONS = open("index.html").read().split('<svg width="0" height="0"', 1)[1].split("</svg>", 1)[0]
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
      <a class="mark logo" href="/" aria-label="Aaron Moradi, home"><span class="code">AM</span>Aaron Moradi</a>
      <nav class="topnav" id="topnav" aria-label="Main">
        <a href="/#departures">Departures</a>
        <a href="/#info">Information</a>
        <a href="/#gates">Gates</a>
        <a href="/departures/map.html"{map_cur}>Route map</a>
        <a href="/#pass">Boarding pass</a>
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
        <nav aria-label="Footer"><a href="/">Departures</a><a href="/departures/map.html">Route map</a><a href="/assets/AaronMoradiResume.pdf" target="_blank" rel="noopener">Resume</a></nav>
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
page("departures/map.html", title="Route map", robots="index, follow", map_cur=' aria-current="page"',
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
      """ + ZONE.format(icon="i-bag", h="Lost &amp; Found", p="Items left behind on this site") + """
      <p style="max-width:62ch;color:#c9c5bb;margin:0 0 22px">Things are hidden all around this site. Each one you find is claimed here. Unclaimed items show a hint. Your claims are kept in this browser only.</p>
      <div class="board lf">
        <div class="lf-sum"><span>Claimed <b id="nClaimed">0</b> / <span id="nTotal">13</span></span><span id="rankLine">Status: new arrival</span></div>
        <div id="lfRows"></div>
      </div>
      <p style="margin-top:18px"><button class="tbtn" id="resetBtn">Clear all claims</button></p>
    </div>
  </main>
""",
  after="""<script>
  (() => {
    const host = document.getElementById('lfRows'), narrow = matchMedia('(max-width: 760px)').matches;
    const T = AM.EGGS.length;
    document.getElementById('nTotal').textContent = T;
    const RANKS = [[0, 'new arrival'], [3, 'frequent flyer'], [6, 'silver status'], [9, 'gold status'], [T - 1, 'platinum'], [T, 'lifetime first class']];
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
      <ul class="signs"><li><a href="/"><svg aria-hidden="true"><use href="#i-dep"/></svg>Back to Departures</a></li><li><a href="/departures/map.html"><svg aria-hidden="true"><use href="#i-route"/></svg>Route map</a></li><li><a class="alt" href="/404.html"><svg aria-hidden="true"><use href="#i-gate"/></svg>Shoot hoops while you wait</a></li></ul>
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
          <p>It's been tagged and kept exactly as it was found. The real About section is at <a href="/#info" style="color:var(--sign)">Information</a>, and the original file still lives at <a href="/about.html" style="color:var(--sign)">/about.html</a>.</p>
          <ul class="signs" style="margin-top:20px"><li><a href="/#info"><svg aria-hidden="true"><use href="#i-info"/></svg>Information desk</a></li></ul>
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

# ------------------------------------------------------------------ games (hidden; see departures-skin.js)
GAME_NOTE = """<p class="game-note">{note} Scores stay in this browser. <a href="/lounge/">Back to the Lounge</a></p>"""
GAMES = [("flapdle", "Flapdle", "/departures/flapdle.html"), ("tower", "Tower", "/departures/tower.html"), ("carry-on", "Carry-on", "/departures/carry-on.html"),
         ("upgrade", "Upgrade", "/lounge/upgrade.html"), ("courtside", "Courtside", "/lounge/courtside.html"), ("turbulence", "Turbulence", "/lounge/turbulence.html")]
def lnav(cur):
    links = "".join(f'<a href="{u}"{' aria-current="page"' if k == cur else ''}>{n}</a>' for k, n, u in GAMES)
    return f'<nav class="lg-nav" aria-label="The Lounge"><a class="home" href="/lounge/">← The Lounge</a>{links}</nav>\n      '
GAME_HEAD = '<link rel="stylesheet" href="/departures/games/games.css" />\n  ' 

page("departures/flapdle.html", title="Flapdle", extra_head=GAME_HEAD,
  style="""
    .fd { display: grid; grid-template-columns: minmax(0, 1fr) 290px; gap: clamp(18px, 3vw, 34px); align-items: start; }
    .fd-board .board-head { margin-bottom: 14px; }
    .fd-grid { display: grid; gap: 8px; justify-content: center; margin: 4px 0 18px; }
    .fd-row { --gap: 6px; border-radius: 4px; }
    .fd-row .cell { --cw: clamp(42px, 9.5vw, 64px); --ch: clamp(50px, 12vw, 84px); transition: box-shadow .2s; }
    .fd-row.active .cell { box-shadow: 0 0 0 1px rgba(255, 255, 255, .16), 0 2px 3px rgba(0, 0, 0, .6); }
    .fd .cell.hit .h, .fd .cell.hit .leaf { background: #1f7d50; }
    .fd .cell.near .h, .fd .cell.near .leaf { background: #a5770f; }
    .fd .cell.miss .h, .fd .cell.miss .leaf { background: #111215; }
    .fd .cell.miss { color: #5f646d; }
    .fd-status { display: flex; justify-content: center; min-height: 30px; }
    .fd-status .cell { --cw: clamp(11px, 2.4vw, 17px); --ch: clamp(18px, 3.8vw, 26px); color: var(--amber); }
    .fd-status .flaps { --gap: 2px; }
    .fd-keys { margin-top: 16px; display: grid; gap: 7px; user-select: none; }
    .fd-krow { display: flex; justify-content: center; gap: 6px; }
    .fd-krow button { flex: 1; max-width: 46px; height: 54px; border: 0; border-radius: 5px; background: #2b2e34; color: #fff; font: 700 16px/1 var(--sans); cursor: pointer; padding: 0; touch-action: manipulation; }
    .fd-krow button.wide { max-width: 72px; flex: 1.6; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; }
    .fd-krow button:hover { filter: brightness(1.2); }
    .fd-krow button.hit { background: #1f7d50; } .fd-krow button.near { background: #a5770f; } .fd-krow button.miss { background: #141518; color: #5f646d; }
    .fd-side { display: grid; gap: 14px; }
    .fd-nums { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; }
    .fd-nums b { display: block; font: 800 26px/1 var(--sans); }
    .fd-nums span { font: 600 10px/1.3 var(--mono); color: var(--dim); text-transform: uppercase; letter-spacing: .06em; }
    .fd-bar { display: grid; grid-template-columns: 14px 1fr; gap: 8px; align-items: center; font: 600 12px var(--mono); margin: 4px 0; }
    .fd-bar i { display: block; font-style: normal; text-align: right; padding: 3px 6px 2px; background: #2b2e34; min-width: 22px; }
    .fd-bar.me i { background: #1f7d50; }
    .fd-side h3 { margin: 0 0 8px; font: 700 12px var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }
    .fd-next { font: 600 22px var(--mono); }
    .fd-side .tbtn { width: 100%; height: 40px; }
    .fd-how { font-size: 14px; color: #b9bcc2; line-height: 1.5; }
    .fd-how i { display: inline-block; width: 12px; height: 12px; vertical-align: -1px; margin-right: 4px; }
    .game-note { margin-top: 22px; font-size: 14px; color: var(--dim); }
    .game-note a { color: var(--glyph); }
    @media (max-width: 860px) { .fd { grid-template-columns: 1fr; } }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + lnav("flapdle") + ZONE.format(icon="i-dep", h="Flapdle", p="One word a day · six tries") + """
      <div class="fd">
        <div>
          <div class="board fd-board">
            <div class="board-head"><span class="title"><svg aria-hidden="true"><use href="#i-dep"/></svg><span id="fdNo">No. 1</span></span><span>Five letters</span></div>
            <div class="fd-grid" id="fdGrid" role="group" aria-label="Guesses"></div>
            <div class="fd-status" id="fdStatus" aria-live="polite"></div>
          </div>
          <div class="fd-keys" id="fdKeys" aria-label="Keyboard"></div>
        </div>
        <aside class="fd-side">
          <div class="board">
            <h3>Your record</h3>
            <div class="fd-nums"><div><b id="fdPlayed">0</b><span>Played</span></div><div><b id="fdWin">0</b><span>Win %</span></div><div><b id="fdStreak">0</b><span>Streak</span></div><div><b id="fdBest">0</b><span>Best</span></div></div>
            <h3 style="margin-top:16px">Guesses</h3>
            <div id="fdDist"></div>
          </div>
          <div class="board">
            <h3>Next word in</h3>
            <div class="fd-next" id="fdNext">--:--:--</div>
            <div style="display:grid;gap:6px;margin-top:12px"><button class="tbtn" id="fdShare" hidden>Copy result</button><button class="tbtn" id="fdModeBtn">Practice round</button></div>
          </div>
          <p class="fd-how"><i style="background:#1f7d50"></i>right letter, right slot · <i style="background:#a5770f"></i>in the word, wrong slot · <i style="background:#2b2e34"></i>not in it. A new word every midnight, LA time.</p>
        </aside>
      </div>
      """ + GAME_NOTE.format(note="Type on your keyboard or tap the keys.") + """
    </div>
  </main>
""",
  after='<script src="/departures/games/flapdle-words.js"></script>\n  <script src="/departures/games/flapdle.js"></script>')

page("departures/tower.html", title="Tower", extra_head=GAME_HEAD,
  style="""
    .tw .board-head { flex-wrap: wrap; }
    .tw-hud { display: flex; gap: 18px; font: 600 13px var(--mono); color: var(--dim); letter-spacing: .08em; text-transform: uppercase; }
    .tw-hud b { display: inline-block; color: var(--glyph); font-size: 18px; margin-left: 6px; }
    .tw-wrap { position: relative; width: 100%; aspect-ratio: 1000 / 640; background: #0b0d10; border: 1px solid #000; }
    .tw-wrap canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: crosshair; }
    .tw-over { position: absolute; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(8, 9, 11, .8); text-align: center; }
    .tw-over[hidden] { display: none; }
    .tw-over h3 { margin: 0 0 10px; font: 900 clamp(28px, 5vw, 52px)/1 var(--sans); }
    .tw-over p { margin: 0 auto 18px; max-width: 46ch; color: #c9ccd2; font-size: 16px; }
    .tw-legend { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 14px; font: 600 13px var(--mono); color: var(--dim); text-transform: uppercase; letter-spacing: .05em; }
    .tw-legend i { display: inline-block; width: 12px; height: 12px; margin-right: 7px; vertical-align: -1px; border-radius: 2px; }
    .game-note { margin-top: 22px; font-size: 14px; color: var(--dim); }
    .game-note a { color: var(--glyph); }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + lnav("tower") + ZONE.format(icon="i-route", h="Tower", p="LAX approach control · your shift") + """
      <div class="board tw">
        <div class="board-head"><span class="title"><svg aria-hidden="true"><use href="#i-arr"/></svg>Arrivals · LAX</span><span class="tw-hud"><span>Landed<b id="twScore">0</b></span><span>Best<b id="twBest">0</b></span></span></div>
        <div class="tw-wrap">
          <canvas id="tw" role="img" aria-label="Radar screen with runways and incoming aircraft"></canvas>
          <div class="tw-over" id="twOverlay">
            <div>
              <h3 id="twTitle">Tower</h3>
              <p id="twMsg">Drag from an aircraft to draw its route. Bring each one to the end of its own runway. Keep them apart. Traffic builds the longer you last.</p>
              <button class="board-btn" id="twBtn" type="button">Start your shift</button>
            </div>
          </div>
        </div>
        <div class="tw-legend"><span><i style="background:#ff8a2a"></i>Jets → orange runway</span><span><i style="background:#45b4ff"></i>Props → blue runway</span><span><i style="background:#7ad957"></i>Helicopters → pad</span><span><i style="background:#ff4a3d"></i>Red ring: too close</span></div>
      </div>
      """ + GAME_NOTE.format(note="Works with a mouse or a finger. Either end of a runway is fine.") + """
    </div>
  </main>
""",
  after='<script src="/departures/games/tower.js"></script>')

page("departures/carry-on.html", title="Carry-on", extra_head=GAME_HEAD,
  style="""
    .co-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px; margin-bottom: 18px; }
    .co-top .lv { font: 800 22px/1 var(--sans); } .co-top .lv small { display: block; margin-top: 6px; font: 600 12px var(--mono); color: var(--dim); text-transform: uppercase; letter-spacing: .06em; }
    .co-top .ctl { display: flex; align-items: center; gap: 8px; }
    .co-clock { font: 600 20px var(--mono); min-width: 64px; text-align: right; margin-right: 6px; }
    .co-stage { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: clamp(20px, 4vw, 44px); align-items: start; }
    .co-bagwrap { position: relative; padding: 30px 0 22px; display: flex; justify-content: center; }
    .co-bagwrap::before { content: ""; position: absolute; top: 0; left: 50%; width: 120px; height: 34px; margin-left: -60px; border: 7px solid #2c3036; border-bottom: 0; border-radius: 16px 16px 0 0; }
    .co-bagwrap::after { content: ""; position: absolute; bottom: 0; left: 50%; width: 70%; margin-left: -35%; height: 14px; background: radial-gradient(circle 7px at 10% 50%, #2c3036 98%, transparent) , radial-gradient(circle 7px at 90% 50%, #2c3036 98%, transparent); }
    .co-case { position: relative; border-radius: 10px; background-color: #15171b;
      background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
      background-size: var(--c) var(--c); box-shadow: 0 0 0 7px #2c3036, 0 0 0 9px #000, 0 30px 60px rgba(0, 0, 0, .5); }
    .co-case.zipped { animation: zip .8s ease; }
    @keyframes zip { 30% { transform: scale(1.03); box-shadow: 0 0 0 7px var(--green), 0 0 0 9px #000, 0 30px 60px rgba(0,0,0,.5); } }
    .co-piece { position: absolute; touch-action: none; cursor: grab; user-select: none; }
    .co-piece.dragging { position: fixed; z-index: 9990; cursor: grabbing; filter: drop-shadow(0 16px 18px rgba(0, 0, 0, .55)); }
    .co-cell { position: absolute; box-sizing: border-box; background: var(--pc); display: grid; place-items: center; font-style: normal; line-height: 1; }
    .co-cell.bt { border-top: 3px solid rgba(255, 255, 255, .35); } .co-cell.bl { border-left: 3px solid rgba(255, 255, 255, .22); }
    .co-cell.bb { border-bottom: 3px solid rgba(0, 0, 0, .35); } .co-cell.br { border-right: 3px solid rgba(0, 0, 0, .28); }
    .co-cell span { filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .35)); }
    .co-ghost { position: absolute; z-index: 1; pointer-events: none; }
    .co-ghost.ok { background: rgba(122, 217, 87, .22); box-shadow: inset 0 0 0 2px rgba(122, 217, 87, .7); }
    .co-ghost.no { background: rgba(255, 74, 61, .2); box-shadow: inset 0 0 0 2px rgba(255, 74, 61, .6); }
    .co-traywrap h3 { margin: 0 0 10px; font: 700 12px var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }
    .co-tray { display: flex; flex-wrap: wrap; gap: 16px; align-content: flex-start; align-items: flex-start; min-height: 140px; padding: 16px; background: #101114; border: 1px dashed #2c3036; }
    .co-slot { position: relative; }
    .co-left { font: 600 12px var(--mono); color: var(--dim); text-transform: uppercase; margin-top: 10px; }
    .co-levels { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 26px; }
    .co-levels button { width: 40px; height: 40px; border: 1px solid #2c3036; background: transparent; color: var(--glyph); font: 700 14px var(--mono); cursor: pointer; }
    .co-levels button[aria-current] { background: var(--sign); color: var(--sign-ink); border-color: var(--sign); }
    .co-levels button:disabled { opacity: .35; cursor: default; }
    .co-win { position: fixed; z-index: 9970; left: 50%; bottom: 22px; transform: translateX(-50%); width: min(520px, calc(100% - 24px)); display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding: 16px 18px; background: var(--sign); color: var(--sign-ink); box-shadow: 0 20px 50px rgba(0,0,0,.5); }
    .co-win[hidden] { display: none; }
    .co-win b { font: 900 22px/1 var(--sans); } .co-win span { flex: 1; font: 600 13px var(--mono); }
    .co-win button { border: 0; padding: 11px 16px 9px; font: 800 14px var(--sans); cursor: pointer; background: var(--sign-ink); color: var(--sign); }
    .game-note { margin-top: 22px; font-size: 14px; color: var(--dim); }
    .game-note a { color: var(--glyph); }
    @media (max-width: 860px) { .co-stage { grid-template-columns: 1fr; } }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + lnav("carry-on") + ZONE.format(icon="i-bag", h="Carry-on", p="Pack it all · zip it · board") + """
      <div class="co">
        <div class="co-top">
          <div class="lv"><span id="coLevel">Bag 1</span><small id="coSize"></small></div>
          <div class="ctl"><span class="co-clock" id="coClock">0:00</span><button class="tbtn" id="coHint" type="button">Hint</button><button class="tbtn" id="coReset" type="button">Unpack</button></div>
        </div>
        <div class="co-stage">
          <div class="co-bagwrap"><div class="co-case" id="coCase" aria-label="Suitcase"></div></div>
          <div class="co-traywrap"><h3>Still on the bed</h3><div class="co-tray" id="coTray"></div><div class="co-left" id="coLeft"></div></div>
        </div>
        <div class="co-levels" id="coLevels" aria-label="Levels"></div>
        <div class="co-win" id="coWin" hidden><b id="coWinTitle">Zipped.</b><span id="coWinMsg"></span><button id="coAgain" type="button">Again</button><button id="coNext" type="button">Next bag →</button></div>
      </div>
      """ + GAME_NOTE.format(note="Drag items into the bag. Tap one to turn it. Every bag has a perfect fit.") + """
    </div>
  </main>
""",
  after='<script src="/departures/games/carry-on.js"></script>')

# ------------------------------------------------------------------ the lounge (members only, so to speak)
import os
os.makedirs("lounge", exist_ok=True)

page("lounge/index.html", title="The Lounge", robots="noindex, nofollow", body_attr=' data-egg="lounge"', extra_head=GAME_HEAD,
  style="""
    .lounge { position: relative; background: radial-gradient(80% 50% at 50% 0%, rgba(217, 189, 133, .10), transparent 70%), var(--night); }
    .lg-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 360px); gap: clamp(20px, 4vw, 48px); align-items: end; margin-bottom: clamp(26px, 4vw, 40px); }
    .lg-sign { display: flex; align-items: stretch; }
    .lg-sign .lg-mark { display: grid; place-items: center; width: clamp(70px, 9vw, 104px); background: var(--amber); color: #15120b; font: 900 clamp(22px, 3vw, 34px)/1 var(--sans); letter-spacing: .04em; }
    .lg-sign div { background: #17150f; border: 1px solid #2c271c; border-left: 0; padding: clamp(12px, 1.8vw, 20px) clamp(18px, 2.6vw, 30px); }
    .lg-sign h1 { margin: 0; font: 900 clamp(34px, 6vw, 72px)/.95 var(--sans); letter-spacing: -.02em; color: #f6efe1; }
    .lg-sign p { margin: 6px 0 0; font: 700 clamp(12px, 1.2vw, 14px)/1.2 var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--amber); }
    .lg-welcome { margin: 0; color: #cfc8b8; font-size: 17px; max-width: 42ch; }
    .lg-board .board-head .title svg { fill: var(--amber); }
    .lg-labels, .lg-row { display: grid; grid-template-columns: var(--lgcols); column-gap: clamp(8px, 1.4vw, 18px); align-items: center; }
    .lg-labels { font: 700 11px var(--sans); letter-spacing: .16em; text-transform: uppercase; color: var(--dim); padding-bottom: 10px; border-bottom: 1px solid #000; }
    .lg-row { padding: 10px 0 8px; border-bottom: 1px solid rgba(0, 0, 0, .9); box-shadow: 0 1px 0 rgba(255, 255, 255, .03); text-decoration: none; color: inherit; transition: background .2s; }
    .lg-row:hover, .lg-row:focus-visible { background: rgba(217, 189, 133, .06); outline: none; }
    .lg-row .cell { --cw: var(--lw, 19px); --ch: var(--lh, 29px); }
    .lg-row .flaps { --gap: 2px; }
    .lg-row .go { font: 700 13px var(--mono); color: var(--amber); text-align: right; opacity: 0; transition: opacity .2s; }
    .lg-row:hover .go, .lg-row:focus-visible .go { opacity: 1; }
    .lg-row .lg-gate .cell { color: var(--amber); }
    .lg-row .new .cell { color: var(--green); }
    .lg-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; margin-top: clamp(28px, 4vw, 44px); }
    .lg-card { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 22px 22px 20px; background: #111214; border: 1px solid #1f2125; text-decoration: none; color: inherit; transition: border-color .2s, transform .2s; }
    .lg-card:hover { border-color: var(--amber); transform: translateY(-2px); }
    .lg-card .k { font: 700 12px var(--mono); color: var(--amber); letter-spacing: .1em; }
    .lg-card h3 { margin: 0; font: 900 26px/1 var(--sans); }
    .lg-card p { margin: 0; color: #b8bbc1; font-size: 15px; line-height: 1.45; }
    .lg-card .how { margin-top: auto; padding-top: 10px; font: 600 11px var(--mono); color: var(--dim); text-transform: uppercase; letter-spacing: .06em; }
    .lg-card .door { font: 600 11px var(--mono); color: #6f6a5d; text-transform: uppercase; letter-spacing: .06em; }
    .lg-foot { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 420px); gap: clamp(20px, 4vw, 40px); margin-top: clamp(28px, 4vw, 44px); align-items: start; }
    .lg-card-member { position: relative; padding: 22px 24px; background: linear-gradient(135deg, #2a2417, #15130e 60%); border: 1px solid #3a3222; color: #f3ead6; overflow: hidden; }
    .lg-card-member::after { content: "AM"; position: absolute; right: -10px; bottom: -34px; font: 900 140px/1 var(--sans); color: rgba(217, 189, 133, .07); }
    .lg-card-member small { display: block; font: 700 11px var(--mono); letter-spacing: .14em; text-transform: uppercase; color: var(--amber); }
    .lg-card-member b { display: block; font: 900 28px/1.1 var(--sans); margin: 6px 0 16px; }
    .lg-card-member dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; margin: 0; font: 600 13px var(--mono); text-transform: uppercase; }
    .lg-card-member dt { color: #a99f86; } .lg-card-member dd { margin: 0; }
    .lg-card-member a { color: var(--amber); }
    .lg-rules { color: #b8bbc1; font-size: 15px; }
    .lg-rules h3 { margin: 0 0 10px; font: 700 12px var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }
    .lg-rules li { margin: 0 0 6px; }
    @media (max-width: 960px) { .lg-cards { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 760px) { .lg-hero, .lg-foot { grid-template-columns: 1fr; } .lg-cards { grid-template-columns: 1fr; } .lg-row .go { display: none; }
      .lg-board { --lgcols: calc(3 * (var(--lw) + 2px)) calc(11 * (var(--lw) + 2px)) calc(9 * (var(--lw) + 2px)) !important; }
      .lg-row > :nth-child(3), .lg-labels > :nth-child(3), .lg-labels > :nth-child(5) { display: none; } }
  """,
  body="""
  <main class="lounge zone" style="padding-top:40px">
    <div class="wrap">
      <div class="lg-hero">
        <div class="lg-sign"><span class="lg-mark">AM</span><div><h1>The Lounge</h1><p>Members only · Level 2 · Past security</p></div></div>
        <p class="lg-welcome">You found it. Kick your shoes off, grab a seat by the window. Six games, all on the house, and nobody's calling your flight.</p>
      </div>

      <div class="board lg-board" style="--lgcols: calc(3 * (var(--lw) + 2px)) calc(11 * (var(--lw) + 2px)) calc(12 * (var(--lw) + 2px)) calc(9 * (var(--lw) + 2px)) 1fr">
        <div class="board-head"><span class="title"><svg aria-hidden="true"><use href="#i-dep"/></svg>Now playing · Lounge</span><span class="clock">Local time <span id="lgClock"></span></span></div>
        <div class="lg-labels"><span>Gate</span><span>Game</span><span>Your best</span><span>Status</span><span></span></div>
        <div id="lgRows"></div>
      </div>

      <div class="lg-cards">
        <a class="lg-card" href="/departures/flapdle.html"><span class="k">L1 · Daily</span><h3>Flapdle</h3><p>One five-letter word a day, solved on split flaps. Six tries. Keep the streak alive.</p><span class="how">Type or tap · new word at midnight PT</span><span class="door">Side door: the clock on the big board</span></a>
        <a class="lg-card" href="/departures/tower.html"><span class="k">L2 · Arcade</span><h3>Tower</h3><p>Air traffic control at LAX. Draw the routes, land every aircraft on its own runway, never let two touch.</p><span class="how">Drag from a plane · mouse or finger</span><span class="door">Side door: the plane on the route</span></a>
        <a class="lg-card" href="/departures/carry-on.html"><span class="k">L3 · Puzzle</span><h3>Carry-on</h3><p>Twelve bags, each with exactly one way to fit. Pack it all, zip it, board.</p><span class="how">Drag to pack · tap to turn</span><span class="door">Side door: the barcode on your pass</span></a>
        <a class="lg-card" href="/lounge/upgrade.html"><span class="k">L4 · Puzzle</span><h3>Upgrade</h3><p>Slide the seats, merge matching fare classes. Economy, Business, First… then it gets ridiculous.</p><span class="how">Arrows or swipe · one undo</span></a>
        <a class="lg-card" href="/lounge/courtside.html"><span class="k">L5 · Arcade</span><h3>Courtside</h3><p>A 24-second shootaround. Every make buys two more seconds. Threes from deep, and the ball catches fire.</p><span class="how">Pull back and release</span></a>
        <a class="lg-card" href="/lounge/turbulence.html"><span class="k">L6 · Arcade</span><h3>Turbulence</h3><p>The red-eye home, straight through a storm. Hold to climb, let go to drop, grab the miles.</p><span class="how">Hold anywhere · or space</span></a>
      </div>

      <div class="lg-foot">
        <div class="lg-rules">
          <h3>House rules</h3>
          <ul>
            <li>Scores and streaks stay in this browser. Nothing is uploaded, nothing to sign up for.</li>
            <li>The lounge isn't on any sign. Members get in through the boarding pass, or by asking the gate agent (press <b>`</b> and type <b>lounge</b>).</li>
            <li>Some games have side doors out on the main concourse, too.</li>
          </ul>
        </div>
        <div class="lg-card-member" id="lgMember">
          <small>AM Lounge · Member</small>
          <b id="lgRank">Guest</b>
          <dl><dt>Member since</dt><dd id="lgSince">today</dd><dt>Items claimed</dt><dd><a href="/departures/vault.html" id="lgEggs">0</a></dd><dt>Games played</dt><dd id="lgPlayed">0 of 6</dd></dl>
        </div>
      </div>
    </div>
  </main>
""",
  after="""<script>
  (() => {
    const S = AM.store, num = (k) => +S.get(k, 0) || 0, json = (k) => { try { return JSON.parse(S.get(k)) || null; } catch { return null; } };
    const [y, m, d] = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }).split('-').map(Number);
    const today = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2026, 9, 23)) / 864e5);
    const fdD = json('fd_daily'), fdS = json('fd_stats'), co = json('co_done') || {};
    const TIER = { 2: 'STANDBY', 4: 'ECONOMY', 8: 'PREMIUM', 16: 'BUSINESS', 32: 'FIRST', 64: 'RESIDENCE', 128: 'PRIVATE', 256: 'CONCORDE', 512: 'LOW ORBIT', 1024: 'ISS', 2048: 'THE MOON', 4096: 'MARS' };
    const rows = [
      { g: 'L1', n: 'FLAPDLE', u: '/departures/flapdle.html', best: fdS && fdS.best ? `STREAK ${fdS.best}` : '', st: fdD && fdD.day === today && fdD.done ? (fdD.won ? 'SOLVED' : 'MISSED') : 'NEW WORD', played: !!fdS },
      { g: 'L2', n: 'TOWER', u: '/departures/tower.html', best: num('tw_best') ? `${num('tw_best')} LANDED` : '', played: !!num('tw_best') },
      { g: 'L3', n: 'CARRY-ON', u: '/departures/carry-on.html', best: Object.keys(co).length ? `BAG ${Object.keys(co).length}/12` : '', played: Object.keys(co).length > 0 },
      { g: 'L4', n: 'UPGRADE', u: '/lounge/upgrade.html', best: num('up_tile') ? TIER[num('up_tile')] || 'BEYOND' : '', played: !!num('up_best') },
      { g: 'L5', n: 'COURTSIDE', u: '/lounge/courtside.html', best: num('ct_best') ? `${num('ct_best')} PTS` : '', played: !!num('ct_best') },
      { g: 'L6', n: 'TURBULENCE', u: '/lounge/turbulence.html', best: num('tb_best') ? `${num('tb_best')} MI` : '', played: !!num('tb_best') },
    ];
    const narrow = matchMedia('(max-width: 760px)').matches;
    const board = document.querySelector('.lg-board');
    board.style.setProperty('--lw', narrow ? '11px' : '19px'); board.style.setProperty('--lh', narrow ? '18px' : '29px');
    const host = document.getElementById('lgRows');
    rows.forEach((r, i) => {
      if (!r.st) r.st = r.played ? 'OPEN' : 'NEW';
      const a = document.createElement('a');
      a.className = 'lg-row'; a.href = r.u;
      a.setAttribute('aria-label', `${r.n}, gate ${r.g}${r.best ? ', best ' + r.best : ''}, ${r.st}`);
      a.innerHTML = '<span class="lg-gate"></span><span></span><span></span><span class="' + (r.st === 'NEW' || r.st === 'NEW WORD' || r.st === 'SOLVED' ? 'new' : '') + '"></span><span class="go">Play →</span>';
      host.appendChild(a);
      const [g, n, b, s] = [...a.children].slice(0, 4).map((el, k) => Flap.row(el, [3, 11, 12, 9][k]));
      setTimeout(() => { g.set(r.g); n.set(r.n, { stagger: 20 }); b.set(r.best || '—', { stagger: 20 }); s.set(r.st, { stagger: 20 }); }, 200 + i * 220);
    });
    const clock = Flap.row(document.getElementById('lgClock'), 5);
    const tick = () => clock.set(new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' }), { stagger: 30 });
    tick(); setInterval(tick, 10000);
    // membership card
    const f = AM.foundEggs(), dates = Object.values(AM.foundDates()).sort();
    const n = f.size, T = AM.EGGS.length;
    const RANKS = [[0, 'Guest'], [3, 'Frequent flyer'], [6, 'Silver member'], [9, 'Gold member'], [T - 1, 'Platinum member'], [T, 'Lifetime first class']];
    document.getElementById('lgRank').textContent = RANKS.filter(([k]) => n >= k).pop()[1];
    document.getElementById('lgEggs').textContent = `${n} of ${T}`;
    document.getElementById('lgSince').textContent = dates.length ? new Date(dates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'today';
    document.getElementById('lgPlayed').textContent = `${rows.filter((r) => r.played).length} of 6`;
  })();
  </script>""")

page("lounge/upgrade.html", title="Upgrade", extra_head=GAME_HEAD,
  style="""
    .up { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: clamp(18px, 3vw, 34px); align-items: start; }
    .up-stage { position: relative; width: min(100%, 520px); margin: 0 auto; }
    .up-board { position: relative; --g: clamp(6px, 1.4vw, 10px); --s: calc((100% - 5 * var(--g)) / 4); aspect-ratio: 1; padding: var(--g); background: #0b0c0e; border: 1px solid #000; box-shadow: inset 0 0 0 1px rgba(255,255,255,.04); touch-action: none; user-select: none; }
    .up-cells { position: absolute; inset: var(--g); display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--g); }
    .up-cell { background: #17191d; border-radius: 4px; }
    .up-tiles { position: absolute; inset: var(--g); container-type: size; }
    .up-tile { --cell: calc((100cqw - 3 * var(--g)) / 4); position: absolute; left: 0; top: 0; width: var(--cell); height: var(--cell); border-radius: 4px; display: grid; place-content: center; text-align: center; gap: 2px;
      transform: translate(calc(var(--x) * (var(--cell) + var(--g))), calc(var(--y) * (var(--cell) + var(--g)))); transition: transform .11s ease-in-out; background: #2b2e34; color: #f3f2ee; }
    .up-tile b { font: 900 calc(var(--cell) * .3)/1 var(--sans); letter-spacing: -.01em; }
    .up-tile span { font: 700 calc(var(--cell) * .1)/1.1 var(--sans); text-transform: uppercase; letter-spacing: .06em; opacity: .85; }
    .up-tile small { position: absolute; right: 7px; top: 6px; font: 600 calc(var(--cell) * .085)/1 var(--mono); opacity: .55; }
    .up-tile.new { animation: upIn .18s ease-out; } .up-tile.pop { animation: upPop .18s ease-out; }
    @keyframes upIn { from { scale: .3; opacity: 0; } } @keyframes upPop { 50% { scale: 1.12; } }
    .up-tile[data-v="2"] { background: #2b2e34; } .up-tile[data-v="4"] { background: #3a3e46; }
    .up-tile[data-v="8"] { background: #4a5a73; } .up-tile[data-v="16"] { background: #2f6db5; }
    .up-tile[data-v="32"] { background: #8a6a2e; } .up-tile[data-v="64"] { background: #b8892f; color: #15120b; }
    .up-tile[data-v="128"] { background: #d9bd85; color: #15120b; } .up-tile[data-v="256"] { background: #e16710; }
    .up-tile[data-v="512"] { background: #6950a1; } .up-tile[data-v="1024"] { background: #1f7d50; }
    .up-tile[data-v="2048"] { background: #f3f2ee; color: #0b0c0e; box-shadow: 0 0 30px rgba(243,242,238,.45); }
    .up-tile[data-v="4096"], .up-tile[data-v="8192"] { background: #ff3b30; }
    .up-side { display: grid; gap: 14px; }
    .up-side h3 { margin: 0 0 8px; font: 700 12px var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }
    .up-nums { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .up-nums b { display: block; font: 800 26px/1.1 var(--sans); }
    .up-nums span { font: 600 10px var(--mono); color: var(--dim); text-transform: uppercase; letter-spacing: .06em; }
    .up-side .tbtn { width: 100%; height: 40px; }
    .up-legend { display: grid; gap: 4px; font: 600 12px var(--mono); text-transform: uppercase; color: #b9bcc2; }
    .up-legend b { display: inline-block; min-width: 46px; color: var(--amber); }
    @media (max-width: 860px) { .up { grid-template-columns: 1fr; } }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + lnav("upgrade") + ZONE.format(icon="i-dep", h="Upgrade", p="Merge the seats · fly higher") + """
      <div class="up">
        <div class="up-stage">
          <div class="up-board" id="upBoard" aria-label="Cabin: use arrow keys or swipe">
            <div class="up-cells" id="upCells"></div>
            <div class="up-tiles" id="upTiles"></div>
          </div>
          <div class="game-over" id="upOver" hidden><div><h3 id="upOverTitle">Cabin full</h3><p id="upOverMsg"></p><button class="board-btn" id="upAgain" type="button">New flight</button></div></div>
        </div>
        <aside class="up-side">
          <div class="board">
            <div class="up-nums"><div><b id="upScore">0</b><span>Miles</span></div><div><b id="upBest">0</b><span>Best</span></div></div>
            <h3 style="margin-top:14px">Highest class</h3><div style="font:800 20px var(--sans)" id="upTop">Standby</div>
            <div style="display:grid;gap:6px;margin-top:14px"><button class="tbtn" id="upUndo" type="button">Undo · 1</button><button class="tbtn" id="upNew" type="button">New flight</button></div>
          </div>
          <div class="board"><h3>The ladder</h3><div class="up-legend" id="upLegend"></div></div>
        </aside>
      </div>
      """ + GAME_NOTE.format(note="Arrow keys, WASD or swipe. Two matching seats merge into the next class up.") + """
    </div>
  </main>
""",
  after='<script src="/departures/games/upgrade.js"></script>')

ARENA = """
      <div class="board">
        <div class="board-head"><span class="title"><svg aria-hidden="true"><use href="#{icon}"/></svg>{head}</span><span class="game-hud">{hud}</span></div>
        <div class="arena" style="aspect-ratio:{ratio}">
          <canvas id="{cid}" role="img" aria-label="{label}"></canvas>
          <div class="game-over" id="{p}Over"><div><h3 id="{p}Title">{title}</h3><p id="{p}Msg">{msg}</p><button class="board-btn" id="{p}Btn" type="button">{btn}</button></div></div>
        </div>
        <p class="rotate-tip">Plays bigger with your phone sideways.</p>
      </div>"""
ARENA_CSS = """
    .arena { position: relative; width: 100%; background: #0b0c0e; border: 1px solid #000; }
    .arena canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: crosshair; user-select: none; -webkit-user-select: none; }
    .board-head { flex-wrap: wrap; }
"""

page("lounge/courtside.html", title="Courtside", extra_head=GAME_HEAD,
  style=ARENA_CSS + """
    #ctClock.low { color: #ff4a3d; }
    #ctHeat { color: #fdb927; min-width: 0; }
  """,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + lnav("courtside") + ZONE.format(icon="i-ball", h="Courtside", p="24 seconds on the clock") + ARENA.format(
        icon="i-ball", head="Downtown LA · shootaround", ratio="1000 / 600", cid="ct", p="ct", label="Basketball court with a hoop on the right",
        hud='<span>Clock<b id="ctClock">24.0</b></span><span>Points<b id="ctScore">0</b></span><span>Best<b id="ctBest">0</b></span><span id="ctHeat"></span>',
        title="Courtside", msg="Pull back anywhere and let go to shoot. Every make adds two seconds. Beyond the line is a three. Make five straight and the ball catches fire.", btn="Tip off") + """
      """ + GAME_NOTE.format(note="Like a slingshot: drag away from the hoop, release toward it.") + """
    </div>
  </main>
""",
  after='<script src="/departures/games/courtside.js"></script>')

page("lounge/turbulence.html", title="Turbulence", extra_head=GAME_HEAD,
  style=ARENA_CSS,
  body="""
  <main class="zone" style="padding-top:40px">
    <div class="wrap">
      """ + lnav("turbulence") + ZONE.format(icon="i-arr", h="Turbulence", p="The red-eye home · through the storm") + ARENA.format(
        icon="i-dep", head="AM 2332 · SYR → LAX", ratio="1000 / 560", cid="tb", p="tb", label="A plane flying through a storm corridor",
        hud='<span>Miles<b id="tbScore">0</b></span><span>Best<b id="tbBest">0</b></span>',
        title="Turbulence", msg="Hold to climb, let go to descend. Stay between the storm walls and grab the gold miles. It narrows the further you fly.", btn="Take off") + """
      """ + GAME_NOTE.format(note="Hold the mouse, a finger, or the space bar.") + """
    </div>
  </main>
""",
  after='<script src="/departures/games/turbulence.js"></script>')
