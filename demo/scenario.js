/* Asistente de Paco — scenariodata (allt demo-copy bor HÄR)
 *
 * VIKTIGT om stilen: Pacos meddelanden och listformatet härmar medvetet hans
 * riktiga stil från gruppen — inklusive "stavfel" och ojämn numrering
 * ("1-machete✅", "4patiño✅", "q", "x privado", "9'30", "chic@s").
 * RÄTTA INTE dessa — de är poängen. Boten skriver däremot ren spanska.
 *
 * Filen förfinas mot den riktiga chattexporten (source/chat-export.txt) när
 * den finns — kör `npm run parse` och justera strängarna här.
 *
 * Beat-typer:
 *  {type:'title', key}                    aktkort (fullskärm), i18n-nyckel
 *  {type:'caption', key}                  berättartext i caption-baren, i18n-nyckel
 *  {type:'chat', id}                      växla aktiv chatt
 *  {type:'system', text}                  datum-pill (literal, ej i18n)
 *  {type:'msg', from, text, time, typing} chattbubbla; typing = ms "skriver…" före
 *  {type:'pause', ms}                     paus i autoplay (ignoreras i tap-läge)
 *  {type:'end'}                           slutkort + window.__DEMO_DONE
 *  chain:true                             limmas till föregående beat = ett tap
 */
