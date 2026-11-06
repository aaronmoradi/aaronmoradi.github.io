#!/usr/bin/env python3
"""Build the résumé page options (/resume/option-1.html ... option-4.html) from one set of data.
Content follows assets/AaronMoradiResume.pdf, minus the phone number (this repo is public).
Run from the repo root: python3 tools/resume_pages.py"""
import os
from html import escape as e

R = {
    "name": "Aaron Moradi",
    "contact": [("aaronmoradi2@gmail.com", "mailto:aaronmoradi2@gmail.com"), ("Los Angeles, CA", None),
                ("linkedin.com/in/aaronmoradi", "https://www.linkedin.com/in/aaronmoradi/"), ("aaronmoradi.com", "/")],
    "education": {
        "school": "Syracuse University", "college": "College of Engineering & Computer Science", "where": "Syracuse, NY", "when": "May 2025",
        "degree": "Bachelor of Science, Computer Science", "minor": "Minor, Engineering & Computer Science Management", "honors": "Cum Laude",
        "abroad": "Study abroad: London, UK · Aug–Dec 2023",
    },
    "courses": [
        ("Math", "Discrete Mathematics, Logic, Linear Algebra, Probability & Statistics, Automata & Computability, Analysis of Algorithms"),
        ("Computer Science", "Data Structures, Computer Organization & Programming Systems, Systems & Network Programming, Programming Languages: Theory & Practice, "
         "Software Specification & Design, Design of Operating Systems, Artificial Intelligence, Social Media & Data Mining, Computer Network Security, "
         "Ethical Aspects of Engineering & CS, Legal Aspects of Engineering & CS"),
    ],
    "skills": [
        ("Programming & tools", "Python (strong), C (strong), HTML (moderate), Java (moderate), Racket (basic), Haskell (basic), Google Sheets, Microsoft Excel, Google Slides"),
        ("Languages", "English (fluent), Farsi (conversational), Spanish (familiar)"),
        ("Certifications", "Inside LVMH · ServSafe Food Handler · Adult First Aid/CPR/AED (Red Cross)"),
    ],
    "experience": [
        {"role": "Assistant Chief of Staff", "org": "XYZ", "where": "Santa Monica, CA", "when": "Oct 2025 – Present", "code": "XYZ", "now": True, "bullets": [
            "Build Excel models and presentations to forecast revenue and track sales-campaign performance for registrar partners.",
            "Manage the full registrar relationship for the registry: business correspondence, invoices and partnership outreach.",
            "Research real-estate operations and markets, and share findings in clear reports and presentations.",
            "Oversee commercial tenant relations and drive occupancy through Zillow marketing setup and property tours.",
            "Lead execution of the City of Santa Monica's emission reduction plan; produce photo and video content for property and automotive listings; cultivate office culture.",
        ]},
        {"role": "Data Science Analyst Intern", "org": "PlanetArt", "where": "Calabasas, CA", "when": "Jun – Aug 2024", "code": "PLA", "bullets": [
            "Developed an internal data-processing platform (Prophet) in Streamlit, helping automate five-year forecasts of revenue, units and holiday events.",
            "Compiled revenue and unit data by geography and multilevel categories; provided best-case forecasting for company profit.",
        ]},
        {"role": "Organizer & Attendee", "org": "CuseHacks Beta 2023", "where": "Syracuse, NY", "when": "Apr 2023", "code": "CHB", "bullets": [
            "Coordinated and took part in the CuseHacks Beta 2023 hackathon on the Syracuse University campus.",
            "Built partnerships with technology firms to secure sponsorships, bringing industry connections and support to the event.",
        ]},
        {"role": "Attendee", "org": "CuseHacks 2022", "where": "Syracuse, NY", "when": "Feb 2022", "code": "CH2", "bullets": []},
    ],
    "leadership": [
        ("Panel Member", "Engineering & Computer Science Dean's Advisory Panel", "May 2022 – May 2025"),
        ("Logistics Chair", "Innovate Orange", "May 2024 – May 2025"),
        ("Social Media Copywriter", "Innovate Orange", "Jan – May 2024"),
        ("Sponsorship Committee", "Innovate Orange", "Apr 2022 – May 2023"),
    ],
    "service": [
        ("Guest Services", "Barnes Center at The Arch", "Syracuse, NY", "Aug 2022 – May 2025"),
        ("Food Server", "Diddy Riese Cookies", "Los Angeles, CA", "May – Jun 2022"),
        ("Barista", "The Tea & Coffee Exchange", "Hollywood, CA", "Jul – Aug 2019"),
    ],
}

