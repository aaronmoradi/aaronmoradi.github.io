#!/usr/bin/env python3
"""Generate the "Rev." (/rev/) pages from one shared header/footer.
Run from the repo root: python3 tools/rev_pages.py   (then python3 tools/build-log.py for fresh data)"""

HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <meta name="robots" content="{robots}" />
  <meta name="theme-color" content="#eaf0e1" />
  <script>document.documentElement.classList.add('js');try{{var t=localStorage.getItem('am_theme');if(t)document.documentElement.dataset.theme=t;else if(+new Date().toLocaleString('en-US',{{timeZone:'America/Los_Angeles',hour:'numeric',hourCycle:'h23'}})<4)document.documentElement.dataset.theme='dark';if(localStorage.getItem('am_showtime'))document.documentElement.classList.add('showtime')}}catch(e){{}}</script>
  {extra_head}<link rel="stylesheet" href="/rev/rev.css" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png?v=2" />
  <style>{style}</style>
</head>

<body{body_attr}>
  <header class="bar">
    <div class="wrap in">
      <a class="sig logo" href="/rev/" aria-label="Aaron Moradi, home">A. Moradi</a>
      <nav class="nav" id="nav" aria-label="Sheets">
        <a href="/rev/"{c_home}>Title sheet</a>
        <a href="/rev/log.html"{c_log}>Log</a>
        <a href="/rev/versions.html"{c_versions}>Versions</a>
        <a href="/rev/map.html"{c_map}>Field survey</a>
        <a href="/rev/#contact">Contact</a>
        <a href="/assets/AaronMoradiResume.pdf" target="_blank" rel="noopener">Resume</a>
      </nav>
      <div class="tools">
        <button class="tool" data-terminal title="Teletype (press `)">TTY</button>
        <button class="tool" data-theme-toggle aria-label="After hours (blueprint)">☾</button>
        <button class="tool menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="nav">☰</button>
      </div>
    </div>
  </header>
"""

FOOT = """
  <div class="wrap">
    <div class="titleblock">
      <div><span>Drawn by</span><strong>A. Moradi</strong></div>
      <div><span>Rev</span><strong data-rev>—</strong></div>
      <div><span>Sheet</span><strong>{sheet}</strong></div>
      <div><span>LA time</span><strong data-la-time>—</strong></div>
      <div><span>Title</span><strong>{block}</strong></div>
    </div>
    <div class="foot">
      <span>© <span data-year></span> Aaron Moradi · Los Angeles · log built <span data-built>—</span></span>
      <nav aria-label="Footer"><a href="/rev/log.html">Log</a><a href="/rev/versions.html">Versions</a><a href="https://github.com/aaronmoradi" target="_blank" rel="noopener">GitHub</a><a href="https://www.linkedin.com/in/aaronmoradi/" target="_blank" rel="noopener">LinkedIn</a></nav>
      <a class="egg-meter" href="/rev/vault.html" data-egg-meter hidden></a>
      <div class="team-btns"><button class="team-btn" data-team="lakers">Go Lakers!</button><button class="team-btn" data-team="dodgers">Go Dodgers!</button></div>
    </div>
  </div>
  {before}<script src="/rev/rev-skin.js"></script>
  <script src="/js/main.js"></script>
  <script src="/rev/rev.js"></script>{after}
