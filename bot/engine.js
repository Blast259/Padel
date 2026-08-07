/* Passmotor v1.0 — exakt demons regler:
 *  - lista i Pacos format, ✅ vid bekräftelse
 *  - full lista → reservas-kö; "se cae" → första reserven lyfts in BEKRÄFTAD
 *    på samma plats (belagt beteende: ola → José Luis)
 *  - sorteo: Pacos par, slumpade startbanor, "Pista N"-block (riktiga formatet)
 * Ingen tystnad vid fel: varje funktion returnerar { reply, ... } på spanska.
 */
import { norm, parseHora } from './parser.js';

export function crearSession(state, { dia, hora, nivel, lugar, plazas }) {
  if (state.sessions.some(s => s.hora.canon === hora.canon)) {
    return { reply: `Ya hay una pull a las ${hora.display}. Escribe *lista* para verla o *borrar pull ${hora.display}* para empezar de nuevo.` };
  }
  if (state.sessions.length >= 3) {
    return { reply: 'Ya hay 3 pulls activas — borra alguna primero (*borrar pull 9\'30*).' };
  }
  const session = {
    dia, hora, nivel, lugar,
    plazas,
    slots: Array(plazas).fill(null),   /* { nombre, ok } */
    reservas: []
  };
  state.sessions.push(session);
  state.sessions.sort((a, b) => parseInt(a.hora.canon, 10) - parseInt(b.hora.canon, 10));
  return { reply: `✅ Creada la pull del ${dia} a las ${hora.display} (${nivel}, ${lugar}, ${plazas} plazas).\n\n${renderLista(session)}` };
}

/* Fuzzy-namnmatch: exakt träff först, annars ordprefix — varje sökord måste
 * inleda något ord i namnet ("cañas" → "cañasveras", "juan g" → "juan
 * gonzalez"). Aldrig substring mitt i ord ("ale" matchar INTE "gonzalez"). */
function matchIdx(names, query) {
  const q = norm(query);
  const qTokens = q.split(' ');
  const exact = [], partial = [];
  names.forEach((n, i) => {
    if (n === null) return;
    const nn = norm(n);
    if (nn === q) { exact.push(i); return; }
    const nTokens = nn.split(' ');
    if (qTokens.every(qt => nTokens.some(nt => nt.startsWith(qt)))) partial.push(i);
  });
  return exact.length ? exact : partial;
}

export function apuntar(session, nombres) {
  const lines = [];
  for (const nombre of nombres) {
    const dup = matchIdx(session.slots.map(s => s && s.nombre), nombre);
    if (dup.length) { lines.push(`${nombre} ya está en la lista (nº ${dup[0] + 1}).`); continue; }
    const free = session.slots.findIndex(s => s === null);
    if (free === -1) {
      session.reservas.push(nombre);
      lines.push(`Completa la de las ${session.hora.display} ✋ — ${nombre} ${ordinal(session.reservas.length)} reserva ✅`);
    } else {
      session.slots[free] = { nombre, ok: false };
      lines.push(`${nombre} apuntado (nº ${free + 1}, sin confirmar).`);
    }
  }
  return { reply: `${lines.join('\n')}\n\n${renderLista(session)}` };
}

export function confirmar(session, nombre) {
  const idx = matchIdx(session.slots.map(s => s && s.nombre), nombre);
  if (!idx.length) return { reply: `No encuentro a "${nombre}" en la lista de las ${session.hora.display}. Escribe *lista* para verla.` };
  if (idx.length > 1) {
    const cuales = idx.map(i => session.slots[i].nombre).join(', ');
    return { reply: `Hay varios que encajan: ${cuales}. Dime el nombre más completo.` };
  }
  session.slots[idx[0]].ok = true;
  return { reply: `✅ ${session.slots[idx[0]].nombre} confirmado.\n\n${renderLista(session)}` };
}