PDF = "/assets/AaronMoradiResume.pdf"
OPTIONS = [("1", "Classic"), ("2", "Itinerary"), ("3", "Two-column"), ("4", "Route line")]


def contact_html(sep=" · "):
    return sep.join(f'<a href="{u}"{" target=\"_blank\" rel=\"noopener\"" if u and u.startswith("http") else ""}>{e(t)}</a>' if u else e(t) for t, u in R["contact"])


def switcher(cur):
    links = "".join(f'<a href="/resume/option-{k}.html"{" aria-current=\"page\"" if k == cur else ""}>{k} · {n}</a>' for k, n in OPTIONS)
    return f'<nav class="rs-switch" aria-label="Résumé designs">{links}</nav>'


HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Résumé · Aaron Moradi</title>
  <meta name="description" content="Résumé of Aaron Moradi: Syracuse University '25, B.S. Computer Science, minor in Engineering & Computer Science Management." />
  <meta name="robots" content="noindex" />
  <link rel="stylesheet" href="/departures/departures.css" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png?v=2" />
  <style>
    .rs-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 18px; padding: 14px var(--gut); background: #0b0c0e; border-bottom: 1px solid #1c1f23; font: 600 12px var(--mono); text-transform: uppercase; letter-spacing: .08em; }
    .rs-bar a { color: var(--glyph); text-decoration: none; }
    .rs-bar .act { display: flex; gap: 8px; }
    .rs-bar .act a, .rs-bar .act button { border: 1px solid #2c3036; padding: 8px 12px 6px; background: none; color: var(--glyph); font: inherit; letter-spacing: inherit; text-transform: inherit; cursor: pointer; }
    .rs-bar .act a:hover, .rs-bar .act button:hover { background: var(--glyph); color: #0b0c0e; }
    .rs-switch { display: flex; flex-wrap: wrap; gap: 4px; }
    .rs-switch a { padding: 7px 10px 5px; border: 1px solid #2c3036; color: #a0a5ad !important; }
    .rs-switch a[aria-current] { background: var(--blue); border-color: var(--blue); color: #fff !important; }
    @media print { .rs-bar { display: none !important; } body { background: #fff !important; } @page { margin: 14mm; } }
    {style}
  </style>
</head>
<body class="rs {cls}">
  <div class="rs-bar"><a href="/">← aaronmoradi.com</a>{switch}<span class="act"><button type="button" onclick="print()">Print / save PDF</button><a href="{pdf}" target="_blank" rel="noopener">Original PDF</a></span></div>
"""
FOOT = """
  <script src="/departures/flap.js"></script>
  <script src="/departures/departures-skin.js"></script>
  <script src="/js/main.js"></script>{after}
</body>
</html>
"""


def write(key, cls, style, body, after=""):
    os.makedirs("resume", exist_ok=True)
    html = HEAD.replace("{style}", style).replace("{cls}", cls).replace("{switch}", switcher(key)).replace("{pdf}", PDF) + body + FOOT.replace("{after}", after)
    path = f"resume/option-{key}.html"
    open(path, "w").write(html)
    print("wrote", path)


ed = R["education"]

# ---------------------------------------------------------------- 1 · Classic: paper, one column, recruiter-first
def classic():
    exp = "".join(f"""
      <article class="job"><header><h3>{e(j['role'])}, <span>{e(j['org'])}</span></h3><span class="when">{e(j['when'])}</span></header>
        <div class="where">{e(j['where'])}</div>{('<ul>' + ''.join(f'<li>{e(b)}</li>' for b in j['bullets']) + '</ul>') if j['bullets'] else ''}</article>""" for j in R["experience"])
    lead = "".join(f'<li><span><b>{e(r)}</b>, {e(o)}</span><span class="when">{e(w)}</span></li>' for r, o, w in R["leadership"])
    serv = "".join(f'<li><span><b>{e(r)}</b>, {e(o)}, {e(p)}</span><span class="when">{e(w)}</span></li>' for r, o, p, w in R["service"])
    skills = "".join(f'<li><b>{e(k)}:</b> {e(v)}</li>' for k, v in R["skills"])
    courses = "".join(f'<li><b>{e(k)}:</b> {e(v)}</li>' for k, v in R["courses"])
    body = f"""
  <main class="paper">
    <header class="top"><h1>{e(R['name'])}</h1><p>{contact_html(' &nbsp;·&nbsp; ')}</p></header>
    <section><h2>Education</h2>
      <article class="job"><header><h3>{e(ed['school'])} <span>· {e(ed['college'])}</span></h3><span class="when">{e(ed['when'])}</span></header>
        <div class="where">{e(ed['degree'])} · {e(ed['minor'])} · {e(ed['honors'])}</div><div class="where">{e(ed['abroad'])}</div></article>
      <ul class="flat">{courses}</ul></section>
    <section><h2>Experience</h2>{exp}</section>
    <section><h2>Leadership</h2><ul class="flat dated">{lead}</ul></section>
    <section><h2>Customer service</h2><ul class="flat dated">{serv}</ul></section>
    <section><h2>Skills</h2><ul class="flat">{skills}</ul></section>
  </main>"""
    style = """
    body.rs-classic { background: #e9e7e1; color: #16181b; }
    .paper { max-width: 860px; margin: 34px auto 60px; background: #fff; padding: clamp(26px, 5vw, 64px); box-shadow: 0 20px 50px rgba(0,0,0,.12); font: 400 15.5px/1.55 var(--sans); }
    .paper .top { text-align: center; border-bottom: 2px solid #16181b; padding-bottom: 16px; margin-bottom: 8px; }
    .paper h1 { margin: 0; font: 900 clamp(34px, 5vw, 48px)/1 var(--sans); letter-spacing: .04em; text-transform: uppercase; }
    .paper .top p { margin: 10px 0 0; font-size: 14px; color: #474c55; }
    .paper a { color: inherit; }
    .paper h2 { margin: 26px 0 10px; font: 800 13px var(--sans); letter-spacing: .18em; text-transform: uppercase; color: #3d7dff; border-bottom: 1px solid #d9dce1; padding-bottom: 6px; }
    .job { margin: 0 0 14px; }
    .job header { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
    .job h3 { margin: 0; font: 800 17px/1.3 var(--sans); } .job h3 span { font-weight: 500; }
    .when { font: 600 13px var(--mono); color: #5f6570; white-space: nowrap; }
    .where { font-size: 14px; color: #474c55; }
    .job ul { margin: 6px 0 0; padding-left: 18px; } .job li { margin: 2px 0; }
    .flat { list-style: none; margin: 0; padding: 0; } .flat li { margin: 4px 0; }
    .dated li { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    @media print { .paper { box-shadow: none; margin: 0; max-width: none; padding: 0; font-size: 12.5px; } .paper h2 { margin-top: 16px; } }
"""
    write("1", "rs-classic", style, body)


# ---------------------------------------------------------------- 2 · Itinerary: the departures board, dark
def itinerary():
    legs = "".join(f"""
      <article class="leg{' now' if j.get('now') else ''}">
        <div class="lh"><span class="code">{e(j['code'])}</span><div><h3>{e(j['role'])}</h3><p>{e(j['org'])} · {e(j['where'])}</p></div><span class="st">{'On time' if j.get('now') else 'Departed'}</span></div>
        <div class="lmeta">{e(j['when'])}</div>{('<ul>' + ''.join(f'<li>{e(b)}</li>' for b in j['bullets']) + '</ul>') if j['bullets'] else ''}</article>""" for j in R["experience"])
    lead = "".join(f'<li><span>{e(w)}</span><b>{e(r)}</b> · {e(o)}</li>' for r, o, w in R["leadership"])
    serv = "".join(f'<li><span>{e(w)}</span><b>{e(r)}</b> · {e(o)}, {e(p)}</li>' for r, o, p, w in R["service"])
    skills = "".join(f'<div><h4>{e(k)}</h4><p>{e(v)}</p></div>' for k, v in R["skills"])
    body = f"""
  <main class="zone" style="padding-top:34px"><div class="wrap">
    <div class="board it-hero">
      <div class="board-head"><span class="title"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2.5 19h19v2h-19zM22.07 9.64c-.21-.8-1.04-1.28-1.84-1.06L14.92 10 8 3.57l-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/></svg>Itinerary · AM 2332</span><span>Résumé</span></div>
      <div class="name" id="rsName"></div>
      <p class="it-contact">{contact_html()}</p>
    </div>
    <section class="it-sec"><h2>Education</h2>
      <div class="leg"><div class="lh"><span class="code">SYR</span><div><h3>{e(ed['degree'])}</h3><p>{e(ed['school'])} · {e(ed['college'])}</p></div><span class="st land">Landed</span></div>
        <div class="lmeta">{e(ed['when'])} · {e(ed['minor'])} · {e(ed['honors'])} · {e(ed['abroad'])}</div>
        <ul>{''.join(f'<li><b>{e(k)}:</b> {e(v)}</li>' for k, v in R['courses'])}</ul></div></section>
    <section class="it-sec"><h2>Experience</h2>{legs}</section>
    <section class="it-sec it-two"><div><h2>Leadership</h2><ul class="it-list">{lead}</ul></div><div><h2>Customer service</h2><ul class="it-list">{serv}</ul></div></section>
    <section class="it-sec"><h2>Skills</h2><div class="it-skills">{skills}</div></section>
  </div></main>"""
    style = """
    .it-hero .name .cell { --cw: clamp(20px, 5.4vw, 64px); --ch: clamp(30px, 8vw, 92px); }
    .it-hero .name { --gap: clamp(2px, .4vw, 5px); margin: 4px 0 10px; }
    .it-contact { margin: 0; font: 600 13px var(--mono); color: var(--dim); text-transform: uppercase; letter-spacing: .06em; }
    .it-contact a { color: var(--glyph); }
    .it-sec { margin-top: 34px; }
    .it-sec h2 { margin: 0 0 12px; font: 800 13px var(--sans); letter-spacing: .18em; text-transform: uppercase; color: var(--amber); }
    .leg { background: #111214; border: 1px solid #1f2125; padding: 18px 20px; margin-bottom: 3px; }
    .leg.now { border-color: var(--blue); }
    .lh { display: grid; grid-template-columns: 64px 1fr auto; gap: 14px; align-items: center; }
    .lh .code { font: 600 20px var(--mono); color: var(--amber); }
    .lh h3 { margin: 0; font: 800 19px/1.2 var(--sans); } .lh p { margin: 2px 0 0; color: #b8bbc1; font-size: 14px; }
    .st { font: 600 12px var(--mono); text-transform: uppercase; color: var(--dim); } .leg.now .st, .st.land { color: var(--green); }
    .lmeta { margin: 8px 0 0 78px; font: 600 12px var(--mono); color: var(--dim); text-transform: uppercase; letter-spacing: .04em; }
    .leg ul { margin: 10px 0 0 78px; padding-left: 16px; color: #d4d6da; font-size: 15px; } .leg li { margin: 3px 0; }
    .it-two { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .it-list { list-style: none; margin: 0; padding: 0; } .it-list li { padding: 10px 0; border-bottom: 1px solid #1f2125; font-size: 15px; }
    .it-list span { display: block; font: 600 12px var(--mono); color: var(--dim); text-transform: uppercase; }
    .it-skills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; } .it-skills div { background: #111214; border: 1px solid #1f2125; padding: 16px 18px; }
    .it-skills h4 { margin: 0 0 6px; font: 700 12px var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--dim); } .it-skills p { margin: 0; font-size: 15px; }
    @media (max-width: 760px) { .it-two, .it-skills { grid-template-columns: 1fr; } .lh { grid-template-columns: 48px 1fr; } .lh .st { grid-column: 2; } .lmeta, .leg ul { margin-left: 0; } }
    @media print { body { color: #000; } .leg, .it-skills div { background: none; border-color: #ccc; } .board { background: none; box-shadow: none; border: 0; } }
"""
    after = """
  <script>Flap.row(document.getElementById('rsName'), 12).set('AARON MORADI', { stagger: 50 });</script>"""
    write("2", "rs-itinerary", style, body, after)


# ---------------------------------------------------------------- 3 · Two-column: modern, light, sidebar
def twocol():
    exp = "".join(f"""
        <article class="tc-job"><div class="tc-when">{e(j['when'])}</div><div><h3>{e(j['role'])}</h3><p class="tc-org">{e(j['org'])} · {e(j['where'])}</p>
          {('<ul>' + ''.join(f'<li>{e(b)}</li>' for b in j['bullets']) + '</ul>') if j['bullets'] else ''}</div></article>""" for j in R["experience"])
    lead = "".join(f'<article class="tc-job"><div class="tc-when">{e(w)}</div><div><h3>{e(r)}</h3><p class="tc-org">{e(o)}</p></div></article>' for r, o, w in R["leadership"])
    serv = "".join(f'<article class="tc-job"><div class="tc-when">{e(w)}</div><div><h3>{e(r)}</h3><p class="tc-org">{e(o)} · {e(p)}</p></div></article>' for r, o, p, w in R["service"])
    side_contact = "".join(f'<li>{f"<a href=\"{u}\">{e(t)}</a>" if u else e(t)}</li>' for t, u in R["contact"])
    skills = "".join(f'<h4>{e(k)}</h4><p>{e(v)}</p>' for k, v in R["skills"])
    courses = "".join(f'<h4>{e(k)}</h4><p>{e(v)}</p>' for k, v in R["courses"])
    body = f"""
  <main class="tc">
    <aside class="tc-side">
      <span class="tc-mark">AM</span>
      <h1>Aaron<br>Moradi</h1>
      <ul class="tc-contact">{side_contact}</ul>
      <h2>Education</h2><p><b>{e(ed['school'])}</b><br>{e(ed['degree'])}<br>{e(ed['minor'])}<br>{e(ed['honors'])} · {e(ed['when'])}<br><span class="dim">{e(ed['abroad'])}</span></p>
      <h2>Skills</h2>{skills}
      <h2>Coursework</h2>{courses}
    </aside>
    <div class="tc-main">
      <h2>Experience</h2>{exp}
      <h2>Leadership</h2>{lead}
      <h2>Customer service</h2>{serv}
    </div>
  </main>"""
    style = """
    body.rs-twocol { background: #f4f3ef; color: #15171a; }
    .tc { max-width: 1120px; margin: 34px auto 60px; display: grid; grid-template-columns: 340px 1fr; background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,.1); font: 400 15px/1.55 var(--sans); }
    .tc-side { background: #121417; color: #e9e8e4; padding: 40px 32px; }
    .tc-mark { display: inline-block; background: var(--blue); color: #fff; font: 900 18px/1 var(--sans); padding: 8px 9px 5px; letter-spacing: .06em; }
    .tc-side h1 { margin: 18px 0 16px; font: 900 44px/.95 var(--sans); letter-spacing: -.01em; color: #fff; }
    .tc-contact { list-style: none; margin: 0 0 8px; padding: 0; font: 600 13px var(--mono); } .tc-contact li { margin: 4px 0; } .tc-side a { color: #fff; }
    .tc-side h2 { margin: 26px 0 8px; font: 800 12px var(--sans); letter-spacing: .18em; text-transform: uppercase; color: var(--amber); }
    .tc-side h4 { margin: 12px 0 2px; font: 700 13px var(--sans); color: #fff; } .tc-side p { margin: 0; font-size: 14px; color: #c3c6cc; } .tc-side .dim { color: #8b9099; }
    .tc-main { padding: 40px 44px; }
    .tc-main h2 { margin: 0 0 14px; font: 800 12px var(--sans); letter-spacing: .18em; text-transform: uppercase; color: var(--blue); }
    .tc-main h2 ~ h2 { margin-top: 30px; }
    .tc-job { display: grid; grid-template-columns: 150px 1fr; gap: 18px; padding: 12px 0; border-top: 1px solid #ebeae6; }
    .tc-when { font: 600 12.5px var(--mono); color: #5f6570; padding-top: 3px; }
    .tc-job h3 { margin: 0; font: 800 17px/1.3 var(--sans); } .tc-org { margin: 1px 0 0; color: #474c55; font-size: 14px; }
    .tc-job ul { margin: 8px 0 0; padding-left: 18px; } .tc-job li { margin: 3px 0; }
    @media (max-width: 860px) { .tc { grid-template-columns: 1fr; margin: 0; } .tc-job { grid-template-columns: 1fr; gap: 2px; } .tc-main { padding: 30px 22px; } }
    @media print { .tc { box-shadow: none; margin: 0; max-width: none; grid-template-columns: 250px 1fr; font-size: 12px; } .tc-side { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
"""
    write("3", "rs-twocol", style, body)


# ---------------------------------------------------------------- 4 · Route line: a transit map down the page
def route():
    LINE = ["#e3131b", "#a05da5", "#0072bc", "#f8a31a", "#58a738", "#e470ab"]
    stops = []
    for i, j in enumerate(R["experience"]):
        stops.append(f"""
      <article class="rl-stop{' now' if j.get('now') else ''}" style="--c:{LINE[i % len(LINE)]}"><span class="dot"></span>
        <div class="rl-when">{e(j['when'])}</div><h3>{e(j['role'])}</h3><p class="rl-org">{e(j['org'])} · {e(j['where'])}</p>
        {('<ul>' + ''.join(f'<li>{e(b)}</li>' for b in j['bullets']) + '</ul>') if j['bullets'] else ''}</article>""")
    stops.append(f"""
      <article class="rl-stop" style="--c:#fdb913"><span class="dot"></span><div class="rl-when">{e(ed['when'])}</div><h3>{e(ed['degree'])}</h3>
        <p class="rl-org">{e(ed['school'])} · {e(ed['minor'])} · {e(ed['honors'])}</p><p class="rl-org">{e(ed['abroad'])}</p></article>""")
    for r, o, p, w in R["service"]:
        stops.append(f'<article class="rl-stop small" style="--c:#8b9099"><span class="dot"></span><div class="rl-when">{e(w)}</div><h3>{e(r)}</h3><p class="rl-org">{e(o)} · {e(p)}</p></article>')
    lead = "".join(f'<li><b>{e(r)}</b><span>{e(o)}</span><em>{e(w)}</em></li>' for r, o, w in R["leadership"])
    skills = "".join(f'<li><b>{e(k)}</b><span>{e(v)}</span></li>' for k, v in R["skills"])
    body = f"""
  <main class="zone" style="padding-top:34px"><div class="wrap rl">
    <header class="rl-head"><span class="rl-bullet">AM</span><div><h1>Aaron Moradi</h1><p>{contact_html()}</p></div></header>
    <div class="rl-grid">
      <section><h2>The line so far</h2><div class="rl-line">{''.join(stops)}</div></section>
      <aside>
        <h2>Leadership</h2><ul class="rl-list">{lead}</ul>
        <h2>Skills</h2><ul class="rl-list">{skills}</ul>
        <h2>Coursework</h2><ul class="rl-list">{''.join(f'<li><b>{e(k)}</b><span>{e(v)}</span></li>' for k, v in R['courses'])}</ul>
      </aside>
    </div>
  </div></main>"""
    style = """
    .rl-head { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
    .rl-bullet { display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%; background: #e16710; color: #fff; font: 900 28px/1 var(--sans); flex: none; }
    .rl-head h1 { margin: 0; font: 900 clamp(36px, 6vw, 64px)/1 var(--sans); letter-spacing: -.02em; }
    .rl-head p { margin: 8px 0 0; font: 600 13px var(--mono); color: var(--dim); text-transform: uppercase; letter-spacing: .05em; } .rl-head a { color: var(--glyph); }
    .rl-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: clamp(24px, 4vw, 54px); }
    .rl h2 { margin: 0 0 16px; font: 800 13px var(--sans); letter-spacing: .18em; text-transform: uppercase; color: var(--dim); }
    .rl aside h2 ~ h2 { margin-top: 26px; }
    .rl-line { position: relative; padding-left: 40px; }
    .rl-line::before { content: ""; position: absolute; left: 13px; top: 8px; bottom: 8px; width: 6px; border-radius: 3px; background: linear-gradient(#e3131b, #a05da5, #0072bc, #f8a31a, #fdb913, #8b9099); }
    .rl-stop { position: relative; padding: 0 0 26px; }
    .rl-stop .dot { position: absolute; left: -36px; top: 4px; width: 22px; height: 22px; border-radius: 50%; background: #0b0c0e; border: 5px solid var(--c); }
    .rl-stop.now .dot { background: var(--c); box-shadow: 0 0 0 5px rgba(227,19,27,.25); }
    .rl-when { font: 600 12px var(--mono); color: var(--c); text-transform: uppercase; letter-spacing: .06em; }
    .rl-stop h3 { margin: 2px 0 0; font: 800 21px/1.2 var(--sans); } .rl-stop.small h3 { font-size: 17px; }
    .rl-org { margin: 2px 0 0; color: #b8bbc1; font-size: 14px; }
    .rl-stop ul { margin: 8px 0 0; padding-left: 18px; color: #d4d6da; font-size: 15px; } .rl-stop li { margin: 3px 0; }
    .rl-list { list-style: none; margin: 0; padding: 0; } .rl-list li { padding: 10px 0; border-bottom: 1px solid #1f2125; font-size: 14.5px; }
    .rl-list b { display: block; font-weight: 800; } .rl-list span { color: #b8bbc1; } .rl-list em { display: block; font: 600 12px var(--mono); color: var(--dim); font-style: normal; }
    @media (max-width: 860px) { .rl-grid { grid-template-columns: 1fr; } }
    @media print { body { color: #000; } .rl-org, .rl-list span, .rl-stop ul { color: #333; } }
"""
    write("4", "rs-route", style, body)


classic(); itinerary(); twocol(); route()
