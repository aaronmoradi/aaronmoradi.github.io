/* ==========================================================================
   aaronmoradi.com — shared site script
   Theme, nav, reveal-on-scroll, confetti, the terminal, and every easter egg.
   If you're reading this: hi. Try aaron.hi() in the console.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* private mode */ } },
  };

  /* ---------------------------------------------------------------------- */
  /* Easter egg registry                                                     */
  /* ---------------------------------------------------------------------- */
  const EGGS = [
    { id: 'terminal',  icon: '⌨️', name: "I'm in",               hint: 'Press the key that lives under Esc.' },
    { id: 'sudo',      icon: '🔐', name: 'Nice try',             hint: 'In the terminal, ask for more power than you have.' },
    { id: 'konami',    icon: '🎮', name: 'Showtime',             hint: '↑ ↑ ↓ ↓ ← → ← → B A' },
    { id: 'otto',      icon: '🍊', name: "Let's go Orange",      hint: 'Type the name of a certain citrus mascot. Anywhere.' },
    { id: 'logo',      icon: '🌀', name: 'Do a barrel roll',     hint: 'Be very impatient with the logo.' },
    { id: 'mamba',     icon: '🐍', name: 'Mamba mentality',      hint: 'The sticker on the homepage wants 8 taps. Or 24.' },
    { id: 'courtside', icon: '🏟️', name: 'Courtside seats',      hint: 'On the map, zoom way, way into downtown LA.' },
    { id: 'lost',      icon: '🧭', name: 'Lost in the sauce',    hint: "Go somewhere that doesn't exist." },
    { id: 'hoops',     icon: '🏀', name: 'Buckets',              hint: 'Hit 5 in a row where the lost people go.' },
    { id: 'forgotten', icon: '🕸️', name: 'The forgotten page',   hint: 'Every site has an /about page. Mine forgot about it.' },
    { id: 'console',   icon: '🛠️', name: 'View-source energy',   hint: 'Open the developer console and say hi.' },
    { id: 'nightowl',  icon: '🦉', name: 'Night owl',            hint: 'Visit while Los Angeles is asleep (12–5am PT).' },
    { id: 'vault',     icon: '🗝️', name: 'Vault dweller',        hint: "You're here, aren't you?" },
  ];
  const EGG_KEY = 'am_eggs';

  function foundEggs() {
    try { return new Set(JSON.parse(store.get(EGG_KEY, '[]'))); } catch { return new Set(); }
  }

  function findEgg(id, { quiet = false } = {}) {
    const egg = EGGS.find((e) => e.id === id);
    if (!egg) return false;
    const found = foundEggs();
    if (found.has(id)) return false;
    found.add(id);
    store.set(EGG_KEY, JSON.stringify([...found]));
    updateEggMeters();
    if (!quiet) {
      toast(`${egg.icon} Easter egg found: <b>${esc(egg.name)}</b> &nbsp;(${found.size}/${EGGS.length})`);
      confetti('party', 60);
    }
    if (found.size === EGGS.length) {
      setTimeout(() => {
        toast('🏆 You found every single egg. Legend. Go visit the vault.');
        confetti('party', 220);
      }, 1600);
    }
    dispatchEvent(new CustomEvent('am:egg', { detail: id }));
    return true;
  }

  function resetEggs() {
    store.del(EGG_KEY);
    updateEggMeters();
  }

  function updateEggMeters() {
    const n = foundEggs().size;
    $$('[data-egg-meter]').forEach((el) => {
      el.textContent = `🥚 ${n}/${EGGS.length} eggs found`;
      el.hidden = n === 0;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Toasts & confetti                                                       */
  /* ---------------------------------------------------------------------- */
  function toast(html, ms = 4200) {
    let stack = $('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    stack.appendChild(t);
    setTimeout(() => {
      t.classList.add('out');
      t.addEventListener('animationend', () => t.remove(), { once: true });
    }, ms);
  }

  const PALETTES = {
    lakers: ['#552583', '#fdb927'],
    dodgers: ['#005a9c', '#ffffff', '#ef3e42'],
    orange: ['#f76900', '#ff9a3c', '#ffffff', '#000e54'],
    party: ['#f2541b', '#5b2bd6', '#fdb927', '#1658c7', '#28c840'],
  };

  function confetti(kind = 'party', n = 120) {
    const colors = PALETTES[kind] || PALETTES.party;
    if (reduceMotion) n = Math.min(n, 24);
    let box = $('#confetti-container');
    if (!box) {
      box = document.createElement('div');
      box.id = 'confetti-container';
      document.body.appendChild(box);
    }
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      const size = 5 + Math.random() * 9;
      c.style.left = Math.random() * 100 + 'vw';
      c.style.width = size + 'px';
      c.style.height = size * (0.4 + Math.random()) + 'px';
      c.style.background = colors[(Math.random() * colors.length) | 0];
      c.style.animationDuration = 2 + Math.random() * 3 + 's';
      c.style.animationDelay = Math.random() * 0.5 + 's';
      c.style.setProperty('--spin', (Math.random() * 1440 - 720) + 'deg');
      if (Math.random() > 0.6) c.style.borderRadius = '50%';
      box.appendChild(c);
      c.addEventListener('animationend', () => c.remove());
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Theme + Showtime                                                        */
  /* ---------------------------------------------------------------------- */
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
  const isDark = () => root.classList.contains('showtime') || currentTheme() === 'dark';
  const announceTheme = () => dispatchEvent(new CustomEvent('am:theme', { detail: { dark: isDark() } }));

  function setTheme(t) {
    root.dataset.theme = t;
    store.set('am_theme', t);
    paintThemeButtons();
    announceTheme();
  }

  function paintThemeButtons() {
    $$('[data-theme-toggle]').forEach((b) => {
      const dark = currentTheme() === 'dark';
      b.textContent = dark ? '☀' : '☾';
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function setShowtime(on) {
    root.classList.toggle('showtime', on);
    if (on) store.set('am_showtime', '1'); else store.del('am_showtime');
    if (on) {
      confetti('lakers', 180);
      toast('💜💛 <b>SHOWTIME</b> — purple & gold mode on. Type <b>showtime</b> in the terminal to turn it off.');
    }
    announceTheme();
  }

  prefersDark.addEventListener?.('change', () => { paintThemeButtons(); announceTheme(); });

  /* ---------------------------------------------------------------------- */
  /* Fun effects                                                             */
  /* ---------------------------------------------------------------------- */
  function barrelRoll() {
    document.body.classList.remove('barrel-roll');
    void document.body.offsetWidth;
    document.body.classList.add('barrel-roll');
    document.body.addEventListener('animationend', () => document.body.classList.remove('barrel-roll'), { once: true });
  }

  function gravity() {
    const els = $$('main h1, main h2, main .tile, main .project, main .timeline li, main .side-card, main .hero-photo, main .map-teaser, main .form, main p, main .btn');
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      el.classList.add('gravity-fall');
      el.style.transform = `translateY(${innerHeight - r.top + 200}px) rotate(${Math.random() * 80 - 40}deg)`;
    });
    setTimeout(() => {
      els.forEach((el) => { el.style.transform = ''; });
      setTimeout(() => els.forEach((el) => el.classList.remove('gravity-fall')), 1500);
      toast('…and back up. Physics is optional around here.');
    }, 3200);
  }

  function matrix(ms = 7000) {
    let c = $('#matrix');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'matrix';
      document.body.appendChild(c);
    }
    const ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const size = 16;
    const cols = Math.ceil(c.width / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const glyphs = 'AARONMORADI0123456789アイウエオカキクケコサシスセソ<>{}/=;';
    c.classList.add('on');
    const start = performance.now();
    (function frame(now) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${size}px JetBrains Mono, monospace`;
      drops.forEach((y, i) => {
        ctx.fillStyle = Math.random() > 0.97 ? '#ffffff' : '#36ff8f';
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, y * size);
        drops[i] = y * size > c.height && Math.random() > 0.975 ? 0 : y + 1;
      });
      if (now - start < ms) requestAnimationFrame(frame);
      else {
        c.classList.remove('on');
        setTimeout(() => ctx.clearRect(0, 0, c.width, c.height), 700);
      }
    })(start);
  }

  function ottoPop() {
    confetti('orange', 160);
    const pop = document.createElement('div');
    pop.className = 'otto-pop';
    pop.innerHTML = '<img src="/assets/img/aaron-otto-1200.jpg" alt="Aaron and Otto the Orange at graduation"><div>LET\'S GO ORANGE 🍊</div>';
    document.body.appendChild(pop);
    setTimeout(() => pop.classList.add('out'), 4200);
    setTimeout(() => pop.remove(), 4900);
    findEgg('otto');
  }

  /* ---------------------------------------------------------------------- */
  /* Keyboard: konami, secret words, terminal hotkey                          */
  /* ---------------------------------------------------------------------- */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let konamiPos = 0;
  let typed = '';
  const WORDS = {
    otto: ottoPop,
    lakers: () => confetti('lakers'),
    dodgers: () => confetti('dodgers'),
    kobe: () => { confetti('lakers', 80); toast('💜💛 Mamba forever.'); },
    hire: () => {
      toast('🤝 Great idea. The contact form is right here.');
      const c = $('#contact');
      if (c) c.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    },
  };

  const isEditable = (el) => el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));

  document.addEventListener('keydown', (e) => {
    const key = (e.key || '').toLowerCase();

    // terminal hotkeys: ` or ~ (outside inputs), or Ctrl/Cmd + K anywhere
    if ((e.metaKey || e.ctrlKey) && key === 'k') { e.preventDefault(); toggleTerminal(); return; }
    if (isEditable(e.target)) return;
    if (key === '`' || key === '~') { e.preventDefault(); toggleTerminal(); return; }

    // konami
    konamiPos = key === KONAMI[konamiPos] ? konamiPos + 1 : (key === KONAMI[0] ? 1 : 0);
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      setShowtime(!root.classList.contains('showtime'));
      findEgg('konami');
    }

    // secret words
    if (key.length === 1 && /[a-z]/.test(key) && !e.metaKey && !e.ctrlKey) {
      typed = (typed + key).slice(-12);
      for (const w of Object.keys(WORDS)) {
        if (typed.endsWith(w)) { typed = ''; WORDS[w](); break; }
      }
    }
  });

  /* ---------------------------------------------------------------------- */
  /* The terminal                                                            */
  /* ---------------------------------------------------------------------- */
  const LINKS = {
    resume: '/assets/AaronMoradiResume.pdf',
    github: 'https://github.com/aaronmoradi',
    linkedin: 'https://www.linkedin.com/in/aaronmoradi/',
    email: 'mailto:aaronmoradi2@gmail.com',
  };
  const PLACES = {
    '~': '/', home: '/', '/': '/', map: '/map.html', atlas: '/map.html',
    vault: '/vault.html', '.vault': '/vault.html',
    about: '/#about', projects: '/#projects', work: '/#projects', experience: '/#path', path: '/#path', contact: '/#contact',
  };

  const T = { built: false, el: null, out: null, input: null, backdrop: null, history: [], hIdx: 0 };

  function buildTerminal() {
    T.backdrop = document.createElement('div');
    T.backdrop.className = 'term-backdrop';
    T.backdrop.addEventListener('click', closeTerminal);
    T.el = document.createElement('div');
    T.el.className = 'term';
    T.el.setAttribute('role', 'dialog');
    T.el.setAttribute('aria-label', 'Terminal');
    T.el.innerHTML = `
      <div class="term-bar"><i title="close"></i><i title="minimize"></i><i title="zoom"></i><span>guest@aaronmoradi.com — zsh</span></div>
      <div class="term-out" aria-live="polite"></div>
      <form class="term-in" autocomplete="off"><label for="term-input">guest@am:~$</label><input id="term-input" spellcheck="false" autocapitalize="off" autocomplete="off"></form>`;
    document.body.append(T.backdrop, T.el);
    T.out = $('.term-out', T.el);
    T.input = $('input', T.el);
    $('.term-bar i', T.el).addEventListener('click', closeTerminal);
    $$('.term-bar i', T.el)[2].addEventListener('click', () => { print('<span class="c-dim">zooming… just kidding.</span>'); barrelRoll(); });
    $('form', T.el).addEventListener('submit', (e) => {
      e.preventDefault();
      const line = T.input.value;
      T.input.value = '';
      run(line);
    });
    T.input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeTerminal(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (T.hIdx > 0) T.input.value = T.history[--T.hIdx] || ''; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); T.hIdx = Math.min(T.history.length, T.hIdx + 1); T.input.value = T.history[T.hIdx] || ''; }
      else if (e.key === 'Tab') {
        e.preventDefault();
        const v = T.input.value.trim();
        const hits = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(v));
        if (hits.length === 1) T.input.value = hits[0] + ' ';
        else if (hits.length > 1) print(`<span class="c-dim">${hits.join('  ')}</span>`);
      }
    });
    T.built = true;
    print(`<span class="c-accent">
   ___    __  ___
  / _ |  /  |/  /   aaronmoradi.com
 / __ | / /|_/ /    v2.0 — rebuilt from scratch
/_/ |_|/_/  /_/</span>
Welcome, guest. Type <span class="c-gold">help</span> to see what you can do.
<span class="c-dim">Tip: ↑/↓ for history, Tab to autocomplete, Esc to close.</span>
`);
  }

  function print(html, cls) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    T.out.appendChild(d);
    T.out.scrollTop = T.out.scrollHeight;
  }

  function openTerminal() {
    if (!T.built) buildTerminal();
    T.backdrop.classList.add('open');
    T.el.classList.add('open');
    setTimeout(() => T.input.focus(), 30);
    findEgg('terminal');
  }
  function closeTerminal() {
    if (!T.built) return;
    T.backdrop.classList.remove('open');
    T.el.classList.remove('open');
    T.input.blur();
  }
  function toggleTerminal() {
    if (T.built && T.el.classList.contains('open')) closeTerminal(); else openTerminal();
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTerminal(); });

  function go(url, newTab = false) {
    print(`<span class="c-dim">→ opening ${esc(url)}</span>`);
    setTimeout(() => {
      if (newTab) window.open(url, '_blank', 'noopener');
      else { closeTerminal(); location.href = url; }
    }, 350);
  }

  function laTime() {
    return new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long', hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' });
  }

  const COMMANDS = {
    help: {
      desc: 'list commands',
      run() {
        const rows = Object.entries(COMMANDS).filter(([, c]) => !c.hidden)
          .map(([k, c]) => `  <span class="c-gold">${k.padEnd(11)}</span>${c.desc}`).join('\n');
        print(rows + '\n<span class="c-dim">…and a few commands that aren\'t on this list.</span>');
      },
    },
    whoami: { desc: 'who are you?', run() { print('guest — but anyone who opens a terminal on a portfolio site is clearly my kind of person.'); } },
    about: {
      desc: 'the short version',
      run() {
        print(`<span class="c-accent">Aaron Moradi</span>
Born & raised in Los Angeles. Syracuse University '25 — B.S. Computer Science, cum laude.
Assistant Chief of Staff at XYZ in Santa Monica.
Off the clock: basketball, music, art. Purple & gold forever.`);
      },
    },
    ls: {
      desc: 'list files',
      run(args) {
        const all = args.some((a) => a.startsWith('-') && a.includes('a'));
        const files = ['about.txt', 'projects/', 'experience/', 'map/', 'resume.pdf', 'contact.txt'];
        const hidden = ['./', '../', '.vault/', '.secrets'];
        print((all ? hidden.map((h) => `<span class="c-dim">${h}</span>`).join('  ') + '  ' : '') + files.join('  '));
      },
    },
    cat: {
      desc: 'read a file',
      run(args) {
        const f = (args[0] || '').replace(/^\.\//, '');
        if (!f) return print('usage: cat &lt;file&gt;');
        if (f === 'about.txt') return COMMANDS.about.run();
        if (f === 'contact.txt') return print(`email    <a href="${LINKS.email}">aaronmoradi2@gmail.com</a>\nlinkedin <a href="${LINKS.linkedin}" target="_blank" rel="noopener">/in/aaronmoradi</a>\ngithub   <a href="${LINKS.github}" target="_blank" rel="noopener">@aaronmoradi</a>`);
        if (f === '.secrets') {
          return print(`<span class="c-gold">.secrets</span>
1. There are ${EGGS.length} easter eggs hidden on this site.
2. Old cheat codes still work.
3. The map has places it doesn't show you right away.
4. Something called <span class="c-accent">.vault</span> keeps score. Try <span class="c-gold">cd .vault</span>`);
        }
        if (f === 'resume.pdf') return go(LINKS.resume, true);
        if (f.endsWith('/')) return print(`cat: ${esc(f)}: Is a directory`, 'c-err');
        print(`cat: ${esc(f)}: No such file`, 'c-err');
      },
    },
    cd: {
      desc: 'go somewhere (home, map, projects, contact…)',
      run(args) {
        const p = (args[0] || '~').replace(/\/$/, '').replace(/^\.\//, '');
        if (PLACES[p]) return go(PLACES[p]);
        if (p === '..') return print('You are already at the top. It\'s nice up here.');
        print(`cd: no such place: ${esc(p)}`, 'c-err');
      },
    },
    open: {
      desc: 'open resume | github | linkedin | email',
      run(args) {
        const t = (args[0] || '').replace(/\/$/, '');
        if (LINKS[t]) return go(LINKS[t], t !== 'email');
        if (PLACES[t]) return go(PLACES[t]);
        print('usage: open resume | github | linkedin | email | map', 'c-dim');
      },
    },
    resume: { desc: 'open my resume', run() { go(LINKS.resume, true); } },
    projects: { desc: 'what I\'ve built', run() { print('01  My Website (you\'re in it)\n02  Comparative Sentiment Analysis — X vs. Bluesky\n03  Text compression + encryption in Python\n<span class="c-dim">→ cd projects for the full cards</span>'); } },
    date: { desc: 'time in Los Angeles', run() { print(`${laTime()} <span class="c-dim">(America/Los_Angeles)</span>`); } },
    theme: {
      desc: 'theme light | dark',
      run(args) {
        const t = args[0] === 'light' || args[0] === 'dark' ? args[0] : (currentTheme() === 'dark' ? 'light' : 'dark');
        setTheme(t);
        print(`theme set to <span class="c-gold">${t}</span>`);
      },
    },
    showtime: { desc: 'purple & gold mode', run() { const on = !root.classList.contains('showtime'); setShowtime(on); print(on ? 'It\'s showtime. 💜💛' : 'Showtime over. Back to regular programming.'); } },
    lakers: { desc: 'confetti, but purple & gold', run() { confetti('lakers'); print('💜💛 Go Lakers!'); } },
    dodgers: { desc: 'confetti, but blue', run() { confetti('dodgers'); print('💙 Go Dodgers!'); } },
    matrix: { desc: 'wake up, neo', run() { closeTerminal(); matrix(); } },
    gravity: { desc: 'turn gravity on', run() { closeTerminal(); setTimeout(gravity, 200); } },
    roll: { desc: 'do a barrel roll', run() { barrelRoll(); } },
    play: { desc: 'shoot some hoops', run() { go('/404.html'); } },
    eggs: {
      desc: 'easter egg progress',
      run() {
        const n = foundEggs().size;
        const bar = '█'.repeat(n) + '░'.repeat(EGGS.length - n);
        print(`${bar}  ${n}/${EGGS.length}\n<span class="c-dim">${n === EGGS.length ? 'All of them. Respect.' : 'Hints exist. Somewhere hidden. (ls -a)'}</span>`);
      },
    },
    echo: { desc: 'say something', run(args) { print(esc(args.join(' '))); } },
    history: { desc: 'what you typed', run() { print(T.history.map((h, i) => `${String(i + 1).padStart(3)}  ${esc(h)}`).join('\n') || '(empty)'); } },
    clear: { desc: 'clear the screen', run() { T.out.innerHTML = ''; } },
    exit: { desc: 'close the terminal', run() { closeTerminal(); } },

    // ---- hidden ----
    sudo: {
      hidden: true,
      run(args) {
        findEgg('sudo');
        if (args.join(' ') === 'make me a sandwich') return print('Okay. 🥪');
        print(`[sudo] password for guest: ********
<span class="c-err">guest is not in the sudoers file. This incident will be reported.</span>
<span class="c-dim">(to Aaron. He'll think it's funny.)</span>`);
      },
    },
    make: { hidden: true, run(args) { print(args.join(' ') === 'me a sandwich' ? 'What? Make it yourself.' : `make: *** No rule to make target '${esc(args.join(' ') || '')}'.`); } },
    rm: { hidden: true, run() { print('rm: absolutely not. I just rebuilt this whole thing.', 'c-err'); } },
    vault: { hidden: true, run() { go('/vault.html'); } },
    hello: { hidden: true, run() { print('hi! 👋'); } },
    hi: { hidden: true, run() { print('hello! 👋'); } },
    coffee: { hidden: true, run() { print('☕ Former barista at Tea & Coffee Exchange, Hollywood. Brewing… done. Here you go.'); } },
    cookie: { hidden: true, run() { print('🍪 Former Diddy Riese employee. The ice cream sandwich is the move.'); } },
    otto: { hidden: true, run() { closeTerminal(); ottoPop(); } },
    kobe: { hidden: true, run() { confetti('lakers', 80); print('💜💛 Mamba forever.'); } },
    xyzzy: { hidden: true, run() { print('Nothing happens.'); } },
    vim: { hidden: true, run() { print('You are now trapped in vim. Just kidding. Type :q (it won\'t help).'); } },
    ':q': { hidden: true, run() { print('See? Didn\'t help.'); } },
    42: { hidden: true, run() { print('The answer. But what was the question?'); } },
  };
  COMMANDS.quit = { hidden: true, run: COMMANDS.exit.run };
  COMMANDS.man = { hidden: true, run: COMMANDS.help.run };
  COMMANDS.dir = { hidden: true, run: COMMANDS.ls.run };
  COMMANDS.cls = { hidden: true, run: COMMANDS.clear.run };

  function run(line) {
    const raw = line.trim();
    print(`<span class="c-ok">guest@am:~$</span> ${esc(raw)}`);
    if (!raw) return;
    T.history.push(raw);
    T.hIdx = T.history.length;
    const [cmd, ...args] = raw.split(/\s+/);
    const c = COMMANDS[cmd.toLowerCase()];
    if (c) c.run(args);
    else print(`zsh: command not found: ${esc(cmd)} <span class="c-dim">— try </span><span class="c-gold">help</span>`);
  }

  /* ---------------------------------------------------------------------- */
  /* Page wiring (all optional: each block checks its elements exist)        */
  /* ---------------------------------------------------------------------- */
  function wire() {
    // year
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

    // theme
    paintThemeButtons();
    $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark')));
    $$('[data-terminal]').forEach((b) => b.addEventListener('click', openTerminal));

    // mobile menu
    const menuBtn = $('#menuBtn');
    const nav = $('.nav');
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.textContent = open ? '✕' : '☰';
      });
      $$('a', nav).forEach((a) => a.addEventListener('click', () => {
        nav.classList.remove('open');
        menuBtn.textContent = '☰';
        menuBtn.setAttribute('aria-expanded', 'false');
      }));
    }

    // logo: 5 fast clicks = barrel roll
    let clicks = [];
    $$('.logo').forEach((logo) => logo.addEventListener('click', (e) => {
      const onHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
      if (onHome) { e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }
      const now = Date.now();
      clicks = clicks.filter((t) => now - t < 2000).concat(now);
      if (clicks.length >= 5) {
        clicks = [];
        if (onHome) { barrelRoll(); findEgg('logo'); }
      }
    }));

    // reveal on scroll + skill bars
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('visible');
        $$('.skill-fill', en.target).forEach((f) => { f.style.width = (f.dataset.level || 0) + '%'; });
        io.unobserve(en.target);
      });
    }, { threshold: 0.1 });
    $$('.reveal').forEach((el) => io.observe(el));

    // team buttons
    $$('[data-team]').forEach((b) => b.addEventListener('click', () => confetti(b.dataset.team)));

    // egg meters
    updateEggMeters();

    // night owl
    const laHour = Number(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hourCycle: 'h23' }));
    if (laHour < 5) setTimeout(() => findEgg('nightowl'), 1500);

    // pages can declare an egg they award on visit: <body data-egg="lost">
    const pageEgg = document.body.dataset.egg;
    if (pageEgg) setTimeout(() => findEgg(pageEgg), 900);
  }

  /* ---------------------------------------------------------------------- */
  /* Console greeting                                                        */
  /* ---------------------------------------------------------------------- */
  console.log('%c AM ', 'font: italic 42px Georgia, serif; background:#f2541b; color:#fff; padding:4px 16px; border-radius:10px;');
  console.log('%cHey, fellow element inspector 👋\nSay hi back: %caaron.hi()', 'font: 13px monospace; color:#999', 'font: 13px monospace; color:#f2541b; font-weight:bold');

  window.aaron = {
    hi() {
      findEgg('console');
      return `Hi! 👋 Thanks for poking around. There are ${EGGS.length} easter eggs on this site — try aaron.eggs().`;
    },
    eggs() {
      const f = foundEggs();
      console.table(EGGS.map((e) => ({ egg: f.has(e.id) ? `${e.icon} ${e.name}` : '???', found: f.has(e.id) })));
      return `${f.size}/${EGGS.length} found. The vault lives at /vault.html.`;
    },
  };
  window.aaron.hello = window.aaron.hi;

  // Public API for page-specific scripts (map, vault, hoops)
  window.AM = { EGGS, foundEggs, findEgg, resetEggs, confetti, toast, isDark, openTerminal, store };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