</body>
</html>
"""

def page(path, *, title, desc="", sheet, block, body, style="", robots="noindex", body_attr="", extra_head="", before="", after="", cur=""):
    c = {k: (' aria-current="page"' if k == cur else '') for k in ("c_home", "c_log", "c_versions", "c_map")}
    html = HEAD.format(title=title, desc=desc, robots=robots, extra_head=extra_head, style=style, body_attr=body_attr, **c)
    html += body + FOOT.format(sheet=sheet, block=block, before=(before + "\n  " if before else ""), after=("\n  " + after if after else ""))
    open(path, "w").write(html)
    print("wrote", path)

# ------------------------------------------------------------------ title sheet
page("rev/index.html", cur="c_home", title="Rev. · Aaron Moradi's build log", desc="Aaron Moradi's site as a build log: every commit kept, timestamps and all.",
  sheet="1 of 6", block="Title sheet",
  body="""
  <main class="wrap">
    <section class="hero" id="about">
      <p class="rev">Rev. <span data-rev>206</span> · the build log of</p>
      <h1>Aaron Moradi</h1>
      <p class="edit-line"><s class="edit">I am a hard worker.</s><span class="ins">here are the receipts ↓</span></p>
      <p class="bio">Born and raised in Los Angeles. Syracuse University '25, B.S. Computer Science, <em>cum laude</em>. Assistant Chief of Staff at XYZ in Santa Monica since October 2025. This site is my notebook: every revision is kept, timestamps and all.</p>
      <div class="stats">
        <div><b data-mine>—</b><span>commits to this site by me</span></div>
        <div><b data-late>—</b><span>of them between midnight and 4am PT</span></div>
        <div><b data-best-count>—</b><span>commits in the longest sitting</span></div>
        <div><b data-sessions>—</b><span>separate sittings since Sep 2025</span></div>
      </div>
    </section>

    <section class="sheet">
      <div class="sheet-head"><h2>When this site gets built</h2><span class="no">Fig. 1 · commits by hour, Pacific</span></div>
      <div class="two">
        <div class="reveal">
          <p class="lead">Each bar is an hour of the day. The red ones are midnight to 4am, which is when <span class="hl">almost half</span> of this site was written.</p>
          <p>First commit: <span class="mono" data-first-when>—</span>, <span class="mono" data-first-msg>—</span>.</p>
          <p>Longest sitting: <b data-best-count>—</b> commits, <span class="mono" data-best-when>—</span>. The messages tell the story: "4", "7", "11"… "idk anymore", "wtf", "go back!", "lets hope", "reload?!".</p>
          <p class="pencil">↳ <span data-private>—</span> commits to a private page are left out of every count here.</p>
          <a class="btn" href="/rev/log.html">Read the full log →</a>
        </div>
        <svg class="ring reveal" id="ring" viewBox="0 0 440 440" role="img" aria-label="Ring chart of commits by hour of day"></svg>
      </div>
    </section>

    <section class="sheet" id="timesheet">
      <div class="sheet-head"><h2>Timesheet</h2><span class="no">Sheet 1 · every shift on record</span></div>
      <table class="timesheet reveal">
        <thead><tr><th>Period</th><th>Employer</th><th>Role</th><th>City</th></tr></thead>
        <tbody>
          <tr><td>Oct 2025 – <span class="punch">IN · mo. <span data-since="2025-10">—</span></span></td><td>XYZ</td><td>Assistant Chief of Staff</td><td>Santa Monica, CA</td></tr>
          <tr><td>May 2025</td><td>Syracuse University</td><td>B.S. Computer Science, <em>cum laude</em>; minor in Engineering &amp; CS Management</td><td>Syracuse, NY</td></tr>
          <tr><td>Jun – Aug 2024</td><td>PlanetArt</td><td>Data Science Analyst Intern</td><td>Calabasas, CA</td></tr>
          <tr><td>Aug 2022 – May 2025</td><td>Barnes Center at The Arch</td><td>Guest Services</td><td>Syracuse, NY</td></tr>
          <tr><td>May – Jun 2022</td><td>Diddy Riese Cookies</td><td>Food Server</td><td>Los Angeles, CA</td></tr>
          <tr><td>Jul – Aug 2019</td><td>Tea &amp; Coffee Exchange</td><td>Barista</td><td>Hollywood, CA</td></tr>
        </tbody>
      </table>
      <p class="pencil" style="margin-top:12px">Certifications: Inside LVMH · ServSafe Food Handler · Adult First Aid/CPR/AED (Red Cross) · Employee Transportation Coordinator (GoSaMo TMO)</p>
    </section>

    <section class="sheet" id="cases">
      <div class="sheet-head"><h2>Case files</h2><span class="no">Sheet 1 · projects, dead ends included</span></div>
      <article class="case reveal">
        <header><h3>aaronmoradi.com</h3><span>HTML · CSS · JavaScript · <a href="https://github.com/aaronmoradi/aaronmoradi.github.io" target="_blank" rel="noopener">source</a></span></header>
        <div class="body">
          <b>Goal</b><div>A personal site from a blank file, kept up to date.</div>
          <b>Attempts</b><div><ol>
            <li>Sep 6, 2025, 12:46am: <span class="mono">Initial Site</span>. A typing header, an LA clock, Lakers &amp; Dodgers confetti buttons.</li>
            <li><s>A project card for the MLG website</s>: <span class="mono">"no more MLG website card, looks too similar lol"</span>.</li>
            <li>Oct 2026: v2, rebuilt with a life map, a terminal and 13 easter eggs. <span class="pencil">Retired: it read as AI-made.</span></li>
            <li>The map's tile service started demanding an API key. Switched to OpenStreetMap.</li>
            <li>The favicon had a fake checkerboard baked into its pixels. Cut the smiley out properly.</li>
            <li>v3: four design studies in parallel. This notebook is one of them.</li>
          </ol></div>
          <b>Result</b><div><a href="https://aaronmoradi.com" target="_blank" rel="noopener">aaronmoradi.com</a>. <span data-mine>—</span> commits by me so far.</div>
        </div>
      </article>
      <article class="case reveal">
        <header><h3>X vs. Bluesky</h3><span>Python · Data · <a href="https://github.com/TownsendSP/Comparative_Sentiment_Analysis" target="_blank" rel="noopener">source</a></span></header>
        <div class="body">
          <b>Goal</b><div>Compare how the conversation feels on X (Twitter) and on Bluesky.</div>
          <b>Result</b><div>A comparative sentiment analysis. <a href="/assets/DataMiningPresentation.pdf" target="_blank" rel="noopener">Presentation (PDF)</a>.</div>
        </div>
      </article>
      <article class="case reveal">
        <header><h3>Compress &amp; encrypt</h3><span>Python · team project · <a href="https://github.com/aaronmoradi/M013-Group12" target="_blank" rel="noopener">source</a></span></header>
        <div class="body">
          <b>Goal</b><div>Take in a text file, compress it into binary digits, and get the original back.</div>
          <b>Result</b><div>Compression plus decryption back to the original state, built as a team.</div>
        </div>
      </article>
    </section>

    <section class="sheet">
      <div class="sheet-head"><h2>Versions</h2><span class="no">Sheet 3 · the archive</span></div>
      <div class="two">
        <p class="lead reveal">Nothing gets deleted. v0 was two lines. v1 was written over <span class="mono" data-count-between="2025-09-06..2026-10-09T08:36">—</span> commits. v2 is what's live right now. The archive keeps them all side by side.</p>
        <a class="reveal" href="/rev/versions.html" style="display:block;border:2px solid var(--rule)"><img src="/rev/img/v1.jpg" alt="Screenshot of version 1 of aaronmoradi.com" loading="lazy" /></a>
      </div>
    </section>

    <section class="sheet" id="contact" style="border-bottom:0">
      <div class="sheet-head"><h2>Leave a note</h2><span class="no">aaronmoradi2@gmail.com</span></div>
      <form class="note-form reveal" action="https://formspree.io/f/xdklynry" method="POST">
        <div><label for="name">Name</label><input id="name" name="name" autocomplete="name" required /></div>
        <div><label for="email">Email</label><input id="email" type="email" name="_replyto" autocomplete="email" required /></div>
        <div class="full"><label for="message">Note</label><textarea id="message" name="message" required></textarea></div>
        <div class="full"><button class="btn" type="submit">Commit message →</button> <a class="btn ghost" href="https://www.linkedin.com/in/aaronmoradi/" target="_blank" rel="noopener">LinkedIn</a> <a class="btn ghost" href="/assets/AaronMoradiResume.pdf" target="_blank" rel="noopener">Resume</a></div>
      </form>
    </section>
  </main>
