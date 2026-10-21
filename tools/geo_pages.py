"""Build the city editions of the Departures homepage (/london/, /nyc/, /la/) from index.html.

Each edition is the same page with a city stylesheet on top, a few lines of
city wording, its own in-page links, and a switcher between editions.
Run from the repo root after changing index.html: python3 tools/geo_pages.py
"""
import os

SRC = open("index.html").read()

CITIES = [
    {
        "slug": "london", "cls": "london", "name": "London",
        "title": "Aaron Moradi · London edition",
        "fonts": ["/departures/themes/fonts/Railway.ttf", "/departures/themes/fonts/doto-latin-900-normal.woff2"],
        "swap": [
            ("Departures · Los Angeles</span>", "Westbound · Platform 1</span>"),
            ('<p class="welcome">Welcome to<br /><span>Los Angeles.</span></p>', '<p class="welcome">Next stop:<br /><span>Los Angeles.</span></p>'),
        ],
    },
    {
        "slug": "nyc", "cls": "nyc bullets", "name": "New York",
        "title": "Aaron Moradi · New York edition",
        "fonts": [],
        "swap": [
            ("Departures · Los Angeles</span>", "Next trains · Uptown &amp; The Bronx</span>"),
            ('<p class="welcome">Welcome to<br /><span>Los Angeles.</span></p>', '<p class="welcome">Stand clear of the<br /><span>closing doors.</span></p>'),
        ],
    },
    {
        "slug": "la", "cls": "la bullets", "name": "Los Angeles",
        "title": "Aaron Moradi · Los Angeles edition",
        "fonts": [],
        "swap": [
            ("Departures · Los Angeles</span>", "Metro Rail · Los Angeles</span>"),
        ],
    },
]


def build(c):
    s = SRC
    slug = c["slug"]
    s = s.replace('<html lang="en">', f'<html lang="en" class="{c["cls"]}">', 1)
    s = s.replace("<title>Aaron Moradi</title>", f'<title>{c["title"]}</title>\n  <meta name="robots" content="noindex" />', 1)
    s = s.replace('  <link rel="canonical" href="https://aaronmoradi.com/" />\n', "", 1)
    head = "".join(f'  <link rel="preload" href="{f}" as="font" crossorigin />\n' for f in c["fonts"])
    head += '  <link rel="stylesheet" href="/departures/themes/geo.css" />\n'
    head += f'  <link rel="stylesheet" href="/departures/themes/{slug}.css" />\n'
    s = s.replace('  <link rel="stylesheet" href="/departures/departures.css" />\n', '  <link rel="stylesheet" href="/departures/departures.css" />\n' + head, 1)
    # keep in-page navigation inside this edition
    s = s.replace('href="/#', f'href="/{slug}/#').replace('class="mark logo" href="/"', f'class="mark logo" href="/{slug}/"')
    for a, b in c["swap"]:
        assert a in s, (slug, a)
        s = s.replace(a, b)
    s = s.replace('  <script src="/js/main.js"></script>',
                  '  <script>AM_SKIN.homePaths.push(location.pathname);</script>\n  <script src="/js/main.js"></script>', 1)
    links = [("/", "Original"), ("/london/", "London"), ("/nyc/", "New York"), ("/la/", "Los Angeles")]
    cur = ' aria-current="page"'
    sw = "".join(f'<a href="{h}"{cur if h == f"/{slug}/" else ""}>{n}</a>' for h, n in links)
    s = s.replace("</body>", f'  <nav class="editions" aria-label="Editions">{sw}</nav>\n</body>', 1)
    os.makedirs(slug, exist_ok=True)
    open(f"{slug}/index.html", "w").write(s)
    print("wrote", f"{slug}/index.html")


for c in CITIES:
    build(c)
