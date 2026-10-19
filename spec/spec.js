/* AM-001 page behaviour: live readout, Fig. 3.1 Gantt, measurements, footnote 24, grid toggle. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const LA = 'America/Los_Angeles';
  const root = document.documentElement;
  const SERVICE = window.SPEC_SERVICE, months = window.SPEC_MONTHS;
  const LINE = { la: 'var(--line-la)', syr: 'var(--line-syr)', pa: 'var(--line-pa)', xyz: 'var(--line-xyz)' };
  const fmtMonth = (ym) => { if (!ym) return 'present'; const [y, m] = ym.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };

  /* ---------- G toggles the 12-column grid ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'g' || e.metaKey || e.ctrlKey || /input|textarea/i.test(e.target.tagName)) return;
    root.classList.toggle('show-grid');
    const b = $('#gridBtn'); if (b) b.setAttribute('aria-pressed', String(root.classList.contains('show-grid')));
  });
  $('#gridBtn')?.addEventListener('click', (e) => { root.classList.toggle('show-grid'); e.currentTarget.setAttribute('aria-pressed', String(root.classList.contains('show-grid'))); });

  /* ---------- live readout in the header ---------- */
  function readout() {
    const now = new Date();
    $$('[data-la-time]').forEach((el) => { el.textContent = now.toLocaleTimeString('en-US', { timeZone: LA, hour: '2-digit', minute: '2-digit', hour12: false }) + ' PT'; });
    const h = Number(now.toLocaleString('en-US', { timeZone: LA, hour: 'numeric', hourCycle: 'h23' }));
    $$('[data-status]').forEach((el) => { el.textContent = h < 5 ? 'LA IS ASLEEP' : 'AT XYZ, SANTA MONICA'; });
    $$('[data-rev]').forEach((el) => { el.textContent = now.toLocaleDateString('en-CA', { timeZone: LA, year: 'numeric', month: '2-digit' }).replace('-', '.'); });
  }
  readout();
  setInterval(readout, 20000);

  /* ---------- Fig. 3.1: Gantt of the record of service ---------- */
  const g = $('#gantt');
  if (g) {
    const now = new Date();
    const Y0 = 2019, Y1 = now.getFullYear() + 1; // axis runs to the end of the current year
    const W = 1000, L = 250, R = 20, top = 34, rowH = 46;
    const mIdx = (ym) => { const [y, m] = ym.split('-').map(Number); return (y - Y0) * 12 + (m - 1); };
    const span = (Y1 - Y0) * 12;
    const x = (mi) => L + (mi / span) * (W - L - R);
    const nowM = (now.getFullYear() - Y0) * 12 + now.getMonth() + now.getDate() / 31;
    const rows = [...SERVICE, { id: 'M.1', role: 'B.S. Computer Science, cum laude', org: 'Syracuse University', loc: 'Syracuse, NY', from: '2025-05', milestone: true, line: 'syr' }];
    const H = top + rows.length * rowH + 30;
    let s = `<g class="yr">`;
    for (let y = Y0; y <= Y1; y++) { const xx = x((y - Y0) * 12); s += `<line x1="${xx}" y1="${top - 10}" x2="${xx}" y2="${H - 24}"/>` + (y < Y1 ? `<text x="${xx + 4}" y="${top - 16}">${y}</text>` : ''); }
    s += `</g>`;
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      s += `<g class="row" data-i="${i}"><line x1="0" x2="${W}" y1="${y + rowH}" y2="${y + rowH}" stroke="var(--hair)"/>
        <text class="lbl" x="0" y="${y + 20}">${r.id} ${r.org}</text><text class="sub" x="0" y="${y + 36}">${r.role}</text>`;
      if (r.milestone) {
        const cx = x(mIdx(r.from) + .5), cy = y + rowH / 2;
        s += `<path class="bar" d="M${cx} ${cy - 10} L${cx + 10} ${cy} L${cx} ${cy + 10} L${cx - 10} ${cy} Z" fill="${LINE[r.line]}"><title>${r.org}: graduated ${fmtMonth(r.from)}</title></path>`;
      } else {
        const x1 = x(mIdx(r.from)), x2 = r.to ? x(mIdx(r.to) + 1) : x(nowM);
        s += `<rect class="bar" x="${x1}" y="${y + 13}" width="${Math.max(3, x2 - x1)}" height="20" fill="${LINE[r.line]}"><title>${r.org}: ${fmtMonth(r.from)} → ${fmtMonth(r.to)} (${months(r.from, r.to)} mo)</title></rect>`;
        if (!r.to) s += `<path d="M${x2} ${y + 13} l8 10 l-8 10" fill="none" stroke="${LINE[r.line]}" stroke-width="2"/>`;
      }
      s += `</g>`;
    });
    s += `<g class="now"><line x1="${x(nowM)}" x2="${x(nowM)}" y1="${top - 10}" y2="${H - 24}"/><text x="${x(nowM) - 4}" y="${H - 10}" text-anchor="end">NOW · ${now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}</text></g>`;
    s += `<line class="cross" id="cross" x1="0" x2="0" y1="${top - 10}" y2="${H - 24}"/><rect class="tipbg" id="tipbg" height="22" rx="0"/><text class="tip" id="tip"></text>`;
    g.setAttribute('viewBox', `0 0 ${W} ${H}`);
    g.innerHTML = s;
    // crosshair with an exact month readout
    const cross = $('#cross', g), tip = $('#tip', g), tipbg = $('#tipbg', g);
    g.addEventListener('pointermove', (e) => {
      const pt = g.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(g.getScreenCTM().inverse());
      if (p.x < L || p.x > W - R) { [cross, tip, tipbg].forEach((el) => { el.style.opacity = 0; }); return; }
      const mi = ((p.x - L) / (W - L - R)) * span;
      const d = new Date(Y0, Math.floor(mi), 1);
      const live = rows.filter((r) => !r.milestone && mIdx(r.from) <= mi && mi < (r.to ? mIdx(r.to) + 1 : nowM)).map((r) => r.org);
      cross.setAttribute('x1', p.x); cross.setAttribute('x2', p.x);
      tip.textContent = `${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}${live.length ? ' · ' + live.join(' + ') : ''}`;
      const tx = Math.min(p.x + 8, W - tip.getComputedTextLength() - 12);
      tip.setAttribute('x', tx); tip.setAttribute('y', 18);
      tipbg.setAttribute('x', tx - 6); tipbg.setAttribute('y', 3); tipbg.setAttribute('width', tip.getComputedTextLength() + 12);
      [cross, tip, tipbg].forEach((el) => { el.style.opacity = 1; });
    });
    g.addEventListener('pointerleave', () => [cross, tip, tipbg].forEach((el) => { el.style.opacity = 0; }));
  }

  /* ---------- Table 3.1 ---------- */
  const tb = $('#serviceRows');
  if (tb) {
    tb.innerHTML = SERVICE.map((s) => `<tr><th>${s.id}</th><td><span class="swatch" style="--c:${LINE[s.line]}"></span>${s.role}</td><td>${s.org}<br><span style="color:var(--muted)">${s.loc}</span></td><td class="num">${s.from.replace('-', '.')}</td><td class="num">${s.to ? s.to.replace('-', '.') : 'present'}</td><td class="num">${months(s.from, s.to)}</td></tr>`).join('');
    $('#serviceTotal').textContent = SERVICE.reduce((a, s) => a + months(s.from, s.to), 0);
  }

  /* ---------- live measurements ---------- */
  $$('[data-months]').forEach((el) => { el.textContent = months(el.dataset.months, null); });
  $$('[data-months-total]').forEach((el) => { el.textContent = SERVICE.reduce((a, s) => a + months(s.from, s.to), 0); });
  $$('[data-years-since]').forEach((el) => { el.textContent = ((Date.now() - new Date(el.dataset.yearsSince)) / 3.15576e10).toFixed(1); });
  if ($('[data-commits]')) {
    fetch('/rev/data/log.json').then((r) => r.json()).then(({ stats }) => {
      $$('[data-commits]').forEach((el) => { el.textContent = stats.aaron; });
      $$('[data-late]').forEach((el) => { el.textContent = Math.round(stats.late_share * 100) + '%'; });
    }).catch(() => {});
  }

  /* ---------- footnote 24: eight actuations (or twenty-four) ---------- */
  const fn = $('#fn24');
  if (fn) {
    let n = 0;
    fn.addEventListener('click', (e) => {
      e.preventDefault();
      n++;
      fn.textContent = n < 24 ? `24·${n}` : '24';
      if (n === 8) { AM.findEgg('mamba'); AM.confetti('lakers', 90); }
      if (n === 24) { AM.confetti('lakers', 220); AM.toast('<span class="ecn">Footnote 24, confirmed</span>8 and 24. Kobe Bryant, 1978–2020.'); }
    });
  }

  /* ---------- Spotify (Table 2.2) ---------- */
  const player = $('#spotify-player');
  $$('[data-track]').forEach((b) => b.addEventListener('click', () => {
    player.src = `https://open.spotify.com/embed/track/${b.dataset.track}?utm_source=generator&theme=0`;
    $$('[data-track]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));

  /* ---------- visitor count ---------- */
  const v = $('[data-visits]');
  if (v) {
    fetch('https://api.counterapi.dev/v2/aaron-moradis-team-3783/ronmo/up').then((r) => r.json()).then((d) => {
      const n = d?.data?.up_count ?? d?.count ?? d?.data?.count;
      if (typeof n === 'number') v.textContent = n.toLocaleString();
    }).catch(() => {});
  }
})();
