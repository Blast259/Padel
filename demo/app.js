/* Asistente de Paco — simulatormotor
 * Klassiskt skript (inga moduler, ingen fetch) så att allt fungerar via file://.
 * Deterministisk: ingen Math.random, ingen Date.now — klockan styrs av beats.
 */
(function () {
  'use strict';

  var SC = window.PADEL_SCENARIO;
  var I18N = window.PADEL_I18N;

  /* ── Parametrar & state ─────────────────────────────── */
  var params = new URLSearchParams(location.search);
  var langParam = params.get('lang');
  var state = {
    lang: (langParam === 'en' || langParam === 'sv') ? langParam : 'es',
    auto: params.get('autoplay') === '1',
    record: params.get('record') === '1',
    speed: Math.max(parseFloat(params.get('speed') || '1') || 1, 0.1),
    jumpTo: parseInt(params.get('beat') || '', 10),
    groupIdx: 0,
    currentChat: null,
    captionKey: null,
    overlayKey: null,
    lastSender: {},
    opened: {},
    busy: false,
    done: false,
    firstTapDone: false
  };

  function t(key) {
    var d = I18N[state.lang] || I18N.es;
    return (d && d[key]) || I18N.es[key] || key;
  }
  function fmt(s, name) { return s.replace('{name}', name); }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function scaled(ms) { return ms / state.speed; }

  /* ── Ikoner (inline-SVG, inga externa resurser) ─────── */
  var S = 'stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  var ICON = {
    back: '<svg viewBox="0 0 24 24"><path d="M15.5 5 8.5 12l7 7" ' + S + ' stroke-width="2.4"/></svg>',
    video: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="13" height="11" rx="2.5" fill="currentColor"/><path d="M16 10.5 21.5 7.5v9L16 13.5z" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M6.6 3.4 9 5.8c.5.5.5 1.3.1 1.9L7.9 9.3a12.6 12.6 0 0 0 6.8 6.8l1.6-1.2c.6-.4 1.4-.4 1.9.1l2.4 2.4c.6.6.6 1.5 0 2.1l-1.2 1.2c-.7.7-1.7 1-2.6.7C10.5 19.8 4.2 13.5 2.6 7.2c-.3-.9 0-1.9.7-2.6l1.2-1.2c.6-.6 1.5-.6 2.1 0z" fill="currentColor"/></svg>',
    kebab: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.9" fill="currentColor"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/><circle cx="12" cy="19" r="1.9" fill="currentColor"/></svg>',
    smiley: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" ' + S + ' stroke-width="1.7"/><circle cx="8.7" cy="9.8" r="1.1" fill="currentColor"/><circle cx="15.3" cy="9.8" r="1.1" fill="currentColor"/><path d="M7.8 14.2a5.4 5.4 0 0 0 8.4 0" ' + S + ' stroke-width="1.7"/></svg>',
    clip: '<svg viewBox="0 0 24 24"><path d="M20 11.2 12 19.2a5 5 0 0 1-7.1-7.1l8.2-8.2a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.8 1.8 0 0 1-2.6-2.6l7.3-7.3" ' + S + ' stroke-width="1.7"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M4 7h3l1.6-2h6.8L17 7h3a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 7z" fill="currentColor"/><circle cx="12" cy="13" r="3.4" fill="#fff"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5" ' + S + ' stroke-width="1.9"/></svg>',
    signal: '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".6" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx=".6" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx=".6" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx=".6" fill="currentColor" opacity=".45"/></svg>',
    battery: '<svg viewBox="0 0 26 12"><rect x="0" y="0" width="22" height="12" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2.2" y="2.2" width="14" height="7.6" rx="1.2" fill="currentColor"/><rect x="23.4" y="3.4" width="2.6" height="5.2" rx="1.1" fill="currentColor"/></svg>',
    ticks: '<svg viewBox="0 0 17 9"><path class="t1" d="M1 4.8 4.2 8 11 1.2" ' + S + ' stroke-width="1.6"/><path class="t2" d="M6.6 4.8 9.8 8 16.4 1.2" ' + S + ' stroke-width="1.6"/></svg>'
  };

  /* WhatsApp-lika avsändarfärger, deterministiskt valda per namn */
  var SENDER_COLORS = ['#e542a3', '#1f7aec', '#fa6533', '#8b6990', '#02a698',
    '#d97a02', '#7f66ff', '#c4532f', '#0097a7', '#7c9c34'];
  function senderColor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return SENDER_COLORS[h % SENDER_COLORS.length];
  }

  /* ── DOM-referenser ─────────────────────────────────── */
  var el = {
    stage: document.getElementById('stage'),
    phone: document.getElementById('phone'),
    sbTime: document.getElementById('sb-time'),
    sbIcons: document.getElementById('sb-icons'),
    hdrBack: document.getElementById('hdr-back'),
    hdrAvatar: document.getElementById('hdr-avatar'),
    hdrTitle: document.getElementById('hdr-title'),
    hdrSub: document.getElementById('hdr-sub'),
    hdrIcons: document.getElementById('hdr-icons'),
    screens: document.getElementById('screens'),
    composerIcons: document.getElementById('composer-icons'),
    composerPh: document.getElementById('composer-ph'),
    composerCam: document.getElementById('composer-cam'),
    micBtn: document.getElementById('mic-btn'),
    caption: document.getElementById('caption-bar'),
    overlay: document.getElementById('act-overlay'),
    actText: document.getElementById('act-text'),
    actHint: document.getElementById('act-hint'),
    hud: document.getElementById('hud'),
    tapHint: document.getElementById('tap-hint')
  };

  function initChrome() {
    el.sbIcons.innerHTML = ICON.signal + '<span class="sb-4g">4G</span>' + ICON.battery;
    el.hdrBack.innerHTML = ICON.back;
    el.hdrIcons.innerHTML = ICON.video + ICON.phone + ICON.kebab;
    el.composerIcons.innerHTML = ICON.smiley;
    el.composerCam.innerHTML = ICON.clip + ICON.camera;
    el.micBtn.innerHTML = ICON.mic;
    if (state.record) document.body.classList.add('record');
    applyLangChrome();
  }

  /* ── Chrome / i18n ──────────────────────────────────── */
  function applyLangChrome() {
    el.composerPh.textContent = t('ui.placeholder');
    el.tapHint.textContent = t('ui.tapHint');
    if (state.currentChat) setHeaderFor(SC.chats[state.currentChat]);
    if (state.captionKey) el.caption.textContent = t(state.captionKey);
    if (state.overlayKey) el.actText.textContent = t(state.overlayKey);
    el.actHint.textContent = state.auto ? '' : t('ui.tapToContinue');
    var chips = el.hud.querySelectorAll('[data-lang]');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('active', chips[i].getAttribute('data-lang') === state.lang);
    }
  }

  function setLang(l) {
    state.lang = l;
    applyLangChrome();
  }

  /* ── Chattytor ──────────────────────────────────────── */
  function screenFor(chatId) {
    var s = el.screens.querySelector('[data-chat="' + chatId + '"]');
    if (!s) {
      s = document.createElement('div');
      s.className = 'screen';
      s.setAttribute('data-chat', chatId);
      el.screens.appendChild(s);
    }
    return s;
  }

  function setHeaderFor(chat) {
    el.hdrTitle.textContent = chat.title;
    var sub = t(chat.subtitleKey);
    if (chat.deviceOwner) sub += ' · ' + fmt(t('ui.device'), chat.deviceOwner);
    el.hdrSub.textContent = sub;
    el.hdrAvatar.textContent = chat.avatar;
    el.hdrAvatar.style.background = chat.avatarBg;
  }

  function setChat(chatId) {
    var chat = SC.chats[chatId];
    state.currentChat = chatId;
    var screens = el.screens.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    var s = screenFor(chatId);
    s.classList.add('active');
    if (!state.opened[chatId]) {
      state.opened[chatId] = true;
      var row = document.createElement('div');
      row.className = 'pill-row';
      row.innerHTML = '<div class="pill pill--e2e"></div>';
      row.firstChild.textContent = t('ui.e2e');
      s.appendChild(row);
    }
    setHeaderFor(chat);
    scrollBottom(s, true);
  }

  function scrollBottom(screen, instant) {
    screen.scrollTo({ top: screen.scrollHeight, behavior: instant ? 'auto' : 'smooth' });
  }

  /* ── Renderers ──────────────────────────────────────── */
  function addSystem(text) {
    var s = screenFor(state.currentChat);
    var row = document.createElement('div');
    row.className = 'pill-row';
    var pill = document.createElement('div');
    pill.className = 'pill pill--date';
    pill.textContent = text;
    row.appendChild(pill);
    s.appendChild(row);
    state.lastSender[state.currentChat] = null;
    scrollBottom(s, true);
  }

  function addMsg(beat, instant) {
    var chat = SC.chats[state.currentChat];
    var s = screenFor(state.currentChat);
    var person = SC.cast[beat.from];
    var out = beat.from === chat.perspective;

    var row = document.createElement('div');
    row.className = 'msg-row ' + (out ? 'out' : 'in');
    if (state.lastSender[state.currentChat] !== beat.from) row.className += ' first';
    state.lastSender[state.currentChat] = beat.from;

    var msg = document.createElement('div');
    msg.className = 'msg';

    if (!out && chat.kind === 'group') {
      var sender = document.createElement('div');
      sender.className = 'msg-sender';
      sender.textContent = person.name;
      sender.style.color = person.isBot ? '#00a884' : senderColor(person.name);
      msg.appendChild(sender);
    }

    var txt = document.createElement('div');
    txt.className = 'msg-text';
    txt.appendChild(document.createTextNode(beat.text));
    var spacer = document.createElement('span');
    spacer.className = 'meta-spacer';
    txt.appendChild(spacer);
    msg.appendChild(txt);

    var meta = document.createElement('div');
    meta.className = 'msg-meta';
    var time = document.createElement('span');
    time.textContent = beat.time || '';
    meta.appendChild(time);
    if (out) {
      var ticks = document.createElement('span');
      ticks.className = 'ticks sent';
      ticks.innerHTML = ICON.ticks;
      meta.appendChild(ticks);
      if (instant) {
        ticks.className = 'ticks read';
      } else {
        setTimeout(function () { ticks.className = 'ticks delivered'; }, scaled(500));
        setTimeout(function () { ticks.className = 'ticks read'; }, scaled(1100));
      }
    }
    msg.appendChild(meta);
    row.appendChild(msg);
    s.appendChild(row);
    if (beat.time) el.sbTime.textContent = beat.time;
    scrollBottom(s, instant);
  }

  function setCaption(key) {
    state.captionKey = key;
    el.caption.textContent = t(key);
    el.caption.classList.add('show');
    /* ge chatten extra bottenutrymme så captionen inte skymmer sista raderna */
    if (!document.body.classList.contains('has-caption')) {
      document.body.classList.add('has-caption');
    }
    if (state.currentChat) scrollBottom(screenFor(state.currentChat), true);
  }

  function showOverlay(key) {
    state.overlayKey = key;
    el.actText.textContent = t(key);
    el.actHint.textContent = state.auto ? '' : t('ui.tapToContinue');
    el.overlay.classList.add('show');
  }

  function hideOverlay() {
    state.overlayKey = null;
    el.overlay.classList.remove('show');
  }

  function typingLabel(beat) {
    var chat = SC.chats[state.currentChat];
    if (chat.kind === 'group') return fmt(t('ui.typingName'), SC.cast[beat.from].name);
    return t('ui.typing');
  }

  /* ── Beat-exekvering ────────────────────────────────── */
  function dwellFor(beat) {
    if (beat.type === 'msg') {
      var d = 900 + 28 * beat.text.length;
      return Math.min(Math.max(d, 1200), 5200);
    }
    if (beat.type === 'caption') return 1500;
    if (beat.type === 'system') return 450;
    if (beat.type === 'chat') return 650;
    return 300;
  }

  /* instant=true: rendera direkt utan animationer (för ?beat=N) */
  async function execBeat(beat, opts) {
    var instant = opts && opts.instant;
    switch (beat.type) {
      case 'title':
        if (instant) return;
        showOverlay(beat.key);
        if (state.auto) {
          await delay(scaled(2800));
          hideOverlay();
          await delay(scaled(400));
        }
        break;
      case 'caption':
        setCaption(beat.key);
        if (!instant && state.auto) await delay(scaled(dwellFor(beat)));
        break;
      case 'chat':
        setChat(beat.id);
        if (!instant && state.auto) await delay(scaled(dwellFor(beat)));
        break;
      case 'system':
        addSystem(beat.text);
        if (!instant && state.auto) await delay(scaled(dwellFor(beat)));
        break;
      case 'msg':
        if (!instant && beat.typing) {
          var prev = el.hdrSub.textContent;
          el.hdrSub.textContent = typingLabel(beat);
          await delay(scaled(state.auto ? beat.typing : Math.min(beat.typing, 600)));
          el.hdrSub.textContent = prev;
        }
        addMsg(beat, instant);
        if (!instant && state.auto) await delay(scaled(dwellFor(beat)));
        break;
      case 'pause':
        if (!instant && state.auto) await delay(scaled(beat.ms));
        break;
      case 'end':
        state.done = true;
        window.__DEMO_DONE = true;
        document.title = 'PADEL_DEMO_DONE';
        break;
    }
  }

  /* Beats grupperade så att chain:true limmas till föregående */
  var groups = (function () {
    var g = [];
    for (var i = 0; i < SC.beats.length; i++) {
      var b = SC.beats[i];
      if (b.chain && g.length) g[g.length - 1].push(b);
      else g.push([b]);
    }
    return g;
  })();

  async function runGroup(group, opts) {
    for (var i = 0; i < group.length; i++) await execBeat(group[i], opts);
  }

  /* ── Drivrutiner ────────────────────────────────────── */
  async function autoplayLoop() {
    while (state.groupIdx < groups.length && !state.done) {
      await runGroup(groups[state.groupIdx], {});
      state.groupIdx++;
    }
  }

  async function advance() {
    if (state.busy || state.done) return;
    if (!state.firstTapDone) {
      state.firstTapDone = true;
      el.tapHint.classList.add('hidden');
      requestWakeLock();
    }
    state.busy = true;
    if (state.overlayKey) hideOverlay();
    /* kör nästa grupp; rena paus-grupper är osynliga i tap-läge → hoppa vidare */
    var g;
    do {
      g = groups[state.groupIdx];
      if (!g) break;
      await runGroup(g, {});
      state.groupIdx++;
    } while (!state.done && state.groupIdx < groups.length &&
             g.every(function (b) { return b.type === 'pause'; }));
    state.busy = false;
  }

  function jumpToBeat(n) {
    var count = 0;
    for (var gi = 0; gi < groups.length && count < n; gi++) {
      for (var bi = 0; bi < groups[gi].length && count < n; bi++) {
        execBeat(groups[gi][bi], { instant: true });
        count++;
      }
      state.groupIdx = gi + 1;
    }
    /* visa ev. overlay om sista beatet var ett titelkort */
    var flat = [];
    for (var i = 0; i < groups.length; i++) flat = flat.concat(groups[i]);
    var last = flat[Math.min(n, flat.length) - 1];
    if (last && last.type === 'title') showOverlay(last.key);
  }

  /* ── WakeLock (mobilen ska inte slockna mitt i visningen) ── */
  var wakeLock = null;
  function requestWakeLock() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (wl) { wakeLock = wl; })
          .catch(function () { /* ofarligt om det nekas */ });
      }
    } catch (e) { /* ofarligt */ }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && wakeLock) requestWakeLock();
  });

  /* ── Händelser ──────────────────────────────────────── */
  function bindEvents() {
    el.stage.addEventListener('click', function (ev) {
      if (ev.target.closest('#hud')) return;
      if (!state.auto) advance();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.code === 'Space' || ev.code === 'ArrowRight') {
        ev.preventDefault();
        if (!state.auto) advance();
      }
    });
    el.hud.addEventListener('click', function (ev) {
      var chip = ev.target.closest('.hud-chip');
      if (!chip) return;
      if (chip.hasAttribute('data-lang')) setLang(chip.getAttribute('data-lang'));
      if (chip.id === 'hud-restart') {
        var p = new URLSearchParams(location.search);
        p.delete('beat');
        p.set('lang', state.lang);
        location.search = p.toString();
      }
    });
  }

  /* ── Start ──────────────────────────────────────────── */
  initChrome();
  bindEvents();
  setChat('botPaco');

  if (!isNaN(state.jumpTo) && state.jumpTo > 0) {
    jumpToBeat(state.jumpTo);
  }
  if (state.auto) {
    autoplayLoop();
  } else if (isNaN(state.jumpTo)) {
    el.tapHint.classList.remove('hidden');
  }
})();
