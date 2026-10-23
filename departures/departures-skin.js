/* "Departures" skin for the shared site script (js/main.js) and map (js/map.js).
   Load BEFORE main.js. Egg ids are unchanged, so progress carries across designs. */
(() => {
  'use strict';
  const P = '/departures/', H = '/';

  // The departures list. Desktop shows city + carrier; phones show carrier only.
  window.DEP_FLIGHTS = [
    { time: '2019', city: 'HOLLYWOOD', carrier: 'TEA & COFFEE EXCH', short: 'TEA & COFFEE', status: 'DEPARTED', via: 'BARISTA  JUL-AUG 2019', viaS: 'BARISTA' },
    { time: '2022', city: 'WESTWOOD', carrier: 'DIDDY RIESE', short: 'DIDDY RIESE', status: 'DEPARTED', via: 'FOOD SERVER  MAY-JUN 2022', viaS: 'FOOD SERVER' },
    { time: '2022', city: 'SYRACUSE NY', carrier: 'BARNES CENTER', short: 'BARNES CTR', status: 'DEPARTED', via: 'GUEST SERVICES  AUG 2022-MAY 2025', viaS: 'GUEST SERVICES' },
    { time: '2024', city: 'CALABASAS', carrier: 'PLANETART', short: 'PLANETART', status: 'DEPARTED', via: 'DATA SCIENCE ANALYST INTERN  JUN-AUG 2024', viaS: 'DATA SCIENCE INTERN' },
    { time: '2025', city: 'SYRACUSE NY', carrier: 'SYRACUSE UNIV', short: 'SYRACUSE U.', status: 'LANDED', tone: 'green', via: "B.S. COMPUTER SCIENCE · CUM LAUDE  MAY 2025", viaS: 'B.S. COMP. SCI CUM LAUDE' },
    { time: '2025', city: 'SANTA MONICA', carrier: 'XYZ', short: 'XYZ', status: 'ON TIME', tone: 'amber', now: true, via: 'ASSISTANT CHIEF OF STAFF  SINCE OCT 2025', viaS: 'ASSISTANT CHIEF OF STAFF' },
  ];

  window.AM_SKIN = {
    homePaths: ['/', '/index.html'],
    termTitle: 'GATE AGENT · AM 2332',
    prompt: 'gate-agent>',
    banner: `<span class="c-accent">GATE AGENT CONSOLE · FLIGHT AM 2332 · LAX ⇄ SYR</span>
Good evening. Type <span class="c-gold">help</span> for services, <span class="c-gold">board</span> for the manifest, <span class="c-gold">status</span> for the current flight.
`,
    sudo: `<span class="c-err">PLEASE STEP ASIDE FOR ADDITIONAL SCREENING.</span>
<span class="c-dim">guest is not in the sudoers file. TSA has been notified (it hasn't).</span>`,
    places: {
      '~': H, home: H, '/': H, departures: H,
      map: P + 'map.html', route: P + 'map.html', atlas: P + 'map.html',
      vault: P + 'vault.html', '.vault': P + 'vault.html', 'lost-and-found': P + 'vault.html', lostandfound: P + 'vault.html',
      flapdle: P + 'flapdle.html', wordle: P + 'flapdle.html', tower: P + 'tower.html', atc: P + 'tower.html', 'carry-on': P + 'carry-on.html', carryon: P + 'carry-on.html', arcade: P + 'flapdle.html',
      about: H + '#info', info: H + '#info', projects: H + '#gates', gates: H + '#gates', work: H + '#gates',
      experience: H + '#departures', path: H + '#departures', board: H + '#departures', contact: H + '#pass', pass: H + '#pass',
      play: '/404.html', cancelled: P + 'cancelled.html', luggage: P + 'luggage.html', v2: '/v2/',
    },
    palettes: { party: ['#ffcd00', '#ffb000', '#f2eee3', '#111111', '#36d07a'] },
    eggs: {
      terminal:  { icon: '🎧', name: 'Gate agent',          hint: 'The key under Esc pages the gate agent.' },
      sudo:      { icon: '🛂', name: 'Additional screening', hint: 'At the gate, ask for more clearance than you have.' },
      konami:    { icon: '💜', name: 'Showtime livery',      hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
      otto:      { icon: '🍊', name: 'Connecting via SYR',   hint: 'Type the name of a certain citrus mascot. Anywhere.' },
      logo:      { icon: '🛬', name: 'Holding pattern',      hint: 'Tap the AM tag in the corner five times, quickly.' },
      mamba:     { icon: '💺', name: 'Seat 24A',             hint: 'Your boarding pass has a seat. Tap it 8 times. Or 24.' },
      courtside: { icon: '🏟️', name: 'Courtside',            hint: 'On the route map, zoom way, way into downtown LA.' },
      lost:      { icon: '❌', name: 'Flight cancelled',     hint: "Try to board a flight that doesn't exist." },
      hoops:     { icon: '🏀', name: 'Buckets',              hint: 'Hit 5 in a row on the original court (/404.html).' },
      forgotten: { icon: '🧳', name: 'Unclaimed baggage',    hint: 'Some old luggage never got picked up. Check the footer.' },
      console:   { icon: '📦', name: 'Black box',            hint: 'Open the developer console and say hi.' },
      nightowl:  { icon: '🌙', name: 'Red-eye',              hint: 'Fly between 12 and 5am PT.' },
      vault:     { icon: '🔎', name: 'Lost & found',         hint: "You're standing at the Lost & Found desk." },
      flapdle:   { icon: '🔤', name: 'Word on the board',    hint: 'The clock on the big board takes word requests. Solve one.' },
      tower:     { icon: '🗼', name: 'Cleared to land',      hint: 'Catch the plane flying the route. Then land 10 in one shift.' },
      carryon:   { icon: '💼', name: 'Fits in the overhead', hint: 'Scan the barcode on your boarding pass. Then pack six bags.' },
    },
    toastEgg: (egg, n, total) => `<span>Attention passenger: you found <b>${egg.name}</b>. ${n} of ${total} items claimed at Lost &amp; Found.</span>`,
    commands: {
      board: {
        desc: 'the departures manifest',
        run(args, t) {
          t.print(window.DEP_FLIGHTS.map((f) => `${f.time}  ${f.city.padEnd(13)}${f.carrier.padEnd(19)}<span class="c-gold">${f.status}</span>\n      <span class="c-dim">${f.via}</span>`).join('\n'));
        },
      },
      status: {
        desc: 'current flight status',
        run(args, t) { t.print('FLIGHT AM 2332 · <span class="c-gold">ON TIME</span>\nASSISTANT CHIEF OF STAFF · XYZ · SANTA MONICA, CA\nDEPARTED SYRACUSE MAY 2025 · CRUISING SINCE OCT 2025'); },
      },
      announce: {
        desc: 'make an announcement',
        run(args, t) { const msg = t.esc(args.join(' ') || 'Now boarding all rows.'); window.AM.toast(`<span><b>PA</b> ${msg}</span>`); t.print('announced.'); },
      },
    },
  };

  window.AM_MAP_SKIN = {
    pin: (emoji, cls, i) => (i === null ? emoji : `<span>${i + 1}</span>`),
    chapter: (p, i, esc) => `
      <li><button class="chapter" data-id="${p.id}">
        <span class="k">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(p.title)}</span><span class="w">${esc(p.when)}</span>
      </button></li>`,
  };
})();
