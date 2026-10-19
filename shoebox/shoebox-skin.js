/* "The Shoebox" skin for the shared site script (js/main.js) and map (js/map.js).
   Load BEFORE main.js. Egg ids are unchanged, so progress carries across designs. */
(() => {
  'use strict';
  const B = '/shoebox/';

  // The trail of real jobs, oldest first. Drives the receipts and the printout.
  window.SB_TRAIL = [
    { when: 'Summer 2019', place: 'Tea & Coffee Exchange', city: 'Hollywood, CA', role: 'Barista', note: 'first job!' },
    { when: 'May – Jun 2022', place: 'Diddy Riese Cookies', city: 'Westwood, Los Angeles', role: 'Food Server' },
    { when: 'Aug 2022 – May 2025', place: 'Barnes Center at The Arch', city: 'Syracuse, NY', role: 'Guest Services' },
    { when: 'Jun – Aug 2024', place: 'PlanetArt', city: 'Calabasas, CA', role: 'Data Science Analyst Intern' },
    { when: 'May 2025', place: 'Syracuse University', city: 'Syracuse, NY', role: 'B.S. Computer Science, cum laude' },
    { when: 'Oct 2025 – now', place: 'XYZ', city: 'Santa Monica, CA', role: 'Assistant Chief of Staff' },
  ];

  window.AM_SKIN = {
    homePaths: [B, B + 'index.html'],
    termTitle: 'P R I N T O U T',
    prompt: 'aaron@shoebox:~$',
    banner: `<span class="c-accent">*** AARONMORADI.COM / THE SHOEBOX ***</span>
<span class="c-dim">continuous-feed edition · tear along the perforation</span>

Type <span class="c-gold">help</span> for the full list. Try <span class="c-gold">receipts</span> or <span class="c-gold">letter</span>.
`,
    sudo: `<span class="stamped">ACCESS DENIED</span>
<span class="c-dim">guest is not in the sudoers file. This incident has been glued into the scrapbook.</span>`,
    places: {
      '~': B, home: B, '/': B, shoebox: B,
      map: B + 'map.html', corkboard: B + 'map.html', atlas: B + 'map.html',
      vault: B + 'vault.html', '.vault': B + 'vault.html', stickers: B + 'vault.html', 'sticker-book': B + 'vault.html',
      about: B + '#letter', letter: B + '#letter', projects: B + '#folders', work: B + '#folders', folders: B + '#folders',
      experience: B + '#trail', path: B + '#trail', receipts: B + '#trail', contact: B + '#postcard', postcard: B + '#postcard',
      play: B + 'torn.html', torn: B + 'torn.html', pressed: B + 'pressed.html', notebook: B + 'pressed.html',
      program: '/program/', v2: '/',
    },
    palettes: { party: ['#fdfbf6', '#f7e27c', '#c9a57a', '#23336b', '#c2362b', '#fbd3c4'] },
    eggs: {
      terminal:  { icon: '🖨️', name: 'Fresh off the printer', hint: 'The key under Esc feeds the printer.' },
      sudo:      { icon: '🟥', name: 'Access denied',          hint: 'On the printout, ask for more power than you have.' },
      konami:    { icon: '🖍️', name: 'Showtime',               hint: '↑ ↑ ↓ ↓ ← → ← → B A (bring a highlighter)' },
      otto:      { icon: '🍊', name: 'Otto sticker',           hint: 'Type the name of a certain citrus mascot. Anywhere.' },
      logo:      { icon: '✍️', name: 'Signature move',         hint: 'Be very impatient with my signature.' },
      mamba:     { icon: '🐍', name: '8 & 24',                 hint: 'The "Est. L.A." sticker wants 8 taps. Or 24.' },
      courtside: { icon: '🎟️', name: 'Ticket stubs',           hint: 'On the corkboard, zoom way, way into downtown LA.' },
      lost:      { icon: '📄', name: 'Torn out',               hint: "Find the page someone ripped out (it doesn't exist)." },
      hoops:     { icon: '🗑️', name: 'Wastebasket pro',        hint: 'Sink 5 crumpled drafts in a row on the torn-out page.' },
      forgotten: { icon: '🍂', name: 'Pressed between pages',  hint: 'Something old is pressed between the pages. Read the inside back cover.' },
      console:   { icon: '🛠️', name: 'Notes in the margin',    hint: 'Open the developer console and say hi.' },
      nightowl:  { icon: '🦉', name: 'Desk lamp',              hint: 'Visit while LA is asleep (12–5am PT).' },
      vault:     { icon: '⭐', name: 'Sticker book',           hint: "You're flipping through it right now." },
    },
    toastEgg: (egg, n, total) => `${egg.icon} found one: <b>${egg.name}</b><small>sticker ${n} of ${total} → sticker book</small>`,
    commands: {
      receipts: {
        desc: 'every job, printed',
        run(args, t) {
          t.print(window.SB_TRAIL.map((j) => `${j.when.toUpperCase().padEnd(22)}${j.place.toUpperCase()}\n${' '.repeat(22)}<span class="c-dim">${j.role}, ${j.city}</span>`).join('\n') +
            `\n<span class="c-dim">----------------------------------------</span>\n<span class="c-gold">TOTAL: still going. KEEP THIS RECEIPT.</span>`);
        },
      },
      letter: {
        desc: 'read the letter',
        run(args, t) {
          t.print(`Hi,

I love improving people's lives by building things that matter
and supporting the people who need it.

Born and raised in Los Angeles. Syracuse '25. Now Assistant
Chief of Staff at XYZ in Santa Monica. Basketball, music, art.

<span class="c-gold">- Aaron</span>`);
        },
      },
      tear: { hidden: true, run(args, t) { t.print('<span class="c-dim">- - - - - - - - - - - ✂ - - - - - - - - - - -</span>\nRiiiip. You keep the top half.'); } },
    },
  };

  window.AM_MAP_SKIN = {
    pin: (emoji, cls, i) => (i === null ? emoji : `<span>${i + 1}</span>`),
    chapter: (p, i, esc) => `
      <li><button class="chapter" data-id="${p.id}" style="--r:${[-2, 1.5, -1, 2, -1.5, 1][i % 6]}deg">
        <span class="n">${i + 1}</span>
        <span class="t">${esc(p.title)}</span>
        <span class="w">${esc(p.when)}</span>
      </button></li>`,
  };
})();
