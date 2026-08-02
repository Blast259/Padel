/* Asistente de Paco — scenariodata (allt demo-copy bor HÄR)
 *
 * VIKTIGT om stilen: Pacos meddelanden och listformatet härmar medvetet hans
 * riktiga stil från gruppen — inklusive "stavfel" och ojämn numrering
 * ("1-machete✅", "3patiño✅", "q", "x privado", "9'30", "chic@s").
 * RÄTTA INTE dessa — de är poängen. Boten skriver däremot ren spanska.
 *
 * Verklighetsförankring (granskningsrundan med Mikel):
 *  - 09:30-listan publiceras redan FÖRSÅDD med fijos (stammisarna) och
 *    fylls på minuter — den sköter sig själv.
 *  - 11:00 är det svårfyllda passet ("Paco has to beg") → nudge + privat
 *    utfrågning riktas dit.
 *  - Sen ankomst-scenen visar "falta X"-flödet + punktlighetsregistret.
 *
 * Beat-typer:
 *  {type:'title', key, persist}          aktkort (fullskärm), i18n-nyckel
 *  {type:'caption', key}                 berättartext, i18n-nyckel
 *  {type:'chat', id}                     växla aktiv chatt
 *  {type:'system', text}                 datum-pill (literal, ej i18n)
 *  {type:'msg', from, text, time, typing} chattbubbla; typing = ms "skriver…"
 *  {type:'pause', ms}                    paus i autoplay (ignoreras i tap-läge)
 *  {type:'end'}                          slutkort + window.__DEMO_DONE
 *  chain:true                            limmas till föregående beat = ett tap
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
    danis:    { name: 'Dani silva' },
    pascal:   { name: 'pascal paci' },
    john:     { name: 'John' },
    tommy:    { name: 'Tommy' }
  };

  /* Pacos rubrikblock — exakt som han skriver dem */
  var HEAD930 =
    'Pull sábado\n' +
    'Hora ‼️‼️9:30‼️‼️\n' +
    'Nivel tercera\n' +
    'Lugar fly';

  var HEAD1100 =
    'Pull sábado\n' +
    "Hora 11'00\n" +
    'Lugar padelfly\n' +
    'Nivel cuarta alta';

  /* Fijos-stommen för 9:30 — publiceras redan ifylld (Mikels fynd) */
  var FIJOS930 =
    '1-machete✅\n' +
    '2 José Luis cañasveras✅\n' +
    '3patiño✅\n' +
    '4 tellez✅\n' +
    '5- antonio martin✅\n' +
    '6 chichi✅\n' +
    '7- juan Córdoba✅\n' +
    '8 domingo✅\n' +
    '9- Miguel zamora✅\n' +
    '10 borja✅\n' +
    '11- loren✅\n' +
    '12 marcos✅';

  /* Utropet: dagens BÅDA pass i ett meddelande, som Paco gör på riktigt */
  var ANNOUNCE =
    HEAD930 + '\n\n' +
    FIJOS930 + '\n' +
    '13\n14\n15\n16\n\n' +
    'Reservas\n\n' +
    '————————\n\n' +
    HEAD1100 + '\n\n' +
    '1-paolo\n' +
    '2- gabrielle\n' +
    '3-checho\n' +
    '4- Jose Villalobos\n' +
    '5-pepe Lucena\n' +
    '6-Compi de pepe lucena\n' +
    '7-\n8-\n9-\n10-\n11-\n12-\n\n' +
    'Reservas\n\n' +
    'Para apuntarse: responder "yo"';

  var L930_GAMEZ =
    'Pull sábado 9:30 — fly\n\n' +
    FIJOS930 + '\n' +
    '13 Gamez\n' +
    '14\n15\n16\n\n' +
    'Quedan 3 👉 "yo"';

  var L930_FULL =
    'Pull sábado 9:30 — fly\n\n' +
    FIJOS930 + '\n' +
    '13 Gamez\n' +
    '14 ale✅\n' +
    '15 franco✅\n' +
    '16 pedro gomez✅\n\n' +
    '🔒 PULL CERRADA — 4 pistas\n' +
    'Nos vemos en fly 🎾';

  var L1100_10 =
    HEAD1100 + '\n\n' +
    '1-paolo\n' +
    '2- gabrielle\n' +
    '3-checho\n' +
    '4- Jose Villalobos\n' +
    '5-pepe Lucena\n' +
    '6-Compi de pepe lucena\n' +
    '7- Grego\n' +
    '8-eric\n' +
    '9- ola\n' +
    '10 ole\n' +
    '11-\n12-\n\n' +
    'Reservas\n\n' +
    'Faltan 2 👉 "yo"';

  var L1100_FULL =
    "Pull sábado 11'00 — padelfly\n\n" +
    '1-paolo\n' +
    '2- gabrielle\n' +
    '3-checho\n' +
    '4- Jose Villalobos\n' +
    '5-pepe Lucena\n' +
    '6-Compi de pepe lucena\n' +
    '7- Grego\n' +
    '8-eric\n' +
    '9- ola\n' +
    '10 ole\n' +
    '11 Dani silva✅\n' +
    '12 pascal paci✅\n\n' +
    '🔒 PULL CERRADA — 3 pistas\n' +
    'Nos vemos en padelfly 🎾';

  /* 9:30-listan efter chichis avhopp: 1º reserva in (ny fijos-ordning) */
  var LIST_PROMOTED =
    'chichi se cae ➡️ entra Juan gonzalez (1º reserva) ✅\n\n' +
    'Pull sábado 9:30 — fly\n\n' +
    '1-machete✅\n' +
    '2 José Luis cañasveras✅\n' +
    '3patiño✅\n' +
    '4 tellez✅\n' +
    '5- antonio martin✅\n' +
    '6 Juan gonzalez✅\n' +
    '7- juan Córdoba✅\n' +
    '8 domingo✅\n' +
    '9- Miguel zamora✅\n' +
    '10 borja✅\n' +
    '11- loren✅\n' +
    '12 marcos✅\n' +
    '13 Gamez✅\n' +
    '14 ale✅\n' +
    '15 franco✅\n' +
    '16 pedro gomez✅\n\n' +
    'Reservas\n' +
    'pepe jaen';

  /* Pista-blocken följer Pacos riktiga lottningsformat:
   * "Pista N" + ett par per rad. Paren är Pacos — slumpen sätter startbanor. */
  var SORTEO =
    "Pull sábado 9'30\n\n" +
    'Pista 1\n' +
    'Machete - Gamez\n' +
    'Patiño - Tellez\n\n' +
    'Pista 2\n' +
    'Cañasveras - Ale\n' +
    'Antonio martin - Borja\n\n' +
    'Pista 3\n' +
    'Juan Córdoba - Domingo\n' +
    'Zamora - Loren\n\n' +
    'Pista 4\n' +
    'Marcos - Franco\n' +
    'Pedro gomez - Juan gonzalez\n\n' +
    '✔️ Machete con Gamez (cambio pedido)\n' +
    '🍀 Suerte a todos';

  var RONDA2 =
    '🏆 Ronda 2 — el que gana sube\n\n' +
    'Pista 1\n' +
    'Machete - Gamez\n' +
    'Cañasveras - Ale\n\n' +
    'Pista 2\n' +
    'Patiño - Tellez\n' +
    'Juan Córdoba - Domingo\n\n' +
    'Pista 3\n' +
    'Antonio martin - Borja\n' +
    'Pedro gomez - Juan gonzalez\n\n' +
    'Pista 4\n' +
    'Zamora - Loren\n' +
    'Marcos - Franco\n\n' +
    'Ganadores suben ⬆️ · perdedores bajan ⬇️\n' +
    'A 6 juegos → ¡tiempo! · empate → punto de oro';

  /* Dagens två pass + punktlighetsraden (Mikels förslag, privat för Paco) */
  var RESUMEN =
    '📊 Resumen — sábado\n\n' +
    '🎾 Pulls organizadas: 2\n' +
    '· 9:30 tercera fly — 16/16 ✅\n' +
    '· 11:00 cuarta alta fly — 12/12 ✅\n\n' +
    '👥 Jugadores hoy: 28\n' +
    '🆕 Nuevos: 2 (John 🇬🇧, Tommy 🇸🇪)\n' +
    '⏱️ Retrasos: 1 (patiño — avisado 🙃)\n' +
    '💶 Comisión estimada: 28 € (ej. 1 €/jugador)\n\n' +
    '📅 Domingo 9.00 a 11.00 — 16/16 🔒\n\n' +
    'Buenas noches jefe 😴';

  var beats = [

    /* ─── AKT 0: intro ─── */
    { type: 'title', key: 'title.intro' },

    /* ─── AKT 1: Paco skapar BÅDA passen (1:1 med boten) ─── */
    { type: 'caption', key: 'cap.create' },
    { type: 'chat', id: 'botPaco', chain: true },
    { type: 'system', text: 'viernes', chain: true },
    { type: 'msg', from: 'paco', time: '18:47', text:
      "pull sabado\n9'30 tercera fly 16\n11'00 cuarta alta 12" },
    { type: 'msg', from: 'bot', time: '18:47', typing: 1400, text:
      '✅ Creadas las dos. Los fijos ya están dentro.\nLa publico en el grupo 👇' },
    { type: 'pause', ms: 1200 },

    /* ─── AKT 2: utropet — 9:30 redan försådd, fylls på minuter ─── */
    { type: 'caption', key: 'cap.fijos' },
    { type: 'chat', id: 'group', chain: true },
    { type: 'system', text: 'viernes', chain: true },
    { type: 'msg', from: 'bot', time: '18:48', text: ANNOUNCE },
    { type: 'pause', ms: 2200 },
    { type: 'msg', from: 'paco', time: '18:50', text: "Venga apuntaros para las 9'30 gracias" },

    { type: 'caption', key: 'cap.obey' },
    { type: 'msg', from: 'paco', time: '18:55', text: 'apunta a gamez q me lo dijo x privado', chain: true },
    { type: 'msg', from: 'bot', time: '18:55', text: L930_GAMEZ },

    { type: 'caption', key: 'cap.yo' },
    { type: 'msg', from: 'ale', time: '18:57', text: 'yo', chain: true },
    { type: 'msg', from: 'franco', time: '19:01', text: 'yo', chain: true },
    { type: 'msg', from: 'pedrog', time: '19:02', text: 'yo✅' },
    { type: 'caption', key: 'cap.fijosFull', chain: true },
    { type: 'msg', from: 'bot', time: '19:02', typing: 1400, text: L930_FULL },
    { type: 'pause', ms: 2200 },

    { type: 'msg', from: 'juang', time: '20:41', text: 'yo' },
    { type: 'msg', from: 'bot', time: '20:41', text:
      "Completa la de las 9'30 ✋ — Juan gonzalez 1º reserva ✅", chain: true },
    { type: 'msg', from: 'pepej', time: '20:44', text: 'si hay hueco yo' },
    /* Pacos välkomstritual för nya i gruppen — direkt ur chatten */
    { type: 'msg', from: 'paco', time: '20:44', text: 'Bienvenido al grupo pepe' },
    { type: 'msg', from: 'bot', time: '20:45', text: 'pepe jaen 2º reserva ✅', chain: true },
    { type: 'pause', ms: 1400 },

    /* ─── AKT 3: elvan — passet Paco annars får tigga ihop ─── */
    { type: 'caption', key: 'cap.later' },
    { type: 'msg', from: 'bot', time: '21:03', text: L1100_10, chain: true },
    { type: 'pause', ms: 2200 },

    { type: 'caption', key: 'cap.nudge' },
    /* Pacos literala fras ur chatten — den gällde just 11'00 */
    { type: 'msg', from: 'bot', time: '21:15', typing: 1200, text:
      "Venga chic@s dos más para cerrar la pull de las 11'00 vamos 💪🏻🎾🎾💪🏻" },

    /* Pacos tyngsta osynliga jobb: fråga spelare privat, en och en
     * ("¿Puedes jugar mañana a las 11'00?" — literal fras ur hans 1:1-chatt). */
    { type: 'caption', key: 'cap.outreach' },
    { type: 'chat', id: 'botPaco', chain: true },
    { type: 'msg', from: 'bot', time: '21:16', typing: 1400, text:
      "Siguen faltando 2 para las 11'00 ⚠️\n" +
      'Disponibles hoy: Dani silva y pascal paci\n' +
      "¿Les pregunto en privado? («¿Puedes jugar mañana a las 11'00?»)" },
    { type: 'msg', from: 'paco', time: '21:17', text: 'dale 👍' },
    { type: 'caption', key: 'cap.outreachDone' },
    { type: 'chat', id: 'group', chain: true },
    { type: 'msg', from: 'danis', time: '21:18', text: 'yo', chain: true },
    { type: 'msg', from: 'pascal', time: '21:19', text: 'voy' },
    { type: 'caption', key: 'cap.closed', chain: true },
    { type: 'msg', from: 'bot', time: '21:19', typing: 1400, text: L1100_FULL },
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

    /* ─── AKT 5b: sen till pullen — "falta X"-flödet (Mikels förslag) ─── */
    { type: 'caption', key: 'cap.late' },
    { type: 'msg', from: 'miguelz', time: '9:31', text: 'falta patiño en pista 1', chain: true },
    { type: 'msg', from: 'bot', time: '9:31', text: 'Le escribo 👍' },
    { type: 'caption', key: 'cap.lateChase' },
    { type: 'msg', from: 'bot', time: '9:33', typing: 1400, text:
      'patiño: «llego en 5 min» 🏃\nEmpezad — entra al llegar', chain: true },
    { type: 'pause', ms: 2000 },

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
      'Hey John! 🎾 Yes — special one tomorrow (Sunday): 9.00 to 11.00, one long session at Padelfly.\n2 spots left. Want in?' },
    { type: 'msg', from: 'john', time: '17:06', text: 'Yes please!' },
    { type: 'msg', from: 'bot', time: '17:06', text:
      "Done ✅ You're nº 15.\n📍 Padelfly, Torre del Mar\n⏰ Be there 8:50. ¡Hasta mañana!" },

    { type: 'caption', key: 'cap.tommy' },
    { type: 'chat', id: 'botTommy', chain: true },
    { type: 'system', text: 'sábado', chain: true },
    { type: 'msg', from: 'tommy', time: '17:41', text:
      'Hej! Jag är i Torre del Mar med familjen. Finns det padel imorgon? Nivå 3–4 🇸🇪' },
    { type: 'msg', from: 'bot', time: '17:41', typing: 1400, text:
      'Hej Tommy! 🎾 Absolut — imorgon (söndag) är det ett långt pass: 9.00–11.00 på Padelfly.\nSista platsen — ska jag skriva upp dig?' },
    { type: 'msg', from: 'tommy', time: '17:42', text: 'Ja tack! 🙌' },
    { type: 'msg', from: 'bot', time: '17:42', text:
      'Klart ✅ Du är nº 16.\n📍 Padelfly, Torre del Mar\n⏰ Kom 8:50. ¡Bienvenido! 🇸🇪🤝🇪🇸' },
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
