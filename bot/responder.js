/* Orkestrering: text in → parse → motor → svarstext (spanska).
 * Sessionsval följer demons regler (Mikels fynd):
 *  - anges en tid → den pullen
 *  - finns bara en pull → den
 *  - annars → enordsfråga ("¿9'30 u 11'00?") och kommandot väntar tills
 *    nästa meddelande med bara en tid kommer (pending).
 */
import { parse } from './parser.js';
import * as engine from './engine.js';

export const AYUDA = `🎾 *TU ASISTENTE — GUÍA RÁPIDA*

Es tu secretario privado. Solo hablas TÚ con él.
Él te prepara las listas — tú las pegas en el grupo, como siempre.

1️⃣ *Crear una pull*
pull lunes 9'30 tercera fly 16

2️⃣ *Apuntar gente*
apunta a machete
apunta a gamez y patiño

3️⃣ *Poner el ✅*
machete confirmado

4️⃣ *Bajas*
se cae chichi
(el primer reserva entra solo)

5️⃣ *Reservas*
reserva juan gonzalez

6️⃣ *Ver la lista*
lista

7️⃣ *Sorteo de pistas*
sorteo: machete con gamez, patiño con tellez, ...
(tú pones las parejas — él sortea las pistas)

❗ Si algo sale mal: no pasa nada. Sigue como siempre —
el grupo nunca depende del asistente. *Tú mandas. Él obedece.* 🎾`;

const ERRORES = {
  pull_syntax: 'Para crear una pull escribe:\npull lunes 9\'30 tercera fly 16\n(día · hora · nivel · lugar · plazas)',
  sin_nombre: '¿A quién apunto? Escribe por ejemplo: apunta a machete',
  sorteo_syntax: 'Para el sorteo escribe las parejas así:\nsorteo: machete con gamez, patiño con tellez, ...'
};

function emptyState() { return { sessions: [], pending: null, saludado: false }; }

/* Väljer session; sätts pending när frågan måste ställas.
 * Regelordning (Mikels fynd): angiven tid → enda pull → namnet finns i
 * exakt en pull → annars enordsfrågan. */
function resolveSession(state, hora, cmd) {
  if (hora) {
    const s = state.sessions.find(x => x.hora.canon === hora.canon);
    if (s) return { session: s };
    const horas = state.sessions.map(x => x.hora.display).join(' y ');
    return { reply: state.sessions.length
      ? `No hay ninguna pull a las ${hora.display}. Tengo: ${horas}.`
      : 'No hay ninguna pull creada. Escribe por ejemplo:\npull lunes 9\'30 tercera fly 16' };
  }
  if (state.sessions.length === 1) return { session: state.sessions[0] };
  if (state.sessions.length === 0) {
    return { reply: 'No hay ninguna pull creada. Escribe por ejemplo:\npull lunes 9\'30 tercera fly 16' };
  }
  /* namnbaserad härledning: rör kommandot en person som bara finns i en pull? */
  if (cmd.nombre) {
    const hits = state.sessions.filter(s => engine.enSession(s, cmd.nombre));
    if (hits.length === 1) return { session: hits[0] };
  }
  state.pending = cmd;
  const horas = state.sessions.map(x => `las ${x.hora.display}`).join(' o ');
  return { reply: `¿Para ${horas}? 😊` };
}

function dispatch(state, cmd) {
  switch (cmd.action) {
    case 'ayuda':
      return { reply: AYUDA };
    case 'gracias':
      return { reply: 'A mandar 🎾' };
    case 'error':
      return { reply: ERRORES[cmd.message] || ERRORES.pull_syntax };
    case 'crear':
      return engine.crearSession(state, { dia: cmd.dia, hora: cmd.hora, nivel: cmd.nivel, lugar: cmd.lugar, plazas: cmd.plazas });
    case 'lista': {
      if (cmd.hora) {
        const r = resolveSession(state, cmd.hora, cmd);
        return r.session ? { reply: engine.renderLista(r.session) } : r;
      }
      return { reply: engine.renderTodas(state) };
    }
    case 'apuntar': {
      const r = resolveSession(state, cmd.hora, cmd);
      return r.session ? engine.apuntar(r.session, cmd.nombres) : r;
    }
    case 'confirmar': {
      const r = resolveSession(state, cmd.hora, cmd);
      return r.session ? engine.confirmar(r.session, cmd.nombre) : r;
    }
    case 'baja': {
      const r = resolveSession(state, cmd.hora, cmd);
      return r.session ? engine.baja(r.session, cmd.nombre) : r;
    }
    case 'reservar': {
      const r = resolveSession(state, cmd.hora, cmd);
      return r.session ? engine.reservar(r.session, cmd.nombre) : r;
    }
    case 'sorteo': {
      const r = resolveSession(state, cmd.hora, cmd);
      return r.session ? engine.sorteo(r.session, cmd.parejas) : r;
    }
    case 'borrar': {
      if (!cmd.hora) {
        if (state.sessions.length === 1) return engine.borrar(state, state.sessions[0].hora);
        return resolveSession(state, null, cmd);
      }
      return engine.borrar(state, cmd.hora);
    }
    case 'borrar_todo':
      state.sessions = [];
      state.pending = null;
      return { reply: 'Listas borradas. Empezamos de cero 👍' };
    case 'hora_only': {
      if (state.pending) {
        const pend = { ...state.pending, hora: cmd.hora };
        state.pending = null;
        return dispatch(state, pend);
      }
      return { reply: 'Dime qué hago con esa hora 😊 (por ejemplo: lista 9\'30)' };
    }
    default:
      return { reply: 'No te he entendido 🤔 Escribe *ayuda* para ver lo que sé hacer.' };
  }
}

/* Huvudingång: en avsändare, en text → svarstext. Muterar `store`. */
export function handle(store, senderId, text) {
  if (!store.senders) store.senders = {};
  if (!store.senders[senderId]) store.senders[senderId] = emptyState();
  const state = store.senders[senderId];

  const cmd = parse(text);
  if (cmd.action !== 'hora_only') state.pending = null;

  if (!state.saludado) {
    state.saludado = true;
    if (cmd.action === 'ayuda' || cmd.action === 'unknown' || cmd.action === 'gracias') {
      return `¡Hola! Soy tu asistente 🎾\n\n${AYUDA}`;
    }
  }
  return dispatch(state, cmd).reply;
}
