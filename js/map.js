/* Atlas: the life map. Leaflet + OpenStreetMap tiles (keyless). */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const PLACES = [
    { id: 'la', title: 'Los Angeles', when: 'Born & raised', emoji: '🌴', ll: [34.0522, -118.2437], z: 11,
      text: 'Where it all started. Born and raised in LA, and still the place I call home.' },
    { id: 'hollywood', title: 'Hollywood', when: 'Jul – Aug 2019', emoji: '☕', ll: [34.0983, -118.3267], z: 13,
      text: 'First job: barista at Tea & Coffee Exchange.' },
    { id: 'syracuse', title: 'Syracuse University', when: 'Class of 2025', emoji: '🍊', ll: [43.0377, -76.134], z: 14,
      text: 'B.S. in Computer Science, cum laude, with a minor in Engineering & CS Management. Guest Services at the Barnes Center at The Arch from 2022 to 2025. Otto approved.' },
    { id: 'westwood', title: 'Westwood', when: 'May – Jun 2022', emoji: '🍪', ll: [34.063, -118.4472], z: 15,
      text: 'A summer serving cookies and ice cream sandwiches at Diddy Riese.' },
    { id: 'calabasas', title: 'Calabasas', when: 'Jun – Aug 2024', emoji: '📊', ll: [34.1446, -118.6448], z: 12,
      text: 'Data Science Analyst Intern at PlanetArt.' },
    { id: 'santamonica', title: 'Santa Monica', when: 'Oct 2025 – now', emoji: '🌊', ll: [34.0195, -118.4912], z: 13,
      text: 'Assistant Chief of Staff at XYZ. Back home on the west coast.' },
  ];

  // Only visible when you zoom way in. Shh.
  const SECRETS = [
    { title: 'Crypto.com Arena', emoji: '🏀', ll: [34.043, -118.2673], team: 'lakers', text: 'Home of the Lakers. Purple & gold forever. 💜💛' },
    { title: 'Dodger Stadium', emoji: '⚾', ll: [34.0739, -118.24], team: 'dodgers', text: 'Chavez Ravine. Go Dodgers! 💙' },
  ];
  const SECRET_ZOOM = 14;

  /* ---------- helpers ---------- */
  const toRad = (d) => (d * Math.PI) / 180;
  function miles([lat1, lon1], [lat2, lon2]) {
    const R = 3958.8;
    const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  function arc(a, b, lift = 0.22, steps = 64) {
    const ctrl = [(a[0] + b[0]) / 2 + Math.abs(b[1] - a[1]) * lift, (a[1] + b[1]) / 2];
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      pts.push([u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1]]);
    }
    return pts;
  }
  const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f2541b';
  const popup = (p) => `<div class="pop-when">${esc(p.when || 'Secret spot')}</div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`;
  const icon = (emoji, cls = '') => L.divIcon({ className: '', html: `<div class="pin ${cls}">${emoji}</div>`, iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -20] });

  /* ---------- map ---------- */
  const map = L.map('map', { zoomControl: true, worldCopyJump: true, minZoom: 3 }).setView([38.5, -97], 4);
  // Keyless tile providers, tried in order. Dark mode is a CSS filter on the tile pane.
  const PROVIDERS = [
    { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' },
    { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', maxZoom: 19,
      attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>, OpenStreetMap contributors, and the GIS user community' },
  ];
  let provider = 0, tileErrors = 0;
  const tiles = L.tileLayer(PROVIDERS[0].url, { maxZoom: PROVIDERS[0].maxZoom, attribution: PROVIDERS[0].attribution }).addTo(map);
  tiles.on('tileerror', () => {
    if (++tileErrors < 4 || provider >= PROVIDERS.length - 1) return;
    const p = PROVIDERS[++provider];
    tileErrors = 0;
    map.attributionControl.removeAttribution(tiles.options.attribution);
    tiles.options.attribution = p.attribution;
    tiles.options.maxZoom = p.maxZoom;
    map.attributionControl.addAttribution(p.attribution);
    tiles.setUrl(p.url);
  });
  const paintTiles = () => document.getElementById('map').classList.toggle('dark-tiles', AM.isDark());
  paintTiles();
  addEventListener('am:theme', () => { paintTiles(); route.setStyle({ color: accent() }); });

  const la = PLACES[0].ll, syr = PLACES[2].ll;
  const route = L.polyline(arc(la, syr), { color: accent(), weight: 3, dashArray: '2 9', lineCap: 'round', opacity: 0.9 }).addTo(map);

  const markers = {};
  PLACES.forEach((p) => {
    markers[p.id] = L.marker(p.ll, { icon: icon(p.emoji), title: p.title, riseOnHover: true })
      .addTo(map)
      .bindPopup(popup(p), { maxWidth: 260 })
      .on('click', () => setActive(p.id));
  });

  const secretLayer = L.layerGroup(SECRETS.map((s) =>
    L.marker(s.ll, { icon: icon(s.emoji, 'secret'), title: s.title })
      .bindPopup(popup(s), { maxWidth: 240 })
      .on('click', () => { AM.confetti(s.team, 120); AM.findEgg('courtside'); })
  ));
  let secretToastShown = false;
  map.on('zoomend', () => {
    const show = map.getZoom() >= SECRET_ZOOM && SECRETS.some((s) => map.getBounds().pad(0.3).contains(s.ll));
    if (show && !map.hasLayer(secretLayer)) {
      secretLayer.addTo(map);
      if (!secretToastShown) { secretToastShown = true; AM.toast('👀 Something just appeared nearby…'); }
    } else if (!show && map.hasLayer(secretLayer)) secretLayer.remove();
  });
  map.on('moveend', () => map.fire('zoomend'));

  const allBounds = L.latLngBounds(PLACES.map((p) => p.ll));
  const overview = () => map.flyToBounds(allBounds, { padding: [50, 50], duration: reduceMotion ? 0 : 1.6 });
  map.fitBounds(allBounds, { padding: [50, 50] });

  /* ---------- sidebar ---------- */
  const list = $('#chapters');
  list.innerHTML = PLACES.map((p, i) => `
    <li><button class="chapter" data-id="${p.id}">
      <span class="em">${p.emoji}</span>
      <span><span class="w">${String(i + 1).padStart(2, '0')} · ${esc(p.when)}</span><br><span class="t">${esc(p.title)}</span></span>
    </button></li>`).join('');
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.chapter');
    if (!b) return;
    stopTour();
    flyTo(b.dataset.id);
  });

  function setActive(id) {
    document.querySelectorAll('.chapter').forEach((c) => c.classList.toggle('active', c.dataset.id === id));
    Object.entries(markers).forEach(([k, m]) => m.getElement()?.querySelector('.pin')?.classList.toggle('active', k === id));
    const active = list.querySelector(`[data-id="${id}"]`);
    if (active && matchMedia('(max-width: 860px)').matches) active.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  function flyTo(id, duration = 2.2) {
    const p = PLACES.find((x) => x.id === id);
    setActive(id);
    map.closePopup();
    map.flyTo(p.ll, p.z, { duration: reduceMotion ? 0 : duration });
    map.once('moveend', () => markers[id].openPopup());
  }

  $('#statPlaces').textContent = PLACES.length;
  $('#statMiles').textContent = Math.round(miles(la, syr)).toLocaleString();
  $('#overviewBtn').addEventListener('click', () => { stopTour(); map.closePopup(); setActive(null); overview(); });

  /* ---------- guided tour ---------- */
  const tourBtn = $('#tourBtn');
  let tourTimer = null, tourIdx = 0;
  function step() {
    if (tourIdx >= PLACES.length) {
      stopTour();
      map.closePopup();
      overview();
      AM.toast('🗺️ That\'s the tour. Now go poke around. Zoom in. Way in.');
      return;
    }
    flyTo(PLACES[tourIdx].id, 2.6);
    tourIdx++;
    tourTimer = setTimeout(step, 5600);
  }
  function startTour() {
    tourIdx = 0;
    tourBtn.textContent = '■ Stop tour';
    step();
  }
  function stopTour() {
    if (!tourTimer) return;
    clearTimeout(tourTimer);
    tourTimer = null;
    tourBtn.textContent = '▶ Take the tour';
  }
  tourBtn.addEventListener('click', () => (tourTimer ? stopTour() : startTour()));
  map.on('dragstart', stopTour);

  /* ---------- how far am I? ---------- */
  let meMarker = null, meLine = null;
  $('#meBtn').addEventListener('click', () => {
    if (!navigator.geolocation) return AM.toast('Your browser doesn\'t share location. Mystery guest!');
    navigator.geolocation.getCurrentPosition((pos) => {
      const me = [pos.coords.latitude, pos.coords.longitude];
      const home = PLACES.find((p) => p.id === 'santamonica').ll;
      const d = Math.round(miles(me, home));
      meMarker?.remove(); meLine?.remove();
      meMarker = L.marker(me, { icon: icon('🫵', 'me') }).addTo(map).bindPopup(`<div class="pop-when">You are here</div><h3>${d.toLocaleString()} miles</h3><p>from Aaron's home base in Santa Monica.${d < 15 ? ' Basically neighbors. 👋' : ''}</p>`);
      meLine = L.polyline(d > 5 ? arc(me, home, 0.15) : [me, home], { color: '#1658c7', weight: 2, dashArray: '2 8' }).addTo(map);
      stopTour();
      map.flyToBounds(L.latLngBounds([me, home]), { padding: [80, 80], maxZoom: 12, duration: reduceMotion ? 0 : 1.6 });
      map.once('moveend', () => meMarker.openPopup());
    }, () => AM.toast('No location? No problem. Stay mysterious. 🕶️'), { timeout: 10000, maximumAge: 600000 });
  });

  // deep link: /map.html#syracuse
  const hash = location.hash.slice(1);
  if (PLACES.some((p) => p.id === hash)) setTimeout(() => flyTo(hash), 400);
})();
