/* Analyserar en WhatsApp-chattexport (.txt) för att finslipa demo-copy och ANALYSIS.md.
 *
 *   npm run parse                          (läser source/chat-export.txt)
 *   node scripts/parse-export.mjs FIL.txt
 *
 * INTEGRITET: skriver ENDAST till stdout. Ingen härledd data med riktiga
 * namn/nummer sparas till disk. source/ är gitignorerad.
 *
 * Klarar båda exportdialekterna:
 *   Android: "31/7/26, 18:47 - Namn: text"   (även 4-siffrigt år, "." i datum)
 *   iOS:     "[31/7/26 18:47:22] Namn: text"
 * Fortsättningsrader (utan tidsstämpel) läggs till föregående meddelande.
 */
import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2] || 'source/chat-export.txt';
if (!existsSync(file)) {
  console.error(`Hittar inte ${file}\nExportera: Gruppen → Exportera chatt → Utan media, ` +
    'och lägg .txt-filen som source/chat-export.txt');
  process.exit(1);
}
const raw = readFileSync(file, 'utf8').replace(/‎|‏/g, ''); // LRM/RLM-tecken bort

const ANDROID = /^(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4}),?\s+(\d{1,2}):(\d{2})\s*[-–]\s+([^:]+):\s?([\s\S]*)$/;
const IOS = /^\[(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?\]\s+([^:]+):\s?([\s\S]*)$/;
const SYSTEM_A = /^(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4}),?\s+(\d{1,2}):(\d{2})\s*[-–]\s+[^:]+$/;

const msgs = [];
for (const line of raw.split(/\r?\n/)) {
  const m = ANDROID.exec(line) || IOS.exec(line);
  if (m) {
    msgs.push({
      date: `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`,
      time: `${m[4]}:${m[5]}`,
      sender: m[6].trim(),
      text: m[7]
    });
  } else if (SYSTEM_A.test(line)) {
    /* systemrad ("... skapade gruppen" etc) — hoppa */
  } else if (msgs.length && line.trim()) {
    msgs[msgs.length - 1].text += '\n' + line;
  }
}

if (!msgs.length) {
  console.error('Kunde inte tolka några meddelanden — okänt exportformat? ' +
    'Klistra in de första 5 raderna i chatten så anpassar vi parsern.');
  process.exit(1);
}

/* ── Statistik ── */
const bySender = new Map();
for (const m of msgs) bySender.set(m.sender, (bySender.get(m.sender) || 0) + 1);
const senders = [...bySender.entries()].sort((a, b) => b[1] - a[1]);
const dates = msgs.map(m => m.date).sort();
const days = new Set(dates).size;

console.log('══ ÖVERSIKT ═════════════════════════════');
console.log(`Meddelanden: ${msgs.length}  ·  Avsändare: ${senders.length}`);
console.log(`Period: ${dates[0]} → ${dates[dates.length - 1]}  (${days} aktiva dagar, ~${(msgs.length / days).toFixed(0)} medd/dag)`);
console.log('\nTopp 20 avsändare:');
for (const [s, n] of senders.slice(0, 20)) console.log(`  ${String(n).padStart(5)}  ${s}`);

/* ── Pull-listor (för att lära formatet) ── */
const isList = (t) => {
  const numbered = (t.match(/^\s*\d{1,2}[\s.\-)]/gm) || []).length;
  return /reservas/i.test(t) || numbered >= 6 || (/hora/i.test(t) && /nivel|lugar/i.test(t));
};
const lists = msgs.filter(m => isList(m.text));
console.log(`\n══ PULL-LISTOR (${lists.length} st — visar första 12) ═══════`);
for (const m of lists.slice(0, 12)) {
  console.log(`\n── ${m.date} ${m.time} · ${m.sender} ──`);
  console.log(m.text);
}

/* ── Fraser & mönster ── */
const PATTERNS = {
  '"venga …"': /\bvenga\b/i,
  '"apunta/apuntaros"': /\bapunt/i,
  '"pull"': /\bpull\b/i,
  '"cerrar/cerrada"': /\bcerra/i,
  'sorteo/lottning': /\bsorteo\b/i,
  'byten ("cambiar")': /\bcambi(a|o|ar)/i,
  'echaloasuerte-länkar': /echaloasuerte\.com/i,
  'avhopp ("no puedo/me caigo")': /no puedo|me caigo|se cae|me sal/i,
  'nivåord (tercera/cuarta/quinta)': /\b(tercera|cuarta|quinta)\b/i,
  'reservas': /\breservas?\b/i,
  'checkmark ✅': /✅/,
  'platser ("plazas/faltan")': /\bplazas?\b|\bfalta/i
};
console.log('\n══ FRASFREKVENS ═════════════════════════');
for (const [label, re] of Object.entries(PATTERNS)) {
  const hits = msgs.filter(m => re.test(m.text));
  console.log(`  ${String(hits.length).padStart(5)}  ${label}`);
}

/* ── Exempel på de vanligaste korta rop-meddelandena (Pacos röst) ── */
const top = senders[0]?.[0];
if (top) {
  console.log(`\n══ RÖSTPROV — korta meddelanden från "${top}" (topp-avsändaren) ══`);
  const short = msgs.filter(m => m.sender === top && m.text.length < 90 && !isList(m.text));
  for (const m of short.slice(0, 25)) console.log(`  · ${m.text.replace(/\n/g, ' ⏎ ')}`);
}
console.log('\nKlart — använd utfallet för att justera demo/scenario.js och docs/ANALYSIS.md.');
