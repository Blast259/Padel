/* Lokal test-terminal: prata med boten som Paco, utan Meta-koppling.
 *   npm run bot:repl
 * State sparas i bot/data/state-repl.json (gitignorerad) — radera filen
 * eller skriv "borrar todo" för att börja om. */
import readline from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, save } from './store.js';
import { handle } from './responder.js';

const FILE = join(dirname(fileURLToPath(import.meta.url)), 'data', 'state-repl.json');
const store = load(FILE);

console.log('🎾 Asistente — lokal testterminal. Skriv som Paco ("ayuda" för guiden, Ctrl+C avslutar).\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'Paco> ' });
rl.prompt();
rl.on('line', (line) => {
  const text = line.trim();
  if (text) {
    const reply = handle(store, 'repl', text);
    save(FILE, store);
    console.log(`\n🤖 ${reply.split('\n').join('\n   ')}\n`);
  }
  rl.prompt();
});
rl.on('close', () => { console.log('\n¡Hasta luego! 🎾'); process.exit(0); });
