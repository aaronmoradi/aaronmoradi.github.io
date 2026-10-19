/* "Rev." skin for the shared site script (js/main.js) and map (js/map.js).
   Load BEFORE main.js. Egg ids are unchanged, so progress carries across designs. */
(() => {
  'use strict';
  const R = '/rev/';
  let LOG = null;
  window.REV_LOG = () => LOG || (LOG = fetch('/rev/data/log.json').then((r) => r.json()));
  const fmt = (t) => t.replace('T', ' ');

  window.AM_SKIN = {
    homePaths: [R, R + 'index.html'],
    termTitle: 'TELETYPE · aaronmoradi.com',
    prompt: 'aaron@rev:~$',
    banner: `<span class="c-accent">TELETYPE CONNECTED. Every line of this site has a receipt.</span>
Type <span class="c-gold">help</span>, or try <span class="c-gold">git log</span>, <span class="c-gold">git blame aaron</span>, <span class="c-gold">diff v1 v3</span>, <span class="c-gold">git revert</span>.
`,
    sudo: `[sudo] password for guest: ********
<span class="c-err">aaron is not in the sudoers file. This incident will be reported.</span>
<span class="c-dim">(logged locally: ${new Date().toLocaleString('en-US')})</span>`,
    places: {
      '~': R, home: R, '/': R, rev: R,
      log: R + 'log.html', changelog: R + 'log.html', versions: R + 'versions.html', archive: R + 'versions.html',
      map: R + 'map.html', survey: R + 'map.html', atlas: R + 'map.html',
      vault: R + 'vault.html', '.vault': R + 'vault.html', crib: R + 'vault.html',
      about: R + '#about', projects: R + '#cases', work: R + '#cases', experience: R + '#timesheet', path: R + '#timesheet', contact: R + '#contact',
      play: R + 'scrap.html', scrap: R + 'scrap.html', exhibit: R + 'exhibit0.html', v2: '/',
    },
    palettes: { party: ['#2a2a28', '#c42b1c', '#f76900', '#eaf0e1', '#9cc3e6'] },
    eggs: {
      terminal:  { icon: '⌨️', name: 'Teletype',            hint: 'The key under Esc connects the teletype.' },
      sudo:      { icon: '🧾', name: 'Incident reported',   hint: 'On the teletype, ask for more power than you have.' },
      konami:    { icon: '🏀', name: 'Box score',           hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
      otto:      { icon: '🍊', name: 'Orange highlighter',  hint: 'Type the name of a certain citrus mascot. Anywhere.' },
      logo:      { icon: '✍️', name: 'Re-signed',           hint: 'Be impatient with the signature in the corner.' },
      mamba:     { icon: '🐍', name: '8 & 24',              hint: 'On the title sheet, the hours ring answers to 8 taps on "24h". Or 24.' },
      courtside: { icon: '🏟️', name: 'Courtside',           hint: 'In the field survey, zoom way, way into downtown LA.' },
      lost:      { icon: '🗑️', name: 'Scrap bin',           hint: "Ask for a sheet that was never drawn." },
      hoops:     { icon: '🎯', name: 'Nothing but bin',     hint: 'Five drafts in a row into the scrap bin.' },
      forgotten: { icon: '📎', name: 'Exhibit 0',           hint: 'The very first About page is in the archive.' },
      console:   { icon: '🛠️', name: 'First commit',        hint: 'Open the developer console and say hi.' },
      nightowl:  { icon: '🌙', name: 'After hours',         hint: 'Visit between 12 and 5am PT, like the commits did.' },
      vault:     { icon: '🔧', name: 'Tool crib',           hint: "You're at the tool crib window now." },
    },
    toastEgg: (egg, n, total) => `<span class="stampd">CHECKED OUT</span>${egg.icon} <b>${egg.name}</b> · ${n}/${total}`,
    commands: {
      git: {
        desc: 'git log | git blame aaron | git revert',
        run(args, t) {
          const sub = args[0];
          if (sub === 'log') {
            t.print('<span class="c-dim">fetching history…</span>');
            window.REV_LOG().then(({ commits, stats }) => {
              const rows = commits.slice(-15).reverse().map((c) => `<span class="c-gold">${c.h}</span>  ${fmt(c.t)}  ${t.esc(c.s)}${c.by === 'claude' ? ' <span class="c-dim">(with Claude)</span>' : ''}`);
              t.print(rows.join('\n') + `\n<span class="c-dim">… ${stats.total - 15} more. cd log for the full ledger.</span>`);
            }).catch(() => t.print('git: could not read the log', 'c-err'));
          } else if (sub === 'blame') {
            t.print(`<span class="c-gold">89725c6</span> (Aaron Moradi 2025-09-06 00:46) Born and raised in Los Angeles.
<span class="c-gold">60f8306</span> (Aaron Moradi 2025-09-06 01:35) This is my about page test
<span class="c-gold">-------</span> (Syracuse Univ. 2025-05)           B.S. Computer Science, cum laude
<span class="c-gold">-------</span> (XYZ          2025-10)           Assistant Chief of Staff, Santa Monica
<span class="c-dim">every line above is Aaron's. blame accordingly.</span>`);
          } else if (sub === 'revert') {
            t.closeTerminal();
            const f = document.createElement('div');
            f.className = 'revert-flash';
            f.style.backgroundImage = 'url(/rev/img/v1.jpg)';
            f.innerHTML = '<span>reverted to v1 · restoring in 10s</span>';
            document.body.appendChild(f);
            setTimeout(() => f.remove(), 10000);
            f.addEventListener('click', () => f.remove());
          } else if (sub === 'status') {
            t.print('On branch main\nnothing to commit, working tree clean (for once)');
          } else {
            t.print('usage: git log | git blame aaron | git revert | git status');
          }
        },
      },
      diff: {
        desc: 'diff v1 v3',
        run(args, t) {
          t.print(`--- v1 (2025-09-06 → 2026-10-09)
+++ v3 (this notebook)
<span class="c-err">- Hello World! My name is Aaron Moradi and I am a...</span>
<span class="c-err">- [typing effect] Web Developer / Creative Thinker / Problem Solver</span>
+ The build log: every commit kept, timestamps and all.
+ /log  /versions  /map  /scrap
<span class="c-dim">→ cd versions to compare them side by side</span>`);
        },
      },
    },
  };

  window.AM_MAP_SKIN = {
    pin: (emoji, cls, i) => (i === null ? emoji : `<span>${i + 1}</span>`),
    chapter: (p, i, esc) => `
      <li><button class="chapter" data-id="${p.id}">
        <span class="k">FN-${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(p.title)}</span><span class="w">${esc(p.when)}</span>
      </button></li>`,
  };
})();
