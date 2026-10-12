/* "Official Program" skin for the shared site script (js/main.js) and map (js/map.js).
   Load this BEFORE main.js. Egg ids are unchanged, so progress carries over. */
(() => {
  'use strict';

  // Career log: the single source for the rookie card, the stats command and the schedule.
  const CAREER = [
    { yr: "'19", team: 'Tea & Coffee Exchange', pos: 'Barista', city: 'Hollywood', start: '2019-07', end: '2019-08' },
    { yr: "'22", team: 'Diddy Riese Cookies', pos: 'Food Server', city: 'Westwood', start: '2022-05', end: '2022-06' },
    { yr: "'22–25", team: 'Barnes Center at The Arch', pos: 'Guest Services', city: 'Syracuse', start: '2022-08', end: '2025-05' },
    { yr: "'24", team: 'PlanetArt', pos: 'Data Science Intern', city: 'Calabasas', start: '2024-06', end: '2024-08' },
    { yr: "'25–", team: 'XYZ', pos: 'Asst. Chief of Staff', city: 'Santa Monica', start: '2025-10', end: null },
  ];
  // Inclusive month count, e.g. Jul–Aug = 2. An open stint counts through this month.
  const months = (start, end) => {
    const [y1, m1] = start.split('-').map(Number);
    const now = new Date();
    const [y2, m2] = end ? end.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
    return (y2 - y1) * 12 + (m2 - m1) + 1;
  };
  window.AM_CAREER = { CAREER, months };

  const P = '/program/';
  window.AM_SKIN = {
    homePaths: [P, P + 'index.html'],
    termTitle: 'PRESS BOX',
    prompt: 'press@box:~$',
    banner: `<span class="c-accent">┌──────────────────────────────────────────┐
│  PRESS BOX · OFFICIAL PROGRAM VOL. 25     │
│  aaronmoradi.com                          │
└──────────────────────────────────────────┘</span>
Credentials verified. Welcome to the press box.
Type <span class="c-gold">help</span> for the stat sheet. Try <span class="c-gold">lineup</span>, <span class="c-gold">stats</span>, <span class="c-gold">boxscore</span>, <span class="c-gold">scout</span>.
<span class="c-dim">↑/↓ history · Tab autocomplete · Esc to leave</span>
`,
    sudo: `<span class="c-err">TECHNICAL FOUL.</span> Two shots, possession to the house.
<span class="c-dim">(guest is not in the sudoers file. The officials have been notified.)</span>`,
    places: {
      '~': P, home: P, '/': P, program: P,
      map: P + 'map.html', road: P + 'map.html', schedule: P + 'map.html', atlas: P + 'map.html',
      vault: P + 'vault.html', '.vault': P + 'vault.html', binder: P + 'vault.html', trophies: P + 'vault.html',
      about: P + '#scouting', scouting: P + '#scouting', card: P + '#card', projects: P + '#boxscores', work: P + '#boxscores',
      experience: P + '#card', path: P + '#card', contact: P + '#tickets', tickets: P + '#tickets', kobe: P + '#tribute',
      play: P + 'airball.html', court: P + 'airball.html', error: P + 'error-card.html', misprint: P + 'error-card.html',
      v2: '/',
    },
    palettes: { party: ['#40205f', '#f1b50c', '#ffffff', '#1a1916'] },
    eggs: {
      terminal:  { icon: '🎙️', name: 'Press Pass',         hint: 'The key under Esc gets you into the press box.' },
      sudo:      { icon: '🟨', name: 'Technical Foul',     hint: 'In the press box, demand more power than you have.' },
      konami:    { icon: '💜', name: 'Showtime',           hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
      otto:      { icon: '🍊', name: 'Away Game',          hint: 'Type the name of a certain citrus mascot. Anywhere.' },
      logo:      { icon: '🌀', name: 'Behind the Back',    hint: 'Be very impatient with the AM logo.' },
      mamba:     { icon: '🐍', name: '8 & 24',             hint: 'Tap #24 eight times. Or #8 twenty-four.' },
      courtside: { icon: '🏟️', name: 'Courtside',          hint: 'On the road schedule map, zoom way, way into downtown LA.' },
      lost:      { icon: '🧭', name: 'Out of Bounds',      hint: "Step off the court: find the page that doesn't exist." },
      hoops:     { icon: '🏀', name: 'Buckets',            hint: 'Hit 5 in a row on the Air Ball court.' },
      forgotten: { icon: '🃏', name: 'Error Card',         hint: 'Every set has a misprint. Read the fine print.' },
      console:   { icon: '🎞️', name: 'Film Room',          hint: 'Open the developer console and say hi.' },
      nightowl:  { icon: '🦉', name: 'West Coast Late Tip', hint: 'Tune in while LA is asleep (12–5am PT).' },
      vault:     { icon: '🏆', name: 'Trophy Room',        hint: "You're holding the binder, aren't you?" },
    },
    toastEgg: (egg, n, total) =>
      `<span class="pull">PULLED</span><span><small>Card ${n} of ${total}</small><b>${egg.icon} ${egg.name}</b></span>`,
    commands: {
      lineup: {
        desc: 'starting five (languages)',
        run(args, t) {
          t.print(`<span class="c-gold">STARTING LINEUP</span>
  PG  Python       85
  SG  C            85
  SF  HTML         60
  PF  Java         60
  C   CSS          30
  6M  JavaScript   25
<span class="c-dim">BENCH: Racket, Haskell</span>`);
        },
      },
      stats: {
        desc: 'career stat line',
        run(args, t) {
          const rows = CAREER.map((c) => `  ${c.yr.padEnd(7)}${c.team.padEnd(27)}${c.city.padEnd(14)}${String(months(c.start, c.end)).padStart(3)}`);
          const total = CAREER.reduce((s, c) => s + months(c.start, c.end), 0);
          t.print(`<span class="c-gold">  YR     TEAM                       CITY          MOS</span>
${rows.join('\n')}
<span class="c-gold">  CAREER ${String(CAREER.length).padEnd(2)} teams${' '.repeat(29)}${String(total).padStart(3)}</span>
<span class="c-dim">  + B.S. Computer Science, Syracuse University, May 2025 (cum laude)</span>`);
        },
      },
      boxscore: {
        desc: 'project box scores',
        run(args, t) {
          t.print(`<span class="c-gold">FINAL</span>  This Website ............ W   HTML · CSS · JS
<span class="c-gold">FINAL</span>  X vs. Bluesky ........... W   Python · Data
<span class="c-gold">FINAL</span>  Compress &amp; Encrypt ...... W   Python · Team
<span class="c-dim">→ cd projects for the recaps</span>`);
        },
      },
      scout: {
        desc: 'scouting report',
        run(args, t) {
          t.print(`<span class="c-gold">SCOUTING REPORT: MORADI, AARON</span>
HT: Los Angeles, CA    COLLEGE: Syracuse '25 (cum laude)
"I pride myself on being professional, creative, determined, and personable."
TOOLS: Professional · Creative · Determined · Personable`);
        },
      },
      kobe: {
        hidden: true,
        run(args, t) { t.confetti('lakers', 120); t.print('💜💛 8 &amp; 24. Mamba forever. Kobe Bryant, 1978–2020.'); },
      },
    },
  };

  window.AM_MAP_SKIN = {
    // numbered "game" pins; secret pins keep their emoji
    pin: (emoji, cls, i) => (i === null ? emoji : `<span>${i + 1}</span>`),
    chapter: (p, i, esc) => `
      <li><button class="chapter" data-id="${p.id}">
        <span class="g">G${i + 1}</span>
        <span class="d"><span class="t">${esc(p.title)}</span><span class="w">${esc(p.when)}</span></span>
        <span class="r">W</span>
      </button></li>`,
  };
})();