window.PADEL_SCENARIO = (function () {
  'use strict';

  var chats = {
    group: {
      id: 'group', kind: 'group',
      title: 'PULL MAÑANERAS DE 3ª',
      subtitleKey: 'ui.members',
      perspective: 'paco',
      avatar: 'PM', avatarBg: '#C77B3B'
    },
    botPaco: {
      id: 'botPaco', kind: 'dm',
      title: 'Asistente de Paco 🎾',
      subtitleKey: 'ui.online',
      perspective: 'paco',
      avatar: '🎾', avatarBg: '#00A884'
    },
    botJohn: {
      id: 'botJohn', kind: 'dm',
      title: 'Asistente de Paco 🎾',
      subtitleKey: 'ui.online',
      perspective: 'john',
      deviceOwner: 'John',
      avatar: '🎾', avatarBg: '#00A884'
    },
    botTommy: {
      id: 'botTommy', kind: 'dm',
      title: 'Asistente de Paco 🎾',
      subtitleKey: 'ui.online',
      perspective: 'tommy',
      deviceOwner: 'Tommy',
      avatar: '🎾', avatarBg: '#00A884'
    }
  };

  /* Avsändare (visningsnamn i gruppbubblor). Färg sätts deterministiskt i app.js. */
  var cast = {
    paco:     { name: 'Paco' },
    bot:      { name: 'Asistente de Paco 🎾', isBot: true },
    machete:  { name: 'machete' },
    joseluis: { name: 'José Luis cañasveras' },
    gamez:    { name: 'Gamez' },
    patino:   { name: 'patiño' },
    antonio:  { name: 'antonio martin' },
    ale:      { name: 'ale' },
    chichi:   { name: 'chichi' },
    juanc:    { name: 'juan Córdoba' },
    domingo:  { name: 'domingo' },
    miguelz:  { name: 'Miguel zamora' },
    borja:    { name: 'borja' },
    loren:    { name: 'loren' },
    marcos:   { name: 'marcos' },
    tellez:   { name: 'tellez' },
    franco:   { name: 'franco' },
    pedrog:   { name: 'pedro gomez' },
    juang:    { name: 'Juan gonzalez' },
    pepej:    { name: 'pepe jaen' },
    john:     { name: 'John' },
    tommy:    { name: 'Tommy' }
  };

  /* Pacos rubrikblock — exakt som han skriver det */
  var HEAD =
    'Pull sábado\n' +
    'Hora ‼️‼️9:30‼️‼️\n' +
    'Nivel tercera\n' +
    'Lugar fly';

  var LIST_14 =
    HEAD + '\n\n' +
    '1-machete✅\n' +
    '2 Gamez\n' +
    '3- José Luis cañasveras✅\n' +
    '4patiño✅\n' +
    '5 tellez✅\n' +
    '6- antonio martin✅\n' +
    '7 chichi✅\n' +
    '8 juan Córdoba✅\n' +
    '9- domingo✅\n' +
    '10 Miguel zamora✅\n' +
    '11 borja✅\n' +
    '12- loren✅\n' +
    '13 marcos✅\n' +
    '14 ale✅\n' +
    '15\n' +
    '16\n\n' +
    'Reservas\n\n' +
    'Faltan 2 👉 "yo"';

  var LIST_16 =
    HEAD + '\n\n' +
    '1-machete✅\n' +
    '2 Gamez\n' +
    '3- José Luis cañasveras✅\n' +
    '4patiño✅\n' +
    '5 tellez✅\n' +
    '6- antonio martin✅\n' +
    '7 chichi✅\n' +
    '8 juan Córdoba✅\n' +
    '9- domingo✅\n' +
    '10 Miguel zamora✅\n' +
    '11 borja✅\n' +
    '12- loren✅\n' +
    '13 marcos✅\n' +
    '14 ale✅\n' +
    '15 franco✅\n' +
    '16 pedro gomez✅\n\n' +
    'Reservas\n' +
    'Juan gonzalez\n' +
    'pepe jaen\n\n' +
    '🔒 PULL CERRADA — 4 pistas\n' +
    'Nos vemos en fly 🎾';

  var LIST_PROMOTED =
    'chichi se cae ➡️ entra Juan gonzalez (1º reserva) ✅\n\n' +
    HEAD + '\n\n' +
    '1-machete✅\n' +
    '2 Gamez✅\n' +
    '3- José Luis cañasveras✅\n' +
    '4patiño✅\n' +
    '5 tellez✅\n' +
    '6- antonio martin✅\n' +
    '7 Juan gonzalez✅\n' +
    '8 juan Córdoba✅\n' +
    '9- domingo✅\n' +
    '10 Miguel zamora✅\n' +
    '11 borja✅\n' +
    '12- loren✅\n' +
    '13 marcos✅\n' +
    '14 ale✅\n' +
    '15 franco✅\n' +
    '16 pedro gomez✅\n\n' +
    'Reservas\n' +
    'pepe jaen';

  var SORTEO =
    '🎲 SORTEO DE PISTAS — Pull 9:30\n\n' +
    'Pista 1: machete + Gamez 🆚 patiño + tellez\n' +
    'Pista 2: José Luis cañasveras + ale 🆚 antonio martin + borja\n' +
    'Pista 3: juan Córdoba + domingo 🆚 Miguel zamora + loren\n' +
    'Pista 4: marcos + franco 🆚 pedro gomez + Juan gonzalez\n\n' +
    '✔️ machete juega con Gamez (cambio pedido)\n' +
    '🍀 Suerte a todos';

  var RONDA2 =
    '🏆 RONDA 2 — el que gana sube ⬆️\n\n' +
    'Pista 1: machete + Gamez 🆚 José Luis cañasveras + ale\n' +
    'Pista 2: patiño + tellez 🆚 juan Córdoba + domingo\n' +
    'Pista 3: antonio martin + borja 🆚 pedro gomez + Juan gonzalez\n' +
    'Pista 4: Miguel zamora + loren 🆚 marcos + franco\n\n' +
    'Ganadores suben ⬆️ · perdedores bajan ⬇️';

  var RESUMEN =
    '📊 Resumen — sábado\n\n' +
    '🎾 Pulls organizadas: 3\n' +
    '· 9:30 tercera fly — 16/16 ✅\n' +
    '· 11:00 tercera fly — 16/16 ✅\n' +
    '· 19:00 cuarta alta — 12/16\n\n' +
    '👥 Jugadores hoy: 44\n' +
    '🆕 Nuevos: 2 (John 🇬🇧, Tommy 🇸🇪)\n' +
    '💶 Comisión estimada: 44 € (ej. 1 €/jugador)\n\n' +
    '📅 Domingo 9:30 — 16/16 🔒\n\n' +
    'Buenas noches jefe 😴';

  var beats = [

    /* ─── AKT 0: intro ─── */
    { type: 'title', key: 'title.intro' },

    /* ─── AKT 1: Paco skapar pullen (1:1 med boten) ─── */
    { type: 'caption', key: 'cap.create' },
    { type: 'chat', id: 'botPaco', chain: true },
    { type: 'system', text: 'viernes', chain: true },
    { type: 'msg', from: 'paco', time: '18:47', text: "pull sabado 9'30 tercera fly 16" },
    { type: 'msg', from: 'bot', time: '18:47', typing: 1400, text:
      '✅ Creada. La publico en el grupo 👇\n\n' + HEAD + '\n\n' +
      'Para apuntarse: responder "yo"' },
    { type: 'pause', ms: 1200 },

    /* ─── AKT 2: gruppen fylls ─── */
    { type: 'caption', key: 'cap.group' },
    { type: 'chat', id: 'group', chain: true },
    { type: 'system', text: 'viernes', chain: true },
    { type: 'msg', from: 'bot', time: '18:48', text:
      HEAD + '\n\n' + 'Para apuntarse: responder "yo"' },
    { type: 'msg', from: 'paco', time: '18:50', text: "Venga apuntaros para las 9'30 gracias" },

    { type: 'caption', key: 'cap.yo' },
    { type: 'msg', from: 'machete', time: '18:52', text: 'yo', chain: true },
    { type: 'msg', from: 'bot', time: '18:52', text:
      'Pull sábado 9:30 — fly\n\n1-machete✅\n\nQuedan 15 plazas 👉 "yo"' },

    { type: 'caption', key: 'cap.obey' },
    { type: 'msg', from: 'paco', time: '18:55', text: 'apunta a gamez q me lo dijo x privado', chain: true },
    { type: 'msg', from: 'bot', time: '18:55', text:
      'Pull sábado 9:30 — fly\n\n1-machete✅\n2 Gamez\n\nQuedan 14 plazas 👉 "yo"' },

    { type: 'msg', from: 'joseluis', time: '18:57', text: 'Yoo' },
    { type: 'msg', from: 'patino', time: '18:58', text: 'yo ✅', chain: true },
    { type: 'msg', from: 'tellez', time: '18:58', text: 'yo', chain: true },
    { type: 'msg', from: 'antonio', time: '19:01', text: 'voy', chain: true },
    { type: 'msg', from: 'chichi', time: '19:02', text: 'yo!' },
    { type: 'caption', key: 'cap.pain', chain: true },
    { type: 'msg', from: 'bot', time: '19:02', text:
      'Pull sábado 9:30 — fly\n\n' +
      '1-machete✅\n2 Gamez\n3- José Luis cañasveras✅\n4patiño✅\n' +
      '5 tellez✅\n6- antonio martin✅\n7 chichi✅\n\n' +
      'Quedan 9 plazas 👉 "yo"' },
    { type: 'pause', ms: 1600 },

    { type: 'caption', key: 'cap.later' },
    { type: 'msg', from: 'bot', time: '21:03', text: LIST_14, chain: true },
    { type: 'pause', ms: 2200 },

    /* ─── AKT 3: nudge + stängning ─── */
    { type: 'caption', key: 'cap.nudge' },
    { type: 'msg', from: 'bot', time: '21:15', typing: 1200, text:
      "Venga chic@s faltan 2 para cerrar la pull de las 9'30 vamos 💪🎾" },
    { type: 'msg', from: 'franco', time: '21:18', text: 'yo' },
    { type: 'msg', from: 'pedrog', time: '21:19', text: 'yo✅', chain: true },
    { type: 'msg', from: 'juang', time: '21:20', text: 'yo' },
    { type: 'msg', from: 'pepej', time: '21:21', text: 'si hay hueco yo' },
    { type: 'caption', key: 'cap.closed', chain: true },
    { type: 'msg', from: 'bot', time: '21:21', typing: 1400, text: LIST_16 },
    { type: 'pause', ms: 2600 },

    /* ─── AKT 4: avhopp → reserva lyfts ─── */
    { type: 'caption', key: 'cap.drop' },
    { type: 'system', text: 'sábado', chain: true },
    { type: 'msg', from: 'chichi', time: '8:12', text:
      'Paco lo siento me ha salido un tema no puedo ir 🙏' },
    { type: 'caption', key: 'cap.promote', chain: true },
    { type: 'msg', from: 'bot', time: '8:12', typing: 1400, text: LIST_PROMOTED },
    { type: 'msg', from: 'juang', time: '8:14', text: 'vamosss 💪' },
    { type: 'caption', key: 'cap.human' },
    { type: 'msg', from: 'paco', time: '8:15', text: 'gracias juan eres un crack', chain: true },
    { type: 'pause', ms: 1400 },

    /* ─── AKT 5: byte + sorteo ─── */
    { type: 'caption', key: 'cap.swap' },
    { type: 'msg', from: 'machete', time: '8:26', text:
      'paco queria cambiar a patiño por gamez pa jugar con el', chain: true },
    { type: 'msg', from: 'paco', time: '8:27', text: '@asistente sorteo, machete con gamez' },
    { type: 'caption', key: 'cap.sorteo', chain: true },
    { type: 'msg', from: 'bot', time: '8:27', typing: 2000, text: SORTEO },
    { type: 'pause', ms: 2800 },

    /* ─── AKT 6: resultat → vinnarbanan rond 2 ─── */
    { type: 'caption', key: 'cap.results' },
    { type: 'msg', from: 'paco', time: '11:32', text: 'ganadores? 👇', chain: true },
    { type: 'msg', from: 'machete', time: '11:33', text: 'p1 machete y gamez 6-3' },
    { type: 'msg', from: 'ale', time: '11:33', text: 'p2 jose luis y yo', chain: true },
    { type: 'msg', from: 'domingo', time: '11:34', text: 'p3 nosotros 💪', chain: true },
    { type: 'msg', from: 'pedrog', time: '11:34', text: 'p4 pedro y juan' },
    { type: 'caption', key: 'cap.round2', chain: true },
    { type: 'msg', from: 'bot', time: '11:35', typing: 1800, text: RONDA2 },
    { type: 'pause', ms: 2600 },

    /* ─── AKT 7: turister (bytt perspektiv: turistens mobil) ─── */
    { type: 'title', key: 'title.tourist' },
    { type: 'caption', key: 'cap.johnIntro' },
    { type: 'chat', id: 'botJohn', chain: true },
    { type: 'system', text: 'sábado', chain: true },
    { type: 'msg', from: 'john', time: '17:05', text:
      "Hi! I'm in Torre del Mar this week. Any padel tomorrow? Level 3-ish 😅" },
    { type: 'msg', from: 'bot', time: '17:05', typing: 1400, text:
      'Hey John! 🎾 Yes — pull tomorrow (Sunday) 9:30, nivel tercera, at Padelfly.\n2 spots left. Want in?' },
    { type: 'msg', from: 'john', time: '17:06', text: 'Yes please!' },
    { type: 'msg', from: 'bot', time: '17:06', text:
      "Done ✅ You're nº 15.\n📍 Padelfly, Torre del Mar\n⏰ Be there 9:20. ¡Hasta mañana!" },

    { type: 'caption', key: 'cap.tommy' },
    { type: 'chat', id: 'botTommy', chain: true },
    { type: 'system', text: 'sábado', chain: true },
    { type: 'msg', from: 'tommy', time: '17:41', text:
      'Hej! Jag är i Torre del Mar med familjen. Finns det padel imorgon? Nivå 3–4 🇸🇪' },
    { type: 'msg', from: 'bot', time: '17:41', typing: 1400, text:
      'Hej Tommy! 🎾 Absolut — imorgon (söndag) 9:30, nivel tercera på Padelfly.\nSista platsen — ska jag skriva upp dig?' },
    { type: 'msg', from: 'tommy', time: '17:42', text: 'Ja tack! 🙌' },
    { type: 'msg', from: 'bot', time: '17:42', text:
      'Klart ✅ Du är nº 16.\n📍 Padelfly, Torre del Mar\n⏰ Kom 9:20. ¡Bienvenido! 🇸🇪🤝🇪🇸' },
    { type: 'caption', key: 'cap.touristWhy' },
    { type: 'pause', ms: 2000 },

    /* ─── AKT 8: Pacos privata dagssammanställning ─── */
    { type: 'caption', key: 'cap.summary' },
    { type: 'chat', id: 'botPaco', chain: true },
    { type: 'system', text: 'sábado', chain: true },
    { type: 'msg', from: 'bot', time: '21:45', typing: 1800, text: RESUMEN },
    { type: 'msg', from: 'paco', time: '21:47', text: '😂👏👏' },
    { type: 'caption', key: 'cap.end' },
    { type: 'pause', ms: 2200, chain: true },

    { type: 'title', key: 'title.end', persist: true },
    { type: 'end', chain: true }
  ];

  return { chats: chats, cast: cast, beats: beats };
})();
