#!/usr/bin/env python3
"""Build the résumé page (/resume/) from one set of data, in the "route line" design.
Content follows assets/AaronMoradiResume.pdf, minus the phone number (this repo is public).
Run from the repo root: python3 tools/resume_pages.py
assets/AaronMoradiResume.pdf is this page printed to PDF (Chromium, Letter, print stylesheet), so the two stay in step."""
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


def contact_html(sep=" · "):
    return sep.join(f'<a href="{u}"{" target=\"_blank\" rel=\"noopener\"" if u and u.startswith("http") else ""}>{e(t)}</a>' if u else e(t) for t, u in R["contact"])


HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Résumé · Aaron Moradi</title>
  <meta name="description" content="Résumé of Aaron Moradi: Syracuse University '25, B.S. Computer Science, minor in Engineering & Computer Science Management." />
  <link rel="canonical" href="https://aaronmoradi.com/resume/" />
  <meta property="og:title" content="Aaron Moradi · Résumé" />
  <meta property="og:image" content="https://aaronmoradi.com/assets/img/og-card.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="/departures/departures.css" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png?v=2" />
  <style>
    .rs-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 18px; padding: 14px var(--gut); background: #0b0c0e; border-bottom: 1px solid #1c1f23; font: 600 12px var(--mono); text-transform: uppercase; letter-spacing: .08em; }
    .rs-bar a { color: var(--glyph); text-decoration: none; }
    .rs-bar .act { display: flex; gap: 8px; }
    .rs-bar .act a, .rs-bar .act button { border: 1px solid #2c3036; padding: 8px 12px 6px; background: none; color: var(--glyph); font: inherit; letter-spacing: inherit; text-transform: inherit; cursor: pointer; }
    .rs-bar .act a:hover, .rs-bar .act button:hover { background: var(--glyph); color: #0b0c0e; }
    @media print { .rs-bar { display: none !important; } body { background: #fff !important; } @page { margin: 14mm; } }
    {style}
  </style>
</head>
<body class="rs {cls}">
  <div class="rs-bar"><a href="/">← aaronmoradi.com</a><span class="act"><button type="button" onclick="print()">Print</button><a href="{pdf}" target="_blank" rel="noopener">Download PDF</a></span></div>
"""
FOOT = """
  <script src="/departures/flap.js"></script>
  <script src="/departures/departures-skin.js"></script>
  <script src="/js/main.js"></script>{after}
</body>
</html>
"""


def write(cls, style, body, after=""):
    os.makedirs("resume", exist_ok=True)
    html = HEAD.replace("{style}", style).replace("{cls}", cls).replace("{pdf}", PDF) + body + FOOT.replace("{after}", after)
    path = "resume/index.html"
    open(path, "w").write(html)
    print("wrote", path)


ed = R["education"]

# ---------------------------------------------------------------- Route line: the career as a transit line down the page
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
    @media print {
      @page { size: letter; margin: 0; }
      html, body { background: #fff !important; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .zone { padding: 0 !important; background: #fff !important; } .wrap { max-width: none; padding: .45in .5in; }
      body { font-size: 11px; line-height: 1.4; }
      .rl-head { margin-bottom: 18px; } .rl-head h1 { font-size: 40px; } .rl-head p, .rl-head a { color: #333; } .rl-bullet { width: 60px; height: 60px; font-size: 21px; }
      .rl-grid { grid-template-columns: minmax(0, 1fr) 230px; gap: 26px; font-size: 12px; }
      .rl h2 { color: #555; margin-bottom: 10px; }
      .rl-stop { padding-bottom: 9px; break-inside: avoid; } .rl-stop .dot { background: #fff; } .rl-stop.now .dot { background: var(--c); box-shadow: none; }
      .rl-stop h3 { font-size: 14px; } .rl-stop.small h3 { font-size: 12.5px; } .rl-org { font-size: 11.5px; } .rl-when { font-size: 10px; }
      .rl-org, .rl-list span, .rl-stop ul, .rl-list em { color: #333; } .rl-stop ul { font-size: 11px; margin-top: 4px; } .rl-stop li { margin: 1px 0; } .rl-list li { border-color: #ddd; padding: 5px 0; font-size: 10.5px; line-height: 1.35; }
    }
"""
    write("rs-route", style, body)


route()
