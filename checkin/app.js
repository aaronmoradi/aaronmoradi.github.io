/* Check In 0.4.0 */
/* @ds-bundle: {"format":4,"namespace":"CheckIn","components":[{"name":"PresenceDot"},{"name":"CheckInButton"},{"name":"Toggle"},{"name":"FriendRow"},{"name":"ArrivalBanner"},{"name":"CheckInCard"},{"name":"HideFriendsSheet"},{"name":"ScheduleCheckIn"}]} */
(function () {
  var R = window.React, h = R.createElement, useState = R.useState;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function parseDay(s) { if (!s) return null; var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(s) { var d = parseDay(s); return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''; }
  function range(a, b) {
    var da = parseDay(a), db = parseDay(b);
    if (!da) return '';
    if (!db) return fmt(a);
    if (da.getMonth() === db.getMonth()) return fmt(a) + '–' + db.getDate();
    return fmt(a) + ' – ' + fmt(b);
  }
  function initialsOf(name) { return String(name || '').split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase(); }

  function PresenceDot(props) {
    var state = props.state || 'here', size = props.size || 10;
    return h('span', {
      className: cx('ci-dot', 'ci-dot-' + state, props.ripple && 'ci-dot-ripple', props.className),
      style: { width: size, height: size },
      role: props.label ? 'img' : undefined,
      'aria-label': props.label,
      'aria-hidden': props.label ? undefined : true
    });
  }

  function CheckInButton(props) {
    var state = props.state || 'idle', city = props.city;
    var label = props.children || (state === 'sent' ? 'Checked in' + (city ? ' · ' + city : '')
      : state === 'scheduled' ? 'Scheduled' + (props.when ? ' · ' + props.when : '')
      : 'Check in' + (city ? ' to ' + city : ''));
    return h('button', {
      type: 'button', className: cx('ci-btn', 'ci-btn-' + state, props.className),
      onClick: props.onClick, disabled: props.disabled
    }, state === 'sent' ? h(PresenceDot, { state: 'here', ripple: true }) : null,
       state === 'scheduled' ? h(PresenceDot, { state: 'soon' }) : null,
       h('span', null, label));
  }

  function Toggle(props) {
    var on = !!props.checked;
    return h('button', {
      type: 'button', role: 'switch', 'aria-checked': on, 'aria-label': props.label,
      className: cx('ci-toggle', on && 'ci-toggle-on', props.className),
      disabled: props.disabled,
      onClick: function () { props.onChange && props.onChange(!on); }
    }, h('span', { className: 'ci-toggle-knob' }));
  }

  function Avatar(props) {
    return h('span', { className: 'ci-avatar', 'aria-hidden': true },
      props.src ? h('img', { src: props.src, alt: '' }) : initialsOf(props.name),
      props.presence && props.presence !== 'away' ? h(PresenceDot, { state: props.presence, className: 'ci-avatar-dot' }) : null);
  }

  function FriendRow(props) {
    var skipped = !!props.skipped;
    var meta = skipped ? (props.skippedLabel || 'Skipped this time')
      : props.presence === 'here' ? 'In town' + (props.city ? ' · ' + props.city : '')
      : props.city || '';
    return h('div', { className: cx('ci-row', skipped && 'ci-row-skipped', props.className) },
      h(Avatar, { name: props.name, src: props.avatar, presence: skipped ? null : props.presence }),
      h('div', { className: 'ci-row-text' },
        h('div', { className: 'ci-row-name' }, props.name),
        meta ? h('div', { className: cx('ci-row-meta', !skipped && props.presence === 'here' && 'ci-row-meta-here') }, meta) : null),
      props.onSkippedChange ? h(Toggle, {
        checked: !skipped, label: (skipped ? 'Include ' : 'Skip ') + props.name,
        onChange: function (v) { props.onSkippedChange(!v); }
      }) : props.action || null);
  }

  function ArrivalBanner(props) {
    var n = props.friendsHere;
    return h('section', { className: cx('ci-banner', props.className) },
      h('div', { className: 'ci-banner-eyebrow' }, props.eyebrow || (props.upcoming ? 'Coming up' : 'You just arrived')),
      h('h2', { className: 'ci-banner-city' }, props.upcoming ? 'Off to ' + props.city : 'You’re in ' + props.city),
      h('p', { className: 'ci-banner-meta' },
        n != null ? h('span', { className: 'ci-banner-count' }, h(PresenceDot, { state: props.upcoming ? 'soon' : 'here' }),
          n + (n === 1 ? ' friend' : ' friends') + ' here') : null,
        props.until ? h('span', null, (n != null ? ' · ' : '') + 'until ' + props.until) : null),
      props.children ? h('div', { className: 'ci-banner-actions' }, props.children) : null);
  }

  function CheckInCard(props) {
    var upcoming = props.kind === 'upcoming';
    var headline = upcoming ? props.sender + ' is heading to ' : props.sender + ' is in ';
    return h('article', { className: cx('ci-card', props.className) },
      h('div', { className: 'ci-card-head' },
        h(Avatar, { name: props.sender, src: props.avatar, presence: upcoming ? 'soon' : 'here' }),
        h('div', { className: 'ci-card-text' },
          h('div', { className: 'ci-card-title' }, headline, h('span', { className: 'ci-card-city' }, props.city)),
          h('div', { className: 'ci-card-when' }, props.window || ''))),
      props.note ? h('p', { className: 'ci-card-note' }, '“' + props.note + '”') : null,
      h('div', { className: 'ci-card-actions' },
        h('button', { type: 'button', className: 'ci-quiet', onClick: props.onSayHi }, 'Say hi'),
        h('span', { className: 'ci-card-hint' }, 'No need to reply')));
  }

  function Choice(props) {
    return h('div', { className: 'ci-choice', role: 'radiogroup', 'aria-label': props.label },
      props.options.map(function (o) {
        var on = o.value === props.value;
        return h('button', {
          key: o.value, type: 'button', role: 'radio', 'aria-checked': on,
          className: cx('ci-choice-opt', on && 'ci-choice-on'),
          onClick: function () { props.onChange(o.value); }
        }, h('span', { className: 'ci-choice-label' }, o.label), o.hint ? h('span', { className: 'ci-choice-hint' }, o.hint) : null);
      }));
  }

  var HIDE_FOR = [
    { value: 'once', label: 'Just this check-in' },
    { value: 'trip', label: 'Until I leave' },
    { value: 'weeks', label: 'For 2 weeks' }
  ];

  function HideFriendsSheet(props) {
    var friends = props.friends || [];
    var s1 = useState(props.defaultHidden || []), hidden = props.hidden || s1[0];
    var s2 = useState(props.defaultDuration || 'once'), duration = props.duration || s2[0];
    function setHidden(next) { s1[1](next); props.onHiddenChange && props.onHiddenChange(next); }
    function setDuration(v) { s2[1](v); props.onDurationChange && props.onDurationChange(v); }
    var going = friends.length - hidden.length;
    return h('section', { className: cx('ci-sheet', props.className) },
      h('h3', { className: 'ci-sheet-title' }, 'Who hears you’re in ' + (props.city || 'town')),
      h('p', { className: 'ci-sheet-sub' }, 'Skipped friends get nothing, and they won’t see that they were skipped.'),
      h('div', { className: 'ci-list' }, friends.map(function (f) {
        var isHidden = hidden.indexOf(f.id) !== -1;
        return h(FriendRow, {
          key: f.id, name: f.name, avatar: f.avatar, city: f.city, presence: f.presence, skipped: isHidden,
          onSkippedChange: function (skip) {
            setHidden(skip ? hidden.concat(f.id) : hidden.filter(function (x) { return x !== f.id; }));
          }
        });
      })),
      hidden.length ? h('div', { className: 'ci-field' },
        h('div', { className: 'ci-label' }, 'Keep them skipped'),
        h(Choice, { label: 'Keep them skipped', options: HIDE_FOR, value: duration, onChange: setDuration })) : null,
      h('div', { className: 'ci-sheet-foot' },
        h('span', { className: 'ci-sheet-count' }, going + (going === 1 ? ' friend' : ' friends') + ' will hear' + (hidden.length ? ' · ' + hidden.length + ' skipped' : '')),
        props.onDone ? h('button', { type: 'button', className: 'ci-quiet', onClick: function () { props.onDone({ hidden: hidden, duration: duration }); } }, 'Done') : null));
  }

  var TIMING = [
    { value: 'arrival', label: 'When I land', hint: 'Sent once your phone is in town' },
    { value: 'before', label: 'Heads-up before', hint: 'A few days ahead' },
    { value: 'now', label: 'Right now', hint: 'Send the heads-up today' }
  ];

  function ScheduleCheckIn(props) {
    var sCity = useState(props.defaultCity || ''), sFrom = useState(props.defaultFrom || ''), sTo = useState(props.defaultTo || '');
    var sTiming = useState(props.defaultTiming || 'arrival'), sDays = useState(props.defaultDaysBefore || 3), sNote = useState(props.defaultNote || '');
    var city = sCity[0], from = sFrom[0], to = sTo[0], timing = sTiming[0], days = sDays[0], note = sNote[0];
    var preview = timing === 'arrival'
      ? 'Landed in ' + (city || '…') + '.' + (to ? ' Around till ' + fmt(to) + '.' : '')
      : 'Heading to ' + (city || '…') + (from ? ' ' + range(from, to) : '') + '.';
    var sendWhen = timing === 'arrival' ? 'when you arrive' : timing === 'now' ? 'today' : days + (days === 1 ? ' day' : ' days') + ' before';
    function submit() { props.onSchedule && props.onSchedule({ city: city, from: from, to: to, timing: timing, daysBefore: days, note: note }); }
    return h('section', { className: cx('ci-sheet', props.className) },
      h('h3', { className: 'ci-sheet-title' }, 'Plan a check-in'),
      h('p', { className: 'ci-sheet-sub' }, 'Going somewhere soon? Line it up now and forget about it.'),
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'City'),
        h('input', { className: 'ci-input', value: city, placeholder: 'Where to?', onChange: function (e) { sCity[1](e.target.value); } })),
      h('div', { className: 'ci-field-row' },
        h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Arriving'),
          h('input', { className: 'ci-input', type: 'date', value: from, onChange: function (e) { sFrom[1](e.target.value); } })),
        h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Leaving'),
          h('input', { className: 'ci-input', type: 'date', value: to, min: from || undefined, onChange: function (e) { sTo[1](e.target.value); } }))),
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'Let them know'),
        h(Choice, { label: 'Let them know', options: TIMING, value: timing, onChange: sTiming[1] })),
      timing === 'before' ? h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'How far ahead'),
        h(Choice, { label: 'How far ahead', value: String(days), onChange: function (v) { sDays[1](+v); },
          options: [{ value: '1', label: '1 day' }, { value: '3', label: '3 days' }, { value: '7', label: '1 week' }] })) : null,
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Add a line (optional)'),
        h('input', { className: 'ci-input', value: note, maxLength: 80, placeholder: 'e.g. Mostly free evenings', onChange: function (e) { sNote[1](e.target.value); } })),
      h('div', { className: 'ci-preview' },
        h('div', { className: 'ci-label' }, 'Friends will see'),
        h('p', { className: 'ci-preview-text' }, preview),
        note ? h('p', { className: 'ci-preview-note' }, note) : null),
      h('div', { className: 'ci-sheet-foot' },
        h('span', { className: 'ci-sheet-count' }, (props.audience != null ? props.audience + ' friends' : 'Your friends there') + ' · sent ' + sendWhen,
          props.onEditAudience ? h('button', { type: 'button', className: 'ci-link', onClick: props.onEditAudience }, 'Edit') : null),
        h(CheckInButton, { state: 'idle', onClick: submit, disabled: !city || !from }, 'Schedule')));
  }

  window.CheckIn = Object.assign(window.CheckIn || {}, {
    PresenceDot: PresenceDot, CheckInButton: CheckInButton, Toggle: Toggle, FriendRow: FriendRow,
    ArrivalBanner: ArrivalBanner, CheckInCard: CheckInCard, HideFriendsSheet: HideFriendsSheet, ScheduleCheckIn: ScheduleCheckIn
  });
})();

