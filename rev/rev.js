/* "Rev." page behaviour: commit-hour ring, stats, ledger, version compare. All data from rev/data/log.json. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const REPO = 'https://github.com/aaronmoradi/aaronmoradi.github.io/commit/';
  const dt = (t) => new Date(t + ':00');
  const fmtDay = (t) => dt(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const fmtTime = (t) => dt(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Sessions: consecutive commits less than 2 hours apart belong to one sitting.
  function sessions(commits) {
    const out = [];
    commits.forEach((c) => {
      const last = out[out.length - 1];
      if (last && dt(c.t) - dt(last.items[last.items.length - 1].t) < 2 * 3600e3) last.items.push(c);
      else out.push({ items: [c] });
    });
    return out;
  }

  window.REV_LOG().then(({ stats, commits }) => {
    const mine = commits.filter((c) => c.by === 'aaron');
    const ss = sessions(commits);
    const best = sessions(mine).reduce((a, b) => (b.items.length > a.items.length ? b : a));
    const bFirst = best.items[0], bLast = best.items[best.items.length - 1];

    /* ---------- numbers everywhere ---------- */
    const put = (k, v) => $$(`[data-${k}]`).forEach((el) => { el.textContent = v; });
    put('rev', stats.total);
    put('mine', stats.aaron);
    put('late', Math.round(stats.late_share * 100) + '%');
    put('first-when', `${fmtDay(stats.first.t)}, ${fmtTime(stats.first.t)}`);
    put('first-msg', `"${stats.first.s}"`);
    put('best-count', best.items.length);
    put('best-when', `${fmtDay(bFirst.t)} ${fmtTime(bFirst.t)} → ${fmtTime(bLast.t)}`);
    put('sessions', ss.length);
    put('private', stats.private_excluded);
    put('built', fmtDay(stats.built));

    /* ---------- 24-hour ring ---------- */
    const ring = $('#ring');
    if (ring) {
      const C = 220, r0 = 92, r1 = 196, max = Math.max(...stats.hours);
      let s = `<circle class="face" cx="${C}" cy="${C}" r="${r0}"/><circle class="face" cx="${C}" cy="${C}" r="${r1 + 6}" style="stroke-dasharray:2 6"/>`;
      for (let h = 0; h < 24; h++) {
        const a0 = ((h / 24) * 360 - 90 + 1.5) * Math.PI / 180, a1 = (((h + 1) / 24) * 360 - 90 - 1.5) * Math.PI / 180;
        const len = r0 + 4 + (stats.hours[h] / max) * (r1 - r0 - 4);
        const p = (a, r) => `${(C + Math.cos(a) * r).toFixed(1)} ${(C + Math.sin(a) * r).toFixed(1)}`;
        s += `<path class="bar-h${h < 4 ? ' late' : ''}" d="M${p(a0, r0 + 4)} L${p(a0, len)} A${len} ${len} 0 0 1 ${p(a1, len)} L${p(a1, r0 + 4)} A${r0 + 4} ${r0 + 4} 0 0 0 ${p(a0, r0 + 4)} Z"><title>${String(h).padStart(2, '0')}:00–${String(h).padStart(2, '0')}:59 · ${stats.hours[h]} commits</title></path>`;
        if (h % 3 === 0) { const a = ((h / 24) * 360 - 90) * Math.PI / 180; s += `<text class="hr" x="${C + Math.cos(a) * (r1 + 20)}" y="${C + Math.sin(a) * (r1 + 20) + 4}" text-anchor="middle">${String(h).padStart(2, '0')}</text>`; }
      }
      s += `<text class="center" x="${C}" y="${C + 8}" text-anchor="middle">${Math.round(stats.late_share * 100)}%</text>
            <text class="hr" x="${C}" y="${C + 32}" text-anchor="middle">between 00–04</text>
            <text class="hr" id="ring24" x="${C}" y="${C - 34}" text-anchor="middle" style="cursor:pointer">24h</text>`;
      ring.innerHTML = s;
      // 8 taps on "24h" (or 24) for the 8 & 24 egg
      let taps = 0;
      $('#ring24', ring).addEventListener('click', () => {
        taps++;
        if (taps === 8) { AM.findEgg('mamba'); AM.confetti('lakers', 80); }
        if (taps === 24) { AM.confetti('lakers', 220); AM.toast('8 <i>and</i> 24. <b>Mamba forever.</b>'); }
      });
    }

    /* ---------- ledger (/rev/log.html) ---------- */
    const ledger = $('#ledger');
    if (ledger) {
      const render = (onlyLate) => {
        const list = ss.slice().reverse();
        ledger.innerHTML = list.map((sess) => {
          let items = sess.items;
          if (onlyLate) items = items.filter((c) => Number(c.t.slice(11, 13)) < 4);
          if (!items.length) return '';
          // collapse runs of the same message ("Update index.html" ×12)
          const runs = [];
          items.forEach((c) => { const l = runs[runs.length - 1]; if (l && l.s === c.s) l.n.push(c); else runs.push({ s: c.s, n: [c] }); });
          const isBest = sess.items[0] === bFirst;
          const a = sess.items[0], z = sess.items[sess.items.length - 1];
          return `<section class="sess${isBest ? ' best' : ''}">
            <header><b>${fmtDay(a.t)}</b><span>${fmtTime(a.t)} → ${fmtTime(z.t)} · ${sess.items.length} commit${sess.items.length > 1 ? 's' : ''}</span>${isBest ? '<em class="pencil">← the big one</em>' : ''}</header>
            <ol>${runs.map((r) => {
              const c = r.n[0];
              return `<li class="${Number(c.t.slice(11, 13)) < 4 ? 'late' : ''}"><time>${fmtTime(c.t)}</time><a href="${REPO}${c.h}" target="_blank" rel="noopener">${c.h}</a><span class="msg">${esc(c.s)}${r.n.length > 1 ? ` <b class="x">×${r.n.length}</b>` : ''}${c.by === 'claude' ? ' <i>(with Claude)</i>' : ''}</span></li>`;
            }).join('')}</ol></section>`;
        }).join('');
      };
      render(false);
      $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
        $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        render(b.dataset.filter === 'late');
      }));
      // commits per month strip
      const months = {};
      commits.forEach((c) => { months[c.t.slice(0, 7)] = (months[c.t.slice(0, 7)] || 0) + 1; });
      const keys = Object.keys(months).sort();
      const first = keys[0].split('-').map(Number), last = keys[keys.length - 1].split('-').map(Number);
      const all = [];
      for (let y = first[0], m = first[1]; y < last[0] || (y === last[0] && m <= last[1]); m === 12 ? (y++, m = 1) : m++) all.push(`${y}-${String(m).padStart(2, '0')}`);
      const mx = Math.max(...Object.values(months));
      $('#months').innerHTML = all.map((k) => `<div title="${k}: ${months[k] || 0} commits"><i style="height:${((months[k] || 0) / mx) * 100}%"></i><span>${k.slice(5) === '01' || k === all[0] ? k.slice(0, 4) : ''}</span></div>`).join('');
    }

    /* ---------- versions: commit counts per era ---------- */
    $$('[data-count-between]').forEach((el) => {
      const [a, b] = el.dataset.countBetween.split('..');
      el.textContent = commits.filter((c) => c.t >= a && (!b || c.t < b)).length;
    });
  }).catch(() => {});

  /* ---------- v1 ↔ v2 compare slider ---------- */
  const cmp = $('#compare');
  if (cmp) {
    const set = (v) => { cmp.style.setProperty('--x', v + '%'); $('#cmpRange').value = v; };
    $('#cmpRange').addEventListener('input', (e) => set(e.target.value));
    set(50);
  }

  /* ---------- LA clock in the title block ---------- */
  const tick = () => $$('[data-la-time]').forEach((el) => { el.textContent = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' }); });
  tick(); setInterval(tick, 20000);

  /* ---------- timesheet hours since start ---------- */
  $$('[data-since]').forEach((el) => {
    const [y, m] = el.dataset.since.split('-').map(Number), n = new Date();
    el.textContent = (n.getFullYear() - y) * 12 + (n.getMonth() + 1 - m) + 1;
  });
})();
