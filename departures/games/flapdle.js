/* Flapdle: a five-letter word a day, played on the split-flap board.
   Green = right letter, right slot. Amber = in the word, wrong slot. Dark = not in the word.
   The daily word changes at midnight in Los Angeles. Progress and stats stay in this browser. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const W = window.FLAPDLE_WORDS;
  const ANSWERS = W.answers.match(/.{5}/g);
  const VALID = new Set(W.valid.match(/.{5}/g));
  ANSWERS.forEach((a) => VALID.add(a));
  const ROWS = 6, LEN = 5;
  const EPOCH = Date.UTC(2026, 9, 23);   // No. 1
  const store = AM.store;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- the day, in LA ---------- */
  function laDay(d = new Date()) {
    const [y, m, dd] = d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }).split('-').map(Number);
    return Math.round((Date.UTC(y, m - 1, dd) - EPOCH) / 864e5);
  }
  const today = laDay();
  const dailyNo = today + 1;
  const dailyWord = ANSWERS[((today % ANSWERS.length) + ANSWERS.length) % ANSWERS.length];

  /* ---------- scoring (handles repeated letters properly) ---------- */
  function score(guess, answer) {
    const res = Array(LEN).fill('miss'), left = {};
    for (let i = 0; i < LEN; i++) {
      if (guess[i] === answer[i]) res[i] = 'hit';
      else left[answer[i]] = (left[answer[i]] || 0) + 1;
    }
    for (let i = 0; i < LEN; i++) {
      if (res[i] !== 'hit' && left[guess[i]] > 0) { res[i] = 'near'; left[guess[i]]--; }
    }
    return res;
  }

  /* ---------- saved state ---------- */
  const readJSON = (k, d) => { try { return JSON.parse(store.get(k)) || d; } catch { return d; } };
  let stats = readJSON('fd_stats', { played: 0, wins: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0], last: null });
  const saved = readJSON('fd_daily', null);

  let game;   // { mode, no, answer, guesses: [], done, won }
  function newGame(mode) {
    if (mode === 'daily') {
      const g = saved && saved.day === today ? saved : { day: today, guesses: [], done: false, won: false };
      game = { mode, no: dailyNo, answer: dailyWord, guesses: g.guesses.slice(), done: g.done, won: g.won };
    } else {
      let a; do { a = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]; } while (a === dailyWord);
      game = { mode, no: null, answer: a, guesses: [], done: false, won: false };
    }
    cur = '';
    paintAll(true);
  }
  function saveDaily() {
    if (game.mode !== 'daily') return;
    store.set('fd_daily', JSON.stringify({ day: today, guesses: game.guesses, done: game.done, won: game.won }));
  }

  /* ---------- board ---------- */
  const grid = $('#fdGrid');
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const el = document.createElement('div');
    el.className = 'fd-row';
    grid.appendChild(el);
    rows.push({ el, flaps: Flap.row(el, LEN) });
  }
  const status = Flap.row($('#fdStatus'), 22);
  const say = (t, fast) => status.set(t, { stagger: fast ? 8 : 18, jitter: 20 });

  function tint(r, marks) {
    rows[r].flaps.cells.forEach((c, i) => { c.classList.remove('hit', 'near', 'miss'); if (marks && marks[i]) c.classList.add(marks[i]); });
  }

  let cur = '', busy = false;
  function paintAll(fresh) {
    $('#fdNo').textContent = game.mode === 'daily' ? `No. ${game.no}` : 'Practice';
    $('#fdModeBtn').textContent = game.mode === 'daily' ? 'Practice round' : `Back to No. ${dailyNo}`;
    rows.forEach((row, r) => {
      const g = game.guesses[r];
      row.flaps.set(g || (r === game.guesses.length ? cur : ''), { instant: true });
      tint(r, g && score(g, game.answer));
      row.el.classList.toggle('active', !game.done && r === game.guesses.length);
    });
    paintKeys();
    if (fresh) {
      if (game.done) endMessage(true);
      else say(game.mode === 'daily' ? `NOW BOARDING NO. ${game.no}` : 'PRACTICE · ANY WORD', true);
    }
    paintStats();
  }

  /* ---------- keyboard ---------- */
  const KEYS = ['QWERTYUIOP', 'ASDFGHJKL', '⏎ZXCVBNM⌫'];
  const keysEl = $('#fdKeys');
  KEYS.forEach((line) => {
    const r = document.createElement('div');
    r.className = 'fd-krow';
    [...line].forEach((k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.k = k === '⏎' ? 'Enter' : k === '⌫' ? 'Backspace' : k;
      b.textContent = k === '⏎' ? 'Enter' : k;
      if (k === '⌫') b.setAttribute('aria-label', 'Delete');
      if (k === '⏎' || k === '⌫') b.classList.add('wide');
      r.appendChild(b);
    });
    keysEl.appendChild(r);
  });
  keysEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) press(b.dataset.k); });
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector('.term.open')) return;          // the gate agent terminal has the keyboard
    if (/^[a-z]$/i.test(e.key) || e.key === 'Enter' || e.key === 'Backspace') {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      e.preventDefault();
      press(e.key.length === 1 ? e.key.toUpperCase() : e.key);
    }
  });
  function paintKeys() {
    const best = {};
    const rank = { miss: 1, near: 2, hit: 3 };
    game.guesses.forEach((g) => score(g, game.answer).forEach((m, i) => { if (!best[g[i]] || rank[m] > rank[best[g[i]]]) best[g[i]] = m; }));
    keysEl.querySelectorAll('button').forEach((b) => { b.className = (b.classList.contains('wide') ? 'wide ' : '') + (best[b.dataset.k.toLowerCase()] || ''); });
  }

  function press(k) {
    if (busy || game.done) return;
    const row = rows[game.guesses.length];
    if (k === 'Backspace') { cur = cur.slice(0, -1); row.flaps.set(cur, { instant: true }); return; }
    if (k === 'Enter') { submit(); return; }
    if (cur.length < LEN) {
      cur += k.toLowerCase();
      row.flaps.cell(cur.length - 1, k);   // the typed letter clacks into place
    }
  }

  async function submit() {
    const r = game.guesses.length, row = rows[r];
    if (cur.length < LEN) { shake(row.el); say('NOT ENOUGH LETTERS', true); return; }
    if (!VALID.has(cur)) { shake(row.el); say('NOT ON THE MANIFEST', true); return; }
    busy = true;
    const guess = cur, marks = score(guess, game.answer);
    game.guesses.push(guess);
    cur = '';
    row.el.classList.remove('active');
    // reveal: each flap spins and lands, then takes its colour
    row.flaps.set('', { instant: true });
    await Promise.all([...guess].map((ch, i) => row.flaps.cell(i, ch, i * 230).then(() => row.flaps.cells[i].classList.add(marks[i]))));
    await sleep(120);
    paintKeys();
    const won = guess === game.answer;
    if (won || game.guesses.length === ROWS) finish(won);
    else { rows[game.guesses.length].el.classList.add('active'); say(`${ROWS - game.guesses.length} TRIES LEFT`, true); }
    saveDaily();
    busy = false;
  }

  const VERDICT = ['HOLE IN ONE', 'NONSTOP', 'EXPRESS', 'ON TIME', 'SLIGHT DELAY', 'FINAL CALL'];
  function endMessage(quick) {
    if (game.won) say(`${VERDICT[game.guesses.length - 1]} · ${game.guesses.length}/6`, quick);
    else say(`CANCELLED · ${game.answer.toUpperCase()}`, quick);
    $('#fdShare').hidden = false;
  }
  function finish(won) {
    game.done = true; game.won = won;
    if (game.mode === 'daily') {
      stats.played++;
      if (won) {
        stats.wins++;
        stats.dist[game.guesses.length - 1]++;
        stats.streak = stats.last === today - 1 ? stats.streak + 1 : 1;
        stats.best = Math.max(stats.best, stats.streak);
        stats.last = today;
      } else stats.streak = 0;
      store.set('fd_stats', JSON.stringify(stats));
    }
    endMessage(false);
    if (won) {
      rows[game.guesses.length - 1].el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 380, easing: 'ease-out' });
      AM.confetti('party', game.guesses.length <= 3 ? 140 : 70);
      AM.findEgg('flapdle');
    }
    paintStats();
  }

  function shake(el) {
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }], { duration: 320 });
  }

  /* ---------- stats, countdown, share ---------- */
  function paintStats() {
    $('#fdPlayed').textContent = stats.played;
    $('#fdWin').textContent = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
    $('#fdStreak').textContent = stats.last === today || stats.last === today - 1 ? stats.streak : 0;
    $('#fdBest').textContent = stats.best;
    const max = Math.max(1, ...stats.dist);
    const mine = game && game.mode === 'daily' && game.won ? game.guesses.length - 1 : -1;
    $('#fdDist').innerHTML = stats.dist.map((n, i) => `<div class="fd-bar${i === mine ? ' me' : ''}"><span>${i + 1}</span><i style="width:${Math.max(7, (n / max) * 100)}%">${n}</i></div>`).join('');
  }
  function tickCountdown() {
    const now = new Date();
    const la = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    const left = 86400 - (la.getHours() * 3600 + la.getMinutes() * 60 + la.getSeconds());
    const hh = String(Math.floor(left / 3600)).padStart(2, '0'), mm = String(Math.floor(left / 60) % 60).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
    $('#fdNext').textContent = `${hh}:${mm}:${ss}`;
    if (laDay() !== today) location.reload();
  }
  setInterval(tickCountdown, 1000);
  tickCountdown();

  $('#fdShare').addEventListener('click', async () => {
    const icon = { hit: '🟩', near: '🟨', miss: '⬛' };
    const head = game.mode === 'daily' ? `Flapdle No. ${game.no}` : 'Flapdle practice';
    const text = `${head} ${game.won ? game.guesses.length : 'X'}/6 ✈️\n\n${game.guesses.map((g) => score(g, game.answer).map((m) => icon[m]).join('')).join('\n')}\n\naaronmoradi.com/departures/flapdle.html`;
    try { await navigator.clipboard.writeText(text); AM.toast('<span>Copied. Paste it anywhere.</span>'); }
    catch { prompt('Copy your result:', text); }
  });
  $('#fdModeBtn').addEventListener('click', () => { newGame(game.mode === 'daily' ? 'practice' : 'daily'); $('#fdShare').hidden = !game.done; });

  newGame('daily');
  $('#fdShare').hidden = !game.done;
})();