export function baja(session, nombre) {
  const idx = matchIdx(session.slots.map(s => s && s.nombre), nombre);
  if (!idx.length) {
    const ri = matchIdx(session.reservas, nombre);
    if (ri.length === 1) {
      const quien = session.reservas.splice(ri[0], 1)[0];
      return { reply: `${quien} quitado de las reservas.\n\n${renderLista(session)}` };
    }
    return { reply: `No encuentro a "${nombre}" en la lista de las ${session.hora.display}.` };
  }
  if (idx.length > 1) {
    const cuales = idx.map(i => session.slots[i].nombre).join(', ');
    return { reply: `Hay varios que encajan: ${cuales}. Dime el nombre más completo.` };
  }
  const pos = idx[0];
  const quien = session.slots[pos].nombre;
  let linea = `${quien} se cae.`;
  if (session.reservas.length) {
    const sube = session.reservas.shift();
    session.slots[pos] = { nombre: sube, ok: true };
    linea = `${quien} se cae ➡️ entra ${sube} (1º reserva) ✅`;
  } else {
    session.slots[pos] = null;
    linea += ` Queda libre el nº ${pos + 1}.`;
  }
  return { reply: `${linea}\n\n${renderLista(session)}` };
}

export function reservar(session, nombre) {
  session.reservas.push(nombre);
  return { reply: `${nombre} apuntado como ${ordinal(session.reservas.length)} reserva ✅\n\n${renderLista(session)}` };
}

export function sorteo(session, parejas, rng = Math.random) {
  const jugadores = session.slots.filter(Boolean).map(s => s.nombre);
  const esperadas = Math.floor(jugadores.length / 2);
  if (jugadores.length < 4 || jugadores.length % 4 !== 0) {
    return { reply: `Ahora mismo hay ${jugadores.length} apuntados a las ${session.hora.display} — necesito un múltiplo de 4 para sortear pistas.` };
  }
  if (parejas.length !== esperadas) {
    const nombrados = new Set(parejas.flat().map(norm));
    const faltan = jugadores.filter(j => {
      const nj = norm(j);
      return ![...nombrados].some(n => nj.includes(n) || n.includes(nj));
    });
    return { reply: `Me faltan parejas: has puesto ${parejas.length} y necesito ${esperadas}.` +
      (faltan.length ? `\nSin pareja: ${faltan.join(', ')}` : '') };
  }
  /* Pacos par — slumpade startbanor (Fisher–Yates) */
  const orden = parejas.slice();
  for (let i = orden.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  const pistas = [];
  for (let i = 0; i < orden.length; i += 2) {
    pistas.push(`Pista ${i / 2 + 1}\n${cap(orden[i][0])} - ${cap(orden[i][1])}\n${cap(orden[i + 1][0])} - ${cap(orden[i + 1][1])}`);
  }
  return { reply: `Pull ${session.dia} ${session.hora.display}\n\n${pistas.join('\n\n')}\n\n🍀 Suerte a todos` };
}

/* Finns ett namn (fuzzy) i sessionens lista eller reservas? */
export function enSession(session, nombre) {
  return matchIdx(session.slots.map(s => s && s.nombre), nombre).length > 0 ||
         matchIdx(session.reservas, nombre).length > 0;
}

export function borrar(state, hora) {
  const i = state.sessions.findIndex(s => s.hora.canon === hora.canon);
  if (i === -1) return { reply: `No hay ninguna pull a las ${hora.display}.` };
  state.sessions.splice(i, 1);
  return { reply: `Borrada la pull de las ${hora.display}.` };
}

/* ── Rendering: Pacos format, klistra-in-färdigt ── */
export function renderLista(session) {
  const filled = session.slots.filter(Boolean).length;
  const head = `Pull ${session.dia}\nHora ${session.hora.display}\nLugar ${session.lugar}\nNivel ${session.nivel}`;
  const rows = session.slots
    .map((s, i) => `${i + 1}-${s ? s.nombre + (s.ok ? '✅' : '') : ''}`)
    .join('\n');
  let out = `${head}\n\n${rows}\n\nReservas\n${session.reservas.join('\n')}`.trimEnd();
  if (filled === session.plazas) {
    out += `\n\n🔒 PULL CERRADA — ${session.plazas / 4} pistas\nNos vemos en ${session.lugar} 🎾`;
  }
  return out;
}

export function renderTodas(state) {
  if (!state.sessions.length) return 'No hay ninguna pull creada. Escribe por ejemplo:\npull lunes 9\'30 tercera fly 16';
  return state.sessions.map(renderLista).join('\n\n————————\n\n');
}

function ordinal(n) { return `${n}º`; }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export { parseHora };