""")

# ------------------------------------------------------------------ the log
page("rev/log.html", cur="c_log", title="Log · Rev. · Aaron Moradi", sheet="2 of 6", block="The log",
  style="""
    .months { display: flex; align-items: flex-end; gap: 3px; height: 120px; border-bottom: 2px solid var(--rule); margin: 6px 0 30px; }
    .months div { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; position: relative; }
    .months i { display: block; background: var(--ink); min-height: 1px; }
    .months span { position: absolute; top: 100%; left: 0; font: 11px var(--mono); color: var(--muted); padding-top: 4px; }
    .filters { display: flex; gap: 0; margin-bottom: 22px; }
    .filters button { border: 1.5px solid var(--rule); margin-left: -1.5px; background: transparent; color: var(--ink); padding: 8px 12px; font: 700 12px var(--mono); cursor: pointer; }
    .filters button[aria-pressed="true"] { background: var(--ink); color: var(--pad); }
    .sess { border: 2px solid var(--rule); background: var(--pad); margin-bottom: 18px; }
    .sess header { display: flex; flex-wrap: wrap; gap: 6px 16px; align-items: baseline; padding: 9px 14px; border-bottom: 1.5px solid var(--rule); }
    .sess header b { font: 20px var(--serif); font-weight: 400; }
    .sess header span { font: 12.5px var(--mono); color: var(--muted); }
    .sess.best { box-shadow: 6px 6px 0 var(--red); }
    .sess ol { list-style: none; margin: 0; padding: 4px 0; }
    .sess li { display: grid; grid-template-columns: 82px 74px 1fr; gap: 10px; padding: 4px 14px; font: 14px/1.5 var(--mono); }
    .sess li:hover { background: var(--pad-2); }
    .sess li time { color: var(--muted); }
    .sess li.late time { color: var(--red); font-weight: 700; }
    .sess li a { color: var(--muted); }
    .sess li .x { color: var(--red); }
    .sess li i { color: var(--muted); }
    @media (max-width: 560px) { .sess li { grid-template-columns: 64px 1fr; } .sess li a { display: none; } }
  """,
  body="""
  <main class="wrap">
    <section class="sheet" style="border-bottom:0">
      <div class="sheet-head"><h2>The log</h2><span class="no">Every public commit · newest sitting first</span></div>
      <p class="lead">Every commit to this site, grouped by sitting (commits less than two hours apart). Times are Pacific. Runs of the same message are collapsed. Red times are between midnight and 4am.</p>
      <p class="pencil"><span data-private>—</span> commits to a private page are left out. Built from git on <span data-built>—</span> by <span class="mono">tools/build-log.py</span>.</p>
      <div class="months" id="months" aria-label="Commits per month"></div>
      <div class="filters"><button data-filter="all" aria-pressed="true">All sittings</button><button data-filter="late" aria-pressed="false">Only 12–4am</button></div>
      <div id="ledger"><p class="mono">loading the ledger…</p></div>
    </section>
  </main>
