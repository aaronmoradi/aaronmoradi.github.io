/* "Official Program" page behaviour: cover date, scoreboard, rookie card, stats, jerseys. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const LA = 'America/Los_Angeles';
  const { CAREER, months } = window.AM_CAREER;

  /* ---------- issue date + scoreboard clock ---------- */
  const issue = new Date().toLocaleDateString('en-US', { timeZone: LA, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  $$('[data-issue-date]').forEach((el) => { el.textContent = issue.replace(/,/g, '').toUpperCase(); });

  function tick() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-US', { timeZone: LA, hour: 'numeric', minute: '2-digit' });
    $$('[data-la-clock]').forEach((el) => { el.textContent = t; });
    const h = Number(now.toLocaleString('en-US', { timeZone: LA, hour: 'numeric', hourCycle: 'h23' }));
    const state = h < 5 ? 'LATE TIP' : h < 12 ? 'MORNING SHOOTAROUND' : h < 17 ? 'AFTERNOON PRACTICE' : h < 20 ? 'PREGAME' : 'GAME NIGHT';
    $$('[data-la-state]').forEach((el) => { el.textContent = state; });
  }
  tick();
  setInterval(tick, 15000);

  /* ---------- attendance (shared visitor counter) ---------- */
  const att = $$('[data-attendance]');
  if (att.length) {
    fetch('https://api.counterapi.dev/v2/aaron-moradis-team-3783/ronmo/up')
      .then((r) => r.json())
      .then((d) => {
        const n = d?.data?.up_count ?? d?.count ?? d?.data?.count;
        att.forEach((el) => { el.textContent = typeof n === 'number' ? n.toLocaleString() : 'SOLD OUT'; });
      })
      .catch(() => att.forEach((el) => { el.textContent = 'SOLD OUT'; }));
  }

  /* ---------- career stats on the card back ---------- */
  const tbody = $('#careerRows');
  if (tbody) {
    let total = 0;
    tbody.innerHTML = CAREER.map((c) => {
      const m = months(c.start, c.end);
      total += m;
      return `<tr><td>${c.yr}</td><td>${c.team}</td><td>${c.pos}</td><td>${m}${c.end ? '' : '*'}</td></tr>`;
    }).join('');
    $('#careerTotal').textContent = total;
  }

  /* ---------- rookie card flip ---------- */
  const card = $('#rookieCard');
  if (card) {
    const flip = () => {
      const on = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(on));
      $('#flipHint').textContent = on ? 'Tap the card to see the front' : 'Tap the card to see the stats';
    };
    card.addEventListener('click', flip);
  }

  /* ---------- scouting ratings as print segments ---------- */
  $$('.segs[data-v]').forEach((el) => {
    const v = Number(el.dataset.v) / 10;
    el.innerHTML = Array.from({ length: 10 }, (_, i) => `<i class="${i + 1 <= v ? 'on' : i < v ? 'half' : ''}"></i>`).join('');
  });

  /* ---------- 8 & 24 jerseys: tap #24 eight times, or #8 twenty-four ---------- */
  const taps = { 8: 0, 24: 0 };
  $$('[data-jersey]').forEach((j) => j.addEventListener('click', () => {
    const n = Number(j.dataset.jersey);
    taps[n]++;
    j.animate([{ transform: 'scale(.94) rotate(-3deg)' }, { transform: 'none' }], { duration: 260, easing: 'ease-out' });
    const goal = n === 24 ? 8 : 24;
    if (taps[n] === goal) {
      AM.findEgg('mamba');
      AM.confetti('lakers', 200);
      AM.toast(`💜💛 ${n === 24 ? '#24, eight times' : '#8, twenty-four times'}. Mamba forever.`);
    }
  }));

  /* ---------- Spotify "walk-up music" ---------- */
  const player = $('#spotify-player');
  $$('.tracks button').forEach((b) => b.addEventListener('click', () => {
    player.src = `https://open.spotify.com/embed/track/${b.dataset.track}?utm_source=generator&theme=0`;
    $$('.tracks button').forEach((x) => x.classList.toggle('on', x === b));
  }));

  /* ---------- live months on the road schedule ---------- */
  $$('[data-months-since]').forEach((el) => { el.textContent = months(el.dataset.monthsSince, null); });
})();
