/* AM-001 skin for the shared site script (js/main.js) and map (js/map.js).
   Load BEFORE main.js. Egg ids are unchanged, so progress carries across designs. */
(() => {
  'use strict';
  const D = '/spec/';

  // Record of service. One line colour per chapter; dates are month-precise.
  window.SPEC_SERVICE = [
    { id: 'S.1', role: 'Barista', org: 'Tea & Coffee Exchange', loc: 'Hollywood, CA', from: '2019-07', to: '2019-08', line: 'la' },
    { id: 'S.2', role: 'Food Server', org: 'Diddy Riese Cookies', loc: 'Westwood, Los Angeles', from: '2022-05', to: '2022-06', line: 'la' },
    { id: 'S.3', role: 'Guest Services', org: 'Barnes Center at The Arch', loc: 'Syracuse, NY', from: '2022-08', to: '2025-05', line: 'syr' },
    { id: 'S.4', role: 'Data Science Analyst Intern', org: 'PlanetArt', loc: 'Calabasas, CA', from: '2024-06', to: '2024-08', line: 'pa' },
    { id: 'S.5', role: 'Assistant Chief of Staff', org: 'XYZ', loc: 'Santa Monica, CA', from: '2025-10', to: null, line: 'xyz' },
  ];
  window.SPEC_MONTHS = (from, to) => {
    const [y1, m1] = from.split('-').map(Number);
    const n = new Date();
    const [y2, m2] = to ? to.split('-').map(Number) : [n.getFullYear(), n.getMonth() + 1];
    return (y2 - y1) * 12 + (m2 - m1) + 1;
  };

  const code = (i) => 'E.' + String(i).padStart(2, '0');
  window.AM_SKIN = {
    homePaths: [D, D + 'index.html'],
    termTitle: 'TTY0 · AM-001',
    prompt: 'tty0>',
    banner: `<span class="c-accent">AM-001 · SPECIFICATION FOR A PERSON · REV 2026.10</span>
Console attached. Type <span class="c-gold">help</span> for commands, <span class="c-gold">man aaron</span> for the manual page.
<span class="c-dim">Press G anywhere to show the 12-column grid.</span>
`,
    sudo: `<span class="c-err">ECN REJECTED.</span> Requested privilege level exceeds clearance.
<span class="c-dim">guest is not in the sudoers file. Nonconformance logged.</span>`,
    places: {
      '~': D, home: D, '/': D, spec: D, 'sheet1': D,
      map: D + 'map.html', route: D + 'map.html', 'sheet2': D + 'map.html',
      vault: D + 'vault.html', '.vault': D + 'vault.html', appendix: D + 'vault.html', checklist: D + 'vault.html',
      about: D + '#s1', ident: D + '#s1', assignment: D + '#s2', experience: D + '#s3', service: D + '#s3', path: D + '#s3',
      projects: D + '#s4', work: D + '#s4', measurements: D + '#s5', contact: D + '#s6',
      play: D + 'ncr.html', ncr: D + 'ncr.html', rev0: D + 'rev0.html', v2: '/',
    },
    palettes: { party: ['#552583', '#f76900', '#1f7a74', '#141414', '#d0261c'] },
    eggs: {
      terminal:  { icon: code(1),  name: 'Console attached',      hint: 'Attach a console: the key under Esc.' },
      sudo:      { icon: code(2),  name: 'Privilege escalation',  hint: 'At the console, request a privilege level you do not hold.' },
      konami:    { icon: code(3),  name: 'Re-issue: purple & gold', hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
      otto:      { icon: code(4),  name: 'Fig. O.1',              hint: 'Type the name of a certain citrus mascot. Anywhere.' },
      logo:      { icon: code(5),  name: 'Rotation test',         hint: 'Actuate the registration mark five times, quickly.' },
      mamba:     { icon: code(6),  name: 'Footnote 24',           hint: 'Footnote 24 responds to eight actuations. Or twenty-four.' },
      courtside: { icon: code(7),  name: 'Two more stations',     hint: 'On Sheet 2, zoom the geographic view far into downtown LA.' },
      lost:      { icon: code(8),  name: 'Nonconformance',        hint: 'Request a sheet that was never drawn.' },
      hoops:     { icon: code(9),  name: 'Within tolerance',      hint: 'Five consecutive passing shots on the NCR range.' },
      forgotten: { icon: code(10), name: 'Superseded draft',      hint: 'Rev. 0 still exists. Check the revision block.' },
      console:   { icon: code(11), name: 'Debug output',          hint: 'Open the developer console and say hi.' },
      nightowl:  { icon: code(12), name: 'Third shift',           hint: 'Inspect between 00:00 and 05:00 PT.' },
      vault:     { icon: code(13), name: 'Appendix E',            hint: 'You are reading Appendix E.' },
    },
    toastEgg: (egg, n, total) => `<span class="ecn">ECN-${String(n).padStart(2, '0')} filed</span>${egg.icon} <b>${egg.name}</b> · ${n}/${total} items inspected`,
    commands: {
      man: {
        desc: 'manual page (try: man aaron)',
        run(args, t) {
          if (args[0] !== 'aaron') return t.print('What manual page do you want? Try <span class="c-gold">man aaron</span>.');
          t.print(`AARON(1)                 People Manual                 AARON(1)

<span class="c-gold">NAME</span>
       aaron - Moradi, Aaron. Assistant Chief of Staff.

<span class="c-gold">SYNOPSIS</span>
       aaron [--from los-angeles] [--via syracuse] [--at xyz]

<span class="c-gold">DESCRIPTION</span>
       Born and raised in Los Angeles. B.S. Computer Science,
       Syracuse University, May 2025, cum laude; minor in
       Engineering &amp; Computer Science Management. Assistant
       Chief of Staff at XYZ, Santa Monica, since October 2025.

<span class="c-gold">OPTIONS</span>
       --professional  --creative  --determined  --personable

<span class="c-gold">SEE ALSO</span>
       resume(pdf), linkedin(1), github(1), rev0(7)`);
        },
      },
      diff: {
        desc: 'diff rev0 rev1',
        run(args, t) {
          t.print(`--- about.html  (rev 0, 2025-09-06 01:35 PT)
+++ /spec/      (rev 2026.10)
<span class="c-err">-This is my about page test</span>
<span class="c-err">-I completely forgot about this...</span>
+1.0 Identification  2.0 Current assignment  3.0 Record of service
+4.0 Projects  5.0 Measurements  6.0 Contact
<span class="c-dim">→ open rev0 to inspect the superseded draft</span>`);
        },
      },
      service: {
        desc: 'record of service',
        run(args, t) {
          t.print(window.SPEC_SERVICE.map((s) => `${s.id}  ${s.from} → ${s.to || 'present'}  ${String(window.SPEC_MONTHS(s.from, s.to)).padStart(3)} mo  ${s.role}, ${s.org}`).join('\n'));
        },
      },
      grid: { desc: 'toggle the 12-column grid', run(args, t) { document.documentElement.classList.toggle('show-grid'); t.print('grid ' + (document.documentElement.classList.contains('show-grid') ? 'shown' : 'hidden')); } },
    },
  };

  window.AM_MAP_SKIN = {
    pin: (emoji, cls, i) => (i === null ? emoji : `<span>${i + 1}</span>`),
    chapter: (p, i, esc) => `
      <li><button class="chapter" data-id="${p.id}">
        <span class="k">ST.${i + 1}</span><span class="t">${esc(p.title)}</span><span class="w">${esc(p.when)}</span>
      </button></li>`,
  };
})();