(function () {
  var R = React, h = R.createElement, useState = R.useState, useEffect = R.useEffect, useRef = R.useRef;
  var C = window.CheckIn;
  // ---------- Sample data (prototype only) ----------
  var TODAY = iso(new Date());
  function D(n) { return addDays(TODAY, n); }
  var ME = 'Jordan';
  var COORDS = {"OPO": [41.15, -8.61], "LIS": [38.72, -9.14], "MAD": [40.42, -3.7], "BCN": [41.39, 2.17], "CDG": [48.86, 2.35], "LHR": [51.51, -0.13], "EDI": [55.95, -3.19], "DUB": [53.35, -6.26], "AMS": [52.37, 4.9], "BER": [52.52, 13.4], "FRA": [50.11, 8.68], "CPH": [55.68, 12.57], "ARN": [59.33, 18.07], "OSL": [59.91, 10.75], "KEF": [64.15, -21.94], "VIE": [48.21, 16.37], "PRG": [50.08, 14.44], "FCO": [41.9, 12.5], "MXP": [45.46, 9.19], "ATH": [37.98, 23.73], "IST": [41.01, 28.98], "RAK": [31.63, -8.01], "CPT": [-33.92, 18.42], "NBO": [-1.29, 36.82], "TLV": [32.09, 34.78], "DXB": [25.2, 55.27], "BOM": [19.08, 72.88], "BKK": [13.76, 100.5], "SIN": [1.35, 103.82], "DPS": [-8.65, 115.22], "HKG": [22.32, 114.17], "ICN": [37.57, 126.98], "HND": [35.68, 139.69], "SYD": [-33.87, 151.21], "MEL": [-37.81, 144.96], "AKL": [-36.85, 174.76], "HNL": [21.31, -157.86], "JFK": [40.71, -74.01], "LAX": [34.05, -118.24], "SFO": [37.77, -122.42], "ORD": [41.88, -87.63], "AUS": [30.27, -97.74], "MIA": [25.76, -80.19], "SEA": [47.61, -122.33], "BOS": [42.36, -71.06], "DCA": [38.91, -77.04], "DEN": [39.74, -104.99], "BNA": [36.16, -86.78], "MSY": [29.95, -90.07], "YYZ": [43.65, -79.38], "YUL": [45.5, -73.57], "YVR": [49.28, -123.12], "MEX": [19.43, -99.13], "OAX": [17.07, -96.73], "BOG": [4.71, -74.07], "MDE": [6.24, -75.58], "LIM": [-12.05, -77.04], "SCL": [-33.45, -70.67], "EZE": [-34.6, -58.38], "GRU": [-23.55, -46.63], "GIG": [-22.91, -43.17]};
  var CITIES = [
    ['Porto', 'Portugal', 'OPO', ['Ribeira', 'Baixa', 'Cedofeita', 'Foz do Douro']],
    ['Lisbon', 'Portugal', 'LIS', ['Alfama', 'Baixa-Chiado', 'Príncipe Real', 'Belém']],
    ['Madrid', 'Spain', 'MAD', ['Malasaña', 'La Latina', 'Salamanca']], ['Barcelona', 'Spain', 'BCN', ['Gràcia', 'El Born', 'Eixample']],
    ['Paris', 'France', 'CDG', ['Le Marais', 'Saint-Germain', 'Montmartre']], ['London', 'United Kingdom', 'LHR', ['Shoreditch', 'Soho', 'Peckham']],
    ['Edinburgh', 'United Kingdom', 'EDI'], ['Dublin', 'Ireland', 'DUB'], ['Amsterdam', 'Netherlands', 'AMS', ['Jordaan', 'De Pijp']],
    ['Berlin', 'Germany', 'BER', ['Kreuzberg', 'Neukölln', 'Mitte']], ['Frankfurt', 'Germany', 'FRA'], ['Copenhagen', 'Denmark', 'CPH'],
    ['Stockholm', 'Sweden', 'ARN'], ['Oslo', 'Norway', 'OSL'], ['Reykjavík', 'Iceland', 'KEF'], ['Vienna', 'Austria', 'VIE'],
    ['Prague', 'Czechia', 'PRG'], ['Rome', 'Italy', 'FCO', ['Trastevere', 'Monti']], ['Milan', 'Italy', 'MXP'], ['Athens', 'Greece', 'ATH'],
    ['Istanbul', 'Türkiye', 'IST'], ['Marrakesh', 'Morocco', 'RAK'], ['Cape Town', 'South Africa', 'CPT'], ['Nairobi', 'Kenya', 'NBO'],
    ['Tel Aviv', 'Israel', 'TLV'], ['Dubai', 'United Arab Emirates', 'DXB'], ['Mumbai', 'India', 'BOM'], ['Bangkok', 'Thailand', 'BKK'],
    ['Singapore', 'Singapore', 'SIN'], ['Bali', 'Indonesia', 'DPS'], ['Hong Kong', 'Hong Kong', 'HKG'], ['Seoul', 'South Korea', 'ICN'],
    ['Tokyo', 'Japan', 'HND', ['Shibuya', 'Shimokitazawa', 'Nakameguro']], ['Sydney', 'Australia', 'SYD'], ['Melbourne', 'Australia', 'MEL'],
    ['Auckland', 'New Zealand', 'AKL'], ['Honolulu', 'United States', 'HNL'],
    ['New York', 'United States', 'JFK', ['Brooklyn', 'Lower Manhattan', 'Midtown', 'Upper West Side']],
    ['Los Angeles', 'United States', 'LAX', ['Silver Lake', 'Santa Monica', 'Downtown']], ['San Francisco', 'United States', 'SFO', ['Mission', 'Hayes Valley']],
    ['Chicago', 'United States', 'ORD'], ['Austin', 'United States', 'AUS'], ['Miami', 'United States', 'MIA'], ['Seattle', 'United States', 'SEA'],
    ['Boston', 'United States', 'BOS'], ['Washington', 'United States', 'DCA'], ['Denver', 'United States', 'DEN'], ['Nashville', 'United States', 'BNA'],
    ['New Orleans', 'United States', 'MSY'], ['Toronto', 'Canada', 'YYZ'], ['Montréal', 'Canada', 'YUL'], ['Vancouver', 'Canada', 'YVR'],
    ['Mexico City', 'Mexico', 'MEX', ['Roma Norte', 'Condesa', 'Coyoacán', 'Polanco']], ['Oaxaca', 'Mexico', 'OAX'],
    ['Bogotá', 'Colombia', 'BOG'], ['Medellín', 'Colombia', 'MDE'], ['Lima', 'Peru', 'LIM'], ['Santiago', 'Chile', 'SCL'],
    ['Buenos Aires', 'Argentina', 'EZE'], ['São Paulo', 'Brazil', 'GRU'], ['Rio de Janeiro', 'Brazil', 'GIG']
  ].map(function (c) { var ll = COORDS[c[2]] || [0, 0]; return { name: c[0], country: c[1], code: c[2], hoods: c[3] || [], lat: ll[0], lon: ll[1] }; });
  function cityByName(n) { return CITIES.filter(function (c) { return c.name === n; })[0]; }

  // Each friend's CURRENT city. hidden: they keep it private; we only use it to deliver check-ins.
  var FRIENDS = [
    { id: 'maya', name: 'Maya Lindqvist', city: 'Porto' }, { id: 'jonah', name: 'Jonah Reyes', city: 'Porto' },
    { id: 'sam', name: 'Sam Okafor', city: 'Porto' }, { id: 'ines', name: 'Inês Costa', city: 'Porto', hidden: true },
    { id: 'chris', name: 'Chris Vale', city: 'Porto' }, { id: 'kai', name: 'Kai Tanaka', city: 'Berlin' },
    { id: 'rita', name: 'Rita Alves', city: 'Lisbon' }, { id: 'tomas', name: 'Tomás Silva', city: 'Lisbon' }, { id: 'noor', name: 'Noor Haddad', city: 'Lisbon' },
    { id: 'ana', name: 'Ana Ruiz', city: 'Mexico City' }, { id: 'leo', name: 'Leo Martínez', city: 'Mexico City' },
    { id: 'dee', name: 'Dee Park', city: 'Mexico City' }, { id: 'ola', name: 'Ola Bergström', city: 'Mexico City', hidden: true },
    { id: 'priya', name: 'Priya Nair', city: 'New York' }, { id: 'marco', name: 'Marco Bianchi', city: 'New York' },
    { id: 'lena', name: 'Lena Fischer', city: 'Berlin' }
  ];
  function friend(id) { return FRIENDS.filter(function (f) { return f.id === id; })[0]; }
  function first(id) { return friend(id).name.split(' ')[0]; }
  // Trips friends have shared with you (heads-ups). Used for overlaps.
  var FRIEND_TRIPS = [
    { friend: 'kai', city: 'Porto', from: D(5), to: D(8) },
    { friend: 'priya', city: 'Lisbon', from: D(16), to: D(18) },
    { friend: 'lena', city: 'Mexico City', from: D(43), to: D(47) }
  ];
  var LISTS = [
    { id: 'close', name: 'Close friends', members: ['maya', 'priya', 'rita', 'ana', 'kai'] },
    { id: 'work', name: 'Work', members: ['jonah', 'tomas', 'dee', 'marco'] },
    { id: 'college', name: 'College', members: ['sam', 'leo', 'noor', 'lena', 'ines'] }
  ];
  // Check-ins from friends, by the city you're in
  var INBOX = {
    Porto: [
      { id: 'lena', sender: 'Lena', city: 'Porto', kind: 'now', window: 'Around till Wednesday · 2h ago', avail: 'Free evenings' },
      { id: 'kai', sender: 'Kai', city: 'Porto', kind: 'upcoming', window: rangeText(D(5), D(8)) + ' · heads-up', overlap: true }
    ],
    Lisbon: [{ id: 'priya', sender: 'Priya', city: 'Lisbon', kind: 'upcoming', window: rangeText(D(16), D(18)) + ' · heads-up' }],
    'Mexico City': [{ id: 'lena2', sender: 'Lena', city: 'Mexico City', kind: 'upcoming', window: rangeText(D(43), D(47)) + ' · heads-up' }]
  };
  var PAST = [
    { city: 'Mexico City', range: 'Sep 12–16', saw: ['ana', 'leo'] },
    { city: 'Berlin', range: 'Jul 3–7', saw: [] }
  ];
  // Sample flights. A live app would query a flight-data API for schedules, status and gates.
  var FLIGHTS = [
    { no: 'TP 208', airline: 'TAP Air Portugal', from: 'JFK', to: 'LIS', date: D(14), dep: '19:40', arr: '07:30', arrDate: D(15), status: 'scheduled', dTerm: '1', dGate: '6', aTerm: '1', belt: '—' },
    { no: 'TP 1953', airline: 'TAP Air Portugal', from: 'OPO', to: 'LIS', date: D(0), dep: '14:05', arr: '15:00', arrDate: D(0), status: 'air', progress: .62, dTerm: '—', dGate: '12', aTerm: '1', belt: '7' },
    { no: 'AM 405', airline: 'Aeroméxico', from: 'JFK', to: 'MEX', date: D(4), dep: '08:15', arr: '11:50', arrDate: D(4), status: 'delayed', delay: 35, dTerm: '1', dGate: '3', aTerm: '2', belt: '—' },
    { no: 'BA 178', airline: 'British Airways', from: 'JFK', to: 'LHR', date: D(11), dep: '09:30', arr: '21:25', arrDate: D(11), status: 'scheduled', dTerm: '8', dGate: '—', aTerm: '5', belt: '—' },
    { no: 'LH 401', airline: 'Lufthansa', from: 'JFK', to: 'FRA', date: D(24), dep: '17:50', arr: '07:40', arrDate: D(25), status: 'scheduled', dTerm: '1', dGate: '—', aTerm: '1', belt: '—' },
    { no: 'TP 1952', airline: 'TAP Air Portugal', from: 'LIS', to: 'OPO', date: D(-1), dep: '10:10', arr: '11:05', arrDate: D(-1), status: 'landed', progress: 1, dTerm: '1', dGate: '14', aTerm: '—', belt: '3' }
  ];
  function cityByCode(code) { return CITIES.filter(function (c) { return c.code === code; })[0]; }

  // Nearest known city to a GPS fix, computed on the phone. Coordinates never leave the device.
  function nearestCity(lat, lon) {
    var best = null, bestKm = 1e9;
    CITIES.forEach(function (c) {
      var r = Math.PI / 180, dLat = (c.lat - lat) * r, dLon = (c.lon - lon) * r;
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat * r) * Math.cos(c.lat * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var km = 12742 * Math.asin(Math.sqrt(a));
      if (km < bestKm) { bestKm = km; best = c; }
    });
    return { city: best, km: Math.round(bestKm) };
  }
  // ---------- Helpers ----------
  function parseDay(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function addDays(s, n) { var d = parseDay(s); d.setDate(d.getDate() + n); return iso(d); }
  function fmtDay(s) { return parseDay(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  function fmtWeekday(s) { return parseDay(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
  function rangeText(a, b) {
    if (!a) return '';
    if (!b || a === b) return fmtDay(a);
    var da = parseDay(a), db = parseDay(b);
    return da.getMonth() === db.getMonth() ? fmtDay(a) + '–' + db.getDate() : fmtDay(a) + ' – ' + fmtDay(b);
  }
  function overlap(a1, a2, b1, b2) {
    var s = a1 > b1 ? a1 : b1, e = (a2 || a1) < (b2 || b1) ? (a2 || a1) : (b2 || b1);
    return s <= e ? [s, e] : null;
  }
  function daysBetween(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 864e5); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function t12(hm, addMin) {
    var p = hm.split(':'), m = +p[0] * 60 + +p[1] + (addMin || 0); m = (m + 1440) % 1440;
    var hh = Math.floor(m / 60), mm = m % 60;
    return ((hh + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + (hh < 12 ? ' AM' : ' PM');
  }
  function cityLabel(c) { return c.name + ', ' + c.country; }
  function joinNames(a) { return a.length < 3 ? a.join(' and ') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  var DELAYS = [{ value: 'now', label: 'Right away' }, { value: '2h', label: 'In 2 hours' }, { value: 'morning', label: 'Tomorrow, 9 AM' }];
  function nowHM(addMin) { var d = new Date(); return t12(d.getHours() + ':' + d.getMinutes(), addMin || 0); }
  function delayLabel(r) { return r.delay === 'now' ? 'now' : r.delay === '2h' ? (r.at || nowHM(120)) : 'tomorrow 9 AM'; }
  var DURATION_TEXT = { once: 'for this check-in', trip: 'until you leave', weeks: 'for 2 weeks' };
  var AVAIL = ['Free evenings', 'Free this weekend', 'Mornings work', 'Pretty booked'];

  function Icon(props) {
    var p = { width: props.size || 24, height: props.size || 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
    switch (props.name) {
      case 'here': return h('svg', p, h('circle', { cx: 12, cy: 12, r: 2.5, fill: 'currentColor' }), h('circle', { cx: 12, cy: 12, r: 6 }), h('circle', { cx: 12, cy: 12, r: 9.5, opacity: .5 }));
      case 'around': return h('svg', p, h('circle', { cx: 9, cy: 8, r: 3.5 }), h('path', { d: 'M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5' }), h('circle', { cx: 17, cy: 9, r: 2.5 }), h('path', { d: 'M17 14.5c2.3 0 3.9 1.4 4.5 4' }));
      case 'their': return h('svg', p, h('rect', { x: 6, y: 2.5, width: 12, height: 19, rx: 3 }), h('path', { d: 'M10.5 18.5h3' }), h('circle', { cx: 12, cy: 9.5, r: 2, fill: 'currentColor' }), h('path', { d: 'M8.8 12.6a4.5 4.5 0 0 1 0-6.2M15.2 6.4a4.5 4.5 0 0 1 0 6.2' }));
      case 'you': return h('svg', p, h('path', { d: 'M12 3l7 3v5.5c0 4.3-2.9 8-7 9.5-4.1-1.5-7-5.2-7-9.5V6z' }), h('path', { d: 'M9 12l2 2 4-4' }));
      case 'plane': return h('svg', p, h('path', { d: 'M10.5 21l1.5-1v-5.5l8 3v-2l-8-5V4.5a1.5 1.5 0 0 0-3 0V10.5l-8 5v2l8-3V20l1.5 1' , transform: 'rotate(90 12 12)' }));
      case 'pin': return h('svg', p, h('path', { d: 'M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11-6.5 11z' }), h('circle', { cx: 12, cy: 10, r: 2.3 }));
      case 'lock': return h('svg', p, h('rect', { x: 5, y: 10.5, width: 14, height: 10, rx: 2.5 }), h('path', { d: 'M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5' }));
      default: return h('svg', p, h('rect', { x: 3.5, y: 5, width: 17, height: 15.5, rx: 3 }), h('path', { d: 'M3.5 10h17M8 3v4M16 3v4' }), h('circle', { cx: 15.5, cy: 15, r: 1.5, fill: 'currentColor' }));
    }
  }

  // ---------- Combobox (search-as-you-type dropdown) ----------
  function Combobox(p) {
    var sOpen = useState(false), open = sOpen[0];
    var sAct = useState(0), act = sAct[0];
    var items = (p.top ? [p.top] : []).concat(p.options);
    var listId = p.id + '-list';
    function pick(o) { sOpen[1](false); (o.onPick || p.onPick)(o); }
    function onKey(e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sOpen[1](true); sAct[1](Math.min(act + 1, items.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sAct[1](Math.max(act - 1, 0)); }
      else if (e.key === 'Enter') { if (open && items[act]) { e.preventDefault(); pick(items[act]); } else if (p.onEnter) { p.onEnter(); } }
      else if (e.key === 'Escape') { sOpen[1](false); }
    }
    return h('div', { className: 'cb' },
      p.label ? h('label', { className: 'ci-label', htmlFor: p.id }, p.label) : null,
      h('div', { className: 'cb-field' },
        p.icon ? h('span', { className: 'cb-icon' }, h(Icon, { name: p.icon, size: 18 })) : null,
        h('input', {
          id: p.id, className: 'ci-input cb-input' + (p.icon ? ' has-icon' : ''), value: p.query, placeholder: p.placeholder, autoComplete: 'off',
          role: 'combobox', 'aria-expanded': open, 'aria-controls': listId, 'aria-autocomplete': 'list',
          'aria-activedescendant': open && items[act] ? p.id + '-opt-' + act : undefined,
          onChange: function (e) { p.onQuery(e.target.value); sOpen[1](true); sAct[1](0); },
          onFocus: function (e) { sOpen[1](true); if (p.selectOnFocus) e.target.select(); },
          onBlur: function () { setTimeout(function () { sOpen[1](false); }, 120); },
          onKeyDown: onKey
        })),
      open && (items.length || p.empty) ? h('ul', { className: 'cb-list', id: listId, role: 'listbox' },
        items.length ? items.map(function (o, i) {
          return h('li', {
            key: o.key, id: p.id + '-opt-' + i, role: 'option', 'aria-selected': i === act, className: 'cb-opt' + (i === act ? ' on' : '') + (o.action ? ' action' : ''),
            onMouseDown: function (e) { e.preventDefault(); }, onMouseEnter: function () { sAct[1](i); }, onClick: function () { pick(o); }
          },
            o.icon ? h('span', { className: 'cb-opt-icon' }, h(Icon, { name: o.icon, size: 18 })) : null,
            h('span', { className: 'cb-opt-text' }, h('span', { className: 'cb-opt-primary' }, o.primary), o.secondary ? h('span', { className: 'cb-opt-secondary' }, o.secondary) : null),
            o.meta ? h('span', { className: 'cb-opt-meta' }, o.meta) : null);
        }) : h('li', { className: 'cb-empty', role: 'option', 'aria-disabled': true }, p.empty)) : null);
  }

  function cityOptions(q) {
    var n = norm(q.trim());
    var list = !n ? CITIES.slice(0, 8) : CITIES.filter(function (c) {
      return norm(c.name).indexOf(n) === 0 || norm(c.country).indexOf(n) === 0 || norm(c.code) === n || norm(c.name).indexOf(' ' + n) !== -1;
    }).slice(0, 8);
    return list.map(function (c) { return { key: c.name, primary: c.name, secondary: c.country, meta: c.code, city: c }; });
  }

  function CityPicker(p) {
    var s = useState(p.value ? cityLabel(cityByName(p.value)) : ''), q = s[0];
    var sLoc = useState(false);
    var sMsg = useState('');
    var showing = p.value && q === cityLabel(cityByName(p.value));
    var top = p.locate ? { key: '__locate', action: true, icon: 'pin', primary: sLoc[0] ? 'Finding you…' : 'Use my current location', secondary: 'Matched on your phone, city-level', onPick: function () {
      sLoc[1](true);
      locateCity(function (r) {
        sLoc[1](false);
        if (r.error) { sMsg[1](r.error); return; }
        sMsg[1](r.km > 80 ? 'Closest city we know is ' + r.city.name + ' (' + r.km + ' km away). Search for yours if that’s wrong.' : 'Found you in ' + r.city.name + '.');
        s[1](cityLabel(r.city)); p.onPick(r.city, true);
      });
    } } : null;
    return h('div', { className: 'cb-wrap' }, h(Combobox, {
      id: p.id, label: p.label, icon: 'pin', placeholder: p.placeholder || 'Search cities', query: q, selectOnFocus: true,
      onQuery: s[1], options: cityOptions(showing ? '' : q), top: top,
      empty: 'No match. Try the city name or airport code.',
      onPick: function (o) { s[1](cityLabel(o.city)); sMsg[1](''); p.onPick(o.city, false); }
    }), sMsg[0] ? h('p', { className: 'fine', role: 'status' }, sMsg[0]) : null);
  }
  function locateCity(cb) {
    if (!navigator.geolocation) { cb({ error: 'This browser can’t share location. Search for your city instead.' }); return; }
    navigator.geolocation.getCurrentPosition(function (pos) {
      cb(nearestCity(pos.coords.latitude, pos.coords.longitude));
    }, function (err) {
      cb({ error: err.code === 1 ? 'Location is off for Check In. Allow it in Settings › Privacy & Security › Location Services, or search for your city.' : 'Couldn’t get your location. Search for your city instead.' });
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  }

  // ---------- Flights ----------
  function flightStatus(f) {
    if (f.status === 'air') return { tone: 'air', text: 'In the air', sub: 'Lands ' + t12(f.arr) };
    if (f.status === 'delayed') return { tone: 'late', text: 'Delayed ' + f.delay + 'm', sub: 'Departs ' + t12(f.dep, f.delay) };
    if (f.status === 'landed') return { tone: 'ok', text: 'Landed', sub: 'Arrived ' + t12(f.arr) };
    var d = daysBetween(TODAY, f.date);
    return { tone: 'ok', text: 'On time', sub: d === 0 ? 'Departs today' : d === 1 ? 'Departs tomorrow' : 'Departs in ' + d + ' days' };
  }
  function FlightCard(p) {
    var f = p.flight, st = flightStatus(f), fc = cityByCode(f.from), tc = cityByCode(f.to);
    var nextDay = f.arrDate !== f.date;
    var prog = f.status === 'air' ? f.progress : f.status === 'landed' ? 1 : 0;
    if (p.compact) return h('div', { className: 'fl-mini' },
      h(Icon, { name: 'plane', size: 16 }),
      h('span', null, f.no + ' · ' + f.from + ' → ' + f.to + ' · ' + fmtDay(f.date) + ', ' + t12(f.dep)),
      h('span', { className: 'fl-pill ' + st.tone }, st.text));
    return h('article', { className: 'fl' },
      h('div', { className: 'fl-head' },
        h('div', null, h('div', { className: 'fl-no' }, f.no), h('div', { className: 'fl-air' }, f.airline + ' · ' + fmtWeekday(f.date))),
        h('div', { className: 'fl-status' }, h('span', { className: 'fl-pill ' + st.tone }, st.text), h('span', { className: 'fl-sub' }, st.sub))),
      h('div', { className: 'fl-route' },
        h('div', { className: 'fl-end' }, h('div', { className: 'fl-code' }, f.from), h('div', { className: 'fl-time' + (f.status === 'delayed' ? ' late' : '') }, t12(f.dep, f.delay)), h('div', { className: 'fl-city' }, fc ? fc.name : '')),
        h('div', { className: 'fl-track', 'aria-hidden': true },
          h('div', { className: 'fl-line' }, h('div', { className: 'fl-fill', style: { width: (prog * 100) + '%' } })),
          h('span', { className: 'fl-plane', style: { left: 'calc(' + (prog * 100) + '% - 9px)' } }, h(Icon, { name: 'plane', size: 18 }))),
        h('div', { className: 'fl-end right' }, h('div', { className: 'fl-code' }, f.to), h('div', { className: 'fl-time' }, t12(f.arr, f.delay) + (nextDay ? ' +1' : '')), h('div', { className: 'fl-city' }, tc ? tc.name : ''))),
      h('dl', { className: 'fl-facts' },
        h('div', null, h('dt', null, 'Terminal'), h('dd', null, f.dTerm)), h('div', null, h('dt', null, 'Gate'), h('dd', null, f.dGate)),
        h('div', null, h('dt', null, 'Arr. terminal'), h('dd', null, f.aTerm)), h('div', null, h('dt', null, 'Bags'), h('dd', null, f.belt))),
      p.children ? h('div', { className: 'fl-actions' }, p.children) : null);
  }

  function FlightLookup(p) {
    var sQ = useState(''), q = sQ[0];
    var sDate = useState(D(14)), date = sDate[0];
    var sRes = useState(null), res = sRes[0];
    var sBusy = useState(false);
    function find(num, d) {
      var key = norm(num).replace(/\s+/g, '');
      if (!/^[a-z0-9]{2}\d{1,4}$/.test(key)) { sRes[1]({ error: 'Enter a flight number like TP 208.' }); return; }
      sBusy[1](true);
      setTimeout(function () {
        sBusy[1](false);
        var f = FLIGHTS.filter(function (x) { return norm(x.no).replace(/\s+/g, '') === key; })[0];
        if (!f) { sRes[1]({ error: 'No flight ' + num.toUpperCase() + ' on ' + fmtDay(d) + '. Check the number and date.' }); return; }
        if (d && d !== f.date) {
          var shift = daysBetween(f.date, d);
          f = Object.assign({}, f, { date: d, arrDate: addDays(f.arrDate, shift), status: d > TODAY ? 'scheduled' : 'landed', delay: 0, progress: d > TODAY ? 0 : 1 });
        }
        sRes[1]({ flight: f });
      }, 450);
    }
    var n = norm(q).replace(/\s+/g, '');
    var opts = FLIGHTS.filter(function (f) {
      if (!n) return true;
      var fc = cityByCode(f.from), tc = cityByCode(f.to);
      return norm(f.no).replace(/\s+/g, '').indexOf(n) === 0 || norm(f.airline).indexOf(norm(q)) === 0 || (tc && norm(tc.name).indexOf(norm(q)) === 0) || (fc && norm(fc.name).indexOf(norm(q)) === 0);
    }).map(function (f) {
      return { key: f.no, primary: f.no + ' · ' + f.airline, secondary: (cityByCode(f.from) || {}).name + ' (' + f.from + ') → ' + (cityByCode(f.to) || {}).name + ' (' + f.to + ')', meta: fmtDay(f.date), flight: f };
    });
    return h('div', { className: 'fl-lookup' },
      h('div', { className: 'fl-form' },
        h('div', { className: 'fl-num' }, h(Combobox, {
          id: 'flight-no', label: 'Flight number', icon: 'plane', placeholder: 'e.g. TP 208', query: q, onQuery: sQ[1], options: opts,
          empty: 'Type the airline code and number', onEnter: function () { find(q, date); },
          onPick: function (o) { sQ[1](o.flight.no); sDate[1](o.flight.date); find(o.flight.no, o.flight.date); }
        })),
        h('label', { className: 'ci-field fl-date' }, h('span', { className: 'ci-label' }, 'Date'),
          h('input', { id: 'flight-date', className: 'ci-input', type: 'date', value: date, onChange: function (e) { sDate[1](e.target.value); } }))),
      h('button', { type: 'button', className: 'ci-quiet', onClick: function () { find(q, date); }, disabled: sBusy[0] }, sBusy[0] ? 'Looking up…' : 'Find flight'),
      res && res.error ? h('p', { className: 'err', role: 'alert' }, res.error) : null,
      res && res.flight ? h(FlightCard, { flight: res.flight },
        h(C.CheckInButton, { onClick: function () { p.onUse(res.flight); } }, 'Plan check-in for this flight')) : null,
      h('p', { className: 'fine' }, 'Sample flights for this prototype. The live app would pull schedules, delays and gates from a flight-data provider.'));
  }

  // ---------- Who hears ----------
  function recipients(city, s, listId) {
    var skip = (s.skips[city] && s.skips[city].ids) || [];
    var list = listId && listId !== 'everyone' ? s.lists.filter(function (l) { return l.id === listId; })[0].members : null;
    return FRIENDS.filter(function (f) {
      return f.city === city && s.never.indexOf(f.id) === -1 && skip.indexOf(f.id) === -1 && (!list || list.indexOf(f.id) !== -1);
    });
  }
  function visibleIn(city, s) { return FRIENDS.filter(function (f) { return f.city === city && !f.hidden && s.never.indexOf(f.id) === -1; }); }
  function notifText(kind, place, until, avail) {
    var title = kind === 'weekend' ? ME + ' is around ' + place + ' this weekend' : kind === 'tonight' ? ME + ' is free tonight in ' + place : ME + ' is in ' + place;
    var body = (kind === 'now' ? 'Around till ' + until + '.' : kind === 'weekend' ? 'Through Sunday.' : 'Around this evening.') + (avail && avail.length ? ' ' + avail.join(' · ') + '.' : '');
    return { title: title, body: body };
  }

  function Chips(p) {
    return h('div', { className: 'ci-choice', role: 'group', 'aria-label': p.label }, p.options.map(function (o) {
      var on = p.value.indexOf(o) !== -1;
      return h('button', { key: o, type: 'button', 'aria-pressed': on, className: 'ci-choice-opt chip' + (on ? ' ci-choice-on' : ''),
        onClick: function () { p.onChange(on ? p.value.filter(function (x) { return x !== o; }) : p.value.concat(o)); } }, h('span', { className: 'ci-choice-label' }, o));
    }));
  }
  function Seg(p) {
    return h('div', { className: 'ci-choice', role: 'radiogroup', 'aria-label': p.label }, p.options.map(function (o) {
      var on = o.value === p.value;
      return h('button', { key: o.value, type: 'button', role: 'radio', 'aria-checked': on, className: 'ci-choice-opt' + (on ? ' ci-choice-on' : ''), onClick: function () { p.onChange(o.value); } },
        h('span', { className: 'ci-choice-label' }, o.label), o.hint ? h('span', { className: 'ci-choice-hint' }, o.hint) : null);
    }));
  }
  function AudiencePicker(p) {
    return h(Seg, { label: 'Who hears', value: p.value, onChange: p.onChange,
      options: [{ value: 'everyone', label: 'Everyone there' }].concat(p.lists.map(function (l) { return { value: l.id, label: l.name }; })) });
  }

  // ---------- Check-in sheet ----------
  function CheckInSheet(p) {
    var s = p.state, city = cityByName(s.city);
    var sKind = useState('now'), kind = sKind[0];
    var sHood = useState(''), hood = sHood[0];
    var sAvail = useState([]), avail = sAvail[0];
    var sNote = useState('');
    var sDelay = useState(s.settings.delay), delay = sDelay[0];
    var sAud = useState('everyone'), aud = sAud[0];
    var who = recipients(s.city, s, aud).filter(function (f) { return !f.hidden; });
    var skip = (s.skips[s.city] && s.skips[s.city].ids) || [];
    var place = s.settings.precision === 'hood' && hood ? hood + ', ' + s.city : s.city;
    var n = notifText(kind, place, fmtWeekday(s.until).split(',')[0], avail);
    return h('section', { className: 'ci-sheet' },
      h('h3', { className: 'ci-sheet-title' }, 'Check in to ' + s.city),
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'What to share'),
        h(Seg, { label: 'What to share', value: kind, onChange: sKind[1], options: [{ value: 'now', label: 'Just arrived' }, { value: 'weekend', label: 'Around this weekend' }, { value: 'tonight', label: 'Free tonight' }] })),
      s.settings.precision === 'hood' && city.hoods.length ? h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Neighborhood (optional)'),
        h('select', { id: 'hood', className: 'ci-input', value: hood, onChange: function (e) { sHood[1](e.target.value); } },
          h('option', { value: '' }, 'Just the city'), city.hoods.map(function (x) { return h('option', { key: x, value: x }, x); }))) : null,
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'Availability (optional)'), h(Chips, { label: 'Availability', options: AVAIL, value: avail, onChange: sAvail[1] })),
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Add a line (optional)'),
        h('input', { id: 'ci-note', className: 'ci-input', value: sNote[0], maxLength: 80, placeholder: 'e.g. Staying by the river', onChange: function (e) { sNote[1](e.target.value); } })),
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'Who hears'), h(AudiencePicker, { lists: s.lists, value: aud, onChange: sAud[1] }),
        h('div', { className: 'who-line' }, plural(who.length, 'friend') + (skip.length ? ' · ' + skip.length + ' skipped' : ''),
          h('button', { type: 'button', className: 'ci-link', onClick: p.onChooseWho }, 'Choose who'))),
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'Send'), h(Seg, { label: 'Send', value: delay, onChange: sDelay[1], options: DELAYS })),
      h('div', { className: 'ci-preview' }, h('div', { className: 'ci-label' }, 'Friends will see'),
        h('p', { className: 'ci-preview-text' }, n.title), h('p', { className: 'ci-preview-note' }, n.body + (sNote[0] ? ' “' + sNote[0] + '”' : ''))),
      h('p', { className: 'fine' }, 'Only the city' + (place !== s.city ? ' and neighborhood' : '') + ' is shared, never your exact location. Friends who keep their city private will also hear if they’re here; you won’t see who.'),
      h('div', { className: 'ci-sheet-foot' }, h('button', { type: 'button', className: 'ci-link', onClick: p.onClose }, 'Cancel'),
        h(C.CheckInButton, { onClick: function () { p.onSend({ kind: kind, delay: delay, count: recipients(s.city, s, aud).length, title: n.title, body: n.body, avail: avail, note: sNote[0], place: place }); } },
          delay === 'now' ? 'Check in' : 'Schedule')));
  }

  // ---------- Screens ----------
  function HereScreen(p) {
    var s = p.state, city = s.city;
    var vis = visibleIn(city, s);
    var skip = (s.skips[city] && s.skips[city].ids) || [];
    var neverHere = FRIENDS.filter(function (f) { return f.city === city && s.never.indexOf(f.id) !== -1; });
    var sent = s.sent[city];
    var overlaps = FRIEND_TRIPS.filter(function (t) { return t.city === city && overlap(TODAY, s.until, t.from, t.to); });
    return h('div', { className: 'screen' },
      h('header', { className: 'top' },
        h('div', { className: 'wordmark' }, 'Check In'),
        h('button', { type: 'button', className: 'loc', onClick: p.onPickCity, 'aria-label': 'Current city: ' + city + '. Change' },
          h(C.PresenceDot, { state: s.settings.shareCity ? 'here' : 'away' }), h('span', null, city),
          !s.settings.shareCity ? h(Icon, { name: 'lock', size: 14 }) : null)),
      !s.settings.shareCity ? h('div', { className: 'banner-note' }, h(Icon, { name: 'lock', size: 16 }), 'Your city is hidden from friends. They only learn you’re here if you check in.') : null,
      h(C.ArrivalBanner, { city: city, friendsHere: vis.length, until: fmtWeekday(s.until).split(',')[0] + ', ' + fmtDay(s.until) },
        h(C.CheckInButton, { city: city, state: sent ? (sent.delay === 'now' ? 'sent' : 'scheduled') : 'idle', when: sent ? delayLabel(sent) : '', onClick: sent ? undefined : p.onCheckIn }),
        sent ? h('button', { type: 'button', className: 'ci-quiet', onClick: p.onUnsend }, sent.delay === 'now' ? 'Take it back' : 'Cancel') : null),
      h('p', { className: 'note' }, sent
        ? (sent.delay === 'now' ? plural(sent.count, 'friend') + ' got a quiet note that you’re around. No one has to reply.' : 'Sending ' + delayLabel(sent) + ' to ' + plural(sent.count, 'friend') + '. You can still cancel.')
        : 'Nothing is shared until you check in.'),
      overlaps.map(function (t) {
        return h('div', { key: t.friend, className: 'overlap' },
          h('span', { className: 'ov-tag' }, 'Overlap'),
          h('div', null, h('b', null, first(t.friend) + ' lands in ' + city + ' ' + fmtWeekday(t.from)), h('div', { className: 'muted' }, 'You’re both here ' + rangeText.apply(null, overlap(TODAY, s.until, t.from, t.to)) + '. They’ll see the overlap too once you check in.')));
      }),
      h('section', { className: 'block' },
        h('div', { className: 'block-head' }, h('h2', null, 'Friends in ' + city),
          skip.length ? h('span', { className: 'muted' }, 'Skipped ' + DURATION_TEXT[s.skips[city].duration]) : null),
        vis.length ? h('div', { className: 'ci-list' }, vis.map(function (f) {
          return h(C.FriendRow, { key: f.id, name: f.name, city: city, presence: 'here', skipped: skip.indexOf(f.id) !== -1 });
        })) : h('div', { className: 'empty' }, 'None of your friends are showing ' + city + ' right now.'),
        h('p', { className: 'fine' }, 'Friends who keep their city private aren’t listed. They’ll still hear if they’re here.' + (neverHere.length ? ' ' + plural(neverHere.length, 'person') .replace('persons', 'people') + ' on your never-notify list.' : ''))),
      h('section', { className: 'block' },
        h('div', { className: 'block-head' }, h('h2', null, 'Coming up'), h('button', { type: 'button', className: 'ci-link', onClick: p.goPlan }, 'Plan a trip')),
        s.trips.length ? h('div', { className: 'trips' }, s.trips.map(function (t) {
          var ovs = FRIEND_TRIPS.filter(function (x) { return x.city === t.city && overlap(t.from, t.to, x.from, x.to); });
          var fl = t.flight ? FLIGHTS.filter(function (f) { return f.no === t.flight; })[0] : null;
          return h('article', { key: t.id, className: 'trip' },
            h('div', { className: 'trip-top' },
              h('div', { className: 'trip-main' }, h('div', { className: 'trip-city' }, t.city), h('div', { className: 'trip-meta' }, rangeText(t.from, t.to))),
              h('button', { type: 'button', className: 'ci-link', onClick: function () { p.cancelTrip(t.id); } }, 'Cancel')),
            h('div', { className: 'trip-when' }, h(C.PresenceDot, { state: 'soon' }), timingText(t) + ' · ' + plural(t.count, 'friend')),
            fl ? h(FlightCard, { flight: fl, compact: true }) : null,
            ovs.map(function (x) { return h('div', { key: x.friend, className: 'ov-line' }, h('span', { className: 'ov-tag' }, 'Overlap'), first(x.friend) + '’s there ' + rangeText.apply(null, overlap(t.from, t.to, x.from, x.to)) + ' too'); }));
        })) : h('div', { className: 'empty' }, 'No trips lined up.')),
      h('section', { className: 'block' },
        h('div', { className: 'block-head' }, h('h2', null, 'Past trips')),
        h('div', { className: 'trips' }, s.past.map(function (t, i) {
          return h('article', { key: t.city, className: 'memory' },
            h('div', { className: 'trip-top' }, h('div', { className: 'trip-main' }, h('div', { className: 'trip-city' }, t.city), h('div', { className: 'trip-meta' }, t.range))),
            t.saw.length ? h('p', { className: 'mem-saw' }, 'You saw ' + joinNames(t.saw.map(first)) + '.')
              : h('div', { className: 'mem-ask' }, h('span', { className: 'muted' }, 'Who did you see? Only you see this.'),
                h(Chips, { label: 'Who did you see', options: FRIENDS.filter(function (f) { return f.city === t.city; }).map(function (f) { return first(f.id); }), value: [], onChange: function (v) { p.markSaw(i, v); } })));
        }))));
  }
  function timingText(t) {
    return t.timing === 'arrival' ? (t.flight ? 'Asks you when ' + t.flight + ' lands' : 'Asks you when you land') : t.timing === 'now' ? 'Heads-up sent today'
      : 'Heads-up ' + t.daysBefore + (t.daysBefore === 1 ? ' day' : ' days') + ' before';
  }

  function AroundScreen(p) {
    var s = p.state;
    var items = (INBOX[s.city] || []).filter(function (c) { return !s.paused.some(function (x) { return x.id === c.id.replace(/\d$/, ''); }); });
    var mode = s.settings.delivery;
    return h('div', { className: 'screen' },
      h('header', { className: 'top' }, h('div', { className: 'wordmark' }, 'Around you')),
      h('p', { className: 'lede' }, 'Friends checking in to ' + s.city + '. Nothing here needs an answer. ' +
        (mode === 'daily' ? 'You get these in one summary at 6 PM.' : mode === 'weekly' ? 'You get these in one summary on Sundays.' : 'You get these as they happen.')),
      items.length ? h('div', { className: 'cards' }, items.map(function (c) {
        return h('div', { key: c.id, className: 'card-wrap' },
          c.overlap ? h('div', { className: 'ov-line' }, h('span', { className: 'ov-tag' }, 'Overlap'), 'You’re both in ' + s.city + ' ' + rangeText.apply(null, overlap(TODAY, s.until, D(5), D(8)))) : null,
          h(C.CheckInCard, { sender: c.sender, city: c.city, kind: c.kind, window: c.window + (c.avail ? ' · ' + c.avail : ''), note: c.note, onSayHi: function () { p.onSayHi(c); } }),
          s.said[c.id] ? h('div', { className: 'said' }, 'You said: “' + s.said[c.id] + '”') : null);
      })) : h('div', { className: 'empty' }, 'No check-ins in ' + s.city + ' right now.'));
  }

  function PlanForm(p) {
    var s = p.state, d = p.draft || {};
    var sCity = useState(d.city || ''), city = sCity[0];
    var sFrom = useState(d.from || ''), from = sFrom[0];
    var sTo = useState(d.to || ''), to = sTo[0];
    var sTiming = useState(d.flight ? 'arrival' : 'before'), timing = sTiming[0];
    var sDays = useState(3), days = sDays[0];
    var sAud = useState('everyone'), aud = sAud[0];
    var sAvail = useState([]), avail = sAvail[0];
    var sNote = useState('');
    var ovs = city && from ? FRIEND_TRIPS.filter(function (x) { return x.city === city && overlap(from, to || from, x.from, x.to); }) : [];
    var count = city ? recipients(city, s, aud).length : 0;
    var visCount = city ? recipients(city, s, aud).filter(function (f) { return !f.hidden; }).length : 0;
    var preview = timing === 'arrival' ? 'Landed in ' + (city || '…') + '.' + (to ? ' Around till ' + fmtDay(to) + '.' : '')
      : 'Heading to ' + (city || '…') + (from ? ' ' + rangeText(from, to) : '') + '.';
    if (avail.length) preview += ' ' + avail.join(' · ') + '.';
    return h('section', { className: 'ci-sheet' },
      d.flight ? h(FlightCard, { flight: d.flight, compact: true }) : h(CityPicker, { id: 'plan-city', label: 'Where to?', value: city, onPick: function (c) { sCity[1](c.name); } }),
      h('div', { className: 'ci-field-row' },
        h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Arriving'), h('input', { id: 'plan-from', className: 'ci-input', type: 'date', value: from, min: TODAY, onChange: function (e) { sFrom[1](e.target.value); } })),
        h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Leaving'), h('input', { id: 'plan-to', className: 'ci-input', type: 'date', value: to, min: from || TODAY, onChange: function (e) { sTo[1](e.target.value); } }))),
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'Let them know'),
        h(Seg, { label: 'Let them know', value: timing, onChange: sTiming[1], options: [
          { value: 'arrival', label: 'When I land', hint: d.flight ? 'We ask you once ' + d.flight.no + ' lands' : 'We ask you first' },
          { value: 'before', label: 'Heads-up before', hint: 'A few days ahead' }, { value: 'now', label: 'Right now', hint: 'Send the heads-up today' }] })),
      timing === 'before' ? h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'How far ahead'),
        h(Seg, { label: 'How far ahead', value: String(days), onChange: function (v) { sDays[1](+v); }, options: [{ value: '1', label: '1 day' }, { value: '3', label: '3 days' }, { value: '7', label: '1 week' }] })) : null,
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'Who hears'), h(AudiencePicker, { lists: s.lists, value: aud, onChange: sAud[1] })),
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'Availability (optional)'), h(Chips, { label: 'Availability', options: AVAIL, value: avail, onChange: sAvail[1] })),
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Add a line (optional)'),
        h('input', { id: 'plan-note', className: 'ci-input', value: sNote[0], maxLength: 80, placeholder: 'e.g. Mostly free evenings', onChange: function (e) { sNote[1](e.target.value); } })),
      ovs.map(function (x) {
        return h('div', { key: x.friend, className: 'overlap' }, h('span', { className: 'ov-tag' }, 'Overlap'),
          h('div', null, h('b', null, first(x.friend) + ' will be in ' + city + ' ' + rangeText(x.from, x.to)), h('div', { className: 'muted' }, 'You’ll overlap ' + rangeText.apply(null, overlap(from, to || from, x.from, x.to)) + '. You both get a note about it.')));
      }),
      h('div', { className: 'ci-preview' }, h('div', { className: 'ci-label' }, 'Friends will see'), h('p', { className: 'ci-preview-text' }, preview), sNote[0] ? h('p', { className: 'ci-preview-note' }, sNote[0]) : null),
      h('div', { className: 'ci-sheet-foot' },
        h('span', { className: 'ci-sheet-count' }, city ? plural(visCount, 'friend') + ' there' + (count > visCount ? ', plus private ones' : '') : 'Pick a city'),
        h(C.CheckInButton, { disabled: !city || !from, onClick: function () {
          p.onSchedule({ city: city, from: from, to: to, timing: timing, daysBefore: days, count: count, flight: d.flight ? d.flight.no : null, avail: avail, note: sNote[0] });
        } }, 'Schedule')));
  }

  function PlanScreen(p) {
    var sMode = useState('flight'), mode = sMode[0];
    var sDraft = useState(null), draft = sDraft[0];
    return h('div', { className: 'screen' },
      h('header', { className: 'top' }, h('div', { className: 'wordmark' }, 'Plan a trip')),
      h(Seg, { label: 'How to plan', value: mode, onChange: function (v) { sMode[1](v); sDraft[1](null); }, options: [{ value: 'flight', label: 'From a flight' }, { value: 'city', label: 'Pick a city' }] }),
      mode === 'flight' && !draft ? h(FlightLookup, { onUse: function (f) { sDraft[1]({ flight: f, city: cityByCode(f.to).name, from: f.arrDate }); } }) : null,
      mode === 'flight' && draft ? h('button', { type: 'button', className: 'ci-link back', onClick: function () { sDraft[1](null); } }, '‹ Different flight') : null,
      mode === 'city' || draft ? h(PlanForm, { key: (draft ? draft.flight.no : 'city') + p.formKey, state: p.state, draft: draft, onSchedule: p.onSchedule }) : null);
  }

  function SayHi(p) {
    var s = useState(''), text = s[0];
    var ideas = p.card.kind === 'upcoming' ? ['Nice, I’m around that week', 'Have a good trip'] : ['Welcome!', 'Free for a coffee if you are'];
    return h('div', { className: 'ci-sheet' },
      h('h3', { className: 'ci-sheet-title' }, 'Say hi to ' + p.card.sender),
      h('p', { className: 'ci-sheet-sub' }, 'Totally optional. Keep it light.'),
      h('div', { className: 'ci-choice' }, ideas.map(function (i) { return h('button', { key: i, type: 'button', className: 'ci-choice-opt', onClick: function () { s[1](i); } }, h('span', { className: 'ci-choice-label' }, i)); })),
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Message'),
        h('input', { id: 'sayhi-text', className: 'ci-input', value: text, maxLength: 120, placeholder: 'Write something short', onChange: function (e) { s[1](e.target.value); } })),
      h('div', { className: 'ci-sheet-foot' }, h('button', { type: 'button', className: 'ci-link', onClick: p.onClose }, 'Not now'),
        h(C.CheckInButton, { disabled: !text.trim(), onClick: function () { p.onSend(text.trim()); } }, 'Send')));
  }

  function Row(p) {
    return h('div', { className: 'set-row' },
      h('div', { className: 'set-text' }, h('div', { className: 'set-label' }, p.label), p.hint ? h('div', { className: 'set-hint' }, p.hint) : null), p.control || null);
  }

  function YouScreen(p) {
    var s = p.state, st = s.settings;
    function set(k, v) { var o = {}; o[k] = v; p.setSettings(Object.assign({}, st, o)); }
    var skipCities = Object.keys(s.skips).filter(function (c) { return s.skips[c].ids.length; });
    return h('div', { className: 'screen' },
      h('header', { className: 'top' }, h('div', { className: 'wordmark' }, 'Privacy')),
      h('p', { className: 'lede' }, 'Check In never sends anything on its own and never shares your exact location.'),
      h('section', { className: 'block' }, h('h2', { className: 'set-h' }, 'Your city'),
        h('div', { className: 'set-group' },
          h(Row, { label: 'Show my current city', hint: st.shareCity ? 'Friends see which city you’re in.' : 'Hidden. Friends only learn where you are when you check in.',
            control: h(C.Toggle, { checked: st.shareCity, label: 'Show my current city', onChange: function (v) { set('shareCity', v); } }) }),
          !st.shareCity ? h(Row, { label: 'Still get check-ins where I am', hint: 'Friends won’t see your city, but their check-ins can still reach you.',
            control: h(C.Toggle, { checked: st.receiveHidden, label: 'Still get check-ins where I am', onChange: function (v) { set('receiveHidden', v); } }) }) : null,
          h(Row, { label: 'How precise', hint: 'Neighborhood is always optional, per check-in.' }),
          h('div', { className: 'set-pad' }, h(Seg, { label: 'How precise', value: st.precision, onChange: function (v) { set('precision', v); }, options: [{ value: 'city', label: 'City only' }, { value: 'hood', label: 'Allow neighborhood' }] })),
          h(Row, { label: 'Location access', hint: 'City-level, only while you use the app. When you land, we ask before anything is sent.' }))),
      h('section', { className: 'block' }, h('h2', { className: 'set-h' }, 'When you check in'),
        h('div', { className: 'set-group' },
          h(Row, { label: 'Default send time', hint: 'A delay means friends don’t know the moment you arrived.' }),
          h('div', { className: 'set-pad' }, h(Seg, { label: 'Default send time', value: st.delay, onChange: function (v) { set('delay', v); }, options: DELAYS })))),
      h('section', { className: 'block' }, h('div', { className: 'block-head' }, h('h2', { className: 'set-h' }, 'Never notify'), h('button', { type: 'button', className: 'ci-link', onClick: p.onAddNever }, 'Add someone')),
        h('div', { className: 'set-group' },
          s.never.length ? s.never.map(function (id) {
            return h(Row, { key: id, label: friend(id).name, hint: 'Never gets your check-ins or heads-ups. They aren’t told.',
              control: h('button', { type: 'button', className: 'ci-link', onClick: function () { p.setNever(s.never.filter(function (x) { return x !== id; })); } }, 'Remove') });
          }) : h(Row, { label: 'Nobody', hint: 'Permanent, unlike skipping someone for one trip.' }))),
      h('section', { className: 'block' }, h('h2', { className: 'set-h' }, 'Skipped for now'),
        h('div', { className: 'set-group' },
          skipCities.length ? skipCities.map(function (c) {
            return h(Row, { key: c, label: joinNames(s.skips[c].ids.map(first)) + ' in ' + c, hint: 'Skipped ' + DURATION_TEXT[s.skips[c].duration] + ', then included again.',
              control: h('button', { type: 'button', className: 'ci-link', onClick: function () { p.clearSkip(c); } }, 'Include') });
          }) : h(Row, { label: 'Nobody skipped' }))),
      h('section', { className: 'block' }, h('h2', { className: 'set-h' }, 'Lists'),
        h('div', { className: 'set-group' }, s.lists.map(function (l) {
          return h(Row, { key: l.id, label: l.name, hint: joinNames(l.members.slice(0, 3).map(first)) + (l.members.length > 3 ? ' and ' + (l.members.length - 3) + ' more' : ''),
            control: h('button', { type: 'button', className: 'ci-link', onClick: function () { p.onEditList(l.id); } }, 'Edit') });
        }))),
      h('section', { className: 'block' }, h('h2', { className: 'set-h' }, 'Check-ins you get'),
        h('div', { className: 'set-group' },
          h(Row, { label: 'Delivery' }),
          h('div', { className: 'set-pad' }, h(Seg, { label: 'Delivery', value: st.delivery, onChange: function (v) { set('delivery', v); }, options: [{ value: 'instant', label: 'As they happen' }, { value: 'daily', label: 'Daily at 6 PM' }, { value: 'weekly', label: 'Sundays' }] })),
          h(Row, { label: 'One per friend per week', hint: 'Extra check-ins from the same friend wait for the next week.',
            control: h(C.Toggle, { checked: st.weekly, label: 'One per friend per week', onChange: function (v) { set('weekly', v); } }) }),
          s.paused.map(function (x) {
            return h(Row, { key: x.id, label: friend(x.id).name + ' is paused', hint: 'Until ' + x.until + '. They aren’t told.',
              control: h('button', { type: 'button', className: 'ci-link', onClick: function () { p.setPaused(s.paused.filter(function (y) { return y.id !== x.id; })); } }, 'Resume') });
          }))),
      h('section', { className: 'block' }, h('h2', { className: 'set-h' }, 'Support'), h('div', { className: 'set-group' }, h(Row, { label: 'Help, bugs & what’s new', hint: 'Report a problem, get support, see recent fixes.', control: h('button', { type: 'button', className: 'ci-link', onClick: p.onHelp }, 'Open') }))));
  }

  function FriendSearch(p) {
    var s = useState(''), q = s[0];
    var opts = FRIENDS.filter(function (f) { return p.exclude.indexOf(f.id) === -1 && (!q || norm(f.name).indexOf(norm(q)) !== -1); })
      .map(function (f) { return { key: f.id, primary: f.name, secondary: f.hidden ? 'City private' : 'In ' + f.city, f: f }; });
    return h('div', { className: 'ci-sheet' },
      h('h3', { className: 'ci-sheet-title' }, 'Never notify'),
      h('p', { className: 'ci-sheet-sub' }, 'They won’t get any of your check-ins, anywhere, and won’t be told.'),
      h(Combobox, { id: 'never-search', label: 'Search friends', placeholder: 'Name', query: q, onQuery: s[1], options: opts, empty: 'No friends match', onPick: function (o) { p.onPick(o.f.id); } }),
      h('div', { className: 'sheet-spacer' }),
      h('div', { className: 'ci-sheet-foot' }, h('span'), h('button', { type: 'button', className: 'ci-quiet', onClick: p.onClose }, 'Done')));
  }

  function ListEditor(p) {
    return h('div', { className: 'ci-sheet' },
      h('h3', { className: 'ci-sheet-title' }, p.list.name),
      h('p', { className: 'ci-sheet-sub' }, 'Only you see your lists.'),
      h('div', { className: 'ci-list' }, FRIENDS.map(function (f) {
        var on = p.list.members.indexOf(f.id) !== -1;
        return h(C.FriendRow, { key: f.id, name: f.name, city: f.hidden ? 'City private' : 'In ' + f.city,
          action: h(C.Toggle, { checked: on, label: (on ? 'Remove ' : 'Add ') + f.name, onChange: function (v) { p.onChange(v ? p.list.members.concat(f.id) : p.list.members.filter(function (x) { return x !== f.id; })); } }) });
      })),
      h('div', { className: 'ci-sheet-foot' }, h('span', { className: 'ci-sheet-count' }, plural(p.list.members.length, 'person').replace('persons', 'people')), h('button', { type: 'button', className: 'ci-quiet', onClick: p.onClose }, 'Done')));
  }

  function CitySheet(p) {
    return h('div', { className: 'ci-sheet' },
      h('h3', { className: 'ci-sheet-title' }, 'Where are you?'),
      h('p', { className: 'ci-sheet-sub' }, 'Use your location or search. Your position is matched to a city on your phone and never sent anywhere.'),
      h(CityPicker, { id: 'here-city', label: 'City', value: p.city, locate: true, onPick: function (c, auto) { if (!auto || c) p.onPick(c.name, auto); } }),
      h('div', { className: 'sheet-spacer' }),
      h('div', { className: 'ci-sheet-foot' }, h('span'), h('button', { type: 'button', className: 'ci-quiet', onClick: p.onClose }, 'Done')));
  }

  function Sheet(p) {
    useEffect(function () {
      function onKey(e) { if (e.key === 'Escape') p.onClose(); }
      document.addEventListener('keydown', onKey); return function () { document.removeEventListener('keydown', onKey); };
    }, []);
    return h('div', { className: 'sheet-layer' },
      h('div', { className: 'sheet-backdrop', onClick: p.onClose }),
      h('div', { className: 'sheet-body', role: 'dialog', 'aria-modal': true, 'aria-label': p.label }, h('div', { className: 'sheet-grip', 'aria-hidden': true }), p.children));
  }
  // ---------- Help, bug reports and release notes ----------
  var APP_VERSION = '0.4.0';
  var REPO = 'aaronmoradi/aaronmoradi.github.io';
  var CHANGELOG = [
    { v: '0.4.0', date: 'Oct 25, 2026', title: 'First iPhone test build', items: [
      'Installable from Safari: Share › Add to Home Screen.',
      '“Use my current location” now uses your real location, matched to a city on your phone.',
      'Your check-ins, trips and settings are saved between launches.',
      'Report bugs and ask for help from Privacy › Help.',
      'Sample dates now move with today’s date.'] },
    { v: '0.3.0', date: 'Oct 19, 2026', title: 'Privacy, flights and overlaps', items: [
      'Current city instead of home city, with the option to hide it.',
      'Send delays, never-notify list, daily or weekly summaries, pauses.',
      'Flight lookup, city search, overlap alerts, lists and availability.',
      'Fixed: friend rows said “In town · In Lisbon now”.',
      'Fixed: daily summary named the wrong dates for Kai.'] },
    { v: '0.2.0', date: 'Oct 17, 2026', title: 'Their side', items: [
      'See the notification and check-in screen from a friend’s phone.',
      'Fixed: date fields were cut off on narrow screens.',
      'Fixed: the confirmation message blocked taps underneath it.'] },
    { v: '0.1.0', date: 'Oct 17, 2026', title: 'Prototype', items: ['Check in, skip friends, plan a trip, see friends around you.'] }
  ];
  var FAQ = [
    ['What does a check-in send?', 'A short note to friends who are in the same city: that you’re around, until when, and anything you chose to add. Never a question, never your exact location.'],
    ['Who can see my city?', 'Friends see your current city only if “Show my current city” is on in Privacy. When it’s off, they only find out where you are when you check in.'],
    ['Can someone tell I skipped them?', 'No. Skipped and never-notify friends get nothing and are never told. Skips end on their own; never-notify lasts until you remove someone.'],
    ['Does the app track me?', 'No. Location is used only when you tap “Use my current location”. It’s matched to a city on your phone and isn’t sent anywhere.'],
    ['Why is my flight not found?', 'This test build only knows a few sample flights (try TP 208, AM 405, BA 178). Live flight data comes later.'],
    ['Are my friends real?', 'Not yet. Friends, check-ins and flights are sample data so you can try every screen.'],
    ['How do I start over?', 'Use “Reset sample data” at the bottom of this screen.']
  ];
  function readBugs() { try { return JSON.parse(localStorage.getItem('checkin-bugs') || '[]'); } catch (e) { return []; } }
  function writeBugs(b) { try { localStorage.setItem('checkin-bugs', JSON.stringify(b)); } catch (e) {} }
  function deviceInfo(extra) {
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    return [
      'App version: ' + APP_VERSION,
      'Opened as: ' + (standalone ? 'Home Screen app' : 'browser tab'),
      'Screen: ' + screen.width + '×' + screen.height + ' @' + (window.devicePixelRatio || 1) + 'x',
      'Theme: ' + (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
      'Current city in app: ' + extra.city,
      'Time: ' + new Date().toString(),
      'Browser: ' + navigator.userAgent
    ].join('\n');
  }
  function issueUrl(title, body, labels) {
    return 'https://github.com/' + REPO + '/issues/new?title=' + encodeURIComponent(title) + '&labels=' + encodeURIComponent(labels) + '&body=' + encodeURIComponent(body);
  }
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(true); } catch (e) { done(false); } document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  function BugForm(p) {
    var sArea = useState('Here'), area = sArea[0];
    var sWhat = useState(''), what = sWhat[0];
    var sSteps = useState('');
    var sExp = useState('');
    var sSev = useState('annoying'), sev = sSev[0];
    var sDev = useState(true), dev = sDev[0];
    var sDone = useState(null), done = sDone[0];
    var title = '[' + area + '] ' + (what.split('\n')[0].slice(0, 70) || 'Bug');
    var body = '**What happened**\n' + what + '\n\n' + (sSteps[0] ? '**Steps to reproduce**\n' + sSteps[0] + '\n\n' : '') +
      (sExp[0] ? '**What I expected**\n' + sExp[0] + '\n\n' : '') + '**How bad:** ' + sev + '\n**Where:** ' + area +
      (dev ? '\n\n<details><summary>Device info</summary>\n\n```\n' + deviceInfo(p) + '\n```\n</details>' : '');
    var url = issueUrl(title, body, 'checkin,bug');
    function save(sent) {
      var b = readBugs(); b.unshift({ id: Date.now(), kind: 'bug', title: title, area: area, sev: sev, at: new Date().toISOString(), sent: sent, body: body });
      writeBugs(b.slice(0, 50)); sDone[1](sent ? 'sent' : 'saved');
    }
    if (done) return h('div', { className: 'done-card' },
      h('h3', null, done === 'sent' ? 'Thanks, report opened on GitHub' : 'Saved on this phone'),
      h('p', null, done === 'sent' ? 'Finish filing it in the GitHub page that opened. It’s also kept under My reports.' : 'Find it under My reports, where you can send or copy it later.'),
      h('button', { type: 'button', className: 'ci-link', onClick: function () { sDone[1](null); sWhat[1](''); sSteps[1](''); sExp[1](''); } }, 'Report another'));
    return h('div', { className: 'ci-sheet flat' },
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Where'),
        h('select', { id: 'bug-area', className: 'ci-input', value: area, onChange: function (e) { sArea[1](e.target.value); } },
          ['Here', 'Check-in sheet', 'Plan', 'Flight lookup', 'City search / location', 'Around', 'Their side', 'Privacy', 'Install / Home Screen', 'Something else'].map(function (x) { return h('option', { key: x, value: x }, x); }))),
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'What happened'),
        h('textarea', { id: 'bug-what', className: 'ci-input ta', rows: 3, value: what, placeholder: 'e.g. The Check in button did nothing after I picked Lisbon', onChange: function (e) { sWhat[1](e.target.value); } })),
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Steps to make it happen (optional)'),
        h('textarea', { id: 'bug-steps', className: 'ci-input ta', rows: 3, value: sSteps[0], placeholder: '1. Open Here\n2. Tap the city\n3. …', onChange: function (e) { sSteps[1](e.target.value); } })),
      h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'What you expected (optional)'),
        h('input', { id: 'bug-exp', className: 'ci-input', value: sExp[0], onChange: function (e) { sExp[1](e.target.value); } })),
      h('div', { className: 'ci-field' }, h('div', { className: 'ci-label' }, 'How bad'),
        h(Seg, { label: 'How bad', value: sev, onChange: sSev[1], options: [{ value: 'annoying', label: 'Annoying' }, { value: 'broken', label: 'Something’s broken' }, { value: 'blocking', label: 'Can’t use the app' }] })),
      h('div', { className: 'set-row inline' }, h('div', { className: 'set-text' }, h('div', { className: 'set-label' }, 'Include device info'), h('div', { className: 'set-hint' }, 'App version, iOS version, screen size. No location.')),
        h(C.Toggle, { checked: dev, label: 'Include device info', onChange: sDev[1] })),
      h('p', { className: 'fine' }, 'Reports are filed as public GitHub issues on ' + REPO + '. Don’t include anything private.'),
      h('div', { className: 'ci-sheet-foot' },
        h('button', { type: 'button', className: 'ci-link', disabled: !what.trim(), onClick: function () { save(false); } }, 'Save for later'),
        what.trim() ? h('a', { className: 'ci-btn ci-btn-idle', href: url, target: '_blank', rel: 'noopener', onClick: function () { save(true); } }, 'Send report')
          : h(C.CheckInButton, { disabled: true }, 'Send report')));
  }

  function HelpScreen(p) {
    var sTab = useState(p.start || 'bug'), tab = sTab[0];
    var sQ = useState('');
    var sBugs = useState(readBugs()), bugs = sBugs[0];
    var sCopied = useState(null);
    var sReset = useState(false);
    useEffect(function () { sBugs[1](readBugs()); }, [tab]);
    var qBody = sQ[0] + '\n\n<details><summary>Device info</summary>\n\n```\n' + deviceInfo(p) + '\n```\n</details>';
    return h('div', { className: 'screen' },
      h('header', { className: 'top' }, h('button', { type: 'button', className: 'ci-link', onClick: p.onBack }, '‹ Privacy'), h('span', { className: 'muted' }, 'v' + APP_VERSION)),
      h('div', { className: 'wordmark big' }, 'Help & feedback'),
      h(Seg, { label: 'Help section', value: tab, onChange: sTab[1], options: [{ value: 'bug', label: 'Report a bug' }, { value: 'help', label: 'Get help' }, { value: 'new', label: 'What’s new' }, { value: 'mine', label: 'My reports' + (bugs.length ? ' (' + bugs.length + ')' : '') }] }),
      tab === 'bug' ? h(BugForm, { city: p.city }) : null,
      tab === 'help' ? h('div', { className: 'faq' },
        FAQ.map(function (f, i) { return h('details', { key: i, className: 'faq-item' }, h('summary', null, f[0]), h('p', null, f[1])); }),
        h('div', { className: 'ci-sheet flat' },
          h('h3', { className: 'ci-sheet-title small' }, 'Still stuck?'),
          h('label', { className: 'ci-field' }, h('span', { className: 'ci-label' }, 'Your question'),
            h('textarea', { id: 'support-q', className: 'ci-input ta', rows: 3, value: sQ[0], onChange: function (e) { sQ[1](e.target.value); } })),
          h('p', { className: 'fine' }, 'Questions are filed as public GitHub issues. You’ll need a GitHub account.'),
          h('div', { className: 'ci-sheet-foot' }, h('span'),
            sQ[0].trim() ? h('a', { className: 'ci-btn ci-btn-idle', href: issueUrl('[Support] ' + sQ[0].split('\n')[0].slice(0, 70), qBody, 'checkin,support'), target: '_blank', rel: 'noopener',
              onClick: function () { var b = readBugs(); b.unshift({ id: Date.now(), kind: 'support', title: '[Support] ' + sQ[0].slice(0, 70), at: new Date().toISOString(), sent: true, body: qBody }); writeBugs(b); } }, 'Ask')
              : h(C.CheckInButton, { disabled: true }, 'Ask')))) : null,
      tab === 'new' ? h('div', { className: 'notes' }, CHANGELOG.map(function (r) {
        return h('article', { key: r.v, className: 'note-card' },
          h('div', { className: 'note-head' }, h('b', null, r.title), h('span', { className: 'muted' }, 'v' + r.v + ' · ' + r.date)),
          h('ul', null, r.items.map(function (x, i) { return h('li', { key: i, className: /^Fixed:/.test(x) ? 'fix' : '' }, x); })));
      })) : null,
      tab === 'mine' ? (bugs.length ? h('div', { className: 'set-group' }, bugs.map(function (b) {
        return h('div', { key: b.id, className: 'set-row' },
          h('div', { className: 'set-text' }, h('div', { className: 'set-label' }, b.title),
            h('div', { className: 'set-hint' }, new Date(b.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' · ' + (b.sent ? 'Opened on GitHub' : 'Saved on phone'))),
          h('div', { className: 'mine-actions' },
            h('a', { className: 'ci-link', href: issueUrl(b.title, b.body, 'checkin,' + (b.kind || 'bug')), target: '_blank', rel: 'noopener', onClick: function () {
              var all = readBugs().map(function (x) { return x.id === b.id ? Object.assign({}, x, { sent: true }) : x; }); writeBugs(all); sBugs[1](all); } }, b.sent ? 'Send again' : 'Send'),
            h('button', { type: 'button', className: 'ci-link', onClick: function () { copyText(b.title + '\n\n' + b.body, function (ok) { sCopied[1](ok ? b.id : -1); }); } }, sCopied[0] === b.id ? 'Copied' : 'Copy')));
      }), h('div', { className: 'set-row' }, h('div', { className: 'set-text' }, h('div', { className: 'set-hint' }, 'All reports and fixes are tracked on GitHub.')),
        h('a', { className: 'ci-link', href: 'https://github.com/' + REPO + '/issues?q=label%3Acheckin', target: '_blank', rel: 'noopener' }, 'View all')))
        : h('div', { className: 'empty' }, 'No reports yet. Anything you report from this phone shows up here.')) : null,
      h('div', { className: 'set-group' },
        h('div', { className: 'set-row' }, h('div', { className: 'set-text' }, h('div', { className: 'set-label' }, 'Reset sample data'), h('div', { className: 'set-hint' }, 'Clears check-ins, trips and settings on this phone. Reports are kept.')),
          sReset[0] ? h('div', { className: 'mine-actions' }, h('button', { type: 'button', className: 'ci-link', onClick: function () { sReset[1](false); } }, 'Keep'),
            h('button', { type: 'button', className: 'ci-link danger', onClick: function () { try { localStorage.removeItem('checkin-state'); } catch (e) {} location.reload(); } }, 'Reset'))
            : h('button', { type: 'button', className: 'ci-link', onClick: function () { sReset[1](true); } }, 'Reset…'))));
  }
  // ---------- Their side ----------
  function Ripple() {
    return h('svg', { viewBox: '0 0 120 120', 'aria-hidden': true },
      h('circle', { cx: 60, cy: 60, r: 26, opacity: .8 }), h('circle', { cx: 60, cy: 60, r: 42, opacity: .5 }), h('circle', { cx: 60, cy: 60, r: 58, opacity: .25 }),
      h('circle', { className: 'core', cx: 60, cy: 60, r: 10 }));
  }

  function TheirSide(p) {
    var sKind = useState('now'), kind = sKind[0];
    var sStage = useState('lock'), stage = sStage[0];
    var sShow = useState(false), show = sShow[0];
    var sText = useState(''), text = sText[0];
    var sReply = useState('');
    var sRun = useState(0);
    useEffect(function () {
      if (stage !== 'lock') return;
      sShow[1](false);
      var t = setTimeout(function () { sShow[1](true); }, 900);
      return function () { clearTimeout(t); };
    }, [stage, kind, sRun[0]]);
    function restart(k) { if (k) sKind[1](k); sStage[1]('lock'); sText[1](''); sReply[1](''); sRun[1](sRun[0] + 1); }

    var s = p.state, trip = s.trips[0] || { city: 'Lisbon', from: D(15), to: D(19) };
    var sent = s.sent[s.city];
    var place = sent ? sent.place : s.city;
    var until = fmtWeekday(s.until).split(',')[0];
    var n = sent ? { title: sent.title, body: sent.body } : notifText('now', place, until, []);
    var ov = FRIEND_TRIPS.filter(function (x) { return x.city === trip.city && overlap(trip.from, trip.to, x.from, x.to); })[0];
    var receiver = kind === 'overlap' && ov ? first(ov.friend) : kind === 'upcoming' ? first((FRIENDS.filter(function (f) { return f.city === trip.city && !f.hidden; })[0] || friend('rita')).id) : 'Maya';
    var notif = kind === 'now' ? n
      : kind === 'upcoming' ? { title: ME + ' is heading to ' + trip.city, body: rangeText(trip.from, trip.to) + '. Just a heads-up.' }
      : kind === 'overlap' ? { title: 'You and ' + ME + ' overlap in ' + trip.city, body: 'You’re both there ' + (ov ? rangeText.apply(null, overlap(trip.from, trip.to, ov.from, ov.to)) : rangeText(trip.from, trip.to)) + '.' }
      : { title: '3 friends are around ' + s.city, body: ME + ', Lena and Kai. Your 6 PM summary.' };
    var ideas = kind === 'now' ? ['Welcome! Free Sunday morning if you are', 'Oh nice, enjoy ' + s.city] : ['Nice, I’m around that week', 'Have a good trip'];

    var switcher = h(Seg, { label: 'Which notification', value: kind, onChange: function (v) { restart(v); },
      options: [{ value: 'now', label: 'Just arrived' }, { value: 'upcoming', label: 'Heads-up' }, { value: 'overlap', label: 'Overlap' }, { value: 'digest', label: 'Daily summary' }] });

    var body;
    if (stage === 'lock') {
      body = h('div', { className: 'lock' },
        h('svg', { className: 'lock-art', viewBox: '0 0 320 320', 'aria-hidden': true },
          h('circle', { cx: 160, cy: 160, r: 60 }), h('circle', { cx: 160, cy: 160, r: 100 }), h('circle', { cx: 160, cy: 160, r: 140 }), h('circle', { className: 'core', cx: 160, cy: 160, r: 22 })),
        h('div', { className: 'lock-date' }, new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })),
        h('div', { className: 'lock-time' }, kind === 'digest' ? '6:00' : nowHM(0).replace(/ [AP]M$/, '')),
        show ? h('button', { type: 'button', className: 'notif', onClick: function () { sStage[1]('open'); }, 'aria-label': 'Notification: ' + notif.title + '. ' + notif.body + ' Open.' },
          h('span', { className: 'notif-icon' }, h(C.PresenceDot, { state: 'here', size: 12 })),
          h('span', { className: 'notif-app' }, 'CHECK IN'), h('span', { className: 'notif-time' }, 'now'),
          h('span', { className: 'notif-body' }, h('b', null, notif.title), notif.body))
          : h('div', { className: 'waiting', 'aria-live': 'polite' }, receiver + '’s phone, waiting…'),
        h('div', { className: 'lock-hint' }, show ? 'This is ' + receiver + '’s phone. Tap the notification to open it.' : ''));
    } else if (stage === 'open' && kind === 'digest') {
      body = h('div', { className: 'detail' },
        h('button', { type: 'button', className: 'ci-link back', onClick: function () { restart(); } }, '‹ Back to lock screen'),
        h('h2', { className: 'digest-h' }, 'Around ' + s.city + ' today'),
        h('div', { className: 'cards' },
          h(C.CheckInCard, { sender: ME, city: place, window: 'Around till ' + until + ' · 9:38 AM' }),
          h(C.CheckInCard, { sender: 'Lena', city: s.city, window: 'Around till Wednesday · Free evenings' }),
          h(C.CheckInCard, { sender: 'Kai', city: s.city, kind: 'upcoming', window: 'Next weekend · heads-up' })),
        h('p', { className: 'calm' }, 'One summary a day instead of a ping each time. ' + receiver + ' chose this in Privacy.'));
    } else if (stage === 'open') {
      var heroTitle = kind === 'overlap' ? ['You and ' + ME + ' are both in ', trip.city] : kind === 'upcoming' ? [ME + ' is heading to ', trip.city] : [ME + ' is in ', place];
      body = h('div', { className: 'detail' },
        h('button', { type: 'button', className: 'ci-link back', onClick: function () { restart(); } }, '‹ Back to lock screen'),
        h('div', { className: 'hero' + (kind === 'now' ? '' : ' soon') },
          h(Ripple),
          h('div', { className: 'hero-from' }, kind === 'now' ? 'Check-in from ' + ME : kind === 'overlap' ? 'Overlap' : 'Heads-up from ' + ME),
          h('h2', { className: 'hero-title' }, heroTitle[0], h('em', null, heroTitle[1])),
          h('div', { className: 'hero-when' }, kind === 'now' ? notif.body : notif.body),
          kind === 'now' && sent && sent.note ? h('p', { className: 'hero-note' }, '“' + sent.note + '”') : null),
        h('p', { className: 'calm' }, kind === 'overlap' ? 'You both shared these dates with each other, so you both see this. Nobody else does.'
          : ME + ' isn’t asking for anything. Say hi if you feel like it, or just enjoy knowing they’re around.'),
        h('div', { className: 'reply-ideas' },
          h('div', { className: 'ci-label' }, 'Say hi (optional)'),
          h('div', { className: 'ci-choice' }, ideas.map(function (i) { return h('button', { key: i, type: 'button', className: 'ci-choice-opt', onClick: function () { sText[1](i); } }, h('span', { className: 'ci-choice-label' }, i)); })),
          h('div', { className: 'reply-row' },
            h('label', { className: 'sr', htmlFor: 'their-reply' }, 'Message to ' + ME),
            h('input', { id: 'their-reply', className: 'ci-input', value: text, maxLength: 120, placeholder: 'Write something short', onChange: function (e) { sText[1](e.target.value); } }),
            h(C.CheckInButton, { disabled: !text.trim(), onClick: function () { sReply[1](text.trim()); sStage[1]('replied'); } }, 'Send'))),
        h('div', { className: 'later' },
          h('button', { type: 'button', className: 'ci-link', onClick: function () { sStage[1]('later'); } }, 'Maybe another time'),
          h('button', { type: 'button', className: 'ci-link', onClick: function () { sStage[1]('muted'); } }, 'Pause ' + ME + '’s check-ins')));
    } else if (stage === 'replied') {
      body = h('div', { className: 'detail' },
        h('div', { className: 'thread' },
          h('div', { className: 'sys' }, notif.title + ' · 9:38'),
          h('div', { className: 'bubble them' }, notif.body),
          h('div', { className: 'bubble me' }, sReply[0]),
          h('div', { className: 'sys' }, ME + ' gets this as a normal message. Nothing else changes.')),
        h('button', { type: 'button', className: 'ci-link back', onClick: function () { restart(); } }, 'Replay from the lock screen'));
    } else {
      var muted = stage === 'muted';
      body = h('div', { className: 'done-card' },
        h('h3', null, muted ? 'Paused for 2 weeks' : 'Nothing sent'),
        h('p', null, muted ? 'You won’t get ' + ME + '’s check-ins until ' + fmtDay(D(14)) + '. They won’t be told.' : ME + ' won’t know you saw it. There are no read receipts, ever.'),
        h('button', { type: 'button', className: 'ci-link', onClick: function () { restart(); } }, 'Replay from the lock screen'));
    }
    return h('div', { className: 'side' },
      h('header', { className: 'top' }, h('div', { className: 'wordmark' }, 'Their side')),
      h('p', { className: 'lede' }, sent ? 'You checked in to ' + s.city + '. Here’s what a friend there experiences. You’re “' + ME + '”.'
        : 'What friends get from you. You’re “' + ME + '” here.'),
      switcher, body);
  }

  // ---------- App ----------
  function readState() { try { return JSON.parse(localStorage.getItem('checkin-state') || '{}'); } catch (e) { return {}; } }
  var SAVED = readState();
  function pick(k, d) { return SAVED[k] !== undefined ? SAVED[k] : d; }

  function App() {
    var sTab = useState('here'), tab = sTab[0];
    var sCity = useState(pick('city', 'Porto'));
    var sUntil = useState(pick('until', D(6)));
    var sSettings = useState(pick('settings', { shareCity: true, receiveHidden: true, precision: 'hood', delay: 'now', delivery: 'instant', weekly: true }));
    var sNever = useState(pick('never', ['chris']));
    var sSkips = useState(pick('skips', { Porto: { ids: ['sam'], duration: 'trip' } }));
    var sPaused = useState(pick('paused', [{ id: 'marco', until: fmtDay(D(14)) }]));
    var sSent = useState(pick('sent', {}));
    var sTrips = useState(pick('trips', [{ id: 't1', city: 'Lisbon', from: D(15), to: D(19), timing: 'arrival', daysBefore: 3, count: 3, flight: 'TP 208' }]));
    var sLists = useState(pick('lists', LISTS));
    var sPast = useState(pick('past', PAST));
    var sSheet = useState(null), sheet = sSheet[0];
    var sToast = useState(null), toast = sToast[0];
    var sSaid = useState(pick('said', {}));
    var sKey = useState(0);
    var timer = useRef(null);
    var scrollRef = useRef(null);
    var sInstall = useState(function () {
      var ios = /iPhone|iPad|iPod/.test(navigator.userAgent), standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
      var dismissed = false; try { dismissed = localStorage.getItem('checkin-install-hint') === 'off'; } catch (e) {}
      return ios && !standalone && !dismissed;
    });

    var state = { city: sCity[0], until: sUntil[0], settings: sSettings[0], never: sNever[0], skips: sSkips[0], paused: sPaused[0], sent: sSent[0], trips: sTrips[0], lists: sLists[0], past: sPast[0], said: sSaid[0] };
    useEffect(function () {
      try { localStorage.setItem('checkin-state', JSON.stringify({ city: state.city, until: state.until, settings: state.settings, never: state.never, skips: state.skips, paused: state.paused, sent: state.sent, trips: state.trips, lists: state.lists, past: state.past, said: state.said })); } catch (e) {}
    });
    function showToast(t) { clearTimeout(timer.current); sToast[1](t); timer.current = setTimeout(function () { sToast[1](null); }, t.undo || t.action ? 7000 : 3500); }
    function go(t) { sTab[1](t); if (scrollRef.current) scrollRef.current.scrollTop = 0; }
    function send(r) {
      var c = state.city, o = Object.assign({}, state.sent); if (r.delay === '2h') r.at = nowHM(120); o[c] = r; sSent[1](o); sSheet[1](null);
      showToast({ text: r.delay === 'now' ? 'Checked in to ' + c + '.' : 'Scheduled for ' + delayLabel(r) + '.', action: { label: 'Their side', fn: function () { go('their'); sToast[1](null); } } });
    }
    function unsend() { var o = Object.assign({}, state.sent); delete o[state.city]; sSent[1](o); showToast({ text: 'Taken back. Nobody will see it.' }); }
    function schedule(r) {
      sTrips[1](state.trips.concat(Object.assign({ id: 't' + Date.now() }, r)));
      sKey[1](sKey[0] + 1); go('here');
      showToast({ text: 'Trip to ' + r.city + ' scheduled. ' + timingText(r) + '.' });
    }
    var whoCity = sheet && sheet.city;
    var sheetEl = null;
    if (sheet) {
      if (sheet.type === 'confirm') sheetEl = h(CheckInSheet, { state: state, onClose: function () { sSheet[1](null); }, onSend: send, onChooseWho: function () { sSheet[1]({ type: 'who', city: state.city, back: 'confirm' }); } });
      else if (sheet.type === 'who') {
        var sk = state.skips[whoCity] || { ids: [], duration: 'once' };
        sheetEl = h(C.HideFriendsSheet, {
          city: whoCity, friends: visibleIn(whoCity, state).map(function (f) { return { id: f.id, name: f.name, city: whoCity, presence: 'here' }; }),
          hidden: sk.ids, duration: sk.duration,
          onHiddenChange: function (ids) { var o = Object.assign({}, state.skips); o[whoCity] = { ids: ids, duration: sk.duration }; sSkips[1](o); },
          onDurationChange: function (d) { var o = Object.assign({}, state.skips); o[whoCity] = { ids: sk.ids, duration: d }; sSkips[1](o); },
          onDone: function () { sSheet[1](sheet.back ? { type: sheet.back } : null); }
        });
      }
      else if (sheet.type === 'hi') sheetEl = h(SayHi, { card: sheet.card, onClose: function () { sSheet[1](null); }, onSend: function (t) {
        var o = Object.assign({}, state.said); o[sheet.card.id] = t; sSaid[1](o); sSheet[1](null); showToast({ text: 'Sent to ' + sheet.card.sender + '.' }); } });
      else if (sheet.type === 'city') sheetEl = h(CitySheet, { city: state.city, onClose: function () { sSheet[1](null); }, onPick: function (c, auto) { sCity[1](c); if (auto) setTimeout(function () { sSheet[1](function (cur) { return cur && cur.type === 'city' ? null : cur; }); }, 1200); else sSheet[1](null); showToast({ text: 'You’re in ' + c + '. Nothing is shared until you check in.' }); } });
      else if (sheet.type === 'never') sheetEl = h(FriendSearch, { exclude: state.never, onClose: function () { sSheet[1](null); }, onPick: function (id) { sNever[1](state.never.concat(id)); } });
      else if (sheet.type === 'list') {
        var list = state.lists.filter(function (l) { return l.id === sheet.id; })[0];
        sheetEl = h(ListEditor, { list: list, onClose: function () { sSheet[1](null); }, onChange: function (m) { sLists[1](state.lists.map(function (l) { return l.id === list.id ? Object.assign({}, l, { members: m }) : l; })); } });
      }
    }
    var screen = tab === 'here' ? h(HereScreen, { state: state, onCheckIn: function () { sSheet[1]({ type: 'confirm' }); }, onUnsend: unsend, onPickCity: function () { sSheet[1]({ type: 'city' }); },
        goPlan: function () { go('plan'); }, cancelTrip: function (id) { sTrips[1](state.trips.filter(function (t) { return t.id !== id; })); showToast({ text: 'Trip cancelled. Nobody was told.' }); },
        markSaw: function (i, names) {
          var ids = FRIENDS.filter(function (f) { return names.indexOf(first(f.id)) !== -1 && f.city === state.past[i].city; }).map(function (f) { return f.id; });
          sPast[1](state.past.map(function (t, j) { return j === i ? Object.assign({}, t, { saw: ids }) : t; }));
        } })
      : tab === 'around' ? h(AroundScreen, { state: state, onSayHi: function (c) { sSheet[1]({ type: 'hi', card: c }); } })
      : tab === 'plan' ? h(PlanScreen, { state: state, formKey: sKey[0], onSchedule: schedule })
      : tab === 'their' ? h(TheirSide, { state: state })
      : tab === 'help' ? h(HelpScreen, { city: state.city, onBack: function () { go('you'); } })
      : h(YouScreen, { state: state, setSettings: sSettings[1], setNever: sNever[1], setPaused: sPaused[1],
          clearSkip: function (c) { var o = Object.assign({}, state.skips); delete o[c]; sSkips[1](o); },
          onAddNever: function () { sSheet[1]({ type: 'never' }); }, onHelp: function () { go('help'); }, onEditList: function (id) { sSheet[1]({ type: 'list', id: id }); } });

    return h('div', { className: 'app' },
      sInstall[0] ? h('div', { className: 'install' }, h('span', null, 'Install: tap ', h('b', null, 'Share'), ', then ', h('b', null, 'Add to Home Screen'), '.'),
        h('button', { type: 'button', className: 'toast-undo', 'aria-label': 'Dismiss', onClick: function () { sInstall[1](false); try { localStorage.setItem('checkin-install-hint', 'off'); } catch (e) {} } }, 'Got it')) : null,
      h('main', { className: 'scroll', ref: scrollRef }, screen),
      toast ? h('div', { className: 'toast', role: 'status' }, h(C.PresenceDot, { state: 'here', ripple: true }), h('span', { className: 'toast-text' }, toast.text),
        toast.action ? h('button', { type: 'button', className: 'toast-undo', onClick: toast.action.fn }, toast.action.label) : null) : null,
      h('nav', { className: 'tabs', 'aria-label': 'Sections' }, [['here', 'Here'], ['plan', 'Plan'], ['around', 'Around'], ['their', 'Their side'], ['you', 'Privacy']].map(function (t) {
        var icon = t[0] === 'plan' ? 'plan' : t[0];
        return h('button', { key: t[0], type: 'button', className: 'tab' + (tab === t[0] || (tab === 'help' && t[0] === 'you') ? ' on' : ''), 'aria-current': tab === t[0] ? 'page' : undefined, onClick: function () { go(t[0]); } },
          h(Icon, { name: icon }), h('span', null, t[1]));
      })),
      sheet ? h(Sheet, { label: sheet.type, onClose: function () { sSheet[1](null); } }, sheetEl) : null);
  }

  ReactDOM.createRoot(document.getElementById('phone')).render(h(App));
})();
