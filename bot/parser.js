/* Kommandotolk v1.0 — förlåtande spanska.
 * Regler: gemener/versaler kvittar, accenter kvittar, extra ord tolereras.
 * Returnerar { action, ... } — aldrig undantag. Okänt → { action: 'unknown' }.
 */

/* Full normalisering (gemener + accenter bort) — för JÄMFÖRELSER */
export function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Lätt normalisering (gemener, accenter KVAR) — namnen ska behålla ñ/é
 * precis som i Pacos listor ("patiño", "josé luis") */
export function low(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/* "9'30" / "9:30" / "9.30" / "930" / "11" → kanonisk "930"/"1100" + visning "9'30" */
export function parseHora(s) {
  const m = String(s).match(/(\d{1,2})\s*[:'.h´`]?\s*(\d{2})?/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  if (h < 0 || h > 23) return null;
  const min = m[2] || '00';
  return { canon: `${h}${min}`, display: `${h}'${min}` };
}

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo', 'hoy', 'manana'];

/* Plockar ut ev. tidssvans — "a las 9'30", "para las 11" eller bara "9'30"
 * sist i texten; returnerar { text, hora } */
function extractHora(text) {
  const m = text.match(/(?:\b(?:a\s+las?\s+|para\s+las?\s+)(\d{1,2}[:'.h´`]?\d{0,2})|(?:^|\s)(\d{1,2}[:'.h´`]\d{2}|\d{1,2}))\s*$/i);
  if (m) {
    const hora = parseHora(m[1] || m[2]);
    if (hora) return { text: text.slice(0, m.index).trim(), hora };
  }
  return { text, hora: null };
}

export function parse(raw) {
  const original = String(raw || '').trim();
  const t = low(original);   /* gemener, men accenter kvar i namnen */
  if (!t) return { action: 'unknown' };

  if (/^(hola|buenas|hey|ayuda|help|\?)$/.test(t)) return { action: 'ayuda' };
  if (/^(gracias|ok|vale|perfecto|👍|dale)/.test(t)) return { action: 'gracias' };

  /* bara en tid — svar på en väntande fråga ("¿9'30 u 11'00?") */
  if (/^(?:a\s+las?\s+|para\s+las?\s+)?\d{1,2}[:'.h´`]?\d{0,2}$/.test(t)) {
    const hora = parseHora(t);
    if (hora) return { action: 'hora_only', hora };
  }

  /* pull <día> <hora> <nivel...> <lugar> <plazas> */
  if (/^(?:crea(?:r)?\s+)?pull\b/.test(t)) {
    const tokens = t.replace(/^(?:crea(?:r)?\s+)?pull\s*/, '').split(' ').filter(Boolean);
    if (!tokens.length) return { action: 'error', message: 'pull_syntax' };
    let dia = null, hora = null, plazas = null;
    const rest = [];
    for (const tok of tokens) {
      if (!dia && DIAS.includes(norm(tok))) { dia = tok; continue; }
      if (!hora && /\d/.test(tok) && !/^\d{1,2}$/.test(tok)) {
        const h = parseHora(tok);
        if (h) { hora = h; continue; }
      }
      rest.push(tok);
    }
    /* plazas = sista heltalet; en ensam siffra kan också vara timmen (t.ex. "11") */
    for (let i = rest.length - 1; i >= 0; i--) {
      if (/^\d{1,2}$/.test(rest[i])) {
        const n = parseInt(rest[i], 10);
        if (n >= 4 && n <= 24 && n % 4 === 0 && plazas === null) { plazas = n; rest.splice(i, 1); continue; }
        if (!hora) { hora = parseHora(rest[i]); rest.splice(i, 1); }
      }
    }
    if (!dia || !hora || !plazas || rest.length < 1) return { action: 'error', message: 'pull_syntax' };
    const lugar = rest.pop();
    const nivel = rest.join(' ') || '-';
    return { action: 'crear', dia, hora, nivel, lugar, plazas };
  }

  /* apunta a X [y Y] [a las H] */
  let m = t.match(/^ap[uú]nta(?:me)?\s+(?:a\s+)?(.+)$/);
  if (m) {
    const { text, hora } = extractHora(m[1]);
    const nombres = text.split(/\s+y\s+|,/).map(s => s.trim()).filter(Boolean);
    if (!nombres.length) return { action: 'error', message: 'sin_nombre' };
    return { action: 'apuntar', nombres, hora };
  }

  /* X confirmado / confirma a X / ✅ X */
  m = original.trim().match(/^[✅✔️]\s*(.+)$/u) ||
      t.match(/^(.+?)\s+confirmad[oa]$/) ||
      t.match(/^confirma(?:r|do)?\s+(?:a\s+)?(.+)$/);
  if (m) {
    const { text, hora } = extractHora(low(m[1]));
    return { action: 'confirmar', nombre: text, hora };
  }

  /* se cae X / baja X */
  m = t.match(/^(?:se\s+cae|se\s+borra|baja|quita(?:r)?\s+a?)\s*(.+)$/);
  if (m) {
    const { text, hora } = extractHora(m[1]);
    return { action: 'baja', nombre: text, hora };
  }

  /* reserva X */
  m = t.match(/^reservas?\s+(?:a\s+)?(.+)$/);
  if (m) {
    const { text, hora } = extractHora(m[1]);
    return { action: 'reservar', nombre: text, hora };
  }

  /* lista [H] */
  if (/^listas?\b/.test(t)) {
    const { hora } = extractHora(t);
    return { action: 'lista', hora };
  }

  /* sorteo: A con B, C con D ... [a las H] */
  m = t.match(/^sorteo[:\s]+(.+)$/);
  if (m) {
    const { text, hora } = extractHora(m[1]);
    const parejas = text.split(/[,;]| y (?=\S+\s+con\s)/).map(s => s.trim()).filter(Boolean)
      .map(p => {
        const mm = p.match(/^(.+?)\s+con\s+(.+)$/);
        return mm ? [mm[1].trim(), mm[2].trim()] : null;
      });
    if (!parejas.length || parejas.some(p => !p)) return { action: 'error', message: 'sorteo_syntax' };
    return { action: 'sorteo', parejas, hora };
  }
  if (/^sorteo\b/.test(t)) return { action: 'error', message: 'sorteo_syntax' };

  /* borrar pull [H] / borrar todo */
  if (/^borra(?:r)?\s+todo$/.test(t)) return { action: 'borrar_todo' };
  m = t.match(/^borra(?:r)?\s+(?:la\s+)?pull(?:\s+(.+))?$/);
  if (m) {
    const hora = m[1] ? parseHora(m[1]) : null;
    return { action: 'borrar', hora };
  }

  return { action: 'unknown' };
}
