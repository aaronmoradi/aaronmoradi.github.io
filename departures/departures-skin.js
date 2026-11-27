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
    { time: '2025', city: 'SYRACUSE NY', carrier: 'SYRACUSE UNIV', short: 'SYRACUSE U.', status: 'LANDED', tone: 'green', via: "B.S. CS · MINOR ENG & CS MGMT · CUM LAUDE", viaS: 'B.S. CS · ENG & CS MGMT' },
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
      flapdle: P + 'flapdle.html', wordle: P + 'flapdle.html', tower: P + 'tower.html', atc: P + 'tower.html', 'carry-on': P + 'carry-on.html', carryon: P + 'carry-on.html', arcade: '/lounge/', lounge: '/lounge/', games: '/lounge/', upgrade: '/lounge/upgrade.html', courtside: '/lounge/courtside.html', turbulence: '/lounge/turbulence.html',
      about: H + '#info', info: H + '#info', projects: H + '#gates', gates: H + '#gates', work: H + '#gates',
      experience: H + '#departures', path: H + '#departures', board: H + '#departures', contact: H + '#pass', pass: H + '#pass',
      play: '/lounge/courtside.html', cancelled: P + 'cancelled.html', luggage: P + 'luggage.html', v2: '/v2/',
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
      hoops:     { icon: '🏀', name: 'Buckets',              hint: 'In the Lounge, make 5 in a row on the Courtside court.' },
      forgotten: { icon: '🧳', name: 'Unclaimed baggage',    hint: 'Some old luggage never got picked up. Check the footer.' },
      console:   { icon: '📦', name: 'Black box',            hint: 'Open the developer console and say hi.' },
      nightowl:  { icon: '🌙', name: 'Red-eye',              hint: 'Fly between 12 and 5am PT.' },
      vault:     { icon: '🔎', name: 'Lost & found',         hint: "You're standing at the Lost & Found desk." },
      flapdle:   { icon: '🔤', name: 'Word on the board',    hint: 'The clock on the big board takes word requests. Solve one.' },
      tower:     { icon: '🗼', name: 'Cleared to land',      hint: 'Catch the plane flying the route. Then land 10 in one shift.' },
      carryon:   { icon: '💼', name: 'Fits in the overhead', hint: 'Scan the barcode on your boarding pass. Then pack six bags.' },
      lounge:    { icon: '🛋️', name: 'Lounge access',        hint: 'Read the small print on your boarding pass stub.' },
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
      spongebob: {
        desc: 'theme mode: Bikini Bottom (spongebob off to leave)',
        run(args, t) {
          const on = args[0] === 'on' || (args[0] !== 'off' && !bikini.on());
          bikini.set(on);
          t.print(on ? bikini.banner : '<span class="c-dim">Surfacing… back at Gate A1. Type spongebob any time to dive again.</span>');
        },
      },
      order: {
        hidden: true,
        run(args, t) {
          if (!bikini.on()) return t.print('<span class="c-dim">The kitchen is closed at this gate. (Try spongebob first.)</span>');
          const n = Math.max(1, Math.min(9, parseInt(args[0], 10) || 1));
          t.print(`<span class="c-gold">ORDER UP!</span>  ${n} × patty on a bun
<span class="c-dim">----------------------------</span>
  bun · patty · lettuce
  cheese · onions · pickles
  tomatoes · bun
  secret formula .. <span class="c-gold">[REDACTED]</span>
<span class="c-dim">----------------------------</span>
  total ............... $${(n * 2.99).toFixed(2)}
<span class="c-dim">Served with a smile.</span>`);
        },
      },
      jellyfish: {
        hidden: true,
        run(args, t) {
          if (!bikini.on()) return t.print('<span class="c-dim">No jellyfish fields near the gate. (Try spongebob first.)</span>');
          bikini.jellies(8);
          t.print('<span class="c-gold">🪼 jellyfishing!</span> <span class="c-dim">catch-and-release only.</span>');
        },
      },
      ready: {
        hidden: true,
        run(args, t) { t.print(bikini.on() ? '<span class="c-gold">I\'m ready! I\'m ready! I\'m ready!</span>' : 'ready for what? <span class="c-dim">(spongebob)</span>'); },
      },
    },
  };

  /* ---------- Bikini Bottom: a theme mode for the gate agent terminal ---------- */
  const bikini = {
    key: 'am_bikini',
    on() { return window.AM.store.get(this.key) === '1'; },
    term() { return document.querySelector('.term'); },
    banner: `<span class="c-gold">        \\|//
       \\\\|///
      .-'''''-.
     /  #  #   \\      BIKINI BOTTOM TERMINAL
    |  #  #  #  |     you are now 2,000 ft below Gate A1
    |   #  #  # |
     \\  #  #  /      try: <b>order</b> · <b>jellyfish</b> · <b>ready</b>
      '-.....-'       <b>spongebob off</b> to surface</span>`,
    set(on) {
      window.AM.store.set(this.key, on ? '1' : '0');
      this.apply();
    },
    apply() {
      const el = this.term();
      if (!el) return;
      const on = this.on();
      el.classList.toggle('bb', on);
      el.querySelector('.term-bar span').textContent = on ? 'BIKINI BOTTOM · KRUSTY KRAB TERMINAL' : 'GATE AGENT · AM 2332';
      window.AM.setPrompt(on ? 'krusty-krab>' : 'gate-agent>');
    },
    jellies(n) {
      const el = this.term();
      for (let i = 0; i < n; i++) {
        const j = document.createElement('span');
        j.className = 'bb-jelly';
        j.textContent = '🪼';
        j.style.left = 5 + Math.random() * 85 + '%';
        j.style.animationDelay = i * 0.25 + 's';
        el.appendChild(j);
        j.addEventListener('animationend', () => j.remove());
      }
    },
  };
  // the mode sticks between visits: re-apply whenever the terminal is built
  addEventListener('am:term', () => bikini.apply());

  window.AM_MAP_SKIN = {
    pin: (emoji, cls, i) => (i === null ? emoji : `<span>${i + 1}</span>`),
    chapter: (p, i, esc) => `
      <li><button class="chapter" data-id="${p.id}">
        <span class="k">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(p.title)}</span><span class="w">${esc(p.when)}</span>
      </button></li>`,
  };
})();