""")

# ------------------------------------------------------------------ versions
page("rev/versions.html", cur="c_versions", title="Versions · Rev. · Aaron Moradi", sheet="3 of 6", block="The archive",
  style="""
    .compare { position: relative; border: 2px solid var(--rule); aspect-ratio: 16 / 10; overflow: hidden; background: #fff; --x: 50%; }
    .compare img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; }
    .compare .top { clip-path: inset(0 calc(100% - var(--x)) 0 0); }
    .compare .handle { position: absolute; top: 0; bottom: 0; left: var(--x); width: 2px; background: var(--red); transform: translateX(-1px); pointer-events: none; }
    .compare .lab { position: absolute; top: 10px; font: 700 12px var(--mono); background: var(--rule); color: var(--pad); padding: 4px 8px; }
    .compare .lab.l { left: 10px; } .compare .lab.r { right: 10px; }
    .slider { width: 100%; margin: 12px 0 30px; accent-color: var(--red); }
    .eras { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 18px; }
    .era { border: 2px solid var(--rule); background: var(--pad); padding: 14px 16px; }
    .era h3 { margin: 0 0 4px; font: 30px/1 var(--serif); font-weight: 400; }
    .era .when { font: 12.5px var(--mono); color: var(--muted); }
    .era p { margin: 10px 0 0; }
    .era ul { margin: 8px 0 0; padding-left: 18px; }
  """,
  body="""
  <main class="wrap">
    <section class="sheet" style="border-bottom:0">
      <div class="sheet-head"><h2>The archive</h2><span class="no">Nothing gets deleted</span></div>
      <div class="compare" id="compare">
        <img src="/rev/img/v2.jpg" alt="Screenshot of version 2" />
        <img class="top" src="/rev/img/v1.jpg" alt="Screenshot of version 1" />
        <span class="handle"></span><span class="lab l">v1</span><span class="lab r">v2</span>
      </div>
      <input class="slider" id="cmpRange" type="range" min="0" max="100" value="50" aria-label="Drag to compare version 1 and version 2" />
      <div class="eras">
        <article class="era"><h3>v0</h3><div class="when">Sep 6, 2025, 1:35am · 60f8306</div><p>A test About page with two lines on it. Forgotten almost immediately.</p><p><a href="/rev/exhibit0.html">Exhibit 0 →</a></p></article>
        <article class="era"><h3>v1</h3><div class="when">Sep 6, 2025 → Oct 9, 2026 · <span data-count-between="2025-09-06..2026-10-09T08:36">—</span> commits</div><p>Written commit by commit: typing header, live LA clock, Spotify buttons, Lakers &amp; Dodgers confetti, a private workout page.</p></article>
        <article class="era"><h3>v2</h3><div class="when">Oct 9, 2026 → now · live at <a href="/">aaronmoradi.com</a></div><p>A ground-up rebuild with a life map, a terminal and 13 easter eggs, made with Claude. It worked, and it looked like it was made with Claude.</p></article>
        <article class="era"><h3>v3?</h3><div class="when">Design studies, in progress</div><p>Four directions, each built out in full:</p><ul><li><a href="/program/">Official Program</a></li><li><a href="/shoebox/">The Shoebox</a></li><li><a href="/spec/">AM-001 Spec</a></li><li><a href="/rev/">Rev. (this one)</a></li></ul></article>
      </div>
    </section>
  </main>
