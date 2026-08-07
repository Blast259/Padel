/* Meta WhatsApp Cloud API-webhook — noll externa beroenden (ren node:http).
 *
 * Miljövariabler (sätts aldrig i repot):
 *   WHATSAPP_TOKEN    permanent system-user-token från Meta
 *   PHONE_NUMBER_ID   botens nummer-id (API Setup-sidan)
 *   VERIFY_TOKEN      valfri hemlig sträng — samma anges i Metas webhook-konfig
 *   APP_SECRET        (rekommenderas) appens secret → signaturverifiering
 *   ALLOWED_NUMBERS   kommaseparerad vitlista av wa_id (t.ex. 34600...,4670...)
 *                     TOM = boten svarar ingen (medvetet: fail closed)
 *   STATE_FILE        (valfri) sökväg till state-json, default bot/data/state.json
 *   PORT              default 3000
 *
 * Kör:  npm run bot:serve   (bakom Caddy/HTTPS enligt docs/ARCHITECTURE.md)
 */
import http from 'node:http';
import crypto from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, save } from './store.js';
import { handle } from './responder.js';

const {
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  VERIFY_TOKEN = 'asistente',
  APP_SECRET,
  ALLOWED_NUMBERS = '',
  STATE_FILE,
  PORT = 3000
} = process.env;

if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
  console.error('Saknar WHATSAPP_TOKEN och/eller PHONE_NUMBER_ID — se bot/README.md.');
  process.exit(1);
}

const FILE = STATE_FILE || join(dirname(fileURLToPath(import.meta.url)), 'data', 'state.json');
const store = load(FILE);
const allowed = new Set(ALLOWED_NUMBERS.split(',').map(s => s.trim()).filter(Boolean));
const seen = new Set(); // dedupe av webhook-omförsök

async function sendText(to, body) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } })
  });
  if (!res.ok) console.error(`Sändfel ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

function verifySignature(raw, header) {
  if (!APP_SECRET) return true; // tillåt utan secret, men varna vid start
  if (!header) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(raw).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected)); }
  catch { return false; }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200); return res.end('ok');
  }

  /* Metas verifiering av webhooken */
  if (req.method === 'GET' && url.pathname === '/webhook') {
    if (url.searchParams.get('hub.mode') === 'subscribe' &&
        url.searchParams.get('hub.verify_token') === VERIFY_TOKEN) {
      res.writeHead(200); return res.end(url.searchParams.get('hub.challenge') || '');
    }
    res.writeHead(403); return res.end();
  }

  if (req.method === 'POST' && url.pathname === '/webhook') {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on('end', async () => {
      res.writeHead(200); res.end(); // svara Meta direkt; bearbeta sedan
      if (!verifySignature(raw, req.headers['x-hub-signature-256'])) {
        return console.error('Ogiltig webhook-signatur — ignorerar.');
      }
      let body;
      try { body = JSON.parse(raw); } catch { return; }
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          for (const msg of change.value?.messages || []) {
            if (msg.type !== 'text' || seen.has(msg.id)) continue;
            seen.add(msg.id);
            if (seen.size > 500) seen.delete(seen.values().next().value);
            const from = msg.from;
            if (!allowed.has(from)) {
              console.log(`Blockerad avsändare ${from} (ej i ALLOWED_NUMBERS).`);
              continue;
            }
            try {
              const reply = handle(store, from, msg.text.body);
              save(FILE, store);
              await sendText(from, reply);
            } catch (e) {
              console.error(`Fel för ${from}: ${e.stack || e}`);
              await sendText(from, 'Uy, algo se me ha cruzado 🤖 Inténtalo otra vez — y dile a Tommy que me he liado.');
            }
          }
        }
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(Number(PORT), () => {
  console.log(`🎾 Asistente-webhook på port ${PORT} (${allowed.size} tillåtna nummer)`);
  if (!APP_SECRET) console.warn('OBS: APP_SECRET saknas — webhook-signaturer verifieras inte.');
  if (!allowed.size) console.warn('OBS: ALLOWED_NUMBERS är tom — boten svarar ingen (fail closed).');
});
