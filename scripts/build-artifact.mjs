/* Paketerar demon till EN självständig HTML-fil för publicering som delbar
 * sida (claude.ai-artifact). Artifact-plattformen lägger själv på
 * doctype/html/head/body — därför emitteras endast sidinnehåll:
 * <title> + <style> + markup + inlinade <script>.
 *
 *   node scripts/build-artifact.mjs [utfil]     (default: out/asistente-demo.html)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEMO = join(ROOT, 'demo');
const outPath = resolve(process.argv[2] || join(ROOT, 'out', 'asistente-demo.html'));

const css = readFileSync(join(DEMO, 'styles.css'), 'utf8');
const html = readFileSync(join(DEMO, 'index.html'), 'utf8');
const scripts = ['i18n.js', 'scenario.js', 'app.js']
  .map(f => readFileSync(join(DEMO, f), 'utf8'));

/* Plocka ut allt mellan <body> och </body>, minus <script src>-taggarna */
const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
if (!bodyMatch) throw new Error('Hittar inte <body> i demo/index.html');
const markup = bodyMatch[1].replace(/^\s*<script src="[^"]+"><\/script>\s*$/gm, '').trim();

const out = [
  '<title>Asistente de Paco 🎾</title>',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  '<!-- Demo privada · no afiliada a WhatsApp · byggd från demo/ i repot -->',
  '<style>\n' + css + '\n</style>',
  markup,
  ...scripts.map(s => '<script>\n' + s + '\n</script>')
].join('\n');

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out);
console.log(`✔ ${outPath} (${(out.length / 1024).toFixed(0)} kB)`);