""")

# ------------------------------------------------------------------ field survey (map)
page("rev/map.html", cur="c_map", title="Field survey · Rev. · Aaron Moradi", sheet="4 of 6", block="Field survey",
  extra_head='<link rel="stylesheet" href="/vendor/leaflet-1.9.4/leaflet.css" />\n  ',
  style="""
    .survey { display: grid; grid-template-columns: 320px 1fr; border: 2px solid var(--rule); background: var(--pad); }
    .survey aside { border-right: 2px solid var(--rule); padding: 14px; display: flex; flex-direction: column; gap: 12px; }
    #map { height: 600px; width: 100%; background: var(--pad-2); }
    #map .leaflet-tile-pane { filter: grayscale(1) sepia(.18) contrast(.9) brightness(1.05); }
    #map.dark-tiles .leaflet-tile-pane { filter: grayscale(1) invert(1) sepia(.4) hue-rotate(170deg) brightness(.8); }
    .pin { width: 28px; height: 28px; display: grid; place-items: center; background: var(--pad); border: 2px solid var(--rule); color: var(--ink); font: 700 12px var(--mono); }
    .pin.active { background: var(--red); color: #fff; border-color: var(--red); }
    .pin.secret { border-style: dashed; font-size: 13px; }
    .pin.me { border-color: var(--orange); }
    .leaflet-div-icon { background: transparent; border: 0; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { border-radius: 0; background: var(--pad); color: var(--ink); border: 2px solid var(--rule); box-shadow: 4px 4px 0 var(--rule); }
    .leaflet-popup-content { margin: 12px 14px; font: 15px/1.45 var(--sans); }
    .leaflet-popup-content h3 { margin: 0 0 4px; font: 24px/1 var(--serif); font-weight: 400; }
    .leaflet-popup-content p { margin: 0; }
    .pop-when { font: 12px var(--mono); color: var(--red); }
    .leaflet-bar { border: 2px solid var(--rule) !important; border-radius: 0 !important; } .leaflet-bar a { border-radius: 0 !important; background: var(--pad); color: var(--ink); }
    .leaflet-control-attribution { background: var(--pad) !important; font: 11px var(--mono); }
    .chapters { list-style: none; margin: 0; padding: 0; border-top: 2px solid var(--rule); }
    .chapter { width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid var(--grid-major); padding: 8px 2px; cursor: pointer; color: inherit; display: grid; grid-template-columns: 54px 1fr; gap: 0 8px; font: inherit; }
    .chapter .k { grid-row: span 2; font: 700 12px var(--mono); color: var(--red); }
    .chapter .t { font: 19px/1.1 var(--serif); }
    .chapter .w { font: 12px var(--mono); color: var(--muted); }
    .chapter.active, .chapter:hover { background: var(--ink); color: var(--pad); }
    .acts { display: flex; gap: 6px; flex-wrap: wrap; }
    .acts .btn { padding: 8px 10px; font-size: 12px; }
    @media (max-width: 860px) { .survey { grid-template-columns: 1fr; } .survey aside { border-right: 0; border-top: 2px solid var(--rule); order: 2; } #map { height: 60vh; } }
  """,
  body="""
  <main class="wrap">
    <section class="sheet" style="border-bottom:0">
      <div class="sheet-head"><h2>Field survey</h2><span class="no">Six field notes · LA ↔ Syracuse <span id="statMiles">—</span> mi</span></div>
      <div class="survey">
        <aside>
          <div class="acts"><button class="btn" id="tourBtn">▶ Walk the route</button><button class="btn ghost" id="overviewBtn">Full extent</button><button class="btn ghost" id="meBtn" title="Uses your location once; never stored">How far am I?</button></div>
          <p class="mono" style="margin:0;font-size:13px"><span id="statPlaces">6</span> stations surveyed, in the order they happened.</p>
          <ol class="chapters" id="chapters"></ol>
          <p class="pencil" style="margin:auto 0 0">two stations unsurveyed: downtown LA, at very high zoom.</p>
        </aside>
        <div id="map" role="region" aria-label="Interactive map"></div>
      </div>
    </section>
  </main>
""",
  before='<script src="/vendor/leaflet-1.9.4/leaflet.js"></script>',
  after='<script src="/js/map.js"></script>')

# ------------------------------------------------------------------ scrap bin (404 stand-in)
page("rev/scrap.html", title="Scrap bin · Rev. · Aaron Moradi", sheet="404", block="Scrap bin", body_attr=' data-egg="lost"',
  style="""
    .bin-wrap { position: relative; border: 2px solid var(--rule); background: var(--pad); }
    #bin { display: block; width: 100%; height: 440px; touch-action: none; cursor: grab; }
    .counter { display: flex; gap: 22px; font: 700 13px var(--mono); margin: 0 0 10px; }
    .counter b { color: var(--red); }
    @media (max-width: 600px) { #bin { height: 380px; } }
  """,
  body="""
  <main class="wrap">
    <section class="sheet" style="border-bottom:0">
      <div class="sheet-head"><h2>Scrap bin</h2><span class="no">404 · sheet never drawn</span></div>
      <p class="lead">This sheet was never drawn. What's here instead are the drafts: every paper ball is a real commit message from this site's history. Drag back and throw it in the bin. Five in a row and the tool crib will notice.</p>
      <div class="counter"><span>in the bin: <b id="score">0</b></span><span>streak: <b id="streak">0</b></span><span>this draft: <b id="msg">—</b></span></div>
      <div class="bin-wrap"><canvas id="bin" aria-label="Paper toss: drag back from the crumpled draft and release to throw it in the scrap bin"></canvas></div>
      <p style="margin-top:16px"><a class="btn" href="/rev/">Back to the title sheet →</a></p>
    </section>
  </main>
""",
  after="""<script>
  (() => {
    const cv = document.getElementById('bin'), ctx = cv.getContext('2d'), $ = (id) => document.getElementById(id);
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const R = 15, G = .38, BW = 96, BH = 104, FL = 16;
    let W, H, binX, ball, drag = null, fly = false, scored = false, t0 = 0, score = 0, streak = 0, shape = [], msgs = ['idk anymore', 'wtf', 'go back!', 'lets hope', 'reload?!', 'revert', 'Shot in the dark', 'yeaq', 'lll', 'ignore the bs'];
    window.REV_LOG().then(({ commits }) => { const m = commits.filter((c) => c.by === 'aaron' && !/^update /i.test(c.s) && c.s.length < 28).map((c) => c.s); if (m.length) msgs = m; next(); }).catch(() => {});
    const pick = () => msgs[(Math.random() * msgs.length) | 0];
    let cur = pick();
    function next() { cur = pick(); $('msg').textContent = '"' + cur + '"'; }
    function resize() { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); binX = W * .72; reset(); }
    function reset() { const x = Math.max(56, W * (.08 + Math.random() * .14)); ball = { x, y: H - FL - R, vx: 0, vy: 0, a: 0 }; fly = false; scored = false; shape = Array.from({ length: 11 }, (_, i) => [i / 11 * Math.PI * 2, R * (.82 + Math.random() * .3)]); }
    const top = () => H - FL - BH;
    function bounce(p) { const dx = ball.x - p.x, dy = ball.y - p.y, d = Math.hypot(dx, dy); if (d < R + 3 && d > 0) { const nx = dx / d, ny = dy / d, k = ball.vx * nx + ball.vy * ny; if (k < 0) { ball.vx -= 1.6 * k * nx; ball.vy -= 1.6 * k * ny; } ball.x = p.x + nx * (R + 3); ball.y = p.y + ny * (R + 3); } }
    function step() {
      const py = ball.y; ball.vy += G; ball.x += ball.vx; ball.y += ball.vy; ball.a += ball.vx * .06;
      bounce({ x: binX - BW / 2, y: top() }); bounce({ x: binX + BW / 2, y: top() });
      const inside = ball.x > binX - BW / 2 && ball.x < binX + BW / 2;
      if (!scored && py < top() && ball.y >= top() && inside) { scored = true; score++; streak++; $('score').textContent = score; $('streak').textContent = streak; if (streak === 5) { AM.findEgg('hoops'); AM.confetti('party', 140); } }
      if (scored) { ball.x = Math.min(Math.max(ball.x, binX - BW / 2 + R + 4), binX + BW / 2 - R - 4); if (ball.y > H - FL - R - 6) { ball.y = H - FL - R - 6; ball.vx = ball.vy = 0; } }
      else {
        if (ball.y > top() && Math.abs(ball.x - (binX - BW / 2)) < R && ball.x < binX) { ball.x = binX - BW / 2 - R; ball.vx *= -.5; }
        if (ball.y > top() && Math.abs(ball.x - (binX + BW / 2)) < R && ball.x > binX) { ball.x = binX + BW / 2 + R; ball.vx *= -.5; }
        if (ball.y + R > H - FL) { ball.y = H - FL - R; ball.vy *= -.35; ball.vx *= .7; }
        if (ball.x - R < 0) { ball.x = R; ball.vx *= -.5; }
      }
      const done = (scored && ball.vy === 0) || (!scored && Math.abs(ball.vy) < .8 && ball.y + R >= H - FL - 1 && Math.abs(ball.vx) < .3) || ball.x - R > W || performance.now() - t0 > 6000;
      if (done) { fly = false; setTimeout(() => { if (!scored) { streak = 0; $('streak').textContent = 0; } else binX = W * (.5 + Math.random() * .36); reset(); next(); }, scored ? 300 : 0); }
    }
    function vel() { const k = .13, mx = 21; let vx = (drag.sx - drag.x) * k, vy = (drag.sy - drag.y) * k; const m = Math.hypot(vx, vy); if (m > mx) { vx *= mx / m; vy *= mx / m; } return { vx, vy }; }
    function draw() {
      const ink = css('--ink'), red = css('--red'), muted = css('--muted');
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = ink; ctx.fillRect(0, H - FL, W, 2);
      const t = top(), l = binX - BW / 2, r = binX + BW / 2, inset = 10;
      ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let i = 0; i <= 8; i++) { ctx.moveTo(l + BW * i / 8, t); ctx.lineTo(l + inset + (BW - 2 * inset) * i / 8, H - FL); }
      for (let j = 1; j < 5; j++) { const y = t + BH * j / 5, k = inset * j / 5; ctx.moveTo(l + k, y); ctx.lineTo(r - k, y); }
      ctx.stroke(); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(l, t); ctx.lineTo(r, t); ctx.stroke();
      ctx.font = '700 12px "Courier Prime", monospace'; ctx.fillStyle = muted; ctx.fillText('SCRAP', binX - 20, t + BH / 2);
      if (drag) { const v = vel(); let x = ball.x, y = ball.y, vy = v.vy; ctx.setLineDash([3, 6]); ctx.strokeStyle = red; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); for (let i = 0; i < 30; i++) { vy += G; x += v.vx; y += vy; ctx.lineTo(x, y); } ctx.stroke(); ctx.setLineDash([]); }
      ctx.save(); ctx.translate(ball.x, ball.y); ctx.rotate(ball.a); ctx.beginPath(); shape.forEach(([a, rr], i) => { const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
      ctx.fillStyle = '#eaf0e1'; ctx.fill(); ctx.strokeStyle = '#2a2a28'; ctx.lineWidth = 1.3; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(2, 1); ctx.lineTo(-2, 9); ctx.moveTo(4, -9); ctx.lineTo(1, 1); ctx.lineTo(9, 5); ctx.strokeStyle = 'rgba(110,160,210,.8)'; ctx.stroke(); ctx.restore();
      if (!fly) { ctx.fillStyle = red; ctx.font = 'italic 14px "Courier Prime", monospace'; ctx.fillText('"' + cur + '"', ball.x - R, ball.y - R - 10); }
    }
    const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.addEventListener('pointerdown', (e) => { if (fly) return; const p = pt(e); drag = { sx: p.x, sy: p.y, x: p.x, y: p.y }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', (e) => { if (drag) { const p = pt(e); drag.x = p.x; drag.y = p.y; } });
    cv.addEventListener('pointerup', () => { if (!drag) return; const v = vel(); drag = null; if (Math.hypot(v.vx, v.vy) < 2) return; ball.vx = v.vx; ball.vy = v.vy; fly = true; t0 = performance.now(); });
    addEventListener('resize', resize); resize(); next();
    let lt = performance.now(), acc = 0;
    (function loop(now) { acc += Math.min(now - lt, 100); lt = now; while (acc >= 1000 / 60) { if (fly) step(); acc -= 1000 / 60; } draw(); requestAnimationFrame(loop); })(lt);
  })();
  </script>""")

# ------------------------------------------------------------------ tool crib (vault)
page("rev/vault.html", title="Tool crib · Rev. · Aaron Moradi", sheet="5 of 6", block="Tool crib checkout card", robots="noindex, nofollow", body_attr=' data-egg="vault"',
  style="""
    .card { border: 2px solid var(--rule); background: #f6f1dc; color: #2a2a28; max-width: 860px; }
    .card header { display: flex; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 2px solid #2a2a28; font: 700 13px var(--mono); text-transform: uppercase; }
    .card table { width: 100%; border-collapse: collapse; font: 14px/1.4 var(--mono); }
    .card th, .card td { padding: 9px 12px; border-bottom: 1px solid rgba(42, 42, 40, .25); text-align: left; vertical-align: top; }
    .card thead th { font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #2a2a28; }
    .card td.tool { width: 46%; }
    .card .stamp { display: inline-block; border: 2px solid #c42b1c; color: #c42b1c; padding: 1px 6px; transform: rotate(-4deg); font-weight: 700; font-size: 12px; white-space: nowrap; }
    .card tr.open td { color: rgba(42, 42, 40, .55); }
    .seal { display: none; margin: 22px 0 0; border: 3px double var(--red); color: var(--red); padding: 14px 18px; max-width: 520px; font: 15px var(--mono); }
    .seal.on { display: block; }
    .seal b { display: block; font: 26px var(--serif); font-weight: 400; }
  """,
  body="""
  <main class="wrap">
    <section class="sheet" style="border-bottom:0">
      <div class="sheet-head"><h2>Tool crib</h2><span class="no">Sheet 5 · checkout card</span></div>
      <p class="lead">Tools are hidden all over in this notebook. Each one you find gets checked out to you and stamped with the date. The card lives in this browser only.</p>
      <div class="card">
        <header><span>Checkout card · aaronmoradi.com</span><span id="tally">0 out</span></header>
        <table><thead><tr><th>#</th><th>Tool</th><th>Checked out</th></tr></thead><tbody id="rows"></tbody></table>
      </div>
      <div class="seal" id="seal"><b>Every one. Hall of Famer.</b>Signed off: A. Moradi. Tell me which one took longest. <a href="/rev/#contact">Leave a note →</a></div>
      <p style="margin-top:18px"><button class="btn ghost" id="resetBtn">Return all tools</button></p>
    </section>
  </main>
""",
  after="""<script>
  (() => {
    function render() {
      const f = AM.foundEggs(), d = AM.foundDates();
      const n = AM.EGGS.filter((e) => f.has(e.id)).length;
      document.getElementById('rows').innerHTML = AM.EGGS.map((e, i) => {
        const got = f.has(e.id), when = d[e.id] ? new Date(d[e.id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'ON FILE';
        return `<tr class="${got ? '' : 'open'}"><th>${String(i + 1).padStart(2, '0')}</th><td class="tool">${got ? e.icon + ' <b>' + e.name + '</b>' : e.hint}</td><td>${got ? '<span class="stamp">OUT · ' + when + '</span>' : '—'}</td></tr>`;
      }).join('');
      document.getElementById('tally').textContent = `${n} / ${AM.EGGS.length} out`;
      document.getElementById('seal').classList.toggle('on', n === AM.EGGS.length);
    }
    render(); addEventListener('am:egg', render);
    document.getElementById('resetBtn').addEventListener('click', () => { if (!confirm('Return every tool and clear the card?')) return; AM.resetEggs(); render(); });
  })();
  </script>""")

# ------------------------------------------------------------------ exhibit 0
page("rev/exhibit0.html", title="Exhibit 0 · Rev. · Aaron Moradi", sheet="6 of 6", block="Exhibit 0", body_attr=' data-egg="forgotten"',
  style="""
    .exhibit { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
    .meta { border: 2px solid var(--rule); background: var(--pad); }
    .meta div { display: grid; grid-template-columns: 120px 1fr; border-bottom: 1px solid var(--grid-major); }
    .meta div:last-child { border-bottom: 0; }
    .meta b { padding: 8px 12px; font: 700 12px var(--mono); text-transform: uppercase; color: var(--muted); border-right: 1px solid var(--grid-major); }
    .meta span { padding: 8px 12px; font: 14px var(--mono); }
    .page0 { background: #fff; color: #000; border: 1px solid #999; padding: 22px 24px; box-shadow: 8px 8px 0 var(--rule); transform: rotate(-1deg); }
    .page0 h2 { font: bold 22px "Times New Roman", serif; margin: 0 0 10px; }
    .page0 h1 { font: bold 30px "Times New Roman", serif; margin: 0; }
    @media (max-width: 760px) { .exhibit { grid-template-columns: 1fr; } }
  """,
  body="""
  <main class="wrap">
    <section class="sheet" style="border-bottom:0">
      <div class="sheet-head"><h2>Exhibit 0</h2><span class="no">The first About page</span></div>
      <div class="exhibit">
        <div>
          <div class="meta">
            <div><b>File</b><span><a href="/about.html">about.html</a></span></div>
            <div><b>Commit</b><span><a href="https://github.com/aaronmoradi/aaronmoradi.github.io/commit/60f8306" target="_blank" rel="noopener">60f8306</a></span></div>
            <div><b>When</b><span>Sat, Sep 6, 2025, 1:35am PT</span></div>
            <div><b>Message</b><span>"Updatesw="</span></div>
            <div><b>Touched again</b><span>963c42a "About", Sep 18, 2025</span></div>
            <div><b>Status</b><span class="red">forgotten, then preserved</span></div>
          </div>
          <p class="pencil" style="margin-top:16px">↳ less than an hour after the first commit, there was already an About page. It just never got finished. The real one is on the <a href="/rev/#about">title sheet</a>.</p>
        </div>
        <div class="page0"><h2>This is my about page test</h2><h1>I completely forgot about this...</h1></div>
      </div>
    </section>
  </main>
""")
